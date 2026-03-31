import React, { useState, useRef } from 'react';
import { AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  FaUserInjured, FaUserMd, FaCalendarCheck, FaChartLine, FaCog, 
  FaSignOutAlt, FaSearch, FaBell, FaPlus, FaCalendarAlt, 
  FaClipboardList, FaInfoCircle, FaCheckCircle, 
  FaExclamationTriangle, FaClock, FaHeart, FaUserCircle,
  FaVenus, FaMars, FaEye, FaEdit, FaPhone, FaEnvelope, FaEllipsisV,
  FaSync, FaTimesCircle, FaCheck, FaTimes, FaTicketAlt, FaChevronDown,
  FaFileUpload, FaCloudUploadAlt, FaFileMedical, FaVial, FaXRay, FaNotesMedical, FaCheckDouble, FaPen, FaFilePdf, FaFileImage, FaUpload, FaTint,
  FaChartPie, FaArrowUp, FaArrowDown, FaStar, FaChartBar,
  FaBuilding, FaNewspaper, FaBusinessTime, FaCalendarDay, FaTooth, FaLungs, FaHeartbeat, FaBone, FaBrain, FaPills
} from 'react-icons/fa';

// Mock Data for Area Chart
const data = [
  { time: '8AM', patients: 12 },
  { time: '10AM', patients: 35 },
  { time: '12PM', patients: 28 },
  { time: '2PM', patients: 54 },
  { time: '4PM', patients: 67 },
  { time: '6PM', patients: 40 },
  { time: '8PM', patients: 15 },
];

const CustomTooltip = ({ active, payload, coordinate }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: coordinate?.x ? coordinate.x - 100 : 0, // Magnetic follow X
          y: coordinate?.y ? coordinate.y - 80 : 0   // Magnetic follow Y
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        className="bg-[#0F172A]/90 backdrop-blur-md text-white p-4 rounded-[20px] shadow-[0_10px_40px_-10px_rgba(22,78,99,0.5)] border border-cyan-500/30"
      >
        <p className="font-bold text-cyan-300 text-sm mb-1">{payload[0].payload.time}</p>
        <p className="text-xl font-semibold">{payload[0].value} <span className="text-xs font-medium text-gray-300">patients</span></p>
      </motion.div>
    );
  }
  return null;
};

const activities = [
  { id: 1, icon: <FaCheckCircle className="text-emerald-500" />, title: 'New Doctor Registered', time: '10 mins ago', desc: 'Dr. Sarah Jenkins completed onboarding.' },
  { id: 2, icon: <FaExclamationTriangle className="text-amber-500" />, title: 'High Queue Alert', time: '1 hour ago', desc: 'Wait times exceeding 45 minutes in Cardiology.' },
  { id: 3, icon: <FaInfoCircle className="text-blue-500" />, title: 'System Backup', time: '3 hours ago', desc: 'Automated database backup successful.' },
];

const statCards = [
  { title: 'Total Patients', value: '12,480', growth: '+14%', color: 'from-blue-500 to-blue-600', icon: <FaUserInjured /> },
  { title: 'Total Doctors', value: '45', growth: '+2%', color: 'from-emerald-500 to-emerald-600', icon: <FaUserMd /> },
  { title: 'Appointments Today', value: '284', growth: '+8%', color: 'from-purple-500 to-purple-600', icon: <FaCalendarCheck /> },
  { title: 'Pending Reports', value: '16', growth: '-5%', color: 'from-amber-500 to-amber-600', icon: <FaClipboardList /> },
  { title: 'Avg. Wait Time', value: '18m', growth: '-12%', color: 'from-rose-500 to-rose-600', icon: <FaClock /> },
];

// --- 3D Character Implementation ---
const AbstractDoctor3D = ({ isHovered }) => {
  const group = useRef();
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    // Smooth idle bobbing
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, isHovered ? Math.sin(t * 2) * 0.05 + 0.1 : Math.sin(t) * 0.1, 0.1);
    
    // Smooth magnetic rotation towards user on hover
    const targetRotY = isHovered ? -0.2 : Math.sin(t * 0.5) * 0.3;
    const targetRotX = isHovered ? -0.1 : Math.cos(t * 0.3) * 0.1;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, 0.05);
  });

  return (
    <group ref={group} scale={1.2}>
      {/* Body / White Coat */}
      <mesh position={[0, -0.6, 0]}>
        <capsuleGeometry args={[0.5, 1.2, 4, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.45, 32, 32]} />
        <meshStandardMaterial color="#fcd5ce" roughness={0.4} />
      </mesh>
      {/* Stethoscope Neck Loop */}
      <mesh position={[0, 0.1, 0.45]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.35, 0.05, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.4} />
      </mesh>
      {/* Stethoscope Drop Base */}
      <mesh position={[0.25, -0.2, 0.5]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Stethoscope Diaphragm (Teal accent) */}
      <mesh position={[0.25, -0.5, 0.51]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 32]} />
        <meshStandardMaterial color="#0d9488" roughness={0.2} metalness={0.5} />
      </mesh>
    </group>
  );
};

// --- VIEW COMPONENTS ---

const DashboardView = () => (
  <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]">
    {/* Hero Banner (Dark Teal Gradient) */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full bg-gradient-to-r from-[#134E4A] to-[#0F172A] rounded-[24px] p-10 relative overflow-hidden shadow-[0_20px_50px_-15px_rgba(19,78,74,0.4)]"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 right-40 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px] translate-y-1/4"></div>

      <div className="relative z-10">
        <p className="text-teal-300 font-bold text-sm   mb-2 flex items-center gap-2">
           <FaCalendarAlt /> Tuesday, March 24, 2026
        </p>
        <h2 className="text-2xl font-semibold text-white mb-8 ">Welcome back, {localStorage.getItem('userName') || 'Admin'}!</h2>
        
        {/* Glassmorphism Pills */}
        <div className="flex flex-wrap gap-4">
           {[
             { label: 'Clinic Status', value: 'Open', color: 'text-emerald-400' },
             { label: 'Date', value: 'Mar 24', color: 'text-white' },
             { label: 'On Duty', value: '6 Doctors', color: 'text-cyan-400' }
           ].map((pill, idx) => (
             <div key={idx} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
                <span className="text-slate-300 text-xs font-bold  tracking-wide">{pill.label}:</span>
                <span className={`text-sm font-semibold ${pill.color}`}>{pill.value}</span>
             </div>
           ))}
        </div>
      </div>
    </motion.div>

    {/* Stats Row */}
    <div className="grid grid-cols-5 gap-6">
      {statCards.map((stat, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
          className="bg-white p-6 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-[400ms] ease-in-out relative group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-[400ms]`}>
              {stat.icon}
            </div>
            <div className={`px-2.5 py-1 rounded-[12px] text-xs font-bold flex items-center shadow-sm ${
              stat.growth.startsWith('+') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {stat.growth}
            </div>
          </div>
          <h3 className="text-gray-400 text-xs font-bold   mb-1">{stat.title}</h3>
          <p className="text-3xl font-semibold text-gray-900 ">{stat.value}</p>
        </motion.div>
      ))}
    </div>

    {/* Main Content Grid */}
    <div className="grid grid-cols-12 gap-8">
      {/* Flow Chart (Left, Span 8) */}
      <div className="col-span-8 bg-white p-8 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900  mb-1">Patient Flow Overview</h3>
            <p className="text-sm font-medium text-gray-400">Hourly clinic footfall analysis</p>
          </div>
          <div className="flex items-center gap-2">
             <button className="px-4 py-2 bg-gray-50 rounded-[16px] text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">Day</button>
             <button className="px-4 py-2 bg-cyan-50 text-cyan-600 rounded-[16px] text-xs font-bold border border-cyan-100 shadow-sm">Week</button>
          </div>
        </div>
        
        <div className="h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Area type="monotone" dataKey="patients" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorPatients)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Calendar & Actions (Right, Span 4) */}
      <div className="col-span-4 flex flex-col gap-8">
        <div className="bg-white p-6 rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 ">March 2026</h3>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">{'<'}</button>
                <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">{'>'}</button>
              </div>
           </div>
           <div className="grid grid-cols-7 gap-y-4 text-center">
              {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                 <div key={d} className="text-xs font-bold text-gray-400  ">{d}</div>
              ))}
              <div className="w-8 h-8"></div><div className="w-8 h-8"></div><div className="w-8 h-8"></div><div className="w-8 h-8"></div>
              {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                 const isToday = day === 24;
                 const hasDot = [3, 7, 12, 18, 24, 28].includes(day);
                 return (
                    <div key={day} className="flex flex-col items-center justify-center relative cursor-pointer group">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-[400ms] ${
                         isToday ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'text-gray-700 group-hover:bg-gray-100'
                       }`}>
                         {day}
                       </div>
                       {hasDot && <div className={`w-1 h-1 rounded-full absolute bottom-[-4px] ${isToday ? 'bg-cyan-500' : 'bg-rose-400'}`}></div>}
                    </div>
                 )
              })}
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Add Patient', icon: <FaPlus />, color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white border border-emerald-100' },
             { label: 'Add Doctor', icon: <FaUserMd />, color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white border border-blue-100' },
             { label: 'Schedules', icon: <FaCalendarAlt />, color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-500 group-hover:text-white border border-purple-100' },
             { label: 'Settings', icon: <FaCog />, color: 'bg-slate-50 text-slate-600 group-hover:bg-slate-800 group-hover:text-white border border-slate-200' },
           ].map((action, idx) => (
              <button key={idx} className="bg-white p-4 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all duration-[400ms] flex flex-col items-center text-center group cursor-pointer border border-transparent hover:border-gray-100">
                 <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-lg mb-3 transition-colors duration-[400ms] ${action.color}`}>
                   {action.icon}
                 </div>
                 <span className="text-xs font-bold text-gray-700">{action.label}</span>
              </button>
           ))}
        </div>
      </div>
    </div>

    {/* Lower Section: Schedule Empty State & Timeline side-by-side */}
    <div className="grid grid-cols-12 gap-8 mb-8">
       <div className="col-span-5 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 bg-gray-50 rounded-[20px] flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
             <FaCalendarAlt className="text-3xl text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No active schedule for March 24</h3>
          <p className="text-sm font-medium text-gray-400 max-w-[250px] mb-6">There are no operational blocks configured for this specific day.</p>
          <button className="px-6 py-3 bg-cyan-500 text-white rounded-[16px] text-sm font-bold shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all">
             Create Schedule
          </button>
       </div>

       <div className="col-span-7 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] relative overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900  mb-8">System Activity</h3>
          <div className="relative">
             <div className="absolute top-0 bottom-0 left-[22px] w-[2px] bg-gray-100 rounded-full"></div>
             <div className="space-y-8 relative z-10">
                {activities.map((act) => (
                   <div key={act.id} className="flex gap-6 group">
                      <div className="w-12 h-12 rounded-[16px] bg-white border border-gray-100 flex items-center justify-center text-xl shrink-0 shadow-sm relative z-10 group-hover:scale-110 group-hover:shadow-md transition-all duration-[400ms]">
                         {act.icon}
                      </div>
                      <div className="pt-1">
                         <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-sm font-bold text-gray-900">{act.title}</h4>
                            <span className="text-xs font-bold text-gray-400  ">{act.time}</span>
                         </div>
                         <p className="text-sm text-gray-500 font-medium">{act.desc}</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  </div>
);

const DoctorsView = () => {
  const [hoverDoc, setHoverDoc] = useState(false);

  const doctorsList = [
    { id: '#DOC-001', name: 'Dr. Sarah Jenkins', special: 'Cardiologist', status: 'Active', exp: '12 Yrs' },
    { id: '#DOC-002', name: 'Dr. Arvind Mehta', special: 'Neurologist', status: 'On Leave', exp: '8 Yrs' },
    { id: '#DOC-003', name: 'Dr. John Mathew', special: 'General Physician', status: 'Active', exp: '15 Yrs' },
    { id: '#DOC-004', name: 'Dr. Emily Chen', special: 'Pediatrician', status: 'Active', exp: '5 Yrs' },
  ];

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]">
      {/* Metric Row with 3D Interaction Zone */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Metric 1 (Total Doctors) with 3D Viewport Anchor */}
        <div 
           className="bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex items-center justify-between relative overflow-hidden group transition-all duration-[400ms] hover:shadow-[0_15px_50px_-15px_rgba(0,0,0,0.1)] cursor-pointer"
           onMouseEnter={() => setHoverDoc(true)}
           onMouseLeave={() => setHoverDoc(false)}
        >
          <div className="relative z-10">
             <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg mb-6 group-hover:scale-110 transition-transform duration-[400ms]">
               <FaUserMd />
             </div>
             <h3 className="text-gray-400 text-xs font-bold   mb-1">Total Doctors</h3>
             <p className="text-3xl font-semibold text-gray-900 ">45</p>
          </div>
          
          {/* 3D Anchor Viewport */}
          <div className="absolute right-[-40px] top-0 bottom-0 w-[240px] h-[150%] -translate-y-[20%] pointer-events-none">
             <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ alpha: true }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <directionalLight position={[-10, 5, -5]} intensity={0.8} color="#06b6d4" />
                <directionalLight position={[0, -10, 5]} intensity={0.3} color="#fcd5ce" />
                <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.8}>
                  <AbstractDoctor3D isHovered={hoverDoc} />
                </Float>
             </Canvas>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg mb-6">
               <FaCheckCircle />
          </div>
          <h3 className="text-gray-400 text-xs font-bold   mb-1">Active Doctors</h3>
          <p className="text-3xl font-semibold text-gray-900 ">38</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
          <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl shadow-lg mb-6">
               <FaExclamationTriangle />
          </div>
          <h3 className="text-gray-400 text-xs font-bold   mb-1">On Leave</h3>
          <p className="text-3xl font-semibold text-gray-900 ">7</p>
        </div>
      </div>

      {/* Action & Table Layout */}
      <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
           <div className="relative flex-1 max-w-[400px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or ID..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-[16px] text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" />
           </div>
           <button className="px-6 py-3 bg-white border border-gray-200 rounded-[16px] text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Filter Status
           </button>
           <button className="ml-auto px-6 py-3 bg-teal-600 text-white rounded-[16px] font-bold text-sm shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
              <FaPlus /> Add Doctor
           </button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400   bg-white">
              <th className="p-6">Doctor ID</th>
              <th className="p-6">Doctor Name</th>
              <th className="p-6">Speciality</th>
              <th className="p-6">Status</th>
              <th className="p-6">Experience</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-gray-900">
             {doctorsList.map((doc, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors duration-[400ms] group">
                   <td className="p-6 text-gray-500 font-medium">{doc.id}</td>
                   <td className="p-6 font-bold flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shadow-sm border border-teal-100">
                        {doc.name.match(/\b(\w)/g).slice(0,2).join('')}
                     </div>
                     {doc.name}
                   </td>
                   <td className="p-6 text-gray-600">{doc.special}</td>
                   <td className="p-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${doc.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${doc.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                         {doc.status}
                      </span>
                   </td>
                   <td className="p-6 text-gray-500">{doc.exp}</td>
                   <td className="p-6 text-right">
                      <button className="text-gray-400 hover:text-teal-600 transition-colors font-bold px-3 opacity-0 group-hover:opacity-100">Edit Profile</button>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PatientsView = () => {
  const patientStats = [
    { title: 'Total Patients', value: '12', color: 'from-cyan-400 to-cyan-500', icon: <FaUserInjured /> },
    { title: 'Active', value: '9', color: 'from-emerald-400 to-emerald-500', icon: <FaCheckCircle /> },
    { title: 'Female', value: '6', color: 'from-purple-400 to-purple-500', icon: <FaVenus /> },
    { title: 'Male', value: '6', color: 'from-blue-400 to-blue-500', icon: <FaMars /> },
  ];

  const patientsList = [
    { id: '#P001', name: 'Sarah Jenkins', age: 34, gender: 'Female', phone: '+1 234 567 8900', email: 'sarah.j@email.com', doctor: 'Dr. Emily Chen', spec: 'Pediatrician', lastVisit: 'Mar 18, 2026', status: 'Active' },
    { id: '#P002', name: 'Michael Chang', age: 45, gender: 'Male', phone: '+1 987 654 3210', email: 'm.chang@email.com', doctor: 'Dr. Arvind Mehta', spec: 'Neurologist', lastVisit: 'Mar 20, 2026', status: 'Inactive' },
    { id: '#P003', name: 'Emma Watson', age: 28, gender: 'Female', phone: '+1 555 123 4567', email: 'emma.w@email.com', doctor: 'Dr. Sarah Jenkins', spec: 'Cardiologist', lastVisit: 'Mar 22, 2026', status: 'Active' },
    { id: '#P004', name: 'David Miller', age: 52, gender: 'Male', phone: '+1 444 987 6543', email: 'david.m@email.com', doctor: 'Dr. John Mathew', spec: 'General Physician', lastVisit: 'Mar 23, 2026', status: 'Active' },
  ];

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]">
      {/* Metric Row */}
      <div className="grid grid-cols-4 gap-6">
        {patientStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[20px] p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex items-center gap-6 hover:-translate-y-1 transition-transform duration-[400ms] ease-in-out cursor-pointer group">
            <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-[400ms]`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-3xl font-semibold text-gray-900 ">{stat.value}</p>
              <h3 className="text-gray-400 text-xs font-bold  ">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-[20px] p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-wrap items-center gap-6">
        <div className="relative flex-1 min-w-[300px] max-w-[400px]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, ID, doctor, contact..." className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-[16px] text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-[400ms]" />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[16px]">
          {['All', 'Active', 'Inactive'].map(filter => (
            <button key={filter} className={`px-4 py-3 rounded-[12px] text-xs font-bold transition-all duration-[400ms] ${filter === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{filter}</button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-[16px]">
          {['All', 'Male', 'Female'].map(filter => (
            <button key={filter} className={`px-4 py-3 rounded-[12px] text-xs font-bold transition-all duration-[400ms] ${filter === 'All' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>{filter}</button>
          ))}
        </div>

        <button className="ml-auto px-6 py-3.5 bg-teal-600 text-white rounded-[16px] font-bold text-sm shadow-md shadow-teal-500/20 hover:brightness-110 active:scale-95 transition-all duration-[400ms] ease-in-out flex items-center gap-2">
          <FaPlus /> Add Patient
        </button>
      </div>

      {/* Patient Data Table */}
      <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400   bg-gray-50/50">
              <th className="p-6">Patient</th>
              <th className="p-6">Age / Gender</th>
              <th className="p-6">Contact</th>
              <th className="p-6">Assigned Doctor</th>
              <th className="p-6">Last Visit</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold text-gray-900">
             {patientsList.map((patient, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors duration-[400ms] ease-in-out group">
                   <td className="p-6 flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-100">
                        {patient.name.match(/\b(\w)/g).slice(0,2).join('')}
                     </div>
                     <div>
                        <p className="font-bold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-400 font-bold">{patient.id}</p>
                     </div>
                   </td>
                   <td className="p-6">
                      <div className="flex items-center gap-3">
                         <span className="text-gray-600 font-bold">{patient.age} yrs</span>
                         <span className={`px-3 py-1 rounded-full text-xs font-bold   ${patient.gender === 'Female' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                            {patient.gender}
                         </span>
                      </div>
                   </td>
                   <td className="p-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-gray-700 font-bold flex items-center gap-2"><FaPhone className="text-gray-400 text-xs" /> {patient.phone}</span>
                         <span className="text-xs text-gray-500 font-medium flex items-center gap-2"><FaEnvelope className="text-gray-400 text-xs" /> {patient.email}</span>
                      </div>
                   </td>
                   <td className="p-6">
                      <div className="flex flex-col gap-1">
                         <span className="text-gray-900 font-bold">{patient.doctor}</span>
                         <span className="text-xs text-gray-500 font-medium">{patient.spec}</span>
                      </div>
                   </td>
                   <td className="p-6 text-gray-600 font-bold">{patient.lastVisit}</td>
                   <td className="p-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${patient.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${patient.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>
                         {patient.status}
                      </span>
                   </td>
                   <td className="p-6">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out">
                         <button className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 transition-all duration-[400ms]">
                            <FaEye />
                         </button>
                         <button className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-all duration-[400ms]">
                            <FaEdit />
                         </button>
                      </div>
                   </td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportsView = () => {
  const reportStats = [
    { title: 'Total Reports', value: '10', color: 'from-slate-400 to-slate-500', icon: <FaFileMedical /> },
    { title: 'Pending', value: '4', color: 'from-amber-400 to-amber-500', icon: <FaClock /> },
    { title: 'Reviewed', value: '3', color: 'from-cyan-400 to-cyan-500', icon: <FaCheckDouble /> },
    { title: 'Completed', value: '3', color: 'from-emerald-400 to-emerald-500', icon: <FaCheckCircle /> },
  ];

  const reportList = [
    { type: 'Blood', title: 'Comprehensive Blood Panel', patient: 'Sarah Jenkins', doctor: 'Dr. Emily Chen', time: 'Today, 10:45 AM', method: 'Uploaded', methodIcon: <FaCloudUploadAlt />, status: 'Completed', icon: <FaTint />, iconBg: 'bg-rose-50 text-rose-500' },
    { type: 'Pathology', title: 'Skin Biopsy Results', patient: 'Michael Chang', doctor: 'Dr. Arvind Mehta', time: 'Yesterday, 04:20 PM', method: 'Composed', methodIcon: <FaPen />, status: 'Reviewed', icon: <FaNotesMedical />, iconBg: 'bg-emerald-50 text-emerald-500' },
    { type: 'Radiology', title: 'Chest X-Ray Scan', patient: 'Emma Watson', doctor: 'Dr. Sarah Jenkins', time: 'Mar 22, 11:15 AM', method: 'Uploaded', methodIcon: <FaCloudUploadAlt />, status: 'Pending', icon: <FaXRay />, iconBg: 'bg-indigo-50 text-indigo-500' },
    { type: 'Blood', title: 'Lipid Profile', patient: 'David Miller', doctor: 'Dr. John Mathew', time: 'Mar 20, 09:00 AM', method: 'Uploaded', methodIcon: <FaCloudUploadAlt />, status: 'Completed', icon: <FaTint />, iconBg: 'bg-rose-50 text-rose-500' },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' };
      case 'Reviewed': return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100', dot: 'bg-cyan-500' };
      case 'Pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
    }
  };

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]">
      {/* Metric Row */}
      <div className="grid grid-cols-4 gap-6">
        {reportStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-[400ms] ease-in-out cursor-pointer group">
            <div className={`w-14 h-14 rounded-[14px] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-110 transition-transform duration-[400ms]`}>
              {stat.icon}
            </div>
            <div>
               <p className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">{stat.value}</p>
               <h3 className="text-gray-400 text-xs font-bold tracking-wide">{stat.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-8 items-start">
        {/* Left Column - 35% Width */}
        <div className="w-[35%] flex flex-col gap-6">
          {/* Toggle Header */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] self-start border border-gray-100">
             <button className="px-6 py-2.5 rounded-full bg-slate-800 text-white text-sm font-bold shadow-md transition-all duration-[400ms]">Upload File</button>
             <button className="px-6 py-2.5 rounded-full text-gray-500 hover:text-gray-900 text-sm font-bold transition-all duration-[400ms]">Compose</button>
          </div>

          <div className="bg-white rounded-[20px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)]">
             <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                   <FaCloudUploadAlt />
                </div>
                Upload Report
             </h3>

             <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 relative group">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">Select Patient</label>
                   <div className="relative">
                      <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                         <option>Choose patient...</option>
                         <option>Sarah Jenkins</option>
                         <option>Michael Chang</option>
                      </select>
                      <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors" />
                   </div>
                </div>

                <div className="flex flex-col gap-2 relative group">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">Assign Doctor</label>
                   <div className="relative">
                      <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                         <option>Choose doctor...</option>
                         <option>Dr. Emily Chen</option>
                         <option>Dr. Arvind Mehta</option>
                      </select>
                      <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors" />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">Report Title</label>
                   <input type="text" placeholder="e.g. Blood Panel Results" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms]" />
                </div>

                {/* Dropzone */}
                <div className="border-2 border-dashed border-gray-300 rounded-[16px] bg-gray-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition-all duration-[400ms] group mt-2">
                   <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 group-hover:text-teal-500 group-hover:scale-110 transition-all duration-[400ms] mb-4">
                      <FaUpload className="text-xl" />
                   </div>
                   <p className="text-sm font-bold text-gray-700 mb-1">Drop PDF or image here</p>
                   <p className="text-xs font-medium text-gray-400">or click to browse files</p>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wide pl-1">Notes (Optional)</label>
                   <textarea placeholder="Add any relevant details..." className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms]"></textarea>
                </div>

                <button className="w-full mt-2 py-4 bg-teal-600 text-white rounded-[16px] font-bold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 active:scale-95 active:-translate-y-0 transition-all duration-[400ms] ease-in-out flex items-center justify-center gap-3">
                   <FaCloudUploadAlt className="text-lg" />
                   UPLOAD REPORT
                </button>
             </div>
          </div>
        </div>

        {/* Right Column - 65% Width */}
        <div className="w-[65%] flex flex-col gap-6">
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
             
             {/* Header & Filter */}
             <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                   <h2 className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap">Report List</h2>
                   <div className="relative w-[280px]">
                     <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Search reports..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-[400ms]" />
                   </div>
                   <div className="relative w-[150px] group">
                      <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-[12px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer transition-all duration-[400ms]">
                         <option>All Types</option>
                         <option>Blood</option>
                         <option>Radiology</option>
                         <option>Pathology</option>
                      </select>
                      <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-cyan-500 transition-colors" />
                   </div>
                </div>
                
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-[14px] shadow-sm ml-auto">
                  {['All', 'Pending', 'Reviewed', 'Completed'].map(filter => (
                    <button key={filter} className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-[400ms] ${filter === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>{filter}</button>
                  ))}
                </div>
             </div>

             {/* List Items */}
             <div className="flex flex-col">
                {reportList.map((item, idx) => {
                   const st = getStatusStyle(item.status);
                   return (
                   <div key={idx} className="flex items-center justify-between border-b border-gray-50 p-6 hover:bg-gray-50/80 transition-colors duration-[400ms] ease-in-out group cursor-pointer">
                      <div className="flex items-center gap-6 flex-1">
                          <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl shadow-sm ${item.iconBg} group-hover:scale-110 transition-transform duration-[400ms]`}>
                             {item.icon}
                          </div>
                          
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-base font-bold text-gray-900">{item.title}</h4>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{item.time}</span>
                             </div>
                             <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                                <span className="flex items-center gap-1.5"><FaUserInjured className="text-gray-400" /> {item.patient}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><FaUserMd className="text-gray-400" /> {item.doctor}</span>
                             </div>
                          </div>
                      </div>

                      <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center justify-center gap-2 w-[110px]">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 rounded-[8px] text-[11px] font-bold tracking-wide">
                                {item.methodIcon}
                                {item.method}
                             </span>
                          </div>

                          <div className="w-[120px] flex justify-end">
                             <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${st.bg} ${st.text} ${st.border}`}>
                                <div className={`w-2 h-2 rounded-full ${st.dot}`}></div>
                                {item.status}
                             </span>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ml-2 w-[40px]">
                             <button className="w-10 h-10 rounded-[12px] bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 shadow-sm transition-all duration-[400ms]">
                                <FaEye />
                             </button>
                          </div>
                      </div>
                   </div>
                )})}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const QueueView = () => {
  const queueStats = [
    { title: 'Total Tokens', value: '12', color: 'from-slate-400 to-slate-500', icon: <FaTicketAlt /> },
    { title: 'Waiting', value: '8', color: 'from-amber-400 to-amber-500', icon: <FaClock /> },
    { title: 'In Progress', value: '1', color: 'from-cyan-400 to-cyan-500', icon: <FaSync /> },
    { title: 'Completed', value: '2', color: 'from-emerald-400 to-emerald-500', icon: <FaCheckCircle /> },
    { title: 'Cancelled', value: '1', color: 'from-rose-400 to-rose-500', icon: <FaTimesCircle /> },
  ];

  const liveQueue = [
    { id: 'A-001', patient: 'Sarah Jenkins', pid: '#P001', doctor: 'Dr. Emily Chen', time: '09:00 AM - 09:30 AM', issued: '08:45 AM', status: 'In Progress' },
    { id: 'A-002', patient: 'Michael Chang', pid: '#P002', doctor: 'Dr. Arvind Mehta', time: '09:30 AM - 10:00 AM', issued: '08:50 AM', status: 'Waiting' },
    { id: 'A-003', patient: 'Emma Watson', pid: '#P003', doctor: 'Dr. Sarah Jenkins', time: '10:00 AM - 10:30 AM', issued: '09:15 AM', status: 'Waiting' },
    { id: 'A-000', patient: 'David Miller', pid: '#P004', doctor: 'Dr. John Mathew', time: '08:30 AM - 09:00 AM', issued: '08:10 AM', status: 'Completed' },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500', icon: <FaCheckCircle className="text-xs" /> };
      case 'In Progress': return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100', dot: 'bg-cyan-500', icon: <FaSync className="text-xs animate-spin-slow" /> };
      case 'Cancelled': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500', icon: <FaTimesCircle className="text-xs" /> };
      default: return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500', icon: <FaClock className="text-xs" /> };
    }
  };

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.4s_ease-in-out_forwards]">
      {/* Metric Row */}
      <div className="grid grid-cols-5 gap-6">
        {queueStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between hover:-translate-y-1 transition-transform duration-[400ms] ease-in-out cursor-pointer group">
            <div>
               <p className="text-3xl font-semibold text-gray-900  mb-1">{stat.value}</p>
               <h3 className="text-gray-400 text-xs font-bold  ">{stat.title}</h3>
            </div>
            <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform duration-[400ms]`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="flex gap-8 items-start">
        {/* Left Column - 70% Width */}
        <div className="w-[70%] flex flex-col gap-6">
          <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
             
             {/* Header & Filter */}
             <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4 flex-1">
                   <h2 className="text-lg font-bold text-gray-900  whitespace-nowrap">Live Queue</h2>
                   <div className="relative w-full max-w-[300px]">
                     <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Search patient or token..." className="w-full pl-12 pr-4 py-2.5 bg-white border border-gray-200 rounded-[12px] text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-[400ms]" />
                   </div>
                </div>
                
                <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-[14px] shadow-sm">
                  {['All', 'Waiting', 'In Progress', 'Completed', 'Cancelled'].map(filter => (
                    <button key={filter} className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-all duration-[400ms] ${filter === 'All' ? 'bg-slate-800 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>{filter}</button>
                  ))}
                </div>
             </div>

             {/* Table */}
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-gray-100 text-xs font-bold text-gray-400   bg-white">
                   <th className="p-6">Token</th>
                   <th className="p-6">Patient Info</th>
                   <th className="p-6">Assigned Doctor</th>
                   <th className="p-6">Time Slot</th>
                   <th className="p-6">Status</th>
                   <th className="p-6 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-semibold text-gray-900">
                  {liveQueue.map((item, idx) => {
                     const st = getStatusStyle(item.status);
                     return (
                     <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors duration-[400ms] ease-in-out group">
                        <td className="p-6">
                           <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-[10px] text-xs font-bold inline-block ">
                              {item.id}
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="font-bold text-gray-900">{item.patient}</p>
                           <p className="text-xs text-gray-400 font-bold">{item.pid}</p>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                 {item.doctor.split(' ').map(n=>n[0]).join('').replace('D','')}
                              </div>
                              <span className="font-bold text-gray-700">{item.doctor}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="font-bold text-gray-800">{item.time}</p>
                           <p className="text-xs text-gray-400 font-bold mt-0.5">Issued: {item.issued}</p>
                        </td>
                        <td className="p-6">
                           <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                              {st.icon}
                              {item.status}
                           </span>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] ease-in-out">
                              <button className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center text-emerald-500 hover:text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-[400ms]" title="Complete">
                                 <FaCheck />
                              </button>
                              <button className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all duration-[400ms]" title="Cancel">
                                 <FaTimes />
                              </button>
                           </div>
                        </td>
                     </tr>
                  )})}
               </tbody>
             </table>
          </div>
        </div>

        {/* Right Column - 30% Width */}
        <div className="w-[30%]">
           <div className="bg-white rounded-[20px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900  mb-8 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-[12px] bg-teal-50 text-teal-600 flex items-center justify-center text-lg">
                    <FaTicketAlt />
                 </div>
                 Generate Token
              </h3>

              <div className="flex flex-col gap-5">
                 {/* Stacked Dropdowns */}
                 <div className="flex flex-col gap-2 relative group">
                    <label className="text-xs font-bold text-gray-500   pl-1">Patient</label>
                    <div className="relative">
                       <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                          <option>Select existing patient...</option>
                          <option>#P001 - Sarah Jenkins</option>
                          <option>#P002 - Michael Chang</option>
                       </select>
                       <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors duration-[400ms]" />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 relative group">
                    <label className="text-xs font-bold text-gray-500   pl-1">Department</label>
                    <div className="relative">
                       <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                          <option>Select department...</option>
                          <option>Cardiology</option>
                          <option>Neurology</option>
                          <option>Pediatrics</option>
                       </select>
                       <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors duration-[400ms]" />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 relative group">
                    <label className="text-xs font-bold text-gray-500   pl-1">Assign Doctor</label>
                    <div className="relative">
                       <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                          <option>Auto-assign or select...</option>
                          <option>Dr. Emily Chen</option>
                          <option>Dr. Arvind Mehta</option>
                       </select>
                       <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors duration-[400ms]" />
                    </div>
                 </div>

                 <div className="flex flex-col gap-2 relative group mb-2">
                    <label className="text-xs font-bold text-gray-500   pl-1">Time Slot</label>
                    <div className="relative">
                       <select className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-[400ms] cursor-pointer">
                          <option>Select available time...</option>
                          <option>10:00 AM - 10:30 AM</option>
                          <option>10:30 AM - 11:00 AM</option>
                       </select>
                       <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-teal-500 transition-colors duration-[400ms]" />
                    </div>
                 </div>

                 <button className="w-full py-4 bg-teal-600 text-white rounded-[16px] font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 active:scale-95 active:-translate-y-0 transition-all duration-[400ms] ease-in-out flex items-center justify-center gap-3">
                    <FaTicketAlt className="text-lg" />
                    GENERATE TOKEN
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = () => {
  const topMetrics = [
    { title: 'Total Patients', value: '1,847', trend: '+8.4%', trendUp: true, color: 'from-cyan-400 to-cyan-500', icon: <FaUserInjured /> },
    { title: 'Daily Visits', value: '84', trend: '+12.1%', trendUp: true, color: 'from-emerald-400 to-emerald-500', icon: <FaCalendarCheck /> },
    { title: 'Completion', value: '89%', trend: '-1.3%', trendUp: false, color: 'from-teal-400 to-teal-500', icon: <FaCheckCircle /> },
    { title: 'Utilization', value: '91%', trend: '+4.2%', trendUp: true, color: 'from-purple-400 to-purple-500', icon: <FaChartPie /> },
  ];

  const volumeData = [
    { name: 'Mon', patients: 65 },
    { name: 'Tue', patients: 82 },
    { name: 'Wed', patients: 110 },
    { name: 'Thu', patients: 95 },
    { name: 'Fri', patients: 85 },
    { name: 'Sat', patients: 45 },
    { name: 'Sun', patients: 30 },
  ];

  const doctorData = [
    { name: 'Dr. Johnson', pts: 521, rate: 97 },
    { name: 'Dr. Chen', pts: 489, rate: 94 },
    { name: 'Dr. Mehta', pts: 432, rate: 89 },
    { name: 'Dr. Smith', pts: 388, rate: 85 },
  ];

  const reportData = [
    { month: 'Jan', Completed: 120, Pending: 15, Reviewed: 40 },
    { month: 'Feb', Completed: 132, Pending: 12, Reviewed: 35 },
    { month: 'Mar', Completed: 145, Pending: 18, Reviewed: 42 },
    { month: 'Apr', Completed: 160, Pending: 20, Reviewed: 50 },
  ];

  // Generate dynamic heatmap data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
  const heatmapData = days.map(day => ({
    day,
    hours: hours.map(hour => ({
      hour,
      value: Math.floor(Math.random() * 80) + 10 // Mock 10-90 patients
    }))
  }));

  const getHeatmapColor = (value) => {
    // 10 to 90 scaled to alpha 0.1 to 1.0 of cyan-500 (#06B6D4)
    const alpha = Math.min(1, Math.max(0.1, value / 80)).toFixed(2);
    return `rgba(6, 182, 212, ${alpha})`;
  };

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]">
      {/* Top Metric Row */}
      <div className="grid grid-cols-4 gap-6">
        {topMetrics.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-[500ms] cursor-pointer">
             <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-xl shadow-md group-hover:scale-110 transition-transform duration-[500ms]`}>
                   {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${stat.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                   {stat.trendUp ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <h3 className="text-gray-400 text-sm font-semibold">{stat.title}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Middle Section - Split View */}
      <div className="flex gap-8 items-stretch h-[400px]">
        {/* Left - 70% Patient Volume */}
        <div className="w-[70%] bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-col relative overflow-hidden">
           <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-bold text-gray-900">Patient Volume</h2>
              <div className="flex items-center bg-gray-50 p-1.5 rounded-[12px]">
                 <button className="px-5 py-2 text-xs font-bold bg-white text-gray-900 shadow-sm rounded-[10px] transition-all duration-[500ms]">Weekly</button>
                 <button className="px-5 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-all duration-[500ms]">Monthly</button>
              </div>
           </div>
           <div className="flex-1 w-full relative z-10 -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={volumeData}>
                   <defs>
                     <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dx={-10} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontWeight: 'bold' }}
                     itemStyle={{ color: '#06B6D4' }}
                   />
                   <Area type="monotone" dataKey="patients" stroke="#06B6D4" strokeWidth={4} fillOpacity={1} fill="url(#colorPatients)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Right - 30% Key Insights */}
        <div className="w-[30%] bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-col">
           <h2 className="text-xl font-bold text-gray-900 mb-8">Key Insights</h2>
           <div className="flex flex-col gap-6 flex-1 justify-center">
              <div className="flex items-center gap-5 group cursor-pointer">
                 <div className="w-14 h-14 rounded-[16px] bg-cyan-50 text-cyan-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-[500ms]">
                    <FaCalendarAlt />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-1">Busiest Day</h4>
                    <p className="text-lg font-bold text-gray-900">Wednesday</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 group cursor-pointer">
                 <div className="w-14 h-14 rounded-[16px] bg-amber-50 text-amber-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-[500ms]">
                    <FaClock />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-1">Peak Hour</h4>
                    <p className="text-lg font-bold text-gray-900">2:00 PM</p>
                 </div>
              </div>
              <div className="flex items-center gap-5 group cursor-pointer">
                 <div className="w-14 h-14 rounded-[16px] bg-purple-50 text-purple-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-[500ms]">
                    <FaUserMd />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-gray-400 mb-1">Top Doctor</h4>
                    <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                       Sarah Johnson
                       <FaStar className="text-xs text-amber-400" />
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Section - Detailed Performance */}
      <div className="flex gap-8 items-stretch h-[450px]">
        {/* Left - Doctor Performance */}
        <div className="w-1/2 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-col">
           <h2 className="text-xl font-bold text-gray-900 mb-6">Doctor Performance & Utilization</h2>
           <div className="flex-1 w-full min-h-[180px] -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={doctorData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 600}} width={90} />
                   <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                   <Bar dataKey="pts" fill="#0D9488" radius={[0, 8, 8, 0]} barSize={24} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
           
           <div className="mt-6 flex flex-col gap-4">
              {doctorData.slice(0, 3).map((doc, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-bold text-teal-600 w-4">{i + 1}.</span>
                    <div className="flex-1">
                       <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-bold text-gray-800">{doc.name}</span>
                          <span className="text-xs font-bold text-gray-500">{doc.pts} pts ({doc.rate}%)</span>
                       </div>
                       <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${doc.rate}%` }}></div>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Right - Report Completion Target */}
        <div className="w-1/2 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] flex flex-col">
           <h2 className="text-xl font-bold text-gray-900 mb-6">Report Completion Flow</h2>
           <div className="flex-1 w-full -ml-4 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={reportData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 13, fontWeight: 600}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dx={-10} />
                   <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                   <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 'bold', color: '#64748B' }} />
                   <Bar dataKey="Completed" stackId="a" fill="#10B981" barSize={32} radius={[0, 0, 4, 4]} />
                   <Bar dataKey="Reviewed" stackId="a" fill="#06B6D4" />
                   <Bar dataKey="Pending" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Footer - Peak Hours Heatmap */}
      <div className="bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.06)] overflow-hidden">
         <h2 className="text-xl font-bold text-gray-900 mb-6">Peak Hours Matrix</h2>
         <div className="w-full">
            {/* Header Row (Hours) */}
            <div className="grid grid-cols-11 mb-2">
               <div className="col-span-1"></div>
               {hours.map(hour => (
                  <div key={hour} className="text-center text-[11px] font-bold text-gray-400">{hour}</div>
               ))}
            </div>
            
            {/* Data Rows */}
            <div className="flex flex-col gap-2">
               {heatmapData.map((row) => (
                  <div key={row.day} className="grid grid-cols-11 items-center gap-2">
                     <div className="col-span-1 text-xs font-bold text-gray-500 text-right pr-4">{row.day}</div>
                     {row.hours.map((cell, idx) => (
                        <div 
                           key={idx} 
                           className="h-10 rounded-[8px] cursor-pointer relative group transition-all duration-[500ms]"
                           style={{ backgroundColor: getHeatmapColor(cell.value) }}
                        >
                           <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-[8px] whitespace-nowrap z-50 pointer-events-none transition-opacity duration-200 shadow-xl">
                              {row.day} {cell.hour}: {cell.value} patients
                           </div>
                        </div>
                     ))}
                  </div>
               ))}
            </div>
         </div>
      </div>
      
    </div>
  );
};

const SettingsView = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Outpatient Department', code: 'OPD', head: 'Dr. Sarah Jenkins', staff: 24, active: true, desc: 'General consultations, primary care, and initial patient assessments.', icon: <FaHeartbeat />, color: 'text-rose-500 bg-rose-50', codeBg: 'bg-indigo-50 text-indigo-600' },
    { id: 2, name: 'Cardiology', code: 'CARD', head: 'Dr. Arvind Mehta', staff: 18, active: true, desc: 'Advanced heart care, ECG, echocardiograms, and cardiac surgery.', icon: <FaHeart />, color: 'text-red-500 bg-red-50', codeBg: 'bg-rose-50 text-rose-600' },
    { id: 3, name: 'Dental Care', code: 'DENTAL', head: 'Dr. Emily Chen', staff: 12, active: true, desc: 'Comprehensive dental exams, cleanings, and oral surgeries.', icon: <FaTooth />, color: 'text-cyan-500 bg-cyan-50', codeBg: 'bg-cyan-50 text-cyan-600' },
    { id: 4, name: 'Neurology', code: 'NEURO', head: 'Dr. John Mathew', staff: 14, active: true, desc: 'Specialized care for brain, spinal cord, and nervous system disorders.', icon: <FaBrain />, color: 'text-purple-500 bg-purple-50', codeBg: 'bg-purple-50 text-purple-600' },
    { id: 5, name: 'Orthopedics', code: 'ORTHO', head: 'Dr. Michael Chang', staff: 16, active: false, desc: 'Bone, joint, and muscle therapies, including sports medicine.', icon: <FaBone />, color: 'text-amber-500 bg-amber-50', codeBg: 'bg-amber-50 text-amber-600' },
    { id: 6, name: 'Pulmonology', code: 'PULMO', head: 'Dr. Emma Watson', staff: 10, active: true, desc: 'Treatment for respiratory and lung-related conditions and therapies.', icon: <FaLungs />, color: 'text-teal-500 bg-teal-50', codeBg: 'bg-teal-50 text-teal-600' },
  ]);

  const toggleStatus = (id) => {
    setDepartments(departments.map(d => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.35s_ease-in-out_forwards]">
      
      {/* Top Navigation Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 cursor-pointer relative overflow-hidden group border-2 border-cyan-400/20">
           <div className="w-12 h-12 rounded-[12px] bg-blue-50 text-blue-600 flex items-center justify-center text-xl transition-transform duration-[350ms] group-hover:scale-110">
              <FaBuilding />
           </div>
           <span className="font-bold text-gray-900 text-sm">Departments</span>
           <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
        </div>
        <div className="bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 cursor-pointer group hover:-translate-y-1 transition-all duration-[350ms] border-2 border-transparent">
           <div className="w-12 h-12 rounded-[12px] bg-gray-50 text-orange-400 flex items-center justify-center text-xl transition-transform duration-[350ms] group-hover:scale-110 group-hover:bg-orange-50">
              <FaNewspaper />
           </div>
           <span className="font-semibold text-gray-500 text-sm group-hover:text-gray-900 transition-colors duration-[350ms]">News & Alerts</span>
        </div>
        <div className="bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 cursor-pointer group hover:-translate-y-1 transition-all duration-[350ms] border-2 border-transparent">
           <div className="w-12 h-12 rounded-[12px] bg-green-50 text-green-500 flex items-center justify-center text-xl transition-transform duration-[350ms] group-hover:scale-110 group-hover:bg-green-100">
              <FaBusinessTime />
           </div>
           <span className="font-semibold text-gray-500 text-sm group-hover:text-gray-900 transition-colors duration-[350ms]">Working Hours</span>
        </div>
        <div className="bg-white rounded-[16px] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-4 cursor-pointer group hover:-translate-y-1 transition-all duration-[350ms] border-2 border-transparent">
           <div className="w-12 h-12 rounded-[12px] bg-rose-50 text-rose-500 flex items-center justify-center text-xl transition-transform duration-[350ms] group-hover:scale-110 group-hover:bg-rose-100">
              <FaCalendarDay />
           </div>
           <span className="font-semibold text-gray-500 text-sm group-hover:text-gray-900 transition-colors duration-[350ms]">Shifts & Leave</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mt-2">
         <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Department Management</h2>
         <button className="px-6 py-3.5 bg-teal-600 text-white rounded-[16px] font-bold text-sm shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-[350ms] ease-in-out flex items-center gap-2">
            <FaPlus /> Add Department
         </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-8 pb-10">
         {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-[350ms] ease-in-out p-6 flex flex-col group">
               
               {/* Top Row */}
               <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl shadow-sm ${dept.color} transition-transform duration-[350ms] group-hover:scale-110`}>
                     {dept.icon}
                  </div>
                  <button 
                     onClick={() => toggleStatus(dept.id)}
                     className={`w-12 h-6 rounded-full relative transition-colors duration-[350ms] ease-in-out flex items-center px-1 ${dept.active ? 'bg-emerald-500' : 'bg-gray-200'}`}
                  >
                     <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-[350ms] ease-in-out transform ${dept.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
               </div>

               {/* Body */}
               <div className="flex flex-col flex-1 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                     <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-extrabold tracking-widest uppercase ${dept.codeBg}`}>
                        {dept.code}
                     </span>
                     {dept.active ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-[8px] text-emerald-600 text-[10px] font-bold">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                        </div>
                     ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-[8px] text-gray-500 text-[10px] font-bold">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Inactive
                        </div>
                     )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed line-clamp-2">{dept.desc}</p>
               </div>

               {/* Footer */}
               <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-gray-200">
                        {dept.head.split(' ').map(n=>n[0]).join('').replace('D','')}
                     </div>
                     <p className="text-xs font-semibold text-gray-600">Head: <span className="font-bold text-gray-900">{dept.head}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                     <p className="text-xs font-bold text-gray-500">{dept.staff} staff</p>
                     <button className="w-8 h-8 rounded-[10px] bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 shadow-sm transition-all duration-[350ms]">
                        <FaEdit />
                     </button>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};
// --- PROFILE VIEW ---
const ProfileView = () => (
   <div className="flex gap-8 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
      {/* Left Column (60%) */}
      <div className="w-[60%] flex flex-col gap-8">
         <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] p-8 hover:-translate-y-1 transition-all duration-[300ms]">
            <h3 className="text-xl font-bold text-gray-900 mb-8">Profile Details</h3>
            
            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100">
               <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/30">
                  {(localStorage.getItem('userName') || 'AD').match(/\b(\w)/g)?.slice(0,2).join('') || 'AD'}
               </div>
               <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-1">{localStorage.getItem('userName') || 'System Admin'}</h4>
                  <p className="text-sm font-semibold text-gray-400 mb-4">Hospital Administrator</p>
                  <button className="px-5 py-2.5 bg-teal-50 text-teal-600 rounded-[12px] font-bold text-xs flex items-center gap-2 hover:bg-teal-500 hover:text-white transition-all duration-[300ms]">
                     <FaPen /> Edit Profile
                  </button>
               </div>
            </div>

            <form className="grid grid-cols-2 gap-6">
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
                  <input type="text" defaultValue={localStorage.getItem('userName') || "Admin User"} readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Department</label>
                  <input type="text" defaultValue="Administration" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Role</label>
                  <input type="text" defaultValue="Master Admin" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Contact Number</label>
                  <input type="text" defaultValue="+977 9812345678" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Email Address</label>
                  <input type="email" defaultValue={localStorage.getItem('userEmail') || "admin@clinikq.com"} readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Medical License</label>
                  <input type="text" defaultValue="MCI-2023-GEN-04821" readOnly className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="col-span-2 flex flex-col gap-2 mt-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Signature</label>
                  <div className="w-full h-32 rounded-[20px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-500 transition-all duration-[300ms] group">
                     <FaCloudUploadAlt className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-[300ms]" />
                     <span className="text-sm font-semibold">Upload signature image</span>
                  </div>
               </div>
            </form>
         </div>
      </div>

      {/* Right Column (40%) */}
      <div className="w-[40%] flex flex-col gap-8">
         <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] p-8 hover:-translate-y-1 transition-all duration-[300ms]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
               <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
               <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-[12px] text-xs font-bold tracking-widest uppercase">Role: Admin</span>
            </div>

            <form className="flex flex-col gap-5">
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Current password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">New password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Confirm new password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-[16px] px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-[300ms]" />
               </div>
               <button type="button" className="w-full mt-2 bg-gray-900 text-white rounded-[16px] py-4 text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-[300ms]">
                  Update Password
               </button>
            </form>
         </div>

         <div className="bg-white rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] p-8 hover:-translate-y-1 transition-all duration-[300ms]">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Notifications</h3>
            
            <div className="flex flex-col gap-2">
               {/* Setting 1 */}
               <div className="flex items-center justify-between p-3 rounded-[16px] hover:bg-gray-50 transition-colors duration-[300ms]">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[12px] bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-100/50">
                        <FaUserInjured />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Notify on New Patient</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-blue-500 relative transition-colors duration-[300ms] flex items-center px-1">
                     <div className="w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-6 transition-transform duration-[300ms]"></div>
                  </button>
               </div>
               {/* Setting 2 */}
               <div className="flex items-center justify-between p-3 rounded-[16px] hover:bg-gray-50 transition-colors duration-[300ms]">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[12px] bg-yellow-50 text-yellow-500 flex items-center justify-center border border-yellow-100/50">
                        <FaClipboardList />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Queue Time Alerts</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-blue-500 relative transition-colors duration-[300ms] flex items-center px-1">
                     <div className="w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-6 transition-transform duration-[300ms]"></div>
                  </button>
               </div>
               {/* Setting 3 */}
               <div className="flex items-center justify-between p-3 rounded-[16px] hover:bg-gray-50 transition-colors duration-[300ms]">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[12px] bg-cyan-50 text-cyan-500 flex items-center justify-center border border-cyan-100/50">
                        <FaFileMedical />
                     </div>
                     <span className="text-sm font-bold text-gray-700">Weekly Analytics Report</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-gray-200 relative transition-colors duration-[300ms] flex items-center px-1">
                     <div className="w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-0 transition-transform duration-[300ms]"></div>
                  </button>
               </div>
               {/* Setting 4 */}
               <div className="flex items-center justify-between p-3 rounded-[16px] hover:bg-gray-50 transition-colors duration-[300ms]">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-[12px] bg-green-50 text-green-500 flex items-center justify-center border border-green-100/50">
                        <FaCheckCircle />
                     </div>
                     <span className="text-sm font-bold text-gray-700">System Updates</span>
                  </div>
                  <button className="w-12 h-6 rounded-full bg-blue-500 relative transition-colors duration-[300ms] flex items-center px-1">
                     <div className="w-4 h-4 rounded-full bg-white shadow-sm transform translate-x-6 transition-transform duration-[300ms]"></div>
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>
);
// --- MAIN LAYOUT ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile'); // defaulting to profile to show the new view

  const navItems = [
    { id: 'dashboard', icon: <FaChartLine />, label: 'Dashboard' },
    { id: 'doctors', icon: <FaUserMd />, label: 'Doctors' },
    { id: 'patients', icon: <FaUserInjured />, label: 'Patients' },
    { id: 'queue', icon: <FaClipboardList />, label: 'Queue Management' },
    { id: 'reports', icon: <FaFileMedical />, label: 'Reports' },
    { id: 'analytics', icon: <FaChartPie />, label: 'Analytics' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' },
    { id: 'profile', icon: <FaUserCircle />, label: 'Profile' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      
      {/* Sidebar - Fixed Dark Navy */}
      <aside className="w-[280px] bg-[#0F172A] flex flex-col h-full shrink-0 border-r border-[#1E293B] relative z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-[14px] bg-[#0284C7] flex items-center justify-center text-white shadow-lg">
              <FaHeart className="text-2xl" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-white leading-none tracking-wide">ClinikQ</h1>
              <p className="text-[#94a3b8] text-[13px] font-medium mt-1">Admin Panel</p>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-500   mb-4">Main Menu</p>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] transition-all duration-[400ms] ease-in-out font-bold text-sm ${
                  activeTab === item.id
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Anchored Admin Profile */}
        <div className="mt-auto p-6 border-t border-[#1E293B] bg-[#0A0F1F]">
          <div className="flex items-center gap-3 p-3 rounded-[20px] hover:bg-slate-800 transition-all duration-[400ms] ease-in-out cursor-pointer group">
            <div className="w-12 h-12 rounded-[16px] bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-[400ms]">
              {(localStorage.getItem('userName') || 'AD').match(/\b(\w)/g)?.slice(0,2).join('') || 'AD'}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white truncate max-w-[120px]">{localStorage.getItem('userName') || 'System Admin'}</h4>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{localStorage.getItem('userEmail') || 'admin@clinikq.com'}</p>
            </div>
            <FaSignOutAlt className="text-slate-500 group-hover:text-rose-400 transition-colors duration-[400ms]" />
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar relative z-10">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-8">
          
          {/* Global Header Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-[200px] hidden lg:block"></div> {/* Spacer for centering */}
            
            <div className="relative w-full max-w-[500px]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search global records..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-[20px] text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-[400ms]"
              />
            </div>
            
            <div className="flex items-center gap-4 w-[200px] justify-end">
              <button className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-gray-400 hover:text-cyan-500 hover:shadow-[0_8px_30px_rgb(34,211,238,0.1)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-[400ms] relative group">
                 <FaBell className="text-xl group-hover:animate-bounce" />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="bg-white rounded-[20px] p-1.5 pr-4 flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-md transition-all duration-[400ms]">
                 <div className="w-9 h-9 rounded-[14px] bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {(localStorage.getItem('userName') || 'AD').match(/\b(\w)/g)?.slice(0,2).join('') || 'AD'}
                 </div>
                 <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-none">{localStorage.getItem('userName') || 'Admin'}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Router View Engine */}
          {activeTab === 'dashboard' ? <DashboardView /> : activeTab === 'doctors' ? <DoctorsView /> : activeTab === 'patients' ? <PatientsView /> : activeTab === 'queue' ? <QueueView /> : activeTab === 'reports' ? <ReportsView /> : activeTab === 'analytics' ? <AnalyticsView /> : activeTab === 'settings' ? <SettingsView /> : activeTab === 'profile' ? <ProfileView /> : (
            <div className="flex-1 flex flex-col items-center justify-center py-32 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
               <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                  <FaCog className="text-2xl text-gray-300" />
               </div>
               <h3 className="text-2xl font-semibold text-gray-900 mb-2 capitalize">{activeTab} Interface</h3>
               <p className="text-gray-400 font-medium max-w-sm">This module is currently receiving a high-fidelity visual pass. It will be available shortly.</p>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
