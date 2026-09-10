import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  ArrowRight, 
  UserPlus, 
  CreditCard, 
  Building2, 
  FileText, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  HelpCircle,
  Download,
  FileSpreadsheet,
  ExternalLink,
  BookOpen,
  DollarSign,
  ChevronRight,
  Layers,
  Search
} from 'lucide-react';

// Default academic branches for instant fallback and rich previews
const ACADEMIC_BRANCHES_PRESET = [
  { degree: 'B.Tech', name: 'Artificial Intelligence & Machine Learning (A)', code: 'BTECH-AIML', semesters: 8, feePerSem: 35000, totalFee: 280000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Tech', name: 'Computer Science & Engineering (A)', code: 'BTECH-CSE-A', semesters: 8, feePerSem: 35000, totalFee: 280000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Tech', name: 'Data Science (A)', code: 'BTECH-DS', semesters: 8, feePerSem: 35000, totalFee: 280000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Tech', name: 'Electrical and Electronics Engineering', code: 'BTECH-EEE', semesters: 8, feePerSem: 30000, totalFee: 240000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Tech', name: 'Civil Engineering', code: 'BTECH-CIVIL', semesters: 8, feePerSem: 30000, totalFee: 240000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Tech', name: 'Mechanical Engineering (A)', code: 'BTECH-ME-A', semesters: 8, feePerSem: 30000, totalFee: 240000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'MBA', name: 'Agri Business Management', code: 'MBA-AGRI', semesters: 4, feePerSem: 35000, totalFee: 140000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'MBA', name: 'Banking Insurance', code: 'MBA-BANK', semesters: 4, feePerSem: 35000, totalFee: 140000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'MBA', name: 'Hospital Administration', code: 'MBA-HOSP', semesters: 4, feePerSem: 35000, totalFee: 140000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'MBA', name: 'IT Management', code: 'MBA-IT', semesters: 4, feePerSem: 35000, totalFee: 140000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.Ed', name: 'Teacher Education & Pedagogy', code: 'BED-EDU', semesters: 4, feePerSem: 25000, totalFee: 100000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'B.El.Ed', name: 'Elementary Education', code: 'BELED-01', semesters: 8, feePerSem: 25000, totalFee: 200000, univ: 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)' },
  { degree: 'BCA', name: 'Computer Applications & Software', code: 'BCA-CS', semesters: 6, feePerSem: 20000, totalFee: 120000, univ: 'Madhyanchal Professional University Bhopal' },
  { degree: 'BBA', name: 'Business Administration', code: 'BBA-GEN', semesters: 6, feePerSem: 20000, totalFee: 120000, univ: 'Madhyanchal Professional University Bhopal' }
];

export default function AIRobotAssistant({ 
  onNavigate, 
  activeView, 
  adminUser, 
  staffUser, 
  studentUser 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Cached data for ultra-fast conversational answers
  const [cachedStudents, setCachedStudents] = useState([]);
  const [cachedCourses, setCachedCourses] = useState([]);
  const [cachedUniversities, setCachedUniversities] = useState([]);

  // Loop & audio feedback locks
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const lastQueryTextRef = useRef('');
  const lastQueryTimeRef = useRef(0);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Message conversation history
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! Main aapka Real-Time University AI Copilot hoon. 🤖\nAap bolkar ya type karke mujhse direct koi bhi task karwa sakte hain:\n\n• "Madhyanchal University ke courses dikhao"\n• "Student ka excel nikal ke de do"\n• "Rahul ki fees kitni baki hai"\n• "Barkatullah University add karo"\n• "B.Tech AIML ka syllabus upload karna hai"\n• "Naye student ka admission form kholo"',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Pre-load data from API
  useEffect(() => {
    const preloadData = async () => {
      try {
        const [studRes, courseRes, univRes] = await Promise.allSettled([
          fetch('/api/students').then(r => r.json()),
          fetch('/api/courses').then(r => r.json()),
          fetch('/api/universities').then(r => r.json())
        ]);
        if (studRes.status === 'fulfilled' && studRes.value?.students) {
          setCachedStudents(studRes.value.students);
        }
        if (courseRes.status === 'fulfilled' && courseRes.value?.courses) {
          setCachedCourses(courseRes.value.courses);
        }
        if (univRes.status === 'fulfilled' && univRes.value?.universities) {
          setCachedUniversities(univRes.value.universities);
        }
      } catch (err) {
        console.warn('AI prefetch warning:', err);
      }
    };
    preloadData();
  }, []);

  // Initialize Web Speech Recognition with anti-loop protection
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'hi-IN'; // Hindi + Indian English / Hinglish

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        // 1. Immediately shut off recognition to prevent self-echo
        try {
          recognition.stop();
        } catch (e) {}
        setIsListening(false);

        // 2. Ignore if speech synthesis robot is currently talking
        if (isSpeakingRef.current) {
          return;
        }

        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          handleUserQuery(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  // Text-To-Speech (Robot speaks back safely without mic feedback)
  const speakVoice = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // 1. Force stop microphone before speaking!
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);

    try {
      window.speechSynthesis.cancel(); // Stop any ongoing speech
      isSpeakingRef.current = true;

      const cleanText = text
        .replace(/[•\*\#\_\`\~]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = 'hi-IN';

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onend = () => {
        isSpeakingRef.current = false;
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Text-to-speech error:', err);
      isSpeakingRef.current = false;
    }
  };

  // Toggle Voice Listening (Mic)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or type your request.');
      return;
    }

    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    if (isListening) {
      try { recognitionRef.current.stop(); } catch (e) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // --------------------------------------------------------------------------
  // ACTION HELPER 1: Excel CSV Generation & Direct Download
  // --------------------------------------------------------------------------
  const triggerStudentsExcelExport = async () => {
    try {
      let students = cachedStudents;
      if (!students || students.length === 0) {
        const res = await fetch('/api/students');
        const data = await res.json();
        students = data.students || [];
        setCachedStudents(students);
      }

      if (students.length === 0) {
        return {
          success: false,
          message: 'Abhi portal par koi registered student data nahi hai.'
        };
      }

      // Calculate totals
      let totalFees = 0;
      let totalPaid = 0;
      let totalDue = 0;

      const headers = [
        'S.No',
        'Roll No',
        'Student Full Name',
        'Father Name',
        'Mobile Number',
        'Email Address',
        'Course Enrolled',
        'Affiliated University',
        'College / Institute',
        'Admission Date',
        'Course Fee (INR)',
        'Admission Fee (INR)',
        'Total Fee (INR)',
        'Total Paid (INR)',
        'Due Balance (INR)',
        'Payment Mode',
        'Current Status'
      ];

      const csvRows = [];
      csvRows.push(headers.join(','));

      students.forEach((s, idx) => {
        const cFee = Number(s.courseFee || s.totalCourseFee || 0);
        const aFee = Number(s.admissionFee || 0);
        const tFee = Number(s.totalFee || (cFee + aFee));
        const paid = Number(s.totalFeePaid || s.paidAmount || 0);
        const due = Math.max(0, tFee - paid);

        totalFees += tFee;
        totalPaid += paid;
        totalDue += due;

        const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

        const row = [
          idx + 1,
          escapeCsv(s.rollNo),
          escapeCsv(s.fullName),
          escapeCsv(s.fatherName),
          escapeCsv(s.phone || s.mobile),
          escapeCsv(s.email),
          escapeCsv(s.courseName),
          escapeCsv(s.universityName || 'Madhyanchal Professional University'),
          escapeCsv(s.collegeName || 'School of Engineering & Technology'),
          escapeCsv(s.admissionDate || s.createdAt || new Date().toISOString().split('T')[0]),
          cFFeeToNum(cFee),
          cFFeeToNum(aFee),
          cFFeeToNum(tFee),
          cFFeeToNum(paid),
          cFFeeToNum(due),
          escapeCsv(s.paymentMode || 'Cash/UPI'),
          escapeCsv(due === 0 ? 'Fully Paid' : 'Fee Due')
        ];

        csvRows.push(row.join(','));
      });

      // UTF-8 BOM for crystal-clear Hindi and Unicode characters in Microsoft Excel
      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.setAttribute('download', `PKC_Students_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      return {
        success: true,
        count: students.length,
        totalPaid,
        totalDue,
        totalFees
      };
    } catch (err) {
      console.error('Excel Export Error:', err);
      return { success: false, message: err.message };
    }
  };

  const cFFeeToNum = (n) => isNaN(n) ? 0 : Number(n);

  // --------------------------------------------------------------------------
  // Process and Execute Natural Language Intent
  // --------------------------------------------------------------------------
  const handleUserQuery = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    // Debounce identical queries within 2.5 seconds
    const now = Date.now();
    const cleanQuery = queryText.trim().toLowerCase();
    if (
      lastQueryTextRef.current === cleanQuery && 
      now - lastQueryTimeRef.current < 2500
    ) {
      return;
    }
    lastQueryTextRef.current = cleanQuery;
    lastQueryTimeRef.current = now;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    const q = cleanQuery;
    let botReplyText = '';
    let customCard = null;

    // =========================================================================
    // INTENT 1: EXCEL REPORT DOWNLOAD ("student ka excel nikal ke de do")
    // =========================================================================
    if (
      (q.includes('excel') || q.includes('sheet') || q.includes('export') || q.includes('csv') || q.includes('nikal')) &&
      (q.includes('student') || q.includes('bache') || q.includes('ledger') || q.includes('data') || q.includes('list'))
    ) {
      const exportResult = await triggerStudentsExcelExport();

      if (exportResult.success) {
        botReplyText = `Ji! Maine sabhi ${exportResult.count} students ki master Excel CSV sheet download kar di hai. Isme roll number, course, admission date aur total fees ledger details shamil hain.`;
        customCard = {
          type: 'excel_download',
          fileName: `PKC_Students_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`,
          count: exportResult.count,
          totalPaid: exportResult.totalPaid,
          totalDue: exportResult.totalDue,
          onReDownload: triggerStudentsExcelExport
        };
      } else {
        botReplyText = `Excel export me samasya aayi: ${exportResult.message || 'Data uplabdh nahi hai.'}`;
      }
    }

    // =========================================================================
    // INTENT 2: UNIVERSITY COURSES SHOWCASE ("MPU ke course dikhao", "Madhyanchal courses", "B.Tech courses")
    // =========================================================================
    else if (
      (q.includes('course') || q.includes('courses') || q.includes('program') || q.includes('branch')) &&
      (q.includes('mpu') || q.includes('madhyanchal') || q.includes('mcbu') || q.includes('chhatrasal') || q.includes('university') || q.includes('btech') || q.includes('b.tech') || q.includes('mba') || q.includes('dikhao') || q.includes('dekhna'))
    ) {
      let filterDegree = null;
      if (q.includes('btech') || q.includes('b.tech') || q.includes('engineering')) filterDegree = 'B.Tech';
      else if (q.includes('mba') || q.includes('management')) filterDegree = 'MBA';
      else if (q.includes('bed') || q.includes('b.ed')) filterDegree = 'B.Ed';
      else if (q.includes('bca')) filterDegree = 'BCA';
      else if (q.includes('bba')) filterDegree = 'BBA';

      let matchedCourses = ACADEMIC_BRANCHES_PRESET;
      if (filterDegree) {
        matchedCourses = ACADEMIC_BRANCHES_PRESET.filter(c => c.degree === filterDegree);
      }

      if (q.includes('mcbu') || q.includes('chhatrasal')) {
        matchedCourses = ACADEMIC_BRANCHES_PRESET.filter(c => c.univ.includes('CHHATRASAL'));
      } else if (q.includes('mpu') || q.includes('madhyanchal')) {
        matchedCourses = ACADEMIC_BRANCHES_PRESET.filter(c => c.univ.includes('Madhyanchal'));
      }

      botReplyText = `Ji! Main screen par courses dikha raha hoon. Total ${matchedCourses.length} programs listed hain. Aap kisi bhi course par click karke direct admission form ya syllabus dekh sakte hain.`;
      
      customCard = {
        type: 'courses_showcase',
        courses: matchedCourses.slice(0, 6),
        totalCount: matchedCourses.length,
        onSelectCourse: (course) => {
          if (staffUser && !adminUser) {
            if (onNavigate) onNavigate('staff', '/staff');
          } else {
            if (onNavigate) onNavigate('admin', '/admin');
          }
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('ai-action', { 
              detail: { 
                type: 'open-admission', 
                courseCode: course.code, 
                courseName: course.name 
              } 
            }));
          }, 350);
        }
      };
    }

    // =========================================================================
    // INTENT 3: ADD UNIVERSITY AUTOMATION ("Barkatullah University add karo", "Add university")
    // =========================================================================
    else if (
      (q.includes('university') && (q.includes('add') || q.includes('create') || q.includes('banao') || q.includes('nayi') || q.includes('daalo'))) ||
      q.includes('add university') ||
      q.includes('create university')
    ) {
      // Extract university name if provided in prompt
      let univName = '';
      const addMatch = queryText.match(/(?:add|create|banao|nayi)?\s*(?:university)?\s*([a-zA-Z\s]{4,40})(?:\s*university|\s*add|\s*karo)?/i);
      if (addMatch && addMatch[1] && !addMatch[1].toLowerCase().includes('create') && !addMatch[1].toLowerCase().includes('karna')) {
        univName = addMatch[1].trim();
        if (!univName.toLowerCase().includes('university')) {
          univName += ' University';
        }
      }

      botReplyText = univName 
        ? `Academic Hub me "${univName}" add karne ka form pre-fill karke open kar diya gaya hai!`
        : `Academic Hub me "Add New University" ka form open kar diya gaya hai! Yahan aap University ka naam, code aur details save kar sakte hain.`;

      if (onNavigate) {
        onNavigate('admin', '/admin');
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { 
          detail: { 
            type: 'open-add-university',
            name: univName || '',
            city: 'Bhopal',
            state: 'Madhya Pradesh'
          } 
        }));
      }, 400);

      customCard = {
        type: 'action_success',
        title: '🏛️ Add University Form Opened',
        desc: univName ? `Pre-filled: ${univName}` : 'Fill in university details on Admin Screen',
        actionLabel: 'Go to Academic Hub',
        action: () => onNavigate && onNavigate('admin', '/admin')
      };
    }

    // =========================================================================
    // INTENT 4: ADD COLLEGE UNDER UNIVERSITY ("MPU ke under college add karna")
    // =========================================================================
    else if (
      (q.includes('college') && (q.includes('add') || q.includes('create') || q.includes('under') || q.includes('affiliated'))) ||
      q.includes('add college')
    ) {
      let targetUniv = 'Madhyanchal Professional University Bhopal';
      let univId = 'univ-mpu';
      if (q.includes('mcbu') || q.includes('chhatrasal')) {
        targetUniv = 'MAHARAJA CHHATRASAL BUNDELKHAND UNIVERSITY (MCU)';
        univId = 'univ-mcbu';
      }

      botReplyText = `Affiliated Colleges desk open ho gaya hai aur "${targetUniv}" ke antargat naya college add karne ka form khol diya gaya hai.`;

      if (onNavigate) {
        onNavigate('admin', '/admin');
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { 
          detail: { 
            type: 'open-add-college',
            universityId: univId,
            univName: targetUniv
          } 
        }));
      }, 400);

      customCard = {
        type: 'action_success',
        title: '🏫 Add College Form Opened',
        desc: `Under: ${targetUniv}`,
        actionLabel: 'Manage Colleges',
        action: () => onNavigate && onNavigate('admin', '/admin')
      };
    }

    // =========================================================================
    // INTENT 5: UPLOAD SYLLABUS & BRANCH SELECT ("Syllabus upload karna hai", "B.Tech syllabus")
    // =========================================================================
    else if (
      q.includes('syllabus') || 
      q.includes('pdf upload') || 
      q.includes('excel upload') ||
      (q.includes('branch') && q.includes('upload'))
    ) {
      let targetBranchCode = 'BTECH-AIML';
      let branchName = 'B.Tech AI & ML';
      if (q.includes('cse') || q.includes('computer')) {
        targetBranchCode = 'BTECH-CSE-A';
        branchName = 'B.Tech CSE Section A';
      } else if (q.includes('data science')) {
        targetBranchCode = 'BTECH-DS';
        branchName = 'B.Tech Data Science';
      } else if (q.includes('civil')) {
        targetBranchCode = 'BTECH-CIVIL';
        branchName = 'B.Tech Civil';
      } else if (q.includes('mba')) {
        targetBranchCode = 'MBA-AGRI';
        branchName = 'MBA Agri Business';
      }

      botReplyText = `Upload Syllabus section open ho gaya hai! University, College aur branch (${branchName}) pre-select kar di gayi hai. Bas aap PDF ya Excel file select karke upload kar dein.`;

      if (onNavigate) {
        onNavigate('admin', '/admin');
      }

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { 
          detail: { 
            type: 'prefill-upload-syllabus',
            universityId: 'univ-mpu',
            branchCode: targetBranchCode,
            semester: '1'
          } 
        }));
      }, 400);

      customCard = {
        type: 'action_success',
        title: '📂 Syllabus Upload Desk Ready',
        desc: `Target Branch: ${branchName} (Sem 1)`,
        actionLabel: 'Attach File',
        action: () => onNavigate && onNavigate('admin', '/admin')
      };
    }

    // =========================================================================
    // INTENT 6: SPECIFIC STUDENT FEE / LEDGER SEARCH ("Rahul ki fees", "Aman ka balance")
    // =========================================================================
    else if (
      (q.includes('fee') || q.includes('fees') || q.includes('paisa') || q.includes('balance') || q.includes('baki')) &&
      !q.includes('check fees') &&
      !q.includes('kist')
    ) {
      // Check if user named a student
      let matchedStudent = null;
      const students = cachedStudents;

      if (students && students.length > 0) {
        const words = q.split(/\s+/);
        for (const w of words) {
          if (w.length > 2 && !['fees', 'fee', 'ki', 'ka', 'kitni', 'kitna', 'baki', 'hai', 'dekhna', 'batao'].includes(w)) {
            matchedStudent = students.find(s => 
              (s.fullName || '').toLowerCase().includes(w) || 
              (s.rollNo || '').toLowerCase().includes(w)
            );
            if (matchedStudent) break;
          }
        }
      }

      if (matchedStudent) {
        const cFee = Number(matchedStudent.courseFee || matchedStudent.totalCourseFee || 0);
        const aFee = Number(matchedStudent.admissionFee || 0);
        const total = Number(matchedStudent.totalFee || (cFee + aFee));
        const paid = Number(matchedStudent.totalFeePaid || matchedStudent.paidAmount || 0);
        const due = Math.max(0, total - paid);

        botReplyText = `${matchedStudent.fullName} (${matchedStudent.rollNo}) ki total fees ₹${total.toLocaleString('en-IN')} hai. Abhi tak ₹${paid.toLocaleString('en-IN')} jama hue hain aur ₹${due.toLocaleString('en-IN')} baki hain.`;
        
        customCard = {
          type: 'student_fee_card',
          student: matchedStudent,
          total,
          paid,
          due,
          onCollectFee: () => {
            if (staffUser && !adminUser) {
              if (onNavigate) onNavigate('staff', '/staff');
            } else {
              if (onNavigate) onNavigate('admin', '/admin');
            }
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('ai-action', { 
                detail: { type: 'focus-fees', rollNo: matchedStudent.rollNo } 
              }));
            }, 350);
          }
        };
      } else {
        // General fees desk navigation
        botReplyText = 'Ji! Main aapko Student Fees & Collection Desk par le chal raha hoon, jahan sabhi students ki Course Fee, Admission Fee aur Balances listed hain.';
        if (staffUser && !adminUser) {
          if (onNavigate) onNavigate('staff', '/staff');
        } else {
          if (onNavigate) onNavigate('admin', '/admin');
        }
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'focus-fees' } }));
        }, 350);
      }
    }

    // =========================================================================
    // INTENT 7: GENERAL STUDENT FEES / COLLECTION DESK
    // =========================================================================
    else if (
      q.includes('fee') || 
      q.includes('fees') || 
      q.includes('collection') || 
      q.includes('kist') || 
      q.includes('ledger')
    ) {
      botReplyText = 'Ji! Main aapko Student Fees & Collection Desk par le chal raha hoon, jahan aap Course Fee, Admission Fee aur Balances check kar sakte hain.';
      
      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'focus-fees' } }));
      }, 350);
    }

    // =========================================================================
    // INTENT 8: NEW ADMISSION FORM ("Naye student ka admission karna hai")
    // =========================================================================
    else if (
      q.includes('admission') || 
      q.includes('enroll') || 
      q.includes('register') || 
      q.includes('dakhila') || 
      q.includes('naya student') || 
      q.includes('naye student')
    ) {
      botReplyText = 'Sure! New Student Admission Form open kar diya gaya hai. Yahan candidate ki personal details, photo, aur Course + Admission fee fill kar sakte hain.';
      
      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'open-admission' } }));
      }, 350);
    }

    // =========================================================================
    // INTENT 9: TOTAL STUDENTS COUNT / STATS
    // =========================================================================
    else if (
      q.includes('kitne student') || 
      q.includes('total student') || 
      q.includes('count') || 
      q.includes('stats') || 
      q.includes('kitne bache') ||
      q.includes('students count')
    ) {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        const students = data.students || cachedStudents || [];
        const count = students.length;

        let totalColl = 0;
        let totalDues = 0;
        students.forEach(s => {
          const c = Number(s.courseFee || s.totalCourseFee || 0);
          const a = Number(s.admissionFee || 0);
          const t = Number(s.totalFee || (c + a));
          const p = Number(s.totalFeePaid || s.paidAmount || 0);
          totalColl += p;
          totalDues += Math.max(0, t - p);
        });

        botReplyText = `Portal par abhi kul ${count} students successfully registered hain. Total fee collection ₹${totalColl.toLocaleString('en-IN')} hai aur pending balance ₹${totalDues.toLocaleString('en-IN')} hai.`;
        
        customCard = {
          type: 'stats_card',
          count,
          totalColl,
          totalDues,
          onDownloadExcel: triggerStudentsExcelExport
        };
      } catch {
        botReplyText = 'Portal par student records live database me stored hain. Main aapko Student Directory par le chalta hoon.';
      }

      if (staffUser && !adminUser) {
        if (onNavigate) onNavigate('staff', '/staff');
      } else {
        if (onNavigate) onNavigate('admin', '/admin');
      }
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-action', { detail: { type: 'focus-students' } }));
      }, 350);
    }

    // =========================================================================
    // INTENT 10: HELP / COMMANDS
    // =========================================================================
    else if (
      q.includes('help') || 
      q.includes('kya kar sakte ho') || 
      q.includes('kaise') || 
      q.includes('command')
    ) {
      botReplyText = 'Main aapka Real-Time University AI Copilot hoon! Main ye sab execute kar sakta hoon:\n\n1. 📊 "Student ka excel nikal ke de do" ➔ Direct Excel file download\n2. 🏛️ "Madhyanchal University ke courses dikhao" ➔ Interactive course list with fee & admission\n3. 🏛️ "[XYZ] University add karo" ➔ Academic Hub me University form kholna\n4. 🏫 "University ke under college add karo" ➔ Affiliated college form kholna\n5. 📂 "B.Tech AIML ka syllabus upload karna hai" ➔ Pre-selected upload desk\n6. 💰 "[Student Name] ki fees check karo" ➔ Exact paid & balance ledger\n\nAap bas mic daba kar boliye ya niche kisi chip par tap karein!';
    }

    // =========================================================================
    // FALLBACK
    // =========================================================================
    else {
      botReplyText = `Maine aapka command samjha: "${queryText}". Aap mujhe bataiye:\n• University ke courses dekhna chahte hain?\n• Student ka Excel sheet download karna hai?\n• Nayi University ya College add karna hai?\n• Kisi student ki fees check karni hai?`;
    }

    setIsThinking(false);

    const botMsg = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botReplyText,
      customCard,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMsg]);

    // Speak audio reply
    speakVoice(botReplyText);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      handleUserQuery(inputQuery);
    }
  };

  const handleQuickChip = (chipText) => {
    handleUserQuery(chipText);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING ROBOT TRIGGER BUTTON (Fixed at Bottom-Right) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 no-print font-sans">
        
        {/* Floating Tooltip if Closed */}
        {!isOpen && (
          <div 
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xl border border-amber-400/50 cursor-pointer animate-bounce select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>AI Voice Copilot</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-400/30">
              Active
            </span>
          </div>
        )}

        {/* The Animated Floating Robot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 text-white rotate-90 scale-95' 
              : 'bg-gradient-to-tr from-indigo-900 via-[#071530] to-indigo-700 text-white hover:scale-105 border-2 border-amber-400 shadow-indigo-900/50'
          }`}
          title="Open AI Robot Assistant"
        >
          {/* Animated Pulse Rings when Idle */}
          {!isOpen && (
            <>
              <span className="absolute -inset-1.5 rounded-full bg-amber-400/20 animate-ping"></span>
              <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-amber-400 to-indigo-500 opacity-60 blur-xs"></span>
            </>
          )}

          {/* Button Icon */}
          <div className="relative z-10 flex items-center justify-center">
            {isOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <div className="relative flex items-center justify-center">
                <Bot className="w-8 h-8 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#071530] rounded-full"></span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXPANDABLE AI ROBOT COPILOT DIALOGUE WINDOW */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[450px] max-h-[85vh] bg-[#071530] text-slate-100 rounded-3xl shadow-2xl border border-indigo-900/80 flex flex-col overflow-hidden backdrop-blur-xl animate-fadeIn font-sans">
          
          {/* Header Bar */}
          <div className="bg-slate-900/90 px-4 sm:px-5 py-3.5 border-b border-indigo-900/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 flex items-center justify-center shadow-md shrink-0">
                <div className="w-full h-full bg-[#071530] rounded-2xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white tracking-tight">
                    PKC University AI Copilot
                  </h3>
                  <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                    AUTOMATION
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Voice & Command Powered Academic Assistant
                </p>
              </div>
            </div>

            {/* Top Controls: Voice Mute & Close */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                  voiceEnabled ? 'text-amber-400 hover:bg-white/10' : 'text-slate-500 hover:bg-white/10'
                }`}
                title={voiceEnabled ? 'Mute Voice Speech' : 'Enable Voice Speech'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips (1-Tap Automation) */}
          <div className="bg-slate-950/70 px-3 py-2 border-b border-indigo-950/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            <button
              onClick={() => handleQuickChip('Student ka excel nikal ke de do')}
              className="flex items-center gap-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-emerald-500/40"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
              <span>📊 Download Student Excel</span>
            </button>

            <button
              onClick={() => handleQuickChip('Madhyanchal University ke courses dikhao')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>🏛️ MPU Courses</span>
            </button>

            <button
              onClick={() => handleQuickChip('B.Tech courses dikhao')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <GraduationCap className="w-3 h-3 text-cyan-400" />
              <span>🎓 B.Tech Branches</span>
            </button>

            <button
              onClick={() => handleQuickChip('MBA courses dikhao')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <BookOpen className="w-3 h-3 text-purple-400" />
              <span>💼 MBA Streams</span>
            </button>

            <button
              onClick={() => handleQuickChip('University create karna hai')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <Building2 className="w-3 h-3 text-indigo-400" />
              <span>➕ Add University</span>
            </button>

            <button
              onClick={() => handleQuickChip('University ke under college add karna hai')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <Layers className="w-3 h-3 text-rose-400" />
              <span>🏫 Add College</span>
            </button>

            <button
              onClick={() => handleQuickChip('Students ki fees check karo')}
              className="flex items-center gap-1 bg-white/10 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer border border-white/10"
            >
              <CreditCard className="w-3 h-3 text-emerald-400" />
              <span>💰 Check Fees</span>
            </button>
          </div>

          {/* Conversation Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md'
                    : 'bg-white/10 border border-white/10 text-slate-200 rounded-bl-none shadow-md'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* ------------------------------------------------------------- */}
                  {/* RICH CARD 1: EXCEL DOWNLOAD CARD */}
                  {/* ------------------------------------------------------------- */}
                  {msg.customCard?.type === 'excel_download' && (
                    <div className="bg-emerald-950/70 border border-emerald-500/40 p-3 rounded-2xl space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-[11px]">{msg.customCard.fileName}</h4>
                          <p className="text-[10px] text-emerald-300">
                            {msg.customCard.count} Students Enrolled • Verified Master Ledger
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-emerald-500/20 text-[10px]">
                        <div className="bg-black/20 p-1.5 rounded-lg">
                          <span className="text-slate-400 block">Total Fee Collected</span>
                          <strong className="text-emerald-400 font-bold">₹{msg.customCard.totalPaid?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="bg-black/20 p-1.5 rounded-lg">
                          <span className="text-slate-400 block">Pending Due Balance</span>
                          <strong className="text-amber-400 font-bold">₹{msg.customCard.totalDue?.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      <button
                        onClick={msg.customCard.onReDownload}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Excel (CSV) Again</span>
                      </button>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* RICH CARD 2: COURSES SHOWCASE LIST */}
                  {/* ------------------------------------------------------------- */}
                  {msg.customCard?.type === 'courses_showcase' && (
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                        <span>Available Programs ({msg.customCard.totalCount}):</span>
                        <span className="text-[10px] text-slate-400 font-normal">Click course to enroll</span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {msg.customCard.courses.map((course) => (
                          <div 
                            key={course.code}
                            className="bg-slate-900/80 border border-white/10 hover:border-amber-400/50 p-2.5 rounded-xl transition-all space-y-1.5 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                  course.degree === 'B.Tech' 
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : course.degree === 'MBA'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {course.degree}
                                </span>
                                <h5 className="font-bold text-white text-[11px] mt-0.5 group-hover:text-amber-300 transition-colors">
                                  {course.name}
                                </h5>
                                <p className="text-[9px] text-slate-400">
                                  {course.univ}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                              <span className="text-slate-300 font-medium">
                                Fee: <strong className="text-emerald-400">₹{course.feePerSem?.toLocaleString('en-IN')}</strong> / Sem
                              </span>
                              <button
                                onClick={() => msg.customCard.onSelectCourse(course)}
                                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                              >
                                <span>Enroll</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* RICH CARD 3: STUDENT FEE LEDGER SUMMARY */}
                  {/* ------------------------------------------------------------- */}
                  {msg.customCard?.type === 'student_fee_card' && (
                    <div className="bg-slate-900/90 border border-indigo-500/30 p-3 rounded-2xl space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-xs">{msg.customCard.student.fullName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">Roll: {msg.customCard.student.rollNo}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          msg.customCard.due === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {msg.customCard.due === 0 ? 'Fully Paid' : 'Fee Pending'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-300">
                        <strong>Course:</strong> {msg.customCard.student.courseName}
                      </div>

                      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/10 text-center text-[10px]">
                        <div className="bg-black/20 p-1 rounded-lg">
                          <span className="text-slate-400 text-[9px] block">Total Fee</span>
                          <strong className="text-white">₹{msg.customCard.total?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="bg-black/20 p-1 rounded-lg">
                          <span className="text-slate-400 text-[9px] block">Total Paid</span>
                          <strong className="text-emerald-400">₹{msg.customCard.paid?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="bg-black/20 p-1 rounded-lg">
                          <span className="text-slate-400 text-[9px] block">Balance Due</span>
                          <strong className="text-rose-400">₹{msg.customCard.due?.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {msg.customCard.due > 0 && (
                        <button
                          onClick={msg.customCard.onCollectFee}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow-md cursor-pointer transition-colors"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Collect Fee at Cash Desk</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* ------------------------------------------------------------- */}
                  {/* RICH CARD 4: GENERIC ACTION SUCCESS */}
                  {/* ------------------------------------------------------------- */}
                  {msg.customCard?.type === 'action_success' && (
                    <div className="bg-indigo-950/70 border border-indigo-500/40 p-2.5 rounded-2xl flex items-center justify-between gap-2 mt-2">
                      <div>
                        <h5 className="font-bold text-white text-[11px]">{msg.customCard.title}</h5>
                        <p className="text-[10px] text-indigo-300">{msg.customCard.desc}</p>
                      </div>
                      <button
                        onClick={msg.customCard.action}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded-xl text-[10px] shrink-0 transition-colors cursor-pointer"
                      >
                        {msg.customCard.actionLabel || 'Open'}
                      </button>
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className={`block text-[9px] text-right ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs bg-white/5 p-2.5 rounded-2xl w-fit animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>AI processing action...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Listening Audio Waves Banner */}
          {isListening && (
            <div className="bg-emerald-950/90 border-t border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-bold">Listening... Boliye!</span>
              </div>
              <button
                onClick={toggleListening}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-0.5 rounded-lg cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input & Voice Bar */}
          <div className="bg-slate-900/95 p-3 border-t border-indigo-950/80 shrink-0">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
              
              {/* Voice Mic Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-white/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-400/30'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Tap to Speak (Mic)'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={isListening ? 'Listening to voice...' : 'Type or say: "MPU ke courses", "Student Excel"...'}
                className="flex-1 bg-white/10 border border-white/15 focus:border-amber-400/60 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400/30"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Send Command"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
