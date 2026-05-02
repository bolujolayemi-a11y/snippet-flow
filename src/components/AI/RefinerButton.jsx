import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { refineSnippet } from "../../lib/RefinerLogic";

export default function RefinerButton({ currentCode, onRefined }) {
  const [loading, setLoading] = useState(false);

  const handleRefine = async () => {
    // 1. Safety check for the input
    const codeToProcess = typeof currentCode === 'string' 
      ? currentCode 
      : (currentCode?.code || String(currentCode || ""));

    if (!codeToProcess.trim() || codeToProcess.trim().length < 5) {
      alert("Please enter some code to refine first!");
      return;
    }

    setLoading(true);
    try {
      // 2. Call the failover logic
      const result = await refineSnippet(codeToProcess);
      
      // 3. Robust result handling
      // We check for the property first, then the raw string, then the whole object
      const cleanCode = result?.refinedCode || (typeof result === 'string' ? result : result?.code);
      
      if (cleanCode) {
        onRefined(cleanCode);
      } else {
        console.warn("AI returned a response, but no code was found:", result);
        alert("The AI responded but couldn't generate clean code. Try again!");
      }
    } catch (err) {
      console.error("Refiner Error:", err);
      // Friendly error message for the demo
      alert("Refinement service is currently waking up. Please try again in a few seconds!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      type="button" // Always specify type to prevent accidental form submits
      onClick={handleRefine} 
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-purple-500/5"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      <span className="text-[10px] font-black uppercase tracking-widest leading-none">
        {loading ? "Refining..." : "Refine Code"}
      </span>
    </button>
  );
}