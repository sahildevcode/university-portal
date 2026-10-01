import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, UserCheck, Calendar, Clock, CreditCard, Plus, Edit3, Trash2, 
  Eye, EyeOff, Search, Printer, CheckCircle2, AlertCircle, X, Download, 
  ChevronRight, FileText, Building2, Award, Briefcase, Phone, Mail, 
  MapPin, Landmark, Check, RotateCcw, AlertTriangle, ShieldCheck
} from 'lucide-react';

export default function StaffPayrollManager({ adminUser }) {
  // Active Sub-Tab: 'directory' | 'attendance' | 'payroll'
  const [activeTab, setActiveTab] = useState('directory');

  // Staff list & loading
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Passwords toggle
  const [showPasswords, setShowPasswords] = useState({});

  // Staff Modal (Add / Edit)
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Full Profile View Modal
  const [viewingStaff, setViewingStaff] = useState(null);

  // Initial Form State with all requested 26+ fields
  const initialStaffForm = {
    // Credentials
    username: '',
    password: '',
    name: '',
    post: '',
    role: 'Cash Counter & Admission Desk',
    department: 'Accounts & Admissions',
    status: 'Active',

    // Personal & Family Details
    fatherName: '',
    motherName: '',
    spouseName: 'NA',
    dob: '',
    gender: 'Male',
    religion: 'Hindu',
    socialClass: 'General',

    // Educational & Professional
    education: '',
    professionalQualification: '',
    experienceMonths: '',
    dateOfJoining: new Date().toISOString().split('T')[0],

    // Contact & Address
    address: '',
    pincode: '',
    email: '',
    mobile: '',

    // Compensation & PF
    salary: '',
    pfNo: '',

    // KYC & Government IDs
    samagraId: '',
    aadhaarNo: '',
    panNo: '',
    otherDetail: '',

    // Bank Account Details
    bankAccountNo: '',
    bankName: '',
    bankIfsc: ''
  };

  const [staffForm, setStaffForm] = useState(initialStaffForm);

  // ========================================================
  // ATTENDANCE DESK STATE
  // ========================================================
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dailyAttendance, setDailyAttendance] = useState({}); // { [staffId]: { status, checkIn, checkOut, remarks } }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSavedMsg, setAttendanceSavedMsg] = useState(null);

  // ========================================================
  // PAYROLL & MONTHLY SALARY STATE
  // ========================================================
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [payrollSummary, setPayrollSummary] = useState([]);
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [salaryMonthDays, setSalaryMonthDays] = useState(30);

  // Pay Salary Modal
  const [payingStaffSummary, setPayingStaffSummary] = useState(null);
  const [paySalaryForm, setPaySalaryForm] = useState({
    customBaseSalary: '',
    bonus: '',
    allowances: '',
    deductions: '',
    paymentMode: 'Bank Transfer',
    transactionRef: '',
    paymentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [salaryPayingLoading, setSalaryPayingLoading] = useState(false);

  // Print Salary Slip Modal
  const [printSlipRecord, setPrintSlipRecord] = useState(null);

  // Fetch Staff List
  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  // ========================================================
  // ATTENDANCE LOGIC
  // ========================================================
  const fetchDailyAttendance = async (dateVal) => {
    setAttendanceLoading(true);
    setAttendanceSavedMsg(null);
    try {
      const res = await fetch(`/api/staff-attendance?date=${dateVal}`);
      const data = await res.json();
      const mapping = {};
      if (data.success && Array.isArray(data.attendance)) {
        data.attendance.forEach(rec => {
          mapping[rec.staffId] = {
            status: rec.status === 'Absent' ? 'Absent' : 'Present',
            checkIn: rec.checkIn || '09:30',
            checkOut: rec.checkOut || '17:30',
            remarks: rec.remarks || ''
          };
        });
      }
      setDailyAttendance(mapping);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchDailyAttendance(attendanceDate);
    }
  }, [activeTab, attendanceDate]);

  const handleSetAttendanceStatus = (staffId, status) => {
    setDailyAttendance(prev => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || { checkIn: '09:30', checkOut: '17:30', remarks: '' }),
        status
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...dailyAttendance };
    staffList.filter(s => s.status !== 'Inactive').forEach(s => {
      updated[s.id] = {
        ...(updated[s.id] || { checkIn: '09:30', checkOut: '17:30', remarks: '' }),
        status: 'Present'
      };
    });
    setDailyAttendance(updated);
  };

  const handleSaveDailyAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const activeStaff = staffList.filter(s => s.status !== 'Inactive');
      const records = activeStaff.map(s => {
        const att = dailyAttendance[s.id] || { status: 'Present', checkIn: '09:30', checkOut: '17:30', remarks: '' };
        return {
          staffId: s.id,
          staffName: s.name,
          post: s.post || s.role || 'Staff Member',
          status: att.status === 'Absent' ? 'Absent' : 'Present',
          checkIn: att.checkIn || '',
          checkOut: att.checkOut || '',
          remarks: att.remarks || ''
        };
      });

      const res = await fetch('/api/staff-attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: attendanceDate,
          records,
          markedBy: adminUser?.name || 'Administrator'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save attendance');

      setAttendanceSavedMsg(`Attendance for ${attendanceDate} saved successfully!`);
      setTimeout(() => setAttendanceSavedMsg(null), 4000);
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    } finally {
      setAttendanceLoading(false);
    }
  };

  // ========================================================
  // PAYROLL LOGIC
  // ========================================================
  const fetchPayrollSummary = async (monthVal) => {
    setPayrollLoading(true);
    try {
      const res = await fetch(`/api/staff-attendance/summary?month=${monthVal}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.summary)) {
        setPayrollSummary(data.summary);
        setSalaryMonthDays(data.totalDaysInMonth || 30);
      }
    } catch (err) {
      console.error('Failed to fetch payroll summary:', err);
    } finally {
      setPayrollLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payroll') {
      fetchPayrollSummary(selectedMonth);
    }
  }, [activeTab, selectedMonth]);

  const handleOpenPaySalary = (item) => {
    setPayingStaffSummary(item);
    setPaySalaryForm({
      customBaseSalary: item.baseSalary ? String(item.baseSalary) : '',
      bonus: '',
      allowances: '',
      deductions: '',
      paymentMode: 'Bank Transfer',
      transactionRef: '',
      paymentDate: new Date().toISOString().split('T')[0],
      remarks: `Salary for ${selectedMonth}`
    });
  };

  const handleConfirmPaySalary = async (e) => {
    e.preventDefault();
    if (!payingStaffSummary) return;

    setSalaryPayingLoading(true);
    try {
      const bonusNum = Number(paySalaryForm.bonus) || 0;
      const allowNum = Number(paySalaryForm.allowances) || 0;
      const dedNum = Number(paySalaryForm.deductions) || 0;

      const currentBaseSalary = paySalaryForm.customBaseSalary !== ''
        ? Number(paySalaryForm.customBaseSalary) || 0
        : Number(payingStaffSummary.baseSalary) || 0;

      const dynamicEarnedSalary = salaryMonthDays > 0
        ? Math.round((currentBaseSalary / salaryMonthDays) * (payingStaffSummary.payableDays || 0))
        : 0;

      const netPaid = Math.max(0, dynamicEarnedSalary + bonusNum + allowNum - dedNum);

      const res = await fetch('/api/staff-salaries/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: payingStaffSummary.staffId,
          monthString: selectedMonth,
          baseSalary: currentBaseSalary,
          payableDays: payingStaffSummary.payableDays,
          totalDaysInMonth: salaryMonthDays,
          earnedSalary: dynamicEarnedSalary,
          bonus: bonusNum,
          allowances: allowNum,
          deductions: dedNum,
          netSalaryPaid: netPaid,
          paymentMode: paySalaryForm.paymentMode,
          transactionRef: paySalaryForm.transactionRef,
          paymentDate: paySalaryForm.paymentDate,
          remarks: paySalaryForm.remarks,
          paidBy: adminUser?.name || 'Administrator'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to pay salary');

      setPayingStaffSummary(null);
      fetchPayrollSummary(selectedMonth);
      fetchStaffData();
      if (data.payment) {
        setPrintSlipRecord(data.payment);
      }
    } catch (err) {
      alert('Error disbursing salary: ' + err.message);
    } finally {
      setSalaryPayingLoading(false);
    }
  };

  // ========================================================
  // STAFF FORM HANDLERS (ADD / EDIT)
  // ========================================================
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffForm(initialStaffForm);
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (stf) => {
    setEditingStaffId(stf.id);
    setStaffForm({
      ...initialStaffForm,
      ...stf,
      experienceMonths: stf.experienceMonths !== undefined ? String(stf.experienceMonths) : '',
      salary: stf.salary !== undefined ? String(stf.salary) : ''
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const url = editingStaffId ? `/api/staff/${editingStaffId}` : '/api/staff';
      const method = editingStaffId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...staffForm,
          salary: Number(staffForm.salary) || 0,
          experienceMonths: Number(staffForm.experienceMonths) || 0
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save staff');

      setShowStaffModal(false);
      fetchStaffData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete staff account "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchStaffData();
      }
    } catch (err) {
      alert('Failed to delete staff member');
    }
  };

  // Filtered staff list
  const filteredStaff = staffList.filter(s => {
    if (filterStatus !== 'all' && (s.status || 'Active') !== filterStatus) return false;
    if (filterDepartment !== 'all' && (s.department || '').toLowerCase() !== filterDepartment.toLowerCase()) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.username || '').toLowerCase().includes(q) ||
      (s.post || '').toLowerCase().includes(q) ||
      (s.mobile || '').toLowerCase().includes(q) ||
      (s.fatherName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0b1f33] via-[#102d4a] to-[#0b1f33] text-white p-5 rounded-2xl shadow-md border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
              Staff Directorate & ERP Payroll
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200">
              {staffList.length} Total Staff
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-amber-400" />
            <span>Staff & Operator Credentials, Attendance & Payroll</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Manage complete staff profiles (26+ details), daily attendance tracking, and automated monthly salary calculations based on working days.
          </p>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-amber-400 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1. Staff Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-emerald-500 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>2. Daily Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payroll')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payroll'
                ? 'bg-cyan-400 text-slate-950 shadow-md scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>3. Monthly Salary & Payroll</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STAFF DIRECTORY & PROFILES */}
      {/* ========================================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                👥
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Total Registered Staff</p>
                <p className="text-xl font-black text-slate-900">{staffList.length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                ✅
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Active Staff Members</p>
                <p className="text-xl font-black text-emerald-700">{staffList.filter(s => s.status !== 'Inactive').length}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                💵
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Monthly Salary Budget</p>
                <p className="text-xl font-black text-amber-700">
                  ₹{staffList.reduce((acc, s) => acc + (Number(s.salary) || 0), 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg">
                🏢
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Departments Active</p>
                <p className="text-xl font-black text-purple-700">
                  {new Set(staffList.map(s => s.department).filter(Boolean)).size || 1}
                </p>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search input */}
              <div className="relative min-w-[240px] flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name, post, mobile, login ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            {/* Create New Staff Member Button */}
            <button
              type="button"
              onClick={handleOpenAddStaff}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span>+ Create New Staff Member</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0b1f33] text-white uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Staff Name & Post</th>
                    <th className="p-3.5">Father Name & Mobile</th>
                    <th className="p-3.5">Login ID & Credentials</th>
                    <th className="p-3.5">Education & Experience</th>
                    <th className="p-3.5 text-right">Fixed Monthly Salary</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        {loading ? 'Loading staff records...' : 'No staff members match the selected search or filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((stf) => (
                      <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Post */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-sm shadow-xs uppercase">
                              {(stf.name || 'S').charAt(0)}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{stf.name}</p>
                              <p className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded inline-block mt-0.5">
                                {stf.post || stf.role || 'Staff Member'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Father Name & Mobile */}
                        <td className="p-3.5">
                          <p className="font-medium text-slate-800">
                            {stf.fatherName ? `S/o, D/o: ${stf.fatherName}` : '—'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{stf.mobile || stf.contact || 'No Mobile'}</span>
                          </p>
                        </td>

                        {/* Login ID & Password */}
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <div className="font-mono font-bold text-indigo-900 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-200 inline-block text-[11px]">
                              {stf.username}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                              <span>{showPasswords[stf.id] ? stf.password : '••••••••'}</span>
                              <button
                                type="button"
                                onClick={() => setShowPasswords(p => ({ ...p, [stf.id]: !p[stf.id] }))}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Toggle Password View"
                              >
                                {showPasswords[stf.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Education & Experience */}
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-700">{stf.education || '—'}</p>
                          <p className="text-[11px] text-slate-500">
                            {stf.experienceMonths ? `${stf.experienceMonths} Months Exp.` : 'Fresher'}
                          </p>
                        </td>

                        {/* Salary */}
                        <td className="p-3.5 text-right">
                          <span className="font-black text-sm text-slate-900">
                            ₹{Number(stf.salary || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-400">/ month</span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            stf.status === 'Inactive'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {stf.status || 'Active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Full Profile */}
                            <button
                              type="button"
                              onClick={() => setViewingStaff(stf)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="View Full Profile (26+ Details)"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditStaff(stf)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Staff Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteStaff(stf.id, stf.name)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Staff Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      {/* TAB 2: DAILY ATTENDANCE DESK */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Attendance Date Control Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
                📅
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Select Attendance Date:
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Mark all active staff members as Present for this date"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>⚡ Mark All Present</span>
              </button>

              <button
                type="button"
                disabled={attendanceLoading}
                onClick={handleSaveDailyAttendance}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>{attendanceLoading ? 'Saving...' : '💾 Save Attendance'}</span>
              </button>
            </div>
          </div>

          {attendanceSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{attendanceSavedMsg}</span>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0b1f33] text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3.5 w-12 text-center">#</th>
                    <th className="p-3.5">Staff Member & Post</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5 text-center">Attendance Status</th>
                    <th className="p-3.5">Check In / Out Time</th>
                    <th className="p-3.5">Remarks / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.filter(s => s.status !== 'Inactive').length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">
                        No active staff members found to mark attendance.
                      </td>
                    </tr>
                  ) : (
                    staffList.filter(s => s.status !== 'Inactive').map((stf, idx) => {
                      const att = dailyAttendance[stf.id] || { status: 'Present', checkIn: '09:30', checkOut: '17:30', remarks: '' };
                      const currentStatus = att.status === 'Absent' ? 'Absent' : 'Present';

                      return (
                        <tr key={stf.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                          
                          {/* Staff Name & Post */}
                          <td className="p-3.5">
                            <p className="font-extrabold text-slate-900 text-sm">{stf.name}</p>
                            <p className="text-[11px] font-semibold text-indigo-700">{stf.post || stf.role}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{stf.mobile || stf.username}</p>
                          </td>

                          {/* Department */}
                          <td className="p-3.5 text-slate-600 font-medium">
                            {stf.department || 'General'}
                          </td>

                          {/* Attendance Status Buttons - ONLY 2 BUTTONS: Present & Absent */}
                          <td className="p-3.5 text-center">
                            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl gap-1.5 border border-slate-200">
                              
                              {/* Present */}
                              <button
                                type="button"
                                onClick={() => handleSetAttendanceStatus(stf.id, 'Present')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-white'
                                }`}
                              >
                                Present
                              </button>

                              {/* Absent */}
                              <button
                                type="button"
                                onClick={() => handleSetAttendanceStatus(stf.id, 'Absent')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-white'
                                }`}
                              >
                                Absent
                              </button>

                            </div>
                          </td>

                          {/* Check in / Out */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="time"
                                value={att.checkIn || '09:30'}
                                onChange={(e) => setDailyAttendance(prev => ({
                                  ...prev,
                                  [stf.id]: { ...(prev[stf.id] || {}), checkIn: e.target.value }
                                }))}
                                className="p-1 bg-slate-50 border border-slate-300 rounded font-mono text-xs w-24 text-center"
                              />
                              <span className="text-slate-400">-</span>
                              <input
                                type="time"
                                value={att.checkOut || '17:30'}
                                onChange={(e) => setDailyAttendance(prev => ({
                                  ...prev,
                                  [stf.id]: { ...(prev[stf.id] || {}), checkOut: e.target.value }
                                }))}
                                className="p-1 bg-slate-50 border border-slate-300 rounded font-mono text-xs w-24 text-center"
                              />
                            </div>
                          </td>

                          {/* Remarks */}
                          <td className="p-3.5">
                            <input
                              type="text"
                              placeholder="Optional remarks..."
                              value={att.remarks || ''}
                              onChange={(e) => setDailyAttendance(prev => ({
                                ...prev,
                                [stf.id]: { ...(prev[stf.id] || {}), remarks: e.target.value }
                              }))}
                              className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                            />
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MONTHLY SALARY & PAYROLL */}
      {/* ========================================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          
          {/* Month Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg">
                💵
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Select Salary Month:
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div>Total Days in Month: <strong className="text-slate-900">{salaryMonthDays}</strong></div>
              <div>•</div>
              <div>Active Staff: <strong className="text-slate-900">{payrollSummary.length}</strong></div>
              <div>•</div>
              <div>
                Total Monthly Calculated: <strong className="text-emerald-700">₹{payrollSummary.reduce((acc, s) => acc + (s.calculatedSalary || 0), 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {/* Monthly Payroll Calculation Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0b1f33] text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3.5">Staff Member & Post</th>
                    <th className="p-3.5 text-right">Fixed Monthly Salary</th>
                    <th className="p-3.5 text-center">Attendance Days (Present / Absent)</th>
                    <th className="p-3.5 text-center">Payable Days</th>
                    <th className="p-3.5 text-right">Calculated Salary</th>
                    <th className="p-3.5 text-center">Payment Status</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollSummary.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">
                        {payrollLoading ? 'Calculating salaries based on attendance...' : 'No staff found for payroll calculation.'}
                      </td>
                    </tr>
                  ) : (
                    payrollSummary.map((item) => (
                      <tr key={item.staffId} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Name & Post */}
                        <td className="p-3.5">
                          <p className="font-extrabold text-slate-900 text-sm">{item.name}</p>
                          <p className="text-[11px] font-semibold text-indigo-700">{item.post}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Bank: {item.bankName || 'N/A'} ({item.bankAccountNo ? `A/c ...${item.bankAccountNo.slice(-4)}` : 'No A/c'})</p>
                        </td>

                        {/* Fixed Base Salary */}
                        <td className="p-3.5 text-right">
                          <span className="font-black text-sm text-slate-800">
                            ₹{Number(item.baseSalary || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[10px] text-slate-400">₹{item.perDaySalary}/day</span>
                        </td>

                        {/* Days Breakdown: Present and Absent */}
                        <td className="p-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" title="Present Days">
                              Present: {item.presentDays}
                            </span>
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200" title="Absent Days">
                              Absent: {item.absentDays}
                            </span>
                          </div>
                        </td>

                        {/* Payable Days */}
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 font-extrabold text-xs border border-indigo-200">
                            {item.payableDays} / {item.totalDaysInMonth} Days
                          </span>
                        </td>

                        {/* Calculated Salary */}
                        <td className="p-3.5 text-right">
                          <span className="font-black text-base text-emerald-800">
                            ₹{Number(item.calculatedSalary || 0).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          {item.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[11px] border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Paid (₹{Number(item.paymentRecord?.netSalaryPaid || item.calculatedSalary).toLocaleString('en-IN')})</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px] border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending Due</span>
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-3.5 text-center">
                          {item.isPaid ? (
                            <button
                              type="button"
                              onClick={() => setPrintSlipRecord(item.paymentRecord)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>View Payslip</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenPaySalary(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-100" />
                              <span>Pay Salary</span>
                            </button>
                          )}
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
      {/* MODAL 1: CREATE / EDIT STAFF MEMBER (ALL 26+ REQUESTED FIELDS) */}
      {/* ========================================================================= */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900 animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b1f33] via-[#102d4a] to-[#0b1f33] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    {editingStaffId ? 'Edit Staff Member Details' : 'Create New Staff Member'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Fill in personal, educational, KYC, bank and monthly salary details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form - All fields optional */}
            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto max-h-[78vh] space-y-6 text-xs">
              
              {/* SECTION 1: Credentials & Basic Job Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>1. Login Credentials & Post Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Staff Member Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={staffForm.name}
                      onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Staff Login ID / Username:</label>
                    <input
                      type="text"
                      placeholder="e.g. suresh_operator"
                      value={staffForm.username}
                      onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Assign Password:</label>
                    <input
                      type="text"
                      placeholder="e.g. pass1234"
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Post:</label>
                    <input
                      type="text"
                      placeholder="e.g. Assistant Professor, Accountant, Cashier"
                      value={staffForm.post}
                      onChange={(e) => setStaffForm({ ...staffForm, post: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Role / System Access</label>
                    <select
                      value={staffForm.role}
                      onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Cash Counter & Admission Desk">Cash Counter & Admission Desk</option>
                      <option value="Accounts Operator">Accounts Operator</option>
                      <option value="Admission Counselor">Admission Counselor</option>
                      <option value="Verification Officer">Verification Officer</option>
                      <option value="Teaching Faculty / Lecturer">Teaching Faculty / Lecturer</option>
                      <option value="General Staff">General Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Account Status</label>
                    <select
                      value={staffForm.status || 'Active'}
                      onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Personal & Family Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>2. Personal & Family Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Father Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={staffForm.fatherName}
                      onChange={(e) => setStaffForm({ ...staffForm, fatherName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Mother Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Devi"
                      value={staffForm.motherName}
                      onChange={(e) => setStaffForm({ ...staffForm, motherName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Spouse Name:</label>
                    <input
                      type="text"
                      placeholder="NA"
                      value={staffForm.spouseName}
                      onChange={(e) => setStaffForm({ ...staffForm, spouseName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Date of Birth:</label>
                    <input
                      type="date"
                      value={staffForm.dob}
                      onChange={(e) => setStaffForm({ ...staffForm, dob: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Gender:</label>
                    <select
                      value={staffForm.gender}
                      onChange={(e) => setStaffForm({ ...staffForm, gender: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Religion:</label>
                    <select
                      value={staffForm.religion}
                      onChange={(e) => setStaffForm({ ...staffForm, religion: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="Hindu">Hindu</option>
                      <option value="Muslim">Muslim</option>
                      <option value="Christian">Christian</option>
                      <option value="Sikh">Sikh</option>
                      <option value="Jain">Jain</option>
                      <option value="Buddhist">Buddhist</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold block mb-1 text-slate-700">Social Class:</label>
                    <select
                      value={staffForm.socialClass}
                      onChange={(e) => setStaffForm({ ...staffForm, socialClass: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Educational, Professional & Joining */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>3. Education, Experience & Joining</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Education:</label>
                    <input
                      type="text"
                      placeholder="e.g. M.Sc, M.Com, B.Tech, Graduate"
                      value={staffForm.education}
                      onChange={(e) => setStaffForm({ ...staffForm, education: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Professional Qualification:</label>
                    <input
                      type="text"
                      placeholder="e.g. B.Ed, PGDCA, MCA, MBA"
                      value={staffForm.professionalQualification}
                      onChange={(e) => setStaffForm({ ...staffForm, professionalQualification: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Experience (In month):</label>
                    <input
                      type="number"
                      placeholder="e.g. 24"
                      value={staffForm.experienceMonths}
                      onChange={(e) => setStaffForm({ ...staffForm, experienceMonths: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Date of Joining:</label>
                    <input
                      type="date"
                      value={staffForm.dateOfJoining}
                      onChange={(e) => setStaffForm({ ...staffForm, dateOfJoining: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Contact & Address */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>4. Contact & Residential Address</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Mobile Number:</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={staffForm.mobile}
                      onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Email ID:</label>
                    <input
                      type="email"
                      placeholder="e.g. suresh@example.com"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold block mb-1 text-slate-700">Full Address:</label>
                    <input
                      type="text"
                      placeholder="House / Street / Ward / City"
                      value={staffForm.address}
                      onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Pin Code:</label>
                    <input
                      type="text"
                      placeholder="e.g. 471001"
                      value={staffForm.pincode}
                      onChange={(e) => setStaffForm({ ...staffForm, pincode: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: Salary & Compensation */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-950 flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>5. Monthly Base Salary & PF</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-emerald-900">
                      Fixed Monthly Base Salary (₹):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      value={staffForm.salary}
                      onChange={(e) => setStaffForm({ ...staffForm, salary: e.target.value })}
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-mono font-black text-emerald-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-emerald-700 mt-1">
                      Monthly salary will be dynamically calculated based on attendance days.
                    </p>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">PF Number:</label>
                    <input
                      type="text"
                      placeholder="e.g. MP/BHO/0012345/000"
                      value={staffForm.pfNo}
                      onChange={(e) => setStaffForm({ ...staffForm, pfNo: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Other Detail / Remarks:</label>
                    <input
                      type="text"
                      placeholder="Any additional remarks..."
                      value={staffForm.otherDetail}
                      onChange={(e) => setStaffForm({ ...staffForm, otherDetail: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Government IDs & KYC */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>6. Identity Verification & Government KYC</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Samagra ID:</label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789"
                      value={staffForm.samagraId}
                      onChange={(e) => setStaffForm({ ...staffForm, samagraId: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Aadhaar No:</label>
                    <input
                      type="text"
                      placeholder="e.g. 1234 5678 9012"
                      value={staffForm.aadhaarNo}
                      onChange={(e) => setStaffForm({ ...staffForm, aadhaarNo: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">PAN No:</label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      value={staffForm.panNo}
                      onChange={(e) => setStaffForm({ ...staffForm, panNo: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Bank Account Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-indigo-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Landmark className="w-4 h-4 text-indigo-600" />
                  <span>7. Bank Account Details for Salary Transfer</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Bank Account No:</label>
                    <input
                      type="text"
                      placeholder="e.g. 301234567890"
                      value={staffForm.bankAccountNo}
                      onChange={(e) => setStaffForm({ ...staffForm, bankAccountNo: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Bank Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India"
                      value={staffForm.bankName}
                      onChange={(e) => setStaffForm({ ...staffForm, bankName: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Bank IFSC:</label>
                    <input
                      type="text"
                      placeholder="e.g. SBIN0001234"
                      value={staffForm.bankIfsc}
                      onChange={(e) => setStaffForm({ ...staffForm, bankIfsc: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono uppercase focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingStaffId ? 'Update Staff Profile' : 'Create Staff Member'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FULL PROFILE INSPECTION (ALL DETAILS) */}
      {/* ========================================================================= */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900 animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shadow-md uppercase">
                  {(viewingStaff.name || 'S').charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">{viewingStaff.name}</h3>
                  <p className="text-xs text-amber-300 font-bold">{viewingStaff.post || viewingStaff.role}</p>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {viewingStaff.username} • Dept: {viewingStaff.department || 'General'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid */}
            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
              
              {/* Credentials & Salary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950">
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold">MONTHLY FIXED SALARY</p>
                  <p className="font-black text-base text-emerald-900">₹{Number(viewingStaff.salary || 0).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold">LOGIN PASSWORD</p>
                  <p className="font-mono font-bold text-slate-900">{viewingStaff.password}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-700 font-bold">STATUS</p>
                  <p className="font-bold text-emerald-800">{viewingStaff.status || 'Active'}</p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  Personal Details
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-slate-700">
                  <div><strong>Father Name:</strong> {viewingStaff.fatherName || '—'}</div>
                  <div><strong>Mother Name:</strong> {viewingStaff.motherName || '—'}</div>
                  <div><strong>Spouse Name:</strong> {viewingStaff.spouseName || 'NA'}</div>
                  <div><strong>Date of Birth:</strong> {viewingStaff.dob || '—'}</div>
                  <div><strong>Gender:</strong> {viewingStaff.gender || '—'}</div>
                  <div><strong>Religion / Caste:</strong> {viewingStaff.religion || '—'} / {viewingStaff.socialClass || '—'}</div>
                </div>
              </div>

              {/* Education & Experience */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  Education & Experience
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-slate-700">
                  <div><strong>Education:</strong> {viewingStaff.education || '—'}</div>
                  <div><strong>Professional Qual.:</strong> {viewingStaff.professionalQualification || '—'}</div>
                  <div><strong>Experience:</strong> {viewingStaff.experienceMonths ? `${viewingStaff.experienceMonths} Months` : 'Fresher'}</div>
                  <div><strong>Date of Joining:</strong> {viewingStaff.dateOfJoining || '—'}</div>
                </div>
              </div>

              {/* Contact */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  Contact & Address
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-slate-700">
                  <div><strong>Mobile:</strong> {viewingStaff.mobile || '—'}</div>
                  <div><strong>Email:</strong> {viewingStaff.email || '—'}</div>
                  <div className="col-span-2"><strong>Address:</strong> {viewingStaff.address || '—'} {viewingStaff.pincode ? `(${viewingStaff.pincode})` : ''}</div>
                </div>
              </div>

              {/* KYC & Identity */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">
                  Government IDs & KYC
                </p>
                <div className="grid grid-cols-2 gap-y-2 text-slate-700 font-mono text-[11px]">
                  <div><strong className="font-sans">Samagra ID:</strong> {viewingStaff.samagraId || '—'}</div>
                  <div><strong className="font-sans">Aadhaar No:</strong> {viewingStaff.aadhaarNo || '—'}</div>
                  <div><strong className="font-sans">PAN No:</strong> {viewingStaff.panNo || '—'}</div>
                  <div><strong className="font-sans">PF No:</strong> {viewingStaff.pfNo || '—'}</div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50">
                <p className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Bank Account Details</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-800">
                  <div><span className="text-slate-500 block text-[10px]">BANK NAME</span><strong>{viewingStaff.bankName || '—'}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">ACCOUNT NUMBER</span><strong className="font-mono">{viewingStaff.bankAccountNo || '—'}</strong></div>
                  <div><span className="text-slate-500 block text-[10px]">IFSC CODE</span><strong className="font-mono">{viewingStaff.bankIfsc || '—'}</strong></div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PAY MONTHLY SALARY */}
      {/* ========================================================================= */}
      {payingStaffSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900 animate-in fade-in duration-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white font-black flex items-center justify-center text-lg">
                  💵
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Disburse Monthly Salary</h3>
                  <p className="text-xs text-emerald-100">{payingStaffSummary.name} ({payingStaffSummary.post}) - {selectedMonth}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingStaffSummary(null)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPaySalary} className="p-5 space-y-4 text-xs">
              
              {/* Optional Fixed Base Salary Setter & Attendance Calculation */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block text-xs">
                      Fixed Monthly Base Salary (₹): <span className="font-normal text-slate-400 text-[11px]">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Set or change employee's fixed monthly salary</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25000"
                    value={paySalaryForm.customBaseSalary}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, customBaseSalary: e.target.value })}
                    className="w-full sm:w-44 p-2 bg-white border border-slate-300 rounded-xl font-mono font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Base Monthly Rate:</span>
                    <span className="font-bold text-slate-900">
                      ₹{Number(paySalaryForm.customBaseSalary !== '' ? paySalaryForm.customBaseSalary : payingStaffSummary.baseSalary || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Present / Payable Days:</span>
                    <span className="font-bold text-indigo-700">{payingStaffSummary.payableDays} / {salaryMonthDays} Days</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Calculated Earned Salary:</span>
                    <span className="font-black text-emerald-800 text-xs sm:text-sm">
                      ₹{(salaryMonthDays > 0 ? Math.round(((Number(paySalaryForm.customBaseSalary !== '' ? paySalaryForm.customBaseSalary : payingStaffSummary.baseSalary) || 0) / salaryMonthDays) * payingStaffSummary.payableDays) : 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Adjustments (Bonus & Deductions) - Inputs are blank by default without prefilled 0 */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">+ Bonus (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paySalaryForm.bonus}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, bonus: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">+ Allowances (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paySalaryForm.allowances}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, allowances: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">- Deductions (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={paySalaryForm.deductions}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, deductions: e.target.value })}
                    className="w-full p-2 bg-white border border-rose-300 rounded-xl font-mono font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-inner flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">NET PAYABLE AMOUNT</p>
                  <p className="text-xl font-black">
                    {(() => {
                      const curBase = paySalaryForm.customBaseSalary !== '' ? Number(paySalaryForm.customBaseSalary) || 0 : Number(payingStaffSummary.baseSalary) || 0;
                      const curEarned = salaryMonthDays > 0 ? Math.round((curBase / salaryMonthDays) * payingStaffSummary.payableDays) : 0;
                      const curNet = Math.max(0, curEarned + (Number(paySalaryForm.bonus) || 0) + (Number(paySalaryForm.allowances) || 0) - (Number(paySalaryForm.deductions) || 0));
                      return `₹${curNet.toLocaleString('en-IN')}`;
                    })()}
                  </p>
                </div>
                <div className="text-right text-[11px] text-emerald-100">
                  {paySalaryForm.paymentMode}
                </div>
              </div>

              {/* Payment Mode & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Payment Mode</label>
                  <select
                    value={paySalaryForm.paymentMode}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, paymentMode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI / Online">UPI / PhonePe / GPay</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Payment Date</label>
                  <input
                    type="date"
                    value={paySalaryForm.paymentDate}
                    onChange={(e) => setPaySalaryForm({ ...paySalaryForm, paymentDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">UTR / Transaction Ref / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. UTR12345678 or Cheque #98765"
                  value={paySalaryForm.transactionRef}
                  onChange={(e) => setPaySalaryForm({ ...paySalaryForm, transactionRef: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              {/* Bank Details Display */}
              {payingStaffSummary.bankAccountNo && (
                <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 space-y-0.5">
                  <p><strong>Transfer to Bank:</strong> {payingStaffSummary.bankName} (A/C: {payingStaffSummary.bankAccountNo})</p>
                  <p><strong>IFSC:</strong> {payingStaffSummary.bankIfsc}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setPayingStaffSummary(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={salaryPayingLoading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {salaryPayingLoading ? 'Processing...' : 'Confirm & Disburse Salary'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINT SALARY PAYSLIP */}
      {/* ========================================================================= */}
      {printSlipRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto text-slate-900 animate-in fade-in duration-200">
            
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
              <span className="font-extrabold text-xs text-slate-700 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span>Print Salary Voucher / Payslip</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSlipRecord(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="p-8 space-y-5 text-xs text-slate-900">
              
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-900">PARAMVEER KANTA COLLEGE (PKC INSTITUTE)</h2>
                <p className="text-[11px] font-semibold text-slate-600">Higher Education, Technical & Vocational Directorate</p>
                <p className="text-[10px] text-slate-500">Recognized by UGC, Higher Education MP • Staff Payroll Disbursement Voucher</p>
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-widest">
                  SALARY PAYSLIP - {printSlipRecord.monthString}
                </div>
              </div>

              {/* Voucher Meta & Employee Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <p><strong>Voucher No:</strong> <span className="font-mono font-bold text-indigo-900">{printSlipRecord.voucherNo}</span></p>
                  <p><strong>Employee Name:</strong> <span className="font-bold">{printSlipRecord.staffName}</span></p>
                  <p><strong>Designation / Post:</strong> {printSlipRecord.post}</p>
                  <p><strong>Department:</strong> {printSlipRecord.department || 'Administration'}</p>
                </div>
                <div>
                  <p><strong>Payment Date:</strong> {printSlipRecord.paymentDate}</p>
                  <p><strong>Payment Mode:</strong> {printSlipRecord.paymentMode}</p>
                  <p><strong>Transaction Ref:</strong> {printSlipRecord.transactionRef || 'N/A'}</p>
                  <p><strong>Bank Details:</strong> {printSlipRecord.bankName || 'N/A'} ({printSlipRecord.bankAccountNo || 'Cash'})</p>
                </div>
              </div>

              {/* Attendance & Days Worked */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <div className="grid grid-cols-3 text-center divide-x divide-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Month Days</span>
                    <span className="font-extrabold text-sm text-slate-900">{printSlipRecord.totalDaysInMonth}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Payable Days</span>
                    <span className="font-extrabold text-sm text-emerald-800">{printSlipRecord.payableDays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Monthly Rate</span>
                    <span className="font-extrabold text-sm text-slate-900">₹{Number(printSlipRecord.baseSalary).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Earnings & Deductions Table */}
              <table className="w-full border border-slate-300 text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 text-left">Earnings Head</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                    <th className="p-2 text-left border-l border-slate-300">Deductions</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">Earned Salary ({printSlipRecord.payableDays} days)</td>
                    <td className="p-2 text-right font-mono">₹{Number(printSlipRecord.earnedSalary).toLocaleString('en-IN')}</td>
                    <td className="p-2 border-l border-slate-300">Advance / Penalty Deductions</td>
                    <td className="p-2 text-right font-mono text-rose-700">₹{Number(printSlipRecord.deductions || 0).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-2">Bonus / Incentive</td>
                    <td className="p-2 text-right font-mono">₹{Number(printSlipRecord.bonus || 0).toLocaleString('en-IN')}</td>
                    <td className="p-2 border-l border-slate-300">PF / Other</td>
                    <td className="p-2 text-right font-mono">₹0</td>
                  </tr>
                  <tr>
                    <td className="p-2">Allowances / Other</td>
                    <td className="p-2 text-right font-mono">₹{Number(printSlipRecord.allowances || 0).toLocaleString('en-IN')}</td>
                    <td className="p-2 border-l border-slate-300">—</td>
                    <td className="p-2 text-right font-mono">—</td>
                  </tr>
                  <tr className="bg-slate-50 font-black border-t-2 border-slate-300 text-sm">
                    <td className="p-2.5">NET SALARY PAID:</td>
                    <td colSpan="3" className="p-2.5 text-right font-black text-emerald-800 text-base">
                      ₹{Number(printSlipRecord.netSalaryPaid).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-center">
                <div className="border-t border-slate-400 pt-1.5 w-44">
                  <p className="font-bold text-[11px] text-slate-800">Employee Signature</p>
                  <p className="text-[10px] text-slate-400">{printSlipRecord.staffName}</p>
                </div>
                <div className="border-t border-slate-400 pt-1.5 w-44">
                  <p className="font-bold text-[11px] text-slate-800">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400">Accounts & Admin Authority</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
