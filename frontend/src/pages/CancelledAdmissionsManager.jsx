import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserX, Search, Filter, RotateCcw, Printer, ArrowLeft,
  CheckCircle2, AlertCircle, Clock, DollarSign, Wallet,
  Calendar, ChevronDown, ExternalLink, Users, Trash2,
  RefreshCw, CheckCircle, AlertTriangle, FileText, Ban, Eye,
  Building2, School, CreditCard, ChevronRight, X, ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CancelledAdmissionsManager({ lang: propLang, toggleLang: propToggleLang }) {
  const context = useLanguage();
  const lang = propLang || context?.lang || 'en';
  const toggleLang = propToggleLang || context?.toggleLang;
  const isHindi = lang === 'hi';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterUniversity, setFilterUniversity] = useState('all');
  const [filterSession, setFilterSession] = useState('all');
  const [filterRefundStatus, setFilterRefundStatus] = useState('all'); // 'all', 'fully_refunded', 'partial', 'pending', 'zero'

  // Modals & Active Record
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refundModalStudent, setRefundModalStudent] = useState(null);
  const [printSlipStudent, setPrintSlipStudent] = useState(null);

  // Refund Form State
  const [refundAmount, setRefundAmount] = useState('');
  const [refundPaymentMode, setRefundPaymentMode] = useState('Cash');
  const [refundRefNo, setRefundRefNo] = useState('');
  const [refundRemarks, setRefundRemarks] = useState('');
  const [refundDate, setRefundDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Fetch all students from backend
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching cancelled students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [refreshTrigger]);

  // Filter only cancelled students
  const cancelledStudents = useMemo(() => {
    return students.filter(s => {
      const isCancelled = s.status === 'Cancelled' || s.status === 'Admission Cancelled' || s.cancel === 'Yes';
      return isCancelled && !s.isSecondaryCourse;
    });
  }, [students]);

  // Calculate top financial stats
  const financialStats = useMemo(() => {
    let totalCancelled = cancelledStudents.length;
    let totalCourseFee = 0;
    let totalDeposited = 0;
    let totalRefunded = 0;
    let totalRemaining = 0;

    cancelledStudents.forEach(s => {
      const fee = Number(s.totalFee || s.studentFee || s.courseFee || 0);
      const paid = Number(s.totalPaid || 0);
      const refunded = Number(s.refundPaid || 0);
      const remaining = Math.max(0, paid - refunded);

      totalCourseFee += fee;
      totalDeposited += paid;
      totalRefunded += refunded;
      totalRemaining += remaining;
    });

    return {
      totalCancelled,
      totalCourseFee,
      totalDeposited,
      totalRefunded,
      totalRemaining
    };
  }, [cancelledStudents]);

  // Filter and search logic
  const filteredList = useMemo(() => {
    const q = (search || '').trim().toLowerCase();

    return cancelledStudents.filter(s => {
      // University filter
      if (filterUniversity !== 'all') {
        const u = (s.universityName || s.collegeName || '').toLowerCase();
        if (!u.includes(filterUniversity.toLowerCase())) return false;
      }

      // Session filter
      if (filterSession !== 'all') {
        const sess = s.currentSession || s.admissionSession || '';
        if (sess !== filterSession) return false;
      }

      // Refund status filter
      const paid = Number(s.totalPaid || 0);
      const refunded = Number(s.refundPaid || 0);
      const remaining = Math.max(0, paid - refunded);

      if (filterRefundStatus === 'fully_refunded') {
        if (paid <= 0 || remaining > 0) return false;
      } else if (filterRefundStatus === 'partial') {
        if (refunded <= 0 || remaining <= 0) return false;
      } else if (filterRefundStatus === 'pending') {
        if (paid <= 0 || refunded > 0) return false;
      } else if (filterRefundStatus === 'zero') {
        if (paid > 0) return false;
      }

      // Text search
      if (!q) return true;
      const nameMatch = (s.fullName || s.studentName || '').toLowerCase().includes(q);
      const rollMatch = (s.rollNo || s.enrollmentNo || s.registrationNo || '').toLowerCase().includes(q);
      const phoneMatch = (s.phone || s.contact || '').toLowerCase().includes(q);
      const fatherMatch = (s.fatherName || s.father_name || '').toLowerCase().includes(q);
      const courseMatch = (s.courseName || '').toLowerCase().includes(q);
      const reasonMatch = (s.cancellationReason || '').toLowerCase().includes(q);

      return nameMatch || rollMatch || phoneMatch || fatherMatch || courseMatch || reasonMatch;
    });
  }, [cancelledStudents, search, filterUniversity, filterSession, filterRefundStatus]);

  // Unique lists for filters
  const universitiesList = useMemo(() => {
    const set = new Set();
    cancelledStudents.forEach(s => {
      if (s.universityName) set.add(s.universityName);
    });
    return Array.from(set);
  }, [cancelledStudents]);

  const sessionsList = useMemo(() => {
    const set = new Set();
    cancelledStudents.forEach(s => {
      const sess = s.currentSession || s.admissionSession;
      if (sess) set.add(sess);
    });
    return Array.from(set);
  }, [cancelledStudents]);

  // Handle Restore Admission
  const handleRestoreAdmission = async (student) => {
    const roll = student.rollNo || student.enrollmentNo || student.id;
    if (!window.confirm(`Are you sure you want to restore the admission for ${student.fullName || roll} back to Active Enrollment?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/students/${encodeURIComponent(roll)}/restore-admission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restoredBy: 'Admin' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to restore admission');
      }

      alert(`Student ${student.fullName} has been restored! They will now appear in the active Enrolled Students list.`);
      setRefreshTrigger(prev => prev + 1);
      if (selectedStudent?.id === student.id || selectedStudent?.rollNo === student.rollNo) {
        setSelectedStudent(null);
      }
    } catch (err) {
      alert(err.message || 'Error restoring admission');
    }
  };

  // Open Refund Modal
  const handleOpenRefundModal = (student) => {
    setRefundModalStudent(student);
    const paid = Number(student.totalPaid || 0);
    const alreadyRefunded = Number(student.refundPaid || 0);
    const remaining = Math.max(0, paid - alreadyRefunded);
    setRefundAmount(remaining > 0 ? String(remaining) : '');
    setRefundPaymentMode('Cash');
    setRefundRefNo(`REF-${Date.now().toString().slice(-6)}`);
    setRefundRemarks(`Refund settlement for cancelled admission of ${student.fullName || student.rollNo}`);
    setRefundDate(new Date().toISOString().split('T')[0]);
  };

  // Submit Refund Payment
  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!refundModalStudent) return;
    const roll = refundModalStudent.rollNo || refundModalStudent.enrollmentNo || refundModalStudent.id;
    const amt = Number(refundAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid refund amount greater than 0');
      return;
    }

    try {
      setIsSubmittingRefund(true);
      const res = await fetch(`/api/students/${encodeURIComponent(roll)}/record-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          paymentMode: refundPaymentMode,
          referenceNo: refundRefNo,
          remarks: refundRemarks,
          date: refundDate,
          recordedBy: 'Admin'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to record refund payment');
      }

      alert(`Refund of ₹${amt.toLocaleString('en-IN')} successfully recorded!`);
      setRefundModalStudent(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      alert(err.message || 'Error recording refund');
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-3xl border border-rose-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border-2 border-rose-400/40 flex items-center justify-center font-black shadow-inner shrink-0">
            <UserX className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-md border border-rose-400/30">
                Desk 08 • Audit &amp; Settlement
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                {cancelledStudents.length} Records Cancelled
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Cancelled Admissions &amp; Fee Settlement Registry (रद्द प्रवेश व फीस विवरण)
            </h1>
            <p className="text-xs text-rose-200/90 mt-0.5">
              Comprehensive ledger of students whose admission was cancelled, their deposited fees, refunds issued, and remaining balance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            type="button"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/15 transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards (Total Cancelled, Fees Deposited, Refunded Back, Balance Due) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cancelled */}
        <div className="p-5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Cancelled Students
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {financialStats.totalCancelled}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">
              Archived from active admissions
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
            <UserX className="w-6 h-6 text-slate-600" />
          </div>
        </div>

        {/* Card 2: Total Fees Deposited by these students */}
        <div className="p-5 rounded-2xl bg-white border-2 border-emerald-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Total Fees Deposited (छात्रों की जमा फीस)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1 block">
              ₹{financialStats.totalDeposited.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">
              Collected prior to cancellation
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-200">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Amount Refunded / Paid Back */}
        <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider block">
              Fees Refunded / Paid (वापस की गई फीस)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-900 mt-1 block">
              ₹{financialStats.totalRefunded.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-indigo-700 block mt-0.5 font-medium">
              Disbursed to students
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black border border-indigo-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Remaining Balance to Settle */}
        <div className="p-5 rounded-2xl bg-white border-2 border-rose-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              Pending Refund / Balance (शेष बचा रिफंड)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-rose-900 mt-1 block">
              ₹{financialStats.totalRemaining.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-rose-700 block mt-0.5 font-medium">
              Outstanding clearance balance
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black border border-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll, mobile, reason..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* University Filter */}
          <select
            value={filterUniversity}
            onChange={(e) => setFilterUniversity(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:bg-white text-xs max-w-[200px]"
          >
            <option value="all">All Universities (सभी यूनिवर्सिटी)</option>
            {universitiesList.map((u, i) => (
              <option key={i} value={u}>{u}</option>
            ))}
          </select>

          {/* Session Filter */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-700 focus:bg-white text-xs"
          >
            <option value="all">All Sessions (सभी सत्र)</option>
            {sessionsList.map((s, i) => (
              <option key={i} value={s}>{s}</option>
            ))}
          </select>

          {/* Refund Status Filter */}
          <select
            value={filterRefundStatus}
            onChange={(e) => setFilterRefundStatus(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white text-xs"
          >
            <option value="all">All Statuses (सभी स्थितियाँ)</option>
            <option value="pending">Pending Refund (रिफंड बाकी)</option>
            <option value="partial">Partial Refund (आंशिक रिफंड)</option>
            <option value="fully_refunded">100% Fully Settled (पूर्ण भुगतान)</option>
            <option value="zero">No Fee Paid (कोई फीस नहीं)</option>
          </select>
        </div>
      </div>

      {/* Main Table of Cancelled Students */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Cancelled Student Records ({filteredList.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Showing {filteredList.length} of {cancelledStudents.length} cancelled admission(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center border-r border-slate-800 w-12">#</th>
                <th className="py-3 px-3 border-r border-slate-800">Student Identity &amp; Contact</th>
                <th className="py-3 px-3 border-r border-slate-800">Enrolled Institution &amp; Course</th>
                <th className="py-3 px-3 border-r border-slate-800">Cancellation Info</th>
                <th className="py-3 px-3 border-r border-slate-800 text-right">Total Course Fee</th>
                <th className="py-3 px-3 border-r border-slate-800 text-right bg-emerald-950/70 text-emerald-300">Fees Deposited</th>
                <th className="py-3 px-3 border-r border-slate-800 text-right bg-indigo-950/70 text-indigo-300">Refunded / Paid</th>
                <th className="py-3 px-3 border-r border-slate-800 text-right bg-rose-950/70 text-rose-300">Balance Due</th>
                <th className="py-3 px-3 border-r border-slate-800 text-center">Refund Status</th>
                <th className="py-3 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400 font-bold">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                    Loading cancelled admissions...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="10" className="py-12 text-center text-slate-400">
                    <UserX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600 text-sm">No Cancelled Admissions Found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {search || filterUniversity !== 'all' || filterRefundStatus !== 'all'
                        ? 'Try clearing the search or changing your filter criteria.'
                        : 'Currently there are no cancelled student admission records in the database.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((std, idx) => {
                  const courseFee = Number(std.totalFee || std.studentFee || std.courseFee || 0);
                  const paid = Number(std.totalPaid || 0);
                  const refunded = Number(std.refundPaid || 0);
                  const remaining = Math.max(0, paid - refunded);

                  let statusBadge = null;
                  if (paid <= 0) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                        No Fee Paid
                      </span>
                    );
                  } else if (remaining === 0) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fully Settled
                      </span>
                    );
                  } else if (refunded > 0) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" /> Partial Refund
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Pending Refund
                      </span>
                    );
                  }

                  return (
                    <tr key={std.id || std.rollNo || idx} className="hover:bg-rose-50/40 transition-colors">
                      {/* S.No */}
                      <td className="py-3 px-2 text-center font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-12 rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                            {std.studentImage || std.photo || std.documents?.student_image || std.documents?.photo ? (
                              <img 
                                src={std.studentImage || std.photo || std.documents?.student_image || std.documents?.photo} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <Users className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 uppercase block truncate">
                              {std.fullName || std.studentName}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              Father: <strong className="text-slate-700">{std.fatherName || std.father_name || '-'}</strong>
                            </span>
                            <span className="text-[10px] text-indigo-700 font-mono font-bold block truncate">
                              Roll: {std.rollNo || 'N/A'} • {std.phone || std.contact || 'No Phone'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Institution & Course */}
                      <td className="py-2.5 px-3 border-r border-slate-200 min-w-[180px]">
                        <span className="font-bold text-slate-900 block truncate">
                          🎓 {std.courseName}
                        </span>
                        <span className="text-[10px] text-slate-600 block truncate">
                          {std.universityName}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {std.collegeName}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          Session: {std.currentSession || std.admissionSession || '2025-2026'} ({std.currentSatra || std.admissionSatra || 'July'})
                        </span>
                      </td>

                      {/* Cancellation Details */}
                      <td className="py-2.5 px-3 border-r border-slate-200 min-w-[170px]">
                        <span className="font-bold text-rose-700 flex items-center gap-1">
                          <Ban className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>{std.cancellationDate || 'Date Not Recorded'}</span>
                        </span>
                        <span className="text-[11px] text-slate-700 font-semibold block mt-0.5 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 truncate" title={std.cancellationReason || 'Discontinued'}>
                          Reason: {std.cancellationReason || 'Discontinued'}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          By: {std.cancelledBy || 'Admin'}
                        </span>
                      </td>

                      {/* Total Course Fee */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-800">
                        ₹{courseFee.toLocaleString('en-IN')}
                      </td>

                      {/* Fees Deposited */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-emerald-800 bg-emerald-50/40">
                        ₹{paid.toLocaleString('en-IN')}
                      </td>

                      {/* Refunded / Paid */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-indigo-900 bg-indigo-50/40">
                        ₹{refunded.toLocaleString('en-IN')}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-rose-900 bg-rose-50/50">
                        ₹{remaining.toLocaleString('en-IN')}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-2 text-center border-r border-slate-200 whitespace-nowrap">
                        {statusBadge}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Record Refund Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenRefundModal(std)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-2xs transition cursor-pointer"
                            title="Record Refund Payment to this student"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Refund</span>
                          </button>

                          {/* Restore Admission Button */}
                          <button
                            type="button"
                            onClick={() => handleRestoreAdmission(std)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                            title="Restore this student back to Active Admissions"
                          >
                            <RotateCcw className="w-3 h-3 text-emerald-600" />
                            <span>Restore</span>
                          </button>

                          {/* Print Slip Button */}
                          <button
                            type="button"
                            onClick={() => setPrintSlipStudent(std)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                            title="Print Cancellation &amp; Refund Voucher"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* View Full Ledger Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(std)}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                            title="View Full Student Cancellation Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      {/* ========================================================================= */}
      {/* RECORD REFUND MODAL */}
      {/* ========================================================================= */}
      {refundModalStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-indigo-200 my-auto animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center font-black">
                  <CreditCard className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white">
                    Record Fee Refund Payment (रिफंड दर्ज करें)
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Disburse refund payment to student and update balance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundModalStudent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="p-6 space-y-4 text-xs">
              {/* Student Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 uppercase">
                    {refundModalStudent.fullName || refundModalStudent.studentName}
                  </span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    Roll: {refundModalStudent.rollNo || 'N/A'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  🎓 {refundModalStudent.courseName} • {refundModalStudent.collegeName}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Deposited</span>
                    <strong className="text-emerald-700 font-bold">₹{Number(refundModalStudent.totalPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Already Paid</span>
                    <strong className="text-indigo-800 font-bold">₹{Number(refundModalStudent.refundPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Remaining Due</span>
                    <strong className="text-rose-700 font-bold">₹{Math.max(0, Number(refundModalStudent.totalPaid || 0) - Number(refundModalStudent.refundPaid || 0)).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Refund Form Inputs */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Refund Amount to Pay (रिफंड राशि ₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, Number(refundModalStudent.totalPaid || 0) - Number(refundModalStudent.refundPaid || 0))}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Mode</label>
                  <select
                    value={refundPaymentMode}
                    onChange={(e) => setRefundPaymentMode(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Cash">Cash (नकद)</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="UPI / Online">UPI / QR Code</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={refundDate}
                    onChange={(e) => setRefundDate(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Transaction / Reference No</label>
                <input
                  type="text"
                  value={refundRefNo}
                  onChange={(e) => setRefundRefNo(e.target.value)}
                  placeholder="UTR / Cash Receipt No"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Remarks / Settlement Notes</label>
                <input
                  type="text"
                  value={refundRemarks}
                  onChange={(e) => setRefundRemarks(e.target.value)}
                  placeholder="e.g. Cleared via desk cashier"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRefundModalStudent(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRefund}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmittingRefund ? 'Recording...' : 'Submit Refund Payment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED VIEW MODAL */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto animate-fadeIn">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  Cancelled Admission Dossier
                </span>
                <h3 className="text-lg font-black uppercase">
                  {selectedStudent.fullName || selectedStudent.studentName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-slate-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">Father's Name</span>
                  <strong className="text-slate-900 font-bold">{selectedStudent.fatherName || '-'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Contact Phone</span>
                  <strong className="text-slate-900 font-mono">{selectedStudent.phone || selectedStudent.contact || '-'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Roll / Enrollment</span>
                  <strong className="text-indigo-800 font-mono">{selectedStudent.rollNo || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Course Name</span>
                  <strong className="text-slate-900">{selectedStudent.courseName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">University</span>
                  <strong className="text-slate-900 truncate block">{selectedStudent.universityName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Affiliated College</span>
                  <strong className="text-slate-900 truncate block">{selectedStudent.collegeName}</strong>
                </div>
              </div>

              {/* Cancellation Reason Box */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                  Cancellation Details
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span><strong>Date of Cancellation:</strong> {selectedStudent.cancellationDate || 'N/A'}</span>
                  <span><strong>Cancelled By:</strong> {selectedStudent.cancelledBy || 'Admin'}</span>
                </div>
                <div className="text-xs pt-1 border-t border-rose-200/60">
                  <strong>Reason:</strong> {selectedStudent.cancellationReason || 'Discontinued'}
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div>
                <h4 className="font-extrabold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                  Financial Settlement Breakdown (फीस व रिफंड स्थिति)
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Course Fee</span>
                    <strong className="text-xs font-bold text-slate-900">₹{Number(selectedStudent.totalFee || selectedStudent.studentFee || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 block">Total Deposited</span>
                    <strong className="text-xs font-black text-emerald-900">₹{Number(selectedStudent.totalPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                    <span className="text-[10px] text-indigo-800 block">Refunded to Date</span>
                    <strong className="text-xs font-black text-indigo-900">₹{Number(selectedStudent.refundPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-800 block">Remaining Due</span>
                    <strong className="text-xs font-black text-rose-900">₹{Math.max(0, Number(selectedStudent.totalPaid || 0) - Number(selectedStudent.refundPaid || 0)).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Refund History Log */}
              {Array.isArray(selectedStudent.refundHistory) && selectedStudent.refundHistory.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-slate-900 mb-2 uppercase tracking-wider text-[11px]">
                    Refund Payment History Logs
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2">Date</th>
                          <th className="p-2">Amount</th>
                          <th className="p-2">Mode</th>
                          <th className="p-2">Ref No</th>
                          <th className="p-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedStudent.refundHistory.map((h, i) => (
                          <tr key={i}>
                            <td className="p-2">{h.date}</td>
                            <td className="p-2 font-mono font-bold text-emerald-800">₹{Number(h.amount).toLocaleString('en-IN')}</td>
                            <td className="p-2">{h.paymentMode}</td>
                            <td className="p-2 font-mono">{h.referenceNo || '-'}</td>
                            <td className="p-2 text-slate-600">{h.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenRefundModal(selectedStudent);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Record Refund</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRestoreAdmission(selectedStudent)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore to Active</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINTABLE CANCELLATION & REFUND VOUCHER MODAL */}
      {/* ========================================================================= */}
      {printSlipStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider">
                Admission Cancellation &amp; Refund Settlement Slip
              </span>
              <button
                type="button"
                onClick={() => setPrintSlipStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Printable Content */}
            <div className="border-2 border-slate-300 p-5 rounded-2xl space-y-4 text-xs font-sans text-slate-900" id="print-cancel-slip">
              <div className="text-center border-b pb-3">
                <h2 className="text-base font-black uppercase text-slate-900">
                  {printSlipStudent.collegeName || 'PKC EDUCATION & CONSULTANCY'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Affiliated to: {printSlipStudent.universityName}
                </p>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-rose-100 text-rose-900 font-extrabold text-[10px] uppercase border border-rose-300">
                  Official Admission Cancellation Clearance
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Student Full Name:</strong> {printSlipStudent.fullName}</div>
                <div><strong>Roll / Enrollment:</strong> {printSlipStudent.rollNo || 'N/A'}</div>
                <div><strong>Father's Name:</strong> {printSlipStudent.fatherName || '-'}</div>
                <div><strong>Contact Phone:</strong> {printSlipStudent.phone || printSlipStudent.contact || '-'}</div>
                <div><strong>Enrolled Course:</strong> {printSlipStudent.courseName}</div>
                <div><strong>Session:</strong> {printSlipStudent.currentSession || printSlipStudent.admissionSession || '2025-2026'}</div>
                <div><strong>Cancellation Date:</strong> {printSlipStudent.cancellationDate || 'N/A'}</div>
                <div><strong>Cancellation Reason:</strong> {printSlipStudent.cancellationReason || 'Student Discontinued'}</div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300">
                <h4 className="font-extrabold text-slate-900 text-xs mb-2 uppercase">Financial Settlement Summary</h4>
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Deposited</span>
                    <strong className="text-emerald-800 font-mono text-sm block">₹{Number(printSlipStudent.totalPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Refund Paid</span>
                    <strong className="text-indigo-900 font-mono text-sm block">₹{Number(printSlipStudent.refundPaid || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Remaining Due</span>
                    <strong className="text-rose-900 font-mono text-sm block">₹{Math.max(0, Number(printSlipStudent.totalPaid || 0) - Number(printSlipStudent.refundPaid || 0)).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between text-[10px] text-slate-500">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Student / Guardian Signature</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Authorized Accounts Officer</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPrintSlipStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
