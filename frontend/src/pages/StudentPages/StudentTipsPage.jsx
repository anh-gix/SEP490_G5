import StudentNavigation from '../../components/student_components/StudentNavigation.jsx';
import StudentTips from '../../components/student_components/StudentTips.jsx';
import React from 'react';

const StudentTipsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-50)' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <StudentTips />
      </div>
    </div>
  );
};

export default StudentTipsPage;