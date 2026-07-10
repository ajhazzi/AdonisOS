import { json, requirePin } from "../_shared.js";
import { readinessHistory } from "../../server/whoop-service.js";

export default async function handler(req, res) {
  if (!requirePin(req, res)) return;
  const url = new URL(req.url, `https://${req.headers.host}`);
  try {
    json(res, 200, await readinessHistory(Number(url.searchParams.get("days") || 30)));
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP history failed" });
  }
}
