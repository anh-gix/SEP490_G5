import React from 'react';
import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentApplications from '../../components/student_components/StudentApplications';

/**
 * Student Applications Page
 * Layout page cho quản lý đơn đã gửi của học viên
 */
const StudentApplicationsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentApplications />
      </div>
    </div>
  );
};

export default StudentApplicationsPage;
