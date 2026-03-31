import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, FileText, CheckCircle2 } from 'lucide-react';

const ANALYTICS_DATA = [
  { label: "Total Patients", value: "1,250", trend: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Appointments", value: "45", trend: "-5%", icon: Clock, color: "text-cyan-600", bg: "bg-cyan-50" },
  { label: "Pending Reports", value: "12", trend: "+2", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  { label: "Completed", value: "30", trend: "100%", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
];

const StatCard = ({ item }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white p-5 rounded-24 shadow-soft border border-slate-100 flex items-center gap-4 group transition-smooth"
  >
    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-16 flex items-center justify-center shrink-0`}>
      <item.icon size={18} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-xl font-black text-slate-900 tracking-tight">{item.value}</h4>
        <span className={`text-[10px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
          {item.trend}
        </span>
      </div>
    </div>
  </motion.div>
);

const StatCards = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {ANALYTICS_DATA.map((stat, i) => (
        <StatCard key={i} item={stat} />
      ))}
    </div>
  );
};

export default StatCards;
