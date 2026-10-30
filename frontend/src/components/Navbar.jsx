import React, { useState } from 'react';
import { 
  Shield, 
  UserCheck, 
  User, 
  BookOpen, 
  PhoneCall, 
  MapPin, 
  Globe, 
  Building2, 
  HelpCircle, 
  Sparkles,
  Menu,
  X,
  Compass,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Laptop
} from 'lucide-react';
import { translations } from '../utils/translations';
import { fireCelebration } from '../utils/confetti';
import ReviewCommentModal, { getStoredReviews, fetchLiveReviews } from './ReviewCommentModal';
import LaptopShowcaseModal from './LaptopShowcaseModal';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  publicTab, 
  setPublicTab, 
  studentUser, 
  adminUser, 
  staffUser, 
  lang = 'en',
  setLang,
  onOpenStudentAuth, 
  onOpenStaffAuth, 
  onOpenAdminAuth, 
  onStudentLogout, 
  onAdminLogout, 
  onStaffLogout 
}) {
  const t = translations[lang] || translations.en;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [laptopModalOpen, setLaptopModalOpen] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(() => getStoredReviews().length);

  React.useEffect(() => {
    // Initial fetch from central backend database
    fetchLiveReviews().then(liveList => {
      setReviewsCount(liveList.length);
    });

    const updateCount = () => {
      setReviewsCount(getStoredReviews().length);
    };
    window.addEventListener('pkc_reviews_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('pkc_reviews_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    if (setLang) {
      setLang(prev => (prev === 'hi' ? 'en' : 'hi'));
    }
  };

  const handleNavClick = (tab) => {
    setActiveView('public');
    setPublicTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-300 font-sans ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/90' 
        : 'bg-white shadow-xs border-b border-slate-200'
    }`}>
      
      {/* 1. TOP UTILITY STRIP (Deep Midnight Navy - Mobile Optimized Single Clean Line) */}
      <div className="bg-[#071530] text-slate-200 text-[10.5px] py-1 px-3 sm:px-6 lg:px-8 xl:px-10 border-b border-slate-800/80">
        <div className="w-full flex items-center justify-between gap-1.5 sm:gap-2">
          
          {/* Left: Location & Contact */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 overflow-hidden">
            {/* 1. Location Badge */}
            <span className="inline-flex items-center gap-1 text-amber-200 font-bold bg-amber-500/20 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-xs shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              <MapPin className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-amber-300 shrink-0" />
              <span className="text-[10px] sm:text-[10.5px]">{t.location}</span>
            </span>

            {/* 2. Helpline Phone Badge */}
            <a 
              href="tel:+917580878825"
              className="inline-flex items-center gap-1 text-emerald-200 font-bold bg-emerald-500/20 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-400/40 shadow-xs hover:bg-emerald-500/30 transition-all cursor-pointer shrink-0"
              title="Call Helpline +91 7580878825"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <PhoneCall className="w-2.5 sm:w-3 h-2.5 sm:h-3 text-emerald-300 shrink-0" />
              <span className="text-[10px] sm:text-[10.5px]">{t.helpline}</span>
            </a>

            {/* 3. Admissions Open Badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 text-white font-extrabold bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 px-3 py-0.5 rounded-full border border-red-400/60 shadow-md animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span>{t.admissionsOpen}</span>
            </span>
          </div>

          {/* Right: Language Toggle */}
          <div className="flex items-center shrink-0 text-[10.5px] font-medium">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold uppercase tracking-wider transition-colors cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30"
              title="Switch Language (हिन्दी / English)"
            >
              <Globe className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
              <span>{t.langName}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. MAIN NAVBAR (Full Width - Logo Pure Left, Navigation Centered, Reviews + CTA Pure Right) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="relative flex items-center justify-between h-[58px] sm:h-[70px] gap-2 sm:gap-4">
          
          {/* ========================================================================= */}
          {/* LEFT: University Crest & Institution Branding (Pure Left Side) */}
          {/* ========================================================================= */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0 z-10"
          >
            {/* Crest Logo */}
            <div className="relative w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-[#071530] shadow-md group-hover:border-amber-500 transition-all duration-300 shrink-0">
              <img 
                src="/pkc_logo.png" 
                alt="PKC Education Learning Institute Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            {/* Institution Typography (Serif Academic) */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-serif-academic font-black text-sm sm:text-lg md:text-xl text-[#071530] tracking-tight group-hover:text-amber-600 transition-colors truncate">
                  PKC EDUCATION
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[10px] font-bold tracking-wider text-slate-600 uppercase -mt-0.5 truncate">
                LEARNING INSTITUTE &amp; CONSULTANCY
              </span>
              <span className="text-[8.5px] text-amber-700/90 font-semibold tracking-widest uppercase hidden sm:block">
                LEARN. LEAD. SUCCEED. • EST. 2011
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER: Navigation Links (Mathematically Centered in Navbar) */}
          {/* ========================================================================= */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 absolute left-1/2 -translate-x-1/2">
            
            {/* 1. HOME */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'home'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.home}
            </button>

            {/* 2. ABOUT US */}
            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'about'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.about}
            </button>

            {/* 3. COURSES */}
            <button
              onClick={() => handleNavClick('courses')}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'courses'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              COURSES
            </button>

            {/* 3.5 TESTIMONIALS */}
            <button
              onClick={() => {
                setActiveView('public');
                setPublicTab('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('testimonials-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'testimonials'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {lang === 'hi' ? 'सफलता गाथा' : 'TESTIMONIALS'}
            </button>

            {/* 4. ADMISSION INQUIRY */}
            <button
              onClick={() => handleNavClick('inquiry')}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'inquiry'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.inquiry}
            </button>

            {/* 6. GALLERY */}
            <button
              onClick={() => handleNavClick('gallery')}
              className={`px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'gallery'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              GALLERY
            </button>

            {/* 7. LAPTOP BUTTON (Between Gallery & Reviews) */}
            <button
              onClick={() => {
                fireCelebration({ x: 0.75, y: 0.1 });
                setLaptopModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-wider text-indigo-950 bg-gradient-to-r from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 border border-indigo-300 rounded-lg shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95 group"
              title="Certified Second Hand Laptops at PKC"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-black text-[#071530]">Laptop</span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tight">8 Deals</span>
            </button>

          </nav>

          {/* ========================================================================= */}
          {/* RIGHT: REVIEWS BUTTON + GOLD JOB APPLY CTA BUTTON */}
          {/* ========================================================================= */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 z-10">
            {/* Reviews Button */}
            <button
              onClick={() => {
                fireCelebration({ x: 0.85, y: 0.1 });
                setReviewModalOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 hover:bg-amber-100/90 text-amber-950 border border-amber-300/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10.5px] sm:text-[11px] font-bold transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 group shrink-0"
              title="Student Reviews & Comments"
            >
              <MessageSquare className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-amber-700 group-hover:scale-110 transition-transform" />
              <span className="font-black text-[#071530]">
                {reviewsCount} Reviews
              </span>
            </button>

            {/* Highlighted Gold "JOB APPLY" CTA Button */}
            <div className="hidden sm:flex items-center">
              <button
                onClick={() => {
                  fireCelebration({ x: 0.9, y: 0.1 });
                  handleNavClick('job-apply');
                }}
                className="bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-[11px] uppercase tracking-wider px-4 py-2 rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 group relative overflow-hidden"
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>JOB APPLY</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 px-2 space-y-2 bg-white animate-fadeIn">
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'home' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.home}
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'about' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.about}
            </button>
            <button
              onClick={() => handleNavClick('courses')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'courses' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              COURSES
            </button>
            <button
              onClick={() => {
                setActiveView('public');
                setPublicTab('home');
                setMobileMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('testimonials-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'testimonials' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {lang === 'hi' ? 'सफलता गाथा (TESTIMONIALS)' : 'TESTIMONIALS'}
            </button>
            <button
              onClick={() => handleNavClick('inquiry')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'inquiry' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.inquiry}
            </button>
            <button
              onClick={() => handleNavClick('gallery')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'gallery' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              GALLERY
            </button>

            {/* Mobile Laptop Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                fireCelebration({ x: 0.5, y: 0.5 });
                setLaptopModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider text-indigo-950 bg-gradient-to-r from-blue-50 to-indigo-100 border border-indigo-200"
            >
              <span className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>CERTIFIED LAPTOPS</span>
              </span>
              <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                8 DEALS
              </span>
            </button>

            <div className="pt-2 space-y-2">
              {/* Mobile Review Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setReviewModalOpen(true);
                }}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/90 font-black text-xs uppercase tracking-wider py-2.5 rounded-md shadow-xs text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-amber-700" />
                <span>REVIEWS & COMMENTS ({reviewsCount})</span>
              </button>

              {/* Mobile Job Apply Button */}
              <button
                onClick={() => {
                  fireCelebration({ x: 0.5, y: 0.5 });
                  handleNavClick('job-apply');
                }}
                className="w-full bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-md shadow-sm text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4 text-slate-950" />
                <span>JOB APPLY</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

      </div>

      </header>

      {/* Review & Comment Modal */}
      <ReviewCommentModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewAdded={(newCount) => setReviewsCount(newCount)}
      />

      {/* Second Hand Laptop Showcase Modal */}
      <LaptopShowcaseModal
        isOpen={laptopModalOpen}
        onClose={() => setLaptopModalOpen(false)}
      />

    </>
  );
}
