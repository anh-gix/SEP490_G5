import React from 'react';
import StudentNavigation from '../../components/student_components/StudentNavigation.jsx';
import MyClasses from '../../components/student_components/MyClasses';

/**
 * Student Courses Page
 * Layout page cho lớp học của tôi với sidebar navigation
 */
const StudentCoursesPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <StudentNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <MyClasses />
      </div>
    </div>
  );
};

export default StudentCoursesPage;
