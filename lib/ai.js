// Free AI via Google Gemini (Google AI Studio free tier).
// Returns { text, error } so the app can show WHY AI is not being used.

const DEFAULT_MODEL = "gemini-2.5-flash";

function geminiKey() {
  return (process.env.GEMINI_API_KEY || "").trim().replace(/^["']+|["']+$/g, "").trim();
}

export function aiConfigured() {
  return Boolean(geminiKey());
}

function friendly(status, body = "") {
  if (status === 400 && /api key not valid|API_KEY_INVALID/i.test(body)) {
    return "Gemini says the key is not valid. Create a new key at aistudio.google.com/apikey and update GEMINI_API_KEY in Vercel.";
  }
  if (status === 400 && /model|not found/i.test(body)) {
    return "The Gemini model name is wrong. Set GEMINI_MODEL to gemini-2.5-flash in Vercel.";
  }
  if (status === 403) {
    return "Gemini refused the key (403). Create a fresh key at aistudio.google.com/apikey and update GEMINI_API_KEY.";
  }
  if (status === 404) {
    return "Gemini could not find that model. Set GEMINI_MODEL to gemini-2.5-flash in Vercel.";
  }
  if (status === 429) {
    return "Gemini's free daily limit was reached. Built-in version is showing until it resets.";
  }
  return `Gemini returned an error (${status}). Try again in a minute.`;
}

export async function askAIFull(system, user, { json = false } = {}) {
  const key = geminiKey();
  if (!key) {
    return { text: null, error: "GEMINI_API_KEY is not set in Vercel yet, so the built-in version is showing." };
  }
  const model = (process.env.GEMINI_MODEL || DEFAULT_MODEL).trim();

  const generationConfig = {
    temperature: json ? 1.0 : 0.9,
    maxOutputTokens: 2048,
  };
  if (json) generationConfig.responseMimeType = "application/json";
  // Gemini 2.5 models think before answering; turning that off keeps replies fast and cheap.
  if (model.includes("2.5")) generationConfig.thinkingConfig = { thinkingBudget: 0 };

  let res;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig,
        }),
        signal: AbortSignal.timeout(25000),
      }
    );
  } catch (e) {
    const reason = e?.name === "TimeoutError" ? "took too long" : e?.message || "network error";
    return { text: null, error: `Could not reach Gemini (${reason}).` };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { text: null, error: friendly(res.status, body) };
  }

  const data = await res.json().catch(() => null);
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  if (!text) {
    return { text: null, error: "Gemini answered with nothing, possibly because its safety filter blocked the request." };
  }
  return { text, error: null };
}

export function parseJSON(text) {
  if (!text) return null;
  try {
    const cleaned = text.trim().replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}
