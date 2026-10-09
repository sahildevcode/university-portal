import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestimonialSlider({ lang = 'en' }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 5 Official PKC Promotional Banners (Auto-fit & perfectly adjusted)
  const defaultSlides = [
    {
      id: 'tst-1',
      title: 'PKC Education Admissions & Scholarship Tie-Up',
      imageUrl: '/testimonials/pkc_scholarship_tieup.jpg',
      active: true
    },
    {
      id: 'tst-2',
      title: 'PKC Education Learning Institute & Consultancy Group',
      imageUrl: '/testimonials/pkc_admission_banner.jpg',
      active: true
    },
    {
      id: 'tst-3',
      title: 'Free Laptop & Tablet Scheme for Professional Courses',
      imageUrl: '/testimonials/pkc_free_laptop_mba.jpg',
      active: true
    },
    {
      id: 'tst-4',
      title: 'MBA Admissions Open in Top UGC Universities',
      imageUrl: '/testimonials/pkc_mba_admission.jpg',
      active: true
    },
    {
      id: 'tst-5',
      title: 'Tally Prime, Basic Computer & CPCT Special Batch',
      imageUrl: '/testimonials/pkc_tally_cpct_offer.jpg',
      active: true
    }
  ];

  useEffect(() => {
    fetch('/api/testimonials')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const activeOnly = data.testimonials.filter(t => t.active !== false && t.imageUrl);
          setSlides(activeOnly.length > 0 ? activeOnly : defaultSlides);
        } else {
          setSlides(defaultSlides);
        }
      })
      .catch(() => {
        const fallbackUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000/api/testimonials' : 'https://pkc-university-api.onrender.com/api/testimonials';
        fetch(fallbackUrl)
          .then(res => res.json())
          .then(data => {
            if (data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
              const activeOnly = data.testimonials.filter(t => t.active !== false && t.imageUrl);
              setSlides(activeOnly.length > 0 ? activeOnly : defaultSlides);
            }
          })
          .catch(() => setSlides(defaultSlides));
      });
  }, []);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // 1. PRELOAD all images immediately into browser cache so switching is INSTANT with 0-second delay
  useEffect(() => {
    if (!activeSlides || activeSlides.length === 0) return;
    activeSlides.forEach(slide => {
      if (slide.imageUrl) {
        const img = new Image();
        img.src = slide.imageUrl;
      }
    });
  }, [activeSlides]);

  // 2. Continuous Auto-slide every 3.5 seconds (never freezes or stops unexpectedly)
  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeSlides.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeSlides.length]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeSlides.length);
  };

  return (
    <section 
      id="testimonials-section"
      className="w-full bg-[#071530] py-6 sm:py-10 relative overflow-hidden border-y border-[#C59B27]/40 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PURE IMAGE BOX: The entire box is filled 100% ONLY with the image set by admin */}
        <div className="relative w-full h-[260px] sm:h-[380px] md:h-[460px] lg:h-[540px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C59B27]/50 bg-slate-950 group select-none">
          
          {/* ALL IMAGES ARE PRE-RENDERED & STACKED IN DOM:
              This completely eliminates the 1-2 second black screen flash during transitions!
              Crossfade animation is buttery smooth and instantaneous. */}
          {activeSlides.map((slide, idx) => {
            const isActive = currentIndex === idx;
            return (
              <div 
                key={slide.id || idx}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Ambient Blurred Backdrop: Fills entire widescreen slider smoothly with poster colors (no awkward black bars) */}
                <img 
                  src={slide.imageUrl} 
                  alt="" 
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-center blur-2xl opacity-40 scale-110 pointer-events-none select-none"
                />
                <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

                {/* Main Crisp Image: Completely uncropped & preserved aspect ratio (all courses, text, phones visible) */}
                <img 
                  src={slide.imageUrl} 
                  alt={slide.title || `PKC Banner ${idx + 1}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="relative z-10 w-full h-full object-contain object-center drop-shadow-2xl select-none"
                  onError={(e) => {
                    e.target.src = '/testimonials/pkc_admission_banner.jpg';
                  }}
                />
              </div>
            );
          })}

          {/* Top-Right Counter Badge (z-20 so it stays visible on top) */}
          <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg pointer-events-none">
            {currentIndex + 1} / {activeSlides.length}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/50 hover:bg-[#C59B27] text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/50 hover:bg-[#C59B27] text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Floating Navigation Dots */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-2 max-w-[90%] overflow-x-auto">
              {activeSlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer shrink-0 ${
                    currentIndex === idx 
                      ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/50' 
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
