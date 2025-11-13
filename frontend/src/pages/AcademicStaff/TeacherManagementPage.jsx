import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation';
import TeacherManagement from '../../components/class_management/TeacherManagementAPI';

/**
 * Teacher Management Page for Academic Staff - API Integrated
 */
const TeacherManagementPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <TeacherManagement />
      </div>
    </div>
  );
};

export default TeacherManagementPage;
