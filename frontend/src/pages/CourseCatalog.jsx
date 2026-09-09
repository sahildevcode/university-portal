import React, { useState } from 'react';
import { BookOpen, Clock, Layers, Award, CheckCircle, Search, ArrowRight, UserPlus } from 'lucide-react';

export default function CourseCatalog({ courses, setActiveTab, setSelectedCourseForReg, isLoggedIn, onRequireLogin }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  const departments = ['all', ...new Set(courses.map(c => c.department).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'all' || course.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleEnrollClick = (course) => {
    if (!isLoggedIn) {
      onRequireLogin('register', course.id);
      return;
    }
    if (setSelectedCourseForReg) {
      setSelectedCourseForReg(course.id);
    }
    setActiveTab('register');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Academic Programs 2026-27
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Courses, Duration & Fee Structure
        </h1>
        <p className="text-sm text-slate-500">
          Explore all undergraduate and postgraduate degrees with transparent duration, semester structure, and fee schedules.
        </p>
      </div>

      {/* Search & Department Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by course name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept.replace('School of ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredCourses.map((course) => (
          <div 
            key={course.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-mono">
                    {course.code}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {course.name}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {course.department}
                  </p>
                </div>
                
                <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100 text-right shrink-0">
                  <span className="text-[11px] text-indigo-700 block font-bold uppercase tracking-wider">Admissions</span>
                  <span className="text-sm font-black text-indigo-950 block">Session 2026-27</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {course.description}
              </p>

              {/* Key Details Grid */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> Duration
                  </span>
                  <p className="font-bold text-slate-800">{course.durationYears} Years</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                    <Layers className="w-3.5 h-3.5 text-amber-500" /> Semesters
                  </span>
                  <p className="font-bold text-slate-800">{course.totalSemesters} Semesters</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium flex items-center gap-1 mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-500" /> Mode
                  </span>
                  <p className="font-bold text-emerald-700">Full Time Regular</p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="text-xs bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">Eligibility: </span>
                  <span className="text-amber-900">{course.eligibility}</span>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                {course.totalSemesters} Semesters Curated
              </span>

              <button
                onClick={() => handleEnrollClick(course)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Apply / Register in Course</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
