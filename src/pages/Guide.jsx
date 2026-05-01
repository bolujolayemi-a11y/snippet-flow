import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Guide() {
  const navigate = useNavigate();
  
  const steps = [
    { title: "Create", desc: "Click 'New Snippet' to open the editor. Give your code a title and select the language." },
    { title: "Manage", desc: "Use the side list to quickly switch between your saved logic blocks and components." },
    { title: "Deploy", desc: "Copy your code with one click and paste it directly into your local development environment." }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors mb-12 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Go Back
      </button>

      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold italic font-serif">User <span className="text-purple-500">Guide</span></h1>
        <p className="text-gray-500 mt-4 text-sm">Master your workflow in seconds.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={i} className="p-8 bg-white/2 border border-white/5 rounded-3xl hover:border-purple-500/30 transition-all group">
            <span className="text-purple-500 font-mono text-[10px] font-bold mb-4 block opacity-50 uppercase tracking-widest">Step 0{i + 1}</span>
            <h3 className="text-white text-xl font-bold mb-3 group-hover:translate-x-1 transition-transform">{step.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}