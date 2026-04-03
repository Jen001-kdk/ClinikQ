import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { 
  FaEnvelope, FaLock, FaStethoscope, FaPills, FaHeartbeat, FaBandAid
} from 'react-icons/fa';
import axios from 'axios';
import ErrorToast from '../../components/ErrorToast';

// --- Floating Background Component ---
const FloatingBackground = () => {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const medicalIcons = [FaStethoscope, FaPills, FaHeartbeat, FaBandAid];
    const generatedIcons = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      Icon: medicalIcons[i % medicalIcons.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 15 + 15,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 5,
      color: '#0D948815'
    }));
    setIcons(generatedIcons);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F8FAFC]">
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute"
          style={{ left: `${item.x}%`, top: `${item.y}%`, color: item.color }}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: item.duration, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
        >
          <item.Icon size={item.size} />
        </motion.div>
      ))}
    </div>
  );
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-all duration-300">
        <Icon size={14} />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] text-sm text-[#1E293B] font-semibold placeholder:text-[#CBD5E1] focus:outline-none focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all duration-300 shadow-sm"
      />
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [registeredName, setRegisteredName] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    if (savedName) setRegisteredName(savedName);
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill all fields!");
      setShowError(true);
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:5001/api/login', formData);
      
      if (response.status === 200) {
        const { role, token, specialization, user } = response.data;
        
        if (user) {
          if (role === 'patient') {
            localStorage.setItem('clinikq_patient_data', JSON.stringify(user));
          } else if (role === 'doctor') {
            localStorage.setItem('clinikq_doctor_data', JSON.stringify(user));
          }
        }
        
        localStorage.setItem('userRole', role);
        localStorage.setItem('token', token);
        if (specialization) localStorage.setItem('specialization', specialization);
        
        navigate(`/${role}/dashboard`);
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = error.response?.data?.message || "Authentication Failed: Invalid credentials.";
      setErrorMessage(msg);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative font-sans overflow-hidden">
      <FloatingBackground />
      
      <ErrorToast 
        message={errorMessage}
        isVisible={showError} 
        onClose={() => setShowError(false)} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="w-full max-w-[500px] bg-white rounded-[24px] shadow-[0_30px_70px_-20px_rgba(15,23,42,0.12)] border border-white relative z-10 p-12 flex flex-col gap-8"
      >
        <div className="text-center">
          <div className="text-3xl font-black text-[#9d4ead] italic mb-3 tracking-tighter">ClinikQ</div>
          <h2 className="text-2xl font-black text-[#1E293B]">
            Welcome..
          </h2>
          <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-[0.2em]">Manage your medical data</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <InputField label="Email Address" type="email" name="email" icon={FaEnvelope} placeholder="john@clinikq.com" onChange={handleInputChange} required />
          <InputField label="Password" type="password" name="password" icon={FaLock} placeholder="••••••••" onChange={handleInputChange} required />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#0D9488] focus:ring-[#0D9488]/20 transition-all" />
              <span className="text-[11px] font-black text-[#64748B] uppercase tracking-wider group-hover:text-[#1E293B] transition-colors">Keep me active</span>
            </label>
            <span className="text-[11px] font-black text-[#0D9488] uppercase tracking-wider cursor-pointer hover:underline">Lost access?</span>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-[#0D9488] text-white rounded-[16px] font-black text-sm shadow-xl shadow-[#0D9488]/20 hover:bg-[#0F766E] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 uppercase tracking-widest mt-2"
          >
            Authorize Entry
          </button>
        </form>

        <p className="text-center text-[13px] font-bold text-[#64748B]">
          New User? <Link to="/register" className="text-[#0D9488] font-black hover:underline hover:text-[#0F766E] transition-colors ml-1">Establish Record</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
