import React from 'react';
import AcademicLayout from '../../components/class_management/AcademicLayout';
import TeacherManagement from '../../components/class_management/TeacherManagement';

/**
 * Teacher Management Page for Academic Staff
 * Quản lý Giảng viên
 * Wrapper page - chỉ chứa layout với AcademicLayout
 */
const TeacherManagementPage = () => {
  return (
    <AcademicLayout>
      <TeacherManagement />
    </AcademicLayout>
  );
};

export default TeacherManagementPage;
