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
// 2. ROBUST JSON EXTRACTION
// ============================================
const extractJSON = (rawText) => {
  if (!rawText) return null;
  let text = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);

  try {
    // 1. Strip markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // 2. Find boundaries of the JSON object
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(text);
    if (parsed.refinedCode) return parsed;
    throw new Error("Missing refinedCode field");
  } catch (e) {
    console.error("JSON Extraction failed:", e.message);
    return null;
  }
};

// ============================================
// 3. LANGUAGE DETECTION
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
// 4. AI ROUTING FUNCTION
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

  if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

  const data = await response.json();
  
  // Handle nested structures from different AI providers
  const aiContent = data.response || 
                    data.choices?.[0]?.message?.content || 
                    data.generated_text || 
                    data;

  const result = extractJSON(aiContent);
  if (!result) throw new Error("AI returned unparseable code");
  return result;
}

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
    
    const enriched = {
      ...result,
      language: detectedLanguage,
      provider: 'groq',
      refinedAt: new Date().toISOString()
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(enriched));
    return enriched;
  } catch (err) {
    console.warn("Primary provider failed:", err.message);
    return {
      error: true,
      refinedCode: codeString,
      explanation: "AI refinement encountered an error. Please try again in a moment."
    };
  }
};

// ============================================
// 6. CRITICAL: EXPORT FOR THE BUTTON
// ============================================
export const refineSnippet = refineSnippetWithFailover;