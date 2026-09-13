import React, { useState, useRef } from 'react';
import { 
  X, Download, UploadCloud, FileSpreadsheet, FileText, CheckCircle2, 
  AlertCircle, Trash2, RefreshCw, Check, Users, 
  CreditCard, ShieldAlert, Sparkles, HelpCircle
} from 'lucide-react';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess, operatorName = 'Admin' }) {
  const [activeTab, setActiveTab] = useState('excel'); // 'excel' | 'pdf' | 'reset'
  const [file, setFile] = useState(null);
  const [pdfRawText, setPdfRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Parsed records state
  const [parsedStudents, setParsedStudents] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [clearExisting, setClearExisting] = useState(false);

  // Reset demo data state
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle template download (Direct Static Download, 0ms lag, no server dependency)
  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/PKC_Student_Bulk_Import_Template.xlsx';
    link.download = 'PKC_Student_Bulk_Import_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle 100-student demo Excel download
  const handleDownloadDemoData = () => {
    const link = document.createElement('a');
    link.href = '/PKC_100_Students_Data.xlsx';
    link.download = 'PKC_100_Students_Data.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle 100-student demo PDF download
  const handleDownload100Pdf = () => {
    const link = document.createElement('a');
    link.href = '/PKC_100_Students_Admission_Register.pdf';
    link.download = 'PKC_100_Students_Admission_Register.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to load sample text into PDF parser for instant testing
  const handlePasteDemoText = () => {
    const demo = `1. Rahul Verma | Suresh Verma | BCA | 2024-2025 | SEM-3 | Total Fee: 36000 | Paid: 20000 | 9876543210\n2. Priya Sharma | Rajesh Sharma | BA | 2023-2024 | SEM-5 | Total Fee: 18000 | Paid: 18000 | 9823456789\n3. Amit Patel | Mahendra Patel | DCA | 2025-2026 | SEM-1 | Total Fee: 12000 | Paid: 5000 | 9712345678\n4. Anjali Gupta | Ramesh Gupta | B.Com | 2024-2025 | SEM-3 | Total Fee: 24000 | Paid: 15000 | 9988776655\n5. Vikram Singh | Kalyan Singh | B.Sc | 2023-2024 | SEM-6 | Total Fee: 28000 | Paid: 28000 | 9123456780`;
    setPdfRawText(demo);
    setErrorMsg(null);
  };

  // Handle Excel parsing
  const handleParseExcel = async () => {
    if (!file) {
      setErrorMsg('Kripya pehle ek Excel (.xlsx / .xls) ya CSV file select karein.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/students/parse-excel', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Excel file parse karne me samasya aayi.');
      }

      if (data.records.length === 0) {
        throw new Error('Excel sheet me koi valid student row nahi mili.');
      }

      setParsedStudents(data.records);
      setSelectedIndices(new Set(data.records.map((_, i) => i)));
      setSuccessMsg(`Sheet "${data.sheetName}" se safalta-purvak ${data.records.length} records extract ho gaye! Niche preview check karein.`);
    } catch (err) {
      setErrorMsg(err.message || 'Excel parse fail ho gaya.');
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF parsing
  const handleParsePdf = async () => {
    if (!file && !pdfRawText.trim()) {
      setErrorMsg('Kripya PDF file upload karein ya direct text paste karein.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        res = await fetch('/api/students/parse-pdf', {
          method: 'POST',
          body: formData
        });
      } else {
        res = await fetch('/api/students/parse-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText: pdfRawText })
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'PDF parse karne me samasya aayi.');
      }

      if (data.records.length === 0) {
        throw new Error('PDF se structured student data extract nahi ho paya. Kripya format check karein ya direct Excel use karein.');
      }

      setParsedStudents(data.records);
      setSelectedIndices(new Set(data.records.map((_, i) => i)));
      setSuccessMsg(`PDF se safalta-purvak ${data.records.length} student records extract ho gaye! Niche preview check karein.`);
    } catch (err) {
      setErrorMsg(err.message || 'PDF parse fail ho gaya.');
    } finally {
      setLoading(false);
    }
  };

  // Selection toggle
  const toggleSelectAll = () => {
    if (selectedIndices.size === parsedStudents.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(parsedStudents.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (idx) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  // Delete row from preview
  const handleDeleteRow = (idx) => {
    setParsedStudents(prev => prev.filter((_, i) => i !== idx));
    const next = new Set();
    selectedIndices.forEach(i => {
      if (i < idx) next.add(i);
      else if (i > idx) next.add(i - 1);
    });
    setSelectedIndices(next);
  };

  // Update row in preview
  const handleUpdateRow = (idx, field, value) => {
    setParsedStudents(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      if (field === 'totalFee' || field === 'scholarshipAmount' || field === 'totalPaid') {
        const fee = Number(field === 'totalFee' ? value : copy[idx].totalFee) || 0;
        const sch = Number(field === 'scholarshipAmount' ? value : copy[idx].scholarshipAmount) || 0;
        const paid = Number(field === 'totalPaid' ? value : copy[idx].totalPaid) || 0;
        copy[idx].netTotalFee = Math.max(0, fee - sch);
        copy[idx].balanceDue = Math.max(0, copy[idx].netTotalFee - paid);
      }
      return copy;
    });
  };

  // Execute Bulk Import
  const handleCommitImport = async () => {
    const selectedRows = parsedStudents.filter((_, idx) => selectedIndices.has(idx));
    if (selectedRows.length === 0) {
      setErrorMsg('Kripya import karne ke liye kam se kam 1 record select karein.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/students/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: selectedRows,
          clearExisting,
          operatorName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Import fail ho gaya.');
      }

      setSuccessMsg(`🎉 Shandaar! ${data.importedCount} student records aur unki ${data.receiptsCount} fee transactions successfully import ho gayi hain!`);
      setParsedStudents([]);
      setFile(null);
      setPdfRawText('');

      if (onImportSuccess) {
        onImportSuccess(data);
      }

      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Import fail ho gaya.');
    } finally {
      setLoading(false);
    }
  };

  // Execute Reset Demo Data
  const handleResetDemoData = async () => {
    if (resetConfirmText.trim() !== 'CLEAR_DEMO_DATA') {
      setErrorMsg('Kripya confirmation box me "CLEAR_DEMO_DATA" type karein.');
      return;
    }

    setResetLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/students/reset-demo-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmationKey: 'CLEAR_DEMO_DATA' })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Reset failed.');
      }

      setSuccessMsg(data.message);
      setResetConfirmText('');
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Reset fail ho gaya.');
    } finally {
      setResetLoading(false);
    }
  };

  // Calculation totals for preview
  const selectedRecords = parsedStudents.filter((_, idx) => selectedIndices.has(idx));
  const totalFeeSum = selectedRecords.reduce((acc, s) => acc + (Number(s.totalFee) || 0), 0);
  const totalPaidSum = selectedRecords.reduce((acc, s) => acc + (Number(s.totalPaid) || 0), 0);
  const totalDueSum = selectedRecords.reduce((acc, s) => acc + (Number(s.balanceDue) || 0), 0);
  const totalScholarshipSum = selectedRecords.reduce((acc, s) => acc + (Number(s.scholarshipAmount) || 0), 0);

  // Filtered rows for viewing
  const filteredIndices = parsedStudents
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        s.studentName?.toLowerCase().includes(q) ||
        s.fatherName?.toLowerCase().includes(q) ||
        s.rollNo?.toLowerCase().includes(q) ||
        s.courseName?.toLowerCase().includes(q) ||
        s.admissionSession?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Bulk Data Migration
                </span>
                <span className="text-xs text-slate-400">
                  Session Data & Fee Importer
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Purane Session Ka Data Import (Excel / PDF / CSV)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('excel'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'excel'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>1. Excel / CSV File Upload</span>
            </button>

            <button
              onClick={() => { setActiveTab('pdf'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>2. Smart PDF / Register Text Parser</span>
            </button>

            <button
              onClick={() => { setActiveTab('reset'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reset'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>3. Reset Demo Data</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              title="Download PKC Official Student Bulk Import Blank Template"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 Blank Template (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDemoData}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              title="Download 100 Students Demo Excel File"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>⭐ 100 Students Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleDownload100Pdf}
              className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              title="Download 100 Students Demo Admission Register PDF"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>📄 100 Students PDF (.pdf)</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: EXCEL UPLOAD */}
          {activeTab === 'excel' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Upload Box */}
                <div className="md:col-span-2 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-6 bg-slate-50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setErrorMsg(null);
                      }
                    }}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <FileSpreadsheet className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Apni Excel Sheet (.xlsx / .xls) ya CSV File Yahan Drop Karein
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md">
                    Student ka Naam, Roll No, Fees, Past Session (jaise 2023-24), Paid Fees sab automatically parse hokar register ho jayenge.
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-colors"
                    >
                      {file ? 'File Badlein' : 'Browse File (.xlsx / .csv)'}
                    </button>
                    {file && (
                      <button
                        type="button"
                        onClick={handleParseExcel}
                        disabled={loading}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Parse & Review Excel Data</span>
                      </button>
                    )}
                  </div>

                  {file && (
                    <div className="mt-3 text-xs font-mono font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-lg">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>

                {/* Instructions Card */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Kaise Kaam Karta Hai?</span>
                  </div>
                  <ul className="text-[11px] text-amber-900/90 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-700">1.</span>
                      <span>Upar se <strong>"Download Excel Template"</strong> button se demo file download karein.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-700">2.</span>
                      <span>Usme apne purane students ka data daalein (Roll No, Course, Session, Fees, Paid).</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-amber-700">3.</span>
                      <span>Upload karke <strong>Parse</strong> karein. Niche list aayegi jisme aap fees aur data check karke seedhe live portal me daal sakte hain!</span>
                    </li>
                  </ul>
                  <div className="pt-2 border-t border-amber-200 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="w-full text-center py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      📥 Blank Template Download Karein (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDemoData}
                      className="w-full text-center py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      ⭐ Demo Sample File (.xlsx - Ready to Upload)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SMART PDF UPLOAD & PARSER */}
          {activeTab === 'pdf' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PDF File Upload */}
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-6 bg-slate-50 hover:bg-indigo-50/20 transition-all flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setErrorMsg(null);
                      }
                    }}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800">
                    Option A: Purani Admission PDF Upload Karein
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Admission Register PDF, Fee List ya Excel se export hui PDF upload karein.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => pdfInputRef.current?.click()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      {file ? 'PDF Badlein' : 'Browse PDF File'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload100Pdf}
                      className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-extrabold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Download 100-student demo register PDF for testing"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Download 100 Students Demo PDF</span>
                    </button>
                    {file && (
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                        {file.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct Text Paste */}
                <div className="border border-slate-200 rounded-3xl p-5 bg-white space-y-2 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Option B: PDF / WhatsApp Ka Text Direct Paste Karein
                    </span>
                    <button
                      type="button"
                      onClick={handlePasteDemoText}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] rounded-lg border border-indigo-200 cursor-pointer transition-colors"
                      title="Load demo students into box for instant testing"
                    >
                      ✨ Fill Demo Text
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={pdfRawText}
                    onChange={(e) => setPdfRawText(e.target.value)}
                    placeholder={`Udaharan format:\n1. Rahul Verma | BCA | 2024-25 | 30000 | 15000 | 9876543210\n2. Priya Sharma | BA | 2023-24 | 18000 | 18000 | 9823456789\n\nYa copy-paste text:\nName: Amit Patel\nFather: Mahendra Patel\nCourse: DCA\nTotal Fee: 12000\nPaid: 5000\nPhone: 9712345678`}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParsePdf}
                  disabled={loading || (!file && !pdfRawText.trim())}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Smart AI Extract & Preview</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: RESET DEMO DATA */}
          {activeTab === 'reset' && (
            <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-6 space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 text-rose-950">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-rose-950">
                    Purana / Demo Data Hatao (Fresh Start Desk)
                  </h3>
                  <p className="text-xs text-rose-700">
                    Agar aap portal me test/dummy students ko clear karke sirf apna asli data rakhna chahte hain.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-2">
                <p>
                  ⚠️ <strong>Dhyan dein:</strong> Isse sabhi demo students aur demo fee receipts delete ho jayengi. Courses aur admin accounts surakshit rahenge.
                </p>
                <p className="font-mono text-[11px] bg-rose-100/50 p-2 rounded-lg text-rose-950">
                  Confirm karne ke liye niche box me exact likhein: <strong className="select-all text-rose-700 font-bold">CLEAR_DEMO_DATA</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Type CLEAR_DEMO_DATA to confirm"
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-rose-300 focus:border-rose-600 rounded-xl text-xs font-mono font-bold text-rose-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleResetDemoData}
                  disabled={resetLoading || resetConfirmText.trim() !== 'CLEAR_DEMO_DATA'}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {resetLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Sabhi Demo Students Clear Karein</span>
                </button>
              </div>
            </div>
          )}

          {/* CANDIDATE PREVIEW & CONFIRMATION GRID */}
          {parsedStudents.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              
              {/* Summary Metrics */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl shadow-md flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    Review Ready
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1 flex items-center gap-2">
                    <span>Parsed Data Preview ({parsedStudents.length} Students Extracted)</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Aap kisi bhi cell par click karke Name, Fees ya Session edit kar sakte hain.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected</span>
                    <strong className="text-sm font-extrabold text-amber-300">{selectedIndices.size} / {parsedStudents.length}</strong>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fees</span>
                    <strong className="text-sm font-extrabold text-white">₹{totalFeeSum.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                    <strong className="text-sm font-extrabold text-emerald-400">₹{totalPaidSum.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Due</span>
                    <strong className="text-sm font-extrabold text-rose-400">₹{totalDueSum.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Table Search & Bulk Select Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-xs font-bold px-3 py-1.5 bg-white hover:bg-slate-200 border border-slate-300 rounded-xl cursor-pointer text-slate-800 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedIndices.size === parsedStudents.length ? 'Deselect All' : 'Select All'}</span>
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing <strong className="text-slate-900">{filteredIndices.length}</strong> matching records
                  </span>
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search inside parsed rows..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Editable Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white font-bold uppercase text-[10px] sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 text-center w-10">
                        <input
                          type="checkbox"
                          checked={selectedIndices.size === parsedStudents.length && parsedStudents.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded cursor-pointer"
                        />
                      </th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Father's Name</th>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Course / Degree</th>
                      <th className="p-2.5">Session</th>
                      <th className="p-2.5">Class / Sem</th>
                      <th className="p-2.5 text-right">Total Fee (₹)</th>
                      <th className="p-2.5 text-right">Scholarship (₹)</th>
                      <th className="p-2.5 text-right">Paid (₹)</th>
                      <th className="p-2.5 text-right">Due (₹)</th>
                      <th className="p-2.5">Contact</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredIndices.map(({ s, i }) => {
                      const isSelected = selectedIndices.has(i);
                      return (
                        <tr key={i} className={`hover:bg-indigo-50/40 transition-colors ${!isSelected ? 'opacity-50 bg-slate-50' : ''}`}>
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(i)}
                              className="rounded cursor-pointer"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.studentName || ''}
                              onChange={(e) => handleUpdateRow(i, 'studentName', e.target.value)}
                              className="w-full p-1 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 font-bold text-slate-900 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.fatherName || ''}
                              onChange={(e) => handleUpdateRow(i, 'fatherName', e.target.value)}
                              className="w-full p-1 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 text-slate-700 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.rollNo || ''}
                              placeholder="Auto Roll"
                              onChange={(e) => handleUpdateRow(i, 'rollNo', e.target.value)}
                              className="w-28 p-1 font-mono uppercase font-bold text-indigo-700 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.courseName || ''}
                              onChange={(e) => handleUpdateRow(i, 'courseName', e.target.value)}
                              className="w-full p-1 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 text-slate-800 font-medium focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.admissionSession || ''}
                              onChange={(e) => handleUpdateRow(i, 'admissionSession', e.target.value)}
                              className="w-24 p-1 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 font-semibold text-slate-700 focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.currentClass || ''}
                              onChange={(e) => handleUpdateRow(i, 'currentClass', e.target.value)}
                              className="w-20 p-1 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 font-bold text-slate-700 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={s.totalFee || 0}
                              onChange={(e) => handleUpdateRow(i, 'totalFee', e.target.value)}
                              className="w-20 p-1 text-right font-bold text-slate-900 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={s.scholarshipAmount || 0}
                              onChange={(e) => handleUpdateRow(i, 'scholarshipAmount', e.target.value)}
                              className="w-16 p-1 text-right font-semibold text-emerald-700 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right">
                            <input
                              type="number"
                              value={s.totalPaid || 0}
                              onChange={(e) => handleUpdateRow(i, 'totalPaid', e.target.value)}
                              className="w-20 p-1 text-right font-bold text-emerald-600 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-rose-600">
                            ₹{(s.balanceDue || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={s.phone || ''}
                              onChange={(e) => handleUpdateRow(i, 'phone', e.target.value)}
                              className="w-24 p-1 font-mono text-slate-600 bg-transparent hover:bg-slate-100 focus:bg-white border-b border-transparent focus:border-indigo-600 focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(i)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Import Options & Action Bar */}
              <div className="bg-slate-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600"
                  />
                  <span>
                    Import se pehle portal ke <strong className="text-rose-700">puraane demo students clear karein</strong> (100% Fresh Start)
                  </span>
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setParsedStudents([]); setFile(null); }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl cursor-pointer"
                  >
                    Discard & Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={loading || selectedIndices.size === 0}
                    className="px-6 py-2.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-600 rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirm & Import ({selectedIndices.size}) Records to Live Portal</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Operator: <strong className="text-slate-800">{operatorName}</strong></span>
          <span>Data automatically reflects in Directory, Accounts Treasury, and Document Tracker</span>
        </div>

      </div>
    </div>
  );
}
