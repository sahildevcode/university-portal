import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestimonialSlider({ lang = 'en' }) {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 6 Rich Default Demo Banners (Wide High-Resolution Images)
  const defaultSlides = [
    {
      id: 'tst-1',
      title: 'Annual Convocation & Degree Distribution Ceremony',
      imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
      active: true
    },
    {
      id: 'tst-2',
      title: 'Computer Lab Practical Training & Web Tech',
      imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1600&auto=format&fit=crop',
      active: true
    },
    {
      id: 'tst-3',
      title: 'State Merit Felicitation & Scholarship Awards',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop',
      active: true
    },
    {
      id: 'tst-4',
      title: 'Campus Career Guidance & Counseling Desk',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1600&auto=format&fit=crop',
      active: true
    },
    {
      id: 'tst-5',
      title: 'University Campus & Higher Education Learning',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop',
      active: true
    },
    {
      id: 'tst-6',
      title: 'Youth Academic Success & Degree Placement',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop',
      active: true
    }
  ];

  useEffect(() => {
    const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://pkc-university-api.onrender.com';
    fetch(`${apiBase}/api/testimonials`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const activeOnly = data.testimonials.filter(t => t.active !== false && t.imageUrl);
          setSlides(activeOnly.length > 0 ? activeOnly : defaultSlides);
        } else {
          setSlides(defaultSlides);
        }
      })
      .catch(() => setSlides(defaultSlides));
  }, []);

  const activeSlides = slides.length > 0 ? slides : defaultSlides;

  // Auto-slide effect every 4.5 seconds (supports any number of images with NO LIMIT)
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
      className="w-full bg-[#071530] py-8 sm:py-12 relative overflow-hidden border-y border-[#C59B27]/40 scroll-mt-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PURE IMAGE BOX: The entire box is filled 100% only with the image set by admin */}
        <div className="relative w-full h-[260px] sm:h-[380px] md:h-[460px] lg:h-[540px] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C59B27]/50 bg-slate-950 group">
          
          {/* Active Image (fills 100% of the entire box with zero obstructing text) */}
          <img 
            key={current.id || currentIndex}
            src={current.imageUrl} 
            alt={current.title || 'PKC Testimonial Banner'}
            className="w-full h-full object-cover object-center transition-all duration-700"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop';
            }}
          />

          {/* Top-Right Counter Badge */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg">
            {currentIndex + 1} / {activeSlides.length}
          </div>

          {/* Left Arrow Button */}
          <button
            onClick={handlePrev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/50 hover:bg-[#C59B27] text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-black/50 hover:bg-[#C59B27] text-white hover:text-slate-950 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Floating Navigation Dots (Supports 4, 6, 10 or ANY number of images with NO LIMIT) */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center items-center pointer-events-auto">
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
