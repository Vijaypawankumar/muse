import { NextResponse } from "next/server";
import { askAIFull, parseJSON } from "@/lib/ai";
import { buildCard } from "@/lib/director";
import { DIRECTOR_SYSTEM, directorRequest } from "@/lib/prompts";

export const dynamic = "force-dynamic";

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
    mood: String(body.mood || "").slice(0, 300),
  };

  const base = buildCard(input);
  const { text, error } = await askAIFull(DIRECTOR_SYSTEM, directorRequest(input), { json: true });
  const parsed = parseJSON(text);

  const valid =
    parsed &&
    Array.isArray(parsed.scenes) &&
    parsed.scenes.length >= 4 &&
    Array.isArray(parsed.editSteps) &&
    Array.isArray(parsed.hooks);

  if (valid) {
    return NextResponse.json({ card: { ...base, ...parsed }, source: "ai", reason: null });
  }
  return NextResponse.json({
    card: base,
    source: "built-in",
    reason: error || "The AI reply was not in the expected format, so the built-in plan is showing.",
  });
}
