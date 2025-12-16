import React from 'react';
<<<<<<< HEAD
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import TeacherManagement from '../../components/class_management/TeacherManagementAPI';
=======
import AcademicLayout from '../../components/class_management/AcademicLayout';
import TeacherManagement from '../../components/class_management/TeacherManagement';
>>>>>>> origin/Namvv-teacher-class-management

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
