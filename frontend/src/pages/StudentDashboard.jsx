import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  CreditCard, 
  Award, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  QrCode, 
  PhoneCall, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';
import PrintMarksheet from '../components/PrintMarksheet';

export default function StudentDashboard({ studentUser, studentData, onRefresh, onLogout }) {
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('20000');
  const [paymentMode, setPaymentMode] = useState('UPI / QR Code');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);
  const [showMarksheetModal, setShowMarksheetModal] = useState(false);

  const student = studentData || {
    fullName: studentUser?.fullName || 'Student',
    rollNo: studentUser?.rollNo || 'UNIV202601',
    courseName: 'Enrolled Program',
    totalFee: 180000,
    totalPaid: 0,
    balanceDue: 180000,
    currentSemester: 1
  };

  const handleOnlinePay = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    try {
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNo: student.rollNo,
          amount: Number(payAmount),
          paymentMode: paymentMode,
          transactionRef: `ONL-${Math.floor(100000 + Math.random() * 900000)}`,
          paidFor: `Online Fee Payment - Semester ${student.currentSemester || 1}`,
          receivedBy: 'Apex Online Student Portal Gateway'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Payment failed');

      setPaySuccess(data.receipt);
      setShowPayModal(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/50 border border-indigo-400/30 flex items-center justify-center text-white text-2xl font-black shrink-0">
            {student.fullName?.charAt(0)}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Verified Student Account
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Welcome, {student.fullName}
            </h1>
            <p className="text-xs text-indigo-200 mt-0.5">
              Roll No: <span className="font-mono font-bold text-white">{student.rollNo}</span> | Program: <span className="font-bold text-white">{student.courseName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSlipModal(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Admission Slip</span>
          </button>
        </div>
      </div>

      {paySuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Payment of ₹{paySuccess.amountPaid.toLocaleString('en-IN')} Received!</p>
              <p className="text-[11px] text-emerald-700">Receipt No: <strong className="font-mono">{paySuccess.receiptNo}</strong> via {paySuccess.paymentMode}</p>
            </div>
          </div>
          <button
            onClick={() => setPaySuccess(null)}
            className="text-xs font-bold text-emerald-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Fee */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Total Course Fee</span>
          <span className="text-3xl font-black text-slate-900 block">
            ₹{Number(student.totalFee || 0).toLocaleString('en-IN')}
          </span>
          <p className="text-[11px] text-slate-500">Degree: {student.courseName}</p>
        </div>

        {/* Paid Fee */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Total Paid So Far</span>
          <span className="text-3xl font-black text-emerald-600 block">
            ₹{Number(student.totalPaid || 0).toLocaleString('en-IN')}
          </span>
          <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
            {student.balanceDue <= 0 ? 'Full Dues Cleared' : 'Installments Active'}
          </span>
        </div>

        {/* Balance Remaining */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Remaining Balance Due</span>
          <span className="text-3xl font-black text-rose-600 block">
            ₹{Number(student.balanceDue || 0).toLocaleString('en-IN')}
          </span>
          {student.balanceDue > 0 ? (
            <button
              onClick={() => setShowPayModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer mt-1"
            >
              Pay Dues Online Now
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-600 block">No Pending Dues!</span>
          )}
        </div>

      </div>

      {/* Payment Options Information Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <span>Flexible Fee Payment Channels</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Option A: Online */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <span className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-indigo-600" />
              Channel 1: Instant Online Payment
            </span>
            <p className="text-slate-600 leading-relaxed">
              Pay your semester fees directly from this dashboard using <strong>UPI (GPay / PhonePe / Paytm), Debit/Credit Card, or NetBanking</strong>. Your digital receipt is generated instantly.
            </p>
            {student.balanceDue > 0 && (
              <button
                onClick={() => setShowPayModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
              >
                Pay Online
              </button>
            )}
          </div>

          {/* Option B: Physical Campus Counter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-700" />
              Channel 2: College Campus Cash Counter
            </span>
            <p className="text-slate-600 leading-relaxed">
              If you prefer physical payment, visit the University Accounts Section (Room 104, Admin Block). The cash counter accepts <strong>Cash, Card Swipe (POS), and Demand Drafts</strong>.
            </p>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Counter Timings: Mon-Sat, 9:30 AM to 4:30 PM
            </span>
          </div>

        </div>
      </div>

      {/* Online Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPayModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-slate-900">Student Online Fee Portal</h3>
            
            <form onSubmit={handleOnlinePay} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Student & Roll No:</span>
                <span className="font-bold text-slate-900">{student.fullName} ({student.rollNo})</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Payment Amount (INR) *</label>
                <input
                  type="number"
                  value={payAmount}
                  max={student.balanceDue}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full p-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Maximum Remaining: ₹{Number(student.balanceDue).toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Select Payment Method</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="UPI / QR Code (GPay, PhonePe, Paytm)">UPI / QR Code (GPay, PhonePe, Paytm)</option>
                  <option value="Debit / Credit Card">Debit / Credit Card</option>
                  <option value="NetBanking (All Indian Banks)">NetBanking (All Indian Banks)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold">Cancel</button>
                <button type="submit" disabled={payLoading} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md">
                  {payLoading ? 'Processing...' : `Pay ₹${Number(payAmount || 0).toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slip Modal */}
      {showSlipModal && (
        <PrintAdmissionSlip
          student={student}
          onClose={() => setShowSlipModal(false)}
        />
      )}

    </div>
  );
}
