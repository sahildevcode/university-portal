import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, BookOpen, Plus, Edit3, Trash2, Users, CreditCard, 
  CheckCircle2, AlertCircle, Save, LogOut, Layers, Star,
  UserCheck, Key, Lock, Eye, EyeOff, FolderCheck, Globe, ChevronDown, Building2,
  Copy, Check, ExternalLink, ChevronRight, Menu, X
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // AI Robot Automation Action Listener
  useEffect(() => {
    const handleAIAction = (event) => {
      const detail = event.detail || {};
      if (detail.type === 'focus-fees') {
        setActiveTab('accounts');
      } else if (detail.type === 'open-admission') {
        setActiveTab('admissions');
        setAdmissionSubTab('register');
      } else if (detail.type === 'focus-students') {
        setActiveTab('admissions');
        setAdmissionSubTab('directory');
      } else if (
        detail.type === 'open-add-university' || 
        detail.type === 'open-add-college' || 
        detail.type === 'prefill-upload-syllabus' || 
        detail.type === 'switch-tab'
      ) {
        setActiveTab('syllabus');
      }
    };
    window.addEventListener('ai-action', handleAIAction);
    return () => window.removeEventListener('ai-action', handleAIAction);
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
      sub: 'Manage partner universities, affiliated colleges, degree branches & semester curricula',
      shortDesc: 'Universities, Colleges, Branches & Syllabus',
      icon: Building2, 
      color: 'text-indigo-600',
      badge: 'MPU • 18 Colleges'
    },
    { 
      id: 'cashcounter', 
      label: 'Fee & Cash Counter', 
      fullName: 'Cash Counter Fee & Accounts Layer',
      sub: 'Student fee receipts, pending dues & collection registers',
      shortDesc: 'Fee Receipts, Student Ledgers & Cash Registry',
      icon: CreditCard, 
      color: 'text-emerald-600',
      badge: 'Live Counter'
    },
    { 
      id: 'admissions', 
      label: 'Student Admissions', 
      fullName: 'Enrolled Students Directory & Admissions',
      sub: 'All enrolled students records & new admissions',
      shortDesc: 'Enrolled Students & New Form (39 Fields)',
      icon: Users, 
      color: 'text-blue-600',
      badge: 'Admissions'
    },
    { 
      id: 'documents', 
      label: 'Documents Tracker', 
      fullName: 'Student Documents Tracker & Verification Desk',
      sub: 'Student documents verification & KYC compliance desk',
      shortDesc: 'KYC, Marksheets & Digital Dossier',
      icon: FolderCheck, 
      color: 'text-purple-600',
      badge: 'KYC Desk'
    },
    { 
      id: 'staff', 
      label: 'Staff Management', 
      fullName: 'Staff & Operator Credentials Manager',
      sub: 'Cashier and counselor login password control',
      shortDesc: 'Cashier & Operator IDs and Passwords',
      icon: UserCheck, 
      color: 'text-amber-600',
      badge: `${staffList.length} Staff`
    },
    { 
      id: 'cms', 
      label: 'Website CMS & Inquiries', 
      fullName: 'Website CMS & Inquiries Manager',
      sub: 'Main website content, banners & student inquiries',
      shortDesc: 'Front Website Banners & Student Inquiries',
      icon: Globe, 
      color: 'text-sky-600',
      badge: 'CMS'
    },
    { 
      id: 'university-paid', 
      label: 'University Settlement', 
      fullName: 'University Paid & Settlement Ledger',
      sub: 'University official fees paid, outstanding dues & margin ledger',
      shortDesc: 'Official Dues, Margins & University Pay',
      icon: Building2, 
      color: 'text-amber-600',
      badge: 'Settlement'
    }
  ];

  const activeModule = adminModules.find(m => m.id === activeTab || (m.id === 'syllabus' && activeTab === 'courses')) || adminModules[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-slate-900">
      
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

      {/* 2-Column Dashboard Layout: Persistent Left Side Navbar + Right Active Screen Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* ========================================================================= */}
        {/* 1. LEFT COLUMN: PERSISTENT SIDE NAVBAR */}
        {/* ========================================================================= */}
        <aside className="w-full lg:w-80 xl:w-92 shrink-0 space-y-3 lg:sticky lg:top-6 z-20">
          
          {/* Mobile Screen Active Module & Toggle Bar (Visible on mobile screens < lg) */}
          <div className="lg:hidden bg-white rounded-3xl border-2 border-slate-200 p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                <ActiveIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
                  Active Screen
                </span>
                <strong className="text-sm font-black text-slate-900 leading-snug">
                  {activeModule.label}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              {mobileSidebarOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
              <span>{mobileSidebarOpen ? 'Close Menu' : 'All Desks (7)'}</span>
            </button>
          </div>

          {/* Side Navbar Main Container (Always visible on lg+, toggleable on mobile) */}
          <div className={`space-y-3 ${mobileSidebarOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* Side Navbar Header Card */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Admin Modules
                </span>
                <span className="text-[10px] font-black text-slate-400 bg-white/10 px-2.5 py-0.5 rounded-full">
                  7 Desks
                </span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white mt-1">
                Sidebar Navigation
              </h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Click any section below to switch desk view
              </p>
            </div>

            {/* Individual Module Buttons - Bolder, Larger, Clearly Separated Cards */}
            <div className="space-y-3">
              {adminModules.map((mod, idx) => {
                const Icon = mod.icon;
                const isSelected = activeTab === mod.id || (mod.id === 'syllabus' && activeTab === 'courses');

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(mod.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 group select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-amber-400 shadow-xl shadow-slate-950/20 ring-4 ring-amber-400/20 translate-x-1'
                        : 'bg-white hover:bg-indigo-50/40 text-slate-800 border-slate-200/90 hover:border-indigo-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Left Icon Box with High-Contrast Badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 shadow-md font-black scale-105'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 border border-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Text Block (Bold, Large & Highly Visible) */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                            isSelected 
                              ? 'bg-white/20 text-amber-300' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            0{idx + 1}
                          </span>
                          <h4 className={`text-sm sm:text-[15px] font-black tracking-tight leading-snug truncate ${
                            isSelected ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'
                          }`}>
                            {mod.label}
                          </h4>
                        </div>
                        <p className={`text-[11px] font-medium truncate mt-1 leading-normal ${
                          isSelected ? 'text-amber-200/90' : 'text-slate-500'
                        }`}>
                          {mod.shortDesc || mod.sub}
                        </p>
                      </div>
                    </div>

                    {/* Right Badges & Indicators */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {mod.badge && (
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-black hidden sm:inline-block ${
                            isSelected
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {mod.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-amber-400 translate-x-1' : 'text-slate-300 group-hover:text-indigo-500'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Status Footer */}
            <div className="bg-slate-50 border-2 border-slate-200/90 p-4 rounded-3xl text-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-slate-500">
                <span>System Status</span>
                <span className="text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                Click any desk above to instantly manage records.
              </p>
            </div>

          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. RIGHT COLUMN: MAIN ACTIVE WORKSPACE */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          
          {/* Active Desk Header Banner */}
          <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <ActiveIcon className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active Desk
                  </span>
                  <span className="text-[11px] font-extrabold text-indigo-950 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    {activeModule.badge}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  {activeModule.fullName || activeModule.label}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {activeModule.sub}
                </p>
              </div>
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

        </main>
      </div>

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
