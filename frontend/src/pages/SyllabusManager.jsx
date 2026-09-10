import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Landmark, 
  GraduationCap, 
  BookOpen, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  Plus,
  Edit3,
  X,
  Search,
  ChevronRight,
  ExternalLink,
  CreditCard,
  MapPin,
  Globe,
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';

// Default initial universities
const INITIAL_UNIVERSITIES = [
  {
    id: 'univ-mpu',
    name: 'Madhyanchal Professional University Bhopal',
    shortName: 'MPU Bhopal',
    code: 'MPU01',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    approvedBy: 'UGC, AICTE Recognized Private University',
    website: 'https://mpu.ac.in',
    establishedYear: 2018,
    status: 'Active',
    description: 'Premier private university offering multidisciplinary engineering, management, education and pharmacy programs.'
  },
  {
    id: 'univ-mcbu',
    name: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    shortName: 'MCBU Chhatarpur',
    code: 'MCBU01',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    approvedBy: 'State University / UGC Approved (2f & 12B)',
    website: 'https://mcbu.ac.in',
    establishedYear: 2015,
    status: 'Active',
    description: 'State university in Chhatarpur district overseeing government and affiliated higher education colleges.'
  }
];

// Default 18 colleges from official portal screenshot
const INITIAL_COLLEGES = [
  {
    id: 'col-bed121',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED121',
    name: 'BED121 - JEEVAN JYOTI SHIKSHA MAHAVIDYALAYA (RUN BY- JEEVAN JYOTI SHIKSHA PRASAR AND JAN KALYAN SAMITI)',
    shortName: 'Jeevan Jyoti Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed2097',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED2097',
    name: 'BED2097 - Sita Ram College Of Education Run By Girdhar gopal Shiksha Prashar Evam Jankalyan Samiti',
    shortName: 'Sita Ram College Of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed2140',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED2140',
    name: 'BED2140 - J J COLLEGE OF EDUCATION RUN BY R D EDUCATION SOCIETY',
    shortName: 'J J College of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed2266',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED2266',
    name: 'BED2266 - R.D College',
    shortName: 'R.D College',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed373',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED373',
    name: 'BED373 - Shri Krishna College Of Education',
    shortName: 'Shri Krishna College Of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed455',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED455',
    name: 'BED455 - Swami Vivekanand Mahavidyalaya',
    shortName: 'Swami Vivekanand Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-bed914',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BED914',
    name: 'BED914 - Shri Krishna Shiksha Mahavidyalaya',
    shortName: 'Shri Krishna Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-beled005',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BELED005',
    name: 'BELED005 - MAHARAJA CHHATRASAL SHIKSHA MAHAVIDYALAYA',
    shortName: 'Maharaja Chhatrasal Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-beled006',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'BELED006',
    name: 'BELED006 - MAA SHARDA EDUCATIONAL INSTITUTE CHHATARPUR SAMITI KHASRA',
    shortName: 'Maa Sharda Educational Institute',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-n462',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'N462',
    name: 'Khajuraho Institute of Pharmaceutical Sciences Kadari District Chhatarpur(N462)',
    shortName: 'Khajuraho Institute of Pharmaceutical Sciences',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-msm1079',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'MSM-1079',
    name: 'Ma Sharda Mahavidyalay, Plot No. 1079 Street No 75 Gatheowara, Po. Gatheowara',
    shortName: 'Ma Sharda Mahavidyalay Gatheowara',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-msm-lakshya',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'MSM-LAKSHYA',
    name: 'Maa Sharda Mahavidhyalaya Run By Lakshya Educational and Social Village Bajrang Nagar, Gatheowara',
    shortName: 'Maa Sharda Mahavidhyalaya Bajrang Nagar',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mcsm',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'MCSM',
    name: 'MAHARAJA CHHATRASAL SHIKSHA MAHAVIDYALAYA',
    shortName: 'Maharaja Chhatrasal Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ramdev',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'RMV1886',
    name: 'RAMDEV MAHAVIDYALAYA, PLOT NO.: 1886',
    shortName: 'Ramdev Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-svn',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'SVN01',
    name: 'S.V.N. COLLEGE, AFTER MARIA MATA SCHOOL, CHOUBEY COLONY',
    shortName: 'S.V.N. College Choubey Colony',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-sitaram-khop',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'SRC-KHOP',
    name: 'Sita Ram College Of Education Run By Girdhar gopal Shiksha Prashar Evam Jankalyan Samiti, Plot No. 90/3, Mahoba Road, Village Khop, Chhatarpur, P.O.+Th.+ Dist. Chhatarpur 471001, M.P.',
    shortName: 'Sita Ram College Of Education (Village Khop)',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-shrikrishna-orchha',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'SKCE-ORCHHA',
    name: 'Shri Krishna College Of Education near Orchha Road, Thana, Jhansi Road, Chhatarpur-471001 (M.P.)',
    shortName: 'Shri Krishna College (Orchha Road)',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-crystal-harpalpur',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    code: 'CSPS-HARPALPUR',
    name: 'Crystal Shiksha Prasar Samiti, Shri Krishna College, Behind. Old Govt. Degree College, Nowgong Road, Harpalpur, Chhatarpur, M.P.',
    shortName: 'Shri Krishna College Harpalpur',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  }
];

// Default initial courses with all B.Tech branches from screenshot
const INITIAL_COURSES = [
  { id: 'btech-aiml', name: 'B.Tech- Artificial Intelligence & Machine Learning (A)', code: 'BTECH-AIML', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'Advanced program focusing on AI algorithms, Neural Networks, Machine Learning and Python.' },
  { id: 'btech-cse-a', name: 'B.Tech- Computer Science & Engineering (A)', code: 'BTECH-CSE-A', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'Core Computer Science engineering including Data Structures, Algorithms, Systems and Cloud.' },
  { id: 'btech-cse-b', name: 'B.Tech- Computer Science & Engineering (B)', code: 'BTECH-CSE-B', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'Core Computer Science Section B with Software Engineering, Web & Mobile Development.' },
  { id: 'btech-ds', name: 'B.Tech- Data Science (A)', code: 'BTECH-DS', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'Big Data analytics, Statistics, R, Python, and Predictive Modeling.' },
  { id: 'btech-eee', name: 'B.Tech- Electrical and Electronics Engineering', code: 'BTECH-EEE', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'Power systems, Microprocessors, Control engineering and Circuit design.' },
  { id: 'btech-ee', name: 'B.Tech- Electrical Engineering', code: 'BTECH-EE', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'Electrical machinery, Power grids, High voltage engineering and Renewable energy.' },
  { id: 'btech-ece', name: 'B.Tech- Electronics & Communication Engineering (A)', code: 'BTECH-ECE', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'VLSI design, Signal Processing, Wireless Communications and Embedded systems.' },
  { id: 'btech-agri', name: 'B.Tech- Agricultural Engineering', code: 'BTECH-AGRI', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM/PCB (Min 50%)', description: 'Farm machinery, Soil & Water conservation, Food processing and Irrigation engineering.' },
  { id: 'btech-civil', name: 'B.Tech- Civil Engineering', code: 'BTECH-CIVIL', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'Structural engineering, Geotechnical, Transportation and Environmental infrastructure.' },
  { id: 'btech-me-a', name: 'B.Tech- Mechanical Engineering (A)', code: 'BTECH-ME-A', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'Thermodynamics, Fluid mechanics, Manufacturing and CAD/CAM systems.' },
  { id: 'btech-me-b', name: 'B.Tech- Mechanical Engineering (B)', code: 'BTECH-ME-B', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'Automobile engineering, Robotics, Automation and Industrial management.' },
  { id: 'btech-mining', name: 'B.Tech- Mining Engineering', code: 'BTECH-MINING', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 260000, feePerSemester: 32500, eligibility: '10+2 with PCM (Min 50%)', description: 'Surface & Underground mining, Rock mechanics, Mineral processing and Mine safety.' },
  { id: 'bed', name: 'B.Ed (Bachelor of Education)', code: 'BED', department: 'Faculty of Education & Teaching', durationYears: 2, totalSemesters: 4, totalFee: 70000, feePerSemester: 17500, eligibility: 'Graduation in any discipline (Min 50%)', description: 'NCTE recognized professional teaching degree for secondary & higher secondary educators.' },
  { id: 'deled', name: 'D.El.Ed (Diploma in Elementary Education)', code: 'DELED', department: 'Faculty of Education & Teaching', durationYears: 2, totalSemesters: 4, totalFee: 50000, feePerSemester: 12500, eligibility: '10+2 in any stream (Min 50%)', description: 'NCTE approved primary school teaching diploma program.' },
  { id: 'beled', name: 'B.El.Ed (Bachelor of Elementary Education)', code: 'BELED', department: 'Faculty of Education & Teaching', durationYears: 4, totalSemesters: 8, totalFee: 120000, feePerSemester: 15000, eligibility: '10+2 in any stream (Min 50%)', description: 'Integrated 4-year professional elementary teacher training degree program.' },
  { id: 'bpharma', name: 'B.Pharma (Bachelor of Pharmacy)', code: 'BPHARMA', department: 'School of Pharmaceutical Sciences', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCB/PCM (Min 50%)', description: 'PCI approved pharmacy program covering Pharmacology, Pharmaceutics and Medicinal Chemistry.' },
  { id: 'dpharma', name: 'D.Pharma (Diploma in Pharmacy)', code: 'DPHARMA', department: 'School of Pharmaceutical Sciences', durationYears: 2, totalSemesters: 4, totalFee: 140000, feePerSemester: 35000, eligibility: '10+2 with PCB/PCM (Min 50%)', description: 'PCI approved 2-year diploma in pharmacy practice and medical dispensing.' }
];

export default function SyllabusManager({ courses: initialPropCourses, onRefreshCourses }) {
  // Navigation Sub-tab:
  // 'universities' | 'colleges' | 'courses' | 'syllabus'
  const [activeSubTab, setActiveSubTab] = useState('universities');

  // Master Data States
  const [universities, setUniversities] = useState(INITIAL_UNIVERSITIES);
  const [colleges, setColleges] = useState(INITIAL_COLLEGES);
  const [coursesList, setCoursesList] = useState(
    initialPropCourses && initialPropCourses.length > 0 ? initialPropCourses : INITIAL_COURSES
  );

  // Sync courses if prop updates
  useEffect(() => {
    if (initialPropCourses && initialPropCourses.length > 0) {
      setCoursesList(initialPropCourses);
    }
  }, [initialPropCourses]);

  // Fetch live universities and colleges from API
  const fetchUniversities = async () => {
    try {
      const res = await fetch('/api/universities');
      const data = await res.json();
      if (data.success && data.universities && data.universities.length > 0) {
        setUniversities(data.universities);
      }
    } catch (err) {
      console.log('Using initial universities data');
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/colleges');
      const data = await res.json();
      if (data.success && data.colleges && data.colleges.length > 0) {
        setColleges(data.colleges);
      }
    } catch (err) {
      console.log('Using initial colleges data');
    }
  };

  useEffect(() => {
    fetchUniversities();
    fetchColleges();
  }, []);

  // Filter States
  const [selectedUnivFilter, setSelectedUnivFilter] = useState('all');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');

  // Notification Messages
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // ----------------------------------------------------
  // ADD / EDIT UNIVERSITY MODAL STATE
  // ----------------------------------------------------
  const [showUnivModal, setShowUnivModal] = useState(false);
  const [editingUniv, setEditingUniv] = useState(null);
  const [savingUniv, setSavingUniv] = useState(false);
  const [univForm, setUnivForm] = useState({
    name: '',
    shortName: '',
    code: '',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    approvedBy: 'UGC, AICTE Recognized',
    website: '',
    establishedYear: 2018,
    description: ''
  });

  const handleOpenAddUniv = () => {
    setEditingUniv(null);
    setUnivForm({
      name: '',
      shortName: '',
      code: '',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      approvedBy: 'UGC, AICTE Recognized',
      website: '',
      establishedYear: 2018,
      description: 'Private University recognized for multidisciplinary undergraduate & postgraduate degrees.'
    });
    setShowUnivModal(true);
    setErrorMsg(null);
  };

  const handleOpenEditUniv = (u) => {
    setEditingUniv(u);
    setUnivForm({
      name: u.name || '',
      shortName: u.shortName || '',
      code: u.code || '',
      city: u.city || 'Bhopal',
      state: u.state || 'Madhya Pradesh',
      approvedBy: u.approvedBy || 'UGC Approved',
      website: u.website || '',
      establishedYear: u.establishedYear || 2018,
      description: u.description || ''
    });
    setShowUnivModal(true);
    setErrorMsg(null);
  };

  const handleSaveUniv = async (e) => {
    e.preventDefault();
    if (!univForm.name.trim()) {
      setErrorMsg('University name is required.');
      return;
    }

    setSavingUniv(true);
    setErrorMsg(null);

    try {
      const url = editingUniv ? `/api/universities/${editingUniv.id}` : '/api/universities';
      const method = editingUniv ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(univForm)
      });
      const data = await res.json();

      if (data.success && data.university) {
        if (editingUniv) {
          setUniversities(prev => prev.map(u => u.id === editingUniv.id ? data.university : u));
        } else {
          setUniversities(prev => [data.university, ...prev]);
        }
      } else {
        // Local fallback update
        if (editingUniv) {
          setUniversities(prev => prev.map(u => u.id === editingUniv.id ? { ...u, ...univForm } : u));
        } else {
          const newUniv = {
            id: `univ-${Date.now()}`,
            ...univForm,
            status: 'Active'
          };
          setUniversities(prev => [newUniv, ...prev]);
        }
      }

      setShowUnivModal(false);
      setSuccessMsg(editingUniv ? `University "${univForm.name}" updated!` : `University "${univForm.name}" added successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchUniversities();
    } catch (err) {
      // Fallback
      if (editingUniv) {
        setUniversities(prev => prev.map(u => u.id === editingUniv.id ? { ...u, ...univForm } : u));
      } else {
        const newUniv = {
          id: `univ-${Date.now()}`,
          ...univForm,
          status: 'Active'
        };
        setUniversities(prev => [newUniv, ...prev]);
      }
      setShowUnivModal(false);
      setSuccessMsg(`University saved successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSavingUniv(false);
    }
  };

  const handleDeleteUniv = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove university "${name}"?`)) return;
    try {
      await fetch(`/api/universities/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setUniversities(prev => prev.filter(u => u.id !== id));
    setSuccessMsg(`University "${name}" removed.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ----------------------------------------------------
  // ADD / EDIT COLLEGE MODAL STATE
  // ----------------------------------------------------
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [savingCollege, setSavingCollege] = useState(false);
  const [collegeForm, setCollegeForm] = useState({
    name: '',
    shortName: '',
    code: '',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    address: ''
  });

  const handleOpenAddCollege = (defaultUnivId) => {
    const targetUniv = universities.find(u => u.id === defaultUnivId) || universities[0];
    setCollegeForm({
      name: '',
      shortName: '',
      code: '',
      universityId: targetUniv ? targetUniv.id : 'univ-mpu',
      universityName: targetUniv ? targetUniv.name : 'Madhyanchal Professional University Bhopal',
      district: 'Chhatarpur',
      state: 'Madhya Pradesh',
      address: ''
    });
    setShowCollegeModal(true);
    setErrorMsg(null);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    if (!collegeForm.name.trim()) {
      setErrorMsg('College name is required.');
      return;
    }

    setSavingCollege(true);
    try {
      const res = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collegeForm)
      });
      const data = await res.json();
      if (data.success && data.college) {
        setColleges(prev => [data.college, ...prev]);
      } else {
        const newCol = {
          id: `col-${Date.now()}`,
          ...collegeForm,
          status: 'Active'
        };
        setColleges(prev => [newCol, ...prev]);
      }
      setShowCollegeModal(false);
      setSuccessMsg(`College "${collegeForm.shortName || collegeForm.name}" registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchColleges();
    } catch (err) {
      const newCol = {
        id: `col-${Date.now()}`,
        ...collegeForm,
        status: 'Active'
      };
      setColleges(prev => [newCol, ...prev]);
      setShowCollegeModal(false);
      setSuccessMsg(`College registered successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSavingCollege(false);
    }
  };

  const handleDeleteCollege = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove college "${name}"?`)) return;
    try {
      await fetch(`/api/colleges/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setColleges(prev => prev.filter(c => c.id !== id));
    setSuccessMsg(`College removed.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ----------------------------------------------------
  // ADD / EDIT COURSE MODAL STATE
  // ----------------------------------------------------
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    department: 'School of Engineering & Technology',
    durationYears: 4,
    totalSemesters: 8,
    eligibility: '10+2 with PCM (Min 50%)',
    description: '',
    totalFee: 240000,
    feePerSemester: 30000
  });

  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      name: '',
      code: '',
      department: 'School of Engineering & Technology',
      durationYears: 4,
      totalSemesters: 8,
      eligibility: '10+2 with PCM (Min 50%)',
      description: 'Comprehensive degree curriculum covering modern engineering theories, practical labs and industry skills.',
      totalFee: 240000,
      feePerSemester: 30000
    });
    setShowCourseModal(true);
    setErrorMsg(null);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name || '',
      code: course.code || '',
      department: course.department || 'School of Engineering & Technology',
      durationYears: course.durationYears || 4,
      totalSemesters: course.totalSemesters || 8,
      eligibility: course.eligibility || '',
      description: course.description || '',
      totalFee: course.totalFee !== undefined ? course.totalFee : 0,
      feePerSemester: course.feePerSemester !== undefined ? course.feePerSemester : 0
    });
    setShowCourseModal(true);
    setErrorMsg(null);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.code) {
      setErrorMsg('Course name and code are required.');
      return;
    }

    setSavingCourse(true);
    setErrorMsg(null);

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const payload = {
        ...courseForm,
        durationYears: Number(courseForm.durationYears) || 1,
        totalSemesters: Number(courseForm.totalSemesters) || 2,
        totalFee: Number(courseForm.totalFee) || 0,
        feePerSemester: Number(courseForm.feePerSemester) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.course) {
        if (editingCourse) {
          setCoursesList(prev => prev.map(c => c.id === editingCourse.id ? data.course : c));
        } else {
          setCoursesList(prev => [data.course, ...prev]);
        }
      } else {
        if (editingCourse) {
          setCoursesList(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...payload } : c));
        } else {
          const newC = { id: `c-${Date.now()}`, ...payload };
          setCoursesList(prev => [newC, ...prev]);
        }
      }

      setShowCourseModal(false);
      setSuccessMsg(editingCourse 
        ? `Course "${courseForm.name}" updated successfully!` 
        : `New Course "${courseForm.name}" added successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);

      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      const payload = { ...courseForm };
      if (editingCourse) {
        setCoursesList(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...payload } : c));
      } else {
        const newC = { id: `c-${Date.now()}`, ...payload };
        setCoursesList(prev => [newC, ...prev]);
      }
      setShowCourseModal(false);
      setSuccessMsg(`Course saved successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setCoursesList(prev => prev.filter(c => c.id !== id));
    setSuccessMsg(`Course "${name}" deleted.`);
    setTimeout(() => setSuccessMsg(null), 4000);
    if (onRefreshCourses) onRefreshCourses();
  };

  // ----------------------------------------------------
  // SYLLABUS UPLOAD STATE & HANDLERS
  // ----------------------------------------------------
  const [selectedCourseId, setSelectedCourseId] = useState(coursesList[0]?.id || 'btech-aiml');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  const selectedCourse = coursesList.find(c => c.id === selectedCourseId) || coursesList[0] || null;
  const currentSyllabusFile = selectedCourse?.syllabusFiles?.[selectedSemester] || null;
  const totalSemesters = selectedCourse?.totalSemesters || 8;
  const semesterOptions = Array.from({ length: totalSemesters }, (_, i) => String(i + 1));

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload || !selectedCourse) {
      setErrorMsg('Please select a course, semester, and a syllabus document file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('syllabusFile', fileToUpload);

      const res = await fetch(`/api/courses/${selectedCourse.id}/syllabus-file/${selectedSemester}`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload syllabus file.');
      }

      setSuccessMsg(`Syllabus for ${selectedCourse.name} (Semester ${selectedSemester}) uploaded successfully!`);
      setFileToUpload(null);
      const inputEl = document.getElementById('syllabus-file-input');
      if (inputEl) inputEl.value = '';

      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!window.confirm(`Are you sure you want to remove the syllabus file for Semester ${selectedSemester}?`)) return;

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/syllabus-file/${selectedSemester}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove syllabus file.');
      }

      setSuccessMsg(`Semester ${selectedSemester} syllabus removed.`);
      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Jump helper
  const handleJumpToSyllabus = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSemester('1');
    setActiveSubTab('syllabus');
  };

  // Filtered Colleges list
  const filteredColleges = colleges.filter(c => {
    const matchesUniv = selectedUnivFilter === 'all' || c.universityId === selectedUnivFilter;
    const matchesSearch = !searchTerm.trim() || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUniv && matchesSearch;
  });

  // Departments list for filter
  const departments = ['all', ...new Set(coursesList.map(c => c.department).filter(Boolean))];

  // Filtered Courses list
  const filteredCourses = coursesList.filter(c => {
    const matchesSearch = !searchTerm.trim() || 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'all' || c.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-900">
      
      {/* ========================================================================= */}
      {/* 1. ACADEMIC HEADER BANNER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Affiliation &amp; Academic Curricula Master Hub
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Direct Affiliation Hub
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Universities, Colleges &amp; Programs Master Hub
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                यूनिवर्सिटीज, उनके संबद्ध कॉलेज, उनके द्वारा संचालित कोर्सेज/ब्रांचेज और सेमेस्टर सिलेबस का केंद्रीय नियंत्रण केंद्र।
              </p>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Universities</span>
              <span className="text-xl font-black text-white">{universities.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Colleges</span>
              <span className="text-xl font-black text-white">{colleges.length}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center min-w-[100px]">
              <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Programs</span>
              <span className="text-xl font-black text-white">{coursesList.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODERN TOP SUB-NAVBAR & QUICK ACTION TOOLBAR (Requested by User) */}
      {/* ========================================================================= */}
      <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Navigation Tabs Strip */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {/* Tab 1: Universities */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('universities');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeSubTab === 'universities'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeSubTab === 'universities' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>1. Universities (यूनिवर्सिटी)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'universities' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {universities.length}
            </span>
          </button>

          {/* Tab 2: Colleges */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('colleges');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeSubTab === 'colleges'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Landmark className={`w-4 h-4 ${activeSubTab === 'colleges' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>2. Affiliated Colleges (कॉलेज)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'colleges' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {colleges.length}
            </span>
          </button>

          {/* Tab 3: Courses & Branches */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('courses');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeSubTab === 'courses'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${activeSubTab === 'courses' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>3. Courses &amp; Branches (कोर्स/ब्रांच)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'courses' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {coursesList.length}
            </span>
          </button>

          {/* Tab 4: Syllabus Upload */}
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('syllabus');
              setErrorMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
              activeSubTab === 'syllabus'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400/40'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Upload className={`w-4 h-4 ${activeSubTab === 'syllabus' ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>4. Syllabus Manager (सिलेबस)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'syllabus' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              PDF / Excel
            </span>
          </button>
        </div>

        {/* Action Buttons: Add University / College / Course */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleOpenAddUniv}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Add a new University to the portal"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add University (नई यूनिवर्सिटी)</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddCollege(selectedUnivFilter !== 'all' ? selectedUnivFilter : 'univ-mpu')}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Register a new Affiliated College"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add College</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddCourse}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Create a new degree program or branch"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Course</span>
          </button>
        </div>

      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center justify-between gap-3 text-xs font-bold animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex items-center gap-3 text-xs font-bold animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: UNIVERSITIES DIRECTORY (यूनिवर्सिटीज) */}
      {/* ========================================================================= */}
      {activeSubTab === 'universities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Affiliated Universities Directory ({universities.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                वे सभी यूनिवर्सिटीज जिनका प्रतिनिधित्व PKC Education Institute करता है। आप नई यूनिवर्सिटीज भी जोड़ सकते हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUniv}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New University (नई यूनिवर्सिटी जोड़ें)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities.map((univ) => {
              const univColleges = colleges.filter(
                c => c.universityId === univ.id || (c.universityName || '').toLowerCase() === univ.name.toLowerCase()
              );

              return (
                <div 
                  key={univ.id} 
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0 shadow-xs">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                              {univ.code || 'UNIV'}
                            </span>
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {univ.status || 'Active'}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-1">
                            {univ.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Location</span>
                        <strong className="text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{univ.city}, {univ.state}</span>
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Affiliated Colleges</span>
                        <strong className="text-indigo-900 font-extrabold">
                          {univColleges.length} Colleges
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-xl text-indigo-950">
                      <span className="font-bold text-indigo-900">Approvals: </span>
                      <span className="text-indigo-800">{univ.approvedBy}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {univ.description || 'Recognized higher education university offering degree and technical programs.'}
                    </p>

                    {univ.website && (
                      <a
                        href={univ.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{univ.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUnivFilter(univ.id);
                        setActiveSubTab('colleges');
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      <span>View {univColleges.length} Colleges</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditUniv(univ)}
                        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit University Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUniv(univ.id, univ.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Remove University"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AFFILIATED COLLEGES (कॉलेज डायरेक्टरी - 18 Colleges from Screenshot) */}
      {/* ========================================================================= */}
      {activeSubTab === 'colleges' && (
        <div className="space-y-6">
          
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-indigo-600" />
                <span>Affiliated Colleges Directory ({filteredColleges.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                यूनिवर्सिटी के अंतर्गत आने वाले सभी संबद्ध कॉलेज। (स्क्रीनशॉट के अनुसार सभी 18 कॉलेज एक्टिव हैं)
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleOpenAddCollege(selectedUnivFilter !== 'all' ? selectedUnivFilter : 'univ-mpu')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New College (नया कॉलेज जोड़ें)</span>
            </button>
          </div>

          {/* Search & University Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search college name, code (e.g. BED121, N462)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter University:</span>
              <select
                value={selectedUnivFilter}
                onChange={(e) => setSelectedUnivFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="all">All Universities ({colleges.length} Colleges)</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.shortName || u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Colleges Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">College Name &amp; Trust / Samiti</th>
                    <th className="p-3.5">Affiliated University</th>
                    <th className="p-3.5">District / State</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredColleges.map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                          {col.code}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-md">
                        <span className="font-bold text-slate-900 block">{col.name}</span>
                        {col.shortName && col.shortName !== col.name && (
                          <span className="text-[11px] text-slate-500 block mt-0.5">{col.shortName}</span>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {col.universityName}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {col.district}, {col.state}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Active Affiliation</span>
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveSubTab('courses')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                            title="View courses and branches"
                          >
                            Programs &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCollege(col.id, col.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete college record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COURSES & BRANCHES (With all B.Tech branches from screenshot) */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>Programs &amp; Engineering Branches ({filteredCourses.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Madhyanchal Professional University व संबद्ध कॉलेजों द्वारा संचालित इंजीनियरिंग, एजुकेशन एवं अन्य ब्रांचेज।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCourse}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Program / Branch (नया कोर्स जोड़ें)</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search branch name, code (e.g. AI&ML, Mining, CSE)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDeptFilter === dept
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept.replace('School of ', '').replace('Faculty of ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map((c) => {
              const uploadedCount = c.syllabusFiles ? Object.keys(c.syllabusFiles).length : 0;
              const totalSem = c.totalSemesters || 8;

              return (
                <div 
                  key={c.id} 
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {c.code}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {c.department}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900 mt-1">
                          {c.name}
                        </h3>
                      </div>

                      {/* Syllabus Status Pill */}
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                        uploadedCount > 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {uploadedCount > 0 ? `${uploadedCount}/${totalSem} Syllabus Files` : 'No Syllabus'}
                      </span>
                    </div>

                    {/* Course Metrics */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Duration</span>
                        <strong className="text-slate-800">
                          {c.durationYears >= 1 ? `${c.durationYears} Year(s)` : `${c.durationYears * 12} Months`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Total Semesters</span>
                        <strong className="text-slate-800">{totalSem} Semester(s)</strong>
                      </div>
                    </div>

                    {/* INTERNAL CONSULTANT FEE BLOCK */}
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                            <span>कंसल्टेंसी फीस (Internal Record):</span>
                          </span>
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            🔒 छात्रों से छुपी हुई
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-slate-600">
                            Total Fee: <strong className="text-indigo-950 font-black text-sm">₹{Number(c.totalFee || 0).toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600">
                            Per Sem: <strong className="text-emerald-700 font-bold">₹{Number(c.feePerSemester || 0).toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                      >
                        ✏️ फीस एडिट करें
                      </button>
                    </div>

                    {/* Eligibility */}
                    <div className="text-xs bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl text-amber-950">
                      <span className="font-bold text-amber-900">Eligibility: </span>
                      <span className="text-amber-800">{c.eligibility}</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleJumpToSyllabus(c.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl border border-indigo-100 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Syllabus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                        title="Edit Course Information and Fees"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id, c.name)}
                        className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYLLABUS UPLOAD & MANAGE (सेमेस्टर-वार आधिकारिक सिलेबस फाइलें) */}
      {/* ========================================================================= */}
      {activeSubTab === 'syllabus' && (
        <div className="space-y-8">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <span>Upload Official Semester Syllabus Document</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                कोर्स और सेमेस्टर चुनें, फिर उसका सिलेबस (PDF / Excel) अपलोड करें। यह तुरंत छात्र के लिए डाउनलोड हेतु उपलब्ध हो जाएगा।
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. SELECT DEGREE / DIPLOMA PROGRAM */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Select Program / Course *
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('courses')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      + View All Courses
                    </button>
                  </div>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedSemester('1');
                      setSuccessMsg(null);
                      setErrorMsg(null);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    {coursesList.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.name} ({course.code}) — {course.durationYears >= 1 ? `${course.durationYears} Yr` : `${course.durationYears * 12} Mo`}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Department: {selectedCourse?.department} • Total Semesters: {totalSemesters}
                  </span>
                </div>

                {/* 2. SELECT SEMESTER */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Select Semester *
                  </label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSuccessMsg(null);
                      setErrorMsg(null);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem} (Sem {sem})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Uploading syllabus specifically for Semester {selectedSemester}
                  </span>
                </div>

              </div>

              {/* 3. UPLOAD FILE (PDF / EXCEL) */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Upload Syllabus File (PDF, Excel, Word, CSV) *
                </label>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-3xl p-6 bg-slate-50/60 transition-colors text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Choose a PDF or Excel / CSV document
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supported formats: .pdf, .xlsx, .xls, .docx, .doc, .csv (Max: 30MB)
                    </p>
                  </div>

                  <input
                    id="syllabus-file-input"
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                    onChange={(e) => setFileToUpload(e.target.files[0] || null)}
                    className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer cursor-pointer"
                  />

                  {fileToUpload && (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
                      <FileCheck2 className="w-4 h-4 text-indigo-600" />
                      <span>Selected: {fileToUpload.name} ({(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploading || !fileToUpload}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading Document...' : `Upload Semester ${selectedSemester} Syllabus`}</span>
                  </button>
                </div>

              </div>

            </form>

            {/* Current Uploaded Syllabus Status for Selected Semester */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Live Syllabus Document for {selectedCourse?.name} — Semester {selectedSemester}:
                </h3>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  Status on Student Portal
                </span>
              </div>

              {currentSyllabusFile ? (
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      {currentSyllabusFile.fileName?.endsWith('.xls') || currentSyllabusFile.fileName?.endsWith('.xlsx') || currentSyllabusFile.fileName?.endsWith('.csv') ? (
                        <FileSpreadsheet className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{currentSyllabusFile.fileName}</span>
                        <span className="text-[10px] font-mono bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded font-bold">
                          ACTIVE ON PORTAL
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Uploaded on {new Date(currentSyllabusFile.uploadedAt).toLocaleString()} • Size: {currentSyllabusFile.fileSize ? `${(currentSyllabusFile.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={currentSyllabusFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download / View</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleDeleteFile}
                      disabled={uploading}
                      className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No syllabus file uploaded yet for Semester {selectedSemester}.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Upload above to make it instantly downloadable for students.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT UNIVERSITY (Requested by User) */}
      {/* ========================================================================= */}
      {showUnivModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowUnivModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900 border border-slate-200 animate-fadeIn my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {editingUniv ? 'Edit University Details' : 'Add New University (नई यूनिवर्सिटी जोड़ें)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enter the official university recognition details and code.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowUnivModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUniv} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">University Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Madhyanchal Professional University Bhopal"
                  value={univForm.name}
                  onChange={(e) => setUnivForm({ ...univForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Name / Acronym</label>
                  <input
                    type="text"
                    placeholder="e.g. MPU Bhopal"
                    value={univForm.shortName}
                    onChange={(e) => setUnivForm({ ...univForm, shortName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">University Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MPU01"
                    value={univForm.code}
                    onChange={(e) => setUnivForm({ ...univForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Bhopal"
                    value={univForm.city}
                    onChange={(e) => setUnivForm({ ...univForm, city: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={univForm.state}
                    onChange={(e) => setUnivForm({ ...univForm, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Approvals &amp; Accreditations</label>
                <input
                  type="text"
                  placeholder="e.g. UGC, AICTE Recognized Private University"
                  value={univForm.approvedBy}
                  onChange={(e) => setUnivForm({ ...univForm, approvedBy: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Website URL</label>
                <input
                  type="url"
                  placeholder="e.g. https://mpu.ac.in"
                  value={univForm.website}
                  onChange={(e) => setUnivForm({ ...univForm, website: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">About / Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief note on university programs..."
                  value={univForm.description}
                  onChange={(e) => setUnivForm({ ...univForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnivModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUniv}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingUniv ? 'Saving...' : editingUniv ? 'Update University' : 'Save University'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT AFFILIATED COLLEGE */}
      {/* ========================================================================= */}
      {showCollegeModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCollegeModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl text-slate-900 border border-slate-200 animate-fadeIn my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    Register New Affiliated College (संबद्ध कॉलेज जोड़ें)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Affiliate a college to a university with its official code.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCollegeModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollege} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Affiliated University *</label>
                <select
                  value={collegeForm.universityId}
                  onChange={(e) => {
                    const u = universities.find(x => x.id === e.target.value);
                    setCollegeForm({
                      ...collegeForm,
                      universityId: e.target.value,
                      universityName: u ? u.name : ''
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">College Code (e.g. BED121, N462, MSM-1079) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BED121"
                  value={collegeForm.code}
                  onChange={(e) => setCollegeForm({ ...collegeForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Official College Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BED121 - JEEVAN JYOTI SHIKSHA MAHAVIDYALAYA"
                  value={collegeForm.name}
                  onChange={(e) => setCollegeForm({ ...collegeForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jeevan Jyoti Shiksha Mahavidyalaya"
                  value={collegeForm.shortName}
                  onChange={(e) => setCollegeForm({ ...collegeForm, shortName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Chhatarpur"
                    value={collegeForm.district}
                    onChange={(e) => setCollegeForm({ ...collegeForm, district: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhya Pradesh"
                    value={collegeForm.state}
                    onChange={(e) => setCollegeForm({ ...collegeForm, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollegeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCollege}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {savingCollege ? 'Saving...' : 'Register College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT COURSE & FEES */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCourseModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900 border border-slate-200 animate-fadeIn my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {editingCourse ? 'Edit Academic Program & Internal Fees' : 'Create New Academic Program / Branch'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    कोर्स और ब्रांच का नाम, अवधि, और इंटरनल कंसल्टेंसी फीस निर्धारित करें।
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCourseModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Program / Branch Name * (e.g. B.Tech- Artificial Intelligence &amp; Machine Learning)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech- Artificial Intelligence & Machine Learning (A)"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BTECH-AIML"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Academic Department / Faculty *
                  </label>
                  <select
                    value={courseForm.department}
                    onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="School of Engineering & Technology">School of Engineering &amp; Technology</option>
                    <option value="Faculty of Education & Teaching">Faculty of Education &amp; Teaching</option>
                    <option value="School of Pharmaceutical Sciences">School of Pharmaceutical Sciences</option>
                    <option value="School of Computing & IT">School of Computing &amp; IT</option>
                    <option value="School of Commerce & Management">School of Commerce &amp; Management</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Duration (Years) *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="6"
                    step="0.5"
                    required
                    value={courseForm.durationYears}
                    onChange={(e) => {
                      const yrs = Number(e.target.value);
                      setCourseForm({
                        ...courseForm,
                        durationYears: yrs,
                        totalSemesters: Math.round(yrs * 2)
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Total Semesters *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={courseForm.totalSemesters}
                    onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* FEES SECTION */}
                <div className="sm:col-span-2 bg-gradient-to-r from-slate-50 to-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span>कंसल्टेंसी व पैकेज फीस (Private Admin Record):</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      🔒 छात्रों से छुपी रहेगी
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Total Course Package Fee (कुल फीस ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="e.g. 240000"
                          value={courseForm.totalFee}
                          onChange={(e) => {
                            const tot = Number(e.target.value);
                            const sem = courseForm.totalSemesters > 0 ? Math.round(tot / courseForm.totalSemesters) : 0;
                            setCourseForm({ ...courseForm, totalFee: tot, feePerSemester: sem });
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-black text-indigo-950 text-sm focus:outline-none focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Fee Per Semester (प्रति सेमेस्टर फीस ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          placeholder="e.g. 30000"
                          value={courseForm.feePerSemester}
                          onChange={(e) => setCourseForm({ ...courseForm, feePerSemester: Number(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-emerald-700 focus:outline-none focus:border-indigo-600"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Eligibility Criteria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10+2 with PCM (Min 50%)"
                    value={courseForm.eligibility}
                    onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Course Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Course Description &amp; Curriculum Summary *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter detailed description of the program and academic objectives..."
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed font-normal"
                  />
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCourse}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{savingCourse ? 'Saving...' : editingCourse ? 'Save Changes & Fees' : 'Create & Publish Program'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
