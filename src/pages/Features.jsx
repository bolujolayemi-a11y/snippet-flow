import { Link } from "react-router-dom";
import { Code, Share2, Search, Zap, Layout, Globe, ArrowLeft } from "lucide-react"; 

export default function Features() {
  const features = [
    {
      icon: <Code className="text-purple-500" />,
      title: "Syntax Highlighting",
      desc: "Support for 50+ languages including React, Python, and SQL with automatic theme matching."
    },
    {
      icon: <Zap className="text-purple-500" />,
      title: "Instant Copy",
      desc: "Copy your best snippets to your clipboard with a single keystroke or click. Zero friction."
    },
    {
      icon: <Search className="text-purple-500" />,
      title: "Semantic Search",
      desc: "Find that one snippet you wrote 6 months ago instantly with our lightning-fast search."
    },
    {
      icon: <Layout className="text-purple-500" />,
      title: "Bento Organization",
      desc: "Organize your snippets into beautiful, visual folders that make browsing a pleasure."
    },
    {
      icon: <Share2 className="text-purple-500" />,
      title: "Team Sharing",
      desc: "Share private snippet libraries with your team to maintain code consistency across projects."
    },
    {
      icon: <Globe className="text-purple-500" />,
      title: "Cloud Sync",
      desc: "Your snippets are synced across all your devices and editors in real-time."
    }
  ];

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
      
     
     {/* CHANGED: Adjusted 'top' value so it sits below the fixed Navbar */}
      <Link 
        to="/" 
        className="absolute top-28 left-6 z-40 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all group bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
        >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </Link>

      {/* Header Section */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight italic">
          Built for the <span className="text-purple-500 underline decoration-purple-500/30">modern</span> workflow
        </h1>
        <p className="mt-6 text-gray-400 max-w-2xl mx-auto text-lg">
          Everything you need to stop wasting time on repetitive tasks and focus on building great products.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, index) => (
          <div 
            key={index} 
            className="group p-8 rounded-3xl border border-white/5 bg-white/2 hover:bg-white/4 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>

     {/* Bottom CTA */}    
        <div className="mt-32 relative py-20 px-6 rounded-4xl border border-white/5 bg-white/2 overflow-hidden text-center">
            {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-64 w-full -translate-x-1/2 -translate-y-1/2 bg-purple-600/10 blur-[100px] rounded-full" />
  
        <h2 className="text-3xl md:text-5xl font-bold italic tracking-tighter">
            Ready to streamline your <span className="text-purple-500">code?</span>
        </h2>
             <p className="mt-4 text-gray-400 max-w-md mx-auto">
                Join the developers already saving hours every week with SnippetFlow.
            </p>
  
            <Link 
                to="/signup" 
                className="mt-10 inline-block bg-white text-black px-10 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95 cursor-pointer shadow-xl shadow-white/5"
             >
                Get Started for Free
            </Link>
        </div>
    </div>
  );
}