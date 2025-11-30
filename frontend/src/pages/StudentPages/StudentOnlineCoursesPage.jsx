import React from 'react';
import OnlineCourseList from '../../components/student_components/online_learning/OnlineCourseList';
import StudentNavigation from '../../components/student_components/StudentNavigation';

/**
 * StudentOnlineCoursesPage
 * Page wrapper for list of Cambridge online courses
 */
const StudentOnlineCoursesPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: 'rgb(245, 247, 250)' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <OnlineCourseList />
      </div>
    </div>
  );
};

export default StudentOnlineCoursesPage;
