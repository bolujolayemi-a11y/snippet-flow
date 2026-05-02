import { ArrowLeft, Code2, LayoutDashboard, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Guide() {
  const navigate = useNavigate();
  
  const steps = [
    { 
      title: "Sync & Store", 
      icon: <Code2 size={24} />,
      desc: "Centralize your logic. Save React hooks, CSS animations, or utility functions in a secure, cloud-synced vault." 
    },
    { 
      title: "Organize", 
      icon: <LayoutDashboard size={24} />,
      desc: "Navigate through your personal library with our streamlined sidebar. Find what you need, when you need it." 
    },
    { 
      title: "Instant Flow", 
      icon: <Zap size={24} />,
      desc: "Use our one-tap copy system to move code from SnippetFlow directly into your IDE without losing your rhythm." 
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors mb-12 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Return to App
      </button>

      <div className="text-left mb-16 border-l-2 border-purple-500 pl-6">
        <h1 className="text-4xl font-bold italic font-serif text-white">Platform <span className="text-purple-500">Guide</span></h1>
        <p className="text-gray-500 mt-2 text-sm uppercase tracking-widest">Mastering the Developer Workflow</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="p-8 bg-[#0B0B0C] border border-white/5 rounded-4xl hover:border-purple-500/30 transition-all group relative overflow-hidden">
            <div className="text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-500">
              {step.icon}
            </div>
            <h3 className="text-white text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            <div className="absolute -bottom-2 -right-2 text-white/5 font-black text-6xl italic select-none">
              0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}