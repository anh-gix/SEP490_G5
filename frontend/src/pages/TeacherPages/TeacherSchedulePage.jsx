import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation.jsx';
import TeacherSchedule from '../../components/teacher_components/TeacherSchedule';

/**
 * Teacher Schedule Page
 * Layout page cho lịch dạy giảng viên
 */
const TeacherSchedulePage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherSchedule />
      </div>
    </div>
  );
};

export default TeacherSchedulePage;
