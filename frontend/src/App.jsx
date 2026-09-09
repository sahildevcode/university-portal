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

export default function App() {
  // Active Main View: 'public' (Default) | 'admin' | 'staff'
  const [activeView, setActiveView] = useState('public');

  // Active Sub-Tab in Public Portal: 'home' | 'about' | 'courses' | 'inquiry'
  const [publicTab, setPublicTab] = useState('home');

  // Language state: 'hi' (Hindi default) | 'en' (English)
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('pkc_lang') || 'hi';
    } catch {
      return 'hi';
    }
  });

  // Animated Splash Screen state (Logo + Name animation on first load)
  const [showSplash, setShowSplash] = useState(true);

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
    setActiveView('public');
    setPublicTab('courses');
  };

  const handleStudentLogout = () => {
    setStudentUser(null);
    setStudentData(null);
    localStorage.removeItem('pkc_student_user');
    setActiveView('public');
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
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('pkc_admin_user');
    setActiveView('public');
  };

  // Staff Handlers
  const handleStaffLoginSuccess = (staff) => {
    setStaffUser(staff);
    localStorage.setItem('pkc_staff_user', JSON.stringify(staff));
    setActiveView('staff');
  };

  const handleStaffLogout = () => {
    setStaffUser(null);
    localStorage.removeItem('pkc_staff_user');
    setActiveView('public');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 0. Animated Intro Splash Screen with Logo and Institute Name */}
      {showSplash && <PageIntroSplash onFinish={() => setShowSplash(false)} />}

      {/* 1. Universal Top Navbar with Logo, Center Title, 4 Subtabs and 3 Portals */}
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        publicTab={publicTab}
        setPublicTab={setPublicTab}
        studentUser={studentUser}
        adminUser={adminUser}
        staffUser={staffUser}
        lang={lang}
        setLang={setLang}
        onOpenStudentAuth={() => handleOpenStudentAuth(null)}
        onOpenStaffAuth={() => {
          if (staffUser) setActiveView('staff');
          else setStaffAuthModalOpen(true);
        }}
        onOpenAdminAuth={() => setActiveView('admin')}
        onStudentLogout={handleStudentLogout}
        onAdminLogout={handleAdminLogout}
        onStaffLogout={handleStaffLogout}
      />

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
                onOpenStaffAuth={() => {
                  if (staffUser) setActiveView('staff');
                  else setStaffAuthModalOpen(true);
                }}
                onOpenAdminAuth={() => setActiveView('admin')}
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
              <AdminLoginScreen onLoginSuccess={handleAdminLoginSuccess} />
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
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Staff Authentication Required</h3>
                  <p className="text-xs text-slate-500">Please enter your Admin-issued Staff ID and Password to access the cash desk.</p>
                  <button
                    onClick={() => setStaffAuthModalOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                  >
                    Open Staff Login
                  </button>
                </div>
              </div>
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

      {/* Footer (Rendered on Public Sub-Pages) */}
      {activeView === 'public' && publicTab !== 'home' && <Footer setActiveTab={setPublicTab} />}

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
