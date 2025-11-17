import React from 'react';
import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentSchedule from '../../components/student_components/StudentSchedule';

/**
 * Student Schedule Page
 * Layout page cho lịch học với sidebar navigation
 */
const StudentSchedulePage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentSchedule />
      </div>
    </div>
  );
};

export default StudentSchedulePage;
