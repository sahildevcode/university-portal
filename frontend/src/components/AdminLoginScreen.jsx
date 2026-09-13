import React, { useState } from 'react';
import { Shield, Key, User, Lock, AlertCircle, CheckCircle2, UserCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginScreen({ 
  initialTab = 'admin', 
  onLoginSuccess, 
  onStaffLoginSuccess, 
  onBackToPublic 
}) {
  // Active Role Option: 'admin' (एडमिन लॉगिन) | 'staff' (स्टाफ लॉगिन)
  const [activeRole, setActiveRole] = useState(initialTab || 'admin');

  // Admin Credentials
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Staff Credentials
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Shared status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Admin Login Submission
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: adminUsername.trim(), 
          password: adminPassword.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid Admin User ID or Password.');
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Staff Login Submission
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/staff-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: staffUsername.trim(), 
          password: staffPassword.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid Staff ID or Password.');
      }

      if (onStaffLoginSuccess) {
        onStaffLoginSuccess(data.staff);
      }
    } catch (err) {
      setError(err.message || 'Staff authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 text-slate-900">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn">
        
        {/* Institute Top Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-8 text-center space-y-3 relative">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-amber-400 mx-auto shadow-xl shadow-amber-400/20">
            <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/30">
              Authorized Institute Access Portal
            </span>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mt-1.5">
              PKC Education Learning Institute
            </h2>
            <p className="text-xs text-indigo-200">
              Chhatarpur (M.P.) • Management &amp; Desk Operator Gateway
            </p>
          </div>
        </div>

        {/* 2-Option Role Selector ("एडमिन लॉगिन" aur "स्टाफ लॉगिन") */}
        <div className="p-6 sm:p-8 pb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            Select Your Login Portal / लॉगिन का प्रकार चुनें
          </label>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Option 1: Admin Login */}
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setError(null);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                activeRole === 'admin'
                  ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 text-slate-950'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  activeRole === 'admin' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                {activeRole === 'admin' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  Directorate Level
                </span>
                <strong className="text-sm font-black text-slate-900 block leading-tight">
                  Admin Login
                </strong>
                <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                  एडमिन लॉगिन
                </span>
              </div>
            </button>

            {/* Option 2: Staff Login */}
            <button
              type="button"
              onClick={() => {
                setActiveRole('staff');
                setError(null);
              }}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                activeRole === 'staff'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 text-slate-950'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  activeRole === 'staff' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                {activeRole === 'staff' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Cash &amp; Counter Desk
                </span>
                <strong className="text-sm font-black text-slate-900 block leading-tight">
                  Staff Login
                </strong>
                <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                  स्टाफ लॉगिन
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mx-6 sm:mx-8 mb-2 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FORM 1: ADMIN LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="px-6 sm:px-8 pb-8 space-y-4.5 text-xs text-slate-900">
            
            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center gap-2 text-amber-900 text-[11px]">
              <Shield className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Administrator Access:</strong> Full system access, college records, fee audit trail, and university settlements.
              </span>
            </div>

            {/* Admin User ID */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Admin User ID *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Admin Password */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Admin Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
            >
              {loading ? (
                <span>Verifying Admin Credentials...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Login to Administrator Portal (एडमिन पोर्टल में प्रवेश करें)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* FORM 2: STAFF LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="px-6 sm:px-8 pb-8 space-y-4.5 text-xs text-slate-900">
            
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-950 text-[11px]">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Staff Operator Desk:</strong> Admin ne jo Staff ID aur Password diya hai, wahi enter karke login karein.
              </span>
            </div>

            {/* Staff ID */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Staff Member ID * (Admin dwara diya gaya)
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  placeholder="e.g. motti kumar, staff-cashier"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 focus:outline-none transition-all cursor-text font-mono"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Staff Password */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Staff Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showStaffPass ? 'text' : 'password'}
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="Enter Staff Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 focus:outline-none transition-all cursor-text font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPass(!showStaffPass)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                  tabIndex={-1}
                >
                  {showStaffPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
            >
              {loading ? (
                <span>Verifying Staff Credentials...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Login to Staff Desk Portal (स्टाफ पोर्टल में प्रवेश करें)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 sm:px-8 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">
            PKC Education Institute Portal
          </span>
          <button
            type="button"
            onClick={onBackToPublic}
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            ← Return to Student Website
          </button>
        </div>

      </div>
    </div>
  );
}
