import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  PhoneCall, 
  Mail, 
  Calendar, 
  User, 
  Briefcase, 
  RefreshCw, 
  Globe, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  MapPin
} from 'lucide-react';
import JobApplicationsManager from './JobApplicationsManager';

// Authentic WhatsApp SVG Icon Component
function WhatsAppIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function StudentInquirySection({ lang = 'en', toggleLang }) {
  const isHindi = lang === 'hi';

  // View modes: 'all' | 'inquiries' | 'jobs'
  const [activeSubTab, setActiveSubTab] = useState('all');
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isHindi ? `पूछताछ की स्थिति "${newStatus}" अपडेट हो गई।` : `Inquiry status updated to "${newStatus}".`);
        loadInquiries();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to update status');
      }
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handleDelete = async (id, studentName) => {
    const confirmText = isHindi 
      ? `क्या आप वाकई "${studentName || 'इस छात्र'}" की पूछताछ हटाना चाहते हैं?` 
      : `Are you sure you want to delete inquiry for "${studentName || 'this student'}"?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(isHindi ? 'पूछताछ सफलतापूर्वक हटा दी गई।' : 'Inquiry deleted successfully.');
        loadInquiries();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (err) {
      setErrorMsg(err.message);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Filtered inquiries
  const safeInquiries = (inquiries || []).filter(inq => inq && typeof inq === 'object');
  const filteredInquiries = safeInquiries.filter(inq => {
    const matchStatus = statusFilter === 'all' || inq.status === statusFilter;
    const q = (search || '').toLowerCase();
    const matchSearch = !q || (
      String(inq.name || inq.fullName || '').toLowerCase().includes(q) ||
      String(inq.fatherName || '').toLowerCase().includes(q) ||
      String(inq.phone || '').includes(q) ||
      String(inq.course || '').toLowerCase().includes(q) ||
      String(inq.city || '').toLowerCase().includes(q) ||
      String(inq.address || '').toLowerCase().includes(q) ||
      String(inq.email || '').toLowerCase().includes(q) ||
      String(inq.inquiryDate || '').includes(q)
    );
    return matchStatus && matchSearch;
  });

  const pendingCount = safeInquiries.filter(i => (i.status || 'New') === 'New').length;
  const contactedCount = safeInquiries.filter(i => i.status === 'Contacted').length;

  return (
    <div className="space-y-6 text-slate-900 animate-fadeIn font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071530] via-[#0A1931] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#C59B27]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#C59B27]/20 text-[#C59B27] flex items-center justify-center font-bold shadow-md">
              <HelpCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C59B27] bg-[#C59B27]/15 px-3 py-0.5 rounded-full border border-[#C59B27]/30">
                  {isHindi ? 'प्रवेश पूछताछ एवं भर्ती डेस्क' : 'STUDENT LEADS & RECRUITMENT DESK'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
                {isHindi ? 'छात्र पूछताछ (Student Inquiry)' : 'Student Inquiry'}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHindi 
                  ? 'छात्र पोर्टल से आने वाली ऑनलाइन प्रवेश पूछताछ एवं उम्मीदवारों के जॉब रेज्यूमे (Resumes) देखें व प्रबंधित करें।' 
                  : 'Manage online admission inquiries, student leads, father names, addresses, and candidate job resumes.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => { if (typeof toggleLang === 'function') toggleLang(); }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>

            <button
              onClick={loadInquiries}
              disabled={loading}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
              title="Refresh Inquiries"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
            </button>

            <div className="bg-[#C59B27] text-slate-950 px-4 py-2 rounded-2xl shadow-md text-right shrink-0">
              <span className="text-[10px] font-black uppercase block text-slate-900 leading-tight">NEW LEADS</span>
              <span className="text-lg font-black text-slate-950 leading-none">
                {pendingCount} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">✕</button>
        </div>
      )}

      {/* Sub-Tabs: All in One vs Inquiries vs Resumes */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-[#071530] text-[#C59B27] shadow-md font-black ring-1 ring-[#C59B27]/40'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>📋 {isHindi ? 'दोनों एक साथ देखें' : 'View Both (Inquiries + Resumes)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'inquiries'
                ? 'bg-[#071530] text-[#C59B27] shadow-md font-black ring-1 ring-[#C59B27]/40'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-500" />
            <span>📩 {isHindi ? 'छात्र पूछताछ' : 'Student Inquiries'} ({inquiries.length})</span>
            {pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount} New
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('jobs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'jobs'
                ? 'bg-[#071530] text-[#C59B27] shadow-md font-black ring-1 ring-[#C59B27]/40'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>💼 {isHindi ? 'जॉब रेज्यूमे' : 'Job Applications & Resumes'}</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-semibold px-2">
          <span>Total Inquiries: <strong className="text-slate-900">{inquiries.length}</strong></span>
          <span className="mx-2">•</span>
          <span>Contacted: <strong className="text-emerald-700">{contactedCount}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 📩 STUDENT INQUIRIES DESK */}
      {/* ========================================================================= */}
      {(activeSubTab === 'inquiries' || activeSubTab === 'all') && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          {activeSubTab === 'all' && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  📩 {isHindi ? 'छात्र प्रवेश पूछताछ (Student Inquiries)' : 'Student Admission Inquiries'}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {inquiries.length} Leads
              </span>
            </div>
          )}
          
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student, father, phone, course, city..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600">Filter Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#071530] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('New')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'New'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                New ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Contacted')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'Contacted'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Contacted ({contactedCount})
              </button>
            </div>
          </div>

          {/* Inquiries Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#071530] text-[#C59B27] font-black uppercase text-[10.5px] tracking-wider select-none">
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap">Inquiry Date</th>
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap min-w-[170px]">Student &amp; Father Name</th>
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap min-w-[190px]">Contact Details</th>
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap min-w-[180px]">Course Interested</th>
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap min-w-[190px]">City &amp; Address</th>
                  <th className="p-3.5 border-r border-slate-800 whitespace-nowrap min-w-[160px]">Message / Query</th>
                  <th className="p-3.5 border-r border-slate-800 text-center whitespace-nowrap">Status</th>
                  <th className="p-3.5 text-right whitespace-nowrap min-w-[160px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                      Loading inquiries desk...
                    </td>
                  </tr>
                ) : filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center bg-slate-50">
                      <div className="max-w-sm mx-auto space-y-2">
                        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="text-sm font-bold text-slate-800">
                          {search ? `No inquiries matching "${search}"` : 'No inquiries found in this category'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          When students submit inquiries from the website popup or page, they will show up here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inq) => {
                    const studentName = inq.fullName || inq.name || 'Anonymous Student';
                    const cleanPhone = String(inq.phone || '').replace(/\D/g, '');
                    const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hello ${studentName}, this is PKC Education Learning Institute regarding your admission inquiry for ${inq.course || 'degree course'}.`)}`;
                    const displayDate = inq.inquiryDate || (inq.createdAt ? (String(inq.createdAt).includes('T') ? String(inq.createdAt).split('T')[0] : String(inq.createdAt).slice(0, 10)) : 'N/A');

                    return (
                      <tr key={inq.id} className="hover:bg-amber-50/20 transition-colors">
                        {/* Inquiry Date */}
                        <td className="p-3.5 whitespace-nowrap border-r border-slate-100 text-slate-700 font-bold font-mono">
                          {displayDate}
                        </td>

                        {/* Student & Father Name */}
                        <td className="p-3.5 border-r border-slate-100">
                          <div className="font-bold text-slate-900 text-sm">{studentName}</div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                            <span className="font-semibold text-slate-600">Father:</span>
                            <span className="text-slate-800">{inq.fatherName || 'N/A'}</span>
                          </div>
                        </td>

                        {/* Contact Details */}
                        <td className="p-3.5 border-r border-slate-100">
                          <div className="flex items-center gap-2">
                            <a 
                              href={`tel:${inq.phone}`} 
                              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-mono"
                              title="Call Student"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{inq.phone || 'N/A'}</span>
                            </a>

                            {inq.phone && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white rounded border border-[#25D366]/40 transition-colors flex items-center gap-1 text-[10px] font-bold"
                                title="Chat on WhatsApp"
                              >
                                <WhatsAppIcon className="w-3 h-3 fill-current" />
                                <span>WhatsApp</span>
                              </a>
                            )}
                          </div>

                          {inq.email && (
                            <div className="text-[11px] text-slate-500 truncate max-w-[190px] mt-1 flex items-center gap-1" title={inq.email}>
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{inq.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Course Interested */}
                        <td className="p-3.5 border-r border-slate-100">
                          <span className="font-bold text-indigo-900 bg-indigo-50/80 px-2 py-1 rounded-md border border-indigo-100 block text-xs">
                            {inq.course || 'General Admission'}
                          </span>
                        </td>

                        {/* City & Address */}
                        <td className="p-3.5 border-r border-slate-100">
                          <div className="font-bold text-slate-800">{inq.city || 'N/A'}</div>
                          <div className="text-[11px] text-slate-500 max-w-[210px] leading-snug mt-0.5 line-clamp-2" title={inq.address}>
                            {inq.address || 'N/A'}
                          </div>
                        </td>

                        {/* Message / Query */}
                        <td className="p-3.5 border-r border-slate-100">
                          {inq.message ? (
                            <div className="text-[11px] text-slate-600 italic max-w-[180px] line-clamp-2" title={inq.message}>
                              "{inq.message}"
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">-</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 border-r border-slate-100 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border ${
                            inq.status === 'Contacted' 
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : inq.status === 'Enrolled'
                                ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          }`}>
                            {inq.status || 'New'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                          {inq.status !== 'Contacted' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(inq.id, 'Contacted')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10.5px] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                              title="Mark as Contacted"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Mark Contacted</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(inq.id, 'New')}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10.5px] transition-colors cursor-pointer border border-slate-300"
                              title="Reset to New"
                            >
                              <span>Reset</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(inq.id, studentName)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: 💼 CANDIDATE RESUMES & RECRUITMENT (BELOW INQUIRIES) */}
      {/* ========================================================================= */}
      {(activeSubTab === 'jobs' || activeSubTab === 'all') && (
        <div className="space-y-4 pt-2">
          {activeSubTab === 'all' && (
            <div className="flex items-center gap-3 pt-4 pb-1">
              <div className="h-px bg-slate-300 flex-1" />
              <div className="flex items-center gap-2 bg-[#071530] text-[#C59B27] px-4 py-1.5 rounded-full shadow-sm text-xs font-black uppercase tracking-wider border border-[#C59B27]/30">
                <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                <span>💼 {isHindi ? 'जॉब एप्लीकेशन एवं उम्मीदवार रेज्यूमे (Job Resumes)' : 'Job Applications & Candidate Resumes'}</span>
              </div>
              <div className="h-px bg-slate-300 flex-1" />
            </div>
          )}
          <JobApplicationsManager lang={lang} />
        </div>
      )}

    </div>
  );
}
