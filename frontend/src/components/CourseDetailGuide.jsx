import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  CheckCircle2, 
  Briefcase, 
  Award, 
  ShieldCheck, 
  Check,
  Star,
  Users
} from 'lucide-react';
import { fireCelebration } from '../utils/confetti';

export default function CourseDetailGuide({ 
  course, 
  onBack, 
  onInquire, 
  lang = 'en' 
}) {
  if (!course) return null;

  const cName = (course.name || '').toUpperCase();
  const cCode = (course.code || '').toUpperCase();

  const isMBA  = cName.includes('MBA') || cCode.includes('MBA');
  const isBDF  = cName.includes('BDF') || cName.includes('FASHION') || cCode.includes('BFD');
  const isBTech= (cName.includes('B.TECH') || cName.includes('BTECH') || cCode.includes('BTECH')) && !cName.includes('M.TECH');
  const isMTech= cName.includes('M.TECH') || cName.includes('MTECH') || cCode.includes('MTECH');
  const isAgri = cName.includes('AGRI') || cName.includes('BSC AG') || cCode.includes('BSCAG');
  const isBCA  = (cName.includes('BCA') || cName.includes('B.C.A.')) && !cName.includes('DCA') && !cName.includes('MCA');
  const isDCA  = cName.includes('DCA') || cName.includes('D.C.A.');
  const isBBA  = (cName.includes('BBA') || cName.includes('B.B.A.')) && !cName.includes('MBA');

  const handleInquireClick = () => {
    fireCelebration({ x: 0.5, y: 0.5 });
    if (onInquire) onInquire();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackClick = () => {
    if (onBack) onBack();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20 animate-fadeIn">
      
      {/* 1. Top Sticky Header Bar */}
      <div className="bg-[#071530] text-white border-b border-[#C59B27]/30 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-amber-400/30"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-amber-400" />
            <span>← {lang === 'hi' ? 'कोर्स सूची पर वापस जाएं' : 'Back to Course Catalog'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium">
            <span>Courses</span>
            <span>/</span>
            <span>{course.category || 'Academic'}</span>
            <span>/</span>
            <span className="text-amber-400 font-bold">{course.name}</span>
          </div>

          <button
            onClick={handleInquireClick}
            className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-4 py-2 rounded-xl shadow-md hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>ADMISSION INQUIRY</span>
          </button>
        </div>
      </div>

      {/* 2. Course Hero Banner Section */}
      <div className="relative bg-slate-950 text-white overflow-hidden py-12 sm:py-16">
        <img 
          src={course.image || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop'} 
          alt={course.name} 
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 space-y-4 text-center sm:text-left z-10">
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span className="bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-xs font-black uppercase px-3 py-1 rounded-md tracking-wider shadow-sm">
              🎓 {course.badge || course.category || 'UGC DEGREE'}
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-md">
              ⏱️ Duration: {course.duration}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-md">
              🟢 ADMISSIONS OPEN 2026-27
            </span>
          </div>

          <h1 className="font-serif-academic text-3xl sm:text-5xl font-black text-white leading-tight">
            {course.fullName || course.name}
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-300 max-w-3xl">
            {course.fieldBest || 'Complete Career & Course Guide • Authorized UGC Recognized University Degree Program'}
          </p>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
            PKC Education Learning Institute &amp; Consultancy • Head Office: Chhatarpur (M.P.)
          </p>
        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">

        {/* 100% Scholarship Banner */}
        <div className="bg-gradient-to-r from-emerald-50 via-emerald-100/60 to-teal-50 border-2 border-emerald-400 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-emerald-950 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div className="text-center sm:text-left space-y-1">
            <strong className="block text-base font-black text-emerald-950">100% Govt Scholarship Scheme (MPTASS &amp; NSP Eligible)</strong>
            <p className="text-xs sm:text-sm text-emerald-800 font-medium leading-relaxed">
              SC / ST / OBC category students receive 100% tuition fee reimbursement &amp; hostel allowance scheme guidance at PKC Education Institute.
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COURSE SPECIFIC DETAILED GUIDE CARDS */}
        {/* ========================================================================= */}

        {/* 1. MBA DETAILED GUIDE */}
        {isMBA && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>MBA (Master of Business Administration) Complete Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                MBA (Master of Business Administration) ek 2-saal ka professional postgraduate degree program hai. Yeh course students ko <strong>leadership, management, problem-solving</strong> aur <strong>strategic business operations</strong> ki professional training deta hai. MBA ka main target candidate ko standard corporate leadership, management roles aur entrepreneurship (startup) ke liye prepare karna hota hai.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Course Duration &amp; Formats</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 space-y-1.5">
                  <span className="text-xs font-black uppercase text-blue-700 block">Full-Time Regular MBA</span>
                  <strong className="text-sm text-blue-950 font-bold block">2 Years (4 Semesters)</strong>
                  <p className="text-xs text-blue-900/80">Sabse popular aur highly demanded standard campus format.</p>
                </div>
                <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 space-y-1.5">
                  <span className="text-xs font-black uppercase text-purple-700 block">Executive MBA (EMBA)</span>
                  <strong className="text-sm text-purple-950 font-bold block">1 to 2 Years</strong>
                  <p className="text-xs text-purple-900/80">Working professionals ke liye (min 3–5 yrs experience).</p>
                </div>
                <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-1.5">
                  <span className="text-xs font-black uppercase text-emerald-700 block">Part-Time / Distance MBA</span>
                  <strong className="text-sm text-emerald-950 font-bold block">2 to 3 Years</strong>
                  <p className="text-xs text-emerald-900/80">Job ya business ke saath flexible degree option.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                <span>Kiske Liye Best Hai? (Who Should Pursue MBA?)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Career Growth & Managerial Roles', desc: 'Company mein Manager, VP, ya Director Level position par jaane ke liye.' },
                  { title: 'Salary Hike & High Starting CTC', desc: 'Non-MBA graduates ke mukable high salary package ke liye.' },
                  { title: 'Field Change (Career Switch)', desc: 'Engineering, Science ya Arts se Management sector mein shift hone ke liye.' },
                  { title: 'Entrepreneurship & Startups', desc: 'Apna khud ka Startup launch ya Family Business scale karne ke liye.' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-sm font-bold text-slate-900 block">{item.title}</strong>
                      <span className="text-xs text-slate-600 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">3</span>
                <span>Current Market Demand &amp; Salary Package Table</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Top Recruiting Companies</th>
                      <th className="p-4">Average Starting Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Management Consultant</td><td className="p-4 text-slate-600">McKinsey, BCG, Deloitte, PwC</td><td className="p-4 font-bold text-emerald-700">₹15 – 40 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Investment Banker</td><td className="p-4 text-slate-600">Goldman Sachs, JP Morgan, Morgan Stanley</td><td className="p-4 font-bold text-emerald-700">₹12 – 35 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Product Manager</td><td className="p-4 text-slate-600">Google, Amazon, Flipkart, Microsoft</td><td className="p-4 font-bold text-emerald-700">₹14 – 30 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Business Analytics Manager</td><td className="p-4 text-slate-600">Accenture, TCS, Wipro, KPMG</td><td className="p-4 font-bold text-emerald-700">₹8 – 22 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Marketing Head / Brand Manager</td><td className="p-4 text-slate-600">HUL, P&amp;G, Reliance, Nestlé</td><td className="p-4 font-bold text-emerald-700">₹10 – 25 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. BDF (BACHELOR OF FASHION DESIGN) DETAILED GUIDE */}
        {isBDF && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>BDF / B.Des (Fashion Design) Complete Career Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                BDF / B.Des (Fashion Design) ek 4-saal ka undergraduate professional degree program hai jo <strong>fashion industry, apparel designing, textile development</strong> aur <strong>garment manufacturing</strong> par completely focused hota hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black uppercase text-amber-800 block">Course Duration</span>
                <strong className="text-lg text-amber-950 font-black block">4 Years (8 Semesters)</strong>
                <p className="text-xs text-amber-900/80">Undergraduate Degree in Apparel &amp; Fashion Tech.</p>
              </div>
              <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-xs font-black uppercase text-purple-800 block">Eligibility Criteria</span>
                <strong className="text-sm text-purple-950 font-black block">10+2 Any Stream (Arts, Commerce, Science)</strong>
                <p className="text-xs text-purple-900/80">Minimum 50% aggregate marks (45% for SC/ST).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Kiske Liye Best Hai? (Who Should Pursue BDF?)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">Creative Visual Minds</strong>
                    <span className="text-xs text-slate-600 block mt-0.5">Un students ke liye jinme visual design, drawing, aesthetics aur fashion trends ki samajh hai.</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">Fashion &amp; Apparel Career</strong>
                    <span className="text-xs text-slate-600 block mt-0.5">Jo fashion brands, export houses, textile companies mein designer, stylist ya entrepreneur banna chahte hain.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                <span>Current Market Demand &amp; Job Roles (Salary Scope)</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Industry / Work Area</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Fashion Designer / Apparel Designer</td><td className="p-4 text-slate-600">Fashion Labels &amp; Export Houses</td><td className="p-4 font-bold text-emerald-700">₹4 – 10 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Fashion Stylist &amp; Visual Merchandiser</td><td className="p-4 text-slate-600">Media, E-commerce &amp; Retail Chains</td><td className="p-4 font-bold text-emerald-700">₹3.5 – 8 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Textile &amp; Pattern Designer</td><td className="p-4 text-slate-600">Textile Mills &amp; Fabric Manufacturers</td><td className="p-4 font-bold text-emerald-700">₹3 – 7 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Fashion Buyer / Brand Consultant</td><td className="p-4 text-slate-600">Luxury Brands &amp; Retail Corporations</td><td className="p-4 font-bold text-emerald-700">₹5 – 12 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. B.TECH DETAILED GUIDE */}
        {isBTech && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>B.Tech (Bachelor of Technology) Engineering Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                B.Tech ek 4-saal ka professional engineering degree program hai jo <strong>practical technical skills, problem solving</strong> aur <strong>software/hardware engineering principles</strong> sikhata hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 space-y-1">
                <span className="text-xs font-black uppercase text-blue-800 block">Course Duration</span>
                <strong className="text-lg text-blue-950 font-black block">4 Years (8 Semesters)</strong>
                <p className="text-xs text-blue-900/80">Full-Time Professional Engineering Degree.</p>
              </div>
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-xs font-black uppercase text-emerald-800 block">Eligibility &amp; Stream</span>
                <strong className="text-sm text-emerald-950 font-black block">10+2 PCM (Physics, Chem, Math)</strong>
                <p className="text-xs text-emerald-900/80">Min 50-60% marks + JEE Main / State Entrance or Direct Counseling.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Popular B.Tech Specializations</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">💻 Computer Science (CSE)</div>
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">🤖 AI &amp; Data Science</div>
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">⚡ Electronics &amp; Comm (ECE)</div>
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800">⚙️ Mechanical &amp; Civil Engg</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">2</span>
                <span>Current Market Demand &amp; Job Roles (Salary Scope)</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Top Recruiting Companies</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Software Engineer / Full Stack Developer</td><td className="p-4 text-slate-600">Google, Microsoft, TCS, Infosys, Amazon</td><td className="p-4 font-bold text-emerald-700">₹6 – 20+ LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Data Scientist / AI Specialist</td><td className="p-4 text-slate-600">Fintech, Analytics &amp; Product MNCs</td><td className="p-4 font-bold text-emerald-700">₹8 – 25+ LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">DevOps / Cloud Engineer</td><td className="p-4 text-slate-600">AWS, Azure, Product Companies</td><td className="p-4 font-bold text-emerald-700">₹7 – 18 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Core Engineer (Mechanical/Civil/EEE)</td><td className="p-4 text-slate-600">L&amp;T, Tata Motors, BHEL, PSUs</td><td className="p-4 font-bold text-emerald-700">₹4 – 10 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. M.TECH DETAILED GUIDE */}
        {isMTech && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>M.Tech (Master of Technology) Advanced Technical Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                M.Tech ek 2-saal ka postgraduate degree program hai jo B.Tech / B.E. ke baad hota hai. Yeh specific engineering branch mein <strong>deep technical specialization, R&amp;D research</strong>, aur <strong>advanced technical skills</strong> develop karne ke liye hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-200 space-y-1">
                <span className="text-xs font-black uppercase text-indigo-800 block">Course Duration</span>
                <strong className="text-lg text-indigo-950 font-black block">2 Years (4 Semesters)</strong>
                <p className="text-xs text-indigo-900/80">Postgraduate Engineering &amp; Research Degree.</p>
              </div>
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black uppercase text-amber-800 block">Eligibility &amp; GATE</span>
                <strong className="text-sm text-amber-950 font-black block">B.Tech / B.E. Degree + GATE Score</strong>
                <p className="text-xs text-amber-900/80">Valid for PSU recruitment &amp; M.Tech stipends.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Current Market Demand &amp; High Paying Job Roles</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Work Area / PSUs</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Senior Research Engineer / R&amp;D Specialist</td><td className="p-4 text-slate-600">ISRO, DRDO, High-Tech R&amp;D Labs</td><td className="p-4 font-bold text-emerald-700">₹8 – 22 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">AI/ML Specialist &amp; Solution Architect</td><td className="p-4 text-slate-600">Tier-1 IT MNCs &amp; Global AI Firms</td><td className="p-4 font-bold text-emerald-700">₹12 – 30+ LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">PSU Officer / Technical Manager</td><td className="p-4 text-slate-600">BHEL, ONGC, IOCL, GAIL (Govt PSUs)</td><td className="p-4 font-bold text-emerald-700">₹10 – 18 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Assistant Professor / Lecturer</td><td className="p-4 text-slate-600">Engineering Colleges &amp; Universities</td><td className="p-4 font-bold text-emerald-700">₹5 – 10 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. B.SC AGRICULTURE DETAILED GUIDE */}
        {isAgri && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>B.Sc Agriculture (Bachelor of Science in Agriculture) Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                B.Sc Agriculture ek 4-saal ka professional degree course hai jisme <strong>modern farming techniques, soil science, crop management, agronomy</strong> aur <strong>agri-business management</strong> sikhaya jata hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-xs font-black uppercase text-emerald-800 block">Course Duration</span>
                <strong className="text-lg text-emerald-950 font-black block">4 Years (8 Semesters)</strong>
                <p className="text-xs text-emerald-900/80">Professional Degree in Agriculture Sciences.</p>
              </div>
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black uppercase text-amber-800 block">Eligibility</span>
                <strong className="text-sm text-amber-950 font-black block">10+2 PCB / PCM / Agriculture</strong>
                <p className="text-xs text-amber-900/80">Min 50% marks + ICAR AIEEA / State Entrance or Direct Seat.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Current Market Demand &amp; Govt Agri Job Roles</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Work Area / Govt Bodies</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Agricultural Field Officer (AFO in Banks)</td><td className="p-4 text-slate-600">NABARD, SBI, Nationalized Govt Banks</td><td className="p-4 font-bold text-emerald-700">₹6 – 12 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Agronomist / Soil Scientist</td><td className="p-4 text-slate-600">Agri Research Bodies &amp; Fertilizer Corps</td><td className="p-4 font-bold text-emerald-700">₹4 – 8 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Agri-Business Manager</td><td className="p-4 text-slate-600">Seed, Pesticide &amp; Irrigation Companies</td><td className="p-4 font-bold text-emerald-700">₹5 – 10 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Quality Assurance Officer</td><td className="p-4 text-slate-600">Food Processing &amp; Seed Corporations</td><td className="p-4 font-bold text-emerald-700">₹3.5 – 7 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. BCA DETAILED GUIDE */}
        {isBCA && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>BCA (Bachelor of Computer Applications) IT &amp; Coding Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                BCA ek 3-saal ka undergraduate course hai jo students ko <strong>computer science, software development, web designing, databases</strong> aur <strong>networking</strong> ki basic-to-advanced practical knowledge deta hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-cyan-50/80 p-5 rounded-2xl border border-cyan-200 space-y-1">
                <span className="text-xs font-black uppercase text-cyan-800 block">Course Duration</span>
                <strong className="text-lg text-cyan-950 font-black block">3 Years (6 Semesters)</strong>
                <p className="text-xs text-cyan-900/80">Undergraduate Computer Application Degree.</p>
              </div>
              <div className="bg-purple-50/80 p-5 rounded-2xl border border-purple-200 space-y-1">
                <span className="text-xs font-black uppercase text-purple-800 block">Eligibility</span>
                <strong className="text-sm text-purple-950 font-black block">10+2 Any Stream (Arts, Comm, Sci)</strong>
                <p className="text-xs text-purple-900/80">Min 45-50% marks. (No B.Tech needed for IT jobs).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Current Market Demand &amp; IT Job Roles</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Work Area / Companies</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Software Developer / Web Developer</td><td className="p-4 text-slate-600">IT Software Agencies &amp; Web Studios</td><td className="p-4 font-bold text-emerald-700">₹3.5 – 8 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">System Analyst / Database Administrator</td><td className="p-4 text-slate-600">Corporate IT &amp; Cloud Operations</td><td className="p-4 font-bold text-emerald-700">₹4 – 7 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Software Tester (QA Engineer)</td><td className="p-4 text-slate-600">Software Testing Firms &amp; Tech Product Firms</td><td className="p-4 font-bold text-emerald-700">₹3 – 6 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">UI/UX Designer</td><td className="p-4 text-slate-600">Product Startups &amp; Tech Design Agencies</td><td className="p-4 font-bold text-emerald-700">₹4 – 9 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. DCA DETAILED GUIDE */}
        {isDCA && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>DCA (Diploma in Computer Applications) Govt Approved Diploma</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                DCA ek short-term diploma course hai jo <strong>basic computer operation, MS Office, internet skills, internet publishing</strong>, aur <strong>elementary coding / database handling</strong> sikhane ke liye design kiya gaya hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black uppercase text-amber-800 block">Course Duration</span>
                <strong className="text-lg text-amber-950 font-black block">1 Year / 6 Months</strong>
                <p className="text-xs text-amber-900/80">Govt Approved University Computer Diploma.</p>
              </div>
              <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-xs font-black uppercase text-emerald-800 block">Eligibility</span>
                <strong className="text-sm text-emerald-950 font-black block">10th / 12th Pass Any Stream</strong>
                <p className="text-xs text-emerald-900/80">Mandatory for MP Govt Jobs (Patwari, Operator).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Current Market Demand &amp; Job Roles</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Work Area / Govt Bodies</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Data Entry Operator (DEO)</td><td className="p-4 text-slate-600">MP Online, Govt Depts &amp; Private Offices</td><td className="p-4 font-bold text-emerald-700">₹1.8 – 3.5 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Computer Operator / Office Assistant</td><td className="p-4 text-slate-600">Schools, Hospitals &amp; Business Firms</td><td className="p-4 font-bold text-emerald-700">₹2 – 3.5 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Front Desk Executive / Receptionist</td><td className="p-4 text-slate-600">Hotels, Commercial Enterprises &amp; Clinics</td><td className="p-4 font-bold text-emerald-700">₹1.8 – 3 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Basic Billing &amp; Tally Clerk</td><td className="p-4 text-slate-600">Retail Outlets &amp; Accounting Firms</td><td className="p-4 font-bold text-emerald-700">₹2 – 4 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. BBA DETAILED GUIDE */}
        {isBBA && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-black text-[#071530] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>BBA (Bachelor of Business Administration) Corporate Guide</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                BBA ek 3-saal ka undergraduate management degree course hai jo students ko <strong>business management, marketing, finance, human resources</strong> aur <strong>corporate administration</strong> ki foundational understanding deta hai.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 space-y-1">
                <span className="text-xs font-black uppercase text-blue-800 block">Course Duration</span>
                <strong className="text-lg text-blue-950 font-black block">3 Years (6 Semesters)</strong>
                <p className="text-xs text-blue-900/80">Undergraduate Management Degree.</p>
              </div>
              <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black uppercase text-amber-800 block">Eligibility</span>
                <strong className="text-sm text-amber-950 font-black block">10+2 Any Stream (Arts, Comm, Sci)</strong>
                <p className="text-xs text-amber-900/80">Min 50% marks (Ideal step before MBA).</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#071530] text-amber-400 text-xs flex items-center justify-center font-bold">1</span>
                <span>Current Market Demand &amp; Corporate Job Roles</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#071530] text-white text-xs font-black uppercase">
                      <th className="p-4">Job Role</th>
                      <th className="p-4">Work Area / Companies</th>
                      <th className="p-4">Average Salary Package (CTC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-medium text-slate-800 bg-white">
                    <tr><td className="p-4 font-bold text-[#071530]">Business Development Executive (BDE)</td><td className="p-4 text-slate-600">Corporate Companies &amp; B2B Sales</td><td className="p-4 font-bold text-emerald-700">₹3.5 – 7 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Digital Marketing Specialist</td><td className="p-4 text-slate-600">Agencies &amp; E-commerce Brands</td><td className="p-4 font-bold text-emerald-700">₹3 – 6.5 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">HR Associate / Talent Recruiter</td><td className="p-4 text-slate-600">MNCs &amp; Corporate HR Departments</td><td className="p-4 font-bold text-emerald-700">₹3 – 5.5 LPA</td></tr>
                    <tr><td className="p-4 font-bold text-[#071530]">Finance / Relationship Associate</td><td className="p-4 text-slate-600">Banks, Insurance &amp; Financial Services</td><td className="p-4 font-bold text-emerald-700">₹3.5 – 6 LPA</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 9. FALLBACK GENERIC GUIDE FOR ALL OTHER COURSES */}
        {!isMBA && !isBDF && !isBTech && !isMTech && !isAgri && !isBCA && !isDCA && !isBBA && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-amber-600 uppercase tracking-wider block">🎓 Course Duration &amp; Structure</span>
                <strong className="text-lg text-[#071530] font-extrabold block">{course.duration}</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Full university syllabus compliance, yearly or semester pattern exam preparation.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-black text-emerald-600 uppercase tracking-wider block">⚡ Best Field Scope &amp; Career</span>
                <strong className="text-sm text-emerald-950 font-bold block">{course.fieldBest || 'Government & Corporate Roles'}</strong>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {course.marketDemand || 'High demand in public sector and private industry.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-base font-black text-[#071530] uppercase tracking-wider">
                Why Enroll in {course.name} at PKC Education Institute?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
                  <strong className="text-xs font-bold text-amber-950 block">100% MPTASS &amp; NSP Support</strong>
                  <p className="text-[11.5px] text-amber-900/80">Full guidance for SC / ST / OBC scholarship applicants.</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 space-y-1">
                  <strong className="text-xs font-bold text-blue-950 block">UGC Approved Degrees</strong>
                  <p className="text-[11.5px] text-blue-900/80">Valid for all MP Govt &amp; Central Govt Job recruitments.</p>
                </div>
                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <strong className="text-xs font-bold text-emerald-950 block">Exam &amp; Material Assistance</strong>
                  <p className="text-[11.5px] text-emerald-900/80">Complete previous year papers, notes &amp; verification desk.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Bottom Action CTA Banner */}
        <div className="bg-[#071530] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#C59B27] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-serif-academic text-amber-400">
              Ready to Apply for {course.name}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Submit an instant admission inquiry to get scholarship counseling &amp; fee structure details.
            </p>
          </div>

          <button
            onClick={handleInquireClick}
            className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>APPLY FOR ADMISSION NOW</span>
          </button>
        </div>

      </div>

    </div>
  );
}
