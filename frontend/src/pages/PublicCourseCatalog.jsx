import React, { useState } from 'react';
import MainUniversityHome from './MainUniversityHome';

export default function PublicCourseCatalog({ 
  courses = [], 
  studentUser, 
  onOpenStudentAuth, 
  lang = 'en',
  onNavigateTab
}) {
  return (
    <MainUniversityHome 
      setActiveTab={onNavigateTab || (() => {})}
      courses={courses}
      studentUser={studentUser}
      lang={lang}
      onOpenStudentAuth={onOpenStudentAuth}
      initialCategory="all"
      autoScrollToCourses={true}
    />
  );
}
