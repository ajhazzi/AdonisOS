# Adonis OS

Adonis OS is a mobile-first Progressive Web App for the Project Adonis 12-week physique program. It runs locally, stores MVP data in `localStorage`, and has no backend or paid APIs.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. On iPhone, open the same URL on your network and use **Add to Home Screen** to install it like an app.

## Test On iPhone

Keep the dev server running on your Mac:

```bash
npm run dev
```

Use the `Network:` URL that Vite prints, for example `http://192.168.1.128:5173/`. Do not use `localhost` on the phone, because that points to the phone itself.

If the Home Screen app stops loading later:

- Start the dev server again with `npm run dev`.
- Check whether the `Network:` URL changed.
- If the IP changed, open the new URL in Safari and use **Add to Home Screen** again.
- Make sure the Mac and iPhone are on the same Wi-Fi.
- If iOS cached an old version, remove the Home Screen icon and add it again.

## Included

- Home dashboard with cinematic hero, target lines, goals, weekly schedule, and mission card
- 12-week workout program with recovery days
- Active workout logging with last workout reference, beat-last-time targets, set notes, and rest timer
- Completed workout history stored in `localStorage`
- Progress logging with body metrics, 7-day average, change cards, ratio, and Adonis score
- Nutrition logging with calorie and macro targets, remaining macros, trend cards, reverse diet guardrails, and coach note
- Coach Valentina chat with local fallback plus deploy-ready OpenAI vision/chat backend
- Supabase-backed cloud sync through protected `/api/state`
- WHOOP integration for recovery, sleep, strain, readiness, and workout volume guidance
- Bottom tab navigation and PWA manifest/service worker

## Data

Local data is stored under the `adonis_os_state_v1` key in the browser's `localStorage`.

When backend environment variables are configured, the app can also sync its full state to Supabase. Use the **More -> Cloud Sync** panel in the app to save your private app PIN, then pull/push cloud state.

## Backend Setup

The app includes Vercel-style API functions under `api/`.

### 1. Create The Supabase Table

In Supabase SQL Editor, run the full contents of `supabase-schema.sql`.

The serverless API uses your Supabase service role key server-side, so no public table policy is needed.

### 2. Add Vercel Environment Variables

Create these variables in Vercel:

```bash
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-5.5
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADONIS_APP_PIN=choose-a-private-pin
ADONIS_USER_ID=aj-hazzi

APP_BASE_URL=https://adonis-os.vercel.app
TOKEN_ENCRYPTION_KEY=make-this-a-long-private-random-secret

WHOOP_CLIENT_ID=your-whoop-client-id
WHOOP_CLIENT_SECRET=your-whoop-client-secret
WHOOP_REDIRECT_URI=https://adonis-os.vercel.app/api/whoop/callback
WHOOP_WEBHOOK_SECRET=optional-webhook-secret
WHOOP_DEMO_MODE=false
```

### 3. Use The App PIN

After deployment, open the app, go to **More -> Cloud Sync**, enter the same `ADONIS_APP_PIN`, and tap **Save PIN**.

From then on:

- App changes auto-push to Supabase when the PIN is saved.
- Opening the app auto-pulls cloud data.
- Coach Valentina calls `/api/coach-chat` and uses OpenAI when available.
- If the backend is unavailable, the local fallback coach still responds.

## WHOOP Setup

Create a WHOOP Developer app and set its callback/redirect URL to:

```text
https://adonis-os.vercel.app/api/whoop/callback
```

Then add the WHOOP variables above in Vercel, redeploy, open **More -> Cloud Sync** to save your app PIN, then open **More -> Integrations -> Connect WHOOP**.

WHOOP data is stored in Supabase as raw cycles, recoveries, sleeps, workouts, and a daily Adonis readiness row. The app uses that readiness to show Home recovery status and optional workout volume adjustments.
