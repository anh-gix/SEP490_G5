import React from 'react';
import TeacherNavigation from '../components/teacher_components/TeacherNavigation';
import TeacherClassDetail from '../components/teacher_components/TeacherClassDetail';

/**
 * Teacher Class Detail Page
 * Layout page cho chi tiết lớp học
 */
const TeacherClassDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#F5F7FA' }}>
        <TeacherClassDetail />
      </div>
    </div>
  );
};

export default TeacherClassDetailPage;
