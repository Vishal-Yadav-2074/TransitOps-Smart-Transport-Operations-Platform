import React from 'react';
import { Award, ShieldAlert } from 'lucide-react';

export default function DriverLeaderboard() {
  const drivers = [
    { rank: 1, name: 'Rahul', score: 97, trips: 125, medal: '🥇' },
    { rank: 2, name: 'Anil Sharma', score: 95, trips: 84, medal: '🥈' },
    { rank: 3, name: 'John Doe', score: 91, trips: 52, medal: '🥉' }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Driver Leaderboard</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Top safety compliance rankings</p>
        </div>
        <Award className="h-5 w-5 text-indigo-500 animate-bounce" />
      </div>

      <div className="space-y-2.5">
        {drivers.map((drv) => (
          <div
            key={drv.rank}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{drv.medal}</span>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{drv.name}</span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{drv.trips} Trips Completed</span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">{drv.score}/100</span>
              <span className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">Safety Score</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
