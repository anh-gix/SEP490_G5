import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import Reports from '../../components/class_management/ReportsAPI';

/**
 * Reports Page for Academic Staff - API Integrated
 */
const ReportsPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <Reports />
      </div>
    </div>
  );
};

export default ReportsPage;
