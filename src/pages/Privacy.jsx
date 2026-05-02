import { ArrowLeft, Lock, EyeOff, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-3xl mx-auto text-sm">
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-colors mb-12 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Safety
      </button>

      <h1 className="text-4xl font-black italic font-serif mb-12 text-white">
        Privacy <span className="text-purple-500">Commitment</span>
      </h1>

      <div className="space-y-12 text-gray-400 leading-relaxed">
        <section className="flex gap-6">
          <div className="mt-1 text-purple-500"><Lock size={20} /></div>
          <div>
            <h2 className="text-white font-bold mb-2 uppercase tracking-tighter">Encrypted Storage</h2>
            <p>Your code snippets are your intellectual property. We use Supabase Row Level Security (RLS) to ensure that only your authenticated session can query or modify your data.</p>
          </div>
        </section>
        
        <section className="flex gap-6">
          <div className="mt-1 text-purple-500"><EyeOff size={20} /></div>
          <div>
            <h2 className="text-white font-bold mb-2 uppercase tracking-tighter">No Tracking</h2>
            <p>We are a tool, not a data broker. SnippetFlow does not utilize third-party tracking cookies or sell user metadata to advertising networks.</p>
          </div>
        </section>

        <section className="flex gap-6">
          <div className="mt-1 text-purple-500"><Server size={20} /></div>
          <div>
            <h2 className="text-white font-bold mb-2 uppercase tracking-tighter">Data Sovereignty</h2>
            <p>You own your data. If you choose to delete your account, all associated snippets are permanently purged from our database immediately.</p>
          </div>
        </section>
      </div>
    </div>
  );
}