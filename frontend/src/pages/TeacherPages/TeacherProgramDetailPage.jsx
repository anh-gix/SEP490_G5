import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ProgramDetail from '../../components/CenterHead/pages/ProgramDetail';

/**
 * Teacher Program Detail Page
 * Page xem chi tiết chương trình đào tạo cho giảng viên
 */
const TeacherProgramDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ProgramDetail viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherProgramDetailPage;
