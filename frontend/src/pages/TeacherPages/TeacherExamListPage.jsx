import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ExamList from '../../components/CenterHead/pages/ExamList';

/**
 * Teacher Exam List Page
 * Page danh sách đề thi cho giảng viên
 */
const TeacherExamListPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ExamList viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherExamListPage;
