import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-3xl mx-auto">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors mb-8 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Go Back
      </button>

      <h1 className="text-4xl font-bold italic font-serif mb-8 text-white">
        About <span className="text-purple-500">SnippetFlow</span>
      </h1>

      <div className="space-y-6 text-gray-400 leading-relaxed text-sm">
        <p>
          SnippetFlow was born out of a simple need: a clean, fast, and 
          distraction-free environment for developers to store their most used code blocks.
        </p>
        <p>
          As developers, we often find ourselves rewriting the same utility functions, 
          CSS animations, or React hooks. SnippetFlow provides a centralized, 
          cloud-synced dashboard to manage these assets with ease.
        </p>
        
        <h2 className="text-white font-bold text-lg pt-4 italic">The Philosophy</h2>
        <p>
          We believe in software that stays out of your way. That's why SnippetFlow 
          is built with a minimalist interface, zero ads, and a focus on performance. 
          Your code is your flow, we're just here to keep it moving.
        </p>
      </div>
    </div>
  );
}