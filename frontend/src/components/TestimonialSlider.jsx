import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, Award, Sparkles } from 'lucide-react';

export default function TestimonialSlider({ lang = 'en' }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Default fallback slides if none in DB
  const defaultSlides = [
    {
      id: 'tst-1',
      title: '100% Placement & Practical Learning',
      studentName: 'Rahul Vishwakarma',
      course: 'Bachelor of Computer Applications (BCA)',
      review: 'PKC Institute helped me secure admission and prepare for IT placements with top software companies. The lab guidance, practical projects, and exam support were exceptional!',
      badge: 'Placed at TCS (₹4.2 LPA)',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      rating: 5
    },
    {
      id: 'tst-2',
      title: 'Best Counseling for Higher Degrees',
      studentName: 'Pooja Tiwari',
      course: 'Master of Business Administration (MBA)',
      review: 'From university selection to scholarship forms (MPTASS) and semester syllabus guidance, the PKC team gave full support throughout my 2-year masters program.',
      badge: 'University Merit Holder',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      rating: 5
    },
    {
      id: 'tst-3',
      title: 'Empowering District & Rural Students',
      studentName: 'Amit Sen',
      course: 'Diploma in Computer Applications (DCA)',
      review: 'PKC Chhatarpur is the most trusted institute for computer education. The practical computer classes helped me crack the CPCT exam and get a government job.',
      badge: 'Govt Certified IT Diploma',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
      rating: 5
    }
  ];

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.testimonials && data.testimonials.length > 0) {
          setSlides(data.testimonials.filter(t => t.active !== false));
        } else {
          setSlides(defaultSlides);
        }
      })
      .catch(() => setSlides(defaultSlides));
  }, []);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Auto-slide effect every 4.5 seconds
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
    <div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071530] via-[#0A1931] to-[#071530] text-white shadow-xl border border-[#C59B27]/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative p-6 sm:p-10 lg:p-12">
        
        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'hi' ? 'छात्रों के अनुभव एवं सफलता गाथा' : 'Student Success Stories & Reviews'}</span>
          </div>

          <div className="text-[11px] text-indigo-300 font-semibold hidden sm:block">
            {currentIndex + 1} / {activeSlides.length}
          </div>
        </div>

        {/* Main Slide Content: Left Text, Right Photo */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[260px]">
          
          {/* Left: Testimonial & Details (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            
            {/* Stars & Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: current.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {current.badge && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>{current.badge}</span>
                </span>
              )}
            </div>

            {/* Review Quote */}
            <blockquote className="relative text-sm sm:text-base md:text-lg text-indigo-50 font-medium leading-relaxed italic">
              <Quote className="w-8 h-8 text-indigo-400/40 absolute -top-4 -left-4 -z-10" />
              "{current.review}"
            </blockquote>

            {/* Student Info */}
            <div className="pt-2">
              <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{current.studentName}</span>
              </h4>
              <p className="text-xs text-amber-300 font-semibold">
                {current.course}
              </p>
            </div>

          </div>

          {/* Right: Student Photo / Campus Highlight (4 cols) */}
          <div className="md:col-span-4 flex justify-center md:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400 to-indigo-500 opacity-60 blur-sm group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800">
                <img 
                  src={current.imageUrl} 
                  alt={current.studentName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Navigation Controls & Dots */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
          
          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
