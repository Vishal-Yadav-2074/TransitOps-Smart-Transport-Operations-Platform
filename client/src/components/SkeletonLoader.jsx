import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="animate-pulse space-y-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-6" />
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/12" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 h-64 flex items-center justify-center">
      <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-800" />
    </div>
  );
}
