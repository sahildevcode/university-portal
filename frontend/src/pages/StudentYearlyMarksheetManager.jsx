import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Filter, RotateCcw, Download, UploadCloud, Eye, Trash2, 
  CheckCircle2, AlertCircle, RefreshCw, GraduationCap, Building2, BookOpen, 
  Layers, Check, X, ArrowUpRight, TrendingUp, Calendar, ShieldCheck,
  Award, FileCheck, ExternalLink, ChevronRight, UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../context/LanguageContext';

export default function StudentYearlyMarksheetManager({ courses = [], lang: propLang, toggleLang: propToggleLang }) {
  const context = useLanguage();
  const lang = propLang || context?.lang || 'en';
  const toggleLang = propToggleLang || context?.toggleLang;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Active section tab: 'promoted' | 'completed' | 'matrix'
  const [activeSection, setActiveSection] = useState('promoted');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'has_marksheets' | 'missing_marksheets'

  // Modal State for Uploading / Viewing Marksheets
  const [modalStudent, setModalStudent] = useState(null);
  const [modalMarksheetFiles, setModalMarksheetFiles] = useState([]);
  const [uploadTerm, setUploadTerm] = useState('Sem 1');
  const [uploadTitle, setUploadTitle] = useState('Semester 1 Marksheet');
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
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
      console.error('Error fetching students for yearly marksheets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  // Extract combined marksheet files for a student (checks student.marksheetFiles and documentReturn.marksheetFiles)
  const getStudentMarksheetFiles = (student) => {
    if (!student) return [];
    const rootList = Array.isArray(student.marksheetFiles) ? student.marksheetFiles : [];
    const docList = Array.isArray(student.documentReturn?.marksheetFiles) ? student.documentReturn.marksheetFiles : [];
    
    // Combine and deduplicate by id or fileName
    const map = new Map();
    [...docList, ...rootList].forEach(item => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      } else if (item && item.fileName && !map.has(item.fileName)) {
        map.set(item.fileName, item);
      }
    });
    return Array.from(map.values());
  };

  // Check if a specific term marksheet is uploaded for a student
  const findMarksheetByTerm = (student, termKeyword) => {
    const files = getStudentMarksheetFiles(student);
    const key = String(termKeyword).toLowerCase().replace(/[^a-z0-9]/g, '');
    return files.find(f => {
      const t = String(f.term || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const title = String(f.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return t.includes(key) || title.includes(key);
    });
  };

  // Students categorized into:
  // 1. Promoted & Active Students (not completed)
  const promotedStudents = useMemo(() => {
    return students.filter(s => {
      const isCompleted = s.status === 'Completed' || s.courseCompleted === 'Yes';
      return !isCompleted && !s.isSecondaryCourse;
    });
  }, [students]);

  // 2. Completed Students
  const completedStudents = useMemo(() => {
    return students.filter(s => {
      const isCompleted = s.status === 'Completed' || s.courseCompleted === 'Yes';
      return isCompleted && !s.isSecondaryCourse;
    });
  }, [students]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalMarksheets = 0;
    let studentsWithMarksheets = 0;
    let missingCount = 0;

    students.forEach(s => {
      if (s.isSecondaryCourse) return;
      const files = getStudentMarksheetFiles(s);
      totalMarksheets += files.length;
      if (files.length > 0) {
        studentsWithMarksheets++;
      } else {
        missingCount++;
      }
    });

    return {
      totalStudents: students.filter(s => !s.isSecondaryCourse).length,
      promotedCount: promotedStudents.length,
      completedCount: completedStudents.length,
      totalMarksheets,
      studentsWithMarksheets,
      missingCount
    };
  }, [students, promotedStudents, completedStudents]);

  // Filter Dropdown Options
  const universityOptions = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      const u = s.universityName || s.collegeName;
      if (u) set.add(u);
    });
    return Array.from(set).sort();
  }, [students]);

  const courseOptions = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      const c = s.courseName || s.course;
      if (c) set.add(c);
    });
    return Array.from(set).sort();
  }, [students]);

  // Current list based on active section
  const currentList = useMemo(() => {
    let baseList = [];
    if (activeSection === 'promoted') {
      baseList = promotedStudents;
    } else if (activeSection === 'completed') {
      baseList = completedStudents;
    } else {
      // Matrix: all students
      baseList = students.filter(s => !s.isSecondaryCourse);
    }

    const q = (search || '').trim().toLowerCase();

    return baseList.filter(s => {
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
        const u = s.universityName || s.collegeName || '';
        if (u !== filterUniversity) return false;
      }

      if (filterCourse !== 'all') {
        const c = s.courseName || s.course || '';
        if (c !== filterCourse) return false;
      }

      if (filterSemester !== 'all') {
        const sem = String(s.currentSemester || s.semester || '');
        if (sem !== filterSemester) return false;
      }

      if (filterStatus !== 'all') {
        const files = getStudentMarksheetFiles(s);
        if (filterStatus === 'has_marksheets' && files.length === 0) return false;
        if (filterStatus === 'missing_marksheets' && files.length > 0) return false;
      }

      return true;
    });
  }, [activeSection, promotedStudents, completedStudents, students, search, filterUniversity, filterCourse, filterSemester, filterStatus]);

  // Open Modal for Student (optionally pre-selected term)
  const handleOpenModal = (student, initialTerm = null) => {
    const files = getStudentMarksheetFiles(student);
    setModalStudent(student);
    setModalMarksheetFiles(files);
    
    const term = initialTerm || (student.status === 'Completed' ? 'All Semesters' : `Sem ${student.currentSemester || 1}`);
    setUploadTerm(term);
    if (term === 'All Semesters') {
      setUploadTitle('All Semesters Final Consolidated Marksheet');
    } else if (term.startsWith('Sem')) {
      setUploadTitle(`Semester ${term.replace('Sem', '').trim()} Marksheet`);
    } else if (term.includes('Year')) {
      setUploadTitle(`${term} Marksheet`);
    } else {
      setUploadTitle(`${term} Marksheet`);
    }
    setUploadRemarks('');
    setSelectedFile(null);
  };

  // Upload Marksheet PDF for student
  const handleUploadMarksheet = async (e) => {
    if (e) e.preventDefault();
    if (!modalStudent) return;
    if (!selectedFile) {
      alert('Please select a PDF or image file of the marksheet first.');
      return;
    }

    try {
      setIsUploading(true);
      const lookupKey = getStudentLookupKey(modalStudent);
      const formData = new FormData();
      formData.append('marksheet_file', selectedFile);
      formData.append('term', uploadTerm || 'All Semesters');
      formData.append('title', uploadTitle || uploadTerm || 'Marksheet PDF');
      formData.append('remarks', uploadRemarks || '');
      formData.append('id', modalStudent.id);
      formData.append('studentId', modalStudent.id);

      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/marksheet-upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload marksheet PDF');
      }

      const updatedFiles = data.marksheetFiles || [];
      setModalMarksheetFiles(updatedFiles);
      setSelectedFile(null);
      const fileInput = document.getElementById('yearly-marksheet-file-input');
      if (fileInput) fileInput.value = '';

      // Update student object in local state
      if (!modalStudent.documentReturn) modalStudent.documentReturn = {};
      modalStudent.documentReturn.marksheetFiles = updatedFiles;
      modalStudent.documentReturn.marksheetReturned = true;
      modalStudent.marksheetFiles = updatedFiles;

      showToast(`Marksheet PDF (${uploadTerm} - ${uploadTitle}) uploaded successfully!`);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Marksheet PDF
  const handleDeleteMarksheet = async (fileId, termTitle) => {
    if (!modalStudent) return;
    if (!window.confirm(`Are you sure you want to delete marksheet PDF (${termTitle})?`)) {
      return;
    }

    try {
      setDeletingFileId(fileId);
      const lookupKey = getStudentLookupKey(modalStudent);
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/marksheet-upload/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: modalStudent.id, studentId: modalStudent.id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete marksheet PDF');
      }

      const updatedFiles = data.marksheetFiles || [];
      setModalMarksheetFiles(updatedFiles);
      if (modalStudent.documentReturn) {
        modalStudent.documentReturn.marksheetFiles = updatedFiles;
      }
      modalStudent.marksheetFiles = updatedFiles;

      showToast('Marksheet PDF deleted successfully.');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert('Delete error: ' + err.message);
    } finally {
      setDeletingFileId(null);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (currentList.length === 0) {
      alert('No student records found to export.');
      return;
    }

    const exportRows = currentList.map((s, idx) => {
      const files = getStudentMarksheetFiles(s);
      return {
        'S.No': idx + 1,
        'Student Name': s.fullName || s.name || '',
        'Father Name': s.fatherName || '',
        'Roll No': s.rollNo || 'Not Set',
        'Enrollment No': s.enrollmentNo || 'Not Set',
        'Course': s.courseName || s.course || '',
        'University': s.universityName || s.collegeName || '',
        'Current Semester / Year': s.status === 'Completed' ? 'Course Completed' : (s.currentSemester ? `Semester ${s.currentSemester}` : 'Active'),
        'Session': s.currentSession || s.admissionSession || s.session || '',
        'Total Uploaded Marksheets': files.length,
        'Uploaded Semesters / Years': files.map(f => `${f.term}: ${f.title}`).join(' | '),
        'Sem 1 Status': findMarksheetByTerm(s, 'sem1') ? 'Uploaded' : 'Pending',
        'Sem 2 Status': findMarksheetByTerm(s, 'sem2') ? 'Uploaded' : 'Pending',
        'Sem 3 Status': findMarksheetByTerm(s, 'sem3') ? 'Uploaded' : 'Pending',
        'Sem 4 Status': findMarksheetByTerm(s, 'sem4') ? 'Uploaded' : 'Pending',
        'Sem 5 Status': findMarksheetByTerm(s, 'sem5') ? 'Uploaded' : 'Pending',
        'Sem 6 Status': findMarksheetByTerm(s, 'sem6') ? 'Uploaded' : 'Pending',
        'Sem 7 Status': findMarksheetByTerm(s, 'sem7') ? 'Uploaded' : 'Pending',
        'Sem 8 Status': findMarksheetByTerm(s, 'sem8') ? 'Uploaded' : 'Pending'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marksheet Registry');
    XLSX.writeFile(workbook, `Student_Marksheets_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Marksheet register downloaded successfully as Excel!');
  };

  const semList = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
  const yearList = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMsg.msg}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-950/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide uppercase border border-indigo-400/30">
              <FileText className="w-3.5 h-3.5" />
              <span>Academic Records &amp; Marksheet Archive</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
              Student Yearly &amp; Semester Marksheets Manager
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Upload and manage incoming semester-wise (Sem 1 to Sem 8) and year-wise (1st to 4th Year) marksheet PDFs for promoted students, as well as full degree clearance marksheets for completed students.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={fetchStudents}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/10 transition cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-bold block">Total Students</span>
            <span className="text-xl sm:text-2xl font-black text-white">{stats.totalStudents}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-bold block">Promoted &amp; Active</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300">{stats.promotedCount}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-bold block">Course Completed</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300">{stats.completedCount}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] text-indigo-200 font-bold block">Uploaded Marksheets</span>
            <span className="text-xl sm:text-2xl font-black text-sky-300">{stats.totalMarksheets}</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-indigo-200 font-bold block">Missing Marksheets</span>
            <span className="text-xl sm:text-2xl font-black text-rose-300">{stats.missingCount}</span>
          </div>
        </div>
      </div>

      {/* 3 CORE SECTIONS NAVIGATION TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveSection('promoted')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'promoted'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Section 1: Promoted &amp; Studying Students ({promotedStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('completed')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'completed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Section 2: Completed Course Students ({completedStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('matrix')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
            activeSection === 'matrix'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Section 3: Marksheets Ledger &amp; 8-Sem Matrix</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, father, roll no, enrollment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter University */}
          <div>
            <select
              value={filterUniversity}
              onChange={(e) => setFilterUniversity(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Universities &amp; Colleges</option>
              {universityOptions.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Filter Course */}
          <div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Degree Courses</option>
              {courseOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Filter Marksheet Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700"
            >
              <option value="all">All Marksheet Status</option>
              <option value="has_marksheets">With Marksheets Uploaded</option>
              <option value="missing_marksheets">Pending / Missing Marksheets</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong>{currentList.length}</strong> students in{' '}
            <strong className="text-slate-800">
              {activeSection === 'promoted' ? 'Promoted & Active' : activeSection === 'completed' ? 'Completed Students' : 'Master Matrix'}
            </strong>
          </span>

          {(search || filterUniversity !== 'all' || filterCourse !== 'all' || filterStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setFilterUniversity('all');
                setFilterCourse('all');
                setFilterStatus('all');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-600">Loading student marksheet records...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <FileText className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Student Records Found</h3>
          <p className="text-xs text-slate-500">Try changing your search query or filter options.</p>
        </div>
      ) : activeSection === 'matrix' ? (
        
        /* ========================================================================= */
        /* SECTION 3: 8-SEMESTER & YEARLY MARKSHEET AUDIT MATRIX                     */
        /* ========================================================================= */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black text-sm">All Students 8-Semester Marksheet Status Ledger</h3>
            </div>
            <span className="text-xs text-indigo-200">
              Click on any semester button to view or upload PDF directly
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <th className="p-3">#</th>
                  <th className="p-3">Student &amp; Roll No</th>
                  <th className="p-3">Course / University</th>
                  <th className="p-3 text-center">Status</th>
                  {semList.map(sem => (
                    <th key={sem} className="p-3 text-center">{sem}</th>
                  ))}
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.map((student, idx) => {
                  const files = getStudentMarksheetFiles(student);
                  const isCompleted = student.status === 'Completed' || student.courseCompleted === 'Yes';

                  return (
                    <tr key={student.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>

                      <td className="p-3 min-w-[200px]">
                        <span className="font-bold text-slate-900 block truncate">
                          {student.fullName || student.name}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                          <span>R: {student.rollNo || 'Not Set'}</span>
                          <span>•</span>
                          <span>E: {student.enrollmentNo || 'Not Set'}</span>
                        </div>
                      </td>

                      <td className="p-3 min-w-[180px]">
                        <span className="font-semibold text-slate-800 block truncate">
                          {student.courseName || student.course}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {student.universityName || student.collegeName}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Completed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Sem {student.currentSemester || '1'}
                          </span>
                        )}
                      </td>

                      {/* Sem 1 to 8 Status Cells */}
                      {semList.map((sem, sIdx) => {
                        const file = findMarksheetByTerm(student, `sem${sIdx + 1}`);

                        return (
                          <td key={sem} className="p-2.5 text-center">
                            {file ? (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-[10px] transition shadow-2xs"
                                title={`View ${file.title || sem}`}
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenModal(student, sem)}
                                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-dashed border-slate-300 font-semibold text-[10px] transition cursor-pointer"
                                title={`Upload ${sem} Marksheet`}
                              >
                                + Add
                              </button>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-3 text-center font-bold">
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {files.length}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(student)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (

        /* ========================================================================= */
        /* SECTIONS 1 & 2: PROMOTED / COMPLETED STUDENT CARDS WITH 8-SEM RIBBON      */
        /* ========================================================================= */
        <div className="space-y-4">
          {currentList.map((student, idx) => {
            const files = getStudentMarksheetFiles(student);
            const isCompleted = student.status === 'Completed' || student.courseCompleted === 'Yes';

            return (
              <div
                key={student.id || idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 space-y-4"
              >
                {/* Top Row: Identity & Quick Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      {student.studentPhotoUrl ? (
                        <img
                          src={student.studentPhotoUrl}
                          alt={student.fullName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-sm">
                          {(student.fullName || student.name || 'S').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-slate-900 text-sm truncate">
                          {student.fullName || student.name}
                        </h3>
                        {isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Course Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>Currently Semester {student.currentSemester || '1'}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap pt-0.5">
                        <span>S/O: <strong>{student.fatherName || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Mob: <strong>{student.mobileNo || student.mobile || 'N/A'}</strong></span>
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap font-mono text-xs">
                        <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-700">
                          Roll: <strong>{student.rollNo || 'Not Set'}</strong>
                        </span>
                        <span className="bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 text-indigo-900">
                          Enroll: <strong>{student.enrollmentNo || 'Not Set'}</strong>
                        </span>
                        <span className="text-slate-500 font-sans text-[11px]">
                          {student.courseName || student.course} • {student.universityName || student.collegeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Manage Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(student)}
                      className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload &amp; View Marksheets ({files.length})</span>
                    </button>
                  </div>
                </div>

                {/* Semester / Yearly Marksheets Ribbon */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>Semester-wise Progression (Sem 1 to 8):</span>
                    <span className="text-indigo-600">
                      {files.length} Marksheet{files.length !== 1 ? 's' : ''} Attached
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                    {semList.map((sem, sIdx) => {
                      const file = findMarksheetByTerm(student, `sem${sIdx + 1}`);

                      return (
                        <div
                          key={sem}
                          className={`p-2 rounded-xl border text-center transition ${
                            file 
                              ? 'bg-emerald-50/80 border-emerald-300' 
                              : 'bg-white border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-[10px] font-bold block uppercase text-slate-500 mb-1">
                            {sem}
                          </span>

                          {file ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Uploaded</span>
                              </span>
                              <div className="flex items-center justify-center gap-1">
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-slate-700 shadow-2xs border border-slate-200"
                                  title="View PDF"
                                >
                                  <Eye className="w-3 h-3" />
                                </a>
                                <a
                                  href={file.fileUrl}
                                  download={file.fileName || `${sem}_marksheet.pdf`}
                                  className="p-1 rounded bg-white hover:bg-slate-100 text-indigo-700 shadow-2xs border border-slate-200"
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenModal(student, sem)}
                              className="w-full py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded border border-dashed border-slate-300 transition cursor-pointer"
                            >
                              + Upload
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Other Uploaded Marksheets (Year-wise / Consolidated) */}
                  {files.filter(f => !semList.some(s => (f.term || '').toLowerCase().includes(s.toLowerCase().replace(' ', '')))).length > 0 && (
                    <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Other Marksheets:</span>
                      {files.filter(f => !semList.some(s => (f.term || '').toLowerCase().includes(s.toLowerCase().replace(' ', '')))).map(f => (
                        <a
                          key={f.id}
                          href={f.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-800 font-bold hover:border-indigo-400 transition"
                        >
                          <FileText className="w-3 h-3 text-indigo-600" />
                          <span>{f.term}: {f.title}</span>
                          <Eye className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MARKSHEET UPLOAD & MANAGEMENT MODAL                           */}
      {/* ========================================================================= */}
      {modalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black">
                    Semester &amp; Yearly Marksheet Upload Hub
                  </h2>
                  <p className="text-xs text-indigo-200">
                    {modalStudent.fullName || modalStudent.name} • Roll: {modalStudent.rollNo || 'Not Set'} • {modalStudent.courseName || modalStudent.course}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalStudent(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
              
              {/* Upload Box */}
              <div className="bg-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-200 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h3 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-emerald-600" />
                    <span>Upload New Marksheet PDF</span>
                  </h3>
                  <span className="text-[11px] text-emerald-800 font-bold">
                    Supports 4-Year (8 Semesters) or Annual Programs
                  </span>
                </div>

                {/* Quick Term Selector Buttons */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    1. Select Semester / Year / Category:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4',
                      'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8',
                      '1st Year', '2nd Year', '3rd Year', '4th Year',
                      'All Semesters', 'Custom'
                    ].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setUploadTerm(t);
                          if (t === 'All Semesters') setUploadTitle('All Semesters Final Consolidated Marksheet');
                          else if (t.startsWith('Sem')) setUploadTitle(`Semester ${t.replace('Sem', '').trim()} Marksheet`);
                          else if (t.includes('Year')) setUploadTitle(`${t} Marksheet`);
                          else setUploadTitle('');
                        }}
                        className={`px-3 py-1.5 text-xs rounded-xl font-bold transition cursor-pointer ${
                          uploadTerm === t
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Label, File & Upload Button */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Marksheet Label / Title:
                    </label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Semester 1 Marksheet"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Choose PDF / Scanned Copy:
                    </label>
                    <input
                      id="yearly-marksheet-file-input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200 cursor-pointer"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      disabled={!selectedFile || isUploading}
                      onClick={handleUploadMarksheet}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Upload Marksheet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Marksheets Dossier */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Uploaded Marksheets Dossier ({modalMarksheetFiles.length})</span>
                  </h3>
                  <span className="text-xs text-slate-500">
                    All digital copies stored for {modalStudent.fullName || 'student'}
                  </span>
                </div>

                {modalMarksheetFiles.length === 0 ? (
                  <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                    <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">No marksheet PDFs attached yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Select semester or year above, pick a PDF file, and click "Upload Marksheet".
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modalMarksheetFiles.map(file => (
                      <div
                        key={file.id}
                        className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {file.term || 'Marksheet'}
                              </span>
                              <span className="text-xs font-bold text-slate-900 truncate" title={file.title}>
                                {file.title || file.fileName}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {file.fileName} • {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString() : 'Uploaded'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="View / Open PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={file.fileUrl}
                            download={file.fileName || 'marksheet.pdf'}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            disabled={deletingFileId === file.id}
                            onClick={() => handleDeleteMarksheet(file.id, file.title || file.term)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            title="Delete Marksheet PDF"
                          >
                            {deletingFileId === file.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setModalStudent(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Done / Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
