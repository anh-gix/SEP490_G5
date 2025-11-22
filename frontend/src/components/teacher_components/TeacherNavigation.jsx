import React, { useState, useEffect } from 'react';
import RoleNavigation from '../common/RoleNavigation';
import { useAuth } from '../../contexts/AuthContext';
import teacherService from '../../services/teacherService';

/**
 * Teacher Navigation Component
 * Sidebar navigation dành cho Giảng viên - Sử dụng RoleNavigation component
 */
const TeacherNavigation = () => {
  const { user } = useAuth();
  const [teacherInfo, setTeacherInfo] = useState(null);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const response = await teacherService.getCurrentTeacher();
        if (response.success) {
          setTeacherInfo(response.teacher);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin giảng viên:', error);
      }
    };

    if (user) {
      fetchTeacherInfo();
    }
  }, [user]);

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
    name: teacherInfo?.username || user?.username || 'Giảng viên',
    code: teacherInfo?.email?.split('@')[0]?.toUpperCase() || 'GV',
    avatar: teacherInfo?.avatar || null,
    role: 'teacher'
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
