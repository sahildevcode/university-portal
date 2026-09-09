import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Upload, FileText, CheckCircle2, AlertCircle, Printer, 
  CreditCard, Image as ImageIcon, FileCheck, Building, ShieldCheck,
  Calendar, Key, Hash, School, BookOpen, Layers, CheckSquare, Square
} from 'lucide-react';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';

export default function StudentRegistration({ courses = [], onStudentCreated, defaultCourseId, staffUser, adminUser }) {
  const [formData, setFormData] = useState({
    // 1. Personal & Contact
    Student_Name: '',
    Mother_Name: '',
    Father_Name: '',
    Date_Of_Birth: '',
    Gender: 'Male',
    Blood_Group: 'NA',
    Contact: '',
    Email_ID: '',
    Address: '',

    // 2. Government & Portal KYC IDs
    Aadhaar_No: '',
    Samagra_id: '',
    Enrollment_No: '',
    Abc_id: '',
    MPTass_id: '',
    MPTass_Password: '',
    OTR_id: '',
    Deb_id: '',
    Scholer_id: '',
    User_id: '',

    // 3. Academic & Institutional
    Medium: 'Hindi',
    Admission_Session: '2026-2027',
    Admission_Satra: 'July',
    Admission_Date: new Date().toISOString().split('T')[0],
    University_Name: 'Barkatullah University (BU Bhopal)',
    College_Name: 'PKC Education Learning Institute & Consultancy',
    Course_Name: courses[0]?.name || 'B.Tech Computer Science & Engineering',
    Branch: 'Computer Science & Engineering',
    Course_Type: 'UG',
    Course_Mode: 'Regular',
    Social_category: 'General',

    // 4. Session & Class Particulars
    Current_session: '2026-2027',
    Current_satra: 'July',
    Current_class: 'SEM-1',

    // 5. Fees & Administration
    Student_fee: courses[0]?.totalFee || '100000',
    Initial_Payment: '',
    Payment_Mode: 'Cash / Desk',
    Transaction_Ref: '',
    Status: 'Active',
    Reference: 'Direct Walk-in',
    Remark: '',
    operatorName: staffUser ? `${staffUser.name} (${staffUser.role || 'Cashier'})` : (adminUser ? 'Institute Administrator' : 'Admissions Authority')
  });

  // Selected Documents Submitted Checklist (100% Optional at Admission)
  const [submittedDocs, setSubmittedDocs] = useState([]);

  const [studentImageFile, setStudentImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showAdmissionSlip, setShowAdmissionSlip] = useState(false);

  useEffect(() => {
    if (defaultCourseId) {
      const match = courses.find(c => c.id === defaultCourseId);
      if (match) {
        setFormData(prev => ({
          ...prev,
          Course_Name: match.name,
          Student_fee: match.totalFee || prev.Student_fee
        }));
      }
    }
  }, [defaultCourseId, courses]);

  useEffect(() => {
    if (staffUser) {
      setFormData(prev => ({
        ...prev,
        operatorName: `${staffUser.name} (${staffUser.role || 'Cashier'})`
      }));
    } else if (adminUser) {
      setFormData(prev => ({
        ...prev,
        operatorName: 'Institute Administrator'
      }));
    }
  }, [staffUser, adminUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto update fee if Course_Name matches a known course
    if (name === 'Course_Name') {
      const found = courses.find(c => c.name === value);
      if (found && found.totalFee) {
        setFormData(prev => ({ ...prev, Student_fee: found.totalFee }));
      }
    }
  };

  const [docModes, setDocModes] = useState({});
  const [docFiles, setDocFiles] = useState({});

  const handleDocModeSelect = (docName, mode) => {
    setDocModes(prev => ({ ...prev, [docName]: mode }));
    if (mode === 'Pending') {
      setSubmittedDocs(prev => prev.filter(d => d !== docName));
    } else {
      setSubmittedDocs(prev => prev.includes(docName) ? prev : [...prev, docName]);
    }
  };

  const handleDocFileUpload = (docName, file) => {
    if (file) {
      setDocFiles(prev => ({ ...prev, [docName]: file }));
      setDocModes(prev => ({ ...prev, [docName]: 'PDF' }));
      setSubmittedDocs(prev => prev.includes(docName) ? prev : [...prev, docName]);
    }
  };

  const handleDocToggle = (docName) => {
    setSubmittedDocs(prev => 
      prev.includes(docName) ? prev.filter(d => d !== docName) : [...prev, docName]
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStudentImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.Student_Name.trim()) throw new Error('Student_Name is required.');
      if (!formData.Mother_Name.trim()) throw new Error('Mother_Name is required.');
      if (!formData.Father_Name.trim()) throw new Error('Father_Name is required.');
      if (!formData.Date_Of_Birth) throw new Error('Date Of Birth is required.');
      if (!formData.Aadhaar_No.trim()) throw new Error('Aadhaar_No is required.');
      if (!formData.Admission_Satra) throw new Error('Admission_Satra is required.');

      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('Document_Submit', JSON.stringify(submittedDocs));

      const docStatusMap = {};
      standardDocuments.forEach(doc => {
        const mode = docModes[doc] || (submittedDocs.includes(doc) ? 'Manually' : 'Pending');
        docStatusMap[doc] = {
          docName: doc,
          mode: mode === 'PDF' ? 'PDF / Digital Upload' : (mode === 'Manually' ? 'Manually (Physical Hardcopy)' : 'Not Submitted'),
          status: mode === 'PDF' ? 'submitted_pdf' : (mode === 'Manually' ? 'submitted_manual' : 'pending'),
          updatedAt: new Date().toISOString()
        };
      });
      data.append('documentsStatus', JSON.stringify(docStatusMap));

      // Append any document files attached
      Object.keys(docFiles).forEach(docKey => {
        if (docFiles[docKey]) {
          data.append('document_file_' + docKey.replace(/[^a-zA-Z0-9]/g, '_'), docFiles[docKey]);
        }
      });

      if (studentImageFile) {
        data.append('student_image', studentImageFile);
      }

      const res = await fetch('/api/students', {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to complete admission registration.');
      }

      setSuccessData(result);
      setShowAdmissionSlip(true);
      if (onStudentCreated) onStudentCreated(result.student);
    } catch (err) {
      setError(err.message || 'Server error during admission registration.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccessData(null);
    setStudentImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      Student_Name: '',
      Mother_Name: '',
      Father_Name: '',
      Date_Of_Birth: '',
      Contact: '',
      Email_ID: '',
      Address: '',
      Aadhaar_No: '',
      Samagra_id: '',
      Enrollment_No: '',
      Abc_id: '',
      MPTass_id: '',
      MPTass_Password: '',
      OTR_id: '',
      Deb_id: '',
      Scholer_id: '',
      User_id: '',
      Initial_Payment: '',
      Remark: ''
    }));
  };

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-slate-900">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-0.5 rounded-full border border-indigo-400/30">
              Admission Department &amp; Consultancy Portal
            </span>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
              Session 2026-2027
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            New Student Admission &amp; Document Upload
          </h1>
          <p className="text-xs text-indigo-200 max-w-2xl">
            Official University &amp; Scholarship Enrollment Form. Supports Samagra, MPTASS, ABC ID, OTR ID, DEB ID, Course particulars, and initial fee collection with instant admission slips.
          </p>
        </div>

        <div className="shrink-0 bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
          <span className="text-[10px] text-indigo-200 block uppercase font-bold tracking-wider">Terminal Authority</span>
          <span className="text-xs font-mono font-extrabold text-white block mt-0.5">
            {formData.operatorName}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-emerald-950">Admission Successfully Enrolled!</h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Candidate <strong className="uppercase">{successData.student?.fullName}</strong> registered with Roll/Enrollment No: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{successData.student?.rollNo}</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setShowAdmissionSlip(true)} 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> <span>Print Admission Slip</span>
            </button>
            <button 
              type="button" 
              onClick={resetForm} 
              className="px-4 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              + Next Admission
            </button>
          </div>
        </div>
      )}

      {/* Main Comprehensive Admission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 space-y-10">
        
        {/* ========================================================================= */}
        {/* SECTION 1: PERSONAL & FAMILY PARTICULARS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base">
              <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-xs">1</span>
              <span>Personal &amp; Family Particulars</span>
            </div>
            <span className="text-[11px] text-slate-400">* Indicates Mandatory Fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Student_Name* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student_Name *
              </label>
              <input
                type="text"
                name="Student_Name"
                value={formData.Student_Name}
                onChange={handleInputChange}
                placeholder="Full Name as per 10th marksheet"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-900 uppercase"
                required
              />
            </div>

            {/* Mother_Name* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mother_Name *
              </label>
              <input
                type="text"
                name="Mother_Name"
                value={formData.Mother_Name}
                onChange={handleInputChange}
                placeholder="Mother's Full Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium uppercase"
                required
              />
            </div>

            {/* Father_Name* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Father_Name *
              </label>
              <input
                type="text"
                name="Father_Name"
                value={formData.Father_Name}
                onChange={handleInputChange}
                placeholder="Father's Full Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium uppercase"
                required
              />
            </div>

            {/* Date Of Birth* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date Of Birth * (dd-mm-yyyy)
              </label>
              <input
                type="date"
                name="Date_Of_Birth"
                value={formData.Date_Of_Birth}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Male">Male (पुरुष)</option>
                <option value="Female">Female (महिला)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                name="Blood_Group"
                value={formData.Blood_Group}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="NA">NA (Not Available)</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Contact */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact (Mobile No)
              </label>
              <input
                type="tel"
                name="Contact"
                value={formData.Contact}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-mono"
              />
            </div>

            {/* Email ID */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email ID
              </label>
              <input
                type="email"
                name="Email_ID"
                value={formData.Email_ID}
                onChange={handleInputChange}
                placeholder="student@example.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleInputChange}
                placeholder="Village / Tehsil / City, Distt."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: IDENTITY & GOVERNMENT PORTAL KYC IDS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xs">2</span>
            <span>Identity &amp; Government Portal KYC IDs (MP Higher Education &amp; Scholarships)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Aadhaar_No* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Aadhaar_No *
              </label>
              <input
                type="text"
                name="Aadhaar_No"
                value={formData.Aadhaar_No}
                onChange={handleInputChange}
                placeholder="12-digit Aadhaar No"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none"
                required
              />
            </div>

            {/* Samagra_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Samagra_id (समग्र आईडी)
              </label>
              <input
                type="text"
                name="Samagra_id"
                value={formData.Samagra_id}
                onChange={handleInputChange}
                placeholder="9-digit Samagra ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Enrollment_No */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enrollment_No
              </label>
              <input
                type="text"
                name="Enrollment_No"
                value={formData.Enrollment_No}
                onChange={handleInputChange}
                placeholder="e.g. BU2026-9988 or Roll No"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none uppercase"
              />
            </div>

            {/* Abc_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Abc_id (Academic Bank of Credits)
              </label>
              <input
                type="text"
                name="Abc_id"
                value={formData.Abc_id}
                onChange={handleInputChange}
                placeholder="12-digit ABC ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* MPTass_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                MPTass_id (M.P. Tribal Portal)
              </label>
              <input
                type="text"
                name="MPTass_id"
                value={formData.MPTass_id}
                onChange={handleInputChange}
                placeholder="User ID on MPTASS"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* MPTass_Password */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                MPTass_Password
              </label>
              <input
                type="text"
                name="MPTass_Password"
                value={formData.MPTass_Password}
                onChange={handleInputChange}
                placeholder="Password for MPTASS"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* OTR_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                OTR_id (One Time Reg ID)
              </label>
              <input
                type="text"
                name="OTR_id"
                value={formData.OTR_id}
                onChange={handleInputChange}
                placeholder="OTR Reference ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Deb_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Deb_id (Distance Education Bureau)
              </label>
              <input
                type="text"
                name="Deb_id"
                value={formData.Deb_id}
                onChange={handleInputChange}
                placeholder="DEB ID (if applicable)"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Scholer_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Scholer_id (Scholarship ID)
              </label>
              <input
                type="text"
                name="Scholer_id"
                value={formData.Scholer_id}
                onChange={handleInputChange}
                placeholder="National / State Scholarship ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* User_id */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                User_id (e-Pravesh / Portal Login)
              </label>
              <input
                type="text"
                name="User_id"
                value={formData.User_id}
                onChange={handleInputChange}
                placeholder="University Portal User ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: UNIVERSITY, COLLEGE & ACADEMIC PROGRAM */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs">3</span>
            <span>University, College &amp; Academic Program Selection</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* University_Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                University_Name
              </label>
              <select
                name="University_Name"
                value={formData.University_Name}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Barkatullah University (BU Bhopal)">Barkatullah University (BU Bhopal)</option>
                <option value="Jiwaji University, Gwalior">Jiwaji University, Gwalior</option>
                <option value="RGPV Bhopal (Rajiv Gandhi Proudyogiki Vishwavidyalaya)">RGPV Bhopal (Engineering &amp; Tech)</option>
                <option value="Maharaja Chhatrasal Bundelkhand University (MCBU Chhatarpur)">MCBU Chhatarpur (Bundelkhand Univ)</option>
                <option value="Rani Durgavati Vishwavidyalaya (RDVV Jabalpur)">RDVV Jabalpur</option>
                <option value="Vikram University, Ujjain">Vikram University, Ujjain</option>
                <option value="Awadhesh Pratap Singh University (APSU Rewa)">APSU Rewa</option>
                <option value="Dr. Harisingh Gour Central University, Sagar">Dr. Harisingh Gour University, Sagar</option>
                <option value="PKC Consultancy Affiliated University">PKC Consultancy Affiliated University</option>
              </select>
            </div>

            {/* College_Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                College_Name
              </label>
              <select
                name="College_Name"
                value={formData.College_Name}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="PKC Education Learning Institute & Consultancy, Chhatarpur">PKC Education Learning Institute &amp; Consultancy, Chhatarpur</option>
                <option value="Govt. Maharaja Post Graduate College, Chhatarpur">Govt. Maharaja Post Graduate College, Chhatarpur</option>
                <option value="Govt. Girls College, Chhatarpur">Govt. Girls College, Chhatarpur</option>
                <option value="Pt. L.L.N. Post Graduate College, Chhatarpur">Pt. L.L.N. Post Graduate College, Chhatarpur</option>
                <option value="Govt. Polytechnic College, Nowgong">Govt. Polytechnic College, Nowgong</option>
                <option value="Bhavani Shiksha Mahavidyalaya, Chhatarpur">Bhavani Shiksha Mahavidyalaya, Chhatarpur</option>
                <option value="Other Affiliated Campus / College">Other Affiliated Campus / College</option>
              </select>
            </div>

            {/* Course_Name */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course_Name *
              </label>
              <select
                name="Course_Name"
                value={formData.Course_Name}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-900"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
                ))}
                <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                <option value="Bachelor of Business Administration (BBA)">Bachelor of Business Administration (BBA)</option>
                <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                <option value="Bachelor of Science (B.Sc Computer Science)">B.Sc Computer Science</option>
                <option value="Bachelor of Commerce (B.Com Computer)">B.Com Computer Application</option>
                <option value="Bachelor of Arts (B.A.)">Bachelor of Arts (B.A.)</option>
                <option value="Master of Computer Applications (MCA)">Master of Computer Applications (MCA)</option>
                <option value="Diploma in Computer Applications (DCA)">Diploma in Computer Applications (DCA)</option>
                <option value="Post Graduate Diploma in Computer (PGDCA)">PGDCA</option>
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Branch
              </label>
              <select
                name="Branch"
                value={formData.Branch}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Computer Science & Engineering">Computer Science &amp; Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Finance & Accounts">Finance &amp; Accounts</option>
                <option value="Human Resource / Marketing">Human Resource / Marketing</option>
                <option value="Commerce / Taxation">Commerce / Taxation</option>
                <option value="Humanities & Social Sciences">Humanities &amp; Social Sciences</option>
                <option value="General Studies">General Studies</option>
              </select>
            </div>

            {/* Course_Type */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course_Type
              </label>
              <select
                name="Course_Type"
                value={formData.Course_Type}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="UG">UG (Undergraduate / स्नातक)</option>
                <option value="PG">PG (Postgraduate / स्नातकोत्तर)</option>
                <option value="Diploma">Diploma (डिप्लोमा)</option>
                <option value="PG Diploma">PG Diploma (पीजी डिप्लोमा)</option>
                <option value="Certificate">Certificate Course</option>
                <option value="Doctorate">Doctorate / Ph.D.</option>
              </select>
            </div>

            {/* Course_Mode */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course_Mode
              </label>
              <select
                name="Course_Mode"
                value={formData.Course_Mode}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Regular">Regular (नियमित)</option>
                <option value="Private">Private (स्वाध्यायी)</option>
                <option value="Distance Education">Distance Education (दूरस्थ शिक्षा)</option>
                <option value="Online / Hybrid">Online / Hybrid Mode</option>
              </select>
            </div>

            {/* Medium */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Medium
              </label>
              <select
                name="Medium"
                value={formData.Medium}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="Hindi">Hindi (हिंदी माध्यम)</option>
                <option value="English">English (अंग्रेजी माध्यम)</option>
                <option value="Bilingual / Both">Bilingual / Both (हिंदी एवं अंग्रेजी)</option>
              </select>
            </div>

            {/* Social_category */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Social_category
              </label>
              <select
                name="Social_category"
                value={formData.Social_category}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="General">General (सामान्य)</option>
                <option value="OBC">OBC (अन्य पिछड़ा वर्ग)</option>
                <option value="SC">SC (अनुसूचित जाति)</option>
                <option value="ST">ST (अनुसूचित जनजाति)</option>
                <option value="EWS">EWS (आर्थिक रूप से कमजोर)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: SESSIONS, SATRA & CLASS PARTICULARS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-xs">4</span>
            <span>Admission Sessions, Satra &amp; Current Class</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Admission_Session */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission_Session
              </label>
              <select
                name="Admission_Session"
                value={formData.Admission_Session}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none text-indigo-900"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
                <option value="2028-2029">2028-2029</option>
                <option value="2029-2030">2029-2030</option>
              </select>
            </div>

            {/* Admission_Satra* */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission_Satra * (सत्र)
              </label>
              <select
                name="Admission_Satra"
                value={formData.Admission_Satra}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-900"
                required
              >
                <option value="July">July (जुलाई सत्र)</option>
                <option value="January">January (जनवरी सत्र)</option>
                <option value="Annual">Annual (वार्षिक सत्र)</option>
              </select>
            </div>

            {/* Admission_Date */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission_Date (dd-mm-yyyy)
              </label>
              <input
                type="date"
                name="Admission_Date"
                value={formData.Admission_Date}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              />
            </div>

            {/* Current_session */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current_session
              </label>
              <select
                name="Current_session"
                value={formData.Current_session}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none text-indigo-900"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
                <option value="2028-2029">2028-2029</option>
                <option value="2029-2030">2029-2030</option>
              </select>
            </div>

            {/* Current_satra */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current_satra
              </label>
              <select
                name="Current_satra"
                value={formData.Current_satra}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium"
              >
                <option value="July">July</option>
                <option value="January">January</option>
                <option value="Annual">Annual</option>
              </select>
            </div>

            {/* Current_class */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current_class (सेमेस्टर / वर्ष)
              </label>
              <select
                name="Current_class"
                value={formData.Current_class}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-900"
              >
                <option value="SEM-1">SEM-1 (1st Semester)</option>
                <option value="SEM-2">SEM-2 (2nd Semester)</option>
                <option value="SEM-3">SEM-3 (3rd Semester)</option>
                <option value="SEM-4">SEM-4 (4th Semester)</option>
                <option value="SEM-5">SEM-5 (5th Semester)</option>
                <option value="SEM-6">SEM-6 (6th Semester)</option>
                <option value="SEM-7">SEM-7 (7th Semester)</option>
                <option value="SEM-8">SEM-8 (8th Semester)</option>
                <option value="1st Year">1st Year (प्रथम वर्ष)</option>
                <option value="2nd Year">2nd Year (द्वितीय वर्ष)</option>
                <option value="3rd Year">3rd Year (तृतीय वर्ष)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: FEES, PAYMENT, STATUS & REFERENCE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-extrabold text-xs">5</span>
            <span>Fee Structure, Initial Deposit &amp; Administrative Controls</span>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Student_fee */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student_fee (Total Course Fee ₹)
              </label>
              <input
                type="number"
                name="Student_fee"
                value={formData.Student_fee}
                onChange={handleInputChange}
                placeholder="100000"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-black text-sm text-emerald-900 focus:outline-none"
              />
            </div>

            {/* Initial Paid Amount */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Paid Amount (₹)
              </label>
              <input
                type="number"
                name="Initial_Payment"
                value={formData.Initial_Payment}
                onChange={handleInputChange}
                placeholder="Initial admission deposit"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-sm text-emerald-800 focus:outline-none"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Payment Mode
              </label>
              <select
                name="Payment_Mode"
                value={formData.Payment_Mode}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none font-medium"
              >
                <option value="Cash / Desk">Cash (नकद)</option>
                <option value="UPI / QR Scan">UPI / QR Scan / PhonePe / GPay</option>
                <option value="Card Swipe POS">Debit / Credit Card Swipe</option>
                <option value="Bank NEFT / RTGS">Bank NEFT / RTGS Netbanking</option>
                <option value="Bank DD / Cheque">Demand Draft / Cheque</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                name="Status"
                value={formData.Status}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none font-bold text-emerald-800"
              >
                <option value="Active">Active (सक्रिय)</option>
                <option value="Admitted">Admitted (प्रवेशित)</option>
                <option value="Under Verification">Under Verification (दस्तावेज सत्यापन)</option>
                <option value="Pending">Pending (प्रतीक्षारत)</option>
              </select>
            </div>

            {/* Reference */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference
              </label>
              <select
                name="Reference"
                value={formData.Reference}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none font-medium text-xs"
              >
                <option value="Direct Walk-in">Direct Walk-in</option>
                <option value="Admission Counseling Desk">Admission Counseling Desk</option>
                <option value="Staff / Faculty Reference">Staff / Faculty Reference</option>
                <option value="Friend / Student Referral">Friend / Student Referral</option>
                <option value="Banner / Hoarding / Advertisement">Banner / Hoarding / Advertisement</option>
                <option value="Online Portal / Website">Online Portal / Website</option>
                <option value="Consultant / Education Partner">Consultant / Education Partner</option>
              </select>
            </div>

            {/* Remark */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Remark
              </label>
              <input
                type="text"
                name="Remark"
                value={formData.Remark}
                onChange={handleInputChange}
                placeholder="Special notes / scholarship remark"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none font-medium"
              />
            </div>

            {/* Attending Desk Officer */}
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Attending Officer
              </label>
              <input
                type="text"
                name="operatorName"
                value={formData.operatorName}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: DOCUMENT SUBMISSION (100% OPTIONAL) & STUDENT IMAGE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-xs">6</span>
              <span>Document Submission (100% Optional) &amp; Student_image Upload</span>
            </div>
            <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1 rounded-full">
              ★ सभी दस्तावेज वैकल्पिक हैं — बिना दस्तावेज के भी एडमिशन किया जा सकता है
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dual Mode Document Submission (PDF vs Manually) */}
            <div className="lg:col-span-2 space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-xs">
                    Document_Submit (Choose submission mode for each document)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    विद्यार्थी के पास जो दस्तावेज अभी उपलब्ध हैं उन्हें <strong className="text-indigo-700">PDF</strong> या <strong className="text-emerald-700">Manually (हार्डकॉपी)</strong> के रूप में दर्ज करें, बाकी <strong className="text-slate-500">Pending</strong> रहने दें।
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {standardDocuments.map(doc => {
                  const currentMode = docModes[doc] || (submittedDocs.includes(doc) ? 'Manually' : 'Pending');
                  const attachedFile = docFiles[doc];

                  return (
                    <div
                      key={doc}
                      className={`p-2.5 rounded-xl border transition-all ${
                        currentMode === 'PDF'
                          ? 'bg-purple-50/80 border-purple-300'
                          : currentMode === 'Manually'
                          ? 'bg-emerald-50/80 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            currentMode === 'PDF' ? 'bg-purple-600' : currentMode === 'Manually' ? 'bg-emerald-600' : 'bg-slate-300'
                          }`} />
                          <span className="text-xs font-bold text-slate-800">{doc}</span>
                        </div>

                        {/* Mode Selectors */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Pending Option */}
                          <button
                            type="button"
                            onClick={() => handleDocModeSelect(doc, 'Pending')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              currentMode === 'Pending'
                                ? 'bg-slate-200 text-slate-700 shadow-2xs'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                            }`}
                          >
                            Pending (बाद में)
                          </button>

                          {/* Manually (Hardcopy) Option */}
                          <button
                            type="button"
                            onClick={() => handleDocModeSelect(doc, 'Manually')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              currentMode === 'Manually'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            ✓ Manually (हार्डकॉपी)
                          </button>

                          {/* PDF Upload Option */}
                          <label
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                              currentMode === 'PDF'
                                ? 'bg-purple-600 text-white shadow-2xs'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            }`}
                          >
                            <span>📄 PDF Upload</span>
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleDocFileUpload(doc, e.target.files[0]);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Display attached file name if PDF was chosen */}
                      {currentMode === 'PDF' && (
                        <div className="mt-1.5 pt-1.5 border-t border-purple-200 text-[11px] text-purple-900 font-semibold flex items-center justify-between">
                          <span className="truncate">📎 {attachedFile ? attachedFile.name : 'PDF file selected'}</span>
                          <span className="text-[10px] text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">Ready to upload</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Student_image Upload */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Student_image (पासपोर्ट फोटो)
                </label>
                <p className="text-[11px] text-slate-400">
                  Accepts JPG, PNG up to 5MB. Photo will print on official admission confirmation slip.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                {imagePreview ? (
                  <div className="w-24 h-28 rounded-xl overflow-hidden border-2 border-indigo-600 shadow-md bg-white">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-24 h-28 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">No Image</span>
                  </div>
                )}

                <label className="cursor-pointer bg-white hover:bg-indigo-50 text-indigo-700 font-bold border border-indigo-300 px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{studentImageFile ? 'Change Photo' : 'Upload Student Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Admissions are synchronized live to Student Directory and University Treasury.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold py-3.5 px-10 rounded-2xl text-sm shadow-xl shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Enrolling Student Particulars...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Complete Admission Registration</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Printable Slip Modal */}
      {showAdmissionSlip && successData && (
        <PrintAdmissionSlip 
          student={successData.student} 
          receipt={successData.receipt} 
          onClose={() => setShowAdmissionSlip(false)} 
        />
      )}

    </div>
  );
}
