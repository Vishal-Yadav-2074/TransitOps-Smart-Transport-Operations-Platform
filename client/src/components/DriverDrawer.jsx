import React, { useState, useEffect } from 'react';
import { X, Users, AlertTriangle, ShieldCheck, Phone, FileText, Upload, Calendar, Star, Award, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DriverDrawer({ driver, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  // Load documents metadata from localStorage
  useEffect(() => {
    if (driver) {
      const stored = localStorage.getItem(`driver_docs_${driver.id}`);
      if (stored) {
        setDocuments(JSON.parse(stored));
      } else {
        // Seed default Indian driver compliance checklist
        const defaults = [
          { type: 'Driving License', name: `dl_${driver.name.toLowerCase().replace(' ', '_')}.pdf`, date: '2026-02-15', size: '1.4 MB' },
          { type: 'Aadhaar', name: `aadhaar_card_${driver.id}.pdf`, date: '2026-01-10', size: '850 KB' },
          { type: 'PAN', name: `pan_card_${driver.id}.pdf`, date: '2026-01-10', size: '620 KB' },
          { type: 'Medical Certificate', name: `medical_cert_${driver.id}.pdf`, date: '2026-01-20', size: '920 KB' },
          { type: 'Police Verification', name: `police_verification_${driver.id}.pdf`, date: '2025-11-10', size: '2.1 MB' }
        ];
        setDocuments(defaults);
        localStorage.setItem(`driver_docs_${driver.id}`, JSON.stringify(defaults));
      }
    }
  }, [driver]);

  if (!isOpen || !driver) return null;

  // Check compliance locally
  const isCompliant = () => {
    const todayMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const expiryMonth = driver.licenseExpiry ? driver.licenseExpiry.substring(0, 7) : '';
    if (expiryMonth && expiryMonth < todayMonth) return false;
    if (driver.state === 'suspended' || driver.state === 'off_duty') return false;
    return true;
  };

  const compliant = isCompliant();

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
            localStorage.setItem(`driver_docs_${driver.id}`, JSON.stringify(updated));
            setUploadingDocType(null);
            setUploadProgress(0);
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  // Extract avatar initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-slide-left text-left text-slate-850 dark:text-slate-200"
      >
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-955/20">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border shadow-inner ${
                compliant 
                  ? 'bg-emerald-500/10 border-emerald-305 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 border-rose-300 text-rose-600 dark:text-rose-400'
              }`}>
                {getInitials(driver.name)}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{driver.name}</h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-semibold text-slate-500">Lic No: {driver.licenseNo}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400">Class: {driver.licenseCategory}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Compliance & State Badges */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border capitalize ${
              driver.state === 'available' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                : driver.state === 'on_trip'
                  ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-450 border-amber-250 dark:border-amber-900/30'
                  : driver.state === 'suspended'
                    ? 'bg-red-50 dark:bg-red-955/40 text-red-600 dark:text-red-450 border-red-250 dark:border-red-900/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              {driver.state.replace('_', ' ')}
            </span>
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border flex items-center gap-1 ${
              compliant 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                : 'bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-450 border-rose-250 dark:border-rose-900/30'
            }`}>
              {compliant ? '✓ Compliant' : '⚠ Action Required'}
            </span>
            <a 
              href={`tel:${driver.contactNo}`}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold border border-slate-205 dark:border-slate-700 flex items-center gap-1.5"
            >
              <Phone className="h-3 w-3" /> Call Operator
            </a>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 px-6 gap-6">
          {['overview', 'safety', 'documents'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700'
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
              
              {/* Compliance status cards */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-850 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gate Verification Status</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Commercial License Expiry</span>
                    <span className={`font-semibold ${compliant ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {driver.licenseExpiry ? driver.licenseExpiry.substring(0, 7) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Medical Fitness Checkup</span>
                    <span className="font-semibold text-emerald-500 flex items-center gap-1">✓ Active (Jan 2026)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Background Verification Check</span>
                    <span className="font-semibold text-emerald-500 flex items-center gap-1">✓ Verified</span>
                  </div>
                </div>
              </div>

              {/* Roster trip metrics */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Trips Completed</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1.5 block">
                    {driver.Trips?.length || 0} Trips
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">Total lifetime roster dispatches</span>
                </div>

                <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-955/20">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Fleet Vehicle</span>
                  <span className="text-sm font-bold text-slate-905 dark:text-white mt-1.5 block">
                    {driver.state === 'on_trip' 
                      ? (driver.Trips?.find(t => t.state === 'dispatched')?.Vehicle?.name || 'Heavy Hauler (GJ-01-XX-9999)') 
                      : 'None - Available'}
                  </span>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-850 p-5 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Operator Timeline</h4>
                <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800 ml-3">
                  
                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
                    <div className="font-bold text-slate-800 dark:text-white">Operator Registered</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Approved and added to dispatch registry on {new Date(driver.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">🛞</span>
                    <div className="font-bold text-slate-800 dark:text-white">Trips Dispatched</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Recorded {driver.Trips?.length || 0} successful cargo transport dispatches.</p>
                  </div>

                  {parseFloat(driver.safetyScore || 0) >= 90 && (
                    <div className="relative">
                      <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">🏆</span>
                      <div className="font-bold text-slate-800 dark:text-white">High Safety Roster Award</div>
                      <p className="text-[10px] text-slate-500 mt-0.5">Safety index matches premium tier rules (&gt;90% Safe Operators).</p>
                    </div>
                  )}

                </div>
              </div>

            </div>
          )}

          {/* SAFETY TAB */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              
              {/* Safety metrics visual meters */}
              <div className="rounded-2xl border border-slate-150 dark:border-slate-850 p-5 text-left">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safety Index Ledger</h4>
                  <span className={`text-sm font-extrabold ${
                    parseFloat(driver.safetyScore || 0) >= 90 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {parseFloat(driver.safetyScore || 0).toFixed(1)}/100
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-3 overflow-hidden mb-6">
                  <div className={`h-full rounded-full transition-all ${
                    parseFloat(driver.safetyScore || 0) >= 90 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`} style={{ width: `${driver.safetyScore}%` }} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-500">
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Hard Braking</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">0.2/100km</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Speed Violations</span>
                    <span className="font-extrabold text-emerald-500">None</span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Score Class</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">Tier A Elite</span>
                  </div>
                </div>
              </div>

              {/* Roster trip histories list */}
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed / Dispatched Trips History</h4>
                {(!driver.Trips || driver.Trips.length === 0) ? (
                  <div className="py-6 text-center text-slate-450 border border-dashed border-slate-205 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/10">
                    No active trips recorded in this operator's file.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driver.Trips.map(trip => (
                      <div key={trip.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10">
                        <div>
                          <span className="font-bold text-slate-850 dark:text-white">{trip.name}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{trip.source} ➔ {trip.dest}</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 capitalize">{trip.state}</span>
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
              
              <div className="space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Compliance Document Vault</h4>
                <div className="space-y-3">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-slate-105 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-950/10">
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
                          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-405 hover:text-slate-900 dark:hover:text-white transition-all"
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
          <span>Operator Compliance Registry</span>
          <span>Verified Gate</span>
        </div>

      </div>
    </div>
  );
}
