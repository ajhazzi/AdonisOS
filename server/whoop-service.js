import crypto from "node:crypto";
import { appOrigin, env, optionalEnv, supabaseRequest } from "../api/_shared.js";

export const USER_ID = process.env.ADONIS_USER_ID || "aj-hazzi";
export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v2";
export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_SCOPES = "offline read:profile read:cycles read:recovery read:sleep read:workout";
export const RULES_VERSION = "adonis-readiness-v1";

export function redirectUri(req) {
  return optionalEnv("WHOOP_REDIRECT_URI", `${appOrigin(req)}/api/whoop/callback`);
}

export function demoEnabled() {
  return optionalEnv("WHOOP_DEMO_MODE", "false") === "true";
}

export function hashState(state) {
  return crypto.createHash("sha256").update(state).digest("hex");
}

export function encryptionKey() {
  const raw = env("TOKEN_ENCRYPTION_KEY");
  if (/^[A-Za-z0-9+/=]{44}$/.test(raw)) return Buffer.from(raw, "base64");
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptSecret(value) {
  const [ivText, tagText, encryptedText] = String(value || "").split(".");
  if (!ivText || !tagText || !encryptedText) throw new Error("Stored WHOOP token is invalid.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(tagText, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, "base64")), decipher.final()]).toString("utf8");
}

export async function createOauthState() {
  const state = crypto.randomBytes(32).toString("base64url");
  await supabaseRequest("/rest/v1/whoop_oauth_states", {
    method: "POST",
    body: JSON.stringify({
      user_id: USER_ID,
      state_hash: hashState(state),
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    })
  });
  return state;
}

export async function validateOauthState(state) {
  const rows = await supabaseRequest(`/rest/v1/whoop_oauth_states?state_hash=eq.${hashState(state)}&user_id=eq.${encodeURIComponent(USER_ID)}&select=*`, {
    method: "GET"
  });
  const row = rows?.[0];
  if (!row) throw new Error("WHOOP login expired. Start the connection again.");
  if (row.used_at) throw new Error("WHOOP login was already used. Start again.");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new Error("WHOOP login expired. Start again.");
  await supabaseRequest(`/rest/v1/whoop_oauth_states?id=eq.${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({ used_at: new Date().toISOString() })
  });
}

export async function tokenRequest(body) {
  const response = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || `WHOOP token ${response.status}`);
  return data;
}

export async function exchangeCodeForTokens(code, req) {
  return tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(req),
    client_id: env("WHOOP_CLIENT_ID"),
    client_secret: env("WHOOP_CLIENT_SECRET")
  });
}

export async function saveConnection(tokens, profile = {}) {
  const expiresAt = new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString();
  const scopes = tokens.scope || WHOOP_SCOPES;
  const row = {
    user_id: USER_ID,
    whoop_user_id: profile.user_id ? String(profile.user_id) : null,
    encrypted_access_token: encryptSecret(tokens.access_token),
    encrypted_refresh_token: encryptSecret(tokens.refresh_token),
    token_expires_at: expiresAt,
    scopes,
    connection_status: "connected",
    connected_at: new Date().toISOString(),
    disconnected_at: null,
    last_sync_status: "connected"
  };
  const saved = await supabaseRequest("/rest/v1/whoop_connections?on_conflict=user_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(row)
  });
  return saved?.[0] || row;
}

export async function loadConnection() {
  const rows = await supabaseRequest(`/rest/v1/whoop_connections?user_id=eq.${encodeURIComponent(USER_ID)}&select=*`, { method: "GET" });
  return rows?.[0] || null;
}

export async function activeTokens() {
  const connection = await loadConnection();
  if (!connection || connection.connection_status !== "connected") throw new Error("WHOOP is not connected yet.");
  const expiresAt = new Date(connection.token_expires_at || 0).getTime();
  if (expiresAt - Date.now() < 120_000) return refreshTokens(connection);
  return { connection, accessToken: decryptSecret(connection.encrypted_access_token) };
}

export async function refreshTokens(connection = null) {
  const existing = connection || await loadConnection();
  if (!existing?.encrypted_refresh_token) throw new Error("WHOOP is not connected yet.");
  const tokens = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: decryptSecret(existing.encrypted_refresh_token),
    client_id: env("WHOOP_CLIENT_ID"),
    client_secret: env("WHOOP_CLIENT_SECRET"),
    scope: WHOOP_SCOPES
  });
  const expiresAt = new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString();
  const updated = {
    encrypted_access_token: encryptSecret(tokens.access_token),
    encrypted_refresh_token: encryptSecret(tokens.refresh_token || decryptSecret(existing.encrypted_refresh_token)),
    token_expires_at: expiresAt,
    scopes: tokens.scope || existing.scopes,
    updated_at: new Date().toISOString()
  };
  const saved = await supabaseRequest(`/rest/v1/whoop_connections?user_id=eq.${encodeURIComponent(USER_ID)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updated)
  });
  return { connection: saved?.[0] || { ...existing, ...updated }, accessToken: tokens.access_token };
}

export async function whoopGet(path, accessToken) {
  const response = await fetch(`${WHOOP_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.error || `WHOOP ${response.status}`);
  return data;
}

export function records(collection) {
  return Array.isArray(collection?.records) ? collection.records : [];
}

export function dateKey(value) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const out = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${out.year}-${out.month}-${out.day}`;
}

export function hours(ms) {
  return ms ? Math.round((Number(ms) / 3600000) * 10) / 10 : null;
}

export async function fetchWhoopWindow(days = 14) {
  if (demoEnabled()) return demoWhoopData(days);
  const { accessToken } = await activeTokens();
  const start = new Date(Date.now() - Number(days) * 86400000).toISOString();
  const end = new Date().toISOString();
  const qs = `?limit=25&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  const [profile, cycles, recoveries, sleeps, workouts] = await Promise.all([
    whoopGet("/user/profile/basic", accessToken).catch(() => ({})),
    whoopGet(`/cycle${qs}`, accessToken).then(records),
    whoopGet(`/recovery${qs}`, accessToken).then(records),
    whoopGet(`/activity/sleep${qs}`, accessToken).then(records),
    whoopGet(`/activity/workout${qs}`, accessToken).then(records)
  ]);
  return { demo: false, profile, cycles, recoveries, sleeps, workouts };
}

export async function syncWhoopData(days = 14) {
  const data = await fetchWhoopWindow(days);
  await upsertWhoopData(data);
  const readiness = await buildReadiness(data);
  await upsertReadiness(readiness);
  await supabaseRequest(`/rest/v1/whoop_connections?user_id=eq.${encodeURIComponent(USER_ID)}`, {
    method: "PATCH",
    body: JSON.stringify({
      last_synced_at: new Date().toISOString(),
      last_sync_status: data.demo ? "demo" : "success",
      last_sync_error: null
    })
  }).catch(() => null);
  return { ...readiness, profile: data.profile || {}, demo: data.demo };
}

export async function upsertWhoopData(data) {
  await Promise.all([
    upsertRows("whoop_cycles", data.cycles.map(mapCycle)),
    upsertRows("whoop_recoveries", data.recoveries.map(mapRecovery)),
    upsertRows("whoop_sleeps", data.sleeps.map(mapSleep)),
    upsertRows("whoop_workouts", data.workouts.map(mapWorkout))
  ]);
}

async function upsertRows(table, rows) {
  const clean = rows.filter(Boolean);
  if (!clean.length) return [];
  const conflicts = {
    whoop_cycles: "user_id,whoop_cycle_id",
    whoop_recoveries: "user_id,whoop_cycle_id",
    whoop_sleeps: "user_id,whoop_sleep_id",
    whoop_workouts: "user_id,whoop_workout_id"
  };
  const conflict = conflicts[table] ? `?on_conflict=${conflicts[table]}` : "";
  return supabaseRequest(`/rest/v1/${table}${conflict}`, {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(clean)
  });
}

export function mapCycle(cycle) {
  return {
    user_id: USER_ID,
    whoop_cycle_id: String(cycle.id),
    start_time: cycle.start,
    end_time: cycle.end || null,
    timezone_offset: cycle.timezone_offset || null,
    strain: numberOrNull(cycle.score?.strain),
    kilojoules: numberOrNull(cycle.score?.kilojoule),
    calories_burned: kjToCalories(cycle.score?.kilojoule),
    steps: numberOrNull(cycle.score?.steps ?? cycle.score?.step_count ?? cycle.steps ?? cycle.step_count),
    average_heart_rate: numberOrNull(cycle.score?.average_heart_rate),
    max_heart_rate: numberOrNull(cycle.score?.max_heart_rate),
    score_state: cycle.score_state || null,
    raw_json: cycle
  };
}

export function mapRecovery(recovery) {
  return {
    user_id: USER_ID,
    whoop_cycle_id: String(recovery.cycle_id),
    whoop_sleep_id: recovery.sleep_id || null,
    recorded_at: recovery.updated_at || recovery.created_at || new Date().toISOString(),
    recovery_score: numberOrNull(recovery.score?.recovery_score),
    resting_heart_rate: numberOrNull(recovery.score?.resting_heart_rate),
    hrv_rmssd: numberOrNull(recovery.score?.hrv_rmssd_milli),
    spo2_percentage: numberOrNull(recovery.score?.spo2_percentage),
    skin_temperature: numberOrNull(recovery.score?.skin_temp_celsius),
    score_state: recovery.score_state || null,
    raw_json: recovery
  };
}

export function mapSleep(sleep) {
  const stages = sleep.score?.stage_summary || {};
  const sleepMs = Number(stages.total_light_sleep_time_milli || 0) + Number(stages.total_slow_wave_sleep_time_milli || 0) + Number(stages.total_rem_sleep_time_milli || 0);
  return {
    user_id: USER_ID,
    whoop_sleep_id: String(sleep.id),
    start_time: sleep.start,
    end_time: sleep.end || null,
    nap: Boolean(sleep.nap),
    score_state: sleep.score_state || null,
    sleep_performance_percentage: numberOrNull(sleep.score?.sleep_performance_percentage),
    sleep_efficiency_percentage: numberOrNull(sleep.score?.sleep_efficiency_percentage),
    sleep_consistency_percentage: numberOrNull(sleep.score?.sleep_consistency_percentage),
    sleep_need_ms: numberOrNull(sleep.score?.sleep_needed?.baseline_milli),
    total_in_bed_ms: numberOrNull(stages.total_in_bed_time_milli),
    total_awake_ms: numberOrNull(stages.total_awake_time_milli),
    total_sleep_ms: sleepMs || null,
    light_sleep_ms: numberOrNull(stages.total_light_sleep_time_milli),
    slow_wave_sleep_ms: numberOrNull(stages.total_slow_wave_sleep_time_milli),
    rem_sleep_ms: numberOrNull(stages.total_rem_sleep_time_milli),
    sleep_cycle_count: numberOrNull(stages.sleep_cycle_count),
    disturbance_count: numberOrNull(stages.disturbance_count),
    raw_json: sleep
  };
}

export function mapWorkout(workout) {
  return {
    user_id: USER_ID,
    whoop_workout_id: String(workout.id),
    start_time: workout.start,
    end_time: workout.end || null,
    timezone_offset: workout.timezone_offset || null,
    sport_id: numberOrNull(workout.sport_id),
    sport_name: workout.sport_name || null,
    strain: numberOrNull(workout.score?.strain),
    average_heart_rate: numberOrNull(workout.score?.average_heart_rate),
    max_heart_rate: numberOrNull(workout.score?.max_heart_rate),
    kilojoules: numberOrNull(workout.score?.kilojoule),
    calories_burned: kjToCalories(workout.score?.kilojoule),
    distance_meters: numberOrNull(workout.score?.distance_meter),
    altitude_gain_meters: numberOrNull(workout.score?.altitude_gain_meter),
    percent_recorded: numberOrNull(workout.score?.percent_recorded),
    raw_json: workout
  };
}

export async function buildReadiness(data) {
  const latestRecovery = latestBy(data.recoveries, (item) => item.updated_at || item.created_at);
  const latestSleep = latestBy(data.sleeps.filter((item) => !item.nap), (item) => item.end || item.start);
  const latestCycle = latestBy(data.cycles, (item) => item.end || item.start);
  const recoveryScore = numberOrNull(latestRecovery?.score?.recovery_score);
  const sleepPerformance = numberOrNull(latestSleep?.score?.sleep_performance_percentage);
  const hrv = numberOrNull(latestRecovery?.score?.hrv_rmssd_milli);
  const restingHr = numberOrNull(latestRecovery?.score?.resting_heart_rate);
  const strain = numberOrNull(latestCycle?.score?.strain);
  const cycleDate = dateKey(latestCycle?.end || latestCycle?.start || new Date().toISOString());
  const caloriesBurned = kjToCalories(latestCycle?.score?.kilojoule);
  const steps = numberOrNull(latestCycle?.score?.steps ?? latestCycle?.score?.step_count ?? latestCycle?.steps ?? latestCycle?.step_count);
  const workoutCalories = (data.workouts || [])
    .filter((workout) => dateKey(workout.end || workout.start) === cycleDate)
    .reduce((sum, workout) => sum + Number(kjToCalories(workout.score?.kilojoule) || 0), 0);
  const sleepSummary = latestSleep?.score?.stage_summary || {};
  const sleepMs = Number(sleepSummary.total_light_sleep_time_milli || 0) + Number(sleepSummary.total_slow_wave_sleep_time_milli || 0) + Number(sleepSummary.total_rem_sleep_time_milli || 0);
  const date = dateKey(latestRecovery?.updated_at || latestSleep?.end || latestCycle?.end || new Date().toISOString());
  const recommendation = readinessRecommendation({ recoveryScore, sleepPerformance });
  return {
    user_id: USER_ID,
    date,
    recovery_score: recoveryScore,
    sleep_performance_percentage: sleepPerformance,
    sleep_duration_hours: hours(sleepMs),
    hrv_rmssd: hrv,
    resting_heart_rate: restingHr,
    cycle_strain: strain,
    calories_burned: caloriesBurned,
    workout_calories: Math.round(workoutCalories) || null,
    steps,
    rules_version: RULES_VERSION,
    ...recommendation,
    source: data.demo ? "demo" : "whoop",
    last_synced_at: new Date().toISOString()
  };
}

export function readinessRecommendation({ recoveryScore, sleepPerformance }) {
  const missing = recoveryScore === null && sleepPerformance === null;
  if (missing) {
    return {
      readiness_level: "pending",
      recommended_action: "Recovery score pending",
      recommended_rir: "Use normal plan if you feel good",
      volume_multiplier: 1,
      finisher_enabled: false,
      recommendation_reason: "WHOOP has not returned a scored recovery or sleep yet."
    };
  }
  const red = recoveryScore !== null && recoveryScore <= 33 || sleepPerformance !== null && sleepPerformance < 60;
  const yellow = recoveryScore !== null && recoveryScore <= 66 || sleepPerformance !== null && sleepPerformance < 75;
  if (red) {
    return {
      readiness_level: "red",
      recommended_action: "Recovery-biased day",
      recommended_rir: "3+ RIR",
      volume_multiplier: 0.6,
      finisher_enabled: false,
      recommendation_reason: "Low recovery or poor sleep. Train only if you keep the ego on a leash."
    };
  }
  if (yellow) {
    return {
      readiness_level: "yellow",
      recommended_action: "Reduced volume",
      recommended_rir: "2-3 RIR",
      volume_multiplier: 0.85,
      finisher_enabled: false,
      recommendation_reason: "Recovery or sleep is moderate. Productive work, no failure-chasing."
    };
  }
  return {
    readiness_level: "green",
    recommended_action: "Train as planned",
    recommended_rir: "1-2 RIR",
    volume_multiplier: 1,
    finisher_enabled: true,
    recommendation_reason: "Recovery and sleep are strong enough to execute the full plan."
  };
}

export async function upsertReadiness(readiness) {
  const saved = await supabaseRequest("/rest/v1/adonis_daily_readiness?on_conflict=user_id,date", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(readiness)
  });
  return saved?.[0] || readiness;
}

export async function latestReadiness() {
  if (demoEnabled()) return syncWhoopData(30);
  const rows = await supabaseRequest(`/rest/v1/adonis_daily_readiness?user_id=eq.${encodeURIComponent(USER_ID)}&select=*&order=date.desc&limit=1`, { method: "GET" });
  const connection = await loadConnection();
  return {
    connected: Boolean(connection && connection.connection_status === "connected"),
    connection: summarizeConnection(connection),
    readiness: rows?.[0] || null
  };
}

export async function readinessHistory(days = 30) {
  const rows = await supabaseRequest(`/rest/v1/adonis_daily_readiness?user_id=eq.${encodeURIComponent(USER_ID)}&select=*&order=date.desc&limit=${Math.min(Number(days) || 30, 90)}`, { method: "GET" });
  return { records: rows || [] };
}

export function summarizeConnection(connection) {
  if (!connection) return { connected: false };
  return {
    connected: connection.connection_status === "connected",
    whoop_user_id: connection.whoop_user_id,
    scopes: connection.scopes,
    connected_at: connection.connected_at,
    last_synced_at: connection.last_synced_at,
    last_sync_status: connection.last_sync_status,
    last_sync_error: connection.last_sync_error
  };
}

export async function disconnectWhoop(deleteData = false) {
  const connection = await loadConnection();
  if (connection) {
    await supabaseRequest(`/rest/v1/whoop_connections?user_id=eq.${encodeURIComponent(USER_ID)}`, {
      method: "PATCH",
      body: JSON.stringify({
        encrypted_access_token: null,
        encrypted_refresh_token: null,
        connection_status: "disconnected",
        disconnected_at: new Date().toISOString()
      })
    });
  }
  if (deleteData) {
    await Promise.all(["whoop_cycles", "whoop_recoveries", "whoop_sleeps", "whoop_workouts", "adonis_daily_readiness"].map((table) =>
      supabaseRequest(`/rest/v1/${table}?user_id=eq.${encodeURIComponent(USER_ID)}`, { method: "DELETE" })
    ));
  }
}

export async function logWebhook(event, status = "received", error = "") {
  const id = event.id || event.event_id || `${event.type || "whoop"}-${event.resource_id || Date.now()}`;
  return supabaseRequest("/rest/v1/whoop_webhook_events?on_conflict=event_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      event_id: String(id),
      event_type: event.type || event.event_type || "unknown",
      resource_id: event.resource_id || event.id || null,
      received_at: new Date().toISOString(),
      processing_status: status,
      error_message: error || null,
      raw_json: event
    })
  });
}

export function verifyWebhook(req, rawBody) {
  const secret = optionalEnv("WHOOP_WEBHOOK_SECRET", "");
  if (!secret) return true;
  const signature = req.headers["x-whoop-signature"] || req.headers["whoop-signature"];
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(String(signature)), Buffer.from(expected));
}

function latestBy(items, pick) {
  return [...(items || [])].sort((a, b) => new Date(pick(b) || 0) - new Date(pick(a) || 0))[0] || null;
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function kjToCalories(value) {
  const kj = numberOrNull(value);
  return kj === null ? null : Math.round(kj / 4.184);
}

function demoWhoopData(days) {
  const now = new Date();
  const cycles = [];
  const recoveries = [];
  const sleeps = [];
  const workouts = [];
  for (let index = 0; index < Math.min(Number(days) || 14, 30); index += 1) {
    const day = new Date(now.getTime() - index * 86400000);
    const recovery = index % 6 === 0 ? 31 : index % 3 === 0 ? 55 : 78;
    const sleep = index % 5 === 0 ? 58 : index % 3 === 0 ? 70 : 86;
    const cycleId = 9000 + index;
    cycles.push({ id: cycleId, start: new Date(day.getTime() - 20 * 3600000).toISOString(), end: day.toISOString(), score_state: "SCORED", score: { strain: 8 + (index % 5), kilojoule: 10800 + index * 120, steps: 8200 + index * 450, average_heart_rate: 68, max_heart_rate: 142 } });
    recoveries.push({ cycle_id: cycleId, sleep_id: `demo-sleep-${index}`, updated_at: day.toISOString(), score_state: "SCORED", score: { recovery_score: recovery, resting_heart_rate: 50 + (index % 5), hrv_rmssd_milli: 35 + (index % 12), spo2_percentage: 97 } });
    sleeps.push({ id: `demo-sleep-${index}`, cycle_id: cycleId, start: new Date(day.getTime() - 8 * 3600000).toISOString(), end: day.toISOString(), nap: false, score_state: "SCORED", score: { sleep_performance_percentage: sleep, sleep_efficiency_percentage: 88, sleep_consistency_percentage: 82, stage_summary: { total_light_sleep_time_milli: 14400000, total_slow_wave_sleep_time_milli: 7200000, total_rem_sleep_time_milli: 5400000, total_awake_time_milli: 1800000, total_in_bed_time_milli: 28800000, sleep_cycle_count: 4, disturbance_count: 10 } } });
    if (index % 2 === 0) workouts.push({ id: `demo-workout-${index}`, start: new Date(day.getTime() - 5 * 3600000).toISOString(), end: new Date(day.getTime() - 4 * 3600000).toISOString(), sport_id: 42, sport_name: "Weightlifting", score: { strain: 9 + (index % 4), average_heart_rate: 118, max_heart_rate: 154, kilojoule: 1800 } });
  }
  return { demo: true, profile: { first_name: "AJ", last_name: "Hazzi" }, cycles, recoveries, sleeps, workouts };
}
