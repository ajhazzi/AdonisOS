import { json, requirePin } from "../_shared.js";
import { refreshTokens } from "./_service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;
  try {
    await refreshTokens();
    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP refresh failed" });
  }
}
