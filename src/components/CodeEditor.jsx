export default function CodeEditor() {
  return (
    <section className="w-full max-w-4xl px-6 py-12">
      <div className="rounded-xl border border-white/10 bg-[#0B0B0C] shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="text-xs text-gray-500 font-mono">Button.jsx</div>
          <div className="w-12" /> {/* Spacer to center title */}
        </div>

        {/* Code Content */}
        <div className="p-6 font-mono text-sm sm:text-base leading-relaxed overflow-x-auto">
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">1</span>
            <p><span className="text-purple-400">export default function</span> <span className="text-blue-400">Button</span>() &#123;</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">2</span>
            <p className="pl-4 text-purple-400">return (</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">3</span>
            <p className="pl-8 text-gray-300">&lt;<span className="text-blue-400">button</span> <span className="text-orange-300">className</span>=<span className="text-green-300">"bg-purple-600"</span>&gt;</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">4</span>
            <p className="pl-12 text-gray-100">Click Me</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">5</span>
            <p className="pl-8 text-gray-300">&lt;/<span className="text-blue-400">button</span>&gt;</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">6</span>
            <p className="pl-4 text-purple-400">);</p>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-600 select-none">7</span>
            <p>&#125;</p>
          </div>
        </div>
      </div>
    </section>
  );
}