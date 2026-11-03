"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [idea, setIdea] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [setup, setSetup] = useState(null);

  // Check the database connection once, so problems show up on the first screen.
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setSetup(d))
      .catch(() => setSetup({ ok: false, message: "Could not reach the app's health check." }));
  }, []);

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
      <div className="brand">
        <span className="word">MUSE</span>
        <span className="dot">.</span>
      </div>
      <p className="tag">Your ideas deserve to be created.</p>

      {setup && !setup.ok && (
        <div className="banner">
          <strong>Setup needs one fix:</strong> {setup.message}
          <div style={{ marginTop: 6 }}>Open <a href="/api/health">/api/health</a> for details.</div>
        </div>
      )}
      {setup?.ok && <div className="banner good">{setup.message}</div>}

      <div className="card hero-card">
        {!idea ? (
          <>
            <p className="label">Today</p>
            <h2>Need a spark?</h2>
            <p className="muted">
              Get one reel idea that is small enough to shoot on your phone today.
            </p>
          </>
        ) : (
          <>
            <div className="spread">
              <span className="pill">{idea.angle}</span>
            </div>
            <h2 style={{ marginTop: 14 }}>{idea.title}</h2>
            <p className="label" style={{ marginTop: 18 }}>Opening shot</p>
            <p style={{ margin: "0 0 14px", lineHeight: 1.55 }}>{idea.hook}</p>
            <p className="label">The idea</p>
            <p style={{ margin: "0 0 14px", lineHeight: 1.55 }}>{idea.concept}</p>
            <p className="muted"><strong>Mood:</strong> {idea.mood}</p>
          </>
        )}

        <div className="row">
          <button className="btn" onClick={getIdea} disabled={busy}>
            {busy ? "Thinking..." : idea ? "Another one" : "Get an idea"}
          </button>
        </div>

        {idea && (
          <div className="row">
            <button className="btn ghost small" onClick={save}>Save</button>
            <Link className="btn small" href={makeHref}>Shoot it</Link>
          </div>
        )}
      </div>

      {msg && <p className="msg">{msg}</p>}
    </>
  );
}
