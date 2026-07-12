import React, { useEffect, useState } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Check, X, Wrench, CheckSquare, Trash2 } from 'lucide-react';

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [state, setState] = useState('open');

  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canDelete = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const maintData = await vehicleService.getAllMaintenances();
      setMaintenances(maintData.data);

      const vehicleData = await vehicleService.getAll();
      setVehicles(vehicleData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching maintenance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setName('');
    setVehicleId('');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setState('open');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      vehicleId: parseInt(vehicleId),
      cost: parseFloat(cost),
      date,
      state
    };

    try {
      await vehicleService.createMaintenance(payload);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance.');
    }
  };

  const handleCloseMaintenance = async (maint) => {
    try {
      await vehicleService.updateMaintenance(maint.id, {
        ...maint,
        state: 'closed'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close maintenance record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await vehicleService.deleteMaintenance(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const columns = [
    { header: 'Reference/Description', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-500 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { header: 'Repairs Cost', key: 'cost', render: (row) => <span>₹{parseFloat(row.cost).toFixed(2)}</span> },
    { header: 'Date', key: 'date' },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${
          row.state === 'open' 
            ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' 
            : 'bg-emerald-50 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
        }`}>
          {row.state}
        </span>
      )
    },
    {
      header: 'Workflow',
      key: 'actions',
      render: (row) => (
        <div className="flex gap-2">
          {row.state === 'open' && canEdit && (
            <button
              onClick={() => handleCloseMaintenance(row)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-650 hover:bg-emerald-600 text-white shadow-sm transition-all"
            >
              <CheckSquare className="h-3 w-3" /> Mark Completed
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDelete(row.id)}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-655 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-950/30 transition-colors"
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
      
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workshop &amp; Repairs</h2>
          <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-1">Manage workshop repairs and trigger vehicle shop locks (Indian Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Log Repair
          </button>
        )}
      </div>

      {/* Grid Table */}
      <DataTable columns={columns} data={maintenances} loading={loading} emptyText="No maintenance logs found." />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Vehicle Repairs</h3>
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

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description/Reference</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  placeholder="e.g. Engine Oil &amp; Filter replacement"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.registrationNo}) [Status: {v.state}]
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Repairs Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Initial Status</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="open">Open (Locks Vehicle in Shop)</option>
                    <option value="closed">Closed (Available)</option>
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
                  Log Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
