import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentClassDetail from '../../components/student_components/StudentClassDetail';


/**
 * Student Class Detail Page
 * Layout page cho chi tiết lớp học với sidebar navigation
 */
const StudentClassDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentClassDetail />
      </div>
    </div>
  );
};

export default StudentClassDetailPage;
