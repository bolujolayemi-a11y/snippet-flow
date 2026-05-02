import { useState, useEffect } from "react";
import { Plus, Home, LogOut, Info, BookOpen, ShieldCheck, ExternalLink, AlertCircle } from "lucide-react"; 
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom"; 

export default function Sidebar({ count, onNewSnippet }) {
  const [userName, setUserName] = useState("Developer");
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const navigate = useNavigate(); 
  
  const STORAGE_LIMIT = 20; 
  const LIFETIME_LIMIT = 50; 
  
  const storagePercentage = Math.min((count / STORAGE_LIMIT) * 100, 100);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || "Developer");
        
        const { data } = await supabase
          .from('profiles')
          .select('lifetime_creations')
          .eq('id', user.id)
          .single();
        
        if (data) setLifetimeCount(data.lifetime_creations);
      }
    }
    getUserData();
  }, [count]); 

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/"); 
  };

  const handleCreateRequest = () => {
    if (count >= STORAGE_LIMIT) {
      alert("Storage full! Please delete old snippets or upgrade.");
      return;
    }
    if (lifetimeCount >= LIFETIME_LIMIT) {
      alert("Lifetime free limit reached! Upgrade to continue creating snippets.");
      return;
    }
    onNewSnippet();
  };

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0B0B0C] h-screen">
      <div className="p-6 pb-2">
        <h2 className="text-xl font-bold italic font-serif mb-6">
          Snippet<span className="text-purple-500">Flow</span>
        </h2>
        
        <div className="mb-4 px-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-1">Welcome back,</p>
          <h3 className="text-lg font-medium text-white tracking-tight">{userName}</h3>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-medium text-purple-400">
          <Home size={16} /> Dashboard
        </button>
        
        <button 
          onClick={handleCreateRequest}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all group ${
            count >= STORAGE_LIMIT ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/5 text-gray-400'
          }`}
        >
          <Plus size={16} className="group-hover:text-purple-500" /> New Snippet
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 rounded-xl text-xs font-medium text-gray-500 hover:text-red-500 transition-all group"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Logout
        </button>

        <div className="pt-8 pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-4 px-4">Resources</p>
          <div className="space-y-1">
            <Link to="/about" className="flex items-center justify-between w-full px-4 py-2 text-[11px] text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <Info size={14} className="group-hover:text-purple-500" /> 
                <span>About</span>
              </div>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link to="/guide" className="flex items-center justify-between w-full px-4 py-2 text-[11px] text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <BookOpen size={14} className="group-hover:text-purple-500" /> 
                <span>User Guide</span>
              </div>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link to="/privacy" className="flex items-center justify-between w-full px-4 py-2 text-[11px] text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
              <div className="flex items-center gap-3">
                <ShieldCheck size={14} className="group-hover:text-purple-500" /> 
                <span>Privacy Policy</span>
              </div>
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Usage Meter Section */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
          <span>Storage</span>
          <span className={count >= STORAGE_LIMIT ? "text-red-500 animate-pulse" : ""}>{count} / {STORAGE_LIMIT}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full transition-all duration-700 ease-in-out ${count >= STORAGE_LIMIT ? 'bg-red-500' : 'bg-purple-500'}`} 
            style={{ width: `${storagePercentage}%` }} 
          />
        </div>
        
        {lifetimeCount >= (LIFETIME_LIMIT * 0.8) && (
          <div className="flex items-center gap-2 mb-3 text-[9px] text-orange-400 font-bold uppercase tracking-tighter animate-pulse">
            <AlertCircle size={10} />
            <span>Lifetime: {LIFETIME_LIMIT - lifetimeCount} credits left</span>
          </div>
        )}

        <button className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}