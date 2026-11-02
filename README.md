# MUSE — Your ideas deserve to be created

A small creative companion for an Instagram Reels creator who has no team. It gives her:

- **Home**: one offbeat reel idea at a time, with a relatable angle and no repeats.
- **Create (Reel Director)**: turns an idea into a scene-by-scene shot list, camera tips, mood, captions, and an edit recipe for an iPhone.
- **Assistant**: short, practical replies for "I have no ideas", "I can't execute this", "my reel looked bad", "I'm alone", "I want to quit". No flattery, no motivational quotes.
- **My Studio**: saved ideas, with a status of saved, drafting, or posted.
- **Growth**: a private list of wins, with no streaks and no missed-day counts.

## Cost: everything here is free

| Part | Service | Free tier |
|---|---|---|
| Hosting | Vercel Hobby (or Cloudflare Pages) | Free. See the licence note below. |
| Database | Supabase | Free project, 500 MB. Pauses after 7 days of no activity. |
| AI (optional) | Google Gemini API | Free tier via Google AI Studio. Limits can change. |

The app works with **no AI key at all**. Without one, ideas and shoot plans come from the built-in engine. Add a Gemini key later for more varied output.

## Run it on your computer

Requirements: Node.js 20 or newer.

```bash
cd muse
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev
```

Open http://localhost:3000. On an iPhone, open your computer's address on the same Wi-Fi (for example http://192.168.x.x:3000) to test on the phone.

Without the Supabase values, the app still runs. Saving to My Studio, the Growth list, and "don't repeat" memory are disabled until you connect Supabase.

## Step 1: Create the database (free)

1. Go to https://supabase.com, sign in, and click **New project**. Choose a free region close to you.
2. Wait for it to finish, then open **SQL Editor → New query**.
3. Paste the whole contents of `supabase/schema.sql` and click **Run**.
4. Go to **Project Settings → API**. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

The service role key bypasses Row Level Security. Keep it only in server environment variables. Never put it in browser code, and never prefix it with `NEXT_PUBLIC_`. The schema turns on Row Level Security with no policies, so the public anon key cannot read or write the data.

## Step 2: Add the AI key (optional, free)

1. Go to https://aistudio.google.com/apikey and create a key.
2. Set `GEMINI_API_KEY` in `.env.local`. Optionally change `GEMINI_MODEL` if Google renames the model.

If the key is missing, invalid, or over quota, the app automatically falls back to the built-in engine. It never shows an error because of AI.

## Step 3: Put it online (free)

### Option A: Vercel (simplest)

1. Create a GitHub repository and push this folder to it. `.env.local` is already excluded by `.gitignore`.
2. Go to https://vercel.com, sign in with GitHub, and click **Add New → Project**. Import the repository.
3. Under **Environment Variables**, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `GEMINI_API_KEY` and `GEMINI_MODEL`.
4. Click **Deploy**. You get a link like `https://muse-yourname.vercel.app`. Open it on her iPhone and choose **Share → Add to Home Screen**.

**Licence note:** Vercel's Hobby plan is for personal, non-commercial use. If MUSE will be used for TruPlate's business, check Vercel's current terms or use Option B.

### Option B: Cloudflare Pages (free for commercial use)

1. Push the repository to GitHub, then go to https://dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
2. Framework preset: **Next.js**. Build command: `npm run build`. Output: leave the default.
3. Add the same environment variables under **Settings → Environment variables**.
4. Deploy. Cloudflare Pages supports Next.js through its Next.js adapter. Check Cloudflare's current Next.js guide if the build step changes.

## Before you share the link

The API routes do not have a login. Anyone who has the link can generate ideas and read or change saved items. For one person's use, keep the link private. Before sharing it more widely, add a passcode check to the API routes or put the site behind your host's access protection.

## Known limits (honest version)

- **Built-in engine repeats after about 120 combinations.** It has 20 seed words and 6 title patterns. Adding seeds to `lib/generator.js` extends that, and the Gemini key gives far more variety.
- **Editing menus change.** The app describes goals ("trim to the beat") rather than exact button positions, because Instagram and CapCut move things between versions.
- **It plans reels; it does not make them.** She still shoots and edits.
- **No trend data.** Instagram's public API does not expose trending audio or formats for ordinary accounts. Trend research is a later step.
- **Supabase free projects pause** after 7 days without activity. Open the app at least weekly, or upgrade when needed.

## Project layout

```
app/                 pages (Home, Create, Assistant, My Studio, Growth) and API routes
app/api/             server routes that talk to Supabase and the optional AI
lib/generator.js     built-in idea engine (no AI needed)
lib/director.js      built-in shoot plan and edit recipe
lib/assistant.js     built-in assistant replies
lib/ai.js            optional Gemini client, with safe fallback
lib/db.js            server-only Supabase client
supabase/schema.sql  database tables
```

## Next steps (after she has used it for a week)

1. Ask her which cards she actually shot, and which she skipped and why. Tune the prompts from that.
2. Add a manual growth log (views, saves, shares per reel, weekly) and one simple pattern insight.
3. Add a "don't repeat" check on the built-in engine by storing the seed combinations already used.
