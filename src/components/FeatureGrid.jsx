import { Zap, Cloud, Search, Code, Copy } from "lucide-react";

export default function FeatureGrid() {
  return (
    <section className="py-12 px-6 max-w-4xl mx-auto w-full">
      {/* Reduced width to max-w-4xl and kept the 180px row height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[180px]">
        
        {/* Large Feature */}
        <div className="md:col-span-2 md:row-span-2 rounded-3xl border border-white/5 bg-white/2 p-6 flex flex-col overflow-hidden group">
          <div className="h-40 mb-4 rounded-xl bg-[#050505] border border-white/10 p-4 font-mono text-[10px] relative overflow-hidden">
            <div className="flex gap-1 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/30" />
            </div>
            <div className="space-y-1">
              <p className="text-purple-400">const <span className="text-blue-400">Snippet</span> = () =&gt; &#123;</p>
              <p className="pl-3 text-gray-500">// Compact & Fast</p>
              <p className="pl-3 text-gray-400">return <span className="text-green-300">"SnippetFlow"</span>;</p>
              <p className="text-purple-400">&#125;</p>
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-[#050505] to-transparent opacity-40" />
          </div>
          
          <div className="mt-auto">
            <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight">
               <Code className="text-purple-500" size={16} />
               Syntax Highlighting
            </h3>
            <p className="text-gray-400 text-xs mt-1">Automatic theme matching for 50+ languages.</p>
          </div>
        </div>

        {/* Small Feature - Quick Copy */}
        <div className="rounded-3xl border border-white/5 bg-white/2 p-6 flex flex-col justify-between hover:bg-white/4 transition-all group">
          <div className="p-2 bg-purple-500/10 rounded-lg w-fit text-purple-500">
             <Zap size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold tracking-tight">Quick Copy</h3>
            <p className="text-gray-400 text-xs mt-1">Single click to clipboard.</p>
          </div>
        </div>

        {/* Small Feature - Cloud Sync */}
        <div className="rounded-3xl border border-white/5 bg-white/2 p-6 flex flex-col justify-between hover:bg-white/4 transition-all group">
          <div className="p-2 bg-blue-500/10 rounded-lg w-fit text-blue-500">
             <Cloud size={18} />
          </div>
          <div>
            <h3 className="text-md font-bold tracking-tight">Cloud Sync</h3>
            <p className="text-gray-400 text-xs mt-1">Everywhere you code.</p>
          </div>
        </div>

        {/* Medium Feature - Smart Search */}
        <div className="md:col-span-1 rounded-3xl border border-white/5 bg-white/2 p-6 flex flex-col justify-between group">
          <div className="flex items-center gap-2 bg-black/40 border border-white/5 p-2 rounded-lg mb-2">
            <Search size={12} className="text-gray-500" />
            <div className="h-1.5 w-16 bg-white/10 rounded-full" />
          </div>
          <div>
            <h3 className="text-md font-bold tracking-tight">Smart Search</h3>
            <p className="text-gray-400 text-xs mt-1">Find snippets instantly.</p>
          </div>
        </div>

      </div>
    </section>
  );
}