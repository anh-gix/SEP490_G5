import React from 'react';
import SessionLearning from '../../components/student_components/online_learning/SessionLearning';
import StudentNavigation from '../../components/student_components/StudentNavigation';

/**
 * StudentSessionLearningPage
 * Page wrapper for learning session (Video, Vocabulary, Quiz)
 */
const StudentSessionLearningPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'rgb(245, 247, 250)' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <SessionLearning />
      </div>
    </div>
  );
};

export default StudentSessionLearningPage;
