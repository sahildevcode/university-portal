import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Eye, Printer, CreditCard, Award, 
  FileText, CheckCircle, AlertCircle, X, Download, ExternalLink, Trash2, Calendar,
  ArrowLeft, RotateCcw, ChevronDown, Edit3, Zap, Save, CheckCircle2, UploadCloud,
  PlusCircle, BookOpen, School, GraduationCap
} from 'lucide-react';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';
import PrintMarksheet from '../components/PrintMarksheet';
import BulkImportModal from '../components/BulkImportModal';
import { useLanguage } from '../context/LanguageContext';

export default function StudentList({ courses, setActiveTab, onSelectStudentForFee, onOpenNewAdmission, lang: propLang, toggleLang: propToggleLang }) {
  const context = useLanguage();
  const lang = propLang || context.lang || 'en';
  const toggleLang = propToggleLang || context.toggleLang;
  const isHindi = lang === 'hi';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [timeframe, setTimeframe] = useState('all'); // 'all', 'week', 'month', 'year'
  const [timeframeCounts, setTimeframeCounts] = useState({ all: 0, week: 0, month: 0, year: 0 });
  const [dualOnly, setDualOnly] = useState(false);
  
  // Modals
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('profile');
  const [printSlipStudent, setPrintSlipStudent] = useState(null);
  const [printMarksheetData, setPrintMarksheetData] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Full Edit Modal & Promotion State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);
  const [promotingRoll, setPromotingRoll] = useState(null);

  // Institution catalogs & additional course form state
  const [universitiesList, setUniversitiesList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [allCoursesList, setAllCoursesList] = useState([]);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    universityName: '',
    collegeName: '',
    courseName: '',
    branch: '',
    courseType: 'Diploma',
    courseMode: 'Regular',
    currentSemester: 1,
    currentClass: 'SEM-1',
    admissionDate: new Date().toISOString().split('T')[0],
    admissionYear: new Date().getFullYear(),
    totalFee: 25000,
    initialPaid: 0,
    scholarshipAmount: 0,
    paymentMode: 'Cash',
    remark: ''
  });

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const [uRes, cRes, crsRes] = await Promise.all([
          fetch('/api/universities'),
          fetch('/api/colleges'),
          fetch('/api/courses')
        ]);
        const [uData, cData, crsData] = await Promise.all([
          uRes.json(),
          cRes.json(),
          crsRes.json()
        ]);
        if (uData.success) setUniversitiesList(uData.universities || []);
        if (cData.success) setCollegesList(cData.colleges || []);
        if (crsData.success) setAllCoursesList(crsData.courses || []);
      } catch (e) {
        console.warn('Could not load institution catalogs for student edit:', e);
      }
    };
    loadInstitutions();
  }, []);

  const fetchStudents = async (customSearch = null, customCourse = null, customSem = null, customTimeframe = null) => {
    setLoading(true);
    try {
      const sVal = customSearch !== null ? customSearch : search;
      const cVal = customCourse !== null ? customCourse : selectedCourse;
      const semVal = customSem !== null ? customSem : selectedSemester;
      const tfVal = customTimeframe !== null ? customTimeframe : timeframe;

      let url = `/api/students?course=${cVal}&semester=${semVal}&timeframe=${tfVal}`;
      if (sVal && sVal.trim()) url += `&search=${encodeURIComponent(sVal.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
        if (data.timeframeCounts) {
          setTimeframeCounts(data.timeframeCounts);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedCourse, selectedSemester, timeframe]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleResetSearch = () => {
    setSearch('');
    setSelectedCourse('all');
    setSelectedSemester('all');
    setTimeframe('all');
    fetchStudents('', 'all', 'all', 'all');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '') {
      fetchStudents('', selectedCourse, selectedSemester, timeframe);
    }
  };

  const handleOpenProfile = async (rollNo) => {
    try {
      const res = await fetch(`/api/students/${rollNo}`);
      const data = await res.json();
      if (data.success) {
        setSelectedStudent(data.student);
        setActiveProfileTab('profile');
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    }
  };

  const handleDeleteStudent = async (rollNo) => {
    if (!window.confirm(`Are you sure you want to remove student with Roll Number ${rollNo}?`)) return;
    try {
      const res = await fetch(`/api/students/${rollNo}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.filter(s => s.rollNo !== rollNo));
        if (selectedStudent?.rollNo === rollNo) setSelectedStudent(null);
      }
    } catch (err) {
      alert('Failed to delete student');
    }
  };

  const handleOpenEditModal = (std) => {
    setEditingStudent(std);
    setShowAddCourse(false);
    setNewCourseData({
      universityName: std.universityName || (universitiesList[0]?.name || ''),
      collegeName: std.collegeName || (collegesList[0]?.name || ''),
      courseName: '',
      branch: '',
      courseType: 'Diploma',
      courseMode: 'Regular',
      currentSemester: 1,
      currentClass: 'SEM-1',
      admissionDate: new Date().toISOString().split('T')[0],
      admissionYear: new Date().getFullYear(),
      totalFee: 25000,
      initialPaid: 0,
      scholarshipAmount: 0,
      paymentMode: 'Cash',
      remark: ''
    });
    setEditFormData({
      rollNo: std.rollNo || '',
      fullName: std.fullName || '',
      fatherName: std.fatherName || '',
      motherName: std.motherName || '',
      dob: std.dob || '',
      gender: std.gender || 'Male',
      phone: std.phone || '',
      email: std.email || '',
      address: std.address || '',
      aadhaarNo: std.aadhaarNo || '',
      samagraId: std.samagraId || '',
      abcId: std.abcId || '',
      universityName: std.universityName || '',
      collegeName: std.collegeName || '',
      courseName: std.courseName || '',
      branch: std.branch || '',
      courseType: std.courseType || 'UG',
      currentSemester: std.currentSemester || 1,
      currentClass: std.currentClass || `SEM-${std.currentSemester || 1}`,
      totalFee: std.totalFee || 0,
      scholarshipAmount: std.scholarshipAmount !== undefined ? std.scholarshipAmount : 0,
      admissionYear: std.admissionYear || 2026,
      remark: std.remark || '',
      status: std.status || 'Active'
    });
    setEditError(null);
    setEditSuccess(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const payload = {
        ...editFormData,
        ...(showAddCourse && (newCourseData.courseName || newCourseData.branch) ? { additionalCourse: newCourseData } : {})
      };
      const res = await fetch(`/api/students/${editingStudent.rollNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update student details');
      }
      setEditSuccess(data.message || 'Student details updated successfully!');
      
      // Reload students directory immediately to reflect new course and linked dual sub-row
      await fetchStudents();

      if (selectedStudent?.rollNo === editingStudent.rollNo) {
        setSelectedStudent(prev => ({ ...prev, ...data.student }));
      }
      setTimeout(() => {
        setEditingStudent(null);
        setEditSuccess(null);
        setShowAddCourse(false);
      }, 1200);
    } catch (err) {
      setEditError(err.message || 'Failed to update student');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePromoteStudent = async (std, targetSem = null) => {
    const currentSem = Number(std.currentSemester) || 1;
    const nextSem = targetSem !== null ? Number(targetSem) : currentSem + 1;
    const nextClass = `SEM-${nextSem}`;

    if (targetSem === null) {
      if (!window.confirm(`Are you sure you want to promote ${std.fullName} (${std.rollNo}) from SEM-${currentSem} to ${nextClass}?`)) {
        return;
      }
    }

    setPromotingRoll(std.rollNo);
    try {
      const res = await fetch(`/api/students/${std.rollNo}/promote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSemester: nextSem,
          targetClass: nextClass
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to promote student');
      }

      setStudents(prev => prev.map(s => {
        if (s.rollNo === std.rollNo) {
          return { ...s, currentSemester: nextSem, currentClass: nextClass, manualSemester: nextSem };
        }
        if (s.linkedCourses) {
          return {
            ...s,
            linkedCourses: s.linkedCourses.map(l => l.rollNo === std.rollNo ? { ...l, currentSemester: nextSem, currentClass: nextClass, manualSemester: nextSem } : l)
          };
        }
        return s;
      }));
      if (selectedStudent?.rollNo === std.rollNo) {
        setSelectedStudent(prev => ({ ...prev, currentSemester: nextSem, currentClass: nextClass, manualSemester: nextSem }));
      }
    } catch (err) {
      alert('Error promoting student: ' + err.message);
    } finally {
      setPromotingRoll(null);
    }
  };

  const q = (search || '').trim().toLowerCase();
  const cleanNum = q.replace(/[\s-]/g, '');

  const displayedStudents = (dualOnly 
    ? students.filter(s => s.isDualEnrolled)
    : students
  ).filter(s => {
    if (s.isSecondaryCourse) return false;
    if (!q) return true;

    const nameMatch = s.fullName?.toLowerCase().includes(q) || s.studentName?.toLowerCase().includes(q);
    const fatherMatch = s.fatherName?.toLowerCase().includes(q) || s.father_name?.toLowerCase().includes(q) || s.motherName?.toLowerCase().includes(q);
    const rollMatch = s.rollNo?.toLowerCase().includes(q) || s.enrollmentNo?.toLowerCase().includes(q) || s.registrationNo?.toLowerCase().includes(q);
    
    const aadharRaw = (s.aadhaarNo || s.aadharNo || s.aadhar || s.aadhaar || '').toString();
    const aadharClean = aadharRaw.replace(/[\s-]/g, '');
    const aadharMatch = aadharRaw.toLowerCase().includes(q) || (cleanNum.length >= 3 && aadharClean.includes(cleanNum));

    const phoneRaw = (s.phone || s.contact || '').toString();
    const phoneClean = phoneRaw.replace(/\D/g, '');
    const phoneMatch = phoneRaw.includes(q) || (cleanNum.length >= 3 && phoneClean.includes(cleanNum));

    // STRICT: Only match email if query explicitly contains '@' to prevent dummy emails from causing false positives
    const emailMatch = q.includes('@') && s.email?.toLowerCase().includes(q);

    const courseMatch = s.courseName?.toLowerCase().includes(q);
    const linkedMatch = s.linkedCourses && s.linkedCourses.some(l => 
      l.courseName?.toLowerCase().includes(q) ||
      l.rollNo?.toLowerCase().includes(q) ||
      l.registrationNo?.toLowerCase().includes(q)
    );

    return nameMatch || fatherMatch || rollMatch || aadharMatch || phoneMatch || emailMatch || courseMatch || linkedMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Student Records Directorate
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Enrolled Students Directory &amp; Documents
          </h1>
          <p className="text-xs text-slate-500">
            View student profiles, inspect uploaded marksheets and KYC identity proofs, print admission slips, and check fee status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer border border-emerald-400/30"
            title="Bulk Import Students & Past Fees from Excel or PDF"
          >
            <UploadCloud className="w-4 h-4 text-amber-300" />
            <span>📥 Bulk Import Data</span>
          </button>

          <button
            onClick={() => {
              if (onOpenNewAdmission) onOpenNewAdmission();
              else if (setActiveTab) setActiveTab('register');
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>+ Enroll New Student</span>
          </button>
        </div>
      </div>

      {/* Admission Timeframe Filter Dropdown */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Admission Filter (प्रवेश अवधि फ़िल्टर):</span>
          </label>
          <div className="relative min-w-[270px]">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={`w-full appearance-none border font-extrabold text-xs py-2 pl-3.5 pr-9 rounded-xl focus:outline-none cursor-pointer shadow-2xs ${
                timeframe === 'week'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                  : timeframe === 'month'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : timeframe === 'year'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="all">
                👥 All Enrolled Students ({timeframeCounts.all || students.length})
              </option>
              <option value="week">
                ⚡ This Week New Admissions ({timeframeCounts.week || 0})
              </option>
              <option value="month">
                🗓️ This Month Admissions ({timeframeCounts.month || 0})
              </option>
              <option value="year">
                📆 This Year Admissions ({timeframeCounts.year || 0})
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {timeframe !== 'all' && (
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title="Reset Admission Filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Showing <strong className="text-slate-700">{displayedStudents.length}</strong> student record(s)
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input with Integrated Clear (X) Button */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search by Roll No, Name, Father's Name (पिता का नाम), Aadhar No, Phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:bg-white text-slate-900 font-medium"
            />
          </form>
          {search && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              title="Clear search (सर्च हटाएं)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="all">All Courses / Degrees</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-1 flex items-center gap-1.5">
          <button
            onClick={() => fetchStudents()}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
            title="Search / Filter"
          >
            Filter
          </button>
          {(search || selectedCourse !== 'all' || selectedSemester !== 'all' || timeframe !== 'all') && (
            <button
              onClick={handleResetSearch}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors border border-slate-200"
              title="Reset All Filters / Back to All Students (फ़िल्टर रीसेट करें)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Active Filter & Back Indicator Ribbon */}
      {(search || selectedCourse !== 'all' || selectedSemester !== 'all' || timeframe !== 'all') && (
        <div className="bg-indigo-50/90 border border-indigo-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex flex-wrap items-center gap-2 text-indigo-900">
            <span className="font-bold">Active Filter:</span>
            {timeframe !== 'all' && (
              <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-bold shadow-2xs">
                {timeframe === 'week' ? '⚡ Weekly New' : timeframe === 'month' ? '🗓️ This Month' : '📆 This Year'}
              </span>
            )}
            {search && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 font-bold text-indigo-700 shadow-2xs">
                "{search}"
              </span>
            )}
            {selectedCourse !== 'all' && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-slate-700">
                Course: {courses.find(c => c.id === selectedCourse)?.code || selectedCourse}
              </span>
            )}
            {selectedSemester !== 'all' && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-slate-700">
                Sem {selectedSemester}
              </span>
            )}
            <span className="text-slate-500 font-medium">({displayedStudents.length} record(s) found)</span>
          </div>

          <button
            onClick={handleResetSearch}
            className="flex items-center gap-1.5 bg-[#071530] hover:bg-indigo-950 text-[#C59B27] hover:text-amber-300 font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer text-xs transition-all border border-[#C59B27]/40 hover:scale-102"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to All Students (वापस सभी छात्र देखें)</span>
          </button>
        </div>
      )}

      {/* Table Header Bar with Dual Courses Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-slate-700">Enrolled Students:</span>
          <span className="font-extrabold text-sm text-indigo-950 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {displayedStudents.length} Total
          </span>
          <button
            type="button"
            onClick={() => setDualOnly(!dualOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer border ${
              dualOnly
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-400/40'
                : 'bg-slate-50 text-slate-700 hover:bg-amber-50 border-slate-300'
            }`}
            title="Filter only students who are doing multiple courses simultaneously"
          >
            <span>🎓 Dual Courses (Degree + Diploma)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${dualOnly ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {displayedStudents.filter(s => s.isDualEnrolled).length}
            </span>
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Students with multiple programs are grouped together with nested courses
        </span>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Semester</th>
                <th className="py-2.5 px-3">Fee Status</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">Loading student directory...</td>
                </tr>
              ) : displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center bg-slate-50/50">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                        <Search className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {search 
                            ? (isHindi ? `"${search}" नाम, रोल नं., पिता का नाम या आधार से कोई छात्र नहीं मिला` : `No students found matching "${search}" by name, roll no, father name or Aadhaar`)
                            : (isHindi ? 'चुने गए फ़िल्टर के अनुसार कोई छात्र नहीं मिला' : 'No students found matching the selected filters')}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {isHindi ? "कृपया रोल नंबर, छात्र का नाम, पिता का नाम (Father's Name) या आधार नंबर सही जांचें।" : "Please verify the Roll No, student name, father's name or Aadhaar number."}
                        </p>
                      </div>

                      {/* Prominent Back Button requested by user */}
                      <button
                        onClick={handleResetSearch}
                        className="inline-flex items-center gap-2 bg-[#071530] hover:bg-indigo-950 text-[#C59B27] hover:text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md border border-[#C59B27]/40 cursor-pointer transition-all hover:scale-105"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isHindi ? '← वापस सभी छात्र दिखाएं (Back to All)' : '← Back to All Students'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (() => {
                const renderedSecondaryIds = new Set();
                return displayedStudents.map((std) => {
                  if (renderedSecondaryIds.has(std.id)) return null;

                  if (std.linkedCourses && std.linkedCourses.length > 0) {
                    std.linkedCourses.forEach(lc => renderedSecondaryIds.add(lc.id));
                  }

                  const isFullyPaid = (std.totalPaid || 0) >= (std.totalFee || 0);
                  const isPartial = (std.totalPaid || 0) > 0 && !isFullyPaid;

                  return (
                    <React.Fragment key={std.id}>
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-indigo-900 text-xs tracking-tight">
                            {std.rollNo}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {std.registrationNo}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs uppercase">{std.fullName}</span>
                            {std.isDualEnrolled && std.linkedCourses && std.linkedCourses.length > 0 && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-black">
                                🎓 Dual
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[220px]">
                            {std.fatherName && <span>S/o {std.fatherName}</span>}
                            {std.fatherName && std.admissionDate && <span>•</span>}
                            {std.admissionDate && (
                              <span>Adm: {new Date(std.admissionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 text-xs truncate max-w-[210px]" title={std.courseName}>
                              {std.courseName}
                            </span>
                            {std.courseType && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                {std.courseType}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[210px]" title={std.collegeName || std.universityName || ''}>
                            {std.collegeName || (std.universityName ? std.universityName.split('(')[0].trim() : 'MCBU')}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-900 border border-indigo-200">
                              {std.currentClass || `SEM-${std.currentSemester || 1}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePromoteStudent(std)}
                              disabled={promotingRoll === std.rollNo}
                              className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                              title="Promote to Next Semester (+1)"
                            >
                              <Zap className="w-3 h-3 text-emerald-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isFullyPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                isPartial ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {isFullyPaid ? '✓ Cleared' : isPartial ? `Due: ₹${Number(std.balanceDue).toLocaleString('en-IN')}` : `Unpaid: ₹${Number(std.totalFee || 0).toLocaleString('en-IN')}`}
                              </span>
                              {Number(std.scholarshipAmount) > 0 && (
                                <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full" title={`Scholarship: ₹${Number(std.scholarshipAmount).toLocaleString('en-IN')}`}>
                                  🎓 ₹{Number(std.scholarshipAmount).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              Paid <span className="font-semibold text-slate-700">₹{Number(std.totalPaid || 0).toLocaleString('en-IN')}</span> / ₹{Number(std.totalFee || 0).toLocaleString('en-IN')}
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-mono text-xs font-semibold text-slate-800">{std.phone}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]" title={std.email}>{std.email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenProfile(std.rollNo)}
                              className="p-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                              title="View Full Profile & Uploaded Documents"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(std)}
                              className="p-1 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
                              title="Edit Student Information & Courses"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setPrintSlipStudent(std)}
                              className="p-1 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Print Admission Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (onSelectStudentForFee) onSelectStudentForFee(std);
                                setActiveTab('accounts');
                              }}
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Open Fee Payment Ledger"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(std.rollNo)}
                              className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Connected Sub-Rows for 2nd / Dual Program Enrollments */}
                      {std.linkedCourses && [...std.linkedCourses].sort((a, b) => new Date(a.admissionDate || 0) - new Date(b.admissionDate || 0)).map((linked, lIdx) => {
                        const isLinkedFullyPaid = (linked.totalPaid || 0) >= (linked.totalFee || 0);
                        const isLinkedPartial = (linked.totalPaid || 0) > 0 && !isLinkedFullyPaid;
                        return (
                          <tr key={linked.id || `linked-${lIdx}`} className="bg-amber-50/40 hover:bg-amber-100/50 border-l-4 border-l-amber-500 transition-colors">
                            <td className="py-2 px-3 pl-5 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-amber-600 font-black text-xs">↳</span>
                                <span className="font-mono font-bold text-slate-800 text-xs">{linked.rollNo}</span>
                              </div>
                              <div className="text-[9px] font-bold text-amber-700 pl-3.5">Dual Enrollment</div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1">
                                <span className="text-amber-600 font-black text-xs">↳</span>
                                <span className="font-bold text-slate-800 text-xs uppercase">{std.fullName}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 pl-3.5 truncate max-w-[200px]">
                                Second Course ({linked.courseType || 'Diploma'})
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-amber-950 text-xs truncate max-w-[210px]" title={linked.courseName}>
                                  {linked.courseName}
                                </span>
                                <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                                  {linked.courseType || 'Diploma'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 truncate max-w-[210px]" title={linked.collegeName || linked.universityName || ''}>
                                {linked.collegeName || (linked.universityName ? linked.universityName.split('(')[0].trim() : 'MCBU')}
                              </div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                                  {linked.currentClass || `SEM-${linked.currentSemester || 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePromoteStudent(linked)}
                                  disabled={promotingRoll === linked.rollNo}
                                  className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors cursor-pointer"
                                  title="Promote to Next Semester (+1)"
                                >
                                  <Zap className="w-3 h-3 text-emerald-600" />
                                </button>
                              </div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isLinkedFullyPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    isLinkedPartial ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                    'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}>
                                    {isLinkedFullyPaid ? '✓ Cleared' : isLinkedPartial ? `Due: ₹${Number(linked.balanceDue).toLocaleString('en-IN')}` : `Unpaid: ₹${Number(linked.totalFee || 0).toLocaleString('en-IN')}`}
                                  </span>
                                  {Number(linked.scholarshipAmount) > 0 && (
                                    <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full" title={`Scholarship: ₹${Number(linked.scholarshipAmount).toLocaleString('en-IN')}`}>
                                      🎓 ₹{Number(linked.scholarshipAmount).toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  Paid <span className="font-semibold text-slate-700">₹{Number(linked.totalPaid || 0).toLocaleString('en-IN')}</span> / ₹{Number(linked.totalFee || 0).toLocaleString('en-IN')}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-mono text-xs text-slate-600">
                              {std.phone}
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenProfile(linked.rollNo)}
                                  className="p-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                                  title={`View Profile for ${linked.courseName}`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditModal(linked)}
                                  className="p-1 rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer border border-amber-200"
                                  title={`Edit ${linked.courseName} Enrollment Details`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (onSelectStudentForFee) onSelectStudentForFee(linked);
                                    setActiveTab('accounts');
                                  }}
                                  className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                                  title={`Open Fee Ledger for ${linked.courseName}`}
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(linked.rollNo)}
                                  className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                  title="Delete Enrollment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Student Profile & Document Viewer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-navy-900 text-white p-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                  {selectedStudent.studentImage || selectedStudent.documents?.photo ? (
                    <img src={selectedStudent.studentImage || selectedStudent.documents?.photo} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-indigo-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold uppercase">{selectedStudent.fullName}</h2>
                    <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] font-mono">
                      {selectedStudent.rollNo}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    {selectedStudent.courseName} • Semester {selectedStudent.currentSemester} ({selectedStudent.admissionYear})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedStudent)}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Fully Edit Student & Enrollment Record"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Student</span>
                </button>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold gap-2">
              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeProfileTab === 'profile' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Personal & Academic
              </button>
              <button
                onClick={() => setActiveProfileTab('documents')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeProfileTab === 'documents' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Uploaded Documents & KYC
              </button>
              <button
                onClick={() => setActiveProfileTab('fees')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeProfileTab === 'fees' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Fee Ledger ({selectedStudent.payments?.length || 0})
              </button>
              <button
                onClick={() => setActiveProfileTab('results')}
                className={`py-3 px-3 border-b-2 transition-all ${
                  activeProfileTab === 'results' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Semester Results ({selectedStudent.results?.length || 0})
              </button>
            </div>

            {/* Tab 1: Personal, Academic & MP Govt KYC */}
            {activeProfileTab === 'profile' && (
              <div className="p-6 space-y-6 text-xs">
                {/* 1. MP Government & State Scholarship Portal KYC IDs */}
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <span className="font-extrabold text-amber-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      🏛️ Government Portal &amp; Scholarship KYC IDs (M.P. Higher Education)
                    </span>
                    <span className="text-[10px] bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded">
                      Official Records
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Aadhaar No</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.aadhaarNo || selectedStudent.aadharNo || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Samagra ID</span>
                      <p className="font-mono font-bold text-indigo-900">{selectedStudent.samagraId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Enrollment No</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.enrollmentNo || selectedStudent.rollNo || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">ABC ID</span>
                      <p className="font-mono font-bold text-indigo-900">{selectedStudent.abcId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">MPTASS ID</span>
                      <p className="font-mono font-bold text-emerald-800">{selectedStudent.mpTassId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">MPTASS Password</span>
                      <p className="font-mono font-bold text-slate-700">{selectedStudent.mpTassPassword || '••••••'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">OTR ID</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.otrId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">DEB ID / Scholer ID</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.debId || selectedStudent.scholerId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Scholarship ID (Scholer_id)</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.scholerId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">User ID (User_id)</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.userId || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Family Particulars */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    👤 Personal &amp; Family Particulars
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><span className="text-slate-400 block text-[10px]">Student Full Name:</span><p className="font-bold text-slate-900 uppercase">{selectedStudent.fullName}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Mother's Name:</span><p className="font-semibold text-slate-800">{selectedStudent.motherName || 'N/A'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Father's Name:</span><p className="font-semibold text-slate-800">{selectedStudent.fatherName}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Date of Birth:</span><p className="font-semibold text-slate-800">{selectedStudent.dob}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Gender:</span><p className="font-semibold text-slate-800">{selectedStudent.gender || 'Not Specified'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Blood Group:</span><p className="font-semibold text-rose-700">{selectedStudent.bloodGroup || 'NA'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Contact Mobile:</span><p className="font-semibold text-slate-800 font-mono">{selectedStudent.phone}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Email Address:</span><p className="font-semibold text-slate-800">{selectedStudent.email}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Social Category:</span><p className="font-semibold text-indigo-700">{selectedStudent.socialCategory || selectedStudent.category || 'General'}</p></div>
                    <div className="col-span-2 sm:col-span-3"><span className="text-slate-400 block text-[10px]">Full Residential Address:</span><p className="font-medium text-slate-800">{selectedStudent.address}{selectedStudent.city ? `, ${selectedStudent.city}` : ''}{selectedStudent.state ? `, ${selectedStudent.state}` : ''}{selectedStudent.pincode ? ` - ${selectedStudent.pincode}` : ''}</p></div>
                  </div>
                </div>

                {/* 3. University, College & Academic Program */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    🎓 University, College &amp; Academic Program Particulars
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><span className="text-slate-400 block text-[10px]">University Name:</span><p className="font-bold text-indigo-950">{selectedStudent.universityName || 'Not Specified'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">College Name:</span><p className="font-bold text-indigo-950">{selectedStudent.collegeName || 'Not Specified'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Enrolled Course:</span><p className="font-bold text-indigo-950">{selectedStudent.courseName}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Branch:</span><p className="font-semibold text-slate-800">{selectedStudent.branch || 'General'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Course Type:</span><p className="font-semibold text-slate-800">{selectedStudent.courseType || 'Regular'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Course Mode:</span><p className="font-semibold text-slate-800">{selectedStudent.courseMode || 'Full Time / Regular'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Instruction Medium:</span><p className="font-bold text-slate-900">{selectedStudent.medium || 'Hindi'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Admission Date:</span><p className="font-semibold text-slate-800">{selectedStudent.admissionDate || selectedStudent.admissionYear}</p></div>
                  </div>
                </div>

                {/* 4. Admission Session, Satra & Class Particulars */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    📅 Admission Session, Satra &amp; Administrative Tracking
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><span className="text-slate-400 block text-[10px]">Admission Session:</span><p className="font-bold text-slate-900">{selectedStudent.admissionSession || '2026-2027'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Admission Satra:</span><p className="font-bold text-indigo-900">{selectedStudent.admissionSatra || 'July'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Current Session:</span><p className="font-bold text-slate-900">{selectedStudent.currentSession || '2026-2027'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Current Satra:</span><p className="font-bold text-indigo-900">{selectedStudent.currentSatra || 'July'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Current Class:</span><p className="font-bold text-slate-900">{selectedStudent.currentClass || `SEM-${selectedStudent.currentSemester || 1}`}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Status:</span><span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">{selectedStudent.status || 'Active'}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Reference:</span><p className="font-medium text-slate-700">{selectedStudent.reference || 'Direct'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Remark:</span><p className="font-medium text-slate-700">{selectedStudent.remark || 'N/A'}</p></div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Uploaded Documents & KYC Proofs */}
            {activeProfileTab === 'documents' && (
              <div className="p-6 space-y-6 text-xs">
                {/* Passport Photo Preview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-28 rounded-xl overflow-hidden border border-slate-300 bg-white flex items-center justify-center shrink-0 shadow-sm">
                    {selectedStudent.studentImage || selectedStudent.documents?.photo ? (
                      <img src={selectedStudent.studentImage || selectedStudent.documents?.photo} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="font-bold text-slate-900 text-sm block">Student_image (Passport Photo)</span>
                    <p className="text-[11px] text-slate-500">Official student identity photo recorded during registration.</p>
                    {(selectedStudent.studentImage || selectedStudent.documents?.photo) && (
                      <a
                        href={selectedStudent.studentImage || selectedStudent.documents?.photo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Full-size Image
                      </a>
                    )}
                  </div>
                </div>

                {/* Submitted Documents Checklist */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 text-sm block">Document_Submit Checklist Status</span>
                  {selectedStudent.documentSubmit && selectedStudent.documentSubmit.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.documentSubmit.map((item, idx) => (
                        <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-semibold text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No document checklist recorded.</p>
                  )}
                </div>

                {/* File Upload Records */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 text-sm block">Stored Digital Proofs</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { label: 'Student Photo (Student_image)', url: selectedStudent.studentImage || selectedStudent.documents?.photo },
                      { label: '10th Marksheet Proof', url: selectedStudent.documents?.doc10th },
                      { label: '12th Marksheet Proof', url: selectedStudent.documents?.doc12th },
                      { label: 'Aadhaar Card Copy', url: selectedStudent.documents?.aadhar },
                      { label: 'Candidate Signature', url: selectedStudent.documents?.signature }
                    ].map((doc, i) => (
                      <div key={i} className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-slate-800 block">{doc.label}</span>
                          <span className="text-[10px] text-slate-400">{doc.url ? 'File attached' : 'Not uploaded'}</span>
                        </div>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg text-xs transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> View / Download
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[10px]">No file attached</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Fee Ledger */}
            {activeProfileTab === 'fees' && (
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border text-center">
                  <div>
                    <span className="text-slate-400 block">Gross Course Fee</span>
                    <span className="font-bold text-slate-900 text-sm">₹{Number(selectedStudent.totalFee || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-indigo-600 block">Scholarship (छात्रवृत्ति)</span>
                    <span className="font-bold text-indigo-700 text-sm">
                      {Number(selectedStudent.scholarshipAmount) > 0 ? `₹${Number(selectedStudent.scholarshipAmount).toLocaleString('en-IN')}` : '₹0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Paid</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{Number(selectedStudent.totalPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Pending Balance Due</span>
                    <span className="font-bold text-rose-700 text-sm">₹{Number(selectedStudent.balanceDue || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">Transaction Receipts History</span>
                  {selectedStudent.payments?.length === 0 ? (
                    <p className="text-slate-400 italic">No fee installments recorded yet.</p>
                  ) : (
                    selectedStudent.payments?.map((p, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-indigo-900 font-mono">{p.receiptNo}</span>
                          <span className="text-[11px] text-slate-500 block">{p.paidFor} • Mode: {p.paymentMode}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700 text-sm">₹{Number(p.amountPaid).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Results */}
            {activeProfileTab === 'results' && (
              <div className="p-6 space-y-4 text-xs">
                {selectedStudent.results?.length === 0 ? (
                  <p className="text-slate-400 italic">No semester examination results recorded yet for this student.</p>
                ) : (
                  selectedStudent.results?.map((r, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Semester {r.semester} Examination Result</h4>
                          <span className="text-[11px] text-slate-500">Session: {r.examSession} • Declared: {r.declarationDate}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {r.resultStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-indigo-900">
                        <span>Total: {r.totalObtainedMarks}/{r.totalMaxMarks}</span>
                        <span>Percentage: {r.percentage}%</span>
                        <span>SGPA: {r.sgpa}</span>
                      </div>
                      <button
                        onClick={() => setPrintMarksheetData(r)}
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <Printer className="w-3.5 h-3.5" /> View & Print Marksheet
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setPrintSlipStudent(selectedStudent)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                <Printer className="w-4 h-4" /> Print Admission Slip
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Print Admission Slip Modal */}
      {printSlipStudent && (
        <PrintAdmissionSlip
          student={printSlipStudent}
          onClose={() => setPrintSlipStudent(null)}
        />
      )}

      {/* Print Marksheet Modal */}
      {printMarksheetData && (
        <PrintMarksheet
          result={printMarksheetData}
          onClose={() => setPrintMarksheetData(null)}
        />
      )}

      {/* Comprehensive Student Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Student &amp; Enrollment Records</h2>
                  <p className="text-xs text-indigo-200">
                    Roll: <strong className="font-mono text-amber-300">{editingStudent.rollNo}</strong> • {editingStudent.courseName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error & Success alerts */}
            {editError && (
              <div className="m-6 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="m-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              {/* Section: Personal Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Personal &amp; Contact Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father's Name *</label>
                    <input
                      type="text"
                      value={editFormData.fatherName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium uppercase focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={editFormData.motherName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium uppercase focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editFormData.dob || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={editFormData.gender || 'Male'}
                      onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Mobile</label>
                    <input
                      type="tel"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Email ID</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      value={editFormData.aadhaarNo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, aadhaarNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Samagra ID</label>
                    <input
                      type="text"
                      value={editFormData.samagraId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, samagraId: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Academic & Institutional Particulars */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Academic, University &amp; Promotion Controls</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Roll Number / Enrollment *</label>
                    <input
                      type="text"
                      value={editFormData.rollNo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white uppercase"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">University Name</label>
                    <input
                      type="text"
                      value={editFormData.universityName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, universityName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">College Name</label>
                    <input
                      type="text"
                      value={editFormData.collegeName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, collegeName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      value={editFormData.courseName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, courseName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Branch / Specialization</label>
                    <input
                      type="text"
                      value={editFormData.branch || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>

                  {/* Manual Semester & Year Promotion Control */}
                  <div className="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200">
                    <label className="block font-black text-indigo-950 mb-1 flex items-center justify-between">
                      <span>⚡ Current Semester / Class</span>
                      <span className="text-[10px] text-indigo-700 font-bold">Admin Power</span>
                    </label>
                    <select
                      value={editFormData.currentSemester || 1}
                      onChange={(e) => {
                        const semNum = Number(e.target.value);
                        setEditFormData({
                          ...editFormData,
                          currentSemester: semNum,
                          currentClass: `SEM-${semNum}`,
                          manualSemester: semNum
                        });
                      }}
                      className="w-full p-2 bg-white border border-indigo-300 rounded-xl font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={1}>SEM-1 (1st Semester / 1st Year)</option>
                      <option value={2}>SEM-2 (2nd Semester / 1st Year)</option>
                      <option value={3}>SEM-3 (3rd Semester / 2nd Year)</option>
                      <option value={4}>SEM-4 (4th Semester / 2nd Year)</option>
                      <option value={5}>SEM-5 (5th Semester / 3rd Year)</option>
                      <option value={6}>SEM-6 (6th Semester / 3rd Year)</option>
                      <option value={7}>SEM-7 (7th Semester / 4th Year)</option>
                      <option value={8}>SEM-8 (8th Semester / 4th Year)</option>
                    </select>
                    <p className="text-[10px] text-indigo-800 mt-1">
                      Promotion is in your control. Changing semester updates fee dues according to this class.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Course Fee (₹)</label>
                    <input
                      type="number"
                      value={editFormData.totalFee || 0}
                      onChange={(e) => setEditFormData({ ...editFormData, totalFee: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-indigo-900 mb-1 flex items-center justify-between">
                      <span>Scholarship / छात्रवृत्ति (₹)</span>
                      <span className="text-[10px] text-indigo-600 font-normal">Default 0</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editFormData.scholarshipAmount !== undefined ? editFormData.scholarshipAmount : 0}
                      onChange={(e) => setEditFormData({ ...editFormData, scholarshipAmount: Number(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-indigo-50/60 border border-indigo-300 rounded-xl font-mono font-bold text-indigo-950 focus:bg-white focus:border-indigo-600"
                      placeholder="0"
                    />
                    <p className="text-[10px] text-indigo-700 mt-1">
                      Auto-deducted from Total Course Fee (Remaining dues auto-reduce).
                    </p>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Year</label>
                    <input
                      type="number"
                      value={editFormData.admissionYear || 2026}
                      onChange={(e) => setEditFormData({ ...editFormData, admissionYear: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editFormData.status || 'Active'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed / Passed</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Display existing secondary / dual programs if student already has them */}
              {editingStudent.linkedCourses && editingStudent.linkedCourses.length > 0 && (
                <div className="space-y-3 bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Enrolled Secondary / Dual Programs (पहले से जुड़े कोर्स)</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                      {editingStudent.linkedCourses.length} Connected Program(s)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {editingStudent.linkedCourses.map((lc, idx) => (
                      <div key={lc.id || idx} className="p-3 bg-white rounded-xl border border-amber-300 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{lc.courseName}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            {lc.courseType || 'Diploma'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Roll: <strong className="font-mono text-slate-800">{lc.rollNo}</strong> • {lc.collegeName || lc.universityName}
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                          <span className="font-semibold text-slate-600">Total: ₹{Number(lc.totalFee || 0).toLocaleString('en-IN')}</span>
                          <span className="font-bold text-emerald-700">Paid: ₹{Number(lc.totalPaid || 0).toLocaleString('en-IN')}</span>
                          <span className={`font-bold ${lc.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            Due: ₹{Number(lc.balanceDue || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Button to Add Another Course / University */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  className={`w-full py-3 px-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2.5 font-extrabold text-xs transition-all cursor-pointer ${
                    showAddCourse
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-inner'
                      : 'bg-indigo-50/70 hover:bg-indigo-100 border-indigo-300 text-indigo-900 hover:scale-[1.005]'
                  }`}
                >
                  <PlusCircle className={`w-4 h-4 ${showAddCourse ? 'text-amber-600' : 'text-indigo-600'}`} />
                  <span>
                    {showAddCourse 
                      ? '▲ Cancel Adding Another Course / University (रद्द करें)' 
                      : '+ Add Another Course / University (नया कोर्स / यूनिवर्सिटी जोड़ें)'}
                  </span>
                </button>
              </div>

              {/* Form Section: Add Another Course / University */}
              {showAddCourse && (
                <div className="p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-300 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center text-[10px] font-black">3</span>
                      <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                        New Additional Program / Course Particulars (नया कोर्स विवरण)
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                      🎓 Dual Enrollment
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* University Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">University Name (विश्वविद्यालय) *</label>
                      <select
                        value={newCourseData.universityName}
                        onChange={(e) => {
                          const uName = e.target.value;
                          setNewCourseData({
                            ...newCourseData,
                            universityName: uName,
                            collegeName: ''
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      >
                        <option value="">-- Select University --</option>
                        {universitiesList.map(u => (
                          <option key={u.id} value={u.name}>{u.name} {u.shortName ? `(${u.shortName})` : ''}</option>
                        ))}
                        <option value="Maharaja Chhatrasal Bundelkhand University (MCBU Chhatarpur)">MCBU Chhatarpur</option>
                        <option value="Makhanlal Chaturvedi National University (MCU Bhopal)">MCU Bhopal</option>
                        <option value="Barkatullah University (BU Bhopal)">BU Bhopal</option>
                      </select>
                    </div>

                    {/* College Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">College Name (महाविद्यालय) *</label>
                      <select
                        value={newCourseData.collegeName}
                        onChange={(e) => setNewCourseData({ ...newCourseData, collegeName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      >
                        <option value="">-- Select College --</option>
                        {collegesList
                          .filter(c => !newCourseData.universityName || !c.universityName || c.universityName.toLowerCase().includes(newCourseData.universityName.toLowerCase().split(' ')[0]))
                          .map(c => (
                            <option key={c.id} value={c.name}>{c.code ? `${c.code} - ` : ''}{c.name}</option>
                          ))
                        }
                        <option value="PKC Education Learning Institute & Consultancy">PKC Education Learning Institute & Consultancy</option>
                        <option value="Govt PG College Chhatarpur">Govt PG College Chhatarpur</option>
                        <option value="Maharaja Chhatrasal College Chhatarpur">Maharaja Chhatrasal College Chhatarpur</option>
                      </select>
                    </div>

                    {/* Course Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Course / Degree Name *</label>
                      <select
                        value={newCourseData.courseName}
                        onChange={(e) => {
                          const cName = e.target.value;
                          const foundCourse = allCoursesList.find(c => c.name === cName);
                          const cFee = foundCourse?.totalFee || (cName.toLowerCase().includes('diploma') || cName.toLowerCase().includes('dca') ? 25000 : 32000);
                          const isDip = cName.toLowerCase().includes('diploma') || cName.toLowerCase().includes('dca') || cName.toLowerCase().includes('pgdca');
                          setNewCourseData({
                            ...newCourseData,
                            courseName: cName,
                            branch: foundCourse?.branch || cName,
                            courseType: isDip ? 'Diploma' : (foundCourse?.courseType || 'UG'),
                            totalFee: cFee
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      >
                        <option value="">-- Select Course --</option>
                        {allCoursesList.map(c => (
                          <option key={c.id} value={c.name}>{c.name} {c.totalFee ? `(₹${Number(c.totalFee).toLocaleString('en-IN')})` : ''}</option>
                        ))}
                        <option value="DCA (Diploma in Computer Applications)">DCA (Diploma in Computer Applications)</option>
                        <option value="PGDCA (Post Graduate Diploma in Computer Applications)">PGDCA (Post Graduate Diploma in Computer Applications)</option>
                        <option value="B.Tech (Bachelor of Technology)">B.Tech</option>
                        <option value="BCA (Bachelor of Computer Applications)">BCA</option>
                        <option value="BA (Bachelor of Arts)">BA</option>
                        <option value="B.Sc (Bachelor of Science)">B.Sc</option>
                        <option value="B.Com (Bachelor of Commerce)">B.Com</option>
                        <option value="MBA (Master of Business Administration)">MBA</option>
                      </select>
                    </div>

                    {/* Branch / Specialization */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Branch / Specialization</label>
                      <input
                        type="text"
                        value={newCourseData.branch}
                        onChange={(e) => setNewCourseData({ ...newCourseData, branch: e.target.value })}
                        placeholder="e.g. Computer Applications, IT, etc."
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Course Type */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Course Type</label>
                      <select
                        value={newCourseData.courseType}
                        onChange={(e) => setNewCourseData({ ...newCourseData, courseType: e.target.value })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-medium focus:outline-none"
                      >
                        <option value="Diploma">Diploma (डिप्लोमा)</option>
                        <option value="UG">UG / Degree (स्नातक)</option>
                        <option value="PG">PG (स्नातकोत्तर)</option>
                        <option value="Certificate">Certificate (प्रमाणपत्र)</option>
                      </select>
                    </div>

                    {/* Semester */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Semester / Year</label>
                      <select
                        value={newCourseData.currentSemester}
                        onChange={(e) => {
                          const sem = Number(e.target.value);
                          setNewCourseData({
                            ...newCourseData,
                            currentSemester: sem,
                            currentClass: `SEM-${sem}`
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold focus:outline-none"
                      >
                        <option value={1}>SEM-1 (1st Sem / 1st Year)</option>
                        <option value={2}>SEM-2 (2nd Sem)</option>
                        <option value={3}>SEM-3 (3rd Sem / 2nd Year)</option>
                        <option value={4}>SEM-4 (4th Sem)</option>
                      </select>
                    </div>

                    {/* Admission Date - Editable for admissions taken later */}
                    <div>
                      <label className="block font-bold text-indigo-950 mb-1 flex items-center justify-between">
                        <span>Admission Date (प्रवेश तिथि) *</span>
                        <span className="text-[10px] text-indigo-600 font-bold">Editable Date</span>
                      </label>
                      <input
                        type="date"
                        value={newCourseData.admissionDate}
                        onChange={(e) => {
                          const dt = e.target.value;
                          const yr = dt ? new Date(dt).getFullYear() : newCourseData.admissionYear;
                          setNewCourseData({
                            ...newCourseData,
                            admissionDate: dt,
                            admissionYear: yr
                          });
                        }}
                        className="w-full p-2.5 bg-white border border-indigo-300 rounded-xl font-bold text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <p className="text-[9px] text-slate-500 mt-1">1 saal baad admission lene par date yahan se badal sakte hain</p>
                    </div>

                    {/* Admission Year */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Admission Year (सत्र वर्ष)</label>
                      <input
                        type="number"
                        value={newCourseData.admissionYear}
                        onChange={(e) => setNewCourseData({ ...newCourseData, admissionYear: Number(e.target.value) })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold focus:outline-none"
                      />
                    </div>

                    {/* Total Fee for 2nd Course */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">2nd Course Total Fee (₹) *</label>
                      <input
                        type="number"
                        min="0"
                        value={newCourseData.totalFee}
                        onChange={(e) => setNewCourseData({ ...newCourseData, totalFee: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                    </div>

                    {/* Scholarship for 2nd Course */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Scholarship (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCourseData.scholarshipAmount}
                        onChange={(e) => setNewCourseData({ ...newCourseData, scholarshipAmount: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-medium focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* Initial Paid Today */}
                    <div>
                      <label className="block font-bold text-emerald-900 mb-1">Fee Paid Today / तत्काल जमा (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCourseData.initialPaid}
                        onChange={(e) => setNewCourseData({ ...newCourseData, initialPaid: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-emerald-50/60 border border-emerald-300 rounded-xl font-mono font-bold text-emerald-950 focus:outline-none focus:bg-white"
                        placeholder="0"
                      />
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Payment Mode</label>
                      <select
                        value={newCourseData.paymentMode}
                        onChange={(e) => setNewCourseData({ ...newCourseData, paymentMode: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                      >
                        <option value="Cash">Cash (नकद)</option>
                        <option value="UPI / Online">UPI / Online QR</option>
                        <option value="Bank Transfer">Bank Transfer / NEFT</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Combined Fee Summary Box */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 border border-amber-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-600 font-bold">Course 1 ({editFormData.courseName || 'Primary'})</div>
                      <div className="text-sm font-black text-slate-900">₹{Number(editFormData.totalFee || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-amber-800 font-bold">Course 2 ({newCourseData.courseName || 'New Course'})</div>
                      <div className="text-sm font-black text-amber-950">₹{Number(newCourseData.totalFee || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-indigo-900 font-bold">Combined Total Fees</div>
                      <div className="text-sm font-black text-indigo-950">
                        ₹{(Number(editFormData.totalFee || 0) + Number(newCourseData.totalFee || 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-900 font-bold">Paid Today (C2)</div>
                      <div className="text-sm font-black text-emerald-800">
                        ₹{Number(newCourseData.initialPaid || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{editLoading ? 'Saving...' : 'Save All Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Data Import Modal */}
      <BulkImportModal
        isOpen={showBulkImport}
        onClose={() => setShowBulkImport(false)}
        operatorName="Admin / Faculty Desk"
        onImportSuccess={() => {
          fetchStudents();
        }}
      />

    </div>
  );
}
