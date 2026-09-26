import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Building2, 
  HelpCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Star, 
  Award, 
  MessageSquare, 
  PhoneCall, 
  Save, 
  X,
  ExternalLink,
  Users,
  Camera,
  Upload,
  Calendar,
  Eye,
  EyeOff,
  Layers,
  Globe,
  GraduationCap,
  Search,
  Landmark,
  Clock,
  BookOpen,
  Briefcase,
  Home,
  FileText,
  UploadCloud,
  Check
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import JobApplicationsManager from './JobApplicationsManager';

// Reusable Direct Image File Upload Component (NO URL typing needed!)
function ImageUploadField({ label, value, onChange, placeholder = "Click to upload image file from device" }) {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit. Please select a smaller photo.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5 text-[#C59B27]" />
          <span>{label} *</span>
        </span>
        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">Direct Device Upload</span>
      </label>

      {value ? (
        <div className="bg-white border-2 border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <img src={value} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 shadow-xs" />
            <div className="truncate">
              <strong className="text-xs font-bold text-slate-900 block truncate">{label} Photo</strong>
              <span className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Image File Ready &amp; Saved
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-[#C59B27] text-xs font-bold rounded-xl cursor-pointer shadow-xs">
              <span>Change Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="border-2 border-dashed border-amber-300 hover:border-[#C59B27] bg-amber-50/40 hover:bg-amber-50 rounded-2xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all group">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <UploadCloud className="w-7 h-7 text-[#C59B27] mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-[#071530]">{placeholder}</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Supports JPG, PNG, WEBP &amp; GIF photos</span>
        </label>
      )}
    </div>
  );
}

export default function WebsiteCmsManager({ 
  lang: propLang, 
  toggleLang: propToggleLang,
  courses: propCourses,
  onRefreshCourses
}) {
  const context = useLanguage();
  const lang = propLang || context.lang || 'en';
  const toggleLang = propToggleLang || context.toggleLang;
  const isHindi = lang === 'hi';

  // Sub-tabs corresponding directly to website pages/Navbar:
  // 'home' | 'about' | 'courses' | 'inquiries' | 'jobs' | 'events_gallery' | 'testimonials'
  const [activeSubTab, setActiveSubTab] = useState('home');

  // 1. HOME PAGE CMS STATE
  const [homeCms, setHomeCms] = useState(() => {
    try {
      const saved = localStorage.getItem('pkc_home_cms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      heroTitleEn: 'A Legacy of Excellence.',
      heroTitleHi: 'उज्ज्वल भविष्य और सम्मान। 100% यूजीसी मान्यता प्राप्त डिग्रियां।',
      heroTaglineEn: 'At PKC Education Learning Institute & Consultancy, we empower students to think critically, lead courageously, and earn certified degrees from top UGC approved universities across India.',
      heroTaglineHi: 'पी.के.सी. एजुकेशन लर्निंग इंस्टीट्यूट एवं कंसल्टेंसी में हम वर्ष 2011 से छात्र-छात्राओं को यूजीसी मान्यता प्राप्त विश्वविद्यालयों से प्रमाणित डिग्री, कंप्यूटर डिप्लोमा एवं पारदर्शी कैरियर मार्गदर्शन प्रदान कर रहे हैं।',
      campusBgImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop',
      honorBadgeTitle: 'Ranked Among Top Educational Consultancies in MP',
      honorBadgeEst: '15+ YEARS OF TRUST • EST. 2011',
      honorBadgeReg: 'Approved & Registered Educational Society • Reg. No. 06/03/01/12345/18',
      tickerTextEn: '🔴 ADMISSIONS OPEN FOR 2026-27 SESSION | 100% SCHOLARSHIP FOR SC/ST/OBC (MPTASS/NSP) | UGC & GOVT APPROVED DEGREES',
      tickerTextHi: '🔴 प्रवेश प्रारंभ 2026-27 सत्र | 100% शासकीय छात्रवृत्ति (MPTASS/NSP) | यूजीसी व शासन मान्यता प्राप्त डिग्रियां',
      counterStudents: 18500,
      counterAffiliations: 28,
      counterDegrees: 50,
      counterYears: 15,
      counterCareerRate: 95
    };
  });
  const [savingHomeCms, setSavingHomeCms] = useState(false);

  // 2. EVENT PHOTOS STATE
  const [eventPhotos, setEventPhotos] = useState([]);
  const [showEventPhotoModal, setShowEventPhotoModal] = useState(false);
  const [editingEventPhoto, setEditingEventPhoto] = useState(null);
  const [eventPhotoForm, setEventPhotoForm] = useState({
    title: '',
    titleHi: '',
    category: 'Annual Function',
    date: '2024',
    description: '',
    imageUrl: '',
    active: true
  });

  // 3. TESTIMONIALS STATE
  const [testimonials, setTestimonials] = useState([]);
  const [showTstModal, setShowTstModal] = useState(false);
  const [editingTst, setEditingTst] = useState(null);
  const [tstForm, setTstForm] = useState({
    studentName: '',
    course: '',
    title: 'Student Success Story',
    review: '',
    badge: 'Verified Student',
    imageUrl: '',
    rating: 5
  });

  // 4. ABOUT US STATE
  const [aboutForm, setAboutForm] = useState({
    establishedYear: 2011,
    yearsOfExcellence: 15,
    totalStudentsGuided: 18500,
    totalAffiliations: 28,
    placementRate: '95%',
    tagline: 'Leading Higher Education & Career Consultancy in Central India',
    history: 'PKC Education Learning Institute & Consultancy was established in 2011 to provide structured higher education guidance, computer training, and university degree counseling across Madhya Pradesh.',
    mission: 'To empower students from rural and urban backgrounds with authentic university accreditations, skill training, and 100% scholarship support.',
    directorName: 'Er. P.K. Chaurasia',
    directorTitle: 'Founder & Managing Director',
    directorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop'
  });
  const [savingAbout, setSavingAbout] = useState(false);

  // 5. INQUIRIES STATE
  const [inquiries, setInquiries] = useState([]);

  // 6. COURSES CMS STATE
  const [courses, setCourses] = useState(propCourses || []);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');

  const defaultCourseForm = {
    name: '',
    code: '',
    category: 'Computer',
    duration: '3 Years',
    department: 'School of Computing & IT',
    universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    collegeName: 'PKC Education Learning Institute & Consultancy',
    durationYears: 3,
    totalSemesters: 6,
    totalFee: 0,
    feePerSemester: 0,
    eligibility: '10+2 in any stream (Min 50%)',
    description: 'Approved Academic Program offered with comprehensive UGC curriculum and career guidance.',
    catImage: ''
  };

  const [courseForm, setCourseForm] = useState(defaultCourseForm);

  // Notifications State
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Initial Data
  const loadData = async () => {
    try {
      const epRes = await fetch('/api/event-photos');
      const epData = await epRes.json();
      if (epData.success) setEventPhotos(epData.photos || []);

      const tstRes = await fetch('/api/testimonials');
      const tstData = await tstRes.json();
      if (tstData.success) setTestimonials(tstData.testimonials || []);

      const abtRes = await fetch('/api/about');
      const abtData = await abtRes.json();
      if (abtData.success && abtData.about) setAboutForm(abtData.about);

      const inqRes = await fetch('/api/inquiries');
      const inqData = await inqRes.json();
      if (inqData.success) setInquiries(inqData.inquiries || []);

      const crsRes = await fetch('/api/courses');
      const crsData = await crsRes.json();
      if (crsData.success && Array.isArray(crsData.courses)) setCourses(crsData.courses);
    } catch (err) {
      console.log('CMS data loading notice:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (Array.isArray(propCourses) && propCourses.length > 0) {
      setCourses(propCourses);
    }
  }, [propCourses]);

  // Handle Save Home Page CMS
  const handleSaveHomeCms = (e) => {
    e.preventDefault();
    setSavingHomeCms(true);
    try {
      localStorage.setItem('pkc_home_cms', JSON.stringify(homeCms));
      setSuccessMsg('Home Page Content & Photos updated live across public website!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg('Failed to save Home CMS settings.');
    } finally {
      setSavingHomeCms(false);
    }
  };

  // Save About Information
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setErrorMsg(null);
    try {
      await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutForm)
      });
      localStorage.setItem('pkc_about_data', JSON.stringify(aboutForm));
      setSuccessMsg('About Us page details & Director photo updated live on website!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  // Academic Courses Handlers
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseForm(defaultCourseForm);
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name || '',
      code: course.code || '',
      category: course.category || 'Computer',
      duration: course.duration || '3 Years',
      department: course.department || 'School of Computing & IT',
      universityName: course.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
      collegeName: course.collegeName || 'PKC Education Learning Institute & Consultancy',
      durationYears: course.durationYears || 3,
      totalSemesters: course.totalSemesters || 6,
      totalFee: course.totalFee || 0,
      feePerSemester: course.feePerSemester || 0,
      eligibility: course.eligibility || '10+2 with minimum 50% aggregate marks',
      description: course.description || '',
      catImage: course.catImage || course.imageUrl || ''
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name || !courseForm.name.trim()) {
      setErrorMsg('Course Name is required.');
      return;
    }

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      setShowCourseModal(false);
      setSuccessMsg(editingCourse ? `Course "${courseForm.name}" updated successfully!` : `New course "${courseForm.name}" added to website!`);
      loadData();
      if (typeof onRefreshCourses === 'function') onRefreshCourses();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.name}"?`)) return;

    try {
      await fetch(`/api/courses/${course.id}`, { method: 'DELETE' });
      setSuccessMsg(`Course "${course.name}" deleted.`);
      loadData();
      if (typeof onRefreshCourses === 'function') onRefreshCourses();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Event Photos Handlers
  const handleOpenAddEventPhoto = () => {
    setEditingEventPhoto(null);
    setEventPhotoForm({
      title: '',
      titleHi: '',
      category: 'Annual Function',
      date: '2024',
      description: '',
      imageUrl: '',
      active: true
    });
    setShowEventPhotoModal(true);
  };

  const handleOpenEditEventPhoto = (photo) => {
    setEditingEventPhoto(photo);
    setEventPhotoForm({
      title: photo.title || '',
      titleHi: photo.titleHi || '',
      category: photo.category || 'Annual Function',
      date: photo.date || '2024',
      description: photo.description || '',
      imageUrl: photo.imageUrl || '',
      active: photo.active !== false
    });
    setShowEventPhotoModal(true);
  };

  const handleSaveEventPhoto = async (e) => {
    e.preventDefault();
    if (!eventPhotoForm.title || !eventPhotoForm.imageUrl) {
      setErrorMsg('Event Title and Photo Image are required. Please upload an image file.');
      return;
    }

    try {
      const url = editingEventPhoto ? `/api/event-photos/${editingEventPhoto.id}` : '/api/event-photos';
      const method = editingEventPhoto ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPhotoForm)
      });

      setShowEventPhotoModal(false);
      setSuccessMsg(editingEventPhoto ? 'Event photo updated!' : 'New campus function photo added to public website!');
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteEventPhoto = async (id, title) => {
    if (!window.confirm(`Delete photo for "${title}"?`)) return;
    try {
      await fetch(`/api/event-photos/${id}`, { method: 'DELETE' });
      setSuccessMsg('Event photo deleted.');
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Inquiry Status Handler
  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSuccessMsg(`Inquiry marked as ${newStatus}`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      setSuccessMsg('Inquiry deleted.');
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Testimonial Handlers
  const handleOpenAddTst = () => {
    setEditingTst(null);
    setTstForm({
      studentName: '',
      course: '',
      title: 'Student Success Story',
      review: '',
      badge: 'Placed / Top Ranker',
      imageUrl: '',
      rating: 5,
      active: true
    });
    setShowTstModal(true);
  };

  const handleOpenEditTst = (tst) => {
    setEditingTst(tst);
    setTstForm({
      studentName: tst.studentName || '',
      course: tst.course || '',
      title: tst.title || 'Student Success Story',
      review: tst.review || '',
      badge: tst.badge || '',
      imageUrl: tst.imageUrl || '',
      rating: tst.rating || 5,
      active: tst.active !== false
    });
    setShowTstModal(true);
  };

  const handleSaveTst = async (e) => {
    e.preventDefault();
    if (!tstForm.studentName || !tstForm.studentName.trim()) {
      setErrorMsg('Student Name is required.');
      return;
    }
    if (!tstForm.imageUrl) {
      setErrorMsg('Student Photo Image is required. Please upload or provide a photo.');
      return;
    }

    try {
      const url = editingTst ? `/api/testimonials/${editingTst.id}` : '/api/testimonials';
      const method = editingTst ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tstForm)
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to save testimonial');

      setSuccessMsg(editingTst ? 'Testimonial updated successfully!' : 'New testimonial added successfully!');
      setShowTstModal(false);
      setEditingTst(null);
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteTst = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete testimonial of "${name}"?`)) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to delete');
      setSuccessMsg('Testimonial removed successfully.');
      loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleTstActive = async (tst) => {
    try {
      const newStatus = !tst.active;
      const res = await fetch(`/api/testimonials/${tst.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Testimonial is now ${newStatus ? 'Active & Visible' : 'Hidden'}.`);
        loadData();
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8 text-slate-900 animate-fadeIn font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#071530] via-[#0A1931] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#C59B27]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C59B27]/20 text-[#C59B27] flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#C59B27] bg-[#C59B27]/15 px-3 py-1 rounded-full border border-[#C59B27]/30">
                ULTIMATE PUBLIC WEBSITE CONTENT SUITE
              </span>
              <h1 className="text-xl sm:text-2xl font-black mt-1 text-white">
                Website CMS &amp; Section Manager
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Direct image upload support enabled everywhere! Full power to edit headlines, uploaded photos, courses &amp; inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { if (typeof toggleLang === 'function') toggleLang(); }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
            <div className="bg-[#C59B27] text-slate-950 px-4 py-2 rounded-2xl shadow-md text-right shrink-0">
              <span className="text-[10px] font-black uppercase block text-slate-900">NEW LEADS</span>
              <span className="text-lg font-black text-slate-950">
                {inquiries.filter(i => i.status === 'New').length} Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Corresponding to Website Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => { setActiveSubTab('home'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'home'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Home className="w-4 h-4 text-amber-500" />
          <span>🏠 1. Home Page CMS</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('about'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'about'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span>🏢 2. About Us CMS</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('courses'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'courses'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-500" />
          <span>🎓 3. Courses &amp; Scholarship CMS ({courses.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('inquiries'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-purple-500" />
          <span>📩 4. Student Inquiries ({inquiries.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('jobs'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'jobs'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4 text-indigo-500" />
          <span>💼 5. Recruitment &amp; Resumes</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('events_gallery'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'events_gallery'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4 text-rose-500" />
          <span>📸 6. Campus Gallery ({eventPhotos.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('testimonials'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'testimonials'
              ? 'bg-[#071530] text-[#C59B27] shadow-md font-black'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>🌟 7. Testimonials &amp; Success Stories ({testimonials.length})</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-emerald-950 text-xs font-bold flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-950 text-xs font-bold flex items-center gap-3 animate-fadeIn shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: 🏠 HOME PAGE CMS */}
      {/* ========================================================================= */}
      {activeSubTab === 'home' && (
        <form onSubmit={handleSaveHomeCms} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-sm">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif-academic text-[#071530]">Home Page Content &amp; Hero Photo Editor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload hero campus photo directly from device, edit headlines, live ticker &amp; stats counters.</p>
            </div>
            <button
              type="submit"
              disabled={savingHomeCms}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Home CMS</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Hero Headlines */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-[#071530] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Main Hero Headline &amp; Tagline</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hero Main Title (English)</label>
                <input
                  type="text"
                  value={homeCms.heroTitleEn}
                  onChange={e => setHomeCms({ ...homeCms, heroTitleEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Hero Main Title (Hindi)</label>
                <input
                  type="text"
                  value={homeCms.heroTitleHi}
                  onChange={e => setHomeCms({ ...homeCms, heroTitleHi: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>

              {/* Direct Image File Upload for Campus Background */}
              <ImageUploadField
                label="Campus Background Banner Photo"
                value={homeCms.campusBgImage}
                onChange={val => setHomeCms({ ...homeCms, campusBgImage: val })}
                placeholder="Click to upload Campus Background Photo from computer / phone"
              />
            </div>

            {/* Live Ticker & Floating Badge */}
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-sm text-[#071530] flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Live Ticker Ribbon &amp; Floating Honor Badge</span>
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Admissions Live Ticker Text (English)</label>
                <textarea
                  rows={2}
                  value={homeCms.tickerTextEn}
                  onChange={e => setHomeCms({ ...homeCms, tickerTextEn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Floating Honor Badge Title</label>
                <input
                  type="text"
                  value={homeCms.honorBadgeTitle}
                  onChange={e => setHomeCms({ ...homeCms, honorBadgeTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Floating Honor Badge EST Year &amp; Subtitle</label>
                <input
                  type="text"
                  value={homeCms.honorBadgeEst}
                  onChange={e => setHomeCms({ ...homeCms, honorBadgeEst: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
                />
              </div>
            </div>

          </div>

          {/* 5 Statistics Counters Editor */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-[#071530] flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>5 Animated Key Statistics Counters</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Students Guided</span>
                <input
                  type="number"
                  value={homeCms.counterStudents}
                  onChange={e => setHomeCms({ ...homeCms, counterStudents: Number(e.target.value) })}
                  className="w-full text-center font-black text-base text-[#071530] border-b border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Affiliations</span>
                <input
                  type="number"
                  value={homeCms.counterAffiliations}
                  onChange={e => setHomeCms({ ...homeCms, counterAffiliations: Number(e.target.value) })}
                  className="w-full text-center font-black text-base text-[#071530] border-b border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Degree &amp; Diplomas</span>
                <input
                  type="number"
                  value={homeCms.counterDegrees}
                  onChange={e => setHomeCms({ ...homeCms, counterDegrees: Number(e.target.value) })}
                  className="w-full text-center font-black text-base text-[#071530] border-b border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Years Excellence</span>
                <input
                  type="number"
                  value={homeCms.counterYears}
                  onChange={e => setHomeCms({ ...homeCms, counterYears: Number(e.target.value) })}
                  className="w-full text-center font-black text-base text-[#071530] border-b border-amber-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Career Rate (%)</span>
                <input
                  type="number"
                  value={homeCms.counterCareerRate}
                  onChange={e => setHomeCms({ ...homeCms, counterCareerRate: Number(e.target.value) })}
                  className="w-full text-center font-black text-base text-[#071530] border-b border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingHomeCms}
              className="bg-[#071530] hover:bg-[#0a1f44] text-[#C59B27] font-black text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-lg cursor-pointer flex items-center gap-2 border border-[#C59B27]/40"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{savingHomeCms ? 'Saving Home CMS...' : 'SAVE HOME PAGE CMS'}</span>
            </button>
          </div>

        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 🏢 ABOUT US CMS */}
      {/* ========================================================================= */}
      {activeSubTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif-academic text-[#071530]">About Us &amp; Institutional Legacy Editor</h2>
              <p className="text-xs text-slate-500 mt-0.5">Edit institution history, founding year, director photo &amp; message.</p>
            </div>
            <button
              type="submit"
              disabled={savingAbout}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save About Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Director / Founder Name</label>
              <input
                type="text"
                value={aboutForm.directorName}
                onChange={e => setAboutForm({ ...aboutForm, directorName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Year Established</label>
              <input
                type="number"
                value={aboutForm.establishedYear}
                onChange={e => setAboutForm({ ...aboutForm, establishedYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            {/* Direct Image File Upload for Director Photo */}
            <div className="md:col-span-2">
              <ImageUploadField
                label="Director / Founder Photo"
                value={aboutForm.directorPhoto}
                onChange={val => setAboutForm({ ...aboutForm, directorPhoto: val })}
                placeholder="Click to upload Director Photo from device"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">Institutional Tagline</label>
              <input
                type="text"
                value={aboutForm.tagline}
                onChange={e => setAboutForm({ ...aboutForm, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">History &amp; Legacy Story</label>
              <textarea
                rows={4}
                value={aboutForm.history}
                onChange={e => setAboutForm({ ...aboutForm, history: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700">Mission &amp; Vision Statement</label>
              <textarea
                rows={3}
                value={aboutForm.mission}
                onChange={e => setAboutForm({ ...aboutForm, mission: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              />
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🎓 COURSES & SCHOLARSHIP CMS */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif-academic text-[#071530]">Academic Programs &amp; 62 Courses Catalog</h2>
              <p className="text-xs text-slate-500">Manage all degree courses, duration, eligibility, category &amp; banner photos.</p>
            </div>
            <button
              onClick={handleOpenAddCourse}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add New Academic Course</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  placeholder="Search course name or code..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
                />
              </div>
              <span className="text-xs font-bold text-slate-500">Showing {courses.length} courses</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#071530] text-[#C59B27] font-black uppercase text-[10.5px] tracking-wider">
                    <th className="p-4">#</th>
                    <th className="p-4">Course Name &amp; Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Eligibility</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {courses.filter(c => (c.name || '').toLowerCase().includes(courseSearch.toLowerCase())).map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-amber-50/20">
                      <td className="p-4 text-slate-400 font-bold">{c.id || i + 1}</td>
                      <td className="p-4 font-bold text-slate-900">{c.name}</td>
                      <td className="p-4">
                        <span className="bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                          {c.category || 'General'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{c.duration || '3 Years'}</td>
                      <td className="p-4 text-slate-500 max-w-xs truncate">{c.eligibility}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditCourse(c)}
                          className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c)}
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 📩 STUDENT ADMISSION INQUIRIES DESK */}
      {/* ========================================================================= */}
      {activeSubTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif-academic text-[#071530]">Student Admission Inquiries ({inquiries.length})</h2>
              <p className="text-xs text-slate-500">View leads, candidate phone numbers &amp; course preferences.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#071530] text-[#C59B27] font-black uppercase text-[10.5px] tracking-wider">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Mobile Number</th>
                  <th className="p-4">Course Interested</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {inquiries.map(inq => (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{inq.fullName || inq.name}</td>
                    <td className="p-4 font-bold text-emerald-700">
                      <a href={`tel:${inq.phone}`} className="hover:underline flex items-center gap-1">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{inq.phone}</span>
                      </a>
                    </td>
                    <td className="p-4 font-bold text-indigo-700">{inq.course || 'General Admission'}</td>
                    <td className="p-4 text-slate-600">{inq.city || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        inq.status === 'New' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {inq.status || 'New'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10.5px] hover:bg-emerald-700 cursor-pointer"
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 💼 RECRUITMENT & JOB APPLICATIONS */}
      {/* ========================================================================= */}
      {activeSubTab === 'jobs' && (
        <JobApplicationsManager lang={lang} />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: 📸 CAMPUS GALLERY & EVENT PHOTOS */}
      {/* ========================================================================= */}
      {activeSubTab === 'events_gallery' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-serif-academic text-[#071530]">Campus Events &amp; Functions Gallery</h2>
              <p className="text-xs text-slate-500">Manage annual fest, convocation, computer lab workshops, and ceremony photos displayed on public website.</p>
            </div>
            <button
              onClick={handleOpenAddEventPhoto}
              className="bg-[#C59B27] hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add Function Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventPhotos.map(photo => (
              <div key={photo.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                <div className="relative h-48 bg-slate-900">
                  <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 bg-black/70 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {photo.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#071530]">{photo.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{photo.description || 'Campus Event Photo'}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400">{photo.date}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleOpenEditEventPhoto(photo)}
                        className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEventPhoto(photo.id, photo.title)}
                        className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: 🌟 TESTIMONIALS & REVIEWS MANAGER (100% WIDTH WEBSITE SLIDER) */}
      {/* ========================================================================= */}
      {activeSubTab === 'testimonials' && (
        <div className="space-y-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                <h2 className="text-xl font-bold font-serif-academic text-[#071530]">
                  Student Testimonials &amp; Success Stories (100% Width Slider)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload student photos, placement packages, ratings, and quotes. Any number of photos/reviews (4, 6, 10, or more) can be added with NO LIMIT!
              </p>
            </div>

            <button
              onClick={handleOpenAddTst}
              className="bg-[#071530] hover:bg-[#0a1f44] text-[#C59B27] px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Testimonial</span>
            </button>
          </div>

          {/* Testimonials Grid Cards */}
          {testimonials.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-slate-600">No testimonials yet.</p>
              <p className="text-xs text-slate-400 mt-1">Click "+ Add New Testimonial" to showcase your student success stories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(tst => (
                <div 
                  key={tst.id} 
                  className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between overflow-hidden ${
                    tst.active !== false ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  {/* Card Top: Photo + Badges */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start gap-4">
                      {/* Photo Thumbnail */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border-2 border-amber-400/40 shrink-0 shadow-sm">
                        <img 
                          src={tst.imageUrl} 
                          alt={tst.studentName} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                      </div>

                      {/* Name, Course & Rating */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-sm text-[#071530] truncate">{tst.studentName}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                            tst.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {tst.active !== false ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{tst.course}</p>
                        
                        <div className="flex items-center gap-1 mt-1 text-amber-500">
                          {Array.from({ length: tst.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Badge Pill */}
                    {tst.badge && (
                      <div className="mt-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Award className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">{tst.badge}</span>
                        </span>
                      </div>
                    )}

                    {/* Headline & Review Snippet */}
                    <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1 italic">"{tst.title || 'Student Success Story'}"</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed font-normal">
                        {tst.review}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions Bottom */}
                  <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleTstActive(tst)}
                      className={`text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        tst.active !== false ? 'text-emerald-700 hover:text-emerald-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                      title={tst.active !== false ? 'Hide from Website' : 'Show on Website'}
                    >
                      {tst.active !== false ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                      <span>{tst.active !== false ? 'Visible' : 'Hidden'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditTst(tst)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                        title="Edit Testimonial"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTst(tst.id, tst.studentName)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Delete Testimonial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-academic font-bold text-lg text-[#071530]">
              {editingCourse ? 'Edit Academic Course' : 'Add New Academic Course'}
            </h3>
            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Course Full Name *</label>
                <input
                  type="text"
                  required
                  value={courseForm.name}
                  onChange={e => setCourseForm({ ...courseForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Course Code</label>
                  <input
                    type="text"
                    value={courseForm.code}
                    onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              {/* Direct Image File Upload for Course Banner */}
              <ImageUploadField
                label="Course Banner / Category Photo"
                value={courseForm.catImage}
                onChange={val => setCourseForm({ ...courseForm, catImage: val, imageUrl: val })}
                placeholder="Click to upload Course Banner Photo from computer / phone"
              />

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Eligibility Criteria</label>
                <input
                  type="text"
                  value={courseForm.eligibility}
                  onChange={e => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071530] text-[#C59B27] font-bold rounded-xl hover:bg-[#0a1f44] cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Photo Modal */}
      {showEventPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-serif-academic font-bold text-lg text-[#071530]">
              {editingEventPhoto ? 'Edit Event Photo' : 'Add Campus Function Photo'}
            </h3>
            <form onSubmit={handleSaveEventPhoto} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Function / Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventPhotoForm.title}
                  onChange={e => setEventPhotoForm({ ...eventPhotoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                />
              </div>

              {/* Direct Image File Upload for Campus Function Photo */}
              <ImageUploadField
                label="Campus Event / Function Photo"
                value={eventPhotoForm.imageUrl}
                onChange={val => setEventPhotoForm({ ...eventPhotoForm, imageUrl: val })}
                placeholder="Click to upload Campus Event Photo from device"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={eventPhotoForm.category}
                    onChange={e => setEventPhotoForm({ ...eventPhotoForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Year / Date</label>
                  <input
                    type="text"
                    value={eventPhotoForm.date}
                    onChange={e => setEventPhotoForm({ ...eventPhotoForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEventPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#071530] text-[#C59B27] font-bold rounded-xl hover:bg-[#0a1f44] cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Add / Edit Modal (Unlimited Testimonials Support) */}
      {showTstModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#071530] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{editingTst ? 'Edit Student Testimonial' : 'Add New Student Testimonial'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct image upload supported. No limit on total testimonials (4, 6, 10 or more)!
                </p>
              </div>
              <button
                onClick={() => { setShowTstModal(false); setEditingTst(null); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTst} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Vishwakarma"
                    value={tstForm.studentName}
                    onChange={e => setTstForm({ ...tstForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course / Degree *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA, MBA, B.Tech CSE"
                    value={tstForm.course}
                    onChange={e => setTstForm({ ...tstForm, course: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Placement Badge / Achievement</label>
                  <input
                    type="text"
                    placeholder="e.g. Placed at TCS (₹4.2 LPA)"
                    value={tstForm.badge}
                    onChange={e => setTstForm({ ...tstForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Star Rating (1 to 5)</label>
                  <select
                    value={tstForm.rating}
                    onChange={e => setTstForm({ ...tstForm, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0 Excellent)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0 Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3.0 Good)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Success Headline / Catchphrase</label>
                <input
                  type="text"
                  placeholder="e.g. 100% Placement & Practical Learning"
                  value={tstForm.title}
                  onChange={e => setTstForm({ ...tstForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                />
              </div>

              {/* Direct Photo Upload */}
              <ImageUploadField
                label="Student Photo (Upload from device or paste image URL) *"
                value={tstForm.imageUrl}
                onChange={val => setTstForm({ ...tstForm, imageUrl: val })}
                placeholder="Click to upload student photo from computer / phone"
              />

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Student Review / Feedback Quote *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write the student's review, how PKC Institute helped them, exam preparation experience, etc..."
                  value={tstForm.review}
                  onChange={e => setTstForm({ ...tstForm, review: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-[#C59B27] outline-hidden bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tstActive"
                  checked={tstForm.active !== false}
                  onChange={e => setTstForm({ ...tstForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C59B27] focus:ring-[#C59B27] cursor-pointer"
                />
                <label htmlFor="tstActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display this testimonial actively on the public website slider
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowTstModal(false); setEditingTst(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#071530] hover:bg-[#0a1f44] text-[#C59B27] text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTst ? 'Update Testimonial' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
