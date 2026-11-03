import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { askAIFull } from "@/lib/ai";
import { ruleReply } from "@/lib/assistant";
import { ASSISTANT_SYSTEM, assistantRequest, creatorContext } from "@/lib/prompts";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const situation = String(body.situation || "other");
  const message = String(body.message || "").trim().slice(0, 1000);

  let wins = [];
  let recentTitles = [];
  const supabase = db();
  if (supabase) {
    const [w, i] = await Promise.all([
      supabase.from("wins").select("text").order("created_at", { ascending: false }).limit(8),
      supabase.from("ideas").select("title").order("created_at", { ascending: false }).limit(10),
    ]);
    wins = (w.data || []).map((r) => r.text);
    recentTitles = (i.data || []).map((r) => r.title);
  }

  const { text, error } = await askAIFull(
    ASSISTANT_SYSTEM,
    assistantRequest({
      situation,
      message,
      context: creatorContext({ recentTitles, wins }),
    })
  );

  const rule = ruleReply(situation);
  return NextResponse.json({
    reply: text || rule.reply,
    action: rule.action,
    source: text ? "ai" : "built-in",
    reason: text ? null : error,
  });
}
