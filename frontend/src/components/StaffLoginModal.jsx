import React, { useState } from 'react';
import { UserCheck, Key, User, Lock, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function StaffLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid Staff ID or Password');
      }

      setUsername('');
      setPassword('');
      onLoginSuccess(data.staff);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-fadeIn text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-7 text-center relative space-y-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 font-black">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Staff Portal Access
            </span>
            <h2 className="text-xl font-black mt-1 text-white">
              PKC Staff & Operator Login
            </h2>
            <p className="text-xs text-emerald-200">
              Cash Counter, Walk-in Admissions & Fee Desk
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs text-slate-900">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Member ID *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Staff ID (issued by Admin)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 focus:outline-none transition-all cursor-text"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Password *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 focus:outline-none transition-all cursor-text"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin-Issued Staff Credentials:
            </span>
            <p>Staff accounts and passwords are created exclusively by the University Administrator in the Admin Console.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <span>Logging in...</span> : <><Lock className="w-4 h-4" /><span>Login to Staff Desk</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
