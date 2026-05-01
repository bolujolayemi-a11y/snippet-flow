import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tighter italic cursor-pointer">
          Snippet<span className="text-purple-500">Flow</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link to="/features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
          
          <Link 
            to="/signup" 
            className="rounded-full bg-white px-3 py-1.5 md:px-5 md:py-2 text-[10px] md:text-sm font-semibold text-black hover:bg-gray-200 transition-all active:scale-95 cursor-pointer inline-block whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}