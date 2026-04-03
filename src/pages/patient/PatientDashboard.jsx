import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaClipboardList, FaUserMd, FaBell, FaSignOutAlt, 
  FaCheckCircle, FaClock, FaStethoscope, FaEye, FaPlus, 
  FaFileMedical, FaUserCircle, FaChartLine, FaMapMarkerAlt,
  FaExclamationCircle, FaInfoCircle, FaCalendarCheck, FaHeart, FaCog, FaBuilding, FaTicketAlt, FaChevronRight, FaTimesCircle
} from 'react-icons/fa';
import PatientProfile from '../../components/profile/PatientProfile';
import StatusModal from '../../components/dashboard/StatusModal';
import AppointmentCard from '../../components/dashboard/AppointmentCard';
import RollingNumber from '../../components/dashboard/RollingNumber';
import MyAppointments from './MyAppointments';

// Sub-components moved to separate files


const PatientDashboard = ({ initialTab = 'dashboard' }) => {


  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  const [appointmentFilter, setAppointmentFilter] = useState('All');
  const [reportFilter, setReportFilter] = useState('All');
  
  // Real Data State
  const [appointments, setAppointments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeToken, setActiveToken] = useState(null);
  const [reports, setReports] = useState([]);
  const [servingToken, setServingToken] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    upcoming: 0,
    cancelled: 0,
    reportsCount: 0,
    alertsCount: 3
  });

  // Form State
  const [formData, setFormData] = useState({
    department: '',
    doctor: '',
    doctorId: '',
    date: ''
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const closeStatusModal = () => setStatusModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const DEPARTMENT_DOCTOR_MAP = {
    'General Medicine': 'Dr. Mitchell',
    'Orthopedics': 'Dr. Evans',
    'Cardiology': 'Dr. Sarah Ahmed'
  };

  const handleDepartmentChange = (e) => {
    const dept = e.target.value;
    // Filter doctors by selected department specialization
    const matchingDoctor = doctors.find(doc => doc.specialization === dept);
    const doctorName = matchingDoctor ? matchingDoctor.name : '';
    const doctorId = matchingDoctor ? matchingDoctor._id : '';
    setFormData({ ...formData, department: dept, doctor: doctorName, doctorId: doctorId });
  };

  const [user, setUser] = useState({ name: 'Patient', role: 'patient' });

  useEffect(() => {
    const savedData = localStorage.getItem('clinikq_patient_data');
    if (savedData && savedData !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedData);
        setUser(prev => ({ ...prev, ...parsedUser }));
      } catch (err) {
        console.error("Invalid patient data in storage:", err);
      }
    }
    
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    fetchData();
    const BASE_URL = 'http://localhost:5001/api';
    const socket = io('http://localhost:5001');
    
    socket.on('queueUpdate', (data) => {
      // OPTIMIZED: Targeted fetch for status and position only
      fetchQueueStatus();
    });

    // Integrated Notification Listener
    socket.on('notification', (data) => {
      const savedData = localStorage.getItem('clinikq_patient_data');
      const currentUser = savedData ? JSON.parse(savedData) : null;
      const currentId = currentUser?._id || currentUser?.name;

      if (data.userId === currentId) {
        if ("Notification" in window && Notification.permission === "granted") {
           new Notification("ClinikQ Update", {
              body: data.message,
              icon: "/favicon.ico",
              silent: false,
              requireInteraction: true
           });
        }
        setStatusModal({
          isOpen: true,
          title: 'New Notification',
          message: data.message,
          type: 'info'
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  // Poll for current serving token every 30 seconds
  useEffect(() => {
    if (!activeToken) return;

    const pollServingToken = async () => {
      try {
        const servRes = await axios.get(`/api/queue/serving/${activeToken.department}?doctor=${activeToken.doctor}&doctorId=${activeToken.doctorId}`);
        setServingToken(servRes.data.servingToken);
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollServingToken(); // Initial fetch
    const interval = setInterval(pollServingToken, 30000);
    return () => clearInterval(interval);
  }, [activeToken?.department]);

  const fetchData = async () => {
    try {
      const savedData = localStorage.getItem('clinikq_patient_data');
      const patientData = savedData ? JSON.parse(savedData) : null;
      const userName = patientData?.name || 'Patient';
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [profileRes, apptsRes, deptsRes, docsRes, statsRes, reportsRes] = await Promise.all([
        axios.get('/api/users/profile', { headers }),
        axios.get(`/api/appointments?userName=${userName}`),
        axios.get('/api/departments'),
        axios.get('/api/doctors'),
        axios.get(`/api/patient/stats?userName=${userName}`),
        axios.get(`/api/patient/reports?userName=${userName}`)
      ]);
      
      const userProfile = profileRes.data;
      // Protect identity from being overwritten by socket-triggered updates
      setUser(prev => ({ 
        ...prev, 
        ...userProfile, 
        name: prev.name || userProfile.name // Prioritize existing state name
      }));
      
      const appts = apptsRes.data;
      setAppointments(appts);
      setDepartments(deptsRes.data);
      setDoctors(docsRes.data);
      setReports(reportsRes.data);
      
      const { totalVisits, reportsCount, alertsCount } = statsRes.data;
      
      const active = appts.find(a => a.status === 'Waiting' || a.status === 'in-progress' || a.status === 'pending');
      setActiveToken(active);
      
      setStats({
        total: appts.length,
        completed: totalVisits || appts.filter(a => a.status === 'Completed').length,
        pending: appts.filter(a => a.status === 'pending').length,
        upcoming: appts.filter(a => a.status === 'Waiting').length,
        cancelled: appts.filter(a => a.status === 'Cancelled').length,
        reportsCount: reportsCount || 0,
        alertsCount: alertsCount || 3
      });
      
      if (active) {
        const [servRes, posRes] = await Promise.all([
          axios.get(`/api/queue/serving/${active.department}?doctor=${active.doctor}&doctorId=${active.doctorId}`),
          axios.get(`/api/queue/position/${active.tokenId}`)
        ]);
        
        setServingToken(servRes.data.servingToken);
        const aheadCount = posRes.data.aheadCount;
        setActiveToken({ ...active, aheadCount });

        // Proximity Notification: Alert if only 1 person is ahead
        if (aheadCount === 1) {
           const notifiedKey = `notified_prox_${active.tokenId}`;
           if (!sessionStorage.getItem(notifiedKey)) {
              if ("Notification" in window && Notification.permission === "granted") {
                 new Notification("ClinikQ: You are Next!", {
                    body: `Only 1 patient ahead for Dr. ${active.doctor}. Please get ready!`,
                    icon: "/favicon.ico",
                    requireInteraction: true
                 });
                 sessionStorage.setItem(notifiedKey, "true");
              }
           }
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const savedData = localStorage.getItem('clinikq_patient_data');
      const patientData = savedData ? JSON.parse(savedData) : null;
      if (!patientData) return;

      const userName = patientData.name;
      const apptsRes = await axios.get(`/api/appointments?userName=${userName}`);
      const appts = apptsRes.data;
      setAppointments(appts);

      const active = appts.find(a => a.status === 'Waiting' || a.status === 'in-progress' || a.status === 'pending');
      setActiveToken(active);

      if (active) {
        const [servRes, posRes] = await Promise.all([
          axios.get(`/api/queue/serving/${active.department}?doctor=${active.doctor}&doctorId=${active.doctorId}`),
          axios.get(`/api/queue/position/${active.tokenId}`)
        ]);
        setServingToken(servRes.data.servingToken);
        setActiveToken({ ...active, aheadCount: posRes.data.aheadCount });
      } else {
        setServingToken(null);
      }
    } catch (err) {
      console.error("Queue Sync Error:", err);
    }
  };

  const handleBookToken = async (e) => {
    e.preventDefault();
    if (!formData.department || !formData.doctor || !formData.date) return;
    
    // date comes as YYYY-MM-DD from type="date" input
    const [year, month, day] = formData.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // 1. Client-side working day validation (UX improvement)
    const selectedDoctor = doctors.find(d => d.name === formData.doctor);
    if (selectedDoctor && selectedDoctor.workingDays) {
       const d = new Date(year, month - 1, day);
       const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
       
       if (!selectedDoctor.workingDays.includes(dayName)) {
          setStatusModal({
            isOpen: true,
            title: 'Schedule Conflict',
            message: `Dr. ${formData.doctor} is not available on ${dayName} (${formattedDate}). Please select another clinical day.`,
            type: 'warning'
          });
          return;
       }
    }

    setBookingLoading(true);
    try {
      const res = await axios.post('/api/tokens', {
        ...formData,
        date: formattedDate, // Send correctly formatted date to backend
        userName: user.name,
        patientId: user._id
      });
      
      // Update local state and switch tab
      setActiveToken(res.data);
      setAppointments(prev => [res.data, ...prev]);
      
      setBookingLoading(false);
      // Wait for a smooth transition before switching tab
      setTimeout(() => setActiveTab('dashboard'), 300);
    } catch (err) {
      console.error("Booking error:", err);
      const errorMsg = err.response?.data?.error || "Failed to book token. Please try again.";
      setStatusModal({
        isOpen: true,
        title: 'Booking Failed',
        message: errorMsg,
        type: 'error'
      });
      setBookingLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await axios.patch(`/api/appointments/${id}`, { status: 'Cancelled' });
      // The socket will trigger a re-fetch, but we can also update locally for snappiness
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
    } catch (err) {
      console.error("Cancel error:", err);
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <FaChartLine className="text-xl" />, label: 'Dashboard' },
    { id: 'book', icon: <FaPlus className="text-xl" />, label: 'Book Token' },
    { id: 'appointments', icon: <FaCalendarCheck className="text-xl" />, label: 'My Appointments' },
    { id: 'reports', icon: <FaFileMedical className="text-xl" />, label: 'My Reports' },
    { id: 'profile', icon: <FaUserCircle className="text-xl" />, label: 'Profile' },
  ];

  const appointmentStats = [
    { title: 'All', value: stats.total, color: 'text-blue-500 bg-blue-50 border-blue-200', icon: <FaCalendarAlt /> },
    { title: 'Upcoming', value: stats.upcoming, color: 'text-blue-500 bg-blue-50 border-blue-200', icon: <FaClock /> },
    { title: 'Completed', value: stats.completed, color: 'text-emerald-500 bg-emerald-50 border-emerald-200', icon: <FaCheckCircle /> },
    { title: 'Cancelled', value: stats.cancelled, color: 'text-rose-500 bg-rose-50 border-rose-200', icon: <FaTimesCircle /> },
  ];

  const filteredAppointments = useMemo(() => {
    if (appointmentFilter === 'All') return appointments;
    return appointments.filter(app => app.status === appointmentFilter);
  }, [appointments, appointmentFilter]);

  const filteredReports = reportFilter === 'All' 
    ? reports 
    : reports.filter(rep => rep.status === reportFilter);

  // Skeleton Loader Component
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded-[16px] ${className}`}></div>
  );

  // Smart Estimation & Countdown Logic
  const waitTimeMetrics = useMemo(() => {
    if (!activeToken) return null;
    
    // The user wants position calculated as "how many tokens are ahead"
    const patientPosition = activeToken.aheadCount || 0;
    
    // Use the stored bookedTime from backend for stability
    // If not present, fallback to createdAt + 15 mins
    let targetTime;
    if (activeToken.bookedTime) {
      targetTime = new Date();
      const [time, modifier] = activeToken.bookedTime.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      
      targetTime.setHours(hours, minutes, 0, 0);
    } else {
      const pos = activeToken.aheadCount || 1;
      targetTime = new Date(new Date(activeToken.createdAt).getTime() + pos * 15 * 60 * 1000);
    }
    
    return {
      patientPosition,
      expectedTime: targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      targetTimeMs: targetTime.getTime(),
      isClose: patientPosition <= 2 && patientPosition > 0
    };
  }, [activeToken?.aheadCount, activeToken?.tokenId]); // Only recalculate when position/token changes

  // Separate Countdown Timer that updates every second
  const [countdownStr, setCountdownStr] = useState("00:00");
  const [notificationSent, setNotificationSent] = useState(false);

  useEffect(() => {
    if (!waitTimeMetrics || !activeToken) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = waitTimeMetrics.targetTimeMs;

      const diff = target - now;
      if (diff <= 0) {
        setCountdownStr("00:00");
      } else {
        const dMins = Math.floor(diff / 60000);
        const dSecs = Math.floor((diff % 60000) / 1000);
        setCountdownStr(`${dMins.toString().padStart(2, '0')}:${dSecs.toString().padStart(2, '0')}`);
        
        // Notification logic
        if (dMins === 5 && dSecs === 0 && !notificationSent) {
          if (Notification.permission === "granted") {
            new Notification("ClinikQ Queue Alert", {
              body: "Your turn is coming soon! Please stay near the room.",
              icon: "/favicon.ico"
            });
            setNotificationSent(true);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [waitTimeMetrics, notificationSent]);


  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0 relative z-20">
        <div className="p-8 pb-4 border-b border-gray-50 mb-4 flex items-center gap-3">
           <div className="w-10 h-10 bg-cyan-500 rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <FaHeart className="text-xl" />
           </div>
           <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">ClinikQ</h1>
        </div>
        
        <nav className="flex flex-col gap-2 px-4">
          <p className="px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 mt-4">Menu</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-[16px] transition-all duration-[450ms] ease-in-out font-bold text-sm relative ${
                activeTab === item.id
                  ? 'bg-cyan-50 text-cyan-600 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-cyan-500' : 'text-gray-400'}`}>
                 {item.icon}
              </div>
              {item.label}
              {activeTab === item.id && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto p-6">
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 justify-center px-4 py-4 rounded-[16px] text-rose-500 font-bold text-sm hover:bg-rose-50 hover:shadow-sm transition-all duration-[450ms]"
          >
            <FaSignOutAlt className="text-lg" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-8 opacity-0 animate-[fadeIn_0.45s_ease-in-out_forwards]">
           
           {/* Header */}
           <header className="flex items-center justify-between mb-2">
              <div>
                 <p className="text-sm font-bold text-gray-400 mb-1">ClinikQ / <span className="text-cyan-600 capitalize">{activeTab === 'book' ? 'Book Token' : activeTab}</span></p>
                 <h2 className="text-2xl font-extrabold text-gray-900">Tuesday, 24 March 2026</h2>
              </div>
              
              <div className="flex items-center gap-6">
                 <button className="relative w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-gray-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md hover:-translate-y-1 transition-all duration-[500ms] group">
                    <FaBell className="text-xl group-hover:text-cyan-500 group-hover:rotate-12 transition-all duration-[500ms]" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">3</span>
                 </button>
                 
                 <div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-[500ms]">
                    <div className="w-10 h-10 rounded-[14px] bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                       {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.name}</p>
                       <p className="text-[11px] font-bold text-gray-400 leading-none">Standard Patient</p>
                    </div>
                 </div>
              </div>
           </header>

            {/* Proximity Alert Banner */}
            <AnimatePresence>
              {waitTimeMetrics?.isClose && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="bg-amber-600 p-5 rounded-[24px] shadow-xl shadow-amber-600/30 flex items-center justify-between text-white border-2 border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-[16px] flex items-center justify-center text-2xl shadow-inner">
                        <FaBell className="animate-bounce" />
                      </div>
                      <div>
                        <p className="text-xl font-black tracking-tight text-white drop-shadow-md">Your turn is approaching!</p>
                        <p className="text-sm font-bold text-amber-50/90 italic">Please be ready near {activeToken.roomNumber || 'your designated room'}.</p>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-[14px] text-xs font-bold transition-all">
                      Acknowledge
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

           {activeTab === 'dashboard' ? (
              <div className="flex flex-col gap-8">
                 
                 {/* Upper Section (65 / 35 Split) */}
                 <div className="flex items-stretch gap-8">
                    {/* Left: Hero Banner (65%) */}
                    <div className="w-[65%] rounded-[24px] bg-gradient-to-br from-[#1E40AF] to-[#06B6D4] p-8 shadow-xl shadow-cyan-500/20 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-all duration-[500ms] h-full">
                       {/* Decorative Background Elements */}
                       <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                       <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                       
                       <div className="relative z-10 mb-8 mt-2">
                          <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                             Good Morning 👋<br />Welcome to ClinikQ
                          </h1>
                          <p className="text-blue-100/90 text-[15px] font-medium max-w-sm mt-4 leading-relaxed">
                              Track your appointments and report with ease
                          </p>
                       </div>
                       
                       <div className="relative z-10 flex items-center gap-4 mb-4 mt-auto">
                          <button onClick={() => setActiveTab('book')} className="px-7 py-3.5 bg-white text-blue-600 rounded-[16px] font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-[500ms] border border-white/50 flex flex-center gap-2">
                             <FaPlus /> Book Token
                          </button>
                          <button onClick={() => setActiveTab('appointments')} className="px-7 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/30 rounded-[16px] font-bold text-sm shadow-lg hover:bg-white/20 hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all duration-[500ms]">
                             Appointments
                          </button>
                       </div>

                       <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-5 mt-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                                <FaCalendarCheck />
                             </div>
                             <div>
                                <p className="text-white font-bold text-[13px] leading-tight">{stats.completed} Total</p>
                                <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wider">Visits</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                                <FaFileMedical />
                             </div>
                             <div>
                                <p className="text-white font-bold text-[13px] leading-tight">{stats.reportsCount} Reports</p>
                                <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wider">Available</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                                <FaBell />
                             </div>
                             <div>
                                <p className="text-white font-bold text-[13px] leading-tight">{stats.alertsCount} Alerts</p>
                                <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-wider">Notifications</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Right: Queue Status Circular Progress (35%) */}
                    <div className="w-[35%] bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] flex flex-col relative hover:-translate-y-1 transition-all duration-[500ms] h-full overflow-hidden">
                       <h3 className="text-xl font-bold text-gray-900 absolute top-7 left-8">Queue Status</h3>
                       
                       <div className="flex-1 flex flex-col items-center justify-center w-full mt-10">
                          {loading ? (
                            <Skeleton className="w-44 h-44 rounded-full mb-6" />
                          ) : !activeToken ? (
                            <div className="flex flex-col items-center justify-center text-center p-4">
                               <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-dashed border-gray-100">
                                  <FaTicketAlt className="text-4xl text-gray-200" />
                               </div>
                               <p className="text-gray-400 font-bold text-sm mb-4">No Active Token</p>
                               <button onClick={() => setActiveTab('book')} className="px-6 py-2.5 bg-cyan-500 text-white rounded-[12px] font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-300">
                                  Book Now
                               </button>
                            </div>
                         ) : (
                            <>
                              <div className="relative w-44 h-44 flex items-center justify-center group mb-6">
                                 <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F5F9" strokeWidth="6" />
                                    <motion.circle 
                                      cx="50" cy="50" r="45" fill="none" stroke="#06B6D4" strokeWidth="8" 
                                      strokeDasharray="283" 
                                      initial={{ strokeDashoffset: 283 }}
                                      animate={{ strokeDashoffset: 283 - (283 * (activeToken.position <= 5 ? 0.8 : 0.4)) }}
                                      transition={{ duration: 1, ease: "easeOut" }}
                                      strokeLinecap="round" 
                                    />
                                 </svg>
                                 <div className="relative z-10 flex flex-col items-center justify-center w-[130px] h-[130px] bg-white rounded-full shadow-lg border-4 border-white group-hover:scale-105 transition-transform duration-[500ms]">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Token</span>
                                    <span className="text-2xl font-extrabold text-cyan-500 tracking-tight">{activeToken.tokenId}</span>
                                 </div>
                              </div>
                              
                              <div className="w-full flex flex-col gap-2.5">
                                 <div className="w-full flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-[14px] text-emerald-700 font-bold text-sm border border-emerald-100/50">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> In Progress</span>
                                    <span>{servingToken?.status === 'in-progress' ? `${servingToken.tokenId} (in-progress)` : '--'}</span>
                                 </div>
                                 <div className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 rounded-[14px] text-blue-700 font-bold text-sm border border-blue-100/50">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Your Position</span>
                                    <span>#{waitTimeMetrics?.patientPosition || 0}</span>
                                 </div>
                                 <div className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] font-bold text-sm border transition-all duration-500 ${activeToken.status === 'in-progress' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (waitTimeMetrics?.isClose ? 'animate-pulse-orange bg-amber-50 text-amber-900 border-amber-300' : 'bg-orange-50 text-orange-700 border-orange-100/50')}`}>
                                    <div className="flex flex-col">
                                       <span className="flex items-center gap-2">
                                         <FaClock className={`${activeToken.status === 'in-progress' ? 'text-emerald-500' : 'text-orange-500'} ${waitTimeMetrics?.isClose ? 'animate-spin-slow' : ''}`} /> 
                                         {activeToken.status === 'in-progress' ? 'CONSULTING' : `exact ${countdownStr}`}
                                       </span>
                                       {activeToken.status !== 'in-progress' && (
                                         <span className="text-[10px] text-orange-500/70 ml-6">Exp: {waitTimeMetrics?.expectedTime}</span>
                                       )}
                                    </div>
                                    <span className={`text-xs font-black tracking-widest uppercase bg-white/50 px-2 py-1 rounded-md ${activeToken.status === 'in-progress' ? 'text-emerald-600' : 'text-orange-600'}`}>LIVE</span>
                                 </div>
                              </div>
                            </>
                          )}
                       </div>
                    </div>

                 </div>

                 {/* Middle Section (Side-by-Side 50/50) */}
                 <div className="flex gap-8">
                    {/* Left: Today's Appointment */}
                    <div className="w-1/2 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-[500ms] border border-gray-100/50">
                       <h3 className="text-xl font-bold text-gray-900 mb-8">Today's Appointment</h3>
                       <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-5">
                             <div className="w-[72px] h-[72px] rounded-[20px] bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-2xl shadow-sm border border-indigo-100">
                                SA
                             </div>
                             <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{activeToken?.doctor || 'Dr. Sarah Ahmed'}</h4>
                                <p className="text-sm font-semibold text-gray-500">{activeToken?.department || 'Cardiology Specialist'}</p>
                             </div>
                          </div>
                          <div className="flex flex-col gap-3">
                             <div className="flex items-center gap-2.5 text-gray-700 font-bold text-[13px] bg-gray-50 px-4 py-2 rounded-[12px] shadow-sm">
                                <FaClock className="text-cyan-500 text-lg"/> 10:30 AM
                             </div>
                             <div className="flex items-center gap-2.5 text-gray-700 font-bold text-[13px] bg-gray-50 px-4 py-2 rounded-[12px] shadow-sm">
                                <FaMapMarkerAlt className="text-rose-400 text-lg"/> {activeToken?.roomNumber || 'Room 4'}
                             </div>
                          </div>
                       </div>
                       
                       {/* Live Token Status Card */}
                       <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Live Token Status</span>
                             <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Live Now
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between gap-6">
                             <div className="flex-1 p-4 bg-white rounded-[18px] border border-gray-100 shadow-sm text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{servingToken?.status === 'in-progress' ? servingToken.tokenId : "--"}</p>
                             </div>
                             <div className="flex-1 p-4 bg-blue-600 rounded-[18px] shadow-lg shadow-blue-500/20 text-center">
                                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">Your Token</p>
                                <p className="text-2xl font-black text-white tracking-tight">{activeToken?.tokenId || '--'}</p>
                             </div>
                          </div>
                          
                          <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-100/50 rounded-[18px] text-[13px] font-bold text-gray-600">
                             <div className="flex flex-col">
                                <span className="flex items-center gap-2"><FaClock className="text-cyan-500" /> turn in exact {countdownStr || '--:--'}</span>
                                <span className="text-[10px] text-gray-400 ml-6 uppercase tracking-wider font-black">expected by {waitTimeMetrics?.expectedTime || '--:--'}</span>
                             </div>
                             <span className="text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">10 MIN CAP</span>
                          </div>
                       </div>
                    </div>

                    {/* Right: Alerts Vertical List */}
                    <div className="w-1/2 bg-white rounded-[24px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-[500ms] border border-gray-100/50">
                       <h3 className="text-xl font-bold text-gray-900 mb-6">Alerts</h3>
                       <div className="flex flex-col gap-3">
                          {/* Alert Item 1 */}
                          <div className="flex justify-between items-start group cursor-pointer p-4 rounded-[20px] hover:bg-gray-50/80 transition-colors duration-[500ms]">
                             <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[14px] bg-orange-50 text-orange-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-[500ms]">
                                   <FaExclamationCircle />
                                </div>
                                <div>
                                   <p className="text-[15px] font-bold text-gray-900 mb-1">Report Available</p>
                                   <p className="text-xs font-semibold text-gray-500 leading-relaxed pr-4">Your recent medical reports are now available to view.</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-black tracking-widest uppercase text-orange-500 whitespace-nowrap bg-orange-100/50 px-2.5 py-1.5 rounded-[8px]">URGENT</span>
                          </div>
                          <div className="w-full h-px bg-gray-100"></div>
                          {/* Alert Item 2 */}
                          <div className="flex justify-between items-start group cursor-pointer p-4 rounded-[20px] hover:bg-gray-50/80 transition-colors duration-[500ms]">
                             <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-blue-500 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-[500ms]">
                                   <FaInfoCircle />
                                </div>
                                <div>
                                   <p className="text-[15px] font-bold text-gray-900 mb-1">Appointment Confirmed</p>
                                   <p className="text-xs font-semibold text-gray-500 leading-relaxed pr-4">Your session with Dr. Ahmed is confirmed for today.</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 whitespace-nowrap">2 hrs ago</span>
                          </div>
                          <div className="w-full h-px bg-gray-100"></div>
                          {/* Alert Item 3 */}
                          <div className="flex justify-between items-start group cursor-pointer p-4 rounded-[20px] hover:bg-gray-50/80 transition-colors duration-[500ms]">
                             <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-[14px] bg-teal-50 text-teal-600 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-[500ms]">
                                   <FaCheckCircle />
                                </div>
                                <div>
                                   <p className="text-[15px] font-bold text-gray-900 mb-1">Profile Updated</p>
                                   <p className="text-xs font-semibold text-gray-500 leading-relaxed pr-4">Emergency contact information updated successfully.</p>
                                </div>
                             </div>
                             <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 whitespace-nowrap">1 day ago</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 {/* Bottom Row - Summary Stats */}
                  <div className="grid grid-cols-4 gap-6 pb-12">
                     <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-[500ms] cursor-pointer group flex items-center gap-6">
                        <div className="w-[60px] h-[60px] rounded-[18px] bg-indigo-50 text-indigo-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-[500ms] shadow-sm">
                           <FaClipboardList />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-gray-900 leading-none mb-1.5 tracking-tight">
                             <RollingNumber value={stats.total} />
                           </p>
                           <p className="text-[13px] font-bold text-gray-500">Total Tokens</p>
                        </div>
                     </div>
                     <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-[500ms] cursor-pointer group flex items-center gap-6">
                        <div className="w-[60px] h-[60px] rounded-[18px] bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-[500ms] shadow-sm">
                           <FaUserMd />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-gray-900 leading-none mb-1.5 tracking-tight">
                             <RollingNumber value={stats.completed} />
                           </p>
                           <p className="text-[13px] font-bold text-gray-500">Completed Visits</p>
                        </div>
                     </div>
                     <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-[500ms] cursor-pointer group flex items-center gap-6">
                        <div className="w-[60px] h-[60px] rounded-[18px] bg-orange-50 text-orange-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-[500ms] shadow-sm">
                           <FaFileMedical />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-gray-900 leading-none mb-1.5 tracking-tight">
                             <RollingNumber value={stats.pending} />
                           </p>
                           <p className="text-[13px] font-bold text-gray-500">Pending Reports</p>
                        </div>
                     </div>
                     <div className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all duration-[500ms] cursor-pointer group flex items-center gap-6">
                        <div className="w-[60px] h-[60px] rounded-[18px] bg-cyan-50 text-cyan-500 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-[500ms] shadow-sm">
                           <FaCalendarAlt />
                        </div>
                        <div>
                           <p className="text-3xl font-black text-gray-900 leading-none mb-1.5 tracking-tight">
                             <RollingNumber value={stats.upcoming} />
                           </p>
                           <p className="text-[13px] font-bold text-gray-500">Upcoming Appts</p>
                        </div>
                     </div>
                  </div>


              </div>
            ) : activeTab === 'book' ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex gap-8"
              >
                 {/* Left Column (60%) */}
                 <div className="w-[60%] bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Book a Token</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-8">Fill the form to get your queue number</p>
                                       <form onSubmit={handleBookToken} className="flex flex-col gap-6">
                        {/* Department */}
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Department <span className="text-rose-500">*</span></label>
                           <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-[300ms]">
                                 <FaBuilding />
                              </div>
                              <select 
                                value={formData.department}
                                onChange={handleDepartmentChange}
                                required
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-[300ms] cursor-pointer appearance-none"
                              >
                                 <option value="">Select department...</option>
                                 {departments.map(d => (
                                   <option key={d._id} value={d.name}>{d.name}</option>
                                 ))}
                              </select>
                           </div>
                        </div>
                        
                        {/* Doctor */}
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Doctor <span className="text-rose-500">*</span></label>
                           <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-[300ms]">
                                 <FaStethoscope />
                              </div>
                              <select 
                                value={formData.doctor}
                                readOnly
                                disabled
                                required
                                className="w-full bg-gray-50/50 border border-gray-200 text-gray-400 text-sm font-bold rounded-[16px] pl-12 pr-4 py-4 focus:outline-none transition-all duration-[300ms] cursor-not-allowed appearance-none"
                              >
                                 <option value="">{formData.department ? 'Doctor auto-selected...' : 'Select department first...'}</option>
                                 {formData.doctor && <option value={formData.doctor}>{formData.doctor}</option>}
                              </select>
                           </div>
                        </div>
                        
                        {/* Date */}
                        <div className="flex flex-col gap-2">
                           <label className="text-sm font-bold text-gray-700 ml-1">Appointment Date <span className="text-rose-500">*</span></label>
                           <div className="relative group">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors duration-[300ms]">
                                 <FaCalendarAlt />
                              </div>
                              <input 
                                type="date" 
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold rounded-[16px] pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-[300ms] cursor-pointer" 
                              />
                           </div>
                        </div>
                        
                        {/* Submit */}
                        <motion.button 
                          whileHover={{ scale: 1.02, translateY: -2 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit" 
                          disabled={bookingLoading}
                          className={`w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-[20px] font-bold text-base shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_35px_-10px_rgba(37,99,235,0.5)] transition-all duration-300 flex items-center justify-center gap-3 ${bookingLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                           {bookingLoading ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                             <FaTicketAlt className="text-xl" />
                           )}
                           {bookingLoading ? 'Generating...' : 'Generate Token'}
                        </motion.button>
                     </form>
                  </div>
                  
                  {/* Right Column (40%) */}
                  <div className="w-[40%] flex flex-col gap-8">
                     {/* HOW IT WORKS */}
                     <div className="bg-white rounded-[32px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all duration-500">
                        <h3 className="text-lg font-bold text-gray-900 mb-8 uppercase tracking-widest text-center">How It Works</h3>
                       <div className="flex flex-col gap-6 relative">
                          {/* Vertical line connecting steps */}
                          <div className="absolute left-[15px] top-2 bottom-6 w-0.5 bg-blue-100"></div>
                          
                          <div className="flex gap-4 relative z-10">
                             <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-md">1</div>
                             <div className="pr-2 mt-1.5">
                                <p className="text-[13px] font-bold text-gray-700 leading-snug">Select department and your preferred doctor.</p>
                             </div>
                          </div>
                          <div className="flex gap-4 relative z-10">
                             <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-md">2</div>
                             <div className="pr-2 mt-1.5">
                                <p className="text-[13px] font-bold text-gray-700 leading-snug">Pick an available appointment date from the calendar.</p>
                             </div>
                          </div>
                          <div className="flex gap-4 relative z-10">
                             <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-md">3</div>
                             <div className="pr-2 mt-1.5">
                                <p className="text-[13px] font-bold text-gray-700 leading-snug">Click Generate Token to confirm your booking.</p>
                             </div>
                          </div>
                          <div className="flex gap-4 relative z-10">
                             <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-md">4</div>
                             <div className="pr-2 mt-1.5">
                                <p className="text-[13px] font-bold text-gray-700 leading-snug">Arrive at clinic 15 minutes prior to your estimated wait time.</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    {/* Note Box */}
                    <div className="bg-blue-50/50 backdrop-blur-sm rounded-[24px] p-8 border border-blue-100/50 flex items-start gap-4 hover:bg-blue-50 transition-colors duration-300">
                       <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl shrink-0 shadow-sm">
                          <FaInfoCircle />
                       </div>
                       <p className="text-sm font-semibold text-blue-800/80 leading-relaxed mt-1">
                          Tokens are valid for the selected date only. Missing your slot may require generating a new token based on the respective queue.
                       </p>
                    </div>
                 </div>
              </motion.div>
            ) : activeTab === 'appointments' ? (
               <MyAppointments 
                 loading={loading}
                 filteredAppointments={filteredAppointments}
                 appointmentStats={appointmentStats}
                 appointmentFilter={appointmentFilter}
                 setAppointmentFilter={setAppointmentFilter}
                 handleCancelAppointment={handleCancelAppointment}
               />
            ) : activeTab === 'reports' ? (
               <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
                  {/* Filter Bar */}
                  <div className="flex items-center gap-4 mt-2">
                     <span className="text-sm font-bold text-gray-400">Filter by:</span>
                     <div className="flex items-center gap-2 bg-white p-1.5 rounded-[16px] shadow-sm border border-gray-100">
                        {['All', 'Pending'].map(filter => (
                           <button 
                              key={filter} 
                              onClick={() => setReportFilter(filter)}
                              className={`px-6 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-[300ms] ${
                                 reportFilter === filter
                                  ? 'bg-blue-500 text-white shadow-md'
                                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 bg-white'
                              }`}
                           >
                              {filter}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Reports List */}
                  <div className="flex flex-col gap-4 pb-12">
                     {filteredReports.length === 0 ? (
                       <div className="py-12 text-center text-gray-400 font-bold bg-white rounded-[24px] shadow-sm border border-gray-100">
                          No reports available yet.
                       </div>
                     ) : (
                       filteredReports.map((rep) => {
                         const iconBg = rep.status === 'Completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-orange-50 text-orange-500';
                         const statusColor = rep.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600';
                         return (
                           <div key={rep._id} className="bg-white rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-[500ms] ease-in-out cursor-pointer group flex items-center justify-between border border-transparent hover:border-gray-100">
                              <div className="flex items-center gap-6">
                                 <div className={`w-[72px] h-[72px] rounded-[18px] ${iconBg} flex flex-col items-center justify-center border border-white/50 shadow-sm transition-transform duration-[500ms] group-hover:scale-[1.05]`}>
                                    <FaFileMedical className="text-2xl mb-1" />
                                 </div>
                                 <div className="flex flex-col gap-2.5">
                                    <div>
                                       <h4 className="text-lg font-bold text-gray-900 leading-tight">{rep.doctor}</h4>
                                       <p className="text-xs font-bold text-gray-500 tracking-wide mt-0.5">{rep.department} • <span className="text-gray-400">{rep.type}</span></p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-[8px] text-gray-600 text-xs font-bold border border-gray-100">
                                          <FaCalendarAlt className="text-gray-400" /> {rep.date}
                                       </div>
                                       {rep.files && (
                                         <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-[8px] text-blue-600 text-xs font-bold border border-blue-100/50">
                                            <FaClipboardList /> {rep.files} files
                                         </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-6">
                                 <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${statusColor}`}>
                                    {rep.status === 'Completed' ? <FaCheckCircle className="text-sm" /> : <FaClock className="text-sm" />} {rep.status}
                                 </div>
                                 <div className="w-10 h-10 rounded-[14px] bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-[500ms]">
                                    <FaChevronRight />
                                 </div>
                              </div>
                           </div>
                         );
                       })
                     )}
                  </div>
               </div>
            ) : activeTab === 'profile' ? (
               <div className="opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                  <PatientProfile />
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center py-32 text-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
                  <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                     <FaCog className="text-3xl text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Interface</h3>
                  <p className="text-gray-400 font-medium max-w-sm text-sm">This module is part of the high-fidelity ecosystem and has been temporarily placeholder'd. Check back soon for the liquid-motion update.</p>
               </div>
            )}
        </div>
      </main>
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

export default PatientDashboard;
