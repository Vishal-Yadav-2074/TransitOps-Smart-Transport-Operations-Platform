import React, { useEffect, useState, useMemo, useCallback } from 'react';
import tripService from '../services/tripService';
import vehicleService from '../services/vehicleService';
import { Calendar, ChevronLeft, ChevronRight, Filter, Milestone, Wrench, Clock, Info } from 'lucide-react';
import TripDrawer from '../components/TripDrawer';
import MaintDrawer from '../components/MaintDrawer';
import Loader from '../components/Loader';
import { useToast } from '../contexts/ToastContext';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trips, setTrips] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, trips, maint

  // Drawer states
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [maintDrawerOpen, setMaintDrawerOpen] = useState(false);

  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tripsRes, maintRes] = await Promise.all([
        tripService.getAll(),
        vehicleService.getAllMaintenances()
      ]);
      setTrips(tripsRes.data || []);
      setMaintenances(maintRes.data || []);
    } catch (err) {
      toast.error('Failed to load calendar events.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = useMemo(() => {
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    return days;
  }, [year, month, firstDayIndex]);

  const currentMonthDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    return days;
  }, [year, month, daysInMonth]);

  const nextMonthDays = useMemo(() => {
    const days = [];
    const totalSlots = prevMonthDays.length + currentMonthDays.length;
    const remainingSlots = 42 - totalSlots; // standard 6 rows
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    return days;
  }, [prevMonthDays, currentMonthDays, year, month]);

  const calendarDays = useMemo(() => {
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [prevMonthDays, currentMonthDays, nextMonthDays]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Map events to date key YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {};

    if (filterType === 'all' || filterType === 'trips') {
      trips.forEach(t => {
        // Mocking trip dates if database formats are date-only
        const dateKey = t.date || new Date().toISOString().split('T')[0]; // fallback to today
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push({
          id: `trip-${t.id}`,
          title: `${t.name}: ${t.source} ➔ ${t.dest}`,
          type: 'trip',
          color: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30',
          icon: Milestone,
          data: t
        });
      });
    }

    if (filterType === 'all' || filterType === 'maint') {
      maintenances.forEach(m => {
        const dateKey = m.date || new Date().toISOString().split('T')[0];
        if (!map[dateKey]) map[dateKey] = [];
        
        // Parse job name
        const match = (m.name || '').match(/(.*)\[/);
        const name = match ? match[1].trim() : m.name;

        map[dateKey].push({
          id: `maint-${m.id}`,
          title: `Repair: ${name}`,
          type: 'maint',
          color: 'bg-amber-50 dark:bg-amber-955/40 text-amber-700 dark:text-amber-405 border border-amber-200 dark:border-amber-900/30',
          icon: Wrench,
          data: m
        });
      });
    }

    return map;
  }, [trips, maintenances, filterType]);

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    if (event.type === 'trip') {
      setSelectedTrip(event.data);
      setTripDrawerOpen(true);
    } else {
      setSelectedMaint(event.data);
      setMaintDrawerOpen(true);
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Operations Calendar</h2>
          <p className="text-xs font-semibold text-slate-505 dark:text-slate-450 mt-1">Cross-referencing scheduled dispatch shipments and active maintenance log timelines</p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Filter Type Segment */}
          <div className="inline-flex rounded-xl p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'all' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilterType('trips')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'trips' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dispatches
            </button>
            <button
              onClick={() => setFilterType('maint')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'maint' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Repairs
            </button>
          </div>

          {/* Navigation Month Controls */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold px-3 text-slate-800 dark:text-white min-w-[100px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="h-96 w-full flex items-center justify-center bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 backdrop-blur-md">
          <Loader />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md">
          
          {/* Weekdays names grid */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-center py-3 text-xs font-bold text-slate-500 dark:text-slate-400">
            {weekdays.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-[120px] divide-x divide-y divide-slate-150 dark:divide-slate-805 border-collapse">
            {calendarDays.map((slot, index) => {
              const dateStr = slot.date.toISOString().split('T')[0];
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = new Date().toDateString() === slot.date.toDateString();

              return (
                <div
                  key={index}
                  className={`p-2 flex flex-col justify-between overflow-hidden relative group transition-colors duration-150 ${
                    slot.isCurrentMonth
                      ? 'bg-transparent hover:bg-slate-50/30 dark:hover:bg-slate-850/10'
                      : 'bg-slate-50/20 dark:bg-slate-950/5 text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {/* Date Tag */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold h-6 w-6 rounded-full flex items-center justify-center ${
                      isToday 
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {slot.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Events Container */}
                  <div className="flex-1 overflow-y-auto space-y-1 mt-1.5 pr-0.5 scrollbar-thin">
                    {dayEvents.slice(0, 3).map(ev => {
                      const Icon = ev.icon;
                      return (
                        <button
                          key={ev.id}
                          onClick={(e) => handleEventClick(e, ev)}
                          className={`w-full text-left truncate text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${ev.color}`}
                        >
                          <Icon className="h-3 w-3 shrink-0" />
                          <span>{ev.title}</span>
                        </button>
                      );
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-[9px] font-semibold text-slate-405 dark:text-slate-500 text-center block pt-0.5">
                        + {dayEvents.length - 3} more logs
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawers mount */}
      <TripDrawer 
        trip={selectedTrip} 
        isOpen={tripDrawerOpen} 
        onClose={() => {
          setTripDrawerOpen(false);
          setSelectedTrip(null);
        }} 
      />

      <MaintDrawer 
        maintenance={selectedMaint} 
        isOpen={maintDrawerOpen} 
        onClose={() => {
          setMaintDrawerOpen(false);
          setSelectedMaint(null);
        }} 
      />

    </div>
  );
}
