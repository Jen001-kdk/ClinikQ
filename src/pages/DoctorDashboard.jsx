import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  ListOrdered, 
  User, 
  Bell, 
  Search, 
  LogOut, 
  Plus, 
  Command, 
  ChevronRight, 
  FileSearch,
  Settings,
  AlertCircle,
  MoreVertical,
  Download,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Mail,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
  Stethoscope,
  X,
  Calendar,
  ChevronDown,
  SkipForward,
  Circle,
  UserPlus,
  UploadCloud,
  Shield
} from "lucide-react";

// Dashboard Components
import StatCards from "../components/dashboard/StatCards";
import PatientFlowChart from "../components/dashboard/PatientFlowChart";
import LiveQueue from "../components/dashboard/LiveQueue";
import ActivityLog from "../components/dashboard/ActivityLog";
import AppointmentCalendar from "../components/dashboard/AppointmentCalendar";
import AppointmentList from "../components/dashboard/AppointmentList";
import QuickActions from "../components/dashboard/QuickActions";
import DashboardSkeleton from "../components/dashboard/DashboardSkeleton";

// --- Mock Data & Consts ---

const SIDEBAR_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText, badge: '3' },
  { id: 'queue', label: 'Queue Management', icon: ListOrdered },
  { id: 'profile', label: 'Profile', icon: Settings },
];

const ANALYTICS_DATA = [
  { label: "Total Patients", value: "1,250", trend: "+12%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Appointments", value: "45", trend: "-5%", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Pending Reports", value: "12", trend: "+2", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Completed Reports", value: "30", trend: "100%", icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50" },
];

const RECENT_ACTIVITY = [
  { id: 1, text: "New report uploaded for Ananya Reddy", time: "2m ago", type: "report" },
  { id: 2, text: "Appointment confirmed: Priya Nair", time: "15m ago", type: "appointment" },
  { id: 3, text: "System update scheduled for 11:00 PM", time: "1h ago", type: "system" },
];

const PATIENTS_DATA = [
  { id: "P001", name: "Ananya Reddy", gender: "Female", age: 28, contact: "9876543210", lastVisit: "28 Mar 2026", status: "Completed", initial: "AR" },
  { id: "P002", name: "Priya Nair", gender: "Female", age: 34, contact: "9123456780", lastVisit: "27 Mar 2026", status: "Pending", initial: "PN" },
  { id: "P003", name: "Mohammed Irfan", gender: "Male", age: 42, contact: "8877665544", lastVisit: "27 Mar 2026", status: "Completed", initial: "MI" },
];

const REPORTS_DATA = [
  { id: "R001", name: "Ananya Reddy", diagnosis: "Viral Infection", date: "2 mins ago" },
  { id: "R002", name: "Priya Nair", diagnosis: "Blood Analysis", date: "15 mins ago" },
  { id: "R003", name: "Mohammed Irfan", diagnosis: "ECG Verification", date: "1h ago" },
  { id: "R004", name: "Kavitha S.", diagnosis: "Thyroid Profile", date: "3h ago" },
  { id: "R005", name: "Sunita Mehta", diagnosis: "Post-Op Followup", date: "5h ago" },
];

const SidebarItem = ({ id, label, icon: Icon, active, onClick, badge }) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 transition-smooth relative group rounded-xl mb-1 ${
      active 
        ? 'bg-[#007AFF] text-white' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <Icon size={18} className={active ? 'text-white' : 'group-hover:text-white'} />
    <span className={`text-[11px] uppercase tracking-wider ${active ? 'font-black' : 'font-bold'}`}>{label}</span>
    {badge && (
      <span className="ml-auto bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
        {badge}
      </span>
    )}
  </button>
);

// --- Layout & Main Wrapper ---

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isLoading, setIsLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState({
    name: "Doctor",
    specialization: "Specialist",
    initials: "DR"
  });

  useEffect(() => {
    // 1. Fetch from localStorage
    const savedName = localStorage.getItem('userName');
    const savedSpec = localStorage.getItem('specialization');
    
    if (savedName) {
       // Helper to get initials
       const nameParts = savedName.split(' ');
       const initials = nameParts.length > 1 
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : savedName.substring(0, 2).toUpperCase();
       
       setDoctorInfo({
          name: savedName,
          specialization: savedSpec || "Specialist",
          initials: initials
       });
    }

    // 2. Simulate initial data fetch
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const pageTransition = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Global Sidebar (#1A1F37) - Slim Version */}
      <aside className="w-64 bg-[#1A1F37] text-white flex flex-col h-full shrink-0 relative z-50 shadow-2xl transition-smooth">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#007AFF] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Stethoscope size={18} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase italic">ClinikQ</h1>
            <p className="text-[8px] font-black text-[#007AFF] tracking-[0.2em] -mt-0.5 uppercase opacity-80">Doctor Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 mt-2">
          <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Main Navigation</p>
          {SIDEBAR_NAV.map(nav => (
            <SidebarItem 
              key={nav.id} 
              id={nav.id} 
              label={nav.label} 
              icon={nav.icon} 
              active={view === nav.id} 
              onClick={setView} 
              badge={nav.badge}
            />
          ))}
        </nav>

        {/* Fixed Profile at Bottom */}
        <div className="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#007AFF] to-blue-600 flex items-center justify-center font-black text-white text-xs shadow-lg uppercase">
              {doctorInfo.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black truncate">Dr. {doctorInfo.name.split(' ').pop()}</p>
              <p className="text-[8px] text-[#007AFF] font-bold uppercase tracking-widest truncate">{doctorInfo.specialization}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition-smooth font-bold text-[10px] uppercase tracking-wider"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Nav - Compact */}
        <header className="h-14 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
           <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <span className="hover:text-blue-500 cursor-pointer transition-colors">ClinikQ</span>
              <ChevronRight size={10} className="text-slate-300" />
              <span className="text-slate-900">{view}</span>
           </div>

           <div className="flex items-center gap-6">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#007AFF] transition-colors" />
                <input
                  type="text"
                  placeholder="Universal search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-100/50 border-none rounded-xl pl-9 pr-10 py-1.5 text-[11px] font-bold text-slate-900 focus:ring-2 focus:ring-[#007AFF]/10 w-64 transition-smooth placeholder:text-slate-400 outline-none"
                />
              </div>
              
              <button className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-[#007AFF] hover:shadow-soft transition-smooth border border-slate-100">
                <Bell size={16} />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900 leading-none mb-0.5 uppercase tracking-wider">{doctorInfo.name}</p>
                    <p className="text-[8px] font-bold text-[#007AFF] leading-none uppercase">Online</p>
                 </div>
                 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#007AFF] to-blue-600 p-0.5 shadow-md">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center font-black text-slate-900 text-[10px] uppercase">
                       {doctorInfo.initials}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* VIEW: DASHBOARD */}
            {view === 'dashboard' && (
              <motion.div key="dashboard" {...pageTransition} className="h-full overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto space-y-6">
                  
                  {isLoading ? (
                    <DashboardSkeleton />
                  ) : (
                    <>
                      {/* Hero Banner - Compact */}
                      <div className="relative overflow-hidden bg-gradient-to-r from-[#007AFF] to-blue-500 rounded-24 p-8 text-white shadow-lg shadow-blue-500/10">
                        <div className="relative z-10">
                          <p className="text-blue-50/80 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
                            {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <h2 className="text-3xl font-black mb-3 tracking-tight">
                            Welcome back, <span className="text-white">Dr. {doctorInfo.name.split(' ').pop()}</span>
                          </h2>
                          <p className="text-blue-50/70 text-[11px] font-bold max-w-md mb-6 uppercase tracking-wider">
                            Syncing with MongoDB: 6 appointments & 1 report pending.
                          </p>
                          <div className="flex gap-3">
                            <button className="bg-white text-[#007AFF] px-5 py-2 rounded-xl shadow-lg font-black text-[10px] tracking-widest uppercase hover:brightness-110 transiton-smooth">
                              View Schedule
                            </button>
                            <button className="bg-white/10 backdrop-blur-md px-5 py-2 rounded-xl border border-white/10 font-black text-[10px] tracking-widest uppercase hover:bg-white/20 transition-smooth">
                              Queue Stats
                            </button>
                          </div>
                        </div>
                        <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute top-0 right-10 bottom-0 w-32 flex items-center justify-center opacity-20">
                          <Stethoscope size={100} />
                        </div>
                      </div>

                      {/* 1. Stat Cards (grid-cols-4) */}
                      <StatCards />

                      {/* 2. Middle Section (8:4) */}
                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-8">
                          <PatientFlowChart />
                        </div>
                        <div className="col-span-4">
                          <LiveQueue />
                        </div>
                      </div>

                      {/* 3. Bottom Section (4:4:4) */}
                      <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-4">
                          <AppointmentCalendar />
                        </div>
                        <div className="col-span-4">
                          <AppointmentList />
                        </div>
                        <div className="col-span-4">
                          <QuickActions />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* VIEW: PATIENT RECORDS */}
            {view === 'patients' && (
              <motion.div key="patients" {...pageTransition} className="h-full overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Patient Records</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Database of all registered patients in ClinikQ</p>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2">
                        <Download size={14} /> Export CSV
                      </button>
                      <button 
                        onClick={() => setShowRegisterModal(true)}
                        className="px-8 py-4 bg-[#2AB7A4] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Plus size={16} strokeWidth={3} /> Register New Patient
                      </button>
                    </div>
                  </div>

                  {/* Statistics Row */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="bg-white rounded-24 p-6 border border-slate-100 shadow-soft flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#007AFF]">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-2xl font-black text-slate-900">{PATIENTS_DATA.length}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Patients</p>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#007AFF] transition-colors" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search by Name or Phone..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#007AFF] transition-all"
                      />
                    </div>
                    <div className="relative min-w-[200px]">
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#007AFF] transition-all cursor-pointer"
                      >
                        <option>All Statuses</option>
                        <option>Completed</option>
                        <option>Pending</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Table UI */}
                  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Patient Details</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Age / Gender</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Contact</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Last Visit</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PATIENTS_DATA.filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              p.contact.includes(searchQuery) ||
                                              p.id.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus = statusFilter === "All Statuses" || p.status === statusFilter;
                          return matchesSearch && matchesStatus;
                        }).map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer border-b border-slate-50 last:border-0 font-sans">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-[11px] text-white group-hover:scale-110 transition-transform shadow-lg">{p.initial}</div>
                                <div>
                                  <p className="text-sm font-black text-slate-900 leading-tight">{p.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{p.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5 text-sm font-bold text-slate-600">{p.age} / {p.gender}</td>
                            <td className="px-8 py-5 text-sm font-bold text-slate-600 tracking-tight">{p.contact}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-900">{p.lastVisit}</td>
                            <td className="px-8 py-5 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase inline-flex items-center gap-2 ${
                                p.status === 'Completed' ? 'bg-teal-50 text-teal-600' : 'bg-orange-50 text-orange-600'
                              }`}>
                                <div className={`w-1 h-1 rounded-full ${p.status === 'Completed' ? 'bg-teal-600' : 'bg-orange-600'}`} />
                                {p.status}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center ml-auto">
                                <MoreVertical size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: REPORTS */}
            {view === 'reports' && (
              <motion.div key="reports" {...pageTransition} className="h-full flex overflow-hidden">
                {/* Left: Reports Selection (35%) */}
                <div className="w-[35%] border-r border-slate-100 flex flex-col bg-slate-50/30">
                  <div className="p-8 pb-4">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6 uppercase tracking-wider">Reports</h3>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 font-bold text-[10px] uppercase tracking-widest">
                      <button className="bg-white px-5 py-2.5 rounded-xl border border-blue-500 text-blue-600 shadow-sm">All Reports</button>
                      <button className="bg-white px-5 py-2.5 rounded-xl border border-slate-100 text-slate-400 hover:border-slate-200 transition-all">Pending</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-3 pt-0">
                    {PATIENTS_DATA.map((r, i) => (
                      <div key={i} className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0ea5e9]/30 transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-[#0ea5e9] group-hover:text-white transition-all uppercase font-black text-[10px]">{r.initial}</div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-black text-slate-900 uppercase tracking-wide">{r.name}</p>
                              <span className="text-[9px] font-bold text-slate-400">{r.lastVisit}</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Blood Report • Pending</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Preview (Centers Empty State) */}
                <div className="flex-1 bg-white flex flex-col items-center justify-center text-center p-20">
                   <div className="w-24 h-24 bg-slate-50/50 rounded-full flex items-center justify-center mb-8 relative">
                      <FileSearch size={44} className="text-slate-200" />
                      <div className="absolute top-0 right-0 w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-white">
                        <FileText size={16} />
                      </div>
                   </div>
                   <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">Select a report to view</h3>
                   <p className="text-sm font-medium text-slate-400 max-w-xs leading-relaxed">
                     Choose a clinical record from the left list to see detailed diagnosis and analysis.
                   </p>
                </div>

                {/* Vertical Notification Sidebar (Fixed 250px) */}
                <div className="w-[280px] border-l border-slate-100 bg-slate-50/50 flex flex-col">
                  <div className="p-6 border-b border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Real-Time Updates</h4>
                    <p className="text-xs font-black text-slate-900 uppercase">Recent Reports</p>
                  </div>
                  <div className="flex-1 p-6 space-y-6">
                    {REPORTS_DATA.slice(0, 5).map((rep, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${i % 2 === 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-teal-500 shadow-[0_0_8px_rgba(45,212,191,0.5)]'}`} />
                        <div>
                          <p className="text-[11px] font-bold text-slate-700 leading-[1.4] uppercase tracking-wide">{rep.name}: {rep.diagnosis}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{rep.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: QUEUE MANAGEMENT */}
            {view === 'queue' && (
              <motion.div key="queue" {...pageTransition} className="h-full overflow-y-auto p-10 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                  
                  {/* Header with Status Badge */}
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-[28px] font-bold text-[#1A1F37] tracking-tight leading-none mb-2">Queue Management</h2>
                      <p className="text-[13px] font-medium text-slate-400">Live patient queue & token control</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/50 rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Clinic is Open</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    
                    {/* Column 1: Serving Dashboard & Controls (4/12) */}
                    <div className="col-span-4 space-y-6">
                      
                      {/* Integrated Serving Card */}
                      <div className="bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-[32px] p-8 text-white text-center shadow-2xl shadow-blue-500/10 relative overflow-hidden h-[320px] flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70 mb-2">Now Serving</p>
                        <h3 className="text-[100px] font-black mb-2 tracking-tighter leading-none">#3</h3>
                        <p className="text-xl font-bold mb-6">Ravi Kumar</p>
                        <div className="flex justify-center">
                          <span className="px-6 py-2 bg-black/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">In Progress</span>
                        </div>
                        
                        {/* Abstract Decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -ml-16 -mb-16" />
                      </div>

                      {/* Stats Grid (3 columns) */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-24 p-5 border border-slate-100 shadow-sm text-center">
                          <div className="text-2xl font-black text-slate-800 mb-1">4</div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Waiting</p>
                        </div>
                        <div className="bg-emerald-50/30 rounded-24 p-5 border border-emerald-100 shadow-sm text-center">
                          <div className="text-2xl font-black text-emerald-600 mb-1">0</div>
                          <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Completed</p>
                        </div>
                        <div className="bg-blue-50/30 rounded-24 p-5 border border-blue-100 shadow-sm text-center">
                          <div className="text-2xl font-black text-blue-600 mb-1">5</div>
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Total</p>
                        </div>
                      </div>

                      {/* Primary Actions */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-[#0ea5e9] text-white py-5 rounded-24 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 group"
                        >
                          <SkipForward size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                          <span className="text-sm font-black tracking-tight">Call Next</span>
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-[#10b981] text-white py-5 rounded-24 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 size={20} strokeWidth={3} />
                          <span className="text-sm font-black tracking-tight">Mark Done</span>
                        </motion.button>
                      </div>
                    </div>

                    {/* Column 2: Queue List (4/12) */}
                    <div className="col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Queue List</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">5 tokens today</span>
                      </div>
                      <div className="space-y-4">
                        {[
                          { token: '#3', name: 'Ravi Kumar', wait: 'Now', status: 'In Progress', active: true },
                          { token: '#4', name: 'Sunita Mehta', wait: '~15 min', status: 'Waiting' },
                          { token: '#5', name: 'Deepak Verma', wait: '~30 min', status: 'Waiting' },
                          { token: '#6', name: 'Ananya Reddy', wait: '~45 min', status: 'Waiting' },
                          { token: '#7', name: 'Mohammed Irfan', wait: '~60 min', status: 'Waiting' },
                        ].map((q, i) => (
                          <div key={i} className={`flex items-center gap-5 p-4 rounded-24 transition-all border border-transparent ${q.active ? 'bg-amber-50/50 border-amber-100/30' : 'hover:bg-slate-50'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${q.active ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-400'}`}>
                              {q.token}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-900 leading-none mb-1">{q.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">Wait: {q.wait}</p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${q.active ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                              {q.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Today's Schedule (4/12) */}
                    <div className="col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft">
                      <div className="mb-8">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Today's Schedule</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">March 22, 2026</p>
                      </div>
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
                        {[
                          { token: '#1', name: 'Arjun Sharma', time: '10:00 AM', status: 'Completed', color: 'text-emerald-500 bg-emerald-50/50' },
                          { token: '#2', name: 'Priya Nair', time: '10:15 AM', status: 'Completed', color: 'text-emerald-500 bg-emerald-50/50' },
                          { token: '#3', name: 'Ravi Kumar', time: '10:30 AM', status: 'In Progress', color: 'text-amber-600 bg-amber-50/50' },
                          { token: '#4', name: 'Sunita Mehta', time: '10:45 AM', status: 'Confirmed', color: 'text-blue-500 bg-blue-50/50' },
                          { token: '#5', name: 'Deepak Verma', time: '11:00 AM', status: 'Confirmed', color: 'text-blue-500 bg-blue-50/50' },
                          { token: '#6', name: 'Ananya Reddy', time: '11:15 AM', status: 'Confirmed', color: 'text-blue-500 bg-blue-50/50' },
                        ].map((s, i) => (
                          <div key={i} className="flex items-center gap-5 p-4 rounded-24 hover:bg-slate-50 transition-all group">
                             <span className="text-[11px] font-black text-blue-500 w-8">{s.token}</span>
                             <div className="flex-1">
                               <p className="text-sm font-black text-slate-900 group-hover:translate-x-1 transition-transform">{s.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">{s.time}</p>
                             </div>
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.color}`}>
                               {s.status}
                             </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW: PROFILE */}
            {view === 'profile' && (
              <motion.div key="profile" {...pageTransition} className="h-full overflow-y-auto p-10 custom-scrollbar no-scrollbar">
                 <div className="max-w-7xl mx-auto space-y-8 pb-10">
                    <div className="flex items-center gap-2 text-slate-400 mb-6">
                      <span className="text-[13px] font-medium">ClinikQ</span>
                      <ChevronRight size={14} />
                      <span className="text-[13px] font-black text-slate-900">Profile</span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 items-start">
                      {/* --- ROW 1 LEFT: PROFESSIONAL IDENTITY --- */}
                      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft space-y-10 h-fit">
                        {/* Summary Header */}
                        <div className="flex items-center gap-8">
                          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-[#0ea5e9] to-[#0369a1] flex items-center justify-center text-white text-3xl font-black shadow-xl uppercase">
                             {doctorInfo.initials}
                          </div>
                          <div className="space-y-1">
                            <p className="text-2xl font-black text-slate-900">Dr. {doctorInfo.name}</p>
                            <p className="text-sm font-bold text-slate-400">MBBS, MD • {doctorInfo.specialization}</p>
                            <div className="inline-block mt-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                               License: MCI-2023-GEN-04821
                            </div>
                          </div>
                        </div>

                        {/* Identity Form Section */}
                        <div className="space-y-8 pt-6 border-t border-slate-50">
                          <h4 className="flex items-center gap-2 text-blue-500 font-bold">
                             <User size={18} />
                             <span className="text-sm uppercase tracking-widest font-black">Professional Identity</span>
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                               <input type="text" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all font-jakarta uppercase" defaultValue={doctorInfo.name} />
                            </div>
                            <div className="space-y-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree / Title</p>
                               <input type="text" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all font-jakarta" placeholder="MBBS, MD" />
                            </div>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</p>
                             <input type="text" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-blue-400 transition-all font-jakarta uppercase" defaultValue={doctorInfo.specialization} />
                          </div>
                          <div className="space-y-2">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical License Number</p>
                             <input type="text" className="w-full h-12 bg-slate-50 border-2 border-blue-400 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none transition-all font-jakarta" placeholder="MCI-2023-GEN-04821" />
                          </div>

                          {/* Digital Signature */}
                          <div className="space-y-3">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Signature</p>
                             <div className="border-2 border-dashed border-slate-100 rounded-[32px] p-10 flex flex-col items-center justify-center bg-slate-50/30 group hover:border-blue-200 transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 shadow-sm transition-colors mb-4"><UploadCloud size={24} /></div>
                                <p className="text-[13px] font-bold text-slate-500">Upload signature image</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG or JPG recommended</p>
                                <button className="mt-6 px-8 py-2.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Upload Signature</button>
                             </div>
                          </div>

                          <button className="w-full py-5 bg-[#0ea5e9] text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">Save Profile</button>
                        </div>
                      </div>

                      {/* --- ROW 1 RIGHT: PRACTICE SETTINGS --- */}
                      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft h-fit space-y-10">
                        <h4 className="flex items-center gap-2 text-blue-500 font-bold">
                           <LayoutDashboard size={18} />
                           <span className="text-sm uppercase tracking-widest font-black">Practice Settings</span>
                        </h4>

                        <div className="space-y-10">
                           {/* Working Days */}
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Working Days</p>
                              <div className="flex gap-2 flex-wrap">
                                 {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                                   <div key={d} className={`px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${i >= 1 && i <= 5 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                      {d}
                                   </div>
                                 ))}
                              </div>
                           </div>

                           {/* Shift Timings */}
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Timing</p>
                              <div className="flex items-center gap-4">
                                 <div className="flex-1 space-y-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Start Time</p>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:bg-white focus-within:border-blue-400 transition-all">
                                       <span className="text-sm font-bold text-slate-700">10:00 AM</span>
                                       <Clock size={16} className="text-slate-300" />
                                    </div>
                                 </div>
                                 <ChevronRight size={14} className="text-slate-300 mt-6" />
                                 <div className="flex-1 space-y-2">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End Time</p>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group focus-within:bg-white focus-within:border-blue-400 transition-all">
                                       <span className="text-sm font-bold text-slate-700">04:00 PM</span>
                                       <Clock size={16} className="text-slate-300" />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Throughput */}
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Patients / Day</p>
                                 <input type="text" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none transition-all font-jakarta" placeholder="30" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Consult Time (Min)</p>
                                 <input type="text" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none transition-all font-jakarta" placeholder="15" />
                              </div>
                           </div>

                           {/* Calc Card */}
                           <div className="bg-blue-50/50 rounded-24 p-5 flex items-center gap-5 border border-blue-100/50 group">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm transition-transform group-hover:scale-110"><Clock size={18} /></div>
                              <div>
                                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Estimated Max Wait Time</p>
                                 <p className="text-sm font-black text-slate-900 leading-none">8 hours for last patient</p>
                              </div>
                           </div>

                           <button className="w-full py-5 bg-[#0ea5e9] text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">Save Settings</button>
                        </div>
                      </div>

                      {/* --- ROW 2 LEFT: ACCOUNT & SECURITY --- */}
                      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft h-fit space-y-10">
                        <h4 className="flex items-center gap-2 text-blue-500 font-bold">
                           <Shield size={18} />
                           <span className="text-sm uppercase tracking-widest font-black">Account & Security</span>
                        </h4>

                        <div className="space-y-8">
                           {/* Role Badge */}
                           <div className="bg-blue-50/30 rounded-2xl p-5 flex items-center justify-between border border-blue-100/50">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><UserPlus size={18} /></div>
                                 <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Role</p>
                                    <p className="text-sm font-black text-slate-900">Role: Doctor</p>
                                 </div>
                              </div>
                              <span className="px-3 py-1 bg-blue-100/50 text-blue-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Read-only</span>
                           </div>

                           {/* Email Management */}
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                              <div className="flex gap-3">
                                 <input type="text" className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none transition-all font-jakarta" placeholder="dr.john@clinikq.com" />
                                 <button className="px-8 bg-[#0ea5e9] text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-400/20 active:scale-[0.96] transition-all">Update</button>
                              </div>
                           </div>

                           {/* Password Management */}
                           <div className="space-y-6 pt-6 border-t border-slate-50">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Change Password</p>
                              <div className="space-y-4">
                                 <input type="password" underline="none" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-500 outline-none transition-all font-jakarta focus:bg-white" placeholder="Current password" />
                                 <input type="password" underline="none" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-500 outline-none transition-all font-jakarta focus:bg-white" placeholder="New password" />
                                 <input type="password" underline="none" className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-500 outline-none transition-all font-jakarta focus:bg-white" placeholder="Confirm new password" />
                              </div>
                              <button className="w-full py-5 bg-[#1A1F37] text-white rounded-[24px] text-sm font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                                <Lock size={16} />
                                <span>Update Password</span>
                              </button>
                           </div>
                        </div>
                      </div>

                      {/* --- ROW 2 RIGHT: PREFERENCES --- */}
                      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-soft h-auto flex flex-col space-y-10">
                        <h4 className="flex items-center gap-2 text-blue-500 font-bold">
                           <Settings size={18} />
                           <span className="text-sm uppercase tracking-widest font-black">Preferences & Theme</span>
                        </h4>

                        <div className="space-y-10">
                           {/* Theme Selection */}
                           <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Theme Mode</p>
                              <div className="grid grid-cols-2 p-1.5 bg-slate-50/50 border border-slate-100 rounded-[22px] gap-2">
                                 <button className="flex items-center justify-center gap-3 py-3 rounded-[18px] bg-white text-[#1A1F37] shadow-sm border border-slate-100 font-bold text-xs uppercase tracking-widest transition-all">
                                    <Sun size={14} className="text-amber-500" />
                                    <span>Light Interface</span>
                                 </button>
                                 <button className="flex items-center justify-center gap-3 py-3 rounded-[18px] text-slate-400 hover:bg-white/50 font-bold text-xs uppercase tracking-widest transition-all">
                                    <Moon size={14} />
                                    <span>Dark Interface</span>
                                 </button>
                              </div>
                           </div>

                           {/* Information Tip */}
                           <div className="mt-auto p-6 bg-slate-50/50 rounded-24 border border-slate-100 space-y-3">
                              <p className="text-[10px] font-black text-[#1A1F37] uppercase tracking-widest">Configuration Note</p>
                              <p className="text-[12px] font-bold text-slate-500 leading-[1.6]">
                                 Personalizing these settings will synchronize your workspace across multiple devices. System notifications are prioritized by emergency level.
                              </p>
                           </div>
                        </div>
                      </div>
                    </div>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* 3. Sliding Side-Panel (Drawer) for Register New Patient */}
      <AnimatePresence>
        {showRegisterModal && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-10 overflow-y-auto"
            >
              {/* Modal Card */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden relative"
              >
                 <div className="bg-[#1A1F37] p-10 text-white relative">
                    <h2 className="text-3xl font-black italic tracking-tighter">ClinikQ Entry</h2>
                    <p className="text-[10px] font-black text-[#0ea5e9] uppercase tracking-[0.2em] mt-1">Register New Patient Record</p>
                    <button 
                      onClick={() => setShowRegisterModal(false)}
                      className="absolute top-10 right-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                      <X size={20} />
                    </button>
                 </div>

                 <div className="p-12 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                          <input type="text" placeholder="Rahul Sharma" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                             <input type="number" placeholder="28" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                             <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all outline-none appearance-none cursor-pointer">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Registry</label>
                          <input type="tel" placeholder="+91 98765 43210" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Priority</label>
                          <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#0ea5e9]/20 transition-all outline-none appearance-none cursor-pointer">
                             <option>Regular Checkup</option>
                             <option>Urgent Consultation</option>
                             <option>Post-Op Verification</option>
                          </select>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                       <button className="w-full py-5 bg-[#2AB7A4] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                          Finalize Registry Entry
                       </button>
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default DoctorDashboard;
