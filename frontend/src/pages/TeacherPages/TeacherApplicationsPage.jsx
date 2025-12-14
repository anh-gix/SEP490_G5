import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherApplications from '../../components/teacher_components/TeacherApplications';

/**
 * Teacher Applications Page
 * Layout page cho quản lý đơn đã gửi của giảng viên
 */
const TeacherApplicationsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherApplications />
      </div>
    </div>
  );
};

export default TeacherApplicationsPage;

