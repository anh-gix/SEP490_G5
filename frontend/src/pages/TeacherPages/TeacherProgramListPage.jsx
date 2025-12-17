import React from 'react';
import TeacherNavigation from '../../components/teacher_components/TeacherNavigation';
import TeacherProgramList from '../../components/teacher_components/TeacherProgramList';

/**
 * Teacher Program List Page
 * Page hiển thị danh sách chương trình đào tạo cho giảng viên
 */
const TeacherProgramListPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <TeacherNavigation />

      {/* Main Content */}
      <div className="flex-grow-1 py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherProgramList />
      </div>
    </div>
  );
};

export default TeacherProgramListPage;
