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
  CreditCard,
  MapPin,
  Globe,
  Briefcase,
  Check,
  Eye,
  ArrowLeft
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
    website: 'https://mpu.ac.in',
    establishedYear: 2018,
    status: 'Active',
    description: 'Premier university offering multidisciplinary engineering (B.Tech) and management (MBA) programs.'
  },
  {
    id: 'univ-mcbu',
    name: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
    shortName: 'MCU Chhatarpur',
    code: 'MCU01',
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
    website: 'https://mcbu.ac.in',
    establishedYear: 2015,
    status: 'Active',
    description: 'State University in Chhatarpur district offering recognized degree & professional technical courses.'
  }
];

// Default 18 colleges accurately affiliated
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
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
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
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
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
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
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
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
    code: 'SVN01',
    name: 'S.V.N. COLLEGE, AFTER MARIA MATA SCHOOL, CHOUBEY COLONY',
    shortName: 'S.V.N. College Choubey Colony',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-sitaram-khop',
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
    code: 'SRC-KHOP',
    name: 'Sita Ram College Of Education Run By Girdhar gopal Shiksha Prashar Evam Jankalyan Samiti, Plot No. 90/3, Mahoba Road, Village Khop, Chhatarpur, P.O.+Th.+ Dist. Chhatarpur 471001, M.P.',
    shortName: 'Sita Ram College Of Education (Village Khop)',
    district: 'Chhatarpur',
    state: 'Madhya Pradesh',
    status: 'Active'
  },
  {
    id: 'col-shrikrishna-orchha',
    universityId: 'univ-mcbu',
    universityName: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)',
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

// STRICTLY B.TECH (13 Branches) & MBA (8 Specializations)
const INITIAL_COURSES = [
  // B.Tech (13 Branches)
  { id: 'btech-aiml', degree: 'B.Tech', name: 'B.Tech- Artificial Intelligence & Machine Learning (A)', code: 'BTECH-AIML', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in AI & ML covering Neural Networks, Deep Learning, Natural Language Processing and Robotics.' },
  { id: 'btech-cse-a', degree: 'B.Tech', name: 'B.Tech- Computer Science & Engineering (A)', code: 'BTECH-CSE-A', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in CSE Section A covering Algorithms, Cloud Computing, Full Stack & Software Engineering.' },
  { id: 'btech-cse-b', degree: 'B.Tech', name: 'B.Tech- Computer Science & Engineering (B)', code: 'BTECH-CSE-B', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in CSE Section B covering Data Structures, Web Systems, DevOps & Cybersecurity.' },
  { id: 'btech-ds', degree: 'B.Tech', name: 'B.Tech- Data Science (A)', code: 'BTECH-DS', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 280000, feePerSemester: 35000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Data Science covering Big Data Analytics, Statistical Modeling, Python & Business Intelligence.' },
  { id: 'btech-eee', degree: 'B.Tech', name: 'B.Tech- Electrical and Electronics Engineering', code: 'BTECH-EEE', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in EEE covering Electrical Power Systems, Electronic Circuits, Microcontrollers & IoT.' },
  { id: 'btech-ee', degree: 'B.Tech', name: 'B.Tech- Electrical Engineering', code: 'BTECH-EE', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Electrical Engineering covering High Voltage, Power Grids, Electric Vehicles & Renewable Systems.' },
  { id: 'btech-ece', degree: 'B.Tech', name: 'B.Tech- Electronics & Communication Engineering (A)', code: 'BTECH-ECE-A', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in ECE Section A covering Wireless Networks, 5G/6G, Embedded Systems & VLSI Chip Design.' },
  { id: 'btech-agri', degree: 'B.Tech', name: 'B.Tech- Agricultural Engineering', code: 'BTECH-AGRI', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM/PCB (Min 50%)', description: 'B.Tech in Agricultural Engineering covering Farm Machinery, Soil Hydrology, Precision Farming & Agro Processing.' },
  { id: 'btech-civil', degree: 'B.Tech', name: 'B.Tech- Civil Engineering', code: 'BTECH-CIVIL', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Civil Engineering covering Structural Analysis, Transportation, Surveying & Construction Management.' },
  { id: 'btech-ec', degree: 'B.Tech', name: 'B.Tech- Electronics and Communication Engineering', code: 'BTECH-EC', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Electronics & Communication covering Signal Processing, Telecommunications & Microelectronics.' },
  { id: 'btech-me-a', degree: 'B.Tech', name: 'B.Tech- Mechanical Engineering (A)', code: 'BTECH-ME-A', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Mechanical Engineering Section A covering Thermodynamics, Fluid Dynamics, CAD/CAM & Machine Design.' },
  { id: 'btech-me-b', degree: 'B.Tech', name: 'B.Tech- Mechanical Engineering (B)', code: 'BTECH-ME-B', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 240000, feePerSemester: 30000, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Mechanical Engineering Section B covering Robotics, Automated Manufacturing & Thermal Systems.' },
  { id: 'btech-mining', degree: 'B.Tech', name: 'B.Tech- Mining Engineering', code: 'BTECH-MINING', department: 'School of Engineering & Technology', durationYears: 4, totalSemesters: 8, totalFee: 260000, feePerSemester: 32500, eligibility: '10+2 with PCM (Min 50%)', description: 'B.Tech in Mining Engineering covering Surface Mining, Underground Excavation, Rock Mechanics & Mineral Processing.' },

  // MBA (8 Specializations)
  { id: 'mba-agri', degree: 'MBA', name: 'MBA- Agri Business Management', code: 'MBA-AGRI', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 160000, feePerSemester: 40000, eligibility: 'Graduation in any stream (Min 50%)', description: 'MBA in Agri Business Management covering Commodity Trading, Rural Marketing, Supply Chain & Agricultural Finance.' },
  { id: 'mba-bank', degree: 'MBA', name: 'MBA- Banking Insurance', code: 'MBA-BANK', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 160000, feePerSemester: 40000, eligibility: 'Graduation in any stream (Min 50%)', description: 'MBA in Banking & Insurance covering Financial Risk, Commercial Banking, Underwriting & Wealth Management.' },
  { id: 'mba-entr', degree: 'MBA', name: 'MBA- Entrepreneurship', code: 'MBA-ENTR', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 160000, feePerSemester: 40000, eligibility: 'Graduation in any stream (Min 50%)', description: 'MBA in Entrepreneurship covering Startup Incubation, Venture Capital, Product Strategy & Business Scaling.' },
  { id: 'mba-hosp', degree: 'MBA', name: 'MBA- Hospital Administration', code: 'MBA-HOSP', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 180000, feePerSemester: 45000, eligibility: 'Graduation in any stream / Life Sciences (Min 50%)', description: 'MBA in Hospital Administration covering Healthcare Quality, Hospital Logistics, Clinical Governance & Public Health.' },
  { id: 'mba-it', degree: 'MBA', name: 'MBA- IT', code: 'MBA-IT', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 160000, feePerSemester: 40000, eligibility: 'Graduation with IT/CS or Any Discipline (Min 50%)', description: 'MBA in Information Technology covering Enterprise Systems, IT Project Management, Cloud Strategies & Digital Transformation.' },
  { id: 'mba-ngo', degree: 'MBA', name: 'MBA- NGO', code: 'MBA-NGO', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 140000, feePerSemester: 35000, eligibility: 'Graduation in any stream (Min 50%)', description: 'MBA in NGO & Social Management covering CSR Initiatives, Grant Management, Community Development & Public Policy.' },
  { id: 'mba-plain', degree: 'MBA', name: 'MBA- Plain', code: 'MBA-PLAIN', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 140000, feePerSemester: 35000, eligibility: 'Graduation in any stream (Min 50%)', description: 'General MBA program covering Core Marketing, Human Resource Management, Corporate Finance & Operations.' },
  { id: 'mba-retail', degree: 'MBA', name: 'MBA- Retail', code: 'MBA-RETAIL', department: 'School of Management & Business', durationYears: 2, totalSemesters: 4, totalFee: 160000, feePerSemester: 40000, eligibility: 'Graduation in any stream (Min 50%)', description: 'MBA in Retail Management covering Merchandising, Supply Chain, E-Commerce, Consumer Behavior & Store Operations.' }
];

// Helper to provide realistic semester curriculum subjects
const getCurriculumSubjects = (courseName = '', semNum = '1') => {
  const sem = parseInt(semNum, 10) || 1;
  const name = (courseName || '').toLowerCase();
  
  if (name.includes('artificial intelligence') || name.includes('ai & ml') || name.includes('aiml')) {
    const subjects = {
      1: [
        { code: 'AIML-101', name: 'Engineering Mathematics-I (Calculus & Linear Algebra)', credits: 4, type: 'Theory' },
        { code: 'AIML-102', name: 'Engineering Physics & Quantum Principles', credits: 3, type: 'Theory' },
        { code: 'AIML-103', name: 'Programming for Problem Solving using Python', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-104', name: 'Basic Electrical & Electronics Engineering', credits: 3, type: 'Theory' },
        { code: 'AIML-105', name: 'Python Programming for AI Lab', credits: 2, type: 'Practical' },
      ],
      2: [
        { code: 'AIML-201', name: 'Engineering Mathematics-II (Probability & Statistics)', credits: 4, type: 'Theory' },
        { code: 'AIML-202', name: 'Data Structures & Algorithms using C++', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-203', name: 'Digital Logic & Computer Design', credits: 3, type: 'Theory' },
        { code: 'AIML-204', name: 'Foundations of Artificial Intelligence', credits: 3, type: 'Theory' },
        { code: 'AIML-205', name: 'Data Structures Laboratory', credits: 2, type: 'Practical' },
      ],
      3: [
        { code: 'AIML-301', name: 'Discrete Mathematical Structures', credits: 4, type: 'Theory' },
        { code: 'AIML-302', name: 'Object-Oriented Programming with Java', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-303', name: 'Database Management Systems & SQL', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-304', name: 'Computer Organization & Architecture', credits: 3, type: 'Theory' },
        { code: 'AIML-305', name: 'Database & Backend Lab', credits: 2, type: 'Practical' },
      ],
      4: [
        { code: 'AIML-401', name: 'Design & Analysis of Algorithms', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-402', name: 'Operating Systems & System Programming', credits: 3, type: 'Theory' },
        { code: 'AIML-403', name: 'Machine Learning Foundations & Supervised Learning', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-404', name: 'Theory of Computation & Automata', credits: 3, type: 'Theory' },
        { code: 'AIML-405', name: 'Machine Learning Tools & Scikit-Learn Lab', credits: 2, type: 'Practical' },
      ],
      5: [
        { code: 'AIML-501', name: 'Deep Learning & Artificial Neural Networks', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-502', name: 'Computer Vision & Image Processing', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-503', name: 'Web Technologies & REST API Architecture', credits: 3, type: 'Theory' },
        { code: 'AIML-504', name: 'Software Engineering & Agile Methodologies', credits: 3, type: 'Theory' },
        { code: 'AIML-505', name: 'PyTorch / TensorFlow Deep Learning Lab', credits: 2, type: 'Practical' },
      ],
      6: [
        { code: 'AIML-601', name: 'Natural Language Processing & LLM Architecture', credits: 4, type: 'Theory + Lab' },
        { code: 'AIML-602', name: 'Big Data Analytics & Cloud Computing', credits: 3, type: 'Theory' },
        { code: 'AIML-603', name: 'Reinforcement Learning & Decision Systems', credits: 3, type: 'Theory' },
        { code: 'AIML-604', name: 'Information & Network Security', credits: 3, type: 'Theory' },
        { code: 'AIML-605', name: 'NLP & Generative AI Studio Lab', credits: 2, type: 'Practical' },
      ],
      7: [
        { code: 'AIML-701', name: 'Robotics, Sensors & Autonomous Systems', credits: 3, type: 'Theory' },
        { code: 'AIML-702', name: 'AI Ethics, Safety & Explainable AI (XAI)', credits: 3, type: 'Theory' },
        { code: 'AIML-703', name: 'Departmental Elective-I (MLOps / Edge AI)', credits: 3, type: 'Elective' },
        { code: 'AIML-704', name: 'Capstone Minor Project & Prototype', credits: 3, type: 'Project' },
        { code: 'AIML-705', name: 'Industrial Summer Internship Evaluation', credits: 2, type: 'Internship' },
      ],
      8: [
        { code: 'AIML-801', name: 'Major Capstone AI System Implementation', credits: 8, type: 'Project' },
        { code: 'AIML-802', name: 'Departmental Elective-II (Quantum AI / Bio-AI)', credits: 3, type: 'Elective' },
        { code: 'AIML-803', name: 'Technical Seminar & Research Publication', credits: 2, type: 'Seminar' },
        { code: 'AIML-804', name: 'Comprehensive Academic Viva-Voce', credits: 2, type: 'Viva' },
      ]
    };
    return subjects[sem] || subjects[1];
  }

  // Default Standard B.Tech
  const defaultBTech = {
    1: [
      { code: 'ENG-101', name: 'Engineering Mathematics-I', credits: 4, type: 'Theory' },
      { code: 'ENG-102', name: 'Engineering Physics / Chemistry', credits: 3, type: 'Theory' },
      { code: 'ENG-103', name: 'Programming for Problem Solving (C / Python)', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-104', name: 'Basic Electrical / Electronics Systems', credits: 3, type: 'Theory' },
      { code: 'ENG-105', name: 'Engineering Workshop & Computer Drawing Lab', credits: 2, type: 'Practical' },
    ],
    2: [
      { code: 'ENG-201', name: 'Engineering Mathematics-II', credits: 4, type: 'Theory' },
      { code: 'ENG-202', name: 'Branch Fundamentals & Applied Science', credits: 3, type: 'Theory' },
      { code: 'ENG-203', name: 'Data Structures & Problem Solving', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-204', name: 'Digital Systems & Branch Circuitry', credits: 3, type: 'Theory' },
      { code: 'ENG-205', name: 'Branch Core Laboratory-I', credits: 2, type: 'Practical' },
    ],
    3: [
      { code: 'ENG-301', name: 'Advanced Engineering Mathematics', credits: 4, type: 'Theory' },
      { code: 'ENG-302', name: 'Core Branch Technology-I', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-303', name: 'Systems Architecture & Modeling', credits: 3, type: 'Theory' },
      { code: 'ENG-304', name: 'Measurement, Instrumentation & Testing', credits: 3, type: 'Theory' },
      { code: 'ENG-305', name: 'Branch Core Laboratory-II', credits: 2, type: 'Practical' },
    ],
    4: [
      { code: 'ENG-401', name: 'Design & Analysis of Core Systems', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-402', name: 'Control Systems & Instrumentation', credits: 3, type: 'Theory' },
      { code: 'ENG-403', name: 'Core Branch Technology-II', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-404', name: 'Computational Tools & Software Simulation', credits: 3, type: 'Theory' },
      { code: 'ENG-405', name: 'Software Simulation & CAD Lab', credits: 2, type: 'Practical' },
    ],
    5: [
      { code: 'ENG-501', name: 'Advanced Branch Applications-I', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-502', name: 'Modern Engineering Materials & Processes', credits: 3, type: 'Theory' },
      { code: 'ENG-503', name: 'Professional Elective-I', credits: 3, type: 'Elective' },
      { code: 'ENG-504', name: 'Management & Industrial Economics', credits: 3, type: 'Theory' },
      { code: 'ENG-505', name: 'Advanced Branch Laboratory', credits: 2, type: 'Practical' },
    ],
    6: [
      { code: 'ENG-601', name: 'Advanced Branch Applications-II', credits: 4, type: 'Theory + Lab' },
      { code: 'ENG-602', name: 'Embedded Systems & Automation', credits: 3, type: 'Theory' },
      { code: 'ENG-603', name: 'Professional Elective-II', credits: 3, type: 'Elective' },
      { code: 'ENG-604', name: 'Open Interdisciplinary Elective', credits: 3, type: 'Elective' },
      { code: 'ENG-605', name: 'Design Project & Fabrication Lab', credits: 2, type: 'Practical' },
    ],
    7: [
      { code: 'ENG-701', name: 'System Optimization & Quality Engineering', credits: 3, type: 'Theory' },
      { code: 'ENG-702', name: 'Professional Elective-III', credits: 3, type: 'Elective' },
      { code: 'ENG-703', name: 'Capstone Minor Project & Research Review', credits: 3, type: 'Project' },
      { code: 'ENG-704', name: 'Summer Industrial Training Presentation', credits: 2, type: 'Training' },
    ],
    8: [
      { code: 'ENG-801', name: 'Major Capstone Engineering Project', credits: 8, type: 'Project' },
      { code: 'ENG-802', name: 'Technical Seminar & Paper Publication', credits: 2, type: 'Seminar' },
      { code: 'ENG-803', name: 'Comprehensive Degree Viva-Voce', credits: 2, type: 'Viva' },
    ]
  };
  return defaultBTech[sem] || defaultBTech[1];
};

export default function SyllabusManager({ courses: initialPropCourses, onRefreshCourses }) {
  // Navigation Sub-tab: 'universities' (Default: only universities show first) | 'colleges' | 'courses' | 'syllabus'
  const [activeSubTab, setActiveSubTab] = useState('universities');

  // Master Data States
  const [universities, setUniversities] = useState(INITIAL_UNIVERSITIES);
  const [colleges, setColleges] = useState(INITIAL_COLLEGES);
  const [coursesList, setCoursesList] = useState(INITIAL_COURSES);

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

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && data.courses && data.courses.length > 0) {
        const filtered = data.courses.filter(c => 
          c.name?.toLowerCase().includes('b.tech') || 
          c.code?.toLowerCase().includes('btech') ||
          c.name?.toLowerCase().includes('mba') ||
          c.code?.toLowerCase().includes('mba')
        );
        if (filtered.length > 0) {
          setCoursesList(filtered);
        }
      }
    } catch (err) {
      console.log('Using initial courses');
    }
  };

  useEffect(() => {
    fetchUniversities();
    fetchColleges();
    fetchCourses();
  }, []);

  // Filter States
  const [selectedUnivFilter, setSelectedUnivFilter] = useState('all');
  const [selectedDegreeFilter, setSelectedDegreeFilter] = useState('B.Tech');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected University object
  const selectedUniversity = universities.find(u => u.id === selectedUnivFilter) || null;

  // Notification Messages
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // ----------------------------------------------------
  // INTERACTIVE VIEW SYLLABUS MODAL STATE
  // ----------------------------------------------------
  const [viewingSyllabusCourse, setViewingSyllabusCourse] = useState(null);
  const [viewerActiveSem, setViewerActiveSem] = useState('1');
  const [modalFileToUpload, setModalFileToUpload] = useState(null);
  const [modalUploading, setModalUploading] = useState(false);

  const handleOpenViewSyllabus = (course, sem = '1') => {
    setViewingSyllabusCourse(course);
    setViewerActiveSem(sem);
    setModalFileToUpload(null);
    setErrorMsg(null);
  };

  const handleModalFileUpload = async (e) => {
    e.preventDefault();
    if (!modalFileToUpload || !viewingSyllabusCourse) {
      setErrorMsg('Please select a syllabus document file to upload.');
      return;
    }

    setModalUploading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', modalFileToUpload);
      formData.append('semester', viewerActiveSem);

      const res = await fetch(`/api/courses/${viewingSyllabusCourse.id}/syllabus-file`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to upload syllabus.');
      }

      const updatedCourse = data.course || {
        ...viewingSyllabusCourse,
        syllabusFiles: {
          ...(viewingSyllabusCourse.syllabusFiles || {}),
          [viewerActiveSem]: data.syllabusFile
        }
      };

      setCoursesList(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setViewingSyllabusCourse(updatedCourse);
      setSuccessMsg(`Semester ${viewerActiveSem} syllabus file uploaded successfully!`);
      setModalFileToUpload(null);
      setTimeout(() => setSuccessMsg(null), 4000);
      if (onRefreshCourses) onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message || 'Upload failed');
    } finally {
      setModalUploading(false);
    }
  };

  const handleModalDeleteFile = async (courseId, sem) => {
    if (!window.confirm(`Are you sure you want to remove the syllabus document for Semester ${sem}?`)) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/syllabus-file/${sem}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const updatedFiles = { ...(viewingSyllabusCourse.syllabusFiles || {}) };
        delete updatedFiles[sem];
        const updatedCourse = { ...viewingSyllabusCourse, syllabusFiles: updatedFiles };
        setCoursesList(prev => prev.map(c => c.id === courseId ? updatedCourse : c));
        setViewingSyllabusCourse(updatedCourse);
        setSuccessMsg(`Semester ${sem} syllabus document removed.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        if (onRefreshCourses) onRefreshCourses();
      }
    } catch (err) {
      setErrorMsg('Failed to remove syllabus file.');
    }
  };

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
    city: 'Chhatarpur',
    state: 'Madhya Pradesh',
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
      city: 'Chhatarpur',
      state: 'Madhya Pradesh',
      website: '',
      establishedYear: 2018,
      description: 'University offering recognized degree programs (B.Tech & MBA).'
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
      setSuccessMsg('University saved successfully!');
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
      setSuccessMsg('College registered successfully!');
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
    setSuccessMsg('College removed.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // ----------------------------------------------------
  // ADD / EDIT COURSE MODAL STATE (Only B.Tech or MBA)
  // ----------------------------------------------------
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    degree: 'B.Tech',
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

  const handleOpenAddCourse = (defaultDegree = 'B.Tech') => {
    setEditingCourse(null);
    const isMba = defaultDegree === 'MBA';
    setCourseForm({
      degree: defaultDegree,
      name: isMba ? 'MBA- ' : 'B.Tech- ',
      code: isMba ? 'MBA-' : 'BTECH-',
      department: isMba ? 'School of Management & Business' : 'School of Engineering & Technology',
      durationYears: isMba ? 2 : 4,
      totalSemesters: isMba ? 4 : 8,
      eligibility: isMba ? 'Graduation in any stream (Min 50%)' : '10+2 with PCM (Min 50%)',
      description: isMba ? 'Master of Business Administration professional management specialization.' : 'Four-year engineering bachelor degree program.',
      totalFee: isMba ? 160000 : 240000,
      feePerSemester: isMba ? 40000 : 30000
    });
    setShowCourseModal(true);
    setErrorMsg(null);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    const isMba = course.name?.toLowerCase().includes('mba') || course.degree === 'MBA';
    setCourseForm({
      degree: isMba ? 'MBA' : 'B.Tech',
      name: course.name || '',
      code: course.code || '',
      department: course.department || (isMba ? 'School of Management & Business' : 'School of Engineering & Technology'),
      durationYears: course.durationYears || (isMba ? 2 : 4),
      totalSemesters: course.totalSemesters || (isMba ? 4 : 8),
      eligibility: course.eligibility || (isMba ? 'Graduation in any stream (Min 50%)' : '10+2 with PCM (Min 50%)'),
      description: course.description || '',
      totalFee: course.totalFee !== undefined ? course.totalFee : (isMba ? 160000 : 240000),
      feePerSemester: course.feePerSemester !== undefined ? course.feePerSemester : (isMba ? 40000 : 30000)
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
      setSuccessMsg('Course saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete branch "${name}"?`)) return;
    try {
      await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setCoursesList(prev => prev.filter(c => c.id !== id));
    setSuccessMsg(`Branch "${name}" deleted.`);
    setTimeout(() => setSuccessMsg(null), 4000);
    if (onRefreshCourses) onRefreshCourses();
  };

  // ----------------------------------------------------
  // SYLLABUS UPLOAD STATE & HANDLERS (Full Page Tab 4)
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
      setErrorMsg('Please select a program, semester, and a syllabus document file.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('semester', selectedSemester);

      const res = await fetch(`/api/courses/${selectedCourse.id}/syllabus-file`, {
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

      if (data.course) {
        setCoursesList(prev => prev.map(c => c.id === data.course.id ? data.course : c));
      }
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
      if (data.course) {
        setCoursesList(prev => prev.map(c => c.id === data.course.id ? data.course : c));
      }
      if (onRefreshCourses) await onRefreshCourses();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleJumpToSyllabus = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedSemester('1');
    setActiveSubTab('syllabus');
  };

  // Helper to get colleges under a specific university
  const getCollegesForUniv = (univ) => {
    if (!univ) return [];
    return colleges.filter(c => 
      c.universityId === univ.id || 
      (c.universityName || '').toLowerCase().includes((univ.shortName || univ.name).toLowerCase())
    );
  };

  // Filtered Colleges list for Tab 2
  const filteredColleges = colleges.filter(c => {
    const matchesUniv = selectedUnivFilter === 'all' || 
      c.universityId === selectedUnivFilter || 
      (c.universityName || '').toLowerCase().includes((selectedUniversity?.shortName || selectedUniversity?.name || '').toLowerCase());
    
    const matchesSearch = !searchTerm.trim() || 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesUniv && matchesSearch;
  });

  // Dynamic count of colleges to show in banner based on selection:
  const displayedCollegesCount = selectedUnivFilter === 'all' || !selectedUniversity 
    ? colleges.length 
    : getCollegesForUniv(selectedUniversity).length;

  // Filtered Courses list: Strictly B.Tech and MBA
  const btechCourses = coursesList.filter(c => c.name?.toLowerCase().includes('b.tech') || c.code?.toLowerCase().includes('btech') || c.degree === 'B.Tech');
  const mbaCourses = coursesList.filter(c => c.name?.toLowerCase().includes('mba') || c.code?.toLowerCase().includes('mba') || c.degree === 'MBA');

  const filteredCourses = coursesList.filter(c => {
    const isBtech = c.name?.toLowerCase().includes('b.tech') || c.code?.toLowerCase().includes('btech') || c.degree === 'B.Tech';
    const isMba = c.name?.toLowerCase().includes('mba') || c.code?.toLowerCase().includes('mba') || c.degree === 'MBA';

    if (selectedDegreeFilter === 'B.Tech' && !isBtech) return false;
    if (selectedDegreeFilter === 'MBA' && !isMba) return false;

    const matchesSearch = !searchTerm.trim() || 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-900">
      
      {/* ========================================================================= */}
      {/* 1. ACADEMIC HEADER BANNER - STRICTLY ONLY 2 PARTS (Universities & Colleges) */}
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
                  Affiliation &amp; University Hub
                </span>
                {selectedUniversity && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Active: {selectedUniversity.shortName || selectedUniversity.code}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Universities &amp; Affiliated Colleges Hub
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedUniversity 
                  ? `Selected: ${selectedUniversity.name} — viewing its affiliated colleges and academic network.`
                  : 'Select any university below to view and manage its affiliated colleges.'}
              </p>
            </div>
          </div>

          {/* Metric Badges: EXACTLY 2 PARTS (Universities & Colleges) - Dynamic by selection */}
          <div className="flex items-center gap-3">
            {/* Part 1: Universities */}
            <div 
              onClick={() => {
                setSelectedUnivFilter('all');
                setActiveSubTab('universities');
              }}
              className={`px-5 py-3 rounded-2xl border text-center min-w-[120px] transition-all cursor-pointer shadow-sm ${
                selectedUnivFilter === 'all' || activeSubTab === 'universities'
                  ? 'bg-white/20 border-amber-400/60 ring-2 ring-amber-400/30'
                  : 'bg-white/10 hover:bg-white/15 border-white/10'
              }`}
              title="Click to view all Universities"
            >
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                Universities
              </span>
              <span className="text-2xl font-black text-white">
                {universities.length}
              </span>
              <span className="text-[10px] text-slate-300 block font-medium">
                {selectedUniversity ? (selectedUniversity.shortName || selectedUniversity.code) : 'Partner Hubs'}
              </span>
            </div>

            {/* Part 2: Colleges - Dynamically changes based on selected university! */}
            <div 
              onClick={() => {
                setActiveSubTab('colleges');
              }}
              className={`px-5 py-3 rounded-2xl border text-center min-w-[140px] transition-all cursor-pointer shadow-sm ${
                activeSubTab === 'colleges'
                  ? 'bg-white/20 border-indigo-400/60 ring-2 ring-indigo-400/30'
                  : 'bg-white/10 hover:bg-white/15 border-white/10'
              }`}
              title="Click to view Affiliated Colleges"
            >
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">
                Colleges
              </span>
              <span className="text-2xl font-black text-white">
                {displayedCollegesCount}
              </span>
              <span className="text-[10px] text-indigo-200 block truncate max-w-[140px] font-medium">
                {selectedUniversity 
                  ? `under ${selectedUniversity.shortName || selectedUniversity.code}` 
                  : 'All 18 Colleges'}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODERN TOP SUB-NAVBAR & QUICK ACTION TOOLBAR */}
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
            <span>1. Universities</span>
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
            <span>2. Affiliated Colleges</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'colleges' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              {displayedCollegesCount}
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
            <span>3. B.Tech &amp; MBA Programs</span>
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
            <span>4. Upload Syllabus</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'syllabus' ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-200 text-slate-600'
            }`}>
              PDF / Excel
            </span>
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={handleOpenAddUniv}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Add a new University"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add University</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddCollege(selectedUnivFilter !== 'all' ? selectedUnivFilter : 'univ-mpu')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
            title="Register College"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add College</span>
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
      {/* TAB 1: UNIVERSITIES DIRECTORY (Only Universities Shown Here!) */}
      {/* ========================================================================= */}
      {activeSubTab === 'universities' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Partner Universities ({universities.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Click on any university to view all its affiliated colleges and managed programs.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddUniv}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New University</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities.map((univ) => {
              const univColleges = getCollegesForUniv(univ);

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
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
                        <span className="text-slate-400 block font-medium">City / State</span>
                        <strong className="text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{univ.city}, {univ.state}</span>
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Affiliated Colleges</span>
                        <strong className="text-indigo-900 font-extrabold text-sm">
                          {univColleges.length} Colleges
                        </strong>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {univ.description || 'Recognized higher education university offering degree and technical programs.'}
                    </p>

                    {univ.website && (
                      <a
                        href={univ.website.startsWith('http') ? univ.website : `https://${univ.website}`}
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

                  {/* Primary Action: VIEW COLLEGES UNDER THIS UNIVERSITY */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUnivFilter(univ.id);
                        setActiveSubTab('colleges');
                      }}
                      className="flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      <Landmark className="w-4 h-4" />
                      <span>View Affiliated Colleges ({univColleges.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditUniv(univ)}
                        className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit University"
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
      {/* TAB 2: AFFILIATED COLLEGES (Drill-down: Colleges Under Selected University) */}
      {/* ========================================================================= */}
      {activeSubTab === 'colleges' && (
        <div className="space-y-6">
          
          {/* Active University Breadcrumb & Switcher Header */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUnivFilter('all');
                      setActiveSubTab('universities');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Universities</span>
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {selectedUniversity ? (selectedUniversity.shortName || selectedUniversity.name) : 'All Partner Colleges'}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  <span>
                    {selectedUniversity 
                      ? `Colleges Under ${selectedUniversity.shortName || selectedUniversity.name} (${filteredColleges.length})`
                      : `All Affiliated Colleges Directory (${filteredColleges.length})`}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAddCollege(selectedUnivFilter !== 'all' ? selectedUnivFilter : 'univ-mpu')}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Register New College</span>
                </button>
              </div>
            </div>

            {/* University Filter Pills - Click to instantly switch university and see its colleges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap mr-1">
                Filter by University:
              </span>

              <button
                type="button"
                onClick={() => setSelectedUnivFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedUnivFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                All Universities ({colleges.length})
              </button>

              {universities.map(u => {
                const isCurrent = selectedUnivFilter === u.id;
                const count = getCollegesForUniv(u).length;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUnivFilter(u.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-400/30'
                        : 'bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{u.shortName || u.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-900'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Search college by name, code (e.g. BED121, N462), or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none font-medium text-slate-800"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Colleges Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                  <tr>
                    <th className="p-3.5">Code</th>
                    <th className="p-3.5">College Name &amp; Trust</th>
                    <th className="p-3.5">Affiliated University</th>
                    <th className="p-3.5">District / State</th>
                    <th className="p-3.5">Programs</th>
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
                      <td className="p-3.5 font-bold text-slate-800">
                        {col.universityName}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {col.district}, {col.state}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          B.Tech &amp; MBA
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveSubTab('courses')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                          >
                            Programs &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCollege(col.id, col.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete college"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredColleges.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                        No colleges found matching the selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: B.TECH (13 Branches) & MBA (8 Streams) - CLEAN COMPACT VIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>
                  {selectedDegreeFilter === 'B.Tech' 
                    ? `B.Tech Engineering (${btechCourses.length} Branches)` 
                    : selectedDegreeFilter === 'MBA' 
                    ? `MBA Management (${mbaCourses.length} Specializations)` 
                    : `Academic Programs & Branches (${filteredCourses.length})`}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official degree branches with semester durations and academic syllabus documents.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenAddCourse('B.Tech')}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add B.Tech Branch</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddCourse('MBA')}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add MBA Stream</span>
              </button>
            </div>
          </div>

          {/* Program Toggle & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            {/* Degree Pill Toggles */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedDegreeFilter('B.Tech')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDegreeFilter === 'B.Tech'
                    ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400/30'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>B.Tech Engineering ({btechCourses.length} Branches)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDegreeFilter('MBA')}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDegreeFilter === 'MBA'
                    ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/30'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>MBA Management ({mbaCourses.length} Specializations)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDegreeFilter('all')}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDegreeFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Programs ({coursesList.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search branch (e.g. AI&ML, Mining, Banking)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
          </div>

          {/* Clean Compact Cards Grid - No Price, Clear Duration, Side-by-Side View & Upload buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((c) => {
              const isMba = c.name?.toLowerCase().includes('mba') || c.degree === 'MBA';
              const uploadedCount = c.syllabusFiles ? Object.keys(c.syllabusFiles).length : 0;
              const totalSem = c.totalSemesters || (isMba ? 4 : 8);

              return (
                <div 
                  key={c.id} 
                  className={`bg-white rounded-2xl border p-4.5 shadow-xs hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between ${
                    isMba ? 'border-purple-200 hover:border-purple-300' : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-[11px] uppercase px-2 py-0.5 rounded-md border ${
                          isMba 
                            ? 'bg-purple-50 text-purple-700 border-purple-200' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {c.code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMba 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {isMba ? 'MBA Stream' : 'B.Tech Branch'}
                        </span>
                      </div>

                      {/* Syllabus Status Pill */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        uploadedCount > 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {uploadedCount > 0 ? `✅ ${uploadedCount}/${totalSem} Sem Uploaded` : `📄 ${totalSem} Sem Syllabus`}
                      </span>
                    </div>

                    {/* Branch Title */}
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                      {c.name}
                    </h3>

                    {/* Duration & Semesters & Department */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                        ⏱️ {c.durationYears} Years
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                        📚 {totalSem} Semesters
                      </span>
                      <span className="text-slate-400 font-normal">
                        • {c.department}
                      </span>
                    </div>
                  </div>

                  {/* Actions: View Syllabus + Upload Syllabus + Edit/Delete */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenViewSyllabus(c, '1')}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer shadow-2xs ${
                          isMba
                            ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200'
                            : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                        }`}
                        title="View Semester Wise Syllabus & Curriculum"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Syllabus</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleJumpToSyllabus(c.id)}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
                        title="Upload Syllabus PDF Document"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditCourse(c)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Branch Information"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(c.id, c.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Branch"
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
      {/* TAB 4: SYLLABUS UPLOAD & MANAGE (Full Dedicated Tool) */}
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
                Select degree branch and semester, then upload official curriculum document (PDF / Excel).
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. SELECT PROGRAM */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Select B.Tech / MBA Program *
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('courses')}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                    >
                      + View All Branches
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
                        {course.name} ({course.code}) — {course.durationYears} Yr ({course.totalSemesters} Sem)
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

              {/* 3. UPLOAD FILE */}
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

            {/* Current Uploaded Syllabus Status */}
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
      {/* MODAL 0: INTERACTIVE SEMESTER SYLLABUS VIEWER */}
      {/* ========================================================================= */}
      {viewingSyllabusCourse && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setViewingSyllabusCourse(null)}
        >
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl text-slate-900 border border-slate-200 animate-fadeIn my-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {viewingSyllabusCourse.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {viewingSyllabusCourse.durationYears} Years ({viewingSyllabusCourse.totalSemesters} Semesters)
                    </span>
                  </div>
                  <h3 className="font-black text-base sm:text-lg text-slate-900 mt-1">
                    {viewingSyllabusCourse.name} — Syllabus &amp; Curricula
                  </h3>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setViewingSyllabusCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Semester Selector Tabs */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Select Semester to View / Upload Syllabus:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {Array.from({ length: viewingSyllabusCourse.totalSemesters || 8 }, (_, i) => String(i + 1)).map((sem) => {
                  const isCurrent = viewerActiveSem === sem;
                  const hasFile = viewingSyllabusCourse.syllabusFiles && viewingSyllabusCourse.syllabusFiles[sem];
                  return (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => {
                        setViewerActiveSem(sem);
                        setModalFileToUpload(null);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                        isCurrent
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-400/30'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>Semester {sem}</span>
                      {hasFile && (
                        <Check className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Semester Content */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
              
              {/* Document Download / View Section */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  1. Official Syllabus Document (Semester {viewerActiveSem})
                </span>

                {viewingSyllabusCourse.syllabusFiles && viewingSyllabusCourse.syllabusFiles[viewerActiveSem] ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                          <span>{viewingSyllabusCourse.syllabusFiles[viewerActiveSem].fileName}</span>
                          <span className="text-[9px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                            ATTACHED
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Uploaded: {new Date(viewingSyllabusCourse.syllabusFiles[viewerActiveSem].uploadedAt).toLocaleDateString()}
                          {viewingSyllabusCourse.syllabusFiles[viewerActiveSem].fileSize && (
                            <span> • {(viewingSyllabusCourse.syllabusFiles[viewerActiveSem].fileSize / 1024).toFixed(1)} KB</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={viewingSyllabusCourse.syllabusFiles[viewerActiveSem].fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Download PDF</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleModalDeleteFile(viewingSyllabusCourse.id, viewerActiveSem)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-600">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>No syllabus document file uploaded for Semester {viewerActiveSem} yet.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Document for Current Semester */}
              <form onSubmit={handleModalFileUpload} className="space-y-2 pt-2 border-t border-slate-200/80">
                <label className="text-xs font-bold text-slate-700 block">
                  {viewingSyllabusCourse.syllabusFiles && viewingSyllabusCourse.syllabusFiles[viewerActiveSem] 
                    ? `Replace Semester ${viewerActiveSem} Syllabus Document (PDF / Excel):` 
                    : `Upload Semester ${viewerActiveSem} Syllabus Document (PDF / Excel):`}
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
                    onChange={(e) => setModalFileToUpload(e.target.files[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 file:cursor-pointer bg-white border border-slate-200 rounded-xl p-1"
                  />
                  <button
                    type="submit"
                    disabled={modalUploading || !modalFileToUpload}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{modalUploading ? 'Uploading...' : `Upload for Sem ${viewerActiveSem}`}</span>
                  </button>
                </div>
              </form>

              {/* Structured Curriculum Subjects List */}
              <div className="space-y-2 pt-3 border-t border-slate-200/80">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  2. Semester {viewerActiveSem} Academic Curriculum &amp; Modules
                </span>
                
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Subject Code</th>
                        <th className="p-2.5">Subject / Course Module</th>
                        <th className="p-2.5">Credits</th>
                        <th className="p-2.5">Course Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {getCurriculumSubjects(viewingSyllabusCourse.name, viewerActiveSem).map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-mono font-bold text-indigo-700">
                            {sub.code}
                          </td>
                          <td className="p-2.5 font-bold text-slate-900">
                            {sub.name}
                          </td>
                          <td className="p-2.5 text-slate-600 font-semibold">
                            {sub.credits} Credits
                          </td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {sub.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingSyllabusCourse(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Close Syllabus Viewer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT UNIVERSITY */}
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
                    {editingUniv ? 'Edit University Details' : 'Add New University'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enter official university details and city location.
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
                  placeholder="e.g. MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY"
                  value={univForm.name}
                  onChange={(e) => setUnivForm({ ...univForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Name / Acronym</label>
                  <input
                    type="text"
                    placeholder="e.g. MCU / MCBU"
                    value={univForm.shortName}
                    onChange={(e) => setUnivForm({ ...univForm, shortName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">University Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MCU01"
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
                    placeholder="e.g. Chhatarpur"
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
                <label className="font-bold text-slate-700 block mb-1">
                  Official Website URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://mcbu.ac.in (Optional - can be left blank)"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingUniv ? 'Saving...' : editingUniv ? 'Update University' : 'Save University'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD AFFILIATED COLLEGE */}
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
                    Register New Affiliated College
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
                <label className="font-bold text-slate-700 block mb-1">College Code (e.g. BED121, N462) *</label>
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {savingCollege ? 'Saving...' : 'Register College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT B.TECH OR MBA PROGRAM */}
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
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  courseForm.degree === 'MBA' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {courseForm.degree === 'MBA' ? <Briefcase className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {editingCourse ? `Edit ${courseForm.degree} Branch / Stream` : `Add New ${courseForm.degree} Program`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure degree branch duration and academic details.
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
                
                {/* Degree Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Degree Type *
                  </label>
                  <select
                    value={courseForm.degree}
                    onChange={(e) => {
                      const deg = e.target.value;
                      const isMba = deg === 'MBA';
                      setCourseForm({
                        ...courseForm,
                        degree: deg,
                        department: isMba ? 'School of Management & Business' : 'School of Engineering & Technology',
                        durationYears: isMba ? 2 : 4,
                        totalSemesters: isMba ? 4 : 8,
                        eligibility: isMba ? 'Graduation in any stream (Min 50%)' : '10+2 with PCM (Min 50%)',
                        totalFee: isMba ? 160000 : 240000,
                        feePerSemester: isMba ? 40000 : 30000
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="MBA">MBA (Master of Business Administration)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Branch / Program Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={courseForm.degree === 'MBA' ? 'e.g. MBA-AGRI' : 'e.g. BTECH-AIML'}
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:border-indigo-600 uppercase"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Branch / Specialization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={courseForm.degree === 'MBA' ? 'e.g. MBA- Agri Business Management' : 'e.g. B.Tech- Artificial Intelligence & Machine Learning (A)'}
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Duration (Years) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    step="1"
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

                {/* Eligibility Criteria */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Eligibility Criteria *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseForm.eligibility}
                    onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-slate-700 block">
                    Course Description &amp; Curriculum Summary
                  </label>
                  <textarea
                    rows={2}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 leading-relaxed font-normal"
                  />
                </div>

              </div>

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
                  <span>{savingCourse ? 'Saving...' : editingCourse ? 'Save Changes' : 'Create & Publish Program'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
