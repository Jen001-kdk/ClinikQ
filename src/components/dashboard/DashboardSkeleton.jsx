import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-100 h-24 rounded-24"></div>
        ))}
      </div>

      {/* Middle Grid Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 bg-slate-100 h-[320px] rounded-24"></div>
        <div className="col-span-4 bg-slate-100 h-[320px] rounded-24"></div>
      </div>

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-slate-100 h-[350px] rounded-24"></div>
        <div className="col-span-4 bg-slate-100 h-[350px] rounded-24"></div>
        <div className="col-span-4 bg-slate-100 h-[350px] rounded-24"></div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
