import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Sparkles, 
  Award, 
  Camera, 
  Layers
} from 'lucide-react';

const DEFAULT_EVENT_PHOTOS = [
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

export default function CampusEventSlider({ lang = 'en' }) {
  const [photos, setPhotos] = useState(DEFAULT_EVENT_PHOTOS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  // Fetch live event photos from API
  useEffect(() => {
    let isMounted = true;
    const fetchPhotos = async () => {
      try {
        const res = await fetch('/api/event-photos');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.photos) && data.photos.length > 0) {
            const activeOnly = data.photos.filter(p => p.active !== false);
            if (isMounted && activeOnly.length > 0) {
              setPhotos(activeOnly);
            }
          }
        }
      } catch (err) {
        console.warn('Using default event photos:', err);
      }
    };
    fetchPhotos();
    return () => { isMounted = false; };
  }, []);

  // Auto-play interval
  useEffect(() => {
    if (photos.length <= 1 || isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % photos.length);
    }, 4500);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [photos.length, isPaused]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % photos.length);
  };

  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div 
      className="relative w-full h-64 sm:h-80 md:h-[340px] rounded-xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with Crossfade */}
      {photos.map((photo, idx) => (
        <div
          key={photo.id || idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img 
            src={photo.imageUrl} 
            alt={photo.title || 'Campus Event'} 
            className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop';
            }}
          />
          {/* Subtle Dark Vignette & Bottom Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </div>
      ))}

      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
        {/* Category Badge */}
        <div className="flex items-center gap-1.5 bg-[#071530]/90 backdrop-blur-md text-[#C59B27] border border-[#C59B27]/40 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">
          <Sparkles className="w-3 h-3 text-[#C59B27]" />
          <span>{currentPhoto.category || 'Campus Event'}</span>
          {currentPhoto.date && (
            <span className="text-white/70 font-medium ml-1">
              • {currentPhoto.date}
            </span>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white/90 px-2 py-1 rounded-md text-[10px] font-bold border border-white/10 shadow-md">
          <Camera className="w-3 h-3 text-amber-400" />
          <span>{currentIndex + 1} / {photos.length}</span>
        </div>
      </div>

      {/* Manual Navigation Controls (Chevron Arrows) */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Photo"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-[#071530] text-white hover:text-[#C59B27] border border-white/20 hover:border-[#C59B27] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer z-20 backdrop-blur-sm shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Photo"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-[#071530] text-white hover:text-[#C59B27] border border-white/20 hover:border-[#C59B27] flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer z-20 backdrop-blur-sm shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Caption Information */}
      <div className="absolute bottom-3 left-4 right-4 z-20 text-white space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-bold uppercase tracking-widest">
          <Award className="w-3 h-3 text-[#C59B27]" />
          <span>PKC CAMPUS MOMENTS &amp; FUNCTIONS</span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white leading-tight drop-shadow-md">
          {lang === 'hi' && currentPhoto.titleHi ? currentPhoto.titleHi : currentPhoto.title}
        </h4>

        {currentPhoto.description && (
          <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed opacity-90">
            {currentPhoto.description}
          </p>
        )}

        {/* Indicator Dots */}
        {photos.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            {photos.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  dotIdx === currentIndex 
                    ? 'w-5 h-1.5 bg-[#C59B27] shadow-sm' 
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
