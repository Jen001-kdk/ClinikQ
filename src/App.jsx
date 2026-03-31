import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientsDashboard from "./pages/PatientsDashboard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import ErrorBoundary from "./components/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";

const SplashScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      <div className="text-[60px] font-black text-[#9d4ead] italic mb-4">
        ClinikQ
      </div>
      <div className="w-48 h-1 bg-[#F1F5F9] rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#0D9488]"
        />
      </div>
    </motion.div>
  </motion.div>
);

function App() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Show splash only if it's the root route and hasn't shown yet in this session
    const isRoot = window.location.pathname === "/";
    const hasShown = sessionStorage.getItem("splashShown");
    
    if (isRoot && !hasShown) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("splashShown", "true");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <AnimatePresence>
          {showSplash && <SplashScreen />}
        </AnimatePresence>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/patient/dashboard" element={<PatientsDashboard initialTab="dashboard" />} />
          <Route path="/patient/book-token" element={<PatientsDashboard initialTab="book" />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
