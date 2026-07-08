import { env, json, readJson, requirePin } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;

  try {
    const body = await readJson(req);
    const image = String(body.image || "");
    if (!image.startsWith("data:image/")) {
      json(res, 400, { error: "Missing label image" });
      return;
    }

    const meal = await readMealLabel(image);
    json(res, 200, { meal });
  } catch (error) {
    json(res, 500, { error: error.message || "Meal label scan failed" });
  }
}

async function readMealLabel(image) {
  const model = process.env.OPENAI_MODEL || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env("OPENAI_API_KEY")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                "Read this meal-prep lid or nutrition label.",
                "Return only JSON with these keys: name, calories, protein, carbs, fat.",
                "Use the macros for one meal/container when shown.",
                "If the meal name is visible, use it. If not, use a concise descriptive name.",
                "Numbers must be numeric grams/kcal. If a macro is missing, use 0.",
                "No markdown. No commentary."
              ].join(" ")
            },
            { type: "input_image", image_url: image }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI ${response.status}`);
  }

  return cleanMeal(parseJson(extractText(data)));
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
    if (!match) throw new Error("Could not read meal macros from label.");
    return JSON.parse(match[0]);
  }
}

function cleanMeal(meal) {
  return {
    name: String(meal.name || "Scanned meal").trim(),
    calories: Math.round(Number(meal.calories || 0)),
    protein: roundMacro(meal.protein),
    carbs: roundMacro(meal.carbs),
    fat: roundMacro(meal.fat)
  };
}

function roundMacro(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}
