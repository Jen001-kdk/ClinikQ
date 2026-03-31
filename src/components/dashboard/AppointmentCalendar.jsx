import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const AppointmentCalendar = () => {
  const currentMonth = "March 2026";
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-24 p-6 border border-slate-100 shadow-soft h-[350px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">Clinic Calendar</h3>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronLeft size={14} /></button>
          <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{currentMonth}</p>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map(d => (
          <div key={d} className="text-[9px] font-black text-slate-400 text-center uppercase py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-auto">
        {/* Placeholder for Feb padding */}
        <div className="h-8 w-8" />
        {dates.map(date => (
          <div 
            key={date} 
            className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-smooth cursor-pointer ${
              date === 29 ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {date}
            {date === 29 && <div className="absolute w-1 h-1 bg-white rounded-full mt-4" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
