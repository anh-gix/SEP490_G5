import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ExamEdit from '../../components/CenterHead/pages/ExamEdit';

/**
 * Teacher Exam Edit Page
 * Page sửa đề thi cho giảng viên
 */
const TeacherExamEditPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ExamEdit viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherExamEditPage;
