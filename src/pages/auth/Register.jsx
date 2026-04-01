import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from "react-router-dom";
import { 
  FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt, 
  FaBirthdayCake, FaVenusMars, FaTint, FaGraduationCap, FaStethoscope,
  FaIdCard, FaPills, FaHeartbeat, FaBandAid
} from 'react-icons/fa';
import axios from 'axios';
import ErrorToast from '../../components/ErrorToast';
import StatusModal from '../../components/dashboard/StatusModal';

// --- Floating Background Component ---
const FloatingBackground = ({ role }) => {
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
      color: role === 'doctor' ? '#06B6D415' : '#0D948815'
    }));
    setIcons(generatedIcons);
  }, [role]);

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
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-all duration-300 pointer-events-none">
        <Icon size={14} />
      </div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] text-sm text-[#1E293B] font-semibold placeholder:text-[#CBD5E1] focus:outline-none focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all duration-300 shadow-sm"
      />
    </div>
  </div>
);

const SelectField = ({ label, icon: Icon, options, ...props }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0D9488] transition-all duration-300 pointer-events-none">
        <Icon size={14} />
      </div>
      <select
        {...props}
        className="w-full pl-10 pr-10 py-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[16px] text-sm text-[#1E293B] font-semibold focus:outline-none focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/5 transition-all duration-300 appearance-none cursor-pointer shadow-sm"
      >
        <option value="" disabled>{props.placeholder || `Select ${label}`}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const closeStatusModal = () => {
    setStatusModal(prev => ({ ...prev, isOpen: false }));
    if (statusModal.type === 'success') {
      navigate('/login');
    }
  };
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    age: '', gender: '', bloodType: '', contact: '', address: '',
    degree: '', specialization: '', license: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const requiredFields = role === 'patient' 
      ? ['name', 'email', 'password', 'confirmPassword', 'age', 'gender', 'bloodType', 'contact', 'address']
      : ['name', 'email', 'password', 'confirmPassword', 'degree', 'specialization', 'license'];
      
    for (const field of requiredFields) {
      if (!formData[field]) {
        setErrorMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        setShowError(true);
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setShowError(true);
      return;
    }
    
    try {
      const payload = { ...formData, role };
      const response = await axios.post('http://localhost:5001/api/register', payload);
      
      if (response.status === 201) {
        setStatusModal({
          isOpen: true,
          title: 'Account Established',
          message: 'Your medical profile has been successfully created. You can now sign in to your dashboard.',
          type: 'success'
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const msg = error.response?.data?.error || "Registration Failed: Network or Server Error.";
      setErrorMessage(msg);
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative font-sans overflow-y-auto">
      <FloatingBackground role={role} />
      
      <ErrorToast 
        message={errorMessage} 
        isVisible={showError} 
        onClose={() => setShowError(false)} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        className="w-full max-w-[800px] bg-white rounded-[24px] shadow-[0_30px_70px_-20px_rgba(15,23,42,0.12)] border border-white relative z-10 p-12 flex flex-col gap-10"
      >
        <div className="flex flex-col items-center">
          <div className="text-3xl font-black text-[#9d4ead] italic mb-3 tracking-tighter">ClinikQ</div>
          <h1 className="text-2xl font-black text-[#1E293B]">Access Patient Portal</h1>
          <p className="text-xs font-bold text-[#64748B] mt-2 uppercase tracking-[0.2em]">Join our medical network</p>
        </div>

        <div className="flex justify-center">
          <div className="bg-[#F1F5F9] p-1.5 rounded-[18px] flex relative w-full max-w-[320px] shadow-inner">
            <motion.div 
              className="absolute top-1.5 bottom-1.5 bg-white rounded-[14px] shadow-lg shadow-black/5"
              initial={false}
              animate={{ x: role === 'patient' ? 0 : '100%' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{ width: 'calc(50% - 6px)' }}
            />
            <button 
              onClick={() => setRole('patient')}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${role === 'patient' ? 'text-[#0D9488]' : 'text-[#94A3B8]'}`}
            >
              Patient
            </button>
            <button 
              onClick={() => setRole('doctor')}
              className={`relative z-10 flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 ${role === 'doctor' ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`}
            >
              Doctor
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {role === 'patient' ? (
              <motion.div 
                key="patient-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
              >
                <div className="space-y-6">
                  <InputField label="Full Name" name="name" icon={FaUser} placeholder="John Doe" onChange={handleInputChange} required />
                  <InputField label="Email Address" type="email" name="email" icon={FaEnvelope} placeholder="john@clinikq.com" onChange={handleInputChange} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Password" type="password" name="password" icon={FaLock} placeholder="••••••••" onChange={handleInputChange} required />
                    <InputField label="Confirm" type="password" name="confirmPassword" icon={FaLock} placeholder="••••••••" onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <SelectField label="Age" name="age" icon={FaBirthdayCake} options={Array.from({length: 100}, (_, i) => `${i + 1}`)} onChange={handleInputChange} required />
                    <SelectField label="Gender" name="gender" icon={FaVenusMars} options={['Male', 'Female', 'Other']} onChange={handleInputChange} required />
                    <SelectField label="Blood" name="bloodType" icon={FaTint} options={['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']} onChange={handleInputChange} required />
                  </div>
                  <InputField label="Contact Number" name="contact" icon={FaPhone} placeholder="+977-98..." onChange={handleInputChange} required />
                  <InputField label="Home Address" name="address" icon={FaMapMarkerAlt} placeholder="Lalitpur, Nepal" onChange={handleInputChange} required />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="doctor-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
              >
                <div className="space-y-6">
                  <InputField label="Full Name" name="name" icon={FaUser} placeholder="Dr. Arvind Mehta" onChange={handleInputChange} required />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Degree / Title" name="degree" icon={FaGraduationCap} placeholder="MBBS, MD" onChange={handleInputChange} required />
                    <SelectField 
                      label="Specialization" 
                      name="specialization" 
                      icon={FaStethoscope} 
                      options={['Cardiology', 'Orthopedics', 'General Medicine']} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <InputField label="Medical License #" name="license" icon={FaIdCard} placeholder="NMC-12345" onChange={handleInputChange} required />
                </div>
                <div className="space-y-6">
                  <InputField label="Email Address" type="email" name="email" icon={FaEnvelope} placeholder="arvind@clinikq.com" onChange={handleInputChange} required />
                  <InputField label="Password" type="password" name="password" icon={FaLock} placeholder="••••••••" onChange={handleInputChange} required />
                  <InputField label="Confirm Password" type="password" name="confirmPassword" icon={FaLock} placeholder="••••••••" onChange={handleInputChange} required />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-[#F1F5F9] pt-8">
            <p className="text-[11px] font-bold text-[#64748B] flex-1 mr-8">
              By clicking "Initialize Account", you agree to ClinikQ's <span className="text-[#0D9488] cursor-pointer hover:underline">Terms of Service</span>.
            </p>
            <button 
              type="submit"
              className={`px-12 py-4 text-white rounded-[16px] font-black text-sm shadow-xl transition-all duration-300 uppercase tracking-widest hover:-translate-y-0.5 active:scale-95 ${role === 'doctor' ? 'bg-[#06B6D4] shadow-[#06B6D4]/20 hover:bg-[#0891B2]' : 'bg-[#0D9488] shadow-[#0D9488]/20 hover:bg-[#0F766E]'}`}
            >
              Initialize Account
            </button>
          </div>
        </form>

        <p className="text-center text-[13px] font-bold text-[#64748B]">
          Already registered? <Link to="/login" className="text-[#0D9488] font-black hover:underline hover:text-[#0F766E] transition-colors ml-1">Sign in to your panel</Link>
        </p>
      </motion.div>
      <StatusModal 
        isOpen={statusModal.isOpen} 
        onClose={closeStatusModal}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
};

export default Register;
