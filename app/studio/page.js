"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_LABELS = { saved: "Saved", drafting: "Drafting", posted: "Posted" };

export default function Studio() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/studio");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Could not load.");
      setItems(d.items || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(id, status) {
    await fetch("/api/studio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setItems((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  async function remove(id) {
    await fetch(`/api/studio?id=${id}`, { method: "DELETE" });
    setItems((list) => list.filter((x) => x.id !== id));
  }

  return (
    <>
      <h1>My Studio</h1>
      <p className="tag">Ideas you chose to keep, and what you have done with them.</p>

      {msg && <p className="msg">{msg}</p>}
      {loaded && items.length === 0 && !msg && (
        <p className="muted">Nothing saved yet. Save an idea from Home and it will wait here.</p>
      )}

      {items.map((item) => (
        <div className="card" key={item.id}>
          <div className="spread">
            <p className="label" style={{ margin: 0 }}>{item.angle || "Idea"}</p>
            <span className="muted">{new Date(item.created_at).toLocaleDateString()}</span>
          </div>
          <h2 style={{ marginTop: 8 }}>{item.title}</h2>
          <select
            value={item.status}
            onChange={(e) => changeStatus(item.id, e.target.value)}
            style={{ marginTop: 6 }}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <div className="row">
            <Link className="btn small" href={`/create?title=${encodeURIComponent(item.title)}&angle=${encodeURIComponent(item.angle || "Relatable")}`}>
              Open in Director
            </Link>
            <button className="btn ghost small" onClick={() => remove(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );
}
