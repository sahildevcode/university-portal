import React, { useEffect, useState } from 'react';
import { Sparkles, Award } from 'lucide-react';

export default function PageIntroSplash({ onFinish }) {
  const [stage, setStage] = useState('enter'); // 'enter' | 'show' | 'exit' | 'done'

  useEffect(() => {
    // Stage 1: Entrance
    const timer1 = setTimeout(() => {
      setStage('show');
    }, 100);

    // Stage 2: Exit fade out
    const timer2 = setTimeout(() => {
      setStage('exit');
    }, 1800);

    // Stage 3: Fully remove
    const timer3 = setTimeout(() => {
      setStage('done');
      if (onFinish) onFinish();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinish]);

  if (stage === 'done') return null;

  return (
    <div 
      onClick={() => {
        setStage('done');
        if (onFinish) onFinish();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white transition-all duration-700 select-none cursor-pointer ${
        stage === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient glowing orbs */}
      <div className="absolute w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl -top-20 -left-20 animate-pulse"></div>
      <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl -bottom-20 -right-20 animate-pulse delay-700"></div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg space-y-6">
        
        {/* Animated Logo Container */}
        <div className={`relative transition-all duration-700 transform ${
          stage === 'enter' ? 'scale-75 opacity-0 rotate-[-10deg]' : 'scale-100 opacity-100 rotate-0'
        }`}>
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-indigo-500 to-blue-500 opacity-75 blur-md animate-spin-slow"></div>
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white p-1.5 shadow-2xl border-4 border-indigo-400">
            <img 
              src="/pkc_logo.png" 
              alt="PKC Logo" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

        {/* Name & Badge */}
        <div className={`space-y-3 transition-all duration-700 delay-200 transform ${
          stage === 'enter' ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
        }`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>PKC EDUCATION GROUP</span>
          </div>

          <h1 className="font-serif-univ font-black text-2xl sm:text-3xl text-white tracking-tight leading-snug drop-shadow-md">
            PKC Education Learning Institute &amp; Consultancy
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 font-medium">
            PKC Shiksha Prasar &amp; Jan Kalyan Samiti, Chhatarpur (M.P.)
          </p>
        </div>

        {/* Smooth Loading Bar */}
        <div className={`w-48 h-1 bg-slate-800 rounded-full overflow-hidden transition-all duration-700 delay-300 ${
          stage === 'enter' ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="h-full bg-gradient-to-r from-amber-400 via-indigo-400 to-emerald-400 animate-progressBar"></div>
        </div>

        <span className="text-[10px] text-slate-400 animate-pulse">
          Click anywhere to skip
        </span>

      </div>
    </div>
  );
}
