import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'database.json');

const INITIAL_DATA = {
  settings: {
    resultPortalActive: false,
    academicSession: '2026-27',
    announcementNotice: 'Semester Examination Results 2026-27 are currently under evaluation.'
  },
  users: [
    { username: 'admin', password: 'admin123', role: 'admin', name: 'University Registrar' },
    { username: 'accounts', password: 'accounts123', role: 'accountant', name: 'Chief Accounts Officer' }
  ],
  entrance_exams: [
    {
      id: 'ent-101',
      appNo: 'APEX-ENT-2026-01',
      candidateName: 'Vikas Kushwaha',
      appliedCourse: 'B.Tech Computer Science & Engineering',
      entranceScore: 88,
      maxScore: 100,
      meritRank: 4,
      status: 'Qualified / Selected for Admission',
      examDate: '2026-06-20'
    },
    {
      id: 'ent-102',
      appNo: 'APEX-ENT-2026-02',
      candidateName: 'Anjali Sharma',
      appliedCourse: 'Bachelor of Computer Applications (BCA)',
      entranceScore: 79,
      maxScore: 100,
      meritRank: 12,
      status: 'Qualified / Selected for Admission',
      examDate: '2026-06-20'
    },
    {
      id: 'ent-103',
      appNo: 'APEX-ENT-2026-03',
      candidateName: 'Rohan Mehra',
      appliedCourse: 'Bachelor of Business Administration (BBA)',
      entranceScore: 62,
      maxScore: 100,
      meritRank: 38,
      status: 'Waitlisted (Round 2)',
      examDate: '2026-06-20'
    }
  ],
  courses: [
    {
      id: "btech-cse",
      name: "B.Tech Computer Science & Engineering",
      code: "BTECH-CSE",
      department: "School of Engineering & Technology",
      durationYears: 4,
      totalSemesters: 8,
      totalFee: 320000,
      feePerSemester: 0,
      eligibility: "10+2 with Physics, Chemistry, Math (Min 60%)",
      description: "Comprehensive 4-year engineering program covering AI, Cloud Computing, Full Stack Development, DSA and Operating Systems.",
      subjectsBySemester: {
        "1": [
          { code: "CS101", name: "Engineering Mathematics-I", maxTheory: 70, maxPractical: 30 },
          { code: "CS102", name: "Programming in C & Data Structures", maxTheory: 70, maxPractical: 30 },
          { code: "CS103", name: "Engineering Physics", maxTheory: 70, maxPractical: 30 },
          { code: "CS104", name: "Basic Electrical & Electronics", maxTheory: 70, maxPractical: 30 },
          { code: "CS105", name: "Environmental Science", maxTheory: 70, maxPractical: 30 }
        ],
        "2": [
          { code: "CS201", name: "Engineering Mathematics-II", maxTheory: 70, maxPractical: 30 },
          { code: "CS202", name: "Object Oriented Programming (Java)", maxTheory: 70, maxPractical: 30 },
          { code: "CS203", name: "Digital Logic & Computer Design", maxTheory: 70, maxPractical: 30 },
          { code: "CS204", name: "Data Communication & Networks", maxTheory: 70, maxPractical: 30 },
          { code: "CS205", name: "Communication Skills & Soft Skills", maxTheory: 70, maxPractical: 30 }
        ]
      }
    },
    {
      id: "bca",
      name: "Bachelor of Computer Applications (BCA)",
      code: "BCA",
      department: "School of Computing & IT",
      durationYears: 3,
      totalSemesters: 6,
      totalFee: 180000,
      feePerSemester: 0,
      eligibility: "10+2 in any stream with Math/Computer (Min 50%)",
      description: "Practical and application-oriented software engineering program focusing on Web Development, Databases, Mobile App and Python.",
      subjectsBySemester: {
        "1": [
          { code: "BCA101", name: "Fundamentals of Computer & IT", maxTheory: 70, maxPractical: 30 },
          { code: "BCA102", name: "Programming in C", maxTheory: 70, maxPractical: 30 },
          { code: "BCA103", name: "Mathematical Foundation of CS", maxTheory: 70, maxPractical: 30 },
          { code: "BCA104", name: "Digital Electronics", maxTheory: 70, maxPractical: 30 }
        ],
        "2": [
          { code: "BCA201", name: "Data Structures Using C++", maxTheory: 70, maxPractical: 30 },
          { code: "BCA202", name: "Web Technologies & HTML/CSS/JS", maxTheory: 70, maxPractical: 30 },
          { code: "BCA203", name: "Discrete Mathematics", maxTheory: 70, maxPractical: 30 },
          { code: "BCA204", name: "Database Systems with SQL", maxTheory: 70, maxPractical: 30 }
        ]
      }
    },
    {
      id: "bba",
      name: "Bachelor of Business Administration (BBA)",
      code: "BBA",
      department: "School of Management Studies",
      durationYears: 3,
      totalSemesters: 6,
      totalFee: 150000,
      feePerSemester: 0,
      eligibility: "10+2 in any stream (Min 50%)",
      description: "Leadership, Marketing, Business Analytics, Human Resources, and Corporate Finance management program.",
      subjectsBySemester: {
        "1": [
          { code: "BBA101", name: "Principles of Management", maxTheory: 70, maxPractical: 30 },
          { code: "BBA102", name: "Business Economics", maxTheory: 70, maxPractical: 30 },
          { code: "BBA103", name: "Financial Accounting", maxTheory: 70, maxPractical: 30 },
          { code: "BBA104", name: "Business Communication", maxTheory: 70, maxPractical: 30 }
        ]
      }
    },
    {
      id: "mba",
      name: "Master of Business Administration (MBA)",
      code: "MBA",
      department: "School of Management Studies",
      durationYears: 2,
      totalSemesters: 4,
      totalFee: 240000,
      feePerSemester: 0,
      eligibility: "Graduation in any stream (Min 50%) + Entrance Score",
      description: "Postgraduate degree in Global Business Strategy, Fintech, Digital Marketing, and Operations.",
      subjectsBySemester: {
        "1": [
          { code: "MBA101", name: "Managerial Economics", maxTheory: 70, maxPractical: 30 },
          { code: "MBA102", name: "Financial Management", maxTheory: 70, maxPractical: 30 },
          { code: "MBA103", name: "Marketing Management", maxTheory: 70, maxPractical: 30 },
          { code: "MBA104", name: "Human Resource Strategy", maxTheory: 70, maxPractical: 30 }
        ]
      }
    },
    {
      id: "bsc-ds",
      name: "B.Sc (Hons) Data Science & AI",
      code: "BSC-DS",
      department: "School of Computing & IT",
      durationYears: 3,
      totalSemesters: 6,
      totalFee: 210000,
      feePerSemester: 0,
      eligibility: "10+2 with Mathematics / Statistics (Min 55%)",
      description: "Modern curriculum on Machine Learning, Big Data, Data Visualisation, Python, and Predictive Analytics.",
      subjectsBySemester: {
        "1": [
          { code: "DS101", name: "Introduction to Data Science & Python", maxTheory: 70, maxPractical: 30 },
          { code: "DS102", name: "Applied Linear Algebra", maxTheory: 70, maxPractical: 30 },
          { code: "DS103", name: "Probability & Descriptive Statistics", maxTheory: 70, maxPractical: 30 },
          { code: "DS104", name: "Data Structures & Algorithms", maxTheory: 70, maxPractical: 30 }
        ]
      }
    }
  ],
  students: [],
  fee_payments: [],
  results: []
};

export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
    console.log('Database initialized with default sample data.');
  }
}

export function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data.settings) {
      data.settings = { resultPortalActive: false, academicSession: '2026-27' };
    }
    if (!data.users) {
      data.users = [
        { username: 'admin', password: 'admin123', role: 'admin', name: 'University Registrar' },
        { username: 'accounts', password: 'accounts123', role: 'accountant', name: 'Chief Accounts Officer' }
      ];
    }
    if (!data.entrance_exams) {
      data.entrance_exams = [];
    }
    if (!data.testimonials) {
      data.testimonials = [
        {
          id: 'tst-1',
          title: '100% Placement & Practical Learning',
          studentName: 'Rahul Vishwakarma',
          course: 'Bachelor of Computer Applications (BCA)',
          review: 'PKC Institute helped me secure admission and prepare for IT placements with top software companies. The lab guidance, live web projects, and exam support were exceptional!',
          badge: 'Placed at TCS (₹4.2 LPA)',
          imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        },
        {
          id: 'tst-2',
          title: 'Best Counseling for Master Degrees',
          studentName: 'Pooja Tiwari',
          course: 'Master of Business Administration (MBA)',
          review: 'From university selection to scholarship forms (MPTASS) and semester syllabus guidance, the PKC team gave full support throughout my 2-year MBA program.',
          badge: 'University Merit Holder',
          imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        },
        {
          id: 'tst-3',
          title: 'Empowering District & Rural Students',
          studentName: 'Amit Sen',
          course: 'Diploma in Computer Applications (DCA)',
          review: 'PKC Chhatarpur is the most trusted institute for computer education. The practical computer classes helped me crack the CPCT exam and get a government computer operator job.',
          badge: 'Govt Certified IT Diploma',
          imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        },
        {
          id: 'tst-4',
          title: 'Engineering Dreams Turned Reality',
          studentName: 'Priya Kushwaha',
          course: 'B.Tech - Computer Science & Engineering',
          review: 'Securing an engineering seat with full government scholarship guidance was made simple by Er. P.K. Chaurasia sir. Today I am working as a Software Engineer at Infosys.',
          badge: 'Software Engineer at Infosys (₹5.5 LPA)',
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        },
        {
          id: 'tst-5',
          title: '100% Scholarship Benefit Support',
          studentName: 'Deepak Ahirwar',
          course: 'B.Sc (Hons) Computer Science',
          review: 'I received complete fee scholarship support via MPTASS portal without paying a single extra rupee. Excellent teachers, exam guidance, and official university degrees.',
          badge: '100% MPTASS Scholarship Scholar',
          imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        },
        {
          id: 'tst-6',
          title: 'Professional Growth & IT Career',
          studentName: 'Neha Sharma',
          course: 'Post Graduate Diploma in Computer Applications (PGDCA)',
          review: 'After graduation, I enrolled in PGDCA at PKC. The faculty provided great coaching in Tally, Database, and Office Automation which helped me secure a Banking Specialist role.',
          badge: 'Banking & IT Specialist',
          imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80',
          rating: 5,
          active: true
        }
      ];
    }
    if (!data.about) {
      data.about = {
        establishedYear: 2011,
        yearsOfExcellence: 15,
        totalStudentsGuided: 18500,
        totalAffiliations: 28,
        placementRate: '95%',
        tagline: 'Leading Higher Education & Career Consultancy in Central India',
        mission: 'To empower students across Madhya Pradesh with accessible, certified, and transparent university degrees, technical diplomas, and job-oriented skill training.',
        history: 'PKC Education Learning Institute & Consultancy was established in 2011 in Chhatarpur (M.P.) with a vision to guide youth towards authorized degrees and employment. Over 15 years, we have assisted more than 18,500 students in undergraduate, postgraduate, and diploma admissions.',
        directorName: 'Er. P.K. Chaurasia',
        services: [
          'University Degree Admissions & Guidance (BCA, MBA, B.Tech, B.Sc, B.Com)',
          'MP Govt Recognized Computer Diplomas (DCA, PGDCA, CPCT)',
          'State & Central Scholarship Assistance (MPTASS & NSP)',
          'Official Syllabus, Study Scheme & Exam Form Support',
          'Career Counseling & Placement Desk'
        ]
      };
    }
    if (!data.inquiries) {
      data.inquiries = [];
    }
    if (!data.event_photos) {
      data.event_photos = [
        {
          id: 'evt-1',
          title: 'Annual Convocation & Degree Distribution Ceremony',
          titleHi: 'वार्षिक दीक्षांत एवं उपाधि वितरण समारोह',
          category: 'Convocation 2024',
          date: '2024',
          description: 'Proud PKC students receiving authorized UGC university degrees, marksheets, and honors.',
          imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
          active: true
        },
        {
          id: 'evt-2',
          title: 'State Merit Felicitation & Scholarship Awards',
          titleHi: 'मेधावी छात्र अलंकरण एवं छात्रवृत्ति सम्मान',
          category: 'Merit Awards',
          date: '2024',
          description: 'Felicitation of top-ranking academic achievers with medals, mementos, and scholarship checks.',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
          active: true
        },
        {
          id: 'evt-3',
          title: 'Annual Cultural Festival & Youth Showcase',
          titleHi: 'वार्षिक युवा महोत्सव एवं सांस्कृतिक उत्सव',
          category: 'Cultural Fest',
          date: '2024',
          description: 'Celebrating youth talent, cultural performances, speech competitions, and artistic creativity.',
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
          active: true
        },
        {
          id: 'evt-4',
          title: 'Computer Lab Practical Workshop & Hands-on Training',
          titleHi: 'कंप्यूटर लैब प्रायोगिक प्रशिक्षण कार्यशाला',
          category: 'IT Lab Workshop',
          date: '2024',
          description: 'Dedicated practical lab sessions for DCA, PGDCA, CPCT, and Web Development students.',
          imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
          active: true
        },
        {
          id: 'evt-5',
          title: 'Campus Career Guidance & Counseling Desk',
          titleHi: 'कैरियर परामर्श एवं कॉरपोरेट मार्गदर्शन सत्र',
          category: 'Career Counseling',
          date: '2023-2024',
          description: 'Direct guidance from experienced counselors on government jobs, private sector careers, and higher education.',
          imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
          active: true
        }
      ];
    }
    if (!data.university_payments) {
      data.university_payments = [];
    }
    if (!data.university_course_fees) {
      data.university_course_fees = [
        {
          id: 'ucf-mcbu-ba',
          universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
          courseName: 'Bachelor of Arts (BA)',
          officialFee: 0,
          feePerSemester: 0,
          notes: 'Standard affiliated government/private college rate'
        },
        {
          id: 'ucf-mcbu-bca',
          universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
          courseName: 'Bachelor of Computer Applications (BCA)',
          officialFee: 0,
          feePerSemester: 0,
          notes: 'Annual composite university base fee'
        },
        {
          id: 'ucf-bu-bca',
          universityName: 'Barkatullah University',
          courseName: 'Bachelor of Computer Applications (BCA)',
          officialFee: 0,
          feePerSemester: 0,
          notes: 'Standard state university IT department rate'
        },
        {
          id: 'ucf-state-btech',
          universityName: 'State University',
          courseName: 'B.Tech Computer Science & Engineering',
          officialFee: 0,
          feePerSemester: 0,
          notes: 'Standard technical education department rate'
        }
      ];
    }
    if (data.students && Array.isArray(data.students)) {
      data.students.forEach(std => {
        if (!std.universityName) {
          std.universityName = 'Maharaja Chhatrasal Bundelkhand University (MCBU)';
        }
        if (!std.collegeName) {
          std.collegeName = 'Govt PG College Chhatarpur';
        }
        if (std.universityFee === undefined || std.universityFee === null) {
          // Standard base university fee (approx 40-50% of student package fee by default)
          std.universityFee = Number(std.universityFee) || 0;
        }
        if (std.universityPaid === undefined || std.universityPaid === null) {
          std.universityPaid = 0;
        }
        std.universityDue = Math.max(0, (Number(std.universityFee) || 0) - (Number(std.universityPaid) || 0));
      });
    }
    return data;
  } catch (err) {
    console.error('Error reading database file:', err);
    return INITIAL_DATA;
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    if (typeof global.__scheduleMongoSync === 'function') {
      global.__scheduleMongoSync(data);
    }
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
}
