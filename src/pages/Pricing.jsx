import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { Check, ArrowLeft } from "lucide-react"; 
import { supabase } from "../lib/supabase"; // Import your supabase client

export default function Pricing() {
  const navigate = useNavigate();

  const handlePlanSelection = async (plan) => {
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // If not logged in, send them to signup
      navigate("/signup");
      return;
    }

    // 2. If it's the Free plan, just go to Dashboard
    if (plan.name === "Free") {
      navigate("/dashboard");
    } else {
      // 3. If it's a paid plan, this is where you'd trigger Stripe
      console.log(`Redirecting to Stripe for ${plan.name}...`);
      // For now, let's just go to dashboard so you can test the flow
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
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
      <Link 
        to="/" 
        className="absolute top-24 left-6 z-50 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all group bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span>Back</span>
      </Link>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight italic">
          Pricing <span className="text-purple-500 font-serif">Plans</span>
        </h1>
        <p className="mt-4 text-gray-400 text-lg">
          Choose the plan that fits your workflow.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan, index) => (
          <div 
            key={index}
            className={`relative rounded-3xl p-8 border transition-all duration-300 flex flex-col ${
              plan.featured 
              ? "bg-white/5 border-purple-500/50 shadow-2xl shadow-purple-500/10 scale-105 z-10" 
              : "bg-white/2 border-white/5 hover:border-white/10"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Popular
              </span>
            )}

            <div className="mb-8">
              <h3 className="text-gray-400 font-medium mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.duration}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-center gap-3 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-purple-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handlePlanSelection(plan)}
              className={`w-full py-3 rounded-xl font-bold text-center transition-all active:scale-95 ${
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