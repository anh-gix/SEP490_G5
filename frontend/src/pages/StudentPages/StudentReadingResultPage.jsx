import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import ReadingResultPage from '../ExamPages/ReadingResultPage';




const StudentReadingResultPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        < ReadingResultPage />
      </div>
    </div>
  );
};

export default StudentReadingResultPage;
