// Server-only Supabase access. Imported by API routes, never by browser code.
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

let client = null;

// Read an env var and remove the stray spaces and quote marks people often paste with it.
function clean(name) {
  return (process.env[name] || "").trim().replace(/^["']+|["']+$/g, "").trim();
}

// Returns just the web address (https://xxxx.supabase.co), even if a longer path was pasted.
export function supabaseUrl() {
  let raw = clean("SUPABASE_URL");
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

// Reads the role inside a legacy JWT key ("anon" or "service_role") without any extra package.
function jwtRole(key) {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload.role || null;
  } catch {
    return null;
  }
}

// Returns a plain-English problem with the setup, or null when everything looks right.
export function configProblem() {
  if (!clean("SUPABASE_URL")) {
    return "SUPABASE_URL is missing. Add it in Vercel: Settings → Environment Variables.";
  }
  if (!supabaseUrl()) {
    return "SUPABASE_URL is not a valid address. It must look like https://xpefaztgozmnoluylclh.supabase.co";
  }
  const key = clean("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) {
    return "SUPABASE_SERVICE_ROLE_KEY is missing. Add the secret (service_role) key in Vercel: Settings → Environment Variables.";
  }
  if (key.startsWith("sb_publishable_")) {
    return "You pasted the publishable key. Use the secret key (it starts with sb_secret_) or the service_role key instead.";
  }
  if (jwtRole(key) === "anon") {
    return "You pasted the anon key. Use the service_role key instead.";
  }
  return null;
}

// Returns a Supabase client, or null if the setup has a problem.
export function db() {
  if (configProblem()) return null;
  if (!client) {
    client = createClient(supabaseUrl(), clean("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false },
    });
  }
  return client;
}

// Turns raw Supabase errors into messages a non-developer can act on.
export function translateDbError(message = "") {
  if (/fetch failed|network|enotfound|econnrefused|timed? ?out/i.test(message)) {
    return "Could not reach Supabase. Check your internet connection, then open /api/health again.";
  }
  if (/invalid path/i.test(message)) {
    return "Supabase could not use the address in SUPABASE_URL. Check it in Vercel (no extra text, must start with https://).";
  }
  if (/invalid api key|jwt|apikey/i.test(message)) {
    return "The Supabase key was rejected. Copy the secret (service_role) key again from Supabase.";
  }
  if (/does not exist|could not find the table|schema cache/i.test(message)) {
    return "The database tables are missing. Run supabase/schema.sql in the Supabase SQL Editor.";
  }
  return message || "Database error.";
}

export function noDb() {
  return NextResponse.json({ error: configProblem() || "Storage is not connected." }, { status: 503 });
}

export function dbFail(error) {
  return NextResponse.json({ error: translateDbError(error?.message) }, { status: 500 });
}
