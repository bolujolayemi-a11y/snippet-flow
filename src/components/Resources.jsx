import { BookOpen, ShieldCheck, Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function Resources() {
  const links = [
    { name: "About", icon: Info, path: "/about" },
    { name: "User Guide", icon: BookOpen, path: "/guide" },
    { name: "Privacy", icon: ShieldCheck, path: "/privacy" },
  ];

  return (
    <div className="px-4 py-4 mt-4 border-t border-white/5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-bold mb-4 px-2">
        Resources
      </p>
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <link.icon size={14} className="group-hover:text-purple-500 transition-colors" />
              <span>{link.name}</span>
            </div>
            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}