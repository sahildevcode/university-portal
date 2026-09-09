import React, { useState, useEffect } from 'react';
import CashCounterPortal from '../pages/CashCounterPortal';

export default function CashCounterStandaloneApp() {
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.courses || []);
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Banner Indicator */}
      <div className="bg-emerald-950 text-emerald-200 text-[11px] py-1.5 px-4 text-center border-b border-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>💵 <strong>Server 3:</strong> Apex University — Campus Cash Counter & Walk-in Admission Desk (Port 5175)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline">Open Main College Portal (5173) &rarr;</a>
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="text-amber-300 hover:underline">Open Admin Server (5174) &rarr;</a>
        </div>
      </div>

      <main className="p-4 sm:p-6 lg:p-8">
        <CashCounterPortal courses={courses} />
      </main>

    </div>
  );
}
