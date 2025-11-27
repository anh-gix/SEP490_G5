import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

/**
 * Role Navigation Component
 * Sidebar navigation chung cho tất cả roles (Student, Teacher, Academic)
 * 
 * @param {Object} props
 * @param {string} props.roleTitle - Tiêu đề role (VD: "Học viên", "Giảng viên", "Giáo vụ")
 * @param {string} props.roleSubtitle - Phụ đề role (VD: "Cổng thông tin", "Giảng dạy")
 * @param {string} props.roleIcon - Font Awesome icon class (VD: "fa-graduation-cap", "fa-chalkboard-teacher")
 * @param {Array} props.menuItems - Danh sách menu items
 * @param {Object} props.userInfo - Thông tin user {name, code, avatar}
 */
const RoleNavigation = ({ 
  roleTitle, 
  roleSubtitle, 
  roleIcon, 
  menuItems, 
  userInfo
}) => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="role-navigation bg-white d-flex flex-column" 
         style={{ 
           width: '280px',
           minWidth: '280px',
           maxWidth: '280px',
           minHeight: '100vh', 
           height: '100vh',
           maxHeight: '100vh',
           position: 'sticky',
           top: 0,
           left: 0,
           overflow: 'hidden',
           flexShrink: 0,
           borderRight: '1px solid #E9ECEF',
           zIndex: 100
         }}>
      {/* Header/Logo */}
      <div className="p-24 border-bottom" style={{ borderColor: '#E9ECEF' }}>
        <div className="d-flex align-items-center gap-12">
          <div 
            className="rounded-12 d-flex align-items-center justify-content-center"
            style={{ 
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
            }}
          >
            <i className={`fas ${roleIcon} text-white fa-lg`}></i>
          </div>
          <div>
            <h6 className="text-neutral-900 fw-bold mb-0">{roleTitle}</h6>
            <p className="text-neutral-500 mb-0 text-13">{roleSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-24 flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
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

      {/* User Profile Footer with Dropdown */}
      <div className="p-20 border-top" style={{ borderColor: '#E9ECEF' }}>
        <Dropdown drop="up" show={showUserMenu} onToggle={(isOpen) => setShowUserMenu(isOpen)}>
          <Dropdown.Toggle
            as="div"
            className="d-flex align-items-center gap-12"
            style={{ cursor: 'pointer' }}
            bsPrefix="custom-dropdown-toggle"
          >
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center bg-neutral-200"
              style={{ 
                width: '48px',
                height: '48px',
                minWidth: '48px'
              }}
            >
              {userInfo.avatar ? (
                <img 
                  src={userInfo.avatar} 
                  alt={userInfo.name}
                  className="rounded-circle"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <i className="fas fa-user text-neutral-600"></i>
              )}
            </div>
            <div className="flex-grow-1">
              <h6 className="text-neutral-900 fw-semibold mb-0 text-13">{userInfo.name}</h6>
              <p className="text-neutral-500 mb-0 text-11">{userInfo.code}</p>
            </div>
            <i className={`fas fa-chevron-up text-neutral-500 text-12 transition-all ${showUserMenu ? '' : 'fa-rotate-180'}`}></i>
          </Dropdown.Toggle>

          <Dropdown.Menu 
            className="border-0 rounded-12 p-8 mt-2 w-100"
            style={{ 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              minWidth: '240px'
            }}
          >
            <Dropdown.Item 
              href={userInfo.role ? `/${userInfo.role}/profile` : '/'} 
              className="rounded-8 px-12 py-10 text-13 d-flex align-items-center gap-10 mb-2"
            >
              <i className="fas fa-user-circle text-main-600" style={{ width: '20px' }}></i>
              <span>Thông tin cá nhân</span>
            </Dropdown.Item>
            
            <Dropdown.Item 
              href="/settings" 
              className="rounded-8 px-12 py-10 text-13 d-flex align-items-center gap-10 mb-2"
            >
              <i className="fas fa-cog text-neutral-600" style={{ width: '20px' }}></i>
              <span>Cài đặt</span>
            </Dropdown.Item>
            
            <Dropdown.Item 
              href="/notifications" 
              className="rounded-8 px-12 py-10 text-13 d-flex align-items-center gap-10 mb-2"
            >
              <i className="fas fa-bell text-warning-600" style={{ width: '20px' }}></i>
              <span>Thông báo</span>
            </Dropdown.Item>

            <Dropdown.Divider className="my-8" />
            
            <Dropdown.Item 
              href="/help" 
              className="rounded-8 px-12 py-10 text-13 d-flex align-items-center gap-10 mb-2"
            >
              <i className="fas fa-question-circle text-info-600" style={{ width: '20px' }}></i>
              <span>Trợ giúp</span>
            </Dropdown.Item>
            
            <Dropdown.Item 
              href="/logout" 
              className="rounded-8 px-12 py-10 text-13 d-flex align-items-center gap-10 text-danger-600"
            >
              <i className="fas fa-sign-out-alt" style={{ width: '20px' }}></i>
              <span>Đăng xuất</span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default RoleNavigation;
