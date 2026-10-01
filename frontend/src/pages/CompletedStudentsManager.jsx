import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, Search, Filter, RotateCcw, Printer, ArrowLeft,
  CheckCircle2, AlertCircle, Clock, Calendar, ChevronDown, ExternalLink,
  Users, Trash2, RefreshCw, CheckCircle, AlertTriangle, FileText, Eye,
  Building2, School, CreditCard, ChevronRight, X, ArrowUpRight, Award,
  Download, BookOpen, ShieldCheck, UserCheck, Layers, FileCheck, Check,
  Undo2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';

export default function CompletedStudentsManager({ lang: propLang, toggleLang: propToggleLang }) {
  const context = useLanguage();
  const lang = propLang || context?.lang || 'en';
  const toggleLang = propToggleLang || context?.toggleLang;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [filterClearance, setFilterClearance] = useState('all'); // 'all', 'fully_cleared', 'partially_returned', 'pending'

  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editModalStudent, setEditModalStudent] = useState(null);
  const [printSlipStudent, setPrintSlipStudent] = useState(null);

  // Document Return Form State
  const [docForm, setDocForm] = useState({
    rollNo: '',
    enrollmentNo: '',
    completionDate: '',
    marksheetReturned: false,
    marksheetDetails: 'All Semesters Original Marksheet',
    marksheetDate: new Date().toISOString().split('T')[0],
    marksheetRemarks: '',
    tcIssued: false,
    tcNumber: '',
    tcDate: new Date().toISOString().split('T')[0],
    tcRemarks: '',
    migrationIssued: false,
    migrationNumber: '',
    migrationDate: new Date().toISOString().split('T')[0],
    migrationRemarks: '',
    degreeIssued: false,
    degreeNumber: '',
    degreeDate: '',
    degreeRemarks: '',
    characterCertificate: false,
    otherDocsReturned: '',
    receiverType: 'Student',
    receiverName: '',
    receiverMobile: '',
    receiverAadhaar: '',
    handoverDate: new Date().toISOString().split('T')[0],
    handedOverBy: 'Admin Office',
    clearanceStatus: 'Pending',
    receiverAcknowledged: true,
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Helper to reliably find student key (even if rollNo is not set)
  const getStudentLookupKey = (s) => {
    if (!s) return '';
    const r = (s.rollNo || '').trim();
    if (r && r.toLowerCase() !== 'not set') return r;
    if (s.id && String(s.id).trim()) return String(s.id).trim();
    if (s.enrollmentNo && String(s.enrollmentNo).trim()) return String(s.enrollmentNo).trim();
    if (s.registrationNo && String(s.registrationNo).trim()) return String(s.registrationNo).trim();
    return '';
  };

  // Fetch all students from backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching completed students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  // Filter only completed students
  const completedStudents = useMemo(() => {
    return students.filter(s => {
      const isCompleted = s.status === 'Completed' || s.courseCompleted === 'Yes';
      return isCompleted && !s.isSecondaryCourse;
    });
  }, [students]);

  // Calculate top statistics
  const stats = useMemo(() => {
    const total = completedStudents.length;
    let fullyCleared = 0;
    let partiallyReturned = 0;
    let pending = 0;
    let marksheetsReturned = 0;
    let tcIssued = 0;
    let migrationIssued = 0;

    completedStudents.forEach(s => {
      const dr = s.documentReturn || {};
      const status = dr.clearanceStatus || 'Pending';
      if (status === 'Fully Returned' || status === 'Fully Returned & Cleared') {
        fullyCleared++;
      } else if (status === 'Partially Returned') {
        partiallyReturned++;
      } else {
        pending++;
      }

      if (dr.marksheetReturned) marksheetsReturned++;
      if (dr.tcIssued) tcIssued++;
      if (dr.migrationIssued) migrationIssued++;
    });

    return {
      total,
      fullyCleared,
      partiallyReturned,
      pending,
      marksheetsReturned,
      tcIssued,
      migrationIssued
    };
  }, [completedStudents]);

  // Unique Filter Options
  const universityOptions = useMemo(() => {
    const set = new Set();
    completedStudents.forEach(s => {
      const u = s.universityName || s.collegeName;
      if (u) set.add(u);
    });
    return Array.from(set).sort();
  }, [completedStudents]);

  const courseOptions = useMemo(() => {
    const set = new Set();
    completedStudents.forEach(s => {
      const c = s.courseName || s.course;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [completedStudents]);

  // Filter and search
  const filteredList = useMemo(() => {
    const q = (search || '').trim().toLowerCase();

    return completedStudents.filter(s => {
      if (q) {
        const name = (s.fullName || s.name || '').toLowerCase();
        const fName = (s.fatherName || '').toLowerCase();
        const roll = (s.rollNo || '').toLowerCase();
        const enroll = (s.enrollmentNo || '').toLowerCase();
        const mobile = (s.mobileNo || s.mobile || '').toLowerCase();
        const course = (s.courseName || s.course || '').toLowerCase();
        const univ = (s.universityName || s.collegeName || '').toLowerCase();

        if (
          !name.includes(q) &&
          !fName.includes(q) &&
          !roll.includes(q) &&
          !enroll.includes(q) &&
          !mobile.includes(q) &&
          !course.includes(q) &&
          !univ.includes(q)
        ) {
          return false;
        }
      }

      if (filterUniversity !== 'all') {
        const univ = s.universityName || s.collegeName || '';
        if (univ !== filterUniversity) return false;
      }

      if (filterCourse !== 'all') {
        const crs = s.courseName || s.course || '';
        if (crs !== filterCourse) return false;
      }

      if (filterSession !== 'all') {
        const sess = s.currentSession || s.admissionSession || s.session || '';
        if (sess !== filterSession) return false;
      }

      if (filterClearance !== 'all') {
        const dr = s.documentReturn || {};
        const status = dr.clearanceStatus || 'Pending';
        if (filterClearance === 'fully_cleared') {
          if (status !== 'Fully Returned' && status !== 'Fully Returned & Cleared') return false;
        } else if (filterClearance === 'partially_returned') {
          if (status !== 'Partially Returned') return false;
        } else if (filterClearance === 'pending') {
          if (status === 'Fully Returned' || status === 'Fully Returned & Cleared') return false;
        }
      }

      return true;
    });
  }, [completedStudents, search, filterUniversity, filterCourse, filterSession, filterClearance]);

  // Open Edit Document Return Modal
  const handleOpenEditModal = (student) => {
    const dr = student.documentReturn || {};
    setDocForm({
      rollNo: (student.rollNo && student.rollNo !== 'Not Set') ? student.rollNo : '',
      enrollmentNo: (student.enrollmentNo && student.enrollmentNo !== 'Not Set') ? student.enrollmentNo : '',
      completionDate: student.completionDate || new Date().toISOString().split('T')[0],
      marksheetReturned: Boolean(dr.marksheetReturned),
      marksheetDetails: dr.marksheetDetails || 'All Semesters Original Marksheet',
      marksheetDate: dr.marksheetDate || new Date().toISOString().split('T')[0],
      marksheetRemarks: dr.marksheetRemarks || '',
      tcIssued: Boolean(dr.tcIssued),
      tcNumber: dr.tcNumber || '',
      tcDate: dr.tcDate || new Date().toISOString().split('T')[0],
      tcRemarks: dr.tcRemarks || '',
      migrationIssued: Boolean(dr.migrationIssued),
      migrationNumber: dr.migrationNumber || '',
      migrationDate: dr.migrationDate || new Date().toISOString().split('T')[0],
      migrationRemarks: dr.migrationRemarks || '',
      degreeIssued: Boolean(dr.degreeIssued),
      degreeNumber: dr.degreeNumber || '',
      degreeDate: dr.degreeDate || '',
      degreeRemarks: dr.degreeRemarks || '',
      characterCertificate: Boolean(dr.characterCertificate),
      otherDocsReturned: dr.otherDocsReturned || '',
      receiverType: dr.receiverType || 'Student',
      receiverName: dr.receiverName || student.fullName || student.name || '',
      receiverMobile: dr.receiverMobile || student.mobileNo || student.mobile || '',
      receiverAadhaar: dr.receiverAadhaar || student.aadhaarNo || '',
      handoverDate: dr.handoverDate || new Date().toISOString().split('T')[0],
      handedOverBy: dr.handedOverBy || 'Admin Office',
      clearanceStatus: dr.clearanceStatus || (dr.marksheetReturned && dr.tcIssued && dr.migrationIssued ? 'Fully Returned' : 'Pending'),
      receiverAcknowledged: dr.receiverAcknowledged !== undefined ? Boolean(dr.receiverAcknowledged) : true,
      remarks: dr.remarks || ''
    });
    setEditModalStudent(student);
  };

  // Submit Document Return Details
  const handleSaveDocumentReturn = async (e) => {
    e.preventDefault();
    if (!editModalStudent) return;

    try {
      setIsSubmitting(true);
      const lookupKey = getStudentLookupKey(editModalStudent);
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/document-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editModalStudent.id,
          studentId: editModalStudent.id,
          ...docForm
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save document return details');
      }

      showToast(`Document return details saved for ${editModalStudent.fullName || editModalStudent.rollNo || 'Student'}!`);
      setEditModalStudent(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revert Student back to Active Enrolled (Bulletproof with fallback key)
  const handleRevertComplete = async (student) => {
    const sName = student.fullName || student.rollNo || 'Student';
    if (!window.confirm(`Are you sure you want to revert/undo ${sName} back to "Active Enrolled Students"?\n\nThis will restore the student back to the active student list.`)) {
      return;
    }

    try {
      setLoading(true);
      const lookupKey = getStudentLookupKey(student);
      if (!lookupKey) {
        throw new Error('Unable to find student identifier. Please try editing the student.');
      }

      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/revert-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: student.id,
          studentId: student.id,
          rollNo: student.rollNo,
          revertedBy: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to revert student completion');
      }

      if (editModalStudent) {
        setEditModalStudent(null);
      }

      showToast(`${sName} successfully restored back to Active Enrolled Students!`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (filteredList.length === 0) {
      alert('No completed students found to export.');
      return;
    }

    const exportData = filteredList.map((s, idx) => {
      const dr = s.documentReturn || {};
      return {
        'S.No': idx + 1,
        'Student Name': s.fullName || s.name || '',
        'Father Name': s.fatherName || '',
        'Roll Number': s.rollNo || '',
        'Enrollment Number': s.enrollmentNo || '',
        'Course': s.courseName || s.course || '',
        'University': s.universityName || s.collegeName || '',
        'Session': s.currentSession || s.admissionSession || s.session || '',
        'Completion Date': s.completionDate || '',
        'Marksheet Returned': dr.marksheetReturned ? 'YES' : 'NO',
        'Marksheet Details': dr.marksheetDetails || '',
        'TC Issued': dr.tcIssued ? 'YES' : 'NO',
        'TC Number': dr.tcNumber || '',
        'TC Date': dr.tcDate || '',
        'Migration Issued': dr.migrationIssued ? 'YES' : 'NO',
        'Migration Number': dr.migrationNumber || '',
        'Migration Date': dr.migrationDate || '',
        'Degree Handover': dr.degreeIssued ? 'YES' : 'NO',
        'Degree Serial No': dr.degreeNumber || '',
        'Receiver Name': dr.receiverName || '',
        'Receiver Relation': dr.receiverType || '',
        'Receiver Mobile': dr.receiverMobile || '',
        'Handover Date': dr.handoverDate || '',
        'Clearance Status': dr.clearanceStatus || 'Pending',
        'Remarks': dr.remarks || ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Completed_Students');
    XLSX.writeFile(workbook, `PKC_Completed_Students_Document_Return_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="w-full space-y-6 text-slate-800 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-3 ${
          toastMsg.type === 'error' ? 'bg-rose-900 text-white border-rose-700' : 'bg-emerald-900 text-white border-emerald-700'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-300" /> : <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
          <span className="text-xs sm:text-sm font-bold">{toastMsg.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Degree Completed &amp; Document Clearance Desk</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              Degree Completed &amp; Document Return Registry
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Course-completed and graduated students directory. Manage returned original marksheets, Transfer Certificate (TC), Migration Certificate, and issue clearance acknowledgment slips.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button
              type="button"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl border border-slate-700 transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Completed</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{stats.total}</span>
              <span className="text-xs text-indigo-400 font-bold">Students</span>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-700/60">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Fully Cleared &amp; Returned</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.fullyCleared}</span>
              <span className="text-xs text-slate-400 font-medium">Cleared</span>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-700/60">
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Pending Handover</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-300">{stats.pending}</span>
              <span className="text-xs text-slate-400 font-medium">Pending</span>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-slate-700/60">
            <p className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">TC &amp; Migration Issued</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-sky-300">{stats.tcIssued} / {stats.migrationIssued}</span>
              <span className="text-xs text-slate-400 font-medium">TC / Mig</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Universal Search */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, roll no, enrollment, mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* University Filter */}
          <div>
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="all">All Universities ({universityOptions.length})</option>
              {universityOptions.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="all">All Courses ({courseOptions.length})</option>
              {courseOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Clearance Status Filter */}
          <div>
            <select
              value={filterClearance}
              onChange={(e) => setFilterClearance(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="all">All Clearance Status</option>
              <option value="fully_cleared">Fully Cleared (Returned)</option>
              <option value="partially_returned">Partially Returned</option>
              <option value="pending">Pending Handover</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredList.length}</strong> of {completedStudents.length} completed students</span>
          {(search || filterUniversity !== 'all' || filterCourse !== 'all' || filterClearance !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterUniversity('all');
                setFilterCourse('all');
                setFilterSession('all');
                setFilterClearance('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Student List */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading completed student records...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Completed Students Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              When students finish all semesters/years in "Student Records" or "Promote Students", click the "Complete" button on their profile to move them to this section.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredList.map((student, idx) => {
            const dr = student.documentReturn || {};
            const isFullyCleared = dr.clearanceStatus === 'Fully Returned' || dr.clearanceStatus === 'Fully Returned & Cleared';

            return (
              <div 
                key={student.id || student.rollNo || idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Student Identity & Course */}
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    {student.studentPhotoUrl ? (
                      <img 
                        src={student.studentPhotoUrl} 
                        alt={student.fullName}
                        className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl object-cover border-2 border-indigo-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-indigo-500 to-slate-800 text-white flex items-center justify-center font-black text-lg shadow-xs">
                        {(student.fullName || student.name || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-xs" title="Degree Completed">
                      <GraduationCap className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 truncate">
                        {student.fullName || student.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Course Completed
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span>S/O: <strong>{student.fatherName || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Mob: <strong>{student.mobileNo || student.mobile || 'N/A'}</strong></span>
                    </p>

                    {/* Enrollment & Roll No Highlight Box */}
                    <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                      <div className="bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-mono">
                        <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Roll No:</span>
                        <strong className="text-slate-900">{student.rollNo || 'Not Set'}</strong>
                      </div>
                      <div className="bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100 text-xs font-mono">
                        <span className="text-[10px] text-indigo-600 uppercase font-bold mr-1">Enrollment No:</span>
                        <strong className="text-indigo-900">{student.enrollmentNo || 'Not Set'}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium truncate pt-0.5">
                      {student.courseName || student.course} • {student.universityName || student.collegeName} • Session: {student.currentSession || student.admissionSession || student.session || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Middle: Document Return Status Badges */}
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 sm:p-3 rounded-2xl border border-slate-100 text-center shrink-0 lg:w-80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Marksheet</span>
                    {dr.marksheetReturned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Returned</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600">Pending</span>
                    )}
                  </div>

                  <div className="space-y-0.5 border-x border-slate-200 px-1">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">TC Certificate</span>
                    {dr.tcIssued ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Issued</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600">Pending</span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Migration</span>
                    {dr.migrationIssued ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Issued</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-600">Pending</span>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
                  
                  {/* Fill Document Details Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(student)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Fill / Manage Document Return Details"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Return Form</span>
                  </button>

                  {/* Print Slip Button */}
                  <button
                    type="button"
                    onClick={() => setPrintSlipStudent(student)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                    title="Print Document Return & Clearance Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {/* PROMINENT REVERT / UNDO BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleRevertComplete(student)}
                    className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                    title="Undo / Revert student back to active enrolled student list"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Undo / Revert</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* DOCUMENT RETURN EDIT MODAL (THE COMPREHENSIVE BLOCK FORM IN ENGLISH)       */}
      {/* ========================================================================= */}
      {editModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black">
                    Student Document Return &amp; Roll/Enrollment Registry
                  </h2>
                  <p className="text-xs text-indigo-200">
                    {editModalStudent.fullName || editModalStudent.name} • {editModalStudent.courseName || editModalStudent.course}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditModalStudent(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveDocumentReturn} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              
              {/* BLOCK 1: Enrollment & Roll Number (Identifiers) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>Block 1: Student Identifiers &amp; Registration</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">Fill Roll No and Enrollment No</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Roll Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 210045"
                      value={docForm.rollNo}
                      onChange={(e) => setDocForm({ ...docForm, rollNo: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Enrollment Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MCBU219804"
                      value={docForm.enrollmentNo}
                      onChange={(e) => setDocForm({ ...docForm, enrollmentNo: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      value={docForm.completionDate}
                      onChange={(e) => setDocForm({ ...docForm, completionDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 2: Original Marksheets Return Block */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Block 2: Original Marksheet Return</span>
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.marksheetReturned}
                      onChange={(e) => setDocForm({ ...docForm, marksheetReturned: e.target.checked })}
                      className="w-4 h-4 accent-emerald-600 rounded"
                    />
                    <span className="font-bold text-emerald-900 text-xs">Marksheet Returned to Student</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Returned Marksheet Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. All Semesters (SEM 1 to 6) Original Marksheet"
                      value={docForm.marksheetDetails}
                      onChange={(e) => setDocForm({ ...docForm, marksheetDetails: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Return Date</label>
                    <input
                      type="date"
                      value={docForm.marksheetDate}
                      onChange={(e) => setDocForm({ ...docForm, marksheetDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 3: Transfer Certificate (TC) Block */}
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Block 3: Transfer Certificate (TC)</span>
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.tcIssued}
                      onChange={(e) => setDocForm({ ...docForm, tcIssued: e.target.checked })}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <span className="font-bold text-amber-900 text-xs">TC Issued &amp; Handed Over</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">TC Number</label>
                    <input
                      type="text"
                      placeholder="e.g. TC-2026/045"
                      value={docForm.tcNumber}
                      onChange={(e) => setDocForm({ ...docForm, tcNumber: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">TC Issue Date</label>
                    <input
                      type="date"
                      value={docForm.tcDate}
                      onChange={(e) => setDocForm({ ...docForm, tcDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">TC Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Issued for higher education"
                      value={docForm.tcRemarks}
                      onChange={(e) => setDocForm({ ...docForm, tcRemarks: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 4: Migration Certificate Block */}
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <span className="font-black text-sky-900 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-sky-600" />
                    <span>Block 4: Migration Certificate</span>
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.migrationIssued}
                      onChange={(e) => setDocForm({ ...docForm, migrationIssued: e.target.checked })}
                      className="w-4 h-4 accent-sky-600 rounded"
                    />
                    <span className="font-bold text-sky-900 text-xs">Migration Issued &amp; Given</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Migration Number</label>
                    <input
                      type="text"
                      placeholder="e.g. MIG-MCBU-8762"
                      value={docForm.migrationNumber}
                      onChange={(e) => setDocForm({ ...docForm, migrationNumber: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={docForm.migrationDate}
                      onChange={(e) => setDocForm({ ...docForm, migrationDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. Original migration handed over"
                      value={docForm.migrationRemarks}
                      onChange={(e) => setDocForm({ ...docForm, migrationRemarks: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* BLOCK 5: Degree / Provisional & Character Certificate */}
              <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                  <span className="font-black text-purple-900 text-sm flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>Block 5: Degree / Provisional &amp; Character Certificate</span>
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.degreeIssued}
                      onChange={(e) => setDocForm({ ...docForm, degreeIssued: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    <span className="font-bold text-purple-900 text-xs">Degree / Provisional Given</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Degree Serial / Certificate No</label>
                    <input
                      type="text"
                      placeholder="e.g. DEG-2026-981"
                      value={docForm.degreeNumber}
                      onChange={(e) => setDocForm({ ...docForm, degreeNumber: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Handover Date</label>
                    <input
                      type="date"
                      value={docForm.degreeDate}
                      onChange={(e) => setDocForm({ ...docForm, degreeDate: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Character Certificate (CC)</label>
                    <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-300 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={docForm.characterCertificate}
                        onChange={(e) => setDocForm({ ...docForm, characterCertificate: e.target.checked })}
                        className="w-4 h-4 accent-purple-600 rounded"
                      />
                      <span className="font-bold text-slate-700">Character Certificate Issued</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* BLOCK 6: Receiver Details & Official Clearance Declaration */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Block 6: Receiver &amp; Clearance Acknowledgment</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Handover recipient info</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-900">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1 text-[11px]">Handed Over To</label>
                    <select
                      value={docForm.receiverType}
                      onChange={(e) => setDocForm({ ...docForm, receiverType: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    >
                      <option value="Student">Student Himself</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother/Sister">Brother / Sister</option>
                      <option value="Authorized Representative">Authorized Representative</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1 text-[11px]">Receiver Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Receiver full name"
                      value={docForm.receiverName}
                      onChange={(e) => setDocForm({ ...docForm, receiverName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1 text-[11px]">Receiver Mobile</label>
                    <input
                      type="text"
                      placeholder="10-digit mobile number"
                      value={docForm.receiverMobile}
                      onChange={(e) => setDocForm({ ...docForm, receiverMobile: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1 text-[11px]">Overall Clearance Status</label>
                    <select
                      value={docForm.clearanceStatus}
                      onChange={(e) => setDocForm({ ...docForm, clearanceStatus: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-black text-indigo-900"
                    >
                      <option value="Fully Returned">Fully Returned &amp; Cleared</option>
                      <option value="Partially Returned">Partially Returned</option>
                      <option value="Pending">Pending Handover</option>
                    </select>
                  </div>
                </div>

                {/* Receiver Declaration Checkbox */}
                <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={docForm.receiverAcknowledged}
                      onChange={(e) => setDocForm({ ...docForm, receiverAcknowledged: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500 rounded mt-0.5"
                    />
                    <span className="text-xs text-slate-200 leading-relaxed">
                      <strong>Receiver Declaration:</strong> "I have received all my original marksheets, Transfer Certificate (TC), and Migration Certificate in good condition. No original documents are pending with the institute."
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalStudent(null)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    Close
                  </button>

                  {/* Undo / Revert Button Inside Modal */}
                  <button
                    type="button"
                    onClick={() => handleRevertComplete(editModalStudent)}
                    className="px-3.5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
                    title="Restore student back to Active Enrolled Students"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    <span>Undo / Revert to Active</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPrintSlipStudent({
                        ...editModalStudent,
                        rollNo: docForm.rollNo,
                        enrollmentNo: docForm.enrollmentNo,
                        documentReturn: { ...docForm }
                      });
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : 'Save Document Return'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE DOCUMENT RETURN & CLEARANCE RECEIPT / SLIP IN 100% ENGLISH       */}
      {/* ========================================================================= */}
      {printSlipStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-2 sm:p-6 py-4 flex justify-center items-start">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-300 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Top Toolbar */}
            <div className="bg-slate-900 text-white p-3 px-5 flex items-center justify-between no-print">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Document Return Clearance Slip (Print Preview)</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSlipStudent(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Content Area */}
            <div className="p-6 sm:p-8 space-y-5 text-slate-900 font-sans print:p-0">
              
              {/* Institute Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <GraduationCap className="w-7 h-7 text-indigo-900" />
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    PKC Education Learning Institute &amp; Consultancy
                  </h1>
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Approved Society Reg. No. 06/03/01/12345/18 • Near Bus Stand, Chhatarpur (M.P.) - 471001
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Direct Helpline: +91 7000212637 • Email: pkcinstituteaiu@gmail.com
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-md">
                  Student Document Return &amp; Clearance Acknowledgment Slip
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-medium">Student Name:</span>{' '}
                  <strong className="text-slate-900">{printSlipStudent.fullName || printSlipStudent.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Father's Name:</span>{' '}
                  <strong className="text-slate-900">{printSlipStudent.fatherName || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Roll Number:</span>{' '}
                  <strong className="text-indigo-900 font-mono text-sm">{printSlipStudent.rollNo || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Enrollment Number:</span>{' '}
                  <strong className="text-indigo-900 font-mono text-sm">{printSlipStudent.enrollmentNo || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Course / Program:</span>{' '}
                  <strong className="text-slate-900">{printSlipStudent.courseName || printSlipStudent.course}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">University / College:</span>{' '}
                  <strong className="text-slate-900">{printSlipStudent.universityName || printSlipStudent.collegeName}</strong>
                </div>
              </div>

              {/* Returned Documents Table */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                  Returned Original Documents &amp; Certificates Registry:
                </h4>
                <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 w-10">#</th>
                      <th className="p-2 border-r border-slate-300">Document Name</th>
                      <th className="p-2 border-r border-slate-300 w-24">Status</th>
                      <th className="p-2 border-r border-slate-300">Serial No / Details</th>
                      <th className="p-2 w-28">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-bold">1</td>
                      <td className="p-2 border-r border-slate-200 font-bold">Original Degree Marksheets</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-700">
                        {printSlipStudent.documentReturn?.marksheetReturned ? 'Returned' : 'Pending'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono">
                        {printSlipStudent.documentReturn?.marksheetDetails || 'All Semesters Marksheet'}
                      </td>
                      <td className="p-2 font-mono">{printSlipStudent.documentReturn?.marksheetDate || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-bold">2</td>
                      <td className="p-2 border-r border-slate-200 font-bold">Transfer Certificate (TC)</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-700">
                        {printSlipStudent.documentReturn?.tcIssued ? 'Issued' : 'N/A'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono">{printSlipStudent.documentReturn?.tcNumber || '-'}</td>
                      <td className="p-2 font-mono">{printSlipStudent.documentReturn?.tcDate || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-bold">3</td>
                      <td className="p-2 border-r border-slate-200 font-bold">Migration Certificate</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-700">
                        {printSlipStudent.documentReturn?.migrationIssued ? 'Issued' : 'N/A'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono">{printSlipStudent.documentReturn?.migrationNumber || '-'}</td>
                      <td className="p-2 font-mono">{printSlipStudent.documentReturn?.migrationDate || '-'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-bold">4</td>
                      <td className="p-2 border-r border-slate-200 font-bold">Degree / Provisional Certificate</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-700">
                        {printSlipStudent.documentReturn?.degreeIssued ? 'Handed Over' : 'Pending'}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-mono">{printSlipStudent.documentReturn?.degreeNumber || '-'}</td>
                      <td className="p-2 font-mono">{printSlipStudent.documentReturn?.degreeDate || '-'}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-200 text-center font-bold">5</td>
                      <td className="p-2 border-r border-slate-200 font-bold">Character Certificate (CC)</td>
                      <td className="p-2 border-r border-slate-200 font-bold text-emerald-700">
                        {printSlipStudent.documentReturn?.characterCertificate ? 'Issued' : 'N/A'}
                      </td>
                      <td className="p-2 border-r border-slate-200">-</td>
                      <td className="p-2 font-mono">{printSlipStudent.documentReturn?.handoverDate || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Receiver Acknowledgment Box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-800">
                  Receiver Details:{' '}
                  <span className="font-normal">
                    {printSlipStudent.documentReturn?.receiverName || printSlipStudent.fullName} ({printSlipStudent.documentReturn?.receiverType || 'Student'}), Mobile: {printSlipStudent.documentReturn?.receiverMobile || printSlipStudent.mobileNo || 'N/A'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-600 italic leading-relaxed">
                  "I have received all the above original marksheets and certificates from the institute in good condition. No original academic documents are pending with the institute."
                </p>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="space-y-1">
                  <div className="border-t border-slate-400 w-44 mx-auto pt-1"></div>
                  <p className="font-bold text-slate-800">Signature of Receiver / Student</p>
                  <p className="text-[10px] text-slate-500">Receiver / Student</p>
                </div>

                <div className="space-y-1">
                  <div className="border-t border-slate-400 w-44 mx-auto pt-1"></div>
                  <p className="font-bold text-slate-800">Authorized Signatory &amp; Seal</p>
                  <p className="text-[10px] text-slate-500">PKC Education Learning Institute</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
