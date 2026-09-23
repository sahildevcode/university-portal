import React, { useState, useEffect } from 'react';
import { 
  Search, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  ShieldCheck, 
  Laptop, 
  Briefcase, 
  Award, 
  Users, 
  Filter,
  Check
} from 'lucide-react';
import { translations } from '../utils/translations';
import { fireCelebration } from '../utils/confetti';

export default function PublicCourseCatalog({ 
  courses = [], 
  studentUser, 
  onOpenStudentAuth, 
  lang = 'en',
  onNavigateTab
}) {
  const t = translations[lang] || translations.en;

  // Search & Category Filter State
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState('all');
  const [courseViewMode, setCourseViewMode] = useState('grid');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);

  // All 63 Courses Static Master List
  const allCourses = [
    { id: 1,  name: 'BA',                                    duration: '3 Years', category: 'Arts', code: 'BA-01' },
    { id: 2,  name: 'MA (Education)',                        duration: '2 Years', category: 'Arts', code: 'MA-02' },
    { id: 3,  name: 'MA (History)',                          duration: '2 Years', category: 'Arts', code: 'MA-03' },
    { id: 4,  name: 'MA (English)',                          duration: '2 Years', category: 'Arts', code: 'MA-04' },
    { id: 5,  name: 'MA (Sociology)',                        duration: '2 Years', category: 'Arts', code: 'MA-05' },
    { id: 6,  name: 'MA (Economics)',                        duration: '2 Years', category: 'Arts', code: 'MA-06' },
    { id: 7,  name: 'MA (Political Science)',                duration: '2 Years', category: 'Arts', code: 'MA-07' },
    { id: 8,  name: 'MA (Hindi)',                            duration: '2 Years', category: 'Arts', code: 'MA-08' },
    { id: 9,  name: 'MA (Yoga)',                             duration: '2 Years', category: 'Arts', code: 'MA-09' },
    { id: 10, name: 'BSW',                                   duration: '3 Years', category: 'Arts', code: 'BSW-10' },
    { id: 11, name: 'MSW',                                   duration: '2 Years', category: 'Arts', code: 'MSW-11' },
    { id: 12, name: 'B.Com.',                                duration: '3 Years', category: 'Commerce', code: 'BCOM-12' },
    { id: 13, name: 'M.Com.',                                duration: '2 Years', category: 'Commerce', code: 'MCOM-13' },
    { id: 14, name: 'B.Sc.',                                 duration: '3 Years', category: 'Science', code: 'BSC-14' },
    { id: 15, name: 'M.Sc.(Physics)',                        duration: '2 Years', category: 'Science', code: 'MSC-15' },
    { id: 16, name: 'M.Sc.(Chemistry)',                      duration: '2 Years', category: 'Science', code: 'MSC-16' },
    { id: 17, name: 'M.Sc.(Mathematics)',                    duration: '2 Years', category: 'Science', code: 'MSC-17' },
    { id: 18, name: 'M.Sc.(Zoology)',                        duration: '2 Years', category: 'Science', code: 'MSC-18' },
    { id: 19, name: 'M.Sc.(Botany)',                         duration: '2 Years', category: 'Science', code: 'MSC-19' },
    { id: 20, name: 'M.Sc.(Yogic Science)',                  duration: '2 Years', category: 'Science', code: 'MSC-20' },
    { id: 21, name: 'M.Sc.(Forensic Science)',               duration: '2 Years', category: 'Science', code: 'MSC-21' },
    { id: 22, name: 'M.Sc.(Micro Biology)',                  duration: '2 Years', category: 'Science', code: 'MSC-22' },
    { id: 23, name: 'M.Sc.(Computer Science)',               duration: '2 Years', category: 'Science', code: 'MSC-23' },
    { id: 24, name: 'B.B.A.',                                duration: '3 Years', category: 'Commerce', code: 'BBA-24' },
    { id: 25, name: 'M.B.A.',                                duration: '2 Years', category: 'Commerce', code: 'MBA-25' },
    { id: 26, name: 'B.Lib',                                 duration: '1 Year',  category: 'Commerce', code: 'BLIB-26' },
    { id: 27, name: 'M.Lib',                                 duration: '1 Year',  category: 'Commerce', code: 'MLIB-27' },
    { id: 28, name: 'D.C.A.',                                duration: '1 Year',  category: 'Computer', code: 'DCA-28' },
    { id: 29, name: 'P.G.D.C.A.',                            duration: '1 Year',  category: 'Computer', code: 'PGDCA-29' },
    { id: 30, name: 'B.C.A.',                                duration: '3 Years', category: 'Computer', code: 'BCA-30' },
    { id: 31, name: 'M.C.A.',                                duration: '2 Years', category: 'Computer', code: 'MCA-31' },
    { id: 32, name: 'B.Pharm',                               duration: '4 Years', category: 'Science', code: 'BPHARM-32' },
    { id: 33, name: 'D.Pharm',                               duration: '2 Years', category: 'Science', code: 'DPHARM-33' },
    { id: 34, name: 'B.Sc.(Hons) Agriculture',               duration: '4 Years', category: 'Science', code: 'BSCAG-34' },
    { id: 35, name: 'M.Sc. Agriculture (Soil Science)',       duration: '2 Years', category: 'Science', code: 'MSCAG-35' },
    { id: 36, name: 'M.Sc. Agriculture (Agronomy)',           duration: '2 Years', category: 'Science', code: 'MSCAG-36' },
    { id: 37, name: 'M.Sc. Agriculture (Plant Pathology)',    duration: '2 Years', category: 'Science', code: 'MSCAG-37' },
    { id: 38, name: 'LLB',                                   duration: '3 Years', category: 'Law', code: 'LLB-38' },
    { id: 39, name: 'B.A.LLB',                               duration: '5 Years', category: 'Law', code: 'BALLB-39' },
    { id: 40, name: 'L.L.M.',                                 duration: '2 Years', category: 'Law', code: 'LLM-40' },
    { id: 41, name: 'BPA',                                   duration: '4 Years', category: 'Arts', code: 'BPA-41' },
    { id: 42, name: 'MPA',                                   duration: '2 Years', category: 'Arts', code: 'MPA-42' },
    { id: 43, name: 'BFA',                                   duration: '4 Years', category: 'Arts', code: 'BFA-43' },
    { id: 44, name: 'MFA',                                   duration: '2 Years', category: 'Arts', code: 'MFA-44' },
    { id: 45, name: 'B.Music / B.Dance',                     duration: '3 Years', category: 'Arts', code: 'BMUSIC-45' },
    { id: 46, name: 'M.Music / M.Dance',                     duration: '2 Years', category: 'Arts', code: 'MMUSIC-46' },
    { id: 47, name: 'BAJMC',                                  duration: '3 Years', category: 'Arts', code: 'BAJMC-47' },
    { id: 48, name: 'MAJMC',                                  duration: '2 Years', category: 'Arts', code: 'MAJMC-48' },
    { id: 49, name: 'B.P.ED',                                 duration: '2 Years', category: 'Arts', code: 'BPED-49' },
    { id: 50, name: 'BPES',                                   duration: '3 Years', category: 'Arts', code: 'BPES-50' },
    { id: 51, name: 'MPES',                                   duration: '2 Years', category: 'Arts', code: 'MPES-51' },
    { id: 52, name: 'B.Tech',                                 duration: '4 Years', category: 'Computer', code: 'BTECH-52' },
    { id: 53, name: 'M.Tech',                                 duration: '2 Years', category: 'Computer', code: 'MTECH-53' },
    { id: 54, name: 'DMLT',                                   duration: '2 Years', category: 'Science', code: 'DMLT-54' },
    { id: 55, name: 'BMLT',                                   duration: '3 Years', category: 'Science', code: 'BMLT-55' },
    { id: 56, name: 'Ph.D. (Social Science)',                  duration: '3 Years', category: 'Research', code: 'PHD-56' },
    { id: 57, name: 'Ph.D. (Science)',                        duration: '3 Years', category: 'Research', code: 'PHD-57' },
    { id: 58, name: 'Ph.D. (Education)',                      duration: '3 Years', category: 'Research', code: 'PHD-58' },
    { id: 59, name: 'Ph.D. (Commerce / Management)',           duration: '3 Years', category: 'Research', code: 'PHD-59' },
    { id: 60, name: 'Ph.D. (Law)',                            duration: '3 Years', category: 'Research', code: 'PHD-60' },
    { id: 61, name: 'Ph.D. (Engineering)',                    duration: '3 Years', category: 'Research', code: 'PHD-61' },
    { id: 62, name: 'BFD (Fashion Design)',                   duration: '3 Years', category: 'Scholarship Benefit', isScholarship: true, code: 'BFD-62' },
  ];

  // 8 Dedicated Scholarship Benefit Programs
  const scholarship8Programs = [
    {
      id: 'sc-1',
      code: 'MBA-1',
      name: 'MBA',
      fullName: 'Master of Business Administration',
      duration: '2 Years (4 Sem)',
      category: 'Scholarship Benefit',
      badge: 'HIGH SALARY & CORPORATE',
      fieldBest: lang === 'hi' ? 'कॉरपोरेट मैनेजमेंट, फाइनेंस, मार्केटिंग व बैंकिंग क्षेत्र' : 'Best for: Corporate Leadership, Finance & Banking',
      marketDemand: lang === 'hi' ? '⚡ जॉब मार्केट में 95%+ अत्यधिक मांग (Top Corporate Package)' : '⚡ Job Demand: 95%+ Top Corporate Salary Package',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
      highlights: ['Corporate Management', 'Fintech & HR', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-2',
      code: 'BFD-2',
      name: 'BFD',
      fullName: 'Bachelor of Fashion Design',
      duration: '3 Years (6 Sem)',
      category: 'Scholarship Benefit',
      badge: 'FASHION & MEDIA',
      fieldBest: lang === 'hi' ? 'फैशन डिजाइनिंग, गारमेंट टेक्नोलॉजी व टेक्सटाइल इंडस्ट्री' : 'Best for: Fashion Brands, Garment Tech & Export Houses',
      marketDemand: lang === 'hi' ? '⚡ जॉब मार्केट में 90%+ मांग (Apparel & Media Houses)' : '⚡ Job Demand: 90%+ Apparel & Export Industry',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop',
      highlights: ['Apparel Technology', 'Fashion Merchandising', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-3',
      code: 'BTECH-3',
      name: 'B.Tech',
      fullName: 'Bachelor of Technology (Engineering)',
      duration: '4 Years (8 Sem)',
      category: 'Scholarship Benefit',
      badge: 'TOP IT & SOFTWARE',
      fieldBest: lang === 'hi' ? 'सॉफ्टवेयर डेवलपमेंट, आईटी सेक्टर व सरकारी पीएसयू इंजीनियरिंग' : 'Best for: Software Engineering, Cloud & Govt PSU Jobs',
      marketDemand: lang === 'hi' ? '⚡ जॉब मार्केट में 98%+ सबसे ज्यादा मांग (Highest IT Hiring)' : '⚡ Job Demand: 98%+ Highest IT & Software Demand',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
      highlights: ['Full Stack & Cloud', 'Core Tech Systems', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-4',
      code: 'BSCAG-4',
      name: 'B.Sc Ag',
      fullName: 'B.Sc. (Hons) Agriculture',
      duration: '4 Years (8 Sem)',
      category: 'Scholarship Benefit',
      badge: 'GOVT AGRI OFFICER',
      fieldBest: lang === 'hi' ? 'कृषि विज्ञान, एग्रीबिजनेस व कृषि अधिकारी (ADO) सरकारी नौकरी' : 'Best for: Agri-Officer (ADO), Agronomy & Agribusiness',
      marketDemand: lang === 'hi' ? '⚡ सरकारी नौकरियों व एग्री सेक्टर में 92%+ मांग' : '⚡ Job Demand: 92%+ Govt Agriculture Officer Scope',
      image: 'https://images.unsplash.com/photo-1595838788320-b087796d11f9?q=80&w=800&auto=format&fit=crop',
      highlights: ['Agronomy & Crops', 'Agribusiness Tech', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-5',
      code: 'MTECH-5',
      name: 'M.Tech',
      fullName: 'Master of Technology (Advanced Engg)',
      duration: '2 Years (4 Sem)',
      category: 'Scholarship Benefit',
      badge: 'AI & SENIOR TECH LEAD',
      fieldBest: lang === 'hi' ? 'एडवांस्ड सॉफ्टवेयर रिसर्च, एआई व यूनिवर्सिटी प्रोफेसर/फैकल्टी' : 'Best for: Senior Tech Architect, AI R&D & University Faculty',
      marketDemand: lang === 'hi' ? '⚡ रिसर्च व सीनियर इंजीनियरिंग में 90%+ मांग' : '⚡ Job Demand: 90%+ Senior Engineering Roles',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
      highlights: ['AI & Neural Nets', 'Advanced Systems', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-6',
      code: 'DCA-6',
      name: 'DCA',
      fullName: 'Diploma in Computer Application',
      duration: '1 Year (2 Sem)',
      category: 'Scholarship Benefit',
      badge: 'GOVT JOB MANDATORY',
      fieldBest: lang === 'hi' ? 'मध्य प्रदेश सरकारी नौकरियों, एमपी ऑनलाइन व डेटा एंट्री ऑपरेटर' : 'Best for: MP Govt Jobs, MP Online & Data Operator',
      marketDemand: lang === 'hi' ? '⚡ सभी सरकारी भर्ती हेतु 100% अनिवार्य डिप्लोमा' : '⚡ Job Demand: 100% Mandatory for Govt Jobs',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      highlights: ['MS Office & Tally', 'MP Govt Approved', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-7',
      code: 'BBA-7',
      name: 'BBA',
      fullName: 'Bachelor of Business Administration',
      duration: '3 Years (6 Sem)',
      category: 'Scholarship Benefit',
      badge: 'BUSINESS & STARTUPS',
      fieldBest: lang === 'hi' ? 'बिजनेस ऑपरेशन्स, मार्केटिंग मैनेजमेंट व खुद का स्टार्टअप' : 'Best for: Corporate Operations, Marketing & Startups',
      marketDemand: lang === 'hi' ? '⚡ कॉरपोरेट जॉब्स व एमबीए हेतु 91%+ मांग' : '⚡ Job Demand: 91%+ Entry to Corporate Management',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
      highlights: ['Corporate Strategy', 'Marketing & Sales', '100% MPTASS/NSP Scholarship']
    },
    {
      id: 'sc-8',
      code: 'BCA-8',
      name: 'BCA',
      fullName: 'Bachelor of Computer Applications',
      duration: '3 Years (6 Sem)',
      category: 'Scholarship Benefit',
      badge: 'HIGH IT HIRING',
      fieldBest: lang === 'hi' ? 'वेब डेवलपमेंट, सॉफ्टवेयर इंजीनियरिंग व आईटी जॉब्स' : 'Best for: Web Engineering, Full Stack & IT Sector',
      marketDemand: lang === 'hi' ? '⚡ आईटी सेक्टर व सॉफ्टवेयर डेवलपमेंट में 96%+ मांग' : '⚡ Job Demand: 96%+ High Software Hiring',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
      highlights: ['Full Stack Dev', 'Java / Python / SQL', '100% MPTASS/NSP Scholarship']
    }
  ];

  const courseCategories = ['all', 'Scholarship Benefit', 'Arts', 'Science', 'Commerce', 'Computer', 'Law', 'Research'];

  const activeCatalog = courses.length > 0 ? courses : allCourses;

  const isScholarshipCourse = (course) => {
    if (!course) return false;
    if (course.category === 'Scholarship Benefit' || course.isScholarship) return true;
    const n = (course.name || '').toLowerCase();
    return (
      n.includes('mba') ||
      n.includes('bfd') ||
      n.includes('b.tech') ||
      n.includes('m.tech') ||
      n.includes('bsc ag') ||
      n.includes('agriculture') ||
      n.includes('d.c.a.') ||
      n.includes('dca') ||
      n.includes('b.b.a.') ||
      n.includes('bba') ||
      n.includes('b.c.a.') ||
      n.includes('bca')
    );
  };

  const filteredCourses = activeCatalog.filter(c => {
    let matchCat = false;
    if (courseCategory === 'all') {
      matchCat = true;
    } else if (courseCategory === 'Scholarship Benefit') {
      matchCat = isScholarshipCourse(c);
    } else {
      matchCat = c.category === courseCategory;
    }
    const matchSearch = (c.name || '').toLowerCase().includes(courseSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleInquireNow = (e) => {
    if (e) e.stopPropagation();
    fireCelebration({ x: 0.5, y: 0.5 });
    if (onNavigateTab) {
      onNavigateTab('inquiry');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FULL PAGE DEDICATED COURSE DETAILS VIEW
  if (selectedCourseModal) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 animate-fadeIn">
        
        {/* Top Sticky Header Bar */}
        <div className="bg-[#071530] text-white border-b border-[#C59B27]/30 sticky top-0 z-40 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setSelectedCourseModal(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-amber-400/30"
            >
              <ArrowRight className="w-4 h-4 rotate-180 text-amber-400" />
              <span>← {lang === 'hi' ? 'कोर्स सूची पर वापस जाएं' : 'Back to Course Catalog'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span>Courses</span>
              <span>/</span>
              <span>{selectedCourseModal.category || 'Academic'}</span>
              <span>/</span>
              <span className="text-amber-400 font-bold">{selectedCourseModal.name}</span>
            </div>

            <button
              onClick={handleInquireNow}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>ADMISSION INQUIRY</span>
            </button>
          </div>
        </div>

        {/* Course Banner Section */}
        <div className="relative bg-slate-950 text-white overflow-hidden py-12 sm:py-16">
          <img 
            src={selectedCourseModal.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'} 
            alt={selectedCourseModal.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-4 text-center sm:text-left z-10">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <span className="bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider shadow-sm">
                🎓 {selectedCourseModal.badge || selectedCourseModal.category}
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-md">
                ⏱️ Duration: {selectedCourseModal.duration}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-md">
                🟢 ADMISSIONS OPEN 2026-27
              </span>
            </div>

            <h1 className="font-serif-academic text-3xl sm:text-5xl font-black text-white leading-tight">
              {selectedCourseModal.name === 'MBA' 
                ? 'Master of Business Administration (MBA)' 
                : (selectedCourseModal.fullName || selectedCourseModal.name)}
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-300 max-w-3xl">
              {selectedCourseModal.name === 'MBA' 
                ? 'Complete Career & Course Guide • Authorized UGC Recognized University Degree Program' 
                : (selectedCourseModal.fieldBest || 'Authorized university degree program with full syllabus scheme and exam support.')}
            </p>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              PKC Education Learning Institute &amp; Consultancy • Head Office: Chhatarpur (M.P.)
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

          {/* 100% Scholarship Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-teal-50 border-2 border-emerald-400 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-emerald-950 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <strong className="block text-base font-black text-emerald-950">100% Govt Scholarship Scheme (MPTASS &amp; NSP Eligible)</strong>
              <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
                SC / ST / OBC category students receive 100% tuition fee reimbursement &amp; hostel allowance scheme guidance at PKC Education Institute.
              </p>
            </div>
          </div>

          {/* Special Detailed Layout for MBA / BFD / BTech / DCA or Generic Layout */}
          {(selectedCourseModal.name === 'MBA' || selectedCourseModal.code === 'MBA-1' || selectedCourseModal.code === 'MBA-25') ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
              
              {/* Overview */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span>MBA Course Overview &amp; Introduction</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  MBA (Master of Business Administration) ek 2-saal ka professional postgraduate degree program hai. Yeh course students ko <strong>leadership, management, problem-solving</strong> aur <strong>strategic business operations</strong> ki professional training deta hai. MBA ka main target candidate ko standard corporate leadership, management roles aur entrepreneurship (startup) ke liye fully prepare karna hota hai.
                </p>
              </div>

              {/* 1. MBA Duration Formats */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                  <span>MBA Duration (Padhai Kitne Saal Ki Hoti Hai?)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 space-y-1.5 shadow-xs">
                    <span className="text-xs font-black uppercase text-blue-700 block">Full-Time Regular MBA</span>
                    <strong className="text-sm text-blue-950 font-bold block">2 Years (4 Semesters)</strong>
                    <p className="text-xs text-blue-900/80 leading-relaxed">Sabse popular aur highly demanded standard campus format.</p>
                  </div>

                  <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 space-y-1.5 shadow-xs">
                    <span className="text-xs font-black uppercase text-purple-700 block">Executive MBA (EMBA)</span>
                    <strong className="text-sm text-purple-950 font-bold block">1 to 2 Years</strong>
                    <p className="text-xs text-purple-900/80 leading-relaxed">Working professionals ke liye (min 3–5 yrs experience needed).</p>
                  </div>

                  <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-1.5 shadow-xs">
                    <span className="text-xs font-black uppercase text-emerald-700 block">Part-Time / Distance MBA</span>
                    <strong className="text-sm text-emerald-950 font-bold block">2 to 3 Years</strong>
                    <p className="text-xs text-emerald-900/80 leading-relaxed">Job ya business ke saath flexible degree option.</p>
                  </div>
                </div>
              </div>

              {/* 2. Who Should Pursue MBA? */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                  <span>MBA Kiske Liye Best Hai? (Who Should Pursue MBA?)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: 'Career Growth / Leadership Role', desc: 'Agar aap company mein Manager, VP, ya Director Level par jana chahte hain.' },
                    { title: 'Salary Hike & Higher CTC', desc: 'Non-MBA roles ke mukable MBA graduates ko high starting package milta hai.' },
                    { title: 'Field Change (Career Switch)', desc: 'Engineering, B.Sc, ya Arts field se Management sector mein shift hone ke liye.' },
                    { title: 'Entrepreneurship / Business Mindset', desc: 'Apna khud ka Startup launch ya Family Business expand karne ke liye.' },
                    { title: 'Global Professional Networking', desc: 'Top Industry experts, alumni aur business leaders ke saath connection banane ke liye.' }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                        <span className="text-xs text-slate-600 leading-relaxed block mt-1">{item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Specializations */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
                  <span>Major Specializations</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1">
                    <strong className="text-sm font-bold text-amber-950 block">💼 MBA in Finance</strong>
                    <p className="text-xs text-amber-900/90">Stock market, investment banking, corporate finance aur risk management.</p>
                  </div>
                  <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-1">
                    <strong className="text-sm font-bold text-blue-950 block">🚀 MBA in Marketing</strong>
                    <p className="text-xs text-blue-900/90">Brand management, digital marketing, market research aur sales strategy.</p>
                  </div>
                  <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-1">
                    <strong className="text-sm font-bold text-rose-950 block">👥 MBA in Human Resource (HR)</strong>
                    <p className="text-xs text-rose-900/90">Talent acquisition, corporate policies aur employee management.</p>
                  </div>
                  <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 space-y-1">
                    <strong className="text-sm font-bold text-indigo-950 block">🤖 MBA in Business Analytics &amp; AI</strong>
                    <p className="text-xs text-indigo-900/90">Data analysis, business intelligence aur AI decision-making (Highest Demand).</p>
                  </div>
                </div>
              </div>

              {/* 4. Salary Table */}
              <div className="space-y-4">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">4</span>
                  <span>Current Market Demand &amp; High Paying Job Roles</span>
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#071530] text-white text-xs font-black uppercase tracking-wider">
                        <th className="p-4">Job Role</th>
                        <th className="p-4">Top Recruiting Companies</th>
                        <th className="p-4">Average Starting Package (CTC)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-4 font-bold text-[#071530]">Management Consultant</td>
                        <td className="p-4 text-slate-600">McKinsey, BCG, Deloitte, PwC</td>
                        <td className="p-4 font-bold text-emerald-700">₹15 – 40 LPA</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-4 font-bold text-[#071530]">Investment Banker</td>
                        <td className="p-4 text-slate-600">Goldman Sachs, JP Morgan, Morgan Stanley</td>
                        <td className="p-4 font-bold text-emerald-700">₹12 – 35 LPA</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-4 font-bold text-[#071530]">Product Manager</td>
                        <td className="p-4 text-slate-600">Google, Amazon, Flipkart, Microsoft</td>
                        <td className="p-4 font-bold text-emerald-700">₹14 – 30 LPA</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* GENERIC ENHANCED GUIDE FOR ALL OTHER COURSES */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">🎓 Course Duration &amp; Structure</span>
                  <strong className="text-lg text-[#071530] font-extrabold block">{selectedCourseModal.duration}</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Full university syllabus compliance, yearly or semester pattern exam preparation.
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">⚡ Best Field Scope &amp; Career</span>
                  <strong className="text-sm text-emerald-950 font-bold block">{selectedCourseModal.fieldBest || 'Government & Corporate Roles'}</strong>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedCourseModal.marketDemand || 'High demand in public sector and private industry.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-base font-black text-[#071530] uppercase tracking-wider">
                  Why Enroll in {selectedCourseModal.name} at PKC Education Institute?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
                    <strong className="text-xs font-bold text-amber-950 block">100% MPTASS &amp; NSP Support</strong>
                    <p className="text-[11.5px] text-amber-900/80">Full guidance for SC / ST / OBC scholarship applicants.</p>
                  </div>
                  <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-1">
                    <strong className="text-xs font-bold text-blue-950 block">UGC Approved Degrees</strong>
                    <p className="text-[11.5px] text-blue-900/80">Valid for all MP Govt &amp; Central Govt Job recruitments.</p>
                  </div>
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                    <strong className="text-xs font-bold text-emerald-950 block">Exam &amp; Material Assistance</strong>
                    <p className="text-[11.5px] text-emerald-900/80">Complete previous year papers, notes &amp; verification desk.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="bg-[#071530] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C59B27] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-xl font-bold font-serif-academic text-amber-400">
                Ready to Apply for {selectedCourseModal.name}?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Submit an instant admission inquiry to get scholarship counseling &amp; fee structure details.
              </p>
            </div>

            <button
              onClick={handleInquireNow}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>APPLY FOR ADMISSION NOW</span>
            </button>
          </div>

        </div>

      </div>
    );
  }

  // STANDALONE MAIN COURSE CATALOG PAGE
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 animate-fadeIn">
      
      {/* 1. Page Title Header */}
      <section className="bg-[#071530] text-white py-12 sm:py-16 px-4 sm:px-6 border-b-4 border-[#C59B27] relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-3 relative z-10">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/10 px-4 py-1.5 rounded-full border border-[#C59B27]/30 inline-block">
            🎓 OFFICIAL UNIVERSITY COURSE CATALOG 2026-27
          </span>
          <h1 className="font-serif-academic text-3xl sm:text-5xl font-black tracking-tight text-white">
            {lang === 'hi' ? 'सभी 62+ पाठ्यक्रम एवं डिप्लोमा सूची' : 'PKC Academic Programs & Course Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'श्रेणी के अनुसार खोजें, 100% छात्रवृत्ति योजना वाले 8 मुख्य कोर्स देखें या कार्ड पर क्लिक करके पूरा विवरण पढ़ें।'
              : 'Explore all 62+ UGC approved degrees, diplomas, and high-demand 100% scholarship benefit courses.'}
          </p>
        </div>
      </section>

      {/* 2. Controls & Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={courseSearch}
            onChange={e => setCourseSearch(e.target.value)}
            placeholder={lang === 'hi' ? 'कोर्स नाम खोजें (उदा. MBA, DCA, B.Tech)...' : 'Search course name (e.g. MBA, DCA, B.Tech)...'}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]/60 transition-all"
          />
          {courseSearch && (
            <button
              onClick={() => setCourseSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
            >×</button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {courseCategories.map(cat => {
            const catLabels = {
              all: `All Courses (${allCourses.length})`,
              'Scholarship Benefit': '🎓 Scholarship Benefit',
              Arts: 'Arts',
              Science: 'Science',
              Commerce: 'Commerce',
              Computer: 'Computer & IT',
              Law: 'Law',
              Research: 'Research / Ph.D.'
            };
            const catColors = {
              'Scholarship Benefit': 'bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white border-amber-300 font-extrabold shadow-md scale-105',
              Arts:     'bg-purple-100 text-purple-700 border-purple-300',
              Science:  'bg-green-100 text-green-700 border-green-300',
              Commerce: 'bg-blue-100 text-blue-700 border-blue-300',
              Computer: 'bg-cyan-100 text-cyan-700 border-cyan-300',
              Law:      'bg-red-100 text-red-700 border-red-300',
              Research: 'bg-amber-100 text-amber-700 border-amber-300',
              all:      'bg-[#071530] text-[#C59B27] border-[#C59B27]/40',
            };
            const isActive = courseCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setCourseCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  isActive
                    ? (cat === 'all' ? catColors.all : catColors[cat]) + ' shadow-md scale-105'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {catLabels[cat] || cat}
              </button>
            );
          })}
        </div>

        {/* Results Bar & View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-[#071530] uppercase tracking-wider bg-slate-200/80 px-3 py-1.5 rounded-lg">
              {filteredCourses.length} {lang === 'hi' ? 'कोर्स उपलब्ध' : 'courses matching'}
            </span>
            {(courseSearch || courseCategory !== 'all') && (
              <button
                onClick={() => { setCourseSearch(''); setCourseCategory('all'); }}
                className="text-xs font-bold text-[#C59B27] hover:text-amber-600 cursor-pointer underline ml-2"
              >
                {lang === 'hi' ? 'फ़िल्टर रिसेट करें' : 'Clear filters'}
              </button>
            )}
          </div>

          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl border border-slate-300/60 text-xs font-bold">
            <button
              onClick={() => setCourseViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                courseViewMode === 'grid'
                  ? 'bg-[#071530] text-[#C59B27] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🎴 Grid Cards</span>
            </button>
            <button
              onClick={() => setCourseViewMode('table')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                courseViewMode === 'table'
                  ? 'bg-[#071530] text-[#C59B27] shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📋 Table List</span>
            </button>
          </div>
        </div>

        {/* 3. DEDICATED 8 SCHOLARSHIP BENEFIT CARDS SECTION */}
        {(courseCategory === 'Scholarship Benefit' || (courseCategory === 'all' && !courseSearch)) && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-amber-300/60 pb-2">
              <h2 className="text-lg sm:text-xl font-black text-[#071530] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>8 Scholarship Benefit Programs (100% MPTASS / NSP)</span>
              </h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                High Demand &amp; Placements
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {scholarship8Programs.map((prog) => (
                <div
                  key={prog.id}
                  onClick={() => {
                    setSelectedCourseModal(prog);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl border-2 border-amber-400/60 shadow-md hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col cursor-pointer group relative transition-all duration-300"
                >
                  {/* Top Image */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <img
                      src={prog.image}
                      alt={prog.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-amber-300 shadow-md">
                      🎓 {prog.badge}
                    </span>

                    <span className="absolute top-2.5 right-2.5 bg-[#C59B27] text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                      {prog.duration}
                    </span>

                    <div className="absolute bottom-2.5 left-3 text-white">
                      <span className="text-[10px] font-mono font-bold tracking-widest bg-black/60 px-2 py-0.5 rounded text-amber-300 border border-amber-400/30">
                        #{prog.code}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 pt-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-serif-academic font-black text-2xl text-[#071530] leading-none group-hover:text-amber-600 transition-colors">
                          {prog.name}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-1">
                          {prog.fullName}
                        </p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-300/80 p-2 rounded-xl text-[10.5px] font-bold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>100% Govt Scholarship (MPTASS/NSP)</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#071530] group-hover:text-[#C59B27]">
                        <span className="uppercase tracking-wider text-[10.5px] font-black">DETAILS</span>
                        <div className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 flex items-center justify-center text-[10px]">
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>

                      <button
                        onClick={handleInquireNow}
                        className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-[10.5px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>INQUIRE NOW</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ALL 62 COURSES GRID / TABLE DISPLAY */}
        {courseCategory !== 'Scholarship Benefit' && (
          <div className="space-y-4 pt-2">
            <h2 className="text-lg font-black text-[#071530] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>
                {courseCategory === 'all' ? 'All Academic Courses Grid' : `${courseCategory} Courses`}
              </span>
            </h2>

            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#C59B27]" />
                <p className="text-sm font-bold text-slate-700">
                  {lang === 'hi' ? 'कोई कोर्स नहीं मिला' : 'No courses found matching search criteria.'}
                </p>
              </div>
            ) : courseViewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div
                    key={course.id || course.name}
                    onClick={() => {
                      setSelectedCourseModal(course);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-5 flex flex-col justify-between space-y-4 cursor-pointer group relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{course.code || `CRS-${course.id}`}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ⏱️ {course.duration}
                        </span>
                      </div>

                      <h3 className="font-serif-academic font-bold text-xl text-[#071530] group-hover:text-amber-600 transition-colors leading-snug">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Category: <strong className="text-slate-700">{course.category}</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-xs font-bold text-[#071530] group-hover:text-[#C59B27]">
                        <span>SEE DETAILS</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>

                      <button
                        onClick={handleInquireNow}
                        className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-[10.5px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      >
                        <Sparkles className="w-3 h-3 text-slate-950" />
                        <span>INQUIRE NOW</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase tracking-wider">
                      <th className="p-4">Code</th>
                      <th className="p-4">Course Name</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800">
                    {filteredCourses.map(course => (
                      <tr 
                        key={course.id || course.name}
                        onClick={() => {
                          setSelectedCourseModal(course);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-slate-500 text-xs">
                          #{course.code || `CRS-${course.id}`}
                        </td>
                        <td className="p-4 font-bold text-[#071530] text-sm">
                          {course.name}
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                            {course.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          {course.duration}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCourseModal(course);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="text-xs font-bold text-[#071530] hover:text-amber-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Details
                            </button>
                            <button
                              onClick={handleInquireNow}
                              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>Inquire</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
