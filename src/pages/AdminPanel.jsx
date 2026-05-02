import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  ShieldAlert, 
  Zap, 
  RotateCcw, 
  Power, 
  Globe, 
  AlertTriangle,
  Database
} from "lucide-react";

export default function AdminPanel() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) setSettings(data);
    setLoading(false);
  }

  // 1. KILL SWITCH TOGGLE
  async function toggleKillSwitch() {
    const newState = !settings.kill_switch;
    const { error } = await supabase
      .from('admin_settings')
      .update({ kill_switch: newState })
      .eq('id', 1);
    
    if (!error) {
      setSettings({ ...settings, kill_switch: newState });
      showFeedback(newState ? "PLATFORM KILLED" : "PLATFORM RESTORED");
    }
  }

  // 2. PROVIDER TOGGLE (Groq vs HuggingFace)
  async function toggleProvider() {
    const newProvider = settings.active_provider === 'groq' ? 'huggingface' : 'groq';
    const { error } = await supabase
      .from('admin_settings')
      .update({ active_provider: newProvider })
      .eq('id', 1);
    
    if (!error) {
      setSettings({ ...settings, active_provider: newProvider });
      showFeedback(`SWITCHED TO ${newProvider.toUpperCase()}`);
    }
  }

  // 3. GLOBAL CREDIT RESET (Safety check included)
  async function resetAllCredits() {
    const confirmReset = window.confirm("Are you sure? This will set everyone back to 0 lifetime creations.");
    if (!confirmReset) return;

    const { error } = await supabase
      .from('profiles')
      .update({ lifetime_creations: 0 });

    if (!error) showFeedback("ALL USER CREDITS RESET");
  }

  function showFeedback(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-mono uppercase tracking-[0.5em]">
      <Database className="animate-pulse mb-4 text-purple-500" />
      Authenticating Owner...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-purple-500">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-purple-500">
              <ShieldAlert size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Owner Privilege Level</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter leading-none">
              ADMIN<span className="text-purple-500">CONTROL</span>
            </h1>
            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-3">
              Encrypted Tunnel Active: <span className="text-gray-300">bolujolayemi@gmail.com</span>
            </p>
          </div>

          {message && (
            <div className="bg-purple-600 text-[10px] font-black px-4 py-2 rounded shadow-lg shadow-purple-500/20 animate-bounce">
              {message}
            </div>
          )}
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* THE KILL SWITCH (Bento Large) */}
          <div className={`col-span-1 md:col-span-2 p-10 rounded-[2.5rem] border transition-all duration-500 ${
            settings.kill_switch 
            ? 'bg-red-950/20 border-red-500/50' 
            : 'bg-[#0B0B0C] border-white/5 hover:border-white/10'
          }`}>
            <div className="flex justify-between items-start mb-16">
              <div className={`p-4 rounded-2xl ${settings.kill_switch ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                <Power size={32} />
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest ${
                settings.kill_switch ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500/10 text-green-500'
              }`}>
                {settings.kill_switch ? "SYSTEM TERMINATED" : "PLATFORM LIVE"}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Master Kill Switch</h2>
            <p className="text-gray-500 text-sm mb-10 max-w-sm leading-relaxed">
              Instantly disable all AI functions and lock the frontend. Use this in case of lease breach or emergency.
            </p>
            
            <button 
              onClick={toggleKillSwitch}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 ${
                settings.kill_switch 
                ? 'bg-red-500 hover:bg-red-400 text-white' 
                : 'bg-white/5 hover:bg-white/10 text-red-500 border border-red-500/20'
              }`}
            >
              {settings.kill_switch ? "Restore Platform Access" : "Execute Master Kill Switch"}
            </button>
          </div>

          {/* AI PROVIDER CONTROL */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B0B0C] border border-white/5 flex flex-col justify-between group hover:border-purple-500/30 transition-all">
            <Zap className="text-purple-500 group-hover:scale-110 transition-transform" size={32} />
            <div>
              <h3 className="font-bold text-xl mb-1">AI Provider</h3>
              <p className="text-gray-500 text-xs mb-6 uppercase tracking-tighter font-mono">Current: {settings.active_provider}</p>
              <button 
                onClick={toggleProvider}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Switch Provider
              </button>
            </div>
          </div>

          {/* GLOBAL RESET */}
          <div 
            onClick={resetAllCredits}
            className="p-10 rounded-[2.5rem] bg-[#0B0B0C] border border-white/5 flex flex-col justify-between hover:border-blue-500/30 transition-all cursor-pointer group"
          >
            <RotateCcw className="text-blue-500 group-hover:-rotate-45 transition-transform" size={32} />
            <div>
              <h3 className="font-bold text-xl mb-1">Mass Credit Reset</h3>
              <p className="text-gray-500 text-xs">Set all user lifetime counters back to zero.</p>
            </div>
          </div>

          {/* LEASE EXPIRY */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B0B0C] border border-white/5 flex flex-col justify-between">
            <Globe className="text-orange-500" size={32} />
            <div>
              <h3 className="font-bold text-xl mb-1">Lease Status</h3>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Expiry: {new Date(settings.lease_expiry).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* MAINTENANCE MODE */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B0B0C] border border-white/5 flex flex-col justify-between hover:border-orange-500/30 transition-all">
             <AlertTriangle className="text-orange-500" size={32} />
             <div>
               <h3 className="font-bold text-xl mb-1">Maintenance</h3>
               <p className="text-gray-500 text-xs mb-4">Toggle maintenance overlay.</p>
               <div className="w-12 h-6 bg-white/5 rounded-full relative p-1 cursor-not-allowed">
                 <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}