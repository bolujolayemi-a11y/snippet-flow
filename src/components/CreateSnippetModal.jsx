import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function CreateSnippetModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("snippets")
      .insert([
        { 
          title, 
          language, 
          code, 
          user_id: user.id 
        }
      ]);

    if (!error) {
      onSuccess();
    } else {
      alert(error.message);
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
          <div className="grid grid-cols-2 gap-6">
            {/* Title Input */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Snippet Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React Navbar Component"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 text-white"
              />
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 text-white appearance-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="react">React (JSX)</option>
                <option value="pandas">Python (Pandas)</option>
              </select>
            </div>
          </div>

          {/* Code Area */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Code</label>
            <textarea 
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full h-64 bg-[#050505] border border-white/5 rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:border-purple-500/50 text-gray-300 resize-none"
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Save Snippet"}
          </button>
        </form>
      </div>
    </div>
  );
}