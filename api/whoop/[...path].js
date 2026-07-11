import { env, json, readJson, requirePin } from "../_shared.js";
import zlib from "node:zlib";

export default async function handler(req, res) {
  const action = whoopAction(req);
  if (action === "import") return importWhoop(req, res);
  if (["connect", "callback", "sync", "refresh", "status", "latest", "history", "disconnect", "webhook"].includes(action)) {
    return json(res, 410, { error: "WHOOP API connection is disabled. Use manual WHOOP CSV/text or screenshot import in More." });
  }
  return json(res, 404, { error: "WHOOP route not found" });
}

function whoopAction(req) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  const whoopIndex = parts.indexOf("whoop");
  return parts[whoopIndex + 1] || "";
}

async function importWhoop(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  if (!requirePin(req, res)) return;
  try {
    const body = await readJson(req);
    const image = String(body.image || "");
    const fileData = String(body.fileData || "");
    if (fileData.startsWith("data:") && isZipData(fileData, body.filename)) {
      return json(res, 200, parseWhoopZip(fileData));
    }
    if (!image.startsWith("data:image/")) return json(res, 400, { error: "Missing WHOOP screenshot image or zip export" });
    const readiness = await readWhoopScreenshot(image);
    json(res, 200, { readiness });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP screenshot import failed" });
  }
}

async function readWhoopScreenshot(image) {
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      text: {
        format: {
          type: "json_schema",
          name: "whoop_import",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["date", "recovery_score", "sleep_performance_percentage", "sleep_duration_hours", "hrv_rmssd", "resting_heart_rate", "cycle_strain", "calories_burned", "workout_calories", "steps"],
            properties: {
              date: { type: "string", description: "Date as YYYY-MM-DD if visible, otherwise empty string." },
              recovery_score: { type: ["number", "null"] },
              sleep_performance_percentage: { type: ["number", "null"] },
              sleep_duration_hours: { type: ["number", "null"] },
              hrv_rmssd: { type: ["number", "null"] },
              resting_heart_rate: { type: ["number", "null"] },
              cycle_strain: { type: ["number", "null"] },
              calories_burned: { type: ["number", "null"], description: "Total daily calories burned if visible." },
              workout_calories: { type: ["number", "null"], description: "Workout or activity calories if visible." },
              steps: { type: ["number", "null"] }
            }
          }
        }
      },
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Read this WHOOP screenshot and extract fitness metrics for Adonis OS.",
                "Prefer daily total calories burned over workout calories for calories_burned.",
                "If a metric is not visible, use null. Return numeric values only, no units."
              ].join(" ")
            },
            { type: "input_image", image_url: image }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || `OpenAI ${response.status}`);
  return normalizeImportedWhoop(parseJson(extractText(data)));
}

function normalizeImportedWhoop(input = {}) {
  const recoveryScore = numberOrNull(input.recovery_score);
  const sleepPerformance = numberOrNull(input.sleep_performance_percentage);
  return {
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(input.date || "")) ? input.date : new Date().toISOString().slice(0, 10),
    recovery_score: recoveryScore,
    sleep_performance_percentage: sleepPerformance,
    sleep_duration_hours: numberOrNull(input.sleep_duration_hours),
    hrv_rmssd: numberOrNull(input.hrv_rmssd),
    resting_heart_rate: numberOrNull(input.resting_heart_rate),
    cycle_strain: numberOrNull(input.cycle_strain),
    calories_burned: numberOrNull(input.calories_burned),
    workout_calories: numberOrNull(input.workout_calories),
    steps: numberOrNull(input.steps),
    source: "whoop-screenshot",
    last_synced_at: new Date().toISOString(),
    rules_version: "adonis-readiness-v1",
    ...readinessRecommendation(recoveryScore, sleepPerformance)
  };
}

function isZipData(fileData, filename = "") {
  return fileData.startsWith("data:application/zip") || fileData.startsWith("data:application/x-zip-compressed") || String(filename || "").toLowerCase().endsWith(".zip");
}

function parseWhoopZip(fileData) {
  const files = unzipDataUrl(fileData);
  const cycles = csvObjects(files["physiological_cycles.csv"] || "");
  const sleeps = csvObjects(files["sleeps.csv"] || "");
  const workouts = csvObjects(files["workouts.csv"] || "");
  if (!cycles.length && !sleeps.length && !workouts.length) {
    throw new Error("Could not find WHOOP CSV files inside that zip.");
  }

  const workoutByDate = summarizeWorkouts(workouts);
  const history = cycles
    .filter((row) => row["Recovery score %"] || row["Sleep performance %"] || row["Day Strain"] || row["Energy burned (cal)"])
    .map((row) => readinessFromCycle(row, workoutByDate))
    .filter((row) => row.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (!history.length && sleeps.length) {
    sleeps.forEach((row) => history.push(readinessFromSleep(row, workoutByDate)));
    history.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }

  if (!history.length) {
    throw new Error("Could not find usable WHOOP recovery or sleep rows in that zip.");
  }

  const readiness = {
    ...history[0],
    source: "whoop-zip",
    last_synced_at: new Date().toISOString()
  };
  return {
    readiness,
    history: history.slice(0, 90),
    summary: {
      cycles: cycles.length,
      sleeps: sleeps.length,
      workouts: workouts.length,
      files: Object.keys(files)
    }
  };
}

function readinessFromCycle(row, workoutByDate) {
  const date = whoopRowDate(row);
  const workout = workoutByDate.get(date) || {};
  const recoveryScore = numberOrNull(row["Recovery score %"]);
  const sleepPerformance = numberOrNull(row["Sleep performance %"]);
  return {
    date,
    recovery_score: recoveryScore,
    sleep_performance_percentage: sleepPerformance,
    sleep_duration_hours: minutesToHours(row["Asleep duration (min)"]),
    hrv_rmssd: numberOrNull(row["Heart rate variability (ms)"]),
    resting_heart_rate: numberOrNull(row["Resting heart rate (bpm)"]),
    cycle_strain: numberOrNull(row["Day Strain"]),
    calories_burned: numberOrNull(row["Energy burned (cal)"]),
    workout_calories: workout.calories ?? null,
    steps: null,
    workouts: workout.workouts || [],
    source: "whoop-zip",
    last_synced_at: new Date().toISOString(),
    rules_version: "adonis-readiness-v1",
    ...readinessRecommendation(recoveryScore, sleepPerformance)
  };
}

function readinessFromSleep(row, workoutByDate) {
  const date = whoopRowDate(row);
  const workout = workoutByDate.get(date) || {};
  const sleepPerformance = numberOrNull(row["Sleep performance %"]);
  return {
    date,
    recovery_score: null,
    sleep_performance_percentage: sleepPerformance,
    sleep_duration_hours: minutesToHours(row["Asleep duration (min)"]),
    hrv_rmssd: null,
    resting_heart_rate: null,
    cycle_strain: null,
    calories_burned: null,
    workout_calories: workout.calories ?? null,
    steps: null,
    workouts: workout.workouts || [],
    source: "whoop-zip",
    last_synced_at: new Date().toISOString(),
    rules_version: "adonis-readiness-v1",
    ...readinessRecommendation(null, sleepPerformance)
  };
}

function summarizeWorkouts(workouts) {
  const byDate = new Map();
  workouts.forEach((row) => {
    const date = isoDate(row["Workout start time"]);
    if (!date) return;
    const current = byDate.get(date) || { calories: 0, strain: 0, workouts: [] };
    const calories = numberOrNull(row["Energy burned (cal)"]) || 0;
    current.calories += calories;
    current.strain += numberOrNull(row["Activity Strain"]) || 0;
    current.workouts.push({
      name: row["Activity name"] || "Workout",
      start: row["Workout start time"] || "",
      duration_min: numberOrNull(row["Duration (min)"]),
      strain: numberOrNull(row["Activity Strain"]),
      calories
    });
    byDate.set(date, current);
  });
  byDate.forEach((value) => {
    value.calories = Math.round(value.calories);
    value.strain = Math.round(value.strain * 10) / 10;
  });
  return byDate;
}

function whoopRowDate(row) {
  return isoDate(row["Wake onset"]) || isoDate(row["Sleep onset"]) || isoDate(row["Cycle start time"]);
}

function minutesToHours(value) {
  const minutes = numberOrNull(value);
  return minutes === null ? null : Math.round((minutes / 60) * 10) / 10;
}

function csvObjects(text) {
  const rows = csvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = row[index] ?? "";
    });
    return object;
  });
}

function csvRows(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map(splitCsvLine)
    .filter((row) => row.some((cell) => String(cell).trim()));
}

function splitCsvLine(line) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function unzipDataUrl(fileData) {
  const base64 = String(fileData).split(",")[1] || "";
  const buffer = Buffer.from(base64, "base64");
  const files = {};

  const eocdOffset = findEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) throw new Error("Could not read WHOOP zip directory.");
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  let centralOffset = buffer.readUInt32LE(eocdOffset + 16);

  for (let entry = 0; entry < entryCount; entry += 1) {
    if (buffer.readUInt32LE(centralOffset) !== 0x02014b50) throw new Error("Invalid WHOOP zip directory.");
    const method = buffer.readUInt16LE(centralOffset + 10);
    const compressedSize = buffer.readUInt32LE(centralOffset + 20);
    const fileNameLength = buffer.readUInt16LE(centralOffset + 28);
    const extraLength = buffer.readUInt16LE(centralOffset + 30);
    const commentLength = buffer.readUInt16LE(centralOffset + 32);
    const localOffset = buffer.readUInt32LE(centralOffset + 42);
    const nameStart = centralOffset + 46;
    const name = buffer.slice(nameStart, nameStart + fileNameLength).toString("utf8");

    if (buffer.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("Invalid WHOOP zip file header.");
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    let output = null;
    if (method === 0) output = compressed;
    else if (method === 8) output = zlib.inflateRawSync(compressed);
    else throw new Error(`Unsupported zip compression method ${method}.`);
    if (name && !name.endsWith("/")) files[name.split("/").pop()] = output.toString("utf8");
    centralOffset = nameStart + fileNameLength + extraLength + commentLength;
  }

  return files;
}

function findEndOfCentralDirectory(buffer) {
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 65557); offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  return -1;
}

function isoDate(value) {
  const text = String(value || "").trim();
  const match = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return match ? match[1] : "";
}

function readinessRecommendation(recoveryScore, sleepPerformance) {
  if (recoveryScore === null && sleepPerformance === null) return { readiness_level: "pending", recommended_action: "WHOOP screenshot imported", recommended_rir: "Use normal plan if you feel good", volume_multiplier: 1, finisher_enabled: false, recommendation_reason: "Screenshot did not include recovery or sleep score." };
  const red = recoveryScore !== null && recoveryScore <= 33 || sleepPerformance !== null && sleepPerformance < 60;
  const yellow = recoveryScore !== null && recoveryScore <= 66 || sleepPerformance !== null && sleepPerformance < 75;
  if (red) return { readiness_level: "red", recommended_action: "Recovery-biased day", recommended_rir: "3+ RIR", volume_multiplier: 0.6, finisher_enabled: false, recommendation_reason: "Low imported recovery or poor sleep. Keep training conservative." };
  if (yellow) return { readiness_level: "yellow", recommended_action: "Reduced volume", recommended_rir: "2-3 RIR", volume_multiplier: 0.85, finisher_enabled: false, recommendation_reason: "Imported recovery or sleep is moderate. Productive work, no failure chasing." };
  return { readiness_level: "green", recommended_action: "Train as planned", recommended_rir: "1-2 RIR", volume_multiplier: 1, finisher_enabled: true, recommendation_reason: "Imported recovery and sleep are strong enough to execute the full plan." };
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  return (data.output || []).flatMap((item) => item.content || []).map((part) => part.text || "").join("\n").trim();
}

function parseJson(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not read WHOOP screenshot.");
    return JSON.parse(match[0]);
  }
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(String(value).replace(/,/g, "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}
