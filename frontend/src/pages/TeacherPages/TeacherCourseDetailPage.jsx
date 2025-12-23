import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherCourseDetail from '../../components/teacher_components/TeacherCourseDetail';

/**
 * Teacher Course Detail Page
 * Page xem chi tiết course cho giảng viên (Subject Leader)
 * Có đầy đủ quyền: view, edit, delete (khi program đang draft/needs_revision và course không active)
 */
const TeacherCourseDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherCourseDetail />
      </div>
    </div>
  );
};

export default TeacherCourseDetailPage;
