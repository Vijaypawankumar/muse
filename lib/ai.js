// Free AI via Google Gemini (Google AI Studio free tier).
// Returns { text, error } so the app can show WHY AI is not being used.

const TEXT_FALLBACKS = ["gemini-2.5-flash", "gemini-2.0-flash"];

function clean(value) {
  return (value || "").trim().replace(/^["']+|["']+$/g, "").trim();
}

function geminiKey() {
  return clean(process.env.GEMINI_API_KEY);
}

export function aiConfigured() {
  return Boolean(geminiKey());
}

// Accepts "gemini-2.5-flash", "models/gemini-2.5-flash", quotes or spaces around it.
export function cleanModelName(value) {
  return clean(value).replace(/^models\//i, "");
}

function textModels() {
  const chosen = cleanModelName(process.env.GEMINI_MODEL);
  return [...new Set([chosen, ...TEXT_FALLBACKS].filter(Boolean))];
}

export function imageModel() {
  return cleanModelName(process.env.GEMINI_IMAGE_MODEL) || "gemini-2.5-flash-image";
}

function friendly(status, body = "") {
  if (status === 400 && /api key not valid|API_KEY_INVALID/i.test(body)) {
    return "Gemini says the key is not valid. Create a new key at aistudio.google.com/apikey and update GEMINI_API_KEY in Vercel.";
  }
  if (status === 403) {
    return "Gemini refused the key (403). Create a fresh key at aistudio.google.com/apikey and update GEMINI_API_KEY.";
  }
  if (status === 429) {
    return "Gemini's free limit was reached for now. Built-in version is showing until it resets.";
  }
  return `Gemini returned an error (${status}). Try again in a minute.`;
}

async function callGemini(model, payload) {
  return fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey() },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(25000),
    }
  );
}

export async function askAIFull(system, user, { json = false } = {}) {
  if (!geminiKey()) {
    return { text: null, error: "GEMINI_API_KEY is not set in Vercel yet, so the built-in version is showing." };
  }

  const generationConfig = { temperature: json ? 1.0 : 0.9, maxOutputTokens: 2048 };
  if (json) generationConfig.responseMimeType = "application/json";

  const tried = [];
  let res = null;

  for (const model of textModels()) {
    tried.push(model);
    const cfg = { ...generationConfig };
    // Gemini 2.5 models think before answering; turning that off keeps replies fast.
    if (model.includes("2.5")) cfg.thinkingConfig = { thinkingBudget: 0 };
    try {
      res = await callGemini(model, {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: cfg,
      });
    } catch (e) {
      const reason = e?.name === "TimeoutError" ? "took too long" : e?.message || "network error";
      return { text: null, error: `Could not reach Gemini (${reason}).` };
    }
    if (res.status !== 404) break;
  }

  if (res.status === 404) {
    const typed = clean(process.env.GEMINI_MODEL) || "(empty)";
    return {
      text: null,
      error: `Gemini did not recognise the model name you set ("${typed}"). Set GEMINI_MODEL to exactly: gemini-2.5-flash`,
    };
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

// Draws one picture with Gemini's image model. Returns a data URL, or an error message.
export async function geminiImage(prompt) {
  if (!geminiKey()) return { dataUrl: null, error: "GEMINI_API_KEY is not set." };
  try {
    const res = await callGemini(imageModel(), {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { dataUrl: null, error: friendly(res.status, body) };
    }
    const data = await res.json().catch(() => null);
    const part = data?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) return { dataUrl: null, error: "Gemini returned no picture for this scene." };
    const mime = part.inlineData.mimeType || "image/png";
    return { dataUrl: `data:${mime};base64,${part.inlineData.data}`, error: null };
  } catch (e) {
    return { dataUrl: null, error: `Could not reach Gemini for pictures (${e?.message || "network error"}).` };
  }
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
