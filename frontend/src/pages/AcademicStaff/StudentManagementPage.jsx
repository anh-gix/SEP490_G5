import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import StudentManagementAPI from '../../components/class_management/StudentManagementAPI';

/**
 * Student Management Page for Academic Staff - API Integrated
 */
const StudentManagementPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <StudentManagementAPI />
      </div>
    </div>
  );
};

export default StudentManagementPage;

