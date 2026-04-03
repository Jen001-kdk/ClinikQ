import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppointmentCard from '../../components/dashboard/AppointmentCard';
import RollingNumber from '../../components/dashboard/RollingNumber';

const MyAppointments = ({ 
  loading, 
  filteredAppointments, 
  appointmentStats, 
  appointmentFilter, 
  setAppointmentFilter, 
  handleCancelAppointment 
}) => {
  return (
    <div className="flex flex-col gap-8 opacity-0 animate-[fadeIn_0.3s_ease-in-out_forwards]">
      {/* Top Metric Row */}
      <div className="grid grid-cols-4 gap-6">
        {appointmentStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-[16px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between hover:-translate-y-1 transition-all duration-[300ms] cursor-pointer group">
            <div>
              <p className="text-3xl font-extrabold text-gray-900 mb-1 leading-none">
                <RollingNumber value={stat.value} />
              </p>
              <h3 className="text-xs font-bold text-gray-400 capitalize">{stat.title}</h3>
            </div>
            <div className={`w-12 h-12 rounded-[14px] border ${stat.color} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-[300ms]`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 mt-2">
        <span className="text-sm font-bold text-gray-400">Filter by:</span>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-[16px] shadow-sm border border-gray-100">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setAppointmentFilter(filter)}
              className={`px-5 py-2.5 rounded-[12px] text-xs font-bold transition-all duration-[300ms] ${
                appointmentFilter === filter
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment List with Framer Motion Animations */}
      <div className="flex flex-col gap-4 pb-12 overflow-hidden">
        <AnimatePresence mode='popLayout'>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-200 rounded-[16px] h-[120px] w-full"></div>)
          ) : filteredAppointments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-12 text-center text-gray-400 font-bold"
            >
              No appointments found for this filter.
            </motion.div>
          ) : (
            filteredAppointments.map((app) => (
              <AppointmentCard 
                key={app._id} 
                app={app} 
                onCancel={() => handleCancelAppointment(app._id)} 
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyAppointments;
