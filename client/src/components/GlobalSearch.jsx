import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import vehicleService from '../services/vehicleService';
import driverService from '../services/driverService';
import tripService from '../services/tripService';
import { Search, X, Truck, User, Route } from 'lucide-react';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  
  const [results, setResults] = useState({ vehicles: [], drivers: [], trips: [] });
  const navigate = useNavigate();
  const modalRef = useRef(null);

  // Fetch index data on open
  useEffect(() => {
    if (isOpen) {
      const loadSearchData = async () => {
        try {
          const [vRes, dRes, tRes] = await Promise.all([
            vehicleService.getAll(),
            driverService.getAll(),
            tripService.getAll()
          ]);
          setVehicles(vRes.data || []);
          setDrivers(dRes.data || []);
          setTrips(tRes.data || []);
        } catch (err) {
          console.error('Failed to pre-fetch search index:', err);
        }
      };
      loadSearchData();
      setQuery('');
      setResults({ vehicles: [], drivers: [], trips: [] });
    }
  }, [isOpen]);

  // Handle keystroke filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults({ vehicles: [], drivers: [], trips: [] });
      return;
    }

    const q = query.toLowerCase();

    const filteredVehicles = vehicles.filter(
      v => (v.name || '').toLowerCase().includes(q) || (v.registrationNo || '').toLowerCase().includes(q)
    );

    const filteredDrivers = drivers.filter(
      d => (d.name || '').toLowerCase().includes(q) || (d.licenseNo || '').toLowerCase().includes(q)
    );

    const filteredTrips = trips.filter(
      t => (t.name || '').toLowerCase().includes(q) || 
           (t.source || '').toLowerCase().includes(q) || 
           (t.dest || '').toLowerCase().includes(q)
    );

    setResults({
      vehicles: filteredVehicles.slice(0, 4),
      drivers: filteredDrivers.slice(0, 4),
      trips: filteredTrips.slice(0, 4)
    });
  }, [query, vehicles, drivers, trips]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Navigate to target page and focus element
  const handleSelect = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  const totalResults = results.vehicles.length + results.drivers.length + results.trips.length;

  return (
    <>
      {/* Search Input Trigger */}
      <div className="relative max-w-xs w-64 hidden md:block">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Search everywhere..."
          onClick={() => setIsOpen(true)}
          readOnly
          className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 cursor-pointer focus:outline-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Search Overlay Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20 px-4">
          <div
            ref={modalRef}
            className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-slate-800 dark:text-slate-200"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3.5">
              <Search className="h-5 w-5 text-indigo-500" />
              <input
                type="text"
                autoFocus
                placeholder="Search vehicles, registration plates, drivers, licenses, trips..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-905 dark:text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-655"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {!query.trim() && (
                <p className="text-center text-xs text-slate-400 py-6">
                  Type something to search across all logs and assets...
                </p>
              )}

              {query.trim() && totalResults === 0 && (
                <p className="text-center text-xs text-slate-400 py-6">
                  No records match "{query}"
                </p>
              )}

              {/* Vehicles Section */}
              {results.vehicles.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Vehicles</h4>
                  <div className="space-y-1.5">
                    {results.vehicles.map(v => (
                      <div
                        key={v.id}
                        onClick={() => handleSelect('/vehicles')}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-105 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-200 dark:hover:border-indigo-900/30 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          <Truck className="h-4 w-4 text-indigo-500" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{v.name}</span>
                        </div>
                        <code className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-650 dark:text-indigo-400 px-2 py-0.5 rounded">
                          {v.registrationNo}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drivers Section */}
              {results.drivers.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Drivers</h4>
                  <div className="space-y-1.5">
                    {results.drivers.map(d => (
                      <div
                        key={d.id}
                        onClick={() => handleSelect('/drivers')}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-105 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 hover:bg-emerald-50 dark:hover:bg-emerald-955/10 hover:border-emerald-200 dark:hover:border-emerald-900/20 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="h-4 w-4 text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{d.name}</span>
                        </div>
                        <code className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                          {d.licenseNo}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trips Section */}
              {results.trips.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Trips</h4>
                  <div className="space-y-1.5">
                    {results.trips.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('/trips')}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-105 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30 hover:bg-amber-50 dark:hover:bg-amber-955/10 hover:border-amber-200 dark:hover:border-amber-900/20 cursor-pointer transition-colors duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          <Route className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{t.name}</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500">
                          {t.source} ➔ {t.dest}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-[10px] text-slate-400">
              <span>Press <kbd className="font-semibold">ESC</kbd> to close</span>
              <span>Categorized instant search results</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
