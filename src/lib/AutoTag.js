import { supabase } from "./supabase";

export const generateAutoTags = async (id, code) => {
  try {
    const { data, error } = await supabase.functions.invoke('refine-code', {
      body: { code, action: 'tag' },
    });

    if (error) throw error;

    // Safety: Handle both stringified and object responses
    const result = typeof data === 'string' ? JSON.parse(data) : data;
    const tags = result.tags || [];

    // Update Supabase with the new tags
    const { error: updateError } = await supabase
      .from('snippets')
      .update({ tags })
      .eq('id', id);

    if (updateError) throw updateError;

    return tags;
  } catch (err) {
    console.error("Auto-tagging failed:", err.message);
    return [];
  }
};