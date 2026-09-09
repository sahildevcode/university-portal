import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw, 
  ShieldCheck, 
  Calendar, 
  ChevronDown, 
  SlidersHorizontal,
  Sparkles,
  Wallet,
  ArrowUpRight,
  ExternalLink,
  Percent
} from 'lucide-react';
import PrintUniversityVoucher from '../components/PrintUniversityVoucher';

export default function UniversityPaidManager() {
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

  // Filters State
  const [selectedUniv, setSelectedUniv] = useState('ALL');
  const [selectedCollege, setSelectedCollege] = useState('ALL');
  const [dueFilter, setDueFilter] = useState('all'); // 'all' | 'due_only' | 'cleared'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [payModalStudent, setPayModalStudent] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [paidSemester, setPaidSemester] = useState('Semester 1');
  const [paymentMode, setPaymentMode] = useState('Bank NEFT / RTGS');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('Official University Fee Settlement');
  const [paymentRemark, setPaymentRemark] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Edit Univ Fee Modal State
  const [editFeeStudent, setEditFeeStudent] = useState(null);
  const [newUnivFee, setNewUnivFee] = useState('');
  const [newUnivName, setNewUnivName] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editFeeLoading, setEditFeeLoading] = useState(false);

  // Add/Edit Course Master Rate Modal State
  const [showRateModal, setShowRateModal] = useState(false);
  const [rateForm, setRateForm] = useState({
    universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    courseName: '',
    officialFee: '',
    feePerSemester: '',
    notes: ''
  });
  const [rateLoading, setRateLoading] = useState(false);

  // Voucher Print Modal State
  const [voucherToPrint, setVoucherToPrint] = useState(null);

  // Feedback Notification
  const [feedback, setFeedback] = useState(null);

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4500);
  };

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

  // Fetch Universities & Colleges Lists
  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/university/universities');
      const data = await res.json();
      if (data.success) {
        setUniversities(data.universities || []);
        setColleges(data.colleges || []);
      }
    } catch (err) {
      console.error('Error fetching universities list:', err);
    }
  };

  // Fetch Student University Ledger
  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUniv !== 'ALL') params.append('universityName', selectedUniv);
      if (selectedCollege !== 'ALL') params.append('collegeName', selectedCollege);
      if (dueFilter !== 'all') params.append('dueStatus', dueFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/university/ledger?${params.toString()}`);
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
      const params = new URLSearchParams();
      if (selectedUniv !== 'ALL') params.append('universityName', selectedUniv);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/university/payments?${params.toString()}`);
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

  // Initial Load & Triggers
  useEffect(() => {
    fetchStats();
    fetchUniversities();
    fetchCourseFees();
  }, [refreshTrigger]);

  useEffect(() => {
    if (subView === 'ledger') {
      fetchLedger();
    } else if (subView === 'payments') {
      fetchPayments();
    }
  }, [subView, selectedUniv, selectedCollege, dueFilter, searchQuery, refreshTrigger]);

  // Open Pay Modal
  const handleOpenPayModal = (student) => {
    setPayModalStudent(student);
    setPayAmount(student.universityDue > 0 ? String(student.universityDue) : '');
    setPaidSemester(`Semester ${student.currentSemester || 1}`);
    setPaymentMode('Bank NEFT / RTGS');
    setTransactionRef('');
    setPaymentPurpose(`Semester ${student.currentSemester || 1} Official University Fee Deposit`);
    setPaymentRemark('');
  };

  // Submit Pay to University
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payModalStudent || !payAmount || Number(payAmount) <= 0) {
      showFeedback('कृपया वैध भुगतान राशि दर्ज करें।', 'error');
      return;
    }

    setPayLoading(true);
    try {
      const res = await fetch('/api/university/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: payModalStudent.rollNo,
          amountPaidToUniversity: Number(payAmount),
          paidSemester,
          paymentMode,
          transactionRef,
          purpose: paymentPurpose,
          remark: paymentRemark,
          recordedBy: 'Admin Counselor'
        })
      });

      const data = await res.json();
      if (data.success) {
        showFeedback(data.message, 'success');
        setPayModalStudent(null);
        setRefreshTrigger(prev => prev + 1);
        if (data.voucher) {
          setVoucherToPrint(data.voucher);
        }
      } else {
        showFeedback(data.message || 'भुगतान दर्ज करने में त्रुटि हुई', 'error');
      }
    } catch (err) {
      console.error('Error paying university fee:', err);
      showFeedback('नेटवर्क त्रुटि! कृपया पुनः प्रयास करें।', 'error');
    } finally {
      setPayLoading(false);
    }
  };

  // Open Edit Fee Modal
  const handleOpenEditFeeModal = (student) => {
    setEditFeeStudent(student);
    setNewUnivFee(String(student.universityFee || ''));
    setNewUnivName(student.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)');
    setNewCollegeName(student.collegeName || 'Govt PG College Chhatarpur');
  };

  // Submit Edit Fee
  const handleEditFeeSubmit = async (e) => {
    e.preventDefault();
    if (!editFeeStudent || newUnivFee === '') {
      showFeedback('कृपया मान्य यूनिवर्सिटी फीस दर्ज करें।', 'error');
      return;
    }

    setEditFeeLoading(true);
    try {
      const res = await fetch(`/api/university/student/${editFeeStudent.rollNo}/fee`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          universityFee: Number(newUnivFee),
          universityName: newUnivName,
          collegeName: newCollegeName
        })
      });

      const data = await res.json();
      if (data.success) {
        showFeedback('यूनिवर्सिटी फीस व विवरण सफलतापूर्वक अपडेट किया गया!', 'success');
        setEditFeeStudent(null);
        setRefreshTrigger(prev => prev + 1);
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

  return (
    <div className="space-y-6 text-slate-900 animate-fadeIn">
      {/* Toast Feedback Notification */}
      {feedback && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
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
              हम विभिन्न यूनिवर्सिटीज (<span className="text-amber-300 font-bold">MCBU, Barkatullah, State University</span>) के लिए एडमिशन काउंसलर हैं — छात्रों से पैकेज फीस प्राप्त कर अधिकृत यूनिवर्सिटी फीस जमा करने, बकाया भुगतान व कंसल्टेंसी मुनाफे का केंद्रीय हिसाब।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh / रीलोड</span>
            </button>
            <button
              onClick={() => {
                setShowRateModal(true);
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add University Rate</span>
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
              यूनिवर्सिटी फीस कुल देय
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
              यूनिवर्सिटी को जमा किया ({stats ? stats.totalPaymentsCount : 0} वाउचर)
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
              यूनिवर्सिटी का कुल बकाया
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
              <span>कंसल्टेंसी हाथ में शुद्ध बचत</span>
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
              कुल अनुमानित कंसल्टेंसी लाभ
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Views Selector Navigation Tabs / Dropdown */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSubView('ledger')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'ledger'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Student University Settlement Ledger (छात्र यूनिवर्सिटी लेजर)</span>
          </button>

          <button
            onClick={() => setSubView('payments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'payments'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>2. University Payment Vouchers &amp; History (भुगतान रसीदें)</span>
          </button>

          <button
            onClick={() => setSubView('rates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              subView === 'rates'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>3. University Course Fee Rates Master (यूनिवर्सिटी मानक दरें)</span>
          </button>
        </div>

        {/* Sub-view switcher dropdown for mobile */}
        <div className="text-xs font-semibold text-slate-500 shrink-0">
          {subView === 'ledger' && `Showing ${students.length} Student Records`}
          {subView === 'payments' && `Showing ${payments.length} University Payment Vouchers`}
          {subView === 'rates' && `Showing ${courseFees.length} Standard University Course Rates`}
        </div>
      </div>

      {/* FILTER CONTROLS BAR (For Ledger & Payments Views) */}
      {subView !== 'rates' && (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="छात्र का नाम, Roll No, पिता का नाम, कोर्स, आधार कार्ड या यूनिवर्सिटी सर्च करें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none placeholder:text-slate-400 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* University Filter Dropdown */}
            <div className="min-w-[240px]">
              <select
                value={selectedUniv}
                onChange={(e) => setSelectedUniv(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="ALL">🏛️ All Partner Universities (सभी यूनिवर्सिटीज)</option>
                {universities.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Dues Status Filter Dropdown (in ledger view) */}
            {subView === 'ledger' && (
              <div className="min-w-[210px]">
                <select
                  value={dueFilter}
                  onChange={(e) => setDueFilter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-sm cursor-pointer"
                >
                  <option value="all">⚡ All Students (सभी छात्र)</option>
                  <option value="due_only">⚠️ Pending University Dues (यूनिवर्सिटी को फीस देना बाकी)</option>
                  <option value="cleared">✅ Fully Cleared (यूनिवर्सिटी हिसाब चुकता)</option>
                </select>
              </div>
            )}

            {/* Reset Filters */}
            {(selectedUniv !== 'ALL' || dueFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedUniv('ALL');
                  setDueFilter('all');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center justify-center gap-1.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 1: STUDENT UNIVERSITY SETTLEMENT LEDGER */}
      {/* ======================================================== */}
      {subView === 'ledger' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-amber-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Student &amp; University Dual Ledger (छात्र पैकेज बनाम यूनिवर्सिटी देय विवरण)
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {students.length} Records Found
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-amber-600" />
              <p className="text-xs font-bold">लोड हो रहा है... कृपया प्रतीक्षा करें</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">कोई छात्र रिकॉर्ड नहीं मिला</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                चुने गए फ़िल्टर या खोज शब्दों के अनुसार कोई छात्र डेटा उपलब्ध नहीं है।
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Student &amp; Course</th>
                    <th className="py-3.5 px-4">Beneficiary University &amp; College</th>
                    <th className="py-3.5 px-4 bg-blue-50/50">Student Package (Charged)</th>
                    <th className="py-3.5 px-4 bg-amber-50/50">Official University Fee</th>
                    <th className="py-3.5 px-4 bg-emerald-50/50">Counselor Retained Margin</th>
                    <th className="py-3.5 px-4 text-center">Settlement Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((student) => {
                    const studentFee = Number(student.totalFee) || 0;
                    const studentPaid = Number(student.totalPaid) || 0;
                    const studentDue = Number(student.balanceDue) || 0;

                    const univFee = Number(student.universityFee) || 0;
                    const univPaid = Number(student.universityPaid) || 0;
                    const univDue = Number(student.universityDue) || 0;

                    const retainedMargin = studentPaid - univPaid;
                    const isFullySettled = univDue <= 0;

                    return (
                      <tr key={student.id || student.rollNo} className="hover:bg-amber-50/30 transition-colors">
                        {/* Student Details */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 text-sm block">
                              {student.fullName || student.studentName}
                            </span>
                            {student.fatherName && (
                              <span className="text-[11px] text-slate-500 block">
                                S/O: {student.fatherName}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                              <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {student.rollNo}
                              </span>
                              <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {student.currentClass || `SEM-${student.currentSemester || 1}`}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 block">
                              {student.courseName}
                            </span>
                          </div>
                        </td>

                        {/* University & College */}
                        <td className="py-4 px-4 align-top">
                          <div className="space-y-1 max-w-[200px]">
                            <div className="flex items-start gap-1 text-indigo-950 font-bold">
                              <Landmark className="w-3.5 h-3.5 shrink-0 text-amber-700 mt-0.5" />
                              <span className="leading-snug">{student.universityName || 'MCBU Chhatarpur'}</span>
                            </div>
                            {student.collegeName && (
                              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                                {student.collegeName}
                              </p>
                            )}
                            <button
                              onClick={() => handleOpenEditFeeModal(student)}
                              className="text-[10px] font-bold text-amber-700 hover:text-amber-800 underline flex items-center gap-1 pt-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Univ / Fee</span>
                            </button>
                          </div>
                        </td>

                        {/* Student Package Fee Breakdown */}
                        <td className="py-4 px-4 align-top bg-blue-50/20">
                          <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Package:</span>
                              <span className="font-bold text-slate-800">₹{studentFee.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-semibold">
                              <span>Received:</span>
                              <span>₹{studentPaid.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-rose-600 font-semibold border-t border-slate-200 pt-0.5">
                              <span>Due:</span>
                              <span>₹{studentDue.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </td>

                        {/* Official University Fee Breakdown */}
                        <td className="py-4 px-4 align-top bg-amber-50/20">
                          <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Univ Fee:</span>
                              <span className="font-bold text-amber-950">₹{univFee.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-semibold">
                              <span>Paid to Univ:</span>
                              <span>₹{univPaid.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-amber-200 pt-0.5">
                              <span className={univDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>Univ Due:</span>
                              <span className={univDue > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                                ₹{univDue.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Counselor Retained Cash Margin */}
                        <td className="py-4 px-4 align-top bg-emerald-50/20">
                          <div className="space-y-1">
                            <div className="text-sm font-black font-mono text-emerald-800">
                              ₹{retainedMargin.toLocaleString('en-IN')}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              (छात्र भुगतान - यूनिवर्सिटी भुगतान)
                            </p>
                            <span className="inline-block bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.5 rounded">
                              Margin In Hand
                            </span>
                          </div>
                        </td>

                        {/* Settlement Status */}
                        <td className="py-4 px-4 align-top text-center">
                          {isFullySettled ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Settled / चुकता
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-300">
                              <Clock className="w-3 h-3 text-amber-700" /> Due ₹{univDue.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 align-top text-center space-y-1.5">
                          <button
                            onClick={() => handleOpenPayModal(student)}
                            className="w-full flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <Landmark className="w-3.5 h-3.5" />
                            <span>+ Pay Univ</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setSearchQuery(student.rollNo);
                              setSubView('payments');
                            }}
                            className="w-full flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border border-slate-200 cursor-pointer"
                            title="View past university deposits for this student"
                          >
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>History</span>
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
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: UNIVERSITY PAYMENT HISTORY & VOUCHERS */}
      {/* ======================================================== */}
      {subView === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
              <p className="text-sm font-bold text-slate-700">कोई यूनिवर्सिटी भुगतान रिकॉर्ड नहीं मिला</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                छात्र लेजर से "Pay Univ" बटन दबाकर यूनिवर्सिटी फीस जमा करें।
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
                        <span className="text-[10px] text-slate-500">
                          {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
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
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-sm text-amber-800 font-mono">
                          ₹{Number(p.amountPaidToUniversity || p.amountPaid || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setVoucherToPrint(p)}
                          className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-amber-300 cursor-pointer shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 3: UNIVERSITY COURSE FEE RATES MASTER */}
      {/* ======================================================== */}
      {subView === 'rates' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official University Course Rate Cards (यूनिवर्सिटी मानक शुल्क दरें)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                विभिन्न विश्वविद्यालयों द्वारा ली जाने वाली आधिकारिक मूल फीस की सूची
              </p>
            </div>
            <button
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Course Rate</span>
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

      {/* ======================================================== */}
      {/* MODAL 1: PAY TO UNIVERSITY */}
      {/* ======================================================== */}
      {payModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Pay Official University Fee (यूनिवर्सिटी फीस भुगतान)
                  </h3>
                  <p className="text-xs text-slate-500">
                    यूनिवर्सिटी खाते में चालान या बैंक ट्रांसफर द्वारा फीस जमा करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayModalStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student & Univ Summary Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Student Name:</span>
                <span className="font-bold text-slate-900 uppercase">{payModalStudent.fullName} ({payModalStudent.rollNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Degree Course:</span>
                <span className="font-semibold text-slate-800">{payModalStudent.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target University:</span>
                <span className="font-bold text-indigo-900">{payModalStudent.universityName}</span>
              </div>
              <div className="flex justify-between border-t border-amber-200 pt-1.5 font-mono">
                <span className="text-slate-600 font-bold">Remaining University Due:</span>
                <span className="font-black text-rose-600 text-sm">
                  ₹{Number(payModalStudent.universityDue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4 text-xs text-slate-900 font-medium">
              {/* Amount to Pay with quick fill presets */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">
                  Amount to Pay to University (INR)*
                </label>
                <input
                  type="number"
                  required
                  placeholder="उदा. 5000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {/* Fast Fill Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {payModalStudent.universityDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setPayAmount(String(payModalStudent.universityDue))}
                      className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px] border border-amber-300 cursor-pointer"
                    >
                      Pay Full Due (₹{Number(payModalStudent.universityDue).toLocaleString('en-IN')})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPayAmount('2000')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    ₹2,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount('5000')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    ₹5,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayAmount('10000')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] cursor-pointer"
                  >
                    ₹10,000
                  </button>
                </div>
              </div>

              {/* Installment / Semester Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Paid Semester / Installment*</label>
                  <select
                    value={paidSemester}
                    onChange={(e) => setPaidSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Semester 1">Semester 1 (प्रथम सेमेस्टर)</option>
                    <option value="Semester 2">Semester 2 (द्वितीय सेमेस्टर)</option>
                    <option value="Semester 3">Semester 3 (तृतीय सेमेस्टर)</option>
                    <option value="Semester 4">Semester 4 (चतुर्थ सेमेस्टर)</option>
                    <option value="Semester 5">Semester 5 (पंचम सेमेस्टर)</option>
                    <option value="Semester 6">Semester 6 (षष्ठम सेमेस्टर)</option>
                    <option value="Examination Fee">Examination Fee (परीक्षा फीस)</option>
                    <option value="Enrollment Fee">Enrollment &amp; Registration Fee</option>
                    <option value="Annual Composite">Annual Composite University Fee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Payment Mode / माध्यम*</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Bank NEFT / RTGS">Bank NEFT / RTGS</option>
                    <option value="Bank Challan">Bank Challan (बैंक चालान)</option>
                    <option value="Net Banking">Net Banking / Portal</option>
                    <option value="DD / Cheque">DD / Cheque (डिमांड ड्राफ्ट)</option>
                    <option value="Cash">Cash (विश्वविद्यालय काउंटर)</option>
                    <option value="UPI / QR">UPI / QR Code</option>
                  </select>
                </div>
              </div>

              {/* Bank Transaction Ref / UTR */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Bank UTR / Challan No. / Ref Number (बैंक संदर्भ संख्या)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UTR202609088492 या CHALLAN-5521"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Remarks / विशेष टिप्पणी</label>
                <input
                  type="text"
                  placeholder="उदा. Paid via SBI Main Branch Chhatarpur"
                  value={paymentRemark}
                  onChange={(e) => setPaymentRemark(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayModalStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  रद्द करें / Cancel
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl font-black shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50"
                >
                  {payLoading ? (
                    <span>भुगतान सुरक्षित हो रहा है...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm &amp; Generate Voucher</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT STUDENT UNIVERSITY FEE & AFFILIATION */}
      {/* ======================================================== */}
      {editFeeStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-800">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Edit Student University Fee
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editFeeStudent.fullName} ({editFeeStudent.rollNo})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditFeeStudent(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditFeeSubmit} className="space-y-3.5 text-xs text-slate-900 font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Official Base University Fee (INR)*
                </label>
                <input
                  type="number"
                  required
                  value={newUnivFee}
                  onChange={(e) => setNewUnivFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  यह वह आधिकारिक फीस है जो काउंसलर को विश्वविद्यालय में जमा करनी है।
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Target University Name*
                </label>
                <input
                  type="text"
                  required
                  value={newUnivName}
                  onChange={(e) => setNewUnivName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">
                  Affiliated College / Center
                </label>
                <input
                  type="text"
                  value={newCollegeName}
                  onChange={(e) => setNewCollegeName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
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
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {editFeeLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADD/UPDATE STANDARD COURSE FEE RATE */}
      {/* ======================================================== */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 my-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Add University Standard Rate
                  </h3>
                  <p className="text-xs text-slate-500">
                    कोर्स के अनुसार यूनिवर्सिटी की आधिकारिक फीस दर्ज करें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRateSubmit} className="space-y-3 text-xs text-slate-900 font-medium">
              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">University Name*</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Maharaja Chhatrasal Bundelkhand University (MCBU)"
                  value={rateForm.universityName}
                  onChange={(e) => setRateForm({ ...rateForm, universityName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Course Name*</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Bachelor of Arts (BA)"
                  value={rateForm.courseName}
                  onChange={(e) => setRateForm({ ...rateForm, courseName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Official Base Fee (INR)*</label>
                  <input
                    type="number"
                    required
                    placeholder="उदा. 15000"
                    value={rateForm.officialFee}
                    onChange={(e) => setRateForm({ ...rateForm, officialFee: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold">Per Semester (INR)</label>
                  <input
                    type="number"
                    placeholder="उदा. 2500"
                    value={rateForm.feePerSemester}
                    onChange={(e) => setRateForm({ ...rateForm, feePerSemester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-700 font-bold">Notes / विवरण</label>
                <input
                  type="text"
                  placeholder="उदा. Standard MP government university rate"
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
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {rateLoading ? 'Saving...' : 'Save Rate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: OFFICIAL PRINTABLE UNIVERSITY VOUCHER */}
      {/* ======================================================== */}
      {voucherToPrint && (
        <PrintUniversityVoucher
          voucher={voucherToPrint}
          onClose={() => setVoucherToPrint(null)}
        />
      )}
    </div>
  );
}
