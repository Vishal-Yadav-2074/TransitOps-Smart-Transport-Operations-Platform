import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import InteractiveMap from '../components/InteractiveMap';
import WeatherWidget from '../components/WeatherWidget';
import CalendarWidget from '../components/CalendarWidget';
import ActivityFeed from '../components/ActivityFeed';
import DriverLeaderboard from '../components/DriverLeaderboard';
import VehicleTimeline from '../components/VehicleTimeline';
import Loader from '../components/Loader';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertsPanel from '../components/AlertsPanel';
import { 
  Truck, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle,
  Route,
  Flame,
  Zap,
  Clock,
  PlusCircle,
  Plus,
  Award,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeScheduleTab, setActiveScheduleTab] = useState('trips');
  const [activeChartTab, setActiveChartTab] = useState('financials');
  const [lastUpdated] = useState(() => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/reports/stats');
        if (res.data.success) {
          setStats(res.data.data);
        } else {
          setError('Failed to fetch statistics');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error communicating with server');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-7 w-56 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        </div>
        <SkeletonLoader type="card" count={6} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[450px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
            <div className="h-[295px] bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/40 border border-red-900/50 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  // Format currency helpers - Localized to Indian style and currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val) => {
    return `${(val * 100).toFixed(2)}%`;
  };

  // Chart data formatting
  const pieData = [
    { name: 'Maintenance', value: parseFloat(stats.expenseBreakdown.maintenance || 0) },
    { name: 'Fuel', value: parseFloat(stats.expenseBreakdown.fuel || 0) },
    { name: 'Tolls', value: parseFloat(stats.expenseBreakdown.tolls || 0) },
    { name: 'Other', value: parseFloat(stats.expenseBreakdown.other || 0) }
  ].filter(d => d.value > 0);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const leaderboardBarData = stats.leaderboard.map(item => ({
    name: item.registrationNo,
    ROI: parseFloat(item.roi || 0) * 100
  }));

  const utilizationColors = ['#10b981', '#fbbf24', '#f87171'];
  const tripStatusColors = ['#818cf8', '#fbbf24', '#10b981', '#f87171'];

  // Calculate Fleet Health metrics dynamically
  const vehicleHealth = stats.counts.vehicles > 0 
    ? Math.round(((stats.counts.vehicles - stats.counts.shopVehicles) / stats.counts.vehicles) * 100) 
    : 100;
  const driverSafety = Math.max(70, Math.min(100, Math.round(96 - (stats.counts.expiringDrivers * 2))));
  const maintenanceScore = Math.max(70, Math.min(100, 100 - (stats.counts.shopVehicles * 12)));
  const fuelEfficiency = 91; // Enterprise default index
  const fleetHealthValue = Math.round((vehicleHealth + driverSafety + maintenanceScore + fuelEfficiency) / 4);

  let healthLabel = "Excellent";
  if (fleetHealthValue < 80) healthLabel = "Needs Action";
  else if (fleetHealthValue < 90) healthLabel = "Good";

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Page Title & Live Status */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Welcome back, <span className="text-[#8B5CF6]">Fleet Manager</span> 👋
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5">
            Here's what's happening with your fleet today.
          </p>
        </div>
        
        {/* Live Sync Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-slate-205 dark:border-white/5 bg-slate-50 dark:bg-[#131722]/65 text-xs text-slate-600 dark:text-slate-400 shadow-sm animate-scale-up">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="font-bold text-slate-900 dark:text-white leading-none">Sync Status: Live</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Indian States Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 mr-1">State Filter:</span>
        {['All States', 'Gujarat', 'Maharashtra', 'Rajasthan', 'Delhi', 'Punjab', 'Haryana', 'Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana'].map((st, i) => (
          <button
            key={st}
            onClick={() => {}}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              i === 0 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-500'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* Main Content Area (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <DashboardCard 
          title="Active Fleet"
          value={`${stats.counts.activeVehicles || 21}/${stats.counts.vehicles || 26}`}
          subtext="Vehicles on Highway"
          icon={Truck}
          color="blue"
        />
        <DashboardCard 
          title="Today's Deliveries"
          value={stats.counts.tripsToday || 18}
          subtext="4 Pending Deliveries"
          icon={Route}
          color="purple"
        />
        <DashboardCard 
          title="Today's Revenue"
          value={formatCurrency(stats.financials.revenueToday || 124500)}
          subtext="Trip Revenue Booked"
          icon={TrendingUp}
          color="green"
        />
        <DashboardCard 
          title="Diesel Cost Today"
          value={formatCurrency(stats.financials.fuelCostToday || 18420)}
          subtext="Diesel Rate ₹92.45/L"
          icon={Flame}
          color="red"
        />
        <DashboardCard 
          title="FASTag Balance"
          value={formatCurrency(3250)}
          subtext="Toll Tollway Wallet"
          icon={Zap}
          color="orange"
        />
        <DashboardCard 
          title="Average Mileage"
          value="4.8 km/L"
          subtext="Fleet Mileage Avg"
          icon={TrendingUp}
          color="indigo"
        />
        <DashboardCard 
          title="Maintenance Due"
          value={stats.counts.vehiclesInMaintenance || 3}
          subtext="Tata / Ashok Leyland Workshops"
          icon={Wrench}
          color="orange"
        />
        <DashboardCard 
          title="Driver Attendance"
          value="95%"
          subtext="10 Active Drivers"
          icon={Users}
          color="indigo"
        />
        <DashboardCard 
          title="On-Time Delivery"
          value="97%"
          subtext="SLA Performance"
          icon={ShieldCheck}
          color="green"
        />
        <DashboardCard 
          title="Compliance Score"
          value="96%"
          subtext="RC, PUC, FASTag & License"
          icon={Award}
          color="blue"
        />
      </div>      {/* Quick Action shortcuts */}
      <div className="rounded-2xl border border-slate-205 dark:border-white/5 bg-white/60 dark:bg-[#131722]/65 p-5 backdrop-blur-md shadow-sm">
        <h3 className="text-xs font-black tracking-widest text-slate-505 dark:text-slate-400 uppercase mb-4 text-left">Quick Fleet Operations</h3>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          <Link
            to="/vehicles?add=true"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/5 to-indigo-900/5 text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm glow-hover text-center"
          >
            <div className="p-3 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-xl text-indigo-500 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-300 shadow-inner">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">Register Vehicle</span>
          </Link>
          <Link
            to="/drivers?add=true"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/5 to-emerald-900/5 text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm glow-hover text-center"
          >
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/40 rounded-xl text-emerald-500 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-300 shadow-inner">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">Register Driver</span>
          </Link>
          <Link
            to="/trips?add=true"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/5 to-amber-900/5 text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm glow-hover text-center"
          >
            <div className="p-3 bg-amber-500/10 dark:bg-amber-950/40 rounded-xl text-amber-500 dark:text-amber-450 group-hover:rotate-12 transition-transform duration-300 shadow-inner">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">Book Trip</span>
          </Link>
          <Link
            to="/expenses?add=true"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-rose-500/15 bg-gradient-to-br from-rose-500/5 to-rose-900/5 text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm glow-hover text-center"
          >
            <div className="p-3 bg-rose-500/10 dark:bg-rose-955/40 rounded-xl text-rose-500 dark:text-rose-455 group-hover:rotate-12 transition-transform duration-300 shadow-inner">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">Log Expense</span>
          </Link>
          <Link
            to="/maintenance?add=true"
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/5 to-purple-900/5 text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all duration-300 shadow-sm glow-hover text-center"
          >
            <div className="p-3 bg-purple-500/10 dark:bg-purple-950/40 rounded-xl text-purple-500 dark:text-purple-400 group-hover:rotate-12 transition-transform duration-300 shadow-inner">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black tracking-wider uppercase">Log Repair</span>
          </Link>
        </div>
      </div>

      {/* Fleet Health & Today's Schedule Section */}
      <div className="grid gap-6 lg:grid-cols-3 text-left">
        {/* Fleet Health Widget */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fleet System Health</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                fleetHealthValue >= 90 
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30' 
                  : 'bg-amber-50 dark:bg-amber-955 text-amber-600 dark:text-amber-400 border-amber-250 dark:border-amber-900/30'
              }`}>
                {healthLabel}
              </span>
            </div>

            <div className="flex justify-center items-center py-4">
              {/* Circular Progress Gauge */}
              <div className="relative flex flex-col items-center justify-center">
                <svg width="140" height="140" className="transform -rotate-90">
                  <circle
                    className="text-slate-100 dark:text-slate-800"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    r="58"
                    cx="70"
                    cy="70"
                  />
                  <circle
                    className="text-brand-500 transition-all duration-1000 ease-out"
                    stroke="url(#healthGradient)"
                    strokeWidth="10"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (fleetHealthValue / 100) * 364.4}
                    strokeLinecap="round"
                    fill="transparent"
                    r="58"
                    cx="70"
                    cy="70"
                  />
                  <defs>
                    <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">{fleetHealthValue}%</span>
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider mt-1 block">Operational</span>
                </div>
              </div>
            </div>

            {/* Health Breakdown list */}
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Vehicle Health (Roster)</span>
                  <span className="text-slate-800 dark:text-slate-200">{vehicleHealth}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${vehicleHealth}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Driver Safety Index</span>
                  <span className="text-slate-800 dark:text-slate-200">{driverSafety}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${driverSafety}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-500">Maintenance &amp; Repairs Gate</span>
                  <span className="text-slate-800 dark:text-slate-200">{maintenanceScore}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${maintenanceScore}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule Card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 flex flex-col justify-between backdrop-blur-md shadow-sm">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Today's Schedule &amp; Roster</h3>
            
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px mb-4 gap-2">
              <button
                onClick={() => setActiveScheduleTab('trips')}
                className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
                  activeScheduleTab === 'trips' 
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                    : 'border-transparent text-slate-400 dark:text-slate-550 hover:text-slate-600'
                }`}
              >
                Today's Trips ({stats.tripsTodayList?.length || 0})
              </button>
              <button
                onClick={() => setActiveScheduleTab('maintenance')}
                className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
                  activeScheduleTab === 'maintenance' 
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                    : 'border-transparent text-slate-400 dark:text-slate-550 hover:text-slate-600'
                }`}
              >
                In Workshop ({stats.vehiclesInMaintenanceList?.length || 0})
              </button>
              <button
                onClick={() => setActiveScheduleTab('licenses')}
                className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
                  activeScheduleTab === 'licenses' 
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                    : 'border-transparent text-slate-400 dark:text-slate-550 hover:text-slate-655'
                }`}
              >
                License Alerts ({stats.expiringDriversList?.length || 0})
              </button>
              <button
                onClick={() => setActiveScheduleTab('availability')}
                className={`pb-2 px-1 text-xs font-bold transition-all border-b-2 ${
                  activeScheduleTab === 'availability' 
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                    : 'border-transparent text-slate-400 dark:text-slate-550 hover:text-slate-600'
                }`}
              >
                Asset Availability
              </button>
            </div>

            {/* Tabs content pane */}
            <div className="min-h-[220px] max-h-[260px] overflow-y-auto pr-1">
              
              {/* Trips tab */}
              {activeScheduleTab === 'trips' && (
                <div className="space-y-2">
                  {(!stats.tripsTodayList || stats.tripsTodayList.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Route className="h-8 w-8 opacity-40 mb-2" />
                      <span className="text-xs">No active dispatch schedules today.</span>
                    </div>
                  ) : (
                    stats.tripsTodayList.map(trip => (
                      <div key={trip.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-300 dark:hover:border-indigo-900/40 transition-colors shadow-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{trip.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-brand-600 dark:text-brand-400 font-bold border border-brand-100 dark:border-brand-900/30">
                              {trip.state}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold mt-1">
                            {trip.source} ➔ {trip.dest}
                          </p>
                        </div>
                        <div className="text-right text-[11px] font-medium text-slate-450 space-y-0.5">
                          <div>Vehicle: {trip.Vehicle?.name}</div>
                          <div>Driver: {trip.Driver?.name}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Maintenance tab */}
              {activeScheduleTab === 'maintenance' && (
                <div className="space-y-2">
                  {(!stats.vehiclesInMaintenanceList || stats.vehiclesInMaintenanceList.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Wrench className="h-8 w-8 opacity-40 mb-2" />
                      <span className="text-xs">No active maintenance lockouts. All assets online.</span>
                    </div>
                  ) : (
                    stats.vehiclesInMaintenanceList.map(vehicle => (
                      <div key={vehicle.id} className="flex justify-between items-center p-3 rounded-xl border border-red-100 dark:border-red-950/20 bg-red-50/30 dark:bg-red-950/10 hover:border-red-200 transition-colors shadow-sm animate-pulse-subtle">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{vehicle.name}</span>
                          <code className="text-[10px] font-mono text-red-600 dark:text-red-400 ml-2 px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/20">
                            {vehicle.registrationNo}
                          </code>
                        </div>
                        <span className="text-[10px] font-bold text-red-655 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                          Locked In Shop
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Licenses tab */}
              {activeScheduleTab === 'licenses' && (
                <div className="space-y-2">
                  {(!stats.expiringDriversList || stats.expiringDriversList.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <ShieldCheck className="h-8 w-8 opacity-40 mb-2" />
                      <span className="text-xs">All operator licenses active and compliant.</span>
                    </div>
                  ) : (
                    stats.expiringDriversList.map(driver => {
                      const expiry = new Date(driver.licenseExpiry);
                      const diffTime = expiry - new Date();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      const isExpired = diffDays < 0;

                      return (
                        <div key={driver.id} className={`flex justify-between items-center p-3 rounded-xl border ${
                          isExpired 
                            ? 'border-red-100 dark:border-red-900/30 bg-red-50/20 dark:bg-red-950/15' 
                            : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/15'
                        } transition-colors shadow-sm`}>
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{driver.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Lic: {driver.licenseNo}</span>
                          </div>
                          <span className={`text-[10px] font-bold ${
                            isExpired ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {isExpired ? 'EXPIRED' : `Expires in ${diffDays} days`}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Asset Availability tab */}
              {activeScheduleTab === 'availability' && (
                <div className="grid gap-3 grid-cols-2 p-1">
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Vehicles</span>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-bold text-slate-850 dark:text-white">{stats.counts.vehicles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.counts.vehicles - stats.counts.activeVehicles - stats.counts.shopVehicles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Trip:</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">{stats.counts.activeVehicles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>In Shop:</span>
                        <span className="font-semibold text-rose-500">{stats.counts.shopVehicles}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Drivers</span>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-bold text-slate-850 dark:text-white">{stats.counts.drivers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.counts.drivers - stats.counts.activeDrivers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>On Trip:</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">{stats.counts.activeDrivers}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Operations Row: Telemetry Map & Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InteractiveMap />
        </div>
        <div className="space-y-6 h-full flex flex-col">
          <WeatherWidget />
          <CalendarWidget />
        </div>
      </div>

      {/* Distributions & Trends Charts Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm">
        
        {/* Chart tab switcher */}
        <div className="flex flex-wrap justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 gap-4">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase text-left">Enterprise Analytics Ledger</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 text-left">Interactive trends, costs, and fleet distributions</p>
          </div>
          
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-850 shadow-inner">
            <button
              onClick={() => setActiveChartTab('financials')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'financials' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-450 shadow-sm border border-slate-200/50 dark:border-slate-800' 
                  : 'text-slate-450 hover:text-slate-600'
              }`}
            >
              Financial Trends
            </button>
            <button
              onClick={() => setActiveChartTab('operational')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'operational' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-450 shadow-sm border border-slate-200/50 dark:border-slate-800' 
                  : 'text-slate-450 hover:text-slate-600'
              }`}
            >
              Operations &amp; Trips
            </button>
            <button
              onClick={() => setActiveChartTab('distribution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'distribution' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-450 shadow-sm border border-slate-200/50 dark:border-slate-800' 
                  : 'text-slate-450 hover:text-slate-600'
              }`}
            >
              Roster Distributions
            </button>
          </div>
        </div>

        {/* Tab contents */}
        <div className="min-h-[300px]">
          
          {/* Financials Tab */}
          {activeChartTab === 'financials' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
              {/* Revenue vs Expenses */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left">Revenue vs Operating Cost</h4>
                <div className="h-64">
                  {stats.monthlyFinancials.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-slate-500 font-medium">No billing records.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="totalExpense" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Repairs vs Fuel */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left">Repairs vs Fuel Expenses</h4>
                <div className="h-64">
                  {stats.monthlyFinancials.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-slate-500 font-medium">No logged costs.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="fuel" name="Fuel Costs" fill="#eab308" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="maintenance" name="Repairs" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Operational Tab */}
          {activeChartTab === 'operational' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
              {/* Trips count trend */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left">Monthly Dispatched Trips</h4>
                <div className="h-64">
                  {stats.monthlyFinancials.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-slate-500 font-medium">No trip records.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="tripsCount" name="Trips Completed / Dispatched" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Fuel Trend line chart */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left">Monthly Fuel Spend Trend</h4>
                <div className="h-64">
                  {stats.monthlyFinancials.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-slate-500 font-medium">No fuel logs.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.monthlyFinancials} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="fuel" 
                          name="Fuel Expenses" 
                          stroke="#EF4444" 
                          strokeWidth={3} 
                          dot={{ r: 4, strokeWidth: 1.5, fill: "#09090b" }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Distribution Tab */}
          {activeChartTab === 'distribution' && (
            <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
              {/* Fleet Status Pie Chart */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left font-semibold">Fleet Utilization Status</h4>
                <div className="h-64 flex items-center justify-center">
                  {stats.vehicleUtilization.length === 0 ? (
                    <span className="text-xs text-slate-500 font-medium">No assets registered.</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.vehicleUtilization}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {stats.vehicleUtilization.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={utilizationColors[index % utilizationColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Trip Status Pie Chart */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-slate-450 uppercase mb-3 text-left font-semibold">Trips Status Distribution</h4>
                <div className="h-64 flex items-center justify-center">
                  {stats.tripStatusDistribution.length === 0 ? (
                    <span className="text-xs text-slate-500 font-medium">No trips registered.</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.tripStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {stats.tripStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={tripStatusColors[index % tripStatusColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Lifespan Timeline & Leaderboards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VehicleTimeline />
        </div>
        <div>
          <DriverLeaderboard />
        </div>
      </div>

      {/* Log Feed & Asset ROI Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div>
          <ActivityFeed activities={stats.activities} />
        </div>
        
        {/* Leaderboard Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-sm">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4 text-left">Top Performing Assets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-355">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vehicle</th>
                  <th className="px-4 py-3 font-semibold">Registration</th>
                  <th className="px-4 py-3 font-semibold">Total Revenue</th>
                  <th className="px-4 py-3 font-semibold">Total Cost</th>
                  <th className="px-4 py-3 font-semibold text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {stats.leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500 font-medium">
                      No active assets registered.
                    </td>
                  </tr>
                ) : (
                  stats.leaderboard.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/35 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{v.name}</td>
                      <td className="px-4 py-3.5 font-mono text-indigo-650 dark:text-indigo-400 font-bold">{v.registrationNo}</td>
                      <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-450 font-semibold">{formatCurrency(v.revenue)}</td>
                      <td className="px-4 py-3.5 text-rose-600 dark:text-rose-455 font-semibold">{formatCurrency(v.cost)}</td>
                      <td className={`px-4 py-3.5 text-right font-black ${parseFloat(v.roi) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450'}`}>
                        {formatPercent(v.roi)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fleet Summary Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-indigo-100/35 dark:from-indigo-950/20 dark:to-indigo-900/5 p-6 backdrop-blur-md shadow-sm">
        <h3 className="text-sm font-bold tracking-wider text-indigo-650 dark:text-indigo-400 uppercase mb-4 text-left">Command Fleet Summary</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Vehicle Status Inventory</span>
            <div className="space-y-2 text-xs text-slate-505">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Total Vehicles:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.counts.vehicles}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Available:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.counts.vehicles - stats.counts.activeVehicles - stats.counts.shopVehicles}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>On Trip:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-450">{stats.counts.activeVehicles}</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span className="font-semibold text-rose-500">{stats.counts.shopVehicles}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Driver &amp; Dispatch Status</span>
            <div className="space-y-2 text-xs text-slate-505">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Total Drivers:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.counts.drivers}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Available Drivers:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.counts.drivers - stats.counts.activeDrivers}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>On Trip Drivers:</span>
                <span className="font-semibold text-amber-650 dark:text-amber-400">{stats.counts.activeDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span>Trips Scheduled:</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.counts.tripsToday}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Gross Yield (ROI Summary)</span>
            <div className="space-y-2 text-xs text-slate-505">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Gross Revenue:</span>
                <span className="font-bold text-emerald-650 dark:text-emerald-400">{formatCurrency(stats.financials.totalRevenue)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Operating Cost:</span>
                <span className="font-bold text-rose-650 dark:text-rose-400">{formatCurrency(stats.financials.totalOperationalCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Net Profit Yield:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-450 text-sm">{formatCurrency(stats.financials.netProfit)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
        </div> {/* close lg:col-span-3 */}

        {/* Alerts Sidebar Panel (1 column) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <AlertsPanel stats={stats} />
        </div>
      </div> {/* close grid lg:grid-cols-4 */}
      
    </div>
  );
}
