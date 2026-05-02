import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"; // Added hooks
import { supabase } from "./lib/supabase";   // Ensure your supabase client is imported
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features"; 
import Signup from "./pages/Signup";     
import Demo from "./pages/Demo";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import Dashboard from "./pages/Dashboard"; 
import Footer from "./components/Footer";

// Resources & Admin
import About from "./pages/About";
import Guide from "./pages/Guide";
import Privacy from "./pages/Privacy";
import AdminPanel from "./pages/AdminPanel"; // Your God Mode Bento

const LayoutWrapper = ({ children, isKilled }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isAdminPage = location.pathname === "/god-mode-bolu"; // Hide nav/footer on Admin too

  // If Kill Switch is flipped, show the lockdown screen instead of the app
  if (isKilled && !isAdminPage) {
    return (
      <div className="h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-10 text-center font-sans">
        <h1 className="text-6xl font-black tracking-tighter mb-4 text-red-600">OFFLINE</h1>
        <p className="text-gray-500 max-w-sm uppercase text-[10px] tracking-[0.3em] leading-loose">
          System suspended by IP owner. <br /> Maintenance or Lease renewal in progress.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0B0B0C] text-white selection:bg-purple-500/30 font-sans flex flex-col">
      {!isDashboard && !isAdminPage && <Navbar />}
      
      <main className="flex-1 w-full">
        {children}
      </main>

      {!isDashboard && !isAdminPage && <Footer />}
    </div>
  );
};

function App() {
  const [isKilled, setIsKilled] = useState(false);

  // PLATFORM GATEKEEPER: Checks the database for the Kill Switch
  useEffect(() => {
    async function checkPlatformStatus() {
      const { data } = await supabase
        .from('admin_settings')
        .select('kill_switch')
        .eq('id', 1)
        .single();
      
      if (data?.kill_switch) {
        setIsKilled(true);
      }
    }
    checkPlatformStatus();
  }, []);

  return (
    <Router>
      <LayoutWrapper isKilled={isKilled}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* MASTER CONTROLLER ROUTE - Only in your version */}
          <Route path="/god-mode-bolu" element={<AdminPanel />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;