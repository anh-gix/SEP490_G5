import React from 'react';
import RoleNavigation from '../common/RoleNavigation';

/**
 * Student Navigation Component
 * Sidebar navigation dành cho học viên - Sử dụng RoleNavigation component
 */
const StudentNavigation = () => {
  const menuItems = [
    {
      title: 'Tổng quan',
      icon: 'fa-home',
      path: '/student/dashboard',
      color: 'main'
    },
    {
      title: 'Lịch học',
      icon: 'fa-calendar-alt',
      path: '/student/schedule',
      color: 'info'
    },
    {
      title: 'Lớp học của tôi',
      icon: 'fa-book-open',
      path: '/student/courses',
      color: 'success'
    },
    {
      title: 'Bài tập',
      icon: 'fa-tasks',
      path: '/student/assignments',
      color: 'warning'
    },
    {
      title: 'Luyện thi TOEIC',
      icon: 'fa-headphones',
      path: '/student/toeic',
      color: 'main'
    },
    // {
    //   title: 'Tài liệu học tập',
    //   icon: 'fa-file-alt',
    //   path: '/student/materials',
    //   color: 'main'
    // },
    // {
    //   title: 'Điểm số',
    //   icon: 'fa-star',
    //   path: '/student/grades',
    //   color: 'warning'
    // },
    // {
    //   title: 'Xin nghỉ học',
    //   icon: 'fa-hand-paper',
    //   path: '/student/leave-request',
    //   color: 'danger'
    // }
  ];

  const userInfo = {
    name: 'Nguyễn Văn A',
    code: 'SV001',
    avatar: null
  };

  return (
    <RoleNavigation
      roleTitle="Học viên"
      roleSubtitle="Cổng thông tin"
      roleIcon="fa-graduation-cap"
      menuItems={menuItems}
      userInfo={userInfo}
    />
  );
};

export default StudentNavigation;
