import { NextResponse } from "next/server";
import { db, noDb, dbFail } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = db();
  if (!supabase) return noDb();
  const { data, error } = await supabase
    .from("wins")
    .select("id, text, created_at")
    .order("created_at", { ascending: false });
  if (error) return dbFail(error);
  return NextResponse.json({ items: data });
}

export async function POST(request) {
  const supabase = db();
  if (!supabase) return noDb();
  const body = await request.json().catch(() => ({}));
  const text = String(body.text || "").trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: "Write a win first." }, { status: 400 });
  const { data, error } = await supabase
    .from("wins")
    .insert({ text })
    .select()
    .single();
  if (error) return dbFail(error);
  return NextResponse.json({ item: data });
}

export async function DELETE(request) {
  const supabase = db();
  if (!supabase) return noDb();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const { error } = await supabase.from("wins").delete().eq("id", id);
  if (error) return dbFail(error);
  return NextResponse.json({ ok: true });
}
