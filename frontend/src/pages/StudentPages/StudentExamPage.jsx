import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentExamListPage from '../ExamPages/StudentExamListPage';




const StudentExamPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentExamListPage />
      </div>
    </div>
  );
};

export default StudentExamPage;
