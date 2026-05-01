import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Folder, Check } from "lucide-react";

export default function Demo() {
  const snippets = {
    "Tailwind Button": `// Tailwind CSS Button Component
const Button = ({ children }) => (
  <button className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-500 transition-all">
    {children}
  </button>
);`,
    "Fetch API Hook": `// Custom React Hook for Data Fetching
const useFetch = (url) => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => setData(data));
  }, [url]);

  return data;
};`,
    "Auth Middleware": `// Node.js/Express Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied.');

  try {
    const decoded = jwt.verify(token, 'privateKey');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};`
  };

  const [selected, setSelected] = useState("Tailwind Button");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[selected]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white pt-24 md:pt-32 px-4 md:px-6 pb-10">
      {/* Container: Changed from flex to flex-col on mobile */}
      <div className="max-w-6xl mx-auto min-h-125 md:h-150 rounded-3xl border border-white/10 bg-[#050505] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        
        {/* Mobile Navigation: Only visible on small screens */}
        <div className="md:hidden p-4 border-b border-white/5 bg-white/2 overflow-x-auto flex gap-2 no-scrollbar">
           {Object.keys(snippets).map((title) => (
                <button 
                  key={title}
                  onClick={() => setSelected(title)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all ${
                    selected === title ? "bg-purple-500 text-white" : "bg-white/5 text-gray-400"
                  }`}
                >
                  {title}
                </button>
              ))}
        </div>

        {/* Desktop Sidebar: hidden on mobile */}
        <aside className="w-64 border-r border-white/5 bg-white/2 p-6 hidden md:flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 block">Collections</span>
            <div className="space-y-1">
              {Object.keys(snippets).map((title) => (
                <button 
                  key={title}
                  onClick={() => setSelected(title)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                    selected === title ? "bg-purple-500/10 text-purple-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Folder size={14} />
                  <span className="text-sm font-medium">{title}</span>
                </button>
              ))}
            </div>
          </div>

          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-white transition-all group pt-6 border-t border-white/5"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Exit Demo</span>
          </Link>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col bg-black/40 min-h-100">
          <div className="h-14 border-b border-white/5 flex items-center justify-between px-6">
            <span className="text-[10px] md:text-xs font-mono text-gray-500">{selected}.js</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-[10px] bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          
          <div className="p-6 md:p-8 font-mono text-[12px] md:text-sm leading-relaxed overflow-auto flex-1">
            <pre className="text-gray-300 whitespace-pre-wrap">
              {snippets[selected]}
            </pre>
          </div>

          {/* Mobile Exit Link: visible only on mobile at the bottom */}
          <div className="md:hidden p-4 border-t border-white/5 bg-black/20">
             <Link to="/" className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <ArrowLeft size={12} /> Exit Demo
             </Link>
          </div>
        </main>
      </div>
    </div>
  );
}