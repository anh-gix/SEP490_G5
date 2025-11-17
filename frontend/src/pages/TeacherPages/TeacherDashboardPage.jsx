import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherDashboard from '../../components/teacher_components/TeacherDashboard';

/**
 * Teacher Dashboard Page
 * Layout page cho dashboard giảng viên
 */
const TeacherDashboardPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherDashboard />
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
