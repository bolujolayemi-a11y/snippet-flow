import { supabase } from "./supabase";

// ======================
// SHA-256 Cache Key
// ======================
const getHash = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// ======================
// Config
// ======================
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 15000;

// ======================
// System Prompt
// ======================
const SYSTEM_PROMPT = `
Return ONLY a valid JSON object:
{ "refinedCode": "...", "suggestedTitle": "...", "explanation": "..." }

The explanation MUST be Markdown formatted with:
- ### sections
- bullet points
- clear technical reasoning

CRITICAL:
- No backticks
- No extra text
- Return ONLY JSON
`;

// ======================
// Basic Data Normalization Layer
// ======================

// convert word numbers → digits (light version)
const numberWords = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  ten: 10,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
};

// email validation
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));

// normalize strings
const normalizeString = (value, fallback = "UNKNOWN") => {
  if (value === null || value === undefined) return fallback;

  const str = String(value)
    .trim()
    .toLowerCase()
    .replace(/^\s*$/, "");

  if (!str || ["none", "nan", "null", "0", ""].includes(str)) {
    return fallback;
  }

  return str;
};

// normalize numbers
const normalizeNumber = (value) => {
  if (value === null || value === undefined) return null;

  const lower = String(value).toLowerCase().trim();

  if (numberWords[lower] !== undefined) {
    return numberWords[lower];
  }

  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const num = parseFloat(cleaned);

  return isNaN(num) ? null : num;
};

// ======================
// Cache Layer (with TTL)
// ======================
const getCachedResult = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached);

    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
};

const setCachedResult = (key, data) => {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        expiry: Date.now() + CACHE_TTL,
        data,
      })
    );
  } catch (err) {
    console.warn("Cache error:", err.message);
  }
};

// ======================
// Validation
// ======================
const validateAIResponse = (result) => {
  return (
    result &&
    typeof result === "object" &&
    typeof result.refinedCode === "string" &&
    typeof result.suggestedTitle === "string" &&
    typeof result.explanation === "string"
  );
};

// ======================
// Retry + Backoff
// ======================
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, retries = MAX_RETRIES) {
  let error;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      error = e;

      if (i < retries) {
        const wait = 1000 * Math.pow(2, i);
        await delay(wait);
      }
    }
  }

  throw error;
}

// ======================
// Timeout Wrapper
// ======================
async function withTimeout(promise, ms = REQUEST_TIMEOUT) {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    const result = await promise(controller.signal);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

// ======================
// MAIN FUNCTION
// ======================
export const refineSnippetWithFailover = async (currentCode) => {
  if (!currentCode) return;

  const codeString =
    typeof currentCode === "string"
      ? currentCode
      : currentCode.code || String(currentCode);

  const cacheKey = `sf_cache_${await getHash(codeString)}`;

  // cache check
  const cached = getCachedResult(cacheKey);
  if (cached) return cached;

  try {
    const result = await withRetry(() =>
      routeToAI(codeString, "groq")
    );

    if (validateAIResponse(result)) {
      setCachedResult(cacheKey, result);
      return result;
    }

    throw new Error("Invalid Groq response");
  } catch (e) {
    console.warn("Groq failed, switching fallback...");
  }

  try {
    const result = await withRetry(() =>
      routeToAI(codeString, "huggingface")
    );

    if (validateAIResponse(result)) {
      setCachedResult(cacheKey, result);
      return result;
    }

    throw new Error("Invalid fallback response");
  } catch (e) {
    throw new Error("Both AI providers failed.");
  }
};

export { refineSnippetWithFailover as refineSnippet };

// ======================
// AI ROUTER
// ======================
async function routeToAI(code, provider) {
  return withTimeout(async (signal) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          code,
          action: "refine",
          provider,
          prompt: SYSTEM_PROMPT,
        }),
      }
    );

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      throw new Error("Non-JSON response from server");
    }

    let data = await response.json();

    if (data?.error) throw new Error(data.error);

    // HF array handling
    if (Array.isArray(data)) {
      data = data[0]?.generated_text || data[0];
    }

    // safe JSON extraction
    if (typeof data === "string") {
      const start = data.indexOf("{");
      const end = data.lastIndexOf("}");

      if (start !== -1 && end !== -1) {
        data = JSON.parse(data.slice(start, end + 1));
      }
    }

    if (!validateAIResponse(data)) {
      throw new Error("Invalid AI schema");
    }

    return data;
  });
}