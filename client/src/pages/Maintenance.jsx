import React, { useEffect, useState, useCallback, useMemo } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, Check, X, Wrench, CheckSquare, Trash2, AlertTriangle } from 'lucide-react';
import MaintDrawer from '../components/MaintDrawer';
import { useToast } from '../contexts/ToastContext';

export default function Maintenance() {
  const [maintenances, setMaintenances] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [state, setState] = useState('open');
  const [priority, setPriority] = useState('Medium');
  const [mechanic, setMechanic] = useState('');
  const [partsCost, setPartsCost] = useState('');
  const [downtime, setDowntime] = useState('');

  // Drawer states
  const [selectedMaint, setSelectedMaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Confirmations
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [closeConfirmMaint, setCloseConfirmMaint] = useState(null);

  const toast = useToast();
  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);
  const canDelete = currentUser && ['Fleet Manager', 'Safety Officer'].includes(currentUser.role);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const maintData = await vehicleService.getAllMaintenances();
      setMaintenances(maintData.data);

      const vehicleData = await vehicleService.getAll();
      setVehicles(vehicleData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching maintenance records.');
      toast.error('Failed to load workshop ledger.');
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
    setName('');
    setVehicleId('');
    setCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setState('open');
    setPriority('Medium');
    setMechanic('');
    setPartsCost('');
    setDowntime('');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !vehicleId) {
      toast.warning('Job description and vehicle asset selection are required.');
      return;
    }

    const totalCostNum = parseFloat(cost);
    const partsCostNum = parseFloat(partsCost);
    const downtimeNum = parseFloat(downtime);

    if (isNaN(totalCostNum) || totalCostNum < 0) {
      toast.warning('Total repair billing cannot be a negative value.');
      return;
    }

    if (isNaN(partsCostNum) || partsCostNum < 0) {
      toast.warning('Parts portion cost cannot be negative.');
      return;
    }

    if (isNaN(downtimeNum) || downtimeNum < 0) {
      toast.warning('Estimated downtime hours cannot be negative.');
      return;
    }

    // Serialize extra fields into description
    const serializedName = `${name.trim()} [Priority: ${priority}, Mechanic: ${mechanic.trim() || 'Unassigned'}, PartsCost: ${partsCostNum}, Downtime: ${downtimeNum}]`;

    const payload = {
      name: serializedName,
      vehicleId: parseInt(vehicleId),
      cost: totalCostNum,
      date,
      state
    };

    try {
      setSaving(true);
      await vehicleService.createMaintenance(payload);
      toast.success('Maintenance Job Logged successfully');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log maintenance.');
      toast.error(err.response?.data?.message || 'Error occurred logging repairs.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseMaintenance = async (maint) => {
    try {
      setClosing(true);
      await vehicleService.updateMaintenance(maint.id, {
        ...maint,
        state: 'closed'
      });
      toast.success('Maintenance record completed. Vehicle released to Available status.');
      setCloseConfirmMaint(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close maintenance record.');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await vehicleService.deleteMaintenance(deleteConfirmId);
      toast.success('Maintenance Log archived successfully.');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.');
    } finally {
      setDeleting(false);
    }
  };

  // Parser helper for the columns
  const parseMaintDesc = (desc) => {
    const defaultData = {
      description: desc || '',
      priority: 'Medium',
      mechanic: 'Unassigned',
      partsCost: 0,
      downtime: 0
    };
    if (!desc) return defaultData;
    const match = desc.match(/(.*)\[Priority:\s*([^,]+),\s*Mechanic:\s*([^,]+),\s*PartsCost:\s*(\d+),\s*Downtime:\s*(\d+)\]/);
    if (match) {
      return {
        description: match[1].trim(),
        priority: match[2].trim(),
        mechanic: match[3].trim(),
        partsCost: parseFloat(match[4]),
        downtime: parseFloat(match[5])
      };
    }
    return defaultData;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = useMemo(() => [
    { 
      header: 'Reference/Description', 
      key: 'name', 
      render: (row) => {
        const parsed = parseMaintDesc(row.name);
        return <span className="font-semibold text-slate-900 dark:text-white">{parsed.description}</span>;
      } 
    },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-500 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { 
      header: 'Priority', 
      key: 'priority', 
      render: (row) => {
        const parsed = parseMaintDesc(row.name);
        const pColors = {
          high: 'bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-450 border-rose-200 dark:border-rose-900/30',
          medium: 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 border-amber-250 dark:border-amber-900/30',
          low: 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
        };
        const p = parsed.priority.toLowerCase();
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border capitalize ${pColors[p] || pColors.medium}`}>
            {parsed.priority}
          </span>
        );
      }
    },
    { header: 'Total Repairs Cost', key: 'cost', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(row.cost)}</span> },
    { header: 'Date', key: 'date' },
    { 
      header: 'Status', 
      key: 'state', 
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${
          row.state === 'open' 
            ? 'bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30' 
            : 'bg-emerald-50 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-455 border-emerald-200 dark:border-emerald-900/30'
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
              onClick={() => setCloseConfirmMaint(row)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-emerald-650 hover:bg-emerald-600 text-white shadow-sm transition-all"
            >
              <CheckSquare className="h-3 w-3" /> Mark Completed
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setDeleteConfirmId(row.id)}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-red-655 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-950/30 transition-colors"
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
      
      {/* Title section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Workshop &amp; Repairs</h2>
          <p className="text-xs font-semibold text-slate-505 dark:text-slate-450 mt-1">Manage workshop repairs and trigger vehicle shop locks (Indian Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Log Repair
          </button>
        )}
      </div>

      {/* Grid Table */}
      <DataTable 
        columns={columns} 
        data={maintenances} 
        loading={loading} 
        emptyText="No maintenance logs found." 
        onRowClick={(row) => {
          setSelectedMaint(row);
          setDrawerOpen(true);
        }}
      />

      {/* Maintenance details drawer */}
      <MaintDrawer 
        maintenance={selectedMaint} 
        isOpen={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setSelectedMaint(null);
        }} 
      />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-slide-up text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Log Vehicle Repairs</h3>
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
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description / Job Reference</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  placeholder="e.g. Engine Oil &amp; Filter replacement"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle Lockout</label>
                  <select
                    required
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="">-- Select Vehicle --</option>
                    {vehicles
                      .filter(v => v.state !== 'retired')
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.registrationNo}) [Status: {v.state}]
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Repairs Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Authorized Workshop</label>
                  <select
                    required
                    value={mechanic}
                    onChange={(e) => setMechanic(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="">-- Select Indian Service Hub --</option>
                    <option value="Tata Authorized Service Center">Tata Authorized Service Center</option>
                    <option value="Ashok Leyland Workshop">Ashok Leyland Workshop</option>
                    <option value="Mahindra Service Hub">Mahindra Service Hub</option>
                    <option value="BharatBenz Workshop">BharatBenz Workshop</option>
                    <option value="JK Tyre Center">JK Tyre Center</option>
                    <option value="MRF Truck Care">MRF Truck Care</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Downtime Estimate (Hours)</label>
                  <input
                    type="number"
                    required
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="Hours out of roster"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Replacement Parts Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={partsCost}
                    onChange={(e) => setPartsCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="Parts cost portion"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total repairs Billing (₹)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="Total invoice cost"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Initial Status</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
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
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 transition-all shadow-md flex items-center gap-1.5 animate-scale-up"
                >
                  {saving && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                  Log Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Completed Confirmation Modal */}
      {closeConfirmMaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Close Maintenance?</h3>
            <p className="text-xs text-slate-505 mb-6 leading-relaxed">
              Are you sure you want to mark this maintenance record as completed? This will release the vehicle lockout and return the asset to Available status.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCloseConfirmMaint(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-850 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => handleCloseMaintenance(closeConfirmMaint)}
                disabled={closing}
                className="px-4 py-2 rounded-xl bg-emerald-650 hover:bg-emerald-600 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                {closing && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                Complete Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl animate-scale-up text-left">
            <div className="h-10 w-10 bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Archive Maintenance Log?</h3>
            <p className="text-xs text-slate-505 mb-6 leading-relaxed">
              Are you sure you want to archive this maintenance log? This will delete the billing ledger entry associated with the vehicle.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-55 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-650 hover:bg-red-500 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-1.5"
              >
                {deleting && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
                Archive Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
