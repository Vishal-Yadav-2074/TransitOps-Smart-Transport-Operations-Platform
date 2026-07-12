import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('manager'); // Preload manager user for testing
  const [password, setPassword] = useState('password123'); // Preload default password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(username, password);
      if (data.success) {
        navigate('/');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-xl backdrop-blur-md">
        
        {/* Branding header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-600/30 text-xl">
            T
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Sign in to access your TransitOps fleet controller
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 text-xs font-semibold text-red-650 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</label>
            <div className="relative mt-1">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-600 focus:border-indigo-650 focus:outline-none transition-colors duration-200"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-600 focus:border-indigo-650 focus:outline-none transition-colors duration-200"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md hover:shadow-indigo-500/25 active:bg-indigo-700 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/* Demo User Info */}
        <div className="mt-8 rounded-xl bg-slate-50 dark:bg-slate-955/40 border border-slate-200 dark:border-slate-800/60 p-4 text-[11px] text-slate-600 dark:text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Hackathon Demo Roles:</span>
          <div>• Fleet Manager: <code className="text-indigo-650 dark:text-indigo-400 font-mono">manager</code> / <code className="text-slate-550 dark:text-slate-400 font-mono">password123</code></div>
          <div>• Safety Officer: <code className="text-indigo-650 dark:text-indigo-400 font-mono">safety</code> / <code className="text-slate-550 dark:text-slate-400 font-mono">password123</code></div>
          <div>• Financial Analyst: <code className="text-indigo-650 dark:text-indigo-400 font-mono">analyst</code> / <code className="text-slate-550 dark:text-slate-400 font-mono">password123</code></div>
        </div>
      </div>
    </div>
  );
}
