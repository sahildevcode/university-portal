import React, { useState } from 'react';
import { 
  GraduationCap, 
  Shield, 
  UserCheck, 
  User, 
  LogOut, 
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
  ChevronDown
} from 'lucide-react';
import { translations } from '../utils/translations';

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
  const t = translations[lang] || translations.hi;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
    <header className={`sticky top-0 z-40 transition-all duration-300 font-sans ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-200/90' 
        : 'bg-white shadow-xs border-b border-slate-200'
    }`}>
      
      {/* 1. TOP UTILITY STRIP (Deep Midnight Navy - Exact Northfield Style) */}
      <div className="bg-[#071530] text-slate-200 text-[11px] py-1.5 px-4 sm:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Location & Contact */}
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{t.location}</span>
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300 font-medium">
              <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{t.helpline}</span>
            </span>
            <span className="hidden lg:inline text-amber-400/90 font-semibold">
              • {t.admissionsOpen}
            </span>
          </div>

          {/* Right: Quick Portal Links & Language Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-[11px] font-medium">
            
            {/* Student Quick Portal */}
            {studentUser ? (
              <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded text-blue-200">
                <GraduationCap className="w-3 h-3 text-blue-400" />
                <button 
                  onClick={() => { setActiveView('public'); setPublicTab('courses'); }}
                  className="hover:underline font-bold"
                >
                  {studentUser.fullName?.split(' ')[0]} (Student)
                </button>
                <button 
                  onClick={onStudentLogout} 
                  className="text-slate-400 hover:text-rose-400 ml-1"
                  title="Logout"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenStudentAuth}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <GraduationCap className="w-3 h-3 text-amber-400/80" />
                <span>{t.student}</span>
              </button>
            )}

            <span className="text-slate-700">|</span>

            {/* Staff Desk Link */}
            <button
              onClick={() => setActiveView('staff')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer text-slate-300 hover:underline"
              title="Staff Cash & Admission Counter (/staff)"
            >
              <UserCheck className="w-3 h-3 text-emerald-400/90" />
              <span className="hidden sm:inline">Staff Desk</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Admin Portal Link */}
            <button
              onClick={() => setActiveView('admin')}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer text-amber-400 font-extrabold hover:underline"
              title="Admin Control Desk (/admin)"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Admin Portal</span>
            </button>

            <span className="text-slate-700">|</span>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 font-bold uppercase tracking-wider transition-colors cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30"
              title="Switch Language (हिन्दी / English)"
            >
              <Globe className="w-3 h-3" />
              <span>{t.langName}</span>
            </button>

          </div>

        </div>
      </div>

      {/* 2. MAIN NAVBAR (Pristine White with Academic Crest & Centered Navigation) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* ========================================================================= */}
          {/* LEFT: University Crest & Institution Branding */}
          {/* ========================================================================= */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none shrink-0"
          >
            {/* Crest Logo */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-[#071530] shadow-md group-hover:border-amber-500 transition-all duration-300">
              <img 
                src="/pkc_logo.png" 
                alt="PKC Education Learning Institute Logo" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            {/* Institution Typography (Serif Academic) */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif-academic font-black text-lg sm:text-xl md:text-2xl text-[#071530] tracking-tight group-hover:text-amber-600 transition-colors">
                  PKC EDUCATION
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-600 uppercase -mt-0.5">
                LEARNING INSTITUTE &amp; CONSULTANCY
              </span>
              <span className="text-[9px] text-amber-700/90 font-semibold tracking-widest uppercase hidden sm:block">
                LEARN. LEAD. SUCCEED. • EST. 2011
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CENTER: Navigation Links (Exact Northfield Clean Academic Style) */}
          {/* ========================================================================= */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            
            {/* 1. HOME */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
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
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'about'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.about}
            </button>

            {/* 3. ACADEMICS / COURSES & SYLLABI */}
            <button
              onClick={() => handleNavClick('courses')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'courses'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.courses}
            </button>

            {/* 4. ADMISSION INQUIRY */}
            <button
              onClick={() => handleNavClick('inquiry')}
              className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeView === 'public' && publicTab === 'inquiry'
                  ? 'text-[#071530] border-amber-500 font-extrabold'
                  : 'text-slate-700 hover:text-[#071530] border-transparent hover:border-slate-300'
              }`}
            >
              {t.inquiry}
            </button>

          </nav>

          {/* ========================================================================= */}
          {/* RIGHT: Classic Gold "APPLY NOW" CTA Button (Northfield Style) */}
          {/* ========================================================================= */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('inquiry')}
              className="bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-md shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              <span>APPLY NOW</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
              {t.courses}
            </button>
            <button
              onClick={() => handleNavClick('inquiry')}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                publicTab === 'inquiry' ? 'bg-[#071530] text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.inquiry}
            </button>
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('inquiry')}
                className="w-full bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 font-black text-xs uppercase tracking-wider py-3 rounded-md shadow-sm text-center"
              >
                APPLY NOW
              </button>
            </div>
          </div>
        )}

      </div>

    </header>
  );
}
