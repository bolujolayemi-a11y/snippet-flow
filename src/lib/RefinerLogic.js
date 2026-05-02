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

const SYSTEM_PROMPT = `Return ONLY a valid JSON object: { "refinedCode": "...", "suggestedTitle": "...", "explanation": "..." }`;

export const refineSnippetWithFailover = async (currentCode) => {
  if (!currentCode) return;
  const codeString = typeof currentCode === 'string' ? currentCode : (currentCode.code || String(currentCode));
  const cacheKey = getHash(codeString);
  
  localStorage.removeItem(cacheKey); // FORCE CLEAR OLD BAD DATA

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
    // DIRECT FETCH CALL to bypass the HTML/404 routing error
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/refine-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ code, action: 'refine', provider, prompt: SYSTEM_PROMPT })
    });

    // Check if the server sent back HTML (DOCTYPE) instead of JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("Server returned HTML instead of JSON. First 100 chars:", errorText.substring(0, 100));
      throw new Error("Edge Function routing failed (Received HTML). Ensure the function is deployed.");
    }

    const data = await response.json();

    // If the function returned an error object inside a 200 response
    if (data?.error) throw new Error(data.error);

    let result = data;

    // Aggressive JSON extraction (handles arrays or strings with backticks)
    if (Array.isArray(result)) {
      result = result[0]?.generated_text || result[0];
    }

    if (typeof result === 'string') {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
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