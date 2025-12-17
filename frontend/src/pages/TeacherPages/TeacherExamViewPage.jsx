import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ExamView from '../../components/CenterHead/pages/ExamView';

/**
 * Teacher Exam View Page
 * Page xem chi tiết đề thi cho giảng viên
 */
const TeacherExamViewPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ExamView viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherExamViewPage;
