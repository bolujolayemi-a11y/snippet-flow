import { supabase } from "./supabase";

const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; 
  }
  return `sf_cache_${hash}`;
};

const SYSTEM_PROMPT = `
Return ONLY a valid JSON object: { "refinedCode": "...", "suggestedTitle": "...", "explanation": "..." }

The "explanation" field MUST be detailed and formatted with Markdown:
1. Use ### for section headers (e.g., ### Logic Overview).
2. Use bullet points for step-by-step breakdowns.
3. Identify potential bugs or performance bottlenecks.
4. Keep the tone professional and technical.

### SPECIAL HANDLING FOR PANDAS/PYTHON:
- If the code uses Pandas, prioritize vectorized operations over 'for' loops or '.apply()'.
- Suggest 'df.query()' or 'df.loc[]' for more readable filtering.
- In the explanation, explicitly mention any data transformations like 'groupby', 'merge', or 'pivot'.
- Ensure variable names follow data science conventions (e.g., 'df_sales' instead of 'd').

CRITICAL: Do not include markdown backticks or introductory text. Start with { and end with }.
`;

export const refineSnippetWithFailover = async (currentCode) => {
  if (!currentCode) return;
  const codeString = typeof currentCode === 'string' ? currentCode : (currentCode.code || String(currentCode));
  const cacheKey = getHash(codeString);
  
  // Checking cache first before hitting APIs
  const cached = localStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  try {
    console.log("📡 Calling Groq via Direct Bridge...");
    const result = await routeToAI(codeString, 'groq');
    if (result && result.refinedCode) {
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
    throw new Error("Invalid Groq Response");
  } catch (error) {
    console.warn("Groq failed, switching to Hugging Face Fallback...");
    const result = await routeToAI(codeString, 'huggingface');
    if (result) {
       localStorage.setItem(cacheKey, JSON.stringify(result));
       return result;
    }
    throw new Error("Both AI providers failed.");
  }
};

export { refineSnippetWithFailover as refineSnippet };

async function routeToAI(code, provider) {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ code, action: 'refine', provider, prompt: SYSTEM_PROMPT })
    });

    // 1. IMPROVED: Check for HTML before trying to parse JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
       const textError = await response.text();
       console.error("Server returned HTML/Text instead of JSON:", textError.substring(0, 100));
       throw new Error(`Edge Function (${provider}) is temporarily unavailable.`);
    }

    const data = await response.json();
    if (data?.error) throw new Error(data.error);

    let result = data;

    // 2. IMPROVED: Handle Hugging Face array responses
    if (Array.isArray(result)) {
      result = result[0]?.generated_text || result[0];
    }

    // 3. IMPROVED: Aggressive JSON Extraction
    if (typeof result === 'string' || (typeof result === 'object' && result !== null)) {
      let stringToParse = typeof result === 'string' ? result : JSON.stringify(result);
      
      // Remove common AI garbage like ```json and ```
      stringToParse = stringToParse.replace(/```json/g, '').replace(/```/g, '').trim();

      const jsonMatch = stringToParse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error("AI returned malformed JSON structure.");
        }
      }
    }
    
    if (result?.refinedCode) return result;
    throw new Error(`Empty response from ${provider}`);
  } catch (err) {
    console.error(`Error in routeToAI (${provider}):`, err.message);
    throw err;
  }
}
