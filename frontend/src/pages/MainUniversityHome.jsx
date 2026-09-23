import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Award, 
  Laptop, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  MessageSquare,
  Building2,
  Star,
  Compass,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  Filter,
  Search,
  School
} from 'lucide-react';
import { translations } from '../utils/translations';
import CampusEventSlider from '../components/CampusEventSlider';
import AnimatedCounter from '../components/AnimatedCounter';
import AdmissionLiveTicker from '../components/AdmissionLiveTicker';
import { fireCelebration } from '../utils/confetti';

export default function MainUniversityHome({ 
  setActiveTab, 
  courses = [], 
  studentUser, 
  lang = 'en',
  onOpenStudentAuth 
}) {
  const t = translations[lang] || translations.en;

  // Dynamic rotating headlines in Hero
  const dynamicPhrases = [
    lang === 'hi' ? 'उज्ज्वल भविष्य और सम्मान।' : 'A Future of Impact.',
    lang === 'hi' ? '100% यूजीसी मान्यता प्राप्त डिग्रियां।' : '100% Certified UGC Degrees.',
    lang === 'hi' ? 'शासकीय नौकरियों हेतु कंप्यूटर डिप्लोमा।' : 'Govt Approved Computer Diplomas.',
    lang === 'hi' ? '100% छात्रवृत्ति मार्गदर्शन (MPTASS/NSP)।' : '100% Scholarship Assistance.'
  ];
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPhraseIdx(prev => (prev + 1) % dynamicPhrases.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [dynamicPhrases.length]);

  // Program Category Filter State
  const [selectedFilter, setSelectedFilter] = useState('all');

  // 62 Courses — Search + Category Filter + Grid/Table View Mode
  const [courseSearch, setCourseSearch] = useState('');
  const [courseCategory, setCourseCategory] = useState('all');
  const [courseViewMode, setCourseViewMode] = useState('grid');
  const [dbCourses, setDbCourses] = useState([]);

  useEffect(() => {
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pkc-university-api.onrender.com';
    fetch(`${apiBase}/api/courses`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setDbCourses(data.courses);
        }
      })
      .catch(err => console.log('Live courses fetch:', err));
  }, []);

  // Scroll entrance observer for Section 2: Program Cards (Smooth staggered fade-in from bottom)
  const [cardsInView, setCardsInView] = useState(false);
  const cardsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsInView(true);
        } else if (entry.boundingClientRect && entry.boundingClientRect.top > (window.innerHeight || document.documentElement.clientHeight)) {
          // Reset when scrolled back up above the cards so it animates again on scroll down
          setCardsInView(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    if (cardsRef.current) observer.observe(cardsRef.current);
    return () => observer.disconnect();
  }, []);

  // Scroll entrance observer for Section 4: Life at PKC (Left & Right slide-in fade)
  const [experienceInView, setExperienceInView] = useState(false);
  const experienceRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setExperienceInView(true);
        } else if (entry.boundingClientRect && entry.boundingClientRect.top > (window.innerHeight || document.documentElement.clientHeight)) {
          // Reset when scrolled back up above the section so it animates again on scroll down
          setExperienceInView(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    if (experienceRef.current) observer.observe(experienceRef.current);
    return () => observer.disconnect();
  }, []);

  // Newsletter subscribe state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    fireCelebration();
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4000);
  };

  // All 62 Courses Static Data
  const allCourses = [
    { id: 1,  name: 'BA',                                    duration: '3 Years', category: 'Arts' },
    { id: 2,  name: 'MA (Education)',                        duration: '2 Years', category: 'Arts' },
    { id: 3,  name: 'MA (History)',                          duration: '2 Years', category: 'Arts' },
    { id: 4,  name: 'MA (English)',                          duration: '2 Years', category: 'Arts' },
    { id: 5,  name: 'MA (Sociology)',                        duration: '2 Years', category: 'Arts' },
    { id: 6,  name: 'MA (Economics)',                        duration: '2 Years', category: 'Arts' },
    { id: 7,  name: 'MA (Political Science)',                duration: '2 Years', category: 'Arts' },
    { id: 8,  name: 'MA (Hindi)',                            duration: '2 Years', category: 'Arts' },
    { id: 9,  name: 'MA (Yoga)',                             duration: '2 Years', category: 'Arts' },
    { id: 10, name: 'BSW',                                   duration: '3 Years', category: 'Arts' },
    { id: 11, name: 'MSW',                                   duration: '2 Years', category: 'Arts' },
    { id: 12, name: 'B.Com.',                                duration: '3 Years', category: 'Commerce' },
    { id: 13, name: 'M.Com.',                                duration: '2 Years', category: 'Commerce' },
    { id: 14, name: 'B.Sc.',                                 duration: '3 Years', category: 'Science' },
    { id: 15, name: 'M.Sc.(Physics)',                        duration: '2 Years', category: 'Science' },
    { id: 16, name: 'M.Sc.(Chemistry)',                      duration: '2 Years', category: 'Science' },
    { id: 17, name: 'M.Sc.(Mathematics)',                    duration: '2 Years', category: 'Science' },
    { id: 18, name: 'M.Sc.(Zoology)',                        duration: '2 Years', category: 'Science' },
    { id: 19, name: 'M.Sc.(Botany)',                         duration: '2 Years', category: 'Science' },
    { id: 20, name: 'M.Sc.(Yogic Science)',                  duration: '2 Years', category: 'Science' },
    { id: 21, name: 'M.Sc.(Forensic Science)',               duration: '2 Years', category: 'Science' },
    { id: 22, name: 'M.Sc.(Micro Biology)',                  duration: '2 Years', category: 'Science' },
    { id: 23, name: 'M.Sc.(Computer Science)',               duration: '2 Years', category: 'Science' },
    { id: 24, name: 'B.B.A.',                                duration: '3 Years', category: 'Commerce' },
    { id: 25, name: 'M.B.A.',                                duration: '2 Years', category: 'Commerce' },
    { id: 26, name: 'B.Lib',                                 duration: '1 Year',  category: 'Commerce' },
    { id: 27, name: 'M.Lib',                                 duration: '1 Year',  category: 'Commerce' },
    { id: 28, name: 'D.C.A.',                                duration: '1 Year',  category: 'Computer' },
    { id: 29, name: 'P.G.D.C.A.',                            duration: '1 Year',  category: 'Computer' },
    { id: 30, name: 'B.C.A.',                                duration: '3 Years', category: 'Computer' },
    { id: 31, name: 'M.C.A.',                                duration: '2 Years', category: 'Computer' },
    { id: 32, name: 'B.Pharm',                               duration: '4 Years', category: 'Science' },
    { id: 33, name: 'D.Pharm',                               duration: '2 Years', category: 'Science' },
    { id: 34, name: 'B.Sc.(Hons) Agriculture',               duration: '4 Years', category: 'Science' },
    { id: 35, name: 'M.Sc. Agriculture (Soil Science)',       duration: '2 Years', category: 'Science' },
    { id: 36, name: 'M.Sc. Agriculture (Agronomy)',           duration: '2 Years', category: 'Science' },
    { id: 37, name: 'M.Sc. Agriculture (Plant Pathology)',    duration: '2 Years', category: 'Science' },
    { id: 38, name: 'LLB',                                   duration: '3 Years', category: 'Law' },
    { id: 39, name: 'B.A.LLB',                               duration: '5 Years', category: 'Law' },
    { id: 40, name: 'L.L.M.',                                 duration: '2 Years', category: 'Law' },
    { id: 41, name: 'BPA',                                   duration: '4 Years', category: 'Arts' },
    { id: 42, name: 'MPA',                                   duration: '2 Years', category: 'Arts' },
    { id: 43, name: 'BFA',                                   duration: '4 Years', category: 'Arts' },
    { id: 44, name: 'MFA',                                   duration: '2 Years', category: 'Arts' },
    { id: 45, name: 'B.Music / B.Dance',                     duration: '3 Years', category: 'Arts' },
    { id: 46, name: 'M.Music / M.Dance',                     duration: '2 Years', category: 'Arts' },
    { id: 47, name: 'BAJMC',                                  duration: '3 Years', category: 'Arts' },
    { id: 48, name: 'MAJMC',                                  duration: '2 Years', category: 'Arts' },
    { id: 49, name: 'B.P.ED',                                 duration: '2 Years', category: 'Arts' },
    { id: 50, name: 'BPES',                                   duration: '3 Years', category: 'Arts' },
    { id: 51, name: 'MPES',                                   duration: '2 Years', category: 'Arts' },
    { id: 52, name: 'B.Tech',                                 duration: '4 Years', category: 'Computer' },
    { id: 53, name: 'M.Tech',                                 duration: '2 Years', category: 'Computer' },
    { id: 54, name: 'DMLT',                                   duration: '2 Years', category: 'Science' },
    { id: 55, name: 'BMLT',                                   duration: '3 Years', category: 'Science' },
    { id: 56, name: 'B.P.ED.',                                duration: '2 Years', category: 'Arts' },
    { id: 57, name: 'Ph.D. (Social Science)',                  duration: '3 Years', category: 'Research' },
    { id: 58, name: 'Ph.D. (Science)',                        duration: '3 Years', category: 'Research' },
    { id: 59, name: 'Ph.D. (Education)',                      duration: '3 Years', category: 'Research' },
    { id: 60, name: 'Ph.D. (Commerce / Management)',           duration: '3 Years', category: 'Research' },
    { id: 61, name: 'Ph.D. (Law)',                            duration: '3 Years', category: 'Research' },
    { id: 62, name: 'Ph.D. (Engineering)',                    duration: '3 Years', category: 'Research' },
    { id: 63, name: 'BFD (Fashion Design)',                   duration: '3 Years', category: 'Scholarship Benefit', isScholarship: true },
  ];

  const courseCategories = ['all', 'Scholarship Benefit', 'Arts', 'Science', 'Commerce', 'Computer', 'Law', 'Research'];

  const activeCourseCatalog = dbCourses.length > 0 ? dbCourses : allCourses;

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

  const filteredCourses = activeCourseCatalog.filter(c => {
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

  // 5 Program Categories
  const programCategories = [
    {
      id: 'it',
      title: lang === 'hi' ? 'कंप्यूटर एवं सूचना प्रौद्योगिकी' : 'Computer Applications & IT',
      discipline: 'BCA • MCA • B.Tech CSE',
      desc: lang === 'hi' ? 'सॉफ्टवेयर डेवलपमेंट, वेब टेक एवं क्लाउड कंप्यूटिंग में मान्यता प्राप्त डिग्री।' : 'Master software development, cloud systems, and data analytics.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
      icon: Laptop,
      badge: 'Popular'
    },
    {
      id: 'mgmt',
      title: lang === 'hi' ? 'प्रबंधन एवं वाणिज्य' : 'Business & Management',
      discipline: 'MBA • BBA • B.Com',
      desc: lang === 'hi' ? 'कॉरपोरेट मैनेजमेंट, फाइनेंस, मार्केटिंग एवं बिज़नेस लीडरशिप प्रोग्राम्स।' : 'Build corporate leadership, finance, and modern marketing skills.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
      icon: Briefcase,
      badge: 'High Placement'
    },
    {
      id: 'diploma',
      title: lang === 'hi' ? 'शासन मान्यता प्राप्त डिप्लोमा' : 'Govt Computer Diplomas',
      discipline: 'DCA • PGDCA • CPCT',
      desc: lang === 'hi' ? 'मध्य प्रदेश शासन एवं माखनलाल वि.वि. मान्यता प्राप्त, सभी सरकारी नौकरियों हेतु अनिवार्य।' : 'MP Govt recognized computer diplomas mandatory for all govt recruitments.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      icon: ShieldCheck,
      badge: 'Govt Jobs'
    },
    {
      id: 'science',
      title: lang === 'hi' ? 'विज्ञान एवं तकनीक' : 'Health & Sciences',
      discipline: 'B.Sc (CS/Maths/Bio)',
      desc: lang === 'hi' ? 'वैज्ञानिक अनुसंधान, उच्च शिक्षा एवं प्रयोगशाला आधारित प्रमाणित पाठ्यक्रम।' : 'Advance laboratory research, foundational sciences and analytical thinking.',
      image: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=800&auto=format&fit=crop',
      icon: Award,
      badge: 'UGC Degree'
    },
    {
      id: 'counseling',
      title: lang === 'hi' ? 'कैरियर परामर्श व छात्रवृत्ति' : 'Scholarships & Counseling',
      discipline: 'MPTASS • NSP • Verification',
      desc: lang === 'hi' ? 'एससी/एसटी/ओबीसी छात्रवृत्ति मार्गदर्शन, रेगुलर एवं दूरस्थ शिक्षा परामर्श।' : 'Complete scholarship assistance, exam support, and degree completion desk.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
      icon: Users,
      badge: 'Free Guidance'
    }
  ];

  return (
    <div className="w-full bg-slate-900 text-slate-900 font-sans">
      
      {/* ========================================================================= */}
      {/* SECTION 1: HERO & LEGACY */}
      {/* ========================================================================= */}
      <section className="relative min-h-[85vh] flex flex-col justify-center bg-[#071530] text-white py-16 sm:py-24 overflow-hidden border-b border-[#C59B27]/30">
        {/* Campus Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop" 
            alt="University Campus" 
            className="w-full h-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071530] via-[#071530]/95 to-[#071530]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071530] via-transparent to-black/50" />
        </div>

        {/* Ambient Floating Glowing Particle Orbs */}
        <div className="absolute w-96 h-96 rounded-full bg-[#C59B27]/15 blur-3xl -top-20 -left-20 animate-float-slow pointer-events-none" />
        <div className="absolute w-96 h-96 rounded-full bg-blue-600/15 blur-3xl -bottom-20 -right-20 animate-float pointer-events-none" />
        <div className="absolute w-80 h-80 rounded-full bg-amber-500/10 blur-3xl top-1/3 left-1/2 -translate-x-1/2 animate-pulse pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/15 px-3.5 py-1.5 rounded-full border border-[#C59B27]/40 shadow-sm flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'hi' ? 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट एवं कंसल्टेंसी' : 'PKC EDUCATION LEARNING INSTITUTE & CONSULTANCY'}</span>
                </span>
              </div>

              <h1 className="font-serif-academic text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                A Legacy of Excellence. <br />
                <span className="relative inline-block mt-1">
                  <span 
                    key={currentPhraseIdx}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-[#C59B27] via-amber-300 to-yellow-500 italic font-serif-academic font-bold block animate-fadeIn"
                  >
                    {dynamicPhrases[currentPhraseIdx]}
                  </span>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {lang === 'hi' 
                  ? 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट एवं कंसल्टेंसी में हम वर्ष 2011 से छात्र-छात्राओं को यूजीसी मान्यता प्राप्त विश्वविद्यालयों से प्रमाणित डिग्री, कंप्यूटर डिप्लोमा एवं पारदर्शी कैरियर मार्गदर्शन प्रदान कर रहे हैं।'
                  : 'At PKC Education Learning Institute & Consultancy, we empower students to think critically, lead courageously, and earn certified degrees from top UGC approved universities across India.'
                }
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => {
                    fireCelebration({ x: 0.3, y: 0.5 });
                    setActiveTab('courses');
                  }}
                  className="w-full sm:w-auto bg-[#0A1931] hover:bg-[#061124] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl border border-[#C59B27]/80 shadow-xl hover:border-[#C59B27] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="relative z-10">{t.viewCourses}</span>
                  <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1.5 transition-transform relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C59B27]/0 via-[#C59B27]/20 to-[#C59B27]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <button
                  onClick={() => {
                    fireCelebration({ x: 0.5, y: 0.5 });
                    setActiveTab('inquiry');
                  }}
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#071530] font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{t.onlineInquiry}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 border-t border-slate-800/80">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#071530] object-cover hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#071530] object-cover hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#071530] object-cover hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#071530] object-cover hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Student" />
                </div>
                <div className="text-left text-xs">
                  <strong className="text-white block font-bold text-sm flex items-center gap-1.5">
                    <span>18,500+ Students Guided Successfully</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </strong>
                  <span className="text-slate-400 block text-xs">
                    Serving 50+ Districts Across Madhya Pradesh &amp; Central India
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Floating Interactive Honor Badge */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div 
                onClick={() => fireCelebration({ x: 0.8, y: 0.4 })}
                className="bg-[#0A1931]/95 border-2 border-[#C59B27] rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-md max-w-sm text-center space-y-4 animate-float hover:scale-105 transition-all duration-300 cursor-pointer relative group overflow-hidden"
                title="Click for celebration! 🎓"
              >
                {/* Shimmer sweep */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27] shadow-md group-hover:rotate-6 transition-transform">
                  <GraduationCap className="w-9 h-9" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C59B27] block flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                  <span>15+ YEARS OF TRUST • EST. 2011</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                </span>
                <h3 className="font-serif-academic text-xl font-bold text-white leading-snug group-hover:text-[#C59B27] transition-colors">
                  Ranked Among Top Educational Consultancies in MP
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Approved &amp; Registered Educational Society • Reg. No. 06/03/01/12345/18
                </p>
                <div className="pt-3 border-t border-slate-800 text-xs text-[#C59B27] font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>UGC &amp; MP Higher Education Partner</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Admissions Live Marquee Ticker Ribbon */}
      <AdmissionLiveTicker 
        onAction={() => {
          fireCelebration();
          setActiveTab('inquiry');
        }} 
        lang={lang} 
      />



      {/* ========================================================================= */}
      {/* SECTION 2B: ALL 62 COURSES — SEARCHABLE LIST */}
      {/* ========================================================================= */}
      <section className="bg-slate-50 py-14 sm:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.22em] text-[#C59B27] bg-[#C59B27]/10 px-4 py-1.5 rounded-full border border-[#C59B27]/30 inline-block">
              COMPLETE COURSE CATALOG
            </span>
            <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-[#071530]">
              {lang === 'hi' ? 'सभी 62 पाठ्यक्रम देखें' : 'All 62 Academic Programs'}
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              {lang === 'hi'
                ? 'श्रेणी अनुसार फ़िल्टर करें या सीधे कोर्स खोजें'
                : 'Filter by category or search for your desired course'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={courseSearch}
              onChange={e => setCourseSearch(e.target.value)}
              placeholder={lang === 'hi' ? 'कोर्स नाम खोजें...' : 'Search course name...'}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C59B27]/40 focus:border-[#C59B27]/60 transition-all"
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
                all: `All (${allCourses.length})`,
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
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    isActive
                      ? (cat === 'all' ? catColors.all : catColors[cat]) + ' shadow-md scale-105'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {catLabels[cat] || cat}
                </button>
              );
            })}
          </div>

          {/* Results Count & View Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#071530] uppercase tracking-wider bg-slate-200/70 px-3 py-1 rounded-lg">
                {filteredCourses.length} {lang === 'hi' ? 'पाठ्यक्रम उपलब्ध' : 'courses available'}
              </span>
              {(courseSearch || courseCategory !== 'all') && (
                <button
                  onClick={() => { setCourseSearch(''); setCourseCategory('all'); }}
                  className="text-xs font-bold text-[#C59B27] hover:text-amber-600 cursor-pointer underline"
                >
                  {lang === 'hi' ? 'फ़िल्टर हटाएं' : 'Clear filters'}
                </button>
              )}
            </div>

            {/* View Mode Switcher (Grid Cards vs Table) */}
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

          {/* 62 Courses — Cards Grid / Table Container */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#C59B27]" />
              <p className="text-sm font-bold text-slate-700">
                {lang === 'hi' ? 'कोई कोर्स नहीं मिला' : 'No courses found. Try a different search term or category.'}
              </p>
            </div>
          ) : courseViewMode === 'grid' ? (
            /* ================= GRID CARDS VIEW ================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => {
                const catImages = {
                  Arts:     'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
                  Science:  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
                  Commerce: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
                  Computer: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
                  Law:      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
                  Research: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
                };
                const catBadgeStyles = {
                  Arts:     'bg-purple-900/80 text-purple-200 border-purple-500/40',
                  Science:  'bg-emerald-900/80 text-emerald-200 border-emerald-500/40',
                  Commerce: 'bg-blue-900/80 text-blue-200 border-blue-500/40',
                  Computer: 'bg-cyan-900/80 text-cyan-200 border-cyan-500/40',
                  Law:      'bg-red-900/80 text-red-200 border-red-500/40',
                  Research: 'bg-amber-900/80 text-amber-200 border-amber-500/40',
                };

                const getCourseDesc = (name, cat) => {
                  if (name.includes('Ph.D.')) return 'Doctorate degree program with research dissertation, thesis guidance, and academic publications.';
                  if (name.includes('MBA') || name.includes('M.B.A.')) return 'Master degree in Business Administration, leadership, finance, marketing and corporate strategy.';
                  if (name.includes('BCA') || name.includes('B.C.A.')) return 'Software development, web technologies, DSA, database applications, and Python programming.';
                  if (name.includes('MCA') || name.includes('M.C.A.')) return 'Postgraduate computing degree specializing in cloud systems, AI, and enterprise software engineering.';
                  if (name.includes('DCA') || name.includes('D.C.A.')) return 'Govt recognized 1-year diploma in computer fundamentals, MS Office, internet tools, and Tally.';
                  if (name.includes('PGDCA') || name.includes('P.G.D.C.A.')) return 'Postgraduate diploma in computer applications, programming, database systems, and IT management.';
                  if (name.includes('B.Tech') || name.includes('M.Tech')) return 'Professional engineering degree covering core technical DSA, AI, and software systems.';
                  if (name.includes('Pharm')) return 'Pharmaceutical sciences, drug formulation, clinical pharmacy, and healthcare regulations.';
                  if (name.includes('Agri')) return 'Modern agricultural science, soil fertility, crop pathology, agronomy, and farming technology.';
                  if (name.includes('LLB') || name.includes('LLM')) return 'Legal education covering constitutional law, judiciary, advocacy, and court litigation.';
                  if (cat === 'Science') return 'Scientific curriculum with laboratory practicals, research methodologies, and foundation theory.';
                  if (cat === 'Commerce') return 'Accounting, business economics, corporate taxation, auditing, and financial management.';
                  if (cat === 'Computer') return 'Software development, database administration, web development, and IT systems.';
                  if (cat === 'Law') return 'Legal education, jurisprudence, corporate laws, and judicial preparation.';
                  if (cat === 'Research') return 'Higher academic research, thesis publication, and specialized subject mastery.';
                  return 'Authorized university degree program with full syllabus scheme, exam support, and career counseling.';
                };

                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      fireCelebration({ x: 0.5, y: 0.5 });
                      setActiveTab('inquiry');
                    }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col cursor-pointer group relative transition-all duration-300"
                  >
                    {/* Top Image Banner */}
                    <div className="relative h-36 overflow-hidden bg-slate-900">
                      <img
                        src={catImages[course.category] || catImages.Arts}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                      {/* Shimmer Light sweep effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                      {/* Category Badge Top Left */}
                      <span className={`absolute top-2.5 left-2.5 backdrop-blur-md text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${catBadgeStyles[course.category]}`}>
                        {course.category}
                      </span>

                      {/* Duration Tag Top Right */}
                      <span className="absolute top-2.5 right-2.5 bg-[#C59B27] text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
                        {course.duration}
                      </span>

                      {/* Icon overlay bottom left */}
                      <div className="absolute -bottom-3 left-3">
                        <div className="w-8 h-8 rounded-xl bg-[#071530] border-2 border-white text-[#C59B27] flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 pt-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10.5px] font-bold uppercase tracking-wider mb-1">
                          <span>Program #{course.id}</span>
                        </div>
                        <h3 className="font-serif-academic font-extrabold text-base text-[#071530] leading-snug group-hover:text-amber-600 transition-colors">
                          {course.name}
                        </h3>
                        {isScholarshipCourse(course) && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300/80 px-2 py-0.5 rounded-md w-fit">
                            <span>🎓 100% Scholarship Benefit (MPTASS/NSP)</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed font-normal">
                          {getCourseDesc(course.name, course.category)}
                        </p>
                      </div>

                      {/* Footer Action Button */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#071530] group-hover:text-[#C59B27]">
                        <span className="uppercase tracking-wider text-[11px] font-black">APPLY / INQUIRE NOW</span>
                        <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#C59B27] text-slate-700 group-hover:text-slate-950 flex items-center justify-center transition-all shadow-xs">
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= TABLE VIEW ================= */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 bg-[#071530] text-[#C59B27] text-[11px] font-black uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-6 sm:col-span-7">Course Name</div>
                <div className="col-span-3 sm:col-span-2 text-center">Category</div>
                <div className="col-span-2 text-right">Duration</div>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredCourses.map((course, idx) => {
                  const rowCatBadge = {
                    Arts:     'bg-purple-50 text-purple-600 border-purple-200',
                    Science:  'bg-green-50 text-green-600 border-green-200',
                    Commerce: 'bg-blue-50 text-blue-600 border-blue-200',
                    Computer: 'bg-cyan-50 text-cyan-600 border-cyan-200',
                    Law:      'bg-red-50 text-red-600 border-red-200',
                    Research: 'bg-amber-50 text-amber-600 border-amber-200',
                  };
                  return (
                    <div
                      key={course.id}
                      onClick={() => {
                        fireCelebration({ x: 0.5, y: 0.5 });
                        setActiveTab('inquiry');
                      }}
                      className={`grid grid-cols-12 px-5 py-3.5 items-center text-sm transition-colors hover:bg-amber-50/40 cursor-pointer ${idx % 2 === 0 ? '' : 'bg-slate-50/40'}`}
                    >
                      <div className="col-span-1 text-xs font-bold text-slate-400">{course.id}</div>
                      <div className="col-span-6 sm:col-span-7 font-bold text-[#071530] text-sm leading-snug">
                        {course.name}
                      </div>
                      <div className="col-span-3 sm:col-span-2 flex justify-center">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${rowCatBadge[course.category] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {course.category}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-xs font-bold text-[#C59B27] bg-[#C59B27]/10 px-2 py-0.5 rounded-lg">
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: ACCREDITATIONS & KEY STATISTICS */}
      {/* ========================================================================= */}
      <section className="bg-[#071530] text-white py-16 sm:py-24 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C59B27]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center relative z-10">
          
          <div className="max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30 inline-block">
              TRUST &amp; RECOGNITIONS
            </span>
            <h2 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Academic Milestones &amp; Institutional Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Empowering students across Central India since 2011 with verified government and university accreditations.
            </p>
          </div>

          {/* 5 Animated Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-[#0A1931]/80 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
            <div className="space-y-2 pt-4 md:pt-0 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <GraduationCap className="w-8 h-8 animate-badge-bounce" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 block">
                <AnimatedCounter end={18500} suffix="+" />
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Students Guided
              </span>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Building2 className="w-8 h-8 animate-badge-bounce" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 block">
                <AnimatedCounter end={28} suffix="+" />
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                University Affiliations
              </span>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <BookOpen className="w-8 h-8 animate-badge-bounce" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 block">
                <AnimatedCounter end={50} suffix="+" />
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Degree &amp; Diplomas
              </span>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Award className="w-8 h-8 animate-badge-bounce" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 block">
                <AnimatedCounter end={15} suffix="+" />
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Years of Excellence
              </span>
            </div>

            <div className="space-y-2 pt-4 md:pt-0 col-span-2 md:col-span-1 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Star className="w-8 h-8 animate-badge-bounce" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 block">
                <AnimatedCounter end={95} suffix="%" />
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Career Guidance Rate
              </span>
            </div>
          </div>

          {/* Accreditations Banner */}
          <div className="bg-[#0A1931] border border-[#C59B27]/40 rounded-2xl p-5 max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>UGC Approved Universities</span>
            </div>
            <div className="flex items-center gap-2 text-[#C59B27]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>MP Higher Education Department</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Society Reg. 06/03/01/12345/18</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>100% Marksheet &amp; Degree Verification</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: CAMPUS EXPERIENCE & EVENTS */}
      {/* ========================================================================= */}
      <section className="bg-white text-slate-900 py-16 sm:py-24 border-b border-slate-200 overflow-hidden">
        <div ref={experienceRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Campus Slider - Slides in from Left with Fade-In */}
            <div className={`lg:col-span-6 relative transition-all duration-1000 ease-out ${
              experienceInView 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 -translate-x-12 sm:-translate-x-20 pointer-events-none'
            }`}>
              <CampusEventSlider lang={lang} />
            </div>

            {/* Right: Details & Highlights - More Than a Degree, About PKC (Slides in from Right with Fade-In) */}
            <div className={`lg:col-span-6 space-y-6 transition-all duration-1000 ease-out delay-150 ${
              experienceInView 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-12 sm:translate-x-20 pointer-events-none'
            }`}>
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27] block mb-1">
                  LIFE AT PKC INSTITUTE
                </span>
                <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-[#071530] leading-snug">
                  More Than a Degree, <br />It's an Academic Experience
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  From personalized counseling to verified degree completion, scholarship processing, and computer lab practice, we provide complete end-to-end guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Users className="w-4 h-4 text-[#C59B27]" />
                    <span>Vibrant Student Care</span>
                  </div>
                  <p className="text-xs text-slate-500">Dedicated counselors for admissions &amp; exams.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Compass className="w-4 h-4 text-[#C59B27]" />
                    <span>University Tie-ups</span>
                  </div>
                  <p className="text-xs text-slate-500">Direct enrollments into 28+ universities.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Laptop className="w-4 h-4 text-[#C59B27]" />
                    <span>Practical Computer Labs</span>
                  </div>
                  <p className="text-xs text-slate-500">Hands-on practice for DCA, PGDCA &amp; CPCT.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                    <span>Scholarship Desk</span>
                  </div>
                  <p className="text-xs text-slate-500">MPTASS &amp; NSP government scholarship assistance.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('about')}
                  className="bg-[#071530] hover:bg-[#0a1f44] text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>ABOUT PKC INSTITUTE</span>
                  <ArrowRight className="w-4 h-4 text-[#C59B27]" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: STAY CONNECTED & DIRECT ADMISSION DESK */}
      {/* ========================================================================= */}
      <section className="bg-white text-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Gold Subscribe Banner */}
          <div className="bg-[#C59B27] rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-slate-950">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0 shadow-lg">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#071530] block">
                  STAY CONNECTED
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-slate-950 mt-0.5">
                  Subscribe for admission alerts, counseling &amp; academic updates.
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2.5">
              {newsletterSubscribed ? (
                <div className="bg-[#071530] text-white px-6 py-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed successfully!</span>
                </div>
              ) : (
                <>
                  <input 
                    type="email"
                    placeholder="Enter your email address..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full sm:w-72 bg-white text-slate-900 placeholder-slate-400 text-xs px-4 py-3.5 rounded-xl border border-amber-600 focus:outline-none shadow-sm"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#071530] hover:bg-[#061124] text-white font-black text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-md cursor-pointer shrink-0"
                  >
                    SUBSCRIBE
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Direct Campus Admission Counter Banner */}
          <div className="bg-[#071530] text-white rounded-3xl p-8 sm:p-10 border border-[#C59B27]/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <span className="text-xs font-black uppercase tracking-widest text-[#C59B27]">
                CAMPUS ADMISSION COUNTER &amp; HELPLINE
              </span>
              <h3 className="font-serif-academic text-2xl font-bold text-white">
                PKC Education Learning Institute &amp; Consultancy
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Head Office: Near Bus Stand, Chhatarpur (M.P.) - 471001 • Helpline: <strong className="text-white">+91 7000212637</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  fireCelebration({ x: 0.75, y: 0.75 });
                  setActiveTab('inquiry');
                }}
                className="bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>DIRECT ADMISSION INQUIRY</span>
              </button>

              <a
                href="https://wa.me/917000212637?text=Hello%20PKC%20Education%2C%20I%20have%20an%20inquiry%20regarding%20admissions."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WHATSAPP (7000212637)</span>
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
