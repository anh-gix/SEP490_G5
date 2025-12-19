import React, { useState, useEffect } from 'react';
import RoleNavigation from '../common/RoleNavigation.jsx';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';

/**
 * Student Navigation Component
 * Sidebar navigation dành cho học viên - Sử dụng RoleNavigation component
 */
const StudentNavigation = () => {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await studentService.getCurrentStudent();
        if (response.success) {
          setStudentInfo(response.student);
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin học viên:', error);
      }
    };

    if (user) {
      fetchStudentInfo();
    }
  }, [user]);

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
      color: 'main'
    },
    {
      title: 'Quản lý đơn đã gửi',
      icon: 'fa-file-alt',
      path: '/student/applications',
      color: 'main'
    },
    {
      title: 'Lớp học của tôi',
      icon: 'fa-book-open',
      path: '/student/courses',
      color: 'main'
    },
    {
      title: 'Luyện Thi',
      icon: 'fa-headphones',
      path: '/student/practice-exams',
      color: 'main'
    },
    // {
    //   title: 'Bài tập',
    //   icon: 'fa-tasks',
    //   path: '/student/assignments',
    //   color: 'warning'
    // },

    // Tips cho Toeic, Ielts
    {
      title: 'Tips luyện thi',
      icon: 'fa-lightbulb',
      path: '/student/tips',
      color: 'main'
    },
    // Online Cam course
    {
      title: 'Khóa bổ trợ online',
      icon: 'fa-tasks',
      path: '/student/online-courses',
      color: 'main'
    },
    // {
    //   title: 'Luyện thi TOEIC',
    //   icon: 'fa-headphones',
    //   path: '/student/toeic',
    //   color: 'main'
    // },
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
    name: studentInfo?.username || user?.username || 'Học viên',
    code: studentInfo?.email?.split('@')[0]?.toUpperCase() || 'HV',
    avatar: studentInfo?.avatar || null,
    role: 'student'
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
