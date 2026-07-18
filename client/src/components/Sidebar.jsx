import React, { useEffect, useState } from 'react';
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
  Sun,
  Moon,
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

  // Sidebar controls theme toggle locally in sync with html class
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#0D1117]/90 dark:bg-[#0D1117]/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-100 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding (Gradient Logo & Name) */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#8B5CF6] flex items-center justify-center font-bold text-white shadow-lg shadow-[#7C3AED]/20">
              T
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white leading-none">TRANSIT OPS</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Fleet Operations</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
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
                  `group flex h-12 items-center gap-3.5 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white shadow-lg shadow-[#7C3AED]/25 border-l-2 border-white'
                      : 'text-slate-505 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/20 border-l-2 border-transparent hover:border-slate-300 dark:hover:border-slate-800'
                  }`
                }
              >
                <div className="p-1 rounded-lg bg-slate-100/50 dark:bg-slate-800/40 group-hover:scale-110 transition-transform duration-200">
                  <Icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:rotate-6" />
                </div>
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Section (Dark Mode, Version, Copyright) */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-4">
          
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="font-bold text-slate-550 dark:text-slate-400">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className="flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-800 p-0.5 transition-colors focus:outline-none"
            >
              <div
                className={`h-5 w-5 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-md transform transition-transform duration-250 ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? <Moon className="h-3 w-3 text-[#8B5CF6]" /> : <Sun className="h-3 w-3 text-amber-500" />}
              </div>
            </button>
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold tracking-wide block">TransitOps v1.0.0</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-600 block">© 2026 TransitOps. All rights reserved.</span>
          </div>
        </div>
      </aside>
    </>
  );
}
