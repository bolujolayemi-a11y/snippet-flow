import { supabase } from "./supabase";

export const generateAutoTags = async (id, code) => {
  try {
    const { data, error } = await supabase.functions.invoke('refine-code', {
      body: { code, action: 'tag' },
    });

    if (error) throw error;

    // Safety: Handle both stringified and object responses
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    
    // Extract both tags and the detected language
    const tags = result.tags || [];
    const detectedLanguage = result.language?.toLowerCase() || 'text';

    // Update Supabase with the new tags AND the detected language
    const { error: updateError } = await supabase
      .from('snippets')
      .update({ 
        tags: tags,
        language: detectedLanguage // No more defaulting to JS
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return { tags, language: detectedLanguage };
  } catch (err) {
    console.error("Auto-detection failed:", err.message);
    return { tags: [], language: 'text' };
  }
};