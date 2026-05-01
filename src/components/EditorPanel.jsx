import { Copy, Check, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function EditorPanel({ snippet, onSave, onDelete }) {
  const [copied, setCopied] = useState(false);
  // NEW: State to track the code as the user edits
  const [tempCode, setTempCode] = useState("");

  // IMPORTANT: When the user clicks a different snippet, 
  // we must update our editor with the new code.
  useEffect(() => {
    if (snippet) {
      setTempCode(snippet.code);
    }
  }, [snippet]);

  const handleCopy = () => {
    if (!tempCode) return;
    navigator.clipboard.writeText(tempCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-16 px-8 border-b border-white/5 flex justify-between items-center bg-[#0B0B0C]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold tracking-tight">{snippet.title}</h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase font-bold tracking-widest">
            {snippet.language || "text"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onDelete(snippet.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all mr-2 group"
            title="Delete Snippet"
          >
            <Trash2 size={16} className="group-active:scale-90 transition-transform" />
          </button>

          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
          
          <button 
            // UPDATED: Now sends the current tempCode to the Dashboard
            onClick={() => onSave(snippet.id, tempCode)}
            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold shadow-lg shadow-purple-500/10 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Code Area: Switched from <pre> to <textarea> for editing */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={tempCode}
          onChange={(e) => setTempCode(e.target.value)}
          spellCheck="false"
          className="w-full h-full p-8 bg-transparent text-gray-300 font-mono text-sm leading-relaxed outline-none resize-none custom-scrollbar"
          placeholder="Paste or type your code here..."
        />
      </div>
    </div>
  );
}