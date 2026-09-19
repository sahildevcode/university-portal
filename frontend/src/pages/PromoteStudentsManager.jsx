import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  RotateCcw,
  Calendar,
  Layers,
  X,
  Users,
  Award,
  BookOpen
} from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export default function PromoteStudentsManager({ 
  courses = [], 
  lang = 'en', 
  toggleLang, 
  onRefreshCourses 
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Promote Modal state
  const [promoteStudent, setPromoteStudent] = useState(null);
  const [nextSemester, setNextSemester] = useState('');
  const [nextClass, setNextClass] = useState('');
  const [nextSession, setNextSession] = useState('');
  const [promotionDate, setPromotionDate] = useState(new Date().toISOString().split('T')[0]);
  const [promotionRemark, setPromotionRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Batch Promote Selection state
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchNextSemester, setBatchNextSemester] = useState('2');
  const [batchNextClass, setBatchNextClass] = useState('SEM-2');
  const [batchNextSession, setBatchNextSession] = useState('');

  const showToast = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Fetch all enrolled students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error loading students for promotion:', err);
      showToast('छात्रों की सूची लोड करने में विफल!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedUniversity, selectedCollege, selectedCourse, selectedSemester, selectedSession, pageSize]);

  // Compute Unique Filter Options
  const universities = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      const u = s.universityName || s.collegeName;
      if (u) set.add(u);
    });
    return Array.from(set).sort();
  }, [students]);

  const colleges = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.collegeName) set.add(s.collegeName);
    });
    return Array.from(set).sort();
  }, [students]);

  const courseNames = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.courseName) set.add(s.courseName);
    });
    return Array.from(set).sort();
  }, [students]);

  const sessions = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      const sess = s.currentSession || s.admissionSession;
      if (sess) set.add(sess);
    });
    return Array.from(set).sort();
  }, [students]);

  // Helper to calculate next semester / class
  const calculateNextTerm = (student) => {
    const curSem = Number(student.currentSemester) || 1;
    const curCls = (student.currentClass || '').toUpperCase();

    if (curCls.includes('YEAR') || curCls.includes('YR')) {
      if (curCls.includes('1ST') || curCls.includes('1')) {
        return { sem: 2, className: '2nd Year' };
      } else if (curCls.includes('2ND') || curCls.includes('2')) {
        return { sem: 3, className: 'Final Year / 3rd Year' };
      }
    }

    const nextSemNum = curSem + 1;
    return {
      sem: nextSemNum,
      className: `SEM-${nextSemNum}`
    };
  };

  // Open Promote Modal for a specific student
  const handleOpenPromote = (student) => {
    setPromoteStudent(student);
    const { sem, className } = calculateNextTerm(student);
    setNextSemester(String(sem));
    setNextClass(className);
    setNextSession(student.currentSession || student.admissionSession || '');
    setPromotionDate(new Date().toISOString().split('T')[0]);
    setPromotionRemark(`Promoted from ${student.currentClass || ('SEM-' + (student.currentSemester || 1))} to ${className}`);
  };

  // Confirm Single Promotion
  const handleConfirmPromote = async (e) => {
    e.preventDefault();
    if (!promoteStudent) return;

    setSubmitting(true);
    try {
      const rollKey = promoteStudent.rollNo || promoteStudent.id;
      const res = await fetch(`/api/students/${rollKey}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextSemester: Number(nextSemester),
          nextClass,
          nextSession,
          promotionDate,
          remark: promotionRemark
        })
      });

      const data = await res.json();
      if (data.success) {
        fireCelebration({ x: 0.5, y: 0.5 });
        showToast(data.message, 'success');
        setPromoteStudent(null);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast(data.message || 'Promotion failed', 'error');
      }
    } catch (err) {
      console.error('Error promoting student:', err);
      showToast('Network error while promoting student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return students.filter(s => {
      // Exclude secondary link shadow records from master promote
      if (s.isSecondaryCourse) return false;

      // University Filter
      if (selectedUniversity !== 'all') {
        const u = (s.universityName || s.collegeName || '').toLowerCase();
        if (!u.includes(selectedUniversity.toLowerCase())) return false;
      }

      // College Filter
      if (selectedCollege !== 'all') {
        const col = (s.collegeName || '').toLowerCase();
        if (!col.includes(selectedCollege.toLowerCase())) return false;
      }

      // Course Filter
      if (selectedCourse !== 'all') {
        const crs = (s.courseName || '').toLowerCase();
        if (!crs.includes(selectedCourse.toLowerCase())) return false;
      }

      // Semester Filter
      if (selectedSemester !== 'all') {
        const curSem = String(s.currentSemester || 1);
        const curCls = (s.currentClass || '').toUpperCase();
        if (selectedSemester.startsWith('SEM-')) {
          const targetSem = selectedSemester.replace('SEM-', '');
          if (curSem !== targetSem && !curCls.includes(selectedSemester)) return false;
        } else if (!curCls.includes(selectedSemester.toUpperCase())) {
          return false;
        }
      }

      // Session Filter
      if (selectedSession !== 'all') {
        const sess = s.currentSession || s.admissionSession || '';
        if (sess !== selectedSession) return false;
      }

      if (!q) return true;

      const nameMatch = (s.fullName || s.studentName || '').toLowerCase().includes(q);
      const rollMatch = (s.rollNo || s.enrollmentNo || s.registrationNo || '').toLowerCase().includes(q);
      const fatherMatch = (s.fatherName || s.father_name || '').toLowerCase().includes(q);
      const phoneMatch = (s.phone || s.contact || '').toString().includes(q);
      const courseMatch = (s.courseName || '').toLowerCase().includes(q);

      return nameMatch || rollMatch || fatherMatch || phoneMatch || courseMatch;
    });
  }, [students, searchQuery, selectedUniversity, selectedCollege, selectedCourse, selectedSemester, selectedSession]);

  // Pagination Calculations
  const totalEntries = filteredStudents.length;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalEntries / (Number(pageSize) || 10)));
  const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * Number(pageSize);
  const endIndex = pageSize === 'all' ? totalEntries : Math.min(startIndex + Number(pageSize), totalEntries);
  const paginatedStudents = pageSize === 'all' ? filteredStudents : filteredStudents.slice(startIndex, endIndex);

  // Batch Select / Deselect
  const toggleSelectCurrentPage = () => {
    const pageRolls = paginatedStudents.map(s => s.rollNo || s.id);
    const allPageSelected = pageRolls.length > 0 && pageRolls.every(r => selectedRolls.includes(r));
    if (allPageSelected) {
      setSelectedRolls(prev => prev.filter(r => !pageRolls.includes(r)));
    } else {
      setSelectedRolls(prev => Array.from(new Set([...prev, ...pageRolls])));
    }
  };

  const toggleSelectAllFiltered = () => {
    if (selectedRolls.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedRolls([]);
    } else {
      setSelectedRolls(filteredStudents.map(s => s.rollNo || s.id));
    }
  };

  const toggleSelectStudent = (roll) => {
    setSelectedRolls(prev => 
      prev.includes(roll) ? prev.filter(r => r !== roll) : [...prev, roll]
    );
  };

  // Confirm Batch Promotion
  const handleConfirmBatchPromote = async (e) => {
    e.preventDefault();
    if (selectedRolls.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/students/batch-promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumbers: selectedRolls,
          nextSemester: Number(batchNextSemester),
          nextClass: batchNextClass,
          nextSession: batchNextSession,
          promotionDate: new Date().toISOString().split('T')[0],
          remark: `Batch promoted to ${batchNextClass}`
        })
      });

      const data = await res.json();
      if (data.success) {
        fireCelebration({ x: 0.5, y: 0.5 });
        showToast(data.message, 'success');
        setShowBatchModal(false);
        setSelectedRolls([]);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast(data.message || 'Batch promotion failed', 'error');
      }
    } catch (err) {
      console.error('Error in batch promotion:', err);
      showToast('Network error in batch promotion', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fadeIn text-slate-900">
      
      {/* Toast Notification */}
      {feedback && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-bold animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-emerald-950 text-white border-emerald-500/50 ring-4 ring-emerald-500/20' 
            : 'bg-rose-950 text-white border-rose-500/50 ring-4 ring-rose-500/20'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-indigo-900/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 text-amber-300 text-[11px] font-black uppercase tracking-wider bg-amber-400/10 px-3 py-0.5 rounded-full border border-amber-400/20">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Academic Progression &amp; Semester Upgrade Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>🚀 Promote Students</span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
              Module 04
            </span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            छात्रों को अगले सेमेस्टर (जैसे SEM-1 से SEM-2) या अगले वर्ष में 1-क्लिक से प्रमोट करें। प्रमोट होते ही यह छात्र रिकॉर्ड, फीस काउंटर और यूनिवर्सिटी सेटलमेंट में स्वतः अपडेट हो जाएगा।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          {selectedRolls.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBatchModal(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>Batch Promote ({selectedRolls.length} Selected)</span>
            </button>
          )}

          <div className="bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-left">
            <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Enrolled</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 block mt-0.5">
              {students.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
        
        {/* Top Search Line */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Student Name, Roll No, Enrollment No, Father Name, Contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedUniversity('all');
              setSelectedCollege('all');
              setSelectedCourse('all');
              setSelectedSemester('all');
              setSelectedSession('all');
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
          
          {/* University */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none text-xs"
            >
              <option value="all">All Universities</option>
              {universities.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* College */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Affiliated College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none text-xs"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Degree Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none text-xs"
            >
              <option value="all">All Courses</option>
              {courseNames.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Current Semester / Class */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Current Term</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-indigo-950 focus:bg-white focus:outline-none text-xs"
            >
              <option value="all">All Semesters / Years</option>
              <option value="SEM-1">SEM-1 (1st Semester)</option>
              <option value="SEM-2">SEM-2 (2nd Semester)</option>
              <option value="SEM-3">SEM-3 (3rd Semester)</option>
              <option value="SEM-4">SEM-4 (4th Semester)</option>
              <option value="SEM-5">SEM-5 (5th Semester)</option>
              <option value="SEM-6">SEM-6 (6th Semester)</option>
              <option value="1st Year">1st Year (Annual)</option>
              <option value="2nd Year">2nd Year (Annual)</option>
              <option value="Final Year">Final Year (Annual)</option>
            </select>
          </div>

          {/* Academic Session */}
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none text-xs"
            >
              <option value="all">All Sessions</option>
              {sessions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Students Directory Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Summary */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
              Enrolled Students:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-950 text-xs font-black">
              {filteredStudents.length} Found
            </span>
            {selectedRolls.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                {selectedRolls.length} Selected
              </span>
            )}
          </div>

          <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleSelectCurrentPage}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              {paginatedStudents.length > 0 && paginatedStudents.every(s => selectedRolls.includes(s.rollNo || s.id))
                ? 'Deselect Page'
                : 'Select Current Page'}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={toggleSelectAllFiltered}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              {selectedRolls.length === filteredStudents.length && filteredStudents.length > 0
                ? 'Deselect All'
                : `Select All (${filteredStudents.length})`}
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>छात्रों की सूची लोड हो रही है...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-2">
            <Users className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <p className="font-bold text-slate-700">कोई छात्र रिकॉर्ड नहीं मिला!</p>
            <p className="text-xs text-slate-400">फिल्टर बदलकर या सर्च शब्द साफ़ करके पुनः देखें।</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-900 text-white uppercase text-[10.5px] font-black tracking-wider select-none">
                <tr>
                  <th className="p-3 text-center w-10 shrink-0">
                    <input
                      type="checkbox"
                      checked={
                        paginatedStudents.length > 0 &&
                        paginatedStudents.every(s => selectedRolls.includes(s.rollNo || s.id))
                      }
                      onChange={toggleSelectCurrentPage}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                      title="Select/Deselect current page"
                    />
                  </th>
                  <th className="p-3 text-center w-12 shrink-0">#</th>
                  <th className="p-3 min-w-[190px] max-w-[240px]">Student Details</th>
                  <th className="p-3 min-w-[150px] max-w-[190px]">University &amp; College</th>
                  <th className="p-3 min-w-[130px] max-w-[170px]">Course</th>
                  <th className="p-3 whitespace-nowrap">Session</th>
                  <th className="p-3 text-center min-w-[180px]">Progression (वर्तमान ➔ आगामी)</th>
                  <th className="p-3 text-center sticky right-0 z-20 bg-slate-900 text-amber-300 shadow-[-4px_0_10px_rgba(0,0,0,0.3)] whitespace-nowrap min-w-[140px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedStudents.map((student, sIdx) => {
                  const roll = student.rollNo || student.id;
                  const isSelected = selectedRolls.includes(roll);
                  const curSem = student.currentSemester || 1;
                  const curClass = student.currentClass || `SEM-${curSem}`;
                  const { sem: nextSemNum, className: nextClsName } = calculateNextTerm(student);
                  const serialNo = startIndex + sIdx + 1;

                  return (
                    <tr 
                      key={roll} 
                      className={`hover:bg-indigo-50/40 transition-colors ${
                        isSelected ? 'bg-amber-50/70' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(roll)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      {/* Serial Number */}
                      <td className="p-2.5 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {serialNo}
                      </td>

                      {/* Student Details */}
                      <td className="p-2.5 max-w-[240px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600 text-xs">
                            {student.studentImage || student.photo ? (
                              <img 
                                src={student.studentImage || student.photo} 
                                alt={student.fullName} 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <span>{(student.fullName || 'S')[0]}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block leading-snug truncate" title={student.fullName || student.studentName}>
                              {student.fullName || student.studentName || 'Student'}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate" title={`Father: ${student.fatherName || '—'}`}>
                              Father: {student.fatherName || student.father_name || '—'}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-700 font-bold block truncate">
                              {student.rollNo || student.enrollmentNo || 'NO-ROLL'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* University & College */}
                      <td className="p-2.5 max-w-[190px]">
                        <span className="font-bold text-slate-800 block truncate" title={student.universityName}>
                          {student.universityName || '—'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate" title={student.collegeName}>
                          {student.collegeName || '—'}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="p-2.5 max-w-[170px]">
                        <span className="font-bold text-indigo-950 block truncate" title={student.courseName}>
                          {student.courseName}
                        </span>
                        {student.branch && (
                          <span className="text-[10px] text-slate-500 block truncate" title={student.branch}>
                            {student.branch}
                          </span>
                        )}
                      </td>

                      {/* Current Session */}
                      <td className="p-2.5 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {student.currentSession || student.admissionSession || '2024-25'}
                      </td>

                      {/* Progression (Current -> Next) */}
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-xl">
                          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-black bg-slate-900 text-amber-300">
                            {curClass}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
                          <span className="px-2 py-0.5 rounded-md text-[10.5px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {nextClsName}
                          </span>
                        </div>
                      </td>

                      {/* Action Column: Sticky Right */}
                      <td className="p-2.5 text-center sticky right-0 z-10 bg-white/95 backdrop-blur-xs shadow-[-6px_0_10px_rgba(0,0,0,0.06)] border-l border-slate-100 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenPromote(student)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 mx-auto cursor-pointer group active:scale-95"
                          title={`Promote ${student.fullName} to next semester/year`}
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
                          <span>Promote Student</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination Controls */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              Showing <strong className="text-slate-900">{totalEntries > 0 ? startIndex + 1 : 0}</strong> to{' '}
              <strong className="text-slate-900">{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalEntries}</strong> students
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">|</span>
              <label className="text-[11px] text-slate-500 font-bold">Rows:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setPageSize(val);
                }}
                className="bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
            </div>
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold text-[11px] disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
              >
                « First
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold text-[11px] disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                title="Previous Page"
              >
                ‹ Prev
              </button>
              <span className="px-3 py-1 font-black text-slate-800 bg-white border border-slate-200 rounded-lg shadow-xs text-xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold text-[11px] disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                title="Next Page"
              >
                Next ›
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white font-bold text-[11px] disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
              >
                Last »
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 1-CLICK PROMOTION MODAL FOR INDIVIDUAL STUDENT (COMPACT & RESPONSIVE) */}
      {/* ========================================================================= */}
      {promoteStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-fadeIn"
          onClick={() => setPromoteStudent(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl text-slate-900 shadow-2xl border-2 border-indigo-100 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top) */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                    Promote Student to Next Term
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    अगले सेमेस्टर / वर्ष में प्रमोट करने की पुष्टि करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPromoteStudent(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <form onSubmit={handleConfirmPromote} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
                
                {/* Student Info Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Name</span>
                      <strong className="text-sm font-black text-slate-900 block truncate mt-0.5">
                        {promoteStudent.fullName || promoteStudent.studentName}
                      </strong>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Roll Number</span>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded block mt-0.5">
                        {promoteStudent.rollNo || promoteStudent.enrollmentNo || 'NO-ROLL'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1.5">
                    <span className="truncate max-w-[200px]" title={promoteStudent.courseName}>
                      Course: <strong className="text-slate-900">{promoteStudent.courseName}</strong>
                    </span>
                    <span className="truncate max-w-[180px]" title={promoteStudent.universityName}>
                      Univ: <strong className="text-slate-900">{promoteStudent.universityName}</strong>
                    </span>
                  </div>
                </div>

                {/* Visual Progression Card */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3 rounded-xl flex items-center justify-between shadow-inner">
                  <div className="text-center min-w-[70px]">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Current</span>
                    <span className="text-xs font-black text-amber-300 block mt-0.5">
                      {promoteStudent.currentClass || `SEM-${promoteStudent.currentSemester || 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                    <span>Promoting</span>
                    <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
                  </div>

                  <div className="text-center min-w-[70px]">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Next Target</span>
                    <span className="text-xs font-black text-emerald-400 block mt-0.5">
                      {nextClass || `SEM-${nextSemester}`}
                    </span>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Sem Number *</label>
                    <select
                      value={nextSemester}
                      onChange={(e) => {
                        setNextSemester(e.target.value);
                        setNextClass(`SEM-${e.target.value}`);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    >
                      <option value="1">1 (SEM-1)</option>
                      <option value="2">2 (SEM-2)</option>
                      <option value="3">3 (SEM-3)</option>
                      <option value="4">4 (SEM-4)</option>
                      <option value="5">5 (SEM-5)</option>
                      <option value="6">6 (SEM-6)</option>
                      <option value="7">7 (SEM-7)</option>
                      <option value="8">8 (SEM-8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Class / Label *</label>
                    <input
                      type="text"
                      value={nextClass}
                      onChange={(e) => setNextClass(e.target.value)}
                      placeholder="e.g. SEM-2 or 2nd Year"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Session *</label>
                    <input
                      type="text"
                      value={nextSession}
                      onChange={(e) => setNextSession(e.target.value)}
                      placeholder="e.g. 2024-25"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Promotion Date *</label>
                    <input
                      type="date"
                      value={promotionDate}
                      onChange={(e) => setPromotionDate(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 text-[11px]">Promotion Remarks / Note</label>
                  <input
                    type="text"
                    value={promotionRemark}
                    onChange={(e) => setPromotionRemark(e.target.value)}
                    placeholder="e.g. Promoted to SEM-2 after fee clearance"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

              </div>

              {/* Modal Sticky Footer (Always in View, never cut off!) */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setPromoteStudent(null)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 text-xs"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  <span>{submitting ? 'Promoting...' : `Confirm & Promote`}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH PROMOTION MODAL (COMPACT & RESPONSIVE) */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-fadeIn"
          onClick={() => setShowBatchModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl text-slate-900 shadow-2xl border-2 border-amber-200 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                    Batch Promote ({selectedRolls.length} Students)
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    चुने गए सभी छात्रों को एक साथ प्रमोट करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleConfirmBatchPromote} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
                
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                  <span className="font-bold block">
                    ⚠️ {selectedRolls.length} छात्रों का चयन किया गया है
                  </span>
                  <span className="text-[11px] text-amber-800 block mt-0.5">
                    यह सभी छात्र एक साथ नीचे चुने गए नए सेमेस्टर व क्लास में प्रमोट हो जाएंगे।
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Sem Number *</label>
                    <select
                      value={batchNextSemester}
                      onChange={(e) => {
                        setBatchNextSemester(e.target.value);
                        setBatchNextClass(`SEM-${e.target.value}`);
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    >
                      <option value="2">2 (SEM-2)</option>
                      <option value="3">3 (SEM-3)</option>
                      <option value="4">4 (SEM-4)</option>
                      <option value="5">5 (SEM-5)</option>
                      <option value="6">6 (SEM-6)</option>
                      <option value="7">7 (SEM-7)</option>
                      <option value="8">8 (SEM-8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Class / Label *</label>
                    <input
                      type="text"
                      value={batchNextClass}
                      onChange={(e) => setBatchNextClass(e.target.value)}
                      placeholder="e.g. SEM-2 or 2nd Year"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 text-[11px]">Academic Session (Optional)</label>
                  <input
                    type="text"
                    value={batchNextSession}
                    onChange={(e) => setBatchNextSession(e.target.value)}
                    placeholder="e.g. 2025-26 (वर्तमान सेशन रखने हेतु खाली छोड़ें)"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none font-mono"
                  />
                </div>

              </div>

              {/* Sticky Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 text-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Promoting Batch...' : `Promote All ${selectedRolls.length} Students`}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
