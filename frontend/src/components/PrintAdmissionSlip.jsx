import React, { useEffect } from 'react';
import { School, Printer, X, CheckCircle2, ShieldCheck, User, ArrowLeft, CheckCircle, FileText, Sparkles, Building2, BookOpen } from 'lucide-react';
import StudentTermsAndConditions from './StudentTermsAndConditions';

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

  // Helper to resolve student photo reliably across all possible keys
  const photoSrc = student.studentImage || 
                   student.photo || 
                   student.photoUrl || 
                   student.documents?.student_image || 
                   student.documents?.photo || 
                   student.documentsStatus?.['Passport Photos (4 Copies)']?.fileUrl ||
                   (student.documentsStatus && Object.values(student.documentsStatus).find(d => d?.fileUrl && (String(d.docName || '').toLowerCase().includes('photo') || String(d.docName || '').toLowerCase().includes('passport')))?.fileUrl) ||
                   '';

  // Helper to extract submitted document checklist items
  const submittedDocsList = Array.isArray(student.documentSubmit) 
    ? student.documentSubmit 
    : (typeof student.documentSubmit === 'string' && student.documentSubmit.trim()
        ? (() => {
            try {
              const parsed = JSON.parse(student.documentSubmit);
              return Array.isArray(parsed) ? parsed : [student.documentSubmit];
            } catch {
              return student.documentSubmit.split(',').map(s => s.trim()).filter(Boolean);
            }
          })()
        : (student.documentsStatus 
            ? Object.keys(student.documentsStatus).filter(k => {
                const item = student.documentsStatus[k];
                return item && item.status !== 'pending' && item.status !== 'not_submitted';
              })
            : []));

  // Determine connected/secondary dual program if present
  const linkedCourses = Array.isArray(student.linkedCourses) ? student.linkedCourses : [];

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 py-4 sm:py-8 flex justify-center items-start"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[94vh] animate-fadeIn"
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
              <CheckCircle2 className="w-4 h-4" /> Official Admission Registration Slip
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
        <div className="printable-area p-5 sm:p-7 bg-white text-slate-800 font-sans overflow-y-auto text-xs space-y-4">
          
          {/* Header Section with University Seal */}
          <div className="border-b-2 border-indigo-950 pb-3 text-center">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-700 bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="text-left">
                <h1 className="font-serif-univ font-black text-xl tracking-tight text-indigo-950 uppercase leading-none">
                  PKC Education Group
                </h1>
                <p className="text-[11px] font-bold text-indigo-900 mt-1">
                  PKC Education Learning Institute &amp; Consultancy
                </p>
                <p className="text-[10px] text-slate-500">
                  Campus: Chhatarpur (M.P.) | Contact: +91 7000212637 | Website: pkceducation.in
                </p>
              </div>
            </div>
            <div className="inline-block bg-indigo-950 text-white font-bold text-[10px] px-4 py-0.5 rounded-full uppercase tracking-wider mt-1">
              Provisional Admission Confirmation Slip ({student.admissionSession || `${student.admissionYear || 2026}-${(student.admissionYear || 2026) + 1}`})
            </div>
          </div>

          {/* SECTION 1: Personal & Family Particulars + Identity Dossier */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="md:col-span-3 space-y-2">
              <div className="grid grid-cols-3 gap-2 pb-1.5 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Roll Number</span>
                  <span className="font-mono font-bold text-xs text-indigo-950">{student.rollNo || 'Pending Allocation'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Registration No</span>
                  <span className="font-mono font-bold text-xs text-indigo-950">{student.registrationNo || student.id || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Enrollment No</span>
                  <span className="font-mono font-bold text-xs text-slate-800">{student.enrollmentNo || student.rollNo || '-'}</span>
                </div>
              </div>

              {/* 3-Column Balanced Personal Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">Student Name:</span>
                  <strong className="text-slate-900 uppercase">{student.fullName || student.studentName || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Father's Name:</span>
                  <span className="font-medium text-slate-800 uppercase">{student.fatherName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Mother's Name:</span>
                  <span className="font-medium text-slate-800 uppercase">{student.motherName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Date of Birth / Gender:</span>
                  <span className="text-slate-800 font-medium">{student.dob || '-'} / {student.gender || 'Male'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Social Category:</span>
                  <span className="font-bold text-indigo-700">{student.socialCategory || student.category || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Blood Group:</span>
                  <span className="font-bold text-rose-700">{student.bloodGroup || 'NA'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px]">Mobile Contact:</span>
                  <span className="font-mono text-slate-800 font-semibold">{student.phone || student.contact || '-'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[9px]">Email Address:</span>
                  <span className="text-slate-800 font-medium">{student.email || 'N/A'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-0.5">
                  <span className="text-slate-400 block text-[9px]">Residential Address:</span>
                  <span className="text-slate-700 font-medium">{student.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* Photo & Signature Frame */}
            <div className="md:col-span-1 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3">
              <div className="w-24 h-28 border border-slate-300 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-xs">
                {photoSrc ? (
                  <img src={photoSrc} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <User className="w-8 h-8 text-indigo-400 mx-auto" />
                    <span className="text-[9px] text-slate-400 font-bold block uppercase mt-1">Verified Photo</span>
                  </div>
                )}
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight">Passport Photo</span>
            </div>
          </div>

          {/* SECTION 2: Identity & Government Portal KYC Verification IDs */}
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-1.5">
            <div className="flex items-center justify-between border-b border-amber-200 pb-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Identity &amp; Government Portal KYC Verification IDs (शासकीय पोर्टल व छात्रवृत्ति पहचान)</span>
              </span>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.2 rounded">
                Verified Portal Records
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[10px]">
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">Aadhaar No</span>
                <span className="font-mono font-bold text-slate-900">{student.aadhaarNo || student.aadharNo || 'N/A'}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">Samagra ID</span>
                <span className="font-mono font-bold text-indigo-950">{student.samagraId || 'N/A'}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">ABC ID</span>
                <span className="font-mono font-bold text-indigo-950">{student.abcId || 'N/A'}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">MPTASS ID</span>
                <span className="font-mono font-bold text-emerald-800">{student.mptassId || student.mpTassId || 'N/A'}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">OTR ID</span>
                <span className="font-mono font-bold text-slate-900">{student.otrId || 'N/A'}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-amber-200/80">
                <span className="text-slate-400 block text-[8px] uppercase">DEB / Scholer ID</span>
                <span className="font-mono font-bold text-slate-900">{student.debId || student.scholerId || student.scholarId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: Academic Program, University Affiliation & Session */}
          <div>
            <h4 className="font-bold text-[11px] uppercase tracking-wider text-indigo-950 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-700" />
                <span>1. Enrolled Degree Course &amp; University Affiliation</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-500 font-sans">
                Admission Date: <strong>{student.admissionDate || new Date().toISOString().split('T')[0]}</strong>
              </span>
            </h4>
            <table className="w-full text-left text-[11px] border border-slate-300">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2 border border-slate-300">University / College</th>
                  <th className="p-2 border border-slate-300">Degree Course &amp; Branch</th>
                  <th className="p-2 border border-slate-300 text-center">Session / Satra</th>
                  <th className="p-2 border border-slate-300 text-center">Class / Medium</th>
                  <th className="p-2 border border-slate-300 text-right">Course Package Fee</th>
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
                    <span className="text-[10px] text-slate-500">{student.branch ? `Branch: ${student.branch}` : ''} ({student.courseType || 'UG'}) • {student.courseMode || 'Regular'}</span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center">
                    <span className="font-semibold block">{student.admissionSession || student.currentSession || '2026-2027'}</span>
                    <span className="text-[10px] text-slate-500">Satra: {student.admissionSatra || student.currentSatra || 'July'}</span>
                  </td>
                  <td className="p-2 border border-slate-300 text-center">
                    <span className="font-bold text-slate-900 block">{student.currentClass || `SEM-${student.currentSemester || 1}`}</span>
                    <span className="text-[10px] text-slate-600">{student.medium || 'Hindi Medium'}</span>
                  </td>
                  <td className="p-2 border border-slate-300 font-extrabold text-right text-slate-900 font-mono">
                    <span className="text-xs block">₹{Number(student.totalFee || (Number(student.academicFee || student.courseFee || student.studentFee || 0) + Number(student.admissionFee || 0))).toLocaleString('en-IN')}/-</span>
                    {student.scholarshipAmount > 0 && (
                      <span className="text-[9px] text-purple-700 block font-normal">
                        (Scholarship: ₹{Number(student.scholarshipAmount).toLocaleString('en-IN')})
                      </span>
                    )}
                  </td>
                </tr>

                {/* Secondary / Dual Program Row if Enrolled */}
                {linkedCourses.map((lc, idx) => (
                  <tr key={lc.id || idx} className="bg-amber-50/40 border-t border-amber-200">
                    <td className="p-2 border border-slate-300">
                      <strong className="text-amber-950 block">{lc.universityName || student.universityName}</strong>
                      <span className="text-[10px] text-amber-800">{lc.collegeName || student.collegeName}</span>
                    </td>
                    <td className="p-2 border border-slate-300">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-amber-900">{lc.courseName}</strong>
                        <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-black">Dual Program</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{lc.branch || 'General'} ({lc.courseType || 'Diploma'})</span>
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-medium">
                      {student.admissionSession || '2026-2027'}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-medium">
                      {lc.currentClass || 'SEM-1'}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold text-right text-slate-900 font-mono">
                      ₹{Number(lc.totalFee || lc.courseFee || 0).toLocaleString('en-IN')}/-
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SECTION 4: Submitted Documents & Verification Checklist */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-800 block">
              2. Submitted Verification Documents (दस्तावेज सत्यापन सूची)
            </span>
            {submittedDocsList && submittedDocsList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {submittedDocsList.map((doc, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">Physical KYC and original verification documents pending submission at college desk.</p>
            )}
          </div>

          {/* SECTION 5: Fee Receipt, Payment Breakdown & Administrative Authorization */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-[11px]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Fee Category Plan</span>
                <strong className="text-indigo-950 font-bold text-[11px]">
                  {student.feeCategory === 'full_scholarship'
                    ? 'Full Scholarship Base'
                    : student.feeCategory === 'course_fee_scholarship'
                      ? 'Course Fees + Scholarship'
                      : 'Full Course Fee Base'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Fee Head / Purpose</span>
                <strong className="text-indigo-950 font-bold text-[11px]">{student.feeType || receipt?.feeType || 'Admission Fee'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Amount Received Now</span>
                <span className="font-extrabold text-emerald-700 font-mono text-sm">₹{Number(student.totalPaid || student.initialPayment || receipt?.amountPaid || 0).toLocaleString('en-IN')}/-</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Balance Due</span>
                <span className="font-extrabold text-rose-700 font-mono text-sm">₹{Number(student.balanceDue || 0).toLocaleString('en-IN')}/-</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-600 pt-0.5">
              <div><span>Payment Mode: </span><strong className="text-slate-900 font-semibold">{student.paymentMode || receipt?.paymentMode || 'Cash / Desk'}</strong></div>
              <div><span>Txn / Receipt Ref: </span><strong className="font-mono text-slate-900 font-semibold">{student.reference || receipt?.refNo || student.registrationNo || '-'}</strong></div>
              <div><span>Authorized Officer: </span><strong className="text-slate-900 font-semibold">{student.feeCollectedBy || receipt?.receivedBy || 'Admissions Authority'}</strong></div>
              <div><span>Admission Desk Status: </span><strong className="text-emerald-700 font-bold">{student.status || 'Active Confirmed'}</strong></div>
            </div>

            {student.remark && (
              <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-600">
                <span className="font-bold text-slate-700">Admission Remark: </span>
                <span className="italic">{student.remark}</span>
              </div>
            )}
          </div>

          {/* Official Terms & Conditions (नियम एवं शर्तें) & Signatures */}
          <StudentTermsAndConditions
            studentSignatureImage={student.documents?.signature}
            compact={true}
            showSignatures={true}
          />

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
