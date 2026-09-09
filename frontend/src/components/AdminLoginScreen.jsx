import React, { useState } from 'react';
import { Shield, Key, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLoginScreen({ onLoginSuccess, onBackToPublic }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid Admin ID or Password');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-amber-400 mx-auto shadow-lg shadow-amber-400/20">
            <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              PKC Admin Control Desk
            </h2>
            <p className="text-xs text-indigo-200 mt-1">
              PKC Education Learning Institute &amp; Consultancy, Chhatarpur
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 text-xs text-slate-900">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin User ID *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Admin ID"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Authenticating Admin...</span> : <><Lock className="w-4 h-4" /><span>Login to Administrator Control Panel</span></>}
          </button>

          <p className="text-[11px] text-center text-slate-400">
            * Authorized personnel only. All access actions are logged and audited.
          </p>

          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onBackToPublic}
              className="text-xs font-semibold text-slate-500 hover:text-amber-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              ← Return to Student Website
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
