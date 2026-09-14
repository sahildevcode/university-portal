import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Upload, FileText, CheckCircle2, AlertCircle, Printer, 
  CreditCard, Image as ImageIcon, FileCheck, Building, ShieldCheck,
  Calendar, Key, Hash, School, BookOpen, Layers, CheckSquare, Square,
  Trash2, X, RefreshCw, Search, Sparkles, GraduationCap, PlusCircle, RotateCcw
} from 'lucide-react';
import PrintAdmissionSlip from '../components/PrintAdmissionSlip';

// Initial Fallback Partner Universities
const FALLBACK_UNIVERSITIES = [
  {
    id: 'univ-mpu',
    name: 'Madhyanchal Professional University Bhopal',
    shortName: 'MPU Bhopal',
    code: 'MPU01',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'univ-mcbu',
    name: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
    shortName: 'MCU Chhatarpur',
    code: 'MCU01',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  }
];

// Initial Fallback Affiliated Colleges mapped by University
const FALLBACK_COLLEGES = [
  // 12 Colleges under Madhyanchal Professional University Bhopal (univ-mpu)
  { id: 'col-bed121', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED121', name: 'BED121 - JEEVAN JYOTI SHIKSHA MAHAVIDYALAYA', shortName: 'Jeevan Jyoti Shiksha Mahavidyalaya', district: 'Chhatarpur' },
  { id: 'col-bed2097', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2097', name: 'BED2097 - Sita Ram College Of Education', shortName: 'Sita Ram College Of Education', district: 'Chhatarpur' },
  { id: 'col-bed2140', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2140', name: 'BED2140 - J J COLLEGE OF EDUCATION', shortName: 'J J College of Education', district: 'Chhatarpur' },
  { id: 'col-bed2266', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2266', name: 'BED2266 - R.D College', shortName: 'R.D College', district: 'Chhatarpur' },
  { id: 'col-bed2303', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2303', name: 'BED2303 - Bapu Mahavidyalaya Nowgong', shortName: 'Bapu Mahavidyalaya Nowgong', district: 'Chhatarpur' },
  { id: 'col-bed2385', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2385', name: 'BED2385 - SIDDHARTH SHIKSHA MAHAVIDYALAYA', shortName: 'Siddharth Shiksha Mahavidyalaya', district: 'Chhatarpur' },
  { id: 'col-bed2387', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2387', name: 'BED2387 - SHIV SHAKTI COLLEGE OF EDUCATION', shortName: 'Shiv Shakti College Of Education', district: 'Chhatarpur' },
  { id: 'col-bed2474', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2474', name: 'BED2474 - CHHATRASAL MAHAVIDHYALAY', shortName: 'Chhatrasal Mahavidhyalay', district: 'Chhatarpur' },
  { id: 'col-bed2501', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2501', name: 'BED2501 - SHRI RAJENDRA PRASAD SMARAK SHIKSHA MAHAVIDYALAYA', shortName: 'Shri Rajendra Prasad Smarak Shiksha', district: 'Chhatarpur' },
  { id: 'col-bed2526', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2526', name: 'BED2526 - SWAMI VIVEKANAND SHIKSHA MAHAVIDYALAYA', shortName: 'Swami Vivekanand Shiksha Mahavidyalaya', district: 'Chhatarpur' },
  { id: 'col-bed2555', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2555', name: 'BED2555 - ANAND SHIKSHA MAHAVIDYALAYA', shortName: 'Anand Shiksha Mahavidyalaya', district: 'Chhatarpur' },
  { id: 'col-bed2568', universityId: 'univ-mpu', universityName: 'Madhyanchal Professional University Bhopal', code: 'BED2568', name: 'BED2568 - S.V.N SHIKSHA MAHAVIDYALAYA', shortName: 'S.V.N Shiksha Mahavidyalaya', district: 'Chhatarpur' },

  // 6 Colleges under Maharaja Chhatrasal Bundelkhand University (univ-mcbu)
  { id: 'col-beled005', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'BELED005', name: 'BELED005 - GOVERNMENT POST GRADUATE COLLEGE CHHATARPUR', shortName: 'Govt PG College Chhatarpur', district: 'Chhatarpur' },
  { id: 'col-n462', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'N462', name: 'N462 - Govt Maharaja Post Graduate College, Chhatarpur', shortName: 'Govt Maharaja PG College', district: 'Chhatarpur' },
  { id: 'col-mcsm', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'MCSM', name: 'MCSM - Maharaja Chhatrasal Shiksha Mahavidyalaya', shortName: 'Maharaja Chhatrasal Shiksha Mahavidyalaya', district: 'Chhatarpur' },
  { id: 'col-svn01', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'SVN01', name: 'SVN01 - SVN Post Graduate College, Chhatarpur', shortName: 'SVN Post Graduate College', district: 'Chhatarpur' },
  { id: 'col-src-khop', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'SRC-KHOP', name: 'SRC-KHOP - Shri Ram College of Higher Education, Khop', shortName: 'Shri Ram College Khop', district: 'Chhatarpur' },
  { id: 'col-skce-orchha', universityId: 'univ-mcbu', universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)', code: 'SKCE-ORCHHA', name: 'SKCE-ORCHHA - Shri Krishna College of Education, Orchha', shortName: 'Shri Krishna College Orchha', district: 'Niwari' }
];

// Academic Degree Programs & Structured Branches
const ACADEMIC_PROGRAMS = [
  {
    degree: 'B.Tech',
    name: 'B.Tech (Bachelor of Technology)',
    courseType: 'UG',
    defaultFee: 280000,
    branches: [
      { name: 'Artificial Intelligence & Machine Learning (A)', code: 'BTECH-AIML', fullName: 'B.Tech- Artificial Intelligence & Machine Learning (A)', fee: 280000 },
      { name: 'Computer Science & Engineering (A)', code: 'BTECH-CSE-A', fullName: 'B.Tech- Computer Science & Engineering (A)', fee: 280000 },
      { name: 'Computer Science & Engineering (B)', code: 'BTECH-CSE-B', fullName: 'B.Tech- Computer Science & Engineering (B)', fee: 280000 },
      { name: 'Data Science (A)', code: 'BTECH-DS', fullName: 'B.Tech- Data Science (A)', fee: 280000 },
      { name: 'Electrical and Electronics Engineering', code: 'BTECH-EEE', fullName: 'B.Tech- Electrical and Electronics Engineering', fee: 280000 },
      { name: 'Electrical Engineering', code: 'BTECH-EE', fullName: 'B.Tech- Electrical Engineering', fee: 280000 },
      { name: 'Electronics & Communication Engineering (A)', code: 'BTECH-ECE-A', fullName: 'B.Tech- Electronics & Communication Engineering (A)', fee: 280000 },
      { name: 'Agricultural Engineering', code: 'BTECH-AGRI', fullName: 'B.Tech- Agricultural Engineering', fee: 280000 },
      { name: 'Civil Engineering', code: 'BTECH-CIVIL', fullName: 'B.Tech- Civil Engineering', fee: 280000 },
      { name: 'Electronics and Communication Engineering', code: 'BTECH-EC', fullName: 'B.Tech- Electronics and Communication Engineering', fee: 280000 },
      { name: 'Mechanical Engineering (A)', code: 'BTECH-ME-A', fullName: 'B.Tech- Mechanical Engineering (A)', fee: 280000 },
      { name: 'Mechanical Engineering (B)', code: 'BTECH-ME-B', fullName: 'B.Tech- Mechanical Engineering (B)', fee: 280000 },
      { name: 'Mining Engineering', code: 'BTECH-MINING', fullName: 'B.Tech- Mining Engineering', fee: 280000 }
    ]
  },
  {
    degree: 'MBA',
    name: 'MBA (Master of Business Administration)',
    courseType: 'PG',
    defaultFee: 120000,
    branches: [
      { name: 'Agri Business Management', code: 'MBA-AGRI', fullName: 'MBA- Agri Business Management', fee: 120000 },
      { name: 'Banking Insurance', code: 'MBA-BANK', fullName: 'MBA- Banking Insurance', fee: 120000 },
      { name: 'Entrepreneurship', code: 'MBA-ENTR', fullName: 'MBA- Entrepreneurship', fee: 120000 },
      { name: 'Hospital Administration', code: 'MBA-HOSP', fullName: 'MBA- Hospital Administration', fee: 120000 },
      { name: 'IT', code: 'MBA-IT', fullName: 'MBA- IT', fee: 120000 },
      { name: 'NGO', code: 'MBA-NGO', fullName: 'MBA- NGO', fee: 120000 },
      { name: 'Plain', code: 'MBA-PLAIN', fullName: 'MBA- Plain', fee: 120000 },
      { name: 'Retail', code: 'MBA-RETAIL', fullName: 'MBA- Retail', fee: 120000 }
    ]
  },
  {
    degree: 'B.Ed',
    name: 'B.Ed (Bachelor of Education)',
    courseType: 'UG',
    defaultFee: 80000,
    branches: [
      { name: 'Teacher Education & Pedagogy', code: 'BED-EDU', fullName: 'B.Ed Teacher Education & Pedagogy', fee: 80000 },
      { name: 'Elementary Education', code: 'BED-ELEM', fullName: 'B.Ed Elementary Education', fee: 80000 },
      { name: 'Special Education', code: 'BED-SPEC', fullName: 'B.Ed Special Education', fee: 85000 }
    ]
  },
  {
    degree: 'B.El.Ed',
    name: 'B.El.Ed (Bachelor of Elementary Education)',
    courseType: 'UG',
    defaultFee: 85000,
    branches: [
      { name: 'Elementary Education & Child Pedagogy', code: 'BELED-01', fullName: 'B.El.Ed Elementary Education', fee: 85000 }
    ]
  },
  {
    degree: 'BCA',
    name: 'BCA (Bachelor of Computer Applications)',
    courseType: 'UG',
    defaultFee: 90000,
    branches: [
      { name: 'Computer Applications & Software Development', code: 'BCA-CS', fullName: 'BCA Computer Applications', fee: 90000 },
      { name: 'Data Science & Web Technologies', code: 'BCA-DS', fullName: 'BCA Data Science & Web Tech', fee: 95000 }
    ]
  },
  {
    degree: 'BBA',
    name: 'BBA (Bachelor of Business Administration)',
    courseType: 'UG',
    defaultFee: 90000,
    branches: [
      { name: 'General Business Management', code: 'BBA-GEN', fullName: 'BBA Business Administration', fee: 90000 },
      { name: 'Marketing & Digital Sales', code: 'BBA-MKT', fullName: 'BBA Marketing & Digital Sales', fee: 95000 }
    ]
  },
  {
    degree: 'B.Sc',
    name: 'B.Sc (Bachelor of Science)',
    courseType: 'UG',
    defaultFee: 60000,
    branches: [
      { name: 'Computer Science', code: 'BSC-CS', fullName: 'B.Sc Computer Science', fee: 65000 },
      { name: 'Mathematics, Physics & Chemistry (PCM)', code: 'BSC-PCM', fullName: 'B.Sc PCM', fee: 60000 },
      { name: 'Biology, Chemistry & Botany (CBZ)', code: 'BSC-CBZ', fullName: 'B.Sc CBZ', fee: 60000 }
    ]
  },
  {
    degree: 'B.Com',
    name: 'B.Com (Bachelor of Commerce)',
    courseType: 'UG',
    defaultFee: 50000,
    branches: [
      { name: 'Computer Applications', code: 'BCOM-CA', fullName: 'B.Com Computer Applications', fee: 55000 },
      { name: 'Taxation & Financial Accounting', code: 'BCOM-TAX', fullName: 'B.Com Taxation & Accounting', fee: 50000 }
    ]
  },
  {
    degree: 'B.A.',
    name: 'B.A. (Bachelor of Arts)',
    courseType: 'UG',
    defaultFee: 40000,
    branches: [
      { name: 'Humanities & Social Sciences', code: 'BA-HUM', fullName: 'B.A. Humanities & Social Sciences', fee: 40000 },
      { name: 'History, Political Science & Economics', code: 'BA-GEN', fullName: 'B.A. General Studies', fee: 40000 }
    ]
  },
  {
    degree: 'MCA',
    name: 'MCA (Master of Computer Applications)',
    courseType: 'PG',
    defaultFee: 120000,
    branches: [
      { name: 'Cloud Computing & Full Stack Development', code: 'MCA-CS', fullName: 'MCA Cloud & Full Stack', fee: 120000 },
      { name: 'Artificial Intelligence & Machine Learning', code: 'MCA-AI', fullName: 'MCA AI & Machine Learning', fee: 130000 }
    ]
  },
  {
    degree: 'DCA',
    name: 'DCA (Diploma in Computer Applications)',
    courseType: 'Diploma',
    defaultFee: 25000,
    branches: [
      { name: 'Computer Applications & Office Suite', code: 'DCA-GEN', fullName: 'DCA Computer Applications', fee: 25000 }
    ]
  },
  {
    degree: 'PGDCA',
    name: 'PGDCA (Post Graduate Diploma in Computer Applications)',
    courseType: 'PG Diploma',
    defaultFee: 30000,
    branches: [
      { name: 'Advanced Computer Applications & IT', code: 'PGDCA-IT', fullName: 'PGDCA Advanced Computer Applications', fee: 30000 }
    ]
  }
];

// LocalStorage key for saving draft admission form
const REGISTRATION_DRAFT_KEY = 'pkc_registration_draft_v1';

const getSavedRegistrationDraft = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (e) {
    console.warn('Could not parse registration draft:', e);
    return null;
  }
};

const getDefaultFormData = (staffUser, adminUser) => ({
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

  // 3. Academic & Institutional (Cascading)
  University_Name: FALLBACK_UNIVERSITIES[0]?.name || '',
  College_Name: FALLBACK_COLLEGES[0]?.name || '',
  Course_Name: 'B.Tech- Artificial Intelligence & Machine Learning (A)',
  Branch: 'Artificial Intelligence & Machine Learning (A)',
  Course_Type: 'UG',
  Course_Mode: 'Regular',
  Medium: 'English',
  Social_category: 'General',

  // 4. Session & Class Particulars
  Admission_Session: '2026-2027',
  Admission_Satra: 'July',
  Admission_Date: new Date().toISOString().split('T')[0],
  Current_session: '2026-2027',
  Current_satra: 'July',
  Current_class: 'SEM-1',

  // 5. Fees & Administration (Separate Course Fee & Admission Fee)
  Student_fee: '30000',          // Total Course Fee (e.g. 30000)
  Scholarship_Amount: '0',       // Government / Institutional Scholarship (defaults to 0)
  Course_Fee_Paid: '',           // How much student is paying for course fee now
  Fee_Type: 'Admission Fee',     // Fee category (Admission Fee, Late Exam Fee, etc.)
  Admission_Fee: '2000',         // Total Admission / Extra Fee (e.g. 2000)
  Admission_Fee_Paid: '2000',    // How much student is paying for admission fee now (e.g. 2000)
  Initial_Payment: '2000',       // Combined total paid
  Payment_Mode: 'Cash / Desk',
  Fee_Collected_By: 'Cashier',
  Transaction_Ref: '',
  Status: 'Active',
  Reference: '',
  Remark: '',
  isDualEnrollment: false,
  primaryRollNo: null,
  primaryStudentId: null,
  operatorName: staffUser ? `${staffUser.name} (${staffUser.role || 'Cashier'})` : (adminUser ? 'Institute Administrator' : 'Admissions Authority')
});

const getDefaultSecFormData = () => ({
  University_Name: FALLBACK_UNIVERSITIES[1]?.name || FALLBACK_UNIVERSITIES[0]?.name || '',
  College_Name: FALLBACK_COLLEGES[4]?.name || FALLBACK_COLLEGES[0]?.name || '',
  Course_Name: 'DCA (Diploma in Computer Applications)',
  Branch: 'Computer Applications & Office Suite',
  Course_Type: 'Diploma',
  Course_Mode: 'Regular',
  Medium: 'Hindi Medium',
  Student_fee: '25000',
  Scholarship_Amount: '0',
  Course_Fee_Paid: '0',
  Admission_Fee: '0',
  Admission_Fee_Paid: '0',
  Current_class: 'SEM-1',
  Current_session: '2026-2027',
  Current_satra: 'July'
});

export default function StudentRegistration({ courses = [], onStudentCreated, defaultCourseId, staffUser, adminUser }) {
  const savedDraft = getSavedRegistrationDraft();

  // Universities & Colleges list from API with database fallbacks
  const [universitiesList, setUniversitiesList] = useState(FALLBACK_UNIVERSITIES);
  const [collegesList, setCollegesList] = useState(FALLBACK_COLLEGES);
  const [allCoursesList, setAllCoursesList] = useState(courses.length > 0 ? courses : []);

  // Cascading Selection State
  const [selectedDegree, setSelectedDegree] = useState(() => savedDraft?.selectedDegree || 'B.Tech');

  const [formData, setFormData] = useState(() => {
    const defaults = getDefaultFormData(staffUser, adminUser);
    if (savedDraft?.formData) {
      return {
        ...defaults,
        ...savedDraft.formData,
        operatorName: defaults.operatorName
      };
    }
    return defaults;
  });

  // Dual Program / 2nd Course Fast-Fill Lookup State
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);
  const [isDualMode, setIsDualMode] = useState(() => !!savedDraft?.isDualMode);

  // In-Form Secondary Course State (Section 3 Red Button "+ Add Course")
  const [hasSecondaryCourse, setHasSecondaryCourse] = useState(() => {
    return typeof savedDraft?.hasSecondaryCourse === 'boolean' ? savedDraft.hasSecondaryCourse : false;
  });
  const [secSelectedDegree, setSecSelectedDegree] = useState(() => savedDraft?.secSelectedDegree || 'DCA');
  const [secFormData, setSecFormData] = useState(() => {
    const defaults = getDefaultSecFormData();
    if (savedDraft?.secFormData) {
      return { ...defaults, ...savedDraft.secFormData };
    }
    return defaults;
  });
  const [printSlipTarget, setPrintSlipTarget] = useState('primary'); // 'primary' or 'secondary'

  // Selected Documents Submitted Checklist (100% Optional at Admission)
  const [submittedDocs, setSubmittedDocs] = useState(() => {
    return Array.isArray(savedDraft?.submittedDocs) ? savedDraft.submittedDocs : [];
  });
  const [docModes, setDocModes] = useState(() => {
    return savedDraft?.docModes && typeof savedDraft.docModes === 'object' ? savedDraft.docModes : {};
  });
  const [docFiles, setDocFiles] = useState({});

  // Student Photo Upload State with Cancel/Remove
  const [studentImageFile, setStudentImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(() => savedDraft?.imagePreview || null);
  const [draftSavedAt, setDraftSavedAt] = useState(() => savedDraft?.savedAt || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showAdmissionSlip, setShowAdmissionSlip] = useState(false);

  // Auto-save registration form draft on any user change
  useEffect(() => {
    const hasAnyInput = Boolean(
      formData.Student_Name?.trim() ||
      formData.Mother_Name?.trim() ||
      formData.Father_Name?.trim() ||
      formData.Contact?.trim() ||
      formData.Aadhaar_No?.trim() ||
      formData.Email_ID?.trim() ||
      formData.Address?.trim() ||
      submittedDocs.length > 0 ||
      hasSecondaryCourse ||
      imagePreview
    );

    if (!hasAnyInput) return;

    try {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const payload = {
        formData,
        secFormData,
        hasSecondaryCourse,
        secSelectedDegree,
        selectedDegree,
        submittedDocs,
        docModes,
        isDualMode,
        imagePreview: (imagePreview && imagePreview.length < 2000000) ? imagePreview : null,
        savedAt: now
      };
      localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(payload));
      setDraftSavedAt(now);
    } catch (err) {
      console.warn('LocalStorage draft save error:', err);
      try {
        const payloadNoImg = {
          formData,
          secFormData,
          hasSecondaryCourse,
          secSelectedDegree,
          selectedDegree,
          submittedDocs,
          docModes,
          isDualMode,
          imagePreview: null,
          savedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
        localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(payloadNoImg));
      } catch (e) {}
    }
  }, [formData, secFormData, hasSecondaryCourse, secSelectedDegree, selectedDegree, submittedDocs, docModes, isDualMode, imagePreview]);

  // 1. Fetch live Universities and Colleges from API (created in University section)
  useEffect(() => {
    const fetchUniversitiesAndColleges = async () => {
      try {
        const [uRes, cRes, crsRes] = await Promise.all([
          fetch('/api/universities'),
          fetch('/api/colleges'),
          fetch('/api/courses')
        ]);
        const uData = await uRes.json();
        const cData = await cRes.json();
        const crsData = await crsRes.json();

        if (uData.success && Array.isArray(uData.universities) && uData.universities.length > 0) {
          setUniversitiesList(uData.universities);
          // If current selected university isn't in fetched list, set to first
          if (!uData.universities.some(u => u.name === formData.University_Name)) {
            const firstUniv = uData.universities[0];
            setFormData(prev => ({
              ...prev,
              University_Name: firstUniv.name
            }));
          }
        }

        if (cData.success && Array.isArray(cData.colleges) && cData.colleges.length > 0) {
          setCollegesList(cData.colleges);
        }

        if (crsData.success && Array.isArray(crsData.courses) && crsData.courses.length > 0) {
          setAllCoursesList(crsData.courses);
        }
      } catch (err) {
        console.warn('Could not fetch live universities/colleges, using database fallback:', err);
      }
    };

    fetchUniversitiesAndColleges();
  }, []);

  // AI Robot Assistant Event Listener for Pre-filling
  useEffect(() => {
    const handleAIAction = (event) => {
      const detail = event.detail || {};
      if (detail.type === 'open-admission') {
        if (detail.courseName) {
          setFormData(prev => ({
            ...prev,
            Course_Name: detail.courseName,
            Branch: detail.courseName
          }));
          if (detail.courseName.includes('MBA')) {
            setSelectedDegree('MBA');
          } else if (detail.courseName.includes('B.Tech')) {
            setSelectedDegree('B.Tech');
          } else if (detail.courseName.includes('B.Ed')) {
            setSelectedDegree('B.Ed');
          } else if (detail.courseName.includes('BCA')) {
            setSelectedDegree('BCA');
          } else if (detail.courseName.includes('BBA')) {
            setSelectedDegree('BBA');
          }
        }
      }
    };
    window.addEventListener('ai-action', handleAIAction);
    return () => window.removeEventListener('ai-action', handleAIAction);
  }, []);

  // Set attending operator
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

  // Derive affiliated colleges for current selected university
  const selectedUnivObj = universitiesList.find(u => 
    u.name === formData.University_Name ||
    (u.shortName && formData.University_Name.includes(u.shortName))
  ) || universitiesList[0];

  const affiliatedColleges = collegesList.filter(c => {
    if (!selectedUnivObj) return true;
    return c.universityId === selectedUnivObj.id || 
           (c.universityName && c.universityName.toLowerCase() === selectedUnivObj.name.toLowerCase());
  });

  // Current program metadata (branches under selected degree)
  const currentProgram = ACADEMIC_PROGRAMS.find(p => p.degree === selectedDegree) || ACADEMIC_PROGRAMS[0];

  // Dynamically derive branches for selected degree from admin / courses database
  const dbBranchesForDegree = allCoursesList
    .filter(c => (c.degree && c.degree.toLowerCase() === selectedDegree.toLowerCase()) || 
                 (c.name && c.name.toLowerCase().startsWith(selectedDegree.toLowerCase())))
    .map(c => {
      let branchName = c.name;
      if (branchName.toLowerCase().startsWith(selectedDegree.toLowerCase())) {
        branchName = branchName.slice(selectedDegree.length).replace(/^[\s\-–—:]+/, '');
      }
      return {
        name: branchName.trim() || c.name,
        code: c.code,
        fullName: c.name,
        fee: c.totalFee
      };
    });

  const availableBranches = dbBranchesForDegree.length > 0 
    ? dbBranchesForDegree 
    : (currentProgram?.branches || []);

  // Handle University Change -> filters colleges and defaults to first affiliated college
  const handleUniversityChange = (e) => {
    const newUnivName = e.target.value;
    const targetUniv = universitiesList.find(u => u.name === newUnivName);
    const targetId = targetUniv?.id;

    const newAffiliated = collegesList.filter(c => 
      c.universityId === targetId || 
      (c.universityName && c.universityName.toLowerCase() === newUnivName.toLowerCase())
    );

    const firstCollegeName = newAffiliated[0]?.name || (targetUniv ? `${targetUniv.name} Campus` : '');

    setFormData(prev => ({
      ...prev,
      University_Name: newUnivName,
      College_Name: firstCollegeName
    }));
  };

  // Handle Degree Change (e.g. B.Tech, MBA) -> updates branches, course name, fee, type
  const handleDegreeChange = (e) => {
    const newDegree = e.target.value;
    setSelectedDegree(newDegree);

    const prog = ACADEMIC_PROGRAMS.find(p => p.degree === newDegree) || ACADEMIC_PROGRAMS[0];
    const firstBranch = prog.branches[0];

    setFormData(prev => ({
      ...prev,
      Course_Name: firstBranch?.fullName || `${newDegree} - ${firstBranch?.name || 'General'}`,
      Branch: firstBranch?.name || 'General',
      Course_Type: prog.courseType,
      Student_fee: String(firstBranch?.fee || prog.defaultFee)
    }));
  };

  // Handle Branch Change -> updates course name and course fee
  const handleBranchChange = (e) => {
    const newBranchName = e.target.value;
    const branchObj = availableBranches.find(b => b.name === newBranchName);

    setFormData(prev => ({
      ...prev,
      Branch: newBranchName,
      Course_Name: branchObj?.fullName || `${selectedDegree}- ${newBranchName}`,
      Student_fee: String(branchObj?.fee || prev.Student_fee)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Secondary Program Cascading Selection Logic
  const secSelectedUnivObj = universitiesList.find(u => 
    u.name === secFormData.University_Name ||
    (u.shortName && secFormData.University_Name?.includes(u.shortName))
  ) || universitiesList[0];

  const secAffiliatedColleges = collegesList.filter(c => {
    if (!secSelectedUnivObj) return true;
    return c.universityId === secSelectedUnivObj.id || 
           (c.universityName && c.universityName.toLowerCase() === secSelectedUnivObj.name.toLowerCase());
  });

  const secCurrentProgram = ACADEMIC_PROGRAMS.find(p => p.degree === secSelectedDegree) || ACADEMIC_PROGRAMS[0];

  const secDbBranchesForDegree = allCoursesList
    .filter(c => (c.degree && c.degree.toLowerCase() === secSelectedDegree.toLowerCase()) || 
                 (c.name && c.name.toLowerCase().startsWith(secSelectedDegree.toLowerCase())))
    .map(c => {
      let branchName = c.name;
      if (branchName.toLowerCase().startsWith(secSelectedDegree.toLowerCase())) {
        branchName = branchName.slice(secSelectedDegree.length).replace(/^[\s\-–—:]+/, '');
      }
      return {
        name: branchName.trim() || c.name,
        code: c.code,
        fullName: c.name,
        fee: c.totalFee
      };
    });

  const secAvailableBranches = secDbBranchesForDegree.length > 0 
    ? secDbBranchesForDegree 
    : (secCurrentProgram?.branches || []);

  const handleSecUniversityChange = (e) => {
    const newUnivName = e.target.value;
    const targetUniv = universitiesList.find(u => u.name === newUnivName);
    const targetId = targetUniv?.id;

    const newAffiliated = collegesList.filter(c => 
      c.universityId === targetId || 
      (c.universityName && c.universityName.toLowerCase() === newUnivName.toLowerCase())
    );

    const firstCollegeName = newAffiliated[0]?.name || (targetUniv ? `${targetUniv.name} Campus` : '');

    setSecFormData(prev => ({
      ...prev,
      University_Name: newUnivName,
      College_Name: firstCollegeName
    }));
  };

  const handleSecDegreeChange = (e) => {
    const newDegree = e.target.value;
    setSecSelectedDegree(newDegree);

    const prog = ACADEMIC_PROGRAMS.find(p => p.degree === newDegree) || ACADEMIC_PROGRAMS[0];
    const firstBranch = prog.branches[0];

    setSecFormData(prev => ({
      ...prev,
      Course_Name: firstBranch?.fullName || `${newDegree} - ${firstBranch?.name || 'General'}`,
      Branch: firstBranch?.name || 'General',
      Course_Type: prog.courseType || 'Diploma',
      Student_fee: String(firstBranch?.fee || prog.defaultFee || 25000)
    }));
  };

  const handleSecBranchChange = (e) => {
    const newBranchName = e.target.value;
    const branchObj = secAvailableBranches.find(b => b.name === newBranchName);

    setSecFormData(prev => ({
      ...prev,
      Branch: newBranchName,
      Course_Name: branchObj?.fullName || `${secSelectedDegree}- ${newBranchName}`,
      Student_fee: String(branchObj?.fee || prev.Student_fee)
    }));
  };

  const handleSecInputChange = (e) => {
    const { name, value } = e.target;
    setSecFormData(prev => ({ ...prev, [name]: value }));
  };

  // Dual Program Lookup Functions
  const handleLookupStudent = async (overrideQuery) => {
    const q = (typeof overrideQuery === 'string' ? overrideQuery : lookupQuery).trim();
    if (!q) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      const res = await fetch(`/api/students/lookup-dual?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.found) {
        setLookupResult(data);
      } else {
        setLookupResult({ found: false });
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setLookupResult({ found: false });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleClearLookup = () => {
    setLookupQuery('');
    setLookupResult(null);
  };

  const handleAutoFillForDualCourse = (student) => {
    if (!student) return;
    setIsDualMode(true);

    // Switch to DCA diploma by default for secondary course, or keep current
    const dcaProg = ACADEMIC_PROGRAMS.find(p => p.degree === 'DCA');
    const targetDegree = dcaProg ? 'DCA' : selectedDegree;
    setSelectedDegree(targetDegree);

    const prog = ACADEMIC_PROGRAMS.find(p => p.degree === targetDegree) || ACADEMIC_PROGRAMS[0];
    const firstBranch = prog.branches?.[0];

    const cleanPrimaryRoll = student.rollNo || '';
    const suggestedRoll = `${cleanPrimaryRoll}-${targetDegree}`;

    // Auto-populate KYC while preserving / setting dual enrollment linkage
    setFormData(prev => ({
      ...prev,
      Student_Name: student.fullName || student.Student_Name || '',
      Mother_Name: student.motherName || student.Mother_Name || '',
      Father_Name: student.fatherName || student.Father_Name || '',
      Date_Of_Birth: student.dob || student.Date_Of_Birth || '',
      Gender: student.gender || student.Gender || 'Male',
      Blood_Group: student.bloodGroup || student.Blood_Group || 'NA',
      Contact: student.phone || student.contact || student.Contact || '',
      Email_ID: student.email || student.Email_ID || '',
      Address: student.address || student.Address || '',
      Aadhaar_No: student.aadhaarNo || student.aadharNo || student.Aadhaar_No || '',
      Samagra_id: student.samagraId || student.Samagra_id || '',
      Enrollment_No: suggestedRoll,
      Abc_id: student.abcId || student.Abc_id || '',
      MPTass_id: student.mptassId || student.MPTass_id || '',
      MPTass_Password: student.mptassPassword || student.MPTass_Password || '',
      OTR_id: student.otrId || student.OTR_id || '',
      Deb_id: student.debId || student.Deb_id || '',
      Scholer_id: student.scholarId || student.Scholer_id || '',
      User_id: student.userId || student.User_id || '',
      Course_Name: firstBranch?.fullName || `${targetDegree} - ${firstBranch?.name || 'General'}`,
      Branch: firstBranch?.name || 'General',
      Course_Type: prog.courseType || 'Diploma',
      Student_fee: String(firstBranch?.fee || prog.defaultFee || 25000),
      Scholarship_Amount: '0',
      Course_Fee_Paid: '',
      Admission_Fee: '2000',
      Admission_Fee_Paid: '2000',
      Initial_Payment: '2000',
      Reference: `Dual Admission (Primary: ${cleanPrimaryRoll})`,
      isDualEnrollment: 'true',
      primaryRollNo: cleanPrimaryRoll,
      primaryStudentId: String(student.id || '')
    }));

    if (student.studentImage) {
      setImagePreview(student.studentImage);
    }
  };

  // Document Modes & Attachments
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

  // Image Selection Handler
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Removal / Cancel Handler (Allows user to cancel wrongly uploaded photo)
  const handleRemoveImage = () => {
    setStudentImageFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById('student_photo_input');
    if (fileInput) {
      fileInput.value = '';
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
      if (!formData.University_Name) throw new Error('Please select a valid University.');
      if (!formData.College_Name) throw new Error('Please select an affiliated College.');
      const courseFeeCalc = Number(formData.Student_fee) || 0;
      const courseFeePaidCalc = Number(formData.Course_Fee_Paid) || 0;
      const admissionFeeCalc = Number(formData.Admission_Fee) || 0;
      const admissionFeePaidCalc = Number(formData.Admission_Fee_Paid) || 0;
      const scholarshipCalc = Number(formData.Scholarship_Amount) || 0;
      const grandTotalFeeCalc = courseFeeCalc + admissionFeeCalc;
      const netTotalFeeCalc = Math.max(0, grandTotalFeeCalc - scholarshipCalc);
      const totalPaidTodayCalc = courseFeePaidCalc + admissionFeePaidCalc;
      const grandBalanceDueCalc = Math.max(0, netTotalFeeCalc - totalPaidTodayCalc);

      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.set('Student_fee', String(courseFeeCalc));
      data.set('Course_Fee_Paid', String(courseFeePaidCalc));
      data.set('Admission_Fee', String(admissionFeeCalc));
      data.set('Admission_Fee_Paid', String(admissionFeePaidCalc));
      data.set('Initial_Payment', String(totalPaidTodayCalc));
      data.set('totalFee', String(grandTotalFeeCalc));
      data.set('scholarshipAmount', String(scholarshipCalc));
      data.set('Scholarship_Amount', String(scholarshipCalc));
      data.set('netTotalFee', String(netTotalFeeCalc));
      data.set('balanceDue', String(grandBalanceDueCalc));
      data.append('Document_Submit', JSON.stringify(submittedDocs));

      const docStatusMap = {};
      standardDocuments.forEach(doc => {
        const mode = docModes[doc] || (submittedDocs.includes(doc) ? 'Manually' : 'Pending');
        docStatusMap[doc] = {
          docName: doc,
          mode: mode === 'PDF' ? 'PDF / Digital Upload' : (mode === 'Manually' ? 'Hardcopy (Physical)' : 'Not Submitted'),
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

      // Handle student image (from live file input OR restored base64 draft)
      let fileToAppend = studentImageFile;
      if (!fileToAppend && imagePreview && typeof imagePreview === 'string' && imagePreview.startsWith('data:image')) {
        try {
          const arr = imagePreview.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          fileToAppend = new File([u8arr], `student_photo_${Date.now()}.jpg`, { type: mime });
        } catch (e) {
          console.warn('Could not reconstruct file from imagePreview:', e);
        }
      }
      if (fileToAppend) {
        data.append('student_image', fileToAppend);
      }

      if (hasSecondaryCourse) {
        data.append('secondaryCourse', JSON.stringify({
          ...secFormData,
          degree: secSelectedDegree
        }));
      }

      const res = await fetch('/api/students', {
        method: 'POST',
        body: data
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to complete admission registration.');
      }

      // Successful registration: clear the auto-saved draft so next student starts clean
      try {
        localStorage.removeItem(REGISTRATION_DRAFT_KEY);
      } catch (e) {}
      setDraftSavedAt(null);

      setSuccessData(result);
      setPrintSlipTarget('primary');
      setShowAdmissionSlip(true);
      if (onStudentCreated) onStudentCreated(result.student);
    } catch (err) {
      setError(err.message || 'Server error during admission registration.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    try {
      localStorage.removeItem(REGISTRATION_DRAFT_KEY);
    } catch (e) {}
    setDraftSavedAt(null);
    setSuccessData(null);
    handleRemoveImage();
    setSubmittedDocs([]);
    setDocModes({});
    setDocFiles({});
    setIsDualMode(false);
    setLookupResult(null);
    setLookupQuery('');
    setHasSecondaryCourse(false);
    setPrintSlipTarget('primary');
    setFormData(getDefaultFormData(staffUser, adminUser));
    setSecFormData(getDefaultSecFormData());
  };

  // Live Dual-Fee Calculations (Primary Course + Secondary Dual Course + Admission Fee - Scholarship)
  const courseFeeVal = Number(formData.Student_fee) || 0;
  const courseFeePaidVal = Number(formData.Course_Fee_Paid) || 0;
  const admissionFeeVal = Number(formData.Admission_Fee) || 0;
  const admissionFeePaidVal = Number(formData.Admission_Fee_Paid) || 0;
  const scholarshipVal = Number(formData.Scholarship_Amount) || 0;

  // Secondary Course Fees (from Section 3B "+ Add Course")
  const secCourseFeeVal = hasSecondaryCourse ? (Number(secFormData.Student_fee) || 0) : 0;
  const secCoursePaidVal = hasSecondaryCourse ? (Number(secFormData.Course_Fee_Paid) || 0) : 0;

  // Combined totals across all enrolled programs
  const totalCoursesFee = courseFeeVal + secCourseFeeVal; // Combined course fees (e.g. 50,000 + 25,000 = 75,000)
  const grandTotalFee = totalCoursesFee + admissionFeeVal; // Total package fee (e.g. 75,000 + 2,000 = 77,000)
  const netTotalFee = Math.max(0, grandTotalFee - scholarshipVal); // Deduct scholarship
  const totalPaidToday = courseFeePaidVal + admissionFeePaidVal + secCoursePaidVal; // Total paid today across both courses
  const grandBalanceDue = Math.max(0, netTotalFee - totalPaidToday); // Total remaining due across both courses

  const standardDocuments = [
    '10th Marksheet',
    '12th Marksheet',
    'Graduation Marksheet',
    'Aadhaar Card Copy',
    'Samagra ID Copy',
    'M.P. Domicile Certificate',
    'Caste Certificate',
    'Income Certificate',
    'TC / Migration Certificate',
    'Gap Certificate (if applicable)',
    'Passport Photos (4 Copies)'
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
            New Student Admission Registration
          </h1>
          <p className="text-xs text-indigo-200 max-w-2xl">
            Official University &amp; Scholarship Enrollment Form. Supports Cascading University, Affiliated College, Course Degree &amp; Branch selection with instant admission slips.
          </p>
        </div>

        <div className="shrink-0 bg-white/10 p-3 rounded-2xl border border-white/10 text-center">
          <span className="text-[10px] text-indigo-200 block uppercase font-bold tracking-wider">Terminal Authority</span>
          <span className="text-xs font-mono font-extrabold text-white block mt-0.5">
            {formData.operatorName}
          </span>
        </div>
      </div>

      {/* Auto-Save & Draft Recovery Status Banner */}
      {(draftSavedAt || Boolean(formData.Student_Name?.trim() || formData.Father_Name?.trim())) && (
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border-2 border-emerald-400/80 rounded-2xl p-3.5 px-5 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
            <div>
              <span className="font-extrabold text-slate-950 flex items-center gap-1.5">
                💾 Auto-Save Active &amp; Surakshit
                {draftSavedAt && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                    Draft Restored: {draftSavedAt}
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Aapka bhara hua data browser mein save ho raha hai. Page reload hone ya galti se band hone par bhi form khali nahi hoga!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="shrink-0 text-xs font-bold text-rose-700 hover:text-rose-950 hover:bg-rose-100 bg-white border border-rose-300 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Form ko poori tarah khali karke naya registration shuru karein"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Naya Form / Clear Draft</span>
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-center gap-3 text-sm shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-emerald-950 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-emerald-950">
                {successData.secondaryStudent ? 'Dual Admissions Successfully Enrolled!' : 'Admission Successfully Enrolled!'}
              </h3>
              <div className="text-xs text-emerald-800 mt-1 space-y-1">
                <p>
                  1. <strong className="uppercase">{successData.student?.fullName}</strong> — {successData.student?.courseName} ({successData.student?.collegeName}): <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{successData.student?.rollNo}</strong>
                </p>
                {successData.secondaryStudent && (
                  <p>
                    2. Secondary Course — {successData.secondaryStudent?.courseName} ({successData.secondaryStudent?.collegeName}): <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300">{successData.secondaryStudent?.rollNo}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              type="button" 
              onClick={() => { setPrintSlipTarget('primary'); setShowAdmissionSlip(true); }} 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" /> <span>{successData.secondaryStudent ? 'Slip 1 (Degree)' : 'Print Admission Slip'}</span>
            </button>
            {successData.secondaryStudent && (
              <button 
                type="button" 
                onClick={() => { setPrintSlipTarget('secondary'); setShowAdmissionSlip(true); }} 
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" /> <span>Slip 2 (Diploma)</span>
              </button>
            )}
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
        {/* DUAL ENROLLMENT / SECONDARY DEGREE-DIPLOMA QUICK LOOKUP */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-amber-50 via-indigo-50/40 to-amber-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <GraduationCap className="w-3 h-3" />
                  Dual Program Admission
                </span>
                <span className="text-xs font-bold text-slate-900">
                  Student Enrolling in 2nd Course (e.g. DCA while doing BCA / BA)?
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Search by Roll Number, Aadhaar Card, or Mobile number to 1-click auto-fill all student KYC details and link both courses together.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-72">
                <input 
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookupStudent(); }}}
                  placeholder="Roll No / Aadhaar / Mobile"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-amber-300 rounded-xl font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-inner"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="button"
                onClick={() => handleLookupStudent()}
                disabled={lookupLoading || !lookupQuery.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {lookupLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Find Student</span>
              </button>
              {lookupResult && (
                <button
                  type="button"
                  onClick={handleClearLookup}
                  className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Display Found Student Card */}
          {lookupResult && lookupResult.found && (
            <div className="mt-4 pt-4 border-t border-amber-200 bg-white/95 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-amber-200/60">
              <div className="flex items-center gap-3">
                {lookupResult.student?.studentImage ? (
                  <img src={lookupResult.student.studentImage} alt="" className="w-12 h-12 rounded-xl object-cover border border-amber-300 shadow-xs" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center text-base border border-amber-300">
                    {lookupResult.student?.fullName?.charAt(0) || 'S'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-slate-900 uppercase">{lookupResult.student?.fullName}</span>
                    <span className="font-mono text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-200">
                      Primary Roll: {lookupResult.student?.rollNo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap items-center gap-2">
                    <span>Enrolled in: <strong className="text-indigo-900">{lookupResult.student?.courseName}</strong></span>
                    <span>•</span>
                    <span>{lookupResult.student?.collegeName}</span>
                    {lookupResult.student?.aadhaarNo && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[11px]">Aadhaar: {lookupResult.student?.aadhaarNo}</span>
                      </>
                    )}
                  </div>
                  {lookupResult.enrollments?.length > 1 && (
                    <div className="text-[11px] text-amber-800 font-semibold mt-1">
                      Currently enrolled in {lookupResult.enrollments.length} programs ({lookupResult.enrollments.map(e => e.courseName).join(', ')})
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAutoFillForDualCourse(lookupResult.student)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>1-Click Auto-Fill for Dual Course (DCA)</span>
                </button>
              </div>
            </div>
          )}

          {lookupResult && !lookupResult.found && (
            <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>No existing student found matching "{lookupQuery}". Please verify the Roll No, Aadhaar, or Mobile number.</span>
            </div>
          )}

          {isDualMode && (
            <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl px-4 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Dual Enrollment Mode Active! Student: <strong>{formData.Student_Name}</strong> | Linked Primary Roll: <strong className="font-mono bg-white px-1.5 py-0.2 rounded border border-emerald-300">{formData.primaryRollNo}</strong> | New Program: <strong>{selectedDegree} ({formData.Course_Name})</strong>
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setIsDualMode(false);
                  setFormData(prev => ({
                    ...prev,
                    isDualEnrollment: false,
                    primaryRollNo: null,
                    primaryStudentId: null
                  }));
                }} 
                className="text-xs text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer ml-3 shrink-0"
              >
                Remove Link
              </button>
            </div>
          )}
        </div>
        
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
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
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
                Samagra_id (MP Samagra ID)
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
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">
                  Enrollment_No
                </label>
                {isDualMode && (
                  <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    Linked to {formData.primaryRollNo}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="Enrollment_No"
                value={formData.Enrollment_No}
                onChange={handleInputChange}
                placeholder="e.g. BU2026-9988 or Roll No"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl font-mono focus:bg-white focus:outline-none uppercase ${
                  isDualMode ? 'border-amber-400 bg-amber-50/40 text-indigo-950 font-bold' : 'border-slate-300'
                }`}
              />
              {isDualMode && (
                <span className="text-[10px] text-amber-800 font-semibold block mt-1">
                  💡 Disambiguated Roll for 2nd Course: {formData.Enrollment_No}
                </span>
              )}
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
        {/* SECTION 3: UNIVERSITY, AFFILIATED COLLEGE, DEGREE & BRANCH (CASCADING) */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-xs">3</span>
              <span>Academic Program &amp; Institutional Cascading Selection</span>
            </div>
            <span className="text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold px-2.5 py-0.5 rounded-md">
              University ➔ Affiliated College ➔ Course ➔ Branch Hierarchy
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* 1. UNIVERSITY_NAME (Only universities created in University Section) */}
            <div className="lg:col-span-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>University_Name *</span>
                <span className="text-[10px] text-indigo-600 font-semibold lowercase">
                  ({universitiesList.length} registered)
                </span>
              </label>
              <select
                name="University_Name"
                value={formData.University_Name}
                onChange={handleUniversityChange}
                className="w-full p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-950 shadow-2xs"
                required
              >
                {universitiesList.map(u => (
                  <option key={u.id} value={u.name}>
                    {u.name} {u.shortName ? `(${u.shortName})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Shows partner universities registered in the University Management desk.
              </p>
            </div>

            {/* 2. COLLEGE_NAME (Only colleges under selected university) */}
            <div className="lg:col-span-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>College_Name *</span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ({affiliatedColleges.length} affiliated)
                </span>
              </label>
              <select
                name="College_Name"
                value={formData.College_Name}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-emerald-950 shadow-2xs"
                required
              >
                {affiliatedColleges.length > 0 ? (
                  affiliatedColleges.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.code ? `[${c.code}] ` : ''}{c.shortName || c.name} {c.district ? `(${c.district})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No affiliated colleges registered under this university</option>
                )}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Filtered strictly to colleges affiliated with {selectedUnivObj?.shortName || formData.University_Name}.
              </p>
            </div>

            {/* 3. DEGREE PROGRAM SELECTION (B.Tech, MBA, etc.) */}
            <div className="lg:col-span-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course Program (Degree) *
              </label>
              <select
                value={selectedDegree}
                onChange={handleDegreeChange}
                className="w-full p-2.5 bg-purple-50/60 border border-purple-200 rounded-xl focus:bg-white focus:outline-none font-bold text-purple-950 shadow-2xs"
              >
                {ACADEMIC_PROGRAMS.map(prog => (
                  <option key={prog.degree} value={prog.degree}>
                    {prog.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Selecting B.Tech / MBA reveals its full catalog of branch specializations.
              </p>
            </div>

            {/* 4. BRANCH (Dynamically shows all 13 B.Tech branches or 8 MBA streams) */}
            <div className="lg:col-span-2">
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Branch / Specialization *</span>
                <span className="text-[10px] text-indigo-700 font-bold">
                  {availableBranches.length} Branches available under {selectedDegree}
                </span>
              </label>
              <select
                name="Branch"
                value={formData.Branch}
                onChange={handleBranchChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-900"
                required
              >
                {availableBranches.map((b, idx) => (
                  <option key={b.code || idx} value={b.name}>
                    {b.name} {b.code ? `[${b.code}]` : ''}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Selected branch links automatically to official syllabus and curriculum modules.
              </p>
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
                <option value="UG">UG (Undergraduate)</option>
                <option value="PG">PG (Postgraduate)</option>
                <option value="Diploma">Diploma</option>
                <option value="PG Diploma">PG Diploma</option>
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
                <option value="Regular">Regular</option>
                <option value="Private">Private</option>
                <option value="Distance Education">Distance Education</option>
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
                <option value="English">English Medium</option>
                <option value="Hindi">Hindi Medium</option>
                <option value="Bilingual / Both">Bilingual / Both</option>
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
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          {/* Red Button: + Add Course (Dual / Diploma Enrollment) */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Also Enrolling in Diploma or 2nd Course (e.g. DCA)?
              </span>
              <span className="text-[11px] text-slate-500 block">
                Click to add secondary course with independent University, College &amp; Course selection in the same admission.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setHasSecondaryCourse(!hasSecondaryCourse)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                hasSecondaryCourse
                  ? 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {hasSecondaryCourse ? (
                <>
                  <X className="w-4 h-4" />
                  <span>Remove Secondary Course</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Course</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3B: SECONDARY / DUAL PROGRAM SELECTION (INDEPENDENT) */}
        {/* ========================================================================= */}
        {hasSecondaryCourse && (
          <div className="bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 border-2 border-rose-300 rounded-3xl p-6 shadow-md space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 pb-3">
              <div className="flex items-center gap-2.5 text-rose-950 font-bold text-base">
                <span className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  3B
                </span>
                <span>Secondary / Dual Course Enrollment (e.g. DCA / Diploma)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-rose-100 text-rose-900 border border-rose-200 font-bold px-2.5 py-0.5 rounded-full">
                  Independent University &amp; College
                </span>
                <button
                  type="button"
                  onClick={() => setHasSecondaryCourse(false)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded-lg border border-rose-200"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* Secondary University */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>2nd University Name *</span>
                  <span className="text-[10px] text-rose-700 font-semibold">({universitiesList.length} registered)</span>
                </label>
                <select
                  name="University_Name"
                  value={secFormData.University_Name}
                  onChange={handleSecUniversityChange}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-950 shadow-2xs"
                  required={hasSecondaryCourse}
                >
                  {universitiesList.map(u => (
                    <option key={u.id} value={u.name}>
                      {u.name} {u.shortName ? `(${u.shortName})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Can be different from Primary University.</p>
              </div>

              {/* Secondary College */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>2nd College Name *</span>
                  <span className="text-[10px] text-rose-700 font-semibold">({secAffiliatedColleges.length} affiliated)</span>
                </label>
                <select
                  name="College_Name"
                  value={secFormData.College_Name}
                  onChange={handleSecInputChange}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-rose-950 shadow-2xs"
                  required={hasSecondaryCourse}
                >
                  {secAffiliatedColleges.length > 0 ? (
                    secAffiliatedColleges.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.code ? `[${c.code}] ` : ''}{c.shortName || c.name} {c.district ? `(${c.district})` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="">No affiliated colleges registered under this university</option>
                  )}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Filtered strictly to 2nd university colleges.</p>
              </div>

              {/* Secondary Degree / Program */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1">
                  2nd Course Program (Degree / Diploma) *
                </label>
                <select
                  value={secSelectedDegree}
                  onChange={handleSecDegreeChange}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-950 shadow-2xs"
                >
                  {ACADEMIC_PROGRAMS.map(prog => (
                    <option key={prog.degree} value={prog.degree}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Branch */}
              <div className="lg:col-span-2">
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>2nd Branch / Specialization *</span>
                  <span className="text-[10px] text-rose-700 font-bold">{secAvailableBranches.length} branches available</span>
                </label>
                <select
                  name="Branch"
                  value={secFormData.Branch}
                  onChange={handleSecBranchChange}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-slate-900"
                  required={hasSecondaryCourse}
                >
                  {secAvailableBranches.map((b, idx) => (
                    <option key={b.code || idx} value={b.name}>
                      {b.name} {b.code ? `[${b.code}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Secondary Course Type */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1">
                  2nd Course Type
                </label>
                <select
                  name="Course_Type"
                  value={secFormData.Course_Type}
                  onChange={handleSecInputChange}
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-none font-medium"
                >
                  <option value="Diploma">Diploma</option>
                  <option value="PG Diploma">PG Diploma</option>
                  <option value="UG">UG (Undergraduate)</option>
                  <option value="PG">PG (Postgraduate)</option>
                  <option value="Certificate">Certificate Course</option>
                </select>
              </div>

              {/* Secondary Course Fee */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1">
                  2nd Course Fee (₹)
                </label>
                <input
                  type="number"
                  name="Student_fee"
                  value={secFormData.Student_fee}
                  onChange={handleSecInputChange}
                  placeholder="e.g. 25000"
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              {/* Secondary Initial Fee Paid Today */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1">
                  2nd Fee Paid Today (₹)
                </label>
                <input
                  type="number"
                  name="Course_Fee_Paid"
                  value={secFormData.Course_Fee_Paid}
                  onChange={handleSecInputChange}
                  placeholder="e.g. 5000 (or 0 if unpaid)"
                  className="w-full p-2.5 bg-white border border-rose-300 rounded-xl font-mono font-bold text-emerald-700"
                />
              </div>

              {/* Secondary Course Mode & Medium */}
              <div>
                <label className="block font-bold text-rose-950 uppercase tracking-wider mb-1">
                  Mode &amp; Medium
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="Course_Mode"
                    value={secFormData.Course_Mode}
                    onChange={handleSecInputChange}
                    className="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Private">Private</option>
                    <option value="Distance">Distance</option>
                  </select>
                  <select
                    name="Medium"
                    value={secFormData.Medium}
                    onChange={handleSecInputChange}
                    className="w-full p-2 bg-white border border-rose-300 rounded-xl text-xs font-medium"
                  >
                    <option value="Hindi Medium">Hindi</option>
                    <option value="English Medium">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

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
                Admission_Satra * (Academic Term)
              </label>
              <select
                name="Admission_Satra"
                value={formData.Admission_Satra}
                onChange={handleInputChange}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-bold text-indigo-900"
                required
              >
                <option value="July">July (Main Session)</option>
                <option value="January">January (Winter Session)</option>
                <option value="Annual">Annual (Yearly Mode)</option>
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
                Current_class (Semester / Year)
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
                <option value="1st Year">1st Year (Annual)</option>
                <option value="2nd Year">2nd Year (Annual)</option>
                <option value="3rd Year">3rd Year (Annual)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: FEES, PAYMENT, STATUS & REFERENCE */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base">
              <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-extrabold text-xs">5</span>
              <span>Fee Particulars &amp; Dual Collection Breakdown</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
                {hasSecondaryCourse ? (
                  <>
                    Primary (₹{courseFeeVal.toLocaleString('en-IN')}) + 2nd Course (₹{secCourseFeeVal.toLocaleString('en-IN')}) + {formData.Fee_Type || 'Admission Fee'} (₹{admissionFeeVal.toLocaleString('en-IN')}) = Total ₹{grandTotalFee.toLocaleString('en-IN')}
                  </>
                ) : (
                  <>
                    Course Fee (₹{courseFeeVal.toLocaleString('en-IN')}) + {formData.Fee_Type || 'Admission Fee'} (₹{admissionFeeVal.toLocaleString('en-IN')}) = Total ₹{grandTotalFee.toLocaleString('en-IN')}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl space-y-5 text-xs">
            
            {/* DUAL FEE SECTION: Part 1 - Course Fee & Part 2 - Admission Fee */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* SECTION A: Course Fee Particulars */}
              <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <span className="font-extrabold text-xs text-indigo-950 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>1. Primary Course Fee ({selectedDegree || 'कोर्स फीस'})</span>
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Total: ₹{courseFeeVal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Total Course Fee */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Course Fee (Total ₹) *
                    </label>
                    <input
                      type="number"
                      name="Student_fee"
                      value={formData.Student_fee}
                      onChange={handleInputChange}
                      placeholder="30000"
                      className="w-full p-2.5 bg-indigo-50/40 border border-indigo-200 rounded-xl font-black text-sm text-indigo-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 30,000 (total package)</span>
                  </div>

                  {/* Scholarship Amount (Default 0, auto-deducts) */}
                  <div>
                    <label className="block font-bold text-indigo-950 uppercase tracking-wider mb-1 text-[11px] flex items-center justify-between">
                      <span>Scholarship (₹)</span>
                      <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-200">Default 0</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="Scholarship_Amount"
                      value={formData.Scholarship_Amount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full p-2.5 bg-indigo-50/40 border border-indigo-300 rounded-xl font-black text-sm text-indigo-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                    />
                    <span className="text-[10px] text-indigo-600 mt-0.5 block">Auto-deducted from total</span>
                  </div>

                  {/* Course Fee Paid Now */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Course Fee Paid Now (₹)
                    </label>
                    <input
                      type="number"
                      name="Course_Fee_Paid"
                      value={formData.Course_Fee_Paid}
                      onChange={handleInputChange}
                      placeholder="0 (or installment)"
                      className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-black text-sm text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Course fee given at admission</span>
                  </div>
                </div>

                {/* Secondary Course Live Indicator in Section 5 */}
                {hasSecondaryCourse && (
                  <div className="mt-2.5 p-2.5 bg-rose-50/90 border border-rose-200 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🎓</span>
                      <div>
                        <span className="font-extrabold text-rose-950 block">
                          2nd Course ({secSelectedDegree || 'Diploma'}) Package: ₹{secCourseFeeVal.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {secFormData.Course_Name || secSelectedDegree} • Paid Today: <strong className="text-emerald-700">₹{secCoursePaidVal.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-rose-200/80 text-rose-900 font-bold px-2 py-0.5 rounded">
                      Included in Combined Total Below
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION B: Admission / Extra Fee Particulars */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                  <span className="font-extrabold text-xs text-emerald-950 uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>2. Admission / Extra Fee (एडमिशन फीस)</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Total: ₹{admissionFeeVal.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Fee Head / Type */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Fee Head / Type *
                    </label>
                    <input
                      type="text"
                      list="feeTypeOptions"
                      name="Fee_Type"
                      value={formData.Fee_Type}
                      onChange={handleInputChange}
                      placeholder="Admission Fee"
                      className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl font-bold text-xs text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      required
                    />
                    <datalist id="feeTypeOptions">
                      <option value="Admission Fee" />
                      <option value="Late Exam Fee" />
                      <option value="Registration Fee" />
                      <option value="Exam Fee" />
                      <option value="Tuition Installment" />
                      <option value="Enrollment Fee" />
                    </datalist>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Category name</span>
                  </div>

                  {/* Admission Fee Total (e.g. 2000) */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Admission Fee (Total ₹) *
                    </label>
                    <input
                      type="number"
                      name="Admission_Fee"
                      value={formData.Admission_Fee}
                      onChange={handleInputChange}
                      placeholder="2000"
                      className="w-full p-2.5 bg-emerald-50/40 border border-emerald-200 rounded-xl font-black text-sm text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 2,000 or 2,500</span>
                  </div>

                  {/* Admission Fee Paid Now (e.g. 2000) */}
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                      Fee Paid Now (₹) *
                    </label>
                    <input
                      type="number"
                      name="Admission_Fee_Paid"
                      value={formData.Admission_Fee_Paid}
                      onChange={handleInputChange}
                      placeholder="2000"
                      className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-black text-sm text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Admission fee paid now</span>
                  </div>
                </div>
              </div>

            </div>

            {/* SECTION C: Payment Mode, Fee Collector, Reference & Remark */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <span className="font-extrabold text-xs text-slate-800 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>3. Payment Mode, Collector &amp; Reference</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Payment Mode */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Payment Mode *
                  </label>
                  <select
                    name="Payment_Mode"
                    value={formData.Payment_Mode}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-xs text-slate-800 shadow-2xs cursor-pointer"
                  >
                    <option value="Cash / Desk">Cash / Desk</option>
                    <option value="UPI / QR Scan">UPI / QR Scan (PhonePe / GPay / Paytm)</option>
                    <option value="Card Swipe POS">Debit / Credit Card Swipe</option>
                    <option value="Bank NEFT / RTGS">Bank NEFT / RTGS Netbanking</option>
                    <option value="Bank DD / Cheque">Demand Draft / Cheque</option>
                  </select>
                </div>

                {/* Fee Collected By */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Fee Collected By *
                  </label>
                  <input
                    type="text"
                    list="collectedByList"
                    name="Fee_Collected_By"
                    value={formData.Fee_Collected_By}
                    onChange={handleInputChange}
                    placeholder="e.g. Cashier, Accounts, Admin"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                    required
                  />
                  <datalist id="collectedByList">
                    <option value="Cashier" />
                    <option value="Accounts" />
                    <option value="Admin" />
                    <option value="Desk Counter" />
                    <option value="Counselor" />
                  </datalist>
                </div>

                {/* Reference (Typeable text - NO dropdown!) */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Reference (Referred By)
                  </label>
                  <input
                    type="text"
                    name="Reference"
                    value={formData.Reference}
                    onChange={handleInputChange}
                    placeholder="e.g. Direct Walk-in, Rahul Sharma..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-xs text-slate-800 shadow-2xs"
                  />
                </div>

                {/* Attending Officer */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                    Attending Officer
                  </label>
                  <input
                    type="text"
                    name="operatorName"
                    value={formData.operatorName}
                    onChange={handleInputChange}
                    className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-700 text-xs shadow-2xs"
                  />
                </div>
              </div>

              {/* Remark */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                  Remark / Special Notes
                </label>
                <input
                  type="text"
                  name="Remark"
                  value={formData.Remark}
                  onChange={handleInputChange}
                  placeholder="Special notes / scholarship remark"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium text-xs shadow-2xs"
                />
              </div>
            </div>

            {/* LIVE ACCOUNTING BANNER: Combined Fee Structure Display */}
            <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 flex items-center gap-2">
                    <span>Combined Fee Structure</span>
                    {hasSecondaryCourse && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full shadow-xs">
                        🎓 Dual Course Package Active (Both Courses Added)
                      </span>
                    )}
                  </span>
                  <div className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 mt-0.5 flex-wrap">
                    <span>Total Fee:</span>
                    <span className="text-emerald-300 text-xl font-mono">
                      ₹{grandTotalFee.toLocaleString('en-IN')}
                    </span>
                    {hasSecondaryCourse && (
                      <span className="text-[11px] font-semibold text-slate-200 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        (Primary: ₹{courseFeeVal.toLocaleString('en-IN')} + 2nd Course: ₹{secCourseFeeVal.toLocaleString('en-IN')} + Adm: ₹{admissionFeeVal.toLocaleString('en-IN')})
                      </span>
                    )}
                    {scholarshipVal > 0 && (
                      <span className="text-indigo-300 text-xs font-bold bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-500/40">
                        − ₹{scholarshipVal.toLocaleString('en-IN')} (Scholarship) = Net ₹{netTotalFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                    Mode &amp; Authority
                  </span>
                  <span className="text-xs font-bold text-white block">
                    {formData.Payment_Mode} • {formData.Fee_Collected_By || 'Cashier'}
                  </span>
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasSecondaryCourse ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 text-xs`}>
                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 block font-medium">1. Primary Course Fee</span>
                  <span className="font-extrabold text-sm text-white block">₹{courseFeeVal.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-300">Paid Now: ₹{courseFeePaidVal.toLocaleString('en-IN')}</span>
                </div>

                {hasSecondaryCourse && (
                  <div className="bg-amber-500/20 p-2.5 rounded-xl border border-amber-400/40 animate-fadeIn">
                    <span className="text-[10px] text-amber-200 block font-medium">2. 2nd Course ({secSelectedDegree || 'Diploma'})</span>
                    <span className="font-extrabold text-sm text-amber-300 block">₹{secCourseFeeVal.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-amber-100">Paid Now: ₹{secCoursePaidVal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-indigo-300 block font-medium">Scholarship / छात्रवृत्ति</span>
                  <span className="font-extrabold text-sm text-indigo-300 block">
                    {scholarshipVal > 0 ? `− ₹${scholarshipVal.toLocaleString('en-IN')}` : '₹0 (None)'}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    Net Fee: ₹{netTotalFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                  <span className="text-[10px] text-slate-300 block font-medium">{hasSecondaryCourse ? '3.' : '2.'} {formData.Fee_Type || 'Admission Fee'}</span>
                  <span className="font-extrabold text-sm text-white block">₹{admissionFeeVal.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-300">Paid Now: ₹{admissionFeePaidVal.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-400/30">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-emerald-200 block font-medium">Total Paid Today:</span>
                    <strong className="text-xs text-emerald-300 font-mono">₹{totalPaidToday.toLocaleString('en-IN')}</strong>
                  </div>
                  {hasSecondaryCourse && (
                    <div className="text-[9px] text-emerald-300/80 font-mono mt-0.5">
                      (C1: ₹{courseFeePaidVal} + Adm: ₹{admissionFeePaidVal} + C2: ₹{secCoursePaidVal})
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-1 pt-1 border-t border-emerald-400/20">
                    <span className="text-[10px] text-rose-300 block font-bold">Remaining Balance:</span>
                    <strong className="text-sm text-rose-300 font-black font-mono">₹{grandBalanceDue.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 6: DOCUMENT SUBMISSION (100% OPTIONAL) & STUDENT IMAGE REMOVE/CANCEL */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-indigo-950 font-bold text-base border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-extrabold text-xs">6</span>
              <span>Document Submission (100% Optional) &amp; Student Photo Upload</span>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full">
              ★ All documents are 100% optional — admission can be registered without immediate documents
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dual Mode Document Submission (PDF vs Hardcopy) */}
            <div className="lg:col-span-2 space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-slate-800 uppercase tracking-wider text-xs">
                    Document_Submit (Choose submission mode for each document)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Record documents currently submitted by candidate as <strong className="text-indigo-700">PDF</strong> or <strong className="text-emerald-700">Hardcopy (Physical)</strong>, leave others as <strong className="text-slate-500">Pending</strong>.
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
                            Pending (Later)
                          </button>

                          {/* Hardcopy (Physical) Option */}
                          <button
                            type="button"
                            onClick={() => handleDocModeSelect(doc, 'Manually')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              currentMode === 'Manually'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            ✓ Hardcopy (Physical)
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

            {/* Student Photo Upload with CANCEL & REMOVE Option */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
              <div>
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
                  Student Photo (Passport Size)
                </label>
                <p className="text-[11px] text-slate-400">
                  Accepts JPG, PNG up to 5MB. Photo will print on official admission confirmation slip.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                {imagePreview ? (
                  <div className="relative group w-28 h-32 rounded-xl overflow-hidden border-2 border-indigo-600 shadow-md bg-white">
                    <img src={imagePreview} alt="Student Preview" className="w-full h-full object-cover" />
                    {/* Quick Cross Button to cancel / remove photo */}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      title="Remove / Cancel this photo"
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-32 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-white">
                    <ImageIcon className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold">No Photo Selected</span>
                  </div>
                )}

                {/* Upload / Change & Remove Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white hover:bg-indigo-50 text-indigo-700 font-bold border border-indigo-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{studentImageFile ? 'Change Photo' : 'Upload Student Photo'}</span>
                    <input
                      type="file"
                      id="student_photo_input"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Explicit Remove / Cancel Photo Button if photo selected */}
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="cursor-pointer bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-300 px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                      title="Remove / Cancel selected photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove / Cancel</span>
                    </button>
                  )}
                </div>

                {/* File Details Indicator */}
                {imagePreview && studentImageFile && (
                  <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-center truncate max-w-full">
                    📎 {studentImageFile.name} ({(studentImageFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-3.5 rounded-2xl text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Form reset karein"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold py-3.5 px-8 rounded-2xl text-sm shadow-xl shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
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
        </div>

      </form>

      {/* Printable Slip Modal */}
      {showAdmissionSlip && successData && (
        <div className="relative">
          {successData.secondaryStudent && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] no-print bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-fadeIn">
              <span className="text-xs font-bold text-amber-400">🎓 Dual Admission:</span>
              <button
                type="button"
                onClick={() => setPrintSlipTarget('primary')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  printSlipTarget === 'primary' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                1. {successData.student?.courseName || 'Primary Course'} Slip
              </button>
              <button
                type="button"
                onClick={() => setPrintSlipTarget('secondary')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  printSlipTarget === 'secondary' 
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                2. {successData.secondaryStudent?.courseName || '2nd Course'} Slip
              </button>
            </div>
          )}
          <PrintAdmissionSlip 
            student={printSlipTarget === 'secondary' && successData.secondaryStudent ? successData.secondaryStudent : successData.student} 
            receipt={printSlipTarget === 'secondary' && successData.secondaryReceipt ? successData.secondaryReceipt : successData.receipt} 
            onClose={() => setShowAdmissionSlip(false)} 
          />
        </div>
      )}

    </div>
  );
}
