import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TipsManagement from '../../components/teacher_components/TipsManagement';

/**
 * Teacher Tips Management Page
 * Layout page cho quản lý tips học tập
 */
const TeacherTipsManagementPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TipsManagement />
      </div>
    </div>
  );
};

export default TeacherTipsManagementPage;
