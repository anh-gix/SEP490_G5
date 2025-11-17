import React from 'react';
import AcademicLayout from '../../components/class_management/AcademicLayout.jsx';
// import AcademicModuleDemo from '../../components/class_management/AcademicModuleDemo';
import AcademicDashboard from '../../components/class_management/AcademicDashboard';

/**
 * Academic Dashboard Page
 * Trang tổng quan cho Giáo vụ với khả năng chuyển đổi giữa các module
 */
const AcademicDashboardPage = () => {
  return (
    <AcademicLayout>
      <AcademicDashboard />
    </AcademicLayout>
  );
};

export default AcademicDashboardPage;
