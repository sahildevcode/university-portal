import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Landmark, Printer, X, CheckCircle2, ArrowLeft, Building2 } from 'lucide-react';

export default function PrintUniversityVoucher({ voucher, onClose }) {
  if (!voucher) return null;

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-amber-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Close"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Wapas</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
              <CheckCircle2 className="w-4 h-4" /> Official University Settlement Voucher
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Voucher</span>
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

        {/* Scrollable Printable Voucher Area */}
        <div className="printable-area p-6 sm:p-8 bg-white text-slate-800 font-sans overflow-y-auto flex-1">
          {/* Header */}
          <div className="border-b-2 border-amber-800 pb-4 mb-5 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h1 className="font-serif-univ font-black text-lg sm:text-xl text-slate-900 uppercase tracking-tight">
                  PKC Education Learning Institute &amp; Consultancy
                </h1>
                <p className="text-xs font-bold text-amber-900">
                  पी.के.सी. शिक्षा प्रसार एवं जनकल्याण समिति, छतरपुर (म.प्र.)
                </p>
                <p className="text-[11px] text-slate-600 font-medium">
                  University Admission Liaison &amp; Official Fee Settlement Cell
                </p>
              </div>
            </div>
            <div className="inline-block bg-amber-900 text-amber-100 font-bold text-[11px] px-4 py-0.5 rounded-full uppercase tracking-wider mt-2 border border-amber-700">
              🏛️ University Paid Settlement Voucher (विश्वविद्यालय शुल्क वाउचर)
            </div>
          </div>

          {/* Voucher Meta Details */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 mb-5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Voucher Reference No:</span>
              <p className="font-bold text-sm text-amber-950 font-mono">{voucher.voucherNo || `UVCH-${Date.now()}`}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Payment Settlement Date:</span>
              <p className="font-semibold text-slate-800">
                {new Date(voucher.paymentDate || Date.now()).toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Payment Mode / Method:</span>
              <p className="font-bold text-amber-900 uppercase">{voucher.paymentMode || 'Bank NEFT / RTGS'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-medium block text-[10px]">Bank UTR / Challan / Ref No:</span>
              <p className="font-mono font-bold text-slate-900">{voucher.transactionRef || 'BANK-DIRECT-DEPOSIT'}</p>
            </div>
          </div>

          {/* University & College Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 text-xs space-y-1.5">
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500 font-medium">Beneficiary University:</span>
              <span className="font-bold text-indigo-900 uppercase text-right">{voucher.universityName || 'Partner University'}</span>
            </div>
            {voucher.collegeName && (
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 font-medium">Affiliated College / Center:</span>
                <span className="font-semibold text-slate-800 text-right">{voucher.collegeName}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-200 pb-1.5">
              <span className="text-slate-500 font-medium">Payment Purpose:</span>
              <span className="font-semibold text-slate-800">{voucher.purpose || 'Official University Fee Deposit'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Paid Installment / Semester:</span>
              <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                {voucher.paidSemester || `Semester ${voucher.currentSemester || 1}`}
              </span>
            </div>
          </div>

          {/* Student Specifics */}
          <div className="border border-slate-200 rounded-xl p-3.5 mb-5 text-xs space-y-1.5">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Student Name:</span>
              <span className="font-bold text-slate-900 uppercase">{voucher.studentName}</span>
            </div>
            {voucher.fatherName && (
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500 font-medium">Father's Name:</span>
                <span className="font-semibold text-slate-700">{voucher.fatherName}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Enrollment / Roll No:</span>
              <span className="font-bold font-mono text-indigo-900">{voucher.rollNo}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Degree Program / Course:</span>
              <span className="font-semibold text-slate-800">{voucher.courseName}</span>
            </div>
            {voucher.remark && (
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Counselor Remarks:</span>
                <span className="font-medium text-slate-600 italic text-right">{voucher.remark}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="mb-6">
            <div className="bg-amber-500/10 border-2 border-amber-500 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block mb-1">
                Amount Paid to University (यूनिवर्सिटी को जमा की गई राशि)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                ₹{Number(voucher.amountPaidToUniversity || voucher.amountPaid || 0).toLocaleString('en-IN')}.00
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">
                Certified counselor deposit on behalf of student into university bank account.
              </p>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-6 items-end text-xs">
            <div className="text-left space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Recorded By:</div>
              <p className="font-bold text-slate-800">{voucher.recordedBy || 'Admin Counselor'}</p>
              <p className="text-[10px] text-slate-500">PKC Consultancy Desk</p>
            </div>
            <div className="text-right space-y-1">
              <div className="inline-block border-b-2 border-slate-400 pb-1 mb-1 w-36"></div>
              <p className="font-bold text-slate-900 uppercase tracking-tight">Authorized Signatory</p>
              <p className="text-[10px] text-slate-500">PKC Education &amp; Consultancy, Chhatarpur</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
