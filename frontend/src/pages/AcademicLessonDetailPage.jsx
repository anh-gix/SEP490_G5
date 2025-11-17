import React from 'react';
import AcademicNavigation from '../components/class_management/AcademicNavigation';
import AcademicLessonDetail from '../components/class_management/AcademicLessonDetail';

const AcademicLessonDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      <AcademicNavigation />
      <div className="flex-grow-1">
        <AcademicLessonDetail />
      </div>
    </div>
  );
};

export default AcademicLessonDetailPage;
