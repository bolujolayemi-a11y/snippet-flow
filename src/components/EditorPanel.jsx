import { Copy, Check, Save, Trash2, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ExplanationDrawer from "./AI/ExplanationDrawer";
import RefinerButton from "./AI/RefinerButton"; 
import { refineSnippetWithFailover } from "../lib/RefinerLogic";

export default function EditorPanel({ snippet, onSave, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("text");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

const autoDetectLanguage = (code) => {
    if (!code) return "text";
    const c = code.trim();
    const cLower = c.toLowerCase();
    
    // 1. PYTHON & PANDAS (Combined Priority)
    // We check these first so they "block" CSS or JS from claiming the code
    const isPython = 
      c.includes('def ') || 
      c.includes('pass') || 
      c.includes('elif') || 
      c.includes('import os') ||
      c.includes('import sys') ||
      c.includes('if __name__ ==') ||
      (c.includes('print(') && !c.includes('console.log'));

    const isPandas = cLower.includes('import pandas') || cLower.includes('pd.');

    if (isPandas) return 'pandas';
    if (isPython) return 'python';

    // 2. HTML
    if (c.startsWith('<') || cLower.includes('</div>') || cLower.includes('<html>')) {
        return 'html';
    }

    // 3. JAVASCRIPT / REACT
    const isJS = 
      c.includes('const ') || 
      c.includes('let ') || 
      c.includes('export default') || 
      c.includes('=>') ||
      c.includes('console.log');

    if (isJS) return 'javascript';

    // 4. CSS (The "Semicolon" Protection)
    // Python dictionaries have { and : but almost NEVER ;
    // CSS properties ALMOST ALWAYS have ;
    const cssKeywords = ['margin', 'padding', 'color:', 'background', 'display:', 'flex', 'border:'];
    const hasCssProperty = cssKeywords.some(k => cLower.includes(k));
    
    if (c.includes('{') && c.includes(':') && c.includes(';') && hasCssProperty) {
        return 'css';
    }
    
    // 5. FINAL FALLBACK
    // If it's none of the above, use the saved language or default to plain text
    return snippet?.language || "text";
  };

  useEffect(() => {
    if (snippet) {
      setTempCode(snippet.code);
      setDetectedLanguage(snippet.language || "text");
      setExplanation(""); 
      setIsDrawerOpen(false);
    }
  }, [snippet]);

  // Update tag when typing (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDetectedLanguage(autoDetectLanguage(tempCode));
    }, 500); 
    return () => clearTimeout(timer);
  }, [tempCode]);

  const handleCopy = () => {
    if (!tempCode) return;
    navigator.clipboard.writeText(tempCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!tempCode) return;
    await onSave(snippet.id, tempCode, detectedLanguage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExplain = async () => {
    setIsDrawerOpen(true);
    if (explanation) return; 
    
    setIsExplaining(true);
    try {
      const result = await refineSnippetWithFailover(tempCode, "explain");
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
      <div className="min-h-16 px-4 md:px-8 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-[#0B0B0C]">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold tracking-tight truncate max-w-30 sm:max-w-none">
            {snippet.title}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 uppercase font-bold tracking-widest transition-all">
            {detectedLanguage}
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <RefinerButton 
            currentCode={tempCode} 
            onRefined={(newCode) => setTempCode(newCode)} 
          />

          <button 
            onClick={handleExplain}
            disabled={!tempCode || isExplaining}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-50"
            title="Explain"
          >
            {isExplaining ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}
            <span className="hidden sm:inline">Explain</span>
          </button>

          <button 
            onClick={() => onDelete(snippet.id)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={16} />
          </button>

          <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span className="hidden sm:inline">Copy</span>
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saved}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-lg flex items-center gap-2 ${
              saved ? "bg-green-600 text-white" : "bg-purple-600 hover:bg-purple-500 text-white"
            }`}
          >
            {saved ? <><Check size={14} /><span>Saved</span></> : <span>Save Changes</span>}
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