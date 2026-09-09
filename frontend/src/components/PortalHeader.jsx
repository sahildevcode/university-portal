import React from 'react';
import { Globe, Shield, CreditCard, PhoneCall, Sparkles } from 'lucide-react';

export default function PortalHeader({ activePortal, setActivePortal, adminUser, cashierUser }) {
  return (
    <div className="no-print bg-slate-950 text-white text-xs border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Admissions Badge & Helpline */}
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs">
            Admissions 2026-27 Open
          </span>
          <span className="hidden sm:inline text-slate-300">
            NAAC 'A++' Grade | UGC & AICTE Approved
          </span>
          <span className="hidden md:flex items-center gap-1 text-amber-300 font-semibold pl-2 border-l border-slate-700">
            <PhoneCall className="w-3 h-3" /> 1800-120-8899
          </span>
        </div>

        {/* Right: Sleek Portal Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setActivePortal('public')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              activePortal === 'public'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. University & Students</span>
          </button>

          <button
            onClick={() => setActivePortal('admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>2. Admin Control</span>
            {adminUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActivePortal('cashier')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              activePortal === 'cashier'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>3. Cash Counter</span>
          </button>
        </div>

      </div>
    </div>
  );
}
