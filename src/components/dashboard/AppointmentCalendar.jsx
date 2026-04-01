import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const AppointmentCalendar = ({ onDateClick, allAppointments = [] }) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(null);

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Convert a JS Date to DD/MM/YYYY to match backend format
  const toBackendDate = (year, month, day) => {
    const d = day.toString().padStart(2, '0');
    const m = (month + 1).toString().padStart(2, '0');
    return `${d}/${m}/${year}`;
  };

  // Build a Set of dates that have appointments for quick lookup
  const appointmentDates = useMemo(() => {
    const s = new Set();
    allAppointments.forEach(app => {
      if (app.date) s.add(app.date); // app.date is already DD/MM/YYYY
    });
    return s;
  }, [allAppointments]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun

  const calendarCells = [];
  // Add blank cells for offset
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    const dateStr = toBackendDate(viewYear, viewMonth, day);
    onDateClick && onDateClick(dateStr);
  };

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const hasAppointments = (day) => {
    if (!day) return false;
    return appointmentDates.has(toBackendDate(viewYear, viewMonth, day));
  };

  return (
    <div className="bg-white rounded-24 p-5 border border-slate-100 shadow-soft flex flex-col h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Clinic Calendar</p>
          <p className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all active:scale-95"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="text-[9px] font-black text-slate-400 text-center uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-0.5 flex-1 content-start">
        {calendarCells.map((day, idx) => {
          if (!day) {
            return <div key={`blank-${idx}`} className="h-8 w-full" />;
          }

          const todayFlag = isToday(day);
          const selectedFlag = selectedDay === day;
          const hasAppt = hasAppointments(day);

          return (
            <div
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                h-8 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold
                transition-all cursor-pointer relative select-none
                ${selectedFlag
                  ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-200'
                  : todayFlag
                    ? 'bg-blue-50 text-[#007AFF] ring-1 ring-blue-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }
              `}
            >
              {day}
              {/* Appointment indicator dot */}
              {hasAppt && !selectedFlag && (
                <div
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    todayFlag ? 'bg-[#007AFF]' : 'bg-cyan-500'
                  }`}
                />
              )}
              {hasAppt && selectedFlag && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white/80" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Has Appointments</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-3 rounded-md bg-[#007AFF]" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
