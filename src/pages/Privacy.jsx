import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-32 pb-20 px-8 max-w-3xl mx-auto text-sm">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-gray-500 hover:text-purple-500 transition-colors mb-8 text-[10px] uppercase tracking-[0.2em] font-bold"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Go Back
      </button>

      <h1 className="text-4xl font-bold italic font-serif mb-8">
        Privacy <span className="text-purple-500">Policy</span>
      </h1>

      <div className="space-y-8 text-gray-400 leading-relaxed">
        <section>
          <h2 className="text-white font-bold mb-2">Data Collection</h2>
          <p>We only store the data you explicitly provide: your account credentials and your code snippets. We do not track your browsing activity outside of SnippetFlow.</p>
        </section>
        
        <section>
          <h2 className="text-white font-bold mb-2">Security</h2>
          <p>All snippets are stored securely via Supabase with Row Level Security (RLS) enabled. Only you have access to your private snippets.</p>
        </section>

        <section>
          <h2 className="text-white font-bold mb-2">Third Parties</h2>
          <p>SnippetFlow does not sell your data to third parties. We are a developer-first tool, not an advertising platform.</p>
        </section>
      </div>
    </div>
  );
}