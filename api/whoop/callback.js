import { appOrigin } from "../_shared.js";
import { exchangeCodeForTokens, saveConnection, syncWhoopData, validateOauthState, whoopGet } from "../../server/whoop-service.js";

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const home = `${appOrigin(req)}/?whoop=`;

  try {
    if (error) throw new Error(error);
    if (!code || !state) throw new Error("Missing WHOOP authorization code.");
    await validateOauthState(state);
    const tokens = await exchangeCodeForTokens(code, req);
    const profile = tokens.access_token ? await whoopGet("/user/profile/basic", tokens.access_token).catch(() => ({})) : {};
    await saveConnection(tokens, profile);
    await syncWhoopData(30).catch(() => null);
    res.statusCode = 302;
    res.setHeader("Location", `${home}connected`);
    res.end();
  } catch (err) {
    res.statusCode = 302;
    res.setHeader("Location", `${home}error&message=${encodeURIComponent(err.message || "WHOOP connection failed")}`);
    res.end();
  }
}
