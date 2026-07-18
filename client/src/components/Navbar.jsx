import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from './NotificationCenter';
import { Menu, LogOut, User as UserIcon, Shield, Sun, Moon, ChevronDown, Check } from 'lucide-react';

export default function Navbar({ setSidebarOpen }) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { username: 'User', role: 'Driver' };
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full bg-white/70 dark:bg-[#10131A]/70 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 shadow-md justify-between items-center text-slate-800 dark:text-slate-100">
      
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 focus:outline-none lg:hidden"
        aria-label="Toggle Sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Brand Title / Telemetry Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <h1 className="text-sm font-black tracking-wider text-slate-900 dark:text-white uppercase">
            Transit<span className="text-brand-500">Ops</span> Command
          </h1>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-250 dark:border-emerald-900/20 shadow-sm animate-scale-up">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Telemetry Live</span>
        </div>
      </div>

      {/* Actions (Search, Alerts, Theme, Profile Dropdown) */}
      <div className="flex items-center gap-3.5 ml-auto">
        
        {/* Search Input bar */}
        <GlobalSearch />

        {/* Notifications badge */}
        <NotificationCenter />

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-[#131722]/65 text-slate-505 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 border border-slate-205 dark:border-white/5 transition-all duration-200"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-[#8B5CF6]" />}
        </button>

        {/* User profile dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#131722]/65 hover:bg-slate-100 dark:hover:bg-[#131722] rounded-xl border border-slate-205 dark:border-white/5 transition-colors focus:outline-none"
          >
            <Shield className="h-4 w-4 text-brand-500" />
            <div className="flex flex-col text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.username}</span>
              <span className="text-[9px] text-slate-400 font-semibold leading-none mt-0.5">{user.role}</span>
            </div>
            <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Container */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#131722] p-2 shadow-xl z-50 text-slate-800 dark:text-slate-200 animate-scale-up">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-white/5 text-left mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user.username}</span>
                <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold block uppercase tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-955/20 rounded-lg text-left transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
