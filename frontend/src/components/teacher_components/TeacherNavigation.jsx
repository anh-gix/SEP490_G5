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
        console.log(response);
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

  // Check if user is Subject Leader
  const isSubjectLeader = user?.roleId?.name === 'Subject Leader';

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
      color: 'main'
    },
    {
      title: 'Quản lý đơn đã gửi',
      icon: 'fa-file-alt',
      path: '/teacher/applications',
      color: 'main'
    },
    {
      title: 'Lớp học của tôi',
      icon: 'fa-chalkboard-teacher',
      path: '/teacher/classes',
      color: 'main'
    },
    {
      title: 'Điểm danh',
      icon: 'fa-user-check',
      path: '/teacher/attendance',
      color: 'main'
    },
    // Chỉ hiển thị 3 tab sau cho Subject Leader
    ...(isSubjectLeader ? [
      {
        title: 'Chương trình đào tạo',
        icon: 'fa-graduation-cap',
        path: '/teacher/programs',
        color: 'main'
      },
      {
        title: 'Quản lý đề luyện thi',
        icon: 'fa-file-alt',
        path: '/teacher/exams',
        color: 'main'
      },
      {
        title: 'Quản lý tips luyện thi',
        icon: 'fa-lightbulb',
        path: '/teacher/tips',
        color: 'main'
      }
    ] : [])
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
