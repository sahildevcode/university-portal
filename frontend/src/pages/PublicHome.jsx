import React from 'react';
import { 
  GraduationCap, 
  Award, 
  CreditCard, 
  UserPlus, 
  ArrowRight, 
  CheckCircle, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  Sparkles,
  Lock
} from 'lucide-react';

export default function PublicHome({ setActiveTab, courses, currentUser, onRequireLogin }) {
  const handleProtectedClick = (tab) => {
    if (!currentUser) {
      onRequireLogin(tab);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-navy-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-800/80 border border-indigo-700 text-indigo-200 text-xs font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Empowering 15,000+ Enrolled Scholars Across India</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Shaping the Next Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200">Innovators & Leaders</span>
              </h1>
              
              <p className="text-lg text-indigo-100/90 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Welcome to Apex Global University. Explore our premier degree programs, fee schedules, accredited research facilities, and official semester examination results.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <button
                  onClick={() => setActiveTab('results')}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-indigo-950 font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 text-sm sm:text-base cursor-pointer"
                >
                  <Award className="w-5 h-5 text-indigo-950" />
                  <span>Online Examination Results</span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-all text-sm sm:text-base cursor-pointer"
                >
                  <BookOpen className="w-5 h-5 text-indigo-300" />
                  <span>Explore Courses & Fees</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-indigo-800/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> UGC & AICTE Approved
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" /> NAAC 'A++' Grade
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-300" /> 120+ Acre Smart Campus
                </span>
              </div>
            </div>

            {/* Quick Portal Card Widget */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl shadow-2xl text-white space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-amber-400" />
                    University Portal Access
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1">
                    Select your operational role or student utility below:
                  </p>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => setActiveTab('results')}
                    className="group bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/40 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                          Online Result Checker
                        </h4>
                        <p className="text-xs text-indigo-200">View semester marksheet & declared grades</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-amber-300 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div 
                    onClick={() => handleProtectedClick('register')}
                    className="group bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-400/40 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-400/20 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserPlus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-indigo-200 transition-colors flex items-center gap-1.5">
                          Admission & Documents Desk
                          {!currentUser && <Lock className="w-3 h-3 text-amber-300" />}
                        </h4>
                        <p className="text-xs text-indigo-200">Secure staff portal for enrollment & KYC docs</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-200 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div 
                    onClick={() => handleProtectedClick('accounts')}
                    className="group bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/40 p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                          Accountant & Fee Ledger
                          {!currentUser && <Lock className="w-3 h-3 text-amber-300" />}
                        </h4>
                        <p className="text-xs text-indigo-200">Track total fee, collect dues & print receipt</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-300 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Highlights Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-6">
          <div className="p-4 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 block">15,000+</span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1 block">Students Enrolled</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 block">45+</span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1 block">Undergrad & Postgrad Degrees</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 block">96.8%</span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1 block">Career Placement Rate</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 block">3.82</span>
            <span className="text-xs sm:text-sm font-medium text-slate-500 mt-1 block">NAAC CGPA Accreditation</span>
          </div>
        </div>
      </section>

      {/* 3. Featured Courses Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Academic Offerings
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Popular Programs & Degree Courses
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <span>View All Programs & Fees</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.slice(0, 3).map((c) => (
            <div 
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 font-mono">
                    {c.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {c.totalSemesters} Semesters ({c.durationYears} Yrs)
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {c.name}
                </h3>
                
                <p className="text-xs text-slate-500 line-clamp-2">
                  {c.description}
                </p>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration & Semesters:</span>
                    <span className="font-bold text-slate-800">{c.durationYears} Yrs • {c.totalSemesters} Sem</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Admissions:</span>
                    <span className="font-extrabold text-emerald-700">Open (2026-27)</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Eligibility: {c.eligibility?.split('(')[0]}</span>
                <button
                  onClick={() => handleProtectedClick('register')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  Apply Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
