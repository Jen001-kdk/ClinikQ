import React from "react";
import { X, Clock, Tag, MapPin, Calendar, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Parse "DD/MM/YYYY" → pretty "April 2, 2026"
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "Selected Date";
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  const d = new Date(`${year}-${month}-${day}`);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const STATUS_STYLES = {
  Completed:    { bg: 'bg-teal-50',   text: 'text-teal-600',   dot: 'bg-teal-500' },
  'Now Serving': { bg: 'bg-blue-50',  text: 'text-blue-600',   dot: 'bg-blue-500' },
  Waiting:      { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-500' },
  pending:      { bg: 'bg-orange-50', text: 'text-orange-500', dot: 'bg-orange-500' },
};

const AppointmentDetailModal = ({ isOpen, onClose, appointments = [], date }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-white rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-100 z-10"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-br from-[#007AFF]/5 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calendar size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">
                    Appointments
                  </h3>
                  <p className="text-[11px] font-bold text-[#007AFF] uppercase tracking-[0.15em]">
                    {formatDateLabel(date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {appointments.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                    <Users size={11} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                      {appointments.length} {appointments.length === 1 ? 'Patient' : 'Patients'}
                    </span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all shadow-sm active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3 custom-scrollbar">
              {appointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="py-16 text-center"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mx-auto mb-5 border-2 border-dashed border-slate-200">
                    <Calendar size={32} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">
                    No Appointments Scheduled
                  </p>
                  <p className="text-[11px] font-medium text-slate-300 tracking-wide">
                    This day is free of consultations.
                  </p>
                </motion.div>
              ) : (
                appointments.map((app, index) => {
                  const statusKey = app.status === 'pending' ? 'pending' : (app.status || 'pending');
                  const style = STATUS_STYLES[statusKey] || STATUS_STYLES['pending'];

                  return (
                    <motion.div
                      key={app._id || index}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="group flex items-center gap-5 p-5 bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-slate-100/80 rounded-[20px] transition-all cursor-pointer"
                    >
                      {/* Token Badge */}
                      <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:border-blue-100 shadow-sm shrink-0 transition-colors">
                        <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">Token</span>
                        <span className="text-base font-black text-[#007AFF] leading-none">{app.tokenId || '--'}</span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-slate-900 group-hover:text-[#007AFF] transition-colors uppercase tracking-tight truncate pr-3">
                            {app.userName || 'Unknown Patient'}
                          </p>
                          <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${style.bg} ${style.text}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {app.status || 'pending'}
                          </span>
                        </div>

                        <div className="flex items-center gap-5 flex-wrap">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={11} className="text-[#007AFF] shrink-0" />
                            <span className="text-[11px] font-bold uppercase tracking-wide">{app.bookedTime || '--'}</span>
                          </div>
                          {app.department && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Tag size={11} className="text-teal-500 shrink-0" />
                              <span className="text-[11px] font-bold uppercase tracking-wide">{app.department}</span>
                            </div>
                          )}
                          {app.roomNumber && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <MapPin size={11} className="text-rose-500 shrink-0" />
                              <span className="text-[11px] font-bold uppercase tracking-wide">{app.roomNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {appointments.length > 0 ? `${appointments.filter(a => a.status === 'Completed').length} completed · ${appointments.filter(a => a.status === 'Waiting' || a.status === 'pending').length} pending` : 'No data for this day'}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailModal;
