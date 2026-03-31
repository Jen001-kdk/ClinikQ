import React from 'react';
import { motion } from 'framer-motion';
import { Link, ListOrdered } from 'lucide-react';

const ACTION_BUTTONS = [
  { icon: Link, label: "Share Report", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { icon: ListOrdered, label: "View Queue", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
];

const QuickActions = () => {
  return (
    <div className="bg-white rounded-24 p-6 border border-slate-100 shadow-soft h-full flex flex-col min-h-[300px]">
       <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-6">Quick Actions</h3>
       <div className="grid grid-cols-1 gap-4 flex-1">
          {ACTION_BUTTONS.map((action, i) => (
            <motion.button 
              key={i} 
              whileHover={{ scale: 1.01, x: 5 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-center gap-4 px-6 py-5 rounded-24 transition-smooth border border-transparent shadow-sm w-full h-fit self-start ${action.color}`}
            >
              <div className="p-3 bg-white/50 rounded-xl">
                <action.icon size={22} strokeWidth={2.5} />
              </div>
              <span className="text-xs font-black uppercase tracking-wide">{action.label}</span>
            </motion.button>
          ))}
       </div>
    </div>
  );
};

export default QuickActions;
