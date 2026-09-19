import React, { useEffect } from 'react';
import { School, Printer, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import StudentTermsAndConditions from './StudentTermsAndConditions';

export default function PrintFeeReceipt({ receipt, onClose }) {
  if (!receipt) return null;

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

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Always Fixed at Top, Never Cut Off) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Back to Counter"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Official Fee Receipt
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
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

        {/* Scrollable Printable Receipt Area */}
        <div className="printable-area p-6 sm:p-8 bg-white text-slate-800 font-sans overflow-y-auto flex-1">
          
          {/* University Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-700 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h1 className="font-serif-univ font-black text-lg sm:text-xl text-slate-900 uppercase tracking-tight">
                  PKC Education Learning Institute & Consultancy
                </h1>
                <p className="text-xs font-bold text-indigo-900">
                  पी.के.सी. शिक्षा प्रसार एवं जनकल्याण समिति, छतरपुर | Central Accounts Division
                </p>
              </div>
            </div>
            <div className="inline-block bg-slate-900 text-white font-bold text-[11px] px-4 py-0.5 rounded-full uppercase tracking-wider mt-1">
              Official Fee Payment Receipt
            </div>
          </div>

          {/* Receipt Meta Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Receipt Serial No:</span>
              <p className="font-bold text-sm text-slate-900 font-mono">{receipt.receiptNo}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Payment Date & Time:</span>
              <p className="font-semibold text-slate-800">
                {new Date(receipt.paymentDate).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Payment Method:</span>
              <p className="font-bold text-indigo-900 uppercase">{receipt.paymentMode}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Transaction / Ref ID:</span>
              <p className="font-mono font-bold text-slate-900">{receipt.transactionRef || 'CASH-COUNTER'}</p>
            </div>
          </div>

          {/* Student Particulars */}
          <div className="border border-slate-200 rounded-xl p-3.5 mb-5 text-xs space-y-1.5">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <span className="font-bold text-slate-900 uppercase">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Roll Number:</span>
              <span className="font-bold font-mono text-indigo-900">{receipt.rollNo}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">College / Institute:</span>
              <span className="font-bold text-slate-800">{receipt.collegeName || 'PKC Education Learning Institute & Consultancy'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Enrolled Course:</span>
              <span className="font-semibold text-slate-800">{receipt.courseName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Current Semester &amp; Class:</span>
              <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                {receipt.currentClass || ('SEM-' + (receipt.currentSemester || 1))} {receipt.totalSemesters ? `(Semester ${receipt.currentSemester || 1} of ${receipt.totalSemesters})` : ''}
              </span>
            </div>
            {receipt.semesterFeeStatus && (
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">Semester Progression Status:</span>
                <span className="font-semibold text-emerald-700">{receipt.semesterFeeStatus}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Fee Category / Type:</span>
              <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {receipt.feeType || 'Tuition / Semester Fee'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Payment Purpose / Remarks:</span>
              <span className="font-semibold text-slate-800">{receipt.paidFor || 'Semester Academic Fee'}</span>
            </div>
          </div>

          {/* Amount Breakdown Table */}
          <div className="mb-5">
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5 border border-slate-300">Fee Particulars &amp; Description</th>
                  <th className="p-2.5 border border-slate-300 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border border-slate-300 font-medium">
                    <span className="font-bold text-slate-900 block">{receipt.feeType || 'Tuition / Semester Fee'}</span>
                    <span className="text-[11px] text-slate-500">{receipt.paidFor || 'Fee Installment'}</span>
                  </td>
                  <td className="p-2.5 border border-slate-300 font-bold text-right text-slate-900">
                    ₹{Number(receipt.amountPaid).toLocaleString('en-IN')}.00
                  </td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold text-emerald-950">
                  <td className="p-2.5 border border-slate-300 text-xs">TOTAL AMOUNT RECEIVED</td>
                  <td className="p-2.5 border border-slate-300 text-right text-sm text-emerald-700 font-extrabold">
                    ₹{Number(receipt.amountPaid).toLocaleString('en-IN')}.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Account Balance Status */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center text-xs mb-6">
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[10px]">Total Course Fee</span>
              <span className="font-bold text-slate-800">₹{Number(receipt.totalFee || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[10px]">Total Paid Till Date</span>
              <span className="font-bold text-emerald-700">₹{Number(receipt.totalPaidToDate || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Remaining Due Balance</span>
              <span className="font-bold text-rose-700">₹{Number(receipt.balanceRemaining || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Official Terms & Conditions (नियम एवं शर्तें) & Signatures */}
          <StudentTermsAndConditions
            compact={true}
            showSignatures={true}
          />

        </div>

        {/* Bottom Control Bar (Always Visible at Bottom for Easy Back/Cut/Print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Wapas Jayein / Close</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
}
