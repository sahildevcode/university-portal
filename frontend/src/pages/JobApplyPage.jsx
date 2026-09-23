import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  GraduationCap, 
  MapPin, 
  FileText, 
  Building2,
  Award,
  UploadCloud,
  X,
  FileCheck
} from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export default function JobApplyPage({ lang = 'en' }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    role: 'Academic Counselor',
    qualification: 'Graduate',
    experience: 'Fresher',
    city: '',
    coverNote: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeBase64, setResumeBase64] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setResumeFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      setResumeBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setResumeFile(null);
    setResumeBase64('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    setLoading(true);

    const newApp = {
      id: `app-${Date.now()}`,
      ...formData,
      resumeFileName: resumeFile?.name || '',
      resumeFileSize: resumeFile?.size || '',
      resumeBase64: resumeBase64 || '',
      date: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    };

    // Save locally
    try {
      const saved = localStorage.getItem('pkc_job_applications');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newApp);
      localStorage.setItem('pkc_job_applications', JSON.stringify(list));
    } catch (err) {
      console.error('Error saving local application:', err);
    }

    // Try posting to backend API
    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      await fetch(`${apiBase}/api/job-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch (err) {
      console.log('Backend sync notice (saved locally):', err);
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      fireCelebration({ x: 0.5, y: 0.5 });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/10 px-4 py-1.5 rounded-full border border-[#C59B27]/30 inline-flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-amber-500" />
            <span>CAREERS AT PKC INSTITUTE</span>
          </span>
          <h1 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-black text-[#071530] tracking-tight">
            Job Application &amp; Recruitment Form
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Join PKC Education Learning Institute &amp; Consultancy. Build a rewarding career in higher education counseling, computer training, administration, and student management.
          </p>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#071530] block">Competitive Salary</strong>
              <span className="text-[11px] text-slate-500">Best in education sector</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#071530] block">Professional Campus</strong>
              <span className="text-[11px] text-slate-500">Chhatarpur (M.P.) Head Office</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-xs font-bold text-[#071530] block">Growth &amp; Learning</strong>
              <span className="text-[11px] text-slate-500">Career advancement support</span>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Form Header Banner */}
          <div className="bg-[#071530] text-white p-6 sm:p-8 border-b border-[#C59B27]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase text-[#C59B27] tracking-widest block">ONLINE APPLICATION</span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-academic text-white">Fill Candidate Details Below</h2>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30 shrink-0">
              🟢 HIRING ACTIVE 2026
            </span>
          </div>

          <div className="p-6 sm:p-10">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif-academic text-2xl font-black text-[#071530]">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you <strong>{formData.fullName}</strong>. Your application for <strong>{formData.role}</strong> and uploaded resume have been registered with PKC Education HR desk. We will review your profile and contact you soon.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      fullName: '',
                      phone: '',
                      email: '',
                      role: 'Academic Counselor',
                      qualification: 'Graduate',
                      experience: 'Fresher',
                      city: '',
                      coverNote: ''
                    });
                    removeFile();
                  }}
                  className="mt-4 px-6 py-2.5 bg-[#071530] text-[#C59B27] font-bold text-xs rounded-xl hover:bg-[#0a1f44] transition-all cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-600" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Verma"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    />
                  </div>

                  {/* Mobile / WhatsApp Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mobile / WhatsApp Number *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    />
                  </div>

                  {/* Position Applied For */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      <span>Position / Role Applied For *</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    >
                      <option value="Academic Counselor">Academic Counselor / Admission Executive</option>
                      <option value="Computer Faculty / Trainer">Computer Faculty / IT Trainer (DCA/PGDCA/Python)</option>
                      <option value="Office Administrator">Office Administrator / Desk Executive</option>
                      <option value="Digital Marketing Executive">Digital Marketing &amp; Telecalling Executive</option>
                      <option value="Accounts & Cash Counter">Accounts &amp; Cash Counter Executive</option>
                      <option value="Other">Other Role</option>
                    </select>
                  </div>

                  {/* Highest Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Highest Qualification *</span>
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    >
                      <option value="Graduate">Graduate (BA, B.Sc, B.Com, BBA, BCA, B.Tech)</option>
                      <option value="Postgraduate">Postgraduate (MA, M.Sc, M.Com, MBA, MCA, M.Tech)</option>
                      <option value="Diploma Holder">Computer Diploma (DCA / PGDCA)</option>
                      <option value="Ph.D / Doctorate">Ph.D / Doctorate</option>
                      <option value="12th Passed">12th Standard Passed</option>
                    </select>
                  </div>

                  {/* Total Work Experience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Total Work Experience</span>
                    </label>
                    <select
                      value={formData.experience}
                      onChange={e => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                    >
                      <option value="Fresher">Fresher (0 Years)</option>
                      <option value="1-2 Years">1 to 2 Years</option>
                      <option value="3-5 Years">3 to 5 Years</option>
                      <option value="5+ Years Experience">5+ Years Experience</option>
                    </select>
                  </div>
                </div>

                {/* City / Current Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600" />
                    <span>Current City / Location *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chhatarpur, Sagar, Satna, Bhopal"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                  />
                </div>

                {/* Cover Note / Skills Details */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Skills / Profile Summary &amp; Experience Details *</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your work experience, computer skills, communication abilities, or previous job background..."
                    value={formData.coverNote}
                    onChange={e => setFormData({ ...formData, coverNote: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]"
                  />
                </div>

                {/* RESUME UPLOAD SECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-[#C59B27]" />
                      <span>Upload Resume / CV (PDF, DOC, DOCX, Image) *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Max file size: 10MB</span>
                  </label>

                  {resumeFile ? (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-emerald-950 block">{resumeFile.name}</strong>
                          <span className="text-[10.5px] text-emerald-700 font-semibold">{resumeFile.size} • Ready for upload</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-amber-300 hover:border-[#C59B27] bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer transition-all group">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-[#071530] text-[#C59B27] flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#071530] block">
                        Click here to upload your Resume / CV file
                      </span>
                      <span className="text-[10.5px] text-slate-500 mt-1">
                        Supports PDF, Word Documents (.doc, .docx) &amp; Images
                      </span>
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#071530] via-[#0A1931] to-indigo-950 hover:from-[#0a1f44] hover:to-indigo-900 text-white font-black py-4 rounded-2xl shadow-xl text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 border border-amber-400/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {loading ? (
                    <span>SUBMITTING APPLICATION &amp; RESUME...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>SUBMIT JOB APPLICATION NOW</span>
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
