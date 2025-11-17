import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherClasses from '../../components/teacher_components/TeacherClasses';

/**
 * Teacher Classes Page
 * Layout page cho danh sách lớp học của giảng viên
 */
const TeacherClassesPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherClasses />
      </div>
    </div>
  );
};

export default TeacherClassesPage;
