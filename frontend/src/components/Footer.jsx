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
  GraduationCap
} from 'lucide-react';

// Authentic WhatsApp SVG Icon Component
function WhatsAppIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-[#061124] text-slate-300 pt-16 pb-10 border-t border-slate-800 no-print font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 12-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Crest (3 cols) */}
          <div className="lg:col-span-3 space-y-4 pr-2">
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
            
            <p className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <span>Beside Govt. Girls College, Panna Road, Choubey Colony, Chhatarpur (M.P.)</span>
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#C59B27] bg-[#071530] border border-[#C59B27]/40 px-3 py-1.5 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Registered Society No. 06/03/01/12345/18</span>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  Home &amp; Welcome
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('about')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  About PKC Institute
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('courses')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  Academic Programs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('inquiry')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  Admission Inquiry Desk
                </button>
              </li>
              <li>
                <a href="/admin" className="text-slate-400 hover:text-[#C59B27] transition-colors flex items-center gap-1">
                  <span>PKC Admin Portal</span>
                </a>
              </li>
              <li>
                <a href="/staff" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Staff &amp; Cash Counter</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Programs (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
              Programs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>• Computer Apps (BCA)</li>
              <li>• Management (MBA, BBA)</li>
              <li>• Engineering (B.Tech CSE)</li>
              <li>• Diplomas (DCA, PGDCA)</li>
              <li>• Degrees (B.Sc, B.Com, BA)</li>
            </ul>
          </div>

          {/* Col 4: Contact & Locations (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Contact Us &amp; Campuses</span>
              <span className="text-[10px] text-amber-400 font-normal">Connect Directly</span>
            </h4>
            
            <div className="space-y-2.5">
              {/* WhatsApp Quick Chat */}
              <a 
                href="https://wa.me/917000212637?text=Hello%20PKC%20Institute%2C%20I%20want%20information%20about%20admissions"
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

              {/* Helpline & Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a 
                  href="tel:+917000212637"
                  className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-amber-400/50 hover:bg-slate-800/60 transition-all group"
                  title="Call PKC Helpline"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-[#C59B27] flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] text-slate-400 font-semibold">Helpline</div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate">+91 7000212637</div>
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
                    <div className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate">pkcinstituteaiu@...</div>
                  </div>
                </a>
              </div>

              {/* Head Office Location Card */}
              <a 
                href="https://maps.app.goo.gl/j28qn74aWXJN1ueM8"
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

              {/* Branch Office Location Card */}
              <a 
                href="https://maps.app.goo.gl/kTX4J2zAUR8LHpuU9"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2.5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all group"
                title="View Branch Location on Google Maps"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-0.5 text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors">Branch Office</span>
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

        {/* Bottom Bar (Northfield Copyright & Legal) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PKC Education Learning Institute &amp; Consultancy. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Terms of Use</span>
            <span>|</span>
            <span className="hover:text-white cursor-pointer">Approved by UGC &amp; MP Higher Education</span>
            <span>|</span>
            <a href="/admin" className="hover:text-[#C59B27] text-slate-500 font-semibold transition-colors">Admin Login</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
