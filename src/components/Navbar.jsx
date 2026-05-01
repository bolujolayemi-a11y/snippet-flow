import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      {/* 1. Added w-full to ensure the flex container fills the screen.
          2. Used px-5 for a slightly better balance on small screens.
      */}
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-6">
        
        {/* 3. Added leading-none to prevent the italic text from 
             getting cut off at the top/bottom.
        */}
        <Link to="/" className="text-lg md:text-xl font-bold tracking-tighter italic cursor-pointer shrink-0 leading-none">
          Snippet<span className="text-purple-500">Flow</span>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-8">
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
            className="rounded-full bg-white px-3.5 py-2 md:px-5 md:py-2 text-[10px] md:text-sm font-bold text-black hover:bg-gray-200 transition-all active:scale-95 cursor-pointer inline-block whitespace-nowrap shadow-lg shadow-white/5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}