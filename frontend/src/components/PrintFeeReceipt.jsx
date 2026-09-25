import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { School, Printer, X, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrintFeeReceipt({ receipt, onClose }) {
  if (!receipt) return null;

  const totalCourseFee = Number(
    receipt.totalFee !== undefined && receipt.totalFee !== null && Number(receipt.totalFee) > 0
      ? receipt.totalFee
      : (receipt.academicFee || receipt.studentFee || receipt.totalPackageFee || receipt.courseFee || 0)
  );

  const totalPaidTillDate = Number(
    receipt.totalPaidToDate !== undefined && receipt.totalPaidToDate !== null && Number(receipt.totalPaidToDate) > 0
      ? receipt.totalPaidToDate
      : (receipt.totalPaid !== undefined && receipt.totalPaid !== null && Number(receipt.totalPaid) > 0
          ? receipt.totalPaid
          : (receipt.paidFee || receipt.amountPaid || receipt.amount || 0))
  );

  const remainingDueBalance = Number(
    receipt.balanceRemaining !== undefined && receipt.balanceRemaining !== null
      ? receipt.balanceRemaining
      : (receipt.remainingDues !== undefined && receipt.remainingDues !== null
          ? receipt.remainingDues
          : (receipt.balanceDue !== undefined && receipt.balanceDue !== null
              ? receipt.balanceDue
              : Math.max(0, totalCourseFee - totalPaidTillDate)))
  );

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

  return createPortal(
    <div 
      className="fixed inset-0 z-[10001] bg-slate-950/85 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start sm:items-center"
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
              <p className="font-bold text-indigo-900 uppercase">
                {receipt.paymentMode?.toLowerCase().includes('upi') || receipt.paymentMode?.toLowerCase().includes('online')
                  ? 'UPI / ONLINE'
                  : (receipt.paymentMode?.toLowerCase().includes('cash') ? 'CASH (नकद)' : (receipt.paymentMode || 'CASH'))}
              </p>
            </div>
            <div>
              {(receipt.paymentMode?.toLowerCase().includes('upi') || receipt.paymentMode?.toLowerCase().includes('online') || receipt.paymentMode?.toLowerCase().includes('bank')) ? (
                <>
                  <span className="text-slate-500 font-medium block text-[10px]">UPI UTR / Reference No:</span>
                  <p className="font-mono font-black text-slate-900">
                    {(receipt.transactionRef && receipt.transactionRef !== 'CASH-COUNTER') ? receipt.transactionRef : (receipt.refNo || receipt.upiId || receipt.utrNo || '-')}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-slate-500 font-medium block text-[10px]">Payment Channel:</span>
                  <p className="font-bold text-slate-900">
                    Direct Cash Counter
                  </p>
                </>
              )}
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
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      {receipt.paidFor || 'Fee Installment'}
                      {((receipt.paymentMode?.toLowerCase().includes('upi') || receipt.paymentMode?.toLowerCase().includes('online')) && (receipt.transactionRef || receipt.refNo || receipt.upiId) && receipt.transactionRef !== 'CASH-COUNTER') ? (
                        <span className="ml-1 text-amber-900 font-mono font-bold bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                          UTR Ref: {receipt.transactionRef || receipt.refNo || receipt.upiId}
                        </span>
                      ) : (
                        <span className="ml-1 text-slate-500">
                          (Direct Cash Deposit)
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="p-2.5 border border-slate-300 font-black text-right text-slate-900 font-mono">
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
              <span className="font-bold text-slate-800">₹{totalCourseFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-r border-slate-200 pr-2">
              <span className="text-slate-500 block text-[10px]">Total Paid Till Date</span>
              <span className="font-bold text-emerald-700">₹{totalPaidTillDate.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Remaining Due Balance</span>
              <span className="font-bold text-rose-700">₹{remainingDueBalance.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Official Signatures & Seal (Terms removed as requested) */}
          <div className="pt-6 mt-4 border-t border-slate-300 grid grid-cols-3 gap-4 text-center break-inside-avoid print:break-inside-avoid">
            {/* 1. विद्यार्थी हस्ताक्षर */}
            <div className="flex flex-col items-center justify-end">
              <div className="h-9 w-32 sm:w-36 border-b border-slate-700 mb-1 flex items-end justify-center">
                {receipt.studentSignature && (
                  <img src={receipt.studentSignature} alt="Student Signature" className="h-7 max-w-full object-contain mb-0.5" />
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
    </div>,
    document.body
  );
}
