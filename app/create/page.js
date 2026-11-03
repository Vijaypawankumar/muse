"use client";

import { useEffect, useState } from "react";

export default function Create() {
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState({ title: "", angle: "Relatable", concept: "", mood: "" });
  const [card, setCard] = useState(null);
  const [source, setSource] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [frames, setFrames] = useState([]);
  const [frameInfo, setFrameInfo] = useState("");
  const [boarding, setBoarding] = useState(false);
  const [seed, setSeed] = useState(null);

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
      setFrames([]);
      setFrameInfo("");
      setSource(d.source);
      setReason(d.reason || "");
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

  async function makeStoryboard(newSeed) {
    if (!card) return;
    setBoarding(true);
    setFrameInfo("");
    try {
      const r = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text.trim(),
          scenes: card.scenes,
          seed: newSeed ?? seed ?? undefined,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not make the storyboard.");
      setFrames(d.frames || []);
      setSeed(d.seed);
      const drawn = (d.frames || []).filter((f) => f.from === "gemini").length;
      const total = (d.frames || []).length;
      setFrameInfo(
        [
          d.source === "ai"
            ? `Frames made from your scenes, with the same character in each.`
            : `Simple frames. ${d.reason || ""}`,
          `Pictures drawn by Gemini: ${drawn} of ${total}.`,
          d.pictureNote || "",
        ]
          .filter(Boolean)
          .join(" ")
      );
    } catch (e) {
      setFrameInfo(e.message);
    } finally {
      setBoarding(false);
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
            {source === "ai"
              ? "Written by AI, planned around your exact idea."
              : `Built-in plan. ${reason || "AI is not connected yet."}`}
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

          <div className="card">
            <p className="label">Storyboard</p>
            <p className="muted" style={{ marginTop: 0 }}>
              One picture for each scene, so you can see the shots before you film. Shoot to match them.
            </p>
            <div className="row" style={{ marginTop: 10 }}>
              <button className="btn" onClick={() => makeStoryboard()} disabled={boarding}>
                {boarding ? "Drawing frames..." : frames.length ? "Make new frames" : "Make storyboard"}
              </button>
              {frames.length > 0 && (
                <button className="btn ghost small" onClick={() => makeStoryboard(Math.floor(Math.random() * 100000))} disabled={boarding}>
                  Try another look
                </button>
              )}
            </div>
            {frameInfo && <p className="muted" style={{ marginTop: 12 }}>{frameInfo}</p>}
            {frames.length > 0 && (
              <div className="frames">
                {frames.map((f, i) => (
                  <div className="frame" key={i}>
                    <div className="frame-img">
                      <img
                        src={f.url}
                        alt={`Scene ${i + 1}: ${f.visual}`}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      {f.text && <div className="overlay">{f.text}</div>}
                    </div>
                    <div className="frame-caption">
                      <span className="time">Scene {i + 1} · {f.time}</span>
                      {f.visual}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="row">
            <button className="btn ghost" onClick={save}>Save to My Studio</button>
          </div>
        </>
      )}
    </>
  );
}
