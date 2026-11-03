import { NextResponse } from "next/server";
import { askAIFull, geminiImage, aiConfigured, parseJSON } from "@/lib/ai";
import { STORYBOARD_SYSTEM, storyboardRequest } from "@/lib/prompts";

export const dynamic = "force-dynamic";
// Drawing several pictures can take a while. Allow up to 60 seconds on Vercel.
export const maxDuration = 60;

const STYLE =
  "vertical 9:16 portrait photo taken on a smartphone, natural daylight, realistic, candid, rural village home setting, no text, no watermark";

const DEFAULT_CHARACTER = "a young woman in simple everyday clothes, hair tied back";

// Free backup image service. No key, but it allows only about one picture every 45 seconds.
function backupImageUrl(prompt, seed) {
  const p = encodeURIComponent(prompt.slice(0, 900));
  return `https://image.pollinations.ai/prompt/${p}?width=540&height=960&seed=${seed}&nologo=true`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "Untitled reel").slice(0, 200);
  const scenes = (Array.isArray(body.scenes) ? body.scenes : [])
    .slice(0, 6)
    .map((s) => ({ time: String(s.time || ""), visual: String(s.visual || ""), text: String(s.text || "") }));

  if (!scenes.length) {
    return NextResponse.json({ error: "Make the shoot plan first." }, { status: 400 });
  }

  const seed = Number.isFinite(body.seed) ? body.seed : Math.floor(Math.random() * 100000);

  // Step 1: write one picture prompt per scene, with the same character in each.
  const { text, error } = await askAIFull(
    STORYBOARD_SYSTEM,
    storyboardRequest({ title, scenes, style: STYLE }),
    { json: true }
  );
  const parsed = parseJSON(text);

  let character = DEFAULT_CHARACTER;
  let prompts = scenes.map((s) => `${DEFAULT_CHARACTER}. ${s.visual}. ${STYLE}`);
  let reason = error;

  if (parsed && Array.isArray(parsed.frames) && parsed.frames.length >= scenes.length) {
    character = String(parsed.character || DEFAULT_CHARACTER);
    prompts = parsed.frames.slice(0, scenes.length).map((f) => `${String(f.prompt || "")}. ${STYLE}`);
    reason = null;
  } else if (!error) {
    reason = "The AI reply was not in the expected format, so simple prompts were used.";
  }

  // Step 2: draw the pictures. Gemini first (uses your key), free service as backup.
  let pictureNote = "";
  let urls;
  let imageFrom;
  if (aiConfigured()) {
    const results = await Promise.all(prompts.map((p) => geminiImage(p)));
    const failed = results.find((r) => r.error);
    imageFrom = results.map((r) => (r.dataUrl ? "gemini" : "backup"));
    urls = results.map((r, i) => r.dataUrl || backupImageUrl(prompts[i], seed));
    if (failed) {
      pictureNote = `Gemini could not draw every picture: ${failed.error} Some frames use the free backup service.`;
    }
  } else {
    urls = prompts.map((p) => backupImageUrl(p, seed));
    imageFrom = prompts.map(() => "backup");
    pictureNote = "Pictures use the free backup service, which allows about one picture every 45 seconds. Add the Gemini key to draw all frames properly.";
  }

  const frames = scenes.map((s, i) => ({
    time: s.time,
    text: s.text,
    visual: s.visual,
    prompt: prompts[i],
    url: urls[i],
    from: imageFrom[i],
  }));

  return NextResponse.json({
    frames,
    character,
    seed,
    source: parsed ? "ai" : "built-in",
    reason,
    pictureNote,
  });
}
