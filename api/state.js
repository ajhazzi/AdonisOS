import { env, json, readJson, requirePin } from "./_shared.js";

const rowId = process.env.ADONIS_USER_ID || "aj-hazzi";

export default async function handler(req, res) {
  if (!requirePin(req, res)) return;

  try {
    if (req.method === "GET") {
      const row = await supabaseRequest(`/rest/v1/app_state?id=eq.${encodeURIComponent(rowId)}&select=id,state,updated_at`, {
        method: "GET"
      });
      json(res, 200, row?.[0] || { id: rowId, state: null, updated_at: null });
      return;
    }

    if (req.method === "POST") {
      const body = await readJson(req);
      if (!body.state || typeof body.state !== "object") {
        json(res, 400, { error: "Missing state object" });
        return;
      }
      const saved = await supabaseRequest("/rest/v1/app_state?on_conflict=id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({ id: rowId, state: body.state, updated_at: new Date().toISOString() })
      });
      json(res, 200, saved?.[0] || { ok: true });
      return;
    }

    json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    json(res, 500, { error: error.message || "State API failed" });
  }
}

async function supabaseRequest(path, options) {
  const url = `${env("SUPABASE_URL")}${path}`;
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${await response.text()}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
