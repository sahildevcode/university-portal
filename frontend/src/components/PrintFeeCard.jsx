import React, { useEffect } from 'react';
import { School, Printer, X, CheckCircle2, ArrowLeft, CreditCard } from 'lucide-react';

export default function PrintFeeCard({ student, payments = [], onClose }) {
  if (!student) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const acadFee = Number(student.academicFee !== undefined ? student.academicFee : (student.studentFee || student.courseFee || 0));
  const schAmt = Number(student.scholarshipAmount || 0);
  const totalFee = Number(student.totalFee !== undefined ? student.totalFee : (acadFee + schAmt));
  const totalPaid = Number(student.totalPaid || 0);
  const remainingDue = Math.max(0, totalFee - totalPaid);

  const studentPayments = payments && payments.length > 0
    ? payments
    : (student.payments || []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 py-6 sm:py-10 flex justify-center items-start"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[94vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Official Student Fee Card
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Fee Card</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="printable-area p-6 sm:p-8 bg-white text-slate-800 font-sans overflow-y-auto flex-1 text-xs">
          
          {/* Institute Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-700 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h1 className="font-serif font-black text-lg sm:text-2xl text-slate-900 uppercase tracking-tight">
                  PKC Education Learning Institute & Consultancy
                </h1>
                <p className="text-xs font-bold text-indigo-950">
                  पी.के.सी. शिक्षा प्रसार एवं जनकल्याण समिति, छतरपुर (म.प्र.)
                </p>
                <p className="text-[11px] text-slate-600">
                  Accounts & Financial Ledger Section • Official Student Fee Card
                </p>
              </div>
            </div>
            <div className="inline-block bg-slate-900 text-white font-extrabold text-xs px-5 py-1 rounded-full uppercase tracking-wider mt-2">
              Student Fee Card &amp; Payment Ledger (विद्यार्थी शुल्क कार्ड)
            </div>
          </div>

          {/* Student Identity & Course Details Grid */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-3.5 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Student Name:</span>
              <p className="font-bold text-slate-900 uppercase">{student.fullName || student.studentName}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Father's Name:</span>
              <p className="font-semibold text-slate-800 uppercase">{student.fatherName || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Roll / Enrollment No:</span>
              <p className="font-mono font-bold text-indigo-900">{student.rollNo}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Contact Mobile:</span>
              <p className="font-mono font-semibold text-slate-800">{student.phone || student.contact || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">University Name:</span>
              <p className="font-bold text-indigo-950">{student.universityName || 'PKC University / Board'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">College Name:</span>
              <p className="font-medium text-slate-800 truncate">{student.collegeName || 'PKC Education Institute'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Course / Branch:</span>
              <p className="font-bold text-slate-900">{student.courseName} {student.branch ? `(${student.branch})` : ''}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Current Class / Sem:</span>
              <p className="font-bold text-indigo-900">{student.currentClass || `SEM-${student.currentSemester || 1}`}</p>
            </div>
          </div>

          {/* Overall Fee Structure Summary Strip */}
          <div className="mb-5">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fee Structure Summary (शुल्क विवरण)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-2.5">
                <span className="text-slate-500 font-semibold block text-[10px] uppercase">Center Fee</span>
                <span className="font-black text-slate-900 text-sm font-mono">₹{acadFee.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-2.5">
                <span className="text-emerald-700 font-semibold block text-[10px] uppercase">Scholarship</span>
                <span className="font-black text-emerald-800 text-sm font-mono">₹{schAmt.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="bg-indigo-50/70 border border-indigo-300 rounded-xl p-2.5">
                <span className="text-indigo-700 font-semibold block text-[10px] uppercase">Total Fee</span>
                <span className="font-black text-indigo-950 text-sm font-mono">₹{totalFee.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="bg-teal-50/70 border border-teal-300 rounded-xl p-2.5">
                <span className="text-teal-700 font-semibold block text-[10px] uppercase">Total Paid</span>
                <span className="font-black text-teal-800 text-sm font-mono">₹{totalPaid.toLocaleString('en-IN')}/-</span>
              </div>
              <div className="bg-rose-50/70 border border-rose-300 rounded-xl p-2.5 col-span-2 sm:col-span-1">
                <span className="text-rose-700 font-semibold block text-[10px] uppercase">Remaining Due</span>
                <span className="font-black text-rose-800 text-sm font-mono">₹{remainingDue.toLocaleString('en-IN')}/-</span>
              </div>
            </div>
          </div>

          {/* Payment History Ledger Table */}
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Payment Installments Ledger (भुगतान विवरण)</span>
              <span className="text-[10px] text-slate-500 font-normal">Total Receipts: {studentPayments.length}</span>
            </h3>
            
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="py-2 px-2.5 border-r border-slate-700 text-center w-10">#</th>
                    <th className="py-2 px-3 border-r border-slate-700">Date</th>
                    <th className="py-2 px-2.5 border-r border-slate-700 text-center">Class</th>
                    <th className="py-2 px-3 border-r border-slate-700">Receipt No</th>
                    <th className="py-2 px-3 border-r border-slate-700">Purpose</th>
                    <th className="py-2 px-3 border-r border-slate-700">Payment Mode</th>
                    <th className="py-2 px-3 border-r border-slate-700">Ref No</th>
                    <th className="py-2 px-3 border-r border-slate-700">Received By</th>
                    <th className="py-2 px-3 text-right">Fee (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentPayments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-4 text-center text-slate-400 italic">
                        No payment installments recorded yet for this student.
                      </td>
                    </tr>
                  ) : (
                    studentPayments.map((p, idx) => {
                      const pDate = p.feeDate || (p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('en-IN') : '-');
                      const pAmt = Number(p.amountPaid || p.amount || 0);

                      return (
                        <tr key={p.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="py-2 px-2.5 border-r border-slate-200 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-2 px-3 border-r border-slate-200 whitespace-nowrap font-medium text-slate-800">{pDate}</td>
                          <td className="py-2 px-2.5 border-r border-slate-200 text-center font-semibold text-slate-700">{p.currentClass || student.currentClass || 'SEM-1'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-indigo-900">{p.receiptNo || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-800">{p.purpose || p.feeType || 'Tuition Fee'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-700">{p.paymentMode || 'Cash'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-600">{p.refNo || p.transactionRef || '-'}</td>
                          <td className="py-2 px-3 border-r border-slate-200 text-slate-700">{p.receivedBy || 'Admin Desk'}</td>
                          <td className="py-2 px-3 text-right font-black font-mono text-emerald-800 whitespace-nowrap">₹{pAmt.toLocaleString('en-IN')}/-</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {studentPayments.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                      <td colSpan="8" className="py-2 px-3 text-right text-slate-800 uppercase text-[10px]">
                        Total Fees Collected to Date:
                      </td>
                      <td className="py-2 px-3 text-right font-black font-mono text-emerald-800 text-xs">
                        ₹{totalPaid.toLocaleString('en-IN')}/-
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Official Signatures & Seal (Terms removed as requested) */}
          <div className="pt-6 mt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center break-inside-avoid print:break-inside-avoid">
            {/* 1. विद्यार्थी हस्ताक्षर */}
            <div className="flex flex-col items-center justify-end">
              <div className="h-9 w-32 sm:w-36 border-b border-slate-700 mb-1 flex items-end justify-center">
                {student.documents?.signature && (
                  <img src={student.documents.signature} alt="Student Signature" className="h-7 max-w-full object-contain mb-0.5" />
                )}
              </div>
              <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
                विद्यार्थी हस्ताक्षर
              </p>
            </div>

            {/* 2. अधिकृत लिपिक */}
            <div className="flex flex-col items-center justify-end">
              <div className="h-9 w-32 sm:w-36 border-b border-slate-700 mb-1 flex items-end justify-center"></div>
              <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
                हस्ताक्षर (प्राप्तकर्ता)
              </p>
            </div>

            {/* 3. संस्था संचालक हस्ताक्षर */}
            <div className="flex flex-col items-center justify-end">
              <div className="h-9 w-36 sm:w-44 border-b border-slate-700 mb-1 flex items-end justify-center">
                <span className="font-serif-univ font-bold text-indigo-950 text-[9px] opacity-80 mb-0.5">
                  PKC ACADEMY SEAL
                </span>
              </div>
              <p className="font-black text-[10.5px] sm:text-[11px] text-slate-900 whitespace-nowrap">
                संस्था संचालक हस्ताक्षर
              </p>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-100 text-[9px] text-slate-400 text-center">
            System generated Fee Statement issued on {new Date().toLocaleString('en-IN')}. For any discrepancies, contact Central Accounts Desk.
          </div>

        </div>
      </div>
    </div>
  );
}
