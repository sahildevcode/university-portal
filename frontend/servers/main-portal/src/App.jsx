import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StudentAuthModal from '@/components/StudentAuthModal';
import MainUniversityHome from '@/pages/MainUniversityHome';
import PublicCourseCatalog from '@/pages/PublicCourseCatalog';
import PublicResults from '@/pages/PublicResults';
import FeedbackPage from '@/pages/FeedbackPage';
import StudentDashboard from '@/pages/StudentDashboard';

export default function MainPortalApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [courses, setCourses] = useState([]);
  const [studentUser, setStudentUser] = useState(() => {
    try {
      const s = localStorage.getItem('apex_student_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [studentData, setStudentData] = useState(null);
  const [studentAuthModalOpen, setStudentAuthModalOpen] = useState(false);
  const [targetCourseForAuth, setTargetCourseForAuth] = useState(null);

  const fetchGlobalData = async () => {
    try {
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) setCourses(coursesData.courses || []);

      if (studentUser?.rollNo) {
        const stdRes = await fetch(`/api/students/${studentUser.rollNo}`);
        const stdData = await stdRes.json();
        if (stdData.success) setStudentData(stdData.student);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [studentUser?.rollNo]);

  const handleStudentLoginSuccess = (user, student) => {
    setStudentUser(user);
    setStudentData(student);
    localStorage.setItem('apex_student_user', JSON.stringify(user));
    setActiveTab('student-dashboard');
  };

  const handleStudentLogout = () => {
    setStudentUser(null);
    setStudentData(null);
    localStorage.removeItem('apex_student_user');
    setActiveTab('home');
  };

  const handleOpenStudentAuth = (courseId = null) => {
    setTargetCourseForAuth(courseId);
    setStudentAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Banner Indicator */}
      <div className="bg-indigo-950 text-indigo-200 text-[11px] py-1.5 px-4 text-center border-b border-indigo-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>🌐 <strong>Server 1:</strong> Apex Global University — Main Campus & Student Portal (Port 5173)</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <a href="http://localhost:5174" target="_blank" rel="noreferrer" className="text-amber-300 hover:underline">Open Admin Server (5174) &rarr;</a>
          <a href="http://localhost:5175" target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">Open Cash Counter (5175) &rarr;</a>
        </div>
      </div>

      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        studentUser={studentUser}
        onOpenStudentAuth={() => handleOpenStudentAuth(null)}
        onStudentLogout={handleStudentLogout}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <MainUniversityHome 
            setActiveTab={setActiveTab} 
            courses={courses} 
            studentUser={studentUser}
            onOpenStudentAuth={handleOpenStudentAuth}
          />
        )}

        {activeTab === 'courses' && (
          <PublicCourseCatalog 
            courses={courses} 
            studentUser={studentUser}
            onOpenStudentAuth={handleOpenStudentAuth}
            onEnrollCourse={(courseId) => {
              setActiveTab('student-dashboard');
            }}
          />
        )}

        {activeTab === 'results' && (
          <PublicResults />
        )}

        {activeTab === 'feedback' && (
          <FeedbackPage />
        )}

        {activeTab === 'student-dashboard' && (
          <StudentDashboard 
            studentUser={studentUser} 
            studentData={studentData}
            onRefresh={fetchGlobalData}
            onLogout={handleStudentLogout}
          />
        )}
      </main>

      <Footer setActiveTab={setActiveTab} />

      <StudentAuthModal
        isOpen={studentAuthModalOpen}
        onClose={() => setStudentAuthModalOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
        courses={courses}
        defaultCourseId={targetCourseForAuth}
      />

    </div>
  );
}
