import React, { useState } from 'react';
import { 
  Send, 
  PhoneCall, 
  MessageSquare, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function InquiryPage({ courses = [], lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: courses[0]?.name || 'Bachelor of Computer Applications (BCA)',
    city: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

      setSuccessMsg(t.successInquiry);
      setForm({
        name: '',
        phone: '',
        email: '',
        course: courses[0]?.name || 'Bachelor of Computer Applications (BCA)',
        city: '',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 text-slate-900 font-sans">
      
      {/* Header (Northfield University Style) */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27] bg-[#C59B27]/10 px-3.5 py-1 rounded-sm border border-[#C59B27]/30">
          {lang === 'hi' ? 'निःशुल्क प्रवेश एवं कैरियर सहायता' : 'DIRECT ADMISSION GUIDANCE'}
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-bold text-[#071530] tracking-tight">
          {t.inquiryHeading}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.inquirySubheading}
        </p>
      </div>

      {/* Main Grid: Form (7 cols) | Contact Info & Helpline (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif-academic text-xl font-bold text-[#071530] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#C59B27]" />
              <span>{lang === 'hi' ? 'प्रवेश पूछताछ फॉर्म (Admission Inquiry Form)' : 'Student Inquiry Form'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'अपनी जानकारी दर्ज करें, हमारी टीम आपको आवश्यक मार्गदर्शन देगी।' : 'Submit your query and our expert admissions counselor will reach out.'}
            </p>
          </div>

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-900 text-xs font-bold flex items-start gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{successMsg}</p>
                <p className="text-[11px] font-normal text-emerald-800">
                  {lang === 'hi' ? 'तत्काल सहायता के लिए नीचे दिए गए व्हाट्सएप या हेल्पलाइन नंबर पर भी संपर्क कर सकते हैं।' : 'For immediate assistance, you can also reach us directly via WhatsApp.'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-900 text-xs font-bold flex items-center gap-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {t.formName}
                </label>
                <input
                  type="text"
                  placeholder={t.formNamePlh}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                  required
                />
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {t.formPhone}
                </label>
                <input
                  type="tel"
                  placeholder={t.formPhonePlh}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                  required
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {t.formEmail}
                </label>
                <input
                  type="email"
                  placeholder={t.formEmailPlh}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                />
              </div>

              {/* Course Interested */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {t.formCourse}
                </label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                  required
                >
                  {courses && courses.length > 0 ? (
                    courses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.code})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                      <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                      <option value="Diploma in Computer Applications (DCA)">Diploma in Computer Applications (DCA)</option>
                      <option value="Post Graduate Diploma in Computer Applications (PGDCA)">PGDCA</option>
                      <option value="B.Tech Computer Science & Engineering">B.Tech Computer Science</option>
                      <option value="Bachelor of Science (B.Sc)">Bachelor of Science (B.Sc)</option>
                    </>
                  )}
                </select>
              </div>

              {/* City / District */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 block">
                  {t.formCity}
                </label>
                <input
                  type="text"
                  placeholder={t.formCityPlh}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                />
              </div>

              {/* Message / Query */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-700 block">
                  {t.formMessage}
                </label>
                <textarea
                  rows={3}
                  placeholder={t.formMessagePlh}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg font-normal text-slate-900 focus:bg-white focus:outline-none focus:border-[#071530]"
                />
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#071530] hover:bg-[#0a1f44] text-white font-bold py-3.5 px-6 rounded-md text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#C59B27]" />
                <span>{submitting ? t.submittingBtn : t.submitBtn}</span>
              </button>
            </div>

          </form>

        </div>

        {/* Contact Info & Helpline Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Office Visit Card */}
          <div className="bg-[#071530] text-white rounded-xl p-6 sm:p-8 space-y-6 shadow-xl border border-[#C59B27]/40">
            <div>
              <span className="text-[10px] font-black text-[#C59B27] uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
                {t.directContact}
              </span>
              <h3 className="font-serif-academic text-xl font-bold text-white mt-2">
                PKC Education Learning Institute
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                P.K.C. Shiksha Prasar Evam Jan Kalyan Samiti
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 text-[#C59B27] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">Campus Address:</strong>
                  <span className="text-slate-300">{t.officeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 text-[#C59B27] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">Working Hours:</strong>
                  <span className="text-slate-300">{t.officeHours}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 text-[#C59B27] flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-white font-semibold">Direct Helpline:</strong>
                  <span className="text-[#C59B27] font-bold">+91 7000212637</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Call */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
              <a
                href="https://wa.me/917000212637?text=Hello%20PKC%20Institute%2C%20I%20want%20to%20inquire%20about%20university%20admission"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-md text-xs shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href="tel:+917000212637"
                className="flex items-center justify-center gap-1.5 bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black py-2.5 px-3 rounded-md text-xs shadow-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Desk</span>
              </a>
            </div>

          </div>

          {/* Trust Guarantees */}
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-[#071530] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C59B27]" />
              <span>{lang === 'hi' ? 'पी.के.सी. परामर्श के मुख्य लाभ' : 'Why Consult With PKC Institute?'}</span>
            </h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Free initial career guidance &amp; course assessment</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Complete documentation &amp; MPTASS scholarship assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated exam desk, admit card &amp; academic counseling support</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
