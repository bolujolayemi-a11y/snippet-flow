import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft, Check, X, Code2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { refineSnippet } from "../../lib/RefinerLogic";

export default function RefinerButton({ currentCode, onRefined }) {
  const [loading, setLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [tempRefinedCode, setTempRefinedCode] = useState("");

  // Added retryCount parameter to handle server cold starts silently
  const handleRefine = async (retryCount = 0) => {
    const codeToProcess = typeof currentCode === 'string' 
      ? currentCode 
      : (currentCode?.code || String(currentCode || ""));

    if (!codeToProcess.trim() || codeToProcess.trim().length < 5) {
      alert("Please enter some code to refine first!");
      return;
    }

    setLoading(true);
    try {
      const result = await refineSnippet(codeToProcess);
      const cleanCode = result?.refinedCode || (typeof result === 'string' ? result : result?.code);
      
      if (cleanCode) {
        setTempRefinedCode(cleanCode);
        setShowComparison(true);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      // SILENT RETRY LOGIC: If it fails the first time, try once more automatically
      if (retryCount < 1) {
        console.log("Server waking up... retrying refinement.");
        return handleRefine(retryCount + 1);
      }
      
      console.error("Refiner Error:", err);
      alert("The AI is taking a moment to wake up. Please try again in a few seconds!");
    } finally {
      // Only stop loading if we aren't in the middle of a retry
      if (retryCount >= 1 || !loading) setLoading(false);
    }
  };

  const confirmRefinement = () => {
    onRefined(tempRefinedCode);
    setShowComparison(false);
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => handleRefine(0)} 
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-purple-500/5"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
          {loading ? "Refining..." : "Refine Code"}
        </span>
      </button>

      {/* COMPARISON OVERLAY */}
      <AnimatePresence>
        {showComparison && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0B0B0C] border border-white/10 w-full max-w-5xl rounded-[2.5rem] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg tracking-tight">Review Refinement</h2>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">AI suggested optimizations</p>
                  </div>
                </div>
                <button onClick={() => setShowComparison(false)} className="text-gray-500 hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>

              {/* Comparison Grid - Responsive */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                
                {/* Before: Original (Top on Mobile) */}
                <div className="p-6 overflow-y-auto bg-[#050505] max-h-[35vh] md:max-h-full border-b md:border-b-0 border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Code2 size={12} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Original Code</span>
                    </div>
                    <span className="md:hidden text-[8px] bg-white/5 px-2 py-0.5 rounded text-gray-600 font-bold tracking-widest">BEFORE</span>
                  </div>
                  <pre className="text-[11px] md:text-xs font-mono text-gray-500 leading-relaxed whitespace-pre-wrap">
                    {currentCode}
                  </pre>
                </div>

                {/* After: Refined (Bottom on Mobile) */}
                <div className="p-6 overflow-y-auto bg-[#0B0B0C] max-h-[45vh] md:max-h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Sparkles size={12} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Refined Version</span>
                    </div>
                    <span className="md:hidden text-[8px] bg-purple-500/20 px-2 py-0.5 rounded text-purple-400 font-bold tracking-widest">AFTER</span>
                  </div>
                  <pre className="text-[11px] md:text-xs font-mono text-white leading-relaxed whitespace-pre-wrap">
                    {tempRefinedCode}
                  </pre>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 flex justify-between items-center bg-white/2">
                <button 
                  onClick={() => setShowComparison(false)}
                  className="flex items-center gap-2 px-4 md:px-6 py-3 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <ArrowLeft size={14} className="hidden xs:block" /> Discard
                </button>

                <button 
                  onClick={confirmRefinement}
                  className="flex items-center gap-2 px-6 md:px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all shadow-xl active:scale-95"
                >
                  <Check size={14} /> Apply Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}