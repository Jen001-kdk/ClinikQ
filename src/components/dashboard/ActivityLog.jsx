import React from 'react';
import { FileText, Clock, AlertCircle } from 'lucide-react';

const RECENT_ACTIVITY = [
  { id: 1, text: "New report uploaded for Ananya Reddy", time: "2m ago", type: "report" },
  { id: 2, text: "Appointment confirmed: Priya Nair", time: "15m ago", type: "appointment" },
  { id: 3, text: "System update scheduled for 11:00 PM", time: "1h ago", type: "system" },
  { id: 4, text: "Wait time updated (+5m delay)", time: "2h ago", type: "system" },
];

const ActivityItem = ({ act }) => (
  <div className="flex items-center justify-between group cursor-pointer py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 rounded-lg transition-smooth">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm">
        {act.type === 'report' ? <FileText size={14} /> : act.type === 'appointment' ? <Clock size={14} /> : <AlertCircle size={14} />}
      </div>
      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide group-hover:text-slate-900 transition-colors">{act.text}</p>
    </div>
    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.time}</span>
  </div>
);

const ActivityLog = () => {
  return (
    <div className="bg-white rounded-24 p-6 border border-slate-100 shadow-soft h-[320px] flex flex-col">
      <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Recent Activity</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-1">
          {RECENT_ACTIVITY.map(act => (
            <ActivityItem key={act.id} act={act} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
