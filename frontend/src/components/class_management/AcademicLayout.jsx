import React from 'react';
import AcademicNavigation from './AcademicNavigation';

/**
 * Academic Layout Component
 * Layout wrapper cho các trang của module Giáo vụ
 * Bao gồm sidebar navigation và content area
 */
const AcademicLayout = ({ children }) => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <AcademicNavigation />

      {/* Main Content */}
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        {children}
      </div>
    </div>
  );
};

export default AcademicLayout;
