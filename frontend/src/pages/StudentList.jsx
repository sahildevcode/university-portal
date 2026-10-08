import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Search, Filter, Eye, EyeOff, Printer, CreditCard, Award, 
  FileText, CheckCircle, AlertCircle, X, Download, ExternalLink, Trash2, Calendar,
  ArrowLeft, RotateCcw, ChevronDown, Edit3, Zap, Save, CheckCircle2, UploadCloud,
  PlusCircle, BookOpen, School, GraduationCap, Camera, UserX, Ban, AlertTriangle,
  Sparkles
} from 'lucide-react';
import * as XLSX from 'xlsx';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';
import PrintMarksheet from '../components/PrintMarksheet';
import PrintFeeReceipt from '../components/PrintFeeReceipt';
import PrintFeeCard from '../components/PrintFeeCard';
import StudentTermsAndConditions from '../components/StudentTermsAndConditions';
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
  filterStartDate = '',
  filterEndDate = '',
  onFeeReceived,
  isRecordsDesk = false
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
  const [filterCourse, setFilterCourse] = useState('all');
  const [appliedSession, setAppliedSession] = useState('all');
  const [appliedSatra, setAppliedSatra] = useState('all');
  const [appliedUniversity, setAppliedUniversity] = useState('all');
  const [appliedCollege, setAppliedCollege] = useState('all');
  const [appliedCourse, setAppliedCourse] = useState('all');
  const [feeCategoryFilter, setFeeCategoryFilter] = useState('all');

  // Entries / Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Excel Export Modal & Filter States
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSession, setExportSession] = useState('all');
  const [exportSatra, setExportSatra] = useState('all');
  const [exportUniversity, setExportUniversity] = useState('all');
  const [exportCollege, setExportCollege] = useState('all');
  const [exportCourse, setExportCourse] = useState('all');
  const [exportYear, setExportYear] = useState('all');
  const [exportFeeStatus, setExportFeeStatus] = useState('all');

  // Student lookup key helper by RollNo, ID, or EnrollmentNo
  const getStudentKey = (s) => {
    if (!s) return '';
    if (s.rollNo && String(s.rollNo).trim()) return String(s.rollNo).trim();
    if (s.id && String(s.id).trim()) return String(s.id).trim();
    if (s.enrollmentNo && String(s.enrollmentNo).trim()) return String(s.enrollmentNo).trim();
    if (s.registrationNo && String(s.registrationNo).trim()) return String(s.registrationNo).trim();
  };

  // Helper to compute Year-Wise fee, scholarship, and received fee breakdown (1st, 2nd, 3rd, 4th Year)
  const calculateStudentYearBreakdown = (item) => {
    if (!item) return {
      feeY1: 0, schY1: 0, recY1: 0, totalY1: 0, dueY1: 0, advY1: 0, net1: 0, hasY1Activity: false,
      feeY2: 0, schY2: 0, recY2: 0, totalY2: 0, dueY2: 0, advY2: 0, net2: 0, hasY2Activity: false,
      feeY3: 0, schY3: 0, recY3: 0, totalY3: 0, dueY3: 0, advY3: 0, net3: 0, hasY3Activity: false,
      feeY4: 0, schY4: 0, recY4: 0, totalY4: 0, dueY4: 0, advY4: 0, net4: 0, hasY4Activity: false,
      totalFee: 0, totalSch: 0, totalPaid: 0, totalRem: 0,
      advanceAmount: 0, isAdvance: false, nextFeeDueDate: null, cat: 'full_course_fee'
    };

    // 1. Academic Fee per Year
    let feeY1 = 0, feeY2 = 0, feeY3 = 0, feeY4 = 0;
    if (Array.isArray(item.academicFeeHistory) && item.academicFeeHistory.length > 0) {
      item.academicFeeHistory.forEach(entry => {
        const cls = (entry.currentClass || '').toUpperCase();
        const amt = Number(entry.amountPaid !== undefined ? entry.amountPaid : (entry.amount || entry.fee || 0));
        if (cls.includes('SEM-1') || cls.includes('SEM-2') || cls.includes('YEAR-1') || cls.includes('1ST')) {
          feeY1 += amt;
        } else if (cls.includes('SEM-3') || cls.includes('SEM-4') || cls.includes('YEAR-2') || cls.includes('2ND')) {
          feeY2 += amt;
        } else if (cls.includes('SEM-5') || cls.includes('SEM-6') || cls.includes('YEAR-3') || cls.includes('3RD')) {
          feeY3 += amt;
        } else if (cls.includes('SEM-7') || cls.includes('SEM-8') || cls.includes('YEAR-4') || cls.includes('4TH')) {
          feeY4 += amt;
        } else {
          feeY1 += amt;
        }
      });
    } else {
      feeY1 = Number(item.academicFeeYear1 !== undefined ? item.academicFeeYear1 : (item.feeYear1 !== undefined ? item.feeYear1 : (item.academicFee !== undefined && item.academicFee !== null ? item.academicFee : (item.studentFee || 0))));
      feeY2 = Number(item.academicFeeYear2 !== undefined ? item.academicFeeYear2 : (item.feeYear2 || 0));
      feeY3 = Number(item.academicFeeYear3 !== undefined ? item.academicFeeYear3 : (item.feeYear3 || 0));
      feeY4 = Number(item.academicFeeYear4 !== undefined ? item.academicFeeYear4 : (item.feeYear4 || 0));
    }

    const totalAcadFee = (feeY1 + feeY2 + feeY3 + feeY4) > 0
      ? (feeY1 + feeY2 + feeY3 + feeY4)
      : Number(item.academicFee !== undefined && item.academicFee !== null ? item.academicFee : (item.studentFee || 0));

    // 2. Scholarship per Year
    let schY1 = 0, schY2 = 0, schY3 = 0, schY4 = 0;
    if (Array.isArray(item.scholarshipHistory) && item.scholarshipHistory.length > 0) {
      item.scholarshipHistory.forEach(entry => {
        const amt = Number(entry.amountPaid !== undefined ? entry.amountPaid : (entry.amount || entry.fee || 0));
        const cls = String(entry.currentClass || '').toUpperCase();
        const yStr = String(entry.year || '').toLowerCase();
        if (yStr === 'year1' || yStr === '1' || cls.includes('SEM-1') || cls.includes('SEM-2') || cls.includes('YEAR-1') || cls.includes('1ST') || cls.includes('YEAR 1')) {
          schY1 += amt;
        } else if (yStr === 'year2' || yStr === '2' || cls.includes('SEM-3') || cls.includes('SEM-4') || cls.includes('YEAR-2') || cls.includes('2ND') || cls.includes('YEAR 2')) {
          schY2 += amt;
        } else if (yStr === 'year3' || yStr === '3' || cls.includes('SEM-5') || cls.includes('SEM-6') || cls.includes('YEAR-3') || cls.includes('3RD') || cls.includes('YEAR 3')) {
          schY3 += amt;
        } else if (yStr === 'year4' || yStr === '4' || cls.includes('SEM-7') || cls.includes('SEM-8') || cls.includes('YEAR-4') || cls.includes('4TH') || cls.includes('YEAR 4')) {
          schY4 += amt;
        } else {
          schY1 += amt;
        }
      });
    } else {
      schY1 = Number(item.scholarshipYear1 !== undefined && item.scholarshipYear1 !== null ? item.scholarshipYear1 : (!item.scholarshipYear2 ? (item.scholarshipAmount || 0) : 0));
      schY2 = Number(item.scholarshipYear2 || 0);
      schY3 = Number(item.scholarshipYear3 || 0);
      schY4 = Number(item.scholarshipYear4 || 0);
    }
    const totalSch = (schY1 + schY2 + schY3 + schY4) > 0 ? (schY1 + schY2 + schY3 + schY4) : Number(item.scholarshipAmount || 0);

    // 3. Category & Year-wise Payable Fee
    const rawCat = item.feeCategory;
    const cat = (rawCat === 'full_course_fee' || rawCat === 'fees_base')
      ? 'full_course_fee'
      : (rawCat === 'course_fee_scholarship' || rawCat === 'academics')
        ? 'course_fee_scholarship'
        : (rawCat === 'full_scholarship' || rawCat === 'scholarship')
          ? 'full_scholarship'
          : ((totalAcadFee > 0 && totalSch > 0)
              ? 'course_fee_scholarship'
              : (totalAcadFee > 0 ? 'full_course_fee' : 'full_scholarship'));

    const regFee = Number(item.registrationFee || item.regFee || 0);

    const calcYrTotal = (yrAcad, yrSch, isY1 = false) => {
      const extra = isY1 ? regFee : 0;
      if (cat === 'full_course_fee') {
        return yrAcad + extra;
      }
      // For both course_fee_scholarship and full_scholarship:
      // If student has course fee entered, add it! If course fee is 0, it's pure scholarship
      return yrAcad + yrSch + extra;
    };

    const totalY1 = calcYrTotal(feeY1, schY1, true);
    const totalY2 = calcYrTotal(feeY2, schY2, false);
    const totalY3 = calcYrTotal(feeY3, schY3, false);
    const totalY4 = calcYrTotal(feeY4, schY4, false);

    let totalFee = 0;
    if (cat === 'full_course_fee') {
      totalFee = (totalAcadFee > 0 ? totalAcadFee : Number(item.totalFee || item.studentFee || 0)) + regFee;
    } else {
      totalFee = totalAcadFee + totalSch + regFee;
    }

    // 4. Received Fees per Year
    let recY1 = 0, recY2 = 0, recY3 = 0, recY4 = 0;
    const payList = (Array.isArray(item.payments) && item.payments.length > 0)
      ? item.payments
      : (Array.isArray(item.feeHistory) && item.feeHistory.length > 0)
        ? item.feeHistory
        : [];

    if (payList.length > 0) {
      payList.forEach(p => {
        const cls = (p.currentClass || p.year || p.semester || '').toUpperCase();
        const amt = Number(p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0));
        if (cls.includes('YEAR1') || cls.includes('SEM-1') || cls.includes('SEM-2') || cls.includes('YEAR-1') || cls.includes('1ST')) {
          recY1 += amt;
        } else if (cls.includes('YEAR2') || cls.includes('SEM-3') || cls.includes('SEM-4') || cls.includes('YEAR-2') || cls.includes('2ND')) {
          recY2 += amt;
        } else if (cls.includes('YEAR3') || cls.includes('SEM-5') || cls.includes('SEM-6') || cls.includes('YEAR-3') || cls.includes('3RD')) {
          recY3 += amt;
        } else if (cls.includes('YEAR4') || cls.includes('SEM-7') || cls.includes('SEM-8') || cls.includes('YEAR-4') || cls.includes('4TH')) {
          recY4 += amt;
        } else {
          recY1 += amt;
        }
      });
    } else {
      recY1 = Number(item.paidYear1 || 0);
      recY2 = Number(item.paidYear2 || 0);
      recY3 = Number(item.paidYear3 || 0);
      recY4 = Number(item.paidYear4 || 0);
    }

    const totalPaid = payList.length > 0 ? (recY1 + recY2 + recY3 + recY4) : ((recY1 + recY2 + recY3 + recY4) > 0 ? (recY1 + recY2 + recY3 + recY4) : Number(item.totalPaid || 0));
    const totalRem = Math.max(0, totalFee - totalPaid);
    const advanceAmount = totalPaid > totalFee ? (totalPaid - totalFee) : 0;
    const isAdvance = advanceAmount > 0;

    const hasY1Activity = (feeY1 > 0 || schY1 > 0 || recY1 > 0);
    const hasY2Activity = (feeY2 > 0 || schY2 > 0 || recY2 > 0);
    const hasY3Activity = (feeY3 > 0 || schY3 > 0 || recY3 > 0);
    const hasY4Activity = (feeY4 > 0 || schY4 > 0 || recY4 > 0);

    const net1 = hasY1Activity ? (totalY1 - recY1) : 0;
    const dueY1 = hasY1Activity && net1 > 0 ? net1 : 0;
    const advY1 = hasY1Activity && net1 < 0 ? Math.abs(net1) : 0;

    // Year 2: Only calculate if Year 2 has activity!
    const net2 = hasY2Activity ? (totalY2 + net1 - recY2) : 0;
    const dueY2 = hasY2Activity && net2 > 0 ? net2 : 0;
    const advY2 = hasY2Activity && net2 < 0 ? Math.abs(net2) : 0;

    // Year 3: Only calculate if Year 3 has activity! (Do not auto-extend Year 2 dues into Year 3!)
    const net3 = hasY3Activity ? (totalY3 + (hasY2Activity ? net2 : net1) - recY3) : 0;
    const dueY3 = hasY3Activity && net3 > 0 ? net3 : 0;
    const advY3 = hasY3Activity && net3 < 0 ? Math.abs(net3) : 0;

    // Year 4: Only calculate if Year 4 has activity!
    const net4 = hasY4Activity ? (totalY4 + (hasY3Activity ? net3 : hasY2Activity ? net2 : net1) - recY4) : 0;
    const dueY4 = hasY4Activity && net4 > 0 ? net4 : 0;
    const advY4 = hasY4Activity && net4 < 0 ? Math.abs(net4) : 0;

    let nextFeeDueDate = item.nextFeeDueDate || null;
    if (!nextFeeDueDate && Array.isArray(item.promotionHistory) && item.promotionHistory.length > 0) {
      for (let i = item.promotionHistory.length - 1; i >= 0; i--) {
        if (item.promotionHistory[i].nextFeeDueDate) {
          nextFeeDueDate = item.promotionHistory[i].nextFeeDueDate;
          break;
        }
      }
    }

    return {
      feeY1, schY1, recY1, totalY1, dueY1, advY1, net1, hasY1Activity,
      feeY2, schY2, recY2, totalY2, dueY2, advY2, net2, hasY2Activity,
      feeY3, schY3, recY3, totalY3, dueY3, advY3, net3, hasY3Activity,
      feeY4, schY4, recY4, totalY4, dueY4, advY4, net4, hasY4Activity,
      totalFee, totalSch, totalPaid, totalRem,
      advanceAmount, isAdvance, nextFeeDueDate,
      cat
    };
  };

  // Table Column Display Mode: 'all' (39+ fields horizontal scroll) or 'compact'
  const [tableColumnMode, setTableColumnMode] = useState('all');

  // Toggle for Year-Wise Fee Breakdown Columns (1st, 2nd, 3rd & 4th Year - All 12 Columns)
  const [showYearWiseFees, setShowYearWiseFees] = useState(() => {
    try {
      const saved = localStorage.getItem('pkc_show_year_wise_fees');
      return saved !== null ? saved === 'true' : false; // Default to FALSE: "sab hide karna hai"
    } catch {
      return false;
    }
  });

  const toggleYearWiseFees = () => {
    setShowYearWiseFees(prev => {
      const next = !prev;
      try { localStorage.setItem('pkc_show_year_wise_fees', String(next)); } catch (e) {}
      return next;
    });
  };

  // Unified "Paid Student Fee" & Fee Desk Modal State (Matching User Ref Images)
  const [feeDeskStudent, setFeeDeskStudent] = useState(null);
  const [feeDeskMode, setFeeDeskMode] = useState('receive'); // 'receive' | 'set_fee' | 'set_scholarship'
  const [feeDeskPayments, setFeeDeskPayments] = useState([]);
  const [feeDeskClass, setFeeDeskClass] = useState('SEM-1');
  const [feeDeskDate, setFeeDeskDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeDeskPurpose, setFeeDeskPurpose] = useState('Tuition Fee');
  const [isCustomPurpose, setIsCustomPurpose] = useState(false);
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
  const [cancelOtherReason, setCancelOtherReason] = useState('');
  const [cancelRefundPaid, setCancelRefundPaid] = useState('0');
  const [cancelPaymentMode, setCancelPaymentMode] = useState('Cash');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Course Completion State
  const [completingStudent, setCompletingStudent] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [completionRemark, setCompletionRemark] = useState('All semesters/terms completed successfully');

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

  // Canonical course normalizer to merge duplicates (e.g. B.com, B.Com, B.COM, B.Com. -> B.Com)
  const normalizeCourseName = (name) => {
    if (!name || typeof name !== 'string') return '';
    const raw = name.trim();
    const upper = raw.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ').trim();
    
    if (upper === 'BA' || upper === 'B A') return 'BA';
    if (upper === 'MA' || upper === 'M A') return 'MA';
    if (upper === 'BCOM' || upper === 'B COM') return 'B.Com';
    if (upper === 'MCOM' || upper === 'M COM') return 'M.Com';
    if (upper === 'BSC' || upper === 'B SC') return 'B.Sc';
    if (upper === 'MSC' || upper === 'M SC') return 'M.Sc';
    if (upper === 'BCA' || upper === 'B C A') return 'BCA';
    if (upper === 'MCA' || upper === 'M C A') return 'MCA';
    if (upper === 'BBA' || upper === 'B B A') return 'BBA';
    if (upper === 'MBA' || upper === 'M B A') return 'MBA';
    if (upper === 'BED' || upper === 'B ED') return 'B.Ed';
    if (upper === 'BELED' || upper === 'B EL ED') return 'B.El.Ed';
    if (upper === 'BPED' || upper === 'B P ED') return 'B.P.Ed';
    if (upper === 'BLIB' || upper === 'B LIB') return 'B.Lib';
    if (upper === 'MLIB' || upper === 'M LIB') return 'M.Lib';
    if (upper === 'DCA' || upper === 'D C A') return 'DCA';
    if (upper === 'PGDCA' || upper === 'P G D C A') return 'PGDCA';
    if (upper === 'BTECH' || upper === 'B TECH') return 'B.Tech';
    if (upper === 'MTECH' || upper === 'M TECH') return 'M.Tech';
    if (upper === 'LLM' || upper === 'L L M') return 'LLM';
    if (upper === 'LLB' || upper === 'L L B') return 'LLB';
    if (upper === 'BALLB' || upper === 'B A LLB') return 'B.A.LLB';
    if (upper === 'MSW' || upper === 'M S W') return 'MSW';
    if (upper === 'BSW' || upper === 'B S W') return 'BSW';
    if (upper === 'MSC MATH' || upper === 'M SC MATH' || upper === 'MSC (MATHEMATICS)') return 'M.Sc.(Mathematics)';
    
    return raw.replace(/\.+$/, '');
  };

  // Dynamic list of all courses without duplicates (deduplicated across Universities, Catalog, Colleges & Students)
  const allAvailableCourses = (() => {
    let sourceCourses = [];
    
    // If a university is selected, find courses from that university's colleges and students
    if (filterUniversity !== 'all') {
      const targetUniv = universitiesList.find(u => u.name === filterUniversity);
      const targetId = targetUniv?.id;
      const tu = filterUniversity.toLowerCase();
      
      const univColleges = collegesList.filter(c => {
        if (targetId && c.universityId === targetId) return true;
        const cu = (c.universityName || '').toLowerCase();
        return cu === tu || (cu && tu && (cu.includes(tu) || tu.includes(cu)));
      });
      
      univColleges.forEach(col => {
        (col.courses || []).forEach(crs => {
          const cName = crs.name || crs.courseName || crs.program || crs.degree;
          if (cName) sourceCourses.push(cName);
        });
      });

      // Also include courses from students under this university
      students.forEach(s => {
        const su = (s.universityName || s.collegeName || '').toLowerCase();
        if (su.includes(tu) || tu.includes(su)) {
          if (s.courseName) sourceCourses.push(s.courseName);
          if (s.course) sourceCourses.push(s.course);
          (s.linkedCourses || []).forEach(l => {
            if (l.courseName) sourceCourses.push(l.courseName);
          });
        }
      });
    }

    // If no university is selected, or if the selected university has no mapped courses yet, include all sources
    if (sourceCourses.length === 0) {
      sourceCourses = [
        ...allCoursesList.map(c => c.name),
        ...(Array.isArray(courses) ? courses.map(c => c.name) : []),
        ...collegesList.flatMap(c => (c.courses || []).map(crs => crs.name || crs.courseName || crs.program || crs.degree)),
        ...students.map(s => s.courseName || s.course),
        ...students.flatMap(s => (s.linkedCourses || []).map(l => l.courseName || l.course))
      ];
    }

    // Deduplicate into canonical clean course names
    const uniqueMap = new Map();
    sourceCourses.filter(Boolean).forEach(raw => {
      const canonical = normalizeCourseName(raw);
      if (canonical && !uniqueMap.has(canonical.toLowerCase())) {
        uniqueMap.set(canonical.toLowerCase(), canonical);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  })();

  const handleFilterCourseChange = (newCourse) => {
    setFilterCourse(newCourse);
    setAppliedCourse(newCourse);
    setCurrentPage(1);
  };

  const handleFilterUniversityChange = (newUniv) => {
    setFilterUniversity(newUniv);
    setAppliedUniversity(newUniv);
    setFilterCollege('all');
    setAppliedCollege('all');
    setFilterCourse('all');
    setAppliedCourse('all');
    setCurrentPage(1);
  };

  const handleFilterCollegeChange = (newCol) => {
    setFilterCollege(newCol);
    setAppliedCollege(newCol);
    setCurrentPage(1);
  };

  const handleFilterSessionChange = (newSess) => {
    setFilterSession(newSess);
    setAppliedSession(newSess);
    setCurrentPage(1);
  };

  const handleFilterSatraChange = (newSatra) => {
    setFilterSatra(newSatra);
    setAppliedSatra(newSatra);
    setCurrentPage(1);
  };

  // Excel Export: Dynamic Available Colleges based on Export University selection
  const exportAvailableColleges = (() => {
    if (exportUniversity === 'all') return collegesList;
    const targetUniv = universitiesList.find(u => u.name === exportUniversity);
    const targetId = targetUniv?.id;
    const tu = exportUniversity.toLowerCase();
    return collegesList.filter(c => {
      if (targetId && c.universityId === targetId) return true;
      const cu = (c.universityName || '').toLowerCase();
      return cu === tu || (cu && tu && (cu.includes(tu) || tu.includes(cu)));
    });
  })();

  // Excel Export: Dynamic Available Courses based on Export University & Colleges
  const exportAvailableCourses = (() => {
    if (exportUniversity === 'all') return allAvailableCourses;
    const targetUniv = universitiesList.find(u => u.name === exportUniversity);
    const targetId = targetUniv?.id;
    const tu = exportUniversity.toLowerCase();
    
    let sourceCourses = [];
    exportAvailableColleges.forEach(col => {
      (col.courses || []).forEach(crs => {
        const cName = crs.name || crs.courseName || crs.program || crs.degree;
        if (cName) sourceCourses.push(cName);
      });
    });

    students.forEach(s => {
      const su = (s.universityName || s.collegeName || '').toLowerCase();
      if (su.includes(tu) || tu.includes(su)) {
        if (s.courseName) sourceCourses.push(s.courseName);
        if (s.course) sourceCourses.push(s.course);
        (s.linkedCourses || []).forEach(l => {
          if (l.courseName) sourceCourses.push(l.courseName);
        });
      }
    });

    if (sourceCourses.length === 0) return allAvailableCourses;

    const uniqueMap = new Map();
    sourceCourses.filter(Boolean).forEach(raw => {
      const canonical = normalizeCourseName(raw);
      if (canonical && !uniqueMap.has(canonical.toLowerCase())) {
        uniqueMap.set(canonical.toLowerCase(), canonical);
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => a.localeCompare(b));
  })();

  // Open Export Modal with current active filters as initial defaults
  const handleOpenExportModal = () => {
    setExportSession(appliedSession !== 'all' ? appliedSession : 'all');
    setExportSatra(appliedSatra !== 'all' ? appliedSatra : 'all');
    setExportUniversity(appliedUniversity !== 'all' ? appliedUniversity : 'all');
    setExportCollege(appliedCollege !== 'all' ? appliedCollege : 'all');
    setExportCourse(appliedCourse !== 'all' ? appliedCourse : 'all');
    setExportYear('all');
    setExportFeeStatus(dueFilter !== 'all' ? dueFilter : 'all');
    setShowExportModal(true);
  };

  // Filter students based on Export Modal selections
  const getExportFilteredStudents = () => {
    return students.filter(s => {
      if (s.isSecondaryCourse) return false;
      if (s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes') return false;

      // Fee status filter
      const feeDetails = calculateStudentYearBreakdown(s);
      if (exportFeeStatus === 'due_only') {
        if (feeDetails.totalRem <= 0) return false;
      } else if (exportFeeStatus === 'cleared') {
        if (feeDetails.totalRem > 0) return false;
      } else if (exportFeeStatus === 'advance_only') {
        if (feeDetails.advanceAmount <= 0) return false;
      }

      // Session filter
      if (exportSession !== 'all') {
        const sess = s.currentSession || s.admissionSession || '';
        if (sess && sess !== exportSession) return false;
      }

      // Satra filter
      if (exportSatra !== 'all') {
        const satra = s.currentSatra || s.admissionSatra || '';
        if (satra && satra.toLowerCase() !== exportSatra.toLowerCase()) return false;
      }

      // University filter
      if (exportUniversity !== 'all') {
        const univ = (s.universityName || s.collegeName || '').toLowerCase();
        const target = exportUniversity.toLowerCase();
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

        const directMatch = univ.includes(target) || target.includes(univ) || isMcbu || isSubharti || isIes || isMcrpv || isBhabha || isGyanveer || isMmyvv || isMpu || isSku || isChitrakoot;
        const linkedUnivMatch = s.linkedCourses && s.linkedCourses.some(lc => {
          const lu = (lc.universityName || lc.collegeName || '').toLowerCase();
          return lu.includes(target) || target.includes(lu);
        });

        if (!directMatch && !linkedUnivMatch) return false;
      }

      // College filter
      if (exportCollege !== 'all') {
        const targetCol = exportCollege.toLowerCase();
        const sc = (s.collegeName || s.universityName || '').toLowerCase();
        const colObj = collegesList.find(c => c.name === exportCollege || c.code === exportCollege);
        let isMatch = (sc === targetCol) || sc.includes(targetCol) || targetCol.includes(sc);
        if (!isMatch && colObj) {
          const code = (colObj.code || '').toLowerCase().replace(/[\s-]/g, '');
          const cleanSc = sc.replace(/[\s-]/g, '');
          if (code && cleanSc.includes(code)) isMatch = true;
          const shortName = (colObj.shortName || '').toLowerCase();
          if (shortName && (sc.includes(shortName) || shortName.includes(sc))) isMatch = true;
        }
        const linkedColMatch = s.linkedCourses && s.linkedCourses.some(lc => {
          const lsc = (lc.collegeName || '').toLowerCase();
          return lsc === targetCol || lsc.includes(targetCol) || targetCol.includes(lsc);
        });
        if (!isMatch && !linkedColMatch) return false;
      }

      // Course filter
      if (exportCourse !== 'all') {
        const targetCanonical = normalizeCourseName(exportCourse).toLowerCase();
        const sNorm = normalizeCourseName(s.courseName || s.course).toLowerCase();
        const directMatch = sNorm === targetCanonical || sNorm.includes(targetCanonical) || targetCanonical.includes(sNorm);
        const linkedCrsMatch = s.linkedCourses && s.linkedCourses.some(lc => {
          const lcNorm = normalizeCourseName(lc.courseName || lc.course).toLowerCase();
          return lcNorm === targetCanonical || lcNorm.includes(targetCanonical) || targetCanonical.includes(lcNorm);
        });
        if (!directMatch && !linkedCrsMatch) return false;
      }

      // Year / Semester filter
      if (exportYear !== 'all') {
        const cls = String(s.currentClass || `SEM-${s.currentSemester || 1}`).toUpperCase();
        const sem = Number(s.currentSemester || 1);
        if (exportYear === '1st Year' || exportYear === 'YEAR-1') {
          const isY1 = cls.includes('YEAR-1') || cls.includes('1ST') || cls.includes('SEM-1') || cls.includes('SEM-2') || sem === 1 || sem === 2;
          if (!isY1) return false;
        } else if (exportYear === '2nd Year' || exportYear === 'YEAR-2') {
          const isY2 = cls.includes('YEAR-2') || cls.includes('2ND') || cls.includes('SEM-3') || cls.includes('SEM-4') || sem === 3 || sem === 4;
          if (!isY2) return false;
        } else if (exportYear === '3rd Year' || exportYear === 'YEAR-3') {
          const isY3 = cls.includes('YEAR-3') || cls.includes('3RD') || cls.includes('SEM-5') || cls.includes('SEM-6') || sem === 5 || sem === 6;
          if (!isY3) return false;
        } else if (exportYear === '4th Year' || exportYear === 'YEAR-4') {
          const isY4 = cls.includes('YEAR-4') || cls.includes('4TH') || cls.includes('SEM-7') || cls.includes('SEM-8') || sem === 7 || sem === 8;
          if (!isY4) return false;
        } else if (exportYear.startsWith('SEM-')) {
          const semNum = Number(exportYear.replace('SEM-', ''));
          if (sem !== semNum && !cls.includes(exportYear)) return false;
        }
      }

      return true;
    });
  };

  // Download filtered data as styled Excel file
  const handleDownloadExcel = () => {
    const listToExport = getExportFilteredStudents();
    if (!listToExport || listToExport.length === 0) {
      alert('No students found matching the selected export filters! (चुने गए फ़िल्टर के अनुसार कोई छात्र नहीं मिला)');
      return;
    }

    const rows = listToExport.map((s, idx) => {
      const breakdown = calculateStudentYearBreakdown(s);
      return {
        'S.No': idx + 1,
        'Roll No / रोल नंबर': s.rollNo || '',
        'Enrollment No / नामांकन संख्या': s.enrollmentNo || '',
        'Registration No': s.registrationNo || '',
        'Student Name / छात्र का नाम': s.fullName || s.studentName || '',
        'Father Name / पिता का नाम': s.fatherName || s.father_name || '',
        'Mother Name / माता का नाम': s.motherName || '',
        'Mobile No / मोबाइल': s.phone || s.contact || '',
        'Alternate Contact': s.alternatePhone || '',
        'Email Address': s.email || '',
        'Gender / लिंग': s.gender || '',
        'Category / श्रेणी': s.socialCategory || s.category || '',
        'Aadhaar No / आधार': s.aadhaarNo || s.aadharNo || '',
        'University / विश्वविद्यालय': s.universityName || '',
        'College / कॉलेज': s.collegeName || '',
        'Course / पाठ्यक्रम': s.courseName || s.course || '',
        'Branch / Specialization': s.branch || '',
        'Admission Session': s.admissionSession || '',
        'Current Session': s.currentSession || s.admissionSession || '',
        'Satra (July/Jan)': s.currentSatra || s.admissionSatra || '',
        'Current Class / Year': s.currentClass || (s.currentSemester ? `Semester ${s.currentSemester}` : '1st Year'),
        '1st Year Fee (₹)': breakdown.feeY1,
        '1st Year Paid (₹)': breakdown.recY1,
        '1st Year Scholarship (₹)': breakdown.schY1,
        '2nd Year Fee (₹)': breakdown.feeY2,
        '2nd Year Paid (₹)': breakdown.recY2,
        '2nd Year Scholarship (₹)': breakdown.schY2,
        '3rd Year Fee (₹)': breakdown.feeY3,
        '3rd Year Paid (₹)': breakdown.recY3,
        '3rd Year Scholarship (₹)': breakdown.schY3,
        '4th Year Fee (₹)': breakdown.feeY4,
        '4th Year Paid (₹)': breakdown.recY4,
        '4th Year Scholarship (₹)': breakdown.schY4,
        'Total Course Fee (₹)': breakdown.totalFee,
        'Total Scholarship (₹)': breakdown.totalSch,
        'Total Paid Fee (₹)': breakdown.totalPaid,
        'Remaining Due (₹) / बकाया': breakdown.totalRem,
        'Advance Paid (₹) / अग्रिम': breakdown.advanceAmount,
        'Next Fee Due Date / अंतिम तिथि': breakdown.nextFeeDueDate || '',
        'Admission Date': s.admissionDate || s.createdAt ? new Date(s.admissionDate || s.createdAt).toLocaleDateString('en-IN') : '',
        'City': s.city || '',
        'State': s.state || '',
        'Address': s.address || '',
        'Status': s.status || 'Active'
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto-size column widths
    const colWidths = Object.keys(rows[0] || {}).map(key => {
      const maxLen = Math.max(
        key.length,
        ...rows.map(r => String(r[key] || '').length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_List');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filterTag = exportCourse !== 'all' ? `_${exportCourse.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}` : '';
    XLSX.writeFile(wb, `Student_Records${filterTag}_${timestamp}.xlsx`);
    setShowExportModal(false);
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
    setAppliedCourse(filterCourse);
    setCurrentPage(1);
  };

  const handleResetFiltersToAll = () => {
    setFilterSession('all');
    setFilterSatra('all');
    setFilterUniversity('all');
    setFilterCollege('all');
    setFilterCourse('all');
    setAppliedSession('all');
    setAppliedSatra('all');
    setAppliedUniversity('all');
    setAppliedCollege('all');
    setAppliedCourse('all');
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

    const bd = calculateStudentYearBreakdown(student);
    const y1 = bd.schY1;
    const y2 = bd.schY2;
    const y3 = bd.schY3;
    const y4 = bd.schY4;
    setScholarshipYear1(String(y1 || 0));
    setScholarshipYear2(String(y2 || 0));
    setScholarshipYear3(String(y3 || 0));
    setScholarshipYear4(String(y4 || 0));
    setScholarshipActiveYear('year1');

    const sch = bd.totalSch;
    const rem = bd.totalRem;

    setIsCustomPurpose(false);
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
          const loadedPayments = (Array.isArray(data.student.payments) && data.student.payments.length > 0)
            ? data.student.payments
            : (Array.isArray(data.student.feeHistory) && data.student.feeHistory.length > 0)
              ? data.student.feeHistory
              : [];
          setFeeDeskPayments(loadedPayments);
          setFeeDeskStudent(data.student);
          const freshBd = calculateStudentYearBreakdown(data.student);
          const sy1 = freshBd.schY1;
          const sy2 = freshBd.schY2;
          const sy3 = freshBd.schY3;
          const sy4 = freshBd.schY4;
          setScholarshipYear1(String(sy1 || 0));
          setScholarshipYear2(String(sy2 || 0));
          setScholarshipYear3(String(sy3 || 0));
          setScholarshipYear4(String(sy4 || 0));

          if (initialMode === 'set_fee') {
            setFeeDeskAmount('');
          }
        } else {
          setFeeDeskPayments(student.payments || student.feeHistory || []);
        }
      } else {
        setFeeDeskPayments(student.payments || student.feeHistory || []);
      }
    } catch (e) {
      setFeeDeskPayments(student.payments || student.feeHistory || []);
    }
  };

  const switchFeeDeskMode = (newMode) => {
    if (!feeDeskStudent) return;
    setFeeDeskMode(newMode);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);
    setIsCustomPurpose(false);

    const bd = calculateStudentYearBreakdown(feeDeskStudent);
    const sch = bd.totalSch;
    const rem = bd.totalRem;
    const y1 = bd.schY1;

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
        setFeeDeskAmount('');
        setFeeDeskSuccess(isSetPaid ? `Total receive fee updated to ₹${amt.toLocaleString('en-IN')} successfully!` : `Payment of ₹${amt.toLocaleString('en-IN')} received successfully! Receipt #${data.receipt?.receiptNo || 'Saved'}`);
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
        let activeYr = scholarshipActiveYear || 'year1';
        const cls = String(feeDeskClass || '').toUpperCase();
        if (cls.includes('1ST') || cls.includes('SEM-1') || cls.includes('SEM-2')) {
          activeYr = 'year1';
        } else if (cls.includes('2ND') || cls.includes('SEM-3') || cls.includes('SEM-4')) {
          activeYr = 'year2';
        } else if (cls.includes('3RD') || cls.includes('SEM-5') || cls.includes('SEM-6')) {
          activeYr = 'year3';
        } else if (cls.includes('4TH') || cls.includes('5TH') || cls.includes('SEM-7') || cls.includes('SEM-8')) {
          activeYr = 'year4';
        }

        const y1Val = (scholarshipYear1 === '' || scholarshipYear1 === null || scholarshipYear1 === undefined) ? 0 : Math.max(0, Number(scholarshipYear1) || 0);
        const y2Val = (scholarshipYear2 === '' || scholarshipYear2 === null || scholarshipYear2 === undefined) ? 0 : Math.max(0, Number(scholarshipYear2) || 0);
        const y3Val = (scholarshipYear3 === '' || scholarshipYear3 === null || scholarshipYear3 === undefined) ? 0 : Math.max(0, Number(scholarshipYear3) || 0);
        const y4Val = (scholarshipYear4 === '' || scholarshipYear4 === null || scholarshipYear4 === undefined) ? 0 : Math.max(0, Number(scholarshipYear4) || 0);
        const inputAmt = activeYr === 'year1' ? y1Val : activeYr === 'year2' ? y2Val : activeYr === 'year3' ? y3Val : y4Val;

        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/set-scholarship`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scholarshipYear1: y1Val,
            scholarshipYear2: y2Val,
            scholarshipYear3: y3Val,
            scholarshipYear4: y4Val,
            purpose: feeDeskPurpose || 'Scholarship',
            year: activeYr,
            yearLabel: feeDeskPurpose || (activeYr === 'year1' ? 'First Year Scholarship' : activeYr === 'year2' ? 'Second Year Scholarship' : activeYr === 'year3' ? 'Third Year Scholarship' : 'Fourth Year Scholarship'),
            amount: inputAmt,
            feeDate: feeDeskDate,
            currentClass: feeDeskClass
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to update scholarship');
        }

        const updatedStudent = data.student;
        const freshBd = calculateStudentYearBreakdown(updatedStudent);
        setFeeDeskStudent(updatedStudent);
        setStudents(prev => prev.map(s => (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) ? { ...s, ...updatedStudent } : s));
        setScholarshipYear1(String(freshBd.schY1));
        setScholarshipYear2(String(freshBd.schY2));
        setScholarshipYear3(String(freshBd.schY3));
        setScholarshipYear4(String(freshBd.schY4));
        setFeeDeskSuccess(`Scholarship entry of ₹${inputAmt.toLocaleString('en-IN')} (${feeDeskClass}) saved successfully! Total 1st Year: ₹${freshBd.schY1.toLocaleString('en-IN')}, Total Scholarship: ₹${freshBd.totalSch.toLocaleString('en-IN')}`);
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

  const handleStudentFeeCategoryChange = async (student, newCategory) => {
    const key = getStudentKey(student);
    if (!key) return;

    // Instant optimistic update in student list
    setStudents(prev => prev.map(s => {
      const sKey = getStudentKey(s);
      if (sKey === key) {
        return { ...s, feeCategory: newCategory };
      }
      return s;
    }));

    if (feeDeskStudent && getStudentKey(feeDeskStudent) === key) {
      setFeeDeskStudent(prev => ({ ...prev, feeCategory: newCategory }));
    }

    try {
      const res = await fetch(`/api/students/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeCategory: newCategory })
      });
      const data = await res.json();
      if (data.success && data.student) {
        setStudents(prev => prev.map(s => getStudentKey(s) === key ? { ...s, ...data.student } : s));
        if (feeDeskStudent && getStudentKey(feeDeskStudent) === key) {
          setFeeDeskStudent(data.student);
        }
      }
    } catch (err) {
      console.error('Error updating fee category:', err);
    }
  };

  const handleUpdatePayment = async (e) => {
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
        let yKey = editingPaymentModal.year || 'year1';
        const cls = String(editingPaymentModal.currentClass || '').toUpperCase();
        if (cls.includes('1ST') || cls.includes('SEM-1') || cls.includes('SEM-2')) {
          yKey = 'year1';
        } else if (cls.includes('2ND') || cls.includes('SEM-3') || cls.includes('SEM-4')) {
          yKey = 'year2';
        } else if (cls.includes('3RD') || cls.includes('SEM-5') || cls.includes('SEM-6')) {
          yKey = 'year3';
        } else if (cls.includes('4TH') || cls.includes('5TH') || cls.includes('SEM-7') || cls.includes('SEM-8')) {
          yKey = 'year4';
        }
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
            receiptNo: editingPaymentModal.receiptNo,
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
      setCancelOtherReason('');
      setCancelRefundPaid('0');
      alert(`Admission cancelled for ${data.student?.fullName || data.student?.rollNo || cancellingStudent.fullName}! Record has been archived in Cancelled Admissions.`);
    } catch (err) {
      alert(err.message || 'Failed to cancel admission');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleOpenCompleteCourseModal = (std) => {
    setCompletingStudent(std);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setCompletionRemark('All semesters/terms completed successfully');
  };

  const handleConfirmCompleteCourse = async () => {
    if (!completingStudent) return;
    setCompleteLoading(true);
    const lookupKey = completingStudent.rollNo || completingStudent.id;
    try {
      const res = await fetch(`/api/students/${encodeURIComponent(lookupKey)}/complete-course`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completionDate,
          remark: completionRemark,
          completedBy: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to mark course as completed');
      }

      // Update state in memory
      setStudents(prev => prev.map(s => {
        if ((s.id && s.id === lookupKey) || (s.rollNo && s.rollNo === lookupKey)) {
          return { ...s, status: 'Completed', courseCompleted: 'Yes', completionDate };
        }
        return s;
      }));

      if (selectedStudent && (selectedStudent.id === lookupKey || selectedStudent.rollNo === lookupKey)) {
        setSelectedStudent(null);
      }
      if (editingStudent && (editingStudent.id === lookupKey || editingStudent.rollNo === lookupKey)) {
        setEditingStudent(null);
      }

      const completedStdName = completingStudent.fullName || completingStudent.rollNo;
      setCompletingStudent(null);
      alert(`Degree/Course marked as Completed for ${completedStdName}!\nStudent has been moved to the "Completed & Document Return" section.`);
    } catch (err) {
      alert(err.message || 'Failed to complete course');
    } finally {
      setCompleteLoading(false);
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
    // Exclude completed students so they move to the dedicated Completed & Document Return section
    if (s.status === 'Completed' || s.courseCompleted === 'Yes') return false;

    // Due Filter support (for Accounts Dashboard integration)
    if (dueFilter && dueFilter !== 'all') {
      const bd = calculateStudentYearBreakdown(s);
      if (dueFilter === 'due_only' || dueFilter === 'sem_due_only') {
        if (bd.totalRem <= 0) return false;
      } else if (dueFilter === 'due_y1') {
        if (bd.dueY1 <= 0) return false;
      } else if (dueFilter === 'due_y2') {
        if (bd.dueY2 <= 0) return false;
      } else if (dueFilter === 'due_y3') {
        if (bd.dueY3 <= 0) return false;
      } else if (dueFilter === 'due_y4') {
        if (bd.dueY4 <= 0) return false;
      } else if (dueFilter === 'cleared') {
        if (bd.totalRem > 0) return false;
      }
    }

    // Date Range Filter support (Calendar & timeframe filtering)
    if (filterStartDate || filterEndDate) {
      const matchesDate = (dStr) => {
        if (!dStr) return false;
        const d = String(dStr).split('T')[0];
        if (filterStartDate && d < filterStartDate) return false;
        if (filterEndDate && d > filterEndDate) return false;
        return true;
      };

      const payList = (s.payments && s.payments.length > 0) ? s.payments : (s.feeHistory || []);
      const hasMatchingPayment = payList.some(p => {
        const pDate = p.feeDate || p.paymentDate || p.date || p.createdAt;
        return matchesDate(pDate);
      });
      const hasMatchingAdmission = matchesDate(s.admissionDate) || matchesDate(s.createdAt);

      if (!hasMatchingPayment && !hasMatchingAdmission) return false;
    }

    if (feeCategoryFilter !== 'all') {
      const rawCat = s.feeCategory;
      const cat = (rawCat === 'full_scholarship' || rawCat === 'scholarship')
        ? 'full_scholarship'
        : (rawCat === 'course_fee_scholarship' || rawCat === 'academics')
          ? 'course_fee_scholarship'
          : 'full_course_fee';
      if (cat !== feeCategoryFilter) return false;
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

      const directMatch = univ.includes(target) || target.includes(univ) || isMcbu || isSubharti || isIes || isMcrpv || isBhabha || isGyanveer || isMmyvv || isMpu || isSku || isChitrakoot;
      const linkedUnivMatch = s.linkedCourses && s.linkedCourses.some(lc => {
        const lu = (lc.universityName || lc.collegeName || '').toLowerCase();
        return lu.includes(target) || target.includes(lu);
      });

      if (!directMatch && !linkedUnivMatch) {
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

      const linkedColMatch = s.linkedCourses && s.linkedCourses.some(lc => {
        const lsc = (lc.collegeName || '').toLowerCase();
        return lsc === targetCol || lsc.includes(targetCol) || targetCol.includes(lsc);
      });

      if (!isMatch && !linkedColMatch) return false;
    }

    if (appliedCourse !== 'all') {
      const targetCanonical = normalizeCourseName(appliedCourse).toLowerCase();
      
      const sNorm = normalizeCourseName(s.courseName || s.course).toLowerCase();
      const directMatch = sNorm === targetCanonical || sNorm.includes(targetCanonical) || targetCanonical.includes(sNorm);
      
      const linkedCrsMatch = s.linkedCourses && s.linkedCourses.some(lc => {
        const lcNorm = normalizeCourseName(lc.courseName || lc.course).toLowerCase();
        return lcNorm === targetCanonical || lcNorm.includes(targetCanonical) || targetCanonical.includes(lcNorm);
      });
      
      if (!directMatch && !linkedCrsMatch) return false;
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
    const univMatch = s.universityName?.toLowerCase().includes(q);
    const collegeMatch = s.collegeName?.toLowerCase().includes(q);
    const branchMatch = s.branch?.toLowerCase().includes(q);
    const categoryMatch = (s.socialCategory || s.category || '').toLowerCase().includes(q);

    const linkedMatch = s.linkedCourses && s.linkedCourses.some(l => 
      l.courseName?.toLowerCase().includes(q) ||
      l.rollNo?.toLowerCase().includes(q) ||
      l.registrationNo?.toLowerCase().includes(q) ||
      l.universityName?.toLowerCase().includes(q) ||
      l.collegeName?.toLowerCase().includes(q)
    );

    return nameMatch || fatherMatch || rollMatch || aadharMatch || phoneMatch || emailMatch || courseMatch || univMatch || collegeMatch || branchMatch || categoryMatch || linkedMatch;
  });

  const filteredStudents = displayedStudents;

  return (
    <div className={`w-full ${hideHeader ? 'space-y-6' : 'px-2 sm:px-4 lg:px-6 py-4 space-y-6'}`}>
      
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isRecordsDesk ? 'Master Student Records Directory' : 'Student Records Directorate'}</span>
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {displayedStudents.length} of {students.length} Students
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {isRecordsDesk ? 'All Student Records (विद्यार्थी रिकॉर्ड्स)' : 'Enrolled Students Directory & Documents'}
            </h1>
            <p className="text-xs text-slate-500">
              {isRecordsDesk 
                ? 'Search, filter and inspect all enrolled students by University, Affiliated College, Course and Session with 39-field records, fee status, and full profiles.'
                : 'View student profiles, inspect uploaded marksheets and KYC identity proofs, print admission slips, and check fee status.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleOpenExportModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer border border-emerald-400/30"
              title="Filter and download students data in Excel (.xlsx)"
            >
              <Download className="w-4 h-4 text-emerald-100" />
              <span>📥 Export Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-extrabold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all whitespace-nowrap cursor-pointer border border-slate-600/30"
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

      {/* Top University, College, Course, Session & Satra Filter Form (6 Sections Compact Layout) */}
      <div className="bg-[#f0f7f9] p-3.5 rounded-xl border border-[#bce0ee] shadow-sm space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate">
              Select Session:
            </label>
            <select
              value={filterSession}
              onChange={(e) => handleFilterSessionChange(e.target.value)}
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
              onChange={(e) => handleFilterSatraChange(e.target.value)}
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
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-bold text-indigo-900 cursor-pointer shadow-xs"
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
              onChange={(e) => handleFilterCollegeChange(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1 truncate flex items-center justify-between">
              <span>Select Course:</span>
              {allAvailableCourses.length > 0 && (
                <span className="text-[10px] text-purple-700 font-bold">
                  ({allAvailableCourses.length})
                </span>
              )}
            </label>
            <select
              value={filterCourse}
              onChange={(e) => handleFilterCourseChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium text-slate-800 cursor-pointer shadow-xs"
            >
              <option value="all">Select Course (All)</option>
              {allAvailableCourses.map((cName, i) => (
                <option key={i} value={cName}>{cName}</option>
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
                placeholder="Name, Roll, Univ, College, Mobile..."
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

        <div className="pt-0.5 flex flex-col sm:flex-row items-center gap-2">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="flex-1 w-full bg-[#1b5e20] hover:bg-[#144718] text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Show Students Record ({displayedStudents.length} Students Matching)</span>
          </button>
          {(appliedUniversity !== 'all' || appliedCollege !== 'all' || appliedSession !== 'all' || appliedSatra !== 'all' || appliedCourse !== 'all' || search) && (
            <button
              type="button"
              onClick={handleResetFiltersToAll}
              className="bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 font-bold py-2 px-3.5 rounded-lg text-xs cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-2xs"
              title="Reset all filters back to show all students"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters (Show All)</span>
            </button>
          )}
        </div>
      </div>

      {/* Dark Active Filter Status Strip */}
      <div className="bg-[#0b1f33] text-white py-2 px-3 sm:px-4 rounded-lg border border-slate-700 shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-bold items-center">
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
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-normal">Course:</span>
          <span className="text-purple-300 truncate max-w-[170px]" title={appliedCourse === 'all' ? 'All Courses' : appliedCourse}>
            {appliedCourse === 'all' ? 'All Courses' : appliedCourse}
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

          {/* Toggle for All Year-Wise Fee Columns (1st, 2nd, 3rd, 4th Year - All 12 Columns) */}
          {tableColumnMode === 'all' && (
            <button
              type="button"
              onClick={toggleYearWiseFees}
              className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                showYearWiseFees
                  ? 'bg-amber-100 text-amber-950 border-amber-400 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300'
              }`}
              title="Toggle visibility of All Year-Wise Fee Columns (1st, 2nd, 3rd & 4th Year)"
            >
              {showYearWiseFees ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>✕ Hide All Year Fees</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>👁️ Show All Year Fees</span>
                </>
              )}
            </button>
          )}
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
          {(search || appliedSession !== 'all' || appliedSatra !== 'all' || appliedUniversity !== 'all' || appliedCollege !== 'all' || appliedCourse !== 'all') && (
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
            <div className="overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto relative">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="sticky top-0 z-40 bg-[#0b1f33] text-white uppercase text-[10.5px] font-extrabold tracking-wider select-none shadow-md">
                  {tableColumnMode === 'all' ? (
                    <tr>
                      <th className="sticky top-0 left-0 z-50 bg-[#0b1f33] py-2.5 px-2 text-center border-r border-slate-700 min-w-[44px] w-11 shadow-[2px_0_4px_rgba(0,0,0,0.15)]">#</th>
                      <th className="sticky top-0 left-[44px] z-50 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[210px] shadow-[4px_0_6px_rgba(0,0,0,0.2)]">Student_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Father_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Mother_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Contact</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Email</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">DOB</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Gender</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Category</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Aadhaar_No</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Samagra_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Enrollment_No</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Roll_No</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">ABC_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">MPTASS_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">MPTASS_Password</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">OTR_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">DEB_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Scholar_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">User_ID</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Medium</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">College_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">University_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Course_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Branch</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Type</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Mode</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Session</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Satra</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Semester/Class</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Admission_Date</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[180px]">Address</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Reference</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Status</th>
                      {/* Fee Category Column with Filter Dropdown */}
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2 px-2 border-r border-slate-700 whitespace-nowrap text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-extrabold text-amber-300">Fee_Category</span>
                          <select
                            value={feeCategoryFilter}
                            onChange={(e) => {
                              setFeeCategoryFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="bg-slate-800 text-amber-200 border border-slate-600 rounded px-1.5 py-0.5 text-[9.5px] font-bold outline-none cursor-pointer hover:border-amber-400"
                            title="Filter by Fee Category"
                          >
                            <option value="all">All Categories</option>
                            <option value="full_scholarship">Full Scholarship Base</option>
                            <option value="course_fee_scholarship">Course Fees + Scholarship</option>
                            <option value="full_course_fee">Full Course Fee Base</option>
                          </select>
                        </div>
                      </th>
                      {/* Remark with Toggle after it */}
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[210px]">
                        <div className="flex items-center justify-between gap-2">
                          <span>Remark</span>
                          <button
                            type="button"
                            onClick={toggleYearWiseFees}
                            className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer transition-all border flex items-center gap-1 shadow-sm ${
                              showYearWiseFees 
                                ? 'bg-rose-500/25 text-rose-300 border-rose-400/60 hover:bg-rose-500/40' 
                                : 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 hover:bg-emerald-500/40'
                            }`}
                            title={showYearWiseFees ? "Click to Hide All Year Fee Columns" : "Click to Show All Year Fee Columns"}
                          >
                            {showYearWiseFees ? (
                              <>
                                <EyeOff className="w-3 h-3 text-rose-300" />
                                <span>✕ Hide Fees</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-emerald-300" />
                                <span>👁️ Show Fees</span>
                              </>
                            )}
                          </button>
                        </div>
                      </th>

                      {/* All Year Fee Columns (1st, 2nd, 3rd & 4th Year - 16 Columns: Fee, Schol, Rec, Dues) */}
                      {showYearWiseFees && (
                        <>
                          {/* 1st Year Columns */}
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">1st_Yr_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">1st_Yr_Schol</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">1st_Yr_Rec_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">1st_Yr_Dues</th>

                          {/* 2nd Year Columns */}
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">2nd_Yr_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">2nd_Yr_Schol</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">2nd_Yr_Rec_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">2nd_Yr_Dues</th>

                          {/* 3rd Year Columns */}
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">3rd_Yr_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">3rd_Yr_Schol</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">3rd_Yr_Rec_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">3rd_Yr_Dues</th>

                          {/* 4th Year Columns */}
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">4th_Yr_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-200">4th_Yr_Schol</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">4th_Yr_Rec_Fee</th>
                          <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">4th_Yr_Dues</th>
                        </>
                      )}

                      {/* Totals */}
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-purple-300">Total_Scholarship</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-sky-200">Total_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-300">Total_Receive_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-300">Remaining_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Receive_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Scholarship</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 text-center border-r border-slate-700 w-10">#</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Father_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Student_Contact</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">College_Name</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap">Course_Names</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 whitespace-nowrap">Course_Type</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Status</th>
                      {/* Fee Category Column with Filter Dropdown */}
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2 px-2 border-r border-slate-700 whitespace-nowrap text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-extrabold text-amber-300">Fee_Category</span>
                          <select
                            value={feeCategoryFilter}
                            onChange={(e) => {
                              setFeeCategoryFilter(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="bg-slate-800 text-amber-200 border border-slate-600 rounded px-1.5 py-0.5 text-[9.5px] font-bold outline-none cursor-pointer hover:border-amber-400"
                            title="Filter by Fee Category"
                          >
                            <option value="all">All Categories</option>
                            <option value="full_scholarship">Full Scholarship Base</option>
                            <option value="course_fee_scholarship">Course Fees + Scholarship</option>
                            <option value="full_course_fee">Full Course Fee Base</option>
                          </select>
                        </div>
                      </th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 whitespace-nowrap min-w-[170px]">Remark</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Semester</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Acadmic_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Scholarship</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Total_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Receive_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap">Remaining_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Receive_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Fee</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_Scholarship</th>
                      <th className="sticky top-0 z-40 bg-[#0b1f33] py-2.5 px-2 text-center whitespace-nowrap">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={tableColumnMode === 'all' ? (showYearWiseFees ? 53 : 37) : 20} className="p-8 text-center text-slate-400 font-medium">Loading students directory...</td>
                    </tr>
                  ) : paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumnMode === 'all' ? (showYearWiseFees ? 53 : 37) : 20} className="p-10 text-center bg-slate-50">
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

                      const yd = calculateStudentYearBreakdown(std);
                      const acadFee = Number(std.academicFee !== undefined && std.academicFee !== null ? std.academicFee : (std.studentFee !== undefined && std.studentFee !== null ? std.studentFee : 0));
                      const y1 = yd.schY1;
                      const y2 = yd.schY2;
                      const y3 = yd.schY3;
                      const y4 = yd.schY4;
                      const sch = yd.totalSch;
                      const tot = yd.totalFee;
                      const paid = yd.totalPaid;
                      const rem = yd.totalRem;

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

                            {/* Fee Category Dropdown Column */}
                            <td className="py-2 px-2 border-r border-slate-200 text-center whitespace-nowrap bg-amber-50/15">
                              {(() => {
                                const rawCat = std.feeCategory;
                                const curCat = (rawCat === 'full_scholarship' || rawCat === 'scholarship')
                                  ? 'full_scholarship'
                                  : (rawCat === 'course_fee_scholarship' || rawCat === 'academics')
                                    ? 'course_fee_scholarship'
                                    : 'full_course_fee';

                                return (
                                  <select
                                    value={curCat}
                                    onChange={(e) => handleStudentFeeCategoryChange(std, e.target.value)}
                                    className={`text-[10px] font-black rounded-lg px-2 py-1 border shadow-xs transition-all cursor-pointer outline-none ${
                                      curCat === 'full_scholarship'
                                        ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100'
                                        : curCat === 'course_fee_scholarship'
                                          ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                          : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                    }`}
                                    title="Change Student Fee Category"
                                  >
                                    <option value="full_scholarship">Full Scholarship Base</option>
                                    <option value="course_fee_scholarship">Course Fees + Scholarship</option>
                                    <option value="full_course_fee">Full Course Fee Base</option>
                                  </select>
                                );
                              })()}
                            </td>

                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 font-medium min-w-[170px] max-w-[280px] break-words whitespace-normal leading-snug" title={std.remark || ''}>
                              {std.remark || '-'}
                            </td>

                            {tableColumnMode === 'compact' && (
                              <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                {std.currentClass || (std.currentSemester ? `SEM-${std.currentSemester}` : 'SEM-1')}
                              </td>
                            )}

                            {/* All Year Fee Columns (1st, 2nd, 3rd & 4th Year - 16 Columns: Fee, Schol, Rec, Dues) */}
                            {showYearWiseFees && (
                              <>
                                {/* 1st Year */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/20">
                                  {yd.feeY1 > 0 ? `${yd.feeY1}/-` : '0/-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/20">
                                  {yd.schY1 > 0 ? `${yd.schY1}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/20">
                                  {yd.recY1 > 0 ? `${yd.recY1}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/20">
                                  {yd.hasY1Activity ? (
                                    yd.net1 > 0 ? (
                                      <span className="text-rose-700 font-bold">{yd.net1}/-</span>
                                    ) : yd.net1 < 0 ? (
                                      <span className="text-emerald-700 font-bold">-{Math.abs(yd.net1)}/-</span>
                                    ) : (
                                      <span className="text-slate-400">0/-</span>
                                    )
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* 2nd Year */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/20">
                                  {yd.feeY2 > 0 ? `${yd.feeY2}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/20">
                                  {yd.schY2 > 0 ? `${yd.schY2}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/20">
                                  {yd.recY2 > 0 ? `${yd.recY2}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/20">
                                  {yd.hasY2Activity ? (
                                    yd.net2 > 0 ? (
                                      <span className="text-rose-700 font-bold">{yd.net2}/-</span>
                                    ) : yd.net2 < 0 ? (
                                      <span className="text-emerald-700 font-bold">-{Math.abs(yd.net2)}/-</span>
                                    ) : (
                                      <span className="text-slate-400">0/-</span>
                                    )
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* 3rd Year */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/20">
                                  {yd.feeY3 > 0 ? `${yd.feeY3}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/20">
                                  {yd.schY3 > 0 ? `${yd.schY3}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/20">
                                  {yd.recY3 > 0 ? `${yd.recY3}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/20">
                                  {yd.hasY3Activity ? (
                                    yd.net3 > 0 ? (
                                      <span className="text-rose-700 font-bold">{yd.net3}/-</span>
                                    ) : yd.net3 < 0 ? (
                                      <span className="text-emerald-700 font-bold">-{Math.abs(yd.net3)}/-</span>
                                    ) : (
                                      <span className="text-slate-400">0/-</span>
                                    )
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>

                                {/* 4th Year */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/20">
                                  {yd.feeY4 > 0 ? `${yd.feeY4}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/20">
                                  {yd.schY4 > 0 ? `${yd.schY4}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/20">
                                  {yd.recY4 > 0 ? `${yd.recY4}/-` : '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/20">
                                  {yd.hasY4Activity ? (
                                    yd.net4 > 0 ? (
                                      <span className="text-rose-700 font-bold">{yd.net4}/-</span>
                                    ) : yd.net4 < 0 ? (
                                      <span className="text-emerald-700 font-bold">-{Math.abs(yd.net4)}/-</span>
                                    ) : (
                                      <span className="text-slate-400">0/-</span>
                                    )
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              </>
                            )}

                            {/* Totals */}
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-800">
                              {yd.totalSch > 0 ? `${yd.totalSch}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900 bg-slate-50/50">
                              {yd.totalFee > 0 ? `${yd.totalFee}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                              {yd.totalPaid > 0 ? `${yd.totalPaid}/-` : '0/-'}
                            </td>
                            <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono">
                              {yd.isAdvance ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-black">
                                    +₹{yd.advanceAmount.toLocaleString('en-IN')}/- (Adv)
                                  </span>
                                  {yd.nextFeeDueDate && (
                                    <span className="text-[9px] text-emerald-700 font-sans font-semibold mt-0.5 bg-emerald-50/80 px-1 rounded border border-emerald-200">
                                      📅 Due: {yd.nextFeeDueDate}
                                    </span>
                                  )}
                                </div>
                              ) : yd.totalRem > 0 ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-rose-700 bg-rose-50/50 px-1 py-0.5 rounded">
                                    {yd.totalRem.toLocaleString('en-IN')}/-
                                  </span>
                                  {yd.nextFeeDueDate && (
                                    <span className="text-[9px] text-amber-700 font-sans font-semibold mt-0.5 bg-amber-50 px-1 rounded border border-amber-200">
                                      📅 Due: {yd.nextFeeDueDate}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="text-emerald-600 font-semibold">0/-</span>
                                  {yd.nextFeeDueDate && (
                                    <span className="text-[9px] text-slate-500 font-sans mt-0.5">
                                      📅 Due: {yd.nextFeeDueDate}
                                    </span>
                                  )}
                                </div>
                              )}
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
                                {!isRecordsDesk && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(std)}
                                    className="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                    title="Edit Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenCompleteCourseModal(std)}
                                  className="p-1 rounded hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                                  title="Complete Degree (डिग्री पूर्ण मार्क करें एवं दस्तावेज वापसी में भेजें)"
                                >
                                  <GraduationCap className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrintSlipStudent(std)}
                                  className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                  title="Print Admission Slip"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                {!isRecordsDesk && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudent(std)}
                                    className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                    title="Delete Student"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Connected Dual Program Secondary Row */}
                          {std.linkedCourses && [...std.linkedCourses].sort((a, b) => new Date(a.admissionDate || 0) - new Date(b.admissionDate || 0)).map((linked, lIdx) => {
                            const lyd = calculateStudentYearBreakdown(linked);
                            const lAcadFee = Number(linked.academicFee !== undefined && linked.academicFee !== null ? linked.academicFee : (linked.studentFee !== undefined && linked.studentFee !== null ? linked.studentFee : 0));
                            const ly1 = lyd.schY1;
                            const ly2 = lyd.schY2;
                            const ly3 = lyd.schY3;
                            const ly4 = lyd.schY4;
                            const lSch = lyd.totalSch;
                            const lTot = lyd.totalFee;
                            const lPaid = lyd.totalPaid;
                            const lRem = lyd.totalRem;
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

                                {/* All Year Fee Columns (1st, 2nd, 3rd & 4th Year - 16 Columns: Fee, Schol, Rec, Dues) */}
                                {showYearWiseFees && (
                                  <>
                                    {/* 1st Year */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/30">
                                      {lyd.feeY1 > 0 ? `${lyd.feeY1}/-` : '0/-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/30">
                                      {lyd.schY1 > 0 ? `${lyd.schY1}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/30">
                                      {lyd.recY1 > 0 ? `${lyd.recY1}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/30">
                                      {lyd.hasY1Activity ? (
                                        lyd.net1 > 0 ? (
                                          <span className="text-rose-700 font-bold">{lyd.net1}/-</span>
                                        ) : lyd.net1 < 0 ? (
                                          <span className="text-emerald-700 font-bold">-{Math.abs(lyd.net1)}/-</span>
                                        ) : (
                                          <span className="text-slate-400">0/-</span>
                                        )
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>

                                    {/* 2nd Year */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/30">
                                      {lyd.feeY2 > 0 ? `${lyd.feeY2}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/30">
                                      {lyd.schY2 > 0 ? `${lyd.schY2}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/30">
                                      {lyd.recY2 > 0 ? `${lyd.recY2}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/30">
                                      {lyd.hasY2Activity ? (
                                        lyd.net2 > 0 ? (
                                          <span className="text-rose-700 font-bold">{lyd.net2}/-</span>
                                        ) : lyd.net2 < 0 ? (
                                          <span className="text-emerald-700 font-bold">-{Math.abs(lyd.net2)}/-</span>
                                        ) : (
                                          <span className="text-slate-400">0/-</span>
                                        )
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>

                                    {/* 3rd Year */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/30">
                                      {lyd.feeY3 > 0 ? `${lyd.feeY3}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/30">
                                      {lyd.schY3 > 0 ? `${lyd.schY3}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/30">
                                      {lyd.recY3 > 0 ? `${lyd.recY3}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/30">
                                      {lyd.hasY3Activity ? (
                                        lyd.net3 > 0 ? (
                                          <span className="text-rose-700 font-bold">{lyd.net3}/-</span>
                                        ) : lyd.net3 < 0 ? (
                                          <span className="text-emerald-700 font-bold">-{Math.abs(lyd.net3)}/-</span>
                                        ) : (
                                          <span className="text-slate-400">0/-</span>
                                        )
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>

                                    {/* 4th Year */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-slate-900 bg-amber-50/30">
                                      {lyd.feeY4 > 0 ? `${lyd.feeY4}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-700 bg-purple-50/30">
                                      {lyd.schY4 > 0 ? `${lyd.schY4}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-emerald-700 bg-emerald-50/30">
                                      {lyd.recY4 > 0 ? `${lyd.recY4}/-` : '-'}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono bg-rose-50/30">
                                      {lyd.hasY4Activity ? (
                                        lyd.net4 > 0 ? (
                                          <span className="text-rose-700 font-bold">{lyd.net4}/-</span>
                                        ) : lyd.net4 < 0 ? (
                                          <span className="text-emerald-700 font-bold">-{Math.abs(lyd.net4)}/-</span>
                                        ) : (
                                          <span className="text-slate-400">0/-</span>
                                        )
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </>
                                )}

                                {/* Totals */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-semibold font-mono text-purple-800">
                                  {lyd.totalSch > 0 ? `${lyd.totalSch}/-` : '0/-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900">
                                  {lyd.totalFee > 0 ? `${lyd.totalFee}/-` : '0/-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                  {lyd.totalPaid > 0 ? `${lyd.totalPaid}/-` : '0/-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono">
                                  {lyd.isAdvance ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-black">
                                        +₹{lyd.advanceAmount.toLocaleString('en-IN')}/- (Adv)
                                      </span>
                                      {lyd.nextFeeDueDate && (
                                        <span className="text-[9px] text-emerald-700 font-sans font-semibold mt-0.5 bg-emerald-50/80 px-1 rounded border border-emerald-200">
                                          📅 Due: {lyd.nextFeeDueDate}
                                        </span>
                                      )}
                                    </div>
                                  ) : lyd.totalRem > 0 ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-rose-700 bg-rose-50/50 px-1 py-0.5 rounded">
                                        {lyd.totalRem.toLocaleString('en-IN')}/-
                                      </span>
                                      {lyd.nextFeeDueDate && (
                                        <span className="text-[9px] text-amber-700 font-sans font-semibold mt-0.5 bg-amber-50 px-1 rounded border border-amber-200">
                                          📅 Due: {lyd.nextFeeDueDate}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-end">
                                      <span className="text-emerald-600 font-semibold">0/-</span>
                                      {lyd.nextFeeDueDate && (
                                        <span className="text-[9px] text-slate-500 font-sans mt-0.5">
                                          📅 Due: {lyd.nextFeeDueDate}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
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
                                    {!isRecordsDesk && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditModal(linked)}
                                        className="p-1 rounded hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                                        title="Edit Details"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setPrintSlipStudent(linked)}
                                      className="p-1 rounded hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                      title="Print Admission Slip"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                    {!isRecordsDesk && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStudent(linked)}
                                        className="p-1 rounded hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                        title="Delete Enrollment"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
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

            {/* Table Footer with Pagination Controls & Excel Download */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  Showing <strong className="text-slate-900">{totalEntries > 0 ? startIndex + 1 : 0}</strong> to{' '}
                  <strong className="text-slate-900">{endIndex}</strong> of{' '}
                  <strong className="text-slate-900">{totalEntries}</strong> entries
                </div>

                {/* Excel Download Button */}
                <button
                  type="button"
                  onClick={handleOpenExportModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-xs transition-all text-xs cursor-pointer border border-emerald-700/30"
                  title="Filter and download students data in Excel (.xlsx)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-100" />
                  <span>📥 Download Excel (एक्सेल डाउनलोड)</span>
                </button>
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start">
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
                    {feeDeskMode === 'receive' && 'Receive Fees (छात्र शुल्क प्राप्त करें)'}
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class / Semester / Year:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer">
                          <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                            <option value="1st Year">1st Year (1st Year Annual)</option>
                            <option value="2nd Year">2nd Year (2nd Year Annual)</option>
                            <option value="3rd Year">3rd Year (3rd Year Annual)</option>
                            <option value="4th Year">4th Year (4th Year Annual)</option>
                          </optgroup>
                          <optgroup label="Semester Pattern (सेमेस्टर)">
                            <option value="SEM-1">SEM-1 (1st Semester)</option>
                            <option value="SEM-2">SEM-2 (2nd Semester)</option>
                            <option value="SEM-3">SEM-3 (3rd Semester)</option>
                            <option value="SEM-4">SEM-4 (4th Semester)</option>
                            <option value="SEM-5">SEM-5 (5th Semester)</option>
                            <option value="SEM-6">SEM-6 (6th Semester)</option>
                            <option value="SEM-7">SEM-7 (7th Semester)</option>
                            <option value="SEM-8">SEM-8 (8th Semester)</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee_Date* :</label>
                        <input type="date" required value={feeDeskDate} onChange={(e) => setFeeDeskDate(e.target.value)} className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">Purpose* :</label>
                          {isCustomPurpose && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomPurpose(false);
                                setFeeDeskPurpose('Tuition Fee');
                              }}
                              className="text-[10px] text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                            >
                              Choose from list
                            </button>
                          )}
                        </div>
                        {!isCustomPurpose ? (
                          <select
                            value={feeDeskPurpose}
                            onChange={(e) => {
                              if (e.target.value === '__OTHER__') {
                                setIsCustomPurpose(true);
                                setFeeDeskPurpose('');
                              } else {
                                setFeeDeskPurpose(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Tuition Fee">Tuition Fee</option>
                            <option value="Admission Fee">Admission Fee</option>
                            <option value="Examination Fee">Examination Fee</option>
                            <option value="Registration Fee">Registration Fee</option>
                            <option value="Late Fee">Late Fee (विलंब शुल्क)</option>
                            <option value="Caution Money">Caution Money Deposit</option>
                            <option value="Library Fee">Library / Lab Fee</option>
                            <option value="Scholarship">Scholarship</option>
                            <option value="Other Fee">Other Academic Dues</option>
                            <option value="__OTHER__">Other (Type custom purpose... / अन्य शुल्क)</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={feeDeskPurpose}
                              onChange={(e) => setFeeDeskPurpose(e.target.value)}
                              placeholder="Type custom fee purpose (e.g. Uniform, Fine, ID Card...)"
                              autoFocus
                              className="w-full pl-3 pr-8 py-2 text-xs font-bold border-2 border-emerald-500 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomPurpose(false);
                                setFeeDeskPurpose('Tuition Fee');
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                              title="Back to dropdown"
                            >
                              ✕
                            </button>
                          </div>
                        )}
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
                        <span>{feeDeskLoading ? 'Saving...' : 'Receive Fees (Add Payment)'}</span>
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

                      {/* Total Academic / Center Fee Banner (Full width across all 4 columns) */}
                      <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-blue-700">Total Academic / Center Fee</span>
                          <div className="text-base font-black text-blue-950 font-mono">
                            ₹{(() => {
                              const sumFromHistory = (Array.isArray(feeDeskStudent.academicFeeHistory) && feeDeskStudent.academicFeeHistory.length > 0)
                                ? feeDeskStudent.academicFeeHistory.reduce((sum, h) => sum + Number(h.amountPaid !== undefined ? h.amountPaid : (h.amount || 0)), 0)
                                : 0;
                              const displayTotal = sumFromHistory > 0
                                ? sumFromHistory
                                : Number(feeDeskStudent.studentFee || feeDeskStudent.courseFee || feeDeskStudent.academicFee || 0);
                              return displayTotal.toLocaleString('en-IN');
                            })()}/-
                          </div>
                        </div>
                        {Array.isArray(feeDeskStudent.academicFeeHistory) && feeDeskStudent.academicFeeHistory.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 max-w-full">
                            {feeDeskStudent.academicFeeHistory.map((h, i) => (
                              <span key={h.id || i} className="px-2.5 py-1 bg-white border border-blue-300 shadow-2xs rounded-lg text-[11px] font-bold text-blue-950 flex items-center gap-1">
                                <span className="text-blue-700 font-semibold">{h.currentClass ? `${h.currentClass} - ` : ''}{h.purpose || 'Center Fee'}:</span>
                                <span className="font-mono font-extrabold text-blue-900">₹{Number(h.amountPaid !== undefined ? h.amountPaid : (h.amount || 0)).toLocaleString('en-IN')}/-</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-bold shrink-0 self-start sm:self-center">Active Setting</span>
                      </div>

                      {/* 4 Input Fields in 1 Clean Balanced Row (4 columns) */}
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class / Semester / Year:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer">
                          <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                            <option value="1st Year">1st Year (1st Year Annual)</option>
                            <option value="2nd Year">2nd Year (2nd Year Annual)</option>
                            <option value="3rd Year">3rd Year (3rd Year Annual)</option>
                            <option value="4th Year">4th Year (4th Year Annual)</option>
                          </optgroup>
                          <optgroup label="Semester Pattern (सेमेस्टर)">
                            <option value="SEM-1">SEM-1 (1st Semester)</option>
                            <option value="SEM-2">SEM-2 (2nd Semester)</option>
                            <option value="SEM-3">SEM-3 (3rd Semester)</option>
                            <option value="SEM-4">SEM-4 (4th Semester)</option>
                            <option value="SEM-5">SEM-5 (5th Semester)</option>
                            <option value="SEM-6">SEM-6 (6th Semester)</option>
                            <option value="SEM-7">SEM-7 (7th Semester)</option>
                            <option value="SEM-8">SEM-8 (8th Semester)</option>
                          </optgroup>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-bold text-slate-700">Purpose* :</label>
                          {isCustomPurpose && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomPurpose(false);
                                setFeeDeskPurpose('Center Fee');
                              }}
                              className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
                            >
                              Choose from list
                            </button>
                          )}
                        </div>
                        {!isCustomPurpose ? (
                          <select
                            value={feeDeskPurpose}
                            onChange={(e) => {
                              if (e.target.value === '__OTHER__') {
                                setIsCustomPurpose(true);
                                setFeeDeskPurpose('');
                              } else {
                                setFeeDeskPurpose(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Center Fee">Center Fee</option>
                            <option value="Academic Fee">Academic Fee</option>
                            <option value="Tuition Fee">Tuition Fee</option>
                            <option value="Annual Course Fee">Annual Course Fee</option>
                            <option value="Admission Fee">Admission Fee</option>
                            <option value="Registration Fee">Registration Fee</option>
                            <option value="Examination Fee">Examination Fee</option>
                            <option value="Late Fee">Late Fee (विलंब शुल्क)</option>
                            <option value="Other Fee">Other Fee</option>
                            <option value="__OTHER__">Other (Type custom purpose... / अन्य शुल्क)</option>
                          </select>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={feeDeskPurpose}
                              onChange={(e) => setFeeDeskPurpose(e.target.value)}
                              placeholder="Type custom fee purpose (e.g. Uniform, Practical, Caution...)"
                              autoFocus
                              className="w-full pl-3 pr-8 py-2 text-xs font-bold border-2 border-sky-500 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomPurpose(false);
                                setFeeDeskPurpose('Center Fee');
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                              title="Back to dropdown"
                            >
                              ✕
                            </button>
                          </div>
                        )}
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
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">Purpose* :</label>
                              {row.isCustom && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRows = [...extraFeeRows];
                                    newRows[rIdx].isCustom = false;
                                    newRows[rIdx].purpose = 'Academic Fee';
                                    setExtraFeeRows(newRows);
                                  }}
                                  className="text-[9px] text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
                                >
                                  Choose from list
                                </button>
                              )}
                            </div>
                            {!row.isCustom ? (
                              <select
                                value={row.purpose}
                                onChange={(e) => {
                                  const newRows = [...extraFeeRows];
                                  if (e.target.value === '__OTHER__') {
                                    newRows[rIdx].isCustom = true;
                                    newRows[rIdx].purpose = '';
                                  } else {
                                    newRows[rIdx].purpose = e.target.value;
                                  }
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
                                <option value="Late Fee">Late Fee (विलंब शुल्क)</option>
                                <option value="Other Fee">Other Fee</option>
                                <option value="__OTHER__">Other (Type custom... / अन्य शुल्क)</option>
                              </select>
                            ) : (
                              <div className="relative">
                                <input
                                  type="text"
                                  value={row.purpose}
                                  onChange={(e) => {
                                    const newRows = [...extraFeeRows];
                                    newRows[rIdx].purpose = e.target.value;
                                    setExtraFeeRows(newRows);
                                  }}
                                  placeholder="Type custom purpose..."
                                  autoFocus
                                  className="w-full pl-2.5 pr-7 py-1.5 text-xs font-semibold border-2 border-sky-500 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRows = [...extraFeeRows];
                                    newRows[rIdx].isCustom = false;
                                    newRows[rIdx].purpose = 'Academic Fee';
                                    setExtraFeeRows(newRows);
                                  }}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
                                  title="Back to dropdown"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Class / Semester / Year:</label>
                        <select value={feeDeskClass} onChange={(e) => setFeeDeskClass(e.target.value)} className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer">
                          <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                            <option value="1st Year">1st Year (1st Year Annual)</option>
                            <option value="2nd Year">2nd Year (2nd Year Annual)</option>
                            <option value="3rd Year">3rd Year (3rd Year Annual)</option>
                            <option value="4th Year">4th Year (4th Year Annual)</option>
                          </optgroup>
                          <optgroup label="Semester Pattern (सेमेस्टर)">
                            <option value="SEM-1">SEM-1 (1st Semester)</option>
                            <option value="SEM-2">SEM-2 (2nd Semester)</option>
                            <option value="SEM-3">SEM-3 (3rd Semester)</option>
                            <option value="SEM-4">SEM-4 (4th Semester)</option>
                            <option value="SEM-5">SEM-5 (5th Semester)</option>
                            <option value="SEM-6">SEM-6 (6th Semester)</option>
                            <option value="SEM-7">SEM-7 (7th Semester)</option>
                            <option value="SEM-8">SEM-8 (8th Semester)</option>
                          </optgroup>
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
                    const payList = (Array.isArray(feeDeskPayments) && feeDeskPayments.length > 0)
                      ? feeDeskPayments
                      : (feeDeskStudent.feeHistory || feeDeskStudent.payments || []);

                    const bd = calculateStudentYearBreakdown({
                      ...feeDeskStudent,
                      payments: payList
                    });

                    const acad = bd.feeY1 + bd.feeY2 + bd.feeY3 + bd.feeY4;
                    const sch = bd.totalSch;
                    const tot = bd.totalFee;
                    const paid = bd.totalPaid;
                    const rem = bd.totalRem;
                    const isProfileAdvance = bd.isAdvance;
                    const profileAdvanceAmt = bd.advanceAmount;

                    const yearRows = [
                      { label: '1st Year', sub: 'SEM-1 & 2', acad: bd.feeY1, sch: bd.schY1, total: bd.totalY1, rec: bd.recY1, due: bd.dueY1, adv: bd.advY1 },
                      { label: '2nd Year', sub: 'SEM-3 & 4', acad: bd.feeY2, sch: bd.schY2, total: bd.totalY2, rec: bd.recY2, due: bd.dueY2, adv: bd.advY2 },
                      { label: '3rd Year', sub: 'SEM-5 & 6', acad: bd.feeY3, sch: bd.schY3, total: bd.totalY3, rec: bd.recY3, due: bd.dueY3, adv: bd.advY3 },
                      { label: '4th Year', sub: 'SEM-7 & 8', acad: bd.feeY4, sch: bd.schY4, total: bd.totalY4, rec: bd.recY4, due: bd.dueY4, adv: bd.advY4 }
                    ];

                    return (
                      <div className="space-y-4 pt-2">
                        {/* 5 Summary Cards */}
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
                            <div className="text-[10px] text-emerald-700 uppercase font-bold">Receive Fees</div>
                            <div className="text-sm font-black text-emerald-800 font-mono">₹{paid.toLocaleString('en-IN')}/-</div>
                          </div>
                          {isProfileAdvance ? (
                            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 shadow-2xs col-span-2 sm:col-span-1">
                              <div className="text-[10px] text-emerald-700 uppercase font-bold">Advance Credit Paid</div>
                              <div className="text-sm font-black text-emerald-800 font-mono">+₹{profileAdvanceAmt.toLocaleString('en-IN')}/-</div>
                              {feeDeskStudent.nextFeeDueDate && (
                                <div className="text-[9px] text-emerald-600 font-bold mt-0.5">📅 Due: {feeDeskStudent.nextFeeDueDate}</div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-rose-50/70 border border-rose-300 rounded-xl p-2.5 shadow-2xs col-span-2 sm:col-span-1">
                              <div className="text-[10px] text-rose-700 uppercase font-bold">Remaining Fee</div>
                              <div className="text-sm font-black text-rose-800 font-mono">₹{rem.toLocaleString('en-IN')}/-</div>
                              {feeDeskStudent.nextFeeDueDate && (
                                <div className="text-[9px] text-rose-600 font-bold mt-0.5">📅 Due Date: {feeDeskStudent.nextFeeDueDate}</div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Year-Wise Fee & Dues Summary Table (सालाना फीस व बकाया विवरण) */}
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-200 rounded-2xl p-3.5 space-y-2.5 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <Sparkles className="w-3 h-3" />
                              </span>
                              <div>
                                <h4 className="font-black text-slate-900 text-xs uppercase tracking-wide">
                                  Year-Wise Fee & Dues Summary (सालाना फीस व बकाया विवरण)
                                </h4>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  Har saal ki banti fee, scholarship, receive fee aur bacha hua balance
                                </p>
                              </div>
                            </div>
                            <div className={`${isProfileAdvance ? 'bg-emerald-800' : 'bg-indigo-900'} text-white px-3 py-1 rounded-xl text-[11px] font-black font-mono self-start sm:self-auto shadow-xs`}>
                              {isProfileAdvance ? `+ Advance Credit: ₹${profileAdvanceAmt.toLocaleString('en-IN')}/-` : `Total Balance Due: ₹${rem.toLocaleString('en-IN')}/-`}
                            </div>
                          </div>

                          <div className="border border-indigo-200/90 rounded-xl overflow-x-auto bg-white shadow-2xs">
                            <table className="w-full text-left border-collapse text-[11px] min-w-[560px]">
                              <thead>
                                <tr className="bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider">
                                  <th className="py-2 px-3 border-r border-slate-700">Year / Semester</th>
                                  <th className="py-2 px-3 border-r border-slate-700 text-right">Center / Acad Fee</th>
                                  <th className="py-2 px-3 border-r border-slate-700 text-right">Scholarship</th>
                                  <th className="py-2 px-3 border-r border-slate-700 text-right">Total Fee</th>
                                  <th className="py-2 px-3 border-r border-slate-700 text-right text-emerald-300">Receive Fees</th>
                                  <th className="py-2 px-3 text-right text-amber-200">Balance Due</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 font-semibold">
                                {yearRows.map((yr, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/50 hover:bg-slate-100/60'}>
                                    <td className="py-2 px-3 border-r border-slate-200 font-bold text-slate-900">
                                      <span>{yr.label}</span>
                                      <span className="text-[10px] text-slate-500 font-normal ml-1.5 font-mono">({yr.sub})</span>
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-slate-800">
                                      ₹{yr.acad.toLocaleString('en-IN')}/-
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono text-purple-700">
                                      {yr.sch > 0 ? `₹${yr.sch.toLocaleString('en-IN')}/-` : '-'}
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                                      ₹{yr.total.toLocaleString('en-IN')}/-
                                    </td>
                                    <td className="py-2 px-3 border-r border-slate-200 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <span>₹{yr.rec.toLocaleString('en-IN')}/-</span>
                                        {yr.rec > 0 && (
                                          <div className="flex items-center gap-1 ml-1.5">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const yrNum = idx + 1;
                                                const matchLabels = yrNum === 1 ? ['YEAR1', 'SEM-1', 'SEM-2', '1ST'] : yrNum === 2 ? ['YEAR2', 'SEM-3', 'SEM-4', '2ND'] : yrNum === 3 ? ['YEAR3', 'SEM-5', 'SEM-6', '3RD'] : ['YEAR4', 'SEM-7', 'SEM-8', '4TH'];
                                                const foundP = payList.find(p => {
                                                  const cls = (p.currentClass || p.year || p.semester || '').toUpperCase();
                                                  return matchLabels.some(m => cls.includes(m));
                                                });

                                                if (foundP) {
                                                  setEditingPaymentModal({
                                                    id: foundP.id || foundP.receiptNo,
                                                    receiptNo: foundP.receiptNo || `REC-Y${yrNum}`,
                                                    currentClass: foundP.currentClass || yr.label,
                                                    amountPaid: Number(foundP.amountPaid || foundP.amount || yr.rec),
                                                    purpose: foundP.purpose || `${yr.label} Received Fee`,
                                                    paymentMode: foundP.paymentMode || 'Cash',
                                                    refNo: foundP.refNo || '',
                                                    receivedBy: foundP.receivedBy || 'Admin Desk',
                                                    remark: foundP.remark || '',
                                                    feeDate: foundP.feeDate || (foundP.paymentDate ? foundP.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]),
                                                    yearKey: `paidYear${yrNum}`
                                                  });
                                                } else {
                                                  setEditingPaymentModal({
                                                    id: `paid-year${yrNum}`,
                                                    receiptNo: `REC-Y${yrNum}`,
                                                    currentClass: yr.label,
                                                    amountPaid: yr.rec,
                                                    purpose: `${yr.label} Received Fee`,
                                                    paymentMode: 'Cash',
                                                    refNo: '',
                                                    receivedBy: 'Admin Desk',
                                                    remark: '',
                                                    feeDate: new Date().toISOString().split('T')[0],
                                                    yearKey: `paidYear${yrNum}`
                                                  });
                                                }
                                              }}
                                              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200 transition-all cursor-pointer shadow-2xs"
                                              title={`Edit ${yr.label} Received Fee`}
                                            >
                                              <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const yrNum = idx + 1;
                                                const matchLabels = yrNum === 1 ? ['YEAR1', 'SEM-1', 'SEM-2', '1ST'] : yrNum === 2 ? ['YEAR2', 'SEM-3', 'SEM-4', '2ND'] : yrNum === 3 ? ['YEAR3', 'SEM-5', 'SEM-6', '3RD'] : ['YEAR4', 'SEM-7', 'SEM-8', '4TH'];
                                                const foundP = payList.find(p => {
                                                  const cls = (p.currentClass || p.year || p.semester || '').toUpperCase();
                                                  return matchLabels.some(m => cls.includes(m));
                                                });
                                                handleDeletePayment(foundP ? (foundP.id || foundP.receiptNo) : `paid-year${yrNum}`, yr.rec);
                                              }}
                                              className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                                              title={`Clear / Reset ${yr.label} Received Fee (Set to ₹0)`}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono font-black">
                                      {yr.due > 0 ? (
                                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 inline-block">
                                          ₹{yr.due.toLocaleString('en-IN')}/- Due
                                        </span>
                                      ) : yr.adv > 0 ? (
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] inline-block font-bold">
                                          +₹{yr.adv.toLocaleString('en-IN')}/- (Adv)
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px] inline-block font-bold">
                                          ✓ Cleared
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                                {/* Overall Summary Footer Row */}
                                <tr className="bg-slate-900 text-white font-black text-xs">
                                  <td className="py-2.5 px-3 border-r border-slate-700 uppercase">
                                    Total Course Dues
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-700 text-right font-mono">
                                    ₹{acad.toLocaleString('en-IN')}/-
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-700 text-right font-mono text-purple-300">
                                    ₹{sch.toLocaleString('en-IN')}/-
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-700 text-right font-mono">
                                    ₹{tot.toLocaleString('en-IN')}/-
                                  </td>
                                  <td className="py-2.5 px-3 border-r border-slate-700 text-right font-mono text-emerald-300">
                                    ₹{paid.toLocaleString('en-IN')}/-
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-extrabold">
                                    ₹{rem.toLocaleString('en-IN')}/-
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Payment History Ledger Table - ONLY rendered for Receive Fee desk */}
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
                            <th className="py-2.5 px-2.5 border-r border-slate-700">Received By</th>
                            <th className="py-2.5 px-2.5 border-r border-slate-700 text-right">Fee</th>
                            <th className="py-2.5 px-2 text-center">Fee Receipt / Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {(() => {
                            let list = (Array.isArray(feeDeskPayments) && feeDeskPayments.length > 0)
                              ? [...feeDeskPayments]
                              : (Array.isArray(feeDeskStudent?.feeHistory) && feeDeskStudent.feeHistory.length > 0)
                                ? [...feeDeskStudent.feeHistory]
                                : (Array.isArray(feeDeskStudent?.payments) && feeDeskStudent.payments.length > 0)
                                  ? [...feeDeskStudent.payments]
                                  : [];

                            const yearDefs = [
                              { key: 'paidYear1', yr: 1, label: '1st Year', match: ['YEAR1', 'SEM-1', 'SEM-2', '1ST'] },
                              { key: 'paidYear2', yr: 2, label: '2nd Year', match: ['YEAR2', 'SEM-3', 'SEM-4', '2ND'] },
                              { key: 'paidYear3', yr: 3, label: '3rd Year', match: ['YEAR3', 'SEM-5', 'SEM-6', '3RD'] },
                              { key: 'paidYear4', yr: 4, label: '4th Year', match: ['YEAR4', 'SEM-7', 'SEM-8', '4TH'] },
                            ];

                            yearDefs.forEach(yd => {
                              const yAmt = Number(feeDeskStudent?.[yd.key] || 0);
                              if (yAmt > 0) {
                                const alreadyHas = list.some(p => {
                                  const cls = (p.currentClass || p.year || '').toUpperCase();
                                  return yd.match.some(m => cls.includes(m));
                                });
                                if (!alreadyHas) {
                                  list.push({
                                    id: `paid-year${yd.yr}`,
                                    receiptNo: `REC-Y${yd.yr}`,
                                    currentClass: `${yd.label}`,
                                    purpose: `${yd.label} Received Fee`,
                                    paymentMode: 'Cash',
                                    refNo: '-',
                                    receivedBy: 'Admin Desk',
                                    amountPaid: yAmt,
                                    amount: yAmt,
                                    feeDate: feeDeskStudent?.admissionDate || new Date().toISOString().split('T')[0],
                                    isYearEntry: true,
                                    yearKey: yd.key
                                  });
                                }
                              }
                            });

                            if (list.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="10" className="py-6 text-center text-slate-400 italic">
                                    No payment installments recorded yet for this student.
                                  </td>
                                </tr>
                              );
                            }

                            return list.map((p, idx) => {
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
                                            transactionRef: p.transactionRef || p.refNo || 'CASH-COUNTER',
                                            totalFee: p.totalFee || tot,
                                            totalPaidToDate: p.totalPaidToDate || paid,
                                            balanceRemaining: p.balanceRemaining !== undefined ? p.balanceRemaining : (p.remainingDues !== undefined ? p.remainingDues : rem),
                                            academicFee: acad,
                                            studentFee: acad,
                                            scholarshipAmount: sch,
                                            totalPaid: paid,
                                            balanceDue: rem
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
                                          setEditPaymentError(null);
                                          const rawDate = p.feeDate || p.paymentDate || p.date || '';
                                          let formattedDate = new Date().toISOString().split('T')[0];
                                          if (rawDate) {
                                            try {
                                              const d = new Date(rawDate);
                                              if (!isNaN(d.getTime())) {
                                                formattedDate = d.toISOString().split('T')[0];
                                              }
                                            } catch (e) {}
                                          }
                                          setEditingPaymentModal({
                                            ...p,
                                            id: p.id || p.receiptNo,
                                            receiptNo: p.receiptNo || '',
                                            amountPaid: p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0),
                                            feeDate: formattedDate,
                                            paymentMode: p.paymentMode || 'Cash',
                                            purpose: p.purpose || p.feeType || 'Tuition Fee',
                                            currentClass: p.currentClass || feeDeskStudent.currentClass || 'SEM-1',
                                            refNo: p.refNo || p.transactionRef || '',
                                            receivedBy: p.receivedBy || 'Admin Desk',
                                            remark: p.remark || '',
                                            yearKey: p.yearKey
                                          });
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit this Payment Entry"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeletePayment(p.id || p.receiptNo, p.amountPaid || p.amount)}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Delete this Payment Entry"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {/* 2. SET FEE MODE: Center Fee Entry Table with Date, Print, Edit, Delete */}
              {feeDeskMode === 'set_fee' && (() => {
                const fallbackAcad = Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0));
                const centerFeeEntries = (Array.isArray(feeDeskStudent.academicFeeHistory) && feeDeskStudent.academicFeeHistory.length > 0)
                  ? feeDeskStudent.academicFeeHistory
                  : (fallbackAcad > 0 ? [{
                      id: 'CF-' + (feeDeskStudent.id || feeDeskStudent.rollNo || '1'),
                      receiptNo: `CF-${feeDeskStudent.rollNo || '001'}`,
                      date: feeDeskStudent.academicFeeDate || (feeDeskStudent.createdAt ? feeDeskStudent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                      feeDate: feeDeskStudent.academicFeeDate || (feeDeskStudent.createdAt ? feeDeskStudent.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
                      currentClass: feeDeskStudent.currentClass || 'SEM-1',
                      purpose: 'Center Fee (Academic Fee)',
                      paymentMode: 'Official Record',
                      refNo: '-',
                      receivedBy: 'Admin Desk',
                      amount: fallbackAcad,
                      amountPaid: fallbackAcad,
                      remark: feeDeskStudent.remark || 'Center Fee'
                    }] : []);
                const currentAcad = centerFeeEntries.reduce((sum, e) => sum + Number(e.amountPaid !== undefined ? e.amountPaid : (e.amount || 0)), 0);

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
                                            amountPaid: cAmt,
                                            totalFee: currentAcad + Number(feeDeskStudent.scholarshipAmount || 0),
                                            totalPaidToDate: Number(feeDeskStudent.totalPaid || 0),
                                            balanceRemaining: Math.max(0, currentAcad + Number(feeDeskStudent.scholarshipAmount || 0) - Number(feeDeskStudent.totalPaid || 0)),
                                            academicFee: currentAcad,
                                            studentFee: currentAcad,
                                            scholarshipAmount: Number(feeDeskStudent.scholarshipAmount || 0),
                                            totalPaid: Number(feeDeskStudent.totalPaid || 0),
                                            balanceDue: Math.max(0, currentAcad + Number(feeDeskStudent.scholarshipAmount || 0) - Number(feeDeskStudent.totalPaid || 0))
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
                                          setEditPaymentError(null);
                                          const rawDate = c.feeDate || c.date || '';
                                          let formattedDate = new Date().toISOString().split('T')[0];
                                          if (rawDate) {
                                            try {
                                              const d = new Date(rawDate);
                                              if (!isNaN(d.getTime())) {
                                                formattedDate = d.toISOString().split('T')[0];
                                              }
                                            } catch (e) {}
                                          }
                                          setEditingPaymentModal({
                                            ...c,
                                            isCenterFee: true,
                                            id: c.id,
                                            receiptNo: c.receiptNo || `CF-${feeDeskStudent.rollNo || '001'}`,
                                            amountPaid: cAmt,
                                            feeDate: formattedDate,
                                            purpose: c.purpose || 'Center Fee',
                                            currentClass: c.currentClass || feeDeskStudent.currentClass || 'SEM-1'
                                          });
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit Center Fee"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Edit</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCenterFee(c.id, cAmt, c.purpose)}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Delete Center Fee"
                                      >
                                        <Trash2 className="w-3 h-3" />
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
                                            amountPaid: sAmt,
                                            totalFee: totalSch + Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0)),
                                            totalPaidToDate: Number(feeDeskStudent.totalPaid || 0),
                                            balanceRemaining: Math.max(0, (totalSch + Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0))) - Number(feeDeskStudent.totalPaid || 0)),
                                            academicFee: Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0)),
                                            studentFee: Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0)),
                                            scholarshipAmount: totalSch,
                                            totalPaid: Number(feeDeskStudent.totalPaid || 0),
                                            balanceDue: Math.max(0, (totalSch + Number(feeDeskStudent.academicFee !== undefined && feeDeskStudent.academicFee !== null ? feeDeskStudent.academicFee : (feeDeskStudent.studentFee || 0))) - Number(feeDeskStudent.totalPaid || 0))
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
                                          setEditPaymentError(null);
                                          const rawDate = sEntry.feeDate || sEntry.date || '';
                                          let formattedDate = new Date().toISOString().split('T')[0];
                                          if (rawDate) {
                                            try {
                                              const d = new Date(rawDate);
                                              if (!isNaN(d.getTime())) {
                                                formattedDate = d.toISOString().split('T')[0];
                                              }
                                            } catch (e) {}
                                          }
                                          setEditingPaymentModal({
                                            ...sEntry,
                                            isScholarship: true,
                                            year: sEntry.year || 'year1',
                                            receiptNo: sEntry.receiptNo,
                                            amountPaid: sAmt,
                                            feeDate: formattedDate,
                                            purpose: sEntry.purpose || sEntry.yearLabel || 'Scholarship',
                                            currentClass: sEntry.currentClass || feeDeskStudent.currentClass || 'SEM-1'
                                          });
                                        }}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                        title="Edit Scholarship Entry"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                        <span>Edit</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto">
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

                {!(editingPaymentModal.isCenterFee || editingPaymentModal.isScholarship) && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Receipt No*
                    </label>
                    <input
                      type="text"
                      required
                      value={editingPaymentModal.receiptNo || ''}
                      onChange={(e) => setEditingPaymentModal(prev => ({ ...prev, receiptNo: e.target.value }))}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-300 font-mono text-indigo-900"
                    />
                  </div>
                )}

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
                    Class / Semester / Year*
                  </label>
                  <select
                    value={editingPaymentModal.currentClass || ''}
                    onChange={(e) => {
                      const newClass = e.target.value;
                      setEditingPaymentModal(prev => {
                        let updatedYear = prev.year;
                        let updatedPurpose = prev.purpose;
                        if (prev.isScholarship) {
                          const cls = String(newClass).toUpperCase();
                          if (cls.includes('1ST') || cls.includes('SEM-1') || cls.includes('SEM-2')) {
                            updatedYear = 'year1';
                            if (!prev.purpose || prev.purpose.includes('Year Scholarship') || prev.purpose === 'Scholarship') {
                              updatedPurpose = '1st Year Scholarship';
                            }
                          } else if (cls.includes('2ND') || cls.includes('SEM-3') || cls.includes('SEM-4')) {
                            updatedYear = 'year2';
                            if (!prev.purpose || prev.purpose.includes('Year Scholarship') || prev.purpose === 'Scholarship') {
                              updatedPurpose = '2nd Year Scholarship';
                            }
                          } else if (cls.includes('3RD') || cls.includes('SEM-5') || cls.includes('SEM-6')) {
                            updatedYear = 'year3';
                            if (!prev.purpose || prev.purpose.includes('Year Scholarship') || prev.purpose === 'Scholarship') {
                              updatedPurpose = '3rd Year Scholarship';
                            }
                          } else if (cls.includes('4TH') || cls.includes('5TH') || cls.includes('SEM-7') || cls.includes('SEM-8')) {
                            updatedYear = 'year4';
                            if (!prev.purpose || prev.purpose.includes('Year Scholarship') || prev.purpose === 'Scholarship') {
                              updatedPurpose = '4th Year Scholarship';
                            }
                          }
                        }
                        return {
                          ...prev,
                          currentClass: newClass,
                          year: updatedYear,
                          purpose: updatedPurpose
                        };
                      });
                    }}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-indigo-400 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Select Class / Semester / Year</option>
                    {editingPaymentModal.currentClass && ![
                      '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year',
                      'SEM-1', 'SEM-2', 'SEM-3', 'SEM-4', 'SEM-5', 'SEM-6', 'SEM-7', 'SEM-8'
                    ].includes(editingPaymentModal.currentClass) && (
                      <option value={editingPaymentModal.currentClass}>
                        Current: {editingPaymentModal.currentClass}
                      </option>
                    )}
                    <optgroup label="Annual / Yearly Pattern (वार्षिक)">
                      <option value="1st Year">1st Year (1st Year Annual)</option>
                      <option value="2nd Year">2nd Year (2nd Year Annual)</option>
                      <option value="3rd Year">3rd Year (3rd Year Annual)</option>
                      <option value="4th Year">4th Year (4th Year Annual)</option>
                      <option value="5th Year">5th Year (5th Year Annual)</option>
                    </optgroup>
                    <optgroup label="Semester Pattern (सेमेस्टर)">
                      <option value="SEM-1">SEM-1 (1st Semester)</option>
                      <option value="SEM-2">SEM-2 (2nd Semester)</option>
                      <option value="SEM-3">SEM-3 (3rd Semester)</option>
                      <option value="SEM-4">SEM-4 (4th Semester)</option>
                      <option value="SEM-5">SEM-5 (5th Semester)</option>
                      <option value="SEM-6">SEM-6 (6th Semester)</option>
                      <option value="SEM-7">SEM-7 (7th Semester)</option>
                      <option value="SEM-8">SEM-8 (8th Semester)</option>
                    </optgroup>
                  </select>
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
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-navy-900 text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
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
                {!isRecordsDesk && (
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(selectedStudent)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Fully Edit Student & Enrollment Record"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Student</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-bold gap-2 shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeProfileTab === 'profile' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Personal & Academic
              </button>
              <button
                onClick={() => setActiveProfileTab('documents')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeProfileTab === 'documents' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Uploaded Documents & KYC
              </button>
              <button
                onClick={() => setActiveProfileTab('fees')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeProfileTab === 'fees' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Fee Ledger ({selectedStudent.payments?.length || 0})
              </button>
              <button
                onClick={() => setActiveProfileTab('results')}
                className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
                  activeProfileTab === 'results' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-500'
                }`}
              >
                Semester Results ({selectedStudent.results?.length || 0})
              </button>
            </div>

            {/* Scrollable Modal Body Container */}
            <div className="overflow-y-auto flex-1 overscroll-contain">

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

                {/* 5. नियम एवं शर्तें (Terms & Conditions & Undertaking) */}
                <div className="pt-2">
                  <StudentTermsAndConditions
                    compact={false}
                    showSignatures={true}
                    studentSignatureImage={selectedStudent.documents?.signature || null}
                    title="विद्यार्थी प्रवेश नियम एवं शर्तें (Student Admission Terms & Conditions)"
                  />
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

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setPrintSlipStudent(selectedStudent)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" /> Print Admission Slip
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] my-auto animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
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
              <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}
            {editSuccess && (
              <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} noValidate className="p-6 space-y-6 text-xs flex-1 overflow-y-auto overscroll-contain">
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
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Cancel Admission Button */}
                  <button
                    type="button"
                    onClick={() => setCancellingStudent(editingStudent)}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs hover:shadow text-xs"
                    title="Cancel this student's admission and move to Cancelled Admissions registry"
                  >
                    <Ban className="w-4 h-4 text-rose-600" />
                    <span>Cancel Admission</span>
                  </button>

                  {/* Complete Course / Degree Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenCompleteCourseModal(editingStudent)}
                    className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs hover:shadow text-xs"
                    title="Mark degree completed and transfer to Document Return section"
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Complete Degree (डिग्री पूर्ण)</span>
                  </button>
                </div>

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
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-rose-200 my-auto animate-fadeIn">
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
                  <option value="Other">⚙️ Other (अन्य — खुद लिखें)</option>
                </select>

                {/* Custom reason input — shows only when "Other" is selected */}
                {cancelReason === 'Other' && (
                  <div className="mt-2">
                    <label className="block text-[11px] font-bold text-rose-700 mb-1">
                      अपना कारण लिखें (Write Your Custom Reason) *
                    </label>
                    <textarea
                      rows={3}
                      value={cancelOtherReason}
                      onChange={(e) => setCancelOtherReason(e.target.value)}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="यहाँ कारण लिखें... (e.g. Student moved to another city, long illness, etc.)"
                      className="w-full p-2.5 bg-white border-2 border-rose-400 rounded-xl font-medium text-slate-800 text-[12px] focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none placeholder:text-slate-400"
                    />
                  </div>
                )}
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

      {/* Complete Course / Degree Confirmation Modal */}
      {completingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-emerald-200 my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">Mark Course / Degree Completed</h3>
                  <p className="text-xs text-emerald-200">Transfer student to Document Return Registry</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletingStudent(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 text-xs text-slate-800">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase">Student Details</span>
                  <span className="font-mono text-[11px] font-black text-emerald-900">Roll: {completingStudent.rollNo || 'Not Set'}</span>
                </div>
                <p className="text-sm font-black text-slate-900">{completingStudent.fullName || completingStudent.name}</p>
                <p className="text-[11px] text-slate-600">
                  S/O {completingStudent.fatherName || 'N/A'} • {completingStudent.courseName || completingStudent.course}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Enrollment No: {completingStudent.enrollmentNo || 'Not Set'}
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900 space-y-1 text-[11px]">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Important Notice:</span>
                </p>
                <p className="leading-relaxed">
                  Upon marking as complete, this student will be moved to the <strong>"Completed &amp; Document Return"</strong> page. There you can record returned marksheets, TC, migration certificate, and print formal clearance acknowledgment slips.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Completion Date:</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Remarks / Notes:</label>
                <input
                  type="text"
                  value={completionRemark}
                  onChange={(e) => setCompletionRemark(e.target.value)}
                  placeholder="e.g. All semesters/years completed successfully"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCompletingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={completeLoading}
                  onClick={handleConfirmCompleteCourse}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{completeLoading ? 'Completing...' : 'Confirm & Complete'}</span>
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

      {/* Excel Download & Pre-Filter Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shadow-inner">
                  📊
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight flex items-center gap-2">
                    <span>Export Students Data to Excel (.xlsx)</span>
                  </h3>
                  <p className="text-xs text-emerald-100/90 font-medium">
                    डाउनलोड करने से पहले फ़िल्टर (Session, Satra, University, Course, Year) सेट करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Filters */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-bold">
                  <span className="text-lg">🎯</span>
                  <span>Filtered Matching Records:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-sm shadow-xs">
                    {getExportFilteredStudents().length} Students Ready
                  </span>
                  <span className="text-slate-500 font-medium">(Total: {students.length})</span>
                </div>
              </div>

              {/* Filter Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Session */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Session (सत्र):
                  </label>
                  <select
                    value={exportSession}
                    onChange={(e) => setExportSession(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Sessions (सभी सत्र)</option>
                    {Array.from(new Set([
                      '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025',
                      '2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030',
                      ...students.map(s => s.currentSession || s.admissionSession).filter(Boolean)
                    ])).sort().map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Satra (July / Jan) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Satra (July / January):
                  </label>
                  <select
                    value={exportSatra}
                    onChange={(e) => setExportSatra(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Satras (दोनों सत्र)</option>
                    <option value="July">July (जुलाई सत्र)</option>
                    <option value="January">January (जनवरी सत्र)</option>
                  </select>
                </div>

                {/* 3. University */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select University (विश्वविद्यालय):
                  </label>
                  <select
                    value={exportUniversity}
                    onChange={(e) => {
                      setExportUniversity(e.target.value);
                      setExportCollege('all');
                      setExportCourse('all');
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-indigo-900 shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Universities (सभी विश्वविद्यालय)</option>
                    {allAvailableUniversities.map((uName, i) => (
                      <option key={i} value={uName}>{uName}</option>
                    ))}
                  </select>
                </div>

                {/* 4. College */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select College (कॉलेज / संस्थान):
                  </label>
                  <select
                    value={exportCollege}
                    onChange={(e) => setExportCollege(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Colleges (सभी कॉलेज)</option>
                    {exportAvailableColleges.map((col, i) => (
                      <option key={i} value={col.name || col.code}>{col.name} ({col.code || 'Affiliated'})</option>
                    ))}
                  </select>
                </div>

                {/* 5. Course */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Course (पाठ्यक्रम):
                  </label>
                  <select
                    value={exportCourse}
                    onChange={(e) => setExportCourse(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Courses (सभी पाठ्यक्रम)</option>
                    {exportAvailableCourses.map((cName, i) => (
                      <option key={i} value={cName}>{cName}</option>
                    ))}
                  </select>
                </div>

                {/* 6. Year / Semester */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Year / Class (वर्ष / कक्षा):
                  </label>
                  <select
                    value={exportYear}
                    onChange={(e) => setExportYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Years & Semesters (सभी वर्ष व सेमेस्टर)</option>
                    <option value="1st Year">1st Year (प्रथम वर्ष / SEM 1-2)</option>
                    <option value="2nd Year">2nd Year (द्वितीय वर्ष / SEM 3-4)</option>
                    <option value="3rd Year">3rd Year (तृतीय वर्ष / SEM 5-6)</option>
                    <option value="4th Year">4th Year (चतुर्थ वर्ष / SEM 7-8)</option>
                    <option value="SEM-1">Semester 1 (सेमेस्टर 1)</option>
                    <option value="SEM-2">Semester 2 (सेमेस्टर 2)</option>
                    <option value="SEM-3">Semester 3 (सेमेस्टर 3)</option>
                    <option value="SEM-4">Semester 4 (सेमेस्टर 4)</option>
                    <option value="SEM-5">Semester 5 (सेमेस्टर 5)</option>
                    <option value="SEM-6">Semester 6 (सेमेस्टर 6)</option>
                    <option value="SEM-7">Semester 7 (सेमेस्टर 7)</option>
                    <option value="SEM-8">Semester 8 (सेमेस्टर 8)</option>
                  </select>
                </div>

                {/* 7. Fee Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Fee Payment Status (फीस स्थिति):
                  </label>
                  <select
                    value={exportFeeStatus}
                    onChange={(e) => setExportFeeStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium shadow-2xs cursor-pointer"
                  >
                    <option value="all">All Students (सभी विद्यार्थी)</option>
                    <option value="due_only">⚠️ Pending Dues Only (केवल बकाया फीस वाले)</option>
                    <option value="cleared">✅ Fee Fully Cleared (पूरी फीस जमा वाले)</option>
                    <option value="advance_only">💰 Advance Fee Credit (अग्रिम राशि जमा वाले)</option>
                  </select>
                </div>

              </div>

              {/* Data Inclusions Preview Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Included Columns in Downloaded Excel (.xlsx):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1 text-[11px] text-slate-500">
                  <div>• S.No, Roll No, Enrollment</div>
                  <div>• Student & Parent Names</div>
                  <div>• Mobile, Alternate, Email</div>
                  <div>• University & College</div>
                  <div>• Course & Specialization</div>
                  <div>• Session, Satra & Year</div>
                  <div>• 1st Year Fee & Paid</div>
                  <div>• 2nd Year Fee & Paid</div>
                  <div>• 3rd Year Fee & Paid</div>
                  <div>• 4th Year Fee & Paid</div>
                  <div>• Total Course Fee & Paid</div>
                  <div>• Remaining Dues & Advance</div>
                  <div>• Next Fee Due Date</div>
                  <div>• Gender, Category, Aadhar</div>
                  <div>• Admission Date & Status</div>
                </div>
              </div>

            </div>

            {/* Modal Footer Buttons */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setExportSession('all');
                  setExportSatra('all');
                  setExportUniversity('all');
                  setExportCollege('all');
                  setExportCourse('all');
                  setExportYear('all');
                  setExportFeeStatus('all');
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Export Filters</span>
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
                >
                  Cancel (रद्द करें)
                </button>
                <button
                  type="button"
                  disabled={getExportFilteredStudents().length === 0}
                  onClick={handleDownloadExcel}
                  className="flex-1 sm:flex-none px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-emerald-100" />
                  <span>Download Excel (.xlsx) ({getExportFilteredStudents().length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
