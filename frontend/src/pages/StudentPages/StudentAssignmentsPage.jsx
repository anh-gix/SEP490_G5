import React from 'react';
import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentAssignments from '../../components/student_components/StudentAssignments';

/**
 * Student Assignments Page
 * Layout page cho bài tập với sidebar navigation
 */
const StudentAssignmentsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentAssignments />
      </div>
    </div>
  );
};

export default StudentAssignmentsPage;
