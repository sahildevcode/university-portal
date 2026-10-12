import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, User, Lock, AlertCircle, CheckCircle2, 
  UserCheck, Eye, EyeOff, Globe, Mail, ArrowLeft, RefreshCw, Send, Check,
  Smartphone, MessageCircle, Sparkles
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

  // Check if admin setup is required (first-time initialization)
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  // Admin Auth Mode: 'login' | 'forgot'
  const [adminAuthMode, setAdminAuthMode] = useState('login');

  // Forgot Password & Details Discovery 3-Step State:
  // Step 1: Identifier (Mobile/WhatsApp or Email) + Channel -> Send 6-digit OTP
  // Step 2: 6-digit OTP Verification + WhatsApp 1-Click Link + Screen Test Code
  // Step 3: Discover Registered Email & Mobile + Set New Password + Optionally Update Email & Mobile
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotChannel, setForgotChannel] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [forgotIdentifier, setForgotIdentifier] = useState('7000212637');
  const [sessionKey, setSessionKey] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [targetPhone, setTargetPhone] = useState('7000212637');
  const [targetEmail, setTargetEmail] = useState('');
  const [discoveredEmail, setDiscoveredEmail] = useState('');
  const [discoveredPhone, setDiscoveredPhone] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [updateEmail, setUpdateEmail] = useState('');
  const [updatePhone, setUpdatePhone] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Admin Login Credentials
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);

  // Staff Credentials
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPass, setShowStaffPass] = useState(false);

  // Status handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch Admin Status on Mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (data.success && data.isSetupRequired) {
          setIsSetupRequired(true);
        }
      } catch (e) {
        console.warn('Could not check auth status:', e);
      }
    };
    checkStatus();
  }, []);

  // Cooldown countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Mode change helper
  const switchAdminMode = (newMode) => {
    setAdminAuthMode(newMode);
    setForgotStep(1);
    setInputOtp('');
    setReceivedOtp('');
    setError(null);
    setSuccessMsg(null);
  };

  // 1. Handle Admin Login / Setup Submission
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
          phone: adminIdentifier.trim(),
          username: adminIdentifier.trim(), 
          password: adminPassword.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'अमान्य एडमिन ईमेल/मोबाइल या पासवर्ड।' : 'Invalid Admin Email, Mobile Number or Password.'));
      }

      if (data.isFirstTimeSetup) {
        setIsSetupRequired(false);
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

  // 2A. Forgot Password & Recovery - Step 1: Send OTP Code
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const rawId = forgotIdentifier.trim() || (forgotChannel === 'whatsapp' ? '7000212637' : 'pkcinstitute@gmail.com');
    if (!rawId) {
      setError(isHindi ? 'कृपया अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।' : 'Please enter your registered mobile number or email.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          identifier: rawId,
          channel: forgotChannel 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'वेरिफिकेशन कोड भेजने में त्रुटि हुई।' : 'Failed to send verification code.'));
      }

      setSessionKey(data.sessionKey || '');
      setReceivedOtp(data.code || '');
      setWhatsappUrl(data.whatsappUrl || '');
      setTargetPhone(data.targetPhone || '7000212637');
      setTargetEmail(data.maskedEmail || '');
      setForgotStep(2);
      setResendCooldown(60);
      setSuccessMsg(
        isHindi 
          ? (forgotChannel === 'whatsapp' 
              ? `व्हाट्सएप (+91 ${data.targetPhone || '7000212637'}) पर 6-अंकों का वेरिफिकेशन ओटीपी भेजा गया!` 
              : `ईमेल पर 6-अंकों का वेरिफिकेशन कोड भेजा गया!`)
          : `6-digit verification code sent via ${forgotChannel.toUpperCase()}!`
      );
    } catch (err) {
      setError(err.message || 'Error sending code.');
    } finally {
      setLoading(false);
    }
  };

  // 2B. Forgot Password - Step 2: Verify OTP Code & Reveal Registered Email
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (!inputOtp.trim() || inputOtp.trim().length !== 6) {
      setError(isHindi ? 'कृपया 6 अंकों का सही कोड दर्ज करें।' : 'Please enter a valid 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionKey,
          identifier: forgotIdentifier.trim(), 
          code: inputOtp.trim() 
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'गलत वेरिफिकेशन कोड। कृपया दोबारा जाँचें।' : 'Invalid verification code. Please check and try again.'));
      }

      setDiscoveredEmail(data.registeredEmail || 'pkcinstitute@gmail.com');
      setDiscoveredPhone(data.registeredPhone || '7000212637');
      setUpdateEmail(data.registeredEmail || 'pkcinstitute@gmail.com');
      setUpdatePhone(data.registeredPhone || '7000212637');
      setForgotStep(3);
      setSuccessMsg(
        isHindi 
          ? 'पहचान सत्यापित! आपकी पंजीकृत ईमेल आईडी स्क्रीन पर दिख रही है। अब नया पासवर्ड बनाएं।' 
          : 'Identity verified! Your registered email is revealed below. Now set your new password.'
      );
    } catch (err) {
      setError(err.message || 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  // 2C. Forgot Password - Step 3: Save New Password & Optionally Update Email/Phone
  const handleResetPassword = async (e) => {
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
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionKey,
          identifier: forgotIdentifier.trim(),
          code: inputOtp.trim(),
          newPassword: forgotNewPass.trim(),
          confirmPassword: forgotConfirmPass.trim(),
          newEmail: updateEmail.trim() || undefined,
          newPhone: updatePhone.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'पासवर्ड बदलने में त्रुटि हुई।' : 'Failed to reset password.'));
      }

      // Pre-fill credentials in login view
      setAdminIdentifier(data.email || updateEmail.trim() || discoveredEmail);
      setAdminPassword(forgotNewPass.trim());
      setSuccessMsg(
        isHindi 
          ? `विवरण व पासवर्ड सफलतापूर्वक अपडेट हो गया! (ईमेल: ${data.email || updateEmail || discoveredEmail}) अब नीचे लॉगिन करें।` 
          : `Password & details updated successfully! (Email: ${data.email || updateEmail || discoveredEmail}). Login below.`
      );
      setAdminAuthMode('login');
      setForgotStep(1);
      setInputOtp('');
      setReceivedOtp('');
    } catch (err) {
      setError(err.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Staff Login Submission
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
        {/* ROLE 1: ADMIN (LOGIN & 3-STEP FORGOT PASSWORD WITH CODE) */}
        {/* ========================================================================= */}
        {activeRole === 'admin' && (
          <div className="px-6 sm:px-8 pb-8">
            
            {/* Header when in Forgot Password mode */}
            {adminAuthMode === 'forgot' && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => switchAdminMode('login')}
                  className="text-xs font-bold text-slate-600 hover:text-amber-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'वापस लॉगिन पर जाएं' : 'Back to Login'}</span>
                </button>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  {isHindi ? `स्टेप ${forgotStep}/3: सत्यापन` : `Step ${forgotStep}/3: Verification`}
                </span>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW A: ADMIN LOGIN / FIRST-TIME SETUP */}
            {/* ------------------------------------------------------------- */}
            {adminAuthMode === 'login' && (
              <form onSubmit={handleAdminSubmit} autoComplete="off" className="space-y-4 text-xs text-slate-900">
                
                {/* Dynamic Banner: First Time Setup vs Regular Administrator Access */}
                {isSetupRequired ? (
                  <div className="bg-amber-500/15 border-2 border-amber-500 p-3.5 rounded-2xl flex items-start gap-2.5 text-amber-950 text-xs">
                    <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm font-black text-amber-900">
                        {isHindi ? 'पहला एडमिन सेटअप (First-Time Setup)' : 'First-Time Admin Setup'}
                      </strong>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {isHindi 
                          ? 'कृपया अपना आधिकारिक ईमेल और पासवर्ड दर्ज करें। यह पहली बार लॉगिन करने पर हमेशा के लिए मुख्य एडमिन अकाउंट के रूप में सेव हो जाएगा।'
                          : 'Enter your official email and password once. It will be permanently saved as the Master Admin credentials.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center gap-2 text-amber-900 text-[11px]">
                    <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Administrator Access:</strong> Full system access, college records, fee audit trail, and university settlements.
                    </span>
                  </div>
                )}

                {/* Admin Email or Mobile / WhatsApp Number */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    {isHindi ? 'एडमिन ईमेल या मोबाइल नंबर *' : 'Admin Email or Mobile / WhatsApp Number *'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      placeholder="e.g. 7000212637 or pkcinstitute@gmail.com"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                      required
                      autoFocus
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {isHindi 
                      ? '💡 आप अपने पंजीकृत ईमेल (pkcinstitute@gmail.com) या मोबाइल (7000212637) किसी से भी लॉगिन कर सकते हैं।' 
                      : '💡 You can login with either your registered Email or Mobile number.'}
                  </p>
                </div>

                {/* Admin Password & Forgot Password Link */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      {isHindi ? 'एडमिन पासवर्ड *' : 'Admin Password *'}
                    </label>
                    {!isSetupRequired && (
                      <button
                        type="button"
                        onClick={() => switchAdminMode('forgot')}
                        className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors cursor-pointer"
                      >
                        {isHindi ? 'पासवर्ड या ईमेल भूल गए? (Forgot Details)' : 'Forgot Password or Email ID?'}
                      </button>
                    )}
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
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
                >
                  {loading ? (
                    <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Verifying Admin Credentials...'}</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {isSetupRequired 
                          ? (isHindi ? 'पासवर्ड सेट करें और पोर्टल में प्रवेश करें' : 'Set Credentials & Enter Admin Portal')
                          : (isHindi ? 'एडमिन पोर्टल में प्रवेश करें (Login)' : 'Login to Administrator Portal (एडमिन पोर्टल में प्रवेश करें)')}
                      </span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ------------------------------------------------------------- */}
            {/* VIEW B: REAL-WORLD FORGOT PASSWORD & EMAIL RECOVERY WITH WHATSAPP / SMS OTP */}
            {/* ------------------------------------------------------------- */}
            {adminAuthMode === 'forgot' && (
              <div className="space-y-4 text-xs text-slate-900">
                
                {/* STEP 1: SELECT CHANNEL & ENTER MOBILE OR EMAIL */}
                {forgotStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="bg-amber-50/80 border border-amber-300/80 p-3.5 rounded-2xl space-y-1 text-amber-950 text-xs">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{isHindi ? 'पासवर्ड व ईमेल रिकवरी सुविधा' : 'Password & Email ID Recovery System'}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {isHindi 
                          ? 'अगर आप पासवर्ड भूल गए हैं या अपनी ईमेल आईडी भूल गए हैं, तो अपने मोबाइल नंबर या ईमेल से 6-अंकों का ओटीपी प्राप्त करें।' 
                          : 'If you forgot your password or email address, request a 6-digit OTP via WhatsApp or Email.'}
                      </p>
                    </div>

                    {/* Channel Selector: WhatsApp OTP vs Email OTP */}
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                        {isHindi ? 'ओटीपी प्राप्त करने का माध्यम चुनें *' : 'Choose Verification OTP Method *'}
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotChannel('whatsapp');
                            if (!forgotIdentifier || forgotIdentifier.includes('@')) {
                              setForgotIdentifier('7000212637');
                            }
                          }}
                          className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                            forgotChannel === 'whatsapp'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <MessageCircle className={`w-4 h-4 ${forgotChannel === 'whatsapp' ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{isHindi ? 'व्हाट्सएप / SMS OTP' : 'WhatsApp / SMS OTP'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setForgotChannel('email');
                            if (!forgotIdentifier || !forgotIdentifier.includes('@')) {
                              setForgotIdentifier('pkcinstitute@gmail.com');
                            }
                          }}
                          className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                            forgotChannel === 'email'
                              ? 'bg-amber-500/10 border-amber-500 text-amber-950 shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Mail className={`w-4 h-4 ${forgotChannel === 'email' ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{isHindi ? 'ईमेल OTP (Email)' : 'Email OTP'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Identifier Input */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        {forgotChannel === 'whatsapp'
                          ? (isHindi ? 'पंजीकृत मोबाइल / व्हाट्सएप नंबर *' : 'Registered Mobile / WhatsApp Number *')
                          : (isHindi ? 'पंजीकृत एडमिन ईमेल *' : 'Registered Admin Email Address *')}
                      </label>
                      <div className="relative">
                        {forgotChannel === 'whatsapp' ? (
                          <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        ) : (
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        )}
                        <input
                          type={forgotChannel === 'whatsapp' ? 'tel' : 'email'}
                          value={forgotIdentifier}
                          onChange={(e) => setForgotIdentifier(e.target.value)}
                          placeholder={forgotChannel === 'whatsapp' ? 'e.g. 7000212637' : 'e.g. pkcinstitute@gmail.com'}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {forgotChannel === 'whatsapp' 
                          ? (isHindi ? '💡 ईमेल याद नहीं है? कोई बात नहीं! अपना मोबाइल नंबर दर्ज करें, ओटीपी के बाद आपकी ईमेल आईडी दिख जाएगी।' : 'Forgot email? Enter mobile number. OTP verification reveals your registered email.')
                          : (isHindi ? '💡 अपने पंजीकृत ईमेल पते पर 6-अंकों का वेरिफिकेशन कोड प्राप्त करें।' : 'A 6-digit verification code will be sent to this email address.')}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {loading ? (
                        <span>{isHindi ? 'ओटीपी भेजा जा रहा है...' : 'Generating OTP...'}</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-slate-950" />
                          <span>
                            {forgotChannel === 'whatsapp'
                              ? (isHindi ? 'व्हाट्सएप ओटीपी प्राप्त करें (Send WhatsApp OTP)' : 'Send WhatsApp / SMS OTP')
                              : (isHindi ? 'ईमेल वेरिफिकेशन कोड भेजें' : 'Send 6-Digit Email Code')}
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 2: VERIFY 6-DIGIT OTP WITH WHATSAPP LINK & TEST CARD */}
                {forgotStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-indigo-50/90 border-2 border-indigo-200 p-4 rounded-2xl space-y-3 text-indigo-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-900">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          {isHindi ? 'वेरिफिकेशन कोड प्रेषित' : 'Verification Code Sent'}
                        </span>
                        <span className="text-[10px] font-mono bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
                          Valid for 10m
                        </span>
                      </div>

                      <p className="text-[11px] text-indigo-700">
                        {isHindi 
                          ? `ओटीपी कोड ${forgotChannel === 'whatsapp' ? `व्हाट्सएप (+91 ${targetPhone || '7000212637'})` : targetEmail} पर भेजा गया है।` 
                          : `Code sent to ${forgotChannel === 'whatsapp' ? `WhatsApp (+91 ${targetPhone})` : targetEmail}.`}
                      </p>

                      {/* 1-Click WhatsApp Link Button */}
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-xs cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{isHindi ? '📲 1-क्लिक: व्हाट्सएप में खोलें और कोड देखें' : '📲 Open in WhatsApp to Receive OTP'}</span>
                        </a>
                      )}

                      {/* On-screen Instant OTP Banner */}
                      {receivedOtp && (
                        <div className="p-2.5 bg-white rounded-xl border border-indigo-200 flex items-center justify-between shadow-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 block">
                              {isHindi ? 'त्वरित सुरक्षा कोड (Instant Screen Code):' : 'Instant Verification Code:'}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {isHindi ? 'सीधे सत्यापन के लिए यह कोड दर्ज करें' : 'Code ready for direct confirmation'}
                            </span>
                          </div>
                          <span className="font-mono text-lg font-black tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-300">
                            {receivedOtp}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 6-digit input */}
                    <div className="space-y-1 text-center">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        {isHindi ? '6 अंकों का वेरिफिकेशन कोड दर्ज करें *' : 'Enter 6-Digit Verification Code *'}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        className="w-48 mx-auto px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-mono text-2xl font-black text-center tracking-widest text-slate-900 focus:bg-white focus:ring-4 focus:ring-amber-400/20 focus:border-amber-500 focus:outline-none transition-all"
                        required
                        autoFocus
                      />
                    </div>

                    {/* Resend OTP */}
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                      <span>{isHindi ? 'कोड नहीं मिला?' : "Didn't receive code?"}</span>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="font-bold text-amber-700 hover:text-amber-800 disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>
                          {resendCooldown > 0 
                            ? (isHindi ? `पुनः भेजें (${resendCooldown}s)` : `Resend in ${resendCooldown}s`)
                            : (isHindi ? 'कोड पुनः भेजें' : 'Resend OTP')}
                        </span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || inputOtp.length !== 6}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black py-3.5 rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
                    >
                      {loading ? (
                        <span>{isHindi ? 'सत्यापित किया जा रहा है...' : 'Verifying Code...'}</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>{isHindi ? 'कोड सत्यापित करें और विवरण देखें' : 'Verify Code & Reveal Details'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* STEP 3: REVEAL REGISTERED EMAIL & SET NEW PASSWORD + OPTIONALLY UPDATE EMAIL */}
                {forgotStep === 3 && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    
                    {/* Identity Discovery Card */}
                    <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-500/5 border-2 border-emerald-500 p-4 rounded-2xl space-y-2.5">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <strong className="text-xs sm:text-sm font-black text-emerald-950 block">
                            {isHindi ? '🎉 पहचान सत्यापित! आपकी पंजीकृत जानकारी:' : '🎉 Identity Verified! Registered Details Found:'}
                          </strong>
                          <span className="text-[11px] text-emerald-800">
                            {isHindi ? 'आपकी ईमेल आईडी और मोबाइल नंबर नीचे सुरक्षित रूप से खोज लिए गए हैं:' : 'Your registered credentials have been discovered successfully:'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {isHindi ? 'पंजीकृत ईमेल आईडी (Registered Email)' : 'Registered Email Address'}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-indigo-900 font-mono break-all">
                            {discoveredEmail || 'pkcinstitute@gmail.com'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            {isHindi ? 'पंजीकृत मोबाइल नंबर (Registered Mobile)' : 'Registered Mobile Number'}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-emerald-800 font-mono">
                            +91 {discoveredPhone || '7000212637'}
                          </span>
                        </div>
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
                          autoFocus
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

                    {/* Option to Change / Update Registered Email ID */}
                    <div className="space-y-1 pt-1 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                          {isHindi ? 'ईमेल आईडी बदलें (वैकल्पिक)' : 'Change / Update Email ID (Optional)'}
                        </label>
                        <span className="text-[10px] text-indigo-600 font-bold">
                          {isHindi ? 'अगर ईमेल बदलना चाहें' : 'Optional update'}
                        </span>
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="email"
                          value={updateEmail}
                          onChange={(e) => setUpdateEmail(e.target.value)}
                          placeholder="e.g. director@pkc.edu or yournewemail@gmail.com"
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {isHindi ? 'यदि आप पुराना ईमेल बदलना चाहते हैं तो यहाँ नई ईमेल लिखें, वरना पहले वाली ईमेल ही रहेगी।' : 'Change your registered email address if desired. Defaults to your current email.'}
                      </p>
                    </div>

                    {/* Option to Change / Update Registered Mobile Number */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                          {isHindi ? 'मोबाइल नंबर बदलें (वैकल्पिक)' : 'Change / Update Mobile Number (Optional)'}
                        </label>
                        <span className="text-[10px] text-indigo-600 font-bold">
                          {isHindi ? 'अगर नंबर बदलना चाहें' : 'Optional update'}
                        </span>
                      </div>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={updatePhone}
                          onChange={(e) => setUpdatePhone(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="e.g. 7000212637"
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm mt-2"
                    >
                      {loading ? (
                        <span>{isHindi ? 'क्रेडेंशियल्स सेव किए जा रहे हैं...' : 'Saving Credentials...'}</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>{isHindi ? 'क्रेडेंशियल्स सेव करें और लॉगिन करें' : 'Save Credentials & Enter Admin Portal'}</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

              </div>
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
