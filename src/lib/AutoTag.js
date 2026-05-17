import { supabase } from "./supabase";

export const generateAutoTags = async (id, code) => {
  try {
    const { data, error } = await supabase.functions.invoke('refine-code', {
      body: { code, action: 'tag' },
    });

    if (error) throw error;

    const result = typeof data === 'string' ? JSON.parse(data) : data;
    
    const tags = result.tags || [];
    let detectedLanguage = result.language?.toLowerCase() || 'text';

    // --- 🛡️ THE PYTHON GUARD ---
    // If the AI is wrong, we manually override it based on "Hard" keywords
    const isActuallyPython = 
      code.includes('def ') || 
      code.includes('pass') || 
      code.includes('elif') || 
      code.includes('import os');

    if (isActuallyPython) {
      detectedLanguage = 'python';
    }
    // ---------------------------

    // Update Supabase with the (now corrected) detected language
    const { error: updateError } = await supabase
      .from('snippets')
      .update({ 
        tags: tags,
        language: detectedLanguage 
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return { tags, language: detectedLanguage };
  } catch (err) {
    console.error("Auto-detection failed:", err.message);
    return { tags: [], language: 'text' };
  }
};