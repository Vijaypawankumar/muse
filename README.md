# MUSE. Your ideas deserve to be created.

A creative companion for a beginner Instagram Reels creator who shoots on an iPhone.

- **Home:** one reel idea at a time, with an opening shot, mood, and no repeats.
- **Create (Reel Director):** turns an idea into a shot list, camera tips, captions, and an edit recipe.
- **Assistant:** short, practical help for "no ideas", "can't execute", "bad reel", "shooting alone", "want to quit".
- **My Studio:** saved ideas, with saved, drafting, or posted status.
- **Growth:** a private list of wins. No streaks, no missed-day counts.

Everything here is free to run. The app also works with no AI key at all.

---

## Part 1: Connect Supabase (your database)

Your project is already created. Its name is **muse**, and its address is:

```
https://xpefaztgozmnoluylclh.supabase.co
```

The tables `ideas` and `wins` are already created in it.

### Find the secret key

1. Go to https://supabase.com/dashboard and click the project named **muse**.
2. Look at the **left sidebar**. Click the **gear icon (Project Settings)** at the bottom.
3. In the settings menu, click **API Keys** (on some screens: **Data API**, then scroll to **API Keys**).
4. Find the key for server use. It may be listed as:
   - **Secret key** (starts with `sb_secret_`), in the newer layout, **or**
   - **service_role** (a long key starting with `eyJ`), in the legacy tab called **Legacy API Keys**.
5. Click the **copy** icon next to it. Do **not** use the **publishable** key or the **anon** key. The app will reject them and tell you why.

Labels change between Supabase screens. The rule is simple: copy the one that is secret and has "service_role" or "secret" in its name.

### Put the values in your project

Create a file named `.env.local` in the `muse` folder (copy `.env.example` and rename it). Fill it in:

```
SUPABASE_URL=https://xpefaztgozmnoluylclh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=paste-the-secret-key-here
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

No quotes, no spaces around the `=`, and no extra text on the same line.

### Check it works

Run the app (Part 2), then open **http://localhost:3000/api/health** in your browser.

- Green message "Connected to https://xpefaztgozmnoluylclh.supabase.co" → database is fine.
- Red message → it tells you exactly which value to fix.

The same check runs on the Home page and shows a banner if something is wrong.

---

## Part 2: Run it on your computer

Requirements: Node.js 20 or newer.

```bash
cd muse
npm install
npm run dev
```

Open http://localhost:3000.

---

## Part 3: Put it online (Vercel)

1. Push the code to GitHub (see the commands below).
2. Go to https://vercel.com, sign in with GitHub, and click **Add New → Project**. Import the `muse` repository.
3. Before clicking Deploy, expand **Environment Variables** and add these, one at a time:
   - Name `SUPABASE_URL`, value `https://xpefaztgozmnoluylclh.supabase.co`
   - Name `SUPABASE_SERVICE_ROLE_KEY`, value = your secret key
   - Optional: `GEMINI_API_KEY` and `GEMINI_MODEL` (`gemini-2.5-flash`)
   - Do not click the Supabase "Add" integration. Enter the variables by hand.
4. Click **Deploy**.
5. If you add or change a variable later: **Deployments → latest → ⋯ menu → Redeploy**. Changes do not apply until you redeploy.
6. Open `https://YOUR-SITE.vercel.app/api/health` to confirm it is connected.

### Push the updated code to GitHub

In the VS Code terminal, inside the `muse` folder, run these one at a time:

```
git add .
git commit -m "Improve UI, add setup check" -m "Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_015eTvHLee66juoZ1Vj5JVLQ"
git push
```

Vercel redeploys automatically after a push.

**Licence note:** Vercel's free Hobby plan is for personal, non-commercial use. For TruPlate business use, use Cloudflare Pages instead (same environment variables, build command `npm run build`).

---

## Optional: free AI for fresher ideas

The built-in engine uses templates, so ideas repeat more than a live AI would produce. For fresher ideas:

1. Go to https://aistudio.google.com/apikey and click **Create API key**.
2. Put it in `GEMINI_API_KEY` (in `.env.local` and in Vercel), then redeploy.

If the key is missing or over its free limit, the app automatically falls back to the built-in engine.

---

## Before sharing the link

There is no login. Anyone with the link can use the app and read or change saved items. Keep the link private, or add a passcode before sharing it widely.

## Known limits

- **Built-in ideas repeat sooner** than AI ideas, because they come from templates.
- **Editing menus change** between app versions, so the guide describes goals, not exact button positions.
- **It plans reels; it does not film or edit them.**
- **No trend data.** Instagram's public API doesn't expose trending audio or formats for ordinary accounts.
- **Supabase free projects pause** after 7 days without activity. Open the app at least weekly.

## Project layout

```
app/                 pages and API routes
app/api/health/      connection check (open in browser)
lib/db.js            Supabase connection and clear error messages
lib/generator.js     built-in idea engine
lib/director.js      built-in shoot plan and edit recipe
lib/assistant.js     built-in assistant replies
lib/ai.js            optional Gemini client, with safe fallback
supabase/schema.sql  database tables (already applied to your project)
```
