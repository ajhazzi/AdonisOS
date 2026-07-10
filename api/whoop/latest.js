import { json, requirePin } from "../_shared.js";
import { latestReadiness } from "./_service.js";

export default async function handler(req, res) {
  if (!requirePin(req, res)) return;
  try {
    json(res, 200, await latestReadiness());
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP latest failed" });
  }
}
