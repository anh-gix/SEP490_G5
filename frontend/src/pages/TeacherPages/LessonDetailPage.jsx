import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation.jsx';
import LessonDetail from '../../components/teacher_components/LessonDetail';

/**
 * Lesson Detail Page
 * Layout page cho chi tiết buổi học
 */
const LessonDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA' }}>
        <LessonDetail />
      </div>
    </div>
  );
};

export default LessonDetailPage;
