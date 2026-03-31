import React from 'react';
import { Calendar, User, Clock } from 'lucide-react';

const APPOINTMENTS = [
  { time: '10:00 AM', patient: 'Rahul Sharma', status: 'Completed', color: 'bg-emerald-500' },
  { time: '10:45 AM', patient: 'Priya Nair', status: 'In Cabin', color: 'bg-[#007AFF]' },
  { time: '11:30 AM', patient: 'Arjun Das', status: 'Waiting', color: 'bg-slate-300' },
  { time: '12:15 PM', patient: 'Sunita Mehra', status: 'Awaiting', color: 'bg-slate-200' },
];

const AppointmentList = () => {
  return (
    <div className="bg-white rounded-24 p-6 border border-slate-100 shadow-soft h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Upcoming Schedule</h3>
        <span className="text-[9px] font-black text-[#007AFF] uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-full">4 total</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {APPOINTMENTS.map((apt, i) => (
          <div key={i} className="flex gap-4 items-center group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-smooth">
            <div className={`w-8 h-8 rounded-lg ${apt.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
              <User size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-wide truncate">{apt.patient}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Clock size={10} className="text-slate-400" />
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{apt.time}</p>
              </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter ${
              apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'In Cabin' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
            }`}>
              {apt.status}
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full py-3 mt-4 border border-dashed border-slate-200 text-slate-400 rounded-16 text-[9px] font-black uppercase tracking-widest hover:border-[#007AFF] hover:text-[#007AFF] transition-smooth">
        View Full Schedule
      </button>
    </div>
  );
};

export default AppointmentList;
