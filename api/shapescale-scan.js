import { env, json, readJson, requirePin } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;

  try {
    const body = await readJson(req);
    const fileData = String(body.fileData || "");
    const filename = String(body.filename || "shapescale-report.pdf");
    const reportText = String(body.reportText || "");

    if (!fileData && !reportText.trim()) {
      json(res, 400, { error: "Add a ShapeScale PDF, image, or report text" });
      return;
    }

    const scan = await readShapeScale({ fileData, filename, reportText });
    json(res, 200, { scan });
  } catch (error) {
    json(res, 500, { error: error.message || "ShapeScale scan failed" });
  }
}

async function readShapeScale({ fileData, filename, reportText }) {
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const content = [];

  if (fileData.startsWith("data:application/pdf")) {
    content.push({ type: "input_file", filename, file_data: fileData, detail: "high" });
  } else if (fileData.startsWith("data:image/")) {
    content.push({ type: "input_image", image_url: fileData });
  } else if (fileData) {
    throw new Error("Use a ShapeScale PDF or image file.");
  }

  content.push({
    type: "input_text",
    text: [
      "Extract the latest ShapeScale body scan measurements from the provided report.",
      reportText ? `Report text pasted by user:\n${reportText.slice(0, 12000)}` : "",
      "Return only JSON with these keys:",
      "date, weight, waist, shoulders, arms, biceps, hips, thighs, neck, calves, bodyFat, leanMass.",
      "Use ISO date YYYY-MM-DD. Use inches for circumferences, pounds for weight and leanMass, percent for bodyFat.",
      "If arms and biceps are the same measurement, set both to the same value.",
      "If body weight is missing but lean mass and body fat are present, derive weight as leanMass / (1 - bodyFat / 100).",
      "If a field cannot be found, use null. No markdown. No commentary."
    ].filter(Boolean).join("\n\n")
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [{ role: "user", content }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI ${response.status}`);
  }

  return cleanScan(parseJson(extractText(data)));
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

function parseJson(text) {
  const trimmed = String(text || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not read ShapeScale measurements.");
    return JSON.parse(match[0]);
  }
}

function cleanScan(scan) {
  const bodyFat = numberOrNull(scan.bodyFat);
  const leanMass = numberOrNull(scan.leanMass);
  const explicitWeight = numberOrNull(scan.weight);
  const weight = explicitWeight || (leanMass && bodyFat ? leanMass / (1 - bodyFat / 100) : null);
  const biceps = numberOrNull(scan.biceps ?? scan.arms);

  const cleaned = {
    date: isoDate(scan.date) || new Date().toISOString().slice(0, 10),
    weight: round1(weight),
    waist: round1(scan.waist),
    shoulders: round1(scan.shoulders),
    arms: round1(scan.arms ?? biceps),
    biceps: round1(biceps),
    hips: round1(scan.hips),
    thighs: round1(scan.thighs),
    neck: round1(scan.neck),
    calves: round1(scan.calves),
    bodyFat: round1(bodyFat),
    leanMass: round1(leanMass),
    source: "ShapeScale",
    notes: explicitWeight ? "Imported from ShapeScale PDF/photo." : "Imported from ShapeScale PDF/photo. Weight derived from lean mass and body fat."
  };

  if (![cleaned.bodyFat, cleaned.leanMass, cleaned.waist].every((value) => value !== "")) {
    throw new Error("Could not find ShapeScale measurements.");
  }

  return cleaned;
}

function isoDate(value) {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function numberOrNull(value) {
  const number = Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function round1(value) {
  const number = numberOrNull(value);
  return number === null ? "" : Math.round(number * 10) / 10;
}
