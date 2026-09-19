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
  Image, 
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
  BookOpen
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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

  const [activeSubTab, setActiveSubTab] = useState('events_gallery'); // 'events_gallery' | 'testimonials' | 'about' | 'inquiries' | 'courses'
  
  // Event Photos (Functions & Moments Gallery) State
  const [eventPhotos, setEventPhotos] = useState([]);
  const [loadingEventPhotos, setLoadingEventPhotos] = useState(false);
  const [showEventPhotoModal, setShowEventPhotoModal] = useState(false);
  const [editingEventPhoto, setEditingEventPhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [eventPhotoForm, setEventPhotoForm] = useState({
    title: '',
    titleHi: '',
    category: 'Annual Function',
    date: '2024',
    description: '',
    imageUrl: '',
    active: true
  });

  const demoImagePresets = [
    {
      label: 'दीक्षांत समारोह / Convocation',
      category: 'Convocation 2024',
      title: 'Annual Convocation & Degree Distribution Ceremony',
      titleHi: 'वार्षिक दीक्षांत एवं उपाधि वितरण समारोह',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'मेधावी सम्मान / Merit Awards',
      category: 'Merit Awards',
      title: 'State Merit Felicitation & Scholarship Awards',
      titleHi: 'मेधावी छात्र अलंकरण एवं छात्रवृत्ति सम्मान',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'वार्षिक उत्सव / Cultural Fest',
      category: 'Cultural Fest',
      title: 'Annual Cultural Festival & Youth Showcase',
      titleHi: 'वार्षिक युवा महोत्सव एवं सांस्कृतिक उत्सव',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'कंप्यूटर लैब / IT Practical Workshop',
      category: 'IT Lab Workshop',
      title: 'Computer Lab Practical Workshop & Hands-on Training',
      titleHi: 'कंप्यूटर लैब प्रायोगिक प्रशिक्षण कार्यशाला',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'कैरियर गाइडेंस / Counseling Meet',
      category: 'Career Counseling',
      title: 'Campus Career Guidance & Counseling Desk',
      titleHi: 'कैरियर परामर्श एवं कॉरपोरेट मार्गदर्शन सत्र',
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
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

  // About State
  const [aboutForm, setAboutForm] = useState({
    establishedYear: 2011,
    yearsOfExcellence: 15,
    totalStudentsGuided: 18500,
    totalAffiliations: 28,
    placementRate: '95%',
    tagline: 'Leading Higher Education & Career Consultancy in Central India',
    history: '',
    mission: '',
    directorName: 'Er. P.K. Chaurasia'
  });
  const [savingAbout, setSavingAbout] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // 5. Academic Courses CMS State
  const [courses, setCourses] = useState(propCourses || []);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseDeptFilter, setCourseDeptFilter] = useState('all');

  const defaultCourseForm = {
    name: '',
    code: '',
    department: 'School of Computing & IT',
    universityName: 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
    collegeName: 'PKC Education Learning Institute & Consultancy',
    durationYears: 3,
    totalSemesters: 6,
    totalFee: 0,
    feePerSemester: 0,
    eligibility: '10+2 in any stream (Min 50%)',
    description: 'Approved Academic Program offered with comprehensive UGC curriculum and career guidance.'
  };

  const [courseForm, setCourseForm] = useState(defaultCourseForm);

  const coursePresets = [
    {
      label: 'BCA (Computer Applications)',
      name: 'Bachelor of Computer Applications (BCA)',
      code: 'BCA',
      department: 'School of Computing & IT',
      durationYears: 3,
      totalSemesters: 6,
      eligibility: '10+2 with Math/Computer or any stream (Min 50%)',
      description: 'Comprehensive 3-year bachelor degree covering Web Development, Databases, Java, Python, and Software Engineering.'
    },
    {
      label: 'B.Tech (Computer Science)',
      name: 'B.Tech Computer Science & Engineering',
      code: 'BTECH-CSE',
      department: 'School of Engineering & Technology',
      durationYears: 4,
      totalSemesters: 8,
      eligibility: '10+2 with Physics, Chemistry, Math (Min 50%)',
      description: '4-year professional engineering degree program covering AI, Cloud Computing, Full Stack Development, DSA and Systems.'
    },
    {
      label: 'BBA (Business Administration)',
      name: 'Bachelor of Business Administration (BBA)',
      code: 'BBA',
      department: 'School of Commerce & Management',
      durationYears: 3,
      totalSemesters: 6,
      eligibility: '10+2 in any stream (Commerce/Science/Arts) with Min 45%',
      description: 'Undergraduate business management program covering Marketing, Finance, HR, Entrepreneurship and Business Analytics.'
    },
    {
      label: 'MBA (Master of Business)',
      name: 'Master of Business Administration (MBA)',
      code: 'MBA',
      department: 'School of Commerce & Management',
      durationYears: 2,
      totalSemesters: 4,
      eligibility: 'Graduation in any discipline with minimum 50% marks',
      description: 'Postgraduate management program with specializations in Finance, Marketing, HR, and Information Systems.'
    },
    {
      label: 'B.Com (Commerce & Accounting)',
      name: 'Bachelor of Commerce (B.Com)',
      code: 'BCOM',
      department: 'School of Commerce & Management',
      durationYears: 3,
      totalSemesters: 6,
      eligibility: '10+2 Commerce or Science (Min 45%)',
      description: 'Core commerce program covering Financial Accounting, Taxation, Corporate Law, Auditing and Business Economics.'
    },
    {
      label: 'B.Sc. (Science & Mathematics)',
      name: 'Bachelor of Science (B.Sc)',
      code: 'BSC',
      department: 'School of Science',
      durationYears: 3,
      totalSemesters: 6,
      eligibility: '10+2 with Science stream (PCM/PCB) (Min 50%)',
      description: 'Rigorous 3-year scientific degree providing in-depth theoretical and laboratory practical training.'
    },
    {
      label: 'MCA (Master of Computer Apps)',
      name: 'Master of Computer Applications (MCA)',
      code: 'MCA',
      department: 'School of Computing & IT',
      durationYears: 2,
      totalSemesters: 4,
      eligibility: 'BCA / B.Sc. IT / B.Tech or Graduate with Math at 10+2/Grad level (Min 50%)',
      description: 'Advanced postgraduate software engineering program focusing on Distributed Systems, Cloud, AI and Modern Frameworks.'
    },
    {
      label: 'DMLT (Medical Lab Tech)',
      name: 'Diploma in Medical Laboratory Technology (DMLT)',
      code: 'DMLT',
      department: 'School of Paramedical & Health Sciences',
      durationYears: 2,
      totalSemesters: 4,
      eligibility: '10+2 with Biology / PCB (Min 45%)',
      description: 'Professional healthcare diploma in Pathology, Hematology, Biochemistry, Microbiology and Clinical Diagnostic Lab procedures.'
    }
  ];

  useEffect(() => {
    if (Array.isArray(propCourses) && propCourses.length > 0) {
      setCourses(propCourses);
    }
  }, [propCourses]);

  // Status message
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load Initial Data
  const loadData = async () => {
    try {
      // Event Photos
      const epRes = await fetch('/api/event-photos');
      const epData = await epRes.json();
      if (epData.success) setEventPhotos(epData.photos || []);

      // Testimonials
      const tstRes = await fetch('/api/testimonials');
      const tstData = await tstRes.json();
      if (tstData.success) setTestimonials(tstData.testimonials || []);

      // About
      const abtRes = await fetch('/api/about');
      const abtData = await abtRes.json();
      if (abtData.success && abtData.about) setAboutForm(abtData.about);

      // Inquiries
      const inqRes = await fetch('/api/inquiries');
      const inqData = await inqRes.json();
      if (inqData.success) setInquiries(inqData.inquiries || []);

      // Academic Courses
      try {
        const crsRes = await fetch('/api/courses');
        const crsData = await crsRes.json();
        if (crsData.success && Array.isArray(crsData.courses)) {
          setCourses(crsData.courses);
        }
      } catch (err) {
        console.error('Error loading courses in CMS:', err);
      }
    } catch (err) {
      console.error('Error loading CMS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      department: course.department || 'School of Computing & IT',
      universityName: course.universityName || 'Maharaja Chhatrasal Bundelkhand University (MCBU)',
      collegeName: course.collegeName || 'PKC Education Learning Institute & Consultancy',
      durationYears: course.durationYears || 3,
      totalSemesters: course.totalSemesters || 6,
      totalFee: course.totalFee || 0,
      feePerSemester: course.feePerSemester || 0,
      eligibility: course.eligibility || '10+2 with minimum 50% aggregate marks',
      description: course.description || ''
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!courseForm.name || !courseForm.name.trim()) {
      setErrorMsg(isHindi ? 'कृपया कोर्स का नाम दर्ज करें।' : 'Course Name is required.');
      return;
    }

    setSavingCourse(true);
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save course');

      setShowCourseModal(false);
      setSuccessMsg(
        editingCourse 
          ? (isHindi ? `कोर्स "${courseForm.name}" सफलतापूर्वक अपडेट हुआ!` : `Course "${courseForm.name}" updated successfully!`)
          : (isHindi ? `नया कोर्स "${courseForm.name}" सफलतापूर्वक जोड़ा गया! यह अब छात्र वेबसाइट पर लाइव दिखेगा।` : `New course "${courseForm.name}" added live to student website!`)
      );

      loadData();
      if (typeof onRefreshCourses === 'function') {
        onRefreshCourses();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmPrompt = isHindi 
      ? `क्या आप वाकई कोर्स "${course.name}" को हटाना चाहते हैं? यह छात्र वेबसाइट से भी हट जाएगा।`
      : `Are you sure you want to delete course "${course.name}"? This will also remove it from the student public website.`;
    
    if (!window.confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`/api/courses/${course.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete course');

      setSuccessMsg(isHindi ? `कोर्स "${course.name}" हटा दिया गया।` : `Course "${course.name}" deleted.`);
      loadData();
      if (typeof onRefreshCourses === 'function') {
        onRefreshCourses();
      }
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
      imageUrl: demoImagePresets[0].url,
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

  const handleUploadPhotoFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    setUploadingPhoto(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/event-photos/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Photo upload failed');

      setEventPhotoForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      setSuccessMsg('Photo uploaded from computer successfully!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveEventPhoto = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!eventPhotoForm.title || !eventPhotoForm.imageUrl) {
      setErrorMsg('Event Title and Photo Image are required.');
      return;
    }

    try {
      const url = editingEventPhoto ? `/api/event-photos/${editingEventPhoto.id}` : '/api/event-photos';
      const method = editingEventPhoto ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPhotoForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save event photo');

      setShowEventPhotoModal(false);
      setSuccessMsg(editingEventPhoto ? 'Event photo updated successfully!' : 'New campus function photo added to public website!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDeleteEventPhoto = async (id, title) => {
    if (!window.confirm(`Delete photo for "${title}"?`)) return;
    try {
      const res = await fetch(`/api/event-photos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Event photo deleted.');
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleEventPhotoStatus = async (photo) => {
    try {
      const res = await fetch(`/api/event-photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !photo.active })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Open Add Testimonial Modal
  const handleOpenAddTst = () => {
    setEditingTst(null);
    setTstForm({
      studentName: '',
      course: 'Bachelor of Computer Applications (BCA)',
      title: 'Student Success Story',
      review: 'PKC Institute provided excellent guidance for university admission, exams, and career placement.',
      badge: 'Placed at Top IT Company',
      imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      rating: 5
    });
    setShowTstModal(true);
  };

  // Open Edit Testimonial Modal
  const handleOpenEditTst = (tst) => {
    setEditingTst(tst);
    setTstForm({
      studentName: tst.studentName || '',
      course: tst.course || '',
      title: tst.title || '',
      review: tst.review || '',
      badge: tst.badge || '',
      imageUrl: tst.imageUrl || '',
      rating: tst.rating || 5
    });
    setShowTstModal(true);
  };

  // Save Testimonial (Create or Update)
  const handleSaveTst = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const url = editingTst ? `/api/testimonials/${editingTst.id}` : '/api/testimonials';
      const method = editingTst ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tstForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to save testimonial');

      setShowTstModal(false);
      setSuccessMsg(editingTst ? 'Testimonial slide updated!' : 'New testimonial slide added to public website!');
      loadData();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete Testimonial
  const handleDeleteTst = async (id, name) => {
    if (!window.confirm(`Delete testimonial of ${name}?`)) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Testimonial removed.');
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Save About Information
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setSavingAbout(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update about data');

      setSuccessMsg('About Us page details & statistics updated live on website!');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  // Update Inquiry Status
  const handleUpdateInquiryStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Inquiry marked as ${newStatus}`);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Delete this inquiry record?')) return;
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Inquiry deleted.');
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      
      {/* Header */}
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Public Website Content Manager
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold mt-1 text-white">
                Website CMS, Testimonials &amp; Inquiry Desk
              </h1>
              <p className="text-xs text-indigo-200 mt-0.5">
                {isHindi 
                  ? 'टॉप फोटो स्लाइडर, संस्थान का इतिहास/आंकड़े (About Us), एवं छात्रों द्वारा भेजी गई इंक्वायरी प्रबंधित करें।'
                  : 'Manage homepage event gallery, About Us history & statistics, and student admission inquiries.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof toggleLang === 'function') toggleLang();
              }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300" />
              <span>{isHindi ? 'English' : 'हिन्दी'}</span>
            </button>
            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-right shrink-0">
              <span className="text-[11px] text-indigo-200 block">Pending Inquiries</span>
              <span className="text-xl font-black text-amber-300">
                {inquiries.filter(i => i.status === 'New').length} New Leads
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Campus Functions | Testimonials | About Us | Inquiries | Academic Courses */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => { setActiveSubTab('events_gallery'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'events_gallery'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>📸 {isHindi ? `1. संस्थान फंक्शन एवं कार्यक्रम फोटो (${eventPhotos.length})` : `1. Campus Functions & Event Photos (${eventPhotos.length})`}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('testimonials'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'testimonials'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{isHindi ? `2. टेस्टिमोनियल स्लाइडर (${testimonials.length})` : `2. Testimonials CMS (${testimonials.length})`}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('about'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'about'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isHindi ? '3. अबाउट अस एवं आंकड़े' : '3. About Us & Statistics Editor'}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('inquiries'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{isHindi ? `4. छात्र इंक्वायरी (${inquiries.length})` : `4. Student Admission Inquiries (${inquiries.length})`}</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('courses'); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
            activeSubTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>{isHindi ? `5. एकेडमिक कोर्सेस (${courses.length})` : `5. Academic Courses CMS (${courses.length})`}</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 text-xs font-bold flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. CAMPUS FUNCTIONS & EVENT PHOTOS GALLERY MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'events_gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <span>{isHindi ? 'संस्थान फंक्शन एवं कार्यक्रम फोटो (Campus Events)' : 'Campus Events & Functions Gallery'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi 
                  ? 'वार्षिक उत्सव, दीक्षांत समारोह, कंप्यूटर लैब व सम्मान समारोह की फोटो यहाँ से मैनेज करें। ये फोटो सीधे स्टूडेंट पेज पर लाइव दिखाई देती हैं।'
                  : 'Manage annual fest, convocation, computer lab workshops, and ceremony photos displayed on the student public website.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddEventPhoto}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? '+ नई फोटो जोड़ें' : '+ Add Function Photo'}</span>
            </button>
          </div>

          {/* Photos Cards Grid */}
          {eventPhotos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isHindi ? 'कोई फंक्शन फोटो नहीं मिली' : 'No Campus Function Photos Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {isHindi 
                    ? 'संस्थान के वार्षिक उत्सव, दीक्षांत समारोह या लैब की फोटो जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।'
                    : 'Click the button above to add photos of convocations, events, workshops or ceremonies.'}
                </p>
              </div>
              <button
                onClick={handleOpenAddEventPhoto}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
              >
                {isHindi ? '+ पहली फोटो जोड़ें' : '+ Add First Photo'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {eventPhotos.map((photo, idx) => (
                <div 
                  key={photo.id || idx} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between ${
                    photo.active !== false ? 'border-slate-200' : 'border-slate-300 opacity-60 bg-slate-50'
                  }`}
                >
                  <div>
                    {/* Image Preview Container */}
                    <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <span className="bg-[#071530]/90 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          {photo.category || 'Function'} {photo.date && `• ${photo.date}`}
                        </span>

                        <button
                          onClick={() => handleToggleEventPhotoStatus(photo)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer transition-colors ${
                            photo.active !== false 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-700 text-slate-300'
                          }`}
                          title="Click to toggle display on student page"
                        >
                          {photo.active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{photo.active !== false ? 'Active' : 'Hidden'}</span>
                        </button>
                      </div>

                      {/* Photo Bottom Bar */}
                      <div className="absolute bottom-2 left-3 right-3 text-white">
                        <span className="text-[10px] text-amber-300 font-bold block">
                          Slide #{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold truncate">
                          {(isHindi ? photo.titleHi : photo.title) || photo.title || photo.titleHi}
                        </h4>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {photo.title}
                      </h4>
                      {photo.titleHi && (
                        <p className="text-xs font-semibold text-indigo-700">
                          {photo.titleHi}
                        </p>
                      )}
                      {photo.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {photo.description}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 truncate pt-1 font-mono">
                        URL: {photo.imageUrl}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenEditEventPhoto(photo)}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'एडिट करें' : 'Edit Photo'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEventPhoto(photo.id, photo.title)}
                      className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'हटाएं' : 'Delete'}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TESTIMONIALS & TOP SLIDER MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Top Photo &amp; Testimonial Slider Manager</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isHindi 
                  ? 'होम पेज के शीर्ष पर दिखने वाले स्लाइडर में नई फोटो, छात्र का नाम, कोर्स और रिव्यू जोड़ें।' 
                  : 'Add student review testimonials, success photos, and courses to display on the top home slider.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddTst}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Slide / Testimonial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((tst) => (
              <div key={tst.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  
                  {/* Photo & Badge */}
                  <div className="flex items-start gap-3">
                    <img 
                      src={tst.imageUrl} 
                      alt={tst.studentName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">{tst.studentName}</h4>
                      <p className="text-xs text-indigo-700 font-semibold truncate">{tst.course}</p>
                      {tst.badge && (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {tst.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    "{tst.review}"
                  </p>

                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-semibold">Active on Slider</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditTst(tst)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer"
                      title="Edit Slide"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTst(tst.id, tst.studentName)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABOUT US & STATISTICS EDITOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'about' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>About Us &amp; Institute Statistics Editor</span>
            </h2>
            <p className="text-xs text-slate-500">
              {isHindi 
                ? 'संस्थान कितने साल पुराना है, कितने छात्रों को पास कराया, एफिलिएशन एवं मिशन/विज़न को यहाँ से कभी भी एडिट करें।' 
                : 'Manage institute legacy years, student alumni count, affiliations, and core mission & vision.'}
            </p>
          </div>

          <form onSubmit={handleSaveAbout} className="space-y-6 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">{isHindi ? 'स्थापना वर्ष (Established Year)' : 'Established Year'}</label>
                <input
                  type="number"
                  value={aboutForm.establishedYear}
                  onChange={(e) => setAboutForm({ ...aboutForm, establishedYear: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">{isHindi ? 'अनुभव वर्ष (Years of Excellence)' : 'Years of Excellence'}</label>
                <input
                  type="number"
                  value={aboutForm.yearsOfExcellence}
                  onChange={(e) => setAboutForm({ ...aboutForm, yearsOfExcellence: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">{isHindi ? 'प्रवेशित छात्र (Total Students Guided)' : 'Total Students Guided'}</label>
                <input
                  type="number"
                  value={aboutForm.totalStudentsGuided}
                  onChange={(e) => setAboutForm({ ...aboutForm, totalStudentsGuided: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-indigo-950"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">{isHindi ? 'मान्यताएं (University Affiliations)' : 'University Affiliations'}</label>
                <input
                  type="number"
                  value={aboutForm.totalAffiliations}
                  onChange={(e) => setAboutForm({ ...aboutForm, totalAffiliations: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Director / Authority Name</label>
                <input
                  type="text"
                  value={aboutForm.directorName}
                  onChange={(e) => setAboutForm({ ...aboutForm, directorName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Placement &amp; Exam Success Rate</label>
                <input
                  type="text"
                  value={aboutForm.placementRate}
                  onChange={(e) => setAboutForm({ ...aboutForm, placementRate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Institute History &amp; Introduction</label>
              <textarea
                rows={3}
                value={aboutForm.history}
                onChange={(e) => setAboutForm({ ...aboutForm, history: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 leading-relaxed font-normal"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Mission &amp; Vision Statement</label>
              <textarea
                rows={2}
                value={aboutForm.mission}
                onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 leading-relaxed font-normal"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingAbout}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAbout ? 'Saving About Details...' : 'Save About & Statistics Live'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDENT ADMISSION INQUIRIES DESK */}
      {/* ========================================================================= */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>Prospective Student Admission Inquiries ({inquiries.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isHindi 
                  ? 'छात्रों द्वारा वेबसाइट से भेजी गई पूछताछ। तुरंत कॉल या व्हाट्सएप करें एवं स्थिति अपडेट करें।' 
                  : 'Direct admission inquiries received from prospective students via the public website.'}
              </p>
            </div>

            <button
              onClick={loadData}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 cursor-pointer shrink-0"
            >
              ↻ Refresh Leads
            </button>
          </div>

          {inquiries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No Student Inquiries Yet</p>
              <p className="text-xs">When visitors submit the admission inquiry form, their details will appear here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 text-white uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Phone &amp; Connect</th>
                      <th className="p-3">Interested Program</th>
                      <th className="p-3">City / Location</th>
                      <th className="p-3">Inquiry Message</th>
                      <th className="p-3">Received At</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{inq.name}</td>
                        <td className="p-3 font-mono font-bold text-indigo-700">
                          <div className="flex items-center gap-2">
                            <span>{inq.phone}</span>
                            <a 
                              href={`https://wa.me/91${inq.phone.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <a 
                              href={`tel:${inq.phone}`} 
                              className="text-indigo-600 hover:text-indigo-800"
                              title="Call Student"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{inq.course}</td>
                        <td className="p-3 text-slate-500">{inq.city || 'N/A'}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate" title={inq.message}>
                          {inq.message || 'General admission guidance required.'}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">
                          {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-3">
                          <select
                            value={inq.status || 'New'}
                            onChange={(e) => handleUpdateInquiryStatus(inq.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                              inq.status === 'Admitted'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : inq.status === 'Contacted'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="New">New Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Admitted">Admitted</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Inquiry"
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ACADEMIC COURSES & DEGREE PROGRAMS CMS */}
      {/* ========================================================================= */}
      {activeSubTab === 'courses' && (
        <div className="space-y-6">
          {/* Top Header Banner & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>{isHindi ? 'एकेडमिक कोर्सेस एवं प्रोग्राम (Academic Programs CMS)' : 'Academic Programs & Course Catalog CMS'}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi 
                  ? 'विद्यार्थी वेबसाइट (Academic Programs & Partner Colleges) पर प्रदर्शित होने वाले सभी डिग्री, डिप्लोमा व सर्टिफिकेट कोर्सेस यहाँ से जोड़ें व संपादित करें।'
                  : 'Manage all approved degree, diploma, and certificate programs displayed on the public student website.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCourse}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isHindi ? '+ नया कोर्स जोड़ें' : '+ Add Academic Program'}</span>
            </button>
          </div>

          {/* Search & Department Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={isHindi ? "कोर्स का नाम, कोड, यूनिवर्सिटी खोजें..." : "Search degree, course code, department..."}
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 font-medium text-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              {['all', ...new Set(courses.map(c => c.department).filter(Boolean))].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setCourseDeptFilter(dept)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    courseDeptFilter === dept
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {dept === 'all' ? (isHindi ? 'सभी विभाग (All)' : 'All Departments') : dept.replace('School of ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards Grid */}
          {(() => {
            const term = courseSearch.toLowerCase();
            const filteredCourses = (courses || []).filter(c => {
              const matchesSearch = (c.name || '').toLowerCase().includes(term) ||
                                    (c.code || '').toLowerCase().includes(term) ||
                                    (c.department || '').toLowerCase().includes(term) ||
                                    (c.universityName || '').toLowerCase().includes(term) ||
                                    (c.collegeName || '').toLowerCase().includes(term) ||
                                    (c.description || '').toLowerCase().includes(term);
              const matchesDept = courseDeptFilter === 'all' || c.department === courseDeptFilter;
              return matchesSearch && matchesDept;
            });

            if (filteredCourses.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {isHindi ? 'कोई कोर्स नहीं मिला' : 'No Academic Courses Found'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      {isHindi 
                        ? 'नया एकेडमिक कोर्स जोड़ने के लिए ऊपर दिए गए "+ नया कोर्स जोड़ें" बटन पर क्लिक करें। जोड़ा गया कोर्स सीधे स्टूडेंट पोर्टल पर दिखेगा।'
                        : 'Click "+ Add Academic Program" above to create degree, diploma or certificate programs for students.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddCourse}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    {isHindi ? '+ पहला कोर्स जोड़ें' : '+ Add First Course'}
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map((c, idx) => (
                  <div 
                    key={c.id || idx}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono font-black uppercase tracking-wider text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                            {c.code || 'COURSE'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[140px]">
                            {c.department ? c.department.replace('School of ', '') : 'General'}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {c.durationYears || 3} {isHindi ? 'वर्ष' : 'Yrs'} • {c.totalSemesters || 6} Sem
                        </span>
                      </div>

                      {/* Course Full Title */}
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {c.name}
                      </h3>

                      {/* Affiliations */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {c.universityName && (
                          <div className="flex items-start gap-1.5">
                            <Landmark className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <span className="font-medium text-slate-700 leading-tight">{c.universityName}</span>
                          </div>
                        )}
                        {c.collegeName && (
                          <div className="flex items-start gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span className="font-semibold text-amber-900 leading-tight">{c.collegeName}</span>
                          </div>
                        )}
                      </div>

                      {/* Eligibility Box */}
                      {c.eligibility && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                          <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider">
                            {isHindi ? 'प्रवेश पात्रता:' : 'Eligibility:'}
                          </span>
                          <p className="text-slate-800 font-semibold mt-0.5 text-[11px] leading-tight">
                            {c.eligibility}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      {c.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {isHindi ? 'वेबसाइट पर लाइव' : 'Live on Website'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCourse(c)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors cursor-pointer text-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'एडिट' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(c)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                          title={isHindi ? 'कोर्स हटाएं' : 'Delete Course'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TESTIMONIAL SLIDE */}
      {/* ========================================================================= */}
      {showTstModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{editingTst ? 'Edit Testimonial Slide' : 'Add New Slide to Top Slider'}</span>
              </h3>
              <button onClick={() => setShowTstModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTst} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Vishwakarma"
                  value={tstForm.studentName}
                  onChange={(e) => setTstForm({ ...tstForm, studentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Course / Degree *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bachelor of Computer Applications (BCA)"
                  value={tstForm.course}
                  onChange={(e) => setTstForm({ ...tstForm, course: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Placement / Achievement Badge</label>
                <input
                  type="text"
                  placeholder="e.g. Placed at TCS (₹4.2 LPA)"
                  value={tstForm.badge}
                  onChange={(e) => setTstForm({ ...tstForm, badge: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Student Photo URL (or Image Link)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={tstForm.imageUrl}
                  onChange={(e) => setTstForm({ ...tstForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
                <span className="text-[10px] text-slate-400 block">Provide an image URL or keep default stock avatar</span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Student Quote / Review *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter student experience, feedback, or placement review..."
                  value={tstForm.review}
                  onChange={(e) => setTstForm({ ...tstForm, review: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 leading-relaxed font-normal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTstModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Slide Live
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT CAMPUS FUNCTION PHOTO */}
      {/* ========================================================================= */}
      {showEventPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" />
                <span>{editingEventPhoto ? (isHindi ? 'फंक्शन फोटो एडिट करें' : 'Edit Function Photo') : (isHindi ? 'नई फंक्शन फोटो जोड़ें' : 'Add Function Photo')}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowEventPhotoModal(false)} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEventPhoto} className="space-y-4">
              {/* English & Hindi Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{isHindi ? 'कार्यक्रम का नाम (English Title) *' : 'Event / Ceremony Title *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Convocation Ceremony"
                    value={eventPhotoForm.title}
                    onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{isHindi ? 'हिंदी शीर्षक (Hindi Title)' : 'Hindi Title (Optional)'}</label>
                  <input
                    type="text"
                    placeholder="उदा. वार्षिक दीक्षांत समारोह 2024"
                    value={eventPhotoForm.titleHi}
                    onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, titleHi: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{isHindi ? 'कैटेगरी (Category) *' : 'Category *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="Convocation / Lab Workshop / Cultural"
                    value={eventPhotoForm.category}
                    onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{isHindi ? 'वर्ष / सत्र (Year / Session)' : 'Year / Academic Session'}</label>
                  <input
                    type="text"
                    placeholder="e.g. 2024 / Session 2023-24"
                    value={eventPhotoForm.date}
                    onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* 1-Click Demo Photo Quick Selectors */}
              <div className="space-y-1.5 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
                <label className="font-bold text-indigo-900 block flex items-center justify-between">
                  <span>{isHindi ? '⚡ 1-क्लिक क्विक डेमो फोटो चुनें:' : '⚡ 1-Click Demo Photo Quick Presets:'}</span>
                  <span className="text-[10px] text-indigo-600 font-normal">Click to auto-fill</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {demoImagePresets.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => setEventPhotoForm(prev => ({
                        ...prev,
                        imageUrl: preset.url,
                        category: preset.category,
                        title: prev.title || preset.title,
                        titleHi: prev.titleHi || preset.titleHi
                      }))}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-600 text-indigo-900 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload from Computer OR URL Input */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">{isHindi ? 'फोटो सोर्स (Photo Source) *' : 'Photo Image Source *'}</label>
                
                {/* File Upload Button */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer border border-slate-300 transition-colors text-xs shrink-0">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{uploadingPhoto ? 'Uploading...' : (isHindi ? 'कंप्यूटर से फोटो चुनें (Upload)' : 'Upload Photo from Device')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUploadPhotoFile} 
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">{isHindi ? 'या नीचे लिंक (URL) डालें:' : 'or enter direct image URL below:'}</span>
                </div>

                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or /uploads/gallery/..."
                  value={eventPhotoForm.imageUrl}
                  onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 text-xs"
                />
              </div>

              {/* Live Preview of Selected Photo */}
              {eventPhotoForm.imageUrl && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isHindi ? 'लाइव फोटो प्रीव्यू (Live Preview):' : 'Live Photo Preview:'}
                  </span>
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                    <img 
                      src={eventPhotoForm.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute bottom-2 left-2.5 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                      {eventPhotoForm.category || 'Function'} • {eventPhotoForm.date || '2024'}
                    </div>
                  </div>
                </div>
              )}

              {/* Short Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{isHindi ? 'संक्षिप्त विवरण (Short Description)' : 'Short Description / Highlights'}</label>
                <textarea
                  rows={2}
                  placeholder={isHindi ? "कार्यक्रम का विवरण या छात्रों की उपलब्धि..." : "Brief event highlights or student achievements..."}
                  value={eventPhotoForm.description}
                  onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 leading-relaxed font-normal"
                />
              </div>

              {/* Active Toggle Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activePhotoToggle"
                  checked={eventPhotoForm.active}
                  onChange={(e) => setEventPhotoForm({ ...eventPhotoForm, active: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="activePhotoToggle" className="font-bold text-slate-700 cursor-pointer text-xs">
                  {isHindi ? 'छात्र वेबसाइट पर सक्रिय रखें (Show on Homepage)' : 'Show on Student Homepage Event Gallery (Active)'}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventPhotoModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingEventPhoto ? (isHindi ? 'बदलाव सेव करें' : 'Save Changes') : (isHindi ? 'फोटो लाइव सेव करें' : 'Save Photo Live')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT ACADEMIC COURSE CMS */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCourse 
                      ? (isHindi ? 'एकेडमिक कोर्स संपादित करें (Edit Course)' : 'Edit Academic Course') 
                      : (isHindi ? 'नया एकेडमिक कोर्स जोड़ें (Add Academic Course)' : 'Add New Academic Program')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isHindi ? 'सेव करते ही यह कोर्स स्टूडेंट वेबसाइट पर तुरंत लाइव दिखेगा।' : 'Saved courses immediately show up on the public student website.'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowCourseModal(false)} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4">
              {/* Quick Presets for 1-Click Fill */}
              {!editingCourse && (
                <div className="space-y-1.5 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
                  <label className="font-bold text-indigo-900 block flex items-center justify-between">
                    <span>{isHindi ? '⚡ 1-क्लिक क्विक कोर्स चुनें (Quick Presets):' : '⚡ 1-Click Course Quick Fill Presets:'}</span>
                    <span className="text-[10px] text-indigo-600 font-normal">Click to auto-fill</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {coursePresets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => setCourseForm(prev => ({
                          ...prev,
                          name: preset.name,
                          code: preset.code,
                          department: preset.department,
                          durationYears: preset.durationYears,
                          totalSemesters: preset.totalSemesters,
                          eligibility: preset.eligibility,
                          description: preset.description
                        }))}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-600 text-indigo-900 hover:text-white rounded-lg text-[10px] font-bold border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'कोर्स का नाम (Course Name) *' : 'Course Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bachelor of Computer Applications (BCA)"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'कोर्स कोड (Code) *' : 'Course Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA / BTECH-CSE"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isHindi ? 'संकाय / विभाग (Department / School)' : 'Department / School of Faculty'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. School of Computing & IT / School of Management"
                  value={courseForm.department}
                  onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              {/* Affiliated University & College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'संबद्ध विश्वविद्यालय (Affiliated University)' : 'Affiliated University'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maharaja Chhatrasal Bundelkhand University (MCBU)"
                    value={courseForm.universityName}
                    onChange={(e) => setCourseForm({ ...courseForm, universityName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'संस्थान / कॉलेज (Partner College)' : 'Partner College / Institute'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PKC Education Learning Institute & Consultancy"
                    value={courseForm.collegeName}
                    onChange={(e) => setCourseForm({ ...courseForm, collegeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Duration & Semesters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'अवधि वर्ष में (Duration in Years)' : 'Program Duration (Years)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={courseForm.durationYears}
                    onChange={(e) => {
                      const yrs = Number(e.target.value) || 1;
                      setCourseForm({ 
                        ...courseForm, 
                        durationYears: yrs,
                        totalSemesters: yrs * 2
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    {isHindi ? 'कुल सेमेस्टर (Total Semesters)' : 'Total Semesters'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={courseForm.totalSemesters}
                    onChange={(e) => setCourseForm({ ...courseForm, totalSemesters: Number(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isHindi ? 'प्रवेश पात्रता (Eligibility Criteria)' : 'Eligibility Criteria'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10+2 with minimum 50% aggregate marks"
                  value={courseForm.eligibility}
                  onChange={(e) => setCourseForm({ ...courseForm, eligibility: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  {isHindi ? 'कोर्स विवरण / विशेषताएं (Course Description)' : 'Course Description & Curriculum Highlights'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isHindi ? "कोर्स का विवरण, मुख्य विषय एवं कैरियर अवसर..." : "Comprehensive curriculum details, core subjects and career prospects..."}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 leading-relaxed font-normal"
                />
              </div>

              {/* Notice Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11px] font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isHindi 
                    ? 'नोट: यह कोर्स सेव करने पर छात्र वेबसाइट के "Academic Programs" पेज पर तुरंत दिखाई देगा।' 
                    : 'Note: This course will immediately be visible to students on the public "Academic Programs" page.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingCourse ? (isHindi ? 'सेव हो रहा है...' : 'Saving...') : (editingCourse ? (isHindi ? 'बदलाव सेव करें' : 'Save Changes') : (isHindi ? 'कोर्स लाइव सेव करें' : 'Save Course Live'))}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
