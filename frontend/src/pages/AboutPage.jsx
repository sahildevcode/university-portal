import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Award, 
  Users, 
  CheckCircle2, 
  GraduationCap, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  BookOpen,
  FileCheck,
  Briefcase,
  HeartHandshake,
  PhoneCall,
  Compass
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function AboutPage({ lang = 'en', onNavigateTab }) {
  const t = translations[lang] || translations.en;
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.about) {
          setAboutData(data.about);
        }
      })
      .catch(() => {});
  }, []);

  const stats = [
    {
      icon: Building2,
      number: `${aboutData?.yearsOfExcellence || 15}+`,
      label: t.statYears,
      sub: lang === 'hi' ? 'स्थापना: 2011 से निरंतर' : 'Established in 2011'
    },
    {
      icon: Users,
      number: `${(aboutData?.totalStudentsGuided || 18500).toLocaleString('en-IN')}+`,
      label: t.statStudents,
      sub: lang === 'hi' ? 'डिग्री व डिप्लोमा में प्रवेशित' : 'Enrolled in Degrees & Diplomas'
    },
    {
      icon: Award,
      number: `${aboutData?.totalAffiliations || 28}+`,
      label: t.statAffiliations,
      sub: lang === 'hi' ? 'UGC / AICTE मान्यता प्राप्त' : 'UGC & Govt Recognized'
    },
    {
      icon: Briefcase,
      number: aboutData?.placementRate || '95%',
      label: t.statPlacement,
      sub: lang === 'hi' ? 'सफलता एवं जॉब गाइडेंस' : 'Placement & Exam Guidance'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 text-slate-900 font-sans">
      
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27] bg-[#C59B27]/10 px-3.5 py-1 rounded-sm border border-[#C59B27]/30">
          {t.yearsBadge}
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-bold text-[#071530] tracking-tight leading-tight">
          {t.aboutHeading}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.aboutSubheading}
        </p>
      </div>

      {/* 2. Key Statistics Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div 
              key={i} 
              className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center space-y-2 group"
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-[#071530] text-[#C59B27] flex items-center justify-center transition-colors duration-300 shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
              <span className="font-serif-academic text-3xl sm:text-4xl font-bold text-[#071530] block">
                {st.number}
              </span>
              <strong className="text-xs sm:text-sm font-bold text-slate-800 block">
                {st.label}
              </strong>
              <span className="text-[11px] text-slate-400 block">
                {st.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Our Story & Purpose */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
        
        {/* Left: Text Story (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#C59B27]/15 border border-[#C59B27]/40 text-[#071530] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{t.ourStoryTitle}</span>
          </div>

          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-[#071530] leading-snug">
            {lang === 'hi' 
              ? 'ग्रामीण एवं जिला स्तर के छात्रों को देश के शीर्ष विश्वविद्यालयों से जोड़ना' 
              : 'Bridging District & Rural Youth with Leading Authorized Universities'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.ourStoryText1}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.ourStoryText2}
          </p>

          {/* Director Quote Box */}
          <div className="bg-slate-50 border-l-4 border-[#C59B27] p-4 rounded-r-lg space-y-1 mt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#071530]">
              {t.directorWord} • {aboutData?.directorName || 'Er. P.K. Chaurasia'}
            </span>
            <p className="text-xs text-slate-700 italic font-serif-academic">
              {t.directorQuote}
            </p>
          </div>
        </div>

        {/* Right: Society & Trust Certification Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#071530] text-white rounded-xl p-6 sm:p-8 space-y-4 shadow-xl border border-[#C59B27]/40">
          <div className="w-12 h-12 rounded-lg bg-[#C59B27]/15 border border-[#C59B27]/40 text-[#C59B27] flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#C59B27] uppercase tracking-widest block">
              Govt Registered Body
            </span>
            <h3 className="font-serif-academic text-lg font-bold text-white mt-1">
              {t.trustHindi}
            </h3>
            <p className="text-xs text-slate-300 mt-2">
              Registration No: <strong className="text-white">06/03/01/12345/18</strong><br />
              Central Headquarters: Chhatarpur (Bundelkhand), M.P.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>100% Authorized University Degrees</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>MPTASS &amp; NSP Scholarship Support</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Full Exam &amp; Marksheet Verification</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. How We Work: 4 Simple Steps */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27]">
            {lang === 'hi' ? 'सरल एवं पारदर्शी प्रक्रिया' : 'TRANSPARENT PATHWAY'}
          </span>
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-[#071530]">
            {t.howItWorksTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#071530] text-[#C59B27] flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-[#071530]">{t.step1Title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.step1Desc}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#071530] text-[#C59B27] flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-[#071530]">{t.step2Title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.step2Desc}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#071530] text-[#C59B27] flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-[#071530]">{t.step3Title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.step3Desc}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-md bg-[#071530] text-[#C59B27] flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-[#071530]">{t.step4Title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t.step4Desc}</p>
          </div>

        </div>
      </div>

      {/* 5. Core Services List */}
      <div className="bg-slate-50 rounded-xl p-6 sm:p-10 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif-academic text-2xl font-bold text-[#071530]">{t.servicesTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' 
                ? 'प्रवेश से लेकर अंतिम डिग्री तक संपूर्ण शैक्षणिक समाधान।' 
                : 'Complete academic solutions from admission counseling to graduation.'}
            </p>
          </div>
          
          <button
            onClick={() => onNavigateTab && onNavigateTab('courses')}
            className="flex items-center gap-2 bg-[#071530] hover:bg-[#0a1f44] text-white font-bold px-5 py-2.5 rounded-md text-xs shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <span>{t.viewCourses}</span>
            <ArrowRight className="w-4 h-4 text-[#C59B27]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[t.service1, t.service2, t.service3, t.service4, t.service5].map((srv, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200/80 flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <span className="font-semibold text-slate-800 leading-snug">{srv}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Call to Action Banner */}
      <div className="bg-[#C59B27] text-slate-950 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[#071530] text-[#C59B27] px-2.5 py-0.5 rounded">
            {t.admissionsOpen}
          </span>
          <h3 className="font-serif-academic text-xl sm:text-2xl font-bold mt-1.5 text-slate-950">
            {lang === 'hi' ? 'आज ही अपने कैरियर की शुरुआत करें!' : 'Begin Your Higher Education Journey Today!'}
          </h3>
          <p className="text-xs text-slate-900 font-semibold mt-0.5">
            {lang === 'hi' ? 'निःशुल्क परामर्श हेतु अभी ऑनलाइन इंक्वायरी फॉर्म भरें।' : 'Get free career counseling and admission advice right now.'}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab && onNavigateTab('inquiry')}
          className="bg-[#071530] hover:bg-[#061124] text-white font-bold px-6 py-3 rounded-md text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer shrink-0"
        >
          {t.onlineInquiry} &rarr;
        </button>
      </div>

    </div>
  );
}
