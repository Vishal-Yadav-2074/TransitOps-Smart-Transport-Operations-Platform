import React, { useEffect, useState, useMemo, useCallback } from 'react';
import tripService from '../services/tripService';
import vehicleService from '../services/vehicleService';
import driverService from '../services/driverService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Check, Play, Ban, X, AlertTriangle } from 'lucide-react';
import TripDrawer from '../components/TripDrawer';
import { useToast } from '../contexts/ToastContext';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Form states
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDist, setPlannedDist] = useState('');
  const [revenue, setRevenue] = useState('');

  const toast = useToast();
  const currentUser = authService.getCurrentUser();
  const canCreate = currentUser && ['Fleet Manager', 'Dispatcher'].includes(currentUser.role);
  const canDispatch = currentUser && ['Fleet Manager', 'Dispatcher'].includes(currentUser.role);
  const canComplete = currentUser && ['Fleet Manager', 'Dispatcher'].includes(currentUser.role);
  const canCancel = currentUser && ['Fleet Manager', 'Dispatcher'].includes(currentUser.role);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getAll();
      setTrips(tripData.data);

      const vehicleData = await vehicleService.getAll();
      // Filter available vehicles for selection
      setVehicles(vehicleData.data);

      const driverData = await driverService.getAll();
      // Filter available drivers for selection
      setDrivers(driverData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching trips data.');
      toast.error('Failed to load active dispatches.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
    const params = new URLSearchParams(window.location.search);
    if (params.get('add') === 'true') {
      setModalOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchData]);

  const openAddModal = () => {
    setSource('');
    setDest('');
    setVehicleId('');
    setDriverId('');
    setCargoWeight('');
    setPlannedDist('');
    setRevenue('');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!source.trim() || !dest.trim() || !vehicleId || !driverId) {
      toast.warning('All route fields, vehicle, and driver assignments are required.');
      return;
    }

    const distNum = parseFloat(plannedDist);
    const revNum = parseFloat(revenue);
    const cargoNum = parseFloat(cargoWeight);

    if (isNaN(distNum) || distNum <= 0) {
      toast.warning('Planned distance must be a positive number.');
      return;
    }

    if (isNaN(revNum) || revNum < 0) {
      toast.warning('Trip revenue cannot be negative.');
      return;
    }

    if (isNaN(cargoNum) || cargoNum <= 0) {
      toast.warning('Cargo load weight must be a positive number.');
      return;
    }

    const selectedVehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (selectedVehicle && cargoNum > parseFloat(selectedVehicle.maxCapacity)) {
      toast.error(`Blocked: Cargo weight (${cargoNum} kg) exceeds vehicle's maximum payload limit (${selectedVehicle.maxCapacity} kg).`);
      return;
    }

    const selectedDriver = drivers.find(d => d.id === parseInt(driverId));
    if (selectedDriver) {
      const todayMonth = new Date().toISOString().substring(0, 7);
      const expiryMonth = selectedDriver.licenseExpiry ? selectedDriver.licenseExpiry.substring(0, 7) : '';
      if (expiryMonth && expiryMonth < todayMonth) {
        toast.error(`Blocked: Driver license is expired (${expiryMonth}). Dispatch forbidden.`);
        return;
      }
      if (selectedDriver.state === 'suspended') {
        toast.error('Blocked: Driver profile is suspended. Dispatch forbidden.');
        return;
      }
    }

    const payload = {
      source: source.trim(),
      dest: dest.trim(),
      vehicleId: parseInt(vehicleId),
      driverId: parseInt(driverId),
      cargoWeight: cargoNum,
      plannedDist: distNum,
      revenue: revNum
    };

    try {
      setSaving(true);
      await tripService.create(payload);
      toast.success('Trip Booked Successfully');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch/save trip.');
      toast.error(err.response?.data?.message || 'Validation error while booking dispatch.');
    } finally {
      setSaving(false);
    }
  };

  const handleDispatch = async (id) => {
    try {
      await tripService.dispatch(id);
      toast.success('Trip Dispatched successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch trip.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await tripService.complete(id);
      toast.success('Trip Completed successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete trip.');
    }
  };

  const handleCancel = (id) => {
    setCancelConfirmId(id);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = [
    { header: 'Reference', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Route', key: 'route', render: (row) => <span className="text-slate-700 dark:text-slate-300 font-medium">{row.source} ➔ {row.dest}</span> },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-500 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { header: 'Driver', key: 'driver', render: (row) => <span>{row.Driver?.name}</span> },
    { header: 'Weight (kg)', key: 'cargoWeight' },
    { header: 'Distance (km)', key: 'plannedDist' },
    { header: 'Revenue', key: 'revenue', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(row.revenue)}</span> },
    { 
      header: 'Telemetry Track', 
      key: 'track', 
      render: (row) => {
        if (row.state === 'cancelled') {
          return <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Cancelled</span>;
        }
        const stateIndex = {
          draft: 1,
          dispatched: 2,
          completed: 3
        }[row.state] || 1;

        return (
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-5 rounded-full transition-colors ${stateIndex >= 1 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} title="Booked" />
            <span className={`h-1.5 w-5 rounded-full transition-colors ${stateIndex >= 2 ? (stateIndex === 2 ? 'bg-amber-500 animate-pulse' : 'bg-amber-500') : 'bg-slate-200 dark:bg-slate-800'}`} title="In Transit" />
            <span className={`h-1.5 w-5 rounded-full transition-colors ${stateIndex >= 3 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} title="Completed" />
          </div>
        );
      }
    },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => {
        const statusColors = {
          draft: 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/30',
          dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-450 border-amber-250 dark:border-amber-900/30',
          completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30',
          cancelled: 'bg-red-50 dark:bg-red-950/40 text-red-655 dark:text-red-400 border-red-250 dark:border-red-900/30'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${statusColors[row.state] || 'bg-slate-105'}`}>
            {row.state}
          </span>
        );
      }
    },
    {
      header: 'Workflow Control',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.state === 'draft' && canDispatch && (
            <button
              onClick={() => handleDispatch(row.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
            >
              <Play className="h-3 w-3" /> Dispatch
            </button>
          )}
          {row.state === 'dispatched' && canComplete && (
            <button
              onClick={() => handleComplete(row.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <Check className="h-3 w-3" /> Complete
            </button>
          )}
          {row.state !== 'completed' && row.state !== 'cancelled' && canCancel && (
            <button
              onClick={() => handleCancel(row.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all"
            >
              <Ban className="h-3 w-3" /> Cancel
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Trips Dispatcher</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Dispatch and monitor trips with weight &amp; license safety gates (Indian Localized)</p>
        </div>
        {canCreate && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Book Trip
          </button>
        )}
      </div>

      {/* Grid Table */}
      <DataTable 
        columns={columns} 
        data={trips} 
        loading={loading} 
        emptyText="No trips dispatched yet." 
        onRowClick={(row) => {
          setSelectedTrip(row);
          setDrawerOpen(true);
        }}
      />

      {/* Trip Details Drawer */}
      <TripDrawer 
        trip={selectedTrip} 
        isOpen={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTrip(null);
        }} 
      />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Book New Trip</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</label>
                  <input
                    type="text"
                    required
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                    placeholder="e.g. Mumbai, MH"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination</label>
                  <input
                    type="text"
                    required
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                    placeholder="e.g. Pune, MH"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assign Vehicle</label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="">-- Select Available Vehicle --</option>
                    {vehicles
                      .filter(v => v.state === 'available')
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.registrationNo}) [Max: {v.maxCapacity}kg]
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assign Driver</label>
                  <select
                    required
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="">-- Select Available Driver --</option>
                    {drivers
                      .filter(d => {
                        const todayMonth = new Date().toISOString().substring(0, 7);
                        const expiryMonth = d.licenseExpiry ? d.licenseExpiry.substring(0, 7) : '';
                        return d.state === 'available' && expiryMonth >= todayMonth;
                      })
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} (Score: {d.safetyScore}/100)
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                    placeholder="e.g. 1200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Planned Distance (km)</label>
                  <input
                    type="number"
                    required
                    value={plannedDist}
                    onChange={(e) => setPlannedDist(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                    placeholder="e.g. 350"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trip Revenue (₹)</label>
                  <input
                    type="number"
                    required
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-600 focus:outline-none"
                    placeholder="e.g. 15000"
                  />
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
                  disabled={saving}
                  className="rounded-xl bg-indigo-650 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all flex items-center gap-1.5"
                >
                  {saving && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                  Confirm &amp; Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}      {cancelConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Cancel Dispatch Trip?</h3>
            <p className="text-xs text-slate-505 mb-6 leading-relaxed">
              Are you sure you want to cancel this scheduled trip dispatch? This will release the assigned driver and vehicle assets.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-800 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={async () => {
                  try {
                    setCancelling(true);
                    await tripService.cancel(cancelConfirmId);
                    setCancelConfirmId(null);
                    fetchData();
                    toast.success('Trip Cancelled Successfully');
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to cancel trip.');
                  } finally {
                    setCancelling(false);
                  }
                }}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                {cancelling && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                Cancel Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
