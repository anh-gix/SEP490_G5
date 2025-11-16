import React from 'react';
import RoleNavigation from '../common/RoleNavigation';

/**
 * Teacher Navigation Component
 * Sidebar navigation dành cho Giảng viên - Sử dụng RoleNavigation component
 */
const TeacherNavigation = () => {
  const menuItems = [
    {
      title: 'Tổng quan',
      icon: 'fa-home',
      path: '/teacher/dashboard',
      color: 'main'
    },
    {
      title: 'Lịch dạy',
      icon: 'fa-calendar-alt',
      path: '/teacher/schedule',
      color: 'info'
    },
    {
      title: 'Lớp học của tôi',
      icon: 'fa-chalkboard-teacher',
      path: '/teacher/classes',
      color: 'success'
    },
    {
      title: 'Bài tập',
      icon: 'fa-tasks',
      path: '/teacher/assignments',
      color: 'warning'
    },
    {
      title: 'Điểm danh',
      icon: 'fa-user-check',
      path: '/teacher/attendance',
      color: 'main'
    },
    {
      title: 'Tài liệu giảng dạy',
      icon: 'fa-file-alt',
      path: '/teacher/materials',
      color: 'info'
    }
  ];

  const userInfo = {
    name: 'Trần Thị B',
    code: 'GV001',
    avatar: null
  };

  return (
    <RoleNavigation
      roleTitle="Giảng viên"
      roleSubtitle="Giảng dạy"
      roleIcon="fa-chalkboard-teacher"
      menuItems={menuItems}
      userInfo={userInfo}
    />
  );
};

export default TeacherNavigation;
