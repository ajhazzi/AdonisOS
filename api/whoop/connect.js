import { env, json, requirePinValue } from "../_shared.js";
import { WHOOP_AUTH_URL, WHOOP_SCOPES, createOauthState, redirectUri } from "./_service.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pin = url.searchParams.get("pin") || "";
  if (!requirePinValue(pin)) {
    json(res, 401, { error: "Invalid app PIN" });
    return;
  }

  try {
    const state = await createOauthState();
    const auth = new URL(WHOOP_AUTH_URL);
    auth.searchParams.set("client_id", env("WHOOP_CLIENT_ID"));
    auth.searchParams.set("redirect_uri", redirectUri(req));
    auth.searchParams.set("response_type", "code");
    auth.searchParams.set("scope", WHOOP_SCOPES);
    auth.searchParams.set("state", state);
    res.statusCode = 302;
    res.setHeader("Location", auth.toString());
    res.end();
  } catch (error) {
    json(res, 500, { error: error.message || "WHOOP connect failed" });
  }
}
