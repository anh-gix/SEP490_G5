import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherGrading from '../../components/teacher_components/TeacherGrading';

/**
 * Teacher Grading Page
 * Layout page cho chấm điểm bài tập
 */
const TeacherGradingPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1">
        <TeacherGrading />
      </div>
    </div>
  );
};

export default TeacherGradingPage;
