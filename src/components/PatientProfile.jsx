import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, 
  FaVenusMars, FaTint, FaEdit, FaSave, FaTimes, FaStethoscope, FaPills, FaHeartbeat, FaBandAid
} from 'react-icons/fa';

// --- Floating Background Component (3% Opacity) ---
const FloatingBackground = () => {
  const [icons, setIcons] = useState([]);

  useEffect(() => {
    const medicalIcons = [FaStethoscope, FaPills, FaHeartbeat, FaBandAid];
    const generatedIcons = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      Icon: medicalIcons[i % medicalIcons.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
    }));
    setIcons(generatedIcons);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
      {icons.map((item) => (
        <motion.div
           key={item.id}
           className="absolute text-gray-400"
           style={{ left: `${item.x}%`, top: `${item.y}%` }}
           animate={{ 
             y: [0, -30, 0], 
             rotate: [0, 10, -10, 0],
             scale: [1, 1.1, 1]
           }}
           transition={{ 
             duration: item.duration, 
             repeat: Infinity, 
             delay: item.delay, 
             ease: "easeInOut" 
           }}
        >
           <item.Icon size={item.size} />
        </motion.div>
      ))}
    </div>
  );
};

// --- Standardized Info Field Component ---
const InfoField = ({ label, value, icon: Icon, isEditing, name, onChange, type = "text", placeholder, options }) => {
  return (
    <motion.div 
      layout
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col gap-2 w-full mb-4"
    >
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">
        {label}
      </label>
      <div className={`relative h-[52px] transition-all duration-400 ease-in-out rounded-[12px] overflow-hidden ${
        isEditing 
          ? 'bg-white ring-2 ring-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.08)]' 
          : 'bg-[#F1F5F9] border-transparent'
      } border`}>
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-400 ${
          isEditing ? 'text-cyan-500' : 'text-gray-400'
        }`}>
          <Icon size={16} />
        </div>
        
        {options && isEditing ? (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full h-full bg-transparent pl-12 pr-4 text-sm font-extrabold text-[#1E293B] focus:outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>{placeholder || `Select ${label}`}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            readOnly={!isEditing}
            placeholder={placeholder}
            className={`w-full h-full bg-transparent pl-12 pr-4 text-sm font-extrabold text-[#1E293B] focus:outline-none transition-all duration-400 ${
              !isEditing ? 'cursor-default' : 'cursor-text'
            }`}
          />
        )}
      </div>
    </motion.div>
  );
};

const PatientProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    bloodType: '',
    contact: '',
    address: ''
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer \${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/user/profile', profile, {
        headers: { Authorization: `Bearer \${token}` }
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-cyan-100 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full relative p-6 lg:p-0 font-sans">
      <FloatingBackground />
      
      {/* Top Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-12 relative z-10"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tight leading-tight">
              {profile.name || 'Loading...'}
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-1">Patient Identifier: PAT-{String(profile._id || '0000').slice(-6).toUpperCase()}</p>
          </div>
          
          <div className="flex items-center gap-2.5">
             <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black border border-rose-100 uppercase tracking-widest shadow-sm">
                {profile.bloodType || 'N/A'} Group
             </span>
             <span className="px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black border border-cyan-100 uppercase tracking-widest shadow-sm">
                {profile.gender || 'N/A'}
             </span>
             <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black border border-indigo-100 uppercase tracking-widest shadow-sm">
                {profile.age || 'N/A'} Years
             </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[24px] border border-gray-100 shadow-[0_25px_60px_rgba(0,0,0,0.03)] overflow-hidden relative z-10"
      >
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Personal Information</h2>
          
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.button
                key="edit-btn"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-cyan-600 font-extrabold text-sm hover:text-cyan-700 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                  <FaEdit size={12} />
                </div>
                Edit Profile
              </motion.button>
            ) : (
              <motion.div 
                key="action-btns"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-[12px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-[12px] font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
                >
                  {saving ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <FaSave />
                  )}
                  Save Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 grid grid-cols-12 gap-10">
          {/* Left Column (8 Columns) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col pt-1">
            <InfoField 
              label="Full Legal Name" 
              name="name"
              value={profile.name} 
              icon={FaUser} 
              isEditing={isEditing} 
              onChange={handleChange}
              placeholder="e.g. Johnathan Doe"
            />
            <InfoField 
              label="Primary Phone Number" 
              name="contact"
              value={profile.contact} 
              icon={FaPhone} 
              isEditing={isEditing} 
              onChange={handleChange}
              placeholder="e.g. +1 (555) 000-0000"
            />
            <InfoField 
              label="Email Address" 
              name="email"
              value={profile.email} 
              icon={FaEnvelope} 
              isEditing={false} 
              placeholder="e.g. john.doe@clinikq.com"
            />
            <InfoField 
              label="Residential Address" 
              name="address"
              value={profile.address} 
              icon={FaMapMarkerAlt} 
              isEditing={isEditing} 
              onChange={handleChange}
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
            />
          </div>
          
          {/* Right Column (4 Columns) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col pt-1">
            <InfoField 
              label="Biological Age" 
              name="age"
              value={profile.age} 
              icon={FaCalendarAlt} 
              isEditing={isEditing} 
              onChange={handleChange}
              type="number"
              placeholder="e.g. 28"
            />
            <InfoField 
              label="Gender Designation" 
              name="gender"
              value={profile.gender} 
              icon={FaVenusMars} 
              isEditing={isEditing} 
              onChange={handleChange}
              options={['Male', 'Female', 'Other', 'Prefer not to say']}
              placeholder="Select Gender"
            />
            <InfoField 
              label="Blood Group" 
              name="bloodType"
              value={profile.bloodType} 
              icon={FaTint} 
              isEditing={isEditing} 
              onChange={handleChange}
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              placeholder="Select Blood Group"
            />
            
            {/* Quick Safety Note */}
            <div className="mt-4 p-5 bg-blue-50/50 rounded-[18px] border border-blue-100/50">
               <div className="flex items-center gap-3 mb-2 text-blue-600">
                  <FaHeartbeat size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Medical Record Note</span>
               </div>
               <p className="text-[11px] font-semibold text-blue-800/60 leading-relaxed">
                  These records are used for emergency identification. Ensure all clinical information is accurate and verified by your physician.
               </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security Tagline */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        className="text-center mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.45em]"
      >
        ClinikQ Secure Medical Record • AES-256 Encrypted
      </motion.p>
    </div>
  );
};

export default PatientProfile;
