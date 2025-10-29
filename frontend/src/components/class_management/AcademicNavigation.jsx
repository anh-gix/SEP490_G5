import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Badge } from 'react-bootstrap';

/**
 * Academic Navigation Component
 * Menu điều hướng giữa các module của Giáo vụ
 */
const AcademicNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/academic-dashboard',
      icon: 'fa-home',
      label: 'Dashboard',
      description: 'Tổng quan'
    },
    {
      path: '/schedule-management',
      icon: 'fa-calendar-alt',
      label: 'Quản lý Lịch học',
      description: 'Sắp xếp lịch học'
    },
    {
      path: '/class-management',
      icon: 'fa-chalkboard-teacher',
      label: 'Quản lý Lớp học',
      description: 'Quản lý lớp & học viên'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="p-24" style={{ color: 'white', height: '100%' }}>
      {/* Header */}
      <div className="mb-24 pb-20" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="d-flex align-items-center gap-12">
          <i className="fas fa-graduation-cap" style={{ fontSize: '32px', color: 'var(--main-600)' }}></i>
          <span className="text-white" style={{ fontSize: '20px', fontWeight: 700 }}>Module Giáo Vụ</span>
        </div>
      </div>

      {/* Menu */}
      <Nav className="flex-column gap-8">
        {navItems.map((item) => (
          <Nav.Item key={item.path}>
            <Link
              to={item.path}
              className="text-decoration-none transition-2"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: isActive(item.path) 
                  ? 'var(--main-600)' 
                  : 'transparent',
                color: isActive(item.path) ? 'white' : 'rgba(255,255,255,0.7)',
                transition: 'all 0.3s ease',
                position: 'relative',
                boxShadow: isActive(item.path) ? '0 4px 16px rgba(13, 116, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateX(6px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              <div 
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  background: isActive(item.path) 
                    ? 'rgba(255,255,255,0.2)' 
                    : 'rgba(255,255,255,0.1)',
                  fontSize: '18px',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className={`fas ${item.icon}`}></i>
              </div>
              <div style={{ flex: 1 }}>
                <div className="fw-semibold mb-4" style={{ fontSize: '15px' }}>
                  {item.label}
                </div>
                <div className="text-13" style={{ opacity: 0.85 }}>
                  {item.description}
                </div>
              </div>
              {isActive(item.path) && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '4px',
                    height: '28px',
                    background: 'white',
                    borderRadius: '4px 0 0 4px'
                  }}
                />
              )}
            </Link>
          </Nav.Item>
        ))}
      </Nav>

      
    </div>
  );
};

export default AcademicNavigation;
