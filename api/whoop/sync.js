import { json, readJson, requirePin } from "../_shared.js";
import { syncWhoopData } from "../../server/whoop-service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  if (!requirePin(req, res)) return;
  try {
    const body = await readJson(req);
    const readiness = await syncWhoopData(Number(body.days || 14));
    json(res, 200, { readiness });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP sync failed" });
  }
}
