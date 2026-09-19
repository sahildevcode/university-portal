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

  // Batch Select / Deselect
  const toggleSelectAll = () => {
    if (selectedRolls.length === filteredStudents.length) {
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
    <div className="w-full space-y-6 animate-fadeIn text-slate-900">
      
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
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Academic Progression &amp; Semester Upgrade Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🚀 Promote Students</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
              Module 04
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            छात्रों को अगले सेमेस्टर (जैसे SEM-1 से SEM-2) या अगले वर्ष में 1-क्लिक से प्रमोट करें। प्रमोट करते ही यह बदलाव छात्र रिकॉर्ड, फीस काउंटर, यूनिवर्सिटी सेटलमेंट और सभी प्रिंट वाउचर्स में तुरंत अपडेट हो जाएगा।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {selectedRolls.length > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs shadow-xl flex items-center gap-2 transition-all cursor-pointer animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>Batch Promote ({selectedRolls.length} Selected)</span>
            </button>
          )}

          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Enrolled</span>
            <span className="text-sm font-black text-amber-400 block mt-0.5">
              {students.length} Students
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        
        {/* Top Search Line */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Student Name, Roll No, Enrollment No, Father Name, Contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedUniversity('all');
              setSelectedCollege('all');
              setSelectedCourse('all');
              setSelectedSemester('all');
              setSelectedSession('all');
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          
          {/* University */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">University</label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="all">All Universities</option>
              {universities.map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* College */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Affiliated College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Degree Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="all">All Courses</option>
              {courseNames.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Current Semester / Class */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Current Term</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none font-semibold text-indigo-900"
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
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Summary */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Enrolled Students:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-xs font-bold">
              {filteredStudents.length} Found
            </span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              {selectedRolls.length === filteredStudents.length && filteredStudents.length > 0
                ? 'Deselect All'
                : 'Select All on Screen'}
            </button>
            {selectedRolls.length > 0 && (
              <span className="font-bold text-amber-600">
                ({selectedRolls.length} selected)
              </span>
            )}
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
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5 text-center w-12">
                    <input
                      type="checkbox"
                      checked={selectedRolls.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5">Student Details</th>
                  <th className="p-3.5">University &amp; College</th>
                  <th className="p-3.5">Course &amp; Branch</th>
                  <th className="p-3.5">Current Session</th>
                  <th className="p-3.5 text-center">Current Status</th>
                  <th className="p-3.5 text-center">Next Target</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const roll = student.rollNo || student.id;
                  const isSelected = selectedRolls.includes(roll);
                  const curSem = student.currentSemester || 1;
                  const curClass = student.currentClass || `SEM-${curSem}`;
                  const { sem: nextSemNum, className: nextClsName } = calculateNextTerm(student);

                  return (
                    <tr 
                      key={roll} 
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectStudent(roll)}
                          className="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                      </td>

                      {/* Student Details */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600">
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
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {student.fullName || student.studentName || 'Student'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Father: {student.fatherName || student.father_name || '—'}
                            </span>
                            <span className="text-[10px] font-mono text-indigo-600 font-bold block mt-0.5">
                              {student.rollNo || student.enrollmentNo || 'NO-ROLL'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* University & College */}
                      <td className="p-3 max-w-[200px]">
                        <span className="font-semibold text-slate-800 block truncate" title={student.universityName}>
                          {student.universityName || '—'}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate" title={student.collegeName}>
                          {student.collegeName || '—'}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="p-3">
                        <span className="font-bold text-indigo-950 block">
                          {student.courseName}
                        </span>
                        {student.branch && (
                          <span className="text-[10px] text-slate-500 block">
                            {student.branch}
                          </span>
                        )}
                      </td>

                      {/* Current Session */}
                      <td className="p-3 font-mono font-semibold text-slate-700">
                        {student.currentSession || student.admissionSession || '2024-25'}
                      </td>

                      {/* Current Status Badge */}
                      <td className="p-3 text-center">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-slate-900 text-amber-300 border border-slate-700 shadow-xs">
                          {curClass}
                        </span>
                      </td>

                      {/* Next Target Badge */}
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>{nextClsName}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </td>

                      {/* ACTION: ONLY ONE PROMINENT BUTTON (AS REQUESTED) */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenPromote(student)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 mx-auto cursor-pointer group active:scale-95"
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

      </div>

      {/* ========================================================================= */}
      {/* 1-CLICK PROMOTION MODAL FOR INDIVIDUAL STUDENT */}
      {/* ========================================================================= */}
      {promoteStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-4 flex justify-center items-center animate-fadeIn"
          onClick={() => setPromoteStudent(null)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 text-slate-900 shadow-2xl border-2 border-indigo-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black shadow-md">
                  <TrendingUp className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    Promote Student to Next Term
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    अगले सेमेस्टर या वर्ष में प्रमोट करने की पुष्टि करें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPromoteStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 block uppercase">Student Name</span>
                  <strong className="text-base font-black text-slate-900 block mt-0.5">
                    {promoteStudent.fullName || promoteStudent.studentName}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block uppercase">Roll Number</span>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded block mt-0.5">
                    {promoteStudent.rollNo || promoteStudent.enrollmentNo || 'NO-ROLL'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                <span>Course: <strong className="text-slate-900">{promoteStudent.courseName}</strong></span>
                <span>Univ: <strong className="text-slate-900">{promoteStudent.universityName}</strong></span>
              </div>
            </div>

            {/* Visual Progression Step */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 rounded-2xl flex items-center justify-between shadow-inner">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Class</span>
                <span className="text-sm font-black text-amber-300 block mt-0.5">
                  {promoteStudent.currentClass || `SEM-${promoteStudent.currentSemester || 1}`}
                </span>
              </div>

              <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs">
                <span>Promoting</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Next Class / Sem</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">
                  {nextClass || `SEM-${nextSemester}`}
                </span>
              </div>
            </div>

            {/* Promotion Form */}
            <form onSubmit={handleConfirmPromote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Next Semester Number *</label>
                  <select
                    value={nextSemester}
                    onChange={(e) => {
                      setNextSemester(e.target.value);
                      setNextClass(`SEM-${e.target.value}`);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
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
                  <label className="font-bold block mb-1 text-slate-700">Next Class / Label *</label>
                  <input
                    type="text"
                    value={nextClass}
                    onChange={(e) => setNextClass(e.target.value)}
                    placeholder="e.g. SEM-2 or 2nd Year"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Academic Session *</label>
                  <input
                    type="text"
                    value={nextSession}
                    onChange={(e) => setNextSession(e.target.value)}
                    placeholder="e.g. 2024-25"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Promotion Date *</label>
                  <input
                    type="date"
                    value={promotionDate}
                    onChange={(e) => setPromotionDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Promotion Remarks / Notes</label>
                <input
                  type="text"
                  value={promotionRemark}
                  onChange={(e) => setPromotionRemark(e.target.value)}
                  placeholder="e.g. Promoted after SEM-1 result clearance"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPromoteStudent(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <TrendingUp className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Promoting...' : `Confirm & Promote to ${nextClass}`}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BATCH PROMOTION MODAL */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-4 flex justify-center items-center animate-fadeIn"
          onClick={() => setShowBatchModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 text-slate-900 shadow-2xl border-2 border-amber-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    Batch Promote ({selectedRolls.length} Students)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    चुने गए सभी छात्रों को एक साथ अगली कक्षा/सेमेस्टर में प्रमोट करें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBatchModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmBatchPromote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Next Semester Number *</label>
                  <select
                    value={batchNextSemester}
                    onChange={(e) => {
                      setBatchNextSemester(e.target.value);
                      setBatchNextClass(`SEM-${e.target.value}`);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
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
                  <label className="font-bold block mb-1 text-slate-700">Next Class / Label *</label>
                  <input
                    type="text"
                    value={batchNextClass}
                    onChange={(e) => setBatchNextClass(e.target.value)}
                    placeholder="e.g. SEM-2 or 2nd Year"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Academic Session (Optional)</label>
                <input
                  type="text"
                  value={batchNextSession}
                  onChange={(e) => setBatchNextSession(e.target.value)}
                  placeholder="e.g. 2025-26 (leave blank to keep current)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
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
