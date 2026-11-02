import { NextResponse } from "next/server";
import { askAI, parseJSON } from "@/lib/ai";
import { buildCard } from "@/lib/director";

export const dynamic = "force-dynamic";

const SYSTEM = `You are the Reel Director for MUSE. The creator is a beginner who shoots on an iPhone and edits in Instagram's editor or CapCut.
Turn the idea into a practical shoot plan. Use plain words, no jargon, and describe what to do rather than where to tap.
Return only JSON with these keys:
- hooks: 3 opening-shot options (strings)
- scenes: exactly 5 objects with keys time (e.g. "0 to 2s"), visual (what to film), text (on-screen text or "")
- camera: 3 short camera tips (strings)
- mood: one sentence about music and light
- captions: 3 caption ideas, written to be edited in the creator's voice
- editSteps: 6 to 8 editing steps (strings), each describing a goal
- tools: one sentence naming the simplest free app to use first`;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "").trim().slice(0, 300);
  if (!title) {
    return NextResponse.json({ error: "Describe the idea first." }, { status: 400 });
  }

  const input = {
    title,
    concept: String(body.concept || "").slice(0, 500),
    angle: String(body.angle || "Relatable"),
    mood: String(body.mood || ""),
  };

  const base = buildCard(input);
  const parsed = parseJSON(await askAI(SYSTEM, JSON.stringify(input), { json: true }));

  if (parsed && Array.isArray(parsed.scenes) && parsed.scenes.length >= 3 && Array.isArray(parsed.editSteps)) {
    return NextResponse.json({ card: { ...base, ...parsed }, source: "ai" });
  }
  return NextResponse.json({ card: base, source: "built-in" });
}
