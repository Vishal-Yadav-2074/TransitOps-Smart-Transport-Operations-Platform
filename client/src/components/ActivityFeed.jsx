import React from 'react';
import { Play, Flame, Wrench, PlusCircle, User, Truck, HelpCircle, Ban, CheckCircle2 } from 'lucide-react';

export default function ActivityFeed({ activities }) {
  const getIcon = (type, text) => {
    if (type === 'vehicle') return Truck;
    if (type === 'driver') return User;
    if (type === 'trip') {
      if (text.includes('Completed')) return CheckCircle2;
      if (text.includes('Cancelled')) return Ban;
      return Play;
    }
    if (type === 'expense') return Flame;
    if (type === 'maintenance') return Wrench;
    return HelpCircle;
  };

  const defaultMockActivities = [
    {
      time: '10:15 AM',
      text: "Ashok Leyland 2820 (GJ-01-AB-4587) Dispatched to Surat Hub",
      type: 'vehicle',
      color: 'bg-indigo-500 text-white'
    },
    {
      time: '10:40 AM',
      text: "Trip TRIP/2026/001 (Ahmedabad ➔ Surat) Dispatched",
      type: 'trip',
      color: 'bg-amber-500 text-white'
    },
    {
      time: '11:05 AM',
      text: "Diesel Refill ₹18,420 Added @ ₹92.45/L (IOCL Hub)",
      type: 'expense',
      color: 'bg-amber-600 text-white'
    },
    {
      time: '11:20 AM',
      text: "Tata Service Center Engine Maintenance Started",
      type: 'maintenance',
      color: 'bg-rose-500 text-white'
    }
  ];

  const items = (activities && activities.length > 0) ? activities : defaultMockActivities;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm space-y-4 h-full">
      <div>
        <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Live Dispatch Log</h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Real-time terminal event feed</p>
      </div>

      <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
        {items.map((act, index) => {
          const Icon = getIcon(act.type, act.text);
          return (
            <div key={index} className="flex gap-3 items-start animate-fade-in">
              <div className="flex flex-col items-center">
                <div className={`p-1.5 rounded-lg ${act.color || 'bg-indigo-500 text-white'} shadow-sm`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {index < items.length - 1 && (
                  <div className="w-0.5 bg-slate-200 dark:bg-slate-850 h-10 mt-1" />
                )}
              </div>
              <div className="flex-1 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{act.time}</span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug mt-0.5">{act.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
