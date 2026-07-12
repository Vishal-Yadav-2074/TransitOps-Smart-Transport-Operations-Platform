import React from 'react';
import { Play, Flame, Wrench, PlusCircle } from 'lucide-react';

export default function ActivityFeed() {
  const activities = [
    {
      time: '10:15 AM',
      text: "Vehicle GJ01AB1234 Added",
      icon: PlusCircle,
      color: 'bg-emerald-500 text-white'
    },
    {
      time: '10:40 AM',
      text: "Trip TRIP/005 Dispatched",
      icon: Play,
      color: 'bg-indigo-505 text-white'
    },
    {
      time: '11:05 AM',
      text: "Fuel Expense ₹1,200 Added",
      icon: Flame,
      color: 'bg-amber-500 text-white'
    },
    {
      time: '11:20 AM',
      text: "Maintenance Started",
      icon: Wrench,
      color: 'bg-rose-500 text-white'
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Live Dispatch Log</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Real-time terminal event feed</p>
      </div>

      <div className="space-y-4">
        {activities.map((act, index) => {
          const Icon = act.icon;
          return (
            <div key={index} className="flex gap-3 items-start">
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-lg ${act.color} shadow-sm`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 bg-slate-200 dark:bg-slate-800 h-10 mt-1" />
                )}
              </div>
              <div className="flex-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{act.time}</span>
                <p className="text-xs font-semibold text-slate-850 dark:text-slate-200 leading-snug mt-0.5">{act.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
