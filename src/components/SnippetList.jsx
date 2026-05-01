import { Search, Plus } from "lucide-react";

// Add onNewSnippet to the props here
export default function SnippetList({ snippets, onSelect, activeId, onNewSnippet }) {
  return (
    <div className="flex flex-col h-full bg-white/1">
      {/* Search Header */}
      <div className="p-4 border-b border-white/5">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search snippets..." 
            className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-600"
          />
        </div>
      </div>
      
      {/* List Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {snippets.length === 0 ? (
          <div className="p-8 py-20 text-center border border-dashed border-white/5 m-4 rounded-3xl bg-white/1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-4">No snippets found</p>
            
            {/* LINKED BUTTON: Now triggers the modal */}
            <button 
              onClick={onNewSnippet}
              className="group flex flex-col items-center gap-3 mx-auto"
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <Plus size={18} />
              </div>
              <span className="text-[11px] text-purple-400 font-bold hover:text-purple-300 transition-colors">
                Create your first snippet
              </span>
            </button>
          </div>
        ) : (
          snippets.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`w-full text-left p-5 border-b border-white/5 transition-all relative group ${
                activeId === s.id ? "bg-purple-500/5" : "hover:bg-white/2"
              }`}
            >
              {activeId === s.id && (
                <div className="absolute left-0 top-0 h-full w-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
              )}
              
              <h4 className={`text-sm font-medium truncate transition-colors ${
                activeId === s.id ? "text-white" : "text-gray-400 group-hover:text-gray-200"
              }`}>
                {s.title || "Untitled Snippet"}
              </h4>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-gray-600 uppercase font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">
                  {s.language || 'Plain Text'}
                </span>
                <span className="text-[9px] text-gray-700 font-mono">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}