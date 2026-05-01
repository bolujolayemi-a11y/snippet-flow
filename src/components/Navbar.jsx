import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-6">
        
        {/* Logo */}
        <Link to="/" className="text-lg md:text-xl font-bold tracking-tighter italic cursor-pointer shrink-0 leading-none text-white">
          Snippet<span className="text-purple-500">Flow</span>
        </Link>
        
        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-8">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="hover:text-white transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
          
          <Link 
            to="/signup" 
            className="rounded-full bg-white px-3.5 py-2 md:px-5 md:py-2 text-[10px] md:text-sm font-bold text-black hover:bg-gray-200 transition-all active:scale-95 cursor-pointer inline-block whitespace-nowrap shadow-lg shadow-white/5"
          >
            Get Started
          </Link>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-400 hover:text-white md:hidden transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-[#0B0B0C] border-b border-white/5 p-6 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}