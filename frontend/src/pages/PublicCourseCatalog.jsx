import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  Layers, 
  Award, 
  CheckCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  FileText, 
  FileSpreadsheet,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { translations } from '../utils/translations';

export default function PublicCourseCatalog({ courses, studentUser, onOpenStudentAuth, lang = 'hi' }) {
  const t = translations[lang] || translations.hi;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [expandedSyllabusCourseId, setExpandedSyllabusCourseId] = useState(null);
  const [selectedSemForView, setSelectedSemForView] = useState('1');

  const departments = ['all', ...new Set(courses.map(c => c.department).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || course.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const toggleSyllabus = (courseId) => {
    if (expandedSyllabusCourseId === courseId) {
      setExpandedSyllabusCourseId(null);
    } else {
      setExpandedSyllabusCourseId(courseId);
      setSelectedSemForView('1');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 font-sans">
      
      {/* Header (Northfield University Style) */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C59B27] bg-[#C59B27]/10 px-3.5 py-1 rounded-sm border border-[#C59B27]/30">
          {t.coursesBadge}
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl md:text-5xl font-bold text-[#071530] tracking-tight">
          {t.coursesTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.coursesSubtitle}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#071530]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#071530] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept === 'all' ? t.allDepts : dept.replace('School of ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-6">
        {filteredCourses.map((course) => {
          const isExpanded = expandedSyllabusCourseId === course.id;
          const totalSem = course.totalSemesters || 6;
          const currentSemFile = course.syllabusFiles?.[selectedSemForView];

          return (
            <div 
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all space-y-6"
            >
              
              {/* Header Info (Zero Fees!) */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#071530] bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {course.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {course.department}
                    </span>
                  </div>

                  <h2 className="font-serif-academic text-2xl font-bold text-[#071530]">
                    {course.name}
                  </h2>

                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Academic Session & Admission Status (Zero Fees) */}
                <div className="bg-[#071530]/5 p-4 rounded-xl border border-slate-200 text-right shrink-0">
                  <span className="text-[11px] text-[#C59B27] block font-bold uppercase tracking-wider">Admission Session</span>
                  <span className="text-base font-black text-[#071530] block mt-0.5">
                    Session 2026-2027
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-end gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Approved Academic Program
                  </span>
                </div>
              </div>

              {/* Metrics Badge: Duration, Semesters, Eligibility (No Fees) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Duration</span>
                  <strong className="text-slate-800">
                    {course.durationYears >= 1 ? `${course.durationYears} Academic Year${course.durationYears > 1 ? 's' : ''}` : `${course.durationYears * 12} Months`}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Curriculum Structure</span>
                  <strong className="text-slate-800">{totalSem} Semester(s)</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-medium">Eligibility Criteria</span>
                  <strong className="text-amber-900 truncate block">{course.eligibility}</strong>
                </div>
              </div>

              {/* Action Buttons: View Syllabus & Admission Desk Notice */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => toggleSyllabus(course.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#071530] hover:text-[#C59B27] bg-[#071530]/5 hover:bg-[#071530] hover:text-white px-4 py-2.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#C59B27]" />
                  <span>{isExpanded ? t.closeSyllabus : t.viewDownloadSyllabus}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admissions Desk • PKC Institute Directorate</span>
                </div>
              </div>

              {/* Expandable Syllabus Drawer with Download */}
              {isExpanded && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C59B27]" />
                      <span>{t.selectSemester}:</span>
                    </h3>

                    {/* Semester Switcher */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {Array.from({ length: totalSem }, (_, i) => String(i + 1)).map((sem) => (
                        <button
                          key={sem}
                          onClick={() => setSelectedSemForView(sem)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                            selectedSemForView === sem
                              ? 'bg-[#071530] text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          Sem {sem}
                        </button>
                      ))}
                    </div>
                  </div>

                  {currentSemFile ? (
                    <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                          {currentSemFile.fileName?.endsWith('.xls') || currentSemFile.fileName?.endsWith('.xlsx') || currentSemFile.fileName?.endsWith('.csv') ? (
                            <FileSpreadsheet className="w-6 h-6" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Approved Syllabus • Semester {selectedSemForView}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 mt-1">
                            {currentSemFile.fileName}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Uploaded on {new Date(currentSemFile.uploadedAt).toLocaleDateString('en-IN')}
                            {currentSemFile.fileSize && ` • ${(currentSemFile.fileSize / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                      </div>

                      <a
                        href={currentSemFile.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-center gap-2 bg-[#071530] hover:bg-[#0a1f44] text-white font-bold px-5 py-2.5 rounded-md text-xs shadow-md transition-all cursor-pointer shrink-0"
                      >
                        <Download className="w-4 h-4 text-[#C59B27]" />
                        <span>{t.downloadPdf}</span>
                      </a>
                    </div>
                  ) : (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500 space-y-1">
                      <p className="text-xs font-semibold text-slate-700">
                        {t.syllabusPending} (Semester {selectedSemForView})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        PKC Education Learning Institute &amp; Consultancy
                      </p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    * Official syllabus is authorized by PKC Education Learning Institute Academic Council.
                  </p>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
