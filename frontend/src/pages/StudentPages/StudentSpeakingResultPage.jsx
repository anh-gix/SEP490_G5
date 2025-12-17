import React from 'react';

import StudentNavigation from '../../components/student_components/StudentNavigation';
import SpeakingResultPage from '../ExamPages/SpeakingResultPage';




const StudentSpeakingResultPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        < SpeakingResultPage />
      </div>
    </div>
  );
};

export default StudentSpeakingResultPage;
