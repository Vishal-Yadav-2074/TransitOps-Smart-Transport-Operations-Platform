import React, { useEffect, useState } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, X, Fuel } from 'lucide-react';

export default function FuelExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [expenseType, setExpenseType] = useState('fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Financial Analyst'].includes(currentUser.role);

  const fetchData = async () => {
    try {
      setLoading(true);
      const expData = await vehicleService.getAllExpenses();
      setExpenses(expData.data);

      const vehicleData = await vehicleService.getAll();
      setVehicles(vehicleData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching expense logs.');
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
    setExpenseType('fuel');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      name,
      vehicleId: parseInt(vehicleId),
      expenseType,
      amount: parseFloat(amount),
      date
    };

    try {
      await vehicleService.createExpense(payload);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log expense.');
    }
  };

  const columns = [
    { header: 'Description', key: 'name', render: (row) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span> },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-500 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { 
      header: 'Category', 
      key: 'expenseType', 
      render: (row) => {
        const badgeColors = {
          fuel: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
          toll: 'bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
          other: 'bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/30'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border capitalize ${badgeColors[row.expenseType] || 'bg-slate-100 dark:bg-slate-850'}`}>
            {row.expenseType}
          </span>
        );
      }
    },
    { header: 'Amount Logged', key: 'amount', render: (row) => <span>₹{parseFloat(row.amount).toFixed(2)}</span> },
    { header: 'Transaction Date', key: 'date' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Expenses Ledger</h2>
          <p className="text-xs font-medium text-slate-505 dark:text-slate-400 mt-1">Track fuel, tolls, and operating costs across all fleet assets (Indian Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        )}
      </div>

      {/* Grid Table */}
      <DataTable columns={columns} data={expenses} loading={loading} emptyText="No expenses logged yet." />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Vehicle Expense</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-55 dark:bg-red-955/40 border border-red-200 dark:border-red-900/50 p-3 text-xs text-red-650 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  placeholder="e.g. Fuel Refill - IndianOil Station"
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
                        {v.name} ({v.registrationNo})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expense Type</label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="toll">Toll</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-505 dark:text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 8000"
                  />
                </div>
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
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
