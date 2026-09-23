import React from 'react';
import { Sparkles, ArrowRight, Bell, Award, CheckCircle2 } from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export default function AdmissionLiveTicker({ onAction, lang = 'en' }) {
  const tickerItems = [
    {
      id: 1,
      badge: lang === 'hi' ? 'प्रवेश प्रारंभ 2026-27' : 'Admissions 2026-27',
      text: lang === 'hi' 
        ? 'यूजीसी मान्यता प्राप्त विश्वविद्यालयों में B.Tech, MBA, BCA, B.Sc, DCA, PGDCA में सीधी प्रवेश सहायता उपलब्ध।' 
        : 'Direct admissions open in B.Tech, MBA, BCA, B.Sc, DCA, PGDCA with recognized UGC Universities.',
      icon: '🎓'
    },
    {
      id: 2,
      badge: lang === 'hi' ? '100% छात्रवृत्ति मार्गदर्शन' : '100% Scholarship Desk',
      text: lang === 'hi'
        ? 'मध्य प्रदेश शासन MPTASS एवं राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) हेतु निःशुल्क फॉर्म एवं परामर्श।'
        : 'Free expert assistance for MPTASS & National Scholarship Portal (NSP) applicants.',
      icon: '💰'
    },
    {
      id: 3,
      badge: lang === 'hi' ? 'शासकीय नौकरियों हेतु मान्य' : 'Govt Job Approved',
      text: lang === 'hi'
        ? 'माखनलाल एवं सम्बद्ध विश्वविद्यालयों से DCA, PGDCA एवं CPCT सर्टिफिकेशन।'
        : 'Govt. recruitment approved DCA, PGDCA & CPCT computer certifications.',
      icon: '🏛️'
    },
    {
      id: 4,
      badge: lang === 'hi' ? '18,500+ छात्र विश्वास' : '18,500+ Guided',
      text: lang === 'hi'
        ? 'बुंदेलखंड एवं मध्य भारत का सबसे विश्वसनीय एवं पारदर्शी उच्च शिक्षा मार्गदर्शन केंद्र।'
        : 'Bundelkhand & Central India’s premier university counseling network.',
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
