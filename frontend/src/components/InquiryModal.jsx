import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  PhoneCall, 
  Calendar, 
  User, 
  Mail, 
  MapPin, 
  Home, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { fireCelebration } from '../utils/confetti';
import { translations } from '../utils/translations';

export default function InquiryModal({ isOpen, onClose, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setAnimateIn(true);
      }, 40);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    phone: '',
    email: '',
    course: 'Bachelor of Computer Applications (BCA)',
    inquiryDate: new Date().toISOString().split('T')[0],
    city: '',
    address: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!shouldRender) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      fireCelebration({ x: 0.5, y: 0.5 });
      setSuccessMsg(t.successInquiry || 'Inquiry Submitted Successfully! Our counselor will call you within 24 hours.');
      setForm({
        name: '',
        fatherName: '',
        phone: '',
        email: '',
        course: 'Bachelor of Computer Applications (BCA)',
        inquiryDate: new Date().toISOString().split('T')[0],
        city: '',
        address: '',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error sending inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto transition-opacity duration-700 ease-out ${
        animateIn ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto transform transition-all duration-700 ease-out ${
          animateIn ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-6'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#071530] via-[#0d234d] to-[#071530] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-[#C59B27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-amber-400 shrink-0 shadow">
              <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded">
                  {lang === 'hi' ? 'प्रवेश पूछताछ 2026-27' : 'Admissions Open 2026-27'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
              </div>
              <h3 className="font-serif-academic text-base sm:text-lg font-bold text-white leading-snug">
                {lang === 'hi' ? 'छात्र प्रवेश पूछताछ फॉर्म (Inquiry Form)' : 'Student Admission Inquiry Form'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto space-y-4 text-xs">
          {successMsg ? (
            <div className="text-center py-8 px-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">
                  {lang === 'hi' ? 'पूछताछ सफलतापूर्वक दर्ज हो गई!' : 'Inquiry Submitted Successfully!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  {successMsg}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2 text-left">
                <div className="text-[11px] font-bold text-slate-700">
                  {lang === 'hi' ? 'तत्काल सहायता के लिए संपर्क करें:' : 'Immediate Counseling Helpline:'}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://wa.me/917000212637?text=Hello%20PKC%20Institute%2C%20I%20have%20submitted%20an%20admission%20inquiry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <span>WhatsApp Chat</span>
                  </a>
                  <a
                    href="tel:+917000212637"
                    className="flex-1 py-2 px-3 bg-[#071530] hover:bg-[#0a1f44] text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <span>Call Helpline: 7000212637</span>
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer text-xs"
                >
                  {lang === 'hi' ? 'वेबसाइट देखें (Close)' : 'Browse University Portal'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-900 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <p className="text-slate-500 text-[11.5px] leading-relaxed">
                {lang === 'hi' 
                  ? 'कृपया अपनी जानकारी दर्ज करें ताकि हमारे काउंसलर आपको कोर्स, फीस एवं छात्रवृत्ति संबंधी मार्गदर्शन प्रदान कर सकें।'
                  : 'Please fill in your details to receive personalized counseling regarding course eligibility, fees, and government scholarship support.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Student Full Name * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{t.formName || 'Student Full Name *'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.formNamePlh || 'e.g. Amit Kumar'}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Father's Name * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{t.formFatherName || "Father's Name *"}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.formFatherNamePlh || 'e.g. Shri Rajesh Kumar'}
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Mobile / WhatsApp Number * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.formPhone || 'Mobile / WhatsApp Number *'}</span>
                  </label>
                  <input
                    type="tel"
                    placeholder={t.formPhonePlh || 'e.g. 9876543210'}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Email Address * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.formEmail || 'Email Address *'}</span>
                  </label>
                  <input
                    type="email"
                    placeholder={t.formEmailPlh || 'e.g. student@gmail.com'}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Interested Course * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{t.formCourse || 'Interested Course *'}</span>
                  </label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  >
                    <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                    <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                    <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                    <option value="Diploma in Computer Applications (DCA)">Diploma in Computer Applications (DCA)</option>
                    <option value="Post Graduate Diploma in Computer Applications (PGDCA)">PGDCA</option>
                    <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science</option>
                    <option value="Bachelor of Science (B.Sc)">Bachelor of Science (B.Sc)</option>
                    <option value="Bachelor of Commerce (B.Com)">Bachelor of Commerce (B.Com)</option>
                    <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                  </select>
                </div>

                {/* Inquiry Date * */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{t.formInquiryDate || 'Inquiry Date *'}</span>
                  </label>
                  <input
                    type="date"
                    value={form.inquiryDate}
                    onChange={(e) => setForm({ ...form, inquiryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* City / District * */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t.formCity || 'City / District *'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.formCityPlh || 'e.g. Chhatarpur, Sagar, Bhopal'}
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Full Address * */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.formAddress || 'Full Address *'}</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t.formAddressPlh || 'e.g. Beside Govt Girls College, Panna Road, Choubey Colony, Chhatarpur'}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                    required
                  />
                </div>

                {/* Question / Query (Optional) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.formMessage || 'Your Question / Query (Optional)'}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.formMessagePlh || 'Ask anything regarding admission dates, syllabus, exams...'}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-normal text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-[#071530] hover:bg-[#0a1f44] text-white font-bold py-3 px-6 rounded-lg text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{submitting ? (t.submittingBtn || 'Submitting...') : (t.submitBtn || 'Submit Inquiry Now')}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  {lang === 'hi' ? 'बाद में पूछें (Cancel)' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
