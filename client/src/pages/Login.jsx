import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, User, Truck, Shield, Sparkles, BarChart3, Milestone, Wrench, Fuel } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function Login() {
  const [username, setUsername] = useState('manager'); 
  const [password, setPassword] = useState('password123'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      if (data.success) {
        toast.success('Access Granted! Logging in...');
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
        toast.error(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error.');
      toast.error('Failed to establish link with backend API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans relative overflow-x-hidden text-slate-850 dark:text-slate-200">
      
      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-850 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            T
          </div>
          <span className="text-base font-extrabold text-slate-950 dark:text-white tracking-wider">TRANSIT OPS</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <a href="#features" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
          <a href="#credentials" className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Demo Access</a>
          <button 
            onClick={() => setIsLoginVisible(true)}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 shadow-sm transition-all"
          >
            Launch Command
          </button>
        </div>
      </header>

      {/* Main landing sections */}
      <main className="pt-24 px-6 max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center min-h-[calc(100vh-80px)]">
        
        {/* Left Column: Hero Overview */}
        <div className="md:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Telemetry Roster Linked</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-905 dark:text-white leading-tight tracking-tight">
            Premium Commercial <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-brand-555">Fleet Management</span>
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
            Audit vehicle operational margins, track active dispatches on map grids, log maintenance lockouts, check license compliance automatically, and generate executive ROI summaries.
          </p>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-4 border-y border-slate-200 dark:border-slate-800 py-6 max-w-lg text-left">
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">94%</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Fleet Health</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">2.4m</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Trips Audited</span>
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block">₹14M</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">ROI Ledger Yield</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setIsLoginVisible(true)}
              className="rounded-2xl bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs px-6 py-3.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Access Demo Console
            </button>
            <a 
              href="#features"
              className="rounded-2xl border border-slate-250 dark:border-slate-800 text-slate-655 dark:text-slate-300 font-extrabold text-xs px-6 py-3.5 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all block text-center"
            >
              Explore Features
            </a>
          </div>
        </div>

        {/* Right Column: Sliding/Inline Login Console */}
        <div className="md:col-span-5 w-full flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-8 shadow-xl backdrop-blur-md">
            <div className="text-center pb-6 border-b border-slate-100 dark:border-slate-855 mb-6">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">Authorized launch</span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">Platform Credentials Gate</h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {error && (
                <div className="rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/50 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs text-slate-905 dark:text-white placeholder-slate-400 focus:border-indigo-650 focus:outline-none"
                    placeholder="manager"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 py-3 pl-11 pr-4 text-xs text-slate-905 dark:text-white placeholder-slate-405 focus:border-indigo-650 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />}
                Access Command Dashboard
              </button>
            </form>
          </div>
        </div>

      </main>

      {/* Features Grid section */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-850 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Enterprise Infrastructure</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete tool suite engineered for logistics compliance and financial ledger analytics</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Roster Telemetry</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                Monitor status locks, odometer counts, and asset margins in real-time detail profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compliance Safeguards</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                Block route dispatching for expired licenses, operator suspensions, and payload weight limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Financial Margins</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                Aggregate fuel tickets, toll billing, and maintenance logs into computed ROI metrics automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left space-y-3 shadow-sm hover:scale-[1.02] transition-transform duration-200">
              <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Fleet Insights</h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-400 leading-relaxed">
                Interact with our smart analytics copilot answering query calculations using SQLite records.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Demo Credentials section */}
      <section id="credentials" className="py-16 px-6 max-w-3xl mx-auto text-left">
        <div className="rounded-3xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Hackathon Demonstrator Access Keys
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The platform is pre-loaded with sqlite test databases. Use the keys below to test authorization rules:
          </p>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Fleet Manager</span>
              <span className="text-[10px] text-slate-400 block mt-1">Username: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">manager</code></span>
              <span className="text-[10px] text-slate-400 block">Password: <code className="font-mono">password123</code></span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-105 dark:border-slate-855">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Safety Officer</span>
              <span className="text-[10px] text-slate-400 block mt-1">Username: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">safety</code></span>
              <span className="text-[10px] text-slate-400 block">Password: <code className="font-mono">password123</code></span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-105 dark:border-slate-855">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">Financial Analyst</span>
              <span className="text-[10px] text-slate-400 block mt-1">Username: <code className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">analyst</code></span>
              <span className="text-[10px] text-slate-400 block">Password: <code className="font-mono">password123</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Login Dialog Overlay */}
      {isLoginVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl animate-scale-up text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-855 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Launch Control Center</h3>
              <button 
                onClick={() => setIsLoginVisible(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-3 pl-11 pr-4 text-xs text-slate-905 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="manager"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 py-3 pl-11 pr-4 text-xs text-slate-905 dark:text-white focus:border-indigo-650 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 shadow-md flex items-center justify-center gap-1.5"
              >
                {loading && <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />}
                Authorize &amp; Launch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
