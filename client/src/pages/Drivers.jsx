import React, { useEffect, useState, useMemo, useCallback } from 'react';
import driverService from '../services/driverService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Pencil, Trash2, X, AlertTriangle, LayoutGrid, List, Search } from 'lucide-react';
import DriverDrawer from '../components/DriverDrawer';
import { useToast } from '../contexts/ToastContext';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filters state
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCompliance, setFilterCompliance] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [safetyScore, setSafetyScore] = useState(100.0);
  const [state, setState] = useState('available');

  const toast = useToast();
  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canDelete = currentUser && currentUser.role === 'Fleet Manager';

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await driverService.getAll();
      setDrivers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching drivers.');
      toast.error('Failed to load safety driver roster.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDrivers();
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setLicenseNo('');
    setLicenseCategory('');
    setLicenseExpiry('');
    setContactNo('');
    setSafetyScore(100.0);
    setState('available');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingId(v.id);
    setName(v.name);
    setLicenseNo(v.licenseNo);
    setLicenseCategory(v.licenseCategory);
    setLicenseExpiry(v.licenseExpiry ? v.licenseExpiry.substring(0, 7) : '');
    setContactNo(v.contactNo);
    setSafetyScore(v.safetyScore);
    setState(v.state);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !licenseNo.trim() || !licenseCategory.trim()) {
      toast.warning('Name, license code, and category are required.');
      return;
    }

    const scoreNum = parseFloat(safetyScore);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      toast.warning('Safety Score must be a value between 0 and 100.');
      return;
    }

    if (!licenseExpiry) {
      toast.warning('Licence expiry date is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      licenseNo: licenseNo.trim().toUpperCase(),
      licenseCategory: licenseCategory.trim(),
      licenseExpiry: licenseExpiry.includes('-') ? licenseExpiry : `${licenseExpiry}-01`,
      contactNo: contactNo.trim(),
      safetyScore: scoreNum,
      state
    };

    try {
      setSaving(true);
      if (editingId) {
        await driverService.update(editingId, payload);
        toast.success('Driver Updated Successfully');
      } else {
        await driverService.create(payload);
        toast.success('Driver Added Successfully');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver details.');
      toast.error(err.response?.data?.message || 'Error occurred during save operations.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  // Check compliance locally for visual rendering (Year-Month based)
  const checkCompliance = (driver) => {
    const todayMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const expiryMonth = driver.licenseExpiry ? driver.licenseExpiry.substring(0, 7) : '';
    if (expiryMonth && expiryMonth < todayMonth) return false;
    if (driver.state === 'suspended' || driver.state === 'off_duty') return false;
    return true;
  };

  const columns = [
    { header: 'Name', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'License No', key: 'licenseNo', render: (row) => <code className="text-indigo-650 dark:text-indigo-400 font-mono">{row.licenseNo}</code> },
    { header: 'Category', key: 'licenseCategory' },
    { 
      header: 'Expiry Date', 
      key: 'licenseExpiry', 
      render: (row) => {
        const expiryMonth = row.licenseExpiry ? row.licenseExpiry.substring(0, 7) : '';
        const todayMonth = new Date().toISOString().substring(0, 7);
        const isExpired = expiryMonth && expiryMonth < todayMonth;
        return <span className={isExpired ? 'text-rose-650 dark:text-red-400 font-semibold' : ''}>{expiryMonth}</span>;
      }
    },
    { header: 'Contact No', key: 'contactNo' },
    { 
      header: 'Safety Score', 
      key: 'safetyScore', 
      render: (row) => {
        const score = parseFloat(row.safetyScore || 0);
        let color = 'text-emerald-400';
        if (score < 70) color = 'text-rose-400';
        else if (score < 90) color = 'text-amber-400';
        return <span className={`font-bold ${color}`}>{score.toFixed(1)}/100</span>;
      }
    },
    { 
      header: 'Compliance', 
      key: 'compliance', 
      render: (row) => {
        const compliant = checkCompliance(row);
        return compliant ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">
            Compliant
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/30">
            <AlertTriangle className="h-3 w-3" /> Non-Compliant
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => {
        const statusColors = {
          available: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
          on_trip: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
          off_duty: 'bg-slate-100 dark:bg-slate-850/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/30',
          suspended: 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/30'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${statusColors[row.state] || 'bg-slate-100 dark:bg-slate-800'}`}>
            {row.state.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-350 dark:hover:border-slate-600 transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 hover:text-red-655 dark:hover:text-red-400 border border-slate-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-950/30 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Compute filtered array
  const filteredDrivers = drivers.filter(d => {
    const matchesCategory = filterCategory === 'All' || d.licenseCategory === filterCategory;
    const matchesStatus = filterStatus === 'All' || d.state === filterStatus;
    const compliant = checkCompliance(d);
    const matchesCompliance = filterCompliance === 'All' || 
      (filterCompliance === 'Compliant' && compliant) || 
      (filterCompliance === 'Non-Compliant' && !compliant);
    
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.licenseNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesCompliance && matchesSearch;
  });

  return (
    <div className="space-y-6 text-left">
      
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Drivers Registry</h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mt-1">Manage driver compliance, safety metrics, and roster dispatches (Indian Localized)</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-205 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-slate-800' 
                  : 'text-slate-450 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-slate-800' 
                  : 'text-slate-455 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {canEdit && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 hover:scale-[1.02] shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
            >
              <Plus className="h-4 w-4" /> Add Driver
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters & Search Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filters:</span>
          
          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:outline-none transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="HGV">HGV (Heavy Goods)</option>
              <option value="LMV">LMV (Light Motor)</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">Status</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:outline-none transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">Compliance</span>
            <select
              value={filterCompliance}
              onChange={(e) => setFilterCompliance(e.target.value)}
              className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:outline-none transition-colors"
            >
              <option value="All">All Compliance</option>
              <option value="Compliant">Compliant Only</option>
              <option value="Non-Compliant">Non-Compliant Only</option>
            </select>
          </div>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or license..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:outline-none transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Main Content (Table or Grid Cards) */}
      {loading ? (
        <Loader />
      ) : viewMode === 'list' ? (
        <DataTable 
          columns={columns} 
          data={filteredDrivers} 
          loading={loading} 
          emptyText="No drivers match search criteria." 
          onRowClick={(row) => {
            setSelectedDriver(row);
            setDrawerOpen(true);
          }}
        />
      ) : (
        /* Driver Roster Cards Grid */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3 text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6">
              <span className="text-xs text-slate-500 font-medium">No drivers match search criteria.</span>
            </div>
          ) : (
            filteredDrivers.map(d => {
              const compliant = checkCompliance(d);
              const initials = d.name.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2);
              
              return (
                <div 
                  key={d.id} 
                  onClick={() => {
                    setSelectedDriver(d);
                    setDrawerOpen(true);
                  }}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-5 hover:border-brand-300 dark:hover:border-brand-900/40 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      {/* Avatar initials with compliance colored border */}
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-black text-xs border ${
                        compliant 
                          ? 'bg-emerald-500/10 border-emerald-300 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-300 text-rose-600 dark:text-rose-400'
                      }`}>
                        {initials}
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border ${
                          d.state === 'available' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/20' 
                            : d.state === 'on_trip'
                              ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-450 border-amber-250 dark:border-amber-900/20'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}>
                          {d.state.replace('_', ' ')}
                        </span>
                        
                        {!compliant && (
                          <span className="text-[9px] text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-900/30">
                            Compliance Alert
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-brand-655 dark:group-hover:text-brand-400 transition-colors">
                      {d.name}
                    </h4>
                    
                    <div className="mt-3 space-y-1.5 text-[11px] text-slate-500 font-semibold">
                      <div className="flex justify-between">
                        <span>License:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">{d.licenseNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License Expiry:</span>
                        <span className={!compliant ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {d.licenseExpiry ? d.licenseExpiry.substring(0, 7) : 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contact:</span>
                        <span className="text-slate-700 dark:text-slate-300">{d.contactNo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block text-left">Safety Index</span>
                      <span className={`text-xs font-black block mt-0.5 ${
                        parseFloat(d.safetyScore || 0) >= 90 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {parseFloat(d.safetyScore || 0).toFixed(1)}/100
                      </span>
                    </div>

                    {/* Actions button list */}
                    <div className="flex gap-2">
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(d);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-805 hover:bg-brand-500 dark:hover:bg-brand-600 hover:text-white text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-transparent transition-all"
                          title="Edit Driver"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(d.id);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-805 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-slate-400 border border-slate-205 dark:border-slate-700 hover:border-transparent transition-all"
                          title="Delete Driver"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* Driver Drawer */}
      <DriverDrawer 
        driver={selectedDriver} 
        isOpen={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDriver(null);
        }} 
      />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white">
                {editingId ? 'Edit Driver Details' : 'Register New Driver'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-650 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. Rajesh Kumar"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License Number</label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. MH-14-2023-1234567"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">License Category</label>
                  <input
                    type="text"
                    required
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. LMV / HGV"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider">License Expiry Month/Year</label>
                  <input
                    type="month"
                    required
                    value={licenseExpiry}
                    onChange={(e) => setLicenseExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact No.</label>
                  <input
                    type="text"
                    value={contactNo}
                    onChange={(e) => setContactNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Safety Score</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={safetyScore}
                    onChange={(e) => setSafetyScore(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="off_duty">Off Duty</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                >
                  {saving && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Driver Profile?</h3>
            <p className="text-xs text-slate-505 mb-6 leading-relaxed">
              Are you sure you want to remove this driver profile from the active safety registry? This action will archive their past dispatches.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    setDeleting(true);
                    await driverService.delete(deleteConfirmId);
                    setDeleteConfirmId(null);
                    fetchDrivers();
                    toast.success('Driver Profile Deleted Successfully');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete driver.');
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                {deleting && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
