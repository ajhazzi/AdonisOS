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
      text: {
        format: {
          type: "json_schema",
          name: "meal_label",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["name", "calories", "protein", "carbs", "fat"],
            properties: {
              name: { type: "string", description: "Meal or product name visible on the label, or a concise descriptive name." },
              calories: { type: "number", description: "Calories/kcal for one meal, container, package, or serving shown." },
              protein: { type: "number", description: "Protein grams for one meal, container, package, or serving shown." },
              carbs: { type: "number", description: "Carbohydrate grams for one meal, container, package, or serving shown." },
              fat: { type: "number", description: "Fat grams for one meal, container, package, or serving shown." }
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
                "Read the visible text on this meal-prep lid, food label, or nutrition sticker.",
                "Extract the meal name and macros for one meal/container/package when shown.",
                "Look for labels and shorthand such as Calories, Cal, kcal, Protein, Pro, P, Carbs, Carbohydrates, C, Fat, F, and P/C/F.",
                "If multiple serving columns exist, prefer the full container/package/meal column over tiny per-serving values.",
                "If the meal name is visible, use it. If not, use a concise descriptive name.",
                "Return numeric kcal and grams only. If a macro truly is not visible, use 0."
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
  const cleaned = {
    name: String(meal.name || "Scanned meal").trim(),
    calories: Math.round(Number(meal.calories || 0)),
    protein: roundMacro(meal.protein),
    carbs: roundMacro(meal.carbs),
    fat: roundMacro(meal.fat)
  };
  const hasUsefulMacro = [cleaned.calories, cleaned.protein, cleaned.carbs, cleaned.fat].some((value) => Number(value) > 0);
  if (!hasUsefulMacro) {
    throw new Error("Could not find readable macros on that label. Try a closer, brighter photo.");
  }
  return cleaned;
}

function roundMacro(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}
