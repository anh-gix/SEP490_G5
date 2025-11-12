import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Teacher Navigation Component
 * Sidebar navigation dành cho Giảng viên
 */
const TeacherNavigation = () => {
  const location = useLocation();

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
      title: 'Chấm điểm',
      icon: 'fa-star',
      path: '/teacher/grading',
      color: 'warning'
    },
    {
      title: 'Tài liệu giảng dạy',
      icon: 'fa-file-alt',
      path: '/teacher/materials',
      color: 'info'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="teacher-navigation bg-white border-end border-neutral-100 d-flex flex-column" 
         style={{ width: '280px', minHeight: '100vh', height: '100%', position: 'sticky', top: 0 }}>
      {/* Header */}
      <div className="p-24 border-bottom border-neutral-100">
        <div className="d-flex align-items-center gap-12">
          <div 
            className="rounded-12 d-flex align-items-center justify-content-center"
            style={{ 
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
            }}
          >
            <i className="fas fa-chalkboard-teacher text-white fa-lg"></i>
          </div>
          <div>
            <h6 className="text-neutral-900 fw-bold mb-0">Giảng viên</h6>
            <p className="text-neutral-500 mb-0 text-13">Giảng dạy</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-24 flex-grow-1">
        <nav className="d-flex flex-column gap-8">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={index}
                to={item.path}
                className={`nav-item d-flex align-items-center gap-12 px-16 py-12 rounded-8 text-decoration-none transition-2 ${
                  active 
                    ? 'text-white' 
                    : 'text-neutral-700'
                }`}
                style={{
                  backgroundColor: active ? '#0D74FF' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div 
                  className={`d-flex align-items-center justify-content-center rounded-8`}
                  style={{ 
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : '#F1F3F5'
                  }}
                >
                  <i 
                    className={`fas ${item.icon}`}
                    style={{ 
                      fontSize: '16px',
                      color: active ? 'white' : `var(--${item.color}-600)`
                    }}
                  ></i>
                </div>
                <span className={`fw-${active ? 'semibold' : 'medium'} text-14`}>
                  {item.title}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="px-24 pb-24">
        <div className="rounded-12 p-20" style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
          <div className="text-white mb-12">
            <i className="fas fa-chart-line me-2"></i>
            <span className="fw-semibold text-14">Thống kê tuần này</span>
          </div>
          <div className="d-flex flex-column gap-8">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Số buổi dạy</span>
              <span className="text-white fw-bold text-15">12</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Bài tập chưa chấm</span>
              <span className="text-white fw-bold text-15">8</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Lớp đang dạy</span>
              <span className="text-white fw-bold text-15">5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="px-24 pb-24">
        <div className="bg-info-50 border border-info-100 rounded-12 p-16">
          <div className="d-flex gap-12">
            <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: '32px', height: '32px', minWidth: '32px' }}>
              <i className="fas fa-question"></i>
            </div>
            <div>
              <h6 className="text-neutral-900 fw-semibold text-13 mb-4">Cần hỗ trợ?</h6>
              <p className="text-neutral-600 text-12 mb-8">
                Liên hệ giáo vụ hoặc xem tài liệu hướng dẫn
              </p>
              <a href="/help" className="text-info-500 text-12 fw-medium text-decoration-none">
                Xem hướng dẫn <i className="fas fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherNavigation;
