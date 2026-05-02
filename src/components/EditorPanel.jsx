import { Copy, Check, Save, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ExplanationDrawer from "./AI/ExplanationDrawer";
import RefinerButton from "./AI/RefinerButton"; // Added this import
import { refineSnippetWithFailover } from "../lib/RefinerLogic";

export default function EditorPanel({ snippet, onSave, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [tempCode, setTempCode] = useState("");
  
  // AI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    if (snippet) {
      setTempCode(snippet.code);
      setExplanation(""); 
      setIsDrawerOpen(false);
    }
  }, [snippet]);

  const handleCopy = () => {
    if (!tempCode) return;
    navigator.clipboard.writeText(tempCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = async () => {
    setIsDrawerOpen(true);
    if (explanation) return; 
    
    setIsExplaining(true);
    try {
      const result = await refineSnippetWithFailover(tempCode, "explain");
      // Handle potential object or string response
      setExplanation(result.explanation || (typeof result === 'string' ? result : "Analysis complete.")); 
    } catch (err) {
      setExplanation("Failed to generate explanation. Please try again.");
    } finally {
      setIsExplaining(false);
    }
  };

  if (!snippet) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#050505] text-gray-600">
        <div className="w-12 h-12 mb-4 rounded-full border border-white/5 flex items-center justify-center bg-white/2">
           <Save size={20} strokeWidth={1.5} />
        </div>
        <p className="text-xs italic tracking-wide">Select a snippet to view the code</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="h-16 px-8 border-b border-white/5 flex justify-between items-center bg-[#0B0B0C]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold tracking-tight">{snippet.title}</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase font-bold tracking-widest">
            {snippet.language || "text"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* REFINER BUTTON: Added here */}
          <RefinerButton 
            currentCode={tempCode} 
            onRefined={(newCode) => setTempCode(newCode)} 
          />

          {/* EXPLAIN BUTTON */}
          <button 
            onClick={handleExplain}
            disabled={!tempCode || isExplaining}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-50"
          >
            {isExplaining ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            Explain
          </button>

          <button 
            onClick={() => onDelete(snippet.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all group"
            title="Delete Snippet"
          >
            <Trash2 size={16} />
          </button>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            Copy
          </button>
          
          <button 
            onClick={() => onSave(snippet.id, tempCode)}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold transition-all shadow-lg shadow-purple-500/10"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <textarea
          value={tempCode}
          onChange={(e) => setTempCode(e.target.value)}
          spellCheck="false"
          className="w-full h-full p-8 bg-transparent text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar"
          placeholder="Paste or type your code here..."
        />

        {/* EXPLANATION DRAWER */}
        <ExplanationDrawer 
          isOpen={isDrawerOpen} 
          onClose={() => setIsDrawerOpen(false)} 
          text={explanation}
          loading={isExplaining}
        />
      </div>
    </div>
  );
}