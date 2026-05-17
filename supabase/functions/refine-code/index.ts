// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// 1. MODELS CONFIG
const MODELS = {
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.1-8b-instant",
    maxRetries: 2,
    timeout: 25000,
  },
  huggingface: {
    url:
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    maxRetries: 3,
    timeout: 30000,
    warmupWait: 8000,
  },
};

// 2. UTILITIES
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanJSONResponse(rawOutput: string): string {
  let cleaned = rawOutput
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0]);
      return jsonMatch[0];
    } catch {
      return cleaned
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "")
        .replace(/\t/g, "\\t");
    }
  }
  return cleaned;
}

// 3. GROQ HANDLER
async function callGroq(code: string, prompt: string, apiKey: string) {
  const payload = {
    model: MODELS.groq.model,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: code },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MODELS.groq.maxRetries; attempt++) {
    try {
      if (attempt > 0) await delay(1000 * attempt);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        MODELS.groq.timeout,
      );

      const response = await fetch(MODELS.groq.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`Groq API error ${response.status}`);

      const data = await response.json();
      const output = data.choices?.[0]?.message?.content;
      if (!output) throw new Error("Empty response");

      const cleaned = cleanJSONResponse(output);
      const parsed = JSON.parse(cleaned);

      if (parsed.refinedCode) return cleaned;
      throw new Error("Missing refinedCode");
    } catch (error) {
      lastError = error as Error;
      if (lastError.name === "AbortError") console.warn("Groq Timeout");
    }
  }
  throw lastError || new Error("Groq failed");
}

// 4. HUGGING FACE HANDLER
async function callHuggingFace(code: string, prompt: string, apiKey: string) {
  const payload = {
    inputs: `<s>[INST] ${prompt} [/INST]\n\nCode:\n${code}\n\nJSON:</s>`,
    parameters: { max_new_tokens: 1500, temperature: 0.1 },
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MODELS.huggingface.maxRetries; attempt++) {
    try {
      if (attempt > 0) await delay(2000 * attempt);

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        MODELS.huggingface.timeout,
      );

      const response = await fetch(MODELS.huggingface.url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        await delay(MODELS.huggingface.warmupWait);
        continue;
      }

      const data = await response.json();
      const output = Array.isArray(data)
        ? data[0]?.generated_text
        : data.generated_text;

      if (!output) throw new Error("HF Empty response");

      const cleaned = cleanJSONResponse(output);
      if (JSON.parse(cleaned).refinedCode) return cleaned;
    } catch (error) {
      lastError = error as Error;
    }
  }
  throw lastError || new Error("HF failed");
}

// 5. MAIN SERVER
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { code, provider, prompt, language } = await req.json();

    if (!code || !prompt || !provider) {
      throw new Error("Missing required fields: code, prompt, or provider");
    }

    const apiKey = Deno.env.get(
      provider === "groq" ? "GROQ_API_KEY" : "HF_API_KEY",
    );
    if (!apiKey) throw new Error(`${provider} API key not found in env`);

    const result = provider === "groq"
      ? await callGroq(code, prompt, apiKey)
      : await callHuggingFace(code, prompt, apiKey);

    const duration = Date.now() - startTime;

    return new Response(result, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Processing-Time": `${duration}ms`,
      },
      status: 200,
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
