import { NextResponse } from "next/server";
import { db, configProblem, supabaseUrl, translateDbError } from "@/lib/db";
import { aiConfigured, askAIFull } from "@/lib/ai";

export const dynamic = "force-dynamic";

// GET /api/health        → checks the database and reports whether AI is configured (free, no AI call)
// GET /api/health?ai=1   → also sends one tiny test request to Gemini to prove the key works
export async function GET(request) {
  const testAI = new URL(request.url).searchParams.get("ai") === "1";
  const ai = { configured: aiConfigured(), working: null, message: "" };

  if (!ai.configured) {
    ai.message = "GEMINI_API_KEY is not set. The app uses built-in ideas.";
  } else if (testAI) {
    const r = await askAIFull("Reply with exactly one word: OK", "ping");
    ai.working = Boolean(r.text);
    ai.message = r.text ? "AI is working." : r.error;
  }

  const problem = configProblem();
  if (problem) {
    return NextResponse.json({ ok: false, step: "settings", message: problem, ai }, { status: 503 });
  }

  const { count, error } = await db()
    .from("ideas")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, step: "tables", message: translateDbError(error.message), ai },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    step: "done",
    message: `Connected to ${supabaseUrl()}. Your saved ideas will be stored.`,
    savedIdeas: count ?? 0,
    ai,
  });
}
