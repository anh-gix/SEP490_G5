import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';

/**
 * Role Navigation Component
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  }, [isCollapsed]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="d-lg-none btn btn-primary position-fixed rounded-3 shadow-lg d-flex align-items-center justify-content-center"
        style={{
          bottom: 20,
          right: 20,
          width: 56,
          height: 56,
          zIndex: 1050,
          border: 'none',
          transition: 'all 0.3s ease',
          transform: isMobileOpen ? 'rotate(90deg)' : 'rotate(0deg)'
        }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <i className={`fas ${isMobileOpen ? 'fa-times' : 'fa-bars'} fa-lg`} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`role-navigation bg-white d-flex flex-column ${
          isMobileOpen ? 'd-flex' : 'd-none d-lg-flex'
        }`}
        style={{
          width: isCollapsed ? 80 : 280,
          minWidth: isCollapsed ? 80 : 280,
          height: '100vh',
          position: isMobileOpen ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          overflow: 'hidden',
          borderRight: '1px solid #E9ECEF',
          zIndex: isMobileOpen ? 1045 : 100,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <div className="p-24 border-bottom position-relative">
          {isCollapsed ? (
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-sm btn-light rounded-3"
                style={{ width: 40, height: 40 }}
                onClick={() => setIsCollapsed(false)}
                title="Mở rộng"
              >
                <i className="fas fa-bars" />
              </button>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center gap-12">
                <div
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{
                    width: 48,
                    height: 48,
                    background:
                      'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className={`fas ${roleIcon} text-white fa-lg`} />
                </div>

                {/* CONDITIONAL RENDER TEXT */}
                <div>
                  <h6 className="fw-bold mb-0">{roleTitle}</h6>
                  <p className="text-neutral-500 mb-0 text-13">
                    {roleSubtitle}
                  </p>
                </div>
              </div>

              <button
                className="d-none d-lg-flex btn btn-sm btn-light position-absolute rounded-3 align-items-center justify-content-center"
                style={{top: 34, right: 8, width: 32, height: 32}}
                onClick={() => setIsCollapsed(true)}
                title="Thu gọn"
              >
                <i className="fas fa-chevron-left" />
              </button>
            </>
          )}
        </div>

        {/* Menu */}
        <div
          className="flex-grow-1"
          style={{
            overflowY: 'auto',
            padding: isCollapsed ? '24px 12px' : 24
          }}
        >
          <nav className="d-flex flex-column gap-8">
            {menuItems.map((item, index) => {
              const active = isActive(item.path);

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={`nav-item d-flex align-items-center gap-12 rounded-8 text-decoration-none ${
                    active ? 'text-white' : 'text-neutral-700'
                  }`}
                  style={{
                    backgroundColor: active ? '#0D74FF' : 'transparent',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    padding: isCollapsed ? 12 : '12px 16px',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? item.title : ''}
                >
                  <div
                    className="d-flex align-items-center justify-content-center rounded-8"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: active
                        ? 'rgba(255,255,255,0.2)'
                        : '#F1F3F5'
                    }}
                  >
                    <i
                      className={`fas ${item.icon}`}
                      style={{
                        color: active
                          ? '#fff'
                          : `var(--${item.color}-600)`
                      }}
                    />
                  </div>

                  {/* ✅ CONDITIONAL RENDER */}
                  {!isCollapsed && (
                    <span
                      className={`fw-${active ? 'semibold' : 'medium'} text-14`}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {item.title}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-20 border-top">
          <Dropdown drop="up" show={showUserMenu} onToggle={setShowUserMenu}>
            <Dropdown.Toggle
              as="div"
              className="d-flex align-items-center"
              style={{
                cursor: 'pointer',
                justifyContent: 'center'
              }}
            >
              {/* Avatar – LUÔN FIX CỨNG */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-neutral-200"
                style={{
                  width: 48,
                  height: 48,
                  minWidth: 48,
                  minHeight: 48,
                  flexShrink: 0
                }}
              >
                {userInfo.avatar ? (
                  <img
                    src={userInfo.avatar}
                    alt={userInfo.name}
                    className="rounded-circle"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <i className="fas fa-user text-neutral-600" />
                )}
              </div>

              {/* CHỈ RENDER KHI EXPAND */}
              {!isCollapsed && (
                <>
                  <div className="flex-grow-1 ms-12">
                    <h6 className="text-neutral-900 fw-semibold mb-0 text-13">
                      {userInfo.name}
                    </h6>
                    <p className="text-neutral-500 mb-0 text-11">
                      {userInfo.code}
                    </p>
                  </div>

                  <i
                    className={`fas fa-chevron-up text-neutral-500 text-12 ${
                      showUserMenu ? '' : 'fa-rotate-180'
                    }`}
                  />
                </>
              )}
            </Dropdown.Toggle>


            <Dropdown.Menu className="border-0 rounded-12 p-8 mt-2 w-100">
              <Dropdown.Item href="/profile">Thông tin cá nhân</Dropdown.Item>
              <Dropdown.Item href="/settings">Cài đặt</Dropdown.Item>
              <Dropdown.Item href="/logout" className="text-danger">
                Đăng xuất
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </>
  );
};

export default RoleNavigation;
