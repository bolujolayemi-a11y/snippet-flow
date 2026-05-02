import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { code, provider, prompt } = await req.json();
    const apiKey = Deno.env.get(provider === 'groq' ? 'GROQ_API_KEY' : 'HF_API_KEY');

    if (!apiKey) throw new Error(`${provider} API key is missing on Supabase.`);

    let apiUrl, payload;

    if (provider === 'groq') {
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      payload = {
        // UPDATED: Using the current 2026 stable model
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "system", content: prompt }, { role: "user", content: code }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      };
    } else {
      apiUrl = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
      payload = { 
        inputs: `[INST] ${prompt} \n\n Code: ${code} [/INST]`,
        parameters: { max_new_tokens: 800, return_full_text: false }
      };
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    // --- IMPROVED ERROR HANDLING ---
    if (data.error) {
      const errorMessage = typeof data.error === 'string' 
        ? data.error 
        : (data.error.message || JSON.stringify(data.error));

      // Handle Hugging Face cold starts
      if (errorMessage.toLowerCase().includes("loading")) {
        return new Response(JSON.stringify({ error: "Model is warming up. Try again in 5 seconds." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
      
      throw new Error(errorMessage);
    }

    let output = "";
    if (provider === 'groq') {
      output = data.choices?.[0]?.message?.content || "";
    } else {
      output = Array.isArray(data) ? data[0]?.generated_text : (data.generated_text || "");
    }

    if (!output && data) output = JSON.stringify(data);

    return new Response(JSON.stringify(output), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err.message) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });
  }
})