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
      const data = await vehicleService.getAll();
      setVehicles(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setName('');
    setRegistrationNo('');
    setVehicleType('van');
    setMaxCapacity('');
    setOdometer('0');
    setAcquisitionCost('');
    setState('available');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setEditingId(vehicle.id);
    setName(vehicle.name);
    setRegistrationNo(vehicle.registrationNo);
    setVehicleType(vehicle.vehicleType);
    setMaxCapacity(vehicle.maxCapacity);
    setOdometer(vehicle.odometer);
    setAcquisitionCost(vehicle.acquisitionCost);
    setState(vehicle.state);
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
      } else {
        await vehicleService.create(payload);
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  const columns = [
    { header: 'Vehicle', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Registration', key: 'registrationNo', render: (row) => <code className="text-indigo-600 dark:text-indigo-400 font-mono">{row.registrationNo}</code> },
    { header: 'Type', key: 'vehicleType', render: (row) => <span className="capitalize">{row.vehicleType}</span> },
    { header: 'Max Capacity (kg)', key: 'maxCapacity' },
    { header: 'Odometer (km)', key: 'odometer' },
    { 
      header: 'Operational Cost', 
      key: 'operationalCost', 
      render: (row) => <span>₹{parseFloat(row.operationalCost || 0).toFixed(2)}</span>
    },
    { 
      header: 'ROI', 
      key: 'vehicleRoi', 
      render: (row) => {
        const roi = parseFloat(row.vehicleRoi || 0) * 100;
        return (
          <span className={`font-bold ${roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {roi.toFixed(2)}%
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
          in_shop: 'bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 border-red-200 dark:border-red-900/30',
          retired: 'bg-slate-100 dark:bg-slate-850/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/30'
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Vehicles Registry</h2>
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

      {/* Main Table */}
      <DataTable columns={columns} data={vehicles} loading={loading} emptyText="No vehicles registered yet." />

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
    </div>
  );
}
