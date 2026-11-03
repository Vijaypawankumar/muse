import { NextResponse } from "next/server";
import { db, dbFail } from "@/lib/db";
import { askAIFull, parseJSON } from "@/lib/ai";
import { generateIdea, pick, norm, SEEDS, ANGLES, moodFor } from "@/lib/generator";
import { IDEA_SYSTEM, ideaRequest, creatorContext } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = db();
  let recentTitles = [];
  let wins = [];

  if (supabase) {
    const [ideasRes, winsRes] = await Promise.all([
      supabase.from("ideas").select("title").order("created_at", { ascending: false }).limit(60),
      supabase.from("wins").select("text").order("created_at", { ascending: false }).limit(8),
    ]);
    if (ideasRes.error) return dbFail(ideasRes.error);
    if (winsRes.error) return dbFail(winsRes.error);
    recentTitles = (ideasRes.data || []).map((r) => r.title);
    wins = (winsRes.data || []).map((r) => r.text);
  }

  const angle = pick(ANGLES);
  const seed = pick(SEEDS);
  const { text, error } = await askAIFull(
    IDEA_SYSTEM,
    ideaRequest({ angle, seed, context: creatorContext({ recentTitles, wins }) }),
    { json: true }
  );

  const parsed = parseJSON(text);
  const taken = new Set(recentTitles.map(norm));
  let idea = null;
  let source = "built-in";
  let reason = error;

  if (parsed?.title && parsed?.hook && parsed?.concept) {
    if (taken.has(norm(parsed.title))) {
      reason = "The AI repeated an earlier idea, so the built-in version was used.";
    } else {
      idea = {
        title: String(parsed.title),
        angle: ANGLES.includes(parsed.angle) ? parsed.angle : angle,
        hook: String(parsed.hook),
        concept: String(parsed.concept),
        mood: String(parsed.mood || moodFor(angle)),
        whyItSuits: parsed.whyItSuits ? String(parsed.whyItSuits) : "",
        seed,
      };
      source = "ai";
      reason = null;
    }
  } else if (!error) {
    reason = "The AI reply was not in the expected format, so the built-in version was used.";
  }

  if (!idea) idea = generateIdea({ avoid: recentTitles });

  if (supabase) {
    const { error: insertError } = await supabase
      .from("ideas")
      .insert({ title: idea.title, angle: idea.angle, status: "seen", data: idea });
    if (insertError) return dbFail(insertError);
  }

  return NextResponse.json({ idea, source, reason, remembered: Boolean(supabase) });
}
