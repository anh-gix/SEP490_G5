import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import ExamDetailPage from '../ExamPages/ExamDetailPage2';




const StudentExamsDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ExamDetailPage />
      </div>
    </div>
  );
};

export default StudentExamsDetailPage;
