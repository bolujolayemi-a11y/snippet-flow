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
- Explain performance issues clearly
- Explain code transformations clearly
- Be tailored to the detected programming language

GENERAL RULES:
- Detect the programming language from the code automatically
- Adapt explanations to the language context
- Follow the provided refactor plan strictly
- Avoid irrelevant suggestions outside the plan

CRITICAL RULES:
- Do NOT include markdown backticks
- Do NOT add introductory or closing text
- Return ONLY the JSON object
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

// ======================
// String Normalization
// ======================
const normalizeString = (value, fallback = "UNKNOWN") => {
  if (value === null || value === undefined) return fallback;

  const cleaned = String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!cleaned || ["none", "null", "nan", "undefined"].includes(cleaned)) {
    return fallback;
  }

  return cleaned;
};

// ======================
// Number Normalization
// ======================
const normalizeNumber = (value) => {
  if (value === null || value === undefined) return null;

  const lower = String(value).trim().toLowerCase();

  if (numberWords[lower] !== undefined) {
    return numberWords[lower];
  }

  const cleaned = lower.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);

  return Number.isNaN(parsed) ? null : parsed;
};

// ======================
// Date Validation
// ======================
const normalizeDate = (value) => {
  if (!value) return null;

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

// ======================
// CACHE
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
    console.warn("Cache write failed:", err.message);
  }
};

// ======================
// Schema Validation
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
// Retry Utility
// ======================
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await delay(1000 * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

// ======================
// Timeout Wrapper
// ======================
async function withTimeout(promiseFactory, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
};

// ======================
// 🔥 SEMANTIC LAYER (ADDED - SAFE)
// ======================
function analyzeSemantics(code) {
  return {
    hasVar: /\bvar\b/.test(code),
    globalLeak: /^\s*[a-zA-Z_$][\w$]*\s*=/.test(code),
    duplicateFunctions: /(function\s+\w+)[\s\S]*\1/.test(code),
    looseEquality: /==[^=]/.test(code),
    mutationRisk: /\[\w+\]\s*=/.test(code),
  };
}

function buildRefactorPlan(analysis) {
  const plan = [];

  if (analysis.hasVar) plan.push("use_const_let");
  if (analysis.globalLeak) plan.push("remove_global_pollution");
  if (analysis.duplicateFunctions) plan.push("resolve_function_shadowing");
  if (analysis.looseEquality) plan.push("enforce_strict_equality");
  if (analysis.mutationRisk) plan.push("avoid_mutation_in_loops");

  return plan;
}

// ======================
// MAIN REFINER
// ======================
export const refineSnippetWithFailover = async (currentCode) => {
  if (!currentCode) return;

  const codeString =
    typeof currentCode === "string"
      ? currentCode
      : currentCode.code || String(currentCode);

  // 🔥 SEMANTIC ANALYSIS ADDED
  const semanticAnalysis = analyzeSemantics(codeString);
  const refactorPlan = buildRefactorPlan(semanticAnalysis);

  const cacheKey = await getHash(
    codeString + SYSTEM_PROMPT + JSON.stringify(refactorPlan)
  );

  const cached = getCachedResult(cacheKey);
  if (cached) {
    console.log("⚡ Returning cached refinement");
    return cached;
  }

  try {
    const result = await withRetry(() =>
      routeToAI(codeString, "groq", semanticAnalysis, refactorPlan)
    );

    if (validateAIResponse(result)) {
      setCachedResult(cacheKey, result);
      return result;
    }

    throw new Error("Invalid Groq response");
  } catch (err) {
    console.warn("⚠️ Groq failed. Switching fallback...");
  }

  try {
    const result = await withRetry(() =>
      routeToAI(codeString, "huggingface", semanticAnalysis, refactorPlan)
    );

    if (validateAIResponse(result)) {
      setCachedResult(cacheKey, result);
      return result;
    }

    throw new Error("Invalid fallback response");
  } catch (err) {
    throw new Error("Snippet refinement service is temporarily unavailable.");
  }
};

export { refineSnippetWithFailover as refineSnippet };

// ======================
// AI ROUTER
// ======================
async function routeToAI(code, provider, semanticAnalysis, refactorPlan) {
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
          semanticAnalysis,
          refactorPlan, // 🔥 NEW
        }),
      }
    );

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      const rawText = await response.text();
      throw new Error(`Invalid response from ${provider}`);
    }

    let data = await response.json();

    if (Array.isArray(data)) {
      data = data[0]?.generated_text || data[0];
    }

    if (typeof data === "string") {
      const start = data.indexOf("{");
      const end = data.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        data = JSON.parse(data.slice(start, end + 1));
      }
    }

    if (!validateAIResponse(data)) {
      throw new Error(`Invalid schema from ${provider}`);
    }

    return data;
  });
}