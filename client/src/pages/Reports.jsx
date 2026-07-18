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
            <title>TransitOps Corporate dossier - Fleet Operations & ROI Audit Report</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
              body { 
                font-family: 'Inter', sans-serif; 
                padding: 40px; 
                color: #0f172a; 
                line-height: 1.6;
                background-color: #ffffff;
              }
              .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #6366f1;
                padding-bottom: 20px;
                margin-bottom: 25px;
              }
              .logo {
                font-size: 26px;
                font-weight: 800;
                color: #4f46e5;
                letter-spacing: -0.05em;
              }
              .meta-badge {
                text-align: right;
                font-size: 11px;
                color: #64748b;
                font-weight: 500;
              }
              h1 { 
                font-size: 22px; 
                color: #0f172a; 
                font-weight: 800;
                margin: 0;
              }
              h2 { 
                font-size: 14px; 
                font-weight: 700;
                color: #4338ca; 
                margin-top: 35px; 
                margin-bottom: 12px; 
                border-bottom: 1.5px solid #e2e8f0; 
                padding-bottom: 6px; 
                text-transform: uppercase;
                letter-spacing: 0.05em;
              }
              .subtitle {
                font-size: 12px;
                color: #64748b;
                margin-top: 4px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 25px; 
                font-size: 11px; 
              }
              th { 
                background-color: #f8fafc; 
                text-align: left; 
                padding: 10px 12px; 
                border-bottom: 2px solid #e2e8f0; 
                font-weight: 600; 
                color: #475569; 
              }
              td { 
                padding: 10px 12px; 
                border-bottom: 1px solid #f1f5f9; 
                color: #334155; 
              }
              tr:nth-child(even) td {
                background-color: #fafafa;
              }
              .kpi-grid { 
                display: grid; 
                grid-template-cols: repeat(3, 1fr); 
                gap: 20px; 
                margin-bottom: 35px; 
              }
              .kpi-card { 
                background: #fdfdfd; 
                border: 1.5px solid #f1f5f9; 
                padding: 18px; 
                border-radius: 12px; 
                text-align: left; 
                box-shadow: 0 1px 3px rgba(0,0,0,0.02);
              }
              .kpi-label {
                font-size: 10px; 
                font-weight: 700; 
                text-transform: uppercase; 
                color: #64748b; 
                letter-spacing: 0.05em;
              }
              .kpi-val { 
                font-size: 20px; 
                font-weight: 800; 
                color: #0f172a; 
                margin-top: 8px; 
              }
              .compliancy {
                font-weight: bold;
                color: #16a34a;
              }
              .non-compliancy {
                font-weight: bold;
                color: #dc2626;
              }
              .signature-section {
                margin-top: 60px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
                color: #64748b;
              }
              .sig-box {
                border-top: 1px solid #cbd5e1;
                width: 200px;
                text-align: center;
                padding-top: 8px;
                margin-top: 50px;
              }
              @media print {
                body { padding: 0; }
                .report-header { border-bottom-color: #4f46e5; }
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <div>
                <div class="logo">TransitOps Command</div>
                <div class="subtitle">Enterprise Fleet Analytics &amp; Yield Audit</div>
              </div>
              <div class="meta-badge">
                <div>Dossier Ref: TO-AUD-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}</div>
                <div>Generated: ${new Date().toLocaleString('en-IN')}</div>
              </div>
            </div>

            <h1>Fleet Performance Audit Ledger</h1>
            <div class="subtitle" style="margin-bottom: 30px;">Certified financial audit and compliance catalog detailing fleet capitalization, operating margins, driver licenses compliance, and route deliveries.</div>

            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">Gross Dispatch Revenue</div>
                <div class="kpi-val">${formatCurrency(stats.financials.totalRevenue)}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Total Operating Cost</div>
                <div class="kpi-val">${formatCurrency(stats.financials.totalOperationalCost)}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Net Profit Yield</div>
                <div class="kpi-val">${formatCurrency(stats.financials.netProfit)}</div>
              </div>
            </div>

            <h2>Fleet Asset &amp; ROI Catalog</h2>
            <table>
              <thead>
                <tr>
                  <th>Vehicle Name</th>
                  <th>License Plate</th>
                  <th>Type</th>
                  <th>Odometer Mileage</th>
                  <th>Operating Cost</th>
                  <th>Capital Yield ROI</th>
                </tr>
              </thead>
              <tbody>
                ${vehicles.map(v => `
                  <tr>
                    <td><strong>${v.name}</strong></td>
                    <td><code>${v.registrationNo}</code></td>
                    <td style="text-transform: capitalize;">${v.vehicleType}</td>
                    <td>${(v.odometer || 0).toLocaleString('en-IN')} km</td>
                    <td>${formatCurrency(v.operationalCost || 0)}</td>
                    <td style="font-weight: 700; color: ${parseFloat(v.vehicleRoi || 0) >= 0 ? '#16a34a' : '#dc2626'}">
                      ${(parseFloat(v.vehicleRoi || 0) * 100).toFixed(2)}%
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Driver Compliance Registry</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>License Code</th>
                  <th>Class</th>
                  <th>Expiry Date</th>
                  <th>Safety Score</th>
                  <th>Compliance Gate</th>
                </tr>
              </thead>
              <tbody>
                ${drivers.map(d => {
                  const todayMonth = new Date().toISOString().substring(0, 7);
                  const expiryMonth = d.licenseExpiry ? d.licenseExpiry.substring(0, 7) : '';
                  const compliant = expiryMonth && expiryMonth >= todayMonth && d.state !== 'suspended';
                  
                  return `
                    <tr>
                      <td><strong>${d.name}</strong></td>
                      <td><code>${d.licenseNo}</code></td>
                      <td>${d.licenseCategory}</td>
                      <td>${expiryMonth || 'N/A'}</td>
                      <td style="font-weight: 600;">${parseFloat(d.safetyScore || 0).toFixed(1)}/100</td>
                      <td class="${compliant ? 'compliancy' : 'non-compliancy'}">
                        ${compliant ? 'Compliant' : 'Non-Compliant'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <h2>Commercial Dispatch Log</h2>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Trip Route</th>
                  <th>Cargo Weight</th>
                  <th>Trip Revenue</th>
                  <th>Dispatch State</th>
                </tr>
              </thead>
              <tbody>
                ${trips.map(t => `
                  <tr>
                    <td><strong>${t.name}</strong></td>
                    <td>${t.source} ➔ ${t.dest}</td>
                    <td>${(t.cargoWeight || 0).toLocaleString('en-IN')} kg</td>
                    <td style="font-weight: 600; color: #16a34a;">${formatCurrency(t.revenue || 0)}</td>
                    <td style="text-transform: capitalize; font-weight: 600;">${t.state}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="signature-section">
              <div>
                <div>Audited and Compiled By:</div>
                <div style="font-weight: 700; color: #0f172a; margin-top: 4px;">TransitOps Automated Audit Engine</div>
              </div>
              <div class="sig-box">
                Authorized Signature &amp; Stamp
              </div>
            </div>

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
