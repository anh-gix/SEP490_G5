import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ExamCreate from '../../components/CenterHead/pages/ExamCreate';

/**
 * Teacher Exam Create Page
 * Page tạo đề thi cho giảng viên
 */
const TeacherExamCreatePage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ExamCreate viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherExamCreatePage;
