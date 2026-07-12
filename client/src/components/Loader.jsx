import React from 'react';

export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-lg" />
          <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Loading TransitOps...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
    </div>
  );
}
