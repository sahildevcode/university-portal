import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Briefcase, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  GraduationCap, 
  Award, 
  Layers, 
  X, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy,
  ChevronRight,
  ExternalLink,
  Eye,
  Grid,
  List,
  Building2,
  Users,
  CreditCard,
  Phone,
  MapPin,
  FileCheck,
  School,
  ArrowRight,
  Printer,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fireCelebration } from '../utils/confetti';

const SECTOR_OPTIONS = [];

const DURATION_OPTIONS = [
  '1 Month',
  '3 Months',
  '6 Months',
  '9 Months',
  '1 Year',
  '2 Years'
];

const ELIGIBILITY_OPTIONS = [
  'No Formal Education Required',
  '5th Pass',
  '8th Pass',
  '10th Pass (High School)',
  '12th Pass (Intermediate)',
  '12th Commerce',
  '12th Science',
  'Any Graduate',
  'ITI / Diploma'
];

// Pre-seeded Default Vocational Institutes (English)
const INITIAL_DEMO_INSTITUTES = [
  {
    id: 'inst-mdvti',
    name: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    shortName: 'MDVTI',
    code: 'MDVTI-01',
    parentCenter: 'PKC Institute',
    type: 'Vocational Training Institute',
    address: 'Bhopal / Damoh (M.P)',
    contact: '9876543210',
    description: 'Skill development, IT, Technical & Electrical vocational trade certifications.',
    status: 'Active'
  },
  {
    id: 'inst-mdette',
    name: 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)',
    shortName: 'MDETTE',
    code: 'MDETTE-02',
    parentCenter: 'PKC Institute',
    type: 'Early Teachers Training & Education',
    address: 'Bhopal / Damoh (M.P)',
    contact: '9876543210',
    description: 'Nursery Teacher Training (NTT), ECCE, PTT & pre-primary educator diplomas.',
    status: 'Active'
  }
];

// Default Vocational Courses (empty so admin adds or uploads their own courses)
const INITIAL_DEMO_COURSES = [];

export default function VocationalCoursesManager({ 
  lang = 'en', 
  toggleLang,
  adminUser,
  onNavigateToRecords,
  onNavigateToAdmissions,
  onRefreshCourses
}) {
  const isHindi = lang === 'hi';

  // Primary Workspace View: 'institutes' | 'courses' | 'students'
  const [activeMainTab, setActiveMainTab] = useState('institutes');

  // Institutes State
  const [institutes, setInstitutes] = useState(() => {
    try {
      const cached = localStorage.getItem('pkc_vocational_institutes');
      if (cached) {
        const parsed = JSON.parse(cached);
        // Clear if it contains legacy Hindi institute names or old PTC Institute
        if (Array.isArray(parsed) && parsed.some(i => (i.name && /[\u0900-\u097F]/.test(i.name)) || i.parentCenter === 'PTC Institute')) {
          localStorage.removeItem('pkc_vocational_institutes');
          return INITIAL_DEMO_INSTITUTES;
        }
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_INSTITUTES;
      }
      return INITIAL_DEMO_INSTITUTES;
    } catch {
      return INITIAL_DEMO_INSTITUTES;
    }
  });

  // Courses State - starts empty so user can add or upload their own courses!
  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('pkc_vocational_courses');
      if (cached) {
        const parsed = JSON.parse(cached);
        // If it was the old demo courses (e.g. contains VOC-ELE-101), clear it
        if (Array.isArray(parsed) && parsed.some(c => c.courseCode === 'VOC-ELE-101' || c.courseName?.includes('Electrician'))) {
          localStorage.removeItem('pkc_vocational_courses');
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Enrolled Vocational Students State
  const [vocationalStudents, setVocationalStudents] = useState([]);
  const [totalCentralStudents, setTotalCentralStudents] = useState(718);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstituteFilter, setSelectedInstituteFilter] = useState('all');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [toast, setToast] = useState(null);

  // Manual Add / Edit Course Modal state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    instituteId: 'inst-mdvti',
    instituteName: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    courseName: '',
    courseCode: '',
    sector: '',
    duration: '6 Months',
    eligibility: '10th Pass (High School)',
    fee: 10000,
    certification: 'PKC Certified Skill Diploma',
    mode: 'Regular',
    description: '',
    status: 'Active'
  });

  // Add / Edit Institute Modal state
  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState(null);
  const [instituteFormData, setInstituteFormData] = useState({
    name: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    code: 'MDVTI',
    parentCenter: 'PKC Institute',
    type: 'Vocational Training Institute',
    address: 'Bhopal / Damoh (M.P)',
    contact: '9876543210',
    description: 'Skill development and vocational trade certifications.',
    status: 'Active'
  });

  // Excel Upload Modal state
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [targetExcelInstituteId, setTargetExcelInstituteId] = useState('inst-mdvti');
  const [excelFile, setExcelFile] = useState(null);
  const [excelParsedRows, setExcelParsedRows] = useState([]);
  const [excelParsing, setExcelParsing] = useState(false);
  const [importMode, setImportMode] = useState('append'); // 'append' | 'replace'
  const [workbookObj, setWorkbookObj] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetCourseCounts, setSheetCourseCounts] = useState({});
  const fileInputRef = useRef(null);

  // Enroll Vocational Student Modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollSuccessData, setEnrollSuccessData] = useState(null);
  const [enrollForm, setEnrollForm] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    aadhaarNo: '',
    abcId: '',
    enrollmentNo: '',
    phone: '',
    instituteId: 'inst-mdvti',
    instituteName: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    parentCenter: 'PKC Institute',
    courseId: '',
    courseName: '',
    sector: 'Electrical & Electronics',
    duration: '1 Year',
    totalFee: 12000,
    initialPaid: 5000,
    paymentMode: 'Cash',
    admissionSession: '2024-2025',
    admissionDate: new Date().toISOString().split('T')[0],
    address: '',
    category: 'General',
    remark: ''
  });

  // Quick Edit Enrollment Number Modal state
  const [editingEnrollmentStudent, setEditingEnrollmentStudent] = useState(null);
  const [tempEnrollmentNo, setTempEnrollmentNo] = useState('');
  const [savingEnrollmentNo, setSavingEnrollmentNo] = useState(false);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Open Edit Enrollment Number Modal
  const handleOpenEditEnrollmentNo = (student) => {
    setEditingEnrollmentStudent(student);
    setTempEnrollmentNo(student.enrollmentNo || '');
  };

  // Save Enrollment Number
  const handleSaveEnrollmentNo = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingEnrollmentStudent) return;
    setSavingEnrollmentNo(true);
    try {
      const key = editingEnrollmentStudent.id || editingEnrollmentStudent.rollNo;
      const res = await fetch(`/api/vocational-students/${encodeURIComponent(key)}/enrollment-no`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentNo: tempEnrollmentNo.trim().toUpperCase() })
      });
      const data = await res.json();
      if (data.success) {
        const updatedVal = tempEnrollmentNo.trim().toUpperCase();
        setVocationalStudents(prev => prev.map(s => {
          if ((editingEnrollmentStudent.id && s.id === editingEnrollmentStudent.id) || 
              (editingEnrollmentStudent.rollNo && s.rollNo === editingEnrollmentStudent.rollNo)) {
            return { ...s, enrollmentNo: updatedVal };
          }
          return s;
        }));
        showToast(updatedVal ? `✅ Enrollment Number set to ${updatedVal}!` : 'Enrollment Number cleared.');
        setEditingEnrollmentStudent(null);
      } else {
        throw new Error(data.message || 'Failed to update enrollment number');
      }
    } catch (err) {
      alert('Error updating Enrollment Number: ' + err.message);
    } finally {
      setSavingEnrollmentNo(false);
    }
  };

  // Fetch Institutes from Backend
  const fetchInstitutes = async () => {
    try {
      const res = await fetch('/api/vocational-institutes');
      const data = await res.json();
      if (data.success && Array.isArray(data.institutes) && data.institutes.length > 0) {
        setInstitutes(data.institutes);
        try {
          localStorage.setItem('pkc_vocational_institutes', JSON.stringify(data.institutes));
        } catch {}
      }
    } catch (err) {
      console.warn('Could not fetch vocational institutes:', err);
    }
  };

  // Fetch Courses from Backend
  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/vocational-courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
        try {
          localStorage.setItem('pkc_vocational_courses', JSON.stringify(data.courses));
        } catch {}
      }
    } catch (err) {
      console.warn('Could not fetch vocational courses:', err);
    }
  };

  // Clear all vocational courses
  const handleClearAllCourses = async () => {
    if (!window.confirm('Are you sure you want to remove all vocational courses?')) return;
    try {
      const res = await fetch('/api/vocational-courses', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCourses([]);
        try { localStorage.setItem('pkc_vocational_courses', JSON.stringify([])); } catch {}
        showToast('🗑️ All vocational courses cleared successfully!');
      }
    } catch (err) {
      setCourses([]);
      try { localStorage.setItem('pkc_vocational_courses', JSON.stringify([])); } catch {}
      showToast('Cleared courses!');
    }
  };

  // Fetch Enrolled Vocational Students & Central Count
  const fetchVocationalStudents = async () => {
    try {
      const res = await fetch('/api/vocational-students');
      const data = await res.json();
      if (data.success) {
        setVocationalStudents(data.students || []);
        if (data.totalEnrolledAll) {
          setTotalCentralStudents(data.totalEnrolledAll);
        }
      }
    } catch (err) {
      console.warn('Could not fetch vocational students:', err);
    }

    // Also get overall students count for total live badge
    try {
      const res2 = await fetch('/api/students?limit=1');
      const data2 = await res2.json();
      if (data2.success && data2.timeframeCounts?.all) {
        setTotalCentralStudents(data2.timeframeCounts.all);
      } else if (data2.success && Array.isArray(data2.students)) {
        setTotalCentralStudents(prev => Math.max(prev, data2.students.length));
      }
    } catch {}
  };

  useEffect(() => {
    fetchInstitutes();
    fetchCourses();
    fetchVocationalStudents();
  }, []);

  // Update default course when opening Add Course
  const handleOpenAddCourse = (targetInst = null) => {
    setEditingCourse(null);
    const inst = targetInst || institutes.find(i => i.id === selectedInstituteFilter) || institutes[0] || INITIAL_DEMO_INSTITUTES[0];
    setCourseFormData({
      instituteId: inst.id,
      instituteName: inst.name,
      courseName: '',
      courseCode: `VOC-${Date.now().toString().slice(-4)}`,
      sector: '',
      duration: '6 Months',
      eligibility: '10th Pass (High School)',
      fee: 10000,
      certification: 'PKC Certified Skill Diploma',
      mode: 'Regular',
      description: '',
      status: 'Active'
    });
    setShowAddCourseModal(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseFormData({
      instituteId: course.instituteId || 'inst-mdvti',
      instituteName: course.instituteName || 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      sector: course.sector || '',
      duration: course.duration || '6 Months',
      eligibility: course.eligibility || '10th Pass (High School)',
      fee: course.fee !== undefined ? course.fee : 10000,
      certification: course.certification || 'PKC Certified Skill Diploma',
      mode: course.mode || 'Regular',
      description: course.description || '',
      status: course.status || 'Active'
    });
    setShowAddCourseModal(true);
  };

  // Save Course
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.courseName.trim()) {
      alert('Please enter course name');
      return;
    }

    setLoading(true);
    const isEdit = !!editingCourse;
    const url = isEdit ? `/api/vocational-courses/${editingCourse.id}` : '/api/vocational-courses';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseFormData)
      });
      const data = await res.json();

      if (data.success) {
        showToast(isEdit ? '✅ Course updated successfully!' : '🎉 New vocational course created successfully!');
        fetchCourses();
        setShowAddCourseModal(false);
        fireCelebration();
      } else {
        throw new Error(data.message || 'Failed to save course');
      }
    } catch (err) {
      // Offline fallback
      let updated;
      if (isEdit) {
        updated = courses.map(c => c.id === editingCourse.id ? { ...c, ...courseFormData } : c);
      } else {
        const newC = {
          id: 'voc-' + Date.now(),
          ...courseFormData,
          createdAt: new Date().toISOString()
        };
        updated = [newC, ...courses];
      }
      setCourses(updated);
      try { localStorage.setItem('pkc_vocational_courses', JSON.stringify(updated)); } catch {}
      setShowAddCourseModal(false);
      showToast('Saved to local storage cache!');
    } finally {
      setLoading(false);
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/vocational-courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`🗑️ Course "${name}" removed.`);
        fetchCourses();
      }
    } catch {
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      try { localStorage.setItem('pkc_vocational_courses', JSON.stringify(updated)); } catch {}
      showToast('Course removed from local storage');
    }
  };

  // Open Add Institute Modal
  const handleOpenAddInstitute = () => {
    setEditingInstitute(null);
    setInstituteFormData({
      name: '',
      code: '',
      parentCenter: 'PKC Institute',
      type: 'Vocational Training Institute',
      address: 'Bhopal / Damoh (M.P)',
      contact: '9876543210',
      description: 'Skill development and vocational trade certifications.',
      status: 'Active'
    });
    setShowInstituteModal(true);
  };

  const handleOpenEditInstitute = (inst) => {
    setEditingInstitute(inst);
    setInstituteFormData({
      name: inst.name,
      code: inst.code || inst.shortName || '',
      parentCenter: inst.parentCenter || 'PKC Institute',
      type: inst.type || 'Vocational Training Institute',
      address: inst.address || '',
      contact: inst.contact || '',
      description: inst.description || '',
      status: inst.status || 'Active'
    });
    setShowInstituteModal(true);
  };

  // Quick Preset Helper for the 2 user-requested Institutes
  const applyInstitutePreset = (presetIndex) => {
    if (presetIndex === 1) {
      setInstituteFormData({
        name: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
        code: 'MDVTI',
        parentCenter: 'PKC Institute',
        type: 'Vocational Training Institute',
        address: 'Bhopal / Damoh (M.P)',
        contact: '9876543210',
        description: 'Electrical, IT, Beauty, Solar and Technical Trade Training Institute.',
        status: 'Active'
      });
    } else if (presetIndex === 2) {
      setInstituteFormData({
        name: 'Maharishi Dayanand Early Teachers Training and Education (MDETTE)',
        code: 'MDETTE',
        parentCenter: 'PKC Institute',
        type: 'Early Teachers Training & Education',
        address: 'Bhopal / Damoh (M.P)',
        contact: '9876543210',
        description: 'Nursery Teacher Training (NTT), ECCE, PTT & Pre-primary educator programs.',
        status: 'Active'
      });
    }
  };

  // Save Institute
  const handleSaveInstitute = async (e) => {
    e.preventDefault();
    if (!instituteFormData.name.trim()) {
      alert('Please enter institute name');
      return;
    }

    setLoading(true);
    const isEdit = !!editingInstitute;
    const url = isEdit ? `/api/vocational-institutes/${editingInstitute.id}` : '/api/vocational-institutes';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instituteFormData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? '✅ Institute updated successfully!' : '🎉 New Institute added successfully!');
        fetchInstitutes();
        setShowInstituteModal(false);
      } else {
        throw new Error(data.message || 'Failed to save institute');
      }
    } catch {
      // Local storage fallback
      let updated;
      if (isEdit) {
        updated = institutes.map(i => i.id === editingInstitute.id ? { ...i, ...instituteFormData } : i);
      } else {
        const newInst = {
          id: 'inst-' + Date.now(),
          ...instituteFormData,
          shortName: instituteFormData.code || instituteFormData.name.slice(0, 8)
        };
        updated = [newInst, ...institutes];
      }
      setInstitutes(updated);
      try { localStorage.setItem('pkc_vocational_institutes', JSON.stringify(updated)); } catch {}
      setShowInstituteModal(false);
      showToast('Institute saved!');
    } finally {
      setLoading(false);
    }
  };

  // Open Enroll Student Modal
  const handleOpenEnrollStudent = (targetInstId = null, targetCourse = null) => {
    const inst = institutes.find(i => i.id === targetInstId) || institutes[0] || INITIAL_DEMO_INSTITUTES[0];
    const instCourses = courses.filter(c => !c.instituteId || c.instituteId === inst.id);
    const defCourse = targetCourse || instCourses[0] || courses[0];

    setEnrollForm({
      studentName: '',
      fatherName: '',
      motherName: '',
      aadhaarNo: '',
      abcId: '',
      enrollmentNo: '',
      phone: '',
      instituteId: inst.id,
      instituteName: inst.name,
      parentCenter: inst.parentCenter || 'PKC Institute',
      courseId: defCourse?.id || '',
      courseName: defCourse?.courseName || '',
      sector: defCourse?.sector || 'Electrical & Electronics',
      duration: defCourse?.duration || '1 Year',
      totalFee: defCourse?.fee || 12000,
      initialPaid: Math.floor((defCourse?.fee || 12000) * 0.5),
      paymentMode: 'Cash',
      admissionSession: '2024-2025',
      admissionDate: new Date().toISOString().split('T')[0],
      address: '',
      category: 'General',
      remark: ''
    });
    setShowEnrollModal(true);
  };

  // On selecting institute in student form
  const handleEnrollInstituteChange = (instId) => {
    const inst = institutes.find(i => i.id === instId);
    if (!inst) return;
    const instCourses = courses.filter(c => !c.instituteId || c.instituteId === instId);
    const defCourse = instCourses[0] || null;

    setEnrollForm(prev => ({
      ...prev,
      instituteId: inst.id,
      instituteName: inst.name,
      parentCenter: inst.parentCenter || 'PKC Institute',
      courseId: defCourse?.id || '',
      courseName: defCourse?.courseName || '',
      sector: defCourse?.sector || prev.sector,
      duration: defCourse?.duration || prev.duration,
      totalFee: defCourse?.fee || prev.totalFee,
      initialPaid: defCourse?.fee ? Math.floor(defCourse.fee * 0.5) : prev.initialPaid
    }));
  };

  // On selecting course in student form
  const handleEnrollCourseChange = (courseId) => {
    const c = courses.find(item => item.id === courseId);
    if (!c) return;
    setEnrollForm(prev => ({
      ...prev,
      courseId: c.id,
      courseName: c.courseName,
      sector: c.sector || prev.sector,
      duration: c.duration || prev.duration,
      totalFee: c.fee !== undefined ? c.fee : prev.totalFee,
      initialPaid: c.fee ? Math.floor(c.fee * 0.5) : prev.initialPaid
    }));
  };

  // Submit Student Enrollment
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollForm.studentName.trim()) {
      alert('Please enter student name');
      return;
    }
    if (!enrollForm.fatherName.trim()) {
      alert("Please enter father's name");
      return;
    }
    if (!enrollForm.aadhaarNo.trim()) {
      alert('Please enter Aadhaar card number');
      return;
    }

    setEnrollSubmitting(true);
    try {
      const res = await fetch('/api/vocational-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollForm)
      });
      const data = await res.json();

      if (data.success) {
        fireCelebration();
        setEnrollSuccessData({
          student: data.student,
          totalStudents: data.totalStudents
        });
        setTotalCentralStudents(data.totalStudents);
        setShowEnrollModal(false);
        fetchVocationalStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        throw new Error(data.message || 'Enrollment failed');
      }
    } catch (err) {
      alert('Error enrolling student: ' + err.message);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // Smart Sector Detector based on course name
  const detectCourseSector = (courseName = '') => {
    const cn = String(courseName).toLowerCase();
    if (cn.includes('computer') || cn.includes('dca') || cn.includes('software') || cn.includes('web') || 
        cn.includes('hardware') || cn.includes('it') || cn.includes('cctv') || cn.includes('programming') || 
        cn.includes('python') || cn.includes('data') || cn.includes('desktop') || cn.includes('ddtp') || cn.includes('adca')) {
      return 'Information Technology & Computer';
    }
    if (cn.includes('electric') || cn.includes('wireman') || cn.includes('solar') || cn.includes('electronic') || cn.includes('appliance')) {
      return 'Electrical & Electronics';
    }
    if (cn.includes('teacher') || cn.includes('nursery') || cn.includes('ntt') || cn.includes('primary') || cn.includes('education') || cn.includes('ptc')) {
      return 'Teacher Training & Education';
    }
    if (cn.includes('account') || cn.includes('tally') || cn.includes('gst') || cn.includes('finance') || cn.includes('dfa')) {
      return 'Banking & Financial Accounting';
    }
    if (cn.includes('mechanic') || cn.includes('fitter') || cn.includes('weld') || cn.includes('auto') || cn.includes('motor') || cn.includes('diesel')) {
      return 'Mechanical & Automobile';
    }
    if (cn.includes('beauty') || cn.includes('hair') || cn.includes('makeup') || cn.includes('cosmetology') || cn.includes('fashion') || cn.includes('tailor') || cn.includes('dress')) {
      return 'Beauty, Wellness & Fashion';
    }
    if (cn.includes('yoga') || cn.includes('health') || cn.includes('nursing') || cn.includes('medical') || cn.includes('pharmacy') || cn.includes('ayur')) {
      return 'Healthcare & Yoga';
    }
    if (cn.includes('hotel') || cn.includes('tourism') || cn.includes('hospitality') || cn.includes('cook') || cn.includes('catering') || cn.includes('event')) {
      return 'Hospitality & Tourism';
    }
    return 'Vocational & Technical Skills';
  };

  // Smart Worksheet Courses Parser (handles title rows, custom headers, and multi-sheets)
  const parseCoursesFromWorksheet = (ws, sheetName = '') => {
    if (!ws) return [];
    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    if (!rawRows || rawRows.length === 0) return [];

    // Step 1: Detect actual header row (look within first 15 rows)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(15, rawRows.length); i++) {
      const row = rawRows[i];
      if (!Array.isArray(row)) continue;
      const strCells = row.map(c => String(c || '').trim().toLowerCase());
      const hasHeaderKeyword = strCells.some(c => 
        c.includes('course') || c.includes('trade') || c.includes('subject') || 
        c.includes('duration') || c.includes('code') || c.includes('branch') || 
        c.includes('full name') || c.includes('programme') || c.includes('पाठ्यक्रम') || 
        c.includes('अवधि') || c.includes('शुल्क')
      );
      if (hasHeaderKeyword) {
        headerRowIndex = i;
        break;
      }
    }

    let headers = [];
    let dataRows = [];

    if (headerRowIndex !== -1) {
      headers = rawRows[headerRowIndex].map(h => String(h || '').trim());
      dataRows = rawRows.slice(headerRowIndex + 1);
    } else {
      let startIdx = 0;
      for (let i = 0; i < Math.min(10, rawRows.length); i++) {
        const r = rawRows[i];
        if (Array.isArray(r) && r.filter(c => String(c || '').trim() !== '').length >= 2) {
          if (r.length < 2 || String(r[0]).toLowerCase().includes('university') || String(r[0]).toLowerCase().includes('institute')) {
            startIdx = i + 1;
          } else {
            startIdx = i;
          }
          break;
        }
      }
      dataRows = rawRows.slice(startIdx);
    }

    const coursesList = [];
    dataRows.forEach((row, idx) => {
      if (!Array.isArray(row) || row.every(c => String(c || '').trim() === '')) return;

      const r = {};
      if (headers.length > 0) {
        headers.forEach((h, hIdx) => {
          if (h) r[h] = row[hIdx] !== undefined ? String(row[hIdx]).trim() : '';
        });
      }

      const getVal = (...keys) => {
        for (const k of keys) {
          if (r[k] !== undefined && String(r[k]).trim() !== '') return String(r[k]).trim();
          const foundKey = Object.keys(r).find(existingKey => existingKey.toLowerCase() === k.toLowerCase());
          if (foundKey && r[foundKey] !== undefined && String(r[foundKey]).trim() !== '') {
            return String(r[foundKey]).trim();
          }
        }
        return '';
      };

      const shortName = getVal('Course Name', 'courseName', 'Course', 'Trade', 'Short Name', 'Name', 'Subject', 'पाठ्यक्रम');
      const fullName = getVal('Full Name of Course', 'Full Name', 'Course Full Name', 'Description', 'Long Name', 'Program Full Name');
      
      let courseName = '';
      if (shortName && fullName && shortName.toLowerCase() !== fullName.toLowerCase()) {
        courseName = `${shortName} - ${fullName}`;
      } else if (fullName) {
        courseName = fullName;
      } else if (shortName) {
        courseName = shortName;
      } else {
        const nonNumCells = row.filter(c => c && isNaN(Number(String(c).trim())));
        if (nonNumCells.length > 0) {
          courseName = String(nonNumCells[0]).trim();
        }
      }

      if (!courseName || courseName.length < 2) return;

      // Filter out repeated header/title rows
      if (courseName.toLowerCase().includes('maharishi dayanand') || 
          courseName.toLowerCase().includes('vocational training institute') || 
          courseName.toLowerCase().includes('s. no.') || 
          courseName.toLowerCase() === 'course name') {
        return;
      }

      let courseCode = getVal('Course Code', 'Code', 'courseCode', 'Trade Code', 'Subject Code', 'Code No');
      if (!courseCode) {
        if (row[1] && String(row[1]).trim().match(/^[A-Z0-9\-_]{2,12}$/i)) {
          courseCode = String(row[1]).trim().toUpperCase();
        } else {
          const pfx = shortName && shortName.length <= 6 ? shortName.toUpperCase() : 'VOC';
          courseCode = `${pfx}-${String(idx + 1).padStart(3, '0')}`;
        }
      }

      let duration = getVal('Duration', 'duration', 'Time', 'Period', 'Course Duration', 'Year / Sem', 'अवधि');
      if (!duration) {
        const durMatch = row.find(c => String(c).match(/\b(month|year|sem|day|yr|mo|वर्ष|माह)\b/i));
        if (durMatch) duration = String(durMatch).trim();
        else duration = '6 Months';
      }

      if (/^1\s*y/i.test(duration)) duration = '1 Year';
      else if (/^2\s*y/i.test(duration)) duration = '2 Years';
      else if (/^3\s*y/i.test(duration)) duration = '3 Years';
      else if (/^6\s*m/i.test(duration)) duration = '6 Months';
      else if (/^3\s*m/i.test(duration)) duration = '3 Months';
      else if (/^1\s*m/i.test(duration)) duration = '1 Month';

      let sector = getVal('Sector', 'sector', 'Category', 'Branch', 'Trade', 'Stream', 'विभाग');
      if (!sector || sector.toLowerCase() === 'general' || sector === '') {
        sector = detectCourseSector(courseName);
      }

      let fee = Number(getVal('Fee', 'Total Fee', 'Fees', 'courseFee', 'शुल्क')) || 0;
      if (!fee) {
        if (duration.includes('3 Year')) fee = 30000;
        else if (duration.includes('2 Year')) fee = 20000;
        else if (duration.includes('1 Year')) fee = 12000;
        else if (duration.includes('6 Month')) fee = 8000;
        else if (duration.includes('3 Month')) fee = 5000;
        else fee = 10000;
      }

      let eligibility = getVal('Eligibility', 'qualification', 'eligibility', 'योग्यता') || '10th Pass (High School)';
      let certification = getVal('Certification', 'certification', 'Certificate') || 'PKC Certified Skill Diploma';

      coursesList.push({
        id: 'voc-imp-' + Date.now() + '-' + idx + '-' + Math.floor(Math.random() * 1000),
        courseName,
        courseCode: courseCode.toUpperCase(),
        sector,
        duration,
        eligibility,
        fee,
        certification,
        mode: 'Regular',
        description: fullName && fullName !== courseName ? fullName : `Vocational certification course in ${courseName}.`,
        status: 'Active'
      });
    });

    return coursesList;
  };

  // Excel Upload Parser & Preview
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setExcelParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetNames = wb.SheetNames || [];
        setWorkbookObj(wb);
        setAvailableSheets(sheetNames);

        // Pre-calculate count for all sheets to find best match
        const counts = {};
        let bestSheet = sheetNames[0];
        let maxCourses = 0;

        sheetNames.forEach(name => {
          const parsed = parseCoursesFromWorksheet(wb.Sheets[name], name);
          counts[name] = parsed.length;
          const isVocKw = /voc|inst|course|trade|mdvti/i.test(name);
          if (isVocKw && parsed.length > 0) {
            bestSheet = name;
            maxCourses = parsed.length;
          } else if (parsed.length > maxCourses) {
            bestSheet = name;
            maxCourses = parsed.length;
          }
        });

        setSheetCourseCounts(counts);
        setSelectedSheetName(bestSheet);

        const coursesFromBest = parseCoursesFromWorksheet(wb.Sheets[bestSheet], bestSheet);
        setExcelParsedRows(coursesFromBest);
      } catch (err) {
        alert('Failed to parse Excel file: ' + err.message);
      } finally {
        setExcelParsing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Switch sheet inside workbook
  const handleSwitchSheet = (sheetName) => {
    setSelectedSheetName(sheetName);
    if (!workbookObj || !workbookObj.Sheets[sheetName]) return;
    const parsed = parseCoursesFromWorksheet(workbookObj.Sheets[sheetName], sheetName);
    setExcelParsedRows(parsed);
  };

  // Confirm Excel Bulk Import
  const handleConfirmExcelImport = async () => {
    if (excelParsedRows.length === 0) return;
    setLoading(true);

    const selectedInst = institutes.find(i => i.id === targetExcelInstituteId) || institutes[0];
    const coursesToUpload = excelParsedRows.map(c => ({
      ...c,
      instituteId: selectedInst.id,
      instituteName: selectedInst.name
    }));

    try {
      const res = await fetch('/api/vocational-courses/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses: coursesToUpload,
          mode: importMode,
          instituteId: selectedInst.id,
          instituteName: selectedInst.name
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `🎉 Imported ${excelParsedRows.length} courses!`);
        fetchCourses();
        setShowExcelModal(false);
        setExcelFile(null);
        setExcelParsedRows([]);
        setWorkbookObj(null);
        setAvailableSheets([]);
        setSelectedSheetName('');
        setSheetCourseCounts({});
        fireCelebration();
      } else {
        throw new Error(data.message || 'Import failed');
      }
    } catch {
      // Local fallback
      let merged;
      if (importMode === 'replace') {
        merged = coursesToUpload;
      } else {
        merged = [...coursesToUpload, ...courses];
      }
      setCourses(merged);
      try { localStorage.setItem('pkc_vocational_courses', JSON.stringify(merged)); } catch {}
      setShowExcelModal(false);
      setExcelFile(null);
      setExcelParsedRows([]);
      setWorkbookObj(null);
      setAvailableSheets([]);
      setSelectedSheetName('');
      setSheetCourseCounts({});
      showToast(`Imported ${coursesToUpload.length} courses!`);
    } finally {
      setLoading(false);
    }
  };

  // Close Excel Upload Modal & Reset
  const handleCloseExcelModal = () => {
    setShowExcelModal(false);
    setExcelFile(null);
    setExcelParsedRows([]);
    setWorkbookObj(null);
    setAvailableSheets([]);
    setSelectedSheetName('');
    setSheetCourseCounts({});
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Course Name': 'Electrician & Building Wireman',
        'Course Code': 'VOC-ELE-101',
        'Sector': 'Electrical & Electronics',
        'Duration': '1 Year',
        'Eligibility': '10th Pass',
        'Total Fee': 12000,
        'Certification': 'PKC Certified Skill Diploma',
        'Mode': 'Regular',
        'Description': 'Domestic wiring, industrial panel installation and motor winding'
      },
      {
        'Course Name': 'Nursery Teacher Training (NTT)',
        'Course Code': 'VOC-NTT-201',
        'Sector': 'Early Childhood & Teachers Training',
        'Duration': '1 Year',
        'Eligibility': '12th Pass',
        'Total Fee': 14000,
        'Certification': 'National Diploma in Nursery Teacher Training',
        'Mode': 'Regular',
        'Description': 'Child psychology, pedagogy, teaching aids, preschool management'
      },
      {
        'Course Name': 'Web Development & Full-Stack Coding',
        'Course Code': 'VOC-IT-102',
        'Sector': 'IT & Computer Software',
        'Duration': '6 Months',
        'Eligibility': '12th Pass',
        'Total Fee': 15000,
        'Certification': 'PKC Professional Tech Certification',
        'Mode': 'Regular / Hybrid',
        'Description': 'HTML, CSS, JavaScript, React, Node.js and full-stack project building'
      },
      {
        'Course Name': 'Beautician & Salon Management',
        'Course Code': 'VOC-BW-103',
        'Sector': 'Beauty & Wellness',
        'Duration': '6 Months',
        'Eligibility': '8th / 10th Pass',
        'Total Fee': 10000,
        'Certification': 'PKC Beauty Diploma',
        'Mode': 'Regular',
        'Description': 'Bridal makeup, hair styling, skin treatments, facials and salon management'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vocational_Courses');
    XLSX.writeFile(wb, 'PKC_Vocational_Course_Import_Template.xlsx');
    showToast('📥 Sample Excel template downloaded!');
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      // Institute filter
      if (selectedInstituteFilter !== 'all') {
        const cInstId = c.instituteId || (c.instituteName?.toLowerCase().includes('teacher') || c.instituteName?.includes('टीचर्स') ? 'inst-mdette' : 'inst-mdvti');
        if (cInstId !== selectedInstituteFilter) return false;
      }
      // Sector / Course filter
      if (selectedSector !== 'all') {
        const sel = selectedSector.toLowerCase();
        const matchSector = (c.sector || '').toLowerCase() === sel;
        const matchName = (c.courseName || '').toLowerCase() === sel;
        if (!matchSector && !matchName) return false;
      }
      // Duration filter
      if (selectedDuration !== 'all' && c.duration !== selectedDuration) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.courseName || '').toLowerCase().includes(q);
        const matchesCode = (c.courseCode || '').toLowerCase().includes(q);
        const matchesSector = (c.sector || '').toLowerCase().includes(q);
        const matchesCert = (c.certification || '').toLowerCase().includes(q);
        const matchesInst = (c.instituteName || '').toLowerCase().includes(q);
        return matchesName || matchesCode || matchesSector || matchesCert || matchesInst;
      }
      return true;
    });
  }, [courses, selectedInstituteFilter, selectedSector, selectedDuration, searchQuery]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return vocationalStudents.filter(s => {
      if (selectedInstituteFilter !== 'all') {
        const sInstId = s.instituteId || (s.universityName?.toLowerCase().includes('teacher') || s.universityName?.includes('टीचर्स') ? 'inst-mdette' : 'inst-mdvti');
        if (sInstId !== selectedInstituteFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (s.studentName || s.fullName || '').toLowerCase().includes(q) ||
          (s.fatherName || '').toLowerCase().includes(q) ||
          (s.rollNo || '').toLowerCase().includes(q) ||
          (s.aadhaarNo || '').includes(q) ||
          (s.abcId || '').includes(q) ||
          (s.courseName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vocationalStudents, selectedInstituteFilter, searchQuery]);

  // Dynamic sector & course list extracted purely from actual courses entered by user
  const actualSectors = useMemo(() => {
    const list = new Set();
    courses.forEach(c => {
      if (c.sector && c.sector.trim()) list.add(c.sector.trim());
      if (c.courseName && c.courseName.trim()) list.add(c.courseName.trim());
    });
    return Array.from(list);
  }, [courses]);

  return (
    <div className="w-full space-y-6 animate-fadeIn text-slate-900 pb-16">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-fadeIn font-bold text-sm ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-900 border-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP HERO HEADER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Skill Development & Vocational Master Hub</span>
              </span>
              <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                Affiliated with PKC Institute
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold">
                Central Students: {totalCentralStudents}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-amber-400 shrink-0" />
              <span>Vocational Courses & Institutes Desk</span>
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* 1. ENROLL VOCATIONAL STUDENT BUTTON */}
            <button
              type="button"
              onClick={() => handleOpenEnrollStudent()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xl border-2 border-emerald-300 hover:scale-105 transition-all cursor-pointer ring-4 ring-emerald-500/20"
              title="Add / Enroll Vocational Student"
            >
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>+ Enroll Vocational Student</span>
            </button>

            {/* 2. ADD INSTITUTE BUTTON */}
            <button
              type="button"
              onClick={handleOpenAddInstitute}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/50 px-3.5 py-2.5 rounded-2xl text-xs font-black shadow-md hover:scale-105 transition-all cursor-pointer"
              title="Add New Institute"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>+ Add Institute</span>
            </button>

            {/* 3. ADD COURSE BUTTON */}
            <button
              type="button"
              onClick={() => handleOpenAddCourse()}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2.5 rounded-2xl text-xs shadow-md hover:scale-105 transition-all cursor-pointer"
              title="Add Course Manually"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Course</span>
            </button>

            {/* 4. UPLOAD EXCEL BUTTON */}
            <button
              type="button"
              onClick={() => {
                setExcelFile(null);
                setExcelParsedRows([]);
                setShowExcelModal(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs shadow-md hover:scale-105 transition-all cursor-pointer border border-indigo-400/30"
              title="Upload courses via Excel sheet"
            >
              <Upload className="w-4 h-4 text-amber-300" />
              <span>Upload Excel</span>
            </button>
          </div>
        </div>

        {/* THREE PRIMARY VIEW TABS: INSTITUTES | COURSES | ENROLLED STUDENTS */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: View Institutes */}
            <button
              type="button"
              onClick={() => setActiveMainTab('institutes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeMainTab === 'institutes'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>🏛️ View Institutes ({institutes.length})</span>
            </button>

            {/* Tab 2: View Courses */}
            <button
              type="button"
              onClick={() => setActiveMainTab('courses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeMainTab === 'courses'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-105 ring-2 ring-amber-300'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>📚 View Courses ({courses.length})</span>
            </button>

            {/* Tab 3: View Enrolled Students */}
            <button
              type="button"
              onClick={() => setActiveMainTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                activeMainTab === 'students'
                  ? 'bg-emerald-400 text-slate-950 shadow-lg scale-105 ring-2 ring-emerald-300'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>🎓 Enrolled Students ({vocationalStudents.length})</span>
            </button>
          </div>

          {/* Quick link to Central 718+ Directory */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToRecords) onNavigateToRecords();
            }}
            className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
            title="Jump to Master Student Records"
          >
            <span>Master Directory ({totalCentralStudents} Students)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Institutes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-200">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vocational Institutes</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{institutes.length} Centers</h3>
            <span className="text-[10px] text-amber-600 font-bold">PKC Institute Linked</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0 border border-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vocational Programs</span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{courses.length} Trades</h3>
            <span className="text-[10px] text-indigo-600 font-bold">{actualSectors.length} Sectors Active</span>
          </div>
        </div>

        {/* Total Vocational Enrolled */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0 border border-emerald-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Vocational Students</span>
            <h3 className="text-xl font-black text-emerald-700 mt-0.5">{vocationalStudents.length} Enrolled</h3>
            <span className="text-[10px] text-emerald-600 font-bold">Live in Central DB</span>
          </div>
        </div>

        {/* Central Student Directory Total */}
        <div 
          onClick={() => { if (onNavigateToRecords) onNavigateToRecords(); }}
          className="bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 rounded-3xl p-5 border border-indigo-200 shadow-sm flex items-center gap-4 cursor-pointer transition-all group"
          title="Click to view Master Student Records"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <span>Central Student DB</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">{totalCentralStudents} Total</h3>
            <span className="text-[10px] text-indigo-600 font-bold">Increases on Enroll</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeMainTab === 'institutes'
                  ? 'Search institute by name, code (e.g. MDVTI, MDETTE)...'
                  : activeMainTab === 'students'
                  ? 'Search student by name, roll no, father name, Aadhaar, ABC ID...'
                  : 'Search course by name, code (e.g. VOC-ELE-101), sector, trade...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Institute Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedInstituteFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedInstituteFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Institutes ({institutes.length})
            </button>
            {institutes.map(inst => (
              <button
                key={inst.id}
                type="button"
                onClick={() => setSelectedInstituteFilter(inst.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate max-w-[200px] ${
                  selectedInstituteFilter === inst.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={inst.name}
              >
                {inst.shortName || inst.name.slice(0, 15)}
              </button>
            ))}
          </div>

          {/* View toggle (Grid / Table for courses) */}
          {activeMainTab === 'courses' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Additional Filters for Courses view */}
        {activeMainTab === 'courses' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400">Filters:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="all">
                {actualSectors.length > 0 ? 'All Industry Sectors / Courses' : 'All Industry Sectors'}
              </option>
              {actualSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>

            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
            >
              <option value="all">All Durations</option>
              {DURATION_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {(selectedSector !== 'all' || selectedDuration !== 'all' || selectedInstituteFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSector('all');
                  setSelectedDuration('all');
                  setSelectedInstituteFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: VIEW INSTITUTES (INSTITUTES DESK) */}
      {/* ========================================================================= */}
      {activeMainTab === 'institutes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Configured Vocational & Teacher Training Institutes (
              <strong className="text-slate-900 font-bold">{institutes.length}</strong>)
            </span>
            <button
              type="button"
              onClick={handleOpenAddInstitute}
              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-bold text-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Institute</span>
            </button>
          </div>

          {/* Big Cards for each Institute */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {institutes.map((inst, index) => {
              const instCourses = courses.filter(c => c.instituteId === inst.id || (!c.instituteId && index === 0));
              const instStudents = vocationalStudents.filter(s => s.instituteId === inst.id || s.universityName?.includes(inst.shortName));
              const isTeachers = inst.name.toLowerCase().includes('teacher') || inst.name.includes('टीचर्स') || inst.type.toLowerCase().includes('teacher');

              return (
                <div
                  key={inst.id}
                  className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    {/* Header: Badge & Code */}
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isTeachers
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {isTeachers ? '👩‍🏫 Teachers Training & Education' : '🛠️ Vocational & Technical Trades'}
                      </span>
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                        {inst.code || inst.shortName}
                      </span>
                    </div>

                    {/* Institute Name */}
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-tight">
                        {inst.name}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {inst.description || 'Affiliated center providing government-recognized skill diplomas and professional certifications.'}
                      </p>
                    </div>

                    {/* Associated Study Center Box (PKC Institute by default, editable!) */}
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0">
                          <School className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                            Affiliated Study Center / College
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {inst.parentCenter || 'PKC Institute'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditInstitute(inst)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Edit Study Center"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-indigo-50/60 rounded-2xl p-3 border border-indigo-100 flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Active Courses</span>
                          <span className="text-base font-black text-slate-900">{instCourses.length} Programs</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100 flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Enrolled Students</span>
                          <span className="text-base font-black text-emerald-700">{instStudents.length} Students</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this Institute */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Upload Excel specifically for this Institute */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetExcelInstituteId(inst.id);
                          setExcelFile(null);
                          setExcelParsedRows([]);
                          setShowExcelModal(true);
                        }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
                        title="Upload courses for this institute"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-300" />
                        <span>Upload Excel Courses</span>
                      </button>

                      {/* 2. Add Course for this institute */}
                      <button
                        type="button"
                        onClick={() => handleOpenAddCourse(inst)}
                        className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                        title="Add course to this institute"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Course</span>
                      </button>

                      {/* 3. Enroll Student for this institute */}
                      <button
                        type="button"
                        onClick={() => handleOpenEnrollStudent(inst.id)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-3 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                        title="Enroll student in this institute"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Enroll Student</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditInstitute(inst)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Institute Details"
                      >
                        <Edit3 className="w-4 h-4" />
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
      {/* SECTION 2: VIEW COURSES (COURSES DESK) */}
      {/* ========================================================================= */}
      {activeMainTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-slate-900 font-bold">{filteredCourses.length}</strong> of {courses.length} vocational courses
              </span>
              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllCourses}
                  className="text-[11px] text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1"
                  title="Clear all vocational courses"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Courses</span>
                </button>
              )}
            </div>
            <span className="text-slate-400">
              {selectedInstituteFilter !== 'all' 
                ? `Filtered by ${institutes.find(i => i.id === selectedInstituteFilter)?.shortName || 'Selected Institute'}`
                : 'All Institutes Displayed'}
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-slate-200 shadow-sm space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center border border-amber-200 shadow-inner">
                <BookOpen className="w-10 h-10" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  {courses.length === 0 ? 'No Vocational Courses Added Yet' : 'No courses match your search or filter'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {courses.length === 0
                    ? 'All demo courses have been removed. You can now upload your custom Excel file (.xlsx) or click "+ Add Course Manually" to create your vocational courses.'
                    : 'Try adjusting your search or sector filters, or click below to add a new course or upload an Excel sheet.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setExcelFile(null);
                    setExcelParsedRows([]);
                    setShowExcelModal(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs cursor-pointer shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>Upload Excel Sheet (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddCourse()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs cursor-pointer shadow-lg shadow-amber-400/20 hover:scale-105 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Course Manually</span>
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW OF COURSES */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredCourses.map((c) => {
                const instName = c.instituteName || 'Maharishi Dayanand Vocational Training Institute (MDVTI)';
                const isMDETTE = instName.toLowerCase().includes('teacher') || instName.includes('टीचर्स') || c.instituteId === 'inst-mdette';
                
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Institute Tag & Code */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border truncate max-w-[220px] ${
                          isMDETTE
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`} title={instName}>
                          🏢 {isMDETTE ? 'MD Early Teachers Training' : 'MD Vocational Training'}
                        </span>
                        <span className="font-mono text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {c.courseCode}
                        </span>
                      </div>

                      {/* Course Title */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors leading-snug">
                          {c.courseName}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {c.description || 'Comprehensive curriculum with practical skill-based training.'}
                        </p>
                      </div>

                      {/* Chips: Sector, Duration, Eligibility */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          🏷️ {c.sector}
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{c.duration}</span>
                        </span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          🎓 {c.eligibility}
                        </span>
                      </div>
                    </div>

                    {/* Footer: Fee & Action Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Total Course Fee</span>
                        <span className="text-base font-black text-emerald-700">
                          ₹{Number(c.fee || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Enroll Student Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEnrollStudent(c.instituteId, c)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-xl text-[11px] shadow-sm transition-all cursor-pointer"
                          title="Enroll student in this course"
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>Enroll</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(c)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(c.id, c.courseName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW OF COURSES */
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Name / Trade</th>
                      <th className="p-3">Institute</th>
                      <th className="p-3">Sector</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Eligibility</th>
                      <th className="p-3">Course Fee</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/40 rounded">
                          {c.courseCode}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {c.courseName}
                          <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs">{c.certification}</span>
                        </td>
                        <td className="p-3 text-slate-700 text-[11px]">
                          {c.instituteName?.toLowerCase().includes('teacher') || c.instituteName?.includes('टीचर्स') ? 'MD Early Teachers Training' : 'MD Vocational Training'}
                        </td>
                        <td className="p-3 text-slate-600">{c.sector}</td>
                        <td className="p-3 text-slate-700 font-semibold">{c.duration}</td>
                        <td className="p-3 text-slate-500">{c.eligibility}</td>
                        <td className="p-3 font-black text-emerald-700">₹{Number(c.fee || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEnrollStudent(c.instituteId, c)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[10px] hover:bg-emerald-700"
                            >
                              Enroll
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditCourse(c)}
                              className="p-1 text-slate-500 hover:text-indigo-600"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(c.id, c.courseName)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: VIEW ENROLLED VOCATIONAL STUDENTS */}
      {/* ========================================================================= */}
      {activeMainTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1">
            <div>
              <span>
                Vocational Students: <strong className="text-slate-900 font-bold">{filteredStudents.length}</strong> | Total Central Students in Database: <strong className="text-indigo-700 font-bold">{totalCentralStudents}</strong>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every vocational student added here is also automatically visible in <strong>Master Student Records</strong> & <strong>Enroll New Student Directory</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEnrollStudent()}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Enroll New Vocational Student</span>
              </button>

              <button
                type="button"
                onClick={() => { if (onNavigateToRecords) onNavigateToRecords(); }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md cursor-pointer"
              >
                <span>View in 718+ Records Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 mx-auto flex items-center justify-center">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No vocational students enrolled yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Click the button below to enroll your first student under Maharishi Dayanand Vocational Training Institute or Teachers Training (PKC Institute).
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenEnrollStudent()}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
              >
                + Enroll First Vocational Student
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Roll / Reg No</th>
                      <th className="p-3">Enrollment No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Father's Name</th>
                      <th className="p-3">Aadhaar Card</th>
                      <th className="p-3">ABC ID</th>
                      <th className="p-3">Institute / Center</th>
                      <th className="p-3">Course / Trade</th>
                      <th className="p-3">Fee Details</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st) => (
                      <tr key={st.id || st.rollNo} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/40 rounded">
                          {st.rollNo || st.registrationNo}
                        </td>
                        <td className="p-3 font-mono">
                          {st.enrollmentNo ? (
                            <div className="flex items-center gap-1.5 group">
                              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {st.enrollmentNo}
                              </span>
                              <button
                                type="button"
                                title="Edit Enrollment Number"
                                onClick={() => handleOpenEditEnrollmentNo(st)}
                                className="text-slate-400 hover:text-indigo-600 p-0.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenEditEnrollmentNo(st)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition-all cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3 h-3" /> Set Enr No
                            </button>
                          )}
                        </td>
                        <td className="p-3 font-black text-slate-900">
                          {st.fullName || st.studentName}
                          <span className="block text-[10px] text-slate-400 font-normal">{st.phone || st.contact}</span>
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">{st.fatherName || '-'}</td>
                        <td className="p-3 font-mono text-slate-800 font-bold">{st.aadhaarNo || '-'}</td>
                        <td className="p-3 font-mono text-indigo-700">{st.abcId || '-'}</td>
                        <td className="p-3 text-slate-700 text-[11px]">
                          <span className="font-bold block truncate max-w-[180px]">
                            {st.universityName?.toLowerCase().includes('teacher') || st.universityName?.includes('टीचर्स') ? 'MD Early Teachers Training' : 'MD Vocational Training'}
                          </span>
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                            {st.collegeName || 'PKC Institute'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{st.courseName}</span>
                          <span className="text-[10px] text-slate-500">{st.branch}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-black text-slate-900 block">₹{Number(st.totalFee || 0).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Paid: ₹{Number(st.totalPaid || 0).toLocaleString('en-IN')}
                          </span>
                          {st.balanceDue > 0 && (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              Due: ₹{Number(st.balanceDue || 0).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            {st.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ENROLL VOCATIONAL STUDENT (MANUAL STUDENT REGISTRATION) */}
      {/* ========================================================================= */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 space-y-5 my-auto shadow-2xl border-2 border-emerald-400">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Enroll Vocational Student
                  </h3>
                  <p className="text-xs text-slate-500">
                    Central student count will increase from {totalCentralStudents} to {totalCentralStudents + 1}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              {/* Row 1: Student Name & Father's Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.studentName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, studentName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar Patel"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.fatherName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, fatherName: e.target.value })}
                    placeholder="e.g. Shri Mohan Lal Patel"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Row 2: Mother's Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={enrollForm.motherName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, motherName: e.target.value })}
                    placeholder="e.g. Smt. Shanti Devi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile / Contact Number
                  </label>
                  <input
                    type="tel"
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Row 3: Aadhaar Card & ABC ID (Requested specifically by user) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <div>
                  <label className="font-black text-amber-900 block mb-1">
                    Aadhaar Card Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.aadhaarNo}
                    onChange={(e) => setEnrollForm({ ...enrollForm, aadhaarNo: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="12 digit Aadhaar number"
                    maxLength={12}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Required for KYC & certification verification</span>
                </div>

                <div>
                  <label className="font-black text-amber-900 block mb-1">
                    ABC ID (Academic Bank of Credits)
                  </label>
                  <input
                    type="text"
                    value={enrollForm.abcId}
                    onChange={(e) => setEnrollForm({ ...enrollForm, abcId: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="12 digit ABC ID (if available)"
                    maxLength={12}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Academic Bank of Credits identification</span>
                </div>
              </div>

              {/* Row: Enrollment Number (Optional - Leave blank to assign later) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Enrollment Number</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                      Optional
                    </span>
                  </label>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Default: Blank (Admin can set later)
                  </span>
                </div>
                <input
                  type="text"
                  value={enrollForm.enrollmentNo || ''}
                  onChange={(e) => setEnrollForm({ ...enrollForm, enrollmentNo: e.target.value.toUpperCase() })}
                  placeholder="Leave blank to assign later (by default empty)"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:font-normal placeholder:text-slate-400"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  By default left blank. Admin can fill it now or assign / update it later from the Enrolled Students list.
                </span>
              </div>

              {/* Row 4: Institute & Associated PKC Study Center Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Institute *
                  </label>
                  <select
                    value={enrollForm.instituteId}
                    onChange={(e) => handleEnrollInstituteChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {institutes.map(inst => (
                      <option key={inst.id} value={inst.id}>
                        {inst.shortName}: {inst.name.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Affiliated Study Center *
                  </label>
                  <input
                    type="text"
                    value={enrollForm.parentCenter}
                    onChange={(e) => setEnrollForm({ ...enrollForm, parentCenter: e.target.value })}
                    placeholder="PKC Institute"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-filled with PKC Institute (editable)</span>
                </div>
              </div>

              {/* Row 5: Vocational Course Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Vocational Course / Trade *
                  </label>
                  <select
                    value={enrollForm.courseId}
                    onChange={(e) => handleEnrollCourseChange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {courses
                      .filter(c => !c.instituteId || c.instituteId === enrollForm.instituteId)
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.courseName} ({c.duration} - ₹{c.fee})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Session & Admission Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={enrollForm.admissionSession}
                      onChange={(e) => setEnrollForm({ ...enrollForm, admissionSession: e.target.value })}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2026-2027">2026-2027</option>
                    </select>
                    <input
                      type="date"
                      value={enrollForm.admissionDate}
                      onChange={(e) => setEnrollForm({ ...enrollForm, admissionDate: e.target.value })}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Fee Details & Payment */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Total Course Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={enrollForm.totalFee}
                    onChange={(e) => setEnrollForm({ ...enrollForm, totalFee: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">
                    Fee Paid at Admission (₹)
                  </label>
                  <input
                    type="number"
                    value={enrollForm.initialPaid}
                    onChange={(e) => setEnrollForm({ ...enrollForm, initialPaid: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-black text-emerald-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={enrollForm.paymentMode}
                    onChange={(e) => setEnrollForm({ ...enrollForm, paymentMode: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI / Online">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Address / Location */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Address / City
                </label>
                <input
                  type="text"
                  value={enrollForm.address}
                  onChange={(e) => setEnrollForm({ ...enrollForm, address: e.target.value })}
                  placeholder="e.g. Civil Lines, Damoh / Bhopal (M.P)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {enrollSubmitting ? (
                    <span>Enrolling Student...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Enroll Student (+1 to {totalCentralStudents})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENROLLMENT SUCCESS POPUP */}
      {/* ========================================================================= */}
      {enrollSuccessData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs p-4 flex justify-center items-center animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border-4 border-emerald-400 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-black">
              <Sparkles className="w-8 h-8 text-emerald-600 animate-bounce" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Enrollment Successful • Central DB Synced
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                🎉 Student Enrolled Successfully!
              </h3>
              <p className="text-xs text-slate-600">
                Total Enrolled Students count updated to <strong className="text-emerald-700 text-sm font-black">{enrollSuccessData.totalStudents}</strong>!
              </p>
            </div>

            {/* Student ID Card snippet */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-400 font-bold">Assigned Roll No:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{enrollSuccessData.student.rollNo}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-slate-400 font-bold">Enrollment No:</span>
                <span className="font-mono font-bold text-slate-800">
                  {enrollSuccessData.student.enrollmentNo ? (
                    <span className="text-emerald-700 font-black">{enrollSuccessData.student.enrollmentNo}</span>
                  ) : (
                    <span className="text-slate-400 italic font-normal text-[11px]">Not assigned (Can be set later)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Student Name:</span>
                <span className="font-black text-slate-900">{enrollSuccessData.student.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Father's Name:</span>
                <span className="font-bold text-slate-700">{enrollSuccessData.student.fatherName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Aadhaar Card:</span>
                <span className="font-mono font-bold text-slate-800">{enrollSuccessData.student.aadhaarNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">ABC ID:</span>
                <span className="font-mono font-bold text-indigo-700">{enrollSuccessData.student.abcId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Course / Trade:</span>
                <span className="font-bold text-slate-900">{enrollSuccessData.student.courseName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Institute:</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]">{enrollSuccessData.student.universityName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold">Center:</span>
                <span className="font-bold text-amber-700">{enrollSuccessData.student.collegeName || 'PKC Institute'}</span>
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEnrollSuccessData(null);
                  if (onNavigateToRecords) onNavigateToRecords();
                }}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>📋 View in Master Student Directory ({enrollSuccessData.totalStudents})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEnrollSuccessData(null);
                  handleOpenEnrollStudent();
                }}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Enroll Another</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setEnrollSuccessData(null)}
              className="text-xs text-slate-400 hover:text-slate-600 block mx-auto underline cursor-pointer"
            >
              Close this window
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT VOCATIONAL INSTITUTE */}
      {/* ========================================================================= */}
      {showInstituteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 space-y-4 my-auto shadow-2xl border-2 border-amber-400">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    {editingInstitute ? 'Edit Institute Details' : 'Add New Vocational Institute'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure institute details and affiliated study center (PKC Institute)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstituteModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fast 1-Click Presets for the 2 user-requested Institutes */}
            {!editingInstitute && (
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-black text-amber-900 block uppercase tracking-wider">
                  ⚡ 1-Click Fast Presets:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyInstitutePreset(1)}
                    className="p-2 text-left bg-white hover:bg-amber-100 rounded-xl border border-amber-300 transition-colors text-[11px] font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>🛠️ Maharishi Dayanand Vocational Training (MDVTI)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => applyInstitutePreset(2)}
                    className="p-2 text-left bg-white hover:bg-amber-100 rounded-xl border border-amber-300 transition-colors text-[11px] font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>👩‍🏫 Maharishi Dayanand Early Teachers Training (MDETTE)</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveInstitute} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Institute Name *
                </label>
                <input
                  type="text"
                  required
                  value={instituteFormData.name}
                  onChange={(e) => setInstituteFormData({ ...instituteFormData, name: e.target.value })}
                  placeholder="e.g. Maharishi Dayanand Vocational Training Institute"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Institute Code / Short Code
                  </label>
                  <input
                    type="text"
                    value={instituteFormData.code}
                    onChange={(e) => setInstituteFormData({ ...instituteFormData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MDVTI or MDETTE"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* PKC Institute selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Affiliated Study Center *
                  </label>
                  <input
                    type="text"
                    required
                    value={instituteFormData.parentCenter}
                    onChange={(e) => setInstituteFormData({ ...instituteFormData, parentCenter: e.target.value })}
                    placeholder="PKC Institute"
                    className="w-full p-2.5 bg-amber-50/70 border border-amber-300 rounded-xl font-black text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category / Type</label>
                  <select
                    value={instituteFormData.type}
                    onChange={(e) => setInstituteFormData({ ...instituteFormData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  >
                    <option value="Vocational Training Institute">Vocational Training Institute</option>
                    <option value="Early Teachers Training & Education">Early Teachers Training & Education</option>
                    <option value="Skill Development Center">Skill Development Center</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={instituteFormData.contact}
                    onChange={(e) => setInstituteFormData({ ...instituteFormData, contact: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Location</label>
                <input
                  type="text"
                  value={instituteFormData.address}
                  onChange={(e) => setInstituteFormData({ ...instituteFormData, address: e.target.value })}
                  placeholder="e.g. Bhopal / Damoh (M.P)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInstituteModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingInstitute ? 'Update Institute' : 'Save Institute'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXCEL UPLOAD MODAL WITH INSTITUTE SELECTION */}
      {/* ========================================================================= */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 space-y-5 my-auto shadow-2xl border-2 border-indigo-400">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Upload Vocational Courses Excel Sheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload course spreadsheet and select the destination institute
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseExcelModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Institute Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="font-black text-xs text-slate-800 block">
                Select Destination Institute for this Excel *
              </label>
              <select
                value={targetExcelInstituteId}
                onChange={(e) => setTargetExcelInstituteId(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-indigo-300 rounded-xl font-bold text-xs text-indigo-950 focus:outline-none"
              >
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.parentCenter || 'PKC Institute'})
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/40 hover:bg-indigo-50/70 transition-colors cursor-pointer space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <p className="font-bold text-xs text-slate-800">
                {excelFile ? `Selected: ${excelFile.name}` : 'Click to select Excel Sheet (.xlsx, .xls, .csv)'}
              </p>
              <p className="text-[11px] text-slate-400">
                Auto-detects Course Name, Code, Sector, Duration, Eligibility, Fee, Certification, Mode
              </p>
            </div>

            {/* Multi-Sheet Selector if Workbook contains multiple sheets */}
            {availableSheets.length > 1 && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3.5 rounded-2xl border-2 border-indigo-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-indigo-950 flex items-center gap-1.5">
                      <span>Select Worksheet to Import:</span>
                      <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
                        {availableSheets.length} sheets
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Switch sheet to choose which courses to import
                    </p>
                  </div>
                </div>
                <select
                  value={selectedSheetName}
                  onChange={(e) => handleSwitchSheet(e.target.value)}
                  className="w-full sm:w-auto p-2.5 bg-white border-2 border-indigo-400 rounded-xl font-black text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                >
                  {availableSheets.map(sName => (
                    <option key={sName} value={sName}>
                      📄 {sName} ({sheetCourseCounts[sName] !== undefined ? `${sheetCourseCounts[sName]} courses` : 'detecting...'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* No courses detected alert */}
            {excelFile && excelParsedRows.length === 0 && !excelParsing && (
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center text-xs text-amber-900 space-y-1">
                <p className="font-black">⚠️ No vocational courses detected in sheet "{selectedSheetName}".</p>
                <p className="text-[11px] text-amber-700">
                  {availableSheets.length > 1 ? 'Please select another worksheet from the dropdown above.' : 'Please ensure your file has valid course rows.'}
                </p>
              </div>
            )}

            {/* Live Preview of parsed rows */}
            {excelParsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Preview: <strong className="text-emerald-700">{excelParsedRows.length} courses detected</strong>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="flex items-center gap-1 font-bold text-slate-600">
                      <input
                        type="radio"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                      />
                      <span>Append (Keep existing)</span>
                    </label>
                    <label className="flex items-center gap-1 font-bold text-slate-600">
                      <input
                        type="radio"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                      />
                      <span>Replace All</span>
                    </label>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Course Name</th>
                        <th className="p-2">Code</th>
                        <th className="p-2">Sector</th>
                        <th className="p-2">Duration</th>
                        <th className="p-2">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {excelParsedRows.slice(0, 15).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-mono text-slate-400">{i + 1}</td>
                          <td className="p-2 font-bold text-slate-900">{r.courseName}</td>
                          <td className="p-2 font-mono text-indigo-700">{r.courseCode}</td>
                          <td className="p-2 text-slate-600">{r.sector}</td>
                          <td className="p-2 text-slate-700">{r.duration}</td>
                          <td className="p-2 font-black text-emerald-700">₹{r.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {excelParsedRows.length > 15 && (
                  <p className="text-[10px] text-slate-400 text-center">
                    ...and {excelParsedRows.length - 15} more rows
                  </p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCloseExcelModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={excelParsedRows.length === 0 || loading}
                  onClick={handleConfirmExcelImport}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Import {excelParsedRows.length} Courses Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT VOCATIONAL COURSE MANUALLY */}
      {/* ========================================================================= */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex justify-center items-start animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-7 space-y-4 my-auto shadow-2xl border-2 border-amber-400">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    {editingCourse ? 'Edit Vocational Course' : 'Create New Vocational Course'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Course fee, duration, eligibility & trade details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-3.5 text-xs">
              {/* Institute Selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Institute *
                </label>
                <select
                  value={courseFormData.instituteId}
                  onChange={(e) => {
                    const inst = institutes.find(i => i.id === e.target.value);
                    setCourseFormData({
                      ...courseFormData,
                      instituteId: e.target.value,
                      instituteName: inst?.name || courseFormData.instituteName
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none"
                >
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {inst.shortName}: {inst.name.slice(0, 45)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Course / Trade Name *
                </label>
                <input
                  type="text"
                  required
                  value={courseFormData.courseName}
                  onChange={(e) => setCourseFormData({ ...courseFormData, courseName: e.target.value })}
                  placeholder="e.g. Electrician & Building Wireman"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Code & Sector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trade Code</label>
                  <input
                    type="text"
                    value={courseFormData.courseCode}
                    onChange={(e) => setCourseFormData({ ...courseFormData, courseCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. VOC-ELE-101"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Industry Sector / Category</label>
                  <input
                    type="text"
                    value={courseFormData.sector}
                    onChange={(e) => setCourseFormData({ ...courseFormData, sector: e.target.value })}
                    placeholder="e.g. Electrical, Computer, Teaching..."
                    list="course-sectors-datalist"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <datalist id="course-sectors-datalist">
                    {actualSectors.map(item => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Duration & Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration</label>
                  <select
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  >
                    {DURATION_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Fee (₹)</label>
                  <input
                    type="number"
                    value={courseFormData.fee}
                    onChange={(e) => setCourseFormData({ ...courseFormData, fee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Eligibility & Certification */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Eligibility</label>
                  <select
                    value={courseFormData.eligibility}
                    onChange={(e) => setCourseFormData({ ...courseFormData, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  >
                    {ELIGIBILITY_OPTIONS.map(el => (
                      <option key={el} value={el}>{el}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Certification Body</label>
                  <input
                    type="text"
                    value={courseFormData.certification}
                    onChange={(e) => setCourseFormData({ ...courseFormData, certification: e.target.value })}
                    placeholder="PKC Certified Skill Diploma"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Description & Syllabus Highlights</label>
                <textarea
                  rows={3}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Key topics, practical modules, equipment used, industry placement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCourse ? 'Update Course' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SET / EDIT ENROLLMENT NUMBER (ADMIN ASSIGNMENT) */}
      {/* ========================================================================= */}
      {editingEnrollmentStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs p-4 flex justify-center items-center animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border-2 border-indigo-500">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm">
                  #
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingEnrollmentStudent.enrollmentNo ? 'Edit Enrollment Number' : 'Assign Enrollment Number'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {editingEnrollmentStudent.fullName || editingEnrollmentStudent.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEnrollmentStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Roll / Reg No:</span>
                <span className="font-mono font-bold text-indigo-700">{editingEnrollmentStudent.rollNo || editingEnrollmentStudent.registrationNo || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Course / Trade:</span>
                <span className="font-semibold text-slate-800">{editingEnrollmentStudent.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Institute:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[200px]">{editingEnrollmentStudent.universityName}</span>
              </div>
            </div>

            <form onSubmit={handleSaveEnrollmentNo} className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  value={tempEnrollmentNo}
                  onChange={(e) => setTempEnrollmentNo(e.target.value.toUpperCase())}
                  placeholder="e.g. ENR-2024-001 or MDVTI-ENR-01"
                  autoFocus
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Enter official institute enrollment number or leave blank to clear.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingEnrollmentStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEnrollmentNo}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {savingEnrollmentNo ? 'Saving...' : 'Save Enrollment Number'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
