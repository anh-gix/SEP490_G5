import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import ProgramForm from '../../components/CenterHead/pages/ProgramForm';

/**
 * Teacher Program Form Page
 * Page tạo/sửa chương trình đào tạo cho giảng viên
 */
const TeacherProgramFormPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <ProgramForm viewMode="teacher" />
      </div>
    </div>
  );
};

export default TeacherProgramFormPage;
