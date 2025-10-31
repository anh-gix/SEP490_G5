import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * Student Navigation Component
 * Sidebar navigation dành cho học viên
 */
const StudentNavigation = () => {
  const location = useLocation();

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
      title: 'Tài liệu học tập',
      icon: 'fa-file-alt',
      path: '/student/materials',
      color: 'main'
    },
    {
      title: 'Điểm số',
      icon: 'fa-star',
      path: '/student/grades',
      color: 'warning'
    },
    {
      title: 'Xin nghỉ học',
      icon: 'fa-hand-paper',
      path: '/student/leave-request',
      color: 'danger'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="student-navigation bg-white border-end border-neutral-100 d-flex flex-column" 
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
            <i className="fas fa-graduation-cap text-white fa-lg"></i>
          </div>
          <div>
            <h6 className="text-neutral-900 fw-bold mb-0">Học viên</h6>
            <p className="text-neutral-500 mb-0 text-13">Cổng thông tin</p>
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
            <i className="fas fa-trophy me-2"></i>
            <span className="fw-semibold text-14">Thành tích</span>
          </div>
          <div className="d-flex flex-column gap-8">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Điểm trung bình</span>
              <span className="text-white fw-bold text-15">8.5</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Chuyên cần</span>
              <span className="text-white fw-bold text-15">92%</span>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-white text-13" style={{ opacity: 0.9 }}>Buổi đã học</span>
              <span className="text-white fw-bold text-15">18/30</span>
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
                Liên hệ giáo vụ hoặc xem hướng dẫn sử dụng
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

export default StudentNavigation;
