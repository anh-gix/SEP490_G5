import React from 'react';
import AcademicNavigation from '../../components/class_management/AcademicNavigation.jsx';
import RequestManagement from '../../components/class_management/RequestManagement';

/**
 * Request Management Page for Academic Staff
 * Quản lý đơn xin đổi buổi/lớp học
 * Wrapper page - chỉ chứa layout với AcademicNavigation
 */
const RequestManagementPage = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <AcademicNavigation />
      <div className="flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
        <RequestManagement />
          </div>
                    </div>
  );
};

export default RequestManagementPage;
