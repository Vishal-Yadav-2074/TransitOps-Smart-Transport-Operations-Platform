import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Circle } from 'lucide-react';

export default function CalendarWidget() {
  const [currentDate] = useState(new Date(2026, 6, 12)); // July 12, 2026

  const daysInMonth = 31;
  const startDayOffset = 3; // July 2026 starts on a Wednesday (3rd index)

  // Indian transport events & holidays mapped to specific dates
  const events = {
    12: { type: 'trip', label: 'Dispatch Ahmedabad ➔ Surat (Rahul Patel)', color: 'bg-indigo-500' },
    15: { type: 'maint', label: 'Tata Authorized Service Center Slot', color: 'bg-amber-500' },
    24: { type: 'lic', label: 'Rakesh Singh Driving Licence Expiry', color: 'bg-rose-500' }
  };

  const renderCells = () => {
    const cells = [];
    // Render blank offset days
    for (let i = 0; i < startDayOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="h-6 w-6" />);
    }

    // Render calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === 12;
      const ev = events[day];

      cells.push(
        <div
          key={`day-${day}`}
          className={`relative flex items-center justify-center h-7 w-7 text-xs font-semibold rounded-lg transition-all ${
            isToday 
              ? 'bg-indigo-650 text-white shadow-md' 
              : 'text-slate-800 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={ev ? ev.label : ''}
        >
          <span>{day}</span>
          {ev && (
            <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${ev.color}`} />
          )}
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 backdrop-blur-md shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4.5 w-4.5 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Log Calendar</h4>
        </div>
        <span className="text-xs font-semibold text-slate-900 dark:text-white">July 2026</span>
      </div>

      {/* Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">
        {renderCells()}
      </div>

      {/* Upcoming Events Detail List */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-2 text-[10px]">
        <div className="flex items-center justify-between text-slate-500">
          <span className="font-bold uppercase tracking-wider">Scheduled Slots</span>
          <span>July 2026</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(events).map(([day, ev]) => (
            <div key={day} className="flex gap-2 items-center">
              <span className={`h-1.5 w-1.5 rounded-full ${ev.color}`} />
              <span className="font-semibold text-slate-400 w-4">12/{day}:</span>
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate flex-1">{ev.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
