// Server-only Supabase access. Imported by API routes, never by browser code.
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

let client = null;

// Returns a Supabase client, or null if the environment variables are not set yet.
// The app still works without storage: ideas are generated but not remembered.
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) {
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export function noDb() {
  return NextResponse.json(
    { error: "Storage is not connected yet. Follow the Supabase steps in README.md." },
    { status: 503 }
  );
}

export function dbFail(error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
