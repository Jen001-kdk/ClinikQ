import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaClock, FaTicketAlt, FaChevronRight, FaTimesCircle } from 'react-icons/fa';

const AppointmentCard = ({ app, onCancel }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const statusConfig = {
    'Upcoming': { color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    'pending': { color: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
    'Waiting': { color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    'in-progress': { color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
    'Completed': { color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
    'completed': { color: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
    'Cancelled': { color: 'bg-rose-50 text-rose-600', dot: 'bg-rose-500' },
    'All': { color: 'bg-gray-50 text-gray-600', dot: 'bg-gray-500' }
  };

  const config = statusConfig[app.status] || statusConfig['Upcoming'];
  const dateObj = new Date(app.createdAt);
  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();

  const calculateExpTime = (createdAt, position) => {
    const start = new Date(createdAt);
    // formula: Anchor Time (createdAt) + (position * 15 minutes)
    const expDate = new Date(start.getTime() + (position || 1) * 15 * 60000);
    return expDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: 50 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-blue-50 overflow-hidden"
    >
      <div className="p-6 flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className={`w-[72px] h-[72px] rounded-[18px] flex flex-col items-center justify-center border border-blue-100/50 transition-colors duration-450 ease-in-out ${isOpen ? 'bg-blue-500 text-white' : 'bg-blue-50'}`}>
               <span className={`text-[10px] font-black tracking-widest uppercase transition-colors duration-450 ${isOpen ? 'text-blue-100' : 'text-blue-500'}`}>{month}</span>
               <span className={`text-2xl font-extrabold leading-none mt-0.5 transition-colors duration-450 ${isOpen ? 'text-white' : 'text-blue-600'}`}>{day}</span>
            </div>
            
            <div className="flex flex-col gap-3">
               <div>
                  <h4 className="text-lg font-bold text-gray-900 leading-tight">
                    {app.doctorId?.full_name || app.doctorId?.name || app.doctor}
                  </h4>
                  <p className="text-xs font-bold text-gray-500 tracking-wide uppercase mt-0.5">{app.department}</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-[10px] text-blue-600 text-xs font-bold">
                     <FaTicketAlt /> {app.tokenId}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-[10px] text-blue-600 text-xs font-bold">
                     <FaClock /> {app.estimatedWait}
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-2">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ${config.color} ${app.status === 'in-progress' ? 'animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.3)]' : ''}`}>
                  <div className={`w-2 h-2 rounded-full ${config.dot} ${app.status === 'in-progress' ? 'animate-pulse' : ''}`}></div> 
                  {app.status === 'in-progress' ? (
                    <span className="flex items-center gap-1.5 uppercase tracking-tighter">
                      In Progress <span className="text-[10px] bg-white/40 px-1.5 rounded-md font-black tracking-widest ml-1">LIVE</span>
                    </span>
                  ) : app.status}
               </div>
               {app.status === 'pending' && (
                 <span className="text-[11px] font-bold text-gray-400 mr-1 mt-0.5 opacity-80 flex items-center gap-1.5">
                   <FaClock className="text-[10px]" /> Exp: {calculateExpTime(app.createdAt, app.position)}
                 </span>
               )}
            </div>
            {(app.status === 'Waiting' || app.status === 'Upcoming' || app.status === 'pending') && (
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 h-10 rounded-[14px] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all duration-450 ease-in-out ${isOpen ? 'rotate-90 scale-110 shadow-sm' : ''}`}
              >
                 <FaChevronRight />
              </button>
            )}
         </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="px-8 pb-8 border-t border-gray-50 bg-gray-50/20"
          >
            <div className="pt-6 flex flex-col gap-6">
               <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>
               <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                     <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Appointment Management</p>
                     <p className="text-[14px] font-bold text-gray-600 leading-tight">Need to reschedule or cancel your visit? Actions are irreversible.</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={onCancel}
                       className="px-8 py-3.5 bg-rose-50 text-rose-500 rounded-[16px] font-bold text-sm hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-450 ease-in-out flex items-center gap-3 active:scale-95"
                     >
                        <FaTimesCircle className="text-lg" /> Cancel Appointment
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AppointmentCard;
