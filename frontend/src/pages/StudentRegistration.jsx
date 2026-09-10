import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Upload, FileText, CheckCircle2, AlertCircle, Printer, 
  CreditCard, Image as ImageIcon, FileCheck, Building, ShieldCheck,
  Calendar, Key, Hash, School, BookOpen, Layers, CheckSquare, Square,
  Trash2, X, RefreshCw
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

export default function StudentRegistration({ courses = [], onStudentCreated, defaultCourseId, staffUser, adminUser }) {
  // Universities & Colleges list from API with database fallbacks
  const [universitiesList, setUniversitiesList] = useState(FALLBACK_UNIVERSITIES);
  const [collegesList, setCollegesList] = useState(FALLBACK_COLLEGES);
  const [allCoursesList, setAllCoursesList] = useState(courses.length > 0 ? courses : []);

  // Cascading Selection State
  const [selectedDegree, setSelectedDegree] = useState('B.Tech');

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

    // 3. Academic & Institutional (Cascading)
    University_Name: FALLBACK_UNIVERSITIES[0].name,
    College_Name: FALLBACK_COLLEGES[0].name,
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

    // 5. Fees & Administration
    Student_fee: '30000',
    Fee_Type: 'Admission Fee',
    Initial_Payment: '2500',
    Payment_Mode: 'Cash / Desk',
    Fee_Collected_By: 'Cashier',
    Transaction_Ref: '',
    Status: 'Active',
    Reference: '',
    Remark: '',
    operatorName: staffUser ? `${staffUser.name} (${staffUser.role || 'Cashier'})` : (adminUser ? 'Institute Administrator' : 'Admissions Authority')
  });

  // Selected Documents Submitted Checklist (100% Optional at Admission)
  const [submittedDocs, setSubmittedDocs] = useState([]);
  const [docModes, setDocModes] = useState({});
  const [docFiles, setDocFiles] = useState({});

  // Student Photo Upload State with Cancel/Remove
  const [studentImageFile, setStudentImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showAdmissionSlip, setShowAdmissionSlip] = useState(false);

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
      setImagePreview(URL.createObjectURL(file));
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

      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
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
    handleRemoveImage();
    setSubmittedDocs([]);
    setDocModes({});
    setDocFiles({});
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
      Initial_Payment: '2500',
      Fee_Type: 'Admission Fee',
      Fee_Collected_By: 'Cashier',
      Reference: '',
      Remark: ''
    }));
  };

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
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2.5 text-indigo-950 font-bold text-base">
              <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-extrabold text-xs">5</span>
              <span>Fee Particulars, Admission Deposit &amp; Collection Desk</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Flexible Course &amp; Admission Fee Entry
            </span>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl space-y-4 text-xs">
            
            {/* Top Row: Course Fee -> Fee Head/Type -> Paid Amount -> Payment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* 1. Course Fee (Total Fee) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Fee (Total ₹) *
                </label>
                <input
                  type="number"
                  name="Student_fee"
                  value={formData.Student_fee}
                  onChange={handleInputChange}
                  placeholder="30000"
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-black text-sm text-emerald-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Total program course package</span>
              </div>

              {/* 2. Fee Type / Head (Admission Fee, Late Exam Fee, etc.) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fee Type / Head *
                </label>
                <input
                  type="text"
                  list="feeTypeOptions"
                  name="Fee_Type"
                  value={formData.Fee_Type}
                  onChange={handleInputChange}
                  placeholder="e.g. Admission Fee, Late Exam Fee"
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-xs text-indigo-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                  required
                />
                <datalist id="feeTypeOptions">
                  <option value="Admission Fee" />
                  <option value="Late Exam Fee" />
                  <option value="Registration Fee" />
                  <option value="Exam Fee" />
                  <option value="Tuition Installment" />
                  <option value="Enrollment Fee" />
                  <option value="Caution Deposit" />
                  <option value="Miscellaneous Fee" />
                </datalist>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Type or choose fee category</span>
              </div>

              {/* 3. Fee Amount / Paid Amount (₹) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fee Amount Paid (₹) *
                </label>
                <input
                  type="number"
                  name="Initial_Payment"
                  value={formData.Initial_Payment}
                  onChange={handleInputChange}
                  placeholder="2000 or 2500"
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-black text-sm text-emerald-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Amount being paid right now</span>
              </div>

              {/* 4. Payment Mode */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Mode *
                </label>
                <select
                  name="Payment_Mode"
                  value={formData.Payment_Mode}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-xs text-slate-800 shadow-2xs cursor-pointer"
                >
                  <option value="Cash / Desk">Cash / Desk</option>
                  <option value="UPI / QR Scan">UPI / QR Scan (PhonePe / GPay / Paytm)</option>
                  <option value="Card Swipe POS">Debit / Credit Card Swipe</option>
                  <option value="Bank NEFT / RTGS">Bank NEFT / RTGS Netbanking</option>
                  <option value="Bank DD / Cheque">Demand Draft / Cheque</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Collection transaction channel</span>
              </div>

            </div>

            {/* Bottom Row: Fee Collected By (replaces Status) -> Reference (Typeable text!) -> Remark -> Attending Officer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1 border-t border-emerald-100">
              
              {/* 5. Fee Collected By (Typeable, replaces Status dropdown) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fee Collected By *
                </label>
                <input
                  type="text"
                  list="collectedByList"
                  name="Fee_Collected_By"
                  value={formData.Fee_Collected_By}
                  onChange={handleInputChange}
                  placeholder="e.g. Cashier, Accounts, Admin"
                  className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  required
                />
                <datalist id="collectedByList">
                  <option value="Cashier" />
                  <option value="Accounts" />
                  <option value="Admin" />
                  <option value="Desk Counter" />
                  <option value="Counselor" />
                </datalist>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Type Cashier, Accounts, Admin etc.</span>
              </div>

              {/* 6. Reference (Typeable text input - No dropdown!) */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reference (Referred By)
                </label>
                <input
                  type="text"
                  name="Reference"
                  value={formData.Reference}
                  onChange={handleInputChange}
                  placeholder="e.g. Direct Walk-in, Rahul Sharma, Agent..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-xs text-slate-800 shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Type reference name or source</span>
              </div>

              {/* 7. Remark */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Remark
                </label>
                <input
                  type="text"
                  name="Remark"
                  value={formData.Remark}
                  onChange={handleInputChange}
                  placeholder="Special notes / scholarship remark"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:bg-white focus:outline-none font-medium text-xs shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Official admission notes</span>
              </div>

              {/* 8. Attending Officer */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Attending Officer
                </label>
                <input
                  type="text"
                  name="operatorName"
                  value={formData.operatorName}
                  onChange={handleInputChange}
                  className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl focus:outline-none font-semibold text-slate-700 text-xs shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Logged-in desk authority</span>
              </div>

            </div>

            {/* Live Fee Calculation & Accounting Strip */}
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Total Course Fee:</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  ₹{Number(formData.Student_fee || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">
                  {formData.Fee_Type || 'Admission Fee'} Paid:
                </span>
                <span className="font-extrabold text-emerald-700 text-sm">
                  ₹{Number(formData.Initial_Payment || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  via {formData.Payment_Mode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Remaining Balance:</span>
                <span className="font-extrabold text-rose-700 text-sm">
                  ₹{Math.max(0, (Number(formData.Student_fee) || 0) - (Number(formData.Initial_Payment) || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                Collected By: <strong>{formData.Fee_Collected_By || 'Cashier'}</strong>
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
