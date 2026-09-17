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
  FileSpreadsheet,
  FileCheck2,
  Sparkles,
  Plus,
  Edit3,
  X,
  Search,
  ChevronRight,
  ExternalLink,
  MapPin,
  Globe,
  Eye,
  ArrowLeft,
  Filter,
  Clock,
  Layers,
  FileDown
} from 'lucide-react';

// Default initial universities
const INITIAL_UNIVERSITIES = [
  {
    id: 'univ-1789571739471-463',
    name: 'Bhabha University, Bhopal (M.P)',
    code: 'BHABHA',
    shortName: 'Bhabha University',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'univ-1789571739470-197',
    name: 'Gyanveer University, Sagar (M.P)',
    code: 'GYANVEER',
    shortName: 'Gyanveer University',
    city: 'Sagar',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'univ-1789571739470-940',
    name: 'IES University, Bhopal (M.P)',
    code: 'IES',
    shortName: 'IES University',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    website: 'https://iesuniversity.ac.in',
    establishedYear: 2019,
    status: 'Active',
    description: 'UGC & AICTE recognized university offering engineering, pharmacy, and management education.'
  },
  {
    id: 'univ-mcbu',
    name: 'MCBU - Maharaja Chhatrasal Bundelkhand University Chhatarpur (M.P.)',
    shortName: 'MCBU',
    code: 'MCBU',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    website: 'https://mcbu.ac.in',
    establishedYear: 2015,
    status: 'Active',
    description: 'State university in Chhatarpur district overseeing government and affiliated higher education colleges.'
  },
  {
    id: 'univ-1789571739470-506',
    name: 'MCRPV - Makhanlal Chaturvedi Rashtriya Patrakarita Evam Sanchar Vishwavidyalaya',
    shortName: 'MCRPV Bhopal',
    code: 'MCRPV',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    website: 'https://mcu.ac.in',
    establishedYear: 1990,
    status: 'Active',
    description: 'National university for journalism, media, computer science, and mass communications.'
  },
  {
    id: 'univ-1789571739471-295',
    name: 'MMYVV - Maharishi Mahesh Yogi Vedic Vishwavidyalaya, Jabalpur (M.P)',
    code: 'MMYVV',
    shortName: 'MMYVV Jabalpur',
    city: 'Jabalpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'univ-mpu',
    name: 'MPU - Madhyanchal Professional University, Bhopal (M.P)',
    code: 'MPU01',
    shortName: 'MPU Bhopal',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    website: 'https://mpu.ac.in',
    establishedYear: 2018,
    status: 'Active',
    description: 'Premier private university offering multidisciplinary engineering, management, education and pharmacy programs.'
  },
  {
    id: 'univ-1789571739471-663',
    name: 'SKU - Shri Krishna University Chhatarpur (M.P.)',
    code: 'SKU',
    shortName: 'Shri Krishna University',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'univ-1789571739470-15',
    name: 'Subharti University Meerut',
    code: 'SUBHARTI',
    shortName: 'Subharti University',
    city: 'Meerut',
    state: 'Uttar Pradesh',
    website: 'https://subharti.org',
    establishedYear: 2008,
    status: 'Active',
    description: 'UGC & NAAC A Grade recognized university offering multidisciplinary programs.'
  },
  {
    id: 'univ-mgcgv',
    name: 'Mahatma Gandhi Chitrakoot Gramodaya Vishwavidyalaya',
    code: 'MGCGV',
    shortName: 'Gramodaya Vishwavidyalaya Chitrakoot',
    city: 'Chitrakoot',
    state: 'Madhya Pradesh',
    website: 'https://mgcgvchitrakoot.com',
    establishedYear: 1991,
    status: 'Active',
    description: 'First rural university in India established by Bharat Ratna Nanaji Deshmukh in Chitrakoot.'
  }
];

// Default colleges accurately affiliated
const INITIAL_COLLEGES = [
  // 19 Affiliated Colleges under Maharaja Chhatrasal Bundelkhand University (univ-mcbu)
  {
    id: 'col-ved121',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-121',
    name: 'VED-121 Jeevan Jyoti Shiksha Mahavidyalaya run by Jeevan Jyoti Shiksha Prasar and Jan Kalyan Samiti',
    shortName: 'VED-121 Jeevan Jyoti Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved2097',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-2097',
    name: 'VED-2097 Sita Ram College of Education run by Giridhar Gopal Shiksha Prasar evam Jan Kalyan Samiti',
    shortName: 'VED-2097 Sita Ram College of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved2140',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-2140',
    name: 'VED2140 - J J COLLEGE OF EDUCATION RUN BY R D EDUCATION SOCIETY',
    shortName: 'J J College of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved2266',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-2266',
    name: 'VED2266 - R.D College',
    shortName: 'R.D College',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved373',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-373',
    name: 'VED373 - Shri Krishna College Of Education',
    shortName: 'Shri Krishna College Of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved455',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-455',
    name: 'VED455 - Swami Vivekanand Mahavidyalaya',
    shortName: 'Swami Vivekanand Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ved914',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'VED-914',
    name: 'VED914 - Shri Krishna Shiksha Mavavidyalaya',
    shortName: 'Shri Krishna Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-beled005',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'BELED005',
    name: 'BELED005 - MAHARAJA CHHATRASAL SHIKSHA MAHAVIDYALAYA',
    shortName: 'Maharaja Chhatrasal Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-beled006',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'BELED006',
    name: 'BELED006 - MAA SHARDA EDUCATIONAL INSTITUTE CHHATARPUR SAMITI KHASRA',
    shortName: 'Maa Sharda Educational Institute',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-n462',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'N462',
    name: 'Khajuraho Institute of Pharmaceutical Sciences Kadari District Chhatarpur(N462)',
    shortName: 'Khajuraho Institute of Pharmaceutical Sciences',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-msm1079',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'MSM-1079',
    name: 'Ma Sharda Mahavidyalay, Plot No. 1079 Street No 75 Gatheowara, Po. Gatheowara,',
    shortName: 'Ma Sharda Mahavidyalay Gatheowara',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-msm-lakshya',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'MSM-LAKSHYA',
    name: 'Maa Sharda Mahavidhyalaya Run By Lakshya Educational and Social Village Bajrang Nagar, Gatheowara',
    shortName: 'Maa Sharda Mahavidhyalaya Lakshya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mcsm',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'MCSM',
    name: 'MAHARAJA CHHATRASAL SHIKSHA MAHAVIDYALAYA',
    shortName: 'Maharaja Chhatrasal Shiksha Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ramdev',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'RMV1886',
    name: 'RAMDEV MAHAVIDYALAYA, PLOT NO.: 1886',
    shortName: 'Ramdev Mahavidyalaya',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-svn',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'SVN01',
    name: 'S.V.N. COLLEGE, AFTER MARIA MATA SCHOOL, CHOUBEY COLONY',
    shortName: 'S.V.N. College Choubey Colony',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-sitaram-jankalyan',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'SRC-JANKALYAN',
    name: 'Sita Ram College Of Education Run By Girdhar gopal Shiksha Prashar Evam JankalyanSamiti',
    shortName: 'Sita Ram College Of Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-sitaram-khop',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'SRC-KHOP',
    name: 'Sita Ram College Of Education Run By Girdhar gopal Shiksha Prashar Evam Jankalyan Samiti, Plot No. 90/3, Mahoba Road, Village Khop, Chhatarpur, P.O.+Th.+ Dist. Chhatarpur 471001, M.P.',
    shortName: 'Sita Ram College Khop',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-shrikrishna-orchha',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'SKCE-ORCHHA',
    name: 'Shri Krishna College Of Education near Orchha Road, Thana, Jhansi Road, Chhatarpur-471001 (M.P.)',
    shortName: 'Shri Krishna College Orchha Road',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-crystal-harpalpur',
    universityId: 'univ-mcbu',
    universityName: 'Maharaja Chhatrasal Bundelkhand University, Chhatarpur (MCBU)',
    code: 'CSPS-HARPALPUR',
    name: 'CrysTal Shiksha Prasar Samiti, Shri Krishna College, Behind. Old Govt. Degree College, Nowgong Road, Harpalpur, Chhatarpur, M.P.',
    shortName: 'Crystal Shiksha Prasar Samiti Harpalpur',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  // 8 Partner Universities Autonomous / Campus Colleges
  {
    id: 'col-bhabha',
    universityId: 'univ-1789571739471-463',
    universityName: 'Bhabha University, Bhopal (M.P)',
    name: 'Bhabha University, Bhopal (M.P)',
    code: 'BHABHA',
    shortName: 'Bhabha University',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-gyanveer',
    universityId: 'univ-1789571739470-197',
    universityName: 'Gyanveer University, Sagar (M.P)',
    name: 'Gyanveer University, Sagar (M.P)',
    code: 'GYANVEER',
    shortName: 'Gyanveer University',
    district: 'Sagar',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-ies',
    universityId: 'univ-1789571739470-940',
    universityName: 'IES University, Bhopal (M.P)',
    name: 'IES University, Bhopal (M.P)',
    code: 'IES',
    shortName: 'IES University',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mmyvv',
    universityId: 'univ-1789571739471-295',
    universityName: 'MMYVV - Maharishi Mahesh Yogi Vedic Vishwavidyalaya, Jabalpur (M.P)',
    name: 'MMYVV - Maharishi Mahesh Yogi Vedic Vishwavidyalaya, Jabalpur (M.P)',
    code: 'MMYVV',
    shortName: 'MMYVV Jabalpur',
    district: 'Jabalpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mpu',
    universityId: 'univ-mpu',
    universityName: 'MPU - Madhyanchal Professional University, Bhopal (M.P)',
    name: 'MPU - Madhyanchal Professional University, Bhopal (M.P)',
    code: 'MPU',
    shortName: 'MPU Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-sku',
    universityId: 'univ-1789571739471-663',
    universityName: 'SKU - Shri Krishna University Chhatarpur (M.P.)',
    name: 'SKU - Shri Krishna University Chhatarpur (M.P.)',
    code: 'SKU',
    shortName: 'Shri Krishna University',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-subharti',
    universityId: 'univ-1789571739470-15',
    universityName: 'Subharti University Meerut',
    name: 'Subharti University Meerut',
    code: 'SUBHARTI',
    shortName: 'Subharti University',
    district: 'Meerut',
    state: 'Uttar Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mgcgv',
    universityId: 'univ-mgcgv',
    universityName: 'Mahatma Gandhi Chitrakoot Gramodaya Vishwavidyalaya',
    name: 'Mahatma Gandhi Chitrakoot Gramodaya Vishwavidyalaya',
    code: 'MGCGV',
    shortName: 'Gramodaya Vishwavidyalaya Chitrakoot',
    district: 'Satna / Chitrakoot',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  // 3 MCRPV Affiliated Colleges
  {
    id: 'col-mcrpv-8452',
    universityId: 'univ-1789571739470-506',
    universityName: 'MCRPV - Makhanlal Chaturvedi Rashtriya Patrakarita Evam Sanchar Vishwavidyalaya',
    code: '8452',
    name: '8452 Mahaveer Memorial Computer College, Rajnagar',
    shortName: 'Mahaveer Memorial Computer College, Rajnagar',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mcrpv-8446',
    universityId: 'univ-1789571739470-506',
    universityName: 'MCRPV - Makhanlal Chaturvedi Rashtriya Patrakarita Evam Sanchar Vishwavidyalaya',
    code: '8446',
    name: '8446 SGM Institute Of Computer Education',
    shortName: 'SGM Institute Of Computer Education',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-mcrpv-8611',
    universityId: 'univ-1789571739470-506',
    universityName: 'MCRPV - Makhanlal Chaturvedi Rashtriya Patrakarita Evam Sanchar Vishwavidyalaya',
    code: '8611',
    name: '8611 Chandla',
    shortName: '8611 Chandla',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  }
];

// Standard Academic Programs & Branches Catalog
const ACADEMIC_BRANCHES = [
  // B.Tech Branches (13)
  { degree: 'B.Tech', name: 'Artificial Intelligence & Machine Learning (A)', code: 'BTECH-AIML', semesters: 8 },
  { degree: 'B.Tech', name: 'Computer Science & Engineering (A)', code: 'BTECH-CSE-A', semesters: 8 },
  { degree: 'B.Tech', name: 'Computer Science & Engineering (B)', code: 'BTECH-CSE-B', semesters: 8 },
  { degree: 'B.Tech', name: 'Data Science (A)', code: 'BTECH-DS', semesters: 8 },
  { degree: 'B.Tech', name: 'Electrical and Electronics Engineering', code: 'BTECH-EEE', semesters: 8 },
  { degree: 'B.Tech', name: 'Electrical Engineering', code: 'BTECH-EE', semesters: 8 },
  { degree: 'B.Tech', name: 'Electronics & Communication Engineering (A)', code: 'BTECH-ECE-A', semesters: 8 },
  { degree: 'B.Tech', name: 'Agricultural Engineering', code: 'BTECH-AGRI', semesters: 8 },
  { degree: 'B.Tech', name: 'Civil Engineering', code: 'BTECH-CIVIL', semesters: 8 },
  { degree: 'B.Tech', name: 'Electronics and Communication Engineering', code: 'BTECH-EC', semesters: 8 },
  { degree: 'B.Tech', name: 'Mechanical Engineering (A)', code: 'BTECH-ME-A', semesters: 8 },
  { degree: 'B.Tech', name: 'Mechanical Engineering (B)', code: 'BTECH-ME-B', semesters: 8 },
  { degree: 'B.Tech', name: 'Mining Engineering', code: 'BTECH-MINING', semesters: 8 },

  // MBA Streams (8)
  { degree: 'MBA', name: 'Agri Business Management', code: 'MBA-AGRI', semesters: 4 },
  { degree: 'MBA', name: 'Banking Insurance', code: 'MBA-BANK', semesters: 4 },
  { degree: 'MBA', name: 'Entrepreneurship', code: 'MBA-ENTR', semesters: 4 },
  { degree: 'MBA', name: 'Hospital Administration', code: 'MBA-HOSP', semesters: 4 },
  { degree: 'MBA', name: 'IT Management', code: 'MBA-IT', semesters: 4 },
  { degree: 'MBA', name: 'NGO Management', code: 'MBA-NGO', semesters: 4 },
  { degree: 'MBA', name: 'Plain Business Administration', code: 'MBA-PLAIN', semesters: 4 },
  { degree: 'MBA', name: 'Retail Management', code: 'MBA-RETAIL', semesters: 4 },

  // Education & Other Programs
  { degree: 'B.Ed', name: 'Teacher Education & Pedagogy', code: 'BED-EDU', semesters: 4 },
  { degree: 'B.El.Ed', name: 'Elementary Education', code: 'BELED-01', semesters: 8 },
  { degree: 'BCA', name: 'Computer Applications & Software', code: 'BCA-CS', semesters: 6 },
  { degree: 'BBA', name: 'Business Administration', code: 'BBA-GEN', semesters: 6 }
];

export default function SyllabusManager() {
  // Main Navigation Tabs: Strictly 3 Sections
  // 1. 'universities'
  // 2. 'colleges'
  // 3. 'upload_syllabus'
  const [activeSubTab, setActiveSubTab] = useState('universities');

  // Universities State
  const [universities, setUniversities] = useState(INITIAL_UNIVERSITIES);
  const [loadingUnivs, setLoadingUnivs] = useState(false);
  const [univSearch, setUnivSearch] = useState('');
  const [showUnivModal, setShowUnivModal] = useState(false);
  const [editingUniv, setEditingUniv] = useState(null);
  const [univFormData, setUnivFormData] = useState({
    name: '',
    shortName: '',
    code: '',
    city: '',
    state: 'Madhya Pradesh',
    website: '',
    establishedYear: new Date().getFullYear(),
    description: ''
  });

  // Colleges State
  const [colleges, setColleges] = useState(INITIAL_COLLEGES);
  const [selectedUnivFilter, setSelectedUnivFilter] = useState('ALL');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState(null);
  const [collegeFormData, setCollegeFormData] = useState({
    name: '',
    shortName: '',
    code: '',
    universityId: 'univ-mpu',
    universityName: 'Madhyanchal Professional University Bhopal',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh'
  });

  // Syllabi Repository State
  const [syllabiList, setSyllabiList] = useState([]);
  const [syllabiFilterUniv, setSyllabiFilterUniv] = useState('ALL');
  const [syllabiFilterSem, setSyllabiFilterSem] = useState('ALL');
  const [syllabiSearch, setSyllabiSearch] = useState('');

  // Tab 3 Upload Form State (Cascading: University ➔ College ➔ Branch ➔ Semester ➔ File)
  const [uploadUnivId, setUploadUnivId] = useState('univ-mpu');
  const [uploadCollegeId, setUploadCollegeId] = useState('');
  const [uploadBranchCode, setUploadBranchCode] = useState('BTECH-AIML');
  const [uploadSemester, setUploadSemester] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // { success: bool, message: string }

  // Load Universities, Colleges and Syllabi on Mount
  useEffect(() => {
    fetchUniversities();
    fetchColleges();
    fetchSyllabi();
  }, []);

  const fetchUniversities = async () => {
    setLoadingUnivs(true);
    try {
      const res = await fetch('/api/universities');
      const data = await res.json();
      if (data.success && Array.isArray(data.universities) && data.universities.length > 0) {
        setUniversities(data.universities);
      }
    } catch (err) {
      console.warn('Could not fetch universities, using fallback:', err);
    } finally {
      setLoadingUnivs(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/colleges');
      const data = await res.json();
      if (data.success && Array.isArray(data.colleges) && data.colleges.length > 0) {
        setColleges(data.colleges);
      }
    } catch (err) {
      console.warn('Could not fetch colleges, using fallback:', err);
    }
  };

  const fetchSyllabi = async () => {
    try {
      const res = await fetch('/api/syllabi');
      const data = await res.json();
      if (data.success && Array.isArray(data.syllabi)) {
        setSyllabiList(data.syllabi);
      }
    } catch (err) {
      console.warn('Could not fetch syllabi:', err);
    }
  };

  // Sync default uploadCollegeId when uploadUnivId or colleges change
  useEffect(() => {
    const matchingColleges = colleges.filter(c => c.universityId === uploadUnivId);
    if (matchingColleges.length > 0) {
      // If current uploadCollegeId isn't in matching, select first
      if (!matchingColleges.some(c => c.id === uploadCollegeId)) {
        setUploadCollegeId(matchingColleges[0].id);
      }
    } else {
      setUploadCollegeId('');
    }
  }, [uploadUnivId, colleges]);

  // Derived Values for Uploader
  const currentUploadUniv = universities.find(u => u.id === uploadUnivId) || universities[0];
  const uploadAffiliatedColleges = colleges.filter(c => c.universityId === uploadUnivId);
  const currentUploadCollege = colleges.find(c => c.id === uploadCollegeId) || uploadAffiliatedColleges[0];
  const currentUploadBranch = ACADEMIC_BRANCHES.find(b => b.code === uploadBranchCode) || ACADEMIC_BRANCHES[0];

  // Maximum semesters for selected branch (e.g. 8 for B.Tech, 4 for MBA)
  const maxSemesters = currentUploadBranch?.semesters || 8;
  const semesterOptions = Array.from({ length: maxSemesters }, (_, i) => String(i + 1));

  // Check if a syllabus already exists for currently selected combination
  const currentExistingSyllabus = syllabiList.find(s => 
    s.universityId === uploadUnivId &&
    s.collegeId === uploadCollegeId &&
    (s.courseId === currentUploadBranch?.code || s.branch === currentUploadBranch?.name) &&
    String(s.semester) === String(uploadSemester)
  );

  // Dynamic College Count for Top Banner
  const displayedCollegesCount = selectedUnivFilter === 'ALL'
    ? colleges.length
    : colleges.filter(c => c.universityId === selectedUnivFilter).length;

  // Filtered Colleges in Tab 2
  const filteredColleges = colleges.filter(c => {
    const matchesUniv = selectedUnivFilter === 'ALL' || c.universityId === selectedUnivFilter;
    const matchesSearch = !collegeSearch || 
      (c.name || '').toLowerCase().includes(collegeSearch.toLowerCase()) ||
      (c.shortName || '').toLowerCase().includes(collegeSearch.toLowerCase()) ||
      (c.code || '').toLowerCase().includes(collegeSearch.toLowerCase()) ||
      (c.district || '').toLowerCase().includes(collegeSearch.toLowerCase());
    return matchesUniv && matchesSearch;
  });

  // Filtered Syllabi in Tab 3 Repository Table
  const filteredSyllabi = syllabiList.filter(s => {
    const matchesUniv = syllabiFilterUniv === 'ALL' || s.universityId === syllabiFilterUniv;
    const matchesSem = syllabiFilterSem === 'ALL' || String(s.semester) === String(syllabiFilterSem);
    const matchesSearch = !syllabiSearch ||
      (s.branch || '').toLowerCase().includes(syllabiSearch.toLowerCase()) ||
      (s.collegeName || '').toLowerCase().includes(syllabiSearch.toLowerCase()) ||
      (s.fileName || '').toLowerCase().includes(syllabiSearch.toLowerCase()) ||
      (s.universityName || '').toLowerCase().includes(syllabiSearch.toLowerCase());
    return matchesUniv && matchesSem && matchesSearch;
  });

  // Quick Action from Universities Tab: Navigate to Colleges Tab with filter
  const handleViewAffiliatedColleges = (univId) => {
    setSelectedUnivFilter(univId);
    setActiveSubTab('colleges');
  };

  // Quick Action from Universities / Colleges Tab: Navigate to Upload Tab with pre-selection
  const handleNavigateToUpload = (univId, collegeId = '') => {
    setUploadUnivId(univId);
    if (collegeId) {
      setUploadCollegeId(collegeId);
    }
    setActiveSubTab('upload_syllabus');
    setUploadStatus(null);
  };

  // Syllabus Upload Handler
  const handleUploadSyllabus = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus({ success: false, message: 'Please choose a PDF or Excel syllabus file to upload.' });
      return;
    }
    if (!uploadUnivId) {
      setUploadStatus({ success: false, message: 'Please select a University.' });
      return;
    }
    if (!uploadCollegeId) {
      setUploadStatus({ success: false, message: 'Please select an Affiliated College.' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('universityId', uploadUnivId);
      data.append('universityName', currentUploadUniv?.name || '');
      data.append('collegeId', uploadCollegeId);
      data.append('collegeName', currentUploadCollege?.shortName || currentUploadCollege?.name || '');
      data.append('courseId', currentUploadBranch?.code || '');
      data.append('courseName', `${currentUploadBranch?.degree} - ${currentUploadBranch?.name}`);
      data.append('branch', currentUploadBranch?.name || '');
      data.append('semester', uploadSemester);

      const res = await fetch('/api/syllabi/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to upload syllabus file.');
      }

      setUploadStatus({
        success: true,
        message: `✓ Syllabus for ${currentUploadBranch?.name} (Semester ${uploadSemester}) uploaded successfully!`
      });
      setSelectedFile(null);
      // Reset file input element
      const fileInp = document.getElementById('syllabus_file_input');
      if (fileInp) fileInp.value = '';

      fetchSyllabi();
    } catch (err) {
      setUploadStatus({ success: false, message: err.message || 'Server error uploading syllabus.' });
    } finally {
      setUploading(false);
    }
  };

  // Delete Syllabus Handler
  const handleDeleteSyllabus = async (id) => {
    if (!window.confirm('Are you sure you want to delete this syllabus file?')) return;
    try {
      const res = await fetch(`/api/syllabi/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setSyllabiList(prev => prev.filter(s => s.id !== id));
      } else {
        alert(result.message || 'Failed to delete syllabus.');
      }
    } catch (err) {
      alert('Error deleting syllabus: ' + err.message);
    }
  };

  // University CRUD Handlers
  const handleOpenAddUniv = () => {
    setEditingUniv(null);
    setUnivFormData({
      name: '',
      shortName: '',
      code: '',
      city: 'Bhopal',
      state: 'Madhya Pradesh',
      website: '',
      establishedYear: new Date().getFullYear(),
      description: ''
    });
    setShowUnivModal(true);
  };

  // AI Robot Assistant Event Listener
  useEffect(() => {
    const handleAIAction = (event) => {
      const detail = event.detail || {};
      if (detail.type === 'open-add-university') {
        setActiveSubTab('universities');
        setEditingUniv(null);
        setUnivFormData({
          name: detail.name || '',
          shortName: detail.shortName || (detail.name ? detail.name.substring(0, 10).toUpperCase() : ''),
          code: detail.code || '',
          city: detail.city || 'Bhopal',
          state: detail.state || 'Madhya Pradesh',
          website: detail.website || '',
          establishedYear: new Date().getFullYear(),
          description: detail.description || ''
        });
        setShowUnivModal(true);
      } else if (detail.type === 'open-add-college') {
        setActiveSubTab('colleges');
        setEditingCollege(null);
        let targetUniv = universities[0];
        if (detail.universityId) {
          targetUniv = universities.find(u => u.id === detail.universityId) || targetUniv;
        } else if (detail.univName) {
          targetUniv = universities.find(u => (u.name || '').toLowerCase().includes(detail.univName.toLowerCase()) || (u.shortName || '').toLowerCase().includes(detail.univName.toLowerCase())) || targetUniv;
        }
        setCollegeFormData({
          name: detail.collegeName || '',
          shortName: detail.shortName || '',
          code: detail.code || '',
          universityId: targetUniv ? targetUniv.id : 'univ-mpu',
          universityName: targetUniv ? targetUniv.name : 'Madhyanchal Professional University Bhopal',
          district: detail.district || 'Bhopal',
          state: 'Madhya Pradesh'
        });
        setShowCollegeModal(true);
      } else if (detail.type === 'prefill-upload-syllabus') {
        setActiveSubTab('upload_syllabus');
        if (detail.universityId) setUploadUnivId(detail.universityId);
        if (detail.collegeId) setUploadCollegeId(detail.collegeId);
        if (detail.branchCode) setUploadBranchCode(detail.branchCode);
        if (detail.semester) setUploadSemester(String(detail.semester));
      } else if (detail.type === 'switch-tab' && detail.tab) {
        setActiveSubTab(detail.tab);
      }
    };
    window.addEventListener('ai-action', handleAIAction);
    return () => window.removeEventListener('ai-action', handleAIAction);
  }, [universities, colleges]);

  const handleOpenEditUniv = (u) => {
    setEditingUniv(u);
    setUnivFormData({
      name: u.name || '',
      shortName: u.shortName || '',
      code: u.code || '',
      city: u.city || '',
      state: u.state || 'Madhya Pradesh',
      website: u.website || '',
      establishedYear: u.establishedYear || 2020,
      description: u.description || ''
    });
    setShowUnivModal(true);
  };

  const handleSaveUniv = async (e) => {
    e.preventDefault();
    try {
      const url = editingUniv ? `/api/universities/${editingUniv.id}` : '/api/universities';
      const method = editingUniv ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(univFormData)
      });
      const data = await res.json();
      if (data.success) {
        setShowUnivModal(false);
        fetchUniversities();
      } else {
        alert(data.message || 'Failed to save university.');
      }
    } catch (err) {
      alert('Error saving university: ' + err.message);
    }
  };

  const handleDeleteUniv = async (id) => {
    if (!window.confirm('Are you sure you want to remove this university?')) return;
    try {
      const res = await fetch(`/api/universities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUniversities();
      } else {
        alert(data.message || 'Failed to delete university.');
      }
    } catch (err) {
      alert('Error deleting university: ' + err.message);
    }
  };

  // College CRUD Handlers
  const handleOpenAddCollege = () => {
    setEditingCollege(null);
    setCollegeFormData({
      name: '',
      shortName: '',
      code: '',
      universityId: selectedUnivFilter !== 'ALL' ? selectedUnivFilter : (universities[0]?.id || 'univ-mpu'),
      universityName: universities.find(u => u.id === (selectedUnivFilter !== 'ALL' ? selectedUnivFilter : universities[0]?.id))?.name || '',
      district: 'Chhatarpur',
      state: 'Madhya Pradesh'
    });
    setShowCollegeModal(true);
  };

  const handleSaveCollege = async (e) => {
    e.preventDefault();
    try {
      const matchedUniv = universities.find(u => u.id === collegeFormData.universityId);
      const payload = {
        ...collegeFormData,
        universityName: matchedUniv ? matchedUniv.name : collegeFormData.universityName
      };

      const res = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowCollegeModal(false);
        fetchColleges();
      } else {
        alert(data.message || 'Failed to register college.');
      }
    } catch (err) {
      alert('Error saving college: ' + err.message);
    }
  };

  const handleDeleteCollege = async (id) => {
    if (!window.confirm('Are you sure you want to remove this affiliated college?')) return;
    try {
      const res = await fetch(`/api/colleges/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setColleges(prev => prev.filter(c => c.id !== id));
      } else {
        alert(data.message || 'Failed to delete college from server.');
      }
    } catch (err) {
      console.error('Error deleting college:', err);
      setColleges(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Banner: Strictly 3-Part Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Academic Registry &amp; Syllabus Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              University, College &amp; Syllabus Management
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Maintain partner universities, manage affiliated institutes, and upload semester-wise syllabus files in PDF or Excel formats with automatic college-branch linkage.
            </p>
          </div>

          {/* Metric Stats Banner: 3 Clean Boxes */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* Stat 1: Universities */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Universities</span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">{universities.length}</span>
              <span className="text-[10px] text-emerald-400 font-semibold block">Registered</span>
            </div>

            {/* Stat 2: Colleges */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Colleges</span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-0.5">{displayedCollegesCount}</span>
              <span className="text-[10px] text-indigo-300 font-semibold block">
                {selectedUnivFilter === 'ALL' ? 'Total Affiliated' : 'Under Selected'}
              </span>
            </div>

            {/* Stat 3: Syllabi on Record */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider block">Syllabi</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block mt-0.5">{syllabiList.length}</span>
              <span className="text-[10px] text-slate-300 font-semibold block">PDF / Excel Files</span>
            </div>
          </div>
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-2">
          {/* Tab 1: Universities */}
          <button
            onClick={() => setActiveSubTab('universities')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'universities'
                ? 'bg-white text-indigo-950 shadow-lg scale-[1.02]'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>1. Universities</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === 'universities' ? 'bg-indigo-100 text-indigo-900' : 'bg-white/20 text-white'
            }`}>
              {universities.length}
            </span>
          </button>

          {/* Tab 2: Affiliated Colleges */}
          <button
            onClick={() => setActiveSubTab('colleges')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'colleges'
                ? 'bg-white text-indigo-950 shadow-lg scale-[1.02]'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Affiliated Colleges</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeSubTab === 'colleges' ? 'bg-indigo-100 text-indigo-900' : 'bg-white/20 text-white'
            }`}>
              {colleges.length}
            </span>
          </button>

          {/* Tab 3: Upload Syllabus (Direct hierarchy uploader) */}
          <button
            onClick={() => setActiveSubTab('upload_syllabus')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'upload_syllabus'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 hover:text-white border border-emerald-500/30'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Upload Syllabus</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
              PDF &amp; Excel
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: UNIVERSITIES */}
      {/* ========================================================================= */}
      {activeSubTab === 'universities' && (
        <div className="space-y-6">
          {/* Universities Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={univSearch}
                onChange={(e) => setUnivSearch(e.target.value)}
                placeholder="Search partner universities by name, code or city..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              onClick={handleOpenAddUniv}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New University</span>
            </button>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities
              .filter(u => !univSearch || 
                (u.name || '').toLowerCase().includes(univSearch.toLowerCase()) ||
                (u.shortName || '').toLowerCase().includes(univSearch.toLowerCase()) ||
                (u.city || '').toLowerCase().includes(univSearch.toLowerCase())
              )
              .map(u => {
                const affiliatedCount = colleges.filter(c => c.universityId === u.id || (c.universityName || '').toLowerCase() === (u.name || '').toLowerCase()).length;
                const uploadedCount = syllabiList.filter(s => s.universityId === u.id).length;

                return (
                  <div 
                    key={u.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black text-sm border border-indigo-100 shrink-0">
                            {u.code || 'UNIV'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {u.status || 'Active Partner'}
                              </span>
                              {u.establishedYear && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Est. {u.establishedYear}
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-base text-slate-900 mt-1 leading-snug">
                              {u.name}
                            </h3>
                            <p className="text-xs font-semibold text-indigo-700">
                              {u.shortName || u.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditUniv(u)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUniv(u.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete university"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.city || 'Bhopal'}, {u.state || 'Madhya Pradesh'}</span>
                        </span>
                        {u.website && (
                          <a 
                            href={u.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>{u.website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}
                      </div>

                      {u.description && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {u.description}
                        </p>
                      )}
                    </div>

                    {/* Stats & Actions */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Affiliated Colleges</span>
                          <span className="text-sm font-black text-slate-900">{affiliatedCount} Institutes</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Syllabus Files</span>
                          <span className="text-sm font-black text-emerald-700">{uploadedCount} Uploaded</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewAffiliatedColleges(u.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>View Colleges ({affiliatedCount}) →</span>
                        </button>
                        <button
                          onClick={() => handleNavigateToUpload(u.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Syllabus →</span>
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
      {/* TAB 2: AFFILIATED COLLEGES */}
      {/* ========================================================================= */}
      {activeSubTab === 'colleges' && (
        <div className="space-y-6">
          {/* University Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1.5 pl-2">
              <Filter className="w-3.5 h-3.5" /> Filter by University:
            </span>
            <button
              onClick={() => setSelectedUnivFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedUnivFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Partner Universities ({colleges.length})
            </button>
            {universities.map(u => {
              const uCount = colleges.filter(c => c.universityId === u.id || (c.universityName || '').toLowerCase() === (u.name || '').toLowerCase()).length;
              return (
                <button
                  key={u.id}
                  onClick={() => setSelectedUnivFilter(u.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedUnivFilter === u.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{u.shortName || u.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    selectedUnivFilter === u.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {uCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Add College Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                placeholder="Search colleges by name, code, district..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              onClick={handleOpenAddCollege}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Affiliated College</span>
            </button>
          </div>

          {/* Colleges List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredColleges.map(c => {
              const matchingUniv = universities.find(u => u.id === c.universityId) || { name: c.universityName, shortName: c.universityName };
              const collegeSyllabiCount = syllabiList.filter(s => s.collegeId === c.id).length;

              return (
                <div 
                  key={c.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                        {c.code || 'COL'}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {c.district || 'MP'}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {c.name}
                    </h4>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                      <Landmark className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-indigo-900 truncate">
                        {matchingUniv.shortName || matchingUniv.name}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Uploaded Syllabi:</span>
                      <span className="font-bold text-emerald-700">{collegeSyllabiCount} files</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNavigateToUpload(c.universityId, c.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Syllabus →</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCollege(c.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete college"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
      {/* TAB 3: UPLOAD SYLLABUS (DIRECT HIERARCHY FORM & REPOSITORY) */}
      {/* ========================================================================= */}
      {activeSubTab === 'upload_syllabus' && (
        <div className="space-y-8">
          {/* Main Uploader Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                    3
                  </span>
                  <h2 className="font-black text-lg text-slate-900">
                    Upload Semester Syllabus (PDF &amp; Excel)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Follow the step-by-step hierarchy: Select University ➔ Affiliated College ➔ Course Branch ➔ Semester ➔ Choose File.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  📄 PDF Supported
                </span>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                  📊 Excel Supported
                </span>
              </div>
            </div>

            {/* Upload Status Banner */}
            {uploadStatus && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all ${
                uploadStatus.success 
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50 border border-rose-300 text-rose-900'
              }`}>
                {uploadStatus.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            )}

            {/* Cascading 4-Step Selection Grid */}
            <form onSubmit={handleUploadSyllabus} className="space-y-4">
              {/* 5-Field Side-by-Side Control Bar: University -> College -> Branch -> Semester -> Upload File */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 items-end bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                
                {/* 1. SELECT UNIVERSITY */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>University *</span>
                  </label>
                  <select
                    value={uploadUnivId}
                    onChange={(e) => {
                      const newUnivId = e.target.value;
                      setUploadUnivId(newUnivId);
                    }}
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs text-indigo-950 shadow-2xs cursor-pointer truncate"
                    required
                  >
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.shortName || u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. SELECT AFFILIATED COLLEGE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>College *</span>
                  </label>
                  <select
                    value={uploadCollegeId}
                    onChange={(e) => setUploadCollegeId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-semibold text-xs text-emerald-950 shadow-2xs cursor-pointer truncate"
                    required
                  >
                    {uploadAffiliatedColleges.length > 0 ? (
                      uploadAffiliatedColleges.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.code ? `[${c.code}] ` : ''}{c.shortName || c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No affiliated colleges</option>
                    )}
                  </select>
                </div>

                {/* 3. SELECT PROGRAM / BRANCH */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Branch / Program *</span>
                  </label>
                  <select
                    value={uploadBranchCode}
                    onChange={(e) => {
                      setUploadBranchCode(e.target.value);
                      setUploadSemester('1');
                    }}
                    className="w-full p-2.5 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-bold text-xs text-purple-950 shadow-2xs cursor-pointer truncate"
                    required
                  >
                    <optgroup label="B.Tech Engineering Branches (13)">
                      {ACADEMIC_BRANCHES.filter(b => b.degree === 'B.Tech').map(b => (
                        <option key={b.code} value={b.code}>
                          {b.name} [{b.code}]
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="MBA Management Streams (8)">
                      {ACADEMIC_BRANCHES.filter(b => b.degree === 'MBA').map(b => (
                        <option key={b.code} value={b.code}>
                          {b.name} [{b.code}]
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Education & Other Programs">
                      {ACADEMIC_BRANCHES.filter(b => b.degree !== 'B.Tech' && b.degree !== 'MBA').map(b => (
                        <option key={b.code} value={b.code}>
                          {b.degree} - {b.name} [{b.code}]
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 4. SELECT SEMESTER (USKE BAGAL MEIN) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black">4</span>
                    <span>Semester *</span>
                  </label>
                  <select
                    value={uploadSemester}
                    onChange={(e) => setUploadSemester(e.target.value)}
                    className="w-full p-2.5 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-black text-xs text-blue-950 shadow-2xs cursor-pointer"
                    required
                  >
                    {semesterOptions.map(sem => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. UPLOAD SYLLABUS (USKE BAGAL MEIN) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">5</span>
                    <span>Upload Syllabus *</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <label className="flex-1 cursor-pointer bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all truncate shadow-2xs min-h-[38px]">
                      <Upload className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="truncate">
                        {selectedFile ? selectedFile.name : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        id="syllabus_file_input"
                        accept=".pdf,.xls,.xlsx,.doc,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                            setUploadStatus(null);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          const fileInp = document.getElementById('syllabus_file_input');
                          if (fileInp) fileInp.value = '';
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer shrink-0"
                        title="Clear file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer min-h-[38px]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploading ? '...' : 'Upload'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Selected File Details Banner */}
              {selectedFile && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs text-emerald-900">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>File Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">
                    Ready to Upload for Sem-{uploadSemester}
                  </span>
                </div>
              )}

              {/* Status for currently selected combination */}
              <div className="pt-1">
                {currentExistingSyllabus ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/90 border border-emerald-200 p-3.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        {currentExistingSyllabus.fileType === 'Excel' ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                            {currentExistingSyllabus.fileType} Available
                          </span>
                          <span className="text-xs font-bold text-emerald-950">
                            Semester {currentExistingSyllabus.semester} Syllabus Available
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 truncate max-w-lg">
                          📎 <strong>{currentExistingSyllabus.fileName}</strong> ({(currentExistingSyllabus.fileSize / 1024).toFixed(1)} KB)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={currentExistingSyllabus.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-lg text-xs transition-colors shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Download</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteSyllabus(currentExistingSyllabus.id)}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete syllabus file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs">
                    <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      No syllabus uploaded yet for <strong>{currentUploadBranch?.name}</strong> (Semester {uploadSemester}) at <strong>{currentUploadCollege?.shortName || currentUploadCollege?.name}</strong>. Choose a file above and click <strong>Upload</strong>.
                    </span>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Master Table of All Uploaded Syllabi */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>All Uploaded Syllabus Files ({filteredSyllabi.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Search, view, download or manage curriculum syllabus files uploaded across colleges.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={syllabiSearch}
                    onChange={(e) => setSyllabiSearch(e.target.value)}
                    placeholder="Search file, branch, college..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={syllabiFilterUniv}
                  onChange={(e) => setSyllabiFilterUniv(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Universities</option>
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.shortName || u.name}</option>
                  ))}
                </select>

                <select
                  value={syllabiFilterSem}
                  onChange={(e) => setSyllabiFilterSem(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="ALL">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Syllabi Table */}
            {filteredSyllabi.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider bg-slate-50">
                      <th className="py-3 px-4 rounded-l-xl">University &amp; College</th>
                      <th className="py-3 px-4">Program &amp; Branch</th>
                      <th className="py-3 px-4 text-center">Semester</th>
                      <th className="py-3 px-4">File Name &amp; Format</th>
                      <th className="py-3 px-4">Uploaded Date</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredSyllabi.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{s.universityName}</strong>
                          <span className="text-[11px] text-slate-500">{s.collegeName || 'Affiliated Campus'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-indigo-900 block">{s.branch}</strong>
                          <span className="text-[10px] text-slate-400">{s.courseName}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-extrabold px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Sem-{s.semester}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {s.fileType === 'Excel' ? (
                              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                            )}
                            <div className="truncate max-w-[200px]">
                              <span className="font-bold text-slate-800 block truncate">{s.fileName}</span>
                              <span className="text-[10px] text-slate-400">
                                {(s.fileSize / 1024).toFixed(1)} KB ({s.fileType})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">
                          {new Date(s.uploadedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={s.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                            <button
                              onClick={() => handleDeleteSyllabus(s.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete file"
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
            ) : (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <FileText className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No syllabus files uploaded yet for this filter.</p>
                <p className="text-[11px] text-slate-400">Use the form above to upload your first syllabus file.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT UNIVERSITY */}
      {/* ========================================================================= */}
      {showUnivModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingUniv ? 'Edit University' : 'Register New Partner University'}
              </h3>
              <button 
                onClick={() => setShowUnivModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUniv} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">University Full Name *</label>
                <input
                  type="text"
                  value={univFormData.name}
                  onChange={(e) => setUnivFormData({ ...univFormData, name: e.target.value })}
                  placeholder="e.g. Madhyanchal Professional University Bhopal"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Short Name</label>
                  <input
                    type="text"
                    value={univFormData.shortName}
                    onChange={(e) => setUnivFormData({ ...univFormData, shortName: e.target.value })}
                    placeholder="e.g. MPU Bhopal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Code</label>
                  <input
                    type="text"
                    value={univFormData.code}
                    onChange={(e) => setUnivFormData({ ...univFormData, code: e.target.value })}
                    placeholder="e.g. MPU01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={univFormData.city}
                    onChange={(e) => setUnivFormData({ ...univFormData, city: e.target.value })}
                    placeholder="e.g. Bhopal"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={univFormData.state}
                    onChange={(e) => setUnivFormData({ ...univFormData, state: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Official Website URL</label>
                <input
                  type="url"
                  value={univFormData.website}
                  onChange={(e) => setUnivFormData({ ...univFormData, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUnivModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save University
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD AFFILIATED COLLEGE */}
      {/* ========================================================================= */}
      {showCollegeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Register Affiliated College
              </h3>
              <button 
                onClick={() => setShowCollegeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCollege} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Affiliated University *</label>
                <select
                  value={collegeFormData.universityId}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, universityId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  required
                >
                  {universities.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">College Full Name *</label>
                <input
                  type="text"
                  value={collegeFormData.name}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                  placeholder="e.g. BED121 - JEEVAN JYOTI SHIKSHA MAHAVIDYALAYA"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Short Name</label>
                  <input
                    type="text"
                    value={collegeFormData.shortName}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, shortName: e.target.value })}
                    placeholder="e.g. Jeevan Jyoti Mahavidyalaya"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">College Code</label>
                  <input
                    type="text"
                    value={collegeFormData.code}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, code: e.target.value })}
                    placeholder="e.g. BED121"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">District / City</label>
                <input
                  type="text"
                  value={collegeFormData.district}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, district: e.target.value })}
                  placeholder="e.g. Chhatarpur"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollegeModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Register College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
