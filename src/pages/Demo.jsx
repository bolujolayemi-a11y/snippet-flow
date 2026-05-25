import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Sparkles, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export default function Demo() {
  // Mock data representing unrefined code snippets with manual syntax mistakes
  const [snippets, setSnippets] = useState({
    "Pandas Analysis": {
      raw: `import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# DEPRECATED & BAD ORDERING\ndf.fillna(0, inplace=True)\ndf['discount_code'] = df['discount_code'].str.upper()\ndf.append({'sales': 100}, ignore_index=True)`,
      refined: `import pandas as pd\n\ndf = pd.read_csv("sales.csv")\n\n# FIXED: String manipulation before fillna to prevent casting errors\n# FIXED: Replaced deprecated .append() with pd.concat()\ndf['discount_code'] = df['discount_code'].str.upper()\ndf = df.fillna({'discount_code': 'NONE'})\n\nnew_row = pd.DataFrame([{'sales': 100}])\ndf = pd.concat([df, new_row], ignore_index=True)`,
      explanation: "### 🔍 Issues Found\n- 🔴 **Critical:** `.fillna(0)` executed before `.str` operations casts elements to numeric/objects, breaking string methods.\n- 🟡 **Warning:** `.append()` is deprecated since Pandas 1.4.0.\n\n### 🔧 Step-by-Step Fixes\n1. Reordered string processing prior to handling missing values.\n2. Converted structural mutation to vector-optimized `pd.concat()`.",
      language: "pandas",
      score: 98,
      provider: "groq"
    },
    "Async Authentication": {
      raw: `// Express Auth Middleware with loose checks\nconst checkAuth = async (req, res, next) => {\n  var token = req.headers['authorization'];\n  if (token == null) return res.send('No token');\n  \n  // Missing proper try-catch wrapper\n  const user = jwt.verify(token, "SECRET");\n  req.user = user;\n  next();\n};`,
      refined: `// Optimized Auth Middleware\nconst checkAuth = async (req, res, next) => {\n  const token = req.headers['authorization'];\n  if (!token) return res.status(401).json({ error: 'Access denied.' });\n  \n  try {\n    const user = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = user;\n    next();\n  } catch (error) { \n    res.status(403).json({ error: 'Invalid token.' });\n  }\n};`,
      explanation: "### 🔍 Issues Found\n- 🔴 **Critical:** Missing runtime `try/catch` crash wrapper on cryptographic signature parsing.\n- 🟡 **Warning:** Loose standard variable bindings (`var`) and weak structural equivalence (`==`).",
      language: "javascript",
      score: 100,
      provider: "groq"
    }
  });

  const [selectedKey, setSelectedKey] = useState("Pandas Analysis");
  const [currentCode, setCurrentCode] = useState(snippets[selectedKey].raw);
  const [detectedLang, setDetectedLang] = useState("auto");
  const [isRefining, setIsRefining] = useState(false);
  const [hasRefined, setHasRefined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("code"); // code | explanation

  // Simulate real-time client-side heuristic detection
  useEffect(() => {
    const code = currentCode.toLowerCase();
    if (code.includes("import pandas") || code.includes("pd.")) {
      setDetectedLang("pandas");
    } else if (code.includes("const ") || code.includes("async")) {
      setDetectedLang("javascript");
    } else {
      setDetectedLang("python");
    }
    setHasRefined(false);
  }, [currentCode]);

  // Sync editor if workspace selection updates
  useEffect(() => {
    setCurrentCode(snippets[selectedKey].raw);
    setHasRefined(false);
    setActiveTab("code");
  }, [selectedKey]);

  const triggerMockRefinement = () => {
    setIsRefining(true);
    setTimeout(() => {
      setCurrentCode(snippets[selectedKey].refined);
      setIsRefining(false);
      setHasRefined(true);
    }, 1100);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-slate-200 pt-20 px-4 pb-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Sub-Header Actions */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-400 hover:text-white">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Interactive Sandbox Engine</h1>
              <p className="text-xs text-slate-500">Simulating SnippetFlow v1.0.0 Architecture</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-white/5 rounded-xl text-xs font-mono text-slate-400">
              <Zap size={12} className="text-amber-400" />
              <span>Inference Host: <span className="text-emerald-400">Groq Edge Pool</span></span>
            </div>
          </div>
        </div>

        {/* Workspace Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Collection Explorer */}
          <div className="bg-[#0D0D0F] border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Select Code Core</span>
            <div className="flex flex-col gap-1.5">
              {Object.keys(snippets).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1 ${
                    selectedKey === key 
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                      : "border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold">{key}</span>
                  <span className="text-[10px] font-mono uppercase text-slate-500">{snippets[key].language}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Core Terminal Container */}
          <div className="lg:col-span-3 bg-[#0D0D0F] border border-white/5 rounded-2xl overflow-hidden flex flex-col min-h-[520px] shadow-2xl relative">
            
            {/* Context/Top Bar */}
            <div className="h-14 border-b border-white/5 bg-black/20 flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded-md text-slate-400">
                  Detected Engine: <span className="text-sky-400 font-bold">{detectedLang}</span>
                </span>
                {hasRefined && (
                  <span className="flex items-center gap-1.5 text-xs font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
                    <ShieldCheck size={13} />
                    Quality Score: {snippets[selectedKey].score}%
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                  title="Copy Code Buffer"
                >
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                
                <button
                  onClick={triggerMockRefinement}
                  disabled={isRefining || hasRefined}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-semibold text-xs transition-all active:scale-95 border ${
                    hasRefined 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-neutral-950 border-emerald-400 cursor-pointer disabled:opacity-50"
                  }`}
                >
                  <Sparkles size={13} className={isRefining ? "animate-spin" : ""} />
                  {isRefining ? "Executing Pipeline..." : hasRefined ? "Optimized & Fixed" : "Refine and Lint AI"}
                </button>
              </div>
            </div>

            {/* Toggle tabs when code is refined */}
            {hasRefined && (
              <div className="flex bg-black/40 border-b border-white/5 px-4 gap-2 py-1.5">
                <button 
                  onClick={() => setActiveTab("code")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${activeTab === "code" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  Optimized Source
                </button>
                <button 
                  onClick={() => setActiveTab("explanation")}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${activeTab === "explanation" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "text-slate-400 hover:text-white"}`}
                >
                  <AlertTriangle size={12} /> Technical Trace Log
                </button>
              </div>
            )}

            {/* Editor Workspace display panel */}
            <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-auto bg-black/10">
              {isRefining ? (
                <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-slate-500">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Invoking Supabase Edge Controller...</span>
                </div>
              ) : activeTab === "code" ? (
                <textarea
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value)}
                  disabled={hasRefined}
                  className="w-full h-full min-h-[350px] bg-transparent text-slate-300 resize-none outline-none border-none focus:ring-0 whitespace-pre font-mono selection:bg-emerald-500/20"
                  spellCheck="false"
                />
              ) : (
                <div className="text-xs space-y-4 max-w-3xl font-sans text-slate-300">
                  <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-xl whitespace-pre-wrap leading-relaxed">
                    {snippets[selectedKey].explanation}
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}