import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle2, MoreVertical } from 'lucide-react';

const LiveQueue = ({ serving, onCallNext, onMarkDone }) => {
  return (
    <div className="bg-[#0ea5e9] rounded-24 p-6 text-white shadow-soft relative overflow-hidden group h-[320px] flex flex-col">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Live Queue</h3>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical size={14} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">In Progress</p>
          <motion.div 
            key={serving?.tokenId || 'idle'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-black mb-2 tracking-tighter drop-shadow-lg"
          >
            #{serving?.tokenId || '--'}
          </motion.div>
          <p className="text-sm font-bold mb-4 uppercase tracking-wide">
            {serving?.patientId?.full_name || serving?.patientId?.name || serving?.userName || (serving ? "Patient" : "No patient currently")}
          </p>
          <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-md">
            {serving ? 'Consultation Phase' : 'Standing By'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button 
            onClick={onCallNext}
            className="flex items-center justify-center gap-2 bg-white text-[#0ea5e9] py-3 rounded-16 text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-smooth shadow-lg shadow-blue-900/10"
          >
            <UserPlus size={14} strokeWidth={3} /> Call Next
          </button>
          <button 
            onClick={onMarkDone}
            className="flex items-center justify-center gap-2 bg-white/20 border border-white/10 text-white py-3 rounded-16 text-[9px] font-black uppercase tracking-widest hover:bg-white/30 active:scale-95 transition-smooth"
          >
            <CheckCircle2 size={14} /> Done
          </button>
        </div>
      </div>
      
      {/* Abstract Design Elements */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};

export default LiveQueue;
