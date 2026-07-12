import React, { useEffect, useState } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  // Filters state
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form states
  const [name, setName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [vehicleType, setVehicleType] = useState('van');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [state, setState] = useState('available');

  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Financial Analyst'].includes(currentUser.role);
  const canDelete = currentUser && currentUser.role === 'Fleet Manager';

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehicleService.getAll();
      setVehicles(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching vehicle list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRegistrationNo('');
    setVehicleType('van');
    setMaxCapacity('');
    setOdometer('');
    setAcquisitionCost('');
    setState('available');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingId(v.id);
    setName(v.name);
    setRegistrationNo(v.registrationNo);
    setVehicleType(v.vehicleType);
    setMaxCapacity(v.maxCapacity);
    setOdometer(v.odometer);
    setAcquisitionCost(v.acquisitionCost);
    setState(v.state);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      registrationNo,
      vehicleType,
      maxCapacity: parseFloat(maxCapacity),
      odometer: parseFloat(odometer),
      acquisitionCost: parseFloat(acquisitionCost),
      state
    };

    try {
      if (editingId) {
        await vehicleService.update(editingId, payload);
        setToast('Vehicle Updated Successfully');
      } else {
        await vehicleService.create(payload);
        setToast('Vehicle Added Successfully');
      }
      setModalOpen(false);
      fetchVehicles();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle details.');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  // Compute filtered array
  const filteredVehicles = vehicles.filter(v => {
    const matchesType = filterType === 'All' || v.vehicleType === filterType;
    const matchesStatus = filterStatus === 'All' || v.state === filterStatus;
    return matchesType && matchesStatus;
  });

  const columns = [
    { header: 'Vehicle', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Registration No', key: 'registrationNo', render: (row) => <code className="text-indigo-650 dark:text-indigo-400 font-mono">{row.registrationNo}</code> },
    { header: 'Type', key: 'vehicleType', render: (row) => <span className="capitalize">{row.vehicleType}</span> },
    { header: 'Max Capacity (kg)', key: 'maxCapacity' },
    { header: 'Odometer (km)', key: 'odometer' },
    { 
      header: 'Operational Cost', 
      key: 'operationalCost', 
      render: (row) => <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(row.operationalCost || 0)}</span> 
    },
    { 
      header: 'Yield (ROI)', 
      key: 'vehicleRoi', 
      render: (row) => {
        const val = parseFloat(row.vehicleRoi || 0) * 100;
        const color = val >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-450';
        return <span className={`font-bold ${color}`}>{val.toFixed(2)}%</span>;
      }
    },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => {
        let badgeColor = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30';
        if (row.state === 'on_trip') badgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30';
        else if (row.state === 'in_shop') badgeColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 border-rose-250 dark:border-rose-900/30';
        return (
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border capitalize ${badgeColor}`}>
            {row.state === 'in_shop' ? 'In Shop' : row.state === 'on_trip' ? 'On Trip' : row.state}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => openEditModal(row)}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-505 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-950/30 transition-colors"
              title="Edit Details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1 rounded bg-slate-105 dark:bg-slate-800/80 text-slate-505 dark:text-slate-400 hover:text-red-655 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-950/30 transition-colors"
              title="Delete File"
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Fleet Inventory</h2>
          <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-1">Manage fleet capacities and ROI configurations (INR Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-md">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filters:</span>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-slate-505 dark:text-slate-400">Type</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-650 focus:outline-none transition-colors"
          >
            <option value="All">All Types</option>
            <option value="truck">Truck</option>
            <option value="pickup">Pickup</option>
            <option value="van">Van</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-slate-505 dark:text-slate-400">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-650 focus:outline-none transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable columns={columns} data={filteredVehicles} loading={loading} emptyText="No vehicles match search criteria." />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-905 dark:text-white">
                {editingId ? 'Edit Vehicle Details' : 'Register New Vehicle'}
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
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model/Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. Tata Prima"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registration No.</label>
                  <input
                    type="text"
                    required
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. MH-12-GP-1234"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                  >
                    <option value="van">Van</option>
                    <option value="truck">Truck</option>
                    <option value="trailer">Trailer</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Max Capacity (kg)</label>
                  <input
                    type="number"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. 1500"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Odometer (km)</label>
                  <input
                    type="number"
                    required
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none transition-colors"
                    placeholder="e.g. 850000"
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
                    <option value="in_shop">In Shop</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Vehicle?</h3>
            <p className="text-xs text-slate-500 mb-6">Are you sure you want to remove this vehicle asset from the active command inventory? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await vehicleService.delete(deleteConfirmId);
                    setDeleteConfirmId(null);
                    fetchVehicles();
                    setToast('Vehicle Deleted Successfully');
                    setTimeout(() => setToast(null), 3000);
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to delete vehicle.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-500 text-xs font-semibold text-white shadow-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-250 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/80 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-lg backdrop-blur-md animate-slide-in">
          <span>✅</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
