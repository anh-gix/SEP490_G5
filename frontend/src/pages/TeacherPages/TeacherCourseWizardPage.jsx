import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import CourseWizard from '../../components/CenterHead/pages/CourseWizard';

/**
 * Teacher Course Wizard Page
 * Page tạo/sửa course với wizard 4 bước cho giảng viên
 */
const TeacherCourseWizardPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <CourseWizard viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherCourseWizardPage;
