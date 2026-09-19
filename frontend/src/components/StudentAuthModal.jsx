import React, { useState } from 'react';
import { User, Key, Mail, Phone, BookOpen, X, AlertCircle, CheckCircle2, Lock, ArrowRight, UserPlus } from 'lucide-react';

export default function StudentAuthModal({ isOpen, onClose, onLoginSuccess, courses, defaultCourseId }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  
  // Login fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || 'btech-cse');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      onLoginSuccess(data.user, data.student);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/student-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username: signupUsername,
          email,
          phone,
          password: signupPassword,
          courseId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      onLoginSuccess(data.user, data.student);
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
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fadeIn my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Student Portal Account</h3>
              <p className="text-xs text-indigo-200">Login or Create Student ID to enroll & manage courses</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              mode === 'login' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              mode === 'signup' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Create New Student Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="m-5 mb-0 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Student Username or Registered Email *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="e.g. rahul or student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-[11px] text-slate-600">
              <span className="font-bold text-indigo-900 block">Sample Student Login:</span>
              <p>Username: <strong className="font-mono">rahul</strong> | Password: <strong className="font-mono">password123</strong></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? <span>Logging in...</span> : <><Lock className="w-4 h-4" /><span>Login to Student Portal</span></>}
            </button>
          </form>
        )}

        {/* 2. Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="p-6 sm:p-7 space-y-3.5 text-xs max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aman Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Choose Username (ID) *
                </label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value.toLowerCase())}
                  placeholder="aman2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aman@example.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Desired Course to Enroll *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code}) — Fee: ₹{Number(c.totalFee).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Create Password *
              </label>
              <input
                type="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              {loading ? <span>Creating Account...</span> : <><UserPlus className="w-4 h-4" /><span>Complete Registration & Enroll</span></>}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
