import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0B0B0C] border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          
          {/* Brand & Copyright */}
          <div className="flex flex-col items-center md:items-start group">
            <h2 className="text-xl font-bold italic font-serif tracking-tight transition-transform group-hover:scale-105 duration-300">
              Snippet<span className="text-purple-500">Flow</span>
            </h2>
            <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mt-2 font-medium">
              © {year} All Rights Reserved
            </p>
          </div>

          {/* Center Links */}
          <nav className="flex items-center gap-8 text-[11px] uppercase tracking-[0.15em] font-bold text-gray-500">
            <Link to="/about" className="hover:text-purple-400 transition-colors duration-200">About</Link>
            <Link to="/guide" className="hover:text-purple-400 transition-colors duration-200">User Guide</Link>
            <Link to="/privacy" className="hover:text-purple-400 transition-colors duration-200">Privacy</Link>
          </nav>

          {/* System Status Indicator */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white/2 border border-white/5 rounded-2xl hover:border-green-500/30 transition-colors duration-500">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            {/* FIXED: Correctly closed with </span> */}
            <span className="text-[10px] uppercase tracking-tighter text-green-500 font-bold">
              Systems Operational
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}