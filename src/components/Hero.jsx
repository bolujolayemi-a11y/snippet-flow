import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center pt-40 pb-20 text-center">
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 -z-10 h-125 w-125 bg-purple-600/20 blur-[120px] rounded-full" />

      <div className="px-6">
        <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-8xl">
          Stop rewriting the <br />
          <span className="bg-linear-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            same code twice.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl mx-auto text-lg text-gray-400 md:text-xl">
          The lightweight productivity tool for developers to save, organize, 
          and instantly reuse your best snippets and UI components.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          {/* Main CTA: Leads to Signup */}
          <Link 
            to="/signup" 
            className="rounded-xl bg-purple-600 px-8 py-4 font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all active:scale-95 cursor-pointer inline-block"
          >
            Start Saving Snippets
          </Link>
          
          {/* Secondary CTA: Leads to Features/Demo */}
          <Link 
            to="/demo" 
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 font-bold hover:bg-white/10 transition-colors cursor-pointer inline-block"
          >
            View Demo
          </Link>
        </div>
      </div>
    </section>
  );
}