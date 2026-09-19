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
                  <span>{lang === 'hi' ? 'बुंदेलखंड एवं मध्य भारत का प्रतिष्ठित संस्थान' : 'SHAPING MINDS. INSPIRING FUTURES.'}</span>
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
      {/* SECTION 2: ACADEMIC PROGRAMS & DISCIPLINES */}
      {/* ========================================================================= */}
      <section className="bg-slate-50 text-slate-900 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* 4 Pillars Strip */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-7 grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#071530]">Academic Excellence</h4>
                <p className="text-xs text-slate-500 mt-0.5">UGC-approved curricula &amp; notes.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-5">
              <div className="w-11 h-11 rounded-xl bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/40 flex items-center justify-center shrink-0 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#071530]">Statewide Community</h4>
                <p className="text-xs text-slate-500 mt-0.5">18,500+ guided scholars.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-5">
              <div className="w-11 h-11 rounded-xl bg-[#071530] text-[#C59B27] flex items-center justify-center shrink-0 shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#071530]">Modern Computer Labs</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hands-on practicals &amp; CPCT.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 pt-4 sm:pt-0 sm:pl-5">
              <div className="w-11 h-11 rounded-xl bg-[#C59B27]/15 text-[#C59B27] border border-[#C59B27]/40 flex items-center justify-center shrink-0 shadow-sm">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#071530]">Career Focused</h4>
                <p className="text-xs text-slate-500 mt-0.5">Job guidance &amp; degree award.</p>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27] block mb-1">
                ACADEMIC CURRICULA &amp; DEGREE COURSES
              </span>
              <h2 className="font-serif-academic text-3xl sm:text-4xl font-bold text-[#071530]">
                {lang === 'hi' ? 'अपने उज्ज्वल भविष्य का सही कोर्स चुनें' : 'Find Your Path to Academic Success'}
              </h2>
            </div>
            <button
              onClick={() => {
                fireCelebration({ x: 0.7, y: 0.4 });
                setActiveTab('courses');
              }}
              className="bg-[#071530] hover:bg-[#0a1f44] text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto group"
            >
              <span>VIEW ALL PROGRAMS</span>
              <ArrowRight className="w-4 h-4 text-[#C59B27] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Interactive Discipline Filter Tabs */}
          <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 pt-1 pb-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedFilter === 'all'
                  ? 'bg-[#071530] text-[#C59B27] shadow-md scale-105 border border-[#C59B27]/40'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सभी पाठ्यक्रम (All 5)' : 'All Programs (5)'}</span>
            </button>
            {programCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === cat.id
                    ? 'bg-[#071530] text-[#C59B27] shadow-md scale-105 border border-[#C59B27]/40'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.discipline.split('•')[0].trim()}
              </button>
            ))}
          </div>

          {/* 5 Vertical Interactive Program Cards */}
          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {programCategories
              .filter(prog => selectedFilter === 'all' || prog.id === selectedFilter)
              .map((prog, index) => {
              const Icon = prog.icon;
              return (
                <div
                  key={prog.id}
                  onClick={() => {
                    fireCelebration({ x: 0.5, y: 0.5 });
                    setActiveTab('courses');
                  }}
                  style={{
                    transitionDelay: cardsInView && selectedFilter === 'all' ? `${index * 120}ms` : '0ms'
                  }}
                  className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2.5 overflow-hidden flex flex-col cursor-pointer group relative transition-all duration-700 ease-out hover:duration-300 hover:delay-0 ${
                    cardsInView
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-16 scale-[0.98] pointer-events-none'
                  }`}
                >
                  <div className="relative h-36 overflow-hidden bg-slate-900">
                    <img 
                      src={prog.image} 
                      alt={prog.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Shimmer Light sweep effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                    <div className="absolute -bottom-3 left-3">
                      <div className="w-9 h-9 rounded-xl bg-[#071530] border-2 border-white text-[#C59B27] flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="absolute top-2.5 right-2.5 bg-black/80 text-[#C59B27] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#C59B27]/40 shadow-xs">
                      {prog.badge}
                    </span>
                  </div>

                  <div className="p-4 pt-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {prog.discipline}
                      </span>
                      <h3 className="font-serif-academic font-bold text-sm text-[#071530] leading-snug group-hover:text-amber-600 transition-colors mt-0.5">
                        {prog.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                        {prog.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#071530] group-hover:text-[#C59B27]">
                      <span className="uppercase tracking-wider text-[11px]">EXPLORE PROGRAM</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
