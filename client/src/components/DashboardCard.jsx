import React from 'react';

export default function DashboardCard({ title, value, subtext, icon: Icon, trend, color = 'indigo', animate = true }) {
  const colorSchemes = {
    indigo: 'from-indigo-50 to-indigo-100/35 dark:from-indigo-600/10 dark:to-indigo-900/5 border-indigo-200/60 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    green: 'from-emerald-50 to-emerald-100/35 dark:from-emerald-600/10 dark:to-emerald-900/5 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-650 dark:text-emerald-400',
    yellow: 'from-amber-50 to-amber-100/35 dark:from-amber-600/10 dark:to-amber-900/5 border-amber-200/60 dark:border-amber-500/20 text-amber-600 dark:text-amber-400',
    red: 'from-red-50 to-red-100/35 dark:from-red-600/10 dark:to-red-900/5 border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400',
    blue: 'from-blue-50 to-blue-100/35 dark:from-blue-600/10 dark:to-blue-900/5 border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-400',
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;
  
  // Custom glowing glow ring for warning indicators (such as Driver's Expiring Licences)
  const isRedWarning = color === 'red';

  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-all duration-300 transform ${scheme} ${
      animate ? 'hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-indigo-500/5 hover:scale-[1.01]' : ''
    } ${isRedWarning ? 'ring-2 ring-red-500/10 dark:ring-red-500/20 animate-pulse-subtle' : ''}`}>
      
      {/* Absolute overlay glow for warnings */}
      {isRedWarning && (
        <span className="absolute top-0 right-0 flex h-2.5 w-2.5 translate-x-[-14px] translate-y-[14px]">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-505 dark:text-slate-400 tracking-wider uppercase">{title}</span>
        {Icon && (
          <div className="flex p-2 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/40 shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</span>
        {trend && (
          <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <span className="mt-1 text-xs text-slate-505 dark:text-slate-450 font-medium">{subtext}</span>
      )}
    </div>
  );
}
