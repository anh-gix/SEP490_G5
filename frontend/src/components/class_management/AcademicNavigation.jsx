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
      path: '/academic/dashboard',
      color: 'main'
    },
    {
      title: 'Quản lý Lịch học',
      icon: 'fa-calendar-alt',
      path: '/academic/schedule-management',
      color: 'info'
    },
    {
      title: 'Quản lý Lớp học',
      icon: 'fa-chalkboard-teacher',
      path: '/academic/class-management',
      color: 'success'
    },
    {
      title: 'Quản lý Phòng học',
      icon: 'fa-door-open',
      path: '/academic/room-management',
      color: 'warning'
    },
    {
      title: 'Quản lý đơn',
      icon: 'fa-file-alt',
      path: '/academic/request-management',
      color: 'info'
    },
    {
      title: 'Quản lý giảng viên',
      icon: 'fa-user-tie',
      path: '/academic/teacher-management',
      color: 'main'
    },
    {
      title: 'Quản lý học viên',
      icon: 'fa-user-graduate',
      path: '/academic/student-management',
      color: 'success'
    },
    {
      title: 'Báo cáo',
      icon: 'fa-chart-bar',
      path: '/academic/reports',
      color: 'info'
    }
  ];

  const userInfo = {
    name: 'Lê Văn C',
    code: 'GV001',
    avatar: null,
    role: 'academic'
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
