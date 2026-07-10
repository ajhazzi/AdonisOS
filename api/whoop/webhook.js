import { json } from "../_shared.js";
import { logWebhook, syncWhoopData, verifyWebhook } from "../../server/whoop-service.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }
  let raw = "";
  req.on("data", (chunk) => {
    raw += chunk;
  });
  req.on("end", async () => {
    try {
      if (!verifyWebhook(req, raw)) {
        json(res, 401, { error: "Invalid WHOOP webhook signature" });
        return;
      }
      const event = raw ? JSON.parse(raw) : {};
      await logWebhook(event, "received");
      json(res, 200, { ok: true });
      syncWhoopData(3).catch((error) => logWebhook(event, "failed", error.message));
    } catch (error) {
      json(res, 500, { error: error.message || "WHOOP webhook failed" });
    }
  });
  req.on("error", (error) => json(res, 500, { error: error.message }));
}
