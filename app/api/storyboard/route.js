import { NextResponse } from "next/server";
import { askAIFull, parseJSON } from "@/lib/ai";
import { STORYBOARD_SYSTEM, storyboardRequest } from "@/lib/prompts";

export const dynamic = "force-dynamic";

const STYLE =
  "vertical 9:16 photo taken on a smartphone, natural daylight, realistic, candid, rural village home setting, no text, no watermark";

const DEFAULT_CHARACTER = "a young woman in simple everyday clothes, hair tied back";

// Free image service. No key needed. The image is generated when the browser loads it.
function imageUrl(prompt, seed) {
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

  const { text, error } = await askAIFull(
    STORYBOARD_SYSTEM,
    storyboardRequest({ title, scenes, style: STYLE }),
    { json: true }
  );
  const parsed = parseJSON(text);

  let character = DEFAULT_CHARACTER;
  let prompts = scenes.map((s) => `${DEFAULT_CHARACTER}. ${s.visual}. ${STYLE}`);
  let source = "built-in";
  let reason = error;

  if (parsed && Array.isArray(parsed.frames) && parsed.frames.length >= scenes.length) {
    character = String(parsed.character || DEFAULT_CHARACTER);
    prompts = parsed.frames.slice(0, scenes.length).map((f) => `${String(f.prompt || "")}. ${STYLE}`);
    source = "ai";
    reason = null;
  } else if (!error) {
    reason = "The AI reply was not in the expected format, so simple frames were made.";
  }

  const frames = scenes.map((s, i) => ({
    time: s.time,
    text: s.text,
    visual: s.visual,
    prompt: prompts[i],
    url: imageUrl(prompts[i], seed),
  }));

  return NextResponse.json({ frames, character, seed, source, reason });
}
