import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  Building2, 
  Users, 
  Sparkles, 
  Star, 
  MapPin, 
  Compass, 
  PhoneCall, 
  Laptop, 
  Briefcase, 
  Play, 
  Mail, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare
} from 'lucide-react';
import { translations } from '../utils/translations';
import CampusEventSlider from '../components/CampusEventSlider';

export default function MainUniversityHome({ 
  setActiveTab, 
  courses = [], 
  studentUser, 
  lang = 'hi',
  onOpenStudentAuth, 
  onOpenStaffAuth, 
  onOpenAdminAuth 
}) {
  const t = translations[lang] || translations.hi;

  // 0 to 4 for the 5 distinct full-page sections
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;
  const isThrottled = useRef(false);

  // Newsletter subscribe state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const slidesMeta = [
    { id: 0, label: lang === 'hi' ? '01 • मुख्य पृष्ठ व विरासत' : '01 • Welcome & Legacy' },
    { id: 1, label: lang === 'hi' ? '02 • पाठ्यक्रम व डिग्री' : '02 • Academic Programs' },
    { id: 2, label: lang === 'hi' ? '03 • मान्यताएं व आंकड़े' : '03 • Accreditations & Stats' },
    { id: 3, label: lang === 'hi' ? '04 • कैंपस जीवन अनुभव' : '04 • Campus Experience' },
    { id: 4, label: lang === 'hi' ? '05 • सूचनाएं व संपर्क' : '05 • Alerts & Contact' }
  ];

  // Scroll wheel event listener for page-by-page fade transition
  useEffect(() => {
    const handleWheel = (e) => {
      if (isThrottled.current) return;
      if (Math.abs(e.deltaY) < 25) return;

      if (e.deltaY > 0) {
        // Scrolling Down -> Next Page
        if (currentSlide < totalSlides - 1) {
          e.preventDefault();
          isThrottled.current = true;
          setCurrentSlide(prev => prev + 1);
          setTimeout(() => { isThrottled.current = false; }, 850);
        }
      } else {
        // Scrolling Up -> Prev Page
        if (currentSlide > 0) {
          e.preventDefault();
          isThrottled.current = true;
          setCurrentSlide(prev => prev - 1);
          setTimeout(() => { isThrottled.current = false; }, 850);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentSlide]);

  // Touch swipe support for mobile
  useEffect(() => {
    let touchStartY = 0;
    
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isThrottled.current) return;
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentSlide < totalSlides - 1) {
          // Swiped Up -> Next Slide
          isThrottled.current = true;
          setCurrentSlide(prev => prev + 1);
          setTimeout(() => { isThrottled.current = false; }, 850);
        } else if (diff < 0 && currentSlide > 0) {
          // Swiped Down -> Prev Slide
          isThrottled.current = true;
          setCurrentSlide(prev => prev - 1);
          setTimeout(() => { isThrottled.current = false; }, 850);
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSlide]);

  // Keyboard navigation (ArrowDown / ArrowUp / PageDown / PageUp)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentSlide < totalSlides - 1) {
          e.preventDefault();
          setCurrentSlide(prev => prev + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentSlide > 0) {
          e.preventDefault();
          setCurrentSlide(prev => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4000);
  };

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
    <div className="relative min-h-[calc(100vh-80px)] h-[calc(100vh-80px)] overflow-hidden bg-slate-900 text-slate-900 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* FLOATING VERTICAL PAGE NAVIGATOR (Right Edge) */}
      {/* ========================================================================= */}
      <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3 pointer-events-auto">
        {slidesMeta.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className="group flex items-center gap-2.5 cursor-pointer"
            title={s.label}
          >
            <span className={`text-[10px] font-bold uppercase tracking-wider transition-all duration-300 hidden md:inline px-2 py-0.5 rounded shadow-sm ${
              currentSlide === idx 
                ? 'bg-[#071530] text-[#C59B27] border border-[#C59B27]/40 opacity-100 translate-x-0' 
                : 'bg-white/90 text-slate-600 border border-slate-200 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
            }`}>
              {s.label}
            </span>
            <span className={`rounded-full transition-all duration-300 border-2 ${
              currentSlide === idx 
                ? 'w-4 h-4 bg-[#C59B27] border-[#071530] scale-125 shadow-md ring-2 ring-amber-400/50' 
                : 'w-2.5 h-2.5 bg-slate-400 border-white hover:bg-[#C59B27] group-hover:scale-110'
            }`} />
          </button>
        ))}

        {/* Up / Down Arrow Floating Buttons */}
        <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-slate-400/30">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-800 hover:bg-[#071530] hover:text-[#C59B27] flex items-center justify-center shadow-md disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
            title="Previous Page (Scroll Up)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            disabled={currentSlide === totalSlides - 1}
            onClick={() => setCurrentSlide(prev => Math.min(totalSlides - 1, prev + 1))}
            className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 text-slate-800 hover:bg-[#071530] hover:text-[#C59B27] flex items-center justify-center shadow-md disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
            title="Next Page (Scroll Down)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 0: HERO & LEGACY (Full Page Fade View) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-[#071530] text-white transition-all duration-700 ease-in-out ${
          currentSlide === 0 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10' 
            : 'opacity-0 -translate-y-8 scale-95 pointer-events-none -z-10'
        }`}
      >
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/15 px-3.5 py-1 rounded border border-[#C59B27]/40">
                  {lang === 'hi' ? 'बुंदेलखंड एवं मध्य भारत का प्रतिष्ठित संस्थान' : 'SHAPING MINDS. INSPIRING FUTURES.'}
                </span>
              </div>

              <h1 className="font-serif-academic text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-white">
                A Legacy of Excellence. <br />
                <span className="text-[#C59B27] italic font-serif-academic font-bold">
                  A Future of Impact.
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                {lang === 'hi' 
                  ? 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट एवं कंसल्टेंसी में हम वर्ष 2011 से छात्र-छात्राओं को यूजीसी मान्यता प्राप्त विश्वविद्यालयों से प्रमाणित डिग्री, कंप्यूटर डिप्लोमा एवं पारदर्शी कैरियर मार्गदर्शन प्रदान कर रहे हैं।'
                  : 'At PKC Education Learning Institute & Consultancy, we empower students to think critically, lead courageously, and earn certified degrees from top UGC approved universities across India.'
                }
              </p>

              {/* Dual Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('courses')}
                  className="w-full sm:w-auto bg-[#0A1931] hover:bg-[#061124] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-md border border-[#C59B27]/60 shadow-lg hover:border-[#C59B27] transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <span>{t.viewCourses}</span>
                  <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('inquiry')}
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#071530] font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded-md shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{t.onlineInquiry}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Social Proof */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 border-t border-slate-800/80">
                <div className="flex -space-x-2 overflow-hidden">
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071530] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071530] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071530] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop" alt="Student" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-[#071530] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Student" />
                </div>
                <div className="text-left text-xs">
                  <strong className="text-white block font-bold">
                    Join 18,500+ Students Guided
                  </strong>
                  <span className="text-slate-400 block text-[11px]">
                    From 50+ Districts Across Madhya Pradesh
                  </span>
                </div>
              </div>

            </div>

            {/* Right: Floating Honor Badge */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="bg-[#0A1931]/95 border-2 border-[#C59B27]/70 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md max-w-xs text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27]">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C59B27] block">
                  15+ YEARS OF TRUST
                </span>
                <h3 className="font-serif-academic text-lg font-bold text-white leading-snug">
                  Ranked Among Top Educational Consultancies in MP
                </h3>
                <p className="text-xs text-slate-300">
                  Approved &amp; Registered Educational Society • Reg. No. 06/03/01/12345/18
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-[#C59B27] font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>UGC &amp; MP Govt Recognized</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Scroll Hint */}
          <div 
            onClick={() => setCurrentSlide(1)}
            className="pt-6 flex flex-col items-center justify-center gap-1 text-xs text-[#C59B27] font-bold cursor-pointer hover:opacity-80 transition-opacity animate-bounce select-none"
          >
            <span>{lang === 'hi' ? 'नीचे स्क्रॉल करें / Scroll Down To Explore' : 'Scroll Down To Explore'}</span>
            <ChevronDown className="w-4 h-4" />
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 1: PILLARS & FIND YOUR PATH TO SUCCESS (Full Page Fade View) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-slate-50 text-slate-900 transition-all duration-700 ease-in-out overflow-y-auto ${
          currentSlide === 1 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10' 
            : currentSlide > 1
              ? 'opacity-0 -translate-y-8 scale-95 pointer-events-none -z-10'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none -z-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 space-y-5">
          
          {/* 4 Pillars Strip */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 sm:p-5 grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#071530]">Academic Excellence</h4>
                <p className="text-[11px] text-slate-500">UGC-approved curricula &amp; faculty.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-9 h-9 rounded bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#071530]">Statewide Community</h4>
                <p className="text-[11px] text-slate-500">18,500+ students from 50+ districts.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-9 h-9 rounded bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#071530]">Modern Computer Labs</h4>
                <p className="text-[11px] text-slate-500">Dedicated labs &amp; practical guidance.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-9 h-9 rounded bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/40 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#071530]">Career Focused</h4>
                <p className="text-[11px] text-slate-500">Job assistance &amp; verified degrees.</p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C59B27]">
                OUR PROGRAMS
              </span>
              <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-[#071530]">
                Find Your Path to Success
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className="bg-[#071530] hover:bg-[#0a1f44] text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>VIEW ALL PROGRAMS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
            </button>
          </div>

          {/* 5 Vertical Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {programCategories.map((prog) => {
              const Icon = prog.icon;
              return (
                <div
                  key={prog.id}
                  onClick={() => setActiveTab('courses')}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
                >
                  <div className="relative h-32 overflow-hidden bg-slate-900">
                    <img 
                      src={prog.image} 
                      alt={prog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute -bottom-3 left-3">
                      <div className="w-8 h-8 rounded-full bg-[#071530] border border-white text-[#C59B27] flex items-center justify-center shadow-md">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <span className="absolute top-2 right-2 bg-black/70 text-[#C59B27] text-[9px] font-black uppercase px-2 py-0.5 rounded border border-[#C59B27]/40">
                      {prog.badge}
                    </span>
                  </div>

                  <div className="p-3 pt-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        {prog.discipline}
                      </span>
                      <h3 className="font-serif-academic font-bold text-xs sm:text-sm text-[#071530] leading-snug group-hover:text-amber-600 transition-colors">
                        {prog.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {prog.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#071530] group-hover:text-[#C59B27]">
                      <span className="uppercase tracking-wider">EXPLORE SYLLABUS</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 2: ACCREDITATIONS & KEY STATISTICS (Full Page Fade View) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-[#071530] text-white transition-all duration-700 ease-in-out ${
          currentSlide === 2 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10' 
            : currentSlide > 2
              ? 'opacity-0 -translate-y-8 scale-95 pointer-events-none -z-10'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none -z-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-8 text-center">
          
          <div className="max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27]">
              TRUST &amp; RECOGNITIONS
            </span>
            <h2 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Academic Milestones &amp; Institutional Trust
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Empowering students across Central India since 2011 with verified government and university accreditations.
            </p>
          </div>

          {/* 5 Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="space-y-1.5 pt-3 md:pt-0">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <GraduationCap className="w-8 h-8" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-white block">
                18,500+
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Students Guided
              </span>
            </div>

            <div className="space-y-1.5 pt-3 md:pt-0">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Building2 className="w-8 h-8" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-white block">
                28+
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                University Affiliations
              </span>
            </div>

            <div className="space-y-1.5 pt-3 md:pt-0">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <BookOpen className="w-8 h-8" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-white block">
                50+
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Degree &amp; Diplomas
              </span>
            </div>

            <div className="space-y-1.5 pt-3 md:pt-0">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Award className="w-8 h-8" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-white block">
                15+
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Years of Excellence
              </span>
            </div>

            <div className="space-y-1.5 pt-3 md:pt-0 col-span-2 md:col-span-1">
              <div className="flex justify-center text-[#C59B27] mb-1">
                <Star className="w-8 h-8" />
              </div>
              <strong className="font-serif-academic text-4xl sm:text-5xl font-black text-white block">
                95%
              </strong>
              <span className="text-xs text-slate-300 uppercase tracking-wider block font-bold">
                Career Guidance Rate
              </span>
            </div>
          </div>

          {/* Accreditations Banner */}
          <div className="bg-[#0A1931] border border-[#C59B27]/40 rounded-xl p-4 max-w-4xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>UGC Approved Universities</span>
            </div>
            <div className="flex items-center gap-2 text-[#C59B27]">
              <CheckCircle2 className="w-4 h-4" />
              <span>MP Higher Education Department</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Society Reg. 06/03/01/12345/18</span>
            </div>
            <div className="flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Marksheet &amp; Degree Verification</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 3: CAMPUS EXPERIENCE ("More Than a Degree, It's an Experience") */}
      {/* ========================================================================= */}
      <div 
        className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-white text-slate-900 transition-all duration-700 ease-in-out overflow-y-auto ${
          currentSlide === 3 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10' 
            : currentSlide > 3
              ? 'opacity-0 -translate-y-8 scale-95 pointer-events-none -z-10'
              : 'opacity-0 translate-y-8 scale-95 pointer-events-none -z-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: Campus Moments, Functions & Events Showcase Slider */}
            <div className="lg:col-span-6 relative">
              <CampusEventSlider lang={lang} />
            </div>

            {/* Right: Content & 4 Tiles */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C59B27]">
                  LIFE AT PKC INSTITUTE
                </span>
                <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-[#071530] leading-snug">
                  More Than a Degree, <br />It's an Experience
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  From personalized counseling to verified degree completion, scholarship processing, and computer lab practice, we provide complete end-to-end guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Users className="w-4 h-4 text-[#C59B27]" />
                    <span>Vibrant Student Care</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Dedicated counselor for admissions &amp; exams.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Compass className="w-4 h-4 text-[#C59B27]" />
                    <span>University Tie-ups</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Direct enrollments into 28+ universities.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <Laptop className="w-4 h-4 text-[#C59B27]" />
                    <span>Practical Computer Labs</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Hands-on training for DCA, PGDCA &amp; CPCT.</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-0.5">
                  <div className="flex items-center gap-2 text-[#071530] font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#C59B27]" />
                    <span>Support Services</span>
                  </div>
                  <p className="text-[10px] text-slate-500">MPTASS &amp; NSP scholarship desk.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('about')}
                className="bg-[#071530] hover:bg-[#0a1f44] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>EXPLORE ABOUT PKC</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SLIDE 4: STAY CONNECTED & DIRECT INQUIRY DESK (Full Page Fade View) */}
      {/* ========================================================================= */}
      <div 
        className={`absolute inset-0 w-full h-full flex flex-col justify-center bg-white text-slate-900 transition-all duration-700 ease-in-out overflow-y-auto ${
          currentSlide === 4 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto z-10' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none -z-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 space-y-6">
          
          {/* Gold Subscribe Banner */}
          <div className="bg-[#C59B27] rounded-xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-slate-950">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0 shadow-md">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#071530] block">
                  STAY CONNECTED
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-950">
                  Subscribe for admission alerts, exam forms &amp; syllabus updates.
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2">
              {newsletterSubscribed ? (
                <div className="bg-[#071530] text-white px-5 py-3 rounded-md text-xs font-bold flex items-center gap-2">
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
                    className="w-full sm:w-64 bg-white text-slate-900 placeholder-slate-400 text-xs px-4 py-3 rounded-md border border-amber-600 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#071530] hover:bg-[#061124] text-white font-black text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-md cursor-pointer shrink-0"
                  >
                    SUBSCRIBE
                  </button>
                </>
              )}
            </form>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="bg-[#071530] text-white rounded-xl p-6 sm:p-8 border border-[#C59B27]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C59B27]">
                CAMPUS ADMISSION COUNTER
              </span>
              <h3 className="font-serif-academic text-xl font-bold text-white">
                PKC Education Learning Institute &amp; Consultancy
              </h3>
              <p className="text-xs text-slate-300">
                Head Office: Near Bus Stand, Chhatarpur (M.P.) - 471001 • Helpline: +91 98765 43210
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('inquiry')}
                className="bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-md shadow-md cursor-pointer"
              >
                DIRECT ADMISSION INQUIRY
              </button>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-md shadow-md flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WHATSAPP DESK</span>
              </a>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 pt-2">
            © {new Date().getFullYear()} PKC Education Learning Institute &amp; Consultancy • P.K.C. Shiksha Prasar Evam Jan Kalyan Samiti
          </div>

        </div>
      </div>

    </div>
  );
}
