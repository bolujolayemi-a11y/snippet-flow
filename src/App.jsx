import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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

import About from "./pages/About";
import Guide from "./pages/Guide";
import Privacy from "./pages/Privacy";

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  return (
    /* FIX: Added 'w-full' and 'overflow-x-hidden'. 
       This prevents the "shaking" and "cutting off" 
       on mobile by locking the width to the screen.
    */
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0B0B0C] text-white selection:bg-purple-500/30 font-sans flex flex-col">
      {!isDashboard && <Navbar />}
      
      <main className="flex-1 w-full">
        {children}
      </main>

      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
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
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;