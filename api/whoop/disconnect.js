import { json, readJson, requirePin } from "../_shared.js";
import { disconnectWhoop } from "./_service.js";

export default async function handler(req, res) {
  if (req.method !== "DELETE" && req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;
  try {
    const body = req.method === "POST" ? await readJson(req) : {};
    await disconnectWhoop(Boolean(body.deleteData));
    json(res, 200, { ok: true });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP disconnect failed" });
  }
}
