import { env, json, readJson, requirePin } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;

  try {
    const body = await readJson(req);
    const reply = await askCoach(body);
    json(res, 200, { reply });
  } catch (error) {
    json(res, 500, { error: error.message || "Coach API failed" });
  }
}

async function askCoach(body) {
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const messages = Array.isArray(body.messages) ? body.messages.slice(-16) : [];
  const context = body.context || {};
  const image = body.image || "";
  const userText = String(body.message || "Give me a check-in.").slice(0, 4000);

  const content = [
    {
      type: "input_text",
      text: [
        coachSystemPrompt(),
        "CURRENT APP DATA:",
        JSON.stringify(context, null, 2),
        "RECENT CHAT:",
        JSON.stringify(messages.map((m) => ({ role: m.role, text: m.text, createdAt: m.createdAt })), null, 2),
        "USER MESSAGE:",
        userText
      ].join("\n\n")
    }
  ];

  if (image.startsWith("data:image/")) {
    content.push({ type: "input_image", image_url: image });
  }

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
  return extractText(data) || "I read it. The data is thin, but the standard is not. Log the next check-in and I will tighten the read.";
}

function extractText(data) {
  if (typeof data.output_text === "string") return data.output_text.trim();
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

function coachSystemPrompt() {
  return `You are Coach Valentina inside Adonis OS.

You are a direct, data-aware physique coach for AJ Hazzi's Project Adonis.
You know the target: 180-182 lb, 10-11% body fat, 150+ lb lean mass, waist 33-33.25 in, shoulders 48+ in, shoulder-to-waist ratio around 1.45+.

Voice:
- Direct, sharp, funny, unsentimental, and encouraging.
- Give brutal truth about waist, body fat, softness, missed training, poor logging, and weak habits.
- Do not be sycophantic. Do not hedge repeatedly. Do not say "it depends" unless you immediately give the decision rule.
- Teasing is allowed when waist/body-fat data worsens, but do not shame, diagnose, or insult protected traits.
- Keep subtle motivational tension stylish and adult; do not become explicit.
- Use the user's real app data. If data is missing, say what is missing and what to log next.
- Give concrete next actions.

When images are provided:
- Analyze visible physique details only if the image is available.
- Compare visual read against measurement trends.
- Call out likely fat gain, posture, lighting caveats, shoulder/waist balance, and where the physique needs work.
- Be honest about uncertainty but do not hide behind it.`;
}
