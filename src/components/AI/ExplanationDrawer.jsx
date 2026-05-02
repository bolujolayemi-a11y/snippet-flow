import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Zap } from "lucide-react";

export default function ExplanationDrawer({ isOpen, onClose, text, loading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full sm:w-96 bg-[#0B0B0C]/95 backdrop-blur-xl border-l border-white/5 p-8 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8 shrink-0">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-purple-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">
                AI Deep Analysis
              </h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all">
              <X size={16}/>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-600">
                <div className="relative">
                  <Loader2 size={32} className="animate-spin text-purple-500" />
                  <div className="absolute inset-0 blur-lg bg-purple-500/20 animate-pulse"></div>
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
                  Deconstructing Logic...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* We use whitespace-pre-line to respect the AI's formatting */}
                <div className="text-sm text-gray-300 leading-relaxed font-normal whitespace-pre-line prose-invert">
                  {text || "Paste your code and click 'Explain' to see the magic happen."}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/5 shrink-0">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold text-center italic">
                Optimized by SnippetFlow v1.0
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}