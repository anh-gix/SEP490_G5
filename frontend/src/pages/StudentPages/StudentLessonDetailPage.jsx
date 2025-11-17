import React from 'react';
import StudentNavigation from '../../components/student_components/StudentNavigation';
import StudentLessonDetail from '../../components/student_components/StudentLessonDetail';

/**
 * Student Lesson Detail Page
 * Page wrapper for student lesson detail with navigation
 */
const StudentLessonDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
      {/* Navigation Sidebar */}
      <StudentNavigation />
      
      {/* Main Content */}
      <div className="flex-grow-1">
        <StudentLessonDetail />
      </div>
    </div>
  );
};

export default StudentLessonDetailPage;
