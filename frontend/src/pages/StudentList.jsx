import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Eye, Printer, CreditCard, Award, 
  FileText, CheckCircle, AlertCircle, X, Download, ExternalLink, Trash2, Calendar,
  ArrowLeft, RotateCcw, ChevronDown, Edit3, Zap, Save, CheckCircle2, UploadCloud,
  PlusCircle, BookOpen, School, GraduationCap, Camera, UserX, Ban, AlertTriangle,
  Sparkles
} from 'lucide-react';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';
import PrintMarksheet from '../components/PrintMarksheet';
import PrintFeeReceipt from '../components/PrintFeeReceipt';
import PrintFeeCard from '../components/PrintFeeCard';
import BulkImportModal from '../components/BulkImportModal';
import ImageCropperModal from '../components/ImageCropperModal';
import { useLanguage } from '../context/LanguageContext';

export default function StudentList({ 
  courses, 
  setActiveTab, 
  onSelectStudentForFee, 
  onOpenNewAdmission, 
  lang: propLang, 
  toggleLang: propToggleLang,
  hideHeader = false,
  dueFilter = 'all',
  onFeeReceived
}) {
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

  // New Filters matching user screenshots
  const [filterSession, setFilterSession] = useState('all');
  const [filterSatra, setFilterSatra] = useState('all');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [filterCollege, setFilterCollege] = useState('all');
  const [appliedSession, setAppliedSession] = useState('all');
  const [appliedSatra, setAppliedSatra] = useState('all');
  const [appliedUniversity, setAppliedUniversity] = useState('all');
  const [appliedCollege, setAppliedCollege] = useState('all');

  // Entries / Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Student lookup key helper by RollNo, ID, or EnrollmentNo
  const getStudentKey = (s) => {
    if (!s) return '';
    if (s.rollNo && String(s.rollNo).trim()) return String(s.rollNo).trim();
    if (s.id && String(s.id).trim()) return String(s.id).trim();
    if (s.enrollmentNo && String(s.enrollmentNo).trim()) return String(s.enrollmentNo).trim();
    if (s.registrationNo && String(s.registrationNo).trim()) return String(s.registrationNo).trim();
    return '';
  };

  // Table Column Display Mode: 'all' (39+ fields horizontal scroll) or 'compact'
  const [tableColumnMode, setTableColumnMode] = useState('all');

  // Unified "Paid Student Fee" & Fee Desk Modal State (Matching User Ref Images)
  const [feeDeskStudent, setFeeDeskStudent] = useState(null);
  const [feeDeskMode, setFeeDeskMode] = useState('receive'); // 'receive' | 'set_fee' | 'set_scholarship'
  const [feeDeskPayments, setFeeDeskPayments] = useState([]);
  const [feeDeskClass, setFeeDeskClass] = useState('SEM-1');
  const [feeDeskDate, setFeeDeskDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeDeskPurpose, setFeeDeskPurpose] = useState('Tuition Fee');
  const [feeDeskModePayment, setFeeDeskModePayment] = useState('Cash');
  const [feeDeskRefNo, setFeeDeskRefNo] = useState('');
  const [feeDeskReceivedBy, setFeeDeskReceivedBy] = useState('Admin Desk');
  const [feeDeskAmount, setFeeDeskAmount] = useState('');
  const [feeDeskRemark, setFeeDeskRemark] = useState('');
  const [extraFeeRows, setExtraFeeRows] = useState([]);
  const [feeDeskLoading, setFeeDeskLoading] = useState(false);
  const [feeDeskError, setFeeDeskError] = useState(null);
  const [feeDeskSuccess, setFeeDeskSuccess] = useState(null);

  // Multi-Year Scholarship State for Fee Desk (1st, 2nd, 3rd, 4th Year)
  const [scholarshipYear1, setScholarshipYear1] = useState('');
  const [scholarshipYear2, setScholarshipYear2] = useState('');
  const [scholarshipYear3, setScholarshipYear3] = useState('');
  const [scholarshipYear4, setScholarshipYear4] = useState('');
  const [scholarshipActiveYear, setScholarshipActiveYear] = useState('year1'); // 'year1' | 'year2' | 'year3' | 'year4'

  // Fee Receipt & Fee Card Print Modals
  const [printReceiptData, setPrintReceiptData] = useState(null);
  const [printFeeCardStudent, setPrintFeeCardStudent] = useState(null);
  const [editingPaymentModal, setEditingPaymentModal] = useState(null);
  const [editPaymentLoading, setEditPaymentLoading] = useState(false);
  const [editPaymentError, setEditPaymentError] = useState(null);

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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [croppingImageSrc, setCroppingImageSrc] = useState(null);
  const [croppingStudent, setCroppingStudent] = useState(null);
  const editPhotoInputRef = useRef(null);
  const profilePhotoInputRef = useRef(null);

  // Admission Cancellation State
  const [cancellingStudent, setCancellingStudent] = useState(null);
  const [cancelReason, setCancelReason] = useState('Student Request / Discontinued');
  const [cancelRefundPaid, setCancelRefundPaid] = useState('0');
  const [cancelPaymentMode, setCancelPaymentMode] = useState('Cash');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Default Fallback Partner Universities list (immediately available before API completes)
  const DEFAULT_UNIVERSITIES = [
    { id: 'univ-1789571739471-463', name: 'Bhabha University, Bhopal (M.P)', shortName: 'Bhabha University' },
    { id: 'univ-1789571739470-197', name: 'Gyanveer University, Sagar (M.P)', shortName: 'Gyanveer University' },
    { id: 'univ-1789571739470-940', name: 'IES University, Bhopal (M.P)', shortName: 'IES University' },
    { id: 'univ-mcbu', name: 'MCBU - Maharaja Chhatrasal Bundelkhand University Chhatarpur (M.P.)', shortName: 'MCBU' },
    { id: 'univ-1789571739470-506', name: 'MCRPV - Makhanlal Chaturvedi Rashtriya Patrakarita Evam Sanchar Vishwavidyalaya', shortName: 'MCRPV Bhopal' },
    { id: 'univ-1789571739471-295', name: 'MMYVV - Maharishi Mahesh Yogi Vedic Vishwavidyalaya, Jabalpur (M.P)', shortName: 'MMYVV' },
    { id: 'univ-mpu', name: 'MPU - Madhyanchal Professional University, Bhopal (M.P)', shortName: 'MPU Bhopal' },
    { id: 'univ-1789571739471-663', name: 'SKU - Shri Krishna University Chhatarpur (M.P.)', shortName: 'Shri Krishna University' },
    { id: 'univ-1789571739470-15', name: 'Subharti University Meerut', shortName: 'Subharti University' },
    { id: 'univ-mgcgv', name: 'Mahatma Gandhi Chitrakoot Gramodaya Vishwavidyalaya', shortName: 'Gramodaya Vishwavidyalaya Chitrakoot' }
  ];

  // Institution catalogs & additional course form state
  const [universitiesList, setUniversitiesList] = useState(DEFAULT_UNIVERSITIES);
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
        const uRes = await fetch('/api/universities');
        const uData = await uRes.json();
        if (uData.success && Array.isArray(uData.universities) && uData.universities.length > 0) {
          setUniversitiesList(uData.universities);
        }
      } catch (e) {
        console.warn('Could not load universities catalog:', e);
      }

      try {
        const cRes = await fetch('/api/colleges');
        const cData = await cRes.json();
        if (cData.success && Array.isArray(cData.colleges) && cData.colleges.length > 0) {
          setCollegesList(cData.colleges);
        }
      } catch (e) {
        console.warn('Could not load colleges catalog:', e);
      }

      try {
        const crsRes = await fetch('/api/courses');
        const crsData = await crsRes.json();
        if (crsData.success && Array.isArray(crsData.courses) && crsData.courses.length > 0) {
          setAllCoursesList(crsData.courses);
        }
      } catch (e) {
        console.warn('Could not load courses catalog:', e);
      }
    };
    loadInstitutions();
  }, []);

  // Dynamic list of all universities from API / DB plus any added in future or on student records
  const allAvailableUniversities = Array.from(new Set([
    ...universitiesList.map(u => u.name),
    ...students.map(s => s.universityName).filter(Boolean)
  ])).filter(Boolean);

  // Available colleges cascading dynamically from selected filterUniversity
  const availableFilterColleges = (() => {
    if (filterUniversity === 'all') {
      return collegesList;
    }
    const targetUniv = universitiesList.find(u => u.name === filterUniversity);
    const targetId = targetUniv?.id;
    const tu = filterUniversity.toLowerCase();

    const matched = collegesList.filter(c => {
      if (targetId && c.universityId === targetId) return true;
      const cu = (c.universityName || '').toLowerCase();
      if (cu === tu) return true;
      if (cu && tu && (cu.includes(tu) || tu.includes(cu))) return true;

      if (tu.includes('mcbu') || tu.includes('chhatrasal')) return cu.includes('mcbu') || cu.includes('chhatrasal') || c.universityId === 'univ-mcbu';
      if (tu.includes('subharti') || tu.includes('bharti')) return cu.includes('subharti') || cu.includes('bharti') || c.universityId === 'univ-subharti' || c.universityId === 'univ-1789571739470-15';
      if (tu.includes('ies')) return cu.includes('ies') || c.universityId === 'univ-ies' || c.universityId === 'univ-1789571739470-940';
      if (tu.includes('mcrpv') || tu.includes('makhanlal')) return cu.includes('mcrpv') || cu.includes('makhanlal') || c.universityId === 'univ-1789571739470-506';
      if (tu.includes('bhabha')) return cu.includes('bhabha');
      if (tu.includes('gyanveer')) return cu.includes('gyanveer');
      if (tu.includes('mmyvv') || tu.includes('maharishi') || tu.includes('vedic')) return cu.includes('mmyvv') || cu.includes('maharishi') || cu.includes('vedic');
      if (tu.includes('mpu') || tu.includes('madhyanchal')) return cu.includes('mpu') || cu.includes('madhyanchal');
      if (tu.includes('sku') || tu.includes('krishna')) return cu.includes('sku') || cu.includes('krishna');
      if (tu.includes('chitrakoot') || tu.includes('gramodaya') || tu.includes('mgcgv')) return cu.includes('chitrakoot') || cu.includes('gramodaya') || cu.includes('mgcgv');
      return false;
    });

    if (matched.length > 0) return matched;
    return [{ id: `col-${filterUniversity}`, name: filterUniversity, shortName: filterUniversity, code: '' }];
  })();

  const handleFilterUniversityChange = (newUniv) => {
    setFilterUniversity(newUniv);
    setFilterCollege('all');
  };

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

  const handleApplyFilters = () => {
    setAppliedSession(filterSession);
    setAppliedSatra(filterSatra);
    setAppliedUniversity(filterUniversity);
    setAppliedCollege(filterCollege);
    setCurrentPage(1);
  };

  const handleResetFiltersToAll = () => {
    setFilterSession('all');
    setFilterSatra('all');
    setFilterUniversity('all');
    setFilterCollege('all');
    setAppliedSession('all');
    setAppliedSatra('all');
    setAppliedUniversity('all');
    setAppliedCollege('all');
    setSearch('');
    setSelectedCourse('all');
    setSelectedSemester('all');
    setTimeframe('all');
    setCurrentPage(1);
    fetchStudents('', 'all', 'all', 'all');
  };

  const handleOpenFeeDesk = async (student, initialMode = 'receive') => {
    setFeeDeskStudent(student);
    setFeeDeskMode(initialMode);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);
    setFeeDeskClass(student.currentClass || `SEM-${student.currentSemester || 1}`);
    setFeeDeskDate(new Date().toISOString().split('T')[0]);
    setFeeDeskModePayment('Cash');
    setFeeDeskRefNo('');
    setFeeDeskReceivedBy('Admin Desk');
    setFeeDeskRemark(student.remark || '');

    const y1 = Number(student.scholarshipYear1 !== undefined && student.scholarshipYear1 !== null ? student.scholarshipYear1 : (!student.scholarshipYear2 ? (student.scholarshipAmount || 0) : 0));
    const y2 = Number(student.scholarshipYear2 || 0);
    const y3 = Number(student.scholarshipYear3 || 0);
    const y4 = Number(student.scholarshipYear4 || 0);
    setScholarshipYear1(String(y1 || 0));
    setScholarshipYear2(String(y2 || 0));
    setScholarshipYear3(String(y3 || 0));
    setScholarshipYear4(String(y4 || 0));
    setScholarshipActiveYear('year1');

    const acadFee = Number(student.academicFee !== undefined && student.academicFee !== null ? student.academicFee : (student.studentFee !== undefined && student.studentFee !== null ? student.studentFee : 0));
    const sch = Number(student.scholarshipAmount || (y1 + y2 + y3 + y4) || 0);
    const tot = acadFee + sch;
    const paid = Number(student.totalPaid || 0);
    const rem = Math.max(0, tot - paid);

    if (initialMode === 'receive') {
      setFeeDeskPurpose('Tuition Fee');
      setFeeDeskAmount(rem > 0 ? String(rem) : '');
    } else if (initialMode === 'set_fee') {
      setFeeDeskPurpose('Center Fee');
      setFeeDeskAmount('');
      setExtraFeeRows([]);
    } else if (initialMode === 'set_scholarship') {
      setFeeDeskPurpose('Scholarship');
      setFeeDeskAmount(y1 > 0 ? String(y1) : (sch > 0 ? String(sch) : '0'));
    }

    try {
      const studentLookupKey = getStudentKey(student);
      if (studentLookupKey) {
        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}`);
        const data = await res.json();
        if (data.success && data.student) {
          setFeeDeskPayments(data.student.payments || []);
          setFeeDeskStudent(data.student);
          const sy1 = Number(data.student.scholarshipYear1 !== undefined ? data.student.scholarshipYear1 : (!data.student.scholarshipYear2 ? (data.student.scholarshipAmount || 0) : 0));
          const sy2 = Number(data.student.scholarshipYear2 || 0);
          const sy3 = Number(data.student.scholarshipYear3 || 0);
          const sy4 = Number(data.student.scholarshipYear4 || 0);
          setScholarshipYear1(String(sy1 || 0));
          setScholarshipYear2(String(sy2 || 0));
          setScholarshipYear3(String(sy3 || 0));
          setScholarshipYear4(String(sy4 || 0));
          if (initialMode === 'set_fee') {
            setFeeDeskAmount('');
          }
        } else {
          setFeeDeskPayments(student.payments || []);
        }
      } else {
        setFeeDeskPayments(student.payments || []);
      }
    } catch (e) {
      setFeeDeskPayments(student.payments || []);
    }
  };

  const switchFeeDeskMode = (newMode) => {
    if (!feeDeskStudent) return;
    setFeeDeskMode(newMode);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    const acadFee = Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee !== undefined && feeDeskStudent.studentFee !== null ? feeDeskStudent.studentFee : 0));
    const y1 = Number(scholarshipYear1) || 0;
    const y2 = Number(scholarshipYear2) || 0;
    const y3 = Number(scholarshipYear3) || 0;
    const y4 = Number(scholarshipYear4) || 0;
    const sch = (y1 + y2 + y3 + y4 > 0) ? (y1 + y2 + y3 + y4) : Number(feeDeskStudent.scholarshipAmount || 0);
    const tot = acadFee + sch;
    const paid = Number(feeDeskStudent.totalPaid || 0);
    const rem = Math.max(0, tot - paid);

    if (newMode === 'receive') {
      setFeeDeskPurpose('Tuition Fee');
      setFeeDeskAmount(rem > 0 ? String(rem) : '');
    } else if (newMode === 'set_fee') {
      setFeeDeskPurpose('Center Fee');
      setFeeDeskAmount('');
      setExtraFeeRows([]);
    } else if (newMode === 'set_scholarship') {
      setFeeDeskPurpose('Scholarship');
      setFeeDeskAmount(y1 > 0 ? String(y1) : (sch > 0 ? String(sch) : '0'));
    }
  };

  const handleOpenSetFeeModal = (student) => handleOpenFeeDesk(student, 'set_fee');
  const handleOpenSetScholarshipModal = (student) => handleOpenFeeDesk(student, 'set_scholarship');
  const handleOpenReceiveFeeModal = (student) => handleOpenFeeDesk(student, 'receive');

  const handleFeeDeskSubmit = async (e, actionOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!feeDeskStudent) return;

    const studentLookupKey = getStudentKey(feeDeskStudent);
    if (!studentLookupKey) {
      setFeeDeskError('Unable to identify student record. Missing roll number or ID.');
      return;
    }

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      if (feeDeskMode === 'receive') {
        const amt = (feeDeskAmount === '' || feeDeskAmount === null || feeDeskAmount === undefined) ? 0 : Number(feeDeskAmount);
        if (isNaN(amt) || amt < 0) {
          throw new Error('Please enter a valid amount (0 or more).');
        }

        const isSetPaid = actionOverride === 'set_paid' || amt === 0;

        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/receive-fee`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amt,
            action: isSetPaid ? 'set_paid' : 'add',
            paymentMode: feeDeskModePayment,
            feeDate: feeDeskDate,
            purpose: feeDeskPurpose,
            currentClass: feeDeskClass,
            refNo: feeDeskRefNo,
            receivedBy: feeDeskReceivedBy,
            remark: feeDeskRemark
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to record payment');
        }

        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        if (data.payments) {
          setFeeDeskPayments(data.payments);
        } else if (data.receipt) {
          setFeeDeskPayments(prev => [data.receipt, ...prev]);
        }

        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        if (isSetPaid) {
          setFeeDeskSuccess(`Paid fee updated to ₹${amt.toLocaleString('en-IN')} successfully!`);
        } else {
          setFeeDeskSuccess(`₹${amt.toLocaleString('en-IN')} fee payment recorded successfully! Receipt: ${data.receipt?.receiptNo || 'Generated'}`);
        }

        const newRem = Math.max(0, (Number(updatedStudent.totalFee) || 0) - (Number(updatedStudent.totalPaid) || 0));
        setFeeDeskAmount(newRem > 0 ? String(newRem) : '0');
        setFeeDeskRefNo('');
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      } else if (feeDeskMode === 'set_fee') {
        const amt = (feeDeskAmount === '' || feeDeskAmount === null || feeDeskAmount === undefined) ? 0 : Number(feeDeskAmount);
        const validExtraRows = extraFeeRows.filter(r => (Number(r.amount) || 0) > 0);

        if (amt <= 0 && validExtraRows.length === 0) {
          throw new Error('Please enter a valid fee amount (greater than 0).');
        }

        let bodyPayload = {};
        if (validExtraRows.length > 0) {
          const allEntries = [];
          if (amt > 0) {
            allEntries.push({
              amount: amt,
              purpose: feeDeskPurpose || 'Center Fee',
              feeDate: feeDeskDate,
              currentClass: feeDeskClass
            });
          }
          validExtraRows.forEach(r => {
            allEntries.push({
              amount: Number(r.amount),
              purpose: r.purpose || 'Academic Fee',
              feeDate: feeDeskDate,
              currentClass: feeDeskClass
            });
          });
          bodyPayload = {
            entries: allEntries,
            feeDate: feeDeskDate,
            currentClass: feeDeskClass
          };
        } else {
          bodyPayload = {
            academicFee: amt,
            purpose: feeDeskPurpose || 'Center Fee',
            feeDate: feeDeskDate,
            currentClass: feeDeskClass,
            action: 'add'
          };
        }

        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/set-fee`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update academic fee');
        }

        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setFeeDeskAmount('');
        setExtraFeeRows([]);
        const addedCount = validExtraRows.length > 0 ? (validExtraRows.length + (amt > 0 ? 1 : 0)) : 1;
        setFeeDeskSuccess(`${addedCount > 1 ? `${addedCount} fee entries` : `Fee entry of ₹${amt.toLocaleString('en-IN')} (${feeDeskPurpose})`} added successfully! Total Set Fee: ₹${Number(updatedStudent.academicFee || 0).toLocaleString('en-IN')}`);
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      } else if (feeDeskMode === 'set_scholarship') {
        const y1Val = (scholarshipYear1 === '' || scholarshipYear1 === null || scholarshipYear1 === undefined) ? 0 : Math.max(0, Number(scholarshipYear1) || 0);
        const y2Val = (scholarshipYear2 === '' || scholarshipYear2 === null || scholarshipYear2 === undefined) ? 0 : Math.max(0, Number(scholarshipYear2) || 0);
        const y3Val = (scholarshipYear3 === '' || scholarshipYear3 === null || scholarshipYear3 === undefined) ? 0 : Math.max(0, Number(scholarshipYear3) || 0);
        const y4Val = (scholarshipYear4 === '' || scholarshipYear4 === null || scholarshipYear4 === undefined) ? 0 : Math.max(0, Number(scholarshipYear4) || 0);
        const totalSch = y1Val + y2Val + y3Val + y4Val;

        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/set-scholarship`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scholarshipYear1: y1Val,
            scholarshipYear2: y2Val,
            scholarshipYear3: y3Val,
            scholarshipYear4: y4Val,
            scholarshipAmount: totalSch,
            purpose: feeDeskPurpose || 'Scholarship',
            year: scholarshipActiveYear,
            yearLabel: feeDeskPurpose || (scholarshipActiveYear === 'year1' ? 'First Year Scholarship' : scholarshipActiveYear === 'year2' ? 'Second Year Scholarship' : scholarshipActiveYear === 'year3' ? 'Third Year Scholarship' : 'Fourth Year Scholarship'),
            amount: scholarshipActiveYear === 'year1' ? y1Val : scholarshipActiveYear === 'year2' ? y2Val : scholarshipActiveYear === 'year3' ? y3Val : y4Val,
            feeDate: feeDeskDate,
            currentClass: feeDeskClass
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update scholarship');
        }

        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setScholarshipYear1(String(updatedStudent.scholarshipYear1 !== undefined ? updatedStudent.scholarshipYear1 : y1Val));
        setScholarshipYear2(String(updatedStudent.scholarshipYear2 !== undefined ? updatedStudent.scholarshipYear2 : y2Val));
        setScholarshipYear3(String(updatedStudent.scholarshipYear3 !== undefined ? updatedStudent.scholarshipYear3 : y3Val));
        setScholarshipYear4(String(updatedStudent.scholarshipYear4 !== undefined ? updatedStudent.scholarshipYear4 : y4Val));
        setFeeDeskSuccess(`Scholarship updated successfully! Total: ₹${totalSch.toLocaleString('en-IN')} (1st: ₹${y1Val.toLocaleString('en-IN')}, 2nd: ₹${y2Val.toLocaleString('en-IN')}, 3rd: ₹${y3Val.toLocaleString('en-IN')}, 4th: ₹${y4Val.toLocaleString('en-IN')})`);
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      }
    } catch (err) {
      setFeeDeskError(err.message || 'Error processing request');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId, amountPaid) => {
    if (!feeDeskStudent || !paymentId) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this payment entry of ₹${Number(amountPaid || 0).toLocaleString('en-IN')}? Total paid fee will be adjusted.`);
    if (!confirmDelete) return;

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      const studentLookupKey = getStudentKey(feeDeskStudent);
      const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/payments/${encodeURIComponent(paymentId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete payment entry');
      }

      const updatedStudent = data.student;
      setFeeDeskStudent(updatedStudent);
      setFeeDeskPayments(data.payments || []);
      setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
      setFeeDeskSuccess(`Payment entry of ₹${Number(amountPaid || 0).toLocaleString('en-IN')} deleted successfully!`);
      fetchStudents();
      if (onFeeReceived) onFeeReceived();
    } catch (err) {
      setFeeDeskError(err.message || 'Error deleting payment');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  const handleDeleteCenterFee = async (id, amount, purpose) => {
    if (!feeDeskStudent) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${purpose || 'fee'} entry of ₹${Number(amount || 0).toLocaleString('en-IN')}?`);
    if (!confirmDelete) return;

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      const studentLookupKey = getStudentKey(feeDeskStudent);
      const deleteUrl = id 
        ? `/api/students/${encodeURIComponent(studentLookupKey)}/set-fee/${encodeURIComponent(id)}`
        : `/api/students/${encodeURIComponent(studentLookupKey)}/set-fee`;
      const res = await fetch(deleteUrl, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete fee entry');
      }

      const updatedStudent = data.student;
      setFeeDeskStudent(updatedStudent);
      setFeeDeskAmount('');
      setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
      setFeeDeskSuccess(`Fee entry deleted successfully! Remaining fee: ₹${Number(updatedStudent.academicFee || 0).toLocaleString('en-IN')}`);
      fetchStudents();
      if (onFeeReceived) onFeeReceived();
    } catch (err) {
      setFeeDeskError(err.message || 'Error deleting fee entry');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  const handleDeleteScholarship = async (idOrYear, amount, yearLabel) => {
    if (!feeDeskStudent || !idOrYear) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this scholarship entry of ₹${Number(amount || 0).toLocaleString('en-IN')} (${yearLabel || 'Scholarship'})?`);
    if (!confirmDelete) return;

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      const studentLookupKey = getStudentKey(feeDeskStudent);
      const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/scholarships/${encodeURIComponent(idOrYear)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete scholarship entry');
      }

      const updatedStudent = data.student;
      setFeeDeskStudent(updatedStudent);
      const sy1 = Number(updatedStudent.scholarshipYear1 !== undefined ? updatedStudent.scholarshipYear1 : 0);
      const sy2 = Number(updatedStudent.scholarshipYear2 !== undefined ? updatedStudent.scholarshipYear2 : 0);
      const sy3 = Number(updatedStudent.scholarshipYear3 !== undefined ? updatedStudent.scholarshipYear3 : 0);
      const sy4 = Number(updatedStudent.scholarshipYear4 !== undefined ? updatedStudent.scholarshipYear4 : 0);
      setScholarshipYear1(String(sy1));
      setScholarshipYear2(String(sy2));
      setScholarshipYear3(String(sy3));
      setScholarshipYear4(String(sy4));
      setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
      setFeeDeskSuccess(`${yearLabel || 'Scholarship'} entry deleted successfully!`);
      fetchStudents();
      if (onFeeReceived) onFeeReceived();
    } catch (err) {
      setFeeDeskError(err.message || 'Error deleting scholarship entry');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!feeDeskStudent || !editingPaymentModal) return;

    setEditPaymentLoading(true);
    setEditPaymentError(null);

    try {
      const studentLookupKey = getStudentKey(feeDeskStudent);

      if (editingPaymentModal.isCenterFee) {
        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/set-fee`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPaymentModal.id || editingPaymentModal.receiptNo,
            action: 'update',
            academicFee: editingPaymentModal.amountPaid,
            feeDate: editingPaymentModal.feeDate,
            currentClass: editingPaymentModal.currentClass,
            purpose: editingPaymentModal.purpose,
            receiptNo: editingPaymentModal.receiptNo
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update center fee');
        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        setFeeDeskAmount('');
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setFeeDeskSuccess(`Fee entry updated successfully! Total Set Fee: ₹${Number(updatedStudent.academicFee || 0).toLocaleString('en-IN')}`);
        setEditingPaymentModal(null);
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      } else if (editingPaymentModal.isScholarship) {
        const yKey = editingPaymentModal.year || 'year1';
        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/set-scholarship`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: yKey,
            yearLabel: editingPaymentModal.purpose || editingPaymentModal.yearLabel,
            purpose: editingPaymentModal.purpose,
            amount: Number(editingPaymentModal.amountPaid) || 0,
            feeDate: editingPaymentModal.feeDate,
            currentClass: editingPaymentModal.currentClass,
            receiptNo: editingPaymentModal.receiptNo
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update scholarship');
        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        const sy1 = Number(updatedStudent.scholarshipYear1 !== undefined ? updatedStudent.scholarshipYear1 : 0);
        const sy2 = Number(updatedStudent.scholarshipYear2 !== undefined ? updatedStudent.scholarshipYear2 : 0);
        const sy3 = Number(updatedStudent.scholarshipYear3 !== undefined ? updatedStudent.scholarshipYear3 : 0);
        const sy4 = Number(updatedStudent.scholarshipYear4 !== undefined ? updatedStudent.scholarshipYear4 : 0);
        setScholarshipYear1(String(sy1));
        setScholarshipYear2(String(sy2));
        setScholarshipYear3(String(sy3));
        setScholarshipYear4(String(sy4));
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setFeeDeskSuccess(`Scholarship updated successfully!`);
        setEditingPaymentModal(null);
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      } else {
        const paymentId = editingPaymentModal.id || editingPaymentModal.receiptNo;
        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/payments/${encodeURIComponent(paymentId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: editingPaymentModal.amountPaid,
            feeDate: editingPaymentModal.feeDate || editingPaymentModal.paymentDate,
            purpose: editingPaymentModal.purpose,
            paymentMode: editingPaymentModal.paymentMode,
            refNo: editingPaymentModal.refNo,
            receivedBy: editingPaymentModal.receivedBy,
            remark: editingPaymentModal.remark,
            currentClass: editingPaymentModal.currentClass
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update payment');
        }

        const updatedStudent = data.student;
        setFeeDeskStudent(updatedStudent);
        setFeeDeskPayments(data.payments || []);
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setFeeDeskSuccess(`Payment entry updated successfully to ₹${Number(editingPaymentModal.amountPaid || 0).toLocaleString('en-IN')}!`);
        setEditingPaymentModal(null);
        fetchStudents();
        if (onFeeReceived) onFeeReceived();
      }
    } catch (err) {
      setEditPaymentError(err.message || 'Error updating entry');
    } finally {
      setEditPaymentLoading(false);
    }
  };

  const formatDobForInput = (val) => {
    if (!val) return '';
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime()) && d.getFullYear() > 1900 && d.getFullYear() < 2100) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch (e) {}
    if (str.includes('T')) return str.split('T')[0];
    const dmY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmY) return `${dmY[3]}-${String(dmY[2]).padStart(2, '0')}-${String(dmY[1]).padStart(2, '0')}`;
    return str;
  };

  const handleOpenProfile = async (studentOrRoll) => {
    try {
      let lookupKey = '';
      if (studentOrRoll && typeof studentOrRoll === 'object') {
        setSelectedStudent(studentOrRoll);
        setActiveProfileTab('profile');
        lookupKey = studentOrRoll.rollNo || studentOrRoll.enrollmentNo || studentOrRoll.id || '';
      } else if (typeof studentOrRoll === 'string') {
        lookupKey = studentOrRoll.trim();
      }

      if (lookupKey) {
        const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}`);
        const data = await res.json();
        if (data.success && data.student) {
          setSelectedStudent(data.student);
          setActiveProfileTab('profile');
        }
      }
    } catch (err) {
      console.error('Error fetching student profile:', err);
    }
  };

  const handleDeleteStudent = async (rollOrStudent) => {
    const rollNo = typeof rollOrStudent === 'object' ? (rollOrStudent.rollNo || rollOrStudent.enrollmentNo || rollOrStudent.id) : rollOrStudent;
    if (!rollNo) return;
    if (!window.confirm(`Are you sure you want to remove this student record (${rollNo})?`)) return;
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(rollNo)}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStudents(prev => prev.filter(s => s.rollNo !== rollNo && s.id !== rollNo));
        if (selectedStudent?.rollNo === rollNo || selectedStudent?.id === rollNo) setSelectedStudent(null);
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
      totalFee: 0,
      initialPaid: 0,
      scholarshipAmount: 0,
      paymentMode: 'Cash',
      remark: ''
    });
    setEditFormData({
      rollNo: std.rollNo || std.enrollmentNo || '',
      fullName: std.fullName || std.studentName || '',
      fatherName: std.fatherName || std.father_name || '',
      motherName: std.motherName || std.mother_name || '',
      dob: formatDobForInput(std.dob),
      gender: std.gender || 'Male',
      phone: std.phone || std.contact || '',
      email: std.email || '',
      address: std.address || '',
      aadhaarNo: std.aadhaarNo || std.aadharNo || std.aadhaar_no || '',
      samagraId: std.samagraId || std.samagra_id || '',
      abcId: std.abcId || std.abc_id || '',
      mptassId: std.mptassId || std.mpTassId || std.mptass_id || '',
      mptassPassword: std.mptassPassword || std.mpTassPassword || std.mptass_password || '',
      otrId: std.otrId || std.otr_id || '',
      debId: std.debId || std.deb_id || '',
      scholerId: std.scholerId || std.scholarId || std.scholer_id || '',
      userId: std.userId || std.user_id || '',
      medium: std.medium || 'Hindi',
      admissionSession: std.admissionSession || std.currentSession || '2024-2025',
      admissionSatra: std.admissionSatra || std.currentSatra || 'July',
      admissionDate: formatDobForInput(std.admissionDate),
      universityName: std.universityName || '',
      collegeName: std.collegeName || '',
      courseName: std.courseName || '',
      branch: std.branch || '',
      courseType: std.courseType || 'UG',
      courseMode: std.courseMode || 'Regular',
      socialCategory: std.socialCategory || std.category || 'General',
      documentSubmit: std.documentSubmit || '',
      bloodGroup: std.bloodGroup || '',
      studentImage: std.studentImage || '',
      currentSemester: std.currentSemester || 1,
      currentClass: std.currentClass || `SEM-${std.currentSemester || 1}`,
      totalFee: std.totalFee !== undefined && std.totalFee !== null ? std.totalFee : (std.academicFee !== undefined && std.academicFee !== null ? std.academicFee : (std.studentFee !== undefined && std.studentFee !== null ? std.studentFee : 0)),
      scholarshipAmount: std.scholarshipAmount !== undefined && std.scholarshipAmount !== null ? std.scholarshipAmount : 0,
      admissionYear: std.admissionYear || 2026,
      remark: std.remark || '',
      cancel: std.cancel || '',
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
        rollNo: (editFormData.rollNo || '').trim(),
        totalFee: (editFormData.totalFee !== '' && editFormData.totalFee !== null && editFormData.totalFee !== undefined) ? Number(editFormData.totalFee) : 0,
        academicFee: (editFormData.academicFee !== '' && editFormData.academicFee !== null && editFormData.academicFee !== undefined) ? Number(editFormData.academicFee) : ((editFormData.totalFee !== '' && editFormData.totalFee !== null && editFormData.totalFee !== undefined) ? Number(editFormData.totalFee) : 0),
        scholarshipAmount: (editFormData.scholarshipAmount !== '' && editFormData.scholarshipAmount !== null && editFormData.scholarshipAmount !== undefined) ? Number(editFormData.scholarshipAmount) : 0,
        fullName: (editFormData.fullName && editFormData.fullName.trim()) || editingStudent.fullName || editingStudent.studentName,
        fatherName: (editFormData.fatherName && editFormData.fatherName.trim()) || editingStudent.fatherName || '',
        ...(showAddCourse && (newCourseData.courseName || newCourseData.branch) ? { additionalCourse: newCourseData } : {})
      };
      const lookupId = getStudentKey(editingStudent);
      const res = await fetch(`/api/students/${encodeURIComponent(lookupId)}`, {
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

      if (selectedStudent && (getStudentKey(selectedStudent) === lookupId || selectedStudent.id === editingStudent.id)) {
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

  const handleUploadPhotoForStudent = async (targetStudent, file) => {
    if (!targetStudent || !file) return;
    try {
      setPhotoUploading(true);
      const formData = new FormData();
      formData.append('photo', file);

      const lookupKey = targetStudent.id || targetStudent.rollNo || targetStudent.enrollmentNo || targetStudent.registrationNo;
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/photo`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload student photo');
      }

      const newPhotoUrl = data.photoUrl;

      // Update state in editingStudent
      if (editingStudent && ((editingStudent.id && editingStudent.id === targetStudent.id) || (editingStudent.rollNo && editingStudent.rollNo === targetStudent.rollNo))) {
        setEditingStudent(prev => ({ ...prev, studentImage: newPhotoUrl, photo: newPhotoUrl }));
        setEditFormData(prev => ({ ...prev, studentImage: newPhotoUrl }));
      }

      // Update state in selectedStudent (Profile View)
      if (selectedStudent && ((selectedStudent.id && selectedStudent.id === targetStudent.id) || (selectedStudent.rollNo && selectedStudent.rollNo === targetStudent.rollNo))) {
        setSelectedStudent(prev => ({
          ...prev,
          studentImage: newPhotoUrl,
          photo: newPhotoUrl,
          documents: { ...(prev.documents || {}), student_image: newPhotoUrl, photo: newPhotoUrl }
        }));
      }

      // Update students list in memory
      setStudents(prev => prev.map(s => {
        if ((targetStudent.id && s.id === targetStudent.id) || (targetStudent.rollNo && s.rollNo === targetStudent.rollNo)) {
          return {
            ...s,
            studentImage: newPhotoUrl,
            photo: newPhotoUrl,
            documents: { ...(s.documents || {}), student_image: newPhotoUrl, photo: newPhotoUrl }
          };
        }
        return s;
      }));

      return newPhotoUrl;
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert(err.message || 'Failed to upload photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleInitiatePhotoCrop = (targetStudent, file) => {
    if (!file || !targetStudent) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCroppingImageSrc(e.target.result);
      setCroppingStudent(targetStudent);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedFile) => {
    if (croppingStudent && croppedFile) {
      await handleUploadPhotoForStudent(croppingStudent, croppedFile);
    }
    setCroppingImageSrc(null);
    setCroppingStudent(null);
  };

  const handleRemovePhotoForStudent = async (targetStudent) => {
    if (!targetStudent) return;
    if (!window.confirm('Are you sure you want to remove this student photo?')) return;
    try {
      setPhotoUploading(true);
      const lookupKey = targetStudent.id || targetStudent.rollNo || targetStudent.enrollmentNo || targetStudent.registrationNo;
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/photo`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove photo');
      }

      if (editingStudent && ((editingStudent.id && editingStudent.id === targetStudent.id) || (editingStudent.rollNo && editingStudent.rollNo === targetStudent.rollNo))) {
        setEditingStudent(prev => ({ ...prev, studentImage: '', photo: '' }));
        setEditFormData(prev => ({ ...prev, studentImage: '' }));
      }

      if (selectedStudent && ((selectedStudent.id && selectedStudent.id === targetStudent.id) || (selectedStudent.rollNo && selectedStudent.rollNo === targetStudent.rollNo))) {
        setSelectedStudent(prev => ({
          ...prev,
          studentImage: '',
          photo: '',
          documents: { ...(prev.documents || {}), student_image: '', photo: '' }
        }));
      }

      setStudents(prev => prev.map(s => {
        if ((targetStudent.id && s.id === targetStudent.id) || (targetStudent.rollNo && s.rollNo === targetStudent.rollNo)) {
          return {
            ...s,
            studentImage: '',
            photo: '',
            documents: { ...(s.documents || {}), student_image: '', photo: '' }
          };
        }
        return s;
      }));
    } catch (err) {
      console.error('Error removing photo:', err);
      alert(err.message || 'Failed to remove photo');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleConfirmCancelAdmission = async () => {
    if (!cancellingStudent) return;
    try {
      setCancelLoading(true);
      const lookupKey = cancellingStudent.id || cancellingStudent.rollNo || cancellingStudent.enrollmentNo;
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/cancel-admission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          refundPaid: Number(cancelRefundPaid) || 0,
          paymentMode: cancelPaymentMode,
          operator: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel admission');
      }

      // Update state in memory
      setStudents(prev => prev.map(s => {
        if ((s.id && s.id === lookupKey) || (s.rollNo && s.rollNo === lookupKey)) {
          return { 
            ...s, 
            status: 'Cancelled', 
            cancel: 'Yes', 
            cancellationDate: new Date().toISOString().split('T')[0], 
            cancellationReason: cancelReason,
            refundPaid: Number(cancelRefundPaid) || 0
          };
        }
        return s;
      }));

      if (editingStudent && ((editingStudent.id && editingStudent.id === lookupKey) || (editingStudent.rollNo && editingStudent.rollNo === lookupKey))) {
        setEditingStudent(null);
      }
      if (selectedStudent && ((selectedStudent.id && selectedStudent.id === lookupKey) || (selectedStudent.rollNo && selectedStudent.rollNo === lookupKey))) {
        setSelectedStudent(null);
      }

      setCancellingStudent(null);
      setCancelReason('Student Request / Discontinued');
      setCancelRefundPaid('0');
      alert(`Admission cancelled for ${data.student?.fullName || data.student?.rollNo || cancellingStudent.fullName}! Record has been archived in Cancelled Admissions.`);
    } catch (err) {
      alert(err.message || 'Failed to cancel admission');
    } finally {
      setCancelLoading(false);
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
    // Exclude cancelled admissions so they disappear from Enrolled Students section
    if (s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes') return false;

    // Due Filter support (for Accounts Dashboard integration)
    if (dueFilter === 'due_only' || dueFilter === 'sem_due_only') {
      const acadFee = Number(s.academicFee !== undefined && s.academicFee !== null ? s.academicFee : (s.studentFee !== undefined && s.studentFee !== null ? s.studentFee : 0));
      const sch = Number(s.scholarshipAmount || 0);
      const tot = acadFee + sch;
      const paid = Number(s.totalPaid || 0);
      const rem = Math.max(0, tot - paid);
      const linkedRem = s.linkedCourses?.reduce((sum, lc) => {
        const lTot = Number(lc.academicFee !== undefined && lc.academicFee !== null ? lc.academicFee : (lc.studentFee !== undefined && lc.studentFee !== null ? lc.studentFee : 0)) + Number(lc.scholarshipAmount || 0);
        const lPaid = Number(lc.totalPaid || 0);
        return sum + Math.max(0, lTot - lPaid);
      }, 0) || 0;
      if (rem + linkedRem <= 0) return false;
    } else if (dueFilter === 'cleared') {
      const acadFee = Number(s.academicFee !== undefined && s.academicFee !== null ? s.academicFee : (s.studentFee !== undefined && s.studentFee !== null ? s.studentFee : 0));
      const sch = Number(s.scholarshipAmount || 0);
      const tot = acadFee + sch;
      const paid = Number(s.totalPaid || 0);
      const rem = Math.max(0, tot - paid);
      const linkedRem = s.linkedCourses?.reduce((sum, lc) => {
        const lTot = Number(lc.academicFee !== undefined && lc.academicFee !== null ? lc.academicFee : (lc.studentFee !== undefined && lc.studentFee !== null ? lc.studentFee : 0)) + Number(lc.scholarshipAmount || 0);
        const lPaid = Number(lc.totalPaid || 0);
        return sum + Math.max(0, lTot - lPaid);
      }, 0) || 0;
      if (rem + linkedRem > 0) return false;
    }

    if (appliedSession !== 'all') {
      const sess = s.currentSession || s.admissionSession || '';
      if (sess && sess !== appliedSession) return false;
    }

    if (appliedSatra !== 'all') {
      const satra = s.currentSatra || s.admissionSatra || '';
      if (satra && satra.toLowerCase() !== appliedSatra.toLowerCase()) return false;
    }

    if (appliedUniversity !== 'all') {
      const univ = (s.universityName || s.collegeName || '').toLowerCase();
      const target = appliedUniversity.toLowerCase();
      const isMcbu = (target.includes('mcbu') || target.includes('chhatrasal')) && (univ.includes('mcbu') || univ.includes('chhatrasal'));
      const isSubharti = (target.includes('subharti') || target.includes('bharti')) && (univ.includes('subharti') || univ.includes('bharti'));
      const isIes = target.includes('ies') && univ.includes('ies');
      const isMcrpv = (target.includes('mcrpv') || target.includes('makhanlal')) && (univ.includes('mcrpv') || univ.includes('makhanlal'));
      const isBhabha = target.includes('bhabha') && univ.includes('bhabha');
      const isGyanveer = target.includes('gyanveer') && univ.includes('gyanveer');
      const isMmyvv = (target.includes('mmyvv') || target.includes('maharishi') || target.includes('vedic')) && (univ.includes('mmyvv') || univ.includes('maharishi') || univ.includes('vedic'));
      const isMpu = (target.includes('mpu') || target.includes('madhyanchal')) && (univ.includes('mpu') || univ.includes('madhyanchal'));
      const isSku = (target.includes('sku') || target.includes('krishna')) && (univ.includes('sku') || univ.includes('krishna'));
      const isChitrakoot = (target.includes('chitrakoot') || target.includes('gramodaya') || target.includes('mgcgv')) && (univ.includes('chitrakoot') || univ.includes('gramodaya') || univ.includes('mgcgv'));

      if (!univ.includes(target) && !target.includes(univ) && !isMcbu && !isSubharti && !isIes && !isMcrpv && !isBhabha && !isGyanveer && !isMmyvv && !isMpu && !isSku && !isChitrakoot) {
        return false;
      }
    }

    if (appliedCollege !== 'all') {
      const targetCol = appliedCollege.toLowerCase();
      const sc = (s.collegeName || s.universityName || '').toLowerCase();
      const cleanSc = sc.replace(/[\s-]/g, '');
      const colObj = collegesList.find(c => c.name === appliedCollege || c.code === appliedCollege);

      let isMatch = (sc === targetCol) || sc.includes(targetCol) || targetCol.includes(sc);
      if (!isMatch && colObj) {
        const code = (colObj.code || '').toLowerCase().replace(/[\s-]/g, '');
        if (code && cleanSc.includes(code)) isMatch = true;

        const shortName = (colObj.shortName || '').toLowerCase();
        if (shortName && (sc.includes(shortName) || shortName.includes(sc))) isMatch = true;

        const numOnly = (colObj.code || colObj.name).replace(/\D/g, '');
        if (numOnly.length >= 3 && cleanSc.includes(numOnly)) isMatch = true;
      }
      if (!isMatch) return false;
    }

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
    <div className="w-full px-2 sm:px-4 lg:px-6 py-4 space-y-6">
      
      {/* Header */}
      {!hideHeader && (
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
      )}

      {/* Top University, College, Session & Satra Filter Form (5 Sections Compact Layout) */}
      <div className="bg-[#f0f7f9] p-3.5 rounded-xl border border-[#bce0ee] shadow-sm space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
              Select Session:
            </label>
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer shadow-xs"
            >
              <option value="all">All Sessions</option>
              {Array.from(new Set([
                '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025',
                '2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030',
                ...students.map(s => s.currentSession || s.admissionSession).filter(Boolean)
              ])).sort().map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
              Select Satra(July/Jan):
            </label>
            <select
              value={filterSatra}
              onChange={(e) => setFilterSatra(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer shadow-xs"
            >
              <option value="all">All Satras</option>
              <option value="July">July</option>
              <option value="January">January</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
              Select University:
            </label>
            <select
              value={filterUniversity}
              onChange={(e) => handleFilterUniversityChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer shadow-xs"
            >
              <option value="all">Select University (All)</option>
              {allAvailableUniversities.map((uName, i) => (
                <option key={i} value={uName}>{uName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate flex items-center justify-between">
              <span>Select College:</span>
              {availableFilterColleges.length > 0 && filterUniversity !== 'all' && (
                <span className="text-[10px] text-emerald-700 font-bold">
                  ({availableFilterColleges.length})
                </span>
              )}
            </label>
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer shadow-xs"
            >
              <option value="all">Select College (All)</option>
              {availableFilterColleges.map((c, i) => (
                <option key={c.id || i} value={c.name}>
                  {c.code ? `[${c.code}] ` : ''}{c.shortName || c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="truncate">Search Student:</span>
              {search && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Name, Roll, Mobile, Aadhaar..."
                className="w-full pl-7 pr-6 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium shadow-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              {search && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-1.5 top-1.5 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="w-full bg-[#1b5e20] hover:bg-[#144718] text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Show Students Record</span>
          </button>
        </div>
      </div>

      {/* Dark Active Filter Status Strip */}
      <div className="bg-[#0b1f33] text-white py-2 px-3 sm:px-4 rounded-lg border border-slate-700 shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs font-bold items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Session:</span>
          <span className="text-emerald-400 font-mono tracking-wide truncate">{appliedSession === 'all' ? 'All Sessions' : appliedSession}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Satra:</span>
          <span className="text-cyan-300 tracking-wide truncate">{appliedSatra === 'all' ? 'All Satras' : appliedSatra}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">University:</span>
          <span className="text-amber-300 truncate max-w-[170px]" title={appliedUniversity === 'all' ? 'All Universities' : appliedUniversity}>
            {appliedUniversity === 'all' ? 'All Universities' : appliedUniversity}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">College:</span>
          <span className="text-pink-300 truncate max-w-[170px]" title={appliedCollege === 'all' ? 'All Colleges' : appliedCollege}>
            {appliedCollege === 'all' ? 'All Colleges' : appliedCollege}
          </span>
        </div>
        <div className="flex items-center gap-1.5 lg:justify-end">
          <span className="text-slate-400 font-normal">Search:</span>
          {search ? (
            <span className="text-emerald-300 truncate max-w-[130px] flex items-center gap-1 font-mono" title={search}>
              <span>"{search}"</span>
              <button
                type="button"
                onClick={handleResetSearch}
                className="text-rose-400 hover:text-rose-200 ml-1 cursor-pointer font-bold"
                title="Clear Search"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-slate-400 font-normal">All Students</span>
          )}
        </div>
      </div>

      {/* Controls Bar: Show entries + Dual filter + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value="all">All</option>
          </select>
          <span>entries</span>

          <button
            type="button"
            onClick={() => setDualOnly(!dualOnly)}
            className={`ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              dualOnly
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <span>🎓 Dual Courses</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-white text-slate-900">
              {students.filter(s => s.isDualEnrolled).length}
            </span>
          </button>

          {/* Table View Mode Switcher */}
          <div className="ml-3 inline-flex items-center bg-slate-200/90 p-0.5 rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={() => setTableColumnMode('all')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tableColumnMode === 'all'
                  ? 'bg-[#0b1f33] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
              title="Show all student registration form fields directly in table columns"
            >
              <span>📋 All Form Fields (Horizontal Scroll)</span>
            </button>
            <button
              type="button"
              onClick={() => setTableColumnMode('compact')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tableColumnMode === 'compact'
                  ? 'bg-[#0b1f33] text-amber-300 shadow-xs'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
              title="Switch to compact table view"
            >
              <span>📑 Compact View</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 font-bold whitespace-nowrap">Search:</label>
          <div className="relative min-w-[220px]">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search students..."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-900 font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="absolute right-2 top-1.5 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {(search || appliedSession !== 'all' || appliedSatra !== 'all' || appliedUniversity !== 'all') && (
            <button
              type="button"
              onClick={handleResetFiltersToAll}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Reset All Filters"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table (Exact Match to User Images) */}
      {(() => {
        const totalEntries = displayedStudents.length;
        const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalEntries / (pageSize || 10)));
        const startIndex = pageSize === 'all' ? 0 : (currentPage - 1) * pageSize;
        const endIndex = pageSize === 'all' ? totalEntries : Math.min(startIndex + pageSize, totalEntries);
        const paginatedStudents = pageSize === 'all' ? displayedStudents : displayedStudents.slice(startIndex, endIndex);

        return (
          <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-[#0b1f33] text-white uppercase text-[10.5px] font-extrabold tracking-wider select-none">
                  {tableColumnMode === 'all' ? (
                    <tr>
                      <th className="sticky left-0 z-30 bg-[#0b1f33] py-2.5 px-2 text-center border-r border-slate-700 min-w-[44px] w-11 shadow-[2px_0_4px_rgba(0,0,0,0.15)]">#</th>
                      <th className="sticky left-[44px] z-30 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[210px] shadow-[4px_0_6px_rgba(0,0,0,0.2)]">Student_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Father_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Mother_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Contact</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Email</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">DOB</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Gender</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Category</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Aadhaar_No</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Samagra_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Enrollment_No</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Roll_No</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">ABC_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">MPTASS_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">MPTASS_Password</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">OTR_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">DEB_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Scholar_ID</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">User_ID</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Medium</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">College_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">University_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Course_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Branch</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Type</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Mode</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Session</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Satra</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Semester/Class</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Admission_Date</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[180px]">Address</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Reference</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[170px]">Remark</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Acadmic_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">1st_Yr_Schol</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">2nd_Yr_Schol</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">3rd_Yr_Schol</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">4th_Yr_Schol</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-300">Total_Scholarship</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Total_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Paid_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Remaining_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Paid_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Scholarship</th>
                      <th className="py-2.5 px-2 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="py-2.5 px-2 text-center border-r border-slate-700 w-10">#</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Father_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Contact</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">College_Name</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Course_Names</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Type</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Status</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[170px]">Remark</th>
                      <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Semester</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Acadmic_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Scholarship</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Total_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Paid_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Remaining_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Paid_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Fee</th>
                      <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Scholarship</th>
                      <th className="py-2.5 px-2 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={tableColumnMode === 'all' ? 48 : 19} className="p-8 text-center text-slate-400 font-medium">Loading students directory...</td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumnMode === 'all' ? 48 : 19} className="p-10 text-center bg-slate-50">
                        <div className="max-w-md mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                            <Search className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-slate-800">
                              {search 
                                ? `No students found matching "${search}"`
                                : 'No students found matching selected filters'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Try adjusting Session, Satra, University or clearing search query.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleResetFiltersToAll}
                            className="inline-flex items-center gap-1.5 bg-[#0b1f33] text-amber-300 font-bold px-4 py-2 rounded-lg text-xs shadow cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Show All Students</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (() => {
                    const renderedSecondaryIds = new Set();
                    return paginatedStudents.map((std, idx) => {
                      if (renderedSecondaryIds.has(std.id)) return null;

                      if (std.linkedCourses && std.linkedCourses.length > 0) {
                        std.linkedCourses.forEach(lc => renderedSecondaryIds.add(lc.id));
                      }

                      const acadFee = Number(std.academicFee !== undefined && std.academicFee !== null ? std.academicFee : (std.studentFee !== undefined && std.studentFee !== null ? std.studentFee : 0));
                      const y1 = Number(std.scholarshipYear1 !== undefined && std.scholarshipYear1 !== null ? std.scholarshipYear1 : (!std.scholarshipYear2 ? (std.scholarshipAmount || 0) : 0));
                      const y2 = Number(std.scholarshipYear2 || 0);
                      const y3 = Number(std.scholarshipYear3 || 0);
                      const y4 = Number(std.scholarshipYear4 || 0);
                      const sch = Number(std.scholarshipAmount || (y1 + y2 + y3 + y4) || 0);
                      const tot = acadFee + sch;
                      const paid = Number(std.totalPaid || 0);
                      const rem = Math.max(0, tot - paid);

                      return (
                        <React.Fragment key={std.id}>
                          <tr className="group hover:bg-[#eaf3fa] transition-colors border-b border-slate-200 text-xs">
                            {/* Sticky # */}
                            <td className="sticky left-0 z-20 bg-white group-hover:bg-[#eaf3fa] py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap min-w-[44px] w-11 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">
                              {startIndex + idx + 1}
                            </td>

                            {/* Sticky Student Name + Photo */}
                            <td className="sticky left-[44px] z-20 bg-white group-hover:bg-[#eaf3fa] py-2 px-2.5 border-r border-slate-200 whitespace-nowrap min-w-[210px] shadow-[4px_0_6px_rgba(0,0,0,0.08)]">
                              <div className="flex items-center gap-2.5">
                                <div
                                  onClick={() => handleOpenProfile(std)}
                                  className="w-9 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all shadow-2xs"
                                  title="Click to view full photo & profile"
                                >
                                  {std.studentImage || std.photo || std.documents?.student_image || std.documents?.photo ? (
                                    <img 
                                      src={std.studentImage || std.photo || std.documents?.student_image || std.documents?.photo} 
                                      alt="" 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <Users className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <div>
                                  <div
                                    onClick={() => handleOpenProfile(std)}
                                    className="font-bold text-slate-900 uppercase tracking-tight hover:text-indigo-600 cursor-pointer"
                                  >
                                    {std.fullName || std.studentName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {std.rollNo || std.enrollmentNo || std.id || ''}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-medium">
                              {std.fatherName || std.Father_Name || '-'}
                            </td>

                            {tableColumnMode === 'all' && (
                              <>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-medium">
                                  {std.motherName || std.Mother_Name || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.contact || std.phone || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                                  {std.email || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700">
                                  {std.dob || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-700">
                                  {std.gender || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                    {std.category || std.socialCategory || '-'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.aadhaarNo || std.aadhaar || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.samagraId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-800 font-mono font-semibold">
                                  {std.enrollmentNo || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-800 font-mono font-bold">
                                  {std.rollNo || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.abcId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.mptassId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">
                                  {std.mptassPassword || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.otrId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.debId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.scholarId || std.scholerId || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.userId || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-700">
                                  {std.medium || 'Hindi'}
                                </td>
                              </>
                            )}

                            {tableColumnMode === 'compact' && (
                              <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                {std.contact || std.phone || '-'}
                              </td>
                            )}

                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={std.collegeName || std.universityName || ''}>
                              {std.collegeName || std.universityName || '-'}
                            </td>

                            {tableColumnMode === 'all' && (
                              <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={std.universityName || ''}>
                                {std.universityName || '-'}
                              </td>
                            )}

                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-800 font-semibold whitespace-nowrap">
                              {std.courseName || '-'}
                            </td>

                            {tableColumnMode === 'all' && (
                              <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                                {std.branch || '-'}
                              </td>
                            )}

                            <td className="py-2.5 px-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                              {std.courseType || 'Semester'}
                            </td>

                            {tableColumnMode === 'all' && (
                              <>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                                  {std.courseMode || 'Regular'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-700 font-medium">
                                  {std.admissionSession || std.currentSession || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-700 font-medium">
                                  {std.admissionSatra || std.currentSatra || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                  {std.currentClass || (std.currentSemester ? `SEM-${std.currentSemester}` : 'SEM-1')}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.admissionDate ? (typeof std.admissionDate === 'string' && std.admissionDate.includes('T') ? std.admissionDate.split('T')[0] : std.admissionDate) : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 min-w-[180px] max-w-[280px] truncate" title={std.address || ''}>
                                  {std.address || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700">
                                  {std.reference || '-'}
                                </td>
                              </>
                            )}

                            <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                {std.status || 'Active'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 font-medium min-w-[170px] max-w-[280px] break-words whitespace-normal leading-snug" title={std.remark || ''}>
                              {std.remark || '-'}
                            </td>

                            {tableColumnMode === 'compact' && (
                              <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                {std.currentClass || (std.currentSemester ? `SEM-${std.currentSemester}` : 'SEM-1')}
                              </td>
                            )}

                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900">
                              {acadFee > 0 ? `${acadFee}/-` : '0/-'}
                            </td>

                            {tableColumnMode === 'all' && (
                              <>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">
                                  {y1 > 0 ? `${y1}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">
                                  {y2 > 0 ? `${y2}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">
                                  {y3 > 0 ? `${y3}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">
                                  {y4 > 0 ? `${y4}/-` : '-'}
                                </td>
                              </>
                            )}

                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-800">
                              {sch > 0 ? `${sch}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900 bg-slate-50/50">
                              {tot > 0 ? `${tot}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                              {paid > 0 ? `${paid}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700 bg-rose-50/20">
                              {rem > 0 ? `${rem}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenReceiveFeeModal(std)}
                                className="bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                title="Receive Fee from Student"
                              >
                                Receive_Student_Fee
                              </button>
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenSetFeeModal(std)}
                                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                title="Set Student Academic Fee"
                              >
                                Set_Student_Fee
                              </button>
                            </td>
                            <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenSetScholarshipModal(std)}
                                className="bg-[#1e7e34] hover:bg-[#155d27] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                title="Set Student Scholarship"
                              >
                                Set_Scholarship
                              </button>
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProfile(std)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                                  title="View Profile & KYC Documents"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(std)}
                                  className="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                  title="Edit Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrintSlipStudent(std)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Print Admission Slip"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudent(std)}
                                  className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Delete Student"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Connected Dual Program Secondary Row */}
                          {std.linkedCourses && [...std.linkedCourses].sort((a, b) => new Date(a.admissionDate || 0) - new Date(b.admissionDate || 0)).map((linked, lIdx) => {
                            const lAcadFee = Number(linked.academicFee !== undefined && linked.academicFee !== null ? linked.academicFee : (linked.studentFee !== undefined && linked.studentFee !== null ? linked.studentFee : 0));
                            const ly1 = Number(linked.scholarshipYear1 !== undefined && linked.scholarshipYear1 !== null ? linked.scholarshipYear1 : (!linked.scholarshipYear2 ? (linked.scholarshipAmount || 0) : 0));
                            const ly2 = Number(linked.scholarshipYear2 || 0);
                            const ly3 = Number(linked.scholarshipYear3 || 0);
                            const ly4 = Number(linked.scholarshipYear4 || 0);
                            const lSch = Number(linked.scholarshipAmount || (ly1 + ly2 + ly3 + ly4) || 0);
                            const lTot = lAcadFee + lSch;
                            const lPaid = Number(linked.totalPaid || 0);
                            const lRem = Math.max(0, lTot - lPaid);
                            return (
                              <tr key={linked.id || `linked-${lIdx}`} className="group bg-amber-50/50 hover:bg-amber-100/60 border-l-4 border-l-amber-500 border-b border-slate-200 transition-colors text-xs">
                                <td className="sticky left-0 z-20 bg-amber-50 group-hover:bg-amber-100 py-2.5 px-2 text-center font-bold text-amber-700 border-r border-slate-200 whitespace-nowrap min-w-[44px] w-11 shadow-[2px_0_4px_rgba(0,0,0,0.05)]">↳</td>
                                <td className="sticky left-[44px] z-20 bg-amber-50 group-hover:bg-amber-100 py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap min-w-[210px] shadow-[4px_0_6px_rgba(0,0,0,0.08)]">
                                  <div className="font-bold text-slate-800 uppercase tracking-tight">{std.fullName || std.studentName}</div>
                                  <div className="text-[10px] text-amber-700 font-mono font-bold">Dual: {linked.rollNo || linked.enrollmentNo || linked.id}</div>
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{std.fatherName || '-'}</td>

                                {tableColumnMode === 'all' && (
                                  <>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{std.motherName || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.contact || std.phone || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono text-[11px]">{std.email || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{std.dob || '-'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">{std.gender || '-'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
                                        {std.category || std.socialCategory || '-'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.aadhaarNo || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.samagraId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-amber-900 font-mono font-bold">{linked.enrollmentNo || std.enrollmentNo || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-amber-900 font-mono font-bold">{linked.rollNo || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.abcId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.mptassId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.mptassPassword || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.otrId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.debId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.scholarId || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.userId || '-'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">{linked.medium || std.medium || 'Hindi'}</td>
                                  </>
                                )}

                                {tableColumnMode === 'compact' && (
                                  <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{std.contact || std.phone || '-'}</td>
                                )}

                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 truncate max-w-[180px]">{linked.collegeName || linked.universityName || std.collegeName || '-'}</td>

                                {tableColumnMode === 'all' && (
                                  <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 truncate max-w-[180px]">{linked.universityName || std.universityName || '-'}</td>
                                )}

                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-amber-900 font-semibold whitespace-nowrap">{linked.courseName || '-'}</td>

                                {tableColumnMode === 'all' && (
                                  <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-600 whitespace-nowrap">{linked.branch || '-'}</td>
                                )}

                                <td className="py-2.5 px-2 border-r border-slate-200 text-slate-600 whitespace-nowrap">{linked.courseType || 'Diploma'}</td>

                                {tableColumnMode === 'all' && (
                                  <>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-slate-600 whitespace-nowrap">{linked.courseMode || 'Regular'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">{linked.admissionSession || std.admissionSession || '-'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap text-slate-600">{linked.admissionSatra || std.admissionSatra || '-'}</td>
                                    <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-amber-900">{linked.currentClass || 'SEM-1'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">{linked.admissionDate ? (typeof linked.admissionDate === 'string' && linked.admissionDate.includes('T') ? linked.admissionDate.split('T')[0] : linked.admissionDate) : '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-600 min-w-[180px] max-w-[280px] truncate" title={std.address || ''}>{std.address || '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">{std.reference || '-'}</td>
                                  </>
                                )}

                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    {linked.status || 'Active'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 font-medium min-w-[170px] max-w-[280px] break-words whitespace-normal leading-snug" title={linked.remark || ''}>{linked.remark || '-'}</td>

                                {tableColumnMode === 'compact' && (
                                  <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-amber-900">{linked.currentClass || 'SEM-1'}</td>
                                )}

                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900">{lAcadFee > 0 ? `${lAcadFee}/-` : '0/-'}</td>

                                {tableColumnMode === 'all' && (
                                  <>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">{ly1 > 0 ? `${ly1}/-` : '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">{ly2 > 0 ? `${ly2}/-` : '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">{ly3 > 0 ? `${ly3}/-` : '-'}</td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700">{ly4 > 0 ? `${ly4}/-` : '-'}</td>
                                  </>
                                )}

                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-800">{lSch > 0 ? `${lSch}/-` : '0/-'}</td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900">{lTot > 0 ? `${lTot}/-` : '0/-'}</td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">{lPaid > 0 ? `${lPaid}/-` : '0/-'}</td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">{lRem > 0 ? `${lRem}/-` : '0/-'}</td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReceiveFeeModal(linked)}
                                    className="bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                  >
                                    Receive_Student_Fee
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSetFeeModal(linked)}
                                    className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                  >
                                    Set_Student_Fee
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenSetScholarshipModal(linked)}
                                    className="bg-[#1e7e34] hover:bg-[#155d27] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                  >
                                    Set_Scholarship
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenProfile(linked)}
                                      className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
                                      title="View Profile"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditModal(linked)}
                                      className="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                      title="Edit Details"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStudent(linked)}
                                      className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
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

            {/* Table Footer with Pagination Controls */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
              <div>
                Showing <strong className="text-slate-900">{totalEntries > 0 ? startIndex + 1 : 0}</strong> to{' '}
                <strong className="text-slate-900">{endIndex}</strong> of{' '}
                <strong className="text-slate-900">{totalEntries}</strong> entries
              </div>
              {pageSize !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white font-semibold disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-2 py-1 font-bold text-slate-800">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white font-semibold disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Unified "Paid Student Fee" & Fee Desk Modal (Matching User Reference Images) */}
      {feeDeskStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header: Distinct color and title for each separated section */}
            <div className={`text-white px-5 py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-sm ${
              feeDeskMode === 'set_scholarship'
                ? 'bg-gradient-to-r from-purple-800 to-indigo-900'
                : feeDeskMode === 'set_fee'
                ? 'bg-gradient-to-r from-sky-700 to-blue-800'
                : 'bg-gradient-to-r from-emerald-800 to-green-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-white text-base">
                  {feeDeskMode === 'set_scholarship' ? <Award className="w-5 h-5" /> : feeDeskMode === 'set_fee' ? <BookOpen className="w-5 h-5" /> : '₹'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                    {feeDeskMode === 'receive' && 'Paid Student Fee (छात्र शुल्क भुगतान)'}
                    {feeDeskMode === 'set_fee' && 'Set Student Academic Fee (Center Fee)'}
                    {feeDeskMode === 'set_scholarship' && 'Set Student Scholarship (छात्रवृत्ति निर्धारण)'}
                  </h3>
                  <div className="text-xs text-emerald-100 flex items-center gap-2">
                    <span className="font-bold uppercase text-white">{feeDeskStudent.fullName || feeDeskStudent.studentName}</span>
                    <span className="text-white/70">•</span>
                    <span className="font-mono text-amber-200">Roll: {feeDeskStudent.rollNo}</span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/90">{feeDeskStudent.courseName}</span>
                  </div>
                </div>
              </div>

              {/* Clean Close Button Only - No cross-tabs */}
              <button
                type="button"
                onClick={() => setFeeDeskStudent(null)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
              
              {/* Alert Feedback Messages */}
              {feeDeskError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feeDeskError}</span>
                </div>
              )}
              {feeDeskSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{feeDeskSuccess}</span>
                </div>
              )}

              {/* Form: Divided strictly by single active section */}
              <form onSubmit={handleFeeDeskSubmit} className="space-y-4">
                {/* 1. RECEIVE / PAID FEE FORM */}
                {feeDeskMode === 'receive' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Student_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fullName || feeDeskStudent.studentName || ''} className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Father_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fatherName || '-'} className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">University_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.universityName || 'PKC University / Board'} className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none truncate" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Course_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.courseName || '-'} className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed outline-none truncate" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer">
                          <option value="SEM-1">SEM-1 (1st Semester / 1st Year)</option>
                          <option value="SEM-2">SEM-2 (2nd Semester)</option>
                          <option value="SEM-3">SEM-3 (3rd Semester / 2nd Year)</option>
                          <option value="SEM-4">SEM-4 (4th Semester)</option>
                          <option value="SEM-5">SEM-5 (5th Semester / 3rd Year)</option>
                          <option value="SEM-6">SEM-6 (6th Semester)</option>
                          <option value="SEM-7">SEM-7 (7th Semester / 4th Year)</option>
                          <option value="SEM-8">SEM-8 (8th Semester)</option>
                          <option value="Year-1">Year-1 (1st Year Annual)</option>
                          <option value="Year-2">Year-2 (2nd Year Annual)</option>
                          <option value="Year-3">Year-3 (3rd Year Annual)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee_Date* :</label>
                        <input type="date" required value={feeDeskDate} onChange={(e) => setFeeDeskDate(e.target.value)} className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose* :</label>
                        <select value={feeDeskPurpose} onChange={(e) => setFeeDeskPurpose(e.target.value)} className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer">
                          <option value="Tuition Fee">Tuition Fee</option>
                          <option value="Admission Fee">Admission Fee</option>
                          <option value="Examination Fee">Examination Fee</option>
                          <option value="Registration Fee">Registration Fee</option>
                          <option value="Caution Money">Caution Money Deposit</option>
                          <option value="Library Fee">Library / Lab Fee</option>
                          <option value="Scholarship">Scholarship</option>
                          <option value="Other Fee">Other Academic Dues</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment_Mode* :</label>
                        <select value={feeDeskModePayment} onChange={(e) => setFeeDeskModePayment(e.target.value)} className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer">
                          <option value="Cash">Cash (नकद)</option>
                          <option value="Online / UPI">Online / UPI QR</option>
                          <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                          <option value="Cheque">Cheque</option>
                          <option value="Card / POS">Card Swipe / POS</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Ref_No:</label>
                        <input type="text" value={feeDeskRefNo} onChange={(e) => setFeeDeskRefNo(e.target.value)} placeholder="UTR / Cheque No / Txn ID" className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Received_By:</label>
                        <input type="text" value={feeDeskReceivedBy} onChange={(e) => setFeeDeskReceivedBy(e.target.value)} placeholder="Admin Desk" className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">Enter_Fee_Amount* :</label>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" step="1" value={feeDeskAmount} onChange={(e) => setFeeDeskAmount(e.target.value)} placeholder="0" className="w-full px-3.5 py-2 text-sm font-extrabold border-2 border-emerald-600 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none font-mono" />
                          <button type="button" onClick={() => {
                            const acad = Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee !== undefined && feeDeskStudent.studentFee !== null ? feeDeskStudent.studentFee : 0));
                            const sch = Number(feeDeskStudent.scholarshipAmount || 0);
                            const tot = acad + sch;
                            const paid = Number(feeDeskStudent.totalPaid || 0);
                            const rem = Math.max(0, tot - paid);
                            setFeeDeskAmount(String(rem));
                          }} className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors" title="Auto fill full balance remaining">
                            Full Due
                          </button>
                          <button type="button" onClick={() => setFeeDeskAmount('0')} className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors" title="Set amount to 0">
                            Set 0
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                      <button type="submit" disabled={feeDeskLoading} onClick={(e) => handleFeeDeskSubmit(e, 'add')} className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2" title="Add new fee installment entry">
                        <PlusCircle className="w-4 h-4" />
                        <span>{feeDeskLoading ? 'Saving...' : 'Add Payment'}</span>
                      </button>
                    </div>
                  </>
                )}

                {/* 2. SET CENTER FEE FORM */}
                {feeDeskMode === 'set_fee' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Student_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fullName || feeDeskStudent.studentName || ''} className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Father_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fatherName || '-'} className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">University_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.universityName || 'PKC University / Board'} className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none truncate" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Course_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.courseName || '-'} className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed outline-none truncate" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee_Date* :</label>
                        <input
                          type="date"
                          required
                          value={feeDeskDate}
                          onChange={(e) => setFeeDeskDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class / Semester:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer">
                          <option value="SEM-1">SEM-1 (1st Semester / 1st Year)</option>
                          <option value="SEM-2">SEM-2 (2nd Semester)</option>
                          <option value="SEM-3">SEM-3 (3rd Semester / 2nd Year)</option>
                          <option value="SEM-4">SEM-4 (4th Semester)</option>
                          <option value="SEM-5">SEM-5 (5th Semester / 3rd Year)</option>
                          <option value="SEM-6">SEM-6 (6th Semester)</option>
                          <option value="SEM-7">SEM-7 (7th Semester / 4th Year)</option>
                          <option value="SEM-8">SEM-8 (8th Semester)</option>
                          <option value="Year-1">Year-1 (1st Year Annual)</option>
                          <option value="Year-2">Year-2 (2nd Year Annual)</option>
                          <option value="Year-3">Year-3 (3rd Year Annual)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose* :</label>
                        <select
                          value={feeDeskPurpose}
                          onChange={(e) => setFeeDeskPurpose(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                        >
                          <option value="Center Fee">Center Fee</option>
                          <option value="Academic Fee">Academic Fee</option>
                          <option value="Tuition Fee">Tuition Fee</option>
                          <option value="Annual Course Fee">Annual Course Fee</option>
                          <option value="Admission Fee">Admission Fee</option>
                          <option value="Registration Fee">Registration Fee</option>
                          <option value="Examination Fee">Examination Fee</option>
                          <option value="Other Fee">Other Fee</option>
                        </select>
                      </div>

                      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-blue-700">Total Academic / Center Fee</span>
                          <div className="text-base font-black text-blue-950 font-mono">
                            ₹{Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0)).toLocaleString('en-IN')}/-
                          </div>
                        </div>
                        {Array.isArray(feeDeskStudent.academicFeeHistory) && feeDeskStudent.academicFeeHistory.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                            {feeDeskStudent.academicFeeHistory.map((h, i) => (
                              <span key={h.id || i} className="px-2.5 py-1 bg-white border border-blue-300 shadow-2xs rounded-lg text-[11px] font-bold text-blue-950 flex items-center gap-1">
                                <span className="text-blue-700 font-semibold">{h.purpose || 'Center Fee'}:</span>
                                <span className="font-mono font-extrabold text-blue-900">₹{Number(h.amountPaid !== undefined ? h.amountPaid : (h.amount || 0)).toLocaleString('en-IN')}/-</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold shrink-0">Active Setting</span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">
                          Enter Fee Amount (₹)* :
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={feeDeskAmount}
                            onChange={(e) => setFeeDeskAmount(e.target.value)}
                            placeholder="0"
                            className="w-full px-3.5 py-2 text-sm font-extrabold border-2 border-sky-600 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none font-mono"
                          />
                          <button type="button" onClick={() => setFeeDeskAmount('0')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors" title="Set amount to 0">
                            Set 0
                          </button>
                        </div>
                      </div>

                      {/* Dynamic Extra Fee Entries (Multiple entries at the same time) */}
                      {extraFeeRows.map((row, rIdx) => (
                        <div key={row.id || rIdx} className="col-span-1 sm:col-span-2 lg:col-span-4 bg-sky-50/80 border-2 border-sky-200 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <span className="px-2.5 py-1 bg-sky-700 text-white rounded-md text-[10px] font-bold shrink-0">
                            Entry #{rIdx + 2}
                          </span>
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Purpose* :</label>
                            <select
                              value={row.purpose}
                              onChange={(e) => {
                                const newRows = [...extraFeeRows];
                                newRows[rIdx].purpose = e.target.value;
                                setExtraFeeRows(newRows);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                            >
                              <option value="Center Fee">Center Fee</option>
                              <option value="Academic Fee">Academic Fee</option>
                              <option value="Tuition Fee">Tuition Fee</option>
                              <option value="Annual Course Fee">Annual Course Fee</option>
                              <option value="Admission Fee">Admission Fee</option>
                              <option value="Registration Fee">Registration Fee</option>
                              <option value="Examination Fee">Examination Fee</option>
                              <option value="Other Fee">Other Fee</option>
                            </select>
                          </div>
                          <div className="w-full sm:w-56">
                            <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Fee Amount (₹)* :</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={row.amount}
                              onChange={(e) => {
                                const newRows = [...extraFeeRows];
                                newRows[rIdx].amount = e.target.value;
                                setExtraFeeRows(newRows);
                              }}
                              placeholder="0"
                              className="w-full px-3 py-1.5 text-xs font-extrabold border-2 border-sky-500 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 font-mono"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setExtraFeeRows(prev => prev.filter((_, idx) => idx !== rIdx))}
                            className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer self-end sm:self-center mt-1 sm:mt-3"
                            title="Remove this entry"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (extraFeeRows.length < 5) {
                            setExtraFeeRows(prev => [
                              ...prev,
                              { id: Date.now(), purpose: 'Academic Fee', amount: '' }
                            ]);
                          }
                        }}
                        className="text-sky-800 hover:text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        title="Add another fee purpose and amount to save together"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-sky-700" />
                        <span>+ Add Another Purpose (साथ में दूसरी एंट्री जोड़ें)</span>
                      </button>

                      <button
                        type="submit"
                        disabled={feeDeskLoading}
                        className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-7 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        title="Add fee entry"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>{feeDeskLoading ? 'Adding...' : 'Add'}</span>
                      </button>
                    </div>
                  </>
                )}

                {/* 3. SET SCHOLARSHIP FORM */}
                {feeDeskMode === 'set_scholarship' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Student_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fullName || feeDeskStudent.studentName || ''} className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Father_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.fatherName || '-'} className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">University_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.universityName || 'PKC University / Board'} className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none truncate" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Course_Name:</label>
                        <input type="text" readOnly value={feeDeskStudent.courseName || '-'} className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed outline-none truncate" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee_Date* :</label>
                        <input
                          type="date"
                          required
                          value={feeDeskDate}
                          onChange={(e) => setFeeDeskDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class / Semester:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer">
                          <option value="SEM-1">SEM-1 (1st Semester / 1st Year)</option>
                          <option value="SEM-2">SEM-2 (2nd Semester)</option>
                          <option value="SEM-3">SEM-3 (3rd Semester / 2nd Year)</option>
                          <option value="SEM-4">SEM-4 (4th Semester)</option>
                          <option value="SEM-5">SEM-5 (5th Semester / 3rd Year)</option>
                          <option value="SEM-6">SEM-6 (6th Semester)</option>
                          <option value="SEM-7">SEM-7 (7th Semester / 4th Year)</option>
                          <option value="SEM-8">SEM-8 (8th Semester)</option>
                          <option value="Year-1">Year-1 (1st Year Annual)</option>
                          <option value="Year-2">Year-2 (2nd Year Annual)</option>
                          <option value="Year-3">Year-3 (3rd Year Annual)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose* :</label>
                        <select
                          value={feeDeskPurpose}
                          onChange={(e) => setFeeDeskPurpose(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                        >
                          <option value="Scholarship">Scholarship</option>
                          <option value="Government Scholarship">Government Scholarship</option>
                          <option value="Post-Matric Scholarship">Post-Matric Scholarship</option>
                          <option value="Merit Scholarship">Merit Scholarship</option>
                          <option value="Special Category Scholarship">Special Category Scholarship</option>
                          <option value="Institute Concession">Institute Concession</option>
                          <option value="Annual Scholarship">Annual Scholarship</option>
                        </select>
                      </div>

                      {/* Multi-Year Scholarship Inputs */}
                      <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-gradient-to-br from-purple-50/90 to-indigo-50/50 border-2 border-purple-300 rounded-2xl p-4 space-y-4 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-200/80 pb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                              </span>
                              <h4 className="text-sm font-black text-purple-950 uppercase tracking-tight">
                                Multi-Year Scholarship Desk (सालाना छात्रवृत्ति प्रबंधन)
                              </h4>
                            </div>
                            <p className="text-[11px] text-purple-700 font-medium">
                              Set scholarship year-by-year (First Year, Second Year, Third Year, Fourth Year). Total is auto-calculated.
                            </p>
                          </div>
                          <div className="bg-purple-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-2.5 shadow-sm shrink-0">
                            <span className="text-purple-200">Total Scholarship:</span>
                            <span className="text-amber-300 font-mono text-base font-extrabold">
                              ₹{((Number(scholarshipYear1) || 0) + (Number(scholarshipYear2) || 0) + (Number(scholarshipYear3) || 0) + (Number(scholarshipYear4) || 0)).toLocaleString('en-IN')}/-
                            </span>
                          </div>
                        </div>

                        {/* 4 Years Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* 1st Year */}
                          <div className={`p-3 rounded-xl border-2 transition-all ${scholarshipActiveYear === 'year1' ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-300' : 'bg-white/90 border-purple-200 hover:border-purple-300'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">1</span>
                                First Year Scholarship
                              </label>
                              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">1st Year</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-purple-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={scholarshipYear1}
                                onFocus={() => setScholarshipActiveYear('year1')}
                                onChange={(e) => setScholarshipYear1(e.target.value)}
                                placeholder="0"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-purple-200 rounded-lg text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/20"
                              />
                            </div>
                          </div>

                          {/* 2nd Year */}
                          <div className={`p-3 rounded-xl border-2 transition-all ${scholarshipActiveYear === 'year2' ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-300' : 'bg-white/90 border-purple-200 hover:border-purple-300'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">2</span>
                                Second Year Scholarship
                              </label>
                              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">2nd Year</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-purple-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={scholarshipYear2}
                                onFocus={() => setScholarshipActiveYear('year2')}
                                onChange={(e) => setScholarshipYear2(e.target.value)}
                                placeholder="0"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-purple-200 rounded-lg text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/20"
                              />
                            </div>
                          </div>

                          {/* 3rd Year */}
                          <div className={`p-3 rounded-xl border-2 transition-all ${scholarshipActiveYear === 'year3' ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-300' : 'bg-white/90 border-purple-200 hover:border-purple-300'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">3</span>
                                Third Year Scholarship
                              </label>
                              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">3rd Year</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-purple-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={scholarshipYear3}
                                onFocus={() => setScholarshipActiveYear('year3')}
                                onChange={(e) => setScholarshipYear3(e.target.value)}
                                placeholder="0"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-purple-200 rounded-lg text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/20"
                              />
                            </div>
                          </div>

                          {/* 4th Year */}
                          <div className={`p-3 rounded-xl border-2 transition-all ${scholarshipActiveYear === 'year4' ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-300' : 'bg-white/90 border-purple-200 hover:border-purple-300'}`}>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[11px] font-black text-purple-950 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] flex items-center justify-center font-bold">4</span>
                                Fourth Year Scholarship
                              </label>
                              <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">4th Year</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-2.5 top-2 text-xs font-bold text-purple-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={scholarshipYear4}
                                onFocus={() => setScholarshipActiveYear('year4')}
                                onChange={(e) => setScholarshipYear4(e.target.value)}
                                placeholder="0"
                                className="w-full pl-6 pr-2 py-1.5 text-xs font-black font-mono border border-purple-200 rounded-lg text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50/20"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                      <button
                        type="submit"
                        disabled={feeDeskLoading}
                        className="bg-[#1e7e34] hover:bg-[#155d27] text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        <span>{feeDeskLoading ? 'Saving...' : 'Set Scholarship (Save Years)'}</span>
                      </button>
                    </div>
                  </>
                )}
              </form>

              {/* DETAILS BELOW FORM: Strictly separated by mode! */}
              {/* 1. RECEIVE MODE: Fee Summary Strip + Payment History Ledger Table */}
              {feeDeskMode === 'receive' && (
                <>
                  {(() => {
                    const acad = Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee !== undefined && feeDeskStudent.studentFee !== null ? feeDeskStudent.studentFee : 0));
                    const y1 = Number(feeDeskStudent.scholarshipYear1 !== undefined ? feeDeskStudent.scholarshipYear1 : (!feeDeskStudent.scholarshipYear2 ? (feeDeskStudent.scholarshipAmount || 0) : 0));
                    const y2 = Number(feeDeskStudent.scholarshipYear2 || 0);
                    const y3 = Number(feeDeskStudent.scholarshipYear3 || 0);
                    const y4 = Number(feeDeskStudent.scholarshipYear4 || 0);
                    const sch = Number(feeDeskStudent.scholarshipAmount || (y1 + y2 + y3 + y4) || 0);
                    const tot = acad + sch;
                    const paid = Number(feeDeskStudent.totalPaid || 0);
                    const rem = Math.max(0, tot - paid);

                    return (
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                          <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 shadow-2xs">
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Center_fee</div>
                            <div className="text-sm font-black text-slate-900 font-mono">₹{acad.toLocaleString('en-IN')}/-</div>
                          </div>
                          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-2.5 shadow-2xs">
                            <div className="text-[10px] text-purple-700 uppercase font-bold">Total Scholarship</div>
                            <div className="text-sm font-black text-purple-900 font-mono">₹{sch.toLocaleString('en-IN')}/-</div>
                          </div>
                          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2.5 shadow-2xs">
                            <div className="text-[10px] text-indigo-700 uppercase font-bold">Total Fee</div>
                            <div className="text-sm font-black text-indigo-950 font-mono">₹{tot.toLocaleString('en-IN')}/-</div>
                          </div>
                          <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2.5 shadow-2xs">
                            <div className="text-[10px] text-emerald-700 uppercase font-bold">Paid Fee</div>
                            <div className="text-sm font-black text-emerald-800 font-mono">₹{paid.toLocaleString('en-IN')}/-</div>
                          </div>
                          <div className="bg-rose-50/70 border border-rose-300 rounded-xl p-2.5 shadow-2xs col-span-2 sm:col-span-1">
                            <div className="text-[10px] text-rose-700 uppercase font-bold">Remaining Fee</div>
                            <div className="text-sm font-black text-rose-800 font-mono">₹{rem.toLocaleString('en-IN')}/-</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment History Ledger Table - ONLY rendered for Paid Fee desk */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>Payment History (कब-कब फीस दी है, किस-किस डेट को)</span>
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500">
                        Total Transactions: {feeDeskPayments.length}
                      </span>
                    </div>

                    <div className="border border-slate-300 rounded-xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-2 border-r border-slate-700 text-center w-8">#</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Date</th>
                            <th className="py-2.5 px-2 border-r border-slate-700 text-center">Class</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Receipt No</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Purpose</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Payment_Mode</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Ref No</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Rreceived by</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700 text-right">Fee</th>
                            <th className="py-2.5 px-2 text-center">Fee Receipt / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {feeDeskPayments.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="py-6 text-center text-slate-400 italic">
                                No payment installments recorded yet for this student.
                              </td>
                            </tr>
                          ) : (
                            feeDeskPayments.map((p, idx) => {
                              const pDate = p.feeDate || (p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '-');
                              const pAmt = Number(p.amountPaid || p.amount || 0);

                              return (
                                <tr key={p.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">{pDate}</td>
                                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-700">{p.currentClass || feeDeskStudent.currentClass || 'SEM-1'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 font-mono font-bold text-indigo-900">{p.receiptNo || '-'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-slate-800">{p.purpose || p.feeType || 'Tuition Fee'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700">{p.paymentMode || 'Cash'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 font-mono text-slate-600">{p.refNo || p.transactionRef || '-'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700">{p.receivedBy || 'Admin Desk'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-right font-black font-mono text-emerald-800 whitespace-nowrap">
                                    {pAmt > 0 ? `${pAmt}/-` : '0/-'}
                                  </td>
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintReceiptData({
                                            ...p,
                                            studentName: p.studentName || feeDeskStudent.fullName || feeDeskStudent.studentName,
                                            rollNo: p.rollNo || feeDeskStudent.rollNo,
                                            collegeName: p.collegeName || feeDeskStudent.collegeName,
                                            universityName: p.universityName || feeDeskStudent.universityName,
                                            courseName: p.courseName || feeDeskStudent.courseName,
                                            currentClass: p.currentClass || feeDeskStudent.currentClass,
                                            transactionRef: p.transactionRef || p.refNo || 'CASH-COUNTER'
                                          });
                                        }}
                                        className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Print Official Fee Receipt"
                                      >
                                        <Printer className="w-3 h-3" />
                                        <span>Print</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPaymentModal({
                                            ...p,
                                            id: p.id || p.receiptNo,
                                            amountPaid: p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0),
                                            feeDate: p.feeDate ? p.feeDate.split('T')[0] : (p.paymentDate ? p.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]),
                                            purpose: p.purpose || p.feeType || 'Tuition Fee',
                                            paymentMode: p.paymentMode || 'Cash',
                                            refNo: p.refNo || p.transactionRef || '',
                                            receivedBy: p.receivedBy || 'Admin Desk',
                                            remark: p.remark || '',
                                            currentClass: p.currentClass || feeDeskStudent.currentClass || 'SEM-1'
                                          });
                                          setEditPaymentError(null);
                                        }}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit this payment entry"
                                      >
                                        <Edit3 className="w-3 h-3 text-indigo-600" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePayment(p.id || p.receiptNo, p.amountPaid || p.amount)}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Delete this payment entry"
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* 2. SET FEE MODE: Center Fee Entry Table with Date, Print, Edit, Delete */}
              {feeDeskMode === 'set_fee' && (() => {
                const currentAcad = Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0));
                const centerFeeEntries = (Array.isArray(feeDeskStudent.academicFeeHistory) && feeDeskStudent.academicFeeHistory.length > 0)
                  ? feeDeskStudent.academicFeeHistory
                  : (currentAcad > 0 ? [{
                      id: 'CF-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '1'),
                      receiptNo: `CF-${feeDeskStudent.rollNo || '001'}`,
                      date: feeDeskStudent.academicFeeDate || (feeDeskStudent.createdAt ? feeDeskStudent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                      feeDate: feeDeskStudent.academicFeeDate || (feeDeskStudent.createdAt ? feeDeskStudent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                      currentClass: feeDeskStudent.currentClass || 'SEM-1',
                      purpose: 'Center Fee (Academic Fee)',
                      paymentMode: 'Official Record',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: currentAcad,
                      amountPaid: currentAcad,
                      remark: feeDeskStudent.remark || 'Center Fee'
                    }] : []);

                return (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>Center Fee History (सेट की गई सेंटर फीस का रिकॉर्ड)</span>
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500">
                        Total Entries: {centerFeeEntries.length}
                      </span>
                    </div>

                    <div className="border border-slate-300 rounded-xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                        <thead>
                          <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-2 border-r border-slate-700 text-center w-8">#</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Date</th>
                            <th className="py-2.5 px-2 border-r border-slate-700 text-center">Class</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Purpose</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700 text-right">Fee</th>
                            <th className="py-2.5 px-2 text-center">Fee Receipt / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {centerFeeEntries.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                                No center fee entry set for this student (Center Fee is ₹0).
                              </td>
                            </tr>
                          ) : (
                            centerFeeEntries.map((c, idx) => {
                              const cDate = c.feeDate || c.date || '-';
                              const cAmt = Number(c.amountPaid !== undefined ? c.amountPaid : (c.amount || 0));

                              return (
                                <tr key={c.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">{cDate}</td>
                                  <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-700">{c.currentClass || feeDeskStudent.currentClass || 'SEM-1'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-slate-800 font-semibold">{c.purpose || 'Center Fee'}</td>
                                  <td className="py-2 px-2.5 border-r border-slate-200 text-right font-black font-mono text-sky-800 whitespace-nowrap">
                                    {cAmt > 0 ? `${cAmt}/-` : '0/-'}
                                  </td>
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintReceiptData({
                                            ...c,
                                            studentName: feeDeskStudent.fullName || feeDeskStudent.studentName,
                                            rollNo: feeDeskStudent.rollNo,
                                            collegeName: feeDeskStudent.collegeName,
                                            universityName: feeDeskStudent.universityName,
                                            courseName: feeDeskStudent.courseName,
                                            currentClass: c.currentClass || feeDeskStudent.currentClass,
                                            receiptNo: c.receiptNo,
                                            paymentDate: c.date || c.feeDate || new Date().toISOString(),
                                            paymentMode: c.paymentMode || 'Official Record',
                                            transactionRef: c.refNo || 'ACADEMIC-CENTER-FEE',
                                            feeType: 'Center Fee (Academic Fee)',
                                            paidFor: c.purpose || 'Center Fee',
                                            amountPaid: cAmt
                                          });
                                        }}
                                        className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Print Official Center Fee Receipt"
                                      >
                                        <Printer className="w-3 h-3" />
                                        <span>Print</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPaymentModal({
                                            ...c,
                                            isCenterFee: true,
                                            id: c.id || c.receiptNo,
                                            amountPaid: cAmt,
                                            feeDate: c.feeDate ? c.feeDate.split('T')[0] : (c.date ? c.date.split('T')[0] : new Date().toISOString().split('T')[0]),
                                            purpose: c.purpose || 'Center Fee (Academic Fee)',
                                            paymentMode: c.paymentMode || 'Official Record',
                                            refNo: c.refNo || '-',
                                            receivedBy: c.receivedBy || 'Admin Desk',
                                            remark: c.remark || '',
                                            currentClass: c.currentClass || feeDeskStudent.currentClass || 'SEM-1'
                                          });
                                          setEditPaymentError(null);
                                        }}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit this center fee entry"
                                      >
                                        <Edit3 className="w-3 h-3 text-indigo-600" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCenterFee(c.id || c.receiptNo, cAmt, c.purpose)}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Delete fee entry"
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                        {centerFeeEntries.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                              <td colSpan="4" className="py-2.5 px-3 text-right text-slate-700 text-xs uppercase tracking-wide">
                                Total Academic / Center Fee:
                              </td>
                              <td className="py-2.5 px-2.5 border-r border-slate-200 text-right font-black font-mono text-sky-900 text-xs">
                                ₹{currentAcad.toLocaleString('en-IN')}/-
                              </td>
                              <td className="py-2.5 px-2 text-center text-slate-500 text-[10px]">
                                {centerFeeEntries.length} {centerFeeEntries.length === 1 ? 'Entry' : 'Entries'}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* 3. SET SCHOLARSHIP MODE: Scholarship Entry Table with Date, Print, Edit, Delete */}
              {feeDeskMode === 'set_scholarship' && (() => {
                const y1 = Number(feeDeskStudent.scholarshipYear1 !== undefined ? feeDeskStudent.scholarshipYear1 : (!feeDeskStudent.scholarshipYear2 ? (feeDeskStudent.scholarshipAmount || 0) : 0));
                const y2 = Number(feeDeskStudent.scholarshipYear2 || 0);
                const y3 = Number(feeDeskStudent.scholarshipYear3 || 0);
                const y4 = Number(feeDeskStudent.scholarshipYear4 || 0);

                let scholarshipEntries = [];
                if (Array.isArray(feeDeskStudent.scholarshipHistory) && feeDeskStudent.scholarshipHistory.length > 0) {
                  scholarshipEntries = feeDeskStudent.scholarshipHistory;
                } else {
                  const defaultDate = feeDeskStudent.scholarshipDate || (feeDeskStudent.createdAt ? feeDeskStudent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]);
                  if (y1 > 0) {
                    scholarshipEntries.push({
                      id: 'SCH-Y1-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '1'),
                      receiptNo: `SCH-${feeDeskStudent.rollNo || '001'}-Y1`,
                      date: defaultDate,
                      feeDate: defaultDate,
                      currentClass: feeDeskStudent.currentClass || 'SEM-1',
                      purpose: 'First Year Scholarship',
                      year: 'year1',
                      yearLabel: 'First Year Scholarship',
                      paymentMode: 'Govt Scholarship Grant',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: y1,
                      amountPaid: y1,
                      remark: 'First Year Scholarship'
                    });
                  }
                  if (y2 > 0) {
                    scholarshipEntries.push({
                      id: 'SCH-Y2-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '2'),
                      receiptNo: `SCH-${feeDeskStudent.rollNo || '001'}-Y2`,
                      date: defaultDate,
                      feeDate: defaultDate,
                      currentClass: feeDeskStudent.currentClass || 'SEM-3',
                      purpose: 'Second Year Scholarship',
                      year: 'year2',
                      yearLabel: 'Second Year Scholarship',
                      paymentMode: 'Govt Scholarship Grant',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: y2,
                      amountPaid: y2,
                      remark: 'Second Year Scholarship'
                    });
                  }
                  if (y3 > 0) {
                    scholarshipEntries.push({
                      id: 'SCH-Y3-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '3'),
                      receiptNo: `SCH-${feeDeskStudent.rollNo || '001'}-Y3`,
                      date: defaultDate,
                      feeDate: defaultDate,
                      currentClass: feeDeskStudent.currentClass || 'SEM-5',
                      purpose: 'Third Year Scholarship',
                      year: 'year3',
                      yearLabel: 'Third Year Scholarship',
                      paymentMode: 'Govt Scholarship Grant',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: y3,
                      amountPaid: y3,
                      remark: 'Third Year Scholarship'
                    });
                  }
                  if (y4 > 0) {
                    scholarshipEntries.push({
                      id: 'SCH-Y4-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '4'),
                      receiptNo: `SCH-${feeDeskStudent.rollNo || '001'}-Y4`,
                      date: defaultDate,
                      feeDate: defaultDate,
                      currentClass: feeDeskStudent.currentClass || 'SEM-7',
                      purpose: 'Fourth Year Scholarship',
                      year: 'year4',
                      yearLabel: 'Fourth Year Scholarship',
                      paymentMode: 'Govt Scholarship Grant',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: y4,
                      amountPaid: y4,
                      remark: 'Fourth Year Scholarship'
                    });
                  }
                }

                return (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        <span>Scholarship History (छात्रवृत्ति रिकॉर्ड)</span>
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500">
                        Total Entries: {scholarshipEntries.length}
                      </span>
                    </div>

                    <div className="border border-purple-200 rounded-xl overflow-x-auto shadow-2xs">
                      <table className="w-full text-left border-collapse text-[11px] min-w-[700px]">
                        <thead>
                          <tr className="bg-purple-900 text-white font-bold text-[10px] uppercase tracking-wider">
                            <th className="py-2.5 px-2 border-r border-purple-800 text-center w-8">#</th>
                            <th className="py-2.5 px-2.5 border-r border-purple-800">Date</th>
                            <th className="py-2.5 px-2 border-r border-purple-800 text-center">Class</th>
                            <th className="py-2.5 px-2.5 border-r border-purple-800">Purpose</th>
                            <th className="py-2.5 px-2.5 border-r border-purple-800 text-right">Fee</th>
                            <th className="py-2.5 px-2 text-center">Fee Receipt / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-purple-100">
                          {scholarshipEntries.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-6 text-center text-slate-400 italic bg-white">
                                No scholarship entries recorded yet for this student.
                              </td>
                            </tr>
                          ) : (
                            scholarshipEntries.map((sEntry, idx) => {
                              const sDate = sEntry.feeDate || sEntry.date || '-';
                              const sAmt = Number(sEntry.amountPaid !== undefined ? sEntry.amountPaid : (sEntry.amount || 0));

                              return (
                                <tr key={sEntry.id || idx} className={idx % 2 === 1 ? 'bg-purple-50/40' : 'bg-white'}>
                                  <td className="py-2 px-2 border-r border-purple-100 text-center font-bold text-purple-700">{idx + 1}</td>
                                  <td className="py-2 px-2.5 border-r border-purple-100 whitespace-nowrap font-medium text-slate-800">{sDate}</td>
                                  <td className="py-2 px-2 border-r border-purple-100 text-center font-bold text-slate-700">{sEntry.currentClass || feeDeskStudent.currentClass || 'SEM-1'}</td>
                                  <td className="py-2 px-2.5 border-r border-purple-100 font-semibold text-purple-950">{sEntry.purpose || sEntry.yearLabel || 'Scholarship'}</td>
                                  <td className="py-2 px-2.5 border-r border-purple-100 text-right font-black font-mono text-purple-900 whitespace-nowrap">
                                    {sAmt > 0 ? `${sAmt}/-` : '0/-'}
                                  </td>
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPrintReceiptData({
                                            ...sEntry,
                                            studentName: feeDeskStudent.fullName || feeDeskStudent.studentName,
                                            rollNo: feeDeskStudent.rollNo,
                                            collegeName: feeDeskStudent.collegeName,
                                            universityName: feeDeskStudent.universityName,
                                            courseName: feeDeskStudent.courseName,
                                            currentClass: sEntry.currentClass || feeDeskStudent.currentClass,
                                            receiptNo: sEntry.receiptNo,
                                            paymentDate: sEntry.date || sEntry.feeDate || new Date().toISOString(),
                                            paymentMode: sEntry.paymentMode || 'Govt Scholarship Grant',
                                            transactionRef: sEntry.refNo || 'SCHOLARSHIP-GRANT',
                                            feeType: 'Scholarship Grant',
                                            paidFor: sEntry.purpose || sEntry.yearLabel || 'Scholarship Grant',
                                            amountPaid: sAmt
                                          });
                                        }}
                                        className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Print Official Scholarship Receipt"
                                      >
                                        <Printer className="w-3 h-3" />
                                        <span>Print</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingPaymentModal({
                                            ...sEntry,
                                            isScholarship: true,
                                            year: sEntry.year || 'year1',
                                            yearLabel: sEntry.purpose || sEntry.yearLabel || 'Scholarship',
                                            id: sEntry.id || sEntry.receiptNo,
                                            amountPaid: sAmt,
                                            feeDate: sEntry.feeDate ? sEntry.feeDate.split('T')[0] : (sEntry.date ? sEntry.date.split('T')[0] : new Date().toISOString().split('T')[0]),
                                            purpose: sEntry.purpose || sEntry.yearLabel || 'Scholarship',
                                            paymentMode: sEntry.paymentMode || 'Govt Scholarship Grant',
                                            refNo: sEntry.refNo || '-',
                                            receivedBy: sEntry.receivedBy || 'Admin Desk',
                                            remark: sEntry.remark || '',
                                            currentClass: sEntry.currentClass || feeDeskStudent.currentClass || 'SEM-1'
                                          });
                                          setEditPaymentError(null);
                                        }}
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit this scholarship entry"
                                      >
                                        <Edit3 className="w-3 h-3 text-indigo-600" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteScholarship(sEntry.year || sEntry.id, sAmt, sEntry.purpose || sEntry.yearLabel)}
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Delete this scholarship entry"
                                      >
                                        <Trash2 className="w-3 h-3 text-rose-600" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Bottom Action Buttons */}
            <div className="bg-slate-100 px-5 py-3 border-t border-slate-300 flex items-center justify-between shrink-0">
              {feeDeskMode === 'receive' ? (
                <button
                  type="button"
                  onClick={() => {
                    setPrintFeeCardStudent({
                      ...feeDeskStudent,
                      payments: feeDeskPayments
                    });
                  }}
                  className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-102 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Fee Card</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => {
                  setFeeDeskStudent(null);
                  fetchStudents();
                }}
                className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Go Back
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Individual Official Fee Receipt Print Modal */}
      {printReceiptData && (
        <PrintFeeReceipt
          receipt={printReceiptData}
          onClose={() => setPrintReceiptData(null)}
        />
      )}

      {/* Full Student Fee Card Statement Print Modal */}
      {printFeeCardStudent && (
        <PrintFeeCard
          student={printFeeCardStudent}
          payments={feeDeskPayments}
          onClose={() => setPrintFeeCardStudent(null)}
        />
      )}

      {/* Edit Payment Entry Modal */}
      {editingPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-extrabold uppercase tracking-wide">
                  Edit Entry ({editingPaymentModal.receiptNo || 'Receipt'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPaymentModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="p-5 space-y-4">
              {editPaymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {editPaymentError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Amount (₹)*
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={editingPaymentModal.amountPaid}
                    onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, amountPaid: e.target.value }))}
                    className="w-full px-3 py-2 text-base font-extrabold border-2 border-indigo-500 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-indigo-300 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter 0 or any corrected amount. Total fee, paid fee and remaining balance will update automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={editingPaymentModal.feeDate}
                    onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, feeDate: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {!(editingPaymentModal.isCenterFee || editingPaymentModal.isScholarship) && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Payment Mode*
                    </label>
                    <select
                      value={editingPaymentModal.paymentMode}
                      onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, paymentMode: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Online / UPI">Online / UPI</option>
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                      <option value="DD">DD</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Purpose*
                  </label>
                  <input
                    type="text"
                    value={editingPaymentModal.purpose}
                    onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Class / Semester
                  </label>
                  <input
                    type="text"
                    value={editingPaymentModal.currentClass}
                    onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, currentClass: e.target.value }))}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {!(editingPaymentModal.isCenterFee || editingPaymentModal.isScholarship) && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Transaction / Ref No
                      </label>
                      <input
                        type="text"
                        value={editingPaymentModal.refNo}
                        onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, refNo: e.target.value }))}
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Received By
                      </label>
                      <input
                        type="text"
                        value={editingPaymentModal.receivedBy}
                        onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, receivedBy: e.target.value }))}
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Remark
                      </label>
                      <input
                        type="text"
                        value={editingPaymentModal.remark}
                        onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, remark: e.target.value }))}
                        placeholder="Optional remark or note"
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingPaymentModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPaymentLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editPaymentLoading ? 'Updating...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {/* 0. Student Passport Photo & Identity Dossier Card */}
                <div className="bg-gradient-to-r from-indigo-50/90 via-white to-amber-50/70 p-4 sm:p-5 rounded-2xl border-2 border-indigo-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="relative group shrink-0 flex flex-col items-center">
                    <div 
                      onClick={() => profilePhotoInputRef.current?.click()}
                      title="Click to Upload or Change Photo"
                      className="w-28 h-32 rounded-xl overflow-hidden border-2 border-indigo-600 hover:border-indigo-800 shadow-md bg-white flex items-center justify-center cursor-pointer relative group transition-all"
                    >
                      {selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo ? (
                        <img 
                          src={selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo} 
                          alt={selectedStudent.fullName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                          <Users className="w-10 h-10 mb-1 text-slate-300" />
                          <span className="text-[10px] font-bold">No Photo Uploaded</span>
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-indigo-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                        <Camera className="w-5 h-5 mb-1 text-white" />
                        <span className="text-[10px] font-bold">Change Photo</span>
                      </div>
                    </div>

                    <input 
                      type="file" 
                      ref={profilePhotoInputRef} 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInitiatePhotoCrop(selectedStudent, file);
                        e.target.value = '';
                      }} 
                      className="hidden" 
                    />

                    <div className="flex items-center gap-1.5 mt-2 w-full">
                      <button
                        type="button"
                        onClick={() => profilePhotoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{photoUploading ? 'Uploading...' : ((selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo) ? 'Change Photo' : 'Upload Photo')}</span>
                      </button>
                      {(selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo) && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoForStudent(selectedStudent)}
                          disabled={photoUploading}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] transition cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {(selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo) && (
                      <a 
                        href={selectedStudent.studentImage || selectedStudent.photo || selectedStudent.documents?.student_image || selectedStudent.documents?.photo} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mt-1 text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 font-bold"
                        title="Open Full Resolution Photo"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Full Photo
                      </a>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-lg font-black uppercase text-slate-900 tracking-tight">{selectedStudent.fullName}</h3>
                      <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-lg text-xs font-mono">
                        Roll: {selectedStudent.rollNo}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg text-[10px] border border-emerald-300">
                        {selectedStudent.status || 'Active'}
                      </span>
                    </div>

                    <div className="text-xs text-indigo-950 font-bold">
                      🎓 {selectedStudent.courseName} • {selectedStudent.collegeName}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Father's Name</span>
                        <strong className="text-slate-800 truncate block">{selectedStudent.fatherName || '-'}</strong>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Mobile Contact</span>
                        <strong className="text-slate-800 font-mono truncate block">{selectedStudent.phone || selectedStudent.contact || '-'}</strong>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Session &amp; Satra</span>
                        <strong className="text-slate-800 truncate block">{selectedStudent.admissionSession || '2026-2027'} ({selectedStudent.admissionSatra || 'July'})</strong>
                      </div>
                      <div className="bg-white/80 p-2 rounded-xl border border-slate-200">
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Current Class</span>
                        <strong className="text-indigo-700 truncate block">{selectedStudent.currentClass || `SEM-${selectedStudent.currentSemester || 1}`}</strong>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.aadhaarNo || selectedStudent.aadharNo || selectedStudent.aadhaar_no || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Samagra ID</span>
                      <p className="font-mono font-bold text-indigo-900">{selectedStudent.samagraId || selectedStudent.samagra_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Enrollment No</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.enrollmentNo || selectedStudent.rollNo || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">ABC ID</span>
                      <p className="font-mono font-bold text-indigo-900">{selectedStudent.abcId || selectedStudent.abc_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">MPTASS ID</span>
                      <p className="font-mono font-bold text-emerald-800">{selectedStudent.mptassId || selectedStudent.mpTassId || selectedStudent.mptass_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">MPTASS Password</span>
                      <p className="font-mono font-bold text-slate-700">{selectedStudent.mptassPassword || selectedStudent.mpTassPassword || selectedStudent.mptass_password || '••••••'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">OTR ID</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.otrId || selectedStudent.otr_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">DEB ID / Scholer ID</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.debId || selectedStudent.deb_id || selectedStudent.scholerId || selectedStudent.scholarId || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">Scholarship ID (Scholer_id)</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.scholerId || selectedStudent.scholarId || selectedStudent.scholer_id || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-amber-100">
                      <span className="text-slate-400 block text-[10px]">User ID (User_id)</span>
                      <p className="font-mono font-bold text-slate-900">{selectedStudent.userId || selectedStudent.user_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Family Particulars */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    👤 Personal &amp; Family Particulars
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div><span className="text-slate-400 block text-[10px]">Student Full Name:</span><p className="font-bold text-slate-900 uppercase">{selectedStudent.fullName || selectedStudent.studentName || '-'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Mother's Name:</span><p className="font-semibold text-slate-800">{selectedStudent.motherName || selectedStudent.mother_name || 'N/A'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Father's Name:</span><p className="font-semibold text-slate-800">{selectedStudent.fatherName || selectedStudent.father_name || '-'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Date of Birth:</span><p className="font-semibold text-slate-800">{selectedStudent.dob || 'N/A'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Gender:</span><p className="font-semibold text-slate-800">{selectedStudent.gender || 'Not Specified'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Blood Group:</span><p className="font-semibold text-rose-700">{selectedStudent.bloodGroup || 'NA'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Contact Mobile:</span><p className="font-semibold text-slate-800 font-mono">{selectedStudent.phone || selectedStudent.contact || 'N/A'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Email Address:</span><p className="font-semibold text-slate-800">{selectedStudent.email || 'N/A'}</p></div>
                    <div><span className="text-slate-400 block text-[10px]">Social Category:</span><p className="font-semibold text-indigo-700">{selectedStudent.socialCategory || selectedStudent.category || 'General'}</p></div>
                    <div className="col-span-2 sm:col-span-3"><span className="text-slate-400 block text-[10px]">Full Residential Address:</span><p className="font-medium text-slate-800">{selectedStudent.address || '-'}{selectedStudent.city ? `, ${selectedStudent.city}` : ''}{selectedStudent.state ? `, ${selectedStudent.state}` : ''}{selectedStudent.pincode ? ` - ${selectedStudent.pincode}` : ''}</p></div>
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
            <form onSubmit={handleSaveEdit} noValidate className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              {/* Section: Personal Information */}
              {/* Section 1: Basic & Demographic Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Basic Personal Information &amp; Contact Details (मूल व व्यक्तिगत जानकारी)</span>
                </h4>

                {/* Student Photo & Identity Display */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    {/* Clickable Photo Box with Hover Overlay */}
                    <div 
                      onClick={() => editPhotoInputRef.current?.click()}
                      title="Click to Upload or Change Photo (फोटो अपलोड या बदलने के लिए क्लिक करें)"
                      className="relative group w-16 h-20 rounded-xl overflow-hidden border-2 border-slate-300 hover:border-indigo-600 bg-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition-all"
                    >
                      {editingStudent.studentImage || editingStudent.photo || editingStudent.documents?.student_image || editingStudent.documents?.photo ? (
                        <img 
                          src={editingStudent.studentImage || editingStudent.photo || editingStudent.documents?.student_image || editingStudent.documents?.photo} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <Users className="w-7 h-7" />
                          <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase tracking-tight">No Photo</span>
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-indigo-950/75 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-1 text-center">
                        <Camera className="w-4 h-4 mb-0.5 text-white" />
                        <span className="text-[9px] font-bold leading-tight">Change</span>
                      </div>
                    </div>

                    <div>
                      <span className="font-extrabold text-slate-900 text-sm block uppercase tracking-tight">
                        {editingStudent.fullName || editFormData.fullName}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Roll: <strong className="font-mono text-indigo-700">{editingStudent.rollNo || 'N/A'}</strong> • {editingStudent.courseName}
                      </span>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-block">
                          Enrolled Student Identity Record
                        </span>
                        {(editingStudent.studentImage || editingStudent.photo) && (
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Photo Attached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload & Manage Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <input 
                      type="file" 
                      ref={editPhotoInputRef} 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInitiatePhotoCrop(editingStudent, file);
                        e.target.value = '';
                      }} 
                      className="hidden" 
                    />
                    
                    <button
                      type="button"
                      onClick={() => editPhotoInputRef.current?.click()}
                      disabled={photoUploading}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      title="Upload Student Photo from Device"
                    >
                      <Camera className="w-4 h-4" />
                      <span>
                        {photoUploading ? 'Uploading...' : ((editingStudent.studentImage || editingStudent.photo) ? 'Change Photo (फोटो बदलें)' : 'Upload Photo (फोटो अपलोड करें)')}
                      </span>
                    </button>

                    {(editingStudent.studentImage || editingStudent.photo) && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhotoForStudent(editingStudent)}
                        disabled={photoUploading}
                        className="inline-flex items-center gap-1 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={editFormData.fullName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      placeholder="Student full name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold uppercase focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Father's Name</label>
                    <input
                      type="text"
                      value={editFormData.fatherName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })}
                      placeholder="Father's name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium uppercase focus:bg-white"
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
                    <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB)</label>
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
                  <div>
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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category (वर्ग)</label>
                    <select
                      value={editFormData.socialCategory || 'General'}
                      onChange={(e) => setEditFormData({ ...editFormData, socialCategory: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Medium (माध्यम)</label>
                    <select
                      value={editFormData.medium || 'Hindi'}
                      onChange={(e) => setEditFormData({ ...editFormData, medium: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={editFormData.bloodGroup || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                      placeholder="e.g. O+, A+, B+"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium uppercase focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">Address (स्थायी पता)</label>
                    <input
                      type="text"
                      value={editFormData.address || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Government KYC & Portal IDs */}
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Government Portal, KYC &amp; Scholarship IDs (सरकारी पोर्टल एवं छात्रवृत्ति आईडी)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">ABC ID (Academic Bank of Credits)</label>
                    <input
                      type="text"
                      value={editFormData.abcId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, abcId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MPTASS User ID</label>
                    <input
                      type="text"
                      value={editFormData.mptassId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, mptassId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">MPTASS Password</label>
                    <input
                      type="text"
                      value={editFormData.mptassPassword || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, mptassPassword: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">OTR ID (One Time Registration)</label>
                    <input
                      type="text"
                      value={editFormData.otrId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, otrId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">DEB ID (Distance Education Bureau)</label>
                    <input
                      type="text"
                      value={editFormData.debId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, debId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Scholar ID (स्कॉलर आईडी)</label>
                    <input
                      type="text"
                      value={editFormData.scholerId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, scholerId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Portal User ID</label>
                    <input
                      type="text"
                      value={editFormData.userId || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, userId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:border-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Student Photo URL / File Path</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editFormData.studentImage || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, studentImage: e.target.value })}
                        placeholder="/uploads/documents/... or image URL"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => editPhotoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Browse & Upload Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Browse</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Academic & Institutional Particulars */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 border-b pb-1.5 text-xs uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Academic, University &amp; Session Details (शैक्षणिक व यूनिवर्सिटी विवरण)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Roll Number / Enrollment</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional (ऐच्छिक)</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.rollNo || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNo: e.target.value })}
                      placeholder="Leave blank if not assigned"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white uppercase text-slate-900"
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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Type</label>
                    <select
                      value={editFormData.courseType || 'UG'}
                      onChange={(e) => setEditFormData({ ...editFormData, courseType: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="UG">UG (Under Graduate)</option>
                      <option value="PG">PG (Post Graduate)</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Certificate">Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Mode</label>
                    <select
                      value={editFormData.courseMode || 'Regular'}
                      onChange={(e) => setEditFormData({ ...editFormData, courseMode: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Private">Private</option>
                      <option value="Distance">Distance</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Session (सत्र)</label>
                    <input
                      type="text"
                      value={editFormData.admissionSession || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, admissionSession: e.target.value })}
                      placeholder="e.g. 2022-2023, 2024-2025"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-semibold focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Satra (जुलाई/जनवरी)</label>
                    <select
                      value={editFormData.admissionSatra || 'July'}
                      onChange={(e) => setEditFormData({ ...editFormData, admissionSatra: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    >
                      <option value="July">July</option>
                      <option value="January">January</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={editFormData.admissionDate || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, admissionDate: e.target.value })}
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
                      min="0"
                      value={editFormData.totalFee !== undefined && editFormData.totalFee !== null ? editFormData.totalFee : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, totalFee: e.target.value })}
                      placeholder="0"
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
                      value={editFormData.scholarshipAmount !== undefined && editFormData.scholarshipAmount !== null ? editFormData.scholarshipAmount : ''}
                      onChange={(e) => setEditFormData({ ...editFormData, scholarshipAmount: e.target.value })}
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
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cancelled Admission?</label>
                    <input
                      type="text"
                      value={editFormData.cancel || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, cancel: e.target.value })}
                      placeholder="Leave blank if not cancelled"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block font-bold text-slate-700 mb-1">Remark (रिमार्क / विशेष टिप्पणी)</label>
                    <input
                      type="text"
                      value={editFormData.remark || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                      placeholder="e.g. Total Fees: 22500/-, Scholarship + 20000/-, or admission note"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Display existing secondary / dual programs{/* Display existing secondary / dual programs if student already has them */}
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
                      <label className="block font-bold text-slate-800 mb-1">University Name (विश्वविद्यालय)</label>
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
                      >
                        <option value="">-- Select University --</option>
                        {universitiesList.map(u => (
                          <option key={u.id} value={u.name}>{u.name} {u.shortName ? `(${u.shortName})` : ''}</option>
                        ))}
                      </select>
                    </div>

                    {/* College Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">College Name (महाविद्यालय)</label>
                      <select
                        value={newCourseData.collegeName}
                        onChange={(e) => setNewCourseData({ ...newCourseData, collegeName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">-- Select College --</option>
                        {collegesList
                          .filter(c => {
                            if (!newCourseData.universityName) return true;
                            const tu = newCourseData.universityName.toLowerCase();
                            const cu = (c.universityName || '').toLowerCase();
                            if (cu === tu) return true;
                            if (cu && tu && (cu.includes(tu) || tu.includes(cu))) return true;
                            if (tu.includes('mcbu') || tu.includes('chhatrasal')) return cu.includes('mcbu') || cu.includes('chhatrasal') || c.universityId === 'univ-mcbu';
                            if (tu.includes('subharti') || tu.includes('bharti')) return cu.includes('subharti') || cu.includes('bharti') || c.universityId === 'univ-subharti' || c.universityId === 'univ-1789571739470-15';
                            if (tu.includes('ies')) return cu.includes('ies') || c.universityId === 'univ-ies' || c.universityId === 'univ-1789571739470-940';
                            if (tu.includes('mcrpv') || tu.includes('makhanlal')) return cu.includes('mcrpv') || cu.includes('makhanlal') || c.universityId === 'univ-1789571739470-506';
                            if (tu.includes('bhabha')) return cu.includes('bhabha');
                            if (tu.includes('gyanveer')) return cu.includes('gyanveer');
                            if (tu.includes('mmyvv') || tu.includes('maharishi') || tu.includes('vedic')) return cu.includes('mmyvv') || cu.includes('maharishi') || cu.includes('vedic');
                            if (tu.includes('mpu') || tu.includes('madhyanchal')) return cu.includes('mpu') || cu.includes('madhyanchal');
                            if (tu.includes('sku') || tu.includes('krishna')) return cu.includes('sku') || cu.includes('krishna');
                            if (tu.includes('chitrakoot') || tu.includes('gramodaya') || tu.includes('mgcgv')) return cu.includes('chitrakoot') || cu.includes('gramodaya') || cu.includes('mgcgv');
                            return false;
                          })
                          .map(c => (
                            <option key={c.id} value={c.name}>{c.code ? `${c.code} - ` : ''}{c.name}</option>
                          ))
                        }
                      </select>
                    </div>

                    {/* Course Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Course / Degree Name</label>
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
                        <span>Admission Date (प्रवेश तिथि)</span>
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
                      <label className="block font-bold text-slate-800 mb-1">2nd Course Total Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={newCourseData.totalFee}
                        onChange={(e) => setNewCourseData({ ...newCourseData, totalFee: Number(e.target.value) || 0 })}
                        className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Cancel Admission Button on the Left */}
                <button
                  type="button"
                  onClick={() => setCancellingStudent(editingStudent)}
                  className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs hover:shadow text-xs"
                  title="Cancel this student's admission and move to Cancelled Admissions registry"
                >
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Cancel Admission (एडमिशन रद्द करें)</span>
                </button>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                  >
                    Close
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Admission Confirmation & Details Modal */}
      {cancellingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-rose-200 animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/30 border border-rose-400/50 flex items-center justify-center font-black">
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Confirm Admission Cancellation (प्रवेश रद्द करें)
                  </h3>
                  <p className="text-xs text-rose-200">
                    This will remove the student from active enrollment and move them to Cancelled Admissions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingStudent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Student Summary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm uppercase">
                    {cancellingStudent.fullName || cancellingStudent.studentName}
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Roll: {cancellingStudent.rollNo || 'N/A'}
                  </span>
                </div>
                <div className="text-slate-600 text-xs">
                  🎓 {cancellingStudent.courseName} • {cancellingStudent.collegeName}
                </div>
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Course Fee:</span>
                    <strong className="text-slate-900 font-bold">₹{Number(cancellingStudent.totalFee || cancellingStudent.studentFee || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Fee Deposited by Student:</span>
                    <strong className="text-emerald-700 font-bold">₹{Number(cancellingStudent.totalPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Cancellation Reason Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Reason for Cancellation (रद्द करने का कारण) *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Student Request / Discontinued">Student Request (छात्र का व्यक्तिगत अनुरोध)</option>
                  <option value="College / University Transfer">College / University Transfer (अन्य कॉलेज में प्रवेश)</option>
                  <option value="Course Fee Constraint">Course Fee Constraint (आर्थिक / फीस समस्या)</option>
                  <option value="Personal / Family Reasons">Personal / Family Reasons (पारिवारिक / व्यक्तिगत कारण)</option>
                  <option value="Document Ineligibility">Document Ineligibility (दस्तावेज़ अपूर्ण / अपात्र)</option>
                  <option value="Other Administration Decision">Other Administration Decision (अन्य प्रशासनिक कारण)</option>
                </select>
              </div>

              {/* Immediate Refund Option */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-700" /> Immediate Fee Refund Paid (तत्काल रिफंड भुगतान)
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Optional (बाद में भी कर सकते हैं)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Refund Paid Today (₹)</label>
                    <input
                      type="number"
                      min="0"
                      max={cancellingStudent.totalPaid || 0}
                      value={cancelRefundPaid}
                      onChange={(e) => setCancelRefundPaid(e.target.value)}
                      placeholder="0"
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-0.5">Refund Mode</label>
                    <select
                      value={cancelPaymentMode}
                      onChange={(e) => setCancelPaymentMode(e.target.value)}
                      className="w-full p-2 bg-white border border-amber-300 rounded-xl font-semibold text-slate-800"
                    >
                      <option value="Cash">Cash (नकद)</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Total deposited was ₹{Number(cancellingStudent.totalPaid || 0).toLocaleString('en-IN')}. Remaining balance will be tracked in Cancelled Admissions desk.
                </p>
              </div>

              {/* Warning Notice */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Confirm karne par ye student <strong>Enrolled Students section se hat jayega</strong> aur portal ke <strong>Cancelled Admissions desk</strong> mein move ho jayega. (Aap wahan se kabhi bhi wapas restore kar sakte hain).
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCancellingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Keep Admission (वापस जाएं)
                </button>
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={handleConfirmCancelAdmission}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{cancelLoading ? 'Cancelling...' : 'Confirm & Cancel Admission'}</span>
                </button>
              </div>
            </div>
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

      {/* Image Cropper Modal */}
      {croppingImageSrc && (
        <ImageCropperModal
          imageSrc={croppingImageSrc}
          onClose={() => {
            setCroppingImageSrc(null);
            setCroppingStudent(null);
          }}
          onCropComplete={handleCropComplete}
          title={`Crop Photo: ${croppingStudent?.fullName || croppingStudent?.studentName || 'Student'}`}
        />
      )}

    </div>
  );
}
