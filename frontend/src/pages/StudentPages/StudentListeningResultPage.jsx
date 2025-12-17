import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import ListeningResultPage from '../ExamPages/ListeningResultPage';




const StudentListeningResultPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        < ListeningResultPage />
      </div>
    </div>
  );
};

export default StudentListeningResultPage;
