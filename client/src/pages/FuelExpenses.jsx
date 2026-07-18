import React, { useEffect, useState, useCallback, useMemo } from 'react';
import vehicleService from '../services/vehicleService';
import authService from '../services/authService';
import DataTable from '../components/DataTable';
import Loader from '../components/Loader';
import { Plus, X, Fuel } from 'lucide-react';
import ExpenseDrawer from '../components/ExpenseDrawer';
import { useToast } from '../contexts/ToastContext';

export default function FuelExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [expenseType, setExpenseType] = useState('fuel');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Corporate Card');

  // Drawer states
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toast = useToast();
  const currentUser = authService.getCurrentUser();
  const canEdit = currentUser && ['Fleet Manager', 'Financial Analyst'].includes(currentUser.role);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const expData = await vehicleService.getAllExpenses();
      setExpenses(expData.data);

      const vehicleData = await vehicleService.getAll();
      setVehicles(vehicleData.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching expense logs.');
      toast.error('Failed to load transaction ledger.');
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
    setExpenseType('fuel');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setVendor('');
    setInvoiceNo('');
    setPaymentMethod('Corporate Card');
    setError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !vehicleId || !vendor.trim() || !invoiceNo.trim()) {
      toast.warning('All transaction details are required.');
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      toast.warning('Transaction Amount must be a positive number.');
      return;
    }

    // Serialize extra fields into name
    const serializedName = `${name.trim()} [Vendor: ${vendor.trim() || 'Unspecified Vendor'}, InvoiceNo: ${invoiceNo.trim() || 'N/A'}, PaymentMethod: ${paymentMethod}]`;

    const payload = {
      name: serializedName,
      vehicleId: parseInt(vehicleId),
      expenseType,
      amount: amtNum,
      date
    };

    try {
      setSaving(true);
      await vehicleService.createExpense(payload);
      toast.success('Expense transaction logged successfully');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log expense.');
      toast.error(err.response?.data?.message || 'Validation error saving transaction.');
    } finally {
      setSaving(false);
    }
  };

  // Parser helper
  const parseExpenseDesc = (desc) => {
    const defaultData = {
      description: desc || '',
      vendor: 'Unspecified Vendor',
      invoiceNo: 'N/A',
      paymentMethod: 'Cash'
    };
    if (!desc) return defaultData;
    const match = desc.match(/(.*)\[Vendor:\s*([^,]+),\s*InvoiceNo:\s*([^,]+),\s*PaymentMethod:\s*([^\]]+)\]/);
    if (match) {
      return {
        description: match[1].trim(),
        vendor: match[2].trim(),
        invoiceNo: match[3].trim(),
        paymentMethod: match[4].trim()
      };
    }
    return defaultData;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const columns = useMemo(() => [
    { 
      header: 'Description', 
      key: 'name', 
      render: (row) => {
        const parsed = parseExpenseDesc(row.name);
        return <span className="font-semibold text-slate-900 dark:text-white">{parsed.description}</span>;
      } 
    },
    { 
      header: 'Vendor', 
      key: 'vendor', 
      render: (row) => {
        const parsed = parseExpenseDesc(row.name);
        return <span className="text-slate-500 font-medium">{parsed.vendor}</span>;
      } 
    },
    { header: 'Vehicle', key: 'vehicle', render: (row) => <span>{row.Vehicle?.name} <code className="text-slate-505 dark:text-slate-400 font-mono text-[10px] ml-1">({row.Vehicle?.registrationNo})</code></span> },
    { 
      header: 'Category', 
      key: 'expenseType', 
      render: (row) => {
        const badgeColors = {
          fuel: 'bg-emerald-50 dark:bg-emerald-955/40 text-emerald-600 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/30',
          toll: 'bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
          other: 'bg-slate-100 dark:bg-slate-800 text-slate-505 border-slate-205 dark:border-slate-700/30'
        };
        return (
          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border capitalize ${badgeColors[row.expenseType] || 'bg-slate-100 dark:bg-slate-850'}`}>
            {row.expenseType}
          </span>
        );
      }
    },
    { header: 'Amount Logged', key: 'amount', render: (row) => <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(row.amount)}</span> },
    { header: 'Transaction Date', key: 'date' }
  ], []);

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Expenses Ledger</h2>
          <p className="text-xs font-semibold text-slate-505 dark:text-slate-450 mt-1">Track fuel, tolls, and operating costs across all fleet assets (Indian Localized)</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 shadow-md hover:shadow-brand-500/20 active:scale-95 transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        )}
      </div>

      {/* Grid Table */}
      <DataTable 
        columns={columns} 
        data={expenses} 
        loading={loading} 
        emptyText="No expenses logged yet." 
        onRowClick={(row) => {
          setSelectedExpense(row);
          setDrawerOpen(true);
        }}
      />

      {/* Expense details Drawer */}
      <ExpenseDrawer 
        expense={selectedExpense} 
        isOpen={drawerOpen} 
        onClose={() => {
          setDrawerOpen(false);
          setSelectedExpense(null);
        }} 
      />

      {/* Modal Dialog Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-slide-up text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Log Vehicle Expense</h3>
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
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  placeholder="e.g. Fuel Refill"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</label>
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
                          {v.name} ({v.registrationNo})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expense Type</label>
                  <select
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="toll">Toll</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Merchant / Station / Vendor</label>
                  <input
                    type="text"
                    required
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. IndianOil Station"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice No / Ref</label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. INV-990423"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                  >
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="UPI / Bank Net">UPI / Net Banking</option>
                    <option value="Cash / Wallet">Cash / Pet Cash</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="e.g. 8000"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Log Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-905 dark:text-white focus:border-indigo-650 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800 pt-3 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-xs font-bold text-slate-505 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-505 transition-all shadow-md flex items-center gap-1.5 animate-scale-up"
                >
                  {saving && <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />}
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
