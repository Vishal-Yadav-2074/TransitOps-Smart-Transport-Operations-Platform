import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Wrench, 
  TrendingDown, 
  Flame, 
  ShieldAlert, 
  ChevronRight,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function AlertsPanel({ stats }) {
  if (!stats) return null;

  // Compile real-time alerts from local dataset plus simulated events
  const alerts = [
    ...(stats.expiringDriversList || []).map(driver => ({
      id: `driver-${driver.id}`,
      type: 'license',
      title: `License Expiry: ${driver.name}`,
      desc: `Roster compliance requires immediate renewal.`,
      time: 'Action Required',
      icon: ShieldAlert,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
      status: 'Critical'
    })),
    ...(stats.vehiclesInMaintenanceList || []).slice(0, 2).map(v => ({
      id: `maint-${v.id}`,
      type: 'maintenance',
      title: `Maintenance: ${v.name}`,
      desc: `Asset lock in workshop. Scheduling repair logs.`,
      time: 'In Progress',
      icon: Wrench,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      status: 'Active'
    })),
    // Fuel Anomaly simulation
    {
      id: 'fuel-anomaly-1',
      type: 'fuel',
      title: 'Fuel Consumption Anomaly',
      desc: 'Vehicle GJ-01-AB-4587 logged unusual fuel consumption rate on Vadodara Expressway.',
      time: '2 hours ago',
      icon: Flame,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
      status: 'Warning'
    },
    // Low ROI alert simulation
    {
      id: 'roi-alert-1',
      type: 'roi',
      title: 'FASTag Balance Warning',
      desc: 'FASTag Wallet balance for MH-12-TR-8541 is below auto-recharge threshold.',
      time: 'Today',
      icon: TrendingDown,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/15',
      status: 'Attention'
    },
    // Insurance Expiry simulation
    {
      id: 'ins-expiry-1',
      type: 'insurance',
      title: 'Insurance & PUC Renewal Pending',
      desc: 'Tata Prima GJ-18-KL-2281 commercial insurance and PUC policy expire tomorrow.',
      time: 'Pending',
      icon: AlertTriangle,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/15',
      status: 'Warning'
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-205 dark:border-white/5 bg-white/60 dark:bg-[#131722]/65 p-6 backdrop-blur-md shadow-sm h-full flex flex-col justify-between text-left animate-slide-up">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-4">
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-505 dark:text-slate-400 uppercase">Alerts Control Panel</h3>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 font-bold">Roster & Telemetry triggers</p>
          </div>
          <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-lg border border-rose-250 dark:border-rose-900/30">
            {alerts.length} Critical
          </span>
        </div>

        {/* Scrollable list */}
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-60 mb-2" />
              <span className="text-xs font-semibold">Zero warnings. All systems normal.</span>
            </div>
          ) : (
            alerts.map(alert => {
              const Icon = alert.icon;
              return (
                <div 
                  key={alert.id}
                  className="group flex gap-3 items-start p-3 rounded-xl border border-slate-150 dark:border-white/5 bg-slate-50/50 dark:bg-[#181D28]/30 hover:border-brand-500/30 dark:hover:bg-[#181D28]/60 transition-all duration-200 cursor-pointer glow-hover"
                >
                  <div className={`p-2 rounded-lg border ${alert.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate leading-none">{alert.title}</h4>
                      <span className="text-[8px] font-bold uppercase tracking-wide opacity-80 shrink-0">{alert.status}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 mt-1 leading-snug">{alert.desc}</p>
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Telemetry Activity mini-feed */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-4">
        <h4 className="text-[10px] font-black tracking-wider text-slate-450 uppercase mb-3 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-brand-500" />
          Live Roster Activity
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">Trip MH-12-RT dispatched</span>
            <span className="font-bold">Just now</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">Odometer update logged</span>
            <span className="font-bold">12m ago</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[170px]">Driver MH-12 safety mark</span>
            <span className="font-bold">45m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
