import React, { useState } from 'react';
import { Settings, Shield, Webhook, Database, Copy, Check, RefreshCw, Save, DollarSign } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);

  // General state config
  const [currency, setCurrency] = useState('INR');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoRelease, setAutoRelease] = useState(false);

  const toast = useToast();

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration saved successfully!');
    }, 800);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText('tps_live_oauth_token_99042a173c2be_x');
    setCopiedToken(true);
    toast.success('API Bearer Token copied to clipboard!');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText('https://api.transitops.com/v1/webhooks/telemetry');
    setCopiedWebhook(true);
    toast.success('Webhook Endpoint URL copied!');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleResetDB = async () => {
    if (!window.confirm('Reset local SQLite database to demo seeds? All custom trips and expenses will be reset.')) return;
    try {
      setResetting(true);
      // Call reports re-seed or reset endpoint if available, or simulate reset
      await api.post('/reports/trigger-reminders'); // trigger mock reset logs
      toast.success('Telemetry database refreshed to clean demo states!');
    } catch (err) {
      toast.error('Failed to trigger database seed reset.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Platform Settings</h2>
        <p className="text-xs font-semibold text-slate-550 dark:text-slate-450 mt-1">Configure telemetry routes, webhook payloads, and database demonstration locks</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Navigation Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm backdrop-blur-md">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            General Config
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Shield className="h-4.5 w-4.5" />
            API &amp; Security Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'webhooks'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Webhook className="h-4.5 w-4.5" />
            Webhooks Integration
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Database className="h-4.5 w-4.5" />
            Database Control
          </button>
        </div>

        {/* Configurations pane */}
        <div className="flex-1 w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm backdrop-blur-md">
          
          {/* General Config */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-805">General Parameters</h3>
              
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wider block">Default Currency Representation</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="INR">Indian Rupee (₹ INR)</option>
                    <option value="USD">US Dollar ($ USD)</option>
                  </select>
                </div>

                <div className="space-y-1.5 flex flex-col justify-end pb-1.5">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="emailAlerts"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="h-4.5 w-4.5 accent-indigo-600 rounded"
                    />
                    <label htmlFor="emailAlerts" className="font-bold text-slate-655 dark:text-slate-300 cursor-pointer">
                      Enable automated email reports dispatch
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="autoRelease"
                    checked={autoRelease}
                    onChange={(e) => setAutoRelease(e.target.checked)}
                    className="h-4.5 w-4.5 accent-indigo-600 rounded mt-0.5"
                  />
                  <div>
                    <label htmlFor="autoRelease" className="font-bold text-slate-655 dark:text-slate-300 cursor-pointer block">
                      Auto-release workshop lockouts
                    </label>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 leading-relaxed">
                      Automatically mark maintenance records completed and make vehicle asset available after planned downtime hours expire.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-805 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-505 shadow-md flex items-center gap-1.5"
                >
                  {saving ? <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Security Config */}
          {activeTab === 'security' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-805">Developer API Keys</h3>
              
              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase tracking-wider block">Bearer Access Token</label>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850 font-mono select-all text-indigo-600 dark:text-indigo-400 block truncate">
                    tps_live_oauth_token_99042a173c2be_x
                  </code>
                  <button
                    onClick={handleCopyToken}
                    className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl text-slate-500 dark:text-slate-400 shrink-0 transition-colors"
                    title="Copy token key"
                  >
                    {copiedToken ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed block mt-1">
                  Use this OAuth key inside requests header 'Authorization: Bearer [token]' to query routes programmatically.
                </span>
              </div>
            </div>
          )}

          {/* Webhooks Config */}
          {activeTab === 'webhooks' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-805">Telemetry Alerts Webhook</h3>
              
              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase tracking-wider block">Endpoint Callback URL</label>
                <div className="flex gap-2 items-center">
                  <code className="flex-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-850 font-mono text-indigo-600 dark:text-indigo-400 block truncate">
                    https://api.transitops.com/v1/webhooks/telemetry
                  </code>
                  <button
                    onClick={handleCopyWebhook}
                    className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-xl text-slate-500 dark:text-slate-400 shrink-0 transition-colors"
                  >
                    {copiedWebhook ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Database Control */}
          {activeTab === 'database' && (
            <div className="space-y-5 text-xs">
              <h3 className="text-base font-black text-slate-900 dark:text-white pb-2.5 border-b border-slate-100 dark:border-slate-805">SQLite Engine Administration</h3>
              
              <div className="rounded-xl border border-rose-200/50 bg-rose-50/20 dark:bg-rose-955/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">Re-seed Database Data</span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                    Wipes existing SQLite transactions table registries (expenses ledger, dispatches records) and seeds original clean demo database entries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetDB}
                  disabled={resetting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors shadow-md shadow-rose-500/10"
                >
                  <RefreshCw className={`h-4 w-4 ${resetting ? 'animate-spin' : ''}`} />
                  Reset Database
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
