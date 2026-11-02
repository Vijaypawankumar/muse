import { NextResponse } from "next/server";
import { askAI } from "@/lib/ai";
import { ruleReply } from "@/lib/assistant";

export const dynamic = "force-dynamic";

const SYSTEM = `You are the creative assistant inside MUSE, for a beginner Instagram Reels creator who shoots on an iPhone.
Rules:
- Reply in short, plain sentences. Under 120 words.
- Give practical steps. No motivational quotes.
- Do not compliment her or flatter her.
- If she asks for ideas, give one idea and one way to test it herself before the full breakdown.
- If she is discouraged, give one small, concrete action for today.
- Describe editing goals (trim, add text, cut on beat), not exact menu locations.`;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const situation = String(body.situation || "other");
  const message = String(body.message || "").trim().slice(0, 1000);

  const ai = await askAI(SYSTEM, `Situation: ${situation}\nHer message: ${message || "(none)"}`);
  const rule = ruleReply(situation);

  return NextResponse.json({
    reply: ai?.trim() || rule.reply,
    action: rule.action,
    source: ai ? "ai" : "built-in",
  });
}
