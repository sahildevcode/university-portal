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

export default function Footer({ setActiveTab }) {
  return (
    <footer className="bg-[#061124] text-slate-300 pt-16 pb-10 border-t border-slate-800 no-print font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Col 1: Brand & Crest */}
          <div className="lg:col-span-2 space-y-4 pr-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center p-0.5 bg-white border-2 border-amber-500 shrink-0 shadow-md">
                <img src="/pkc_logo.png" alt="PKC Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <span className="font-serif-academic font-black text-xl text-white block leading-tight tracking-wider">
                  PKC EDUCATION
                </span>
                <span className="text-[10px] text-[#C59B27] font-bold tracking-widest uppercase block">
                  LEARNING INSTITUTE &amp; CONSULTANCY
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering minds. Building careers. Creating a better tomorrow. Operating under P.K.C. Shiksha Prasar Evam Jan Kalyan Samiti, Chhatarpur (M.P.).
            </p>

            <div className="flex items-center gap-2 text-xs text-[#C59B27] bg-[#071530] border border-[#C59B27]/40 px-3 py-1.5 rounded-md w-fit">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Registered Society No. 06/03/01/12345/18</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
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
                <button onClick={() => setActiveTab('gallery')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  Campus &amp; Event Gallery
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('inquiry')} className="hover:text-[#C59B27] transition-colors cursor-pointer text-left">
                  Admission Inquiry Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Programs */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
              Programs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>• Computer Applications (BCA)</li>
              <li>• Management (MBA, BBA)</li>
              <li>• Engineering (B.Tech CSE)</li>
              <li>• MP Govt Computer Diplomas (DCA, PGDCA)</li>
              <li>• Traditional Degrees (B.Sc, B.Com)</li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800 pb-2">
              Contact Us
            </h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                <span>Head Office: Near Bus Stand, Chhatarpur (M.P.) - 471001</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C59B27] shrink-0" />
                <a href="tel:+917000212637" className="hover:text-white transition-colors">Helpline: +91 7000212637</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C59B27] shrink-0" />
                <a href="mailto:pkcinstituteaiu@gmail.com" className="hover:text-white transition-colors">pkcinstituteaiu@gmail.com</a>
              </div>
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
          </div>
        </div>

      </div>
    </footer>
  );
}
