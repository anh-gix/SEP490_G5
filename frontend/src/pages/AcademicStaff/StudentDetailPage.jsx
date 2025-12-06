import React from 'react';
import AcademicLayout from '../../components/class_management/AcademicLayout';
import StudentDetail from '../../components/class_management/StudentDetail';

/**
 * Student Detail Page for Academic Staff
 * Trang chi tiết học viên
 */
const StudentDetailPage = () => {
  return (
    <AcademicLayout>
      <StudentDetail />
    </AcademicLayout>
  );
};

export default StudentDetailPage;

