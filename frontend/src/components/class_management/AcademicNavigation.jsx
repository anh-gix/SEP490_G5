import React from 'react';
import RoleNavigation from '../common/RoleNavigation';

/**
 * Academic Navigation Component
 * Sidebar navigation dành cho Giáo vụ - Sử dụng RoleNavigation component
 */
const AcademicNavigation = () => {
  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'fa-home',
      path: '/academic-dashboard',
      color: 'main'
    },
    {
      title: 'Quản lý Lịch học',
      icon: 'fa-calendar-alt',
      path: '/schedule-management',
      color: 'info'
    },
    {
      title: 'Quản lý Lớp học',
      icon: 'fa-chalkboard-teacher',
      path: '/class-management',
      color: 'success'
    },
    {
      title: 'Quản lý Phòng học',
      icon: 'fa-door-open',
      path: '/room-management',
      color: 'warning'
    },
    {
      title: 'Giảng viên',
      icon: 'fa-user-tie',
      path: '/teacher-management',
      color: 'main'
    },
    {
      title: 'Báo cáo',
      icon: 'fa-chart-bar',
      path: '/reports',
      color: 'info'
    }
  ];

  const userInfo = {
    name: 'Lê Văn C',
    code: 'GV001',
    avatar: null
  };

  return (
    <RoleNavigation
      roleTitle="Giáo vụ"
      roleSubtitle="Quản lý đào tạo"
      roleIcon="fa-user-cog"
      menuItems={menuItems}
      userInfo={userInfo}
    />
  );
};

export default AcademicNavigation;
