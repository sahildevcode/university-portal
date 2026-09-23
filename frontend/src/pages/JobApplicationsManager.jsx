import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Trash2, 
  FileText, 
  Download, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Award, 
  Clock, 
  CheckCircle2, 
  User, 
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export default function JobApplicationsManager({ lang = 'en' }) {
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      const res = await fetch(`${apiBase}/api/job-applications`);
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      } else {
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } catch (err) {
      console.log('Error fetching job applications from API, loading local:', err);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('pkc_job_applications');
      if (saved) {
        setApplications(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate application?')) return;

    try {
      const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
      await fetch(`${apiBase}/api/job-applications/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.log('API delete failed, updating local state:', err);
    }

    const updated = applications.filter(a => a.id !== id);
    setApplications(updated);
    try {
      localStorage.setItem('pkc_job_applications', JSON.stringify(updated));
    } catch (e) {}

    if (selectedApp?.id === id) setSelectedApp(null);
  };

  const filtered = applications.filter(app => {
    const matchRole = roleFilter === 'all' || app.role === roleFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = (
      (app.fullName || '').toLowerCase().includes(q) ||
      (app.phone || '').toLowerCase().includes(q) ||
      (app.email || '').toLowerCase().includes(q) ||
      (app.city || '').toLowerCase().includes(q) ||
      (app.role || '').toLowerCase().includes(q)
    );
    return matchRole && matchSearch;
  });

  const downloadResume = (app) => {
    if (app.resumeFileUrl) {
      window.open(app.resumeFileUrl, '_blank');
      return;
    }
    if (app.resumeBase64) {
      const link = document.createElement('a');
      link.href = app.resumeBase64;
      link.download = app.resumeFileName || `${app.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    alert('No attached resume file found for this applicant.');
  };

  return (
    <div className="space-[#071530] space-y-6 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="bg-[#071530] text-white p-6 sm:p-8 rounded-3xl border border-[#C59B27]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-[#C59B27]/20 border border-[#C59B27]/40 px-3 py-1 rounded-full text-[#C59B27] text-xs font-black uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>RECRUITMENT &amp; JOB APPLICATIONS DESK</span>
          </div>
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-black text-white">
            Candidate Job Applications &amp; Resumes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            View submitted job applications, candidate experience notes, and download uploaded resume files.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="bg-[#C59B27] text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
            <span>TOTAL APPLICANTS:</span>
            <span className="bg-slate-950 text-[#C59B27] px-2 py-0.5 rounded-md font-mono text-sm">{applications.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, phone, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="all">All Positions ({applications.length})</option>
            <option value="Academic Counselor">Academic Counselor</option>
            <option value="Computer Faculty / Trainer">Computer Faculty</option>
            <option value="Office Administrator">Office Administrator</option>
            <option value="Digital Marketing Executive">Digital Marketing</option>
            <option value="Accounts & Cash Counter">Accounts & Cash Counter</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Job Applications Found</h3>
          <p className="text-xs text-slate-500">When candidates submit their job applications on the website, their details & uploaded resumes will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#071530] text-[#C59B27] font-black uppercase text-[10.5px] tracking-wider">
                  <th className="p-4">Candidate Name</th>
                  <th className="p-4">Role Applied</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Qualification</th>
                  <th className="p-4">Location</th>
                  <th className="p-4 text-center">Uploaded Resume</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Submitted: {app.date || new Date().toLocaleDateString('en-IN')}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="bg-amber-100 text-amber-900 font-black px-2.5 py-1 rounded-md text-[10.5px] border border-amber-300 inline-block">
                        {app.role}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">Exp: <strong>{app.experience || 'Fresher'}</strong></div>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a>
                      </div>
                      {app.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{app.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-800 font-bold">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{app.qualification || 'Graduate'}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{app.city || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Resume Column */}
                    <td className="p-4 text-center">
                      {(app.resumeBase64 || app.resumeFileUrl || app.resumeFileName) ? (
                        <button
                          onClick={() => downloadResume(app)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-[10.5px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          title="Click to Download/View Resume"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resume ({app.resumeFileName ? (app.resumeFileName.length > 15 ? app.resumeFileName.substring(0, 12) + '...' : app.resumeFileName) : 'Download'})</span>
                          <Download className="w-3 h-3 text-emerald-600 ml-0.5" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No Resume Uploaded</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="View Application Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden space-y-4">
            {/* Modal Header */}
            <div className="bg-[#071530] text-white p-6 border-b border-[#C59B27]/40 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#C59B27] tracking-wider block">CANDIDATE APPLICATION DETAILS</span>
                <h3 className="text-xl font-bold font-serif-academic text-white">{selectedApp.fullName}</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Position Applied</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.role}</strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Experience</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.experience}</strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Phone / WhatsApp</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.phone}</strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Email Address</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.email || 'N/A'}</strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Qualification</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.qualification}</strong>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">City / Location</span>
                  <strong className="text-slate-900 text-sm block mt-0.5">{selectedApp.city}</strong>
                </div>
              </div>

              {/* Cover Note / Skills */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">Candidate Cover Note &amp; Skills Summary:</span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                  {selectedApp.coverNote || 'No cover note provided.'}
                </div>
              </div>

              {/* Resume Card */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#071530] block">
                      Candidate Resume Document
                    </strong>
                    <span className="text-[11px] text-slate-500 block">
                      {selectedApp.resumeFileName || 'Uploaded Resume File'} {selectedApp.resumeFileSize ? `(${selectedApp.resumeFileSize})` : ''}
                    </span>
                  </div>
                </div>

                {(selectedApp.resumeBase64 || selectedApp.resumeFileUrl) ? (
                  <button
                    onClick={() => downloadResume(selectedApp)}
                    className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download Resume</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">No File</span>
                )}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 bg-[#071530] text-white font-bold text-xs rounded-xl hover:bg-[#0a1f44] cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
