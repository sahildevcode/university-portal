import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Image as ImageIcon, 
  Filter, 
  GraduationCap, 
  Building2, 
  Users, 
  Award,
  X
} from 'lucide-react';

export default function GalleryPage({ lang = 'en' }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState(null);

  const galleryItems = [
    {
      id: 1,
      title: 'University Convocation & Degree Distribution Ceremony',
      category: 'Graduation',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
      desc: 'Annual convocation ceremony awarding UGC recognized degrees to graduating students.'
    },
    {
      id: 2,
      title: 'Modern High-Tech Computer Science Laboratory',
      category: 'Campus & Labs',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
      desc: 'State-of-the-art computer labs with high-speed internet and software tools for DCA & PGDCA students.'
    },
    {
      id: 3,
      title: 'Academic Career Counseling & Admission Guidance Session',
      category: 'Events & Seminars',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
      desc: 'Free student guidance seminar covering university selections and MPTASS scholarship portals.'
    },
    {
      id: 4,
      title: 'Student Honor & Merit Award Function',
      category: 'Celebrations',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
      desc: 'Celebrating top academic rankers and degree completion milestones.'
    },
    {
      id: 5,
      title: 'Central University Library & Academic Reading Lounge',
      category: 'Campus & Labs',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop',
      desc: 'Extensive library collection of university textbooks, research journals, and study modules.'
    },
    {
      id: 6,
      title: 'Corporate Leadership & Management Workshop (MBA / BBA)',
      category: 'Events & Seminars',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
      desc: 'Interactive industry expert workshop on corporate leadership and business analytics.'
    },
    {
      id: 7,
      title: 'Annual Youth Festival & Cultural Campus Gathering',
      category: 'Celebrations',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
      desc: 'Vibrant cultural performances and student youth festival at PKC Institute campus.'
    },
    {
      id: 8,
      title: 'Engineering & Technology Innovation Showcase (B.Tech / MCA)',
      category: 'Campus & Labs',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
      desc: 'Technical project exhibitions showcasing software development and AI prototypes.'
    }
  ];

  const categories = ['all', 'Campus & Labs', 'Graduation', 'Events & Seminars', 'Celebrations'];

  const filteredItems = selectedFilter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedFilter);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fadeIn">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C59B27] bg-[#C59B27]/10 px-4 py-1.5 rounded-full border border-[#C59B27]/30 inline-flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>CAMPUS LIFE &amp; EVENTS</span>
          </span>
          <h1 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-black text-[#071530] tracking-tight">
            Photo &amp; Event Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore moments of academic excellence, campus infrastructure, computer laboratories, student convocation, and institutional celebrations at PKC Education Institute.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedFilter === cat
                  ? 'bg-[#071530] text-[#C59B27] border-[#C59B27]/50 shadow-md scale-105 font-black'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Photos' : cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setPreviewImage(item)}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#071530]/90 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-md border border-amber-400/30">
                  {item.category}
                </span>
              </div>
              <div className="p-4 space-y-1 flex-1 flex flex-col justify-between">
                <h3 className="font-serif-academic font-bold text-sm text-[#071530] group-hover:text-amber-600 transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal Preview */}
        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
            <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center font-bold text-lg hover:bg-rose-600 transition-colors cursor-pointer border border-white/20"
              >
                ✕
              </button>
              <img
                src={previewImage.image}
                alt={previewImage.title}
                className="w-full max-h-[70vh] object-cover"
              />
              <div className="p-6 text-white bg-slate-950 space-y-1">
                <span className="text-amber-400 text-xs font-black uppercase tracking-wider block">
                  {previewImage.category}
                </span>
                <h3 className="text-xl font-bold font-serif-academic text-white">
                  {previewImage.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {previewImage.desc}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
