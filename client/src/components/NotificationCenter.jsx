import React, { useState, useEffect, useRef } from 'react';
import vehicleService from '../services/vehicleService';
import driverService from '../services/driverService';
import tripService from '../services/tripService';
import { Bell, BellOff, Wrench, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const list = [];
      
      // 1. Get vehicles in shop
      const vRes = await vehicleService.getAll();
      const vehicles = vRes.data || [];
      vehicles.forEach(v => {
        if (v.state === 'in_shop') {
          list.push({
            id: `v-maint-${v.id}`,
            type: 'maintenance',
            text: `Vehicle ${v.registrationNo} (${v.name}) entered maintenance`,
            time: 'Active Lockout',
            icon: Wrench,
            color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30'
          });
        }
      });

      // 2. Get driver licenses expiring
      const dRes = await driverService.getAll();
      const drivers = dRes.data || [];
      const today = new Date();
      drivers.forEach(d => {
        if (d.licenseExpiry) {
          const expiry = new Date(d.licenseExpiry);
          const diffTime = expiry - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays >= 0 && diffDays <= 30) {
            list.push({
              id: `d-exp-${d.id}`,
              type: 'license',
              text: `Driver ${d.name}'s license expires in ${diffDays} days`,
              time: `Expires: ${d.licenseExpiry.substring(0, 7)}`,
              icon: AlertTriangle,
              color: 'text-rose-500 bg-rose-50 dark:bg-rose-955/20 border-rose-250 dark:border-rose-900/30'
            });
          } else if (diffDays < 0) {
            list.push({
              id: `d-expd-${d.id}`,
              type: 'license-expired',
              text: `Driver ${d.name}'s license is expired!`,
              time: `Expired: ${d.licenseExpiry.substring(0, 7)}`,
              icon: AlertTriangle,
              color: 'text-red-500 bg-red-50 dark:bg-red-955/20 border-red-250 dark:border-red-900/30'
            });
          }
        }
      });

      // 3. Get completed trips
      const tRes = await tripService.getAll();
      const trips = (tRes.data || []).slice(0, 8); // Grab latest
      trips.forEach(t => {
        if (t.state === 'completed') {
          list.push({
            id: `t-comp-${t.id}`,
            type: 'trip',
            text: `Trip ${t.name} (from ${t.source} to ${t.dest}) completed successfully`,
            time: 'Completed',
            icon: CheckCircle,
            color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/30'
          });
        }
      });

      setNotifications(list);
      setUnreadCount(list.length);
    } catch (err) {
      console.error('Failed to compile dynamic notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // Mark as read on open
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-505 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 border border-slate-200 dark:border-slate-700 transition-all duration-200"
        title="System Alerts"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 text-slate-800 dark:text-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-2.5">
            <span className="font-bold text-sm">System Notifications</span>
            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
              {notifications.length} Alerts
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                <BellOff className="h-8 w-8 opacity-40 mb-1.5" />
                <span className="text-[11px] font-medium">All systems normal</span>
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.icon || Info;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 items-start p-2.5 rounded-xl border text-left transition-colors duration-150 ${n.color}`}
                  >
                    <div className="mt-0.5">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold leading-snug">{n.text}</p>
                      <span className="text-[9px] font-medium opacity-60 block mt-1">{n.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
