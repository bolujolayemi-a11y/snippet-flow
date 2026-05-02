import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";

export default function ExplanationDrawer({ isOpen, onClose, text, loading }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }} 
          animate={{ x: 0 }} 
          exit={{ x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-80 bg-[#0B0B0C] border-l border-white/5 p-8 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-8 shrink-0">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500">
              AI Analysis
            </h3>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors">
              <X size={18}/>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-40 gap-4 text-gray-600">
                <Loader2 size={24} className="animate-spin text-purple-500/50" />
                <p className="text-[10px] uppercase tracking-widest font-bold">Processing Code...</p>
              </div>
            ) : (
              <p className="text-sm text-gray-300 leading-relaxed font-medium whitespace-pre-line">
                {text || "Select code and click 'Explain' to generate a breakdown of the logic."}
              </p>
            )}
          </div>

          {/* Footer Branding (Optional) */}
          <div className="mt-8 pt-4 border-t border-white/5 shrink-0">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold text-center">
              Powered by SnippetFlow AI
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}