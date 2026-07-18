import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Render Stack */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const config = {
            success: {
              bg: 'bg-emerald-50/95 dark:bg-emerald-950/95',
              border: 'border-emerald-200 dark:border-emerald-900/50',
              text: 'text-emerald-800 dark:text-emerald-200',
              icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            },
            error: {
              bg: 'bg-rose-50/95 dark:bg-rose-955/95',
              border: 'border-rose-200 dark:border-rose-900/50',
              text: 'text-rose-800 dark:text-rose-200',
              icon: <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
            },
            warning: {
              bg: 'bg-amber-50/95 dark:bg-amber-955/95',
              border: 'border-amber-200 dark:border-amber-900/50',
              text: 'text-amber-800 dark:text-amber-200',
              icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            },
            info: {
              bg: 'bg-indigo-50/95 dark:bg-indigo-955/95',
              border: 'border-indigo-200 dark:border-indigo-900/50',
              text: 'text-indigo-800 dark:text-indigo-200',
              icon: <Info className="h-5 w-5 text-indigo-500 shrink-0" />
            }
          }[t.type] || config.success;

          return (
            <div
              key={t.id}
              className={`flex items-start justify-between gap-3 p-4 rounded-2xl border ${config.bg} ${config.border} ${config.text} shadow-xl backdrop-blur-md pointer-events-auto animate-slide-left text-left text-xs font-semibold`}
              role="alert"
            >
              <div className="flex gap-2.5 items-start">
                {config.icon}
                <span className="leading-relaxed">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
