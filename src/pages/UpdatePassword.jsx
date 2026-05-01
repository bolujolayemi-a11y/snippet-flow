import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"; // Added Eye icons

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for toggle
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setIsSuccess(true);
      setLoading(false);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold italic font-serif">
            New <span className="text-purple-500">Password</span>
          </h2>
          <p className="text-gray-500 text-sm mt-3">Enter your new secure password below.</p>
        </div>

        {isSuccess ? (
          <div className="bg-green-500/10 border border-green-500/20 p-8 rounded-3xl text-center space-y-4">
            <div className="flex justify-center text-green-500">
              <CheckCircle2 size={48} />
            </div>
            <p className="text-sm font-medium text-green-400">Password updated! Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6 mt-8">
            <div className="relative group">
              <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input 
                  required
                  type={showPassword ? "text" : "password"} // Dynamic type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="******"
                  className="w-full bg-white/3 border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white"
                />
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-500 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs text-center font-medium">{error}</p>}

            <button 
              disabled={loading}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}