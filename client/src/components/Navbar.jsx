import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Menu, LogOut, User as UserIcon, Shield, Sun, Moon } from 'lucide-react';

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { username: 'User', role: 'Driver' };

  // Theme state
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

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 shadow-md justify-between items-center text-slate-800 dark:text-slate-100">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none lg:hidden"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Title */}
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Transit<span className="text-brand-500">Ops</span> Dashboard
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Day/Night Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition-all duration-200"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-indigo-600" />}
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <Shield className="h-4 w-4 text-brand-500 dark:text-brand-400" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{user.username}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">{user.role}</span>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
