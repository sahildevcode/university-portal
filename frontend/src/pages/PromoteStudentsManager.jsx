import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowDown,
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

  // Financial Adjustment State for Promotion
  const [nextTermFee, setNextTermFee] = useState('');
  const [enableCarryForward, setEnableCarryForward] = useState(true);
  const [carryForwardAmount, setCarryForwardAmount] = useState('');
  const [enableAdvanceAdjustment, setEnableAdvanceAdjustment] = useState(true);
  const [advanceAdjustmentAmount, setAdvanceAdjustmentAmount] = useState('');
  const [nextFeeDueDate, setNextFeeDueDate] = useState('');

  // Batch Promote Selection state
  const [selectedRolls, setSelectedRolls] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMode, setBatchMode] = useState('auto'); // 'auto' or 'fixed'
  const [batchNextSemester, setBatchNextSemester] = useState('2');
  const [batchNextClass, setBatchNextClass] = useState('SEM-2');
  const [batchNextSession, setBatchNextSession] = useState('');

  // Demote State
  const [demoteStudent, setDemoteStudent] = useState(null);
  const [demoteTargetClass, setDemoteTargetClass] = useState('');
  const [demoteTargetSemester, setDemoteTargetSemester] = useState(1);
  const [demoteRemark, setDemoteRemark] = useState('');

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

  // Helper to compute student's financial status for promotion
  const getStudentFinancials = (std) => {
    if (!std) return { totalFee: 0, totalPaid: 0, balanceDue: 0, advanceAmount: 0, isAdvance: false };
    let fee = 0;
    if (Array.isArray(std.academicFeeHistory) && std.academicFeeHistory.length > 0) {
      fee = std.academicFeeHistory.reduce((acc, h) => acc + Number(h.amountPaid || h.amount || h.fee || 0), 0);
    } else {
      fee = Number(std.totalFee || std.studentFee || std.academicFee || 0);
    }

    let paid = 0;
    if (Array.isArray(std.feeHistory) && std.feeHistory.length > 0) {
      paid = std.feeHistory.reduce((acc, p) => acc + Number(p.amountPaid || p.amount || 0), 0);
    }
    if (std.totalPaid) {
      paid = Math.max(paid, Number(std.totalPaid));
    }

    const balanceDue = Math.max(0, fee - paid);
    const advanceAmount = paid > fee ? (paid - fee) : 0;
    return {
      totalFee: fee,
      totalPaid: paid,
      balanceDue,
      advanceAmount,
      isAdvance: advanceAmount > 0
    };
  };

  // Helper to calculate next semester / class (Supports both Semester & Year patterns)
  const calculateNextTerm = (student) => {
    const curSem = Number(student.currentSemester) || 1;
    const curCls = (student.currentClass || '').toUpperCase();

    if (curCls.includes('YEAR') || curCls.includes('YR')) {
      if (curCls.includes('1ST') || curCls.includes('1')) {
        return { sem: 'year-2', className: '2nd Year' };
      } else if (curCls.includes('2ND') || curCls.includes('2')) {
        return { sem: 'year-3', className: '3rd Year' };
      } else if (curCls.includes('3RD') || curCls.includes('3')) {
        return { sem: 'year-4', className: '4th Year' };
      }
    }

    const nextSemNum = curSem + 1;
    return {
      sem: String(nextSemNum),
      className: `SEM-${nextSemNum}`
    };
  };

  // Helper to calculate previous semester / class for demotion
  const calculatePrevTerm = (student) => {
    if (!student) return { canDemote: false, prevSem: 1, prevClass: 'SEM-1', reason: 'Student not found' };
    const curSem = Number(student.currentSemester || student.manualSemester || 1);
    const curCls = String(student.currentClass || '').toUpperCase();

    if (curCls.includes('YEAR') || curCls.includes('YR')) {
      let yearNum = 1;
      if (curCls.includes('4TH') || curCls.includes('4')) yearNum = 4;
      else if (curCls.includes('3RD') || curCls.includes('3')) yearNum = 3;
      else if (curCls.includes('2ND') || curCls.includes('2')) yearNum = 2;
      else if (curCls.includes('1ST') || curCls.includes('1')) yearNum = 1;
      else yearNum = Math.max(1, curSem);

      if (yearNum <= 1) {
        return { canDemote: false, prevSem: 1, prevClass: '1st Year', reason: 'पहले से 1st Year में है' };
      }
      const prevYear = yearNum - 1;
      const yearLabels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
      return { canDemote: true, prevSem: prevYear, prevClass: yearLabels[prevYear] || `${prevYear}th Year` };
    }

    let semNum = curSem;
    const match = curCls.match(/SEM[- ]*(\d+)/i);
    if (match) {
      semNum = parseInt(match[1], 10);
    }

    if (semNum <= 1) {
      return { canDemote: false, prevSem: 1, prevClass: 'SEM-1', reason: 'पहले से SEM-1 में है' };
    }
    const prevSem = semNum - 1;
    return { canDemote: true, prevSem, prevClass: `SEM-${prevSem}` };
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

    const fin = getStudentFinancials(student);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(10);
    const defaultDueDate = d.toISOString().split('T')[0];

    setNextTermFee('');
    setEnableCarryForward(fin.balanceDue > 0);
    setCarryForwardAmount(fin.balanceDue > 0 ? String(fin.balanceDue) : '0');
    setEnableAdvanceAdjustment(fin.isAdvance);
    setAdvanceAdjustmentAmount(fin.isAdvance ? String(fin.advanceAmount) : '0');
    setNextFeeDueDate(student.nextFeeDueDate || defaultDueDate);
  };

  // Confirm Single Promotion
  const handleConfirmPromote = async (e) => {
    e.preventDefault();
    if (!promoteStudent) return;

    setSubmitting(true);
    const lookupKey = promoteStudent.rollNo || promoteStudent.enrollmentNo || promoteStudent.registrationNo || promoteStudent.id;
    const targetSemNum = String(nextSemester).startsWith('year-') 
      ? Number(String(nextSemester).replace('year-', '')) 
      : Number(nextSemester);

    const carryForwardDue = enableCarryForward ? Number(carryForwardAmount || 0) : 0;
    const advanceCredit = enableAdvanceAdjustment ? Number(advanceAdjustmentAmount || 0) : 0;
    const nextTermFeeNum = Number(nextTermFee || 0);

    const payload = {
      targetSemester: targetSemNum,
      targetClass: nextClass,
      nextSemester: targetSemNum,
      nextClass: nextClass,
      nextSession: nextSession,
      promotionDate: promotionDate,
      remark: promotionRemark,
      carryForwardDue,
      advanceCredit,
      nextTermFee: nextTermFeeNum,
      nextFeeDueDate: nextFeeDueDate || null
    };

    try {
      // Primary attempt: PUT (actively supported by deployed backend)
      let res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/promote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Fallback: POST if PUT is not allowed or 404
      if (!res.ok && (res.status === 404 || res.status === 405)) {
        res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/promote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = { success: res.ok };
      }

      if (res.ok && data.success !== false) {
        // Optimistic update in UI table state immediately
        setStudents(prev => prev.map(s => {
          const r = s.rollNo || s.enrollmentNo || s.registrationNo || s.id;
          if (r === lookupKey || (s.id && s.id === promoteStudent.id)) {
            return {
              ...s,
              currentSemester: targetSemNum,
              currentClass: nextClass,
              manualSemester: targetSemNum,
              currentSession: nextSession || s.currentSession,
              updatedAt: new Date().toISOString()
            };
          }
          return s;
        }));

        fireCelebration({ x: 0.5, y: 0.5 });
        showToast(data.message || `🎉 Student promoted to ${nextClass} successfully!`, 'success');
        setPromoteStudent(null);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast(data.message || 'Promotion failed! Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error promoting student:', err);
      showToast('Network error while promoting student: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Mark student course/degree completed
  const handleCompleteCourse = async (student) => {
    const sName = student.fullName || student.rollNo;
    if (!window.confirm(`क्या आप ${sName} की डिग्री / कोर्स को Complete मार्क करना चाहते हैं?\nयह छात्र "Completed & Document Return" सेक्शन में ट्रांसफर हो जाएगा।`)) {
      return;
    }

    try {
      setLoading(true);
      const lookupKey = student.rollNo || student.enrollmentNo || student.id;
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/complete-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBy: 'Admin' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete course');
      }

      fireCelebration({ x: 0.5, y: 0.5 });
      showToast(`${sName} successfully marked as Completed! Moved to Completed & Document Return section.`);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return students.filter(s => {
      // Exclude secondary link shadow records from master promote
      if (s.isSecondaryCourse) return false;
      // Exclude completed degree students and cancelled admissions
      if (s.status === 'Completed' || s.courseCompleted === 'Yes' || s.status === 'Cancelled' || s.cancel === 'Yes') return false;

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

  // Confirm Batch Promotion (Supports Auto Next Term or Fixed Target Class)
  const handleConfirmBatchPromote = async (e) => {
    e.preventDefault();
    if (selectedRolls.length === 0) return;

    setSubmitting(true);
    const isAuto = batchMode === 'auto';
    const targetSemNum = String(batchNextSemester).startsWith('year-') 
      ? Number(String(batchNextSemester).replace('year-', '')) 
      : Number(batchNextSemester);
    const payload = {
      autoAdvance: isAuto,
      targetSemester: targetSemNum,
      targetClass: batchNextClass,
      nextSemester: targetSemNum,
      nextClass: batchNextClass,
      nextSession: batchNextSession,
      promotionDate: new Date().toISOString().split('T')[0],
      remark: isAuto ? 'Batch promoted (+1 Auto Next Term)' : `Batch promoted to ${batchNextClass}`
    };

    try {
      let success = false;
      let successMsg = '';

      // Attempt 1: Backend batch endpoint
      try {
        const res = await fetch('/api/students/batch-promote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rollNumbers: selectedRolls,
            ...payload
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            success = true;
            successMsg = data.message;
          }
        }
      } catch (err) {
        // Fall back to parallel promotions
      }

      // Attempt 2: Fallback to parallel individual promotions via PUT
      if (!success) {
        const results = await Promise.allSettled(
          selectedRolls.map(async (roll) => {
            const student = students.find(s => (s.rollNo || s.id) === roll);
            let sPayload = { ...payload };
            if (isAuto && student) {
              const { sem, className } = calculateNextTerm(student);
              const semNum = String(sem).startsWith('year-') ? Number(String(sem).replace('year-', '')) : Number(sem);
              sPayload = {
                ...sPayload,
                targetSemester: semNum,
                targetClass: className,
                nextSemester: semNum,
                nextClass: className,
                remark: `Auto promoted to ${className}`
              };
            }
            const res = await fetch(`/api/students/${encodeURIComponent(roll)}/promote`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sPayload)
            });
            return res.ok;
          })
        );

        const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
        if (succeeded > 0) {
          success = true;
          successMsg = `🎉 ${succeeded} छात्र सफलतापूर्वक प्रमोट हो गए!`;
        }
      }

      if (success) {
        fireCelebration({ x: 0.5, y: 0.5 });
        showToast(successMsg || 'Batch promotion successful!', 'success');
        setShowBatchModal(false);
        setSelectedRolls([]);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast('Batch promotion failed! Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error in batch promotion:', err);
      showToast('Network error in batch promotion: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Demote Modal for an individual student
  const handleOpenDemote = (student) => {
    const prev = calculatePrevTerm(student);
    if (!prev.canDemote) {
      showToast(`Cannot demote: ${prev.reason}`, 'error');
      return;
    }
    setDemoteStudent(student);
    setDemoteTargetSemester(prev.prevSem);
    setDemoteTargetClass(prev.prevClass);
    setDemoteRemark(`Demoted from ${student.currentClass || `SEM-${student.currentSemester || 1}`} to ${prev.prevClass}`);
  };

  // Confirm Individual Student Demotion
  const handleConfirmDemote = async (e) => {
    if (e) e.preventDefault();
    if (!demoteStudent) return;

    setSubmitting(true);
    const lookupKey = demoteStudent.rollNo || demoteStudent.enrollmentNo || demoteStudent.id;
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/demote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSemester: demoteTargetSemester,
          targetClass: demoteTargetClass,
          remark: demoteRemark
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Student demoted to ${demoteTargetClass} successfully!`, 'success');
        setDemoteStudent(null);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast(data.message || 'Demotion failed! Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error demoting student:', err);
      showToast('Network error while demoting student: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Batch Demotion for Selected Students
  const handleBatchDemote = async () => {
    if (selectedRolls.length === 0) return;
    if (!window.confirm(`क्या आप वाकई चुने गए ${selectedRolls.length} छात्रों को उनके पिछले सेमेस्टर / वर्ष में डिमोट (Demote) करना चाहते हैं?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/students/batch-demote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumbers: selectedRolls,
          remark: `Batch demoted by Admin on ${new Date().toLocaleDateString('en-IN')}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `Successfully demoted ${data.demotedCount || selectedRolls.length} students!`, 'success');
        setSelectedRolls([]);
        fetchStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        showToast(data.message || 'Batch demote failed! Please try again.', 'error');
      }
    } catch (err) {
      console.error('Error in batch demote:', err);
      showToast('Network error in batch demote: ' + err.message, 'error');
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-300">
                  {selectedRolls.length} Selected
                </span>
                <button
                  type="button"
                  onClick={() => setShowBatchModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-3 py-1 rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="Promote selected students"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                  <span>Batch Promote ({selectedRolls.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleBatchDemote}
                  disabled={submitting}
                  className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white px-3 py-1 rounded-xl font-black text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Demote selected students to their previous term"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Batch Demote ({selectedRolls.length})</span>
                </button>
              </div>
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
                  <th className="p-3 text-center sticky right-0 z-20 bg-slate-900 text-amber-300 shadow-[-4px_0_10px_rgba(0,0,0,0.3)] whitespace-nowrap min-w-[210px]">
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
                  const prevTerm = calculatePrevTerm(student);
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
                        <div className="flex items-center gap-1.5 justify-center">
                          {/* Promote Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPromote(student)}
                            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs px-2.5 py-1.5 rounded-xl shadow-2xs hover:shadow transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title={`Promote ${student.fullName || student.rollNo} to next semester/year`}
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
                            <span>Promote</span>
                          </button>

                          {/* Demote Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDemote(student)}
                            disabled={!prevTerm.canDemote}
                            className={`font-black text-xs px-2.5 py-1.5 rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              prevTerm.canDemote
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-300 hover:border-rose-600'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-50'
                            }`}
                            title={prevTerm.canDemote ? `Demote to ${prevTerm.prevClass}` : `Cannot demote: ${prevTerm.reason}`}
                          >
                            <TrendingDown className="w-3.5 h-3.5" />
                            <span>Demote</span>
                          </button>

                          {/* Complete Course Button */}
                          <button
                            type="button"
                            onClick={() => handleCompleteCourse(student)}
                            className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 font-black text-xs px-2 py-1.5 rounded-xl shadow-2xs hover:shadow transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title={`Mark course completed for ${student.fullName || student.rollNo} and move to Document Return section`}
                          >
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Complete</span>
                          </button>
                        </div>
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
            className="bg-white w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-3xl text-slate-900 shadow-2xl border-2 border-indigo-100 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150"
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
                    अगले सेमेस्टर / वर्ष में प्रमोट करने व फीस समायोजन की पुष्टि करें
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
            {(() => {
              const promoteFinancials = getStudentFinancials(promoteStudent);
              return (
                <form onSubmit={handleConfirmPromote} className="flex flex-col flex-1 overflow-hidden min-h-0">
                  <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
                    
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
                        <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Sem / Year *</label>
                        <select
                          value={nextSemester}
                          onChange={(e) => {
                            const val = e.target.value;
                            setNextSemester(val);
                            if (val.startsWith('year-')) {
                              const yrNum = val.replace('year-', '');
                              const yrMap = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };
                              setNextClass(yrMap[yrNum] || `${yrNum} Year`);
                            } else {
                              setNextClass(`SEM-${val}`);
                            }
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                          required
                        >
                          <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                            <option value="year-1">1st Year (प्रथम वर्ष)</option>
                            <option value="year-2">2nd Year (द्वितीय वर्ष)</option>
                            <option value="year-3">3rd Year (तृतीय वर्ष)</option>
                            <option value="year-4">4th Year (चतुर्थ वर्ष)</option>
                          </optgroup>
                          <optgroup label="Semester Pattern (सेमेस्टर)">
                            <option value="1">SEM-1 (1st Sem)</option>
                            <option value="2">SEM-2 (2nd Sem)</option>
                            <option value="3">SEM-3 (3rd Sem)</option>
                            <option value="4">SEM-4 (4th Sem)</option>
                            <option value="5">SEM-5 (5th Sem)</option>
                            <option value="6">SEM-6 (6th Sem)</option>
                            <option value="7">SEM-7 (7th Sem)</option>
                            <option value="8">SEM-8 (8th Sem)</option>
                          </optgroup>
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

                    {/* Financial Status & Fee Carry Forward / Advance Adjustment Section */}
                    <div className="bg-slate-50/90 border border-indigo-200/80 rounded-2xl p-3.5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                            ₹
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">
                              Fee & Dues Adjustment (फीस समायोजन)
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium">
                              बकाया फीस को अगले टर्म में जोड़ें या एडवांस राशि एडजस्ट करें
                            </p>
                          </div>
                        </div>
                        {promoteFinancials.isAdvance ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            +₹{promoteFinancials.advanceAmount.toLocaleString('en-IN')} Advance
                          </span>
                        ) : promoteFinancials.balanceDue > 0 ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                            ₹{promoteFinancials.balanceDue.toLocaleString('en-IN')} Current Due
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ✓ No Dues
                          </span>
                        )}
                      </div>

                      {/* Current Term Mini Financial Summary */}
                      <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">Assigned Fee</span>
                          <span className="text-xs font-black text-slate-900 font-mono block mt-0.5">
                            ₹{promoteFinancials.totalFee.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 font-bold block">Paid So Far</span>
                          <span className="text-xs font-black text-emerald-700 font-mono block mt-0.5">
                            ₹{promoteFinancials.totalPaid.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">
                            {promoteFinancials.isAdvance ? 'Advance (+)' : 'Current Due'}
                          </span>
                          <span className={`text-xs font-black font-mono block mt-0.5 ${promoteFinancials.isAdvance ? 'text-emerald-700' : promoteFinancials.balanceDue > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                            {promoteFinancials.isAdvance ? `+₹${promoteFinancials.advanceAmount.toLocaleString('en-IN')}` : `₹${promoteFinancials.balanceDue.toLocaleString('en-IN')}`}
                          </span>
                        </div>
                      </div>

                      {/* Next Term Base Fee & Next Fee Due Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                            Next Term Base Fee (अगली फीस)
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-2 text-slate-400 font-bold text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={nextTermFee}
                              onChange={(e) => setNextTermFee(e.target.value)}
                              placeholder="e.g. 5000 (वैकल्पिक)"
                              className="w-full pl-6 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">नये सेमेस्टर/वर्ष की कोर्स फीस</p>
                        </div>

                        {/* Due Date picker */}
                        <div>
                          <label className="font-bold block mb-1 text-slate-700 text-[11px] flex items-center justify-between">
                            <span>Fee Due Date (अंतिम तिथि)</span>
                            <button
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + 1);
                                d.setDate(10);
                                setNextFeeDueDate(d.toISOString().split('T')[0]);
                              }}
                              className="text-[9px] text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
                            >
                              10 तारीख सेट करें
                            </button>
                          </label>
                          <input
                            type="date"
                            value={nextFeeDueDate}
                            onChange={(e) => setNextFeeDueDate(e.target.value)}
                            className="w-full p-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                          <p className="text-[9px] text-slate-400 mt-0.5">बकाया फीस की अंतिम तिथि</p>
                        </div>
                      </div>

                      {/* Carry Forward Remaining Due Toggle & Field */}
                      {promoteFinancials.balanceDue > 0 && (
                        <div className="p-2.5 bg-rose-50/80 border border-rose-200 rounded-xl space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableCarryForward}
                              onChange={(e) => setEnableCarryForward(e.target.checked)}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-rose-900">
                              पिछली बकाया फीस ₹{promoteFinancials.balanceDue.toLocaleString('en-IN')} को अगले टर्म में जोड़ें (Carry Forward)
                            </span>
                          </label>
                          {enableCarryForward && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                              <label className="text-[10px] font-bold text-rose-800 whitespace-nowrap">Amount to Add:</label>
                              <div className="relative max-w-[130px]">
                                <span className="absolute left-2 top-1.5 text-slate-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={carryForwardAmount}
                                  onChange={(e) => setCarryForwardAmount(e.target.value)}
                                  className="w-full pl-5 pr-2 py-1 bg-white border border-rose-300 rounded-lg font-mono font-bold text-xs text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                              </div>
                              <span className="text-[10px] text-rose-700 font-medium">₹{carryForwardAmount || 0}/- अगले टर्म में जुड़ेंगे</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Advance Adjustment Toggle & Field */}
                      {promoteFinancials.isAdvance && (
                        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableAdvanceAdjustment}
                              onChange={(e) => setEnableAdvanceAdjustment(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-emerald-900">
                              जमा एडवांस राशि ₹{promoteFinancials.advanceAmount.toLocaleString('en-IN')} को अगले टर्म में क्रेडिट करें (Adjust Advance)
                            </span>
                          </label>
                          {enableAdvanceAdjustment && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                              <label className="text-[10px] font-bold text-emerald-800 whitespace-nowrap">Advance Credit:</label>
                              <div className="relative max-w-[130px]">
                                <span className="absolute left-2 top-1.5 text-slate-400 font-bold text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={advanceAdjustmentAmount}
                                  onChange={(e) => setAdvanceAdjustmentAmount(e.target.value)}
                                  className="w-full pl-5 pr-2 py-1 bg-white border border-emerald-300 rounded-lg font-mono font-bold text-xs text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>
                              <span className="text-[10px] text-emerald-700 font-medium">₹{advanceAdjustmentAmount || 0}/- अगले टर्म में एडजस्ट होंगे</span>
                            </div>
                          )}
                        </div>
                      )}
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
              );
            })()}
          </div>
        </div>
      )}

      {/* Floating Bottom Multi-Action Toolbar */}
      {selectedRolls.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-wrap items-center gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black text-amber-300">
              {selectedRolls.length} Students Selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>Batch Promote ({selectedRolls.length})</span>
          </button>

          <button
            type="button"
            onClick={handleBatchDemote}
            disabled={submitting}
            className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            <TrendingDown className="w-4 h-4" />
            <span>Batch Demote ({selectedRolls.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRolls([])}
            className="text-slate-400 hover:text-white text-xs underline font-bold cursor-pointer ml-1"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DEMOTE CONFIRMATION MODAL FOR INDIVIDUAL STUDENT */}
      {/* ========================================================================= */}
      {demoteStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-fadeIn"
          onClick={() => setDemoteStudent(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-2xl sm:rounded-3xl text-slate-900 shadow-2xl border-2 border-rose-200 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-rose-950 text-white flex items-center justify-between shrink-0 border-b border-rose-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                    Demote Student (डिमोट करें)
                  </h3>
                  <p className="text-[10px] text-rose-200 mt-0.5">
                    छात्र को पिछले सेमेस्टर / वर्ष में वापस भेजने की पुष्टि करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDemoteStudent(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDemote} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
                {/* Student Info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Student Name</span>
                      <strong className="text-sm font-black text-slate-900 block truncate mt-0.5">
                        {demoteStudent.fullName || demoteStudent.studentName}
                      </strong>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Roll Number</span>
                      <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded block mt-0.5 border border-rose-200">
                        {demoteStudent.rollNo || demoteStudent.enrollmentNo || 'NO-ROLL'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200 flex justify-between">
                    <span>Course: <strong className="text-slate-900">{demoteStudent.courseName}</strong></span>
                    <span>Univ: <strong className="text-slate-900">{demoteStudent.universityName || '—'}</strong></span>
                  </div>
                </div>

                {/* Demote Flow Visual */}
                <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white p-3 rounded-xl flex items-center justify-between shadow-inner">
                  <div className="text-center min-w-[70px]">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Current</span>
                    <span className="text-xs font-black text-amber-300 block mt-0.5">
                      {demoteStudent.currentClass || `SEM-${demoteStudent.currentSemester || 1}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-rose-400 font-bold text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
                    <span>Demoting</span>
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  </div>

                  <div className="text-center min-w-[70px]">
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Demoted Target</span>
                    <span className="text-xs font-black text-rose-400 block mt-0.5">
                      {demoteTargetClass}
                    </span>
                  </div>
                </div>

                {/* Target Class Selection */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Demoted Sem / Year *</label>
                    <select
                      value={demoteTargetSemester}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDemoteTargetSemester(val);
                        if (String(demoteStudent.currentClass || '').toUpperCase().includes('YEAR')) {
                          const yrMap = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year' };
                          setDemoteTargetClass(yrMap[val] || `${val} Year`);
                        } else {
                          setDemoteTargetClass(`SEM-${val}`);
                        }
                      }}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    >
                      <option value={1}>1 (SEM-1 / 1st Year)</option>
                      <option value={2}>2 (SEM-2 / 2nd Year)</option>
                      <option value={3}>3 (SEM-3 / 3rd Year)</option>
                      <option value={4}>4 (SEM-4 / 4th Year)</option>
                      <option value={5}>5 (SEM-5)</option>
                      <option value={6}>6 (SEM-6)</option>
                      <option value={7}>7 (SEM-7)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Target Class Label *</label>
                    <input
                      type="text"
                      value={demoteTargetClass}
                      onChange={(e) => setDemoteTargetClass(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700 text-[11px]">Reason / Remark</label>
                  <input
                    type="text"
                    value={demoteRemark}
                    onChange={(e) => setDemoteRemark(e.target.value)}
                    placeholder="e.g. Demoted due to year back / student request"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDemoteStudent(null)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 text-xs"
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Demoting...' : `Confirm & Demote`}</span>
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
                    नीचे प्रमोशन का तरीका चुनें (Auto +1 या एक निश्चित क्लास)।
                  </span>
                </div>

                {/* Batch Mode Selection (Auto vs Fixed) */}
                <div className="space-y-2">
                  <label className="font-bold block text-slate-700 text-[11px]">Promotion Mode (प्रमोशन का तरीका) *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBatchMode('auto')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        batchMode === 'auto'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="font-black text-xs flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Auto Next (+1)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        प्रत्येक छात्र अपने अगले सेमेस्टर में स्वतः जाएगा (e.g. Sem-1 ➔ 2, Sem-2 ➔ 3)
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBatchMode('fixed')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        batchMode === 'fixed'
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                      }`}
                    >
                      <div className="font-black text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Fixed Class</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                        सभी छात्रों को एक समान टारगेट क्लास/सेमेस्टर में सेट करें
                      </p>
                    </button>
                  </div>
                </div>

                {/* If Fixed Mode, show Target inputs */}
                {batchMode === 'fixed' && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <label className="font-bold block mb-1 text-slate-700 text-[11px]">Next Sem / Year *</label>
                      <select
                        value={batchNextSemester}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBatchNextSemester(val);
                          if (val.startsWith('year-')) {
                            const yrNum = val.replace('year-', '');
                            const yrMap = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };
                            setBatchNextClass(yrMap[yrNum] || `${yrNum} Year`);
                          } else {
                            setBatchNextClass(`SEM-${val}`);
                          }
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none"
                        required
                      >
                        <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                          <option value="year-1">1st Year (प्रथम वर्ष)</option>
                          <option value="year-2">2nd Year (द्वितीय वर्ष)</option>
                          <option value="year-3">3rd Year (तृतीय वर्ष)</option>
                          <option value="year-4">4th Year (चतुर्थ वर्ष)</option>
                        </optgroup>
                        <optgroup label="Semester Pattern (सेमेस्टर)">
                          <option value="1">SEM-1 (1st Sem)</option>
                          <option value="2">SEM-2 (2nd Sem)</option>
                          <option value="3">SEM-3 (3rd Sem)</option>
                          <option value="4">SEM-4 (4th Sem)</option>
                          <option value="5">SEM-5 (5th Sem)</option>
                          <option value="6">SEM-6 (6th Sem)</option>
                          <option value="7">SEM-7 (7th Sem)</option>
                          <option value="8">SEM-8 (8th Sem)</option>
                        </optgroup>
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
                )}

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
