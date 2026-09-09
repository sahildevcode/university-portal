import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ShieldCheck, 
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  Plus,
  Edit3,
  X,
  Search,
  Clock,
  Award,
  GraduationCap,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  CreditCard,
  Lock
} from 'lucide-react';

export default function SyllabusManager({ courses, onRefreshCourses }) {
  // Two main options requested by user:
  // 'courses': 1. Create & Manage Courses (क्रिएट / एडिट कोर्स)
  // 'syllabus': 2. Course Syllabus Manager (सिलेबस अपलोड / अपडेट)
  const [activeSubTab, setActiveSubTab] = useState('courses');

  // Course Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  // Form State for Adding / Editing Course with Fees
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    department: 'School of Computing & IT',
    durationYears: 1,
    durationText: '1 Year Diploma',
    totalSemesters: 2,
    eligibility: '10+2 in any stream (Min 45%)',
    description: '',
    totalFee: 30000,
    feePerSemester: 15000
  });

  // Syllabus Upload State
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Keep selected course in sync if courses array changes
  useEffect(() => {
    if (!selectedCourseId && courses.length > 0) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0] || null;
  const currentSyllabusFile = selectedCourse?.syllabusFiles?.[selectedSemester] || null;

  const totalSemesters = selectedCourse?.totalSemesters || 6;
  const semesterOptions = Array.from({ length: totalSemesters }, (_, i) => String(i + 1));

  // Departments list for filter
  const departments = ['all', ...new Set(courses.map(c => c.department).filter(Boolean))];

  // Filtered courses for Course Management list
  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'all' || c.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Open Modal to Add New Course
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      code: '',
      department: 'School of Computing & IT',
      durationYears: 1,
      durationText: '1 Year Diploma',
      totalSemesters: 2,
      eligibility: '10+2 in any stream (Min 45%)',
      description: 'Comprehensive program designed to provide practical industry-grade computer and technical training.',
      totalFee: 30000,
      feePerSemester: 15000
    });
    setShowCourseModal(true);
    setErrorMsg(null);
  };

  // Open Modal to Edit Existing Course (prefill all fields including fees)
  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name || '',
      code: course.code || '',
      department: course.department || 'School of Computing & IT',
      durationYears: course.durationYears || 1,
      durationText: `${course.durationYears} Year(s)`,
      totalSemesters: course.totalSemesters || 2,
      eligibility: course.eligibility || '',
      description: course.description || '',
      totalFee: course.totalFee !== undefined ? course.totalFee : 0,
      feePerSemester: course.feePerSemester !== undefined ? course.feePerSemester : 0
    });
    setShowCourseModal(true);
    setErrorMsg(null);
  };

  // Save Course (POST or PUT)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code) {
      setErrorMsg('Course name and code are required.');
      return;
    }

    setSavingCourse(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const payload = {
        ...courseForm,
        durationYears: Number(courseForm.durationYears) || 1,
        totalSemesters: Number(courseForm.totalSemesters) || 2,
        totalFee: Number(courseForm.totalFee) || 0,
        feePerSemester: Number(courseForm.feePerSemester) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save course.');
      }

      setShowCourseModal(false);
      setSuccessMsg(editingCourse 
        ? `Course "${courseForm.name}" & internal fees updated successfully!` 
        : `New Course "${courseForm.name}" created with fees! You can now upload its syllabus.`);

      if (onRefreshCourses) await onRefreshCourses();

      // If newly created, auto-select it for syllabus upload
      if (!editingCourse && data.course?.id) {
        setSelectedCourseId(data.course.id);
        setSelectedSemester('1');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingCourse(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to permanently delete the course "${courseName}"?`)) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete course.');
      }

      setSuccessMsg(`Course "${courseName}" was deleted.`);
      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Shortcut from Course Card to Syllabus Upload
  const handleJumpToSyllabus = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSemester('1');
    setActiveSubTab('syllabus');
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  // Syllabus File Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      setErrorMsg('Please choose a PDF or Excel file to upload.');
      return;
    }

    if (!selectedCourse) {
      setErrorMsg('No course selected. Please select a valid course first.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('semester', selectedSemester);

      const res = await fetch(`/api/courses/${selectedCourse.id}/syllabus-file`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload syllabus file.');
      }

      setSuccessMsg(`Syllabus for ${selectedCourse.name} (Semester ${selectedSemester}) uploaded successfully! Students can now view & download it.`);
      setFileToUpload(null);
      const inputEl = document.getElementById('syllabus-file-input');
      if (inputEl) inputEl.value = '';

      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete Syllabus File
  const handleDeleteFile = async () => {
    if (!window.confirm(`Are you sure you want to remove the syllabus file for Semester ${selectedSemester}?`)) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/syllabus-file/${selectedSemester}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove syllabus file.');
      }

      setSuccessMsg(`Semester ${selectedSemester} syllabus removed.`);
      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Academic Hub &amp; Curricula Management
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                Course &amp; Syllabus Master Hub
              </h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                कोर्स बनाएं, फीस एडिट करें एवं प्रत्येक सेमेस्टर का आधिकारिक सिलेबस (PDF/Excel) अपलोड करें। (पब्लिक से फीस छुपी रहेगी)
              </p>
            </div>
          </div>

          {/* Quick Count Badge */}
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
            <span className="text-[11px] text-indigo-200 block">Total Active Programs</span>
            <span className="text-xl font-black text-white">{courses.length} Courses</span>
          </div>
        </div>
      </div>

      {/* TWO PRIMARY OPTIONS NAVIGATION (Requested by user) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('courses');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`w-full sm:w-1/2 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>ऑप्शन 1: 📚 कोर्स बनाएं व फीस एडिट करें (Create &amp; Edit Courses)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveSubTab('syllabus');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`w-full sm:w-1/2 flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'syllabus'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>ऑप्शन 2: 📄 सिलेबस अपलोड एवं अपडेट (Upload &amp; Manage Syllabus)</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          {activeSubTab === 'courses' && (
            <button
              onClick={() => setActiveSubTab('syllabus')}
              className="underline text-emerald-800 hover:text-emerald-950 shrink-0 cursor-pointer"
            >
              Upload Syllabus Now &rarr;
            </button>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 1: CREATE & MANAGE COURSES (कोर्स बनाएं, फीस एडिट करें) */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Available Courses &amp; Academic Programs ({filteredCourses.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                नए कोर्स या डिप्लोमा जोड़ें, उनकी फीस एडिट करें। (यह फीस छात्रों को नहीं दिखेगी, सिर्फ एडमिन/कैश काउंटर हेतु है)
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCourse}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create New Course / Program (नया कोर्स जोड़ें)</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search course name, code or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDeptFilter === dept
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept.replace('School of ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((c) => {
              const uploadedCount = c.syllabusFiles ? Object.keys(c.syllabusFiles).length : 0;
              const totalSem = c.totalSemesters || 6;

              return (
                <div 
                  key={c.id} 
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {c.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {c.department}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                          {c.name}
                        </h3>
                      </div>

                      {/* Syllabus Status Pill */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        uploadedCount > 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {uploadedCount > 0 ? `${uploadedCount}/${totalSem} Syllabus Files` : 'No Syllabus Yet'}
                      </span>
                    </div>

                    {/* Course Metrics */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Duration</span>
                        <strong className="text-slate-800">
                          {c.durationYears >= 1 ? `${c.durationYears} Year(s)` : `${c.durationYears * 12} Months`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Total Semesters</span>
                        <strong className="text-slate-800">{totalSem} Semester(s)</strong>
                      </div>
                    </div>

                    {/* INTERNAL CONSULTANT FEE BLOCK (Requested by user) */}
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                            <span>कंसल्टेंसी फीस (Internal Record):</span>
                          </span>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            🔒 छात्रों से छुपी हुई
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-slate-600">
                            Total Fee: <strong className="text-indigo-950 font-black text-sm">₹{Number(c.totalFee || 0).toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">
                            Per Sem: <strong className="text-emerald-700 font-bold">₹{Number(c.feePerSemester || 0).toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                      >
                        ✏️ फीस एडिट करें
                      </button>
                    </div>

                    {/* Eligibility */}
                    <div className="text-xs bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-amber-950">
                      <span className="font-bold text-amber-900">Eligibility: </span>
                      <span className="text-amber-800">{c.eligibility}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Direct Syllabus Jump Button */}
                    <button
                      type="button"
                      onClick={() => handleJumpToSyllabus(c.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-100 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Syllabus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                        title="Edit Course Information and Fees"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Course &amp; Fee</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id, c.name)}
                        className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2: SEMESTER SYLLABUS MANAGER & UPLOAD (सिलेबस अपलोड / अपडेट) */}
      {/* ========================================================================= */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-8">
          
          {/* 3-Control Box for Upload */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Upload Official Semester Syllabus Document</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                कोर्स और सेमेस्टर चुनें, फिर उसका सिलेबस (PDF / Excel) अपलोड करें। यह तुरंत छात्र के लिए डाउनलोड हेतु उपलब्ध हो जाएगा।
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. SELECT DEGREE / DIPLOMA PROGRAM */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Select Program / Course *
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('courses')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      + Add New Course
                    </button>
                  </div>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedSemester('1');
                      setSuccessMsg(null);
                      setErrorMsg(null);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code}) — {course.durationYears >= 1 ? `${course.durationYears} Yr` : `${course.durationYears * 12} Mo`}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Department: {selectedCourse?.department} • Total Semesters: {totalSemesters}
                  </span>
                </div>

                {/* 2. SELECT SEMESTER */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Select Semester *
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSuccessMsg(null);
                      setErrorMsg(null);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} (Sem {sem})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Uploading syllabus specifically for Semester {selectedSemester}
                  </span>
                </div>

              </div>

              {/* 3. UPLOAD FILE (PDF / EXCEL) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Upload Syllabus File (PDF, Excel, Word, CSV) *
                </label>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-6 bg-slate-50/60 transition-colors text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Choose a PDF or Excel / CSV document
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supported formats: .pdf, .xlsx, .xls, .docx, .doc, .csv (Max: 30MB)
                    </p>
                  </div>

                  <input
                    id="syllabus-file-input"
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                    onChange={(e) => setFileToUpload(e.target.files[0] || null)}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
                  />

                  {fileToUpload && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>Selected: {fileToUpload.name} ({(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploading || !fileToUpload}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading Document...' : `Upload Semester ${selectedSemester} Syllabus`}</span>
                  </button>
                </div>

              </div>

            </form>

            {/* Current Uploaded Syllabus Status for Selected Semester */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Live Syllabus Document for {selectedCourse?.name} — Semester {selectedSemester}:
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Status on Student Portal
                </span>
              </div>

              {currentSyllabusFile ? (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      {currentSyllabusFile.fileName?.endsWith('.xls') || currentSyllabusFile.fileName?.endsWith('.xlsx') || currentSyllabusFile.fileName?.endsWith('.csv') ? (
                        <FileSpreadsheet className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{currentSyllabusFile.fileName}</span>
                        <span className="text-[10px] font-mono bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          ACTIVE ON PORTAL
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Uploaded on {new Date(currentSyllabusFile.uploadedAt).toLocaleString()} • Size: {currentSyllabusFile.fileSize ? `${(currentSyllabusFile.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={currentSyllabusFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / View</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteFile}
                      disabled={uploading}
                      className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-2 rounded-xl text-xs border border-rose-200 transition-colors cursor-pointer"
                      title="Remove this syllabus file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold">
                    No syllabus document has been uploaded for Semester {selectedSemester} yet.
                  </p>
                  <p className="text-[11px]">
                    Please select a PDF or Excel document above and click "Upload" to make it available for students to download.
                  </p>
                </div>
              )}
            </div>

            {/* Semester-by-Semester Status Cards for Selected Course */}
            {selectedCourse && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  All Semesters Syllabus Overview ({selectedCourse.name}):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {semesterOptions.map((sem) => {
                    const file = selectedCourse.syllabusFiles?.[sem];
                    const isSelected = selectedSemester === sem;

                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => setSelectedSemester(sem)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'ring-2 ring-indigo-600 border-indigo-600 bg-indigo-50/50' 
                            : file 
                              ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">Sem {sem}</span>
                          {file ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate mt-1">
                          {file ? file.fileName : 'Not Uploaded'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT COURSE (WITH FULL INTERNAL FEE SETTINGS) */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span>{editingCourse ? `Edit Course & Fees (${editingCourse.name})` : 'Create New Course / Program'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  कोर्स का विवरण एवं आंतरिक कंसल्टेंसी फीस सेट करें। (यह फीस छात्रों से 100% छुपी रहेगी)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Course Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Course / Program Name * (e.g. Diploma in Computer Applications / BCA / PGDCA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diploma in Computer Applications (DCA)"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Course Code */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Course Code * (e.g. DCA-01, BCA, PGDCA)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DCA-101"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Department / Stream */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Department / Stream *
                  </label>
                  <select
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="School of Computing & IT">School of Computing &amp; IT</option>
                    <option value="Department of Vocational Studies">Department of Vocational Studies</option>
                    <option value="School of Management">School of Management</option>
                    <option value="School of Science">School of Science</option>
                    <option value="School of Engineering & Technology">School of Engineering &amp; Technology</option>
                    <option value="Skill Development & Certification">Skill Development &amp; Certification</option>
                    <option value="School of Advanced Studies">School of Advanced Studies</option>
                  </select>
                </div>

                {/* Duration in Years */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Duration (in Years) *
                  </label>
                  <select
                    value={courseForm.durationYears}
                    onChange={(e) => setCourseForm({ ...courseForm, durationYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value={0.5}>6 Months (0.5 Year)</option>
                    <option value={1}>1 Year (Diploma / Cert)</option>
                    <option value={2}>2 Years (Masters / PG)</option>
                    <option value={3}>3 Years (Bachelor Degree)</option>
                    <option value={4}>4 Years (Engineering / Honors)</option>
                    <option value={5}>5 Years (Integrated)</option>
                  </select>
                </div>

                {/* Total Semesters */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Total Semesters * (e.g. 2 for 1-Yr Diploma, 6 for 3-Yr Degree)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={courseForm.totalSemesters}
                    onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* ========================================================================= */}
                {/* 💰 INTERNAL CONSULTANT FEE CONFIGURATION (Requested by User) */}
                {/* ========================================================================= */}
                <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-indigo-50/50 border border-indigo-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-extrabold text-xs text-indigo-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>कोर्स फीस सेटिंग (Internal Consultant Fee Configuration) *</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 self-start sm:self-auto">
                      <Lock className="w-3 h-3" />
                      <span>100% Private (छात्रों से छुपी रहेगी)</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    आप कंसल्टेंट हैं, इसलिए यह फीस केवल आपके एडमिन एवं कैश काउंटर रिकॉर्ड हेतु है। छात्र या पब्लिक वेबसाइट पर किसी भी डिग्री/डिप्लोमा की फीस कभी नहीं दिखाई जाएगी।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Total Course Fee (कुल कोर्स फीस ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="e.g. 30000"
                          value={courseForm.totalFee}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const sems = Number(courseForm.totalSemesters) || 1;
                            setCourseForm({
                              ...courseForm,
                              totalFee: val,
                              feePerSemester: sems > 0 ? Math.round(val / sems) : val
                            });
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-indigo-950 focus:outline-none focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Fee Per Semester (प्रति सेमेस्टर फीस ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="e.g. 15000"
                          value={courseForm.feePerSemester}
                          onChange={(e) => setCourseForm({ ...courseForm, feePerSemester: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-emerald-700 focus:outline-none focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Eligibility Criteria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10th Pass / 10+2 with Math/Computer (Min 45%)"
                    value={courseForm.eligibility}
                    onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Course Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Course Description &amp; Curriculum Summary * (Visible to students)
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter detailed description of the program, practical skills taught, career scope, and academic objectives..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed font-normal"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCourse}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{savingCourse ? 'Saving Course...' : editingCourse ? 'Save Changes & Fees' : 'Create & Publish Course'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
