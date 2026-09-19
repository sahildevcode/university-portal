import React, { useState } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Lock, 
  Search, 
  FileCheck, 
  Clock, 
  Sparkles,
  Eye,
  Download,
  Trash2,
  AlertCircle
} from 'lucide-react';

export default function SavePersonalDocuments({ adminUser, lang = 'en', toggleLang }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full space-y-6 animate-fadeIn text-slate-900">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <FolderLock className="w-4 h-4 text-amber-400" />
            <span>{lang === 'hi' ? 'सुरक्षित पर्सनल वॉल्ट' : 'Secure Personal Vault'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{lang === 'hi' ? 'Save Personal Documents' : 'Save Personal Documents'}</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
              Module 10
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {lang === 'hi' 
              ? 'प्रशासक के व्यक्तिगत व गोपनीय दस्तावेज़ों, पहचान पत्रों, प्रमाणपत्रों एवं फ़ाइलों का सुरक्षित डिजिटल वॉल्ट।'
              : 'Secure encrypted digital vault for administrator personal documents, IDs, certificates, and private records.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-2xl text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Access Level</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Only (Encrypted)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Ready / Waiting for Instructions Notice */}
      <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {lang === 'hi' ? 'पर्सनल डॉक्यूमेंट सेक्शन एक्टिव हो गया है!' : 'Save Personal Documents Section is Ready!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {lang === 'hi'
                ? 'यह पेज पोर्टल नेविगेशन मेनू में सफलतापूर्वक जुड़ चुका है। अब आप बताइए कि इसके अंदर आपको क्या-क्या फ़ीचर्स, फ़ील्ड्स और डॉक्यूमेंट के प्रकार (जैसे आधार, पैन कार्ड, मार्कशीट्स, एग्रीमेंट्स, बैंक पासबुक, आदि) बनाने हैं।'
                : 'This section is now live in the Portal Navigation Menu. Please specify what fields, uploaders, document categories, and custom features you want created inside here.'}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards & Structure Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">ID &amp; Identity Proofs</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aadhaar Card, PAN Card, Voter ID, Driving License, and Passport securely stored with quick copy &amp; preview.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Certificates &amp; Degrees</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Academic degrees, board marksheets, experience letters, and authorized registrations.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FolderLock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Private Institute Docs</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Society registration papers, franchise agreements, bank documents, and institutional records.
          </p>
        </div>
      </div>

    </div>
  );
}
