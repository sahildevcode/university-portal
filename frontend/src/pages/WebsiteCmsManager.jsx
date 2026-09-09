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
  Layers
} from 'lucide-react';

export default function WebsiteCmsManager() {
  const [activeSubTab, setActiveSubTab] = useState('events_gallery'); // 'events_gallery' | 'testimonials' | 'about' | 'inquiries'
  
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
    } catch (err) {
      console.error('Error loading CMS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
                टॉप फोटो स्लाइडर, संस्थान का इतिहास/आंकड़े (About Us), एवं छात्रों द्वारा भेजी गई इंक्वायरी प्रबंधित करें।
              </p>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 text-right shrink-0">
            <span className="text-[11px] text-indigo-200 block">Pending Inquiries</span>
            <span className="text-xl font-black text-amber-300">
              {inquiries.filter(i => i.status === 'New').length} New Leads
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Campus Functions | Testimonials | About Us | Inquiries */}
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
          <span>📸 1. Campus Functions &amp; Event Photos ({eventPhotos.length})</span>
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
          <span>2. Testimonials CMS ({testimonials.length})</span>
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
          <span>3. About Us &amp; Statistics Editor</span>
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
          <span>4. Student Admission Inquiries ({inquiries.length})</span>
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
                <span>संस्थान फंक्शन एवं कार्यक्रम फोटो (Campus Events &amp; Functions Gallery)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                वार्षिक उत्सव, दीक्षांत समारोह, कंप्यूटर लैब व सम्मान समारोह की फोटो यहाँ से मैनेज करें। ये फोटो सीधे स्टूडेंट पेज पर लाइव दिखाई देती हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddEventPhoto}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नई फंक्शन फोटो जोड़ें (+ Add Photo)</span>
            </button>
          </div>

          {/* Photos Cards Grid */}
          {eventPhotos.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">कोई फंक्शन फोटो नहीं मिली</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  संस्थान के वार्षिक उत्सव, दीक्षांत समारोह या लैब की फोटो जोड़ने के लिए ऊपर दिए गए बटन पर क्लिक करें।
                </p>
              </div>
              <button
                onClick={handleOpenAddEventPhoto}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
              >
                + पहली फोटो जोड़ें
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
                          {photo.titleHi || photo.title}
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
                      <span>एडिट करें (Edit)</span>
                    </button>

                    <button
                      onClick={() => handleDeleteEventPhoto(photo.id, photo.title)}
                      className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>हटाएं (Delete)</span>
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
                होम पेज के शीर्ष पर दिखने वाले स्लाइडर में नई फोटो, छात्र का नाम, कोर्स और रिव्यू जोड़ें।
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
              संस्थान कितने साल पुराना है, कितने छात्रों को पास कराया, एफिलिएशन एवं मिशन/विज़न को यहाँ से कभी भी एडिट करें।
            </p>
          </div>

          <form onSubmit={handleSaveAbout} className="space-y-6 text-xs">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Established Year (स्थापना वर्ष)</label>
                <input
                  type="number"
                  value={aboutForm.establishedYear}
                  onChange={(e) => setAboutForm({ ...aboutForm, establishedYear: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Years of Excellence (अनुभव वर्ष)</label>
                <input
                  type="number"
                  value={aboutForm.yearsOfExcellence}
                  onChange={(e) => setAboutForm({ ...aboutForm, yearsOfExcellence: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Total Students Guided (प्रवेशित छात्र)</label>
                <input
                  type="number"
                  value={aboutForm.totalStudentsGuided}
                  onChange={(e) => setAboutForm({ ...aboutForm, totalStudentsGuided: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-indigo-950"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">University Affiliations (मान्यताएं)</label>
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
                छात्रों द्वारा वेबसाइट से भेजी गई पूछताछ। तुरंत कॉल या व्हाट्सएप करें एवं स्थिति अपडेट करें।
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
                <span>{editingEventPhoto ? 'फंक्शन फोटो एडिट करें (Edit Function Photo)' : 'नई फंक्शन फोटो जोड़ें (Add Function Photo)'}</span>
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
                  <label className="font-bold text-slate-700 block">कार्यक्रम का नाम (English Title) *</label>
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
                  <label className="font-bold text-slate-700 block">हिंदी शीर्षक (Hindi Title)</label>
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
                  <label className="font-bold text-slate-700 block">कैटेगरी (Category) *</label>
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
                  <label className="font-bold text-slate-700 block">वर्ष / सत्र (Year / Session)</label>
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
                  <span>⚡ 1-क्लिक क्विक डेमो फोटो चुनें:</span>
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
                <label className="font-bold text-slate-700 block">फोटो सोर्स (Photo Image Source) *</label>
                
                {/* File Upload Button */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer border border-slate-300 transition-colors text-xs shrink-0">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>{uploadingPhoto ? 'Uploading...' : 'कंप्यूटर से फोटो चुनें (Upload)'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUploadPhotoFile} 
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">या नीचे लिंक (URL) डालें:</span>
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
                    लाइव फोटो प्रीव्यू (Live Preview):
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
                <label className="font-bold text-slate-700 block">संक्षिप्त विवरण (Short Description)</label>
                <textarea
                  rows={2}
                  placeholder="कार्यक्रम का विवरण या छात्रों की उपलब्धि..."
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
                  छात्र वेबसाइट पर सक्रिय रखें (Show on Student Homepage Slider)
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
                  <span>{editingEventPhoto ? 'बदलाव सेव करें (Update)' : 'फोटो लाइव सेव करें (Save Live)'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
