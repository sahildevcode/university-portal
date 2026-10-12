import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Mail, Smartphone, Key, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, X, Save, RefreshCw, Check
} from 'lucide-react';

export default function AdminProfileModal({ isOpen, onClose, lang = 'en' }) {
  const isHindi = lang === 'hi';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [name, setName] = useState('Institute Administrator');
  const [email, setEmail] = useState('pkcinstitute@gmail.com');
  const [phone, setPhone] = useState('7000212637');

  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccessMsg(null);
    setChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    const loadProfile = async () => {
      setFetching(true);
      try {
        const res = await fetch('/api/auth/admin-profile');
        const data = await res.json();
        if (data.success && data.admin) {
          if (data.admin.name) setName(data.admin.name);
          if (data.admin.email) setEmail(data.admin.email);
          if (data.admin.phone) setPhone(data.admin.phone);
        }
      } catch (e) {
        console.warn('Could not load admin profile:', e);
      } finally {
        setFetching(false);
      }
    };
    loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (changePassword) {
      if (newPassword.length < 4) {
        setError(isHindi ? 'नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'New password must be at least 4 characters long.');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(isHindi ? 'नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।' : 'New password and confirm password do not match.');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim().replace(/[^0-9]/g, '').slice(-10)
      };

      if (changePassword && newPassword) {
        payload.currentPassword = (currentPassword || '').trim();
        payload.newPassword = newPassword.trim();
      }

      const res = await fetch('/api/auth/admin-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isHindi ? 'प्रोफ़ाइल अपडेट करने में त्रुटि हुई।' : 'Failed to update admin profile.'));
      }

      // Sync active session in localStorage immediately
      try {
        const stored = localStorage.getItem('pkc_admin_user');
        if (stored) {
          const u = JSON.parse(stored);
          u.email = payload.email;
          u.phone = payload.phone;
          u.name = payload.name;
          localStorage.setItem('pkc_admin_user', JSON.stringify(u));
        }
      } catch (e) {}

      setSuccessMsg(
        isHindi 
          ? 'एडमिन ईमेल, मोबाइल नंबर व नया पासवर्ड सफलतापूर्वक सुरक्षित हो गए!' 
          : 'Admin profile, email, and password saved successfully!'
      );
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 flex justify-center items-center animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-slate-900 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/30">
                  {isHindi ? 'सुरक्षा व संपर्क नियंत्रण' : 'Directorate Security & Contact'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                  {isHindi ? 'एडमिन प्रोफ़ाइल व ईमेल/मोबाइल सेटिंग' : 'Admin Profile & Contact Settings'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Notifications */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-2xl flex items-center gap-2.5 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl flex items-center gap-2.5 font-bold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Display Name */}
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              {isHindi ? 'एडमिन का नाम (Administrator Name) *' : 'Administrator Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Institute Administrator"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text"
                required
              />
            </div>
          </div>

          {/* Registered Email ID */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                {isHindi ? 'पंजीकृत एडमिन ईमेल (Registered Email) *' : 'Registered Admin Email Address *'}
              </label>
              <span className="text-[10px] text-indigo-600 font-bold">
                {isHindi ? 'लॉगिन व रिकवरी में उपयोग' : 'Used for login & recovery'}
              </span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pkcinstitute@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {isHindi ? '💡 यदि आप अपनी आधिकारिक ईमेल बदलना चाहते हैं, तो यहाँ नई ईमेल दर्ज करें।' : 'Update your registered email anytime to receive alerts and OTPs.'}
            </p>
          </div>

          {/* Registered Mobile / WhatsApp Number */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                {isHindi ? 'पंजीकृत मोबाइल / व्हाट्सएप नंबर *' : 'Registered Mobile / WhatsApp Number *'}
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">
                {isHindi ? 'व्हाट्सएप OTP लॉगिन' : 'WhatsApp OTP Login'}
              </span>
            </div>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="7000212637"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400/30 focus:border-amber-500 focus:outline-none transition-all cursor-text font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {isHindi ? '💡 ईमेल भूल जाने पर आप इस 10-अंकों के मोबाइल नंबर से सीधे ओटीपी पा सकते हैं और लॉगिन कर सकते हैं।' : 'Enables 1-click WhatsApp OTP recovery and mobile-number direct login.'}
            </p>
          </div>

          {/* Collapsible Change Password Toggle */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                {isHindi ? 'पासवर्ड बदलना चाहते हैं?' : 'Change Admin Password?'}
              </span>
              <button
                type="button"
                onClick={() => setChangePassword(!changePassword)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {changePassword ? (isHindi ? 'रद्द करें' : 'Cancel') : (isHindi ? '+ नया पासवर्ड सेट करें' : '+ Set New Password')}
              </button>
            </div>

            {changePassword && (
              <div className="mt-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[10px] uppercase">
                    {isHindi ? 'वर्तमान पासवर्ड (वैकल्पिक / यदि याद हो)' : 'Current Password (Optional - leave blank if logged in)'}
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={isHindi ? "pkc@123 या खाली छोड़ें" : "pkc@123 or leave blank"}
                      className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[10px] uppercase">
                    {isHindi ? 'नया पासवर्ड (New Password) *' : 'New Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={isHindi ? "नया पासवर्ड (कम से कम 4 अक्षर)" : "New password (min. 4 chars)"}
                      className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-[10px] uppercase">
                    {isHindi ? 'नए पासवर्ड की पुष्टि करें *' : 'Confirm New Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isHindi ? "वही नया पासवर्ड दोबारा दर्ज करें" : "Re-enter new password"}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
            >
              {isHindi ? 'बंद करें' : 'Close'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>{isHindi ? 'सुरक्षित किया जा रहा है...' : 'Saving...'}</span>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>{isHindi ? 'सेव करें (Save Changes)' : 'Save Profile Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
