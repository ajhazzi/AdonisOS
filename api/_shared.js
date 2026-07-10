export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 18_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export function requirePin(req, res) {
  const required = process.env.ADONIS_APP_PIN;
  if (!required) return true;
  const sent = req.headers["x-adonis-pin"];
  if (sent === required) return true;
  json(res, 401, { error: "Invalid app PIN" });
  return false;
}

export function requirePinValue(pin) {
  const required = process.env.ADONIS_APP_PIN;
  if (!required) return true;
  return pin === required;
}

export function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function optionalEnv(name, fallback = "") {
  return process.env[name] || fallback;
}

export function appOrigin(req) {
  return process.env.APP_BASE_URL || process.env.APP_URL || `https://${req.headers.host}`;
}

export async function supabaseRequest(path, options) {
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
