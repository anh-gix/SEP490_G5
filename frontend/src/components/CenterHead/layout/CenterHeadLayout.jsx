import React from 'react';
import RoleNavigation from '../../common/RoleNavigation';

const CenterHeadLayout = ({ children }) => {
  // Menu items configuration for CenterHead
  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'fa-th-large',
      path: '/center-head/dashboard',
      color: 'main'
    },
    {
      title: 'Tài khoản',
      icon: 'fa-user-circle',
      path: '/center-head/users',
      color: 'main'
    },
    {
      title: 'Vai trò',
      icon: 'fa-user-shield',
      path: '/center-head/roles',
      color: 'main'
    },
    {
      title: 'Quản lý chương trình',
      icon: 'fa-graduation-cap',
      path: '/center-head/programs',
      color: 'main'
    },
    {
      title: 'Quản lý yêu cầu',
      icon: 'fa-clipboard-check',
      path: '/center-head/approval-requests',
      color: 'main'
    },
    {
      title: 'Quản lý đề luyện thi',
      icon: 'fa-file-alt',
      path: '/center-head/exams',
      color: 'main'
    },
    // {
    //   title: 'Báo cáo',
    //   icon: 'fa-chart-bar',
    //   path: '/center-head/reports',
    //   color: 'info'
    // }
  ];

  // User info - should be fetched from auth context or API
  const userInfo = {
    name: 'Trưởng Trung Tâm',
    code: 'CTH001',
    avatar: null // Set to null or provide avatar URL
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Sidebar with RoleNavigation */}
      <RoleNavigation
        roleTitle="Trưởng Trung Tâm"
        roleSubtitle="Quản lý trung tâm"
        roleIcon="fa-user-tie"
        menuItems={menuItems}
        userInfo={userInfo}
      />

      {/* Main Content Area */}
      <div
        className="flex-grow-1 d-flex flex-column"
        style={{
          width: 'calc(100% - 280px)',
          minHeight: '100vh'
        }}
      >
        {/* Page Content */}
        <main
          className="flex-grow-1"
          style={{
            backgroundColor: '#F8F9FA',
            overflowY: 'auto',
            padding: '32px'
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CenterHeadLayout;