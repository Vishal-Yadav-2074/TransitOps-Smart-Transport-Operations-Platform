import React, { useEffect, useState, useMemo, useCallback } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import VehicleDrawer from '../components/VehicleDrawer';
import { useToast } from '../contexts/ToastContext';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const toast = useToast();
  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Financial Analyst'].includes(currentUser.role);
  const canDelete = currentUser && currentUser.role === 'Fleet Manager';

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vehicleService.getAll();
      setVehicles(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching vehicle list.');
      toast.error('Failed to load fleet assets.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVehicles();
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchVehicles]);

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

    // Validation testing (Phase 5)
    if (!name.trim() || !registrationNo.trim()) {
      toast.warning('Registration number and name are required.');
      return;
    }

    const regPattern = /^[A-Z0-9\-\s]{4,15}$/i;
    if (!regPattern.test(registrationNo)) {
      toast.warning('Invalid Registration Number format. Use alphanumeric codes.');
      return;
    }

    const capacityNum = parseFloat(maxCapacity);
    const odometerNum = parseFloat(odometer);
    const costNum = parseFloat(acquisitionCost);

    if (isNaN(capacityNum) || capacityNum <= 0) {
      toast.warning('Maximum Capacity must be a positive number.');
      return;
    }

    if (isNaN(odometerNum) || odometerNum < 0) {
      toast.warning('Odometer reading cannot be negative.');
      return;
    }

    if (isNaN(costNum) || costNum <= 0) {
      toast.warning('Acquisition cost must be a positive number.');
      return;
    }

    const payload = {
      name: name.trim(),
      registrationNo: registrationNo.trim().toUpperCase(),
      vehicleType,
      maxCapacity: capacityNum,
      odometer: odometerNum,
      acquisitionCost: costNum,
      state
    };

    try {
      setSaving(true);
      if (editingId) {
        await vehicleService.update(editingId, payload);
        toast.success('Vehicle Updated Successfully');
      } else {
        await vehicleService.create(payload);
        toast.success('Vehicle Added Successfully');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle details.');
      toast.error(err.response?.data?.message || 'Validation error while saving asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await vehicleService.delete(deleteConfirmId);
      toast.success('Vehicle Deleted Successfully');
      setDeleteConfirmId(null);
      fetchVehicles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle.');
    } finally {
      setDeleting(false);
    }
  };

  // Compute filtered array with useMemo (Phase 14 Optimization)
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesType = filterType === 'All' || v.vehicleType === filterType;
      const matchesStatus = filterStatus === 'All' || v.state === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [vehicles, filterType, filterStatus]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = useMemo(() => [
    { header: 'Vehicle Asset', key: 'name', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'RTO License No', key: 'registrationNo', render: (row) => <code className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{row.registrationNo}</code> },
    { header: 'Class/Type', key: 'vehicleType', render: (row) => <span className="capitalize">{row.vehicleType}</span> },
    { header: 'Payload Limit', key: 'maxCapacity', render: (row) => <span>{(row.maxCapacity || 0).toLocaleString('en-IN')} kg</span> },
    { header: 'Odometer Mileage', key: 'odometer', render: (row) => <span>{(row.odometer || 0).toLocaleString('en-IN')} km</span> },
    { 
      header: 'Capital Cost', 
      key: 'acquisitionCost', 
      render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(row.acquisitionCost)}</span> 
    },
    { 
      header: 'ROI Yield', 
      key: 'roi', 
      render: (row) => {
        const val = parseFloat(row.vehicleRoi || 0) * 100;
        const color = val >= 0 ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450';
        return <span className={`font-black ${color}`}>{val.toFixed(2)}%</span>;
      }
    },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => {
        let badgeColor = 'text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30';
        if (row.state === 'on_trip') badgeColor = 'text-amber-600 dark:text-amber-450 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30';
        else if (row.state === 'in_shop') badgeColor = 'text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-955/20 border-rose-250 dark:border-rose-900/30';
        else if (row.state === 'retired') badgeColor = 'text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
        return (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-xl border ${badgeColor}`}>
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
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-950/30 transition-colors"
              title="Edit Details"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteConfirmId(row.id)}
              className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 hover:text-red-655 dark:hover:text-red-400 border border-slate-205 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-950/30 transition-colors"
              title="Delete File"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )
    }
  ], [canEdit, canDelete]);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Fleet Inventory</h2>
          <p className="text-xs font-semibold text-slate-505 dark:text-slate-450 mt-1">Manage fleet capacities and ROI configurations (INR Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl backdrop-blur-md">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filters:</span>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-semibold text-slate-505 dark:text-slate-405">Type</span>
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
          <span className="text-xs font-semibold text-slate-505 dark:text-slate-405">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:border-indigo-650 focus:outline-none transition-colors"
          >
            <option value="All">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_trip">On Trip</option>
            <option value="in_shop">In Shop</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable 
        columns={columns} 
        data={filteredVehicles} 
        loading={loading} 
        emptyText="No vehicles match search criteria." 
        onRowClick={(row) => {
          setSelectedVehicle(row);
          setDrawerOpen(true);
        }}
      />

      {/* Vehicle details Drawer */}
      <VehicleDrawer 
        vehicle={selectedVehicle} 
        isOpen={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setSelectedVehicle(null);
        }} 
      />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-slide-up text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingId ? 'Edit Vehicle Profile' : 'Register Vehicle Asset'}
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
                <div className="rounded-lg bg-red-50 dark:bg-red-955/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-650 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. Heavy Carrier B-9"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">RTO Registration Plate</label>
                  <input
                    type="text"
                    required
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none uppercase"
                    placeholder="e.g. MH-12-PQ-9988"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Class</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="truck">Truck</option>
                    <option value="pickup">Pickup</option>
                    <option value="van">Van</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Asset State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="on_trip">On Trip</option>
                    <option value="in_shop">In Shop (Maintenance Lock)</option>
                    <option value="retired">Retired (Decommissioned)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity Limit (kg)</label>
                  <input
                    type="number"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Odometer (km)</label>
                  <input
                    type="number"
                    required
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 15000"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 1200000"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all animate-scale-up"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 transition-all shadow-md flex items-center gap-1.5"
                >
                  {saving && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Vehicle Asset?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to remove this vehicle asset from the active command inventory? All telemetry logs and margins will be archived.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                {deleting && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                Archive Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
