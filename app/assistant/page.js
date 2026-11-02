"use client";

import { useState } from "react";
import Link from "next/link";

const SITUATIONS = [
  ["no_ideas", "I have no ideas"],
  ["no_execution", "I have an idea but can't execute it"],
  ["bad_reel", "My last reel looked bad"],
  ["alone", "I'm shooting alone today"],
  ["demotivated", "I feel like quitting"],
];

export default function Assistant() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(situation, label) {
    const message = label ?? text.trim();
    if (!message && !situation) return;
    setMessages((m) => [...m, { role: "me", text: message }]);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: situation || "other", message }),
      });
      const d = await r.json();
      setMessages((m) => [...m, { role: "assistant", text: d.reply || "Try again in a moment.", action: d.action }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Could not reach the assistant. Check your connection." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1>Assistant</h1>
      <p className="tag">Short, practical help. Pick what is true right now.</p>

      <div className="chips">
        {SITUATIONS.map(([key, label]) => (
          <button key={key} className="chip" disabled={busy} onClick={() => send(key, label)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "me" ? "me" : ""}`}>
            <div>{m.text}</div>
            {m.action && (
              <Link href={m.action.href} className="btn small" style={{ marginTop: 10 }}>
                {m.action.label}
              </Link>
            )}
          </div>
        ))}
        {busy && <p className="muted">Thinking...</p>}
      </div>

      <div className="row" style={{ marginTop: 14 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or describe what is going on"
          style={{ minHeight: 70 }}
        />
      </div>
      <div className="row">
        <button className="btn" disabled={busy || !text.trim()} onClick={() => send(null, text.trim())}>
          Send
        </button>
      </div>
    </>
  );
}
