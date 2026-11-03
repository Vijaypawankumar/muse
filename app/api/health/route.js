import { NextResponse } from "next/server";
import { db, configProblem, supabaseUrl, translateDbError } from "@/lib/db";

export const dynamic = "force-dynamic";

// Open /api/health in the browser to see exactly what is wrong. Never shows secret keys.
export async function GET() {
  const problem = configProblem();
  if (problem) {
    return NextResponse.json({ ok: false, step: "settings", message: problem }, { status: 503 });
  }

  const supabase = db();
  const { count, error } = await supabase
    .from("ideas")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json(
      { ok: false, step: "tables", message: translateDbError(error.message) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    step: "done",
    message: `Connected to ${supabaseUrl()}. Your saved ideas will be stored.`,
    savedIdeas: count ?? 0,
  });
}
