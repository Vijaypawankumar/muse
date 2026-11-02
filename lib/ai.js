// Optional free AI via Google Gemini's free tier. Returns null on any failure,
// so every feature falls back to the built-in rules.
export async function askAI(system, user, { json = false } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: json
            ? { responseMimeType: "application/json", temperature: 1 }
            : { temperature: 0.8 },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export function parseJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text
      .trim()
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
