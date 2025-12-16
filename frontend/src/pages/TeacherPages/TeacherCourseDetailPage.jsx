import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import CourseDetail from '../../components/CenterHead/pages/CourseDetail';

/**
 * Teacher Course Detail Page
 * Page xem chi tiết course cho giảng viên
 */
const TeacherCourseDetailPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <CourseDetail viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherCourseDetailPage;
