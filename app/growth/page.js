"use client";

import { useEffect, useState } from "react";

export default function Growth() {
  const [wins, setWins] = useState([]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      const r = await fetch("/api/wins");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load.");
      setWins(d.items || []);
    } catch (e) {
      setMsg(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    const value = text.trim();
    if (!value) return;
    try {
      const r = await fetch("/api/wins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not save.");
      setWins((list) => [d.item, ...list]);
      setText("");
      setMsg("");
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function remove(id) {
    await fetch(`/api/wins?id=${id}`, { method: "DELETE" });
    setWins((list) => list.filter((w) => w.id !== id));
  }

  return (
    <>
      <h1>Growth</h1>
      <p className="tag">Your wins, in your own words. There is no streak and no missed-day count.</p>

      <div className="card">
        <p className="label">Add a win</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Finished a reel. The storytelling one got more saves than usual."
          style={{ minHeight: 80 }}
        />
        <div className="row">
          <button className="btn" onClick={add} disabled={!text.trim()}>Save win</button>
        </div>
        {msg && <p className="msg">{msg}</p>}
      </div>

      {wins.map((w) => (
        <div className="card" key={w.id}>
          <p style={{ margin: 0 }}>{w.text}</p>
          <div className="spread" style={{ marginTop: 10 }}>
            <span className="muted">{new Date(w.created_at).toLocaleDateString()}</span>
            <button className="btn ghost small" onClick={() => remove(w.id)}>Remove</button>
          </div>
        </div>
      ))}
    </>
  );
}
