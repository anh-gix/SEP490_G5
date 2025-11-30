import React from 'react';
import OnlineCourseDetail from '../../components/student_components/online_learning/OnlineCourseDetail';
import StudentNavigation from '../../components/student_components/StudentNavigation';

/**
 * StudentOnlineCourseDetailPage
 * Page wrapper for online course detail and progress
 */
const StudentOnlineCourseDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'rgb(245, 247, 250)' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <OnlineCourseDetail />
      </div>
    </div>
  );
};

export default StudentOnlineCourseDetailPage;
