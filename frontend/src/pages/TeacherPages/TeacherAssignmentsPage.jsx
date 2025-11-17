import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherAssignments from '../../components/teacher_components/TeacherAssignments';

/**
 * Teacher Assignments Page
 * Layout page cho quản lý bài tập của giảng viên
 */
const TeacherAssignmentsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherAssignments />
      </div>
    </div>
  );
};

export default TeacherAssignmentsPage;
