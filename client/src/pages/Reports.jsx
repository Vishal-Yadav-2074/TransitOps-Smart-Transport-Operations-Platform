import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { FileDown, FileText, CheckCircle2, TrendingUp, IndianRupee } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get('/reports/stats');
        setStats(res.data.data);
      } catch (err) {
        setError('Failed to load report analytics.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <Loader fullPage />;
  if (error) return <div className="text-red-650 dark:text-red-400 p-4">{error}</div>;

  // Localized to Indian Rupees (INR)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleExport = (reportName) => {
    alert(`Exporting ${reportName} to CSV successfully triggered!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Reports</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Audit vehicle operational margins, depreciation, and asset yields (INR Localized)</p>
        </div>
      </div>

      {/* Available Reports list */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Report Card 1 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vehicle Profitability &amp; ROI Yields</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Consolidated breakdown of each registered vehicle, comparing initial acquisition capital to trip earnings and total maintenance repair bills.
            </p>
          </div>
          <button
            onClick={() => handleExport('Vehicle Profitability & ROI Report')}
            className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all duration-200"
          >
            <FileDown className="h-4 w-4" /> Download CSV Report
          </button>
        </div>

        {/* Report Card 2 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-955/40 border border-blue-200 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <IndianRupee className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Operational Expense Breakdown</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Aggregated operational ledger category breakdown (Fuel, Toll tickets, and Maintenance logs) for tax audits and company balance sheets.
            </p>
          </div>
          <button
            onClick={() => handleExport('Operational Expense Category Audit')}
            className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all duration-200"
          >
            <FileDown className="h-4 w-4" /> Download CSV Report
          </button>
        </div>

      </div>

      {/* Fleet Summary Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 backdrop-blur-md">
        <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-4">Ledger Category Totals</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Fleet Gross Revenue</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{formatCurrency(stats.financials.totalRevenue)}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Operating Bills</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1 block">({formatCurrency(stats.financials.totalOperationalCost)})</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">Total Capital Expenditure</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{formatCurrency(stats.financials.totalAcquisitionCost)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
