import { ArrowLeft, User, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-3xl mx-auto font-sans">
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors mb-12 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="text-5xl font-black italic font-serif mb-10 text-white leading-tight">
        Built for <span className="text-purple-500">Speed</span>, <br />Designed for Focus.
      </h1>

      <div className="space-y-8 text-gray-400 leading-loose text-[15px]">
        <p>
          SnippetFlow was architected for developers who are tired of digging through 
          old project folders to find that one utility function they wrote months ago. 
          It's a digital safe for the logic that defines your craft.
        </p>

        <div className="p-8 bg-[#0B0B0C] border border-white/5 rounded-3xl">
          <h2 className="text-white font-bold text-lg mb-4 italic tracking-tight">The Core Philosophy</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Developer tools should be invisible. They should exist to keep 
            you in the "flow state" longer. That means no ads, no bloat, and no unnecessary 
            distractions. Just you and your code.
          </p>
        </div>

        {/* Updated Footer Section */}
        <div className="pt-10 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity duration-500">
           <div className="flex items-center gap-3 text-gray-500">
              <User size={16} className="text-purple-500" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Independent Developer</span>
           </div>
           <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">
              <span>v1.0.4 Stable</span>
              <ExternalLink size={12} />
           </div>
        </div>
      </div>
    </div>
  );
}