import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import WritingResultPage from '../ExamPages/WritingResultPage';




const StudentWritingResultPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        < WritingResultPage />
      </div>
    </div>
  );
};

export default StudentWritingResultPage;
