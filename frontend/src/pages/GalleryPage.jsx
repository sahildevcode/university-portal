import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ZoomIn, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function GalleryPage({ lang = 'hi', onNavigateTab }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  // Gallery Categories
  const categories = [
    { id: 'all', labelEn: 'All Photos', labelHi: 'सभी तस्वीरें' },
    { id: 'campus', labelEn: 'Campus & Infrastructure', labelHi: 'परिसर एवं भवन' },
    { id: 'labs', labelEn: 'Computer Labs & Smart Classes', labelHi: 'कंप्यूटर लैब व कक्षाएं' },
    { id: 'counseling', labelEn: 'Student Counseling & Desk', labelHi: 'काउंसलिंग एवं मार्गदर्शन' },
    { id: 'seminars', labelEn: 'Seminars & Workshops', labelHi: 'सेमिनार व कार्यशालाएं' },
    { id: 'events', labelEn: 'Events & Celebrations', labelHi: 'सांस्कृतिक उत्सव एवं खेल' }
  ];

  // Gallery Photos Data
  const galleryItems = [
    {
      id: 1,
      category: 'campus',
      titleEn: 'PKC Main Administrative & Academic Campus',
      titleHi: 'पी.के.सी. मुख्य प्रशासनिक एवं शैक्षणिक परिसर',
      descEn: 'Modern multi-story academic building equipped with state-of-the-art facilities, lush green campus, and student reception desk located in Chhatarpur (M.P.).',
      descHi: 'छतरपुर में स्थित आधुनिक बहुमंजिला शैक्षणिक भवन, सुसज्जित परामर्श केंद्र, हरा-भरा स्वच्छ वातावरण एवं छात्र सहायता केंद्र।',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 2,
      category: 'labs',
      titleEn: 'Advanced Computer & IT Laboratory',
      titleHi: 'आधुनिक कंप्यूटर एवं आईटी प्रयोगशाला',
      descEn: 'High-speed internet enabled computer lab with over 60 modern terminals dedicated for BCA, DCA, PGDCA, and software development practicals.',
      descHi: '60+ आधुनिक कंप्यूटर टर्मिनल्स, हाई-स्पीड इंटरनेट और नवीनतम सॉफ्टवेयर से सुसज्जित लैब, जहाँ BCA, DCA, PGDCA छात्रों को प्रैक्टिकल ट्रेनिंग दी जाती है।',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 3,
      category: 'counseling',
      titleEn: 'One-on-One Career & University Counseling Desk',
      titleHi: 'व्यक्तिगत कैरियर एवं विश्वविद्यालय काउंसलिंग डेस्क',
      descEn: 'Expert counselors guiding prospective students and parents through authorized degree courses, scholarship forms (MPTASS/NSP), and fee installments.',
      descHi: 'अनुभवी शिक्षा सलाहकारों द्वारा छात्र-छात्राओं और अभिभावकों को सही कोर्स, छात्रवृत्ति (MPTASS/NSP) एवं आसान किस्तों में फीस का संपूर्ण मार्गदर्शन।',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 4,
      category: 'seminars',
      titleEn: 'National Seminar on Career Opportunities in IT',
      titleHi: 'आईटी एवं तकनीकी क्षेत्र में रोजगार पर राष्ट्रीय सेमिनार',
      descEn: 'Industry speakers and university professors interacting with students on software development, cloud computing, and AI careers.',
      descHi: 'सॉफ्टवेयर विकास, क्लाउड तकनीक और एआई में भविष्य की संभावनाओं पर आयोजित विशेषज्ञ व्याख्यान, जिसमें छात्रों ने व्यावहारिक जानकारी प्राप्त की।',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
      date: '2025'
    },
    {
      id: 5,
      category: 'labs',
      titleEn: 'Smart Interactive Audio-Visual Classroom',
      titleHi: 'स्मार्ट इंटरैक्टिव डिजिटल क्लासरूम',
      descEn: 'Air-conditioned smart lecture rooms equipped with digital interactive boards and projector systems for engaging curriculum delivery.',
      descHi: 'डिजिटल इंटरैक्टिव बोर्ड, आधुनिक प्रोजेक्टर और वातानुकूलित कक्षाएं, जहाँ शिक्षक कठिन विषयों को सरल व दृश्य माध्यम से समझाते हैं।',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 6,
      category: 'events',
      titleEn: 'Annual Convocation & Degree Distribution Ceremony',
      titleHi: 'वार्षिक दीक्षांत समारोह एवं डिग्री वितरण उत्सव',
      descEn: 'Graduating students proudly receiving their verified university degree certificates and medals in the presence of esteemed university dignitaries.',
      descHi: 'विश्वविद्यालय के वरिष्ठ अतिथियों की उपस्थिति में सफल विद्यार्थियों को आधिकारिक डिग्रियां एवं मेडल प्रदान किए जाने का गरिमामय क्षण।',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
      date: '2025'
    },
    {
      id: 7,
      category: 'counseling',
      titleEn: 'Student Helpdesk & Document Verification Terminal',
      titleHi: 'छात्र हेल्पडेस्क एवं दस्तावेज़ सत्यापन कक्ष',
      descEn: 'Dedicated administrative desk for instant verification of marksheets, transfer certificates, and online university enrollment tracking.',
      descHi: 'मार्कशीट, ट्रांसफर सर्टिफिकेट और ऑनलाइन यूनिवर्सिटी नामांकन के त्वरित सत्यापन हेतु समर्पित छात्र सुविधा कक्ष।',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 8,
      category: 'events',
      titleEn: 'Campus Cultural Fest & Talent Showcase',
      titleHi: 'वार्षिक सांस्कृतिक उत्सव एवं प्रतिभा प्रदर्शन',
      descEn: 'Vibrant cultural programs, classical and modern music, debate competitions, and student performances celebrating youth and heritage.',
      descHi: 'छात्र-छात्राओं के सर्वांगीण विकास हेतु आयोजित रंगारंग सांस्कृतिक कार्यक्रम, वाद-विवाद प्रतियोगिता एवं कला प्रदर्शन।',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
      date: '2025'
    },
    {
      id: 9,
      category: 'campus',
      titleEn: 'Central Academic Reference Library & Reading Hall',
      titleHi: 'केंद्रीय संदर्भ पुस्तकालय एवं वाचनालय',
      descEn: 'Peaceful reading hall stocked with university syllabi, textbooks, competitive examination guides, and e-learning resources.',
      descHi: 'शांतिपूर्ण वाचनालय जहाँ विश्वविद्यालय पाठ्यक्रमों की पुस्तकें, प्रतियोगी परीक्षाओं की गाइड और डिजिटल अध्ययन सामग्री उपलब्ध है।',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 10,
      category: 'seminars',
      titleEn: 'Skill Development & CPCT / Govt Job Orientation',
      titleHi: 'कौशल विकास व सीपीसीटी / सरकारी नौकरी मार्गदर्शन कार्यशाला',
      descEn: 'Special training sessions focusing on typing efficiency, aptitude test preparation, and government service eligibility.',
      descHi: 'मध्य प्रदेश शासन की सरकारी नौकरियों हेतु आवश्यक CPCT परीक्षा की तैयारी, टाइपिंग दक्षता एवं सामान्य ज्ञान पर विशेष कार्यशाला।',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    },
    {
      id: 11,
      category: 'events',
      titleEn: 'Inter-College Sports Meet & Athletic Championship',
      titleHi: 'वार्षिक खेलकूद प्रतियोगिता एवं एथलेटिक मीट',
      descEn: 'Encouraging physical fitness and sportsmanship through cricket, badminton, volleyball, and track events for institute scholars.',
      descHi: 'छात्रों में खेल भावना व स्वास्थ्य संवर्धन हेतु आयोजित वार्षिक क्रिकेट, बैडमिंटन एवं दौड़ प्रतियोगिता।',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop',
      date: '2025'
    },
    {
      id: 12,
      category: 'counseling',
      titleEn: 'Parent-Counselor Academic Review Meeting',
      titleHi: 'अभिभावक-परामर्शदाता संवाद एवं प्रगति समीक्षा',
      descEn: 'Regular sessions with parents to discuss student attendance, semester exam progress, and university fee clearance.',
      descHi: 'अभिभावकों के साथ नियमित संवाद जिसमें छात्र की पढ़ाई, परीक्षा परिणाम और भविष्य की रणनीतियों पर पारदर्शी चर्चा की जाती है।',
      image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?q=80&w=1200&auto=format&fit=crop',
      date: '2026'
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(item => item.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setSelectedImage(filteredItems[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 animate-fadeIn">
      
      {/* 1. HERO BANNER */}
      <section className="relative bg-[#071530] text-white py-14 sm:py-20 overflow-hidden border-b border-[#C59B27]/30">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop" 
            alt="Campus Background" 
            className="w-full h-full object-cover object-center opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071530] via-[#071530]/90 to-[#071530]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#C59B27]/15 border border-[#C59B27]/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#C59B27]">
            <Camera className="w-4 h-4" />
            <span>{lang === 'hi' ? 'कैंपस व शैक्षणिक झलकियां' : 'Life at PKC Institute • 2026-27'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif-academic tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {lang === 'hi' 
              ? 'पी.के.सी. परिसर, स्मार्ट लैब्स एवं गतिविधियों की गैलरी' 
              : 'Campus Infrastructure, Modern Labs & Student Life Gallery'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'hi'
              ? 'हमारे हाई-टेक कंप्यूटर लैब्स, करियर काउंसलिंग डेस्क, शैक्षणिक सेमिनार और कैंपस जीवन की वास्तविक तस्वीरें देखें।'
              : 'Explore verified photographs of our high-tech computer labs, career guidance desks, seminars, and academic celebrations.'}
          </p>

          {/* Quick Stats Ribbon */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>60+ High-Tech PCs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Smart Classrooms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Library &amp; Study Hall</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Central Chhatarpur Campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-xl border border-slate-200 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#071530] text-[#C59B27] shadow-md border border-[#C59B27]/40'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{lang === 'hi' ? cat.labelHi : cat.labelEn}</span>
                {cat.id === 'all' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-[#C59B27] text-slate-950 font-black' : 'bg-slate-200 text-slate-700'}`}>
                    {galleryItems.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. PHOTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img
                  src={item.image}
                  alt={lang === 'hi' ? item.titleHi : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4 text-white">
                  <span className="text-xs font-bold flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    <ZoomIn className="w-3.5 h-3.5 text-[#C59B27]" />
                    <span>{lang === 'hi' ? 'बड़ा करके देखें' : 'Click to Enlarge'}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-300 bg-black/40 px-2 py-0.5 rounded">
                    {item.date}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#071530]/90 backdrop-blur-sm text-[#C59B27] border border-[#C59B27]/40 px-2.5 py-1 rounded-lg shadow-sm">
                    {categories.find(c => c.id === item.category)?.[lang === 'hi' ? 'labelHi' : 'labelEn']}
                  </span>
                </div>
              </div>

              {/* Text Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {lang === 'hi' ? item.titleHi : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {lang === 'hi' ? item.descHi : item.descEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-[#C59B27]" />
                    <span>Chhatarpur Campus</span>
                  </span>
                  <span className="font-bold text-amber-600 group-hover:underline flex items-center gap-1">
                    <span>{lang === 'hi' ? 'विवरण' : 'Details'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. LIGHTBOX MODAL */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-3 sm:p-6 py-6 sm:py-10 flex justify-center items-start animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-700 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Close */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#C59B27] bg-[#C59B27]/15 px-3 py-1 rounded-lg border border-[#C59B27]/30">
                  {categories.find(c => c.id === selectedImage.category)?.[lang === 'hi' ? 'labelHi' : 'labelEn']}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • Session {selectedImage.date}
                </span>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main High-Res Image with Prev / Next Navigation Buttons */}
            <div className="relative aspect-[16/9] sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={selectedImage.image}
                alt={lang === 'hi' ? selectedImage.titleHi : selectedImage.titleEn}
                className="w-full h-full object-contain"
              />

              {/* Prev Button */}
              <button
                onClick={handlePrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                title="Previous Photo (Arrow Left)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                title="Next Photo (Arrow Right)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom Details Section */}
            <div className="p-6 sm:p-7 space-y-4 bg-slate-900 border-t border-slate-800">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  {lang === 'hi' ? selectedImage.titleHi : selectedImage.titleEn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'hi' ? selectedImage.descHi : selectedImage.descEn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-4 h-4 text-[#C59B27]" />
                  <span>PKC Campus, Near Bus Stand, Chhatarpur (M.P.)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      if (onNavigateTab) onNavigateTab('inquiry');
                    }}
                    className="bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <span>{lang === 'hi' ? 'परिसर विज़िट / प्रवेश पूछताछ' : 'Campus Visit Inquiry'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. CAMPUS VISIT CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-gradient-to-r from-[#071530] via-slate-900 to-[#071530] text-white rounded-3xl p-8 sm:p-12 border border-[#C59B27]/40 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#C59B27]/15 px-3 py-1 rounded-full text-[#C59B27] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'सीधे संस्थान पधारें' : 'Visit PKC Campus in Person'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black">
              {lang === 'hi' 
                ? 'परिसर का प्रत्यक्ष अनुभव लें एवं विशेषज्ञों से मिलें' 
                : 'Experience the Campus & Meet Our Academic Counselors'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'hi'
                ? 'छतरपुर परिसर में पधारकर कंप्यूटर लैब, क्लासरूम्स और डिग्री मार्गदर्शन की निःशुल्क जानकारी प्राप्त करें।'
                : 'Walk in directly to our Chhatarpur center for free career consultation, lab walkthrough, and degree registration.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab && onNavigateTab('inquiry')}
              className="w-full sm:w-auto bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{lang === 'hi' ? 'एडमिशन इंक्वायरी फॉर्म' : 'Book Free Campus Visit'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="https://wa.me/917000212637?text=Hello%20PKC%20Education%2C%20I%20would%20like%20to%20visit%20the%20campus."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>WhatsApp: 7000212637</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
