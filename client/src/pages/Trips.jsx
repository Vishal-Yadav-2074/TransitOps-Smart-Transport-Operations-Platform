import React, { useEffect, useState } from 'react';
import tripService from '../services/tripService';
import vehicleService from '../services/vehicleService';
import driverService from '../services/driverService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Check, Play, Ban, X } from 'lucide-react';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [source, setSource] = useState('');
  const [dest, setDest] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDist, setPlannedDist] = useState('');
  const [revenue, setRevenue] = useState('');

  const currentUser = authService.getCurrentUser();
  const canDispatch = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canComplete = currentUser && ['Fleet Manager', 'Driver'].includes(currentUser.role);
  const canCreate = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canCancel = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);

  const fetchData = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

    const payload = {
      source,
      dest,
      vehicleId: parseInt(vehicleId),
      driverId: parseInt(driverId),
      cargoWeight: parseFloat(cargoWeight),
      plannedDist: parseFloat(plannedDist),
      revenue: parseFloat(revenue || 0)
    };

    try {
      await tripService.create(payload);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch/save trip.');
    }
  };

  const handleDispatch = async (id) => {
    try {
      await tripService.dispatch(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch trip.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await tripService.complete(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete trip.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this trip?')) return;
    try {
      await tripService.cancel(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel trip.');
    }
  };

  const columns = [
    { header: 'Reference', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Route', key: 'route', render: (row) => <span className="text-slate-700 dark:text-slate-300 font-medium">{row.source} ➔ {row.dest}</span> },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-500 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { header: 'Driver', key: 'driver', render: (row) => <span>{row.Driver?.name}</span> },
    { header: 'Weight (kg)', key: 'cargoWeight' },
    { header: 'Distance (km)', key: 'plannedDist' },
    { header: 'Revenue', key: 'revenue', render: (row) => <span>₹{parseFloat(row.revenue).toFixed(2)}</span> },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => {
        const statusColors = {
          draft: 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/30',
          dispatched: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
          completed: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
          cancelled: 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/30'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${statusColors[row.state] || 'bg-slate-100 dark:bg-slate-850'}`}>
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
      <DataTable columns={columns} data={trips} loading={loading} emptyText="No trips dispatched yet." />

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
                      .filter(d => d.state === 'available')
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
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all"
                >
                  Confirm &amp; Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
