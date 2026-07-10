import { json, requirePin } from "../_shared.js";
import { loadConnection, summarizeConnection } from "../../server/whoop-service.js";

export default async function handler(req, res) {
  if (!requirePin(req, res)) return;
  try {
    json(res, 200, { connection: summarizeConnection(await loadConnection()) });
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP status failed" });
  }
}
