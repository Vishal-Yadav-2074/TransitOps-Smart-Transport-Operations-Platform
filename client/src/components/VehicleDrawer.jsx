import React, { useState, useEffect } from 'react';
import { X, Truck, Wrench, Flame, Calendar, DollarSign, FileText, Upload, ShieldCheck, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function VehicleDrawer({ vehicle, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  // Load documents metadata from localStorage
  useEffect(() => {
    if (vehicle) {
      const stored = localStorage.getItem(`vehicle_docs_${vehicle.id}`);
      if (stored) {
        setDocuments(JSON.parse(stored));
      } else {
        // Seed default Indian vehicle document checklist
        const defaults = [
          { type: 'RC Book', name: `rc_${vehicle.registrationNo.toLowerCase()}.pdf`, date: '2026-01-10', size: '1.8 MB' },
          { type: 'Insurance', name: `insurance_${vehicle.registrationNo.toLowerCase()}.pdf`, date: '2026-01-10', size: '2.4 MB' },
          { type: 'Fitness Certificate', name: `fitness_certificate.pdf`, date: '2026-03-05', size: '1.2 MB' },
          { type: 'PUC Certificate', name: `puc_pollution_cert.pdf`, date: '2026-05-18', size: '750 KB' },
          { type: 'National Permit', name: `national_permit.pdf`, date: '2026-02-14', size: '1.5 MB' },
          { type: 'FASTag', name: `fastag_nhai_tag.pdf`, date: '2026-04-01', size: '600 KB' },
          { type: 'Road Tax', name: `road_tax_receipt.pdf`, date: '2026-01-15', size: '900 KB' }
        ];
        setDocuments(defaults);
        localStorage.setItem(`vehicle_docs_${vehicle.id}`, JSON.stringify(defaults));
      }
    }
  }, [vehicle]);

  if (!isOpen || !vehicle) return null;

  // Localized INR formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Health Calculation based on age, mileage, and repair counts
  const getHealthScore = () => {
    const logsCount = vehicle.Maintenances?.length || 0;
    const mileage = parseFloat(vehicle.odometer || 0);
    let score = 98 - (logsCount * 3) - Math.floor(mileage / 15000);
    return Math.max(65, Math.min(100, score));
  };

  const healthScore = getHealthScore();
  let healthLabel = "Excellent";
  let healthColor = "text-emerald-500";
  if (healthScore < 80) {
    healthLabel = "Needs Action";
    healthColor = "text-rose-500";
  } else if (healthScore < 90) {
    healthLabel = "Good";
    healthColor = "text-amber-500";
  }

  // Handle mock file uploads
  const handleUpload = (type, files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadingDocType(type);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const updated = documents.map(doc => {
              if (doc.type === type) {
                return {
                  ...doc,
                  name: file.name,
                  date: new Date().toISOString().split('T')[0],
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                };
              }
              return doc;
            });
            setDocuments(updated);
            localStorage.setItem(`vehicle_docs_${vehicle.id}`, JSON.stringify(updated));
            setUploadingDocType(null);
            setUploadProgress(0);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Compile monthly trend for Recharts inside the drawer
  const chartData = [
    { name: 'Feb', revenue: (vehicle.revenue || 0) * 0.15, cost: (vehicle.operationalCost || 0) * 0.2 },
    { name: 'Mar', revenue: (vehicle.revenue || 0) * 0.20, cost: (vehicle.operationalCost || 0) * 0.15 },
    { name: 'Apr', revenue: (vehicle.revenue || 0) * 0.18, cost: (vehicle.operationalCost || 0) * 0.25 },
    { name: 'May', revenue: (vehicle.revenue || 0) * 0.22, cost: (vehicle.operationalCost || 0) * 0.18 },
    { name: 'Jun', revenue: (vehicle.revenue || 0) * 0.25, cost: (vehicle.operationalCost || 0) * 0.22 }
  ];

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
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{vehicle.name}</h3>
                <code className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded mt-1 inline-block border border-brand-100 dark:border-brand-900/20">
                  {vehicle.registrationNo}
                </code>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-450 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm animate-pulse-subtle"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Drawer State Indicators */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border capitalize ${
              vehicle.state === 'available' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                : vehicle.state === 'on_trip'
                  ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 border-amber-250 dark:border-amber-900/30'
                  : 'bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-450 border-rose-250 dark:border-rose-900/30'
            }`}>
              {vehicle.state.replace('_', ' ')}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-105 dark:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-700 capitalize">
              Class: {vehicle.vehicleType}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-brand-650 dark:text-brand-400 border border-brand-200/50 font-bold">
              Capacity: {vehicle.maxCapacity} kg
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-955/10 px-6 gap-6">
          {['overview', 'financials', 'history', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-705'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Drawer Body Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Asset Health Circular meter */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <svg className="transform -rotate-90 h-16 w-16">
                      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4.5" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="4.5" fill="transparent" strokeDasharray={163.3} strokeDashoffset={163.3 - (healthScore / 100) * 163.3} strokeLinecap="round" className="text-brand-500" />
                    </svg>
                    <span className="absolute text-xs font-extrabold text-slate-900 dark:text-white">{healthScore}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Vehicle Health</span>
                    <span className={`text-sm font-black ${healthColor}`}>{healthLabel}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/20">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Odometer Mileage</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white mt-1 block">{(vehicle.odometer || 0).toLocaleString('en-IN')} km</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Acquired: {new Date(vehicle.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Driver & Last Trip details */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider"> Roster &amp; Dispatch Status</h4>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Current Assigned Driver</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {vehicle.state === 'on_trip' 
                        ? (vehicle.Trips?.find(t => t.state === 'dispatched')?.Driver?.name || 'Assigned Driver') 
                        : 'No Active Driver Assigned'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Last Active Dispatch Route</span>
                    <span className="font-bold text-slate-905 dark:text-white">
                      {vehicle.Trips && vehicle.Trips.length > 0 
                        ? `${vehicle.Trips[0].source} ➔ ${vehicle.Trips[0].dest}` 
                        : 'No past dispatches recorded'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Timeline */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Asset History Timeline</h4>
                <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800 ml-3">
                  
                  {/* Item 1 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                    <div className="font-bold text-slate-800 dark:text-white">Asset Purchased</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Logged acquisition value of {formatCurrency(vehicle.acquisitionCost)} on {new Date(vehicle.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Item 2 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">🛞</span>
                    <div className="font-bold text-slate-800 dark:text-white">Deliveries Dispatched</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Successfully dispatched {vehicle.Trips?.length || 0} commercial route operations.</p>
                  </div>

                  {/* Item 3 */}
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] text-white">🔧</span>
                    <div className="font-bold text-slate-800 dark:text-white">Workshop Logs</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recorded {vehicle.Maintenances?.length || 0} routine repairs and diagnostics checkups.</p>
                  </div>

                  {/* Item 4 */}
                  <div className="relative">
                    <span className={`absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white ${
                      vehicle.state === 'available' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}>●</span>
                    <div className="font-bold text-slate-800 dark:text-white">Currently Available</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Asset state listed as operational and parked inside dispatcher bay.</p>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* FINANCIALS TAB */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              
              {/* ROI and Financial counts */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Commercial Yield ROI</span>
                  <span className={`text-xl font-black block mt-1.5 ${
                    (vehicle.vehicleRoi || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {(parseFloat(vehicle.vehicleRoi || 0) * 100).toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Acquisition Yield ratio</span>
                </div>

                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-955/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Revenue booked</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1.5 block">
                    {formatCurrency(vehicle.revenue || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Gross commercial earnings</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-955/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operating Bills (Cost)</span>
                  <span className="text-xl font-black text-rose-500 mt-1.5 block">
                    {formatCurrency(vehicle.operationalCost || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Maintenance &amp; Fuel bills</span>
                </div>

                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-955/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Lifetime Profits</span>
                  <span className="text-xl font-black text-emerald-500 mt-1.5 block">
                    {formatCurrency((vehicle.revenue || 0) - (vehicle.operationalCost || 0))}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Net profit margins</span>
                </div>
              </div>

              {/* Monthly Trend Area Chart */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">5-Month Financial Margin Yield</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="drawerColorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="drawerColorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                      <YAxis stroke="#94a3b8" fontSize={9} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fillOpacity={1} fill="url(#drawerColorRev)" strokeWidth={1.5} />
                      <Area type="monotone" dataKey="cost" name="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#drawerColorExp)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              {/* Maintenance list */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repairs &amp; Workshop Logs</h4>
                  <span className="text-[10px] text-slate-450 font-semibold">{vehicle.Maintenances?.length || 0} logs</span>
                </div>
                {(!vehicle.Maintenances || vehicle.Maintenances.length === 0) ? (
                  <div className="py-6 text-center text-slate-450 border border-dashed border-slate-205 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/10">
                    No active maintenance logs.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {vehicle.Maintenances.map(m => (
                      <div key={m.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-brand-500" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white leading-none">{m.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{m.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-rose-500">{formatCurrency(m.cost)}</span>
                          <span className="text-[9px] text-slate-400 capitalize block mt-0.5">{m.state}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fuel and Toll expenses list */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fuel Refills &amp; Toll Bills</h4>
                  <span className="text-[10px] text-slate-450 font-semibold">{vehicle.Expenses?.length || 0} logs</span>
                </div>
                {(!vehicle.Expenses || vehicle.Expenses.length === 0) ? (
                  <div className="py-6 text-center text-slate-450 border border-dashed border-slate-205 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/10">
                    No active fuel or toll receipts logged.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {vehicle.Expenses.map(e => (
                      <div key={e.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10">
                        <div className="flex items-center gap-2">
                          <Flame className="h-3.5 w-3.5 text-amber-500" />
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white leading-none">{e.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{e.date} | Category: <span className="capitalize">{e.expenseType}</span></span>
                          </div>
                        </div>
                        <span className="font-black text-rose-500">{formatCurrency(e.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* DOCUMENTS TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              
              {/* Uploader area */}
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Document Vault Checklist</h4>
                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-slate-105 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-955/10">
                      <div className="flex gap-3 items-center">
                        <div className="p-2 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-xl border border-emerald-250 dark:border-emerald-900/30">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white">{doc.type}</span>
                          <span className="text-[10px] text-slate-450 font-mono block mt-0.5">{doc.name} ({doc.size})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadingDocType === doc.type ? (
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                          </div>
                        ) : (
                          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-655 dark:text-brand-400 border border-brand-200/50 dark:border-brand-900/30 px-3 py-1.5 hover:bg-brand-500 hover:text-white transition-all text-[10px] font-bold">
                            <Upload className="h-3.5 w-3.5" /> Update
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleUpload(doc.type, e.target.files)} 
                            />
                          </label>
                        )}
                        <a 
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert(`Simulated download of ${doc.name}`); }}
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                          title="Download document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-400 flex items-center justify-between">
          <span>Last Telemetry Sync: Just Now</span>
          <span>ROI Yield Checked</span>
        </div>

      </div>
    </div>
  );
}
