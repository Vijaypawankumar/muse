"use client";

import { useEffect, useState } from "react";

export default function Create() {
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState({ title: "", angle: "Relatable", concept: "", mood: "" });
  const [card, setCard] = useState(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Read ?title=&concept=&angle=&mood= from the Home page without a Suspense boundary.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const title = p.get("title") || "";
    setText(title);
    setCtx({
      title,
      angle: p.get("angle") || "Relatable",
      concept: p.get("concept") || "",
      mood: p.get("mood") || "",
    });
  }, []);

  async function build() {
    const idea = text.trim();
    if (!idea) {
      setMsg("Describe the idea in one line first.");
      return;
    }
    setBusy(true);
    setMsg("");
    const fromHome = idea === ctx.title;
    try {
      const r = await fetch("/api/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea,
          concept: fromHome ? ctx.concept : "",
          angle: ctx.angle,
          mood: fromHome ? ctx.mood : "",
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Something went wrong.");
      setCard(d.card);
      setSource(d.source);
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
        body: JSON.stringify({
          idea: { title: text.trim(), angle: ctx.angle, concept: card?.note || "", mood: card?.mood || "" },
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save.");
      setMsg("Saved to My Studio.");
    } catch (e) {
      setMsg(e.message);
    }
  }

  const list = (x) => (Array.isArray(x) ? x : []);

  return (
    <>
      <h1>Reel Director</h1>
      <p className="tag">Turn one idea into a shoot plan you can follow on your phone.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Spending a Sunday alone, with the curtains open"
      />
      <div className="row">
        <button className="btn" onClick={build} disabled={busy}>
          {busy ? "Directing..." : "Build my shoot plan"}
        </button>
      </div>

      {msg && <p className="msg">{msg}</p>}

      {card && (
        <>
          <p className="muted" style={{ marginTop: 18 }}>
            {source === "ai" ? "Written by the AI director." : "Built-in director (no AI key set)."}
          </p>

          <div className="card">
            <p className="label">Opening options</p>
            <ol>{list(card.hooks).map((h, i) => <li key={i}>{h}</li>)}</ol>
          </div>

          <div className="card">
            <p className="label">Scenes</p>
            {list(card.scenes).map((s, i) => (
              <div className="scene" key={i}>
                <div className="muted">{s.time}</div>
                <div>
                  <div>{s.visual}</div>
                  {s.text && <div className="muted">Text: {s.text}</div>}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <p className="label">Camera</p>
            {Array.isArray(card.camera) ? (
              <ul>{card.camera.map((c, i) => <li key={i}>{c}</li>)}</ul>
            ) : (
              <p>{card.camera}</p>
            )}
            <p className="label" style={{ marginTop: 14 }}>Music and mood</p>
            <p>{card.mood}</p>
          </div>

          <div className="card">
            <p className="label">Edit recipe</p>
            <ol>{list(card.editSteps).map((s, i) => <li key={i}>{s}</li>)}</ol>
            <p className="label" style={{ marginTop: 14 }}>Which app</p>
            <p>{card.tools}</p>
          </div>

          <div className="card">
            <p className="label">Caption ideas</p>
            <ul>{list(card.captions).map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>

          <div className="row">
            <button className="btn ghost" onClick={save}>Save to My Studio</button>
          </div>
        </>
      )}
    </>
  );
}
