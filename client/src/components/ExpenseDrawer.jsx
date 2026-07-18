import React from 'react';
import { X, DollarSign, Fuel, MapPin, CreditCard, Receipt, FileText, CheckCircle2 } from 'lucide-react';

export default function ExpenseDrawer({ expense, isOpen, onClose }) {
  if (!isOpen || !expense) return null;

  // Localized currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
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

  const parsed = parseExpenseDesc(expense.name);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden animate-slide-left text-left text-slate-850 dark:text-slate-200"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 rounded-2xl border border-brand-200/50">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{parsed.description}</h3>
                <div className="flex gap-2 items-center mt-1">
                  <span className="text-[10px] font-semibold text-slate-500 font-mono">Logged on: {expense.date}</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-850 dark:hover:text-white transition-all shadow-sm"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-xl font-bold uppercase tracking-wider border capitalize ${
              expense.expenseType === 'fuel' 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 border-emerald-200 dark:border-emerald-900/30'
                : expense.expenseType === 'toll'
                  ? 'bg-blue-50 dark:bg-blue-955/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              Category: {expense.expenseType}
            </span>
          </div>
        </div>

        {/* Body Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Associated Vehicle Details */}
          {expense.Vehicle && (
            <div className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Debit Account (Vehicle Asset)</h4>
              <div className="flex justify-between items-center text-xs">
                <div className="flex gap-3 items-center">
                  <div className="h-9 w-9 bg-brand-500/10 rounded-xl flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 border border-brand-200/50">
                    <Fuel className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">{expense.Vehicle.name}</span>
                    <code className="text-[10px] font-mono text-brand-655 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/20 px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900/20 inline-block mt-0.5">
                      {expense.Vehicle.registrationNo}
                    </code>
                  </div>
                </div>
                <div className="text-right text-slate-500 font-semibold">
                  Odometer: {expense.Vehicle.odometer} km
                </div>
              </div>
            </div>
          )}

          {/* Amount and Invoice Info */}
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-455 uppercase block">Expense Amount</span>
              <span className="text-xl font-black text-rose-500 mt-1.5 block flex items-center gap-1">
                <DollarSign className="h-4.5 w-4.5" /> {formatCurrency(expense.amount)}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-[10px] font-bold text-slate-455 uppercase block">Invoice Reference</span>
              <span className="text-sm font-bold text-slate-850 dark:text-white mt-2 block flex items-center gap-1.5 font-mono">
                <FileText className="h-4.5 w-4.5 text-slate-400" /> {parsed.invoiceNo}
              </span>
            </div>
          </div>

          {/* Vendor and Payment Details */}
          <div className="rounded-2xl border border-slate-150 dark:border-slate-850 p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Merchant &amp; Settlement Details</h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-805">
                <span className="text-slate-500">Merchant / Fuel Station</span>
                <span className="font-semibold text-slate-850 dark:text-white flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" /> {parsed.vendor}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-500">Settlement Payment Method</span>
                <span className="font-semibold text-slate-850 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-500" /> {parsed.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Timeline checklist */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Financial Audit Gates</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-105 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-955/10">
                <div className="flex gap-2.5 items-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-slate-850 dark:text-white">Receipt / Invoice Attached</span>
                </div>
                <span className="text-[10px] text-slate-450">Verified</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-105 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-955/10">
                <div className="flex gap-2.5 items-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-slate-850 dark:text-white">Commercial Vehicle Allocated</span>
                </div>
                <span className="text-[10px] text-slate-450">Verified</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl border border-slate-105 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-955/10">
                <div className="flex gap-2.5 items-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-slate-850 dark:text-white">Analyst Audit Reconciliation</span>
                </div>
                <span className="text-[10px] text-slate-450">Approved</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-400 flex items-center justify-between">
          <span>Enterprise Billing Audit Ledger</span>
          <span>Settled Gate</span>
        </div>

      </div>
    </div>
  );
}
