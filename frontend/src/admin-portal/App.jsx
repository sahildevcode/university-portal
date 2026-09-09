import React, { useState, useEffect } from 'react';
import AdminLoginScreen from '../components/AdminLoginScreen';
import AdminPortal from '../pages/AdminPortal';

export default function AdminPortalStandaloneApp() {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const a = localStorage.getItem('apex_admin_user');
      return a ? JSON.parse(a) : null;
    } catch {
      return null;
    }
  });

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

  const handleLoginSuccess = (user) => {
    setAdminUser(user);
    localStorage.setItem('apex_admin_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('apex_admin_user');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner Indicator */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>🛡️ <strong>Server 2:</strong> Apex Global University — Dedicated Admin Control Center (Port 5174)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="text-indigo-300 hover:underline">Open Main College Portal (5173) &rarr;</a>
          <a href="http://localhost:5175" target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">Open Cash Counter (5175) &rarr;</a>
        </div>
      </div>

      <main className="p-4 sm:p-6 lg:p-8">
        {!adminUser ? (
          <AdminLoginScreen onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AdminPortal 
            adminUser={adminUser}
            courses={courses}
            onRefreshCourses={fetchCourses}
            onLogout={handleLogout}
          />
        )}
      </main>

    </div>
  );
}
