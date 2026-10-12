import React, { useState } from 'react';
import { 
  Shield, Key, User, Lock, AlertCircle, CheckCircle2, 
  UserCheck, Eye, EyeOff, Globe, Mail, UserPlus, ArrowLeft, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminLoginScreen({ 
  initialTab = 'admin', 
  onLoginSuccess, 
  onStaffLoginSuccess, 
  onBackToPublic,
  lang: propLang,
  toggleLang: propToggleLang
}) {
  const context = useLanguage();
  const lang = propLang || context.lang || 'en';
  const toggleLang = propToggleLang || context.toggleLang;
  const isHindi = lang === 'hi';

  // Active Role Option: 'admin' | 'staff'
  const [activeRole, setActiveRole] = useState(initialTab || 'admin');

  // Admin Auth Mode: 'login' | 'signup' | 'forgot'
  const [adminAuthMode, setAdminAuthMode] = useState('login');

  // Admin Login Credentials
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Admin Sign Up Fields
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPass, setSignupConfirmPass] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  // Admin Forgot Password Fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Staff Credentials
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Status handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Reset errors and alerts on mode change
  const switchAdminMode = (newMode) => {
    setAdminAuthMode(newMode);
    setError(null);
    setSuccessMsg(null);
  };

  // 1. Handle Admin Login Submission (Email or ID)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: adminIdentifier.trim(),
          username: adminIdentifier.trim(), 
          password: adminPassword.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'अमान्य एडमिन ईमेल/आईडी या पासवर्ड।' : 'Invalid Admin Email/ID or Password.'));
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

  // 2. Handle Admin Sign Up (Create Account)
  const handleAdminSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (signupPassword !== signupConfirmPass) {
      setError(isHindi ? 'पासवर्ड और कन्फर्म पासवर्ड एक जैसे होने चाहिए।' : 'Password and Confirm Password do not match.');
      setLoading(false);
      return;
    }

    if (signupPassword.length < 4) {
      setError(isHindi ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim() || 'Institute Administrator',
          email: signupEmail.trim().toLowerCase(),
          password: signupPassword.trim(),
          role: 'admin'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'अकाउंट बनाने में त्रुटि हुई।' : 'Failed to create admin account.'));
      }

      // Pre-fill login with newly registered credentials
      setAdminIdentifier(signupEmail.trim().toLowerCase());
      setAdminPassword(signupPassword.trim());
      setSuccessMsg(
        isHindi 
          ? 'एडमिन अकाउंट सफलतापूर्वक बन गया और सेव हो गया! अब आप नीचे लॉगिन कर सकते हैं।' 
          : 'Admin account created and saved successfully! You can now log in below.'
      );
      setAdminAuthMode('login');

      // Clear sign-up form
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirmPass('');
    } catch (err) {
      setError(err.message || 'Error creating admin account.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Admin Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (forgotNewPass !== forgotConfirmPass) {
      setError(isHindi ? 'नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।' : 'New Password and Confirm Password do not match.');
      setLoading(false);
      return;
    }

    if (forgotNewPass.length < 4) {
      setError(isHindi ? 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'New password must be at least 4 characters long.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim().toLowerCase(),
          newPassword: forgotNewPass.trim(),
          confirmPassword: forgotConfirmPass.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'पासवर्ड बदलने में त्रुटि हुई।' : 'Failed to reset password.'));
      }

      // Pre-fill login credentials
      setAdminIdentifier(forgotEmail.trim().toLowerCase());
      setAdminPassword(forgotNewPass.trim());
      setSuccessMsg(
        isHindi 
          ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है! अब आप लॉगिन कर सकते हैं।' 
          : 'Password updated successfully! You can now log in with your new password.'
      );
      setAdminAuthMode('login');

      // Clear forgot form
      setForgotEmail('');
      setForgotNewPass('');
      setForgotConfirmPass('');
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Staff Login Submission
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

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
          <button
            type="button"
            onClick={() => {
              if (typeof toggleLang === 'function') toggleLang();
            }}
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-white/20 cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHindi ? 'English' : 'हिन्दी'}</span>
          </button>

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

        {/* 2-Option Role Selector ("Admin Login" & "Staff Login") */}
        <div className="p-6 sm:p-8 pb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            {isHindi ? 'लॉगिन पोर्टल चुनें (Select Portal)' : 'Select Your Login Portal'}
          </label>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Option 1: Admin Login */}
            <button
              type="button"
              onClick={() => {
                setActiveRole('admin');
                setError(null);
                setSuccessMsg(null);
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
                {isHindi && (
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                    एडमिन लॉगिन
                  </span>
                )}
              </div>
            </button>

            {/* Option 2: Staff Login */}
            <button
              type="button"
              onClick={() => {
                setActiveRole('staff');
                setError(null);
                setSuccessMsg(null);
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
                {isHindi && (
                  <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">
                    स्टाफ लॉगिन
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Global Notifications: Success Banner */}
        {successMsg && (
          <div className="mx-6 sm:mx-8 mb-3 bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Global Notifications: Error Banner */}
        {error && (
          <div className="mx-6 sm:mx-8 mb-3 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 1: ADMIN (LOGIN / SIGN UP / FORGOT PASSWORD) */}
        {/* ========================================================================= */}
        {activeRole === 'admin' && (
          <div className="px-6 sm:px-8 pb-8">
            
            {/* Admin Sub-navigation Header when in Signup or Forgot mode */}
            {adminAuthMode !== 'login' && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => switchAdminMode('login')}
                  className="text-xs font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'वापस लॉगिन पर जाएं' : 'Back to Admin Login'}</span>
                </button>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  {adminAuthMode === 'signup' 
                    ? (isHindi ? 'नया अकाउंट बनाएं' : 'Create Account') 
                    : (isHindi ? 'पासवर्ड रीसेट' : 'Forgot Password')}
                </span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW A: ADMIN LOGIN */}
            {/* ------------------------------------------------------------- */}
            {adminAuthMode === 'login' && (
              <form onSubmit={handleAdminSubmit} autoComplete="off" className="space-y-4 text-xs text-slate-900">
                <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center gap-2 text-amber-900 text-[11px]">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Administrator Access:</strong> Full system access, college records, fee audit trail, and university settlements.
                  </span>
                </div>

                {/* Admin Email or User ID */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'एडमिन ईमेल या यूजर आईडी *' : 'Admin Email or User ID *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder={isHindi ? "ईमेल दर्ज करें (e.g. admin@pkc.edu या Admin ID)" : "Enter Admin Email or User ID (e.g. admin@pkc.edu)"}
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Admin Password & Forgot Password Link */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      {isHindi ? 'एडमिन पासवर्ड *' : 'Admin Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => switchAdminMode('forgot')}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer"
                    >
                      {isHindi ? 'पासवर्ड भूल गए? (Forgot Password)' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder={isHindi ? "पासवर्ड दर्ज करें" : "Enter Admin Password"}
                      autoComplete="current-password"
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
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-1"
                >
                  {loading ? (
                    <span>{isHindi ? 'प्रमाणित किया जा रहा है...' : 'Verifying Admin Credentials...'}</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{isHindi ? 'एडमिन पोर्टल में प्रवेश करें (Login)' : 'Login to Administrator Portal (एडमिन पोर्टल में प्रवेश करें)'}</span>
                    </>
                  )}
                </button>

                {/* Bottom Card: Sign Up / Create Account Trigger */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                  <span>
                    {isHindi ? 'क्या आपके पास एडमिन अकाउंट नहीं है?' : "Don't have an administrator account?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchAdminMode('signup')}
                    className="inline-flex items-center gap-1.5 font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'नया अकाउंट बनाएं (Sign Up)' : 'Create Account / Sign Up'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW B: ADMIN SIGN UP (CREATE ACCOUNT) */}
            {/* ------------------------------------------------------------- */}
            {adminAuthMode === 'signup' && (
              <form onSubmit={handleAdminSignup} autoComplete="off" className="space-y-3.5 text-xs text-slate-900">
                <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-xl flex items-center gap-2 text-amber-900 text-[11px]">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {isHindi 
                      ? 'नया एडमिन अकाउंट बनाएं। अपनी ईमेल और पासवर्ड दर्ज करें, यह सुरक्षित रूप से सेव हो जाएगा।' 
                      : 'Create a new Admin account. Enter your email and password to register.'}
                  </span>
                </div>

                {/* Admin Full Name / Designation */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'एडमिन का नाम / पद (वैकल्पिक)' : 'Admin Full Name / Title (Optional)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder={isHindi ? "e.g. निदेशक / कुलसचिव / एडमिनिस्ट्रेटर" : "e.g. Director / Registrar / Admin Name"}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                    />
                  </div>
                </div>

                {/* Admin Email Address */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'एडमिन ईमेल पता *' : 'Admin Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="e.g. director@pkc.edu or admin@gmail.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Admin Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'पासवर्ड बनाएं *' : 'Create Password *'}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showSignupPass ? 'text' : 'password'}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder={isHindi ? "कम से कम 4 अक्षर का पासवर्ड बनाएं" : "Create password (min. 4 characters)"}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'पासवर्ड की पुष्टि करें *' : 'Confirm Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showSignupPass ? 'text' : 'password'}
                      value={signupConfirmPass}
                      onChange={(e) => setSignupConfirmPass(e.target.value)}
                      placeholder={isHindi ? "वही पासवर्ड दोबारा दर्ज करें" : "Re-enter your password"}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Sign Up Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
                >
                  {loading ? (
                    <span>{isHindi ? 'अकाउंट बनाया जा रहा है...' : 'Creating Admin Account...'}</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 text-slate-950" />
                      <span>{isHindi ? 'अकाउंट बनाएं और सेव करें (Create & Save)' : 'Create Admin Account & Save'}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchAdminMode('login')}
                    className="text-[11px] font-bold text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {isHindi ? 'पहले से अकाउंट है? लॉगिन करें' : 'Already have an account? Back to Login'}
                  </button>
                </div>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUB-VIEW C: ADMIN FORGOT PASSWORD */}
            {/* ------------------------------------------------------------- */}
            {adminAuthMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} autoComplete="off" className="space-y-3.5 text-xs text-slate-900">
                <div className="bg-amber-50/80 border border-amber-300/80 p-3 rounded-xl flex items-center gap-2 text-amber-900 text-[11px]">
                  <Key className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {isHindi 
                      ? 'अपना पंजीकृत ईमेल और नया पासवर्ड दर्ज करें। पासवर्ड तुरंत अपडेट हो जाएगा।' 
                      : 'Enter your registered email and choose a new password to reset your credentials.'}
                  </span>
                </div>

                {/* Registered Email */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'पंजीकृत एडमिन ईमेल *' : 'Registered Admin Email *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. director@pkc.edu or admin@gmail.com"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'नया पासवर्ड दर्ज करें *' : 'New Password *'}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder={isHindi ? "नया पासवर्ड (कम से कम 4 अक्षर)" : "Enter new password (min. 4 characters)"}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'नए पासवर्ड की पुष्टि करें *' : 'Confirm New Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder={isHindi ? "वही नया पासवर्ड दोबारा दर्ज करें" : "Re-enter new password"}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Forgot Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
                >
                  {loading ? (
                    <span>{isHindi ? 'पासवर्ड बदला जा रहा है...' : 'Updating Password...'}</span>
                  ) : (
                    <>
                      <Key className="w-4 h-4 text-slate-950" />
                      <span>{isHindi ? 'पासवर्ड बदलें और सेव करें (Change & Save)' : 'Change Password & Save'}</span>
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchAdminMode('login')}
                    className="text-[11px] font-bold text-slate-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    {isHindi ? 'पासवर्ड याद आ गया? वापस लॉगिन करें' : 'Remembered your password? Back to Login'}
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* ROLE 2: STAFF LOGIN */}
        {/* ========================================================================= */}
        {activeRole === 'staff' && (
          <form onSubmit={handleStaffSubmit} className="px-6 sm:px-8 pb-8 space-y-4 text-xs text-slate-900">
            
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-1"
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
