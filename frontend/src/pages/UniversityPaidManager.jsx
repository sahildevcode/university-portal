import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  Landmark, 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  X, 
  Edit3, 
  Trash2,
  RefreshCw, 
  ShieldCheck, 
  Calendar, 
  ChevronDown, 
  SlidersHorizontal,
  Sparkles,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Percent,
  Globe,
  Users,
  RotateCcw
} from 'lucide-react';
import PrintUniversityVoucher from '../components/PrintUniversityVoucher';
import { useLanguage } from '../context/LanguageContext';

// Helper to format date cleanly without timezone day-shift
const formatPaymentDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const [yyyy, mm, dd] = dateVal.split('-');
      return `${Number(dd)}/${Number(mm)}/${yyyy}`;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-IN');
  } catch {
    return String(dateVal);
  }
};

export default function UniversityPaidManager({ lang: propLang, toggleLang: propToggleLang }) {
  const context = useLanguage();
  const lang = propLang || context.lang || 'en';
  const toggleLang = propToggleLang || context.toggleLang;
  const isHindi = lang === 'hi';

  // Main Navigation Sub-view
  const [subView, setSubView] = useState('ledger'); // 'ledger' | 'payments' | 'rates'

  // Data States
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [courseFees, setCourseFees] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Top Filter Form States (Matching User Reference Image media_1789521971221.jpg)
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

  // Secondary Controls States (Pagination, Due Filter, Dual course toggle, Search)
  const [dueFilter, setDueFilter] = useState('all'); // 'all' | 'due_only' | 'cleared'
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dualOnly, setDualOnly] = useState(false);

  // Modals State - Paid University Fee Modal
  const [payModalStudent, setPayModalStudent] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paidSemester, setPaidSemester] = useState('SEM-1');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Online / UPI');
  const [paidToAccount, setPaidToAccount] = useState('University Official Main Bank A/c');
  const [isOtherAccount, setIsOtherAccount] = useState(false);
  const [otherAccountText, setOtherAccountText] = useState('');
  const [bankAccounts, setBankAccounts] = useState([
    'Official Main Bank A/c',
    'State Bank of India (SBI)',
    'Punjab National Bank (PNB)',
    'HDFC Bank',
    'Bank of Baroda',
    'Union Bank of India',
    'Official Portal Challan'
  ]);
  const [showManageBanksModal, setShowManageBanksModal] = useState(false);
  const [newBankInput, setNewBankInput] = useState('');
  const [editingBankIndex, setEditingBankIndex] = useState(null);
  const [editingBankValue, setEditingBankValue] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('Official University Fee Settlement');
  const [paymentRemark, setPaymentRemark] = useState('');
  const [payReceivedBy, setPayReceivedBy] = useState('Admin Counselor');
  const [payLoading, setPayLoading] = useState(false);

  // Modals State - Set Univ Fee Modal
  const [editFeeStudent, setEditFeeStudent] = useState(null);
  const [newUnivFee, setNewUnivFee] = useState('');
  const [newUnivFeeYear1, setNewUnivFeeYear1] = useState('');
  const [newUnivFeeYear2, setNewUnivFeeYear2] = useState('');
  const [newUnivFeeYear3, setNewUnivFeeYear3] = useState('');
  const [newUnivFeeYear4, setNewUnivFeeYear4] = useState('');
  const [newUnivName, setNewUnivName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editFeeLoading, setEditFeeLoading] = useState(false);

  // Modals State - Add/Edit Course Master Rate Modal
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({
    universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    courseName: '',
    officialFee: '',
    feePerSemester: '',
    notes: ''
  });
  const [rateLoading, setRateLoading] = useState(false);

  // Modals State - Edit University Payment Voucher
  const [editingUnivPayment, setEditingUnivPayment] = useState(null);
  const [editPaymentForm, setEditPaymentForm] = useState({
    amountPaidToUniversity: '',
    paymentDate: '',
    paidSemester: 'SEM-1',
    paymentMode: 'Online / UPI',
    paidToAccount: 'University Official Main Bank A/c',
    isOtherAccount: false,
    otherAccountText: '',
    transactionRef: '',
    purpose: 'Official University Fee Settlement',
    remark: ''
  });
  const [editPaymentLoading, setEditPaymentLoading] = useState(false);

  // Voucher Print Modal State
  const [voucherToPrint, setVoucherToPrint] = useState(null);

  // Quick Student Profile Modal
  const [profileStudent, setProfileStudent] = useState(null);

  // Feedback Toast Notification
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Lock body scroll and listen for Escape key when any modal is active
  useEffect(() => {
    const isAnyModalOpen = Boolean(payModalStudent || editFeeStudent || showRateModal || voucherToPrint || profileStudent || editingUnivPayment || showManageBanksModal);
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setPayModalStudent(null);
          setEditFeeStudent(null);
          setShowRateModal(false);
          setVoucherToPrint(null);
          setProfileStudent(null);
          setEditingUnivPayment(null);
          setShowManageBanksModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [payModalStudent, editFeeStudent, showRateModal, voucherToPrint, profileStudent, editingUnivPayment, showManageBanksModal]);

  // Fetch Summary Statistics
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/university/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching university stats:', err);
    }
  };

  // Fetch Universities & Colleges Lists (Both Catalogs & Database)
  const fetchUniversities = async () => {
    try {
      const [uRes1, uRes2] = await Promise.all([
        fetch('/api/universities'),
        fetch('/api/university/universities')
      ]);
      const [uData1, uData2] = await Promise.all([
        uRes1.json(),
        uRes2.json()
      ]);
      const univNames = new Set([
        'Maharaja Chhatrasal Bundelkhand University (MCBU)',
        'Barkatullah University (BU Bhopal)',
        'Gyanveer University, Sagar (M.P)',
        'State University',
        'RKDF University',
        'Makhanlal Chaturvedi National University (MCU)'
      ]);
      if (uData1?.universities) {
        uData1.universities.forEach(u => typeof u === 'string' ? univNames.add(u) : u?.name && univNames.add(u.name));
      }
      if (uData2?.universities) {
        uData2.universities.forEach(u => typeof u === 'string' ? univNames.add(u) : u?.name && univNames.add(u.name));
      }
      setUniversities(Array.from(univNames));
      if (uData2?.colleges) setColleges(uData2.colleges);
    } catch (err) {
      console.error('Error fetching universities list:', err);
    }
  };

  // Fetch Complete Student University Ledger
  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/university/ledger');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching university ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch University Payments History
  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/university/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching university payments:', err);
    }
  };

  // Fetch Standard Course Fees
  const fetchCourseFees = async () => {
    try {
      const res = await fetch('/api/university/course-fees');
      const data = await res.json();
      if (data.success) {
        setCourseFees(data.courseFees || []);
      }
    } catch (err) {
      console.error('Error fetching course fees:', err);
    }
  };

  // Fetch Configurable University Bank Accounts List
  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/university/bank-accounts');
      const data = await res.json();
      if (data.success && Array.isArray(data.bankAccounts) && data.bankAccounts.length > 0) {
        setBankAccounts(data.bankAccounts);
      }
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };

  const handleSaveBankAccountsToServer = async (updatedList) => {
    try {
      const res = await fetch('/api/university/bank-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankAccounts: updatedList })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.bankAccounts)) {
        setBankAccounts(data.bankAccounts);
      }
    } catch (err) {
      console.error('Error saving bank accounts:', err);
    }
  };

  const handleAddBank = (e) => {
    e.preventDefault();
    if (!newBankInput.trim()) return;
    const trimmed = newBankInput.trim();
    if (bankAccounts.includes(trimmed)) {
      showFeedback('यह बैंक नाम पहले से सूची में मौजूद है।', 'error');
      return;
    }
    const updated = [...bankAccounts, trimmed];
    setBankAccounts(updated);
    setNewBankInput('');
    handleSaveBankAccountsToServer(updated);
    showFeedback(`"${trimmed}" बैंक सूची में जोड़ दिया गया!`, 'success');
  };

  const handleUpdateBank = (idx) => {
    if (!editingBankValue.trim()) return;
    const updated = [...bankAccounts];
    updated[idx] = editingBankValue.trim();
    setBankAccounts(updated);
    setEditingBankIndex(null);
    setEditingBankValue('');
    handleSaveBankAccountsToServer(updated);
    showFeedback('बैंक नाम अपडेट कर दिया गया!', 'success');
  };

  const handleDeleteBank = (idx) => {
    const bankName = bankAccounts[idx];
    if (!window.confirm(`क्या आप "${bankName}" को सूची से हटाना चाहते हैं?`)) return;
    const updated = bankAccounts.filter((_, i) => i !== idx);
    setBankAccounts(updated);
    handleSaveBankAccountsToServer(updated);
    showFeedback(`"${bankName}" हटा दिया गया!`, 'success');
  };

  // Initial Load & Triggers
  useEffect(() => {
    fetchStats();
    fetchUniversities();
    fetchCourseFees();
    fetchLedger();
    fetchPayments();
    fetchBankAccounts();
  }, [refreshTrigger]);

  // Open Paid University Fee Modal
  const handleOpenPayModal = (student) => {
    setPayModalStudent(student);
    const uFee = Number(student.universityFee || 0);
    const uPaid = Number(student.universityPaid || 0);
    const uDue = Math.max(0, uFee - uPaid);
    setPayAmount(uDue > 0 ? String(uDue) : '');
    setPaidSemester(student.currentClass || (student.currentSemester ? `SEM-${student.currentSemester}` : 'SEM-1'));
    setPayDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('Online / UPI');
    setPaidToAccount(`${student.universityName || 'University'} - Official Main A/c`);
    setIsOtherAccount(false);
    setOtherAccountText('');
    setTransactionRef('');
    setPaymentPurpose('Official University Fee Settlement');
    setPaymentRemark('');
    setPayReceivedBy('Admin Counselor');
  };

  // Submit Pay to University
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payModalStudent || !payAmount || Number(payAmount) <= 0) {
      showFeedback('कृपया वैध भुगतान राशि दर्ज करें।', 'error');
      return;
    }

    const resolvedAccount = isOtherAccount && otherAccountText.trim()
      ? otherAccountText.trim()
      : (paidToAccount === 'OTHER' ? (otherAccountText.trim() || 'Personal Account') : paidToAccount);

    setPayLoading(true);
    try {
      const studentIdKey = (payModalStudent.rollNo && payModalStudent.rollNo.trim()) || payModalStudent.id || payModalStudent.enrollmentNo || '';
      const res = await fetch('/api/university/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: studentIdKey,
          amountPaidToUniversity: Number(payAmount),
          paidSemester,
          paymentDate: payDate,
          paidToAccount: resolvedAccount,
          paymentMode,
          transactionRef,
          purpose: paymentPurpose,
          remark: paymentRemark,
          recordedBy: payReceivedBy || 'Admin Counselor'
        })
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(data.message, 'success');
        
        // Immediately add to payments history so it shows down below in the modal
        if (data.voucher) {
          setPayments(prev => [data.voucher, ...prev]);
        }

        // Live update active student in pay modal
        if (data.student) {
          setPayModalStudent(prev => ({ ...prev, ...data.student }));
        } else {
          setPayModalStudent(prev => {
            const added = Number(payAmount) || 0;
            const newPaid = (Number(prev.universityPaid) || 0) + added;
            const newDue = Math.max(0, (Number(prev.universityFee) || 0) - newPaid);
            return { ...prev, universityPaid: newPaid, universityDue: newDue };
          });
        }

        // Live update in ledger list
        if (data.student) {
          setStudents(prev => prev.map(s => ((s.rollNo && s.rollNo === data.student.rollNo) || (s.id && s.id === data.student.id)) ? { ...s, ...data.student } : s));
        }

        // Reset amount inputs for subsequent payment
        setPayAmount('');
        setTransactionRef('');
        setPaymentRemark('');
        setIsOtherAccount(false);
        setOtherAccountText('');

        fetchStats();
        fetchLedger();
        fetchPayments();
      } else {
        showFeedback(data.message || 'भुगतान दर्ज करने में विफल', 'error');
      }
    } catch (err) {
      showFeedback('सर्वर त्रुटि: ' + err.message, 'error');
    } finally {
      setPayLoading(false);
    }
  };

  // Open Edit Payment Voucher Modal
  const handleOpenEditPayment = (payment) => {
    setEditingUnivPayment(payment);
    const pDate = payment.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0];
    const acc = payment.paidToAccount || 'University Official Main A/c';
    const isCustom = !acc.includes(' - ') && !acc.includes('PKC') && !acc.includes('Cash');
    setEditPaymentForm({
      amountPaidToUniversity: String(payment.amountPaidToUniversity || payment.amountPaid || ''),
      paymentDate: pDate,
      paidSemester: payment.paidSemester || 'SEM-1',
      paymentMode: payment.paymentMode || 'Online / UPI',
      paidToAccount: isCustom ? 'OTHER' : acc,
      isOtherAccount: isCustom,
      otherAccountText: isCustom ? acc : '',
      transactionRef: payment.transactionRef || '',
      purpose: payment.purpose || 'Official University Fee Settlement',
      remark: payment.remark || ''
    });
  };

  // Submit Update Payment Voucher
  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    if (!editingUnivPayment || !editPaymentForm.amountPaidToUniversity || Number(editPaymentForm.amountPaidToUniversity) <= 0) {
      showFeedback('कृपया वैध भुगतान राशि दर्ज करें।', 'error');
      return;
    }

    const resolvedAccount = editPaymentForm.isOtherAccount && editPaymentForm.otherAccountText.trim()
      ? editPaymentForm.otherAccountText.trim()
      : (editPaymentForm.paidToAccount === 'OTHER' ? (editPaymentForm.otherAccountText.trim() || 'Personal Account') : editPaymentForm.paidToAccount);

    setEditPaymentLoading(true);
    try {
      const res = await fetch(`/api/university/payments/${editingUnivPayment.id || editingUnivPayment.voucherNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editPaymentForm,
          paidToAccount: resolvedAccount
        })
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message, 'success');
        setEditingUnivPayment(null);

        // Update in payments state
        if (data.payment) {
          setPayments(prev => prev.map(p => (p.id === data.payment.id || p.voucherNo === data.payment.voucherNo) ? data.payment : p));
        }

        // Update student in pay modal if active
        if (data.student && payModalStudent && ((payModalStudent.rollNo && payModalStudent.rollNo === data.student.rollNo) || (payModalStudent.id && payModalStudent.id === data.student.id))) {
          setPayModalStudent(prev => ({ ...prev, ...data.student }));
        }

        // Update students in ledger list
        if (data.student) {
          setStudents(prev => prev.map(s => ((s.rollNo && s.rollNo === data.student.rollNo) || (s.id && s.id === data.student.id)) ? { ...s, ...data.student } : s));
        }

        fetchStats();
        fetchLedger();
        fetchPayments();
      } else {
        showFeedback(data.message || 'वाउचर अपडेट करने में विफल', 'error');
      }
    } catch (err) {
      showFeedback('त्रुटि: ' + err.message, 'error');
    } finally {
      setEditPaymentLoading(false);
    }
  };

  // Delete Payment Voucher
  const handleDeletePayment = async (payment) => {
    const vNo = payment.voucherNo || payment.id;
    const vAmt = Number(payment.amountPaidToUniversity || payment.amountPaid || 0);
    if (!window.confirm(`क्या आप निश्चित रूप से विश्वविद्यालय वाउचर "${vNo}" (₹${vAmt.toLocaleString('en-IN')}) को हटाना चाहते हैं? यह राशि छात्र के खाते में वापस जुड़ जाएगी।`)) {
      return;
    }

    try {
      const res = await fetch(`/api/university/payments/${payment.id || payment.voucherNo}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showFeedback(data.message, 'success');

        // Remove from payments state
        setPayments(prev => prev.filter(p => p.id !== payment.id && p.voucherNo !== payment.voucherNo));

        // Update student in pay modal if active
        if (data.student && payModalStudent && ((payModalStudent.rollNo && payModalStudent.rollNo === data.student.rollNo) || (payModalStudent.id && payModalStudent.id === data.student.id))) {
          setPayModalStudent(prev => ({ ...prev, ...data.student }));
        }

        // Update students in ledger list
        if (data.student) {
          setStudents(prev => prev.map(s => ((s.rollNo && s.rollNo === data.student.rollNo) || (s.id && s.id === data.student.id)) ? { ...s, ...data.student } : s));
        }

        fetchStats();
        fetchLedger();
        fetchPayments();
      } else {
        showFeedback(data.message || 'वाउचर हटाने में विफल', 'error');
      }
    } catch (err) {
      showFeedback('त्रुटि: ' + err.message, 'error');
    }
  };

  // Open Set Univ Fee Modal
  const handleOpenEditFeeModal = (student) => {
    setEditFeeStudent(student);
    setNewUnivFee(String(student.universityFee || ''));
    setNewUnivFeeYear1(String(student.universityFeeYear1 !== undefined ? student.universityFeeYear1 : ''));
    setNewUnivFeeYear2(String(student.universityFeeYear2 !== undefined ? student.universityFeeYear2 : ''));
    setNewUnivFeeYear3(String(student.universityFeeYear3 !== undefined ? student.universityFeeYear3 : ''));
    setNewUnivFeeYear4(String(student.universityFeeYear4 !== undefined ? student.universityFeeYear4 : ''));
    setNewUnivName(student.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)');
    setNewCollegeName(student.collegeName || 'Govt PG College Chhatarpur');
  };

  // Update Student Official University Fee & Affiliation Handler
  const handleSaveStudentFee = async (e) => {
    e.preventDefault();
    if (!editFeeStudent) {
      showFeedback('कृपया मान्य छात्र चुनें।', 'error');
      return;
    }

    setEditFeeLoading(true);
    try {
      const studentIdKey = (editFeeStudent.rollNo && editFeeStudent.rollNo.trim()) || editFeeStudent.id || editFeeStudent.enrollmentNo || '';
      const res = await fetch(`/api/university/student/${encodeURIComponent(studentIdKey)}/fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityFee: Number(newUnivFee) || 0,
          universityFeeYear1: newUnivFeeYear1 !== '' ? Number(newUnivFeeYear1) : undefined,
          universityFeeYear2: newUnivFeeYear2 !== '' ? Number(newUnivFeeYear2) : undefined,
          universityFeeYear3: newUnivFeeYear3 !== '' ? Number(newUnivFeeYear3) : undefined,
          universityFeeYear4: newUnivFeeYear4 !== '' ? Number(newUnivFeeYear4) : undefined,
          universityName: newUnivName,
          collegeName: newCollegeName
        })
      });

      const data = await res.json();
      if (data.success) {
        showFeedback('यूनिवर्सिटी फीस व विवरण सफलतापूर्वक अपडेट किया गया!', 'success');
        setEditFeeStudent(null);
        fetchStats();
        fetchLedger();
      } else {
        showFeedback(data.message || 'अपडेट करने में विफल', 'error');
      }
    } catch (err) {
      console.error('Error updating university fee:', err);
      showFeedback('नेटवर्क त्रुटि! कृपया पुनः प्रयास करें।', 'error');
    } finally {
      setEditFeeLoading(false);
    }
  };

  // Submit Standard Rate Form
  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!rateForm.universityName || !rateForm.courseName || rateForm.officialFee === '') {
      showFeedback('कृपया यूनिवर्सिटी, कोर्स और फीस की जानकारी भरें।', 'error');
      return;
    }

    setRateLoading(true);
    try {
      const res = await fetch('/api/university/course-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityName: rateForm.universityName,
          courseName: rateForm.courseName,
          officialFee: Number(rateForm.officialFee),
          feePerSemester: Number(rateForm.feePerSemester) || 0,
          notes: rateForm.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        showFeedback('यूनिवर्सिटी मानक दर सफलतापूर्वक सुरक्षित की गई!', 'success');
        setShowRateModal(false);
        setRateForm({
          universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
          courseName: '',
          officialFee: '',
          feePerSemester: '',
          notes: ''
        });
        fetchCourseFees();
      } else {
        showFeedback(data.message || 'दर सुरक्षित करने में विफल', 'error');
      }
    } catch (err) {
      console.error('Error adding course fee rate:', err);
      showFeedback('नेटवर्क त्रुटि!', 'error');
    } finally {
      setRateLoading(false);
    }
  };

  // Helper to compute Year-Wise University Fee breakdown (1st, 2nd, 3rd, 4th Year)
  const calculateUniversityYearBreakdown = (item) => {
    if (!item) return {
      feeY1: 0, recY1: 0, remY1: 0, hasY1: false,
      feeY2: 0, recY2: 0, remY2: 0, hasY2: false,
      feeY3: 0, recY3: 0, remY3: 0, hasY3: false,
      feeY4: 0, recY4: 0, remY4: 0, hasY4: false,
      totalFee: 0, totalPaid: 0, totalRem: 0
    };

    // 1. Base university fee per year
    let feeY1 = Number(item.universityFeeYear1 !== undefined ? item.universityFeeYear1 : (item.universityFee || 0));
    let feeY2 = Number(item.universityFeeYear2 || 0);
    let feeY3 = Number(item.universityFeeYear3 || 0);
    let feeY4 = Number(item.universityFeeYear4 || 0);

    if (Array.isArray(item.universityFeeHistory) && item.universityFeeHistory.length > 0) {
      feeY1 = 0; feeY2 = 0; feeY3 = 0; feeY4 = 0;
      item.universityFeeHistory.forEach(entry => {
        const cls = (entry.currentClass || entry.paidSemester || '').toUpperCase();
        const amt = Number(entry.amount || entry.fee || 0);
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
    }

    // 2. Paid / Received fees to university per year
    let recY1 = 0, recY2 = 0, recY3 = 0, recY4 = 0;
    const sRoll = (item.rollNo || item.enrollmentNo || '').toUpperCase();
    const sId = item.id;
    const matchedPayments = payments.filter(p => 
      (sRoll && p.rollNo && p.rollNo.toUpperCase() === sRoll) ||
      (sId && p.studentId && p.studentId === sId)
    );

    if (matchedPayments.length > 0) {
      matchedPayments.forEach(p => {
        const cls = (p.paidSemester || p.currentClass || '').toUpperCase();
        const amt = Number(p.amountPaidToUniversity || p.amountPaid || p.amount || 0);
        if (cls.includes('SEM-1') || cls.includes('SEM-2') || cls.includes('YEAR-1') || cls.includes('YEAR 1') || cls.includes('1ST') || cls.includes('SEMESTER 1') || cls.includes('SEMESTER 2')) {
          recY1 += amt;
        } else if (cls.includes('SEM-3') || cls.includes('SEM-4') || cls.includes('YEAR-2') || cls.includes('YEAR 2') || cls.includes('2ND') || cls.includes('SEMESTER 3') || cls.includes('SEMESTER 4')) {
          recY2 += amt;
        } else if (cls.includes('SEM-5') || cls.includes('SEM-6') || cls.includes('YEAR-3') || cls.includes('YEAR 3') || cls.includes('3RD') || cls.includes('SEMESTER 5') || cls.includes('SEMESTER 6')) {
          recY3 += amt;
        } else if (cls.includes('SEM-7') || cls.includes('SEM-8') || cls.includes('YEAR-4') || cls.includes('YEAR 4') || cls.includes('4TH') || cls.includes('SEMESTER 7') || cls.includes('SEMESTER 8')) {
          recY4 += amt;
        } else {
          recY1 += amt;
        }
      });
    } else {
      recY1 = Number(item.universityPaidYear1 !== undefined ? item.universityPaidYear1 : (item.universityPaid || 0));
      recY2 = Number(item.universityPaidYear2 || 0);
      recY3 = Number(item.universityPaidYear3 || 0);
      recY4 = Number(item.universityPaidYear4 || 0);
    }

    const totalFee = (feeY1 + feeY2 + feeY3 + feeY4) > 0 ? (feeY1 + feeY2 + feeY3 + feeY4) : Number(item.universityFee || 0);
    const totalPaid = (recY1 + recY2 + recY3 + recY4) > 0 ? (recY1 + recY2 + recY3 + recY4) : Number(item.universityPaid || 0);
    const totalRem = Math.max(0, totalFee - totalPaid);

    const hasY1 = (feeY1 > 0 || recY1 > 0);
    const hasY2 = (feeY2 > 0 || recY2 > 0);
    const hasY3 = (feeY3 > 0 || recY3 > 0);
    const hasY4 = (feeY4 > 0 || recY4 > 0);

    const net1 = hasY1 ? (feeY1 - recY1) : 0;
    const remY1 = hasY1 && net1 > 0 ? net1 : 0;

    const net2 = hasY2 ? (feeY2 + net1 - recY2) : 0;
    const remY2 = hasY2 && net2 > 0 ? net2 : 0;

    const net3 = hasY3 ? (feeY3 + (hasY2 ? net2 : net1) - recY3) : 0;
    const remY3 = hasY3 && net3 > 0 ? net3 : 0;

    const net4 = hasY4 ? (feeY4 + (hasY3 ? net3 : hasY2 ? net2 : net1) - recY4) : 0;
    const remY4 = hasY4 && net4 > 0 ? net4 : 0;

    return {
      feeY1, recY1, remY1, hasY1,
      feeY2, recY2, remY2, hasY2,
      feeY3, recY3, remY3, hasY3,
      feeY4, recY4, remY4, hasY4,
      totalFee, totalPaid, totalRem
    };
  };

  // Top Filter Handlers
  const handleApplyFilters = () => {
    setAppliedSession(filterSession);
    setAppliedSatra(filterSatra);
    setAppliedUniversity(filterUniversity);
    setAppliedCollege(filterCollege);
    setAppliedCourse(filterCourse);
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchQuery('');
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
    setSearchQuery('');
    setDueFilter('all');
    setDualOnly(false);
    setCurrentPage(1);
  };

  // Filtered Students List
  const q = (searchQuery || '').trim().toLowerCase();
  const cleanNum = q.replace(/[\\s-]/g, '');

  const displayedStudents = (dualOnly 
    ? students.filter(s => s.isDualEnrolled)
    : students
  ).filter(s => {
    if (s.isSecondaryCourse) return false;

    // Due Filter
    const uFee = Number(s.universityFee || 0);
    const uPaid = Number(s.universityPaid || 0);
    const uDue = Math.max(0, uFee - uPaid);

    if (dueFilter === 'due_only') {
      if (uDue <= 0) return false;
    } else if (dueFilter === 'cleared') {
      if (uDue > 0) return false;
    }

    // Session Filter
    if (appliedSession !== 'all') {
      const sess = s.currentSession || s.admissionSession || s.session || '';
      if (sess && sess !== appliedSession) return false;
    }

    // Satra Filter
    if (appliedSatra !== 'all') {
      const satra = s.currentSatra || s.admissionSatra || s.satra || '';
      if (satra && satra.toLowerCase() !== appliedSatra.toLowerCase()) return false;
    }

    // University Filter
    if (appliedUniversity !== 'all') {
      const univ = (s.universityName || s.collegeName || '').toLowerCase();
      if (univ && !univ.includes(appliedUniversity.toLowerCase())) return false;
    }

    // College Filter
    if (appliedCollege !== 'all') {
      const col = (s.collegeName || s.centerName || s.college_name || '').toLowerCase();
      if (col && !col.includes(appliedCollege.toLowerCase())) return false;
    }

    // Course Filter
    if (appliedCourse !== 'all') {
      const crs = (s.course || s.courseName || s.course_name || '').toLowerCase();
      if (crs && !crs.includes(appliedCourse.toLowerCase())) return false;
    }

    if (!q) return true;

    const nameMatch = s.fullName?.toLowerCase().includes(q) || s.studentName?.toLowerCase().includes(q);
    const fatherMatch = s.fatherName?.toLowerCase().includes(q) || s.father_name?.toLowerCase().includes(q) || s.motherName?.toLowerCase().includes(q);
    const rollMatch = s.rollNo?.toLowerCase().includes(q) || s.enrollmentNo?.toLowerCase().includes(q) || s.registrationNo?.toLowerCase().includes(q);
    
    const aadharRaw = (s.aadhaarNo || s.aadharNo || s.aadhar || s.aadhaar || '').toString();
    const aadharClean = aadharRaw.replace(/[\\s-]/g, '');
    const aadharMatch = aadharRaw.toLowerCase().includes(q) || (cleanNum.length >= 3 && aadharClean.includes(cleanNum));

    const phoneRaw = (s.phone || s.contact || '').toString();
    const phoneClean = phoneRaw.replace(/\\D/g, '');
    const phoneMatch = phoneRaw.includes(q) || (cleanNum.length >= 3 && phoneClean.includes(cleanNum));

    const courseMatch = s.courseName?.toLowerCase().includes(q);
    const univMatch = s.universityName?.toLowerCase().includes(q) || s.collegeName?.toLowerCase().includes(q);
    const linkedMatch = s.linkedCourses && s.linkedCourses.some(l => 
      l.courseName?.toLowerCase().includes(q) ||
      l.rollNo?.toLowerCase().includes(q)
    );

    return nameMatch || fatherMatch || rollMatch || aadharMatch || phoneMatch || courseMatch || univMatch || linkedMatch;
  });

  return (
    <div className="space-y-6 text-slate-900 animate-fadeIn">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all animate-fadeIn ${
          feedback.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' : 'bg-rose-900 text-white border-rose-700'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Main Section Header */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Educational Consultancy &amp; University Liaison Desk</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>🏛️ University Paid &amp; Settlement Ledger</span>
            </h2>
            <p className="text-sm text-amber-100/80 max-w-2xl font-medium">
              {isHindi ? (
                <>हम विभिन्न यूनिवर्सिटीज (<span className="text-amber-300 font-bold">MCBU, Barkatullah, Gyanveer University</span>) के लिए अधिकृत यूनिवर्सिटी फीस जमा करने, बकाया भुगतान व कंसल्टेंसी मुनाफे का केंद्रीय हिसाब रखते हैं।</>
              ) : (
                <>Educational Consultancy &amp; University Fee Ledger — Track student packages, authorized university fee deposits, pending balances, and retained counselor margins.</>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (typeof toggleLang === 'function') toggleLang();
              }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isHindi ? 'रीलोड' : 'Refresh'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? '+ नई यूनिवर्सिटी दर' : '+ Add University Rate'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total University Payable */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Univ Total Fee</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              ₹{stats ? Number(stats.totalUniversityFee).toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              {isHindi ? 'यूनिवर्सिटी फीस कुल देय' : 'Total Univ Payable'}
            </p>
          </div>
        </div>

        {/* Card 2: Paid to University */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Paid to Univ</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700 font-mono">
              ₹{stats ? Number(stats.totalUniversityPaid).toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              {isHindi ? `यूनिवर्सिटी को जमा किया (${stats ? stats.totalPaymentsCount : 0} वाउचर)` : `Paid to University (${stats ? stats.totalPaymentsCount : 0} Vouchers)`}
            </p>
          </div>
        </div>

        {/* Card 3: Due to University */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Univ Due Balance</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 font-mono">
              ₹{stats ? Number(stats.totalUniversityDue).toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-1">
              {isHindi ? 'यूनिवर्सिटी का कुल बकाया' : 'Total Outstanding Balance'}
            </p>
          </div>
        </div>

        {/* Card 4: Retained Cash Margin in Hand */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Retained Margin</span>
            <div className="p-2 bg-emerald-100/70 rounded-xl text-emerald-800">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-800 font-mono">
              ₹{stats ? Number(stats.retainedMargin).toLocaleString('en-IN') : '...'}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{isHindi ? 'कंसल्टेंसी हाथ में शुद्ध बचत' : 'Counselor Retained Margin'}</span>
            </div>
          </div>
        </div>

        {/* Card 5: Expected Total Profit */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/80 rounded-2xl p-5 border border-indigo-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between text-indigo-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide">Projected Profit</span>
            <div className="p-2 bg-indigo-100/70 rounded-xl text-indigo-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-indigo-900 font-mono">
              ₹{stats ? Number(stats.expectedMargin).toLocaleString('en-IN') : '...'}
            </div>
            <p className="text-[11px] font-bold text-indigo-700 mt-1">
              {isHindi ? 'कुल अनुमानित कंसल्टेंसी लाभ' : 'Projected Counselor Margin'}
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Views Selector Navigation Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSubView('ledger')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'ledger'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{isHindi ? '1. छात्र यूनिवर्सिटी लेजर (Student Ledger)' : '1. Student University Settlement Ledger'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('payments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'payments'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>{isHindi ? '2. भुगतान रसीदें व इतिहास (Payment History)' : '2. University Payment Vouchers & History'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('rates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'rates'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{isHindi ? '3. यूनिवर्सिटी मानक दरें (Course Rates)' : '3. University Course Fee Rates Master'}</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 shrink-0">
          {subView === 'ledger' && `Showing ${displayedStudents.length} of ${students.length} Student Records`}
          {subView === 'payments' && `Showing ${payments.length} University Payment Vouchers`}
          {subView === 'rates' && `Showing ${courseFees.length} Standard University Course Rates`}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: STUDENT UNIVERSITY SETTLEMENT LEDGER (MATCHING media_1789521971221.jpg) */}
      {/* ========================================================================= */}
      {subView === 'ledger' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Top University, Session & Satra Filter Form */}
          <div className="bg-[#f0f7f9] p-4 rounded-xl border border-[#bce0ee] shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Session:
                </label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer"
                >
                  <option value="all">All Sessions</option>
                  {Array.from(new Set([
                    '2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025',
                    '2025-2026', '2026-2027', '2027-2028', '2028-2029', '2029-2030',
                    ...students.map(s => s.currentSession || s.admissionSession || s.session).filter(Boolean)
                  ])).sort().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Satra(July/Jan):
                </label>
                <select
                  value={filterSatra}
                  onChange={(e) => setFilterSatra(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer"
                >
                  <option value="all">All Satras</option>
                  <option value="July">July</option>
                  <option value="January">January</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select University:
                </label>
                <select
                  value={filterUniversity}
                  onChange={(e) => setFilterUniversity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer"
                >
                  <option value="all">Select University (All)</option>
                  {universities.map((u, i) => (
                    <option key={i} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select College:
                </label>
                <select
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer"
                >
                  <option value="all">Select College (All)</option>
                  {colleges.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Course:
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium cursor-pointer"
                >
                  <option value="all">Select Course (All)</option>
                  {Array.from(new Set(students.map(s => s.course || s.courseName || s.course_name).filter(Boolean))).sort().map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="truncate">Search Student:</span>
                  {searchQuery && (
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, Roll No, Mobile..."
                    className="w-full pl-8 pr-7 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleResetSearch}
                      className="absolute right-2 top-2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="w-full bg-[#1b5e20] hover:bg-[#144718] text-white font-bold py-2.5 px-4 rounded-md shadow-sm transition-colors text-sm cursor-pointer"
              >
                Show Students Record ({displayedStudents.length} Students Matching)
              </button>
            </div>
          </div>

          {/* Dark Active Filter Status Strip */}
          <div className="bg-[#0b1f33] text-white py-2.5 px-4 rounded-lg border border-slate-700 shadow-md flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">Session:</span>
              <span className="text-emerald-400 font-mono tracking-wide">{appliedSession === 'all' ? 'All Sessions' : appliedSession}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">Current Satra:</span>
              <span className="text-cyan-300 tracking-wide">{appliedSatra === 'all' ? 'All Satras' : appliedSatra}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">University:</span>
              <span className="text-amber-300 truncate max-w-[200px]" title={appliedUniversity === 'all' ? 'All Universities' : appliedUniversity}>
                {appliedUniversity === 'all' ? 'All Universities' : appliedUniversity}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">College:</span>
              <span className="text-teal-300 truncate max-w-[200px]" title={appliedCollege === 'all' ? 'All Colleges' : appliedCollege}>
                {appliedCollege === 'all' ? 'All Colleges' : appliedCollege}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">Course:</span>
              <span className="text-purple-300 truncate max-w-[180px]" title={appliedCourse === 'all' ? 'All Courses' : appliedCourse}>
                {appliedCourse === 'all' ? 'All Courses' : appliedCourse}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-normal">Matching:</span>
              <span className="text-emerald-400 font-mono">{displayedStudents.length} Records</span>
            </div>
            <div className="flex items-center gap-2 lg:justify-end">
              <span className="text-slate-400 font-normal">Search:</span>
              {searchQuery ? (
                <span className="text-emerald-300 truncate max-w-[200px] flex items-center gap-1 font-mono" title={searchQuery}>
                  <span>"{searchQuery}"</span>
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

              <div className="ml-2 pl-2 border-l border-slate-200">
                <select
                  value={dueFilter}
                  onChange={(e) => setDueFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="all">All Univ Dues</option>
                  <option value="due_only">⚠️ Only University Due</option>
                  <option value="cleared">✅ Fully Settled (Zero Due)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 font-bold whitespace-nowrap">Search:</label>
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 text-slate-900 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-2 top-1.5 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {(searchQuery || appliedSession !== 'all' || appliedSatra !== 'all' || appliedUniversity !== 'all' || dueFilter !== 'all') && (
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

          {/* Students University Data Table (15 Columns Matching User Reference Image media_1789521971221.jpg) */}
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
                        <th className="py-2.5 px-2 border-r border-slate-700 text-center whitespace-nowrap">Class</th>

                        {/* 1st Year (3 Columns) */}
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">1st_Yr_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">1st_Yr_Paid</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">1st_Yr_Remaining</th>

                        {/* 2nd Year (3 Columns) */}
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">2nd_Yr_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">2nd_Yr_Paid</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">2nd_Yr_Remaining</th>

                        {/* 3rd Year (3 Columns) */}
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">3rd_Yr_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">3rd_Yr_Paid</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">3rd_Yr_Remaining</th>

                        {/* 4th Year (3 Columns) */}
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-amber-200">4th_Yr_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-200">4th_Yr_Paid</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-200">4th_Yr_Remaining</th>

                        {/* Overall Totals (3 Columns) */}
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-sky-200">Total_Univ_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-emerald-300">Total_Paid_Amount</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-right whitespace-nowrap text-rose-300">Remaining_Fee</th>

                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Paid_University_Fee</th>
                        <th className="py-2.5 px-2.5 border-r border-slate-700 text-center whitespace-nowrap">Set_University_Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {loading ? (
                        <tr>
                          <td colSpan="27" className="p-8 text-center text-slate-400 font-medium">
                            Loading university settlement ledger...
                          </td>
                        </tr>
                      ) : paginatedStudents.length === 0 ? (
                        <tr>
                          <td colSpan="27" className="p-10 text-center bg-slate-50">
                            <div className="max-w-md mx-auto space-y-3">
                              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                                <Search className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-800">
                                  {searchQuery 
                                    ? `No student records found matching "${searchQuery}"`
                                    : 'No student records found matching selected filters'}
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

                          const bd = calculateUniversityYearBreakdown(std);

                          return (
                            <React.Fragment key={std.id || std.rollNo}>
                              <tr className="hover:bg-[#eaf3fa] transition-colors border-b border-slate-200 text-xs">
                                <td className="py-2.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200 whitespace-nowrap">
                                  {startIndex + idx + 1}
                                </td>
                                <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap">
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      onClick={() => setProfileStudent(std)}
                                      className="w-9 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 shrink-0 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all shadow-2xs"
                                      title="Click to view student details"
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
                                        onClick={() => setProfileStudent(std)}
                                        className="font-bold text-slate-900 uppercase tracking-tight hover:text-amber-700 cursor-pointer"
                                      >
                                        {std.fullName || std.studentName}
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">
                                        {std.rollNo}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-medium">
                                  {std.fatherName || std.Father_Name || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-700 font-mono">
                                  {std.contact || std.phone || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 max-w-[200px] truncate" title={std.collegeName || std.universityName || ''}>
                                  {std.collegeName || std.universityName || '-'}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-800 font-semibold whitespace-nowrap">
                                  {std.courseName || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                                  {std.courseType || 'Semester'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    {std.status || 'Active'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-slate-700 font-medium min-w-[170px] max-w-[280px] break-words whitespace-normal leading-snug" title={std.remark || ''}>
                                  {std.remark || '-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                  {std.currentClass || (std.currentSemester ? `SEM-${std.currentSemester}` : 'SEM-1')}
                                </td>

                                {/* 1st Year (3 Columns) */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                  {bd.hasY1 ? bd.feeY1 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                  {bd.hasY1 ? bd.recY1 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                  {bd.hasY1 ? (bd.remY1 > 0 ? `${bd.remY1}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                </td>

                                {/* 2nd Year (3 Columns) */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                  {bd.hasY2 ? bd.feeY2 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                  {bd.hasY2 ? bd.recY2 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                  {bd.hasY2 ? (bd.remY2 > 0 ? `${bd.remY2}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                </td>

                                {/* 3rd Year (3 Columns) */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                  {bd.hasY3 ? bd.feeY3 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                  {bd.hasY3 ? bd.recY3 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                  {bd.hasY3 ? (bd.remY3 > 0 ? `${bd.remY3}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                </td>

                                {/* 4th Year (3 Columns) */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                  {bd.hasY4 ? bd.feeY4 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                  {bd.hasY4 ? bd.recY4 : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                  {bd.hasY4 ? (bd.remY4 > 0 ? `${bd.remY4}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                </td>

                                {/* Overall Totals (3 Columns) */}
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900 bg-sky-50/20">
                                  {bd.totalFee > 0 ? bd.totalFee : 0}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700 bg-emerald-50/20">
                                  {bd.totalPaid > 0 ? bd.totalPaid : 0}
                                </td>
                                <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700 bg-rose-50/20">
                                  {bd.totalRem > 0 ? `${bd.totalRem}/-` : '0/-'}
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPayModal(std)}
                                    className="bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                    title="Pay Official University Fee"
                                  >
                                    Paid_University_Fee
                                  </button>
                                </td>
                                <td className="py-2.5 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditFeeModal(std)}
                                    className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                    title="Set Official University Fee"
                                  >
                                    Set_University_Fee
                                  </button>
                                </td>
                              </tr>

                              {/* Connected Sub-Rows for 2nd / Dual Program Enrollments */}
                              {std.linkedCourses && std.linkedCourses.map((linked, lcIdx) => {
                                const lbd = calculateUniversityYearBreakdown(linked);
                                return (
                                  <tr key={`${std.id}-linked-${lcIdx}`} className="bg-amber-50/30 border-b border-amber-200/60 hover:bg-amber-100/40 transition-colors text-xs">
                                    <td className="py-2 px-2 text-center font-bold text-amber-800 border-r border-slate-200">
                                      ↳
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded">
                                          Dual Course
                                        </span>
                                        <span className="font-bold text-slate-800">{std.fullName}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">({linked.rollNo})</span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600">
                                      {linked.fatherName || std.fatherName || '-'}
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 whitespace-nowrap text-slate-600 font-mono">
                                      {linked.phone || std.contact || std.phone || '-'}
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-600 truncate max-w-[200px]" title={linked.collegeName || linked.universityName || ''}>
                                      {linked.collegeName || linked.universityName || '-'}
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 font-bold text-amber-950 whitespace-nowrap">
                                      {linked.courseName}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-slate-700 whitespace-nowrap">
                                      {linked.courseType || 'Diploma'}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        {linked.status || 'Active'}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2.5 border-r border-slate-200 text-slate-700 font-medium min-w-[170px] max-w-[280px] break-words whitespace-normal leading-snug">
                                      {linked.remark || '-'}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-center whitespace-nowrap font-bold text-slate-800">
                                      {linked.currentClass || (linked.currentSemester ? `SEM-${linked.currentSemester}` : 'SEM-1')}
                                    </td>

                                    {/* 1st Year (3 Columns) */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                      {lbd.hasY1 ? lbd.feeY1 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                      {lbd.hasY1 ? lbd.recY1 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                      {lbd.hasY1 ? (lbd.remY1 > 0 ? `${lbd.remY1}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* 2nd Year (3 Columns) */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                      {lbd.hasY2 ? lbd.feeY2 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                      {lbd.hasY2 ? lbd.recY2 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                      {lbd.hasY2 ? (lbd.remY2 > 0 ? `${lbd.remY2}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* 3rd Year (3 Columns) */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                      {lbd.hasY3 ? lbd.feeY3 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                      {lbd.hasY3 ? lbd.recY3 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                      {lbd.hasY3 ? (lbd.remY3 > 0 ? `${lbd.remY3}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* 4th Year (3 Columns) */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-800">
                                      {lbd.hasY4 ? lbd.feeY4 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700">
                                      {lbd.hasY4 ? lbd.recY4 : <span className="text-slate-300">-</span>}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700">
                                      {lbd.hasY4 ? (lbd.remY4 > 0 ? `${lbd.remY4}/-` : '0/-') : <span className="text-slate-300">-</span>}
                                    </td>

                                    {/* Overall Totals (3 Columns) */}
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-slate-900 bg-sky-50/20">
                                      {lbd.totalFee > 0 ? lbd.totalFee : 0}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-emerald-700 bg-emerald-50/20">
                                      {lbd.totalPaid > 0 ? lbd.totalPaid : 0}
                                    </td>
                                    <td className="py-2.5 px-2.5 border-r border-slate-200 text-right whitespace-nowrap font-bold font-mono text-rose-700 bg-rose-50/20">
                                      {lbd.totalRem > 0 ? `${lbd.totalRem}/-` : '0/-'}
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenPayModal(linked)}
                                        className="bg-[#1d72b8] hover:bg-[#155a96] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                        title="Pay Official University Fee for Dual Course"
                                      >
                                        Paid_University_Fee
                                      </button>
                                    </td>
                                    <td className="py-2 px-2 border-r border-slate-200 text-center whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditFeeModal(linked)}
                                        className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-2.5 py-1 rounded text-[11px] shadow-sm cursor-pointer transition-all hover:scale-102 whitespace-nowrap"
                                        title="Set Official University Fee for Dual Course"
                                      >
                                        Set_University_Fee
                                      </button>
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

                {/* Pagination Controls */}
                {pageSize !== 'all' && totalPages > 1 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to <span className="font-bold text-slate-800">{endIndex}</span> of <span className="font-bold text-slate-800">{totalEntries}</span> students
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="px-2 font-bold text-slate-800">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer matching User Monitor Image media_1789521971221.jpg */}
                <div className="py-2.5 px-4 text-center text-xs font-bold text-slate-700 bg-slate-100 border-t border-slate-200">
                  Copyright © 2026|| Narbada Digital Pvt. Ltd.
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: UNIVERSITY PAYMENT HISTORY & VOUCHERS */}
      {/* ========================================================================= */}
      {subView === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Official University Payment Vouchers &amp; Transaction Registry
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {payments.length} Vouchers Issued
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">{isHindi ? 'कोई यूनिवर्सिटी भुगतान रिकॉर्ड नहीं मिला' : 'No University Payment Records Found'}</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isHindi ? 'छात्र लेजर से "Paid_University_Fee" बटन दबाकर यूनिवर्सिटी फीस जमा करें।' : 'Click "Paid_University_Fee" on any student in the ledger to record a university fee payment.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Voucher No &amp; Date</th>
                    <th className="py-3.5 px-4">Student &amp; Roll No</th>
                    <th className="py-3.5 px-4">Beneficiary University</th>
                    <th className="py-3.5 px-4">Installment / Purpose</th>
                    <th className="py-3.5 px-4">Payment Mode &amp; Bank UTR</th>
                    <th className="py-3.5 px-4 text-right">Amount Paid</th>
                    <th className="py-3.5 px-4 text-center">Print Voucher</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id || p.voucherNo} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-950 block text-xs">
                          {p.voucherNo}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {formatPaymentDate(p.paymentDate)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{p.studentName}</span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                          <span>{p.rollNo}</span>
                          <span>•</span>
                          <span>{p.courseName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-indigo-950 block">{p.universityName}</span>
                        {p.collegeName && (
                          <span className="text-[10px] text-slate-500 block">{p.collegeName}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200 inline-block">
                          {p.paidSemester || 'Semester Fee'}
                        </span>
                        {p.purpose && (
                          <span className="text-[10px] text-slate-500 block mt-0.5">{p.purpose}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 uppercase block">{p.paymentMode}</span>
                        <span className="font-mono text-[10px] text-slate-500 block">
                          Ref: {p.transactionRef || 'BANK-DIRECT'}
                        </span>
                        {p.paidToAccount && (
                          <span className="text-[10.5px] text-indigo-800 font-semibold block mt-0.5 truncate max-w-[200px]" title={p.paidToAccount}>
                            A/c: {p.paidToAccount}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-sm text-amber-800 font-mono">
                          ₹{Number(p.amountPaidToUniversity || p.amountPaid || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setVoucherToPrint(p)}
                            className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-amber-300 cursor-pointer shadow-xs"
                            title="Print Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPayment(p)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Payment"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePayment(p)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: UNIVERSITY COURSE FEE RATES MASTER */}
      {/* ========================================================================= */}
      {subView === 'rates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isHindi ? 'यूनिवर्सिटी मानक शुल्क दरें (Course Rate Cards)' : 'Official University Course Rate Cards'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isHindi ? 'विभिन्न विश्वविद्यालयों द्वारा ली जाने वाली आधिकारिक मूल फीस की सूची' : 'Master list of official tuition fees charged by partner universities per course'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? '+ नई दर जोड़ें' : '+ Add Course Rate'}</span>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseFees.map((rate, idx) => (
                <div key={rate.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:border-amber-400 transition-all space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                        {rate.universityName}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1.5">{rate.courseName}</h4>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-amber-700">
                      <Landmark className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="border-t border-slate-200/80 pt-3 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Official Total Fee:</span>
                      <span className="font-black text-amber-950 text-sm">
                        ₹{Number(rate.officialFee).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {rate.feePerSemester > 0 && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">Per Semester:</span>
                        <span className="font-bold text-slate-800">
                          ₹{Number(rate.feePerSemester).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {rate.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                      {rate.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: PAID UNIVERSITY FEE DESK (Matching media_1789521971221.jpg) */}
      {/* ========================================================================= */}
      {payModalStudent && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setPayModalStudent(null)}
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 my-auto text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-[#1d72b8] text-white rounded-xl shadow-xs">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Paid University Fee Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record authorized university fee disbursement &amp; generate official voucher
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Details Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
                <div>
                  <span className="text-slate-400 block text-[11px]">Student Name:</span>
                  <span className="font-bold text-slate-900 text-sm uppercase">{payModalStudent.fullName || payModalStudent.studentName}</span>
                  <span className="text-slate-500 font-mono ml-2">({payModalStudent.rollNo})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Father Name:</span>
                  <span className="font-bold text-slate-800">{payModalStudent.fatherName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Beneficiary University:</span>
                  <span className="font-bold text-indigo-900">{payModalStudent.universityName || 'Main University'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Enrolled Course:</span>
                  <span className="font-semibold text-slate-800">{payModalStudent.courseName} ({payModalStudent.currentClass || 'SEM-1'})</span>
                </div>
              </div>

              {/* Fee Summary Highlight Strip */}
              {(() => {
                const uFee = Number(payModalStudent.universityFee || 0);
                const uPaid = Number(payModalStudent.universityPaid || 0);
                const uDue = Math.max(0, uFee - uPaid);
                return (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center font-mono">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-sans">University_Fee</span>
                      <span className="font-black text-slate-900 text-xs">₹{uFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 block font-sans">Total_Paid_Amount</span>
                      <span className="font-black text-emerald-800 text-xs">₹{uPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <span className="text-[10px] text-rose-700 block font-sans">Remaining_Fee</span>
                      <span className="font-black text-rose-700 text-xs">₹{uDue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs font-medium">
              {/* University Bank / Account Selector (Right under University Context) */}
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-amber-700" />
                    <span>Select University Bank / Account (यूनिवर्सिटी बैंक / खाता चुनें)*</span>
                  </label>
                  <span className="text-[11px] font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                    🏛️ {payModalStudent.universityName || 'University'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left: University Bank Dropdown */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">
                        यूनिवर्सिटी बैंक खाता (Bank Account):
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowManageBanksModal(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md cursor-pointer transition-colors shadow-2xs"
                        title="Add or Edit Bank Accounts"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ Add / Edit Banks</span>
                      </button>
                    </div>
                    <select
                      value={isOtherAccount ? 'OTHER' : paidToAccount}
                      onChange={(e) => {
                        if (e.target.value === 'MANAGE_BANKS') {
                          setShowManageBanksModal(true);
                        } else if (e.target.value === 'OTHER') {
                          setIsOtherAccount(true);
                        } else {
                          setIsOtherAccount(false);
                          setPaidToAccount(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                    >
                      {bankAccounts.map((bName) => {
                        const fullName = `${payModalStudent?.universityName || 'University'} - ${bName}`;
                        return (
                          <option key={bName} value={fullName}>
                            {fullName}
                          </option>
                        );
                      })}
                      <option value="OTHER">
                        ➕ Other / Personal Account (पर्सनल खाता / अन्य बैंक)...
                      </option>
                      <option value="MANAGE_BANKS" className="text-indigo-700 font-bold bg-indigo-50">
                        ⚙️ + Manage / Add More Bank Names...
                      </option>
                    </select>
                  </div>

                  {/* Right: Other / Personal Account Name & Details */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Other / Personal Account (व्यक्तिगत खाता):</span>
                      <span className="text-[10px] text-amber-700 font-semibold">(Type A/c or Bank Name)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="लिखें: Personal A/c holder name, SBI 3482..., या Bank name"
                      value={otherAccountText}
                      onChange={(e) => {
                        setOtherAccountText(e.target.value);
                        if (e.target.value.trim()) {
                          setIsOtherAccount(true);
                        }
                      }}
                      onFocus={() => {
                        setIsOtherAccount(true);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-xs transition-all ${
                        isOtherAccount 
                          ? 'bg-amber-50/60 border-2 border-amber-500 font-bold text-slate-900 shadow-xs' 
                          : 'bg-white border border-slate-300 font-medium text-slate-700'
                      }`}
                    />
                  </div>
                </div>

                {isOtherAccount && (
                  <p className="text-[11px] text-amber-900 font-medium bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300">
                    ✍️ <strong>Personal / Other A/c Selected:</strong> {otherAccountText ? `"${otherAccountText}"` : 'कृपया यहाँ पर्सनल खाते का नाम या बैंक दर्ज करें'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Class / Semester*</label>
                  <select
                    value={paidSemester}
                    onChange={(e) => setPaidSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="SEM-1">SEM-1</option>
                    <option value="SEM-2">SEM-2</option>
                    <option value="SEM-3">SEM-3</option>
                    <option value="SEM-4">SEM-4</option>
                    <option value="SEM-5">SEM-5</option>
                    <option value="SEM-6">SEM-6</option>
                    <option value="SEM-7">SEM-7</option>
                    <option value="SEM-8">SEM-8</option>
                    <option value="Year-1">Year-1</option>
                    <option value="Year-2">Year-2</option>
                    <option value="Year-3">Year-3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Fee Payment Date*</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Purpose*</label>
                  <select
                    value={paymentPurpose}
                    onChange={(e) => setPaymentPurpose(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Official University Fee Settlement">Official University Fee Settlement</option>
                    <option value="Registration Fees">Registration Fees</option>
                    <option value="Tuition Fee Deposit">Tuition Fee Deposit</option>
                    <option value="Examination Fee">Examination Fee</option>
                    <option value="Enrollment & Registration Fee">Enrollment &amp; Registration Fee</option>
                    <option value="Migration & Degree Fee">Migration &amp; Degree Fee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Payment Mode*</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Bank NEFT / RTGS">Bank NEFT / RTGS</option>
                    <option value="Bank Challan">Bank Challan</option>
                    <option value="Online / UPI">Online / UPI</option>
                    <option value="Net Banking">Net Banking / Portal</option>
                    <option value="DD / Cheque">DD / Cheque</option>
                    <option value="Cash">Cash Counter</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Bank UTR / Ref Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-2026-MCBU-9812"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Deposited By</label>
                  <input
                    type="text"
                    value={payReceivedBy}
                    onChange={(e) => setPayReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Amount to Pay with fast fill */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">
                    Enter Fee Amount to University (INR)*
                  </label>
                  {(() => {
                    const uFee = Number(payModalStudent.universityFee || 0);
                    const uPaid = Number(payModalStudent.universityPaid || 0);
                    const uDue = Math.max(0, uFee - uPaid);
                    if (uDue > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => setPayAmount(String(uDue))}
                          className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 px-2 py-0.5 rounded cursor-pointer border border-rose-200"
                        >
                          Pay Full Due (₹{uDue.toLocaleString('en-IN')})
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#1d72b8] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Remark / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via official university portal counter"
                  value={paymentRemark}
                  onChange={(e) => setPaymentRemark(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-[#1d72b8] focus:outline-none"
                />
              </div>

              {/* Student's Past University Payment Ledger Table */}
              {(() => {
                const pastPayments = payments.filter(p => 
                  p.rollNo?.toUpperCase() === payModalStudent.rollNo?.toUpperCase() ||
                  (p.studentId && payModalStudent.id && p.studentId === payModalStudent.id)
                );
                return (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        Past University Payment History ({pastPayments.length} Vouchers)
                      </span>
                      {pastPayments.length > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-700">
                          Total: ₹{pastPayments.reduce((acc, curr) => acc + Number(curr.amountPaidToUniversity || curr.amountPaid || 0), 0).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {pastPayments.length > 0 ? (
                      <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="p-2">Date</th>
                              <th className="p-2">Class</th>
                              <th className="p-2">Voucher No</th>
                              <th className="p-2">Mode</th>
                              <th className="p-2">Paid Account</th>
                              <th className="p-2 text-right">Amount</th>
                              <th className="p-2 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {pastPayments.map((pp, pIdx) => (
                              <tr key={pp.id || pIdx} className="hover:bg-slate-50 font-medium">
                                <td className="p-2 whitespace-nowrap font-medium text-slate-900">{formatPaymentDate(pp.paymentDate)}</td>
                                <td className="p-2 whitespace-nowrap">{pp.paidSemester || 'SEM-1'}</td>
                                <td className="p-2 font-mono text-slate-700 whitespace-nowrap">{pp.voucherNo}</td>
                                <td className="p-2 whitespace-nowrap">{pp.paymentMode}</td>
                                <td className="p-2 whitespace-nowrap text-indigo-900 font-semibold text-[10.5px] max-w-[130px] truncate" title={pp.paidToAccount || 'Univ Official A/c'}>
                                  {pp.paidToAccount || 'Univ Official A/c'}
                                </td>
                                <td className="p-2 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">₹{Number(pp.amountPaidToUniversity || pp.amountPaid || 0).toLocaleString('en-IN')}</td>
                                <td className="p-2 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setVoucherToPrint(pp)}
                                      className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-amber-200 cursor-pointer"
                                      title="Print Voucher"
                                    >
                                      Print
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditPayment(pp)}
                                      className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded cursor-pointer"
                                      title="Edit Payment"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePayment(pp)}
                                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                                      title="Delete Payment"
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
                    ) : (
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[11px] text-slate-500">
                          No university payments recorded yet for this student.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="flex items-center gap-2 bg-[#1d72b8] hover:bg-[#155a96] text-white px-5 py-2 rounded-xl font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {payLoading ? (
                    <span>Recording Payment...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Paid University Fee</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SET UNIVERSITY FEE (Matching media_1789521971221.jpg) */}
      {/* ========================================================================= */}
      {editFeeStudent && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setEditFeeStudent(null)}
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#28a745] text-white rounded-xl shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Set University Fee
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editFeeStudent.fullName || editFeeStudent.studentName} ({editFeeStudent.rollNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditFeeStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudentFee} className="space-y-3.5 text-xs text-slate-900 font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Target University Name*
                </label>
                <input
                  type="text"
                  required
                  list="univ-list-presets"
                  value={newUnivName}
                  onChange={(e) => setNewUnivName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#28a745] focus:outline-none"
                />
                <datalist id="univ-list-presets">
                  {universities.map((u, i) => (
                    <option key={i} value={u} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Affiliated College / Center Name
                </label>
                <input
                  type="text"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#28a745] focus:outline-none"
                />
              </div>

              {/* Year-Wise University Fee Breakdown Inputs */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Year-Wise Fee Setup (वर्ष अनुसार फीस):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">1st Year Univ Fee</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newUnivFeeYear1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewUnivFeeYear1(val);
                        const total = (Number(val) || 0) + (Number(newUnivFeeYear2) || 0) + (Number(newUnivFeeYear3) || 0) + (Number(newUnivFeeYear4) || 0);
                        setNewUnivFee(String(total));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">2nd Year Univ Fee</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newUnivFeeYear2}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewUnivFeeYear2(val);
                        const total = (Number(newUnivFeeYear1) || 0) + (Number(val) || 0) + (Number(newUnivFeeYear3) || 0) + (Number(newUnivFeeYear4) || 0);
                        setNewUnivFee(String(total));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">3rd Year Univ Fee</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newUnivFeeYear3}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewUnivFeeYear3(val);
                        const total = (Number(newUnivFeeYear1) || 0) + (Number(newUnivFeeYear2) || 0) + (Number(val) || 0) + (Number(newUnivFeeYear4) || 0);
                        setNewUnivFee(String(total));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">4th Year Univ Fee</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newUnivFeeYear4}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewUnivFeeYear4(val);
                        const total = (Number(newUnivFeeYear1) || 0) + (Number(newUnivFeeYear2) || 0) + (Number(newUnivFeeYear3) || 0) + (Number(val) || 0);
                        setNewUnivFee(String(total));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Total Official Base University Fee (INR)*
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 12000"
                  value={newUnivFee}
                  onChange={(e) => setNewUnivFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#28a745] focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  {isHindi ? 'यह आधिकारिक फीस है जो विश्वविद्यालय में छात्र के लिए जमा की जानी है।' : 'Official tuition fee payable directly to partner university.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditFeeStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editFeeLoading}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {editFeeLoading ? 'Saving...' : 'Set University Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD/UPDATE STANDARD COURSE FEE RATE */}
      {/* ========================================================================= */}
      {showRateModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setShowRateModal(false)}
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Add University Course Rate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set standard university fee charge per degree course
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRateSubmit} className="space-y-3.5 text-xs text-slate-900 font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">University Name*</label>
                <input
                  type="text"
                  required
                  value={rateForm.universityName}
                  onChange={(e) => setRateForm({ ...rateForm, universityName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Course / Degree Program Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Arts (BA)"
                  value={rateForm.courseName}
                  onChange={(e) => setRateForm({ ...rateForm, courseName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Official Total Fee (INR)*</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 18000"
                    value={rateForm.officialFee}
                    onChange={(e) => setRateForm({ ...rateForm, officialFee: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Per Semester Rate</label>
                  <input
                    type="number"
                    placeholder="e.g. 3000"
                    value={rateForm.feePerSemester}
                    onChange={(e) => setRateForm({ ...rateForm, feePerSemester: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Notes / Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Applicable for 2025-2026 Batch"
                  value={rateForm.notes}
                  onChange={(e) => setRateForm({ ...rateForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rateLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {rateLoading ? 'Saving...' : 'Save Rate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK STUDENT PROFILE PREVIEW */}
      {/* ========================================================================= */}
      {profileStudent && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setProfileStudent(null)}
        >
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                  {profileStudent.studentImage || profileStudent.photo || profileStudent.documents?.student_image || profileStudent.documents?.photo ? (
                    <img src={profileStudent.studentImage || profileStudent.photo || profileStudent.documents?.student_image || profileStudent.documents?.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 uppercase">
                    {profileStudent.fullName || profileStudent.studentName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Roll No: {profileStudent.rollNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Father Name:</span>
                <span className="font-bold text-slate-800">{profileStudent.fatherName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Number:</span>
                <span className="font-mono font-bold text-slate-800">{profileStudent.contact || profileStudent.phone || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Enrolled Course:</span>
                <span className="font-bold text-slate-800">{profileStudent.courseName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Class / Semester:</span>
                <span className="font-bold text-slate-800">{profileStudent.currentClass || (profileStudent.currentSemester ? `SEM-${profileStudent.currentSemester}` : 'SEM-1')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">University:</span>
                <span className="font-bold text-indigo-900">{profileStudent.universityName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">College:</span>
                <span className="font-bold text-slate-800">{profileStudent.collegeName || '-'}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">Remark:</span>
              <p className="text-slate-700 font-medium whitespace-pre-wrap">{profileStudent.remark || 'No remark recorded.'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setProfileStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT UNIVERSITY PAYMENT VOUCHER */}
      {/* ========================================================================= */}
      {editingUnivPayment && createPortal(
        <div 
          className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setEditingUnivPayment(null)}
        >
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto text-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit University Payment Voucher
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {editingUnivPayment.voucherNo} • {editingUnivPayment.studentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUnivPayment(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-3 text-xs font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Fee Amount to University (INR)*</label>
                <input
                  type="number"
                  required
                  value={editPaymentForm.amountPaidToUniversity}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amountPaidToUniversity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:outline-none font-mono"
                />
              </div>

              {/* Edit University Bank / Account Selector */}
              <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-amber-700" />
                    <span>Bank / Payment Account (यूनिवर्सिटी बैंक / खाता)*</span>
                  </label>
                  <span className="text-[10px] font-bold text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                    {editingUnivPayment.universityName || 'University'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-600">Bank Account:</span>
                      <button
                        type="button"
                        onClick={() => setShowManageBanksModal(true)}
                        className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded cursor-pointer"
                        title="Add or Edit Bank Accounts"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Add/Edit</span>
                      </button>
                    </div>
                    <select
                      value={editPaymentForm.isOtherAccount ? 'OTHER' : editPaymentForm.paidToAccount}
                      onChange={(e) => {
                        if (e.target.value === 'MANAGE_BANKS') {
                          setShowManageBanksModal(true);
                        } else if (e.target.value === 'OTHER') {
                          setEditPaymentForm({ ...editPaymentForm, isOtherAccount: true, paidToAccount: 'OTHER' });
                        } else {
                          setEditPaymentForm({ ...editPaymentForm, isOtherAccount: false, paidToAccount: e.target.value });
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                    >
                      {bankAccounts.map((bName) => {
                        const fullName = `${editingUnivPayment.universityName || 'University'} - ${bName}`;
                        return (
                          <option key={bName} value={fullName}>
                            {fullName}
                          </option>
                        );
                      })}
                      <option value="OTHER">
                        ➕ Other / Personal Account (पर्सनल खाता)...
                      </option>
                      <option value="MANAGE_BANKS" className="text-indigo-700 font-bold bg-indigo-50">
                        ⚙️ + Manage / Add More Bank Names...
                      </option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Other / Personal A/c details..."
                      value={editPaymentForm.otherAccountText}
                      onChange={(e) => setEditPaymentForm({ ...editPaymentForm, otherAccountText: e.target.value, isOtherAccount: true })}
                      onFocus={() => setEditPaymentForm({ ...editPaymentForm, isOtherAccount: true })}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-xs ${
                        editPaymentForm.isOtherAccount 
                          ? 'bg-white border-2 border-amber-500 font-bold text-slate-900 shadow-xs' 
                          : 'bg-white border border-slate-300 font-medium text-slate-700'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Payment Date*</label>
                  <input
                    type="date"
                    required
                    value={editPaymentForm.paymentDate}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Class / Semester*</label>
                  <select
                    value={editPaymentForm.paidSemester}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, paidSemester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="SEM-1">SEM-1 (1st Semester)</option>
                    <option value="SEM-2">SEM-2 (2nd Semester)</option>
                    <option value="SEM-3">SEM-3 (3rd Semester)</option>
                    <option value="SEM-4">SEM-4 (4th Semester)</option>
                    <option value="SEM-5">SEM-5 (5th Semester)</option>
                    <option value="SEM-6">SEM-6 (6th Semester)</option>
                    <option value="SEM-7">SEM-7 (7th Semester)</option>
                    <option value="SEM-8">SEM-8 (8th Semester)</option>
                    <option value="Year-1">Year-1 (1st Year Annual)</option>
                    <option value="Year-2">Year-2 (2nd Year Annual)</option>
                    <option value="Year-3">Year-3 (3rd Year Annual)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Payment Mode*</label>
                  <select
                    value={editPaymentForm.paymentMode}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  >
                    <option value="Bank NEFT / RTGS">Bank NEFT / RTGS</option>
                    <option value="Online / UPI">Online / UPI QR</option>
                    <option value="Net Banking">Net Banking Portal</option>
                    <option value="Demand Draft (DD)">Demand Draft (DD)</option>
                    <option value="Cash Voucher">Cash Voucher</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Bank UTR / Ref Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-2026-MCBU-9812"
                    value={editPaymentForm.transactionRef}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Purpose</label>
                <select
                  value={editPaymentForm.purpose}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, purpose: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none cursor-pointer"
                >
                  <option value="Official University Fee Settlement">Official University Fee Settlement</option>
                  <option value="Registration Fees">Registration Fees</option>
                  <option value="Tuition Fee Deposit">Tuition Fee Deposit</option>
                  <option value="Examination Fee">Examination Fee</option>
                  <option value="Enrollment & Registration Fee">Enrollment &amp; Registration Fee</option>
                  <option value="Migration & Degree Fee">Migration &amp; Degree Fee</option>
                  {editPaymentForm.purpose && 
                   !['Official University Fee Settlement', 'Registration Fees', 'Tuition Fee Deposit', 'Examination Fee', 'Enrollment & Registration Fee', 'Migration & Degree Fee'].includes(editPaymentForm.purpose) && (
                    <option value={editPaymentForm.purpose}>{editPaymentForm.purpose}</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Remark / Reference Note</label>
                <input
                  type="text"
                  value={editPaymentForm.remark}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, remark: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUnivPayment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPaymentLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {editPaymentLoading ? 'Saving...' : 'Update Payment Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL: MANAGE UNIVERSITY BANK ACCOUNTS */}
      {/* ========================================================================= */}
      {showManageBanksModal && createPortal(
        <div 
          className="fixed inset-0 z-[11000] bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-4 flex justify-center items-center animate-fadeIn"
          onClick={() => setShowManageBanksModal(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900 my-auto animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Manage University Bank Accounts
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    ड्रॉपडाउन में बैंक के नाम जोड़ें, एडिट करें या हटाएं
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageBanksModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Bank Form */}
            <form onSubmit={handleAddBank} className="space-y-2 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
              <label className="block text-xs font-bold text-slate-800">
                + Add New Bank Name (नया बैंक नाम जोड़ें):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Canara Bank, Axis Bank A/c, Kotak..."
                  value={newBankInput}
                  onChange={(e) => setNewBankInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Bank</span>
                </button>
              </div>
            </form>

            {/* Existing Banks List */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Current Bank Accounts ({bankAccounts.length}):</span>
                <span className="text-[10px] text-slate-500 font-normal">Edit या Delete कर सकते हैं</span>
              </label>
              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50">
                {bankAccounts.map((bName, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium hover:border-amber-300 transition-colors shadow-2xs"
                  >
                    {editingBankIndex === idx ? (
                      <div className="flex items-center gap-1.5 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingBankValue}
                          onChange={(e) => setEditingBankValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 bg-amber-50 border border-amber-400 rounded-lg text-xs font-bold text-slate-900 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateBank(idx)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingBankIndex(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 truncate mr-2">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{idx + 1}.</span>
                          <span className="font-bold text-slate-800 truncate">
                            {bName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBankIndex(idx);
                              setEditingBankValue(bName);
                            }}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors"
                            title="Edit Bank Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBank(idx)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                            title="Delete Bank Name"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowManageBanksModal(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all"
              >
                Done &amp; Apply
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* VOUCHER PRINT MODAL */}
      {/* ========================================================================= */}
      {voucherToPrint && (
        <PrintUniversityVoucher
          voucher={voucherToPrint}
          onClose={() => setVoucherToPrint(null)}
        />
      )}
    </div>
  );
}
