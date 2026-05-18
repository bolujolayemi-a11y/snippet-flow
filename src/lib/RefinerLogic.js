import { supabase } from "./supabase";

// ======================
// SHA-256 Cache Key
// ======================
const getHash = async (str) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// ======================
// Config
// ======================
const CACHE_TTL = 1000 * 60 * 60 * 24;
const MAX_RETRIES = 2;
const REQUEST_TIMEOUT = 15000;

// ======================
// System Prompt
// ======================
const SYSTEM_PROMPT = `
Return ONLY a valid JSON object:
{
  "refinedCode": "...",
  "suggestedTitle": "...",
  "explanation": "..."
}

The explanation MUST:
- Use Markdown formatting
- Use ### headers
- Use bullet points
- Explain performance issues
- Explain code transformations
- Mention data cleaning improvements

FOR DATA CLEANING:
- Convert number words like "thirty" into numeric values where appropriate
- Use errors='coerce' for safe numeric/date parsing
- Preserve semantic meaning of missing values
- Validate emails where possible
- Normalize casing and whitespace
- Avoid replacing all missing values with 0 globally
- Use vectorized pandas operations
- Preserve valid dates instead of destroying entire columns

CRITICAL:
- No markdown backticks
- No introductory text
- Return ONLY JSON
`;

// ======================
// Number Words
// ======================
const numberWords = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

// ======================
// Email Validation
// ======================
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email).trim()
  );
};

// ======================
// String Normalization
// ======================
const normalizeString = (
  value,
  fallback = "UNKNOWN"
) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  const cleaned = String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (
    !cleaned ||
    ["none", "null", "nan", "undefined"].includes(
      cleaned
    )
  ) {
    return fallback;
  }

  return cleaned;
};

// ======================
// Number Normalization
// ======================
const normalizeNumber = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const lower = String(value)
    .trim()
    .toLowerCase();

  // word number support
  if (numberWords[lower] !== undefined) {
    return numberWords[lower];
  }

  // remove currency/symbols
  const cleaned = lower.replace(
    /[^0-9.-]/g,
    ""
  );

  const parsed = parseFloat(cleaned);

  return Number.isNaN(parsed)
    ? null
    : parsed;
};

// ======================
// Date Validation
// ======================
const normalizeDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);

  return isNaN(parsed.getTime())
    ? null
    : parsed.toISOString();
};

// ======================
// Cache Helpers
// ======================
const getCachedResult = (key) => {
  try {
    const cached =
      localStorage.getItem(key);

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
        expiry:
          Date.now() + CACHE_TTL,
        data,
      })
    );
  } catch (err) {
    console.warn(
      "Cache write failed:",
      err.message
    );
  }
};

// ======================
// Schema Validation
// ======================
const validateAIResponse = (
  result
) => {
  return (
    result &&
    typeof result === "object" &&
    typeof result.refinedCode ===
      "string" &&
    result.refinedCode.trim()
      .length > 0 &&
    typeof result.suggestedTitle ===
      "string" &&
    typeof result.explanation ===
      "string"
  );
};

// ======================
// Retry Utility
// ======================
const delay = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms)
  );

async function withRetry(
  fn,
  retries = MAX_RETRIES
) {
  let lastError;

  for (
    let attempt = 0;
    attempt <= retries;
    attempt++
  ) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt < retries) {
        const waitTime =
          1000 *
          Math.pow(2, attempt);

        console.warn(
          `Retry ${
            attempt + 1
          }/${retries} after ${waitTime}ms`
        );

        await delay(waitTime);
      }
    }
  }

  throw lastError;
}

// ======================
// Timeout Wrapper
// ======================
async function withTimeout(
  promiseFactory,
  timeout = REQUEST_TIMEOUT
) {
  const controller =
    new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeout
  );

  try {
    return await promiseFactory(
      controller.signal
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ======================
// Main Refiner
// ======================
export const refineSnippetWithFailover =
  async (currentCode) => {
    if (!currentCode) return;

    const codeString =
      typeof currentCode ===
      "string"
        ? currentCode
        : currentCode.code ||
          String(currentCode);

    const cacheKey = `sf_cache_${await getHash(
      codeString
    )}`;

    // ======================
    // Cache Check
    // ======================
    const cached =
      getCachedResult(cacheKey);

    if (cached) {
      console.log(
        "⚡ Returning cached refinement"
      );
      return cached;
    }

    // ======================
    // Primary Provider
    // ======================
    try {
      console.log(
        "📡 Calling Groq..."
      );

      const result =
        await withRetry(() =>
          routeToAI(
            codeString,
            "groq"
          )
        );

      if (
        validateAIResponse(result)
      ) {
        setCachedResult(
          cacheKey,
          result
        );

        return result;
      }

      throw new Error(
        "Invalid Groq response"
      );
    } catch (err) {
      console.warn(
        "⚠️ Groq failed. Switching fallback..."
      );
    }

    // ======================
    // Fallback Provider
    // ======================
    try {
      const result =
        await withRetry(() =>
          routeToAI(
            codeString,
            "huggingface"
          )
        );

      if (
        validateAIResponse(result)
      ) {
        setCachedResult(
          cacheKey,
          result
        );

        return result;
      }

      throw new Error(
        "Invalid fallback response"
      );
    } catch (err) {
      console.error(
        "❌ Both providers failed"
      );

      throw new Error(
        "Snippet refinement service is temporarily unavailable."
      );
    }
  };

export {
  refineSnippetWithFailover as refineSnippet,
};

// ======================
// AI Router
// ======================
async function routeToAI(
  code,
  provider
) {
  return withTimeout(
    async (signal) => {
      const response =
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`,
          {
            method: "POST",
            signal,
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              code,
              action: "refine",
              provider,
              prompt:
                SYSTEM_PROMPT,
            }),
          }
        );

      // ======================
      // Content-Type Validation
      // ======================
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType ||
        !contentType.includes(
          "application/json"
        )
      ) {
        const rawText =
          await response.text();

        console.error(
          "Non-JSON response:",
          rawText.substring(
            0,
            200
          )
        );

        throw new Error(
          `Invalid response from ${provider}`
        );
      }

      let data =
        await response.json();

      if (data?.error) {
        throw new Error(
          data.error
        );
      }

      // ======================
      // HF Array Support
      // ======================
      if (Array.isArray(data)) {
        data =
          data[0]
            ?.generated_text ||
          data[0];
      }

      // ======================
      // Safe JSON Extraction
      // ======================
      if (
        typeof data ===
        "string"
      ) {
        data = data
          .replace(
            /```json/g,
            ""
          )
          .replace(/```/g, "")
          .trim();

        const firstBrace =
          data.indexOf("{");

        const lastBrace =
          data.lastIndexOf(
            "}"
          );

        if (
          firstBrace !== -1 &&
          lastBrace !== -1
        ) {
          const jsonString =
            data.slice(
              firstBrace,
              lastBrace + 1
            );

          try {
            data =
              JSON.parse(
                jsonString
              );
          } catch {
            throw new Error(
              "Malformed AI JSON response"
            );
          }
        }
      }

      // ======================
      // Final Schema Validation
      // ======================
      if (
        !validateAIResponse(
          data
        )
      ) {
        throw new Error(
          `Invalid schema from ${provider}`
        );
      }

      return data;
    }
  );
}