import { Link, useNavigate } from "react-router-dom"; 
import { Check, ArrowLeft } from "lucide-react"; 
import { supabase } from "../lib/supabase"; 

export default function Pricing() {
  const navigate = useNavigate();

  const handlePlanSelection = async (plan) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/signup");
      return;
    }

    if (plan.name === "Free") {
      navigate("/dashboard");
    } else {
      console.log(`Redirecting to Stripe for ${plan.name}...`);
      navigate("/dashboard");
    }
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      duration: "forever",
      features: ["Up to 20 snippets", "Basic search", "Web access"],
      cta: "Get Started",
      featured: false,
    },
    {
      name: "Pro",
      price: "$10",
      duration: "per month",
      features: ["Unlimited snippets", "Smart search", "VS Code Extension", "Cloud Sync"],
      cta: "Go Pro",
      featured: true, 
    },
    {
      name: "Creator",
      price: "$100",
      duration: "per year",
      features: ["All Pro features", "Team sharing", "Custom tags", "Priority support"],
      cta: "Join as Creator",
      featured: false,
    },
    {
      name: "Lifetime",
      price: "$500",
      duration: "one-time",
      features: ["All future updates", "Unlimited teams", "Private beta access", "VIP support"],
      cta: "Get Lifetime",
      featured: false,
    },
  ];

  return (
    // Added pt-24/32 to ensure the fixed Navbar doesn't cover the button
    <div className="pt-24 md:pt-32 pb-20 px-6 max-w-7xl mx-auto">
      
      {/* FIXED BACK BUTTON: Removed absolute, added margin-bottom for clean spacing */}
      <div className="flex mb-8 md:mb-12">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all group bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </Link>
      </div>

      <div className="text-center mb-16 md:mb-24">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight italic">
          Pricing <span className="text-purple-500 font-serif">Plans</span>
        </h1>
        <p className="mt-4 text-gray-400 text-sm md:text-lg">
          Choose the plan that fits your workflow.
        </p>
      </div>

      {/* Grid: Changed to 2 columns on tablet (md:grid-cols-2) for better readability */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div 
            key={index}
            className={`relative rounded-4xl p-8 border transition-all duration-300 flex flex-col ${
              plan.featured 
              ? "bg-white/5 border-purple-500/50 shadow-2xl shadow-purple-500/10 lg:scale-105 z-10" 
              : "bg-white/2 border-white/5 hover:border-white/10"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Popular
              </span>
            )}

            <div className="mb-8">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500 text-xs">/{plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                  <span className="leading-tight font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePlanSelection(plan)}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 ${
                plan.featured 
                ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20" 
                : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}