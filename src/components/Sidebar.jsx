import { useState, useEffect } from "react";
import { Plus, Home, Settings, LogOut, Info, BookOpen, ShieldCheck, ExternalLink } from "lucide-react"; // Added Resource icons
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom"; // Added Link

export default function Sidebar({ count, planType, onNewSnippet }) {
  const [userName, setUserName] = useState("Developer");
  const navigate = useNavigate(); 
  const limit = 20;
  const percentage = Math.min((count / limit) * 100, 100);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0]);
      }
    }
    getUserData();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate("/"); 
    } else {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col bg-white/2 h-screen">
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
          onClick={onNewSnippet}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 rounded-xl text-xs font-medium text-gray-400 transition-colors group"
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

        {/* --- NEW: RESOURCES SECTION --- */}
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
      <div className="p-4 border-t border-white/5 bg-white/1">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">
          <span>Storage</span>
          <span>{count} / {limit}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-purple-500 transition-all duration-700 ease-in-out" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        <button className="w-full py-2 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5">
          Upgrade
        </button>
      </div>
    </aside>
  );
}