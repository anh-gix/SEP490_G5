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
      color: 'success'
    },
    {
      title: 'Vai trò',
      icon: 'fa-user-shield',
      path: '/center-head/roles',
      color: 'purple'
    },
    {
      title: 'Chương trình',
      icon: 'fa-graduation-cap',
      path: '/center-head/programs',
      color: 'warning'
    },
    {
      title: 'Giáo trình chờ duyệt',
      icon: 'fa-clock',
      path: '/courses/pending',
      color: 'danger'
    },
    {
      title: 'Lớp học',
      icon: 'fa-chalkboard-teacher',
      path: '/center-head/classes',
      color: 'info'
    },
    {
      title: 'Lịch chờ duyệt',
      icon: 'fa-calendar-alt',
      path: '/schedules/pending',
      color: 'warning'
    },
    {
      title: 'Phòng học',
      icon: 'fa-door-open',
      path: '/center-head/rooms',
      color: 'success'
    },
    {
      title: 'Đề thi',
      icon: 'fa-file-alt',
      path: '/center-head/exams',
      color: 'purple'
    },
    {
      title: 'Báo cáo',
      icon: 'fa-chart-bar',
      path: '/center-head/reports',
      color: 'info'
    }
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
          marginLeft: '280px',
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