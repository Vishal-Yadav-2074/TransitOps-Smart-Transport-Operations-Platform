import React, { useMemo } from 'react';
import AnimatedCounter from './AnimatedCounter';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export default function DashboardCard({ title, value, subtext, icon: Icon, trend, color = 'indigo', animate = true }) {
  const colorSchemes = {
    purple: {
      card: 'from-purple-500/5 to-purple-900/5 border-purple-500/15 text-purple-500 dark:text-purple-400',
      icon: 'text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400',
      spark: '#8B5CF6'
    },
    green: {
      card: 'from-emerald-500/5 to-emerald-900/5 border-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      icon: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
      spark: '#10B981'
    },
    orange: {
      card: 'from-amber-500/5 to-amber-900/5 border-amber-500/15 text-amber-600 dark:text-amber-400',
      icon: 'text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
      spark: '#F59E0B'
    },
    red: {
      card: 'from-red-500/5 to-red-900/5 border-red-500/15 text-red-600 dark:text-red-400',
      icon: 'text-red-600 bg-red-500/10 border-red-500/20 dark:text-red-400',
      spark: '#EF4444'
    },
    blue: {
      card: 'from-blue-500/5 to-blue-900/5 border-blue-500/15 text-blue-600 dark:text-blue-400',
      icon: 'text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400',
      spark: '#3B82F6'
    },
    indigo: {
      card: 'from-indigo-500/5 to-indigo-900/5 border-indigo-500/15 text-indigo-600 dark:text-indigo-400',
      icon: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400',
      spark: '#6366F1'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  // Render dummy sparkline curves for analytics visualization
  const sparkData = useMemo(() => {
    if (color === 'green') return [{ y: 30 }, { y: 40 }, { y: 35 }, { y: 55 }, { y: 48 }, { y: 70 }, { y: 65 }];
    if (color === 'orange') return [{ y: 20 }, { y: 28 }, { y: 42 }, { y: 32 }, { y: 50 }, { y: 58 }, { y: 54 }];
    if (color === 'red') return [{ y: 70 }, { y: 62 }, { y: 48 }, { y: 52 }, { y: 38 }, { y: 32 }, { y: 28 }];
    if (color === 'blue') return [{ y: 35 }, { y: 45 }, { y: 40 }, { y: 50 }, { y: 52 }, { y: 48 }, { y: 58 }];
    return [{ y: 25 }, { y: 38 }, { y: 32 }, { y: 48 }, { y: 44 }, { y: 62 }, { y: 58 }];
  }, [color]);

  const isRedWarning = color === 'red' && title.includes('Expiring');

  return (
    <div className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white/60 dark:bg-[#131722]/65 bg-gradient-to-br ${scheme.card} border-slate-205 dark:border-white/5 p-5 shadow-sm transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[#7C3AED]/5 glow-hover ${
      isRedWarning ? 'ring-2 ring-red-500/10 dark:ring-red-500/20' : ''
    }`}>
      
      {/* Glow highlight effect */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-505 dark:text-slate-400 tracking-widest uppercase">{title}</span>
        {Icon && (
          <div className={`flex p-2 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner ${scheme.icon}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
            {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
          </span>
          {trend && (
            <span className={`text-[10px] font-bold ${trend.startsWith('+') || trend.startsWith('↑') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
              {trend}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <span className="mt-1 text-[10px] text-slate-500 dark:text-slate-500 font-bold text-left">{subtext}</span>
      )}

      {/* Sparkline chart container */}
      <div className="h-10 w-full mt-4 -mb-2 -mx-5 overflow-hidden shrink-0 opacity-80 dark:opacity-90">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={scheme.spark} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={scheme.spark} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="y" 
              stroke={scheme.spark} 
              strokeWidth={1.5} 
              fillOpacity={1} 
              fill={`url(#gradient-${color})`} 
              dot={false}
              isAnimationActive={animate}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
