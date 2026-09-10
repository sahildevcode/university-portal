import React, { useEffect } from 'react';
import { School, Printer, X, CheckCircle2, ShieldCheck, User, ArrowLeft } from 'lucide-react';

export default function PrintAdmissionSlip({ student, receipt, onClose }) {
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[92vh] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-slate-700"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 font-semibold text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Registration Slip
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Slip
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Content */}
        <div className="printable-area p-6 sm:p-8 bg-white text-slate-800 font-sans overflow-y-auto text-xs space-y-5">
          
          {/* Header Section with University Seal */}
          <div className="border-b-2 border-indigo-950 pb-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-700 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h1 className="font-serif-univ font-black text-xl tracking-tight text-indigo-950 uppercase">
                  PKC Education Group
                </h1>
                <p className="text-[11px] font-bold text-indigo-900">
                  PKC Education Learning Institute & Consultancy
                </p>
                <p className="text-[10px] text-slate-500">
                  Campus: Chhatarpur (M.P.) | Contact: +91 99882 23344
                </p>
              </div>
            </div>
            <div className="inline-block bg-indigo-950 text-white font-bold text-[10px] px-4 py-0.5 rounded-full uppercase tracking-wider mt-1">
              Provisional Admission Confirmation Slip ({student.admissionYear || 2026}-{(student.admissionYear || 2026) + 1})
            </div>
          </div>

          {/* Student Identification & Photo Box */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="col-span-2 space-y-1.5">
              <div className="grid grid-cols-2 gap-2 pb-1 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll Number</span>
                  <span className="font-mono font-bold text-sm text-indigo-950">{student.rollNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Registration No</span>
                  <span className="font-mono font-bold text-xs text-indigo-950">{student.registrationNo}</span>
                </div>
              </div>

              <div className="space-y-0.5 text-[11px]">
                <div className="flex"><span className="w-28 text-slate-400">Student Name:</span><strong className="text-slate-900 uppercase">{student.fullName}</strong></div>
                <div className="flex"><span className="w-28 text-slate-400">Father's Name:</span><span className="font-medium text-slate-800">{student.fatherName}</span></div>
                <div className="flex"><span className="w-28 text-slate-400">Mother's Name:</span><span className="font-medium text-slate-800">{student.motherName || 'N/A'}</span></div>
                <div className="flex"><span className="w-28 text-slate-400">DOB / Gender:</span><span className="text-slate-700">{student.dob} / {student.gender} ({student.socialCategory || student.category || 'General'})</span></div>
                <div className="flex"><span className="w-28 text-slate-400">Mobile / Email:</span><span className="text-slate-700">{student.phone} | {student.email}</span></div>
                <div className="flex"><span className="w-28 text-slate-400">Aadhaar / Samagra:</span><span className="font-mono text-slate-900 font-semibold">{student.aadhaarNo || student.aadharNo || 'N/A'} | {student.samagraId || 'N/A'}</span></div>
                <div className="flex"><span className="w-28 text-slate-400">ABC / MPTASS ID:</span><span className="font-mono text-slate-900 font-semibold">{student.abcId || 'N/A'} | {student.mpTassId || 'N/A'}</span></div>
                <div className="flex"><span className="w-28 text-slate-400">Address:</span><span className="text-slate-600 truncate">{student.address}</span></div>
              </div>
            </div>

            {/* Photo */}
            <div className="col-span-1 flex flex-col items-center justify-center border-l border-slate-200 pl-3">
              <div className="w-24 h-28 border border-slate-300 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-xs">
                {student.studentImage || student.documents?.photo ? (
                  <img src={student.studentImage || student.documents?.photo} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <User className="w-8 h-8 text-indigo-400 mx-auto" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase mt-1">Verified Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enrolled Program Details */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-indigo-950 mb-1.5">
              1. Enrolled Degree Course &amp; University Affiliation
            </h4>
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border border-slate-300">University / College</th>
                  <th className="p-2 border border-slate-300">Degree Course &amp; Branch</th>
                  <th className="p-2 border border-slate-300 text-center">Session / Satra</th>
                  <th className="p-2 border border-slate-300 text-center">Medium</th>
                  <th className="p-2 border border-slate-300 text-right">Total Course Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300">
                    <strong className="text-indigo-950 block">{student.universityName || 'State University'}</strong>
                    <span className="text-[10px] text-slate-500">{student.collegeName || 'Affiliated Campus'}</span>
                  </td>
                  <td className="p-2 border border-slate-300">
                    <strong className="text-indigo-900 block">{student.courseName}</strong>
                    <span className="text-[10px] text-slate-500">{student.branch ? `Branch: ${student.branch}` : ''} ({student.courseType || 'Regular'})</span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center">
                    <span className="font-semibold block">{student.admissionSession || student.currentSession || '2026-2027'}</span>
                    <span className="text-[10px] text-slate-500">Satra: {student.admissionSatra || student.currentSatra || 'July'} ({student.currentClass || `SEM-${student.currentSemester || 1}`})</span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center font-semibold text-slate-800">
                    {student.medium || 'Hindi'}
                  </td>
                  <td className="p-2 border border-slate-300 font-extrabold text-right text-slate-900">
                    ₹{Number(student.studentFee || student.totalFee || 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Qualifying Academic Background */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-indigo-950 mb-1.5">
              2. Qualifying Examination Background
            </h4>
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border border-slate-300">Exam Level</th>
                  <th className="p-2 border border-slate-300">Board</th>
                  <th className="p-2 border border-slate-300 text-center">Year</th>
                  <th className="p-2 border border-slate-300 text-center">Marks</th>
                  <th className="p-2 border border-slate-300 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-300 font-medium">10th (High School)</td>
                  <td className="p-2 border border-slate-300">{student.academic10th?.board || 'CBSE'}</td>
                  <td className="p-2 border border-slate-300 text-center">{student.academic10th?.passingYear || '-'}</td>
                  <td className="p-2 border border-slate-300 text-center">{student.academic10th?.marksObtained}/{student.academic10th?.totalMarks}</td>
                  <td className="p-2 border border-slate-300 font-bold text-right text-indigo-950">{student.academic10th?.percentage}%</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-300 font-medium">12th (Higher Secondary)</td>
                  <td className="p-2 border border-slate-300">{student.academic12th?.board || 'CBSE'}</td>
                  <td className="p-2 border border-slate-300 text-center">{student.academic12th?.passingYear || '-'}</td>
                  <td className="p-2 border border-slate-300 text-center">{student.academic12th?.marksObtained}/{student.academic12th?.totalMarks}</td>
                  <td className="p-2 border border-slate-300 font-bold text-right text-indigo-950">{student.academic12th?.percentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Fee Summary */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-[11px]">
            <div>
              <span className="text-slate-500">Initial Paid:</span>
              <span className="font-bold text-emerald-700 ml-1">₹{Number(student.totalPaid || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500">Remaining Balance:</span>
              <span className="font-bold text-rose-700 ml-1">₹{Number(student.balanceDue || 0).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-indigo-900 ml-1">{student.balanceDue <= 0 ? 'Fully Paid' : 'Installment Active'}</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-6 text-[10px] text-center">
            <div>
              <div className="h-7 border-b border-slate-400 w-36 mx-auto mb-1 flex items-end justify-center">
                {student.documents?.signature && (
                  <img src={student.documents.signature} alt="Sign" className="h-6 object-contain" />
                )}
              </div>
              <p className="font-semibold text-slate-700">Candidate Signature</p>
            </div>
            <div>
              <div className="h-7 border-b border-slate-400 w-36 mx-auto mb-1 flex items-end justify-center">
                <span className="font-serif-univ font-bold text-indigo-950 text-[10px]">REGISTRAR</span>
              </div>
              <p className="font-semibold text-slate-700">PKC Education Admission Seal</p>
            </div>
          </div>

        </div>

        {/* Bottom Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel / Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print Admission Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
