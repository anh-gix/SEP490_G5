import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherProgramDetail from '../../components/teacher_components/TeacherProgramDetail';

/**
 * Teacher Program Detail Page
 * Page xem chi tiết chương trình đào tạo cho giảng viên (Subject Leader)
 * Có đầy đủ quyền: view, edit, create course, delete course, submit
 */
const TeacherProgramDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherProgramDetail />
      </div>
    </div>
  );
};

export default TeacherProgramDetailPage;
