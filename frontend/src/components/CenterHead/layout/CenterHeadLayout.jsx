import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const CenterHeadLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const menuItems = [
    {
      icon: 'ph ph-squares-four',
      label: 'Dashboard',
      path: '/center-head/dashboard',
    },
    {
      icon: 'ph ph-user-circle',
      label: 'Tài khoản',
      path: '/center-head/users',
      submenu: [
        { label: 'Danh sách User', path: '/center-head/users' },
        { label: 'Vai trò & Phân quyền', path: '/center-head/roles' },
      ]
    },
    {
      icon: 'ph ph-graduation-cap',
      label: 'Chương trình',
      path: '/center-head/programs',
      submenu: [
        { label: 'Programs', path: '/center-head/programs' },
        { label: 'Giáo trình chờ duyệt', path: '/courses/pending' },
      ]
    },
    {
      icon: 'ph ph-chalkboard-teacher',
      label: 'Lớp học',
      path: '/center-head/classes',
      submenu: [
        { label: 'Danh sách lớp', path: '/center-head/classes' },
        { label: 'Lịch chờ duyệt', path: '/schedules/pending' },
      ]
    },
    {
      icon: 'ph ph-door',
      label: 'Phòng học',
      path: '/center-head/rooms',
    },
    {
      icon: 'ph ph-exam',
      label: 'Đề thi',
      path: '/center-head/exams',
    },
    {
      icon: 'ph ph-chart-bar',
      label: 'Báo cáo',
      path: '/center-head/reports',
    },
  ];

  const settingsItems = [
    {
      icon: 'ph ph-gear',
      label: 'Cài Đặt',
      path: '/center-head/settings',
    },
    {
      icon: 'ph ph-sign-out',
      label: 'Đăng Xuất',
      path: '/sign-out',
      isLogout: true,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    // Handle logout logic here
    navigate('/sign-in');
  };

  return (
    <div className="d-flex min-vh-100 bg-neutral-20">
      {/* Sidebar */}
      <aside
        className={`sidebar bg-neutral-900 d-flex flex-column ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
        style={{
          width: isSidebarCollapsed ? '80px' : '266px',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div className="p-24 border-bottom border-neutral-700">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center bg-main-600 text-white fw-bold rounded-2"
              style={{ width: '48px', height: '48px', fontSize: '20px' }}
            >
              C
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h6 className="text-white fw-bold mb-0">CenterHead</h6>
                <p className="text-neutral-400 mb-0" style={{ fontSize: '12px' }}>
                  Quản Lý Trung Tâm
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow-1 py-16 overflow-auto">
          <ul className="list-unstyled mb-0">
            {menuItems.map((item, index) => (
              <li key={index} className="px-16 mb-4">
                <Link
                  to={item.path}
                  className={`d-flex align-items-center gap-3 px-16 py-12 rounded-2 text-decoration-none transition-all ${
                    isActive(item.path)
                      ? 'bg-main-600 text-white'
                      : 'text-neutral-300 hover-bg-neutral-800'
                  }`}
                  style={{ transition: 'all 0.2s ease' }}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <i className={`${item.icon} fs-20`}></i>
                  {!isSidebarCollapsed && (
                    <span className="fw-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Settings & Logout */}
        <div className="border-top border-neutral-700 py-16">
          <ul className="list-unstyled mb-0">
            {settingsItems.map((item, index) => (
              <li key={index} className="px-16 mb-4">
                {item.isLogout ? (
                  <button
                    onClick={handleLogout}
                    className={`w-100 d-flex align-items-center gap-3 px-16 py-12 rounded-2 text-decoration-none transition-all border-0 bg-transparent text-neutral-300 hover-bg-neutral-800`}
                    style={{ transition: 'all 0.2s ease' }}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <i className={`${item.icon} fs-20 text-danger-500`}></i>
                    {!isSidebarCollapsed && (
                      <span className="fw-medium">{item.label}</span>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`d-flex align-items-center gap-3 px-16 py-12 rounded-2 text-decoration-none transition-all ${
                      isActive(item.path)
                        ? 'bg-main-600 text-white'
                        : 'text-neutral-300 hover-bg-neutral-800'
                    }`}
                    style={{ transition: 'all 0.2s ease' }}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <i className={`${item.icon} fs-20`}></i>
                    {!isSidebarCollapsed && (
                      <span className="fw-medium">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: isSidebarCollapsed ? '80px' : '266px',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Top Header */}
        <header
          className="bg-white border-bottom border-neutral-40 px-32 py-20"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
          }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="btn btn-sm btn-outline-neutral-300 d-flex align-items-center justify-content-center p-0"
                style={{ width: '36px', height: '36px' }}
              >
                <i className="ph ph-list fs-20"></i>
              </button>
              <h5 className="text-neutral-700 fw-semibold mb-0">Trưởng Trung Tâm</h5>
            </div>

            <div className="d-flex align-items-center gap-3">
              {/* Notifications */}
              <button
                className="btn btn-sm btn-outline-neutral-300 d-flex align-items-center justify-content-center p-0 position-relative"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="ph ph-bell fs-20"></i>
                <span
                  className="position-absolute bg-danger-600 rounded-circle"
                  style={{
                    width: '8px',
                    height: '8px',
                    top: '8px',
                    right: '8px',
                  }}
                ></span>
              </button>

              {/* Settings */}
              <button
                className="btn btn-sm btn-outline-neutral-300 d-flex align-items-center justify-content-center p-0"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="ph ph-gear fs-20"></i>
              </button>

              {/* User Profile */}
              <button
                className="btn btn-sm btn-outline-neutral-300 d-flex align-items-center justify-content-center p-0"
                style={{ width: '40px', height: '40px' }}
              >
                <i className="ph ph-user fs-20"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-32">
          {children}
        </main>
      </div>

      <style>{`
        .hover-bg-neutral-800:hover {
          background-color: var(--neutral-800) !important;
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: var(--neutral-800);
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: var(--neutral-600);
          border-radius: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--neutral-500);
        }
      `}</style>
    </div>
  );
};

export default CenterHeadLayout;