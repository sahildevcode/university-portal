import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, BookOpen, Plus, Edit3, Trash2, Users, CreditCard, 
  CheckCircle2, AlertCircle, Save, LogOut, Layers, Star,
  UserCheck, Key, Lock, Eye, EyeOff, FolderCheck, Globe, ChevronDown, Building2,
  Copy, Check, ExternalLink
} from 'lucide-react';
import SyllabusManager from './SyllabusManager';
import AccountsDashboard from './AccountsDashboard';
import StudentList from './StudentList';
import StudentRegistration from './StudentRegistration';
import StudentDocumentsTracker from './StudentDocumentsTracker';
import WebsiteCmsManager from './WebsiteCmsManager';
import UniversityPaidManager from './UniversityPaidManager';

export default function AdminPortal({ adminUser, courses, onRefreshCourses, onLogout }) {
  const [activeTab, setActiveTab] = useState('syllabus');
  const [admissionSubTab, setAdmissionSubTab] = useState('directory');
  const [localCourses, setLocalCourses] = useState(courses || []);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [staffLinkCopied, setStaffLinkCopied] = useState(false);

  const handleCopyStaffLink = () => {
    const staffUrl = `${window.location.origin}/staff`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(staffUrl);
    }
    setStaffLinkCopied(true);
    setTimeout(() => setStaffLinkCopied(false), 3000);
  };

  // Add / Edit Course Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    name: '', code: '', department: 'School of Computing & Management',
    durationYears: 3, totalSemesters: 6, totalFee: 180000, feePerSemester: 30000,
    eligibility: '10+2 with minimum 50% aggregate marks', description: ''
  });

  // Add Staff Modal
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '', username: '', password: '',
    role: 'Cash Counter & Admission Desk', department: 'Accounts & Admissions'
  });
  const [showStaffPasswords, setShowStaffPasswords] = useState({});

  useEffect(() => {
    setLocalCourses(courses || []);
  }, [courses]);

  const fetchStaffData = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success) setStaffList(data.staff || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleOpenAddCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      name: '', code: '', department: 'School of Computing & Management',
      durationYears: 3, totalSemesters: 6, totalFee: 180000, feePerSemester: 30000,
      eligibility: '10+2 with minimum 50% aggregate marks',
      description: 'Comprehensive curriculum recognized under UGC guidelines.'
    });
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      name: course.name, code: course.code, department: course.department || 'School of Management',
      durationYears: course.durationYears || 3, totalSemesters: course.totalSemesters || 6,
      totalFee: course.totalFee || 150000, feePerSemester: course.feePerSemester || 25000,
      eligibility: course.eligibility || '10+2', description: course.description || ''
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingCourseId ? `/api/courses/${editingCourseId}` : '/api/courses';
      const method = editingCourseId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save course');

      setShowCourseModal(false);
      setSuccessMsg(editingCourseId ? 'Course updated successfully!' : 'New course added successfully!');
      if (onRefreshCourses) onRefreshCourses();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && onRefreshCourses) onRefreshCourses();
    } catch (err) { alert('Failed to delete course'); }
  };

  // Staff Handlers
  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create staff account');

      setShowStaffModal(false);
      setStaffForm({
        name: '', username: '', password: '',
        role: 'Cash Counter & Admission Desk', department: 'Accounts & Admissions'
      });
      setSuccessMsg(data.message);
      fetchStaffData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteStaff = async (id, staffName) => {
    if (!window.confirm(`Are you sure you want to delete staff account for "${staffName}"?`)) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Staff account "${staffName}" removed.`);
        fetchStaffData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) { alert('Failed to delete staff member'); }
  };

  const adminModules = [
    { 
      id: 'syllabus', 
      label: 'Universities & Courses', 
      fullName: 'Universities, Affiliated Colleges & Curricula Master Hub',
      sub: 'यूनिवर्सिटीज, संबद्ध कॉलेज, ब्रांच/कोर्स व सिलेबस प्रबंधन',
      icon: Building2, 
      color: 'text-indigo-600',
      badge: 'MPU • 18 Colleges'
    },
    { 
      id: 'cashcounter', 
      label: 'Fee & Cash Counter', 
      fullName: 'Cash Counter Fee & Accounts Layer',
      sub: 'छात्र फीस रसीद, बकाया व खजाना लेजर',
      icon: CreditCard, 
      color: 'text-emerald-600',
      badge: 'Live Counter'
    },
    { 
      id: 'admissions', 
      label: 'Student Admissions', 
      fullName: 'Enrolled Students Directory & Admissions',
      sub: 'सभी नामांकित छात्र व नए प्रवेश रिकॉर्ड',
      icon: Users, 
      color: 'text-blue-600',
      badge: 'Admissions'
    },
    { 
      id: 'documents', 
      label: 'Documents Tracker', 
      fullName: 'Student Documents Tracker & Verification Desk',
      sub: 'दस्तावेज़ सत्यापन डेस्क व पेंडिंग फाइल्स',
      icon: FolderCheck, 
      color: 'text-purple-600',
      badge: 'KYC Desk'
    },
    { 
      id: 'staff', 
      label: 'Staff Management', 
      fullName: 'Staff & Operator Credentials Manager',
      sub: 'कैशियर व ऑपरेटर लॉगिन पासवर्ड नियंत्रण',
      icon: UserCheck, 
      color: 'text-amber-600',
      badge: `${staffList.length} Staff`
    },
    { 
      id: 'cms', 
      label: 'Website CMS & Inquiries', 
      fullName: 'Website CMS & Inquiries Manager',
      sub: 'मुख्य वेबसाइट कंटेंट व पूछताछ',
      icon: Globe, 
      color: 'text-sky-600',
      badge: 'CMS'
    },
    { 
      id: 'university-paid', 
      label: 'University Settlement', 
      fullName: 'University Paid & Settlement Ledger',
      sub: 'यूनिवर्सिटी फीस भुगतान, बकाया व कंसल्टेंसी मार्जिन हिसाब',
      icon: Building2, 
      color: 'text-amber-600',
      badge: 'Settlement'
    }
  ];

  const activeModule = adminModules.find(m => m.id === activeTab || (m.id === 'syllabus' && activeTab === 'courses')) || adminModules[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-amber-400 shrink-0">
            <img src="/pkc_logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Admin Controller Panel
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1">
              PKC Education Learning Institute & Consultancy
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in: <strong className="text-white font-mono">{adminUser?.name || 'Administrator'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Share Staff Link */}
          <button
            onClick={handleCopyStaffLink}
            className="flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Copy /staff link to send to cash counter staff"
          >
            {staffLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{staffLinkCopied ? 'Staff Link Copied!' : '📋 Copy Staff Link (/staff)'}</span>
          </button>

          {/* View Public Student Website */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
            title="Open Student Public Website in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>🌐 View Student Website</span>
          </a>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Admin</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Administrative Top Navigation Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-3 sm:p-4 space-y-3">
        {/* Module Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeTab === mod.id || (mod.id === 'syllabus' && activeTab === 'courses');
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveTab(mod.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-950 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{mod.label}</span>
                {mod.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected
                        ? 'bg-white/20 text-amber-300'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {mod.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Active Section Status Strip */}
        <div className="pt-2.5 px-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Screen
            </span>
            <strong className="text-slate-900 font-extrabold text-xs">{activeModule.fullName || activeModule.label}</strong>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-slate-500 text-[11px] hidden md:inline">{activeModule.sub}</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">
            Click any module tab to switch view
          </span>
        </div>
      </div>



      {/* TAB 2: STAFF & OPERATOR MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-amber-500" />
                <span>Staff & Operator Credentials Manager</span>
              </h2>
              <p className="text-xs text-slate-500">
                Staff cannot register themselves. Only the Admin can create, assign roles, and set passwords for staff members.
              </p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Staff Member</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden p-6 space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Staff Login ID</th>
                    <th className="p-3">Password</th>
                    <th className="p-3">Role / Designation</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((stf) => (
                    <tr key={stf.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{stf.name}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/50 rounded">{stf.username}</td>
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{showStaffPasswords[stf.id] ? stf.password : '••••••••'}</span>
                          <button
                            onClick={() => setShowStaffPasswords(prev => ({ ...prev, [stf.id]: !prev[stf.id] }))}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {showStaffPasswords[stf.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{stf.role}</td>
                      <td className="p-3 text-slate-500">{stf.department}</td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {stf.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteStaff(stf.id, stf.name)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Staff"
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
        </div>
      )}

      {/* TAB 1: COURSES & SYLLABUS HUB */}
      {(activeTab === 'syllabus' || activeTab === 'courses') && (
        <SyllabusManager courses={localCourses} onRefreshCourses={onRefreshCourses} />
      )}

      {/* TAB 4: ADMISSIONS & STUDENT ENROLLMENT */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdmissionSubTab('directory')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  admissionSubTab === 'directory' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                👥 Enrolled Students Directory & KYC
              </button>
              <button
                onClick={() => setAdmissionSubTab('new')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  admissionSubTab === 'new' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ➕ New Student Admission Form (39 Fields)
              </button>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Active Mode: <strong className="text-indigo-950">{admissionSubTab === 'directory' ? 'Student Records & Verification' : 'MP Govt Higher Education Admission Desk'}</strong>
            </span>
          </div>

          {admissionSubTab === 'directory' ? (
            <StudentList 
              courses={localCourses} 
              onOpenNewAdmission={() => setAdmissionSubTab('new')} 
            />
          ) : (
            <StudentRegistration
              courses={localCourses}
              adminUser={adminUser}
              onStudentCreated={() => {
                setAdmissionSubTab('directory');
                if (onRefreshCourses) onRefreshCourses();
              }}
            />
          )}
        </div>
      )}

      {/* TAB 2: CASH COUNTER & TREASURY FEED (WITH ADMIN EDIT POWER) */}
      {activeTab === 'cashcounter' && (
        <AccountsDashboard isAdmin={true} />
      )}

      {/* TAB: STUDENT DOCUMENTS TRACKER & VERIFICATION */}
      {activeTab === 'documents' && (
        <StudentDocumentsTracker isAdmin={true} courses={localCourses} />
      )}

      {/* TAB 6: WEBSITE CMS & INQUIRIES */}
      {activeTab === 'cms' && (
        <WebsiteCmsManager />
      )}

      {/* TAB 7: UNIVERSITY PAID & SETTLEMENT MANAGEMENT */}
      {activeTab === 'university-paid' && (
        <UniversityPaidManager />
      )}

      {/* Modal Add Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4" onClick={() => setShowCourseModal(false)}>
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base text-slate-900">{editingCourseId ? 'Edit Course & Fees' : 'Add New Degree Program'}</h3>
            <form onSubmit={handleSaveCourse} className="space-y-3 text-xs text-slate-900">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Course Name</label><input type="text" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-xl font-medium" required /></div>
                <div><label className="font-bold block mb-1">Course Code</label><input type="text" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-xl uppercase font-mono" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Total Fee (INR)</label><input type="number" value={courseForm.totalFee} onChange={(e) => setCourseForm({ ...courseForm, totalFee: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" required /></div>
                <div><label className="font-bold block mb-1">Fee / Semester (INR)</label><input type="number" value={courseForm.feePerSemester} onChange={(e) => setCourseForm({ ...courseForm, feePerSemester: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border rounded-xl font-bold" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Duration (Yrs)</label><input type="number" value={courseForm.durationYears} onChange={(e) => setCourseForm({ ...courseForm, durationYears: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border rounded-xl" /></div>
                <div><label className="font-bold block mb-1">Semesters</label><input type="number" value={courseForm.totalSemesters} onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: Number(e.target.value) })} className="w-full p-2 bg-slate-50 border rounded-xl" /></div>
              </div>
              <div><label className="font-bold block mb-1">Eligibility</label><input type="text" value={courseForm.eligibility} onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-xl" /></div>
              <div><label className="font-bold block mb-1">Description</label><textarea rows="2" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full p-2 bg-slate-50 border rounded-xl" /></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Cancel</button><button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-md">Save Course</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Staff */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4" onClick={() => setShowStaffModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 space-y-4 text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <span>Create Staff Member Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin-issued credentials for cash counter and admission operators.
              </p>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Staff Member Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Kumar"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Staff Login ID / Username *</label>
                <input
                  type="text"
                  placeholder="e.g. suresh_cashier"
                  value={staffForm.username}
                  onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Assign Password *</label>
                <input
                  type="text"
                  placeholder="e.g. pass1234"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Designation / Role</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Cash Counter & Admission Desk">Cash Counter & Desk</option>
                    <option value="Accounts Operator">Accounts Operator</option>
                    <option value="Admission Counselor">Admission Counselor</option>
                    <option value="Verification Officer">Verification Officer</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Department</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
