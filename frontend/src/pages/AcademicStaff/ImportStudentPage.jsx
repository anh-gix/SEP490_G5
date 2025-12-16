import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import ImportStudentFromExcel from '../../components/class_management/ImportStudentFromExcel';

/**
 * Import Student Page for Academic Staff
 */
const ImportStudentPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <ImportStudentFromExcel />
      </div>
    </div>
  );
};

export default ImportStudentPage;

























