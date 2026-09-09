import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Filter, 
  Printer, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Receipt,
  X,
  Wallet,
  Building,
  ArrowLeft,
  Edit3,
  Lock,
  ShieldCheck,
  RotateCcw,
  Calendar,
  History,
  UserCheck,
  Clock,
  ChevronDown
} from 'lucide-react';
import PrintFeeReceipt from '../components/PrintFeeReceipt';

export default function AccountsDashboard({ preSelectedStudent, isAdmin = false, staffUser }) {
  const [stats, setStats] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Active Accounts Sub-View: 'ledger' (Student Accounts & Dues) vs 'collections' (Timeframe Collections)
  const [activeAccountsView, setActiveAccountsView] = useState('ledger');

  // Due Filter for Ledger
  const [dueFilter, setDueFilter] = useState('all'); // 'all', 'due_only', 'sem_due_only', 'cleared'
  const [ledgerSummary, setLedgerSummary] = useState(null);

  // Timeframe Collection State
  const [feeTimeframe, setFeeTimeframe] = useState('this_month'); // 'all', 'week', 'this_month', 'last_month', 'year'
  const [paymentsData, setPaymentsData] = useState({ payments: [], totalCollected: 0, transactionCount: 0, uniqueStudentsCount: 0, summary: null });
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');

  // Payment Collection Modal
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [payStudent, setPayStudent] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [feeType, setFeeType] = useState('Tuition / Semester Fee (सेमेस्टर / ट्यूशन फीस)');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [paidFor, setPaidFor] = useState('Semester Tuition Fee Installment');
  const [receivedBy, setReceivedBy] = useState(() => {
    if (staffUser) return `${staffUser.name} (${staffUser.role || 'Cashier'})`;
    return isAdmin ? 'Institute Admin' : 'Accounts Desk';
  });

  useEffect(() => {
    if (staffUser) {
      setReceivedBy(`${staffUser.name} (${staffUser.role || 'Cashier'})`);
    }
  }, [staffUser]);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);

  // Admin Fee Adjustment Modal (Only accessible by Admin)
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustStudent, setAdjustStudent] = useState(null);
  const [adjustTotalFee, setAdjustTotalFee] = useState('');
  const [adjustTotalPaid, setAdjustTotalPaid] = useState('');
  const [adjustReason, setAdjustReason] = useState('Corrected cashier data entry typo');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState(null);
  const [adjustSuccess, setAdjustSuccess] = useState(null);

  // Print Receipt Modal
  const [receiptToPrint, setReceiptToPrint] = useState(null);

  const fetchAccountsData = async (customSearch = null, customStatus = null, customDue = null) => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/fees/stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const s = customSearch !== null ? customSearch : searchTerm;
      const st = customStatus !== null ? customStatus : statusFilter;
      const df = customDue !== null ? customDue : dueFilter;

      let ledgerUrl = `/api/fees/ledger?status=${st}&dueFilter=${df}`;
      if (s && s.trim()) ledgerUrl += `&search=${encodeURIComponent(s.trim())}`;
      const ledgerRes = await fetch(ledgerUrl);
      const ledgerData = await ledgerRes.json();
      if (ledgerData.success) {
        setLedger(ledgerData.ledger || []);
        if (ledgerData.summary) setLedgerSummary(ledgerData.summary);
      }
    } catch (err) {
      console.error('Error fetching accounts data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsData = async (customTimeframe = null, customSearch = null) => {
    setPaymentsLoading(true);
    try {
      const tf = customTimeframe !== null ? customTimeframe : feeTimeframe;
      const s = customSearch !== null ? customSearch : paymentSearch;

      let url = `/api/fees/payments?timeframe=${tf}`;
      if (s && s.trim()) url += `&search=${encodeURIComponent(s.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPaymentsData(data);
      }
    } catch (err) {
      console.error('Error fetching payments data:', err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [statusFilter, dueFilter]);

  useEffect(() => {
    fetchPaymentsData();
  }, [feeTimeframe]);

  const handleResetLedgerSearch = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDueFilter('all');
    fetchAccountsData('', 'all', 'all');
  };

  const handleResetPaymentSearch = () => {
    setPaymentSearch('');
    fetchPaymentsData(feeTimeframe, '');
  };

  useEffect(() => {
    if (preSelectedStudent) {
      handleOpenCollectModal(preSelectedStudent);
    }
  }, [preSelectedStudent]);

  const handleFeeTypeChange = (type) => {
    setFeeType(type);
    if (!payStudent) return;
    if (type.startsWith('Registration')) {
      setPaidFor('Admission / Registration Fee');
    } else if (type.startsWith('Examination')) {
      setPaidFor(`Semester ${payStudent.currentSemester || 1} Examination Fee`);
    } else if (type.startsWith('Re-Exam')) {
      setPaidFor('Re-Exam / ATKT Backlog Fee');
    } else if (type.startsWith('Final')) {
      setPaidFor('Final Course Fee Complete Settlement');
    } else if (type.startsWith('Late')) {
      setPaidFor('Late Fee / Delay Fine Penalty');
    } else if (type.startsWith('Tuition')) {
      setPaidFor(`Semester ${payStudent.currentSemester || 1} Tuition Fee Installment`);
    } else {
      setPaidFor('Miscellaneous Academic Fee');
    }
  };

  const handleOpenCollectModal = (std) => {
    setPayStudent(std);
    const suggested = (std.currentSemesterDue && std.currentSemesterDue > 0)
      ? std.currentSemesterDue
      : (std.balanceDue || '');
    setPayAmount(suggested ? String(suggested) : '');
    setFeeType('Tuition / Semester Fee (सेमेस्टर / ट्यूशन फीस)');
    setPaymentMode('Cash');
    setTransactionRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaidFor(`Semester ${std.currentSemester || 1} Tuition Fee Installment`);
    if (staffUser) {
      setReceivedBy(`${staffUser.name} (${staffUser.role || 'Cashier Desk'})`);
    } else if (isAdmin) {
      setReceivedBy('Institute Admin');
    } else {
      setReceivedBy('Accounts Desk');
    }
    setPayError(null);
    setShowCollectModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payStudent || !payAmount || Number(payAmount) <= 0) {
      setPayError('Please enter a valid payment amount.');
      return;
    }

    setPayLoading(true);
    setPayError(null);

    try {
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: payStudent.rollNo,
          amount: Number(payAmount),
          feeType: feeType,
          paymentMode: paymentMode,
          transactionRef: transactionRef,
          paidFor: paidFor,
          receivedBy: receivedBy
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment submission failed.');
      }

      setShowCollectModal(false);
      setReceiptToPrint(data.receipt);
      fetchAccountsData(); // Refresh ledger & stats
      fetchPaymentsData(); // Refresh timeframe payments
    } catch (err) {
      setPayError(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  const handleOpenAdjustModal = (std) => {
    setAdjustStudent(std);
    setAdjustTotalFee(std.totalFee || 0);
    setAdjustTotalPaid(std.totalPaid || 0);
    setAdjustReason('Corrected cashier entry mistake / typo');
    setAdjustError(null);
    setAdjustSuccess(null);
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustStudent) return;
    setAdjustLoading(true);
    setAdjustError(null);
    setAdjustSuccess(null);

    try {
      const res = await fetch(`/api/fees/student/${adjustStudent.rollNo}/adjust`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalFee: Number(adjustTotalFee),
          totalPaid: Number(adjustTotalPaid),
          adjustmentReason: adjustReason,
          adminUser: 'Admin'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update fee record.');
      }

      setAdjustSuccess(data.message);
      fetchAccountsData(); // Live refresh stats and ledger
      fetchPaymentsData(); // Live refresh timeframe payments
      setTimeout(() => {
        setShowAdjustModal(false);
        setAdjustSuccess(null);
      }, 1500);
    } catch (err) {
      setAdjustError(err.message);
    } finally {
      setAdjustLoading(false);
    }
  };

  const calculatedNewBalance = payStudent 
    ? Math.max(0, (payStudent.balanceDue || 0) - (Number(payAmount) || 0))
    : 0;

  const calculatedAdjustBalance = Math.max(0, (Number(adjustTotalFee) || 0) - (Number(adjustTotalPaid) || 0));

  return (
    <div className="w-full space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Finance & Accounts Division
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Student Fee Management & Accounts Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Real-time student fee ledger, remaining dues calculation, installment collection, and official receipt generation.
          </p>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expected Fees</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{Number(stats?.totalExpectedFee || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400">Across {stats?.totalStudents || 0} enrolled students</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-sm space-y-2 bg-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Fees Collected</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700">
            ₹{Number(stats?.totalCollectedFee || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Deposited in University Treasury</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-rose-200 shadow-sm space-y-2 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Total Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-700">
            ₹{Number(stats?.totalBalanceDue || 0).toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-rose-600 font-medium">Pending balance to collect</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-emerald-700 font-bold">{stats?.fullyPaidCount || 0} Fully Paid</span>
            <span className="text-amber-700 font-bold">{stats?.partialPaidCount || 0} Partial</span>
            <span className="text-rose-700 font-bold">{stats?.unpaidCount || 0} Unpaid</span>
          </div>
        </div>

      </div>

      {/* Accounts Control Bar: Section Dropdown + Contextual Filter Dropdown */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Accounts View Mode Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Accounts View (खाता अनुभाग):</span>
          </label>
          <div className="relative min-w-[280px] sm:min-w-[340px]">
            <select
              value={activeAccountsView}
              onChange={(e) => {
                const val = e.target.value;
                setActiveAccountsView(val);
                if (val === 'collections' && paymentsData.payments.length === 0) {
                  fetchPaymentsData();
                }
              }}
              className="w-full appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 font-extrabold text-xs text-slate-800 py-2.5 pl-3.5 pr-9 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer shadow-2xs"
            >
              <option value="ledger">
                💳 Student Accounts & Dues Ledger (छात्र फीस व बकाया सूची)
              </option>
              <option value="collections">
                📈 Timeframe Fee Collections (अवधि अनुसार फीस कलेक्शन)
              </option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Right: Contextual Filter Dropdown based on active sub-view */}
        <div className="flex flex-wrap items-center gap-3">
          {activeAccountsView === 'ledger' ? (
            /* Dues Filter Dropdown */
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-rose-600" />
                <span>Dues Filter (बकाया फ़िल्टर):</span>
              </label>
              <div className="relative min-w-[240px] sm:min-w-[280px] flex-1 sm:flex-initial">
                <select
                  value={dueFilter}
                  onChange={(e) => setDueFilter(e.target.value)}
                  className={`w-full appearance-none border font-extrabold text-xs py-2.5 pl-3.5 pr-9 rounded-2xl focus:outline-none cursor-pointer shadow-2xs ${
                    dueFilter === 'due_only'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : dueFilter === 'sem_due_only'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : dueFilter === 'cleared'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="all">
                    📋 All Students ({stats?.totalStudents || ledger.length})
                  </option>
                  <option value="due_only">
                    ⚠️ Only Due Students (बाकी फीस - {(stats?.partialPaidCount || 0) + (stats?.unpaidCount || 0)})
                  </option>
                  <option value="sem_due_only">
                    ⚡ Current Sem Due (चालू सेमेस्टर बकाया)
                  </option>
                  <option value="cleared">
                    ✓ Fully Paid Cleared (पूर्ण चुकता - {stats?.fullyPaidCount || 0})
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>

              {dueFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setDueFilter('all')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-slate-200"
                  title="Reset Dues Filter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          ) : (
            /* Timeframe Collection Period Dropdown */
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Collection Period (अवधि चुनें):</span>
              </label>
              <div className="relative min-w-[260px] sm:min-w-[310px] flex-1 sm:flex-initial">
                <select
                  value={feeTimeframe}
                  onChange={(e) => setFeeTimeframe(e.target.value)}
                  className={`w-full appearance-none border font-extrabold text-xs py-2.5 pl-3.5 pr-9 rounded-2xl focus:outline-none cursor-pointer shadow-2xs ${
                    feeTimeframe === 'last_month'
                      ? 'bg-purple-50 border-purple-300 text-purple-900'
                      : feeTimeframe === 'this_month'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : feeTimeframe === 'week'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                      : feeTimeframe === 'year'
                      ? 'bg-amber-50 border-amber-300 text-amber-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="this_month">
                    🗓️ This Month (इस महीने - Sept) [₹{(paymentsData.summary?.this_month?.totalAmount || 0).toLocaleString('en-IN')}]
                  </option>
                  <option value="last_month">
                    ⏮️ Last Month (पिछला महीना - Aug) [₹{(paymentsData.summary?.last_month?.totalAmount || 0).toLocaleString('en-IN')}]
                  </option>
                  <option value="week">
                    ⚡ This Week (इस हफ्ते) [₹{(paymentsData.summary?.week?.totalAmount || 0).toLocaleString('en-IN')}]
                  </option>
                  <option value="year">
                    📆 This Year (इस साल - 2026) [₹{(paymentsData.summary?.year?.totalAmount || 0).toLocaleString('en-IN')}]
                  </option>
                  <option value="all">
                    🌐 All Time (कुल कलेक्शन) [₹{(paymentsData.summary?.all?.totalAmount || paymentsData.totalCollected || 0).toLocaleString('en-IN')}]
                  </option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>

              {feeTimeframe !== 'this_month' && (
                <button
                  type="button"
                  onClick={() => setFeeTimeframe('this_month')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-slate-200"
                  title="Reset to This Month"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STUDENT ACCOUNTS & OUTSTANDING DUES LEDGER */}
      {/* ========================================================================= */}
      {activeAccountsView === 'ledger' && (
        <div className="space-y-6 animate-fadeIn">

          {/* Due Summary Highlight Ribbon */}
          {dueFilter === 'due_only' && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">
                    Total Outstanding Balance Due: ₹{Number(ledgerSummary?.totalBalanceDue || stats?.totalBalanceDue || 0).toLocaleString('en-IN')}
                  </h4>
                  <p className="text-rose-700 text-[11px]">
                    Pending collection from <strong className="font-bold">{ledger.length}</strong> students. Current Semester Dues: <strong className="font-bold">₹{Number(ledgerSummary?.totalSemesterDue || 0).toLocaleString('en-IN')}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleResetLedgerSearch()}
                className="text-xs font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer"
              >
                ← View All Students
              </button>
            </div>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search student fee ledger by Roll No, Name, Father's Name, Aadhaar or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAccountsData()}
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleResetLedgerSearch}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
              >
                <option value="all">All Fee Status</option>
                <option value="Fully Paid">Fully Paid</option>
                <option value="Partial">Partial Dues (Installment)</option>
                <option value="Unpaid">Unpaid Dues</option>
              </select>
            </div>

            <div className="sm:col-span-1 flex items-center gap-1.5">
              <button
                onClick={() => fetchAccountsData()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
              >
                Search
              </button>
              {(searchTerm || statusFilter !== 'all' || dueFilter !== 'all') && (
                <button
                  onClick={handleResetLedgerSearch}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition-colors border border-slate-200"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Student Fee Ledger Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Student Fee Accounts &amp; Dues Directory</h3>
                <p className="text-xs text-slate-400">
                  {dueFilter === 'due_only' 
                    ? 'Showing only students with outstanding pending dues and their exact balance amounts' 
                    : 'Showing all enrolled students linked with central admission & accounts database'}
                </p>
              </div>
              <div className="text-xs font-bold text-slate-700">
                Total Due in View: <span className="text-rose-700 font-extrabold text-sm">₹{Number(ledger.reduce((acc, s) => acc + (s.balanceDue || 0), 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Roll No</th>
                    <th className="p-3 whitespace-nowrap">Student Name</th>
                    <th className="p-3 whitespace-nowrap">College Name</th>
                    <th className="p-3 whitespace-nowrap">Course Enrolled</th>
                    <th className="p-3 text-center whitespace-nowrap">Semester / Class</th>
                    <th className="p-3 whitespace-nowrap">Semester Fee Due</th>
                    <th className="p-3 whitespace-nowrap">Fee Paid / Total</th>
                    <th className="p-3 whitespace-nowrap">Remaining Balance</th>
                    <th className="p-3 whitespace-nowrap">Status</th>
                    <th className="p-3 text-center sticky right-0 bg-slate-900 z-20 shadow-[-6px_0_12px_rgba(0,0,0,0.35)] min-w-[145px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">Loading fee records...</td>
                    </tr>
                  ) : ledger.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">
                        <div className="max-w-md mx-auto space-y-3">
                          <p className="font-bold text-slate-700 text-sm">No student fee records found matching this filter.</p>
                          <button
                            onClick={handleResetLedgerSearch}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer"
                          >
                            ← Back to All Fee Accounts
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ledger.map((std) => (
                      <tr key={std.id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {std.rollNo}
                          {std.aadhaarNo && (
                            <span className="block text-[9px] text-slate-400 font-mono font-normal">Aadhaar: {std.aadhaarNo}</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 uppercase">
                          {std.fullName}
                          {std.fatherName && (
                            <span className="block text-[10px] text-slate-400 font-normal capitalize">Father: {std.fatherName}</span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-normal">{std.phone}</span>
                        </td>
                        <td className="p-3 text-slate-700">
                          <span className="font-semibold text-slate-800 block text-[11px] max-w-[150px] truncate leading-tight" title={std.collegeName || 'PKC Education Institute'}>
                            {std.collegeName || 'PKC Education Institute'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">
                          <span className="font-medium block truncate max-w-xs">{std.courseName}</span>
                          {std.branch && <span className="text-[10px] text-slate-400 block">{std.branch}</span>}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {std.currentClass || ('SEM-' + (std.currentSemester || 1))}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Sem {std.currentSemester || 1} of {std.totalSemesters || 8}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {std.clearedSemesters >= std.totalSemesters ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>All Sems Paid</span>
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-rose-700 text-xs block">
                                ₹{Number(std.currentSemesterDue || 0).toLocaleString('en-IN')} Due
                              </span>
                              <span className="text-[10px] text-slate-400">
                                (Sem {std.currentSemester || 1}: ₹{Number(std.feePerSemester || 0).toLocaleString('en-IN')}/sem)
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-emerald-700 block">
                            ₹{Number(std.totalPaid).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            of ₹{Number(std.totalFee).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`font-extrabold text-sm ${std.balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            ₹{Number(std.balanceDue).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            std.feeStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            std.feeStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {std.feeStatus}
                          </span>
                        </td>
                        <td className="p-3 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)] min-w-[145px]">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenCollectModal(std)}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-xs transition-all cursor-pointer whitespace-nowrap"
                              title="Collect Fee Installment"
                            >
                              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>+ Collect</span>
                            </button>

                            {isAdmin ? (
                              <button
                                onClick={() => handleOpenAdjustModal(std)}
                                className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-2.5 py-1.5 rounded-lg text-[11px] shadow-xs transition-all cursor-pointer whitespace-nowrap"
                                title="Admin Fee Correction (Correct cashier typos)"
                              >
                                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                                <span>Edit Fee</span>
                              </button>
                            ) : (
                              <span 
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 whitespace-nowrap"
                                title="Locked: Only Admin can adjust fee totals"
                              >
                                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TIMEFRAME FEE COLLECTIONS (LAST MONTH, THIS MONTH, THIS WEEK, THIS YEAR) */}
      {/* ========================================================================= */}
      {activeAccountsView === 'collections' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Selected Period KPI Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-md space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold">
                {feeTimeframe === 'last_month' ? 'Last Month Total Fees Collected' :
                 feeTimeframe === 'this_month' ? 'This Month Total Fees Collected' :
                 feeTimeframe === 'week' ? 'This Week Total Fees Collected' :
                 feeTimeframe === 'year' ? 'This Year Total Fees Collected' : 'All-Time Total Fees Collected'}
              </span>
              <p className="text-3xl font-black text-white">
                ₹{Number(paymentsData.totalCollected || 0).toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-100 block">
                Official deposits in University Treasury
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {paymentsData.transactionCount || 0}
              </p>
              <span className="text-[11px] text-slate-400 block">
                Payment receipts issued in period
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Distinct Paying Students</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {paymentsData.uniqueStudentsCount || 0}
              </p>
              <span className="text-[11px] text-slate-400 block">
                Students who cleared fee installments
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Month-on-Month Comparison
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-bold">Last Month (Aug):</span>
                  <span className="font-extrabold text-slate-900">₹{(paymentsData.summary?.last_month?.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-700 font-bold">This Month (Sept):</span>
                  <span className="font-extrabold text-slate-900">₹{(paymentsData.summary?.this_month?.totalAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar for Payments */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search payments by Student Name, Roll No, Receipt No, TXN Ref, Cashier..."
                value={paymentSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setPaymentSearch(v);
                  if (v === '') fetchPaymentsData(feeTimeframe, '');
                }}
                onKeyDown={(e) => e.key === 'Enter' && fetchPaymentsData()}
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
              />
              {paymentSearch && (
                <button
                  type="button"
                  onClick={handleResetPaymentSearch}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchPaymentsData()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              Search Payments
            </button>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>
                    {feeTimeframe === 'last_month' ? 'Last Month Fee Collections & Paying Students (पिछले महीने किन छात्रों से फीस आई)' :
                     feeTimeframe === 'this_month' ? 'This Month Fee Collections & Paying Students (इस महीने किन छात्रों से फीस आई)' :
                     feeTimeframe === 'week' ? 'This Week Fee Collections & Paying Students (इस हफ्ते किन छात्रों से फीस आई)' :
                     'Fee Collections & Paying Students'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Detailed list of student payments, paid amounts, payment modes, receipt numbers, and official cashiers
                </p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                Total ₹{Number(paymentsData.totalCollected || 0).toLocaleString('en-IN')} ({paymentsData.payments.length} Payments)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-xs text-left">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Receipt No</th>
                    <th className="p-3 whitespace-nowrap">Date &amp; Time</th>
                    <th className="p-3 whitespace-nowrap">Roll No</th>
                    <th className="p-3 whitespace-nowrap">Student Name</th>
                    <th className="p-3 whitespace-nowrap">Course &amp; Class</th>
                    <th className="p-3 whitespace-nowrap">Amount Paid</th>
                    <th className="p-3 whitespace-nowrap">Payment Mode</th>
                    <th className="p-3 whitespace-nowrap">Fee Type &amp; Purpose</th>
                    <th className="p-3 whitespace-nowrap">Received By</th>
                    <th className="p-3 text-center sticky right-0 bg-slate-900 z-20 shadow-[-6px_0_12px_rgba(0,0,0,0.35)] min-w-[110px]">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">Loading timeframe payments...</td>
                    </tr>
                  ) : paymentsData.payments.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">
                        <p className="font-bold text-slate-700">No fee payments recorded in this timeframe ({feeTimeframe.replace('_', ' ')}).</p>
                      </td>
                    </tr>
                  ) : (
                    paymentsData.payments.map((p) => (
                      <tr key={p.id || p.receiptNo} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-indigo-700 whitespace-nowrap">
                          {p.receiptNo}
                          {p.transactionRef && (
                            <span className="block text-[10px] text-slate-400 font-mono font-normal">Ref: {p.transactionRef}</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {p.paymentDate ? new Date(p.paymentDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {p.rollNo}
                        </td>
                        <td className="p-3 font-bold text-slate-900 uppercase">
                          {p.studentName}
                        </td>
                        <td className="p-3 text-slate-700">
                          <span className="font-medium block truncate max-w-xs">{p.courseName}</span>
                          <span className="text-[10px] text-indigo-600 font-semibold">{p.currentClass || ('Sem ' + (p.currentSemester || 1))}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-block bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-sm px-2.5 py-1 rounded-lg">
                            ₹{Number(p.amountPaid || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {p.paymentMode || 'Cash'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs">
                          {p.feeType && (
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1 mr-1">
                              {p.feeType.split('(')[0].trim()}
                            </span>
                          )}
                          <span className="truncate block font-medium" title={p.paidFor}>{p.paidFor || 'Tuition Fee Installment'}</span>
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">
                          {p.receivedBy || 'Accounts Desk'}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.06)] min-w-[110px]">
                          <button
                            onClick={() => setReceiptToPrint(p)}
                            className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-indigo-200 transition-colors cursor-pointer"
                            title="Print Official Payment Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Collect Fee Installment Modal */}
      {showCollectModal && payStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setShowCollectModal(false)}
        >
          <div 
            className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header (Fixed on Top) */}
            <div className="bg-emerald-800 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-emerald-700">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-100 hover:text-white bg-emerald-900/60 hover:bg-emerald-900 px-3 py-1.5 rounded-lg border border-emerald-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back / Wapas</span>
                </button>
                <div>
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-300" />
                    <span>Collect Fee</span>
                  </h3>
                  <p className="text-[11px] text-emerald-100">
                    <strong className="uppercase">{payStudent.fullName}</strong> ({payStudent.rollNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectModal(false)}
                className="text-emerald-200 hover:text-white hover:bg-emerald-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body (Scrollable in between) */}
            <form onSubmit={handlePaymentSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1 text-slate-900">
                {payError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{payError}</span>
                  </div>
                )}

                {/* Student Academic Particulars Card */}
                <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium">College / Institute:</span>
                    <span className="font-bold text-slate-800">{payStudent.collegeName || 'PKC Education Institute & Consultancy'}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium">Course:</span>
                    <span className="font-bold text-indigo-900">{payStudent.courseName} {payStudent.branch ? `(${payStudent.branch})` : ''}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-slate-500 font-medium">Semester Progression:</span>
                    <span className="font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      {payStudent.currentClass || ('SEM-' + (payStudent.currentSemester || 1))} (Semester {payStudent.currentSemester || 1} of {payStudent.totalSemesters || 8} Sems)
                    </span>
                  </div>
                </div>

                {/* Semester Fee Progress Bar & Info */}
                <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">
                      Academic Semester Fee Progression:
                    </span>
                    <span className="font-extrabold text-indigo-700 text-[11px]">
                      {payStudent.clearedSemesters || 0} / {payStudent.totalSemesters || 8} Sems Cleared
                    </span>
                  </div>
                  
                  {/* Visual semester pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Array.from({ length: payStudent.totalSemesters || 8 }, (_, i) => {
                      const semNum = i + 1;
                      const isCleared = semNum <= (payStudent.clearedSemesters || 0);
                      const isCurrent = semNum === (payStudent.currentSemester || 1);
                      return (
                        <div
                          key={semNum}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                            isCleared
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isCurrent
                              ? 'bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-2xs'
                              : 'bg-white text-slate-400 border border-slate-200'
                          }`}
                        >
                          {isCleared && <span>✓</span>}
                          <span>Sem-{semNum}</span>
                          {isCurrent && !isCleared && <span className="text-[9px] text-amber-700">(Current)</span>}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1">
                    {payStudent.currentSemesterDue > 0 ? (
                      <span>Current Semester {payStudent.currentSemester} Due: <strong className="text-rose-700">₹{Number(payStudent.currentSemesterDue).toLocaleString('en-IN')}</strong> (₹{Number(payStudent.feePerSemester || 0).toLocaleString('en-IN')}/sem). Fees clear hote hi automatically SEM-{Math.min((payStudent.totalSemesters || 8), (payStudent.currentSemester || 1) + 1)} promote hoga.</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✓ All semesters fee cleared up to current semester!</span>
                    )}
                  </p>
                </div>

                {/* Student Fee Status Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Course Fee</span>
                    <span className="font-bold text-slate-800 text-sm">₹{Number(payStudent.totalFee).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Paid So Far</span>
                    <span className="font-bold text-emerald-700 text-sm">₹{Number(payStudent.totalPaid).toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Current Balance</span>
                    <span className="font-extrabold text-rose-700 text-sm">₹{Number(payStudent.balanceDue).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment Fields */}
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider">
                        Amount to Pay (INR) *
                      </label>
                      {payStudent.currentSemesterDue > 0 && (
                        <span className="text-[11px] text-amber-700 font-bold">
                          Sem-{payStudent.currentSemester} Due: ₹{Number(payStudent.currentSemesterDue).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      max={payStudent.balanceDue}
                      className="w-full p-3 text-base font-extrabold text-emerald-800 bg-emerald-50/50 border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      required
                      autoFocus
                    />

                    {/* Quick Amount Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {payStudent.currentSemesterDue > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayAmount(String(payStudent.currentSemesterDue));
                            setFeeType('Tuition / Semester Fee (सेमेस्टर / ट्यूशन फीस)');
                            setPaidFor(`Semester ${payStudent.currentSemester || 1} Tuition Fee`);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                        >
                          ⚡ Pay Sem-{payStudent.currentSemester} Due (₹{Number(payStudent.currentSemesterDue).toLocaleString('en-IN')})
                        </button>
                      )}
                      {payStudent.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayAmount(String(payStudent.balanceDue));
                            setFeeType('Final / Last Fee Settlement (अंतिम चुकता फीस / Last Settlement Fee)');
                            setPaidFor(`Final Course Fee Complete Settlement`);
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 transition-colors cursor-pointer"
                        >
                          Pay Full Remaining Balance (₹{Number(payStudent.balanceDue).toLocaleString('en-IN')})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live Balance Update preview */}
                  {payAmount && Number(payAmount) > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-indigo-900 font-semibold">New Balance After This Payment:</span>
                      <span className="font-black text-sm text-indigo-950">
                        ₹{Number(calculatedNewBalance).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Fee Type / Category Selector */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                        Fee Type / Category (फीस का प्रकार चुनें) *
                      </label>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-300">
                        Official Receipt & Ledger Type
                      </span>
                    </div>
                    <select
                      value={feeType}
                      onChange={(e) => handleFeeTypeChange(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-slate-900 text-xs cursor-pointer shadow-2xs"
                    >
                      <option value="Tuition / Semester Fee (सेमेस्टर / ट्यूशन फीस)">
                        🎓 Tuition / Semester Fee (सेमेस्टर / ट्यूशन फीस)
                      </option>
                      <option value="Registration / Admission Fee (रजिस्ट्रेशन / प्रवेश फीस)">
                        📝 Registration / Admission Fee (रजिस्ट्रेशन / प्रवेश फीस)
                      </option>
                      <option value="Examination Fee (परीक्षा फीस / Exam Fee)">
                        📄 Examination Fee (परीक्षा फीस / Exam Fee)
                      </option>
                      <option value="Re-Exam / ATKT Backlog Fee (री-एग्जाम / बैक पेपर फीस)">
                        🔄 Re-Exam / ATKT Backlog Fee (री-एग्जाम / बैक पेपर फीस)
                      </option>
                      <option value="Final / Last Fee Settlement (अंतिम चुकता फीस / Last Settlement Fee)">
                        🏁 Final / Last Fee Settlement (अंतिम चुकता फीस / Last Settlement Fee)
                      </option>
                      <option value="Late Fee Fine (विलंब शुल्क / लेट फीस)">
                        ⚠️ Late Fee Fine (विलंब शुल्क / लेट फीस)
                      </option>
                      <option value="Other Miscellaneous Fee (अन्य विविध फीस)">
                        💼 Other Miscellaneous Fee (अन्य विविध फीस)
                      </option>
                    </select>
                    <p className="text-[10px] text-slate-500 italic">
                      चयनित फीस प्रकार रसीद (Official Receipt) और कॉलेज अकाउंट्स लेजर में दर्ज होगा।
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Payment Mode *
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-medium"
                      >
                        <option value="Cash">Cash (नकद)</option>
                        <option value="UPI / Online QR">UPI / QR Scan / GooglePay</option>
                        <option value="Debit / Credit Card">Debit / Credit Card POS</option>
                        <option value="Bank Net Banking / RTGS">Bank NEFT / RTGS</option>
                        <option value="Bank Cheque / DD">Demand Draft / Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Transaction / Ref No.
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="TXN-998822"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-mono"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Payment Purpose / Remarks
                    </label>
                    <input
                      type="text"
                      value={paidFor}
                      onChange={(e) => setPaidFor(e.target.value)}
                      placeholder="Semester 1 Tuition Fee Installment"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Cashier / Received By (Official Desk Officer)
                    </label>
                    <input
                      type="text"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      placeholder="Operator Name"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Fixed on Bottom, Always Accessible) */}
              <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel / Wapas</span>
                </button>
                <button
                  type="submit"
                  disabled={payLoading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {payLoading ? <span>Processing Payment...</span> : <><CheckCircle2 className="w-4 h-4" /><span>Deposit & Print Official Receipt</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Fee Correction & Adjustment Modal (Admin Only) */}
      {showAdjustModal && adjustStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setShowAdjustModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto border border-amber-300 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                    Administrator Special Power
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Admin Fee Correction &amp; Adjustment
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Student: <strong className="text-white uppercase">{adjustStudent.fullName}</strong> ({adjustStudent.rollNo})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-6 space-y-5 text-xs">

                {adjustSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center gap-2 font-bold animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{adjustSuccess}</span>
                  </div>
                )}

                {adjustError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex items-center gap-2 font-bold animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{adjustError}</span>
                  </div>
                )}

                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl text-[11px] text-amber-900 leading-relaxed">
                  <strong>ℹ️ Cashier Entry Correction:</strong> If cashier mistakenly entered excessive or incorrect amounts (e.g. ₹11,80,000 instead of ₹1,80,000, or paid ₹1,00,000 instead of ₹10,000), Admin can directly correct them here. Live treasury totals will recalculate immediately.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: Total Course Fee */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Correct Total Course Fee (₹) *
                    </label>
                    <input
                      type="number"
                      value={adjustTotalFee}
                      onChange={(e) => setAdjustTotalFee(e.target.value)}
                      placeholder="e.g. 180000"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400">Total payable for entire degree program</span>
                  </div>

                  {/* Field 2: Total Fee Paid So Far */}
                  <div className="space-y-1.5">
                    <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Correct Total Paid So Far (₹) *
                    </label>
                    <input
                      type="number"
                      value={adjustTotalPaid}
                      onChange={(e) => setAdjustTotalPaid(e.target.value)}
                      placeholder="e.g. 10000"
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:border-emerald-600 font-mono shadow-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400">Actual amount received from student</span>
                  </div>
                </div>

                {/* Recalculated Outstanding Due Card */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Auto-Recalculated Due Balance
                    </span>
                    <p className="text-xl font-black text-rose-400 mt-0.5">
                      ₹{calculatedAdjustBalance.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    (Total Fee − Paid)
                  </span>
                </div>

                {/* Field 3: Reason for Adjustment */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Correction Reason / Remark (Audit Trail) *
                  </label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. Corrected cashier typo error"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="bg-slate-50 p-4 px-6 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancel / Wapas</span>
                </button>

                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {adjustLoading ? (
                    <span>Updating Ledger...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Fee Correction &amp; Update Live</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Official Fee Receipt Print Modal */}
      {receiptToPrint && (
        <PrintFeeReceipt
          receipt={receiptToPrint}
          onClose={() => setReceiptToPrint(null)}
        />
      )}

    </div>
  );
}
