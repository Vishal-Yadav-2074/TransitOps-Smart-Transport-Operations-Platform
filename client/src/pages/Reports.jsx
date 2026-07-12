import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Loader from '../components/Loader';
import { FileDown, FileText, Printer, TrendingUp, IndianRupee, Mail } from 'lucide-react';

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
  if (error) return <div className="text-red-655 dark:text-red-400 p-4">{error}</div>;

  // Localized to Indian Rupees (INR)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleSendEmail = async () => {
    try {
      const res = await api.post('/reports/trigger-reminders');
      alert(res.data.message || 'Operational email dispatched successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send operational email reminder.');
    }
  };

  const handlePrintPDF = async () => {
    try {
      const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/drivers'),
        api.get('/trips')
      ]);

      const vehicles = vehiclesRes.data.data || [];
      const drivers = driversRes.data.data || [];
      const trips = tripsRes.data.data || [];

      // Create new print window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>TransitOps Command - Complete Fleet Operations & ROI Audit Report</title>
            <style>
              body { font-family: 'Outfit', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
              h1 { font-size: 24px; color: #1e1b4b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
              h2 { font-size: 16px; color: #4338ca; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
              .meta { font-size: 11px; color: #64748b; margin-bottom: 25px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
              th { background-color: #f8fafc; text-align: left; padding: 8px 10px; border-bottom: 2px solid #cbd5e1; font-weight: bold; color: #475569; }
              td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; }
              .kpi-grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
              .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: left; }
              .kpi-val { font-size: 18px; font-weight: bold; color: #0f172a; margin-top: 5px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h1>TransitOps Command — Fleet Operations Audit Report</h1>
            <div class="meta">Generated on: ${new Date().toLocaleString('en-IN')} | Region: India | Currency: INR</div>

            <div class="kpi-grid">
              <div class="kpi-card">
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b;">Gross Revenue</div>
                <div class="kpi-val">${formatCurrency(stats.financials.totalRevenue)}</div>
              </div>
              <div class="kpi-card">
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b;">Operating Bills</div>
                <div class="kpi-val">${formatCurrency(stats.financials.totalOperationalCost)}</div>
              </div>
              <div class="kpi-card">
                <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b;">Net Profit</div>
                <div class="kpi-val">${formatCurrency(stats.financials.netProfit)}</div>
              </div>
            </div>

            <h2>Fleet Asset Catalog</h2>
            <table>
              <thead>
                <tr>
                  <th>Vehicle Name</th>
                  <th>RTO License plate</th>
                  <th>Type</th>
                  <th>Odometer Mileage</th>
                  <th>Repair Bills</th>
                  <th>Asset ROI Yield</th>
                </tr>
              </thead>
              <tbody>
                ${vehicles.map(v => `
                  <tr>
                    <td><strong>${v.name}</strong></td>
                    <td><code>${v.registrationNo}</code></td>
                    <td>${v.vehicleType}</td>
                    <td>${v.odometer} km</td>
                    <td>${formatCurrency(v.operationalCost || 0)}</td>
                    <td><strong>${(parseFloat(v.vehicleRoi || 0) * 100).toFixed(2)}%</strong></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Driver Licensing Directory</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Licence Code</th>
                  <th>Class</th>
                  <th>Expiry Date</th>
                  <th>Safety Index</th>
                </tr>
              </thead>
              <tbody>
                ${drivers.map(d => `
                  <tr>
                    <td><strong>${d.name}</strong></td>
                    <td><code>${d.licenseNo}</code></td>
                    <td>${d.licenseCategory}</td>
                    <td>${d.licenseExpiry ? d.licenseExpiry.substring(0, 7) : 'N/A'}</td>
                    <td>${d.safetyScore}/100</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Commercial Dispatch Logs</h2>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Trip Route</th>
                  <th>Cargo Load</th>
                  <th>Trip Revenue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${trips.map(t => `
                  <tr>
                    <td><strong>${t.name}</strong></td>
                    <td>${t.source} ➔ ${t.dest}</td>
                    <td>${t.cargoWeight} kg</td>
                    <td>${formatCurrency(t.revenue || 0)}</td>
                    <td>${t.state}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      alert('Failed to generate full printable fleet PDF report.');
    }
  };

  const handleExportCSV = async (type) => {
    try {
      let data = [];
      let filename = 'fleet_report.csv';
      let csvContent = "";

      if (type === 'vehicles') {
        const res = await api.get('/vehicles');
        data = res.data.data || [];
        filename = 'vehicles_inventory_report.csv';
        csvContent += "ID,Vehicle,Registration,Type,Odometer(km),AcquisitionCost,OperatingCost,ROI\n";
        data.forEach(v => {
          csvContent += `"${v.id}","${v.name}","${v.registrationNo}","${v.vehicleType}","${v.odometer}","${v.acquisitionCost}","${v.operationalCost}","${(parseFloat(v.vehicleRoi || 0) * 100).toFixed(2)}%"\n`;
        });
      } else if (type === 'expenses') {
        const res = await api.get('/expenses');
        data = res.data.data || [];
        filename = 'expenses_audit_report.csv';
        csvContent += "ID,Description,Vehicle,Registration,Type,Amount(INR),Date\n";
        data.forEach(e => {
          csvContent += `"${e.id}","${e.name}","${e.Vehicle?.name || 'N/A'}","${e.Vehicle?.registrationNo || 'N/A'}","${e.expenseType}","${e.amount}","${e.date}"\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const encodedUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUrl);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to trigger CSV export download.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Financial Reports</h2>
          <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-1">Audit vehicle operational margins, depreciation, and asset yields (INR Localized)</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 text-sm font-semibold shadow-sm transition-all"
          >
            <Mail className="h-4 w-4" /> Send Email Alerts
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 shadow-md hover:shadow-indigo-500/20 transition-all"
          >
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
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
            <p className="text-xs text-slate-505 dark:text-slate-400 mt-1.5 leading-relaxed">
              Consolidated breakdown of each registered vehicle, comparing initial acquisition capital to trip earnings and total maintenance repair bills.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('vehicles')}
            className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all duration-200"
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
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1.5 leading-relaxed">
              Aggregated operational ledger category breakdown (Fuel, Toll tickets, and Maintenance logs) for tax audits and company balance sheets.
            </p>
          </div>
          <button
            onClick={() => handleExportCSV('expenses')}
            className="mt-6 flex items-center justify-center gap-1.5 w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-all duration-200"
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
