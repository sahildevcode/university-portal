import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle2, AlertCircle, Upload, Search, Filter, 
  Printer, ExternalLink, ShieldCheck, Clock, User, Check, X,
  Building, ArrowLeft, RefreshCw, FolderCheck, Download, Eye,
  FileCheck, ChevronDown, DownloadCloud, FileDown, Layers, Trash2
} from 'lucide-react';

export default function StudentDocumentsTracker({ isAdmin = false, staffUser, courses = [] }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | complete | partial | pending
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Action Dropdown state per student row
  const [openDropdownRoll, setOpenDropdownRoll] = useState(null);

  // Modal 1: Receive / Update Documents
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeDocState, setActiveDocState] = useState({});
  const [docRemarks, setDocRemarks] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Modal 2: Single Document View & Downloader Vault
  const [selectedStudentForSingleDocs, setSelectedStudentForSingleDocs] = useState(null);

  // Modal 3: All-Over Submitted Documents Master Dossier
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState(null);

  // Modal 4: File Preview (Embedded viewer for PDF / Image)
  const [previewDocFile, setPreviewDocFile] = useState(null);

  // Modal 5: Single Document Hardcopy Deposit Certificate Slip
  const [singleHardcopySlip, setSingleHardcopySlip] = useState(null);

  const standardDocuments = [
    '10th Marksheet (10वीं अंकसूची)',
    '12th Marksheet (12वीं अंकसूची)',
    'Graduation Marksheet (स्नातक)',
    'Aadhaar Card Copy (आधार कार्ड)',
    'Samagra ID Copy (समग्र आईडी)',
    'M.P. Domicile (मूल निवास प्रमाण पत्र)',
    'Caste Certificate (जाति प्रमाण पत्र)',
    'Income Certificate (आय प्रमाण पत्र)',
    'TC / Migration Certificate',
    'Gap Certificate (यदि लागू हो)',
    'Passport Photos (4 प्रतियां)'
  ];

  const fetchStudents = async (customSearch = null, customCourse = null) => {
    setLoading(true);
    try {
      const sVal = customSearch !== null ? customSearch : search;
      const cVal = customCourse !== null ? customCourse : selectedCourse;
      let url = '/api/students?';
      if (cVal !== 'all') url += '&course=' + encodeURIComponent(cVal);
      if (sVal && sVal.trim()) url += '&search=' + encodeURIComponent(sVal.trim());
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students for documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearch('');
    setSelectedCourse('all');
    setStatusFilter('all');
    fetchStudents('', 'all');
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '') {
      fetchStudents('', selectedCourse);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedCourse]);

  // Helper to extract file URL for a document (checks documentsStatus + legacy upload keys)
  const getDocumentFileUrl = (student, docName) => {
    if (!student) return '';
    const docData = student.documentsStatus?.[docName];
    if (docData?.fileUrl) return docData.fileUrl;

    // Check legacy documents mapping
    if (docName.includes('10th')) return student.documents?.doc10th || student.doc10thUrl || '';
    if (docName.includes('12th')) return student.documents?.doc12th || student.doc12thUrl || '';
    if (docName.includes('Aadhaar')) return student.documents?.aadhar || student.aadharUrl || '';
    if (docName.includes('Passport Photo')) return student.student_image || student.photoUrl || student.documents?.photo || '';
    return '';
  };

  // Direct File Download
  const handleDownloadFile = (fileUrl, suggestedName) => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = suggestedName || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download All Uploaded PDFs for a student
  const handleDownloadAllStudentPdfs = (student) => {
    if (!student) return;
    let count = 0;
    standardDocuments.forEach((doc, idx) => {
      const fileUrl = getDocumentFileUrl(student, doc);
      if (fileUrl) {
        count++;
        setTimeout(() => {
          const ext = fileUrl.endsWith('.png') ? '.png' : (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') ? '.jpg' : '.pdf');
          const cleanDocName = doc.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
          handleDownloadFile(fileUrl, `${student.rollNo}_${cleanDocName}${ext}`);
        }, idx * 300);
      }
    });
    if (count === 0) {
      alert('इस विद्यार्थी के लिए अभी कोई डिजिटल पीडीएफ या फाइल अपलोड नहीं है। हार्डकॉपी की पावती के लिए "Print Hardcopy Slip" का उपयोग करें।');
    }
  };

  // Export All-Over Dossier as CSV Summary
  const handleExportDossierCsv = (student) => {
    if (!student) return;
    const rows = [
      ['Student Name', `"${student.fullName}"`],
      ['Roll Number', student.rollNo],
      ['Course', `"${student.courseName}"`],
      ['College', `"${student.collegeName || 'PKC Education Institute'}"`],
      ['Current Class', student.currentClass || ('SEM-' + (student.currentSemester || 1))],
      ['Report Generated On', new Date().toLocaleString('en-IN')],
      [],
      ['S.No', 'Document Title', 'Submission Status', 'Mode of Submission', 'File Available', 'Submission Date', 'Verified By']
    ];

    standardDocuments.forEach((doc, idx) => {
      const docData = student.documentsStatus?.[doc];
      const inLegacy = student.documentSubmit?.includes(doc);
      const fileUrl = getDocumentFileUrl(student, doc);

      let status = 'Pending';
      let mode = 'Not Submitted';
      let hasFile = 'No';

      if (docData?.status === 'submitted_pdf' || fileUrl) {
        status = 'Submitted / Received';
        mode = 'PDF / Digital Upload';
        hasFile = 'Yes (PDF)';
      } else if (docData?.status === 'submitted_manual' || inLegacy) {
        status = 'Submitted / Received';
        mode = 'Physical Hardcopy (हार्डकॉपी)';
        hasFile = 'Physical Office Copy';
      }

      rows.push([
        idx + 1,
        `"${doc.replace(/"/g, '""')}"`,
        status,
        mode,
        hasFile,
        docData?.updatedAt ? new Date(docData.updatedAt).toLocaleDateString('en-IN') : 'At Admission',
        docData?.verifiedBy || (status.startsWith('Sub') ? 'Admission Desk' : '-')
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${student.rollNo}_All_Documents_Status_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDocModal = (student) => {
    setSelectedStudent(student);
    const initialMap = {};
    standardDocuments.forEach(doc => {
      const existing = student.documentsStatus?.[doc];
      const isInLegacyList = student.documentSubmit?.includes(doc);
      const legacyFile = getDocumentFileUrl(student, doc);

      if (existing) {
        initialMap[doc] = {
          mode: existing.mode || (existing.status === 'submitted_pdf' ? 'PDF' : 'Manually'),
          status: existing.status || 'submitted_manual',
          fileUrl: existing.fileUrl || legacyFile || '',
          remarks: existing.remarks || ''
        };
      } else if (isInLegacyList) {
        initialMap[doc] = {
          mode: 'Manually',
          status: 'submitted_manual',
          fileUrl: legacyFile || '',
          remarks: 'Submitted at admission desk'
        };
      } else {
        initialMap[doc] = {
          mode: 'Pending',
          status: 'pending',
          fileUrl: '',
          remarks: ''
        };
      }
    });
    setActiveDocState(initialMap);
    setSaveMessage(null);
  };

  const handleModeChange = (docName, mode) => {
    setActiveDocState(prev => ({
      ...prev,
      [docName]: {
        ...prev[docName],
        mode: mode,
        status: mode === 'PDF' ? 'submitted_pdf' : (mode === 'Manually' ? 'submitted_manual' : 'pending')
      }
    }));
  };

  const handleFileUpload = async (docName, file) => {
    if (!file || !selectedStudent) return;
    const studentKey = selectedStudent.id || selectedStudent.rollNo || selectedStudent.registrationNo || selectedStudent.enrollmentNo;
    if (!studentKey) {
      alert('Student identifier not found.');
      return;
    }
    setUploadingDoc(docName);
    try {
      const formData = new FormData();
      formData.append('docName', docName);
      formData.append('mode', 'PDF');
      formData.append('status', 'submitted_pdf');
      formData.append('document_file', file);
      formData.append('verifiedBy', staffUser?.name || 'Administrator');

      const res = await fetch('/api/students/' + encodeURIComponent(studentKey) + '/documents', {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Upload failed');

      const updatedFileUrl = data.documentsStatus?.[docName]?.fileUrl || data.student?.documentsStatus?.[docName]?.fileUrl || '';

      setActiveDocState(prev => ({
        ...prev,
        [docName]: {
          mode: 'PDF',
          status: 'submitted_pdf',
          fileUrl: updatedFileUrl,
          remarks: 'PDF document uploaded'
        }
      }));
      setSaveMessage('PDF for "' + docName + '" uploaded successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
      fetchStudents();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDeleteDoc = async (docName) => {
    if (!selectedStudent) return;
    if (!window.confirm(`Are you sure you want to delete / remove "${docName}"?`)) return;

    const studentKey = selectedStudent.id || selectedStudent.rollNo || selectedStudent.registrationNo || selectedStudent.enrollmentNo;
    if (!studentKey) {
      alert('Student identifier not found.');
      return;
    }

    try {
      const res = await fetch(`/api/students/${encodeURIComponent(studentKey)}/documents/${encodeURIComponent(docName)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete document');

      setActiveDocState(prev => ({
        ...prev,
        [docName]: {
          mode: 'Pending',
          status: 'pending',
          fileUrl: '',
          remarks: ''
        }
      }));
      setSaveMessage(`Document "${docName}" deleted successfully!`);
      setTimeout(() => setSaveMessage(null), 3000);
      fetchStudents();
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  };

  const handleSaveAllDocs = async () => {
    if (!selectedStudent) return;
    const studentKey = selectedStudent.id || selectedStudent.rollNo || selectedStudent.registrationNo || selectedStudent.enrollmentNo;
    if (!studentKey) {
      alert('Student identifier not found.');
      return;
    }
    setSaveLoading(true);
    try {
      // Send as batch update
      const res = await fetch('/api/students/' + encodeURIComponent(studentKey) + '/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentsStatus: activeDocState,
          remarks: docRemarks,
          verifiedBy: staffUser?.name || (isAdmin ? 'Admin' : 'Verification Desk')
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save documents');

      setSaveMessage('All document statuses updated successfully!');
      fetchStudents();
      setTimeout(() => {
        setSaveMessage(null);
        setSelectedStudent(null);
      }, 1200);
    } catch (err) {
      alert('Error updating documents: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  // Compute document counts for any student
  const getStudentDocCounts = (student) => {
    let receivedCount = 0;
    let manualCount = 0;
    let pdfCount = 0;
    let pendingCount = 0;

    standardDocuments.forEach(doc => {
      const docData = student.documentsStatus?.[doc];
      const inLegacy = student.documentSubmit?.includes(doc);
      const fileUrl = getDocumentFileUrl(student, doc);

      if (docData?.status === 'submitted_pdf' || fileUrl) {
        receivedCount++;
        pdfCount++;
      } else if (docData?.status === 'submitted_manual' || inLegacy) {
        receivedCount++;
        manualCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      receivedCount,
      manualCount,
      pdfCount,
      pendingCount,
      total: standardDocuments.length,
      isComplete: receivedCount === standardDocuments.length
    };
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const counts = getStudentDocCounts(s);
    if (statusFilter === 'complete' && !counts.isComplete) return false;
    if (statusFilter === 'partial' && (counts.receivedCount === 0 || counts.isComplete)) return false;
    if (statusFilter === 'pending' && counts.receivedCount > 0) return false;
    return true;
  });

  // Overall metric totals
  const totalStudentsCount = students.length;
  const completeDocsCount = students.filter(s => getStudentDocCounts(s).isComplete).length;
  const partialDocsCount = students.filter(s => {
    const c = getStudentDocCounts(s);
    return c.receivedCount > 0 && !c.isComplete;
  }).length;
  const zeroDocsCount = students.filter(s => getStudentDocCounts(s).receivedCount === 0).length;

  return (
    <div className="space-y-6 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-purple-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-400/30 flex items-center justify-center font-black shrink-0 shadow-inner">
            <FolderCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                Official Document Verification &amp; Vault
              </span>
              <span className="text-xs bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full">
                {isAdmin ? 'Admin Portal Controller' : (staffUser ? `Desk Operator: ${staffUser.name}` : 'Staff Counter')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Student Document Submission &amp; Verification Tracker
            </h1>
            <p className="text-xs text-purple-200 mt-0.5">
              ट्रैक करें किस छात्र ने कौन से दस्तावेज़ जमा किए हैं। <strong>सिंगल डॉक्यूमेंट देखें व डाउनलोड करें</strong> अथवा <strong>ऑल-ओवर सबमिट डॉक्यूमेंट्स की कॉपी 1-क्लिक में निकालें</strong>।
            </p>
          </div>
        </div>

        <button
          onClick={fetchStudents}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/20 backdrop-blur-sm transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Total Enrolled Students</span>
          <p className="text-2xl font-black text-slate-900">{totalStudentsCount}</p>
          <span className="text-[11px] text-slate-400">In central admission directory</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1 bg-emerald-50/20">
          <span className="text-xs font-bold uppercase text-emerald-700 block tracking-wider">All Documents Received</span>
          <p className="text-2xl font-black text-emerald-700">{completeDocsCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">100% Verified candidates</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-1 bg-amber-50/20">
          <span className="text-xs font-bold uppercase text-amber-700 block tracking-wider">Partially Submitted</span>
          <p className="text-2xl font-black text-amber-700">{partialDocsCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Pending 1 or more documents</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-sm space-y-1 bg-rose-50/20">
          <span className="text-xs font-bold uppercase text-rose-700 block tracking-wider">No Documents Yet (Pending)</span>
          <p className="text-2xl font-black text-rose-700">{zeroDocsCount}</p>
          <span className="text-[11px] text-rose-600 font-medium">Enrolled with 0 documents</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-center">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <form onSubmit={(e) => { e.preventDefault(); fetchStudents(); }}>
            <input
              type="text"
              placeholder="Search by Roll No, Name, Father's Name (पिता का नाम), Aadhar No, Phone..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:bg-white text-xs font-medium"
            />
          </form>
          {search && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-xs font-medium"
          >
            <option value="all">All Courses &amp; Programs</option>
            {courses.map(c => (
              <option key={c.id || c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none text-xs font-medium"
          >
            <option value="all">All Submission Statuses</option>
            <option value="complete">✓ Fully Verified (All 11 Received)</option>
            <option value="partial">⏳ Partially Submitted</option>
            <option value="pending">⚠️ Pending (0 Documents)</option>
          </select>
        </div>

        <div className="sm:col-span-1">
          {(search || selectedCourse !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={handleResetSearch}
              className="w-full p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors border border-slate-200 text-center"
              title="Reset Filters / Back to All"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Active Search & Filter Banner */}
      {(search || selectedCourse !== 'all' || statusFilter !== 'all') && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-purple-950 font-medium">
            <span className="font-bold">Active Search:</span>
            {search && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-200 font-bold text-purple-800 shadow-2xs">
                "{search}"
              </span>
            )}
            {selectedCourse !== 'all' && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-200 text-slate-700">
                Course: {selectedCourse}
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="bg-white px-2.5 py-1 rounded-lg border border-purple-200 text-slate-700">
                Status: {statusFilter}
              </span>
            )}
            <span className="text-slate-500 font-medium">({filteredStudents.length} found)</span>
          </div>

          <button
            onClick={handleResetSearch}
            className="flex items-center gap-1.5 bg-[#071530] hover:bg-indigo-950 text-[#C59B27] hover:text-amber-300 font-bold px-3.5 py-1.5 rounded-xl shadow-xs cursor-pointer text-xs transition-all border border-[#C59B27]/40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to All Students (वापस सभी छात्र देखें)</span>
          </button>
        </div>
      )}

      {/* Main Student Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>Enrolled Students KYC &amp; Documents Registry</span>
              <span className="text-xs bg-indigo-100 text-indigo-900 font-extrabold px-2.5 py-0.5 rounded-full">
                {filteredStudents.length} Students
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              प्रत्येक छात्र के सामने "Document Options" बटन से सिंगल दस्तावेज़ देखें/डाउनलोड करें या ऑल-ओवर कॉपी प्रिंट करें।
            </p>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">College &amp; Course</th>
                <th className="p-3.5">Verification Progress</th>
                <th className="p-3.5">Key Submitted Proofs</th>
                <th className="p-3.5 text-center">Document Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading student records...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center bg-slate-50/50">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                        <Search className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {search 
                            ? `"${search}" - नाम, रोल नं., पिता का नाम या आधार से कोई छात्र नहीं मिला` 
                            : 'चुने गए फ़िल्टर के अनुसार कोई छात्र नहीं मिला'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          कृपया रोल नंबर, छात्र का नाम, पिता का नाम (Father's Name) या आधार नंबर जांचें।
                        </p>
                      </div>

                      <button
                        onClick={handleResetSearch}
                        className="inline-flex items-center gap-2 bg-[#071530] hover:bg-indigo-950 text-[#C59B27] hover:text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md border border-[#C59B27]/40 cursor-pointer transition-all hover:scale-105"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>← Back to All Students (वापस सभी छात्र दिखाएं)</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const counts = getStudentDocCounts(std);
                  const progressPct = Math.round((counts.receivedCount / counts.total) * 100);

                  return (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Roll / Reg */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-mono font-bold text-indigo-950 block text-xs">{std.rollNo}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{std.enrollmentNo || std.registrationNo}</span>
                      </td>

                      {/* Student Name */}
                      <td className="p-3.5">
                        <strong className="font-bold text-slate-900 uppercase block">{std.fullName}</strong>
                        <span className="text-[10px] text-slate-500 font-normal">
                          Father: {std.fatherName} • {std.phone}
                        </span>
                      </td>

                      {/* College & Course */}
                      <td className="p-3.5 max-w-xs">
                        <span className="font-bold text-indigo-950 block truncate text-[11px]" title={std.collegeName}>
                          {std.collegeName || 'Govt PG College / PKC Learning Institute'}
                        </span>
                        <span className="text-[11px] text-slate-600 block truncate">
                          {std.courseName} ({std.currentClass || ('SEM-' + (std.currentSemester || 1))})
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="space-y-1.5 min-w-[130px]">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={counts.isComplete ? 'text-emerald-700' : 'text-slate-700'}>
                              {counts.receivedCount} / {counts.total} Received
                            </span>
                            <span className="text-slate-400 font-mono">{progressPct}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                            <div 
                              className={'h-full transition-all ' + (
                                counts.isComplete ? 'bg-emerald-500' : (counts.receivedCount > 0 ? 'bg-indigo-500' : 'bg-rose-400')
                              )}
                              style={{ width: progressPct + '%' }}
                            />
                          </div>
                          <div className="flex gap-2 text-[10px]">
                            <span className="text-blue-700 font-semibold">{counts.manualCount} Hardcopy</span>
                            <span className="text-emerald-700 font-semibold">{counts.pdfCount} PDF</span>
                            {counts.pendingCount > 0 && (
                              <span className="text-rose-600 font-medium">{counts.pendingCount} Pending</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Key Submitted Proofs Chips */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {standardDocuments.slice(0, 5).map(doc => {
                            const docData = std.documentsStatus?.[doc];
                            const inLegacy = std.documentSubmit?.includes(doc);
                            const fileUrl = getDocumentFileUrl(std, doc);
                            const shortName = doc.split(' ')[0];

                            if (docData?.status === 'submitted_pdf' || fileUrl) {
                              return (
                                <button
                                  key={doc}
                                  type="button"
                                  onClick={() => setPreviewDocFile({
                                    title: doc,
                                    url: fileUrl,
                                    studentName: std.fullName,
                                    rollNo: std.rollNo
                                  })}
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 hover:bg-purple-200 border border-purple-300 cursor-pointer"
                                  title={doc + ' - PDF Uploaded (Click to view/download)'}
                                >
                                  <span>{shortName} (PDF)</span>
                                  <Eye className="w-2.5 h-2.5 text-purple-700" />
                                </button>
                              );
                            } else if (docData?.status === 'submitted_manual' || inLegacy) {
                              return (
                                <button
                                  key={doc}
                                  type="button"
                                  onClick={() => setSingleHardcopySlip({
                                    student: std,
                                    docName: doc,
                                    date: docData?.updatedAt || new Date().toISOString()
                                  })}
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300 cursor-pointer"
                                  title={doc + ' - Physical Hardcopy (Click to print single slip)'}
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>{shortName} (Hardcopy)</span>
                                </button>
                              );
                            } else {
                              return (
                                <span
                                  key={doc}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200"
                                  title={doc + ' - Pending'}
                                >
                                  {shortName}
                                </span>
                              );
                            }
                          })}
                          {standardDocuments.length > 5 && (
                            <span className="text-[10px] text-slate-400 self-center pl-0.5">
                              +{standardDocuments.length - 5}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Document Actions Dropdown + Quick Buttons */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Main Document Options Dropdown */}
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() => setOpenDropdownRoll(openDropdownRoll === std.rollNo ? null : std.rollNo)}
                              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                            >
                              <FolderCheck className="w-3.5 h-3.5" />
                              <span>Document Options</span>
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {openDropdownRoll === std.rollNo && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30 cursor-default" 
                                  onClick={() => setOpenDropdownRoll(null)} 
                                />
                                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-40 py-2 text-left animate-fadeIn text-xs">
                                  <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-extrabold flex justify-between items-center">
                                    <span>Options for {std.fullName?.split(' ')[0]}</span>
                                    <span className="font-mono text-indigo-700">{std.rollNo}</span>
                                  </div>

                                  {/* Option 1: Single Document View & Copy */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownRoll(null);
                                      setSelectedStudentForSingleDocs(std);
                                    }}
                                    className="w-full px-3.5 py-2.5 hover:bg-purple-50 text-purple-900 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                                      <Eye className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold">1. Single Document View &amp; Copy</span>
                                      <span className="text-[10px] text-slate-500 font-normal">सिंगल डॉक्यूमेंट देखें, PDF डाउनलोड या हार्डकॉपी पावती निकालें</span>
                                    </div>
                                  </button>

                                  {/* Option 2: All-Over Documents Dossier */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownRoll(null);
                                      setSelectedStudentForDossier(std);
                                    }}
                                    className="w-full px-3.5 py-2.5 hover:bg-emerald-50 text-emerald-900 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left border-t border-slate-100"
                                  >
                                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                                      <FileCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold">2. All-Over Documents Report</span>
                                      <span className="text-[10px] text-slate-500 font-normal">जमा व बाकी सभी दस्तावेज़ों की कॉपी (1-Click PDF / Print)</span>
                                    </div>
                                  </button>

                                  {/* Option 3: Receive & Update Documents */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdownRoll(null);
                                      handleOpenDocModal(std);
                                    }}
                                    className="w-full px-3.5 py-2.5 hover:bg-indigo-50 text-indigo-950 font-bold flex items-center gap-2.5 transition-colors cursor-pointer text-left border-t border-slate-100"
                                  >
                                    <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                                      <Upload className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold">3. Receive / Update Documents</span>
                                      <span className="text-[10px] text-slate-500 font-normal">नया दस्तावेज़ जमा करें या PDF अपलोड करें</span>
                                    </div>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Quick 1-Click All-Over Dossier Print */}
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForDossier(std)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="All-Over Documents Dossier Report (1-Click PDF / Print)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SINGLE DOCUMENT VIEWER & DOWNLOADER VAULT */}
      {/* ========================================================================= */}
      {selectedStudentForSingleDocs && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
          onClick={() => setSelectedStudentForSingleDocs(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-purple-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center font-bold text-amber-300">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Student Document Vault — Single Document View &amp; Download
                  </h3>
                  <p className="text-xs text-purple-200">
                    <strong className="text-white uppercase">{selectedStudentForSingleDocs.fullName}</strong> ({selectedStudentForSingleDocs.rollNo}) • {selectedStudentForSingleDocs.courseName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadAllStudentPdfs(selectedStudentForSingleDocs)}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  title="Download all uploaded PDF copies for this student"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span className="hidden sm:inline">Download All Uploaded PDFs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForSingleDocs(null)}
                  className="text-purple-200 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-purple-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
                  <span>
                    यहाँ से आप <strong>सिंगल डॉक्यूमेंट की प्रति (PDF) देख व डाउनलोड</strong> कर सकते हैं, तथा <strong>हार्डकॉपी की पावती स्लिप</strong> निकाल सकते हैं।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const std = selectedStudentForSingleDocs;
                    setSelectedStudentForSingleDocs(null);
                    setSelectedStudentForDossier(std);
                  }}
                  className="text-xs font-bold text-purple-800 underline hover:text-purple-950 shrink-0 cursor-pointer"
                >
                  View All-Over Dossier Instead →
                </button>
              </div>

              {/* Document Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {standardDocuments.map(docName => {
                  const docData = selectedStudentForSingleDocs.documentsStatus?.[docName];
                  const inLegacy = selectedStudentForSingleDocs.documentSubmit?.includes(docName);
                  const fileUrl = getDocumentFileUrl(selectedStudentForSingleDocs, docName);

                  const isPdf = Boolean(docData?.status === 'submitted_pdf' || fileUrl);
                  const isManual = Boolean(!isPdf && (docData?.status === 'submitted_manual' || inLegacy));
                  const isPending = !isPdf && !isManual;

                  return (
                    <div 
                      key={docName}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isPdf
                          ? 'bg-purple-50/70 border-purple-200'
                          : isManual
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-slate-50 border-slate-200 opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">{docName}</strong>
                          <span className="text-[10px] text-slate-500">
                            {docData?.updatedAt ? `Updated: ${new Date(docData.updatedAt).toLocaleDateString('en-IN')}` : 'Enrolled Record'}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPdf ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full border border-purple-300">
                              <Check className="w-3 h-3 text-purple-700" />
                              <span>PDF Uploaded</span>
                            </span>
                          ) : isManual ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Hardcopy On Record</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Single Document Actions */}
                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2">
                        {isPdf && (
                          <div className="flex items-center gap-2">
                            {/* View / Open PDF */}
                            <button
                              type="button"
                              onClick={() => setPreviewDocFile({
                                title: docName,
                                url: fileUrl,
                                studentName: selectedStudentForSingleDocs.fullName,
                                rollNo: selectedStudentForSingleDocs.rollNo
                              })}
                              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / देखें</span>
                            </button>

                            {/* Download PDF Copy */}
                            <button
                              type="button"
                              onClick={() => {
                                const ext = fileUrl.endsWith('.png') ? '.png' : (fileUrl.endsWith('.jpg') || fileUrl.endsWith('.jpeg') ? '.jpg' : '.pdf');
                                const clean = docName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
                                handleDownloadFile(fileUrl, `${selectedStudentForSingleDocs.rollNo}_${clean}${ext}`);
                              }}
                              className="flex items-center gap-1 bg-white hover:bg-purple-50 text-purple-900 border border-purple-300 px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          </div>
                        )}

                        {isManual && (
                          <div className="flex items-center gap-2">
                            {/* Print Physical Slip */}
                            <button
                              type="button"
                              onClick={() => setSingleHardcopySlip({
                                student: selectedStudentForSingleDocs,
                                docName: docName,
                                date: docData?.updatedAt || new Date().toISOString()
                              })}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-2xs transition-colors cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Hardcopy Slip (पावती)</span>
                            </button>
                          </div>
                        )}

                        {isPending && (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-slate-400 italic">Not submitted at desk</span>
                            <button
                              type="button"
                              onClick={() => {
                                const std = selectedStudentForSingleDocs;
                                setSelectedStudentForSingleDocs(null);
                                handleOpenDocModal(std);
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              + Receive Now →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Showing all 11 standardized document categories for this candidate.
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudentForSingleDocs(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ALL-OVER SUBMITTED DOCUMENTS COMPLETE MASTER DOSSIER */}
      {/* ========================================================================= */}
      {selectedStudentForDossier && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
          onClick={() => setSelectedStudentForDossier(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Control Bar (Hidden when printing) */}
            <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForDossier(null)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>All-Over Document Submission Dossier</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* 1-Click Print & PDF Save */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>

                {/* Export CSV Summary */}
                <button
                  type="button"
                  onClick={() => handleExportDossierCsv(selectedStudentForDossier)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
                  title="Download CSV Summary Report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentForDossier(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Area */}
            <div className="printable-area p-6 sm:p-8 bg-white text-slate-900 text-xs space-y-4 overflow-y-auto flex-1 font-sans">
              
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-700 bg-white p-0.5 flex items-center justify-center shrink-0">
                    <img src="/pkc_logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif-univ font-black text-lg text-slate-900 uppercase tracking-tight">
                      PKC Education Learning Institute &amp; Consultancy
                    </h2>
                    <p className="text-xs font-bold text-indigo-900">
                      पी.के.सी. शिक्षा प्रसार एवं जनकल्याण समिति, छतरपुर | Central Admissions Registry
                    </p>
                  </div>
                </div>
                <div className="inline-block bg-slate-900 text-white font-bold text-[11px] px-4 py-0.5 rounded-full uppercase tracking-wider mt-1">
                  Comprehensive Document Submission &amp; Verification Dossier
                </div>
              </div>

              {/* Student Particulars Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Student Name:</span>
                  <strong className="text-slate-900 uppercase text-xs font-black">{selectedStudentForDossier.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Roll / Enrollment Number:</span>
                  <strong className="text-indigo-950 font-mono text-xs font-black">{selectedStudentForDossier.rollNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">College / Campus:</span>
                  <span className="font-bold text-slate-800">{selectedStudentForDossier.collegeName || 'PKC Education Learning Institute'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Course &amp; Current Semester:</span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentForDossier.courseName} ({selectedStudentForDossier.currentClass || ('SEM-' + (selectedStudentForDossier.currentSemester || 1))})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Father's Name &amp; Contact:</span>
                  <span className="font-medium text-slate-800">{selectedStudentForDossier.fatherName} • {selectedStudentForDossier.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dossier Verified &amp; Issued Date:</span>
                  <span className="font-medium text-slate-800">{new Date().toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Summary Counts Bar */}
              {(() => {
                const c = getStudentDocCounts(selectedStudentForDossier);
                return (
                  <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-950">
                    <span>
                      Total Required: <strong>{c.total}</strong> | Received &amp; Verified: <strong className="text-emerald-700">{c.receivedCount}</strong>
                    </span>
                    <span className="text-[11px] text-slate-600">
                      ({c.manualCount} Physical Hardcopies, {c.pdfCount} Digital PDFs, <span className="text-rose-600 font-bold">{c.pendingCount} Pending</span>)
                    </span>
                  </div>
                );
              })()}

              {/* Full Checklist Table */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Complete Document Submission Ledger (सभी 11 दस्तावेज़ों की स्थिति)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Official Audit Checklist</span>
                </h4>

                <table className="w-full text-left text-[11px] border border-slate-300">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                      <th className="p-2 border border-slate-300">Document Title</th>
                      <th className="p-2 border border-slate-300 text-center">Submission Status</th>
                      <th className="p-2 border border-slate-300 text-center">Submission Mode</th>
                      <th className="p-2 border border-slate-300 text-center">File Attachment</th>
                      <th className="p-2 border border-slate-300 text-center">Desk Officer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standardDocuments.map((doc, idx) => {
                      const docData = selectedStudentForDossier.documentsStatus?.[doc];
                      const inLegacy = selectedStudentForDossier.documentSubmit?.includes(doc);
                      const fileUrl = getDocumentFileUrl(selectedStudentForDossier, doc);

                      let isReceived = false;
                      let modeText = 'Not Submitted';
                      let statusText = 'Pending';
                      let hasFile = 'No File';

                      if (docData?.status === 'submitted_pdf' || fileUrl) {
                        isReceived = true;
                        modeText = 'PDF / Digital Upload';
                        statusText = 'Received ✓';
                        hasFile = 'PDF Softcopy';
                      } else if (docData?.status === 'submitted_manual' || inLegacy) {
                        isReceived = true;
                        modeText = 'Physical Hardcopy (हार्डकॉपी)';
                        statusText = 'Received ✓';
                        hasFile = 'Physical Office Hardcopy';
                      }

                      return (
                        <tr key={doc} className={isReceived ? 'bg-white' : 'bg-rose-50/30'}>
                          <td className="p-2 border border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border border-slate-300 font-medium">
                            {doc}
                          </td>
                          <td className="p-2 border border-slate-300 text-center">
                            <span className={'font-bold px-2 py-0.5 rounded text-[10px] ' + (
                              isReceived ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            )}>
                              {statusText}
                            </span>
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-semibold">
                            {modeText}
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-[10px]">
                            {hasFile}
                          </td>
                          <td className="p-2 border border-slate-300 text-center text-[10px] text-slate-500">
                            {docData?.verifiedBy || (isReceived ? (staffUser?.name || 'Admission Desk') : '-')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Official Seals */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-[11px] text-center pt-8">
                <div>
                  <div className="border-b border-slate-400 w-32 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Student Candidate Signature</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-32 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Verifying Officer Signature</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-32 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Registrar / Institute Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INLINE DOCUMENT FILE PREVIEW (PDF / IMAGE VIEWER) */}
      {/* ========================================================================= */}
      {previewDocFile && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
          onClick={() => setPreviewDocFile(null)}
        >
          <div 
            className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <span>{previewDocFile.title}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {previewDocFile.studentName} ({previewDocFile.rollNo})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewDocFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const clean = previewDocFile.title.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
                    handleDownloadFile(previewDocFile.url, `${previewDocFile.rollNo}_${clean}.pdf`);
                  }}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Copy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDocFile(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[60vh]">
              {previewDocFile.url?.endsWith('.jpg') || previewDocFile.url?.endsWith('.jpeg') || previewDocFile.url?.endsWith('.png') ? (
                <img 
                  src={previewDocFile.url} 
                  alt={previewDocFile.title} 
                  className="max-h-[75vh] max-w-full rounded-xl shadow-lg object-contain bg-white p-2"
                />
              ) : (
                <iframe
                  src={previewDocFile.url}
                  title={previewDocFile.title}
                  className="w-full h-[75vh] rounded-xl shadow-lg border border-slate-300 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SINGLE HARDCOPY SUBMISSION CERTIFICATE SLIP */}
      {/* ========================================================================= */}
      {singleHardcopySlip && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
          onClick={() => setSingleHardcopySlip(null)}
        >
          <div 
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Control Bar */}
            <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-800">
              <span className="text-xs font-bold text-emerald-400">Physical Hardcopy Receipt Certificate</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Certificate
                </button>
                <button
                  type="button"
                  onClick={() => setSingleHardcopySlip(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Slip */}
            <div className="printable-area p-8 bg-white text-slate-900 text-xs space-y-4 overflow-y-auto flex-1 font-sans">
              <div className="border-b-2 border-slate-900 pb-3 text-center">
                <h2 className="font-serif-univ font-black text-lg text-slate-900 uppercase">
                  PKC Education Learning Institute &amp; Consultancy
                </h2>
                <p className="text-xs font-bold text-indigo-900">
                  Original Hardcopy Document Deposit &amp; Custody Slip
                </p>
                <p className="text-[10px] text-slate-500">Chhatarpur (M.P.) • Official Admission Records</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Student Name:</span>
                  <strong className="text-slate-900 uppercase font-bold">{singleHardcopySlip.student.fullName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Roll / Enrollment No:</span>
                  <strong className="text-indigo-900 font-mono font-bold">{singleHardcopySlip.student.rollNo}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">College / Institute:</span>
                  <span className="font-bold text-slate-800">{singleHardcopySlip.student.collegeName || 'PKC Education Institute'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Course &amp; Class:</span>
                  <span className="font-semibold text-slate-800">
                    {singleHardcopySlip.student.courseName} ({singleHardcopySlip.student.currentClass || 'SEM-1'})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Document Deposited:</span>
                  <strong className="text-purple-950 font-bold text-sm">{singleHardcopySlip.docName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1">
                  <span className="text-slate-500">Custody / Storage Mode:</span>
                  <span className="font-bold text-emerald-800">Original Physical Hardcopy Deposited in Campus File</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date Deposited:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(singleHardcopySlip.date).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-950">
                ✓ <strong>Official Certification:</strong> This certifies that the original hardcopy of the aforementioned document has been physically submitted to and placed into custody at the Admissions Office.
              </div>

              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] text-center pt-8">
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Student Candidate Signature</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
                  <p className="font-semibold text-slate-700">Admission Desk Custody Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: RECEIVE / UPDATE DOCUMENTS (Existing Enhanced Modal) */}
      {/* ========================================================================= */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start"
          onClick={() => setSelectedStudent(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-200 flex flex-col max-h-[92vh] animate-fadeIn text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-300">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Receive &amp; Update Student Documents (दस्तावेज़ जमा / अपडेट)
                  </h3>
                  <p className="text-xs text-indigo-200">
                    <strong className="text-white uppercase">{selectedStudent.fullName}</strong> ({selectedStudent.rollNo || selectedStudent.registrationNo || selectedStudent.enrollmentNo || 'ID: ' + selectedStudent.id}) • {selectedStudent.collegeName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {saveMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>Dual Receipt System:</strong> You can mark each document as <strong>Manually Received (Physical Hardcopy)</strong> at the campus counter, or directly <strong>Upload the PDF/File</strong>. All documents are optional and can be received in phases.
                </span>
              </div>

              {/* Document rows */}
              <div className="space-y-3">
                {standardDocuments.map(docName => {
                  const state = activeDocState[docName] || { mode: 'Pending', status: 'pending' };
                  const isUploading = uploadingDoc === docName;

                  return (
                    <div 
                      key={docName}
                      className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <strong className="font-bold text-slate-800 text-xs block">{docName}</strong>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Current Status:</span>
                          {state.mode === 'PDF' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3 text-emerald-600" /> PDF File On Record
                            </span>
                          ) : state.mode === 'Manually' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3 text-blue-600" /> Physical Hardcopy Received
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Pending (लंबित)
                            </span>
                          )}
                          {state.fileUrl && (
                            <button
                              type="button"
                              onClick={() => setPreviewDocFile({
                                title: docName,
                                url: state.fileUrl,
                                studentName: selectedStudent.fullName,
                                rollNo: selectedStudent.rollNo || selectedStudent.registrationNo || selectedStudent.enrollmentNo || selectedStudent.id
                              })}
                              className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 text-[10px] ml-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" /> View / Download PDF
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions: Download, Delete, Upload / Replace, Hardcopy */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Download Document */}
                        {state.fileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              const ext = state.fileUrl.endsWith('.png') ? '.png' : (state.fileUrl.endsWith('.jpg') || state.fileUrl.endsWith('.jpeg') ? '.jpg' : '.pdf');
                              const cleanDocName = docName.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
                              handleDownloadFile(state.fileUrl, `${selectedStudent.rollNo || selectedStudent.fullName}_${cleanDocName}${ext}`);
                            }}
                            className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="Download document file"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                        )}

                        {/* Delete Document */}
                        {(state.fileUrl || state.status !== 'pending' || state.mode !== 'Pending') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(docName)}
                            className="px-3 py-1.5 rounded-xl font-bold text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="Delete this document"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        )}

                        {/* Upload / Replace PDF or File */}
                        <label className={'px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer border inline-flex items-center gap-1.5 shadow-2xs ' + (
                          state.fileUrl 
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                        )}>
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'Uploading...' : (state.fileUrl ? 'Replace' : 'Upload PDF')}</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            disabled={isUploading}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileUpload(docName, e.target.files[0]);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>

                        {/* Physical Hardcopy toggle */}
                        <button
                          type="button"
                          onClick={() => handleModeChange(docName, state.mode === 'Manually' ? 'Pending' : 'Manually')}
                          className={'px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer border ' + (
                            state.mode === 'Manually' 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs' 
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          )}
                          title="Mark Physical Hardcopy received at counter"
                        >
                          {state.mode === 'Manually' ? '✓ Hardcopy' : '+ Hardcopy'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desk Remarks */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Desk Verification Remarks / Notes
                </label>
                <input
                  type="text"
                  value={docRemarks}
                  onChange={(e) => setDocRemarks(e.target.value)}
                  placeholder="e.g. Original marksheets verified by admission desk; TC physical copy received."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleSaveAllDocs}
                disabled={saveLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {saveLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save All Document Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
