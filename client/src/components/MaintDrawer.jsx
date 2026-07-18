import React from 'react';
import { X, Wrench, ShieldAlert, Users, Clock, DollarSign, Calendar, CheckSquare } from 'lucide-react';

export default function MaintDrawer({ maintenance, isOpen, onClose }) {
  if (!isOpen || !maintenance) return null;

  // Localized currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Parser helper
  const parseMaintDesc = (desc) => {
    const defaultData = {
      description: desc || '',
      priority: 'Medium',
      mechanic: 'Unassigned',
      partsCost: 0,
      downtime: 0
    };
    if (!desc) return defaultData;
    const match = desc.match(/(.*)\[Priority:\s*([^,]+),\s*Mechanic:\s*([^,]+),\s*PartsCost:\s*(\d+),\s*Downtime:\s*(\d+)\]/);
    if (match) {
      return {
        description: match[1].trim(),
        priority: match[2].trim(),
        mechanic: match[3].trim(),
        partsCost: parseFloat(match[4]),
        downtime: parseFloat(match[5])
      };
    }
    return defaultData;
  };

  const parsed = parseMaintDesc(maintenance.name);
  const laborCost = Math.max(0, maintenance.cost - parsed.partsCost);

  const getPriorityColor = (p) => {
    switch (p.toLowerCase()) {
      case 'high': return 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-450';
      case 'low': return 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
      default: return 'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-450';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-slide-left text-left text-slate-850 dark:text-slate-200"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 rounded-2xl border border-brand-200/50">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{parsed.description}</h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-semibold text-slate-500">Log Date: {maintenance.date}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-405 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border ${
              maintenance.state === 'open' 
                ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 border-amber-250 dark:border-amber-900/30 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/30'
            }`}>
              {maintenance.state}
            </span>
            <span className={`px-2.5 py-1 rounded-xl font-bold border ${getPriorityColor(parsed.priority)}`}>
              Priority: {parsed.priority}
            </span>
          </div>
        </div>

        {/* Body Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Associated Vehicle Specs */}
          {maintenance.Vehicle && (
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Locked Roster Asset</h4>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3 items-center">
                  <div className="h-9 w-9 bg-brand-500/10 rounded-xl flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{maintenance.Vehicle.name}</span>
                    <code className="text-[10px] font-mono text-brand-655 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900/20 inline-block mt-0.5">
                      {maintenance.Vehicle.registrationNo}
                    </code>
                  </div>
                </div>
                <div className="text-right text-slate-500 font-semibold">
                  Odo: {maintenance.Vehicle.odometer} km
                </div>
              </div>
            </div>
          )}

          {/* Downtime Hours & Assigned Mechanic */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Downtime Hour Lock</span>
              <span className="text-xl font-black text-rose-500 mt-1.5 block flex items-center gap-1">
                <Clock className="h-4.5 w-4.5" /> {parsed.downtime} Hours
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Assigned Technician</span>
              <span className="text-sm font-bold text-slate-850 dark:text-white mt-1.5 block flex items-center gap-1.5">
                <Users className="h-4.5 w-4.5" /> {parsed.mechanic}
              </span>
            </div>
          </div>

          {/* Costs details Breakdown ledger */}
          <div className="rounded-2xl border border-slate-150 dark:border-slate-850 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Costs Ledger Details</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500">Replacement Parts Cost</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(parsed.partsCost)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500">Labor Charge (Calculated)</span>
                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(laborCost)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-900 dark:text-white font-bold">Total Operational Repairs Cost</span>
                <span className="font-extrabold text-rose-500 text-sm">{formatCurrency(maintenance.cost)}</span>
              </div>
            </div>
          </div>

          {/* Downtime timeline checks */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Downtime Checklist Gates</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10">
                <div className="flex gap-2.5 items-center">
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-slate-850 dark:text-white">Diagnostic Lockout Initiated</span>
                </div>
                <span className="text-[10px] text-slate-450">Complete</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10">
                <div className="flex gap-2.5 items-center">
                  <CheckSquare className={`h-4 w-4 ${parsed.partsCost > 0 ? 'text-emerald-500' : 'text-slate-350'}`} />
                  <span className="font-bold text-slate-850 dark:text-white">Replacement Parts Sourced</span>
                </div>
                <span className="text-[10px] text-slate-450">{parsed.partsCost > 0 ? 'Complete' : 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10">
                <div className="flex gap-2.5 items-center">
                  <CheckSquare className={`h-4 w-4 ${maintenance.state === 'closed' ? 'text-emerald-500' : 'text-slate-350'}`} />
                  <span className="font-bold text-slate-850 dark:text-white">Technician Verification check</span>
                </div>
                <span className="text-[10px] text-slate-450">{maintenance.state === 'closed' ? 'Complete' : 'Pending'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20 text-xs text-slate-400 flex items-center justify-between">
          <span>Workshop Command Ledger</span>
          <span>Compliance Gate</span>
        </div>

      </div>
    </div>
  );
}
