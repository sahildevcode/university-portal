import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Briefcase, 
  Plus, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  GraduationCap, 
  Award, 
  Layers, 
  X, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy,
  ChevronRight,
  ExternalLink,
  Eye,
  Grid,
  List
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { fireCelebration } from '../utils/confetti';

const SECTOR_OPTIONS = [
  'Electrical & Electronics',
  'IT & Computer Software',
  'Beauty & Wellness',
  'Solar & Renewable Energy',
  'Accounting & Finance',
  'Electronics & Mobile Tech',
  'Apparel & Fashion',
  'Healthcare & Paramedical',
  'Automobile & Mechanical',
  'Construction & Plumbing',
  'Hospitality & Tourism',
  'Agriculture & Dairy Tech',
  'General Vocational'
];

const DURATION_OPTIONS = [
  '1 Month',
  '3 Months',
  '6 Months',
  '9 Months',
  '1 Year',
  '2 Years'
];

const ELIGIBILITY_OPTIONS = [
  'No Formal Education Required',
  '5th Pass',
  '8th Pass',
  '10th Pass (High School)',
  '12th Pass (Intermediate)',
  '12th Commerce',
  '12th Science',
  'Any Graduate',
  'ITI / Diploma'
];

const INITIAL_DEMO_COURSES = [
  {
    id: 'voc-1',
    courseName: 'Electrician & Building Wireman',
    courseCode: 'VOC-ELE-101',
    sector: 'Electrical & Electronics',
    duration: '1 Year',
    eligibility: '10th Pass (High School)',
    fee: 12000,
    certification: 'PKC Certified Skill Diploma',
    mode: 'Regular',
    description: 'Domestic wiring, industrial electrical control panel installation, motor winding and home appliance repair.',
    status: 'Active'
  },
  {
    id: 'voc-2',
    courseName: 'Web Development & Full-Stack Coding',
    courseCode: 'VOC-IT-102',
    sector: 'IT & Computer Software',
    duration: '6 Months',
    eligibility: '12th Pass (Intermediate)',
    fee: 15000,
    certification: 'PKC Professional Tech Certification',
    mode: 'Regular / Hybrid',
    description: 'HTML5, CSS3, JavaScript, React.js, Node.js, Express, databases and real-world web application development.',
    status: 'Active'
  },
  {
    id: 'voc-3',
    courseName: 'Beautician, Cosmetology & Salon Styling',
    courseCode: 'VOC-BW-103',
    sector: 'Beauty & Wellness',
    duration: '6 Months',
    eligibility: '8th Pass',
    fee: 10000,
    certification: 'PKC Professional Beauty Diploma',
    mode: 'Regular',
    description: 'Bridal makeup, skin treatments, hair styling, chemical treatments, salon hygiene and professional client care.',
    status: 'Active'
  },
  {
    id: 'voc-4',
    courseName: 'Solar PV System Installer & Technician',
    courseCode: 'VOC-SOL-104',
    sector: 'Solar & Renewable Energy',
    duration: '3 Months',
    eligibility: '10th Pass (High School)',
    fee: 8500,
    certification: 'National Green Energy Skill Certification',
    mode: 'Regular',
    description: 'Rooftop solar panel installation, inverter grid connection, battery maintenance and solar power site inspection.',
    status: 'Active'
  },
  {
    id: 'voc-5',
    courseName: 'Computer Hardware & Network Engineering',
    courseCode: 'VOC-IT-105',
    sector: 'IT & Computer Software',
    duration: '6 Months',
    eligibility: '10th Pass (High School)',
    fee: 9000,
    certification: 'Hardware & Networking Diploma',
    mode: 'Regular',
    description: 'PC assembling, OS installation, motherboard diagnostics, LAN/Wi-Fi router configuration and troubleshooting.',
    status: 'Active'
  },
  {
    id: 'voc-6',
    courseName: 'Tally Prime with GST & Professional Accounting',
    courseCode: 'VOC-ACC-106',
    sector: 'Accounting & Finance',
    duration: '3 Months',
    eligibility: '12th Commerce',
    fee: 6500,
    certification: 'PKC Certified Accountant',
    mode: 'Regular',
    description: 'Voucher entry, inventory management, GST return filing, E-way billing, balance sheet preparation and TDS calculation.',
    status: 'Active'
  },
  {
    id: 'voc-7',
    courseName: 'Mobile Phone Hardware & Software Repairing',
    courseCode: 'VOC-MOB-107',
    sector: 'Electronics & Mobile Tech',
    duration: '3 Months',
    eligibility: '8th Pass',
    fee: 7500,
    certification: 'Mobile Repairing Certification',
    mode: 'Regular',
    description: 'SMD rework, display replacement, charging port repair, flashing, FRP unlock and software troubleshooting for all smartphones.',
    status: 'Active'
  },
  {
    id: 'voc-8',
    courseName: 'Fashion Designing & Garment Fabrication',
    courseCode: 'VOC-TEX-108',
    sector: 'Apparel & Fashion',
    duration: '1 Year',
    eligibility: '8th Pass',
    fee: 11000,
    certification: 'PKC Garment Design Diploma',
    mode: 'Regular',
    description: 'Pattern drafting, garment stitching, boutique management, embroidery, cutting techniques and contemporary design.',
    status: 'Active'
  }
];

export default function VocationalCoursesManager({ lang = 'en', toggleLang }) {
  const [courses, setCourses] = useState(() => {
    try {
      const cached = localStorage.getItem('pkc_vocational_courses');
      return cached ? JSON.parse(cached) : INITIAL_DEMO_COURSES;
    } catch {
      return INITIAL_DEMO_COURSES;
    }
  });

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [toast, setToast] = useState(null);

  // Manual Add / Edit Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseName: '',
    courseCode: '',
    sector: SECTOR_OPTIONS[0],
    customSector: '',
    duration: '6 Months',
    eligibility: '10th Pass (High School)',
    fee: '',
    certification: 'PKC Certified Skill Diploma',
    mode: 'Regular',
    description: '',
    status: 'Active'
  });

  // Excel Upload Modal state
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [parsedExcelRows, setParsedExcelRows] = useState([]);
  const [excelFileName, setExcelFileName] = useState('');
  const [excelImportMode, setExcelImportMode] = useState('append'); // 'append' | 'replace'
  const [parsingExcel, setParsingExcel] = useState(false);
  const fileInputRef = useRef(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('pkc_vocational_courses', JSON.stringify(courses));
    } catch (err) {
      console.error('Failed to cache vocational courses:', err);
    }
  }, [courses]);

  // Fetch from backend API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vocational-courses');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
        }
      }
    } catch (err) {
      console.warn('Backend fetch note (using local cache):', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCourse(null);
    const randomCode = `VOC-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      courseName: '',
      courseCode: randomCode,
      sector: SECTOR_OPTIONS[0],
      customSector: '',
      duration: '6 Months',
      eligibility: '10th Pass (High School)',
      fee: '',
      certification: 'PKC Certified Skill Diploma',
      mode: 'Regular',
      description: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    const isCustomSector = !SECTOR_OPTIONS.includes(course.sector);
    setFormData({
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      sector: isCustomSector ? 'Other' : course.sector,
      customSector: isCustomSector ? course.sector : '',
      duration: course.duration || '6 Months',
      eligibility: course.eligibility || '10th Pass (High School)',
      fee: course.fee !== undefined ? String(course.fee) : '',
      certification: course.certification || 'PKC Certified Skill Diploma',
      mode: course.mode || 'Regular',
      description: course.description || '',
      status: course.status || 'Active'
    });
    setShowAddModal(true);
  };

  // Handle Form Submit (Add or Edit)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!formData.courseName.trim()) {
      showToastMsg('Course name is required!', 'error');
      return;
    }

    const resolvedSector = formData.sector === 'Other' && formData.customSector.trim() 
      ? formData.customSector.trim() 
      : formData.sector;

    const payload = {
      courseName: formData.courseName.trim(),
      courseCode: formData.courseCode.trim() || `VOC-${Date.now().toString().slice(-4)}`,
      sector: resolvedSector,
      duration: formData.duration,
      eligibility: formData.eligibility,
      fee: Number(formData.fee) || 0,
      certification: formData.certification.trim(),
      mode: formData.mode,
      description: formData.description.trim(),
      status: formData.status
    };

    if (editingCourse) {
      // Update existing course
      const updatedList = courses.map(c => 
        c.id === editingCourse.id ? { ...c, ...payload, updatedAt: new Date().toISOString() } : c
      );
      setCourses(updatedList);
      showToastMsg(`🎉 Course "${payload.courseName}" updated successfully!`, 'success');

      // Sync with backend API
      try {
        await fetch(`/api/vocational-courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('API update failed, preserved locally:', err);
      }
    } else {
      // Create new course
      const newCourse = {
        id: 'voc-' + Date.now(),
        ...payload,
        createdAt: new Date().toISOString()
      };
      setCourses([newCourse, ...courses]);
      fireCelebration({ x: 0.5, y: 0.5 });
      showToastMsg(`🎉 New Vocational Course "${payload.courseName}" added successfully!`, 'success');

      // Sync with backend API
      try {
        await fetch('/api/vocational-courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.warn('API add failed, preserved locally:', err);
      }
    }

    setShowAddModal(false);
    setEditingCourse(null);
  };

  // Delete Course
  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete vocational course "${courseName}"?`)) return;

    setCourses(prev => prev.filter(c => c.id !== courseId));
    showToastMsg(`🗑️ Course "${courseName}" removed.`, 'success');

    try {
      await fetch(`/api/vocational-courses/${courseId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API delete failed, removed locally:', err);
    }
  };

  // Handle Excel File Drop / Selection
  const handleExcelFileSelect = (file) => {
    if (!file) return;
    setExcelFileName(file.name);
    setParsingExcel(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (!json || json.length === 0) {
          showToastMsg('Selected Excel sheet is empty or invalid!', 'error');
          setParsingExcel(false);
          return;
        }

        // Auto-map columns
        const mapped = json.map((row, idx) => {
          const name = row['Course Name'] || row['Course'] || row['Trade'] || row['पाठ्यक्रम'] || row['Name'] || row['courseName'] || '';
          const code = row['Course Code'] || row['Code'] || row['Trade Code'] || row['courseCode'] || `VOC-IMP-${idx + 1}`;
          const sector = row['Sector'] || row['Category'] || row['Trade Group'] || row['sector'] || 'General Vocational';
          const duration = row['Duration'] || row['duration'] || row['अवधि'] || '6 Months';
          const eligibility = row['Eligibility'] || row['eligibility'] || row['योग्यता'] || '10th Pass';
          const fee = row['Total Fee'] || row['Fee'] || row['Fees'] || row['Course Fee'] || row['शुल्क'] || 0;
          const cert = row['Certification'] || row['Board'] || row['Affiliation'] || 'PKC Certified Skill Diploma';
          const desc = row['Description'] || row['Details'] || row['Skills'] || '';

          return {
            id: 'voc-' + Date.now() + '-' + idx,
            courseName: String(name || `Vocational Course ${idx + 1}`).trim(),
            courseCode: String(code).trim().toUpperCase(),
            sector: String(sector).trim(),
            duration: String(duration).trim(),
            eligibility: String(eligibility).trim(),
            fee: Number(fee) || 0,
            certification: String(cert).trim(),
            mode: 'Regular',
            description: String(desc).trim(),
            status: 'Active'
          };
        }).filter(item => item.courseName.length > 0);

        setParsedExcelRows(mapped);
        showToastMsg(`Extracted ${mapped.length} courses from Excel. Please review preview below!`, 'success');
      } catch (err) {
        console.error('Error reading excel file:', err);
        showToastMsg('Failed to parse Excel file: ' + err.message, 'error');
      } finally {
        setParsingExcel(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Confirm Excel Import
  const handleConfirmExcelImport = async () => {
    if (parsedExcelRows.length === 0) {
      showToastMsg('No valid courses to import!', 'error');
      return;
    }

    let nextCourses = [];
    if (excelImportMode === 'replace') {
      nextCourses = parsedExcelRows;
    } else {
      // Append mode - avoid duplicate names
      const existingNames = new Set(courses.map(c => c.courseName.toLowerCase()));
      const newItems = parsedExcelRows.filter(c => !existingNames.has(c.courseName.toLowerCase()));
      nextCourses = [...newItems, ...courses];
    }

    setCourses(nextCourses);
    fireCelebration({ x: 0.5, y: 0.5 });
    showToastMsg(`🎉 Successfully imported ${parsedExcelRows.length} vocational courses!`, 'success');
    setShowExcelModal(false);
    setParsedExcelRows([]);
    setExcelFileName('');

    // Send to backend API
    try {
      await fetch('/api/vocational-courses/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courses: parsedExcelRows,
          mode: excelImportMode
        })
      });
    } catch (err) {
      console.warn('Backend bulk import note (preserved locally):', err);
    }
  };

  // Download Sample Excel Template
  const handleDownloadSampleTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();
      const sampleData = [
        {
          'Course Name': 'Electrician & Building Wireman',
          'Course Code': 'VOC-ELE-101',
          'Sector': 'Electrical & Electronics',
          'Duration': '1 Year',
          'Eligibility': '10th Pass',
          'Total Fee': 12000,
          'Certification': 'PKC Certified Skill Diploma',
          'Description': 'House wiring, motor winding, single/three phase control panels'
        },
        {
          'Course Name': 'Web Development & Coding',
          'Course Code': 'VOC-IT-102',
          'Sector': 'IT & Computer Software',
          'Duration': '6 Months',
          'Eligibility': '12th Pass',
          'Total Fee': 15000,
          'Certification': 'PKC Tech Certification',
          'Description': 'HTML, CSS, JavaScript, React, Node.js and full-stack project development'
        },
        {
          'Course Name': 'Beautician & Salon Management',
          'Course Code': 'VOC-BW-103',
          'Sector': 'Beauty & Wellness',
          'Duration': '6 Months',
          'Eligibility': '8th / 10th Pass',
          'Total Fee': 10000,
          'Certification': 'PKC Beauty Diploma',
          'Description': 'Bridal makeup, hair styling, skin treatments and salon management'
        },
        {
          'Course Name': 'Solar PV System Installer',
          'Course Code': 'VOC-SOL-104',
          'Sector': 'Solar & Renewable Energy',
          'Duration': '3 Months',
          'Eligibility': '10th Pass',
          'Total Fee': 8500,
          'Certification': 'Green Energy Certificate',
          'Description': 'Rooftop solar panel installation, wiring, inverter grid and maintenance'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      XLSX.utils.book_append_sheet(wb, ws, 'Vocational_Courses');
      XLSX.writeFile(wb, 'PKC_Vocational_Courses_Template.xlsx');
      showToastMsg('📥 Sample Excel Template downloaded successfully!', 'success');
    } catch (err) {
      console.error('Error generating template:', err);
      showToastMsg('Failed to download template: ' + err.message, 'error');
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter(c => {
      // Sector filter
      if (selectedSector !== 'all' && c.sector !== selectedSector) return false;

      // Duration filter
      if (selectedDuration !== 'all' && c.duration !== selectedDuration) return false;

      if (!q) return true;

      const nameMatch = (c.courseName || '').toLowerCase().includes(q);
      const codeMatch = (c.courseCode || '').toLowerCase().includes(q);
      const sectorMatch = (c.sector || '').toLowerCase().includes(q);
      const eligMatch = (c.eligibility || '').toLowerCase().includes(q);
      const descMatch = (c.description || '').toLowerCase().includes(q);

      return nameMatch || codeMatch || sectorMatch || eligMatch || descMatch;
    });
  }, [courses, searchQuery, selectedSector, selectedDuration]);

  // Unique sectors from current courses
  const availableSectors = useMemo(() => {
    const set = new Set();
    courses.forEach(c => {
      if (c.sector) set.add(c.sector);
    });
    return Array.from(set).sort();
  }, [courses]);

  return (
    <div className="w-full space-y-6 animate-fadeIn text-slate-900">
      
      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-black animate-fadeIn ${
          toast.type === 'success' 
            ? 'bg-emerald-950 text-white border-emerald-500/50 ring-4 ring-emerald-500/20' 
            : 'bg-rose-950 text-white border-rose-500/50 ring-4 ring-rose-500/20'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-900/60 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Skill Development &amp; Vocational Certification Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🛠️ Vocational Courses &amp; Skill Trades</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-400/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
              Module 12
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            एक्सेल शीट अपलोड करके या खुद से 1-क्लिक में नए वोकैशनल (व्यावसायिक) कोर्सेस, ट्रेड्स व सर्टिफिकेशन प्रोग्राम्स जोड़ें। फीस, योग्यता और अवधि सेट करें।
          </p>
        </div>

        {/* Action Buttons: Add Course + Excel Upload + Sample Template */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          
          {/* Main Button: Add Course Manually */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
            title="Create a new vocational course manually"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Vocational Course</span>
          </button>

          {/* Button: Excel Upload */}
          <button
            type="button"
            onClick={() => setShowExcelModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30"
            title="Upload Excel sheet to bulk import courses"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Upload Excel</span>
          </button>

          {/* Button: Download Template */}
          <button
            type="button"
            onClick={handleDownloadSampleTemplate}
            className="bg-white/10 hover:bg-white/20 text-slate-200 px-3.5 py-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
            title="Download sample Excel template"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Template</span>
          </button>

        </div>
      </div>

      {/* Metrics Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Courses</span>
            <strong className="text-lg font-black text-slate-900 block mt-0.5">
              {courses.length} Programs
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Industry Sectors</span>
            <strong className="text-lg font-black text-indigo-950 block mt-0.5">
              {availableSectors.length} Sectors
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Status</span>
            <strong className="text-lg font-black text-emerald-700 block mt-0.5">
              {courses.filter(c => c.status === 'Active').length} Open
            </strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Certification</span>
            <strong className="text-lg font-black text-purple-900 block mt-0.5">
              Diploma / Cert
            </strong>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Course Name, Code (e.g. VOC-ELE-101), Sector, Eligibility, Skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSector('all');
                setSelectedDuration('all');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Sector & Duration Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Filter by Industry Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="all">All Sectors ({availableSectors.length})</option>
              {availableSectors.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Filter by Course Duration</label>
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-none"
            >
              <option value="all">All Durations</option>
              {DURATION_OPTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Course List Section */}
      <div className="space-y-4">
        
        {/* Results Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Courses Found:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 font-black">
              {filteredCourses.length} of {courses.length}
            </span>
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <p className="font-black text-slate-700 text-base">कोई वोकैशनल कोर्स नहीं मिला!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              फिल्टर बदलकर देखें या ऊपर "+ Add Vocational Course" बटन दबाकर नया कोर्स जोड़ें।
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Course Now</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* ========================================================================= */
          /* GRID VIEW */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-amber-400 relative overflow-hidden"
              >
                {/* Sector Color Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-indigo-600" />

                <div className="space-y-3">
                  
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full truncate max-w-[170px]" title={course.sector}>
                      {course.sector}
                    </span>

                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {course.courseCode}
                    </span>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                      {course.courseName}
                    </h3>
                    {course.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Course Attributes Pills */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{course.duration}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate" title={course.eligibility}>{course.eligibility}</span>
                    </div>
                  </div>

                  {/* Fee & Certification */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Fee</span>
                      <strong className="text-sm font-black text-slate-900 block">
                        ₹{Number(course.fee).toLocaleString('en-IN')}
                      </strong>
                    </div>

                    <div className="text-right max-w-[130px]">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Certification</span>
                      <span className="text-[10px] font-bold text-indigo-900 block truncate" title={course.certification}>
                        {course.certification}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    course.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    ● {course.status || 'Active'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course.id, course.courseName)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* ========================================================================= */
          /* TABLE VIEW */
          /* ========================================================================= */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[10.5px] font-black tracking-wider">
                  <tr>
                    <th className="p-3.5 text-center w-12">#</th>
                    <th className="p-3.5">Course Name &amp; Code</th>
                    <th className="p-3.5">Sector</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Eligibility</th>
                    <th className="p-3.5 text-right">Fee (₹)</th>
                    <th className="p-3.5">Certification</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((course, idx) => (
                    <tr key={course.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="p-3 max-w-[220px]">
                        <strong className="font-black text-slate-900 block leading-snug truncate" title={course.courseName}>
                          {course.courseName}
                        </strong>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold block">
                          {course.courseCode}
                        </span>
                      </td>

                      <td className="p-3 max-w-[160px]">
                        <span className="text-[11px] font-bold text-slate-800 block truncate" title={course.sector}>
                          {course.sector}
                        </span>
                      </td>

                      <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                        {course.duration}
                      </td>

                      <td className="p-3 max-w-[150px]">
                        <span className="text-[11px] text-slate-600 block truncate" title={course.eligibility}>
                          {course.eligibility}
                        </span>
                      </td>

                      <td className="p-3 text-right font-mono font-black text-slate-900">
                        ₹{Number(course.fee).toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 max-w-[180px]">
                        <span className="text-[10.5px] font-medium text-indigo-950 block truncate" title={course.certification}>
                          {course.certification}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          course.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {course.status || 'Active'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(course)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                            title="Edit Course"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id, course.courseName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT VOCATIONAL COURSE MANUALLY */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-fadeIn"
          onClick={() => setShowAddModal(false)}
        >
          <div 
            className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-200 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                    {editingCourse ? 'Edit Vocational Course' : '+ Add New Vocational Course'}
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    व्यावसायिक पाठ्यक्रम का विवरण दर्ज करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveCourse} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 text-xs">
                
                {/* Course Name */}
                <div>
                  <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                    Course / Trade Name * (पाठ्यक्रम का नाम)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    placeholder="e.g. Electrician, Web Designing, Beautician, Solar Technician"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs"
                  />
                </div>

                {/* Course Code & Sector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Course Code (कोर्स कोड)
                    </label>
                    <input
                      type="text"
                      value={formData.courseCode}
                      onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                      placeholder="e.g. VOC-ELE-101"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none text-xs uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Industry Sector (ट्रेड श्रेणी) *
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none text-xs"
                    >
                      {SECTOR_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="Other">Other (कस्टम सेक्टर लिखें)</option>
                    </select>
                  </div>
                </div>

                {formData.sector === 'Other' && (
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">Specify Custom Sector Name</label>
                    <input
                      type="text"
                      value={formData.customSector}
                      onChange={(e) => setFormData({ ...formData, customSector: e.target.value })}
                      placeholder="Enter custom sector name"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none text-xs"
                    />
                  </div>
                )}

                {/* Duration & Minimum Eligibility */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Duration (पाठ्यक्रम अवधि) *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none text-xs"
                    >
                      {DURATION_OPTIONS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Min. Eligibility (न्यूनतम योग्यता)
                    </label>
                    <select
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none text-xs"
                    >
                      {ELIGIBILITY_OPTIONS.map(el => (
                        <option key={el} value={el}>{el}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Fee & Certification Body */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Total Course Fee ₹ (कुल फीस)
                    </label>
                    <input
                      type="number"
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      placeholder="e.g. 10000"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono focus:bg-white focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                      Certification Body (सर्टिफिकेशन संस्था)
                    </label>
                    <input
                      type="text"
                      value={formData.certification}
                      onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                      placeholder="e.g. PKC Skill Diploma / NSDC"
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-bold block mb-1 text-slate-700 text-[11px]">
                    Course Description &amp; Key Skills Covered (विवरण व कौशल)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of practical training, syllabus modules and career scope..."
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none text-xs"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="text-[11px] font-bold text-slate-700">Course Status:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Active' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Active (चालू)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: 'Inactive' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.status === 'Inactive' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Inactive (बंद)
                    </button>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer text-xs active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{editingCourse ? 'Update Course' : 'Save Vocational Course'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXCEL UPLOAD & BULK IMPORT MODAL */}
      {/* ========================================================================= */}
      {showExcelModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-fadeIn"
          onClick={() => setShowExcelModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-emerald-300 flex flex-col max-h-[92vh] my-auto overflow-hidden animate-in fade-in zoom-in duration-150 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-sm shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white leading-tight">
                    Upload Vocational Courses Excel Sheet
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    Excel फाइल (.xlsx / .xls / .csv) से बल्क कोर्सेस इम्पोर्ट करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Drag & Drop Upload Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleExcelFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className="border-2 border-dashed border-emerald-400/80 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-6 text-center transition-all cursor-pointer space-y-2 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleExcelFileSelect(e.target.files[0]);
                    }
                  }} 
                />

                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>

                <div>
                  <strong className="text-sm font-black text-slate-900 block">
                    {excelFileName ? `Selected: ${excelFileName}` : 'Click to Browse or Drag & Drop Excel File'}
                  </strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Supports .xlsx, .xls, or .csv formats
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSampleTemplate();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-white px-3 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Sample Excel Format</span>
                  </button>
                </div>
              </div>

              {parsingExcel && (
                <div className="p-4 text-center text-indigo-600 font-bold flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span>Reading and parsing Excel courses...</span>
                </div>
              )}

              {/* Preview Table of Extracted Courses */}
              {parsedExcelRows.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                        Excel Preview:
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-black">
                        {parsedExcelRows.length} Courses Found
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-500">Mode:</label>
                      <select
                        value={excelImportMode}
                        onChange={(e) => setExcelImportMode(e.target.value)}
                        className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-bold"
                      >
                        <option value="append">Append (Add to existing)</option>
                        <option value="replace">Replace All Existing</option>
                      </select>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0">
                        <tr>
                          <th className="p-2 text-center w-8">#</th>
                          <th className="p-2">Course Name</th>
                          <th className="p-2">Sector</th>
                          <th className="p-2">Duration</th>
                          <th className="p-2 text-right">Fee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedExcelRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-400 font-mono text-[10px]">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900 truncate max-w-[180px]" title={row.courseName}>{row.courseName}</td>
                            <td className="p-2 text-slate-600 truncate max-w-[120px]">{row.sector}</td>
                            <td className="p-2 text-slate-600 whitespace-nowrap">{row.duration}</td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">₹{row.fee}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold border border-slate-200 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExcelImport}
                disabled={parsedExcelRows.length === 0}
                className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black px-5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Import {parsedExcelRows.length} Courses</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
