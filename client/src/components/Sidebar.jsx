import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Users, 
  Milestone, 
  Wrench, 
  Fuel, 
  FilePieChart,
  Calendar,
  Settings,
  X 
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Truck },
    { name: 'Drivers', path: '/drivers', icon: Users },
    { name: 'Trips', path: '/trips', icon: Milestone },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Expenses', path: '/expenses', icon: Fuel },
    { name: 'Reports', path: '/reports', icon: FilePieChart },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              T
            </div>
            <span className="text-lg font-bold text-slate-950 dark:text-white tracking-wider">TRANSIT OPS</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer branding */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[10px] text-slate-450 dark:text-slate-500 font-medium tracking-wide">TransitOps v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
