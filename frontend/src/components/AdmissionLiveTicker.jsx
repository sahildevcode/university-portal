import React from 'react';
import { Sparkles, ArrowRight, Bell, Award, CheckCircle2 } from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export default function AdmissionLiveTicker({ onAction, lang = 'en' }) {
  const tickerItems = [
    {
      id: 1,
      badge: lang === 'hi' ? 'पी.के.सी. एजुकेशन इंस्टीट्यूट' : 'PKC Education Institute',
      text: lang === 'hi' 
        ? 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट में BCA, MBA, BBA, B.Tech, DCA, PGDCA, B.Sc, B.Com कोर्सेज में प्रवेश प्रारंभ सत्र 2026-27।' 
        : 'PKC Education Learning Institute & Consultancy: Admissions open for BCA, MBA, BBA, B.Tech, DCA, PGDCA, B.Sc, B.Com (Session 2026-27).',
      icon: '🎓'
    },
    {
      id: 2,
      badge: lang === 'hi' ? 'कंप्यूटर डिप्लोमा कोर्सेज' : 'Computer Diploma Programs',
      text: lang === 'hi'
        ? 'पी.के.सी. इंस्टीट्यूट छतरपुर - DCA, PGDCA एवं CPCT कंप्यूटर डिप्लोमा में डायरेक्ट एडमिशन एवं प्रैक्टिकल ट्रेनिंग।'
        : 'PKC Education Learning Institute: Direct Admission & Practical Training in DCA, PGDCA & CPCT Diplomas.',
      icon: '💻'
    },
    {
      id: 3,
      badge: lang === 'hi' ? 'डिग्री एवं मास्टर प्रोग्राम्स' : 'Degree & Master Courses',
      text: lang === 'hi'
        ? 'पी.के.सी. एजुकेशन इंस्टीट्यूट - B.Tech CSE, MBA, MCA, BCA, B.Sc, BA, B.Com एवं MA कोर्सेज उपलब्ध।'
        : 'PKC Education Learning Institute: Enroll in UGC Recognized B.Tech, MBA, MCA, BCA, B.Sc, B.Com & MA Programs.',
      icon: '🏛️'
    },
    {
      id: 4,
      badge: lang === 'hi' ? 'प्रवेश परामर्श केंद्र' : 'Admission Counseling',
      text: lang === 'hi'
        ? 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट एवं कंसल्टेंसी, छतरपुर (म.प्र.) - कॉलेज एवं यूनिवर्सिटी एडमिशन सहायता।'
        : 'PKC Education Learning Institute & Consultancy, Chhatarpur (M.P.) - Authorized University Admission Center.',
      icon: '⭐'
    }
  ];

  const handleClick = (e) => {
    fireCelebration({ x: 0.5, y: 0.3 });
    if (onAction) onAction();
  };

  return (
    <div className="relative bg-gradient-to-r from-slate-950 via-[#071530] to-slate-950 text-white border-y border-[#C59B27]/40 py-2.5 overflow-hidden shadow-inner select-none">
      {/* Decorative ambient subtle pulse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C59B27]/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Left fixed alert badge for desktop */}
      <div className="hidden lg:flex absolute left-0 top-0 bottom-0 z-20 items-center pl-4 pr-6 bg-gradient-to-r from-slate-950 via-slate-950 to-transparent">
        <div className="flex items-center gap-2 bg-[#C59B27] text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md animate-pulse">
          <Bell className="w-3 h-3 animate-bounce" />
          <span>LIVE UPDATES</span>
        </div>
      </div>

      {/* Marquee Track */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-8 text-xs">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              onClick={handleClick}
              className="flex items-center gap-3 px-3 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer group shrink-0"
            >
              <span className="text-base">{item.icon}</span>
              <span className="bg-[#C59B27]/20 border border-[#C59B27]/40 text-[#C59B27] font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md group-hover:bg-[#C59B27] group-hover:text-slate-950 transition-all">
                {item.badge}
              </span>
              <span className="text-slate-200 group-hover:text-white transition-colors font-medium">
                {item.text}
              </span>
              <span className="text-slate-600 ml-4 font-black">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right fixed Call-to-action button */}
      <div className="hidden lg:flex absolute right-0 top-0 bottom-0 z-20 items-center pr-4 pl-6 bg-gradient-to-l from-slate-950 via-slate-950 to-transparent">
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 bg-[#C59B27] hover:bg-[#b0871d] text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow transition-all hover:scale-105 cursor-pointer"
        >
          <span>APPLY NOW</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
