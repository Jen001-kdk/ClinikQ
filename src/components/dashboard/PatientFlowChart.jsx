import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: '09:00', patients: 4 },
  { name: '10:00', patients: 12 },
  { name: '11:00', patients: 18 },
  { name: '12:00', patients: 15 },
  { name: '13:00', patients: 8 },
  { name: '14:00', patients: 22 },
  { name: '15:00', patients: 16 },
];

const PatientFlowChart = () => {
  return (
    <div className="bg-white p-6 rounded-24 border border-slate-100 shadow-soft h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">Patient Flow</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time hourly traffic</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
            Live
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="patients" 
              stroke="#0ea5e9" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPatients)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PatientFlowChart;
