import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Calendar,
  Ban,
  AlertTriangle,
  DollarSign,
  PlusCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fireCelebration } from '../utils/confetti';
import PrintFeeReceipt from '../components/PrintFeeReceipt';

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
  onNavigateToCancelled,
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
    fee: 0,
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
    totalFee: 0,
    initialPaid: 0,
    paymentMode: 'Cash',
    upiId: '',
    admissionSession: '2024-2025',
    admissionDate: new Date().toISOString().split('T')[0],
    address: '',
    category: 'General',
    remark: '',
    documents: {
      marksheet10: null,
      marksheet12: null,
      graduation: null,
      aadhaar: null,
      abcId: null,
      photo: null,
      signature: null,
    }
  });

  // Quick Edit Enrollment Number Modal state
  const [editingEnrollmentStudent, setEditingEnrollmentStudent] = useState(null);
  const [tempEnrollmentNo, setTempEnrollmentNo] = useState('');
  const [savingEnrollmentNo, setSavingEnrollmentNo] = useState(false);

  // Student Status Filter: 'active' | 'cancelled' | 'all'
  const [studentStatusFilter, setStudentStatusFilter] = useState('active');

  // Dedicated Vocational Student Fee Desk Modal state (StudentList Parity)
  const [feeDeskStudent, setFeeDeskStudent] = useState(null);
  const [feeDeskMode, setFeeDeskMode] = useState('receive'); // 'receive' | 'set_fee'
  const [feeDeskPayments, setFeeDeskPayments] = useState([]);
  const [feeDeskTotalFee, setFeeDeskTotalFee] = useState('');
  const [feeDeskDate, setFeeDeskDate] = useState(new Date().toISOString().split('T')[0]);
  const [feeDeskClass, setFeeDeskClass] = useState('1 Year');
  const [feeDeskPurpose, setFeeDeskPurpose] = useState('Course Fee Installment');
  const [feeDeskModePayment, setFeeDeskModePayment] = useState('Cash');
  const [feeDeskRefNo, setFeeDeskRefNo] = useState('');
  const [feeDeskAmount, setFeeDeskAmount] = useState('');
  const [feeDeskReceivedBy, setFeeDeskReceivedBy] = useState('Admin Desk');
  const [feeDeskRemark, setFeeDeskRemark] = useState('');
  const [feeDeskLoading, setFeeDeskLoading] = useState(false);
  const [feeDeskError, setFeeDeskError] = useState(null);
  const [feeDeskSuccess, setFeeDeskSuccess] = useState(null);

  // Expandable Row State (horizontal dropdown)
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Official Fee Receipt Print Modal State
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  // Edit Student Modal state
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStudentForm, setEditStudentForm] = useState({
    studentName: '',
    fatherName: '',
    motherName: '',
    phone: '',
    aadhaarNo: '',
    abcId: '',
    enrollmentNo: '',
    instituteId: 'inst-mdvti',
    instituteName: 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
    parentCenter: 'PKC Institute',
    courseName: '',
    branch: '',
    duration: '1 Year',
    totalFee: 0,
    totalPaid: 0,
    newPaymentAmount: '',
    paymentMode: 'Cash',
    upiId: '',
    paymentRemark: '',
    status: 'Active'
  });
  const [editStudentSubmitting, setEditStudentSubmitting] = useState(false);

  // Cancel Admission Modal state
  const [cancellingStudent, setCancellingStudent] = useState(null);
  const [cancelForm, setCancelForm] = useState({
    cancellationDate: new Date().toISOString().split('T')[0],
    reason: 'Student requested cancellation',
    refundPaid: '',
    paymentMode: 'Cash',
    refundNotes: '',
    cancelledBy: 'Admin'
  });
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  // Delete Student confirmation state
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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

  // Trigger Print Fee Receipt Slip / Voucher
  const handleTriggerPrintReceipt = (payment, student = null) => {
    const st = student || editingStudent;
    if (!st || !payment) return;
    setReceiptToPrint({
      receiptNo: payment.receiptNo || `REC-${st.rollNo || Date.now().toString().slice(-4)}-01`,
      paymentDate: payment.date || new Date().toISOString(),
      paymentMode: payment.paymentMode || 'Cash',
      transactionRef: payment.referenceNo || payment.upiId || payment.utrNo || 'CASH-COUNTER',
      studentName: st.fullName || st.studentName,
      rollNo: st.rollNo || st.registrationNo,
      collegeName: st.parentCenter || st.collegeName || 'PKC Education Learning Institute & Consultancy',
      universityName: st.universityName || st.instituteName || 'Maharishi Dayanand Vocational Training Institute',
      courseName: st.courseName,
      currentClass: st.duration || 'Vocational Skills Diploma',
      feeType: 'Vocational Course Fee',
      paidFor: payment.purpose || payment.remark || 'Fee Installment Payment',
      amountPaid: payment.amount,
      totalFee: Number(st.totalFee !== undefined ? st.totalFee : (st.academicFee || 0)),
      totalPaidToDate: Number(st.totalPaid || 0),
      balanceRemaining: Number(st.balanceDue || 0)
    });
  };

  // Helper open functions matching StudentList parity
  const handleOpenReceiveFeeModal = (student) => handleOpenFeeDesk(student, 'receive');
  const handleOpenSetFeeModal = (student) => handleOpenFeeDesk(student, 'set_fee');

  // Switch between 'receive' and 'set_fee' modes inside modal
  const switchFeeDeskMode = (newMode) => {
    setFeeDeskMode(newMode);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);
    if (newMode === 'set_fee') {
      setFeeDeskPurpose('Total Vocational Course Fee');
    } else {
      setFeeDeskPurpose('Course Fee Installment');
      const tot = Number(feeDeskTotalFee || (feeDeskStudent?.totalFee || feeDeskStudent?.academicFee || 0));
      const paid = Number(feeDeskStudent?.totalPaid || 0);
      const rem = Math.max(0, tot - paid);
      setFeeDeskAmount(rem > 0 ? String(rem) : '');
    }
  };

  // Open Vocational Fee Desk Modal (Matching StudentList.jsx)
  const handleOpenFeeDesk = async (student, mode = 'receive') => {
    setFeeDeskMode(mode);
    setFeeDeskStudent(student);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);
    setFeeDeskClass(student.duration || student.currentClass || '1 Year');
    setFeeDeskDate(new Date().toISOString().split('T')[0]);
    setFeeDeskModePayment('Cash');
    setFeeDeskRefNo('');
    setFeeDeskPurpose(mode === 'set_fee' ? 'Total Vocational Course Fee' : 'Course Fee Installment');
    setFeeDeskReceivedBy('Admin Desk');
    setFeeDeskRemark('');

    const tot = Number(student.totalFee !== undefined && student.totalFee !== null ? student.totalFee : (student.academicFee || student.courseFee || 0));
    const paid = Number(student.totalPaid || 0);
    const rem = Math.max(0, tot - paid);
    setFeeDeskTotalFee(tot > 0 ? String(tot) : (student.totalFee !== undefined && student.totalFee !== null && student.totalFee !== '' ? String(student.totalFee) : '0'));
    setFeeDeskAmount(mode === 'set_fee' ? '' : (rem > 0 ? String(rem) : ''));

    // Set initial payments from student record if available
    let initialList = Array.isArray(student.feeHistory) && student.feeHistory.length > 0
      ? student.feeHistory
      : (Array.isArray(student.payments) ? student.payments : []);
    if (initialList.length === 0 && Number(student.totalPaid || 0) > 0) {
      initialList = [{
        id: `FEE-INIT-${student.id || student.rollNo}`,
        receiptNo: `REC-${student.rollNo || '0001'}-01`,
        date: student.admissionDate || student.createdAt || new Date().toISOString().split('T')[0],
        amount: Number(student.totalPaid),
        paymentMode: student.paymentMode || 'Cash',
        referenceNo: student.referenceNo || student.upiId || student.utrNo || '',
        purpose: 'Admission & Course Fee',
        remark: 'Initial fee payment at admission'
      }];
    }
    setFeeDeskPayments(initialList);

    const studentLookupKey = student.rollNo || student.id || student.registrationNo || student.enrollmentNo;
    if (studentLookupKey) {
      try {
        const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}`);
        const data = await res.json();
        if (data.success && data.student) {
          setFeeDeskStudent(data.student);
          const serverPayments = (data.student.payments && data.student.payments.length > 0)
            ? data.student.payments
            : (data.student.feeHistory || initialList);
          setFeeDeskPayments(serverPayments);
          const latestTot = Number(data.student.totalFee !== undefined && data.student.totalFee !== null ? data.student.totalFee : (data.student.academicFee || data.student.courseFee || 0));
          const latestPaid = Number(data.student.totalPaid || 0);
          const latestRem = Math.max(0, latestTot - latestPaid);
          setFeeDeskTotalFee(latestTot > 0 ? String(latestTot) : (data.student.totalFee !== undefined && data.student.totalFee !== null && data.student.totalFee !== '' ? String(data.student.totalFee) : '0'));
          if (mode === 'receive') {
            setFeeDeskAmount(latestRem > 0 ? String(latestRem) : '');
          }
        }
      } catch (err) {
        console.warn('Could not fetch student payments:', err);
      }
    }
  };

  // Submit Fee Payment in Fee Desk
  const handleFeeDeskSubmit = async (e, actionOverride = null) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!feeDeskStudent) return;

    const studentLookupKey = feeDeskStudent.rollNo || feeDeskStudent.id || feeDeskStudent.registrationNo || feeDeskStudent.enrollmentNo;
    if (!studentLookupKey) {
      setFeeDeskError('Unable to identify student record. Missing roll number or ID.');
      return;
    }

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      const amt = (feeDeskAmount === '' || feeDeskAmount === null || feeDeskAmount === undefined) ? 0 : Number(feeDeskAmount);
      if (isNaN(amt) || amt < 0) {
        throw new Error('Please enter a valid amount (0 or more).');
      }

      const isSetTotalFee = actionOverride === 'set_total_fee';
      const isSetPaid = actionOverride === 'set_paid';
      const parsedTotalFee = (feeDeskTotalFee === '' || feeDeskTotalFee === null || feeDeskTotalFee === undefined) ? 0 : Number(feeDeskTotalFee);

      const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/receive-fee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: isSetTotalFee ? 0 : amt,
          action: isSetTotalFee ? 'set_total_fee' : (isSetPaid ? 'set_paid' : 'add'),
          totalFee: parsedTotalFee,
          paymentMode: feeDeskModePayment,
          feeDate: feeDeskDate,
          purpose: feeDeskPurpose || (isSetTotalFee ? 'Course Fee Update' : 'Course Fee Installment'),
          currentClass: feeDeskClass,
          refNo: feeDeskRefNo,
          receivedBy: feeDeskReceivedBy,
          remark: feeDeskRemark || (isSetTotalFee ? 'Course fee updated from Fee Desk' : '')
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to record payment');
      }

      const updatedStudent = data.student;
      setFeeDeskStudent(updatedStudent);
      setFeeDeskTotalFee(String(updatedStudent.totalFee !== undefined ? updatedStudent.totalFee : (updatedStudent.academicFee || '')));
      if (data.payments) {
        setFeeDeskPayments(data.payments);
      } else if (data.receipt) {
        setFeeDeskPayments(prev => [data.receipt, ...prev]);
      } else if (updatedStudent.feeHistory) {
        setFeeDeskPayments(updatedStudent.feeHistory);
      }

      setVocationalStudents(prev => prev.map(s => 
        (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) 
          ? { ...s, ...updatedStudent } 
          : s
      ));

      if (isSetTotalFee) {
        setFeeDeskSuccess(`Total Course Fee set to ₹${parsedTotalFee.toLocaleString('en-IN')}/- successfully! Balance due updated.`);
      } else if (isSetPaid) {
        setFeeDeskSuccess(`Paid fee updated to ₹${amt.toLocaleString('en-IN')} successfully!`);
      } else {
        setFeeDeskSuccess(`₹${amt.toLocaleString('en-IN')} fee installment recorded successfully! Receipt No: ${data.receipt?.receiptNo || 'Generated'}`);
      }

      const newRem = Math.max(0, (Number(updatedStudent.totalFee) || 0) - (Number(updatedStudent.totalPaid) || 0));
      setFeeDeskAmount(newRem > 0 ? String(newRem) : '0');
      if (!isSetTotalFee) {
        setFeeDeskRefNo('');
      }
      fetchVocationalStudents();
      if (onRefreshCourses) onRefreshCourses();
    } catch (err) {
      setFeeDeskError(err.message || 'Failed to submit fee payment');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  // Delete Payment Entry from Fee Desk
  const handleDeletePaymentFromDesk = async (paymentId, amountPaid) => {
    if (!feeDeskStudent || !paymentId) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete this payment installment of ₹${Number(amountPaid || 0).toLocaleString('en-IN')}? Total paid fee and balance due will be automatically recalculated.`);
    if (!confirmDelete) return;

    setFeeDeskLoading(true);
    setFeeDeskError(null);
    setFeeDeskSuccess(null);

    try {
      const studentLookupKey = feeDeskStudent.rollNo || feeDeskStudent.id || feeDeskStudent.registrationNo || feeDeskStudent.enrollmentNo;
      const res = await fetch(`/api/students/${encodeURIComponent(studentLookupKey)}/payments/${encodeURIComponent(paymentId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete payment entry');
      }

      const updatedStudent = data.student;
      setFeeDeskStudent(updatedStudent);
      setFeeDeskPayments(data.payments || updatedStudent.feeHistory || []);
      setVocationalStudents(prev => prev.map(s => 
        (s.id === updatedStudent.id || (s.rollNo && s.rollNo === updatedStudent.rollNo)) 
          ? { ...s, ...updatedStudent } 
          : s
      ));
      setFeeDeskSuccess(`Payment installment of ₹${Number(amountPaid || 0).toLocaleString('en-IN')} deleted successfully.`);
      fetchVocationalStudents();
      if (onRefreshCourses) onRefreshCourses();
    } catch (err) {
      setFeeDeskError(err.message || 'Error deleting payment installment');
    } finally {
      setFeeDeskLoading(false);
    }
  };

  // Print Receipt from Fee Desk
  const handlePrintReceiptFromDesk = (p) => {
    if (!feeDeskStudent || !p) return;
    const tot = Number(feeDeskStudent.totalFee !== undefined ? feeDeskStudent.totalFee : (feeDeskStudent.academicFee || 0));
    const paid = Number(feeDeskStudent.totalPaid || 0);
    const rem = Math.max(0, tot - paid);

    const pMode = p.paymentMode || 'Cash';
    const isUpi = pMode.toLowerCase().includes('upi') || pMode.toLowerCase().includes('online') || pMode.toLowerCase().includes('bank');
    const utr = p.refNo || p.transactionRef || p.upiId || p.referenceNo || p.utrNo || '';

    setReceiptToPrint({
      receiptNo: p.receiptNo || `REC-${feeDeskStudent.rollNo || Date.now().toString().slice(-4)}-01`,
      paymentDate: p.feeDate || p.paymentDate || p.date || new Date().toISOString(),
      paymentMode: pMode,
      transactionRef: isUpi ? (utr || '-') : 'CASH-COUNTER',
      refNo: utr,
      upiId: utr,
      studentName: p.studentName || feeDeskStudent.fullName || feeDeskStudent.studentName,
      rollNo: feeDeskStudent.rollNo || feeDeskStudent.registrationNo || feeDeskStudent.id,
      collegeName: feeDeskStudent.parentCenter || feeDeskStudent.collegeName || 'PKC Institute',
      universityName: feeDeskStudent.universityName || feeDeskStudent.instituteName || 'Maharishi Dayanand Vocational Training Institute',
      courseName: feeDeskStudent.courseName,
      currentClass: p.currentClass || feeDeskStudent.duration || '1 Year',
      feeType: p.feeType || 'Vocational Course Fee',
      paidFor: p.purpose || p.paidFor || 'Course Fee Installment',
      amountPaid: Number(p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0)),
      totalFee: tot,
      totalPaidToDate: paid,
      balanceRemaining: rem
    });
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (student) => {
    setEditingStudent(student);
    const feeVal = Number(student.totalFee !== undefined ? student.totalFee : (student.academicFee || 0));
    const paidVal = Number(student.totalPaid || 0);
    setEditStudentForm({
      studentName: student.fullName || student.studentName || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      phone: student.phone || student.contact || '',
      aadhaarNo: student.aadhaarNo || '',
      abcId: student.abcId || '',
      enrollmentNo: student.enrollmentNo || '',
      instituteId: student.instituteId || (student.universityName?.toLowerCase().includes('teacher') || student.universityName?.includes('टीचर्स') ? 'inst-mdette' : 'inst-mdvti'),
      instituteName: student.instituteName || student.universityName || 'Maharishi Dayanand Vocational Training Institute (MDVTI)',
      parentCenter: student.parentCenter || student.collegeName || 'PKC Institute',
      courseName: student.courseName || '',
      branch: student.branch || '',
      duration: student.duration || '1 Year',
      totalFee: feeVal,
      totalPaid: paidVal,
      newPaymentAmount: '',
      paymentMode: 'Cash',
      upiId: student.upiId || '',
      paymentRemark: '',
      status: student.status || 'Active'
    });
  };

  // Save Edit Student
  const handleSaveEditStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!editingStudent) return;
    if (!editStudentForm.studentName.trim()) {
      alert('Please enter student name');
      return;
    }

    setEditStudentSubmitting(true);
    try {
      const key = editingStudent.id || editingStudent.rollNo;
      const res = await fetch(`/api/vocational-students/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editStudentForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Student details and fees updated successfully!');
        if (Number(editStudentForm.newPaymentAmount) > 0 && data.student) {
          const latestFee = data.student.feeHistory?.[0] || {
            amount: Number(editStudentForm.newPaymentAmount),
            paymentMode: editStudentForm.paymentMode || 'Cash',
            referenceNo: editStudentForm.upiId || '',
            purpose: editStudentForm.paymentRemark || 'Fee Installment Payment',
            date: new Date().toISOString().split('T')[0]
          };
          handleTriggerPrintReceipt(latestFee, data.student);
        }
        setEditingStudent(null);
        fetchVocationalStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        throw new Error(data.message || 'Failed to update student');
      }
    } catch (err) {
      alert('Error updating student: ' + err.message);
    } finally {
      setEditStudentSubmitting(false);
    }
  };

  // Open Cancel Admission Modal
  const handleOpenCancelStudent = (student) => {
    setCancellingStudent(student);
    setCancelForm({
      cancellationDate: new Date().toISOString().split('T')[0],
      reason: 'Student requested cancellation',
      refundPaid: '',
      paymentMode: 'Cash',
      refundNotes: `Cancellation of vocational course admission for ${student.fullName || student.studentName || student.rollNo}`,
      cancelledBy: adminUser?.name || 'Admin'
    });
  };

  // Confirm Cancel Admission
  const handleConfirmCancelStudent = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!cancellingStudent) return;

    setCancelSubmitting(true);
    try {
      const key = cancellingStudent.id || cancellingStudent.rollNo;
      const res = await fetch(`/api/vocational-students/${encodeURIComponent(key)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('🚫 Admission cancelled and moved to Cancelled Admissions Hub!');
        setCancellingStudent(null);
        fetchVocationalStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        throw new Error(data.message || 'Failed to cancel admission');
      }
    } catch (err) {
      alert('Error cancelling admission: ' + err.message);
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Confirm Permanent Delete Student
  const handleConfirmDeleteStudent = async () => {
    if (!deletingStudent) return;

    setDeleteSubmitting(true);
    try {
      const key = deletingStudent.id || deletingStudent.rollNo;
      const res = await fetch(`/api/vocational-students/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast('🗑️ Student record permanently deleted.');
        setDeletingStudent(null);
        fetchVocationalStudents();
        if (onRefreshCourses) onRefreshCourses();
      } else {
        throw new Error(data.message || 'Failed to delete student');
      }
    } catch (err) {
      alert('Error deleting student: ' + err.message);
    } finally {
      setDeleteSubmitting(false);
    }
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

  // Clean arbitrary default fees from imported courses cache so fee is 0 (set by admin at admission)
  useEffect(() => {
    setCourses(prev => {
      let changed = false;
      const cleaned = prev.map(c => {
        // If fee was auto-filled with arbitrary defaults, reset to 0
        if (c.fee === 8000 || c.fee === 10000 || c.fee === 12000 || c.fee === 20000 || c.fee === 30000 || c.fee === 5000) {
          changed = true;
          return { ...c, fee: 0 };
        }
        return c;
      });
      if (changed) {
        try { localStorage.setItem('pkc_vocational_courses', JSON.stringify(cleaned)); } catch {}
        return cleaned;
      }
      return prev;
    });
  }, []);

  // Lock background scroll when any modal is active
  useEffect(() => {
    if (showAddCourseModal || showInstituteModal || showExcelModal || showEnrollModal || editingEnrollmentStudent || enrollSuccessData || editingStudent || cancellingStudent || deletingStudent || receiptToPrint || feeDeskStudent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddCourseModal, showInstituteModal, showExcelModal, showEnrollModal, editingEnrollmentStudent, enrollSuccessData, editingStudent, cancellingStudent, deletingStudent, receiptToPrint, feeDeskStudent]);

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
      fee: 0,
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
      fee: course.fee !== undefined ? course.fee : 0,
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
      totalFee: defCourse?.fee || 0,
      initialPaid: 0,
      paymentMode: 'Cash',
      admissionSession: '2024-2025',
      admissionDate: new Date().toISOString().split('T')[0],
      address: '',
      category: 'General',
      remark: '',
      documents: {
        marksheet10: null,
        marksheet12: null,
        graduation: null,
        aadhaar: null,
        abcId: null,
        photo: null,
        signature: null,
      }
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
      totalFee: defCourse?.fee || 0,
      initialPaid: 0
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
      totalFee: c.fee !== undefined ? c.fee : 0,
      initialPaid: 0
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

  // Document Upload Handler for Enrollment Form
  const handleDocUpload = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setEnrollForm(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [key]: { name: file.name, url: e.target.result, type: file.type }
        }
      }));
    };
    reader.readAsDataURL(file);
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

      // Do not auto-fill arbitrary fees; admin will set fee per student individually at admission
      let fee = Number(getVal('Fee', 'Total Fee', 'Fees', 'courseFee', 'शुल्क')) || 0;

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
        'Total Fee': 0,
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
        'Total Fee': 0,
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
        'Total Fee': 0,
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
        'Total Fee': 0,
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

  // Student status counts
  const activeStudentCount = useMemo(() => {
    return vocationalStudents.filter(s => !(s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes')).length;
  }, [vocationalStudents]);

  const cancelledStudentCount = useMemo(() => {
    return vocationalStudents.filter(s => s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes').length;
  }, [vocationalStudents]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return vocationalStudents.filter(s => {
      if (selectedInstituteFilter !== 'all') {
        const sInstId = s.instituteId || (s.universityName?.toLowerCase().includes('teacher') || s.universityName?.includes('टीचर्स') ? 'inst-mdette' : 'inst-mdvti');
        if (sInstId !== selectedInstituteFilter) return false;
      }
      const isCancelled = s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes';
      if (studentStatusFilter === 'active' && isCancelled) return false;
      if (studentStatusFilter === 'cancelled' && !isCancelled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (s.studentName || s.fullName || '').toLowerCase().includes(q) ||
          (s.fatherName || '').toLowerCase().includes(q) ||
          (s.rollNo || '').toLowerCase().includes(q) ||
          (s.enrollmentNo || '').toLowerCase().includes(q) ||
          (s.aadhaarNo || '').includes(q) ||
          (s.abcId || '').includes(q) ||
          (s.courseName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [vocationalStudents, selectedInstituteFilter, studentStatusFilter, searchQuery]);

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
    <div className="w-full space-y-6 text-slate-900 pb-16">
      
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
                        {Number(c.fee || 0) > 0 ? (
                          <span className="text-base font-black text-emerald-700">
                            ₹{Number(c.fee).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Set at Admission
                          </span>
                        )}
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
                        <td className="p-3 font-black text-emerald-700">
                          {Number(c.fee || 0) > 0 ? (
                            `₹${Number(c.fee).toLocaleString('en-IN')}`
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Set at Adm.
                            </span>
                          )}
                        </td>
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs text-slate-500 px-1">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-700">
                  Showing: <strong className="text-slate-900">{filteredStudents.length}</strong> of <strong className="text-indigo-700 font-bold">{vocationalStudents.length}</strong> vocational students
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Total in Central Records: <strong className="text-indigo-700 font-bold">{totalCentralStudents}</strong>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Every vocational student added here is also automatically visible in <strong>Master Student Records</strong> & <strong>Enroll New Student Directory</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter Pills */}
              <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('active')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    studentStatusFilter === 'active'
                      ? 'bg-white text-emerald-700 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Enrolled ({activeStudentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('cancelled')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    studentStatusFilter === 'cancelled'
                      ? 'bg-rose-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-rose-700'
                  }`}
                >
                  Cancelled ({cancelledStudentCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    studentStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({vocationalStudents.length})
                </button>
              </div>

              {onNavigateToCancelled && cancelledStudentCount > 0 && (
                <button
                  type="button"
                  onClick={onNavigateToCancelled}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                  title="Open full Cancelled Admissions & Refund Desk"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancelled Hub ({cancelledStudentCount})</span>
                  <ArrowRight className="w-3 h-3 text-rose-500" />
                </button>
              )}

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
                <h3 className="text-base font-bold text-slate-900">
                  {studentStatusFilter === 'cancelled' 
                    ? 'No cancelled vocational students' 
                    : 'No vocational students found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {studentStatusFilter === 'cancelled'
                    ? 'When a vocational student admission is cancelled, it will appear here and in the Cancelled Admissions Hub.'
                    : 'Click the button below to enroll a student or adjust your search filter.'}
                </p>
              </div>
              {studentStatusFilter !== 'cancelled' && (
                <button
                  type="button"
                  onClick={() => handleOpenEnrollStudent()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-md"
                >
                  + Enroll First Vocational Student
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3 cursor-pointer select-none">Roll / Reg No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Fee Details</th>
                      <th className="p-3 text-center">Paid_Fee</th>
                      <th className="p-3 text-center">Set_Fee</th>
                      <th className="p-3 text-center">Actions</th>
                      <th className="p-3 text-center">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredStudents.map((st) => {
                      const stKey = st.id || st.rollNo;
                      const isExpanded = expandedRowId === stKey;
                      const totalFeeVal = Number(st.totalFee !== undefined && st.totalFee !== null ? st.totalFee : (st.academicFee || st.courseFee || 0));
                      const totalPaidVal = Number(st.totalPaid || 0);
                      const dueVal = Math.max(0, totalFeeVal - totalPaidVal);
                      return (
                        <React.Fragment key={stKey}>
                          {/* ── Main Compact Row ── */}
                          <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-indigo-50/60' : ''}`}>
                            {/* Roll No */}
                            <td className="p-3 font-mono font-bold text-indigo-700 bg-indigo-50/40">
                              {st.rollNo || st.registrationNo}
                            </td>

                            {/* Student Name + Phone */}
                            <td className="p-3">
                              <span className="font-black text-slate-900 block">{st.fullName || st.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{st.phone || st.contact}</span>
                            </td>

                            {/* Status */}
                            <td className="p-3 text-center">
                              {st.status === 'Cancelled' || st.cancel === 'Yes' ? (
                                <span className="bg-rose-50 text-rose-700 border border-rose-300 px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1">
                                  <Ban className="w-2.5 h-2.5" /> Cancelled
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  {st.status || 'Active'}
                                </span>
                              )}
                            </td>

                            {/* Fee Details compact */}
                            <td className="p-3 text-center">
                              <span className="font-black text-slate-900 font-mono text-[11px] block">₹{totalFeeVal.toLocaleString('en-IN')}/-</span>
                              <span className="text-[10px] text-emerald-700 font-bold font-mono">Paid: ₹{totalPaidVal.toLocaleString('en-IN')}</span>
                              {dueVal > 0 ? (
                                <span className="text-[10px] text-rose-600 font-bold font-mono block">Due: ₹{dueVal.toLocaleString('en-IN')}</span>
                              ) : (
                                <span className="text-[9px] text-emerald-600 font-bold block">✓ Cleared</span>
                              )}
                            </td>

                            {/* Receive Fee Button */}
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenReceiveFeeModal(st)}
                                title="Receive Fee from Student"
                                className="bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] shadow-xs hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Receive_Student_Fee</span>
                              </button>
                            </td>

                            {/* Set Fee Button */}
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleOpenSetFeeModal(st)}
                                title="Set Student Course Fee"
                                className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] shadow-xs hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Set_Student_Fee</span>
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {Number(st.totalPaid || 0) > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const latestPayment = (st.feeHistory && st.feeHistory.length > 0)
                                        ? st.feeHistory[0]
                                        : { receiptNo: `REC-${st.rollNo || '0001'}-01`, amount: Number(st.totalPaid), date: st.admissionDate || st.createdAt || new Date().toISOString().split('T')[0], paymentMode: st.paymentMode || 'Cash', referenceNo: st.referenceNo || st.upiId || st.utrNo || '', purpose: 'Vocational Course Fee Payment' };
                                      handleTriggerPrintReceipt(latestPayment, st);
                                    }}
                                    title="Print Fee Receipt"
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudent(st)}
                                  title="Edit Student Details"
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                {!(st.status === 'Cancelled' || st.cancel === 'Yes') && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCancelStudent(st)}
                                    title="Cancel Admission"
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                                  >
                                    <Ban className="w-2.5 h-2.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setDeletingStudent(st)}
                                  title="Delete Student"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            {/* Expand / Collapse toggle */}
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : stKey)}
                                title={isExpanded ? 'Collapse Details' : 'Expand All Details'}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${isExpanded ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}
                              >
                                {isExpanded ? '▲ Hide' : '▼ View'}
                              </button>
                            </td>
                          </tr>

                          {/* ── Expandable Detail Row ── */}
                          {isExpanded && (
                            <tr className="bg-gradient-to-br from-indigo-50 to-slate-50">
                              <td colSpan={8} className="p-0">
                                <div className="px-4 py-3 border-t border-indigo-100">
                                  {/* Horizontal Card Grid */}
                                  <div className="flex flex-wrap gap-3">

                                    {/* Card 1: Identity */}
                                    <div className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                      <div className="text-[9px] font-black text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        👤 Identity
                                      </div>
                                      <div className="space-y-1">
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Roll / Reg No</span>
                                          <p className="text-[11px] font-black text-indigo-700 font-mono">{st.rollNo || st.registrationNo || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Student Name</span>
                                          <p className="text-[12px] font-black text-slate-900">{st.fullName || st.studentName || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Father's Name</span>
                                          <p className="text-[11px] font-semibold text-slate-700">{st.fatherName || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Phone</span>
                                          <p className="text-[11px] font-mono text-slate-700">{st.phone || st.contact || '-'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Card 2: Documents */}
                                    <div className="flex-1 min-w-[220px] bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                      <div className="text-[9px] font-black text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        🪪 Documents
                                      </div>
                                      <div className="space-y-1 mb-2">
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Aadhaar Card No</span>
                                          <p className="text-[11px] font-mono font-bold text-slate-800">{st.aadhaarNo || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">ABC ID</span>
                                          <p className="text-[11px] font-mono text-indigo-700 font-bold">{st.abcId || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Enrollment No</span>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            {st.enrollmentNo ? (
                                              <>
                                                <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{st.enrollmentNo}</span>
                                                <button type="button" onClick={() => handleOpenEditEnrollmentNo(st)} className="text-slate-400 hover:text-indigo-600 cursor-pointer"><Edit3 className="w-3 h-3" /></button>
                                              </>
                                            ) : (
                                              <button type="button" onClick={() => handleOpenEditEnrollmentNo(st)} className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg cursor-pointer">
                                                <Plus className="w-2.5 h-2.5" /> Set Enr No
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">DOB</span>
                                          <p className="text-[11px] font-mono text-slate-700">{st.dob || st.dateOfBirth || '-'}</p>
                                        </div>
                                      </div>
                                      {/* Uploaded Docs Grid */}
                                      <div className="border-t border-dashed border-amber-200 pt-2">
                                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-wider block mb-1.5">📎 Uploaded Documents</span>
                                        <div className="grid grid-cols-4 gap-1">
                                          {[
                                            { key: 'marksheet10', label: '10th' },
                                            { key: 'marksheet12', label: '12th' },
                                            { key: 'graduation',  label: 'Grad' },
                                            { key: 'aadhaar',     label: 'Aadhaar' },
                                            { key: 'abcId',       label: 'ABC ID' },
                                            { key: 'photo',       label: 'Photo' },
                                            { key: 'signature',   label: 'Sign' },
                                          ].map(({ key, label }) => {
                                            const docs = st.documents || {};
                                            const doc = docs[key];
                                            const isImg = doc && doc.type && doc.type.startsWith('image/');
                                            return (
                                              <div key={key} className="flex flex-col items-center gap-0.5" title={label}>
                                                {doc && isImg ? (
                                                  <a href={doc.url} target="_blank" rel="noreferrer">
                                                    <img src={doc.url} alt={label} className="w-8 h-8 object-cover rounded border border-slate-200 cursor-pointer hover:opacity-80" />
                                                  </a>
                                                ) : doc ? (
                                                  <a href={doc.url} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-indigo-50 border border-indigo-200 rounded text-base hover:opacity-80">📄</a>
                                                ) : (
                                                  <div className="w-8 h-8 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded text-slate-300 text-[10px]">—</div>
                                                )}
                                                <span className={`text-[8px] font-semibold text-center leading-tight ${doc ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>


                                    {/* Card 3: Course & Institute */}
                                    <div className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                      <div className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        🎓 Course & Institute
                                      </div>
                                      <div className="space-y-1">
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Institute</span>
                                          <p className="text-[11px] font-bold text-slate-800">
                                            {st.universityName?.toLowerCase().includes('teacher') || st.universityName?.includes('टीचर्स') ? 'MD Early Teachers Training' : 'MD Vocational Training'}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Center / College</span>
                                          <p className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block">{st.collegeName || 'PKC Institute'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Course / Trade</span>
                                          <p className="text-[12px] font-black text-slate-900">{st.courseName || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Branch / Stream</span>
                                          <p className="text-[11px] text-slate-600">{st.branch || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Duration</span>
                                          <p className="text-[11px] text-slate-700">{st.courseDuration || st.duration || '-'}</p>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-400 uppercase font-semibold">Admission Date</span>
                                          <p className="text-[11px] font-mono text-slate-700">{st.admissionDate || '-'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Card 4: Fee Summary */}
                                    <div className="flex-1 min-w-[180px] bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                      <div className="text-[9px] font-black text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        💰 Fee Summary
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center bg-slate-50 rounded-lg px-2 py-1">
                                          <span className="text-[10px] text-slate-500 font-semibold">Total Fee</span>
                                          <span className="text-[12px] font-black text-slate-900 font-mono">₹{totalFeeVal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-emerald-50 rounded-lg px-2 py-1">
                                          <span className="text-[10px] text-emerald-600 font-semibold">Paid</span>
                                          <span className="text-[12px] font-black text-emerald-700 font-mono">₹{totalPaidVal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className={`flex justify-between items-center rounded-lg px-2 py-1 ${dueVal > 0 ? 'bg-rose-50' : 'bg-emerald-50'}`}>
                                          <span className={`text-[10px] font-semibold ${dueVal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {dueVal > 0 ? 'Due' : '✓ Cleared'}
                                          </span>
                                          <span className={`text-[12px] font-black font-mono ${dueVal > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                            ₹{dueVal.toLocaleString('en-IN')}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-50 rounded-lg px-2 py-1">
                                          <span className="text-[10px] text-slate-500 font-semibold">Payment Mode</span>
                                          <span className="text-[10px] font-bold text-slate-700">{st.paymentMode || 'Cash'}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Card 5: Quick Actions */}
                                    <div className="flex-1 min-w-[160px] bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                                      <div className="text-[9px] font-black text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        ⚡ Quick Actions
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReceiveFeeModal(st)}
                                          className="w-full bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center justify-center gap-1 transition-all"
                                        >
                                          <CreditCard className="w-3 h-3" /> Receive Fee
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenSetFeeModal(st)}
                                          className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center justify-center gap-1 transition-all"
                                        >
                                          <CheckCircle2 className="w-3 h-3" /> Set Fee
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditStudent(st)}
                                          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center justify-center gap-1 transition-all"
                                        >
                                          <Edit3 className="w-3 h-3" /> Edit Student
                                        </button>
                                        {Number(st.totalPaid || 0) > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const latestPayment = (st.feeHistory && st.feeHistory.length > 0)
                                                ? st.feeHistory[0]
                                                : { receiptNo: `REC-${st.rollNo || '0001'}-01`, amount: Number(st.totalPaid), date: st.admissionDate || st.createdAt || new Date().toISOString().split('T')[0], paymentMode: st.paymentMode || 'Cash', referenceNo: st.referenceNo || st.upiId || st.utrNo || '', purpose: 'Vocational Course Fee Payment' };
                                              handleTriggerPrintReceipt(latestPayment, st);
                                            }}
                                            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-2 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center justify-center gap-1 transition-all"
                                          >
                                            <Printer className="w-3 h-3" /> Print Receipt
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                  </div>{/* end flex wrapper */}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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
      {showEnrollModal && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <form 
            onSubmit={handleEnrollSubmit}
            className="bg-white w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-emerald-400 overflow-hidden"
          >
            {/* Modal Header (Fixed at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
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
                    Aadhaar Card Number <span className="text-slate-500 font-normal text-[11px]">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={enrollForm.aadhaarNo}
                    onChange={(e) => setEnrollForm({ ...enrollForm, aadhaarNo: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="12 digit Aadhaar number (optional)"
                    maxLength={12}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <span className="text-[10px] text-amber-700 mt-0.5 block">Optional: Can be entered now or updated anytime later via Edit.</span>
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
                          {c.courseName} ({c.duration}{Number(c.fee || 0) > 0 ? ` - ₹${c.fee}` : ''})
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
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Total Course Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={enrollForm.totalFee === 0 ? '' : enrollForm.totalFee}
                    onChange={(e) => setEnrollForm({ ...enrollForm, totalFee: Number(e.target.value) || 0 })}
                    placeholder="Enter agreed fee (e.g. 10000)"
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Admin decides fee per student</span>
                </div>
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">
                    Fee Paid at Admission (₹)
                  </label>
                  <input
                    type="number"
                    value={enrollForm.initialPaid === 0 ? '' : enrollForm.initialPaid}
                    onChange={(e) => setEnrollForm({ ...enrollForm, initialPaid: Number(e.target.value) || 0 })}
                    placeholder="0 (or paid today)"
                    className="w-full p-2 bg-white border border-emerald-300 rounded-xl font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Initial paid deposit</span>
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
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Transaction method</span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    UPI Ref / UTR / Txn ID
                  </label>
                  <input
                    type="text"
                    value={enrollForm.upiId || ''}
                    onChange={(e) => setEnrollForm({ ...enrollForm, upiId: e.target.value })}
                    placeholder="e.g. 408221987654"
                    className={`w-full p-2 bg-white border rounded-xl font-mono text-xs focus:outline-none ${enrollForm.paymentMode?.toLowerCase().includes('upi') ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-300'}`}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">For UPI / Bank tracking</span>
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

              {/* ── Document Upload Section ── */}
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-amber-200" />
                  <span className="text-[11px] font-black text-amber-700 uppercase tracking-wider bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    📎 Required Documents for Admission
                  </span>
                  <div className="h-px flex-1 bg-amber-200" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {[
                    { key: 'marksheet10', label: '10th Marksheet',    icon: '📄' },
                    { key: 'marksheet12', label: '12th Marksheet',    icon: '📄' },
                    { key: 'graduation',  label: 'Graduation Cert.',  icon: '🎓' },
                    { key: 'aadhaar',     label: 'Aadhaar Card',      icon: '🪪' },
                    { key: 'abcId',       label: 'ABC ID Card',       icon: '🆔' },
                    { key: 'photo',       label: 'Student Photo',     icon: '🖼️' },
                    { key: 'signature',   label: 'Student Signature', icon: '✍️' },
                  ].map(({ key, label, icon }) => {
                    const doc = (enrollForm.documents || {})[key];
                    const isImage = doc && doc.type && doc.type.startsWith('image/');
                    return (
                      <div key={key} className="relative bg-slate-50 border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-2.5 transition-all group">
                        {/* Status badge */}
                        <div className={`absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${doc ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                          {doc ? '✓' : 'Optional'}
                        </div>
                        {/* Preview */}
                        <div className="flex flex-col items-center gap-1 mb-1.5">
                          {doc && isImage ? (
                            <img src={doc.url} alt={label} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs" />
                          ) : (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${doc ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-slate-200'}`}>
                              {doc ? '📄' : icon}
                            </div>
                          )}
                          <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{label}</span>
                          {doc && (
                            <span className="text-[9px] text-slate-400 truncate max-w-full font-medium">{doc.name}</span>
                          )}
                        </div>
                        {/* Invisible file input covering whole card */}
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleDocUpload(key, e.target.files[0])}
                          title={`Upload ${label}`}
                        />
                        <div className="text-center text-[9px] text-slate-400 font-medium group-hover:text-amber-600 transition-colors">
                          {doc ? 'Click to replace' : 'Click to upload'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer (Pinned at bottom, always visible) */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline-block">
                * Required fields must be filled
              </span>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  {enrollSubmitting ? (
                    <span>Enrolling Student...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm & Enroll (+1 to {totalCentralStudents})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ENROLLMENT SUCCESS POPUP */}
      {/* ========================================================================= */}
      {enrollSuccessData && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/85 backdrop-blur-xs p-4 flex items-center justify-center">
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

            {/* Print Receipt Button if fee was paid at admission */}
            {Number(enrollSuccessData.student.totalPaid || 0) > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const p = enrollSuccessData.student.feeHistory?.[0] || {
                      receiptNo: `REC-${enrollSuccessData.student.rollNo}-01`,
                      amount: Number(enrollSuccessData.student.totalPaid),
                      date: enrollSuccessData.student.admissionDate || new Date().toISOString().split('T')[0],
                      paymentMode: enrollSuccessData.student.paymentMode || 'Cash',
                      referenceNo: enrollSuccessData.student.referenceNo || enrollSuccessData.student.upiId || ''
                    };
                    handleTriggerPrintReceipt(p, enrollSuccessData.student);
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>🖨️ Print Admission Fee Receipt Slip (₹{Number(enrollSuccessData.student.totalPaid).toLocaleString('en-IN')})</span>
                </button>
              </div>
            )}

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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT VOCATIONAL INSTITUTE */}
      {/* ========================================================================= */}
      {showInstituteModal && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <form 
            onSubmit={handleSaveInstitute}
            className="bg-white w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden"
          >
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
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

            </div>

            {/* Pinned Footer */}
            <div className="flex justify-end gap-2.5 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowInstituteModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EXCEL UPLOAD MODAL WITH INSTITUTE SELECTION */}
      {/* ========================================================================= */}
      {showExcelModal && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-indigo-400 overflow-hidden">
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
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

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

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
                          <td className="p-2 font-black text-emerald-700">
                            {Number(r.fee || 0) > 0 ? (
                              `₹${r.fee}`
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Set at Adm.
                              </span>
                            )}
                          </td>
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

            </div>

            {/* Pinned Footer */}
            <div className="flex flex-wrap justify-between items-center gap-2 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseExcelModal}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD / EDIT VOCATIONAL COURSE MANUALLY */}
      {/* ========================================================================= */}
      {showAddCourseModal && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <form 
            onSubmit={handleSaveCourse}
            className="bg-white w-full max-w-xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-amber-400 overflow-hidden"
          >
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 text-xs">
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
                  <label className="font-bold text-slate-700 block mb-1">Course Fee (₹) - Optional</label>
                  <input
                    type="number"
                    value={courseFormData.fee === 0 ? '' : courseFormData.fee}
                    onChange={(e) => setCourseFormData({ ...courseFormData, fee: Number(e.target.value) || 0 })}
                    placeholder="0 (Set per student at admission)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Leave 0 if fee varies per student.</span>
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

            </div>

            {/* Pinned Footer */}
            <div className="flex justify-end gap-2.5 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors"
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: SET / EDIT ENROLLMENT NUMBER (ADMIN ASSIGNMENT) */}
      {/* ========================================================================= */}
      {editingEnrollmentStudent && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-4 flex items-center justify-center">
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
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT VOCATIONAL STUDENT DETAILS & FEE MANAGEMENT */}
      {/* ========================================================================= */}
      {editingStudent && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <form 
            onSubmit={handleSaveEditStudent}
            className="bg-white w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-indigo-400 overflow-hidden"
          >
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Edit Vocational Student & Fees
                  </h3>
                  <p className="text-xs text-slate-500">
                    Roll: <span className="font-mono font-bold text-indigo-700">{editingStudent.rollNo || editingStudent.registrationNo}</span> • {editingStudent.fullName || editingStudent.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Row 1: Student Name & Father Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.studentName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, studentName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentForm.fatherName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, fatherName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Row 2: Mother Name & Contact Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    value={editStudentForm.motherName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, motherName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contact / Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={editStudentForm.phone}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, phone: e.target.value })}
                    maxLength={10}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Aadhaar Card, ABC ID & Enrollment Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-200">
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">
                    Aadhaar Card <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editStudentForm.aadhaarNo}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, aadhaarNo: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="12 digit Aadhaar"
                    maxLength={12}
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-[10px] text-indigo-700 mt-0.5 block">Can be added/edited anytime</span>
                </div>
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">
                    ABC ID
                  </label>
                  <input
                    type="text"
                    value={editStudentForm.abcId}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, abcId: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    placeholder="12 digit ABC ID"
                    maxLength={12}
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="font-bold text-indigo-950 block mb-1">
                    Official Enrollment No
                  </label>
                  <input
                    type="text"
                    value={editStudentForm.enrollmentNo}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, enrollmentNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. ENR-2024-001"
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-mono font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Row 4: Institute & Course */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Vocational Institute
                  </label>
                  <select
                    value={editStudentForm.instituteId}
                    onChange={(e) => {
                      const inst = institutes.find(i => i.id === e.target.value);
                      setEditStudentForm({
                        ...editStudentForm,
                        instituteId: e.target.value,
                        instituteName: inst?.name || editStudentForm.instituteName
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none"
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
                    Course / Trade Name
                  </label>
                  <input
                    type="text"
                    value={editStudentForm.courseName}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, courseName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Footer (Pinned at bottom) */}
            <div className="flex justify-end gap-2.5 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editStudentSubmitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{editStudentSubmitting ? 'Saving Changes...' : 'Save & Update Student'}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: CANCEL VOCATIONAL ADMISSION (MOVES TO CANCELLED HUB) */}
      {/* ========================================================================= */}
      {cancellingStudent && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 flex items-center justify-center">
          <form 
            onSubmit={handleConfirmCancelStudent}
            className="bg-white w-full max-w-lg max-h-[88vh] flex flex-col rounded-3xl shadow-2xl border-2 border-rose-400 overflow-hidden"
          >
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-rose-100 shrink-0 bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900">
                    Cancel Vocational Admission
                  </h3>
                  <p className="text-xs text-rose-700 font-medium">
                    Moves student to Cancelled Admissions Hub & records refund audit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCancellingStudent(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Student Summary Card */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Student Name:</span>
                  <span className="font-extrabold text-slate-900">{cancellingStudent.fullName || cancellingStudent.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Roll / Reg No:</span>
                  <span className="font-mono font-bold text-indigo-700">{cancellingStudent.rollNo || cancellingStudent.registrationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Course / Trade:</span>
                  <span className="font-semibold text-slate-800">{cancellingStudent.courseName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Total Fees Deposited:</span>
                  <span className="font-mono font-black text-emerald-700">₹{Number(cancellingStudent.totalPaid || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Cancellation Date */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cancellation Date *
                </label>
                <input
                  type="date"
                  required
                  value={cancelForm.cancellationDate}
                  onChange={(e) => setCancelForm({ ...cancelForm, cancellationDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Cancellation Reason */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reason for Cancellation *
                </label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {[
                    'Student requested cancellation',
                    'Financial constraints',
                    'Relocated to another city',
                    'Selected for other degree',
                    'Health / personal emergency'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCancelForm({ ...cancelForm, reason: preset })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        cancelForm.reason === preset 
                          ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <textarea
                  required
                  rows={2}
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                  placeholder="Enter detailed reason for cancellation..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Refund Settlement */}
              <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-200 space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-950 text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                  <span>Refund Settlement (Optional)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Refund Amount Returned (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={Number(cancellingStudent.totalPaid || 0)}
                      placeholder="0 (leave blank if 0)"
                      value={cancelForm.refundPaid}
                      onChange={(e) => setCancelForm({ ...cancelForm, refundPaid: e.target.value })}
                      className="w-full p-2 bg-white border border-rose-200 rounded-lg font-mono font-bold text-slate-900 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Refund Payment Mode
                    </label>
                    <select
                      value={cancelForm.paymentMode}
                      onChange={(e) => setCancelForm({ ...cancelForm, paymentMode: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 text-xs focus:outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI / Online">UPI / Online</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Refund notes / settlement remarks..."
                  value={cancelForm.refundNotes}
                  onChange={(e) => setCancelForm({ ...cancelForm, refundNotes: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 text-xs focus:outline-none"
                />
              </div>

            </div>

            {/* Footer (Pinned at bottom) */}
            <div className="flex justify-end gap-2.5 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setCancellingStudent(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors text-xs"
              >
                Keep Admission Active
              </button>
              <button
                type="submit"
                disabled={cancelSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 text-xs transition-colors"
              >
                <Ban className="w-4 h-4" />
                <span>{cancelSubmitting ? 'Cancelling Admission...' : 'Confirm & Cancel Admission'}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE VOCATIONAL STUDENT CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingStudent && createPortal(
        <div className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-slate-950/80 backdrop-blur-xs p-4 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border-2 border-red-500 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center font-black">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-lg text-slate-900">
                Permanently Delete Student?
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-900">{deletingStudent.fullName || deletingStudent.studentName}</strong> (<span className="font-mono text-indigo-700 font-bold">{deletingStudent.rollNo || deletingStudent.registrationNo}</span>)?
              </p>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-left text-[11px] text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Important Recommendation:</span>
              </div>
              <p>
                If the student is discontinuing or cancelling their admission, please use <strong>"Cancel Admission"</strong> instead so their financial records and refund details remain preserved in the Cancelled Admissions Hub.
              </p>
            </div>

            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                No, Keep Record
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleConfirmDeleteStudent}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteSubmitting ? 'Deleting...' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: UNIFIED VOCATIONAL STUDENT FEE DESK (STUDENTLIST PARITY) */}
      {/* ========================================================================= */}
      {feeDeskStudent && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs overflow-y-auto p-2 sm:p-4 py-4 sm:py-8 flex justify-center items-start">
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-auto flex flex-col max-h-[94vh] animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header: Sky Blue for Set Fee, Emerald Green for Receive Fee */}
            <div className={`text-white px-5 py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-sm transition-colors ${
              feeDeskMode === 'set_fee'
                ? 'bg-gradient-to-r from-sky-700 to-blue-800'
                : 'bg-gradient-to-r from-emerald-800 to-green-800'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-black text-white text-base">
                  {feeDeskMode === 'set_fee' ? <BookOpen className="w-5 h-5 text-white" /> : '₹'}
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                    {feeDeskMode === 'set_fee' 
                      ? 'Set Vocational Student Course Fee (कोर्स फीस निर्धारण)'
                      : 'Paid Vocational Student Fee (छात्र शुल्क भुगतान डेस्क)'
                    }
                  </h3>
                  <div className="text-xs text-white/90 flex items-center flex-wrap gap-2">
                    <span className="font-bold uppercase text-white">{feeDeskStudent.fullName || feeDeskStudent.studentName}</span>
                    <span className="text-white/70">•</span>
                    <span className="font-mono text-amber-200">Roll: {feeDeskStudent.rollNo || feeDeskStudent.registrationNo || '-'}</span>
                    <span className="text-white/70">•</span>
                    <span className="text-white/90">{feeDeskStudent.courseName}</span>
                    {feeDeskStudent.duration && (
                      <>
                        <span className="text-white/70">•</span>
                        <span className="text-emerald-200">{feeDeskStudent.duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Switch Tabs */}
                <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/20">
                  <button
                    type="button"
                    onClick={() => switchFeeDeskMode('receive')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      feeDeskMode === 'receive' ? 'bg-white text-emerald-900 shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Receive Fee (भुगतान)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchFeeDeskMode('set_fee')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      feeDeskMode === 'set_fee' ? 'bg-white text-sky-900 shadow-sm' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    Set Fee (फीस सेट करें)
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setFeeDeskStudent(null)}
                  className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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

              {/* 1. SET COURSE FEE FORM */}
              {feeDeskMode === 'set_fee' && (
                <form onSubmit={(e) => handleFeeDeskSubmit(e, 'set_total_fee')} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.fullName || feeDeskStudent.studentName || ''} 
                        className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Father Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.fatherName || '-'} 
                        className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Aadhaar Card No:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.aadhaarNo || '-'} 
                        className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Course / Trade:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.courseName || '-'} 
                        className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed outline-none truncate" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Institute / Center:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.instituteName || feeDeskStudent.universityName || 'Maharishi Dayanand Vocational Training Institute'} 
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none truncate" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration / Class:</label>
                      <select 
                        value={feeDeskClass} 
                        onChange={(e) => setFeeDeskClass(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                      >
                        <option value="1 Month">1 Month Certificate</option>
                        <option value="3 Months">3 Months Certificate</option>
                        <option value="6 Months">6 Months Diploma</option>
                        <option value="9 Months">9 Months Diploma</option>
                        <option value="1 Year">1 Year Advance Diploma</option>
                        <option value="2 Years">2 Years Master Diploma</option>
                        <option value="Year-1 / Cert">Year-1 / Cert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee Date * :</label>
                      <input 
                        type="date" 
                        required 
                        value={feeDeskDate} 
                        onChange={(e) => setFeeDeskDate(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose * :</label>
                      <select 
                        value={feeDeskPurpose} 
                        onChange={(e) => setFeeDeskPurpose(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Total Vocational Course Fee">Total Vocational Course Fee</option>
                        <option value="Annual Course Fee">Annual Course Fee</option>
                        <option value="Center Fee">Center Fee</option>
                        <option value="Academic Fee">Academic Fee</option>
                        <option value="Admission & Course Fee">Admission & Course Fee</option>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Certification Fee">Certification Fee</option>
                        <option value="Other Fee">Other Fee</option>
                      </select>
                    </div>

                    {/* Set Course Fee Section */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-sky-50/80 border-2 border-sky-300 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-black text-sky-950 uppercase tracking-wide">
                              Set Total Course Fee (₹) * :
                            </label>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300">
                              By default: ₹0
                            </span>
                          </div>
                          <p className="text-[11px] text-sky-800 mb-2 font-medium">
                            Set the student's official course fee. This fee will be saved permanently and displayed across the portal.
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <input 
                              type="number" 
                              min="0" 
                              step="1" 
                              value={feeDeskTotalFee} 
                              onChange={(e) => setFeeDeskTotalFee(e.target.value)} 
                              placeholder="0" 
                              className="w-full sm:max-w-xs px-4 py-2 text-sm font-extrabold border-2 border-sky-600 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-sky-400 focus:outline-none font-mono shadow-2xs" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setFeeDeskTotalFee('0')} 
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                              title="Set to ₹0"
                            >
                              Set 0
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setFeeDeskTotalFee('5000')} 
                              className="px-2.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              ₹5,000
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setFeeDeskTotalFee('10000')} 
                              className="px-2.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              ₹10,000
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setFeeDeskTotalFee('15000')} 
                              className="px-2.5 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                            >
                              ₹15,000
                            </button>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-end">
                          <button 
                            type="submit" 
                            disabled={feeDeskLoading} 
                            className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2" 
                            title="Set Student Course Fee"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{feeDeskLoading ? 'Saving...' : 'Set Student Fee (कोर्स फीस सेट करें)'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3 Summary Metrics: Course Fee | Paid Fee | Remaining Due */}
                  {(() => {
                    const tot = Number(feeDeskTotalFee !== '' && feeDeskTotalFee !== null ? feeDeskTotalFee : (feeDeskStudent.totalFee !== undefined ? feeDeskStudent.totalFee : (feeDeskStudent.academicFee || 0)));
                    const paid = Number(feeDeskStudent.totalPaid || 0);
                    const rem = Math.max(0, tot - paid);

                    return (
                      <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                          <div className="bg-sky-50/80 border border-sky-300 rounded-xl p-3 shadow-2xs">
                            <div className="text-[10px] text-sky-700 uppercase font-bold">Total Course Fee</div>
                            <div className="text-base font-black text-sky-950 font-mono mt-0.5">
                              ₹{tot.toLocaleString('en-IN')}/-
                            </div>
                          </div>

                          <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3 shadow-2xs">
                            <div className="text-[10px] text-emerald-700 uppercase font-bold">Paid Fee (Total Deposited)</div>
                            <div className="text-base font-black text-emerald-800 font-mono mt-0.5">
                              ₹{paid.toLocaleString('en-IN')}/-
                            </div>
                          </div>

                          <div className={`rounded-xl p-3 border shadow-2xs ${
                            rem === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50/80 border-rose-300'
                          }`}>
                            <div className={`text-[10px] uppercase font-bold ${rem === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                              Remaining Fee (Due)
                            </div>
                            <div className={`text-base font-black font-mono mt-0.5 ${rem === 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                              ₹{rem.toLocaleString('en-IN')}/-
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </form>
              )}

              {/* 2. RECEIVE FEE FORM (Form: Collect / Receive Fee Installment) */}
              {feeDeskMode === 'receive' && (
                <form onSubmit={(e) => handleFeeDeskSubmit(e, 'add')} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.fullName || feeDeskStudent.studentName || ''} 
                        className="w-full px-3 py-2 text-xs font-bold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Father Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.fatherName || '-'} 
                        className="w-full px-3 py-2 text-xs font-semibold uppercase bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Institute Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.instituteName || feeDeskStudent.universityName || 'Maharishi Dayanand Vocational Training Institute'} 
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg text-slate-800 cursor-not-allowed outline-none truncate" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Course Name:</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={feeDeskStudent.courseName || '-'} 
                        className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-slate-100 border border-slate-300 rounded-lg cursor-not-allowed outline-none truncate" 
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-indigo-950">
                          Total Course Fee (₹) * :
                        </label>
                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                          Set / Edit Fee
                        </span>
                      </div>
                      <input 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={feeDeskTotalFee} 
                        onChange={(e) => setFeeDeskTotalFee(e.target.value)} 
                        placeholder="e.g. 15000" 
                        className="w-full px-3 py-2 text-xs font-mono font-black border-2 border-indigo-400 bg-indigo-50/30 rounded-lg text-slate-900 focus:bg-white focus:border-indigo-600 focus:outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Duration / Class:</label>
                      <select 
                        value={feeDeskClass} 
                        onChange={(e) => setFeeDeskClass(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="1 Month">1 Month Certificate</option>
                        <option value="3 Months">3 Months Certificate</option>
                        <option value="6 Months">6 Months Diploma</option>
                        <option value="9 Months">9 Months Diploma</option>
                        <option value="1 Year">1 Year Advance Diploma</option>
                        <option value="2 Years">2 Years Master Diploma</option>
                        <option value="Year-1 / Cert">Year-1 / Cert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fee Date * :</label>
                      <input 
                        type="date" 
                        required 
                        value={feeDeskDate} 
                        onChange={(e) => setFeeDeskDate(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Purpose * :</label>
                      <select 
                        value={feeDeskPurpose} 
                        onChange={(e) => setFeeDeskPurpose(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Course Fee Installment">Course Fee Installment</option>
                        <option value="1st Installment (Admission)">1st Installment (Admission)</option>
                        <option value="2nd Installment">2nd Installment</option>
                        <option value="3rd Installment">3rd Installment</option>
                        <option value="Final Installment">Final Installment / Full Cleared</option>
                        <option value="Admission & Course Fee">Admission & Course Fee</option>
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Examination Fee">Examination Fee</option>
                        <option value="Registration Fee">Registration Fee</option>
                        <option value="Certification Fee">Certification Fee</option>
                        <option value="Other Fee">Other Fee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Mode * :</label>
                      <select 
                        value={feeDeskModePayment} 
                        onChange={(e) => setFeeDeskModePayment(e.target.value)} 
                        className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="Cash">Cash (नकद)</option>
                        <option value="Online / UPI">Online / UPI QR</option>
                        <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                        <option value="Cheque">Cheque / DD</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Ref No (UTR / Txn ID):
                        </label>
                        {(feeDeskModePayment?.toLowerCase().includes('upi') || feeDeskModePayment?.toLowerCase().includes('online') || feeDeskModePayment?.toLowerCase().includes('bank')) && (
                          <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                            UPI UTR Required
                          </span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={feeDeskRefNo} 
                        onChange={(e) => setFeeDeskRefNo(e.target.value)} 
                        placeholder={
                          (feeDeskModePayment?.toLowerCase().includes('upi') || feeDeskModePayment?.toLowerCase().includes('online') || feeDeskModePayment?.toLowerCase().includes('bank'))
                            ? 'Enter 12-digit UTR / UPI Ref ID'
                            : 'Direct Cash Counter (No UTR needed)'
                        } 
                        className={`w-full px-3 py-2 text-xs font-mono border rounded-lg focus:outline-none ${
                          (feeDeskModePayment?.toLowerCase().includes('upi') || feeDeskModePayment?.toLowerCase().includes('online') || feeDeskModePayment?.toLowerCase().includes('bank'))
                            ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300 text-slate-900 font-bold'
                            : 'border-slate-300 bg-white text-slate-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Received By:</label>
                      <input 
                        type="text" 
                        value={feeDeskReceivedBy} 
                        onChange={(e) => setFeeDeskReceivedBy(e.target.value)} 
                        placeholder="Admin Desk" 
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none" 
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-bold text-slate-900">
                          Enter Fee Amount (₹) * :
                        </label>
                        <div className="flex items-center gap-1">
                          <button 
                            type="button" 
                            onClick={() => {
                              const tot = Number(feeDeskTotalFee !== '' && feeDeskTotalFee !== null ? feeDeskTotalFee : (feeDeskStudent.totalFee !== undefined ? feeDeskStudent.totalFee : (feeDeskStudent.academicFee || 0)));
                              const paid = Number(feeDeskStudent.totalPaid || 0);
                              const rem = Math.max(0, tot - paid);
                              setFeeDeskAmount(String(rem));
                            }} 
                            className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9px] font-bold cursor-pointer transition-colors" 
                            title="Auto fill full balance remaining"
                          >
                            Full Due
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setFeeDeskAmount('0')} 
                            className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[9px] font-bold cursor-pointer transition-colors" 
                            title="Set amount to 0"
                          >
                            Set 0
                          </button>
                        </div>
                      </div>
                      <input 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={feeDeskAmount} 
                        onChange={(e) => setFeeDeskAmount(e.target.value)} 
                        placeholder="0" 
                        className="w-full px-3 py-2 text-xs font-extrabold border-2 border-emerald-600 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-emerald-400 focus:outline-none font-mono" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button 
                      type="button"
                      onClick={(e) => handleFeeDeskSubmit(e, 'set_total_fee')}
                      disabled={feeDeskLoading}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      title="Save course fee without making a payment installment"
                    >
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>Set Course Fee Only (सिर्फ कोर्स फीस सेट करें)</span>
                    </button>

                    <button 
                      type="submit" 
                      disabled={feeDeskLoading} 
                      className="bg-[#28a745] hover:bg-[#218838] text-white font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2" 
                      title="Add new fee installment entry and update course fee"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{feeDeskLoading ? 'Saving...' : '+ Add Payment (जमा करें)'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* 3 Summary Metrics: Course Fee | Paid Fee | Remaining Due */}
              {(() => {
                const tot = Number(feeDeskTotalFee !== '' && feeDeskTotalFee !== null ? feeDeskTotalFee : (feeDeskStudent.totalFee !== undefined ? feeDeskStudent.totalFee : (feeDeskStudent.academicFee || 0)));
                const paid = Number(feeDeskStudent.totalPaid || 0);
                const rem = Math.max(0, tot - paid);

                return (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 shadow-2xs">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">Total Course Fee</div>
                        <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                          ₹{tot.toLocaleString('en-IN')}/-
                        </div>
                      </div>

                      <div className="bg-emerald-50/80 border border-emerald-300 rounded-xl p-3 shadow-2xs">
                        <div className="text-[10px] text-emerald-700 uppercase font-bold">Paid Fee (Total Deposited)</div>
                        <div className="text-base font-black text-emerald-800 font-mono mt-0.5">
                          ₹{paid.toLocaleString('en-IN')}/-
                        </div>
                      </div>

                      <div className={`rounded-xl p-3 border shadow-2xs ${
                        rem === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50/80 border-rose-300'
                      }`}>
                        <div className={`text-[10px] uppercase font-bold ${rem === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          Remaining Fee (Due)
                        </div>
                        <div className={`text-base font-black font-mono mt-0.5 ${rem === 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                          ₹{rem.toLocaleString('en-IN')}/-
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment History Ledger Table (Matching StudentList.jsx) */}
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
                  <table className="w-full text-left border-collapse text-[11px] min-w-[750px]">
                    <thead>
                      <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-2 border-r border-slate-700 text-center w-8">#</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Date</th>
                        <th className="py-2.5 px-2 border-r border-slate-700 text-center">Class / Duration</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Receipt No</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Purpose</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Payment_Mode</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Ref No (UTR)</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700">Received by</th>
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
                          const pDate = p.feeDate || p.date || (p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '-');
                          const pAmt = Number(p.amountPaid !== undefined ? p.amountPaid : (p.amount || 0));
                          const pMode = p.paymentMode || 'Cash';
                          const isUpi = pMode.toLowerCase().includes('upi') || pMode.toLowerCase().includes('online') || pMode.toLowerCase().includes('bank');
                          const utr = p.refNo || p.transactionRef || p.upiId || p.referenceNo || p.utrNo || '';

                          return (
                            <tr key={p.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                              <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">
                                {pDate}
                              </td>
                              <td className="py-2 px-2 border-r border-slate-200 text-center font-bold text-slate-700">
                                {p.currentClass || feeDeskStudent.duration || '1 Year'}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 font-mono font-bold text-indigo-900">
                                {p.receiptNo || '-'}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 text-slate-800">
                                {p.purpose || p.feeType || 'Course Fee Installment'}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700 font-semibold">
                                {isUpi ? 'UPI / Online' : (pMode.toLowerCase().includes('cash') ? 'Cash' : pMode)}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 font-mono">
                                {isUpi && utr && utr !== 'CASH-COUNTER' ? (
                                  <span className="font-mono font-bold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300 text-[10px]">
                                    UTR: {utr}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-medium">Direct Cash</span>
                                )}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700">
                                {p.receivedBy || 'Admin Desk'}
                              </td>
                              <td className="py-2 px-2.5 border-r border-slate-200 text-right font-black font-mono text-emerald-800 whitespace-nowrap">
                                {pAmt > 0 ? `₹${pAmt.toLocaleString('en-IN')}/-` : '₹0/-'}
                              </td>
                              <td className="py-2 px-2 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handlePrintReceiptFromDesk(p)}
                                    className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                    title="Print Official Fee Receipt Slip"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Print</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeletePaymentFromDesk(p.id || p.receiptNo, pAmt)}
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-2.5 py-1 rounded text-[10px] shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1"
                                    title="Delete this payment installment"
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

            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 p-3.5 sm:p-4 border-t border-slate-200 shrink-0 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setFeeDeskStudent(null)}
                className="px-5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold cursor-pointer transition-colors text-xs"
              >
                Close Fee Desk
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: OFFICIAL FEE RECEIPT PRINT VOUCHER */}
      {/* ========================================================================= */}
      {receiptToPrint && (
        <PrintFeeReceipt 
          receipt={receiptToPrint} 
          onClose={() => setReceiptToPrint(null)} 
        />
      )}

    </div>
  );
}
