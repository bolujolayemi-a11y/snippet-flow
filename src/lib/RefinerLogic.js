import { supabase } from "./supabase";

// ============================================
// 1. IMPROVED CACHING SYSTEM
// ============================================
const getCacheKey = (str, language, mode = 'standard') => {
  let hash = 0;
  const combined = `${str}|${language}|${mode}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `sf_refine_${Math.abs(hash)}`;
};

const SYSTEM_PROMPT = `
Return ONLY a valid JSON object. No intro, no backticks.
{
  "refinedCode": "...",
  "suggestedTitle": "...",
  "explanation": "..."
}
Rules: 
1. Fix type mismatches & Pandas operation order (Types > Strings > fillna).
2. Replace deprecated methods (.append -> pd.concat).
3. Vectorize loops.
4. Use descriptive naming.
5. Explanation must use Markdown headers.
`;

// ============================================
// 3. ROBUST JSON EXTRACTION (The Fix)
// ============================================
const extractJSON = (rawText) => {
  if (typeof rawText !== 'string') return rawText;

  try {
    // Clean markdown and whitespace
    let cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Strategy: Find the first { and last }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned);
    if (parsed.refinedCode) return parsed;
  } catch (e) {
    console.error("JSON Extraction failed. Raw text:", rawText);
    throw new Error("Could not parse AI response as valid JSON");
  }
};

// ============================================
// 4. LANGUAGE DETECTION
// ============================================
const detectLanguage = (code) => {
  if (!code) return 'python';
  const c = code.toLowerCase();
  if (c.includes('import pandas') || c.includes('pd.')) return 'pandas';
  if (c.includes('def ') || c.includes('import os')) return 'python';
  if (c.includes('const ') || c.includes('let ') || c.includes('=>')) return 'javascript';
  if (c.includes('<div') || c.includes('<html')) return 'html';
  if (c.includes('{') && c.includes(':') && c.includes(';')) return 'css';
  return 'python';
};

// ============================================
// 5. MAIN REFINEMENT FUNCTION
// ============================================
export const refineSnippetWithFailover = async (currentCode, options = {}) => {
  if (!currentCode) return null;
  
  const codeString = typeof currentCode === 'string' ? currentCode : currentCode.code;
  const { language = 'auto', mode = 'standard' } = options;
  const detectedLanguage = language === 'auto' ? detectLanguage(codeString) : language;
  
  const cacheKey = getCacheKey(codeString, detectedLanguage, mode);

  // Check Cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  // Attempt Refinement
  try {
    const result = await routeToAI(codeString, 'groq', detectedLanguage);
    
    if (result && result.refinedCode) {
      const enriched = {
        ...result,
        language: detectedLanguage,
        provider: 'groq',
        refinedAt: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(enriched));
      return enriched;
    }
  } catch (err) {
    console.warn("Primary provider failed, attempting fallback...", err.message);
    // You can implement a fallback call to 'huggingface' here if your Edge Function supports it
    return {
      error: true,
      refinedCode: codeString,
      explanation: "Refinement failed. Please check your connection or try again later."
    };
  }
};

// ============================================
// 6. AI ROUTING FUNCTION (The Engine)
// ============================================
async function routeToAI(code, provider, language) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ 
        code, 
        action: 'refine', 
        provider, 
        language,
        prompt: SYSTEM_PROMPT 
      })
    }
  );

  if (!response.ok) throw new Error("Network response was not ok");

  const data = await response.json();
  
  // The AI output is usually nested in 'data.response' or returned as a string
  let aiContent = data.response || data.choices?.[0]?.message?.content || data;

  return extractJSON(aiContent);
}