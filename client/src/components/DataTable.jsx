import React from 'react';

export default function DataTable({ columns, data, loading, emptyText = 'No data available', onRowClick }) {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-350">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#131722] border-b border-slate-200 dark:border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="animate-pulse">
                {columns.map((_, colIdx) => (
                  <td key={colIdx} className="px-6 py-4.5 align-middle">
                    <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded w-2/3" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-205 dark:border-white/5 bg-white dark:bg-[#131722]/65 backdrop-blur-md shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-350">
        <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#131722] border-b border-slate-200 dark:border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-white/5">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-3">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-750">
                    <svg className="h-8 w-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-750 dark:text-slate-300">{emptyText}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">Try refining search query bounds or registering new asset records.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className={`transition-all duration-150 ${
                  onRowClick 
                    ? 'hover:bg-indigo-50/45 dark:hover:bg-indigo-950/20 cursor-pointer hover:scale-[1.002]' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
                onClick={(e) => {
                  // Prevent drawer opening if clicking buttons/actions columns
                  if (e.target.closest('button') || e.target.closest('a') || e.target.closest('select') || e.target.closest('input')) {
                    return;
                  }
                  if (onRowClick) onRowClick(row);
                }}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4.5 align-middle">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
