import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Folder, Check } from "lucide-react";

export default function Demo() {
  // 1. Data Store for our snippets
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

  // 2. State to track which snippet is selected
  const [selected, setSelected] = useState("Tailwind Button");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[selected]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#3b3737] text-white pt-32 px-6">
      <div className="max-w-6xl mx-auto h-150 rounded-3xl border border-white/10 bg-[#050505] overflow-hidden flex shadow-2xl">
        
        {/* Sidebar - Added flex-col and justify-between to anchor the back button */}
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

          {/* BACK BUTTON: Now safely inside the sidebar at the bottom */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-white transition-all group pt-6 border-t border-white/5"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Exit Demo</span>
          </Link>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex flex-col bg-black/40">
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6">
            <span className="text-xs font-mono text-gray-500">{selected}.js</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-[10px] bg-white text-black px-3 py-1 rounded-md font-bold hover:bg-gray-200 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="p-8 font-mono text-sm leading-relaxed overflow-auto">
            <pre className="text-gray-300 whitespace-pre-wrap">
              {snippets[selected]}
            </pre>
          </div>
        </main>
      </div>
    </div>
  );
}