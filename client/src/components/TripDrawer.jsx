import React from 'react';
import { X, Route, Truck, Users, Clock, IndianRupee, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

export default function TripDrawer({ trip, isOpen, onClose }) {
  if (!isOpen || !trip) return null;

  // Localized currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Steps configuration for the progress tracking visualizer
  const getSteps = () => {
    if (trip.state === 'cancelled') {
      return [
        { label: 'Booked', active: true, done: true, color: 'bg-emerald-500' },
        { label: 'Cancelled', active: true, done: false, color: 'bg-red-500' }
      ];
    }

    const states = ['scheduled', 'dispatched', 'completed'];
    const currentIdx = states.indexOf(trip.state);

    return [
      { label: 'Booked', active: true, done: currentIdx >= 0 },
      { label: 'Dispatched', active: currentIdx >= 1, done: currentIdx >= 1 },
      { label: 'In Transit', active: currentIdx >= 1, done: currentIdx >= 2 },
      { label: 'Delivered', active: currentIdx >= 2, done: currentIdx >= 2 }
    ];
  };

  const steps = getSteps();

  // Simulated intermediate checkpoints based on route
  const getCheckpoints = () => {
    return [
      { loc: trip.source, status: 'Departed Dispatch Terminal', time: '08:00 AM', done: trip.state !== 'scheduled' },
      { loc: 'NH-48 Highway Toll-Plaza', status: 'In Transit Telemetry Check', time: '11:30 AM', done: trip.state === 'completed' },
      { loc: 'Interstate Hub Checkpost', status: 'Customs Gate Verification', time: '02:15 PM', done: trip.state === 'completed' },
      { loc: trip.dest, status: 'Completed Delivery', time: 'Estimated Arrival', done: trip.state === 'completed' }
    ];
  };

  const checkpoints = getCheckpoints();

  // Math helper for ETA
  const getETA = () => {
    if (trip.state === 'completed') return 'Delivered';
    if (trip.state === 'cancelled') return 'Cancelled';
    const hours = Math.round(parseFloat(trip.plannedDist || 100) / 60);
    return `${hours} hrs ${Math.round((parseFloat(trip.plannedDist || 100) % 60))} mins`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-slide-left text-left text-slate-850 dark:text-slate-200"
      >
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 rounded-2xl border border-brand-200/50">
                <Route className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{trip.name}</h3>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">
                  Route Dispatch Record
                </span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border capitalize ${
              trip.state === 'completed' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border-emerald-205 dark:border-emerald-900/30'
                : trip.state === 'dispatched'
                  ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-450 border-amber-250 dark:border-amber-900/30'
                  : trip.state === 'cancelled'
                    ? 'bg-red-50 dark:bg-red-955/40 text-red-600 dark:text-red-450 border-red-250 dark:border-red-900/30'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-brand-600 dark:text-brand-400 border-indigo-200 dark:border-indigo-900/30'
            }`}>
              {trip.state}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 font-bold border border-slate-205 dark:border-slate-700">
              Cargo Weight: {trip.cargoWeight} kg
            </span>
          </div>
        </div>

        {/* Drawer Body Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Progress tracking visualizer */}
          <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 bg-slate-50/50 dark:bg-slate-950/20 text-center">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 text-left">Active Dispatch Progress</h4>
            <div className="flex items-center justify-between relative px-2">
              {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  {/* Step bubble */}
                  <div className="flex flex-col items-center z-10">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border ${
                      step.done 
                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                        : step.active
                          ? 'bg-brand-500 border-brand-600 text-white shadow-sm animate-pulse-subtle'
                          : 'bg-slate-100 dark:bg-slate-805 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold mt-2 ${
                      step.active ? 'text-slate-850 dark:text-white' : 'text-slate-400'
                    }`}>{step.label}</span>
                  </div>

                  {/* Step Connector Line */}
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-slate-200 dark:bg-slate-800 relative -top-3">
                      <div className={`h-full bg-emerald-500 transition-all duration-500`} style={{ width: step.done ? '100%' : '0%' }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Route Stop Coordinates & ETA */}
          <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Route Tracking Specs</h4>
            <div className="flex items-center gap-4 bg-slate-50/30 dark:bg-slate-950/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-500" />
                <span className="font-bold text-slate-800 dark:text-white">{trip.source}</span>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <span className="font-bold text-slate-800 dark:text-white">{trip.dest}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Distance</span>
                <span className="font-extrabold text-slate-850 dark:text-white">{trip.plannedDist} km</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-450 uppercase block">GPS Estimated ETA</span>
                <span className="font-black text-brand-600 dark:text-brand-400 text-sm mt-1 block flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {getETA()}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <span className="text-[10px] font-bold text-slate-450 uppercase block">Commercial Revenue</span>
                <span className="font-black text-emerald-500 text-sm mt-1 block flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" /> {formatCurrency(trip.revenue)}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Driver details */}
          {trip.Driver && (
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Driver Operator</h4>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3 items-center">
                  <div className="h-9 w-9 bg-brand-500/10 rounded-xl flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{trip.Driver.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Lic No: {trip.Driver.licenseNo}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Safety Rating</span>
                  <span className="font-extrabold text-emerald-500 block mt-0.5">{parseFloat(trip.Driver.safetyScore || 0).toFixed(1)}/100</span>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Vehicle details */}
          {trip.Vehicle && (
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Roster Vehicle</h4>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3 items-center">
                  <div className="h-9 w-9 bg-brand-500/10 rounded-xl flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{trip.Vehicle.name}</span>
                    <code className="text-[10px] font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900/20 inline-block mt-0.5">
                      {trip.Vehicle.registrationNo}
                    </code>
                  </div>
                </div>
                <div className="text-right text-slate-500">
                  <span>Class: <span className="capitalize font-semibold text-slate-800 dark:text-white">{trip.Vehicle.vehicleType}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Route stops checkpoints list */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Virtual Checkpoint Log</h4>
            <div className="space-y-2">
              {checkpoints.map((cp, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10 shadow-sm">
                  <div className="flex gap-2.5 items-center">
                    <div className={`h-2 w-2 rounded-full ${cp.done ? 'bg-emerald-500 animate-pulse' : 'bg-slate-350 dark:bg-slate-700'}`} />
                    <div>
                      <span className={`font-bold block ${cp.done ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>{cp.loc}</span>
                      <span className="text-[9px] text-slate-450 block mt-0.5">{cp.status}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${cp.done ? 'text-slate-850 dark:text-white' : 'text-slate-400'}`}>{cp.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-400 flex items-center justify-between">
          <span>Active GPS ETA Tracking</span>
          <span>Verified Gate</span>
        </div>

      </div>
    </div>
  );
}
