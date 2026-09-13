import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageIntroSplash from './components/PageIntroSplash';
import StudentAuthModal from './components/StudentAuthModal';
import StaffLoginModal from './components/StaffLoginModal';
import AdminLoginScreen from './components/AdminLoginScreen';
import MainUniversityHome from './pages/MainUniversityHome';
import AboutPage from './pages/AboutPage';
import PublicCourseCatalog from './pages/PublicCourseCatalog';
import InquiryPage from './pages/InquiryPage';
import AdminPortal from './pages/AdminPortal';
import CashCounterPortal from './pages/CashCounterPortal';
import FloatingContactWidget from './components/FloatingContactWidget';

// Helper to detect initial view based on browser URL pathname
const getInitialView = () => {
  if (typeof window !== 'undefined') {
    const p = window.location.pathname.toLowerCase();
    if (p === '/admin' || p.startsWith('/admin/')) return 'admin';
    if (p === '/staff' || p.startsWith('/staff/')) return 'staff';
  }
  return 'public';
};

export default function App() {
  // Active Main View: 'public' (Default) | 'admin' | 'staff'
  const [activeView, setActiveView] = useState(getInitialView);

  // Active Sub-Tab in Public Portal: 'home' | 'about' | 'courses' | 'inquiry'
  const [publicTab, setPublicTab] = useState('home');

  // Language state: 'en' (English default) | 'hi' (Hindi)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('pkc_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  // Animated Splash Screen state (Logo + Name animation on first load)
  const [showSplash, setShowSplash] = useState(true);

  // Navigation helper to sync URL and view state
  const navigateTo = (view, path) => {
    setActiveView(view);
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  };

  // Sync state if user clicks browser Back/Forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname.toLowerCase();
      if (p === '/admin' || p.startsWith('/admin/')) {
        setActiveView('admin');
      } else if (p === '/staff' || p.startsWith('/staff/')) {
        setActiveView('staff');
      } else {
        setActiveView('public');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pkc_lang', lang);
    } catch (e) {
      console.error(e);
    }
  }, [lang]);

  // Shared Data States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Student Auth State
  const [studentUser, setStudentUser] = useState(() => {
    try {
      const s = localStorage.getItem('pkc_student_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [studentData, setStudentData] = useState(null);
  const [studentAuthModalOpen, setStudentAuthModalOpen] = useState(false);
  const [targetCourseForAuth, setTargetCourseForAuth] = useState(null);

  // 2. Admin Auth State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const a = localStorage.getItem('pkc_admin_user');
      return a ? JSON.parse(a) : null;
    } catch {
      return null;
    }
  });

  // 3. Staff Auth State
  const [staffUser, setStaffUser] = useState(() => {
    try {
      const stf = localStorage.getItem('pkc_staff_user');
      const parsed = stf ? JSON.parse(stf) : null;
      if (parsed && (parsed.id === 'stf-1' || parsed.name?.toLowerCase().includes('ramesh'))) {
        localStorage.removeItem('pkc_staff_user');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [staffAuthModalOpen, setStaffAuthModalOpen] = useState(false);

  const fetchGlobalData = async () => {
    try {
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) setCourses(coursesData.courses || []);

      // If student is logged in, refresh their student record
      if (studentUser?.rollNo) {
        const stdRes = await fetch(`/api/students/${studentUser.rollNo}`);
        const stdData = await stdRes.json();
        if (stdData.success) setStudentData(stdData.student);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [studentUser?.rollNo]);

  // Student Handlers
  const handleStudentLoginSuccess = (user, student) => {
    setStudentUser(user);
    setStudentData(student);
    localStorage.setItem('pkc_student_user', JSON.stringify(user));
    navigateTo('public', '/');
    setPublicTab('courses');
  };

  const handleStudentLogout = () => {
    setStudentUser(null);
    setStudentData(null);
    localStorage.removeItem('pkc_student_user');
    navigateTo('public', '/');
    setPublicTab('home');
  };

  const handleOpenStudentAuth = (courseId = null) => {
    setTargetCourseForAuth(courseId);
    setStudentAuthModalOpen(true);
  };

  // Admin Handlers
  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user);
    localStorage.setItem('pkc_admin_user', JSON.stringify(user));
    navigateTo('admin', '/admin');
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('pkc_admin_user');
    navigateTo('admin', '/admin');
  };

  // Staff Handlers
  const handleStaffLoginSuccess = (staff) => {
    setStaffUser(staff);
    localStorage.setItem('pkc_staff_user', JSON.stringify(staff));
    navigateTo('staff', '/staff');
  };

  const handleStaffLogout = () => {
    setStaffUser(null);
    localStorage.removeItem('pkc_staff_user');
    navigateTo('admin', '/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 0. Animated Intro Splash Screen with Logo and Institute Name */}
      {showSplash && <PageIntroSplash onFinish={() => setShowSplash(false)} />}

      {/* 1. Top Navbar: ONLY rendered on public student website */}
      {activeView === 'public' && (
        <Navbar 
          activeView={activeView}
          setActiveView={(view) => {
            if (view === 'admin') navigateTo('admin', '/admin');
            else if (view === 'staff') navigateTo('staff', '/staff');
            else navigateTo('public', '/');
          }}
          publicTab={publicTab}
          setPublicTab={setPublicTab}
          studentUser={studentUser}
          lang={lang}
          setLang={setLang}
          onOpenStudentAuth={() => handleOpenStudentAuth(null)}
          onStudentLogout={handleStudentLogout}
        />
      )}

      {/* 2. Main Portal Routing based on activeView */}
      <main className="flex-1">
        
        {/* ========================================================================= */}
        {/* VIEW 1: CUSTOMER & STUDENT FACING PORTAL */}
        {/* ========================================================================= */}
        {activeView === 'public' && (
          <div className="pb-16 animate-fadeIn">
            {publicTab === 'home' && (
              <MainUniversityHome 
                setActiveTab={setPublicTab} 
                courses={courses} 
                studentUser={studentUser}
                lang={lang}
                onOpenStudentAuth={() => handleOpenStudentAuth(null)}
              />
            )}

            {publicTab === 'about' && (
              <AboutPage 
                lang={lang}
                onNavigateTab={setPublicTab}
              />
            )}

            {publicTab === 'courses' && (
              <PublicCourseCatalog 
                courses={courses} 
                studentUser={studentUser}
                onOpenStudentAuth={handleOpenStudentAuth}
                lang={lang}
              />
            )}

            {publicTab === 'inquiry' && (
              <InquiryPage 
                courses={courses}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DEDICATED ADMIN CONTROL CENTER */}
        {/* ========================================================================= */}
        {activeView === 'admin' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {!adminUser ? (
              staffUser ? (
                <CashCounterPortal 
                  courses={courses} 
                  staffUser={staffUser}
                  onStaffLogout={handleStaffLogout}
                />
              ) : (
                <AdminLoginScreen 
                  initialTab="admin"
                  onLoginSuccess={handleAdminLoginSuccess} 
                  onStaffLoginSuccess={handleStaffLoginSuccess}
                  onBackToPublic={() => navigateTo('public', '/')}
                />
              )
            ) : (
              <AdminPortal 
                adminUser={adminUser} 
                courses={courses} 
                onRefreshCourses={fetchGlobalData}
                onLogout={handleAdminLogout}
              />
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: STAFF DESK (CASH COUNTER & ADMISSIONS) */}
        {/* ========================================================================= */}
        {activeView === 'staff' && (
          <div className="p-4 sm:p-6 lg:p-8">
            {!staffUser ? (
              adminUser ? (
                <AdminPortal 
                  adminUser={adminUser} 
                  courses={courses} 
                  onRefreshCourses={fetchGlobalData}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <AdminLoginScreen 
                  initialTab="staff"
                  onLoginSuccess={handleAdminLoginSuccess} 
                  onStaffLoginSuccess={handleStaffLoginSuccess}
                  onBackToPublic={() => navigateTo('public', '/')}
                />
              )
            ) : (
              <CashCounterPortal 
                courses={courses} 
                staffUser={staffUser}
                onStaffLogout={handleStaffLogout}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer (Rendered on Public Portal) */}
      {activeView === 'public' && <Footer setActiveTab={setPublicTab} />}

      {/* Floating WhatsApp and Email Contact Widget */}
      {activeView === 'public' && <FloatingContactWidget />}

      {/* Student Login / Sign Up Modal */}
      <StudentAuthModal
        isOpen={studentAuthModalOpen}
        onClose={() => setStudentAuthModalOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
        courses={courses}
        defaultCourseId={targetCourseForAuth}
      />

      {/* Staff Login Modal */}
      <StaffLoginModal
        isOpen={staffAuthModalOpen}
        onClose={() => setStaffAuthModalOpen(false)}
        onLoginSuccess={handleStaffLoginSuccess}
      />

    </div>
  );
}
