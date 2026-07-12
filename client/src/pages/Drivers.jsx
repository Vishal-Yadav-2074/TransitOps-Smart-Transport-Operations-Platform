import React, { useEffect, useState } from 'react';
import driverService from '../services/driverService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [safetyScore, setSafetyScore] = useState(100.0);
  const [state, setState] = useState('available');

  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canDelete = currentUser && currentUser.role === 'Fleet Manager';

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const data = await driverService.getAll();
      setDrivers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching drivers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
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

  const openEditModal = (driver) => {
    setEditingId(driver.id);
    setName(driver.name);
    setLicenseNo(driver.licenseNo);
    setLicenseCategory(driver.licenseCategory);
    setLicenseExpiry(driver.licenseExpiry ? driver.licenseExpiry.substring(0, 7) : '');
    setContactNo(driver.contactNo || '');
    setSafetyScore(driver.safetyScore);
    setState(driver.state);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      licenseNo,
      licenseCategory,
      licenseExpiry: licenseExpiry.length === 7 ? `${licenseExpiry}-01` : licenseExpiry,
      contactNo,
      safetyScore: parseFloat(safetyScore),
      state
    };

    try {
      if (editingId) {
        await driverService.update(editingId, payload);
      } else {
        await driverService.create(payload);
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await driverService.delete(id);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete driver.');
    }
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

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Drivers Registry</h2>
          <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-1">Manage driver files, safety metrics, and compliance statuses (Indian Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        )}
      </div>

      {/* Table */}
      <DataTable columns={columns} data={drivers} loading={loading} emptyText="No drivers registered yet." />

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
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Save Driver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
