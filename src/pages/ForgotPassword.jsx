import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password", // Change this when you deploy
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Check your email for the password reset link!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-purple-400 transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Login
          </Link>
          <h2 className="text-3xl font-bold italic font-serif">
            Reset <span className="text-purple-500">Password</span>
          </h2>
          <p className="text-gray-500 text-sm mt-3">Enter your email and we'll send you a link.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6 mt-8">
          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@example.com"
                className="w-full bg-white/3 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-white/5"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <div className={`p-4 rounded-2xl text-xs text-center font-medium ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}