import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import CourseForm from '../../components/CenterHead/pages/CourseForm';

/**
 * Teacher Course Form Page
 * Page sửa course (completed) cho giảng viên
 */
const TeacherCourseFormPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <CourseForm viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherCourseFormPage;
