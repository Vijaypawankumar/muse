import { NextResponse } from "next/server";
import { db, dbFail } from "@/lib/db";
import { askAI, parseJSON } from "@/lib/ai";
import { generateIdea, pick, norm, SEEDS, ANGLES, moodFor } from "@/lib/generator";

export const dynamic = "force-dynamic";

const SYSTEM = `You are the idea engine for MUSE, a creative companion for a beginner Instagram Reels creator who shoots on an iPhone.
Propose one offbeat, relatable reel idea that can be shot on a phone in under an hour. Use the seed word as inspiration without repeating it word for word.
Return only JSON with these keys:
- title: under 12 words
- angle: one of ${ANGLES.join(", ")}
- hook: one sentence describing the opening shot
- concept: two sentences
- mood: one sentence about music and light`;

export async function POST() {
  const supabase = db();
  let avoid = [];

  if (supabase) {
    const { data, error } = await supabase
      .from("ideas")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return dbFail(error);
    avoid = (data || []).map((r) => r.title);
  }

  const seed = pick(SEEDS);
  const taken = new Set(avoid.map(norm));
  let idea = null;
  let source = "built-in";

  const parsed = parseJSON(
    await askAI(
      SYSTEM,
      `Seed word: ${seed}\nDo not repeat any of these titles: ${avoid.slice(0, 80).join(" | ") || "(none yet)"}`,
      { json: true }
    )
  );

  if (parsed?.title && parsed?.hook && parsed?.concept && !taken.has(norm(parsed.title))) {
    idea = {
      title: String(parsed.title),
      angle: ANGLES.includes(parsed.angle) ? parsed.angle : "Relatable",
      hook: String(parsed.hook),
      concept: String(parsed.concept),
      mood: String(parsed.mood || moodFor(parsed.angle)),
      seed,
    };
    source = "ai";
  }

  if (!idea) idea = generateIdea({ avoid });

  if (supabase) {
    const { error } = await supabase
      .from("ideas")
      .insert({ title: idea.title, angle: idea.angle, status: "seen", data: idea });
    if (error) return dbFail(error);
  }

  return NextResponse.json({ idea, source, remembered: Boolean(supabase) });
}
