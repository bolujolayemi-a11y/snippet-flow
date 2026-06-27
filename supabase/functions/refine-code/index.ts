// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ============================================
// 1. CONFIGURATION
// ============================================
const MODELS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "openai/gpt-oss-20b",
    timeout: 25000,
  },
  huggingface: {
    url:
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    timeout: 30000,
  },
};

serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  let currentProvider = "unknown"; // Declared outside try/catch for scope access

  try {
    const body = await req.json();
    const { code, provider, prompt } = body;
    currentProvider = provider; // Assign for catch block logging

    // 2. ENV VALIDATION
    const apiKey = Deno.env.get(
      currentProvider === "groq" ? "GROQ_API_KEY" : "HF_API_KEY",
    );
    if (!apiKey) {
      throw new Error(`${currentProvider} API key is missing on Supabase.`);
    }

    let apiUrl, payload;

    // 3. PAYLOAD CONSTRUCTION
    if (currentProvider === "groq") {
      apiUrl = MODELS.groq.url;
      payload = {
        model: MODELS.groq.model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: code },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      };
    } else {
      apiUrl = MODELS.huggingface.url;
      payload = {
        inputs: `[INST] ${prompt} \n\n Code: ${code} [/INST]`,
        parameters: { max_new_tokens: 1200, return_full_text: false },
      };
    }

    // 4. API CALL WITH TIMEOUT
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      currentProvider === "groq"
        ? MODELS.groq.timeout
        : MODELS.huggingface.timeout,
    );

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json();

    // 5. ERROR & COLD-START HANDLING
    if (!res.ok || data.error) {
      const errorMessage = typeof data.error === "string"
        ? data.error
        : (data.error?.message || JSON.stringify(data.error));

      if (errorMessage.toLowerCase().includes("loading")) {
        return new Response(
          JSON.stringify({
            error: "Model is warming up. Try again in 5 seconds.",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 202,
          },
        );
      }
      throw new Error(errorMessage);
    }

    // 6. OUTPUT EXTRACTION
    let output = "";
    if (currentProvider === "groq") {
      output = data.choices?.[0]?.message?.content || "";
    } else {
      output = Array.isArray(data)
        ? data[0]?.generated_text
        : (data.generated_text || "");
    }

    // 7. ROBUST JSON PARSING
    let finalResponse;
    try {
      finalResponse = typeof output === "string" ? JSON.parse(output) : output;
    } catch {
      finalResponse = {
        refinedCode: output,
        suggestedTitle: "Refined Snippet",
        explanation: "AI returned non-JSON format.",
      };
    }

    const duration = Date.now() - startTime;
    return new Response(JSON.stringify(finalResponse), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Processing-Time": `${duration}ms`,
      },
      status: 200,
    });
  } catch (error) {
    // 8. THE ERR ISSUE FIX
    const err = error instanceof Error ? error : new Error(String(error));

    if (err.name === "AbortError") {
      console.warn(`${currentProvider} request timed out.`);
    }

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
