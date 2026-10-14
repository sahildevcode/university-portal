import React from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  ExternalLink, 
  Heart,
  Globe,
  GraduationCap,
  Laptop,
  Briefcase,
  Sparkles,
  CheckCircle2,
  FileText,
  Search,
  BookOpen,
  ArrowRight,
  Clock
} from 'lucide-react';

// Authentic WhatsApp SVG Icon Component
function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function Footer({ setActiveTab = () => {} }) {
  // Popular searches tag cloud for high visibility & quick course navigation
  const popularSearches = [
    { label: 'DCA Course in Chhatarpur', action: 'courses' },
    { label: 'PGDCA Admission 2026', action: 'courses' },
    { label: 'Tally Prime with GST Classes', action: 'courses' },
    { label: 'CPCT Typing Hindi & English', action: 'courses' },
    { label: 'MPTASS Scholarship Form Assistance', action: 'inquiry' },
    { label: 'MBA University Admission MP', action: 'courses' },
    { label: 'B.Ed & M.Ed College Admissions', action: 'courses' },
    { label: 'B.Tech CSE Top College Tie-Up', action: 'courses' },
    { label: 'BCA Degree College Guidance', action: 'courses' },
    { label: 'BA / B.Com / B.Sc Degree', action: 'courses' },
    { label: 'Distance Education Degree MP', action: 'courses' },
    { label: 'Free Laptop Scheme for Professional Courses', action: 'inquiry' },
    { label: 'Best Computer Institute Chhatarpur', action: 'about' },
    { label: '100% Job Placement Assistance', action: 'inquiry' },
    { label: 'UGC Approved University Degree', action: 'courses' }
  ];

  const servicesList = [
    {
      title: 'College admission consultancy',
      desc: 'Top university & college selection, counseling, seat allotment & document guidance.',
      badge: 'Admissions'
    },
    {
      title: 'Mp Online Traning',
      desc: 'Citizen portal services, online government application forms & digital kiosk training.',
      badge: 'Govt. Portal'
    },
    {
      title: 'Degree & Diploma Admission Advisory',
      desc: 'Full advisory for recognized UGC regular, private & distance degree / diploma courses.',
      badge: 'UGC Advisory'
    },
    {
      title: 'Higher Education Consultancy',
      desc: 'Master degrees, doctorate research, M.Phil & higher academic career consultation.',
      badge: 'University Tie-ups'
    },
    {
      title: 'Vocational and certificate courses',
      desc: 'Short-term skill development modules, job-oriented certificates & practical training.',
      badge: 'Certified'
    },
    {
      title: 'Career Counselling',
      desc: 'One-on-one student career roadmap, aptitude assessment & educational guidance.',
      badge: '1-on-1 Mentorship'
    },
    {
      title: 'Soft skill',
      desc: 'Personality development, corporate communication, public speaking & etiquette.',
      badge: 'Personality'
    },
    {
      title: 'Computer literary Programs',
      desc: 'Essential computer operations, digital literacy, internet tools & office typing.',
      badge: 'Digital Skills'
    },
    {
      title: 'Admission Guidance',
      desc: 'Direct admission support, university verification, eligibility checks & registration.',
      badge: 'Full Support'
    },
    {
      title: 'Job placement services',
      desc: 'Resume preparation, mock interviews, corporate campus placement tie-ups & referrals.',
      badge: 'Placement'
    },
    {
      title: 'Scholarship Base Courses',
      desc: '100% fee concession & scholarship application assistance under MPTASS & NSP schemes.',
      badge: 'Fee Benefit'
    },
    {
      title: 'Students Orientation program',
      desc: 'Welcome induction sessions, academic syllabus breakdown & semester exam guidance.',
      badge: 'Induction'
    },
    {
      title: 'Mock Interview',
      desc: 'Practical interview preparation, viva rounds, personality feedback & confidence booster.',
      badge: 'Interview Prep'
    },
    {
      title: 'UG/PG All Course',
      desc: 'Comprehensive admissions for BA, B.Sc, B.Com, BCA, MBA, B.Tech, M.Com, M.Sc & more.',
      badge: 'All Streams'
    }
  ];

  return (
    <footer className="bg-[#050e1d] text-slate-300 pt-14 pb-10 border-t border-slate-800/80 no-print font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* 1. TOP KEY SERVICES HIGHLIGHT STRIP (Feature Banners) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12 mb-12 border-b border-slate-800/80">
          
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-[#C59B27]/50 rounded-2xl transition-all group">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-[#C59B27] flex items-center justify-center shrink-0 border border-[#C59B27]/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">UGC Degree Admissions</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Regular, Distance &amp; Private</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all group">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30 group-hover:scale-105 transition-transform">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">IT Diplomas &amp; Tally</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">DCA, PGDCA, CPCT Typing</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition-all group">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">100% Scholarship Help</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">MPTASS &amp; NSP Special Benefits</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3.5 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl transition-all group">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">Job Placement Support</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Corporate Tie-ups &amp; Guidance</p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN 4-COLUMN COMPREHENSIVE GRID */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Excellence Profile (3 cols) */}
          <div className="lg:col-span-3 space-y-4 pr-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-amber-500 shrink-0 shadow-md">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-serif-academic font-black text-lg text-white block leading-tight tracking-wider">
                  PKC EDUCATION
                </span>
                <span className="text-[10px] text-[#C59B27] font-bold tracking-widest uppercase block">
                  LEARNING INSTITUTE &amp; CONSULTANCY
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering students since 2011 with authorized UGC university degrees, government certified IT diplomas, and 100% transparent career &amp; scholarship guidance in Chhatarpur (M.P.).
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-[#C59B27] bg-[#071530] border border-[#C59B27]/40 px-3 py-1.5 rounded-lg w-fit shadow-xs">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#C59B27]" />
                <span>Reg. Society No. 06/03/01/12345/18</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg w-fit shadow-xs">
                <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>15+ Years Academic Excellence (Est. 2011)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Services & Consultancy Detailed Section (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Our Services &amp; Consultancy</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                All 14 Services
              </span>
            </h4>
            
            <ul className="space-y-2.5 text-xs max-h-[580px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700">
              {servicesList.map((svc, i) => (
                <li key={i} className="flex items-start gap-2.5 group">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 text-[#C59B27] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {svc.title}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                        {svc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {svc.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Links & Direct Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Quick Links</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <button 
                  onClick={() => setActiveTab('home')} 
                  className="hover:text-[#C59B27] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>Home &amp; Welcome</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('about')} 
                  className="hover:text-[#C59B27] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>About Institute</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('courses')} 
                  className="hover:text-[#C59B27] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>All Courses &amp; Fees</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('inquiry')} 
                  className="hover:text-[#C59B27] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>Admission Inquiry</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('gallery')} 
                  className="hover:text-[#C59B27] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>Campus Photo Gallery</span>
                </button>
              </li>
              <li className="pt-2 border-t border-slate-800/80">
                <a 
                  href="/admin" 
                  className="text-slate-400 hover:text-[#C59B27] transition-colors flex items-center gap-1.5 font-bold"
                >
                  <ShieldCheck className="w-3 h-3 text-[#C59B27]" />
                  <span>Admin Portal</span>
                </a>
              </li>
              <li>
                <a 
                  href="/staff" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5 font-bold"
                >
                  <Briefcase className="w-3 h-3 text-emerald-400" />
                  <span>Staff &amp; Cash Counter</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us & Campus Map Cards (3 cols) */}
          <div className="lg:col-span-3 space-y-3.5 text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Contact &amp; Campuses</span>
              </span>
            </h4>
            
            <div className="space-y-2.5">
              {/* WhatsApp Quick Chat */}
              <a 
                href="https://wa.me/917000212637?text=Hello%20PKC%20Institute%2C%20I%20want%20information%20about%20admissions%20and%20courses"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-xl hover:bg-[#25D366]/20 transition-all group"
                title="Chat with Counselor on WhatsApp"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                  <WhatsAppIcon className="w-4 h-4 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-[#25D366] font-bold uppercase tracking-wider">WhatsApp Admission Desk</div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">+91 7000212637 (Instant Chat)</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100" />
              </a>

              {/* Helpline & Email mini cards */}
              <div className="grid grid-cols-1 gap-2">
                <a 
                  href="tel:+917000212637"
                  className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-amber-400/50 hover:bg-slate-800/60 transition-all group"
                  title="Call PKC Helpline"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-[#C59B27] flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-semibold">Official Helpline</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">+91 7000212637, 7580878825</div>
                  </div>
                </a>

                <a 
                  href="mailto:pkcinstituteaiu@gmail.com"
                  className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-indigo-400/50 hover:bg-slate-800/60 transition-all group"
                  title="Email Admissions"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-semibold">Official Email</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">pkcinstituteaiu@gmail.com</div>
                  </div>
                </a>
              </div>

              {/* Head Office Location Card */}
              <a 
                href="https://share.google/r5US9gVYqU8Uui9Gj"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 bg-slate-900/90 border border-slate-800 hover:border-[#C59B27]/60 rounded-xl transition-all group"
                title="View Head Office Location on Google Maps"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-[#C59B27] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white group-hover:text-amber-400 transition-colors">Head Office (Main Campus)</span>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">View Map ↗</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Beside Govt. Girls College, Panna Road, Choubey Colony, Chhatarpur (M.P.) - 471001
                    </p>
                  </div>
                </div>
              </a>

              {/* Institute Location Card */}
              <a 
                href="https://maps.app.goo.gl/kTX4J2zAUR8LHpuU9"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all group"
                title="View Institute Location on Google Maps"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">Institute</span>
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">View Map ↗</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      PKC Education Learning Institute, Satai Road, Pooja Doodh Dairy ke Upper, Chhatarpur (M.P.)
                    </p>
                  </div>
                </div>
              </a>

            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 3. POPULAR SEARCHES / TRENDING COURSES TAG CLOUD */}
        {/* ========================================================================= */}
        <div className="py-6 border-b border-slate-800/80">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Searches:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {popularSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(item.action)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BAR (Copyright, Recognition & Legal) */}
        {/* ========================================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PKC Education Learning Institute &amp; Consultancy. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('about')}>About PKC</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('courses')}>Courses</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer" onClick={() => setActiveTab('inquiry')}>Admissions</span>
            <span>•</span>
            <span className="text-emerald-400/80 font-medium">UGC &amp; MP Higher Education Recognized</span>
            <span>•</span>
            <a href="/admin" className="hover:text-[#C59B27] text-slate-500 font-semibold transition-colors">Admin Login</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
