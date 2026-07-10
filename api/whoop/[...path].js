import { appOrigin, env, json, readJson, requirePin, requirePinValue } from "../_shared.js";
import {
  WHOOP_AUTH_URL,
  WHOOP_SCOPES,
  createOauthState,
  disconnectWhoop,
  exchangeCodeForTokens,
  latestReadiness,
  loadConnection,
  logWebhook,
  readinessHistory,
  redirectUri,
  refreshTokens,
  saveConnection,
  summarizeConnection,
  syncWhoopData,
  validateOauthState,
  verifyWebhook,
  whoopGet
} from "../../server/whoop-service.js";

export default async function handler(req, res) {
  const action = whoopAction(req);
  if (action === "connect") return connect(req, res);
  if (action === "callback") return callback(req, res);
  if (action === "sync") return sync(req, res);
  if (action === "refresh") return refresh(req, res);
  if (action === "status") return status(req, res);
  if (action === "latest") return latest(req, res);
  if (action === "history") return history(req, res);
  if (action === "disconnect") return disconnect(req, res);
  if (action === "webhook") return webhook(req, res);
  return json(res, 404, { error: "WHOOP route not found" });
}

function whoopAction(req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  const whoopIndex = parts.indexOf("whoop");
  return parts[whoopIndex + 1] || "";
}

async function connect(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pin = url.searchParams.get("pin") || "";
  if (!requirePinValue(pin)) return json(res, 401, { error: "Invalid app PIN" });

  try {
    const state = await createOauthState();
    const auth = new URL(WHOOP_AUTH_URL);
    auth.searchParams.set("client_id", env("WHOOP_CLIENT_ID"));
    auth.searchParams.set("redirect_uri", redirectUri(req));
    auth.searchParams.set("response_type", "code");
    auth.searchParams.set("scope", WHOOP_SCOPES);
    auth.searchParams.set("state", state);
    res.statusCode = 302;
    res.setHeader("Location", auth.toString());
    res.end();
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP connect failed" });
  }
}

async function callback(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const home = `${appOrigin(req)}/?whoop=`;

  try {
    if (error) throw new Error(error);
    if (!code || !state) throw new Error("Missing WHOOP authorization code.");
    await validateOauthState(state);
    const tokens = await exchangeCodeForTokens(code, req);
    const profile = tokens.access_token ? await whoopGet("/user/profile/basic", tokens.access_token).catch(() => ({})) : {};
    await saveConnection(tokens, profile);
    await syncWhoopData(30).catch(() => null);
    res.statusCode = 302;
    res.setHeader("Location", `${home}connected`);
    res.end();
  } catch (err) {
    res.statusCode = 302;
    res.setHeader("Location", `${home}error&message=${encodeURIComponent(err.message || "WHOOP connection failed")}`);
    res.end();
  }
}

async function sync(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requirePin(req, res)) return;
  try {
    const body = await readJson(req);
    const readiness = await syncWhoopData(Number(body.days || 14));
    json(res, 200, { readiness });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP sync failed" });
  }
}

async function refresh(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requirePin(req, res)) return;
  try {
    await refreshTokens();
    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP refresh failed" });
  }
}

async function status(req, res) {
  if (!requirePin(req, res)) return;
  try {
    json(res, 200, { connection: summarizeConnection(await loadConnection()) });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP status failed" });
  }
}

async function latest(req, res) {
  if (!requirePin(req, res)) return;
  try {
    json(res, 200, await latestReadiness());
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP latest failed" });
  }
}

async function history(req, res) {
  if (!requirePin(req, res)) return;
  const url = new URL(req.url, `https://${req.headers.host}`);
  try {
    json(res, 200, await readinessHistory(Number(url.searchParams.get("days") || 30)));
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP history failed" });
  }
}

async function disconnect(req, res) {
  if (req.method !== "DELETE" && req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requirePin(req, res)) return;
  try {
    const body = req.method === "POST" ? await readJson(req) : {};
    await disconnectWhoop(Boolean(body.deleteData));
    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP disconnect failed" });
  }
}

async function webhook(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  try {
    const raw = await readRaw(req);
    if (!verifyWebhook(req, raw)) return json(res, 401, { error: "Invalid WHOOP webhook signature" });
    const event = raw ? JSON.parse(raw) : {};
    await logWebhook(event, "received");
    json(res, 200, { ok: true });
    syncWhoopData(3).catch((error) => logWebhook(event, "failed", error.message));
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP webhook failed" });
  }
}

function readRaw(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}
