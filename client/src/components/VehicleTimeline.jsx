import React, { useState, useEffect } from 'react';
import vehicleService from '../services/vehicleService';
import { ShieldCheck, Truck, Wrench, ShieldX, Activity } from 'lucide-react';

export default function VehicleTimeline() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [healthScore, setHealthScore] = useState(100);
  const [healthStatus, setHealthStatus] = useState('Excellent');

  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await vehicleService.getAll();
        const data = res.data || [];
        setVehicles(data);
        if (data.length > 0) {
          setSelectedId(data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load vehicle list for timeline:', err);
      }
    }
    loadVehicles();
  }, []);

  const activeVehicle = vehicles.find(v => v.id.toString() === selectedId);

  // Compute simulated health score and stage based on actual vehicle stats
  useEffect(() => {
    if (!activeVehicle) return;

    // Calculate score using maintenance count and odometer mileage
    const maintCount = (activeVehicle.Maintenances || []).length;
    const mileage = parseFloat(activeVehicle.odometer || 0);
    
    let score = 98 - (maintCount * 4) - (mileage / 12000);
    score = Math.max(45, Math.min(100, Math.round(score)));

    let status = 'Excellent';
    if (score < 65) status = 'Needs Service';
    else if (score < 85) status = 'Good';

    setHealthScore(score);
    setHealthStatus(status);
  }, [activeVehicle]);

  // Stage timeline representation
  const timelineStages = [
    { title: 'Purchased / Registered', desc: 'Asset acquired and registered with RTO plate.', active: true, icon: ShieldCheck, color: 'bg-emerald-500' },
    { title: 'First Route Dispatched', desc: 'Initial commercial cargo transport started.', active: true, icon: Truck, color: 'bg-indigo-500' },
    { title: 'Scheduled Maintenance Lock', desc: activeVehicle?.Maintenances?.length > 0 ? 'Repairs and servicing logged.' : 'Pending first service slot.', active: activeVehicle?.Maintenances?.length > 0, icon: Wrench, color: 'bg-amber-500' },
    { title: 'Commercial Operations Active', desc: 'Running routing logs across active routes.', active: activeVehicle?.state !== 'in_shop', icon: Activity, color: 'bg-blue-500' },
    { title: 'Retired / Decommissioned', desc: 'End of operational service life.', active: activeVehicle?.state === 'retired', icon: ShieldX, color: 'bg-slate-400' }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Vehicle Timeline & Health</h3>
          <p className="text-[10px] text-slate-505 mt-0.5">Asset lifecycle & health score metric index</p>
        </div>
        
        {/* Dropdown Selector */}
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-250 focus:border-indigo-650 focus:outline-none transition-colors"
        >
          {vehicles.map(v => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.registrationNo})
            </option>
          ))}
        </select>
      </div>

      {activeVehicle ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Health Score Box */}
          <div className="flex flex-col justify-center items-center border border-slate-205 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-950/20 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Health Index</span>
            <div className="relative flex items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-909 dark:text-white tracking-tight">{healthScore}%</span>
            </div>
            
            <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              healthStatus === 'Excellent' 
                ? 'text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200' 
                : healthStatus === 'Good'
                ? 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200'
                : 'text-rose-600 dark:text-rose-450 bg-rose-50 dark:bg-rose-955/20 border-rose-200'
            }`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-ping" />
              {healthStatus}
            </div>

            <div className="w-full mt-4 space-y-1.5 text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>Odometer Mileage:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{parseFloat(activeVehicle.odometer || 0).toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span>Workshop Repairs:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{(activeVehicle.Maintenances || []).length} Logs</span>
              </div>
            </div>
          </div>

          {/* Timeline Vertical Flow */}
          <div className="space-y-3 relative text-left">
            <div className="absolute left-3.5 top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-slate-800" />
            {timelineStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={idx} className={`flex gap-3 items-start relative ${stage.active ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`z-10 p-1 rounded-full text-white ${stage.color} border-2 border-white dark:border-slate-900`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{stage.title}</h5>
                    <p className="text-[9px] text-slate-500 leading-normal mt-0.5">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-400 py-6">No vehicles registered yet.</div>
      )}
    </div>
  );
}
