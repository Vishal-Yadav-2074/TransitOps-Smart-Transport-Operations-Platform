import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardCard from '../components/DashboardCard';
import InteractiveMap from '../components/InteractiveMap';
import Loader from '../components/Loader';
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
  YAxis
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

  if (loading) return <Loader fullPage />;

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

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Platform Overview</h2>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Real-time KPIs and financial ROI statistics (INR Localized)</p>
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

      {/* Interactive Telemetry Map */}
      <InteractiveMap />

      {/* Analytics Charts & Tables Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Expense Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Expense Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {pieData.length === 0 ? (
              <span className="text-xs text-slate-500 font-medium">No expenses logged yet.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Vehicle Performance BarChart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Top Vehicle ROI Leaderboard (%)</h3>
          <div className="h-64">
            {leaderboardBarData.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-xs text-slate-500 font-medium">No vehicle ROI records.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaderboardBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="ROI" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* ROI Analytics Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
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
  );
}
