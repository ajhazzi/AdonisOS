import { env, json, readJson, requirePin } from "../_shared.js";

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
    if (!image.startsWith("data:image/")) return json(res, 400, { error: "Missing WHOOP screenshot image" });
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
