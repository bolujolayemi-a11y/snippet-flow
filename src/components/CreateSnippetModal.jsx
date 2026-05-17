import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { generateAutoTags } from "../utils/auto-tag"; // Import your auto-tag logic

export default function CreateSnippetModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Initial save with 'text' or 'detecting...' as placeholder
      const { data, error } = await supabase
        .from("snippets")
        .insert([
          { 
            title, 
            code, 
            user_id: user.id,
            language: 'detecting...' // Visual cue that AI is working
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // 2. Trigger the AI detection & tagging (Auto-tag.js now handles language too)
      await generateAutoTags(data.id, code);

      onSuccess();
    } catch (error) {
      console.error("Error creating snippet:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0B0B0C] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-white/5">
          <h2 className="text-xl font-bold italic font-serif">New <span className="text-purple-500">Snippet</span></h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Title Input - Now taking full width since language dropdown is gone */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Snippet Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Optimized Auth Middleware"
              className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 text-white transition-all"
            />
          </div>

          {/* Code Area */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
              Code <span className="text-purple-500/50 lowercase italic ml-2">(Auto-detecting language...)</span>
            </label>
            <textarea 
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-64 bg-[#050505] border border-white/5 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-purple-500/50 text-gray-300 resize-none transition-all"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Analyzing & Saving...</span>
              </>
            ) : (
              "Save Snippet"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}