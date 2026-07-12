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
import { 
  Truck, 
  Users, 
  IndianRupee, 
  TrendingUp, 
  ShieldCheck, 
  Wrench, 
  AlertTriangle 
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
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TransitOps Core Command</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time telemetry, routing tracks, and financial ROI analytics (INR Localized)</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-indigo-250 dark:border-indigo-900/30">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
          Live Feed Synchronized
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard 
          title="Today's Trips"
          value={stats.counts.tripsToday}
          subtext="Dispatched / scheduled today"
          icon={ShieldCheck}
          color="indigo"
        />
        <DashboardCard 
          title="Fleet Utilization %"
          value={`${stats.counts.fleetUtilization}%`}
          subtext={`${stats.counts.activeVehicles} of ${stats.counts.vehicles} assets active`}
          icon={Truck}
          color="blue"
        />
        <DashboardCard 
          title="Fuel Cost Today"
          value={formatCurrency(stats.financials.fuelCostToday)}
          subtext="Logged fuel receipts today"
          icon={IndianRupee}
          color="yellow"
        />
        <DashboardCard 
          title="Revenue Today"
          value={formatCurrency(stats.financials.revenueToday)}
          subtext="Earnings booked today"
          icon={TrendingUp}
          color="green"
        />
        <DashboardCard 
          title="Vehicles in Maintenance"
          value={stats.counts.vehiclesInMaintenance}
          subtext="Active workshop shop lockouts"
          icon={Wrench}
          color="indigo"
        />
        <DashboardCard 
          title="Drivers Expiring Licenses"
          value={stats.counts.expiringDrivers}
          subtext="Requires compliance updates"
          icon={AlertTriangle}
          color={stats.counts.expiringDrivers > 0 ? 'red' : 'indigo'}
        />
      </div>

      {/* Quick Actions Row */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 backdrop-blur-md">
        <h3 className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">Quick Operational Actions</h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Link
            to="/vehicles?add=true"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-900/45 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all hover:scale-[1.02]"
          >
            + Add Vehicle
          </Link>
          <Link
            to="/drivers?add=true"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-emerald-200 dark:border-emerald-900/45 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all hover:scale-[1.02]"
          >
            + Add Driver
          </Link>
          <Link
            to="/trips?add=true"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-amber-200 dark:border-amber-900/45 bg-amber-50/50 dark:bg-amber-950/20 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all hover:scale-[1.02]"
          >
            + Book Trip
          </Link>
          <Link
            to="/expenses?add=true"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/45 bg-rose-50/50 dark:bg-rose-955/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all hover:scale-[1.02]"
          >
            + Add Expense
          </Link>
        </div>
      </div>

      {/* Top Assets & Health Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Top Vehicle */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">🏆 Vehicle of the Month</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-650 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">HGV</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">Heavy Hauler</h4>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-205">₹4,50,000</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Asset Yield ROI</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-450">18%</span>
          </div>
        </div>

        {/* Top Driver */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">🥇 Driver of the Month</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-955 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30">Active</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">David Miller</h4>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Trips Completed:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-205">120 Trips</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Safety Index</span>
            <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-450">98/100</span>
          </div>
        </div>

        {/* Fleet Health Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fleet System Health</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900/30">Excellent</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">Fleet Health Index</h4>
            
            {/* Visual Progress Bar */}
            <div className="mt-3 bg-slate-100 dark:bg-slate-950 rounded-full h-3.5 w-full overflow-hidden border border-slate-200 dark:border-slate-850 flex items-center pr-1.5 pl-1">
              <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-2 rounded-full" style={{ width: '92%' }} />
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Status</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white">92%</span>
          </div>
        </div>
      </div>

      {/* Operations Row: Telemetry Map & Widgets */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InteractiveMap />
        </div>
        <div className="space-y-6">
          <WeatherWidget />
          <CalendarWidget />
        </div>
      </div>

      {/* Financial Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Revenue vs Expenses */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Revenue vs Operational Expense</h3>
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

        {/* Repairs & Fuel Costs */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Repairs & Fuel Expenses by Month</h3>
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
                  <Bar dataKey="fuel" name="Fuel Costs" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maintenance" name="Repairs" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Distributions Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Vehicle Utilization Pie */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Fleet Utilization Distribution</h3>
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
                    paddingAngle={5}
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

        {/* Trip Status Pie */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Trip Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {stats.tripStatusDistribution.length === 0 ? (
              <span className="text-xs text-slate-500 font-medium">No trips scheduled yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.tripStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
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
          <ActivityFeed />
        </div>
        
        {/* Leaderboard Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Top Performing Assets</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
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
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-white">{v.name}</td>
                      <td className="px-4 py-3.5 font-mono text-indigo-650 dark:text-indigo-400">{v.registrationNo}</td>
                      <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(v.revenue)}</td>
                      <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400 font-medium">{formatCurrency(v.cost)}</td>
                      <td className={`px-4 py-3.5 text-right font-bold ${parseFloat(v.roi) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-indigo-100/35 dark:from-indigo-650/10 dark:to-indigo-900/5 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold tracking-wider text-indigo-650 dark:text-indigo-400 uppercase mb-4">Command Fleet Summary</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Vehicle Status Inventory</span>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Total Vehicles:</span>
                <span className="font-bold text-slate-900 dark:text-white">25</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Available:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">18</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>On Trip:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">5</span>
              </div>
              <div className="flex justify-between">
                <span>Maintenance:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-450">2</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Driver & Dispatch Status</span>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Drivers:</span>
                <span className="font-bold text-slate-900 dark:text-white">20</span>
              </div>
              <div className="flex justify-between">
                <span>Trips Today:</span>
                <span className="font-bold text-slate-900 dark:text-white">12</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Gross Performance Yield</span>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-450 text-sm">₹1,25,000</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
