import { NextResponse } from "next/server";
import { db, noDb, dbFail } from "@/lib/db";

export const dynamic = "force-dynamic";

const STUDIO_STATUSES = ["saved", "drafting", "posted"];

export async function GET() {
  const supabase = db();
  if (!supabase) return noDb();
  const { data, error } = await supabase
    .from("ideas")
    .select("id, title, angle, status, data, created_at")
    .in("status", STUDIO_STATUSES)
    .order("created_at", { ascending: false });
  if (error) return dbFail(error);
  return NextResponse.json({ items: data });
}

export async function POST(request) {
  const supabase = db();
  if (!supabase) return noDb();
  const body = await request.json().catch(() => ({}));
  const idea = body.idea;
  if (!idea?.title) {
    return NextResponse.json({ error: "Missing idea." }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      title: String(idea.title).slice(0, 200),
      angle: idea.angle || null,
      status: "saved",
      data: idea,
    })
    .select()
    .single();
  if (error) return dbFail(error);
  return NextResponse.json({ item: data });
}

export async function PATCH(request) {
  const supabase = db();
  if (!supabase) return noDb();
  const body = await request.json().catch(() => ({}));
  if (!body.id || !STUDIO_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }
  const { error } = await supabase
    .from("ideas")
    .update({ status: body.status })
    .eq("id", body.id);
  if (error) return dbFail(error);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request) {
  const supabase = db();
  if (!supabase) return noDb();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) return dbFail(error);
  return NextResponse.json({ ok: true });
}
