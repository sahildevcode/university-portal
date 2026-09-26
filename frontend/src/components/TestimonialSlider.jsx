import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Award, Sparkles, GraduationCap } from 'lucide-react';

export default function TestimonialSlider({ lang = 'en' }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 6 Rich Default Demo Slides with realistic student achievements & crisp portraits
  const defaultSlides = [
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

  useEffect(() => {
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pkc-university-api.onrender.com';
    fetch(`${apiBase}/api/testimonials`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const activeOnly = data.testimonials.filter(t => t.active !== false);
          setSlides(activeOnly.length > 0 ? activeOnly : defaultSlides);
        } else {
          setSlides(defaultSlides);
        }
      })
      .catch(() => setSlides(defaultSlides));
  }, []);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Auto-slide effect every 4.5 seconds (supports any number of images/testimonials with NO LIMIT)
  useEffect(() => {
    if (isHovered || activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, activeSlides.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  const current = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section 
      id="testimonials-section"
      className="w-full bg-gradient-to-b from-[#071530] via-[#0A1931] to-[#071530] text-white py-16 sm:py-20 relative overflow-hidden border-y border-[#C59B27]/40 scroll-mt-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Decorative Glow Accents */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>
      
      {/* Subtle Pattern Grid */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#C59B27_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'सफलता की कहानियां एवं छात्र अनुभव' : 'STUDENT VOICES & SUCCESS STORIES'}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-academic text-white tracking-tight leading-tight">
            {lang === 'hi' ? 'छात्रों की सफलता, हमारा गौरव' : 'Empowering Careers, Celebrating Student Success'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium">
            {lang === 'hi' 
              ? 'पी.के.सी. संस्थान द्वारा मार्गदर्शित विभिन्न डिग्री एवं तकनीकी पाठ्यक्रमों के सफल छात्र-छात्राओं के वास्तविक अनुभव।' 
              : 'Real stories from our students and alumni who built their careers with certified UGC degrees and guidance at PKC Institute.'}
          </p>
        </div>

        {/* 100% Width Testimonial Showcase Box */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl relative">
          
          {/* Top Status & Slide Counter */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === 'hi' ? 'सत्यापित पूर्व छात्र' : 'Verified Alumni Story'}
              </span>
            </div>
            
            <div className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
              {currentIndex + 1} / {activeSlides.length}
            </div>
          </div>

          {/* Main Slide Body: Grid Left Content, Right Image */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[280px]">
            
            {/* Left: Testimonial Details (7 Columns) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Stars & Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  {Array.from({ length: current.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-black text-amber-400 ml-1">5.0</span>
                </div>

                {current.badge && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{current.badge}</span>
                  </span>
                )}
              </div>

              {/* Title / Headline */}
              <h3 className="text-xl sm:text-2xl font-black text-white font-serif-academic leading-snug">
                "{current.title || 'Student Success Story'}"
              </h3>

              {/* Review Text */}
              <blockquote className="relative text-sm sm:text-base text-slate-200 font-medium leading-relaxed italic border-l-4 border-amber-400 pl-4 py-1">
                <Quote className="w-8 h-8 text-amber-400/20 absolute -top-4 -left-3 -z-10" />
                {current.review}
              </blockquote>

              {/* Student Info */}
              <div className="pt-2">
                <h4 className="text-lg sm:text-xl font-black text-amber-400 tracking-wide">
                  {current.studentName}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>{current.course}</span>
                </p>
              </div>

            </div>

            {/* Right: Prominent Student Image (5 Columns) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-amber-400 via-indigo-500 to-amber-300 opacity-60 blur-md group-hover:opacity-90 transition-opacity duration-500"></div>
                
                {/* Image Card Container */}
                <div className="relative w-56 h-64 sm:w-64 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-slate-900">
                  <img 
                    src={current.imageUrl} 
                    alt={current.studentName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* Bottom overlay badge */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                    <p className="text-[11px] font-black text-amber-400 truncate">{current.studentName}</p>
                    <p className="text-[10px] text-slate-300 truncate">{current.badge || current.course}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Controls: Dots & Navigation Arrows */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-8 border-t border-white/10">
            
            {/* Dots Indicator (Dynamically handles 4, 6, 10 or ANY number of testimonials with NO LIMIT) */}
            <div className="flex flex-wrap items-center gap-2">
              {activeSlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-10 bg-amber-400 shadow-md shadow-amber-400/40' 
                      : 'w-2.5 bg-white/25 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  title={slide.studentName || `Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-all cursor-pointer border border-white/20 flex items-center justify-center shadow-md active:scale-90"
                title="Previous Testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-all cursor-pointer border border-white/20 flex items-center justify-center shadow-md active:scale-90"
                title="Next Testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
