"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [idea, setIdea] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function getIdea() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/ideas", { method: "POST" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not get an idea.");
      setIdea(d.idea);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    try {
      const r = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save.");
      setMsg("Saved to My Studio.");
    } catch (e) {
      setMsg(e.message);
    }
  }

  const makeHref = idea
    ? `/create?${new URLSearchParams({
        title: idea.title,
        concept: idea.concept || "",
        angle: idea.angle || "Relatable",
        mood: idea.mood || "",
      }).toString()}`
    : "/create";

  return (
    <>
      <h1>MUSE</h1>
      <p className="tag">Your ideas deserve to be created.</p>

      <button className="btn" onClick={getIdea} disabled={busy}>
        {busy ? "Thinking..." : idea ? "Another one" : "Get an idea"}
      </button>

      {idea && (
        <div className="card">
          <p className="label">{idea.angle}</p>
          <h2 style={{ marginTop: 0 }}>{idea.title}</h2>
          <p><strong>Opening shot:</strong> {idea.hook}</p>
          <p>{idea.concept}</p>
          <p className="muted"><strong>Mood:</strong> {idea.mood}</p>
          <div className="row">
            <button className="btn ghost small" onClick={save}>Save</button>
            <Link className="btn small" href={makeHref}>Make it</Link>
          </div>
        </div>
      )}

      {msg && <p className="msg">{msg}</p>}
    </>
  );
}
