import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Breadcrumb from '../compo/Breadcrumb';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for student growth chart
const mockStudentChartData = {
  monthly: [
    { period: 'Tháng 8/2024', total: 2850, new: 120, active: 2650, inactive: 200 },
    { period: 'Tháng 9/2024', total: 2980, new: 130, active: 2780, inactive: 200 },
    { period: 'Tháng 10/2024', total: 3120, new: 140, active: 2920, inactive: 200 },
    { period: 'Tháng 11/2024', total: 3270, new: 150, active: 3070, inactive: 200 },
    { period: 'Tháng 12/2024', total: 3340, new: 70, active: 3140, inactive: 200 },
    { period: 'Tháng 1/2025', total: 3456, new: 116, active: 3234, inactive: 222 },
  ],
  yearly: [
    { period: '2022', total: 1200, new: 1200, active: 1100, inactive: 100 },
    { period: '2023', total: 2400, new: 1200, active: 2200, inactive: 200 },
    { period: '2024', total: 3340, new: 940, active: 3140, inactive: 200 },
    { period: '2025', total: 3456, new: 116, active: 3234, inactive: 222 },
  ],
  weekly: [
    { period: 'Tuần 1', total: 3410, new: 15, active: 3190, inactive: 220 },
    { period: 'Tuần 2', total: 3425, new: 20, active: 3205, inactive: 220 },
    { period: 'Tuần 3', total: 3440, new: 18, active: 3220, inactive: 220 },
    { period: 'Tuần 4', total: 3456, new: 16, active: 3234, inactive: 222 },
  ]
};

// Time Period Selector Component
const TimePeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { key: 'monthly', label: 'Theo tháng', icon: 'ph ph-calendar' },
    { key: 'yearly', label: 'Theo năm', icon: 'ph ph-trend-up' },
    { key: 'weekly', label: 'Trong tháng', icon: 'ph ph-clock' }
  ];

  return (
    <div className="d-flex gap-2 mb-3">
      {periods.map(period => (
        <button
          key={period.key}
          className={`btn btn-sm ${selectedPeriod === period.key ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => onPeriodChange(period.key)}
        >
          <i className={period.icon + ' me-1'}></i>
          {period.label}
        </button>
      ))}
    </div>
  );
};

// Student Growth Chart Component
const StudentGrowthChart = ({ data, periodType }) => {
  const chartData = {
    labels: data.map(item => item.period),
    datasets: [
      {
        label: 'Tổng học viên',
        data: data.map(item => item.total),
        borderColor: 'rgb(13, 110, 253)',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(13, 110, 253)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Học viên mới',
        data: data.map(item => item.new),
        borderColor: 'rgb(25, 135, 84)',
        backgroundColor: 'rgba(25, 135, 84, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(25, 135, 84)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Đang hoạt động',
        data: data.map(item => item.active),
        borderColor: 'rgb(255, 193, 7)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(255, 193, 7)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }
    ],
  };

  const getTitle = () => {
    switch(periodType) {
      case 'monthly': return 'Xu hướng tăng trưởng học viên theo tháng';
      case 'yearly': return 'Xu hướng tăng trưởng học viên theo năm';
      case 'weekly': return 'Xu hướng tăng trưởng học viên trong tháng';
      default: return 'Xu hướng tăng trưởng học viên';
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: getTitle(),
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} học viên`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  };

  return (
    <div style={{ height: '450px', width: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import ImportExportButtons from '../compo/ImportExportButtons';
import { mockUsers, mockRoles, mockRoleStats, simulateApiDelay } from '../../../helper/mockdataExtended';
import { formatDate } from '../../../helper/helper';

// Enhanced Student Statistics Component
const StudentStatsChart = ({ studentStats }) => {
  const { total, active, inactive, pending } = studentStats;

  const stats = [
    {
      label: 'Tổng học viên',
      value: total,
      icon: 'ph ph-graduation-cap',
      color: 'primary',
      bgColor: 'primary-50',
      textColor: 'primary-600'
    },
    {
      label: 'Đang hoạt động',
      value: active,
      icon: 'ph ph-check-circle',
      color: 'success',
      bgColor: 'success-50',
      textColor: 'success-600'
    },
    {
      label: 'Không hoạt động',
      value: inactive,
      icon: 'ph ph-x-circle',
      color: 'warning',
      bgColor: 'warning-50',
      textColor: 'warning-600'
    },
    {
      label: 'Chờ duyệt',
      value: pending,
      icon: 'ph ph-clock',
      color: 'info',
      bgColor: 'info-50',
      textColor: 'info-600'
    }
  ];

  return (
    <div className="row g-4">
      {stats.map((stat) => (
        <div key={stat.label} className="col-md-6 col-xl-3">
          <Card className="bg-white border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center p-4">
              <div className={`w-48 h-48 bg-${stat.bgColor} d-flex align-items-center justify-content-center rounded-3 me-3`}>
                <i className={`${stat.icon} text-${stat.textColor} fs-4`}></i>
              </div>
              <div className="flex-grow-1">
                <div className={`display-5 fw-bold text-${stat.textColor} mb-1`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-600 fw-medium">{stat.label}</div>
                {stat.label === 'Tổng học viên' && (
                  <div className="text-xs text-neutral-500 mt-1">
                    +{Math.round((active / total) * 100)}% active rate
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

// Management Roles Statistics Component
const ManagementStatsChart = () => {
  const roleConfigs = {
    centerHead: {
      label: 'Trưởng trung tâm',
      icon: 'ph ph-crown',
      color: 'danger',
      description: 'Quản lý toàn bộ hệ thống'
    },
    subjectLeader: {
      label: 'Trưởng môn',
      icon: 'ph ph-medal',
      color: 'warning',
      description: 'Quản lý chương trình đào tạo'
    },
    giaovu: {
      label: 'Giáo vụ',
      icon: 'ph ph-clipboard-text',
      color: 'info',
      description: 'Quản lý lớp học và lịch trình'
    },
    teacher: {
      label: 'Giảng viên',
      icon: 'ph ph-chalkboard-teacher',
      color: 'success',
      description: 'Giảng dạy và hướng dẫn'
    },
    cashier: {
      label: 'Thu ngân',
      icon: 'ph ph-money',
      color: 'secondary',
      description: 'Quản lý tài chính'
    },
    receptionist: {
      label: 'Lễ tân',
      icon: 'ph ph-phone',
      color: 'primary',
      description: 'Tiếp đón và hỗ trợ'
    }
  };

  return (
    <div className="row g-4">
      {Object.entries(mockRoleStats).filter(([key]) => key !== 'student').map(([key, stats]) => {
        const config = roleConfigs[key] || {
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          icon: 'ph ph-users',
          color: 'secondary',
          description: 'Vai trò quản lý'
        };

        const activeRate = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

        return (
          <div key={key} className="col-md-6 col-lg-4">
            <Card
              className="bg-white border-0 shadow-sm h-100"
              style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="card-body p-4">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className={`w-48 h-48 bg-${config.color}-50 d-flex align-items-center justify-content-center rounded-3`}>
                    <i className={`${config.icon} text-${config.color}-600 fs-4`}></i>
                  </div>
                  <div className="text-end">
                    <div className="text-lg fw-bold text-neutral-900">{stats.total}</div>
                    <div className="text-xs text-neutral-500">tổng số</div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="mb-1 text-neutral-900 fw-semibold">{config.label}</h6>
                  <p className="text-xs text-neutral-600 mb-0">{config.description}</p>
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-1">
                      <div className="w-8 h-8 bg-success rounded-circle"></div>
                      <span className="text-xs text-neutral-600">{stats.active}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <div className="w-8 h-8 bg-warning rounded-circle"></div>
                      <span className="text-xs text-neutral-600">{stats.inactive}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-sm fw-semibold text-success">{activeRate}%</div>
                    <div className="text-xs text-neutral-500">tỷ lệ active</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="progress" style={{ height: '6px' }}>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: `${activeRate}%` }}
                      role="progressbar"
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'management'
  const [chartPeriod, setChartPeriod] = useState('monthly'); // 'monthly', 'yearly', 'weekly'

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(600);
      setUsers(mockUsers);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Filter by tab first
    if (activeTab === 'students') {
      // Only show students (role005)
      filtered = filtered.filter(user => user.roleId === 'role005');
    } else {
      // Show management roles (all except students)
      filtered = filtered.filter(user => user.roleId !== 'role005');
    }

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullname?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword)
      );
    }

    // Role filter
    if (filterValues.role && filterValues.role !== "all") {
      filtered = filtered.filter(user => user.roleId === filterValues.role);
    }

    // Status filter
    if (filterValues.status && filterValues.status !== "all") {
      filtered = filtered.filter(user => user.status === filterValues.status);
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchKeyword, filterValues]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
  };

  const handleFilterChange = (key, value) => {
    setFilterValues({ ...filterValues, [key]: value });
  };

  const handleResetFilters = () => {
    setFilterValues({});
    setSearchKeyword("");
  };

  const handleCreateUser = () => {
    navigate('/center-head/users/create');
  };

  const handleViewUser = (user) => {
    navigate(`/center-head/users/${user._id}`);
  };

  const handleEditUser = (user) => {
    navigate(`/center-head/users/${user._id}/edit`);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullname}"?`)) {
      console.log('Delete user:', user._id);
      // Implement delete logic
    }
  };

  const handleImport = () => {
    console.log('Import users from Excel');
    // Implement import logic
  };

  const handleExport = () => {
    console.log('Export users to Excel');
    // Implement export logic
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
  ];

  const getCurrentFilters = () => {
    let availableRoles = mockRoles;

    if (activeTab === 'students') {
      // Only student role for students tab
      availableRoles = mockRoles.filter(role => role._id === 'role005');
    } else {
      // All roles except students for management tab
      availableRoles = mockRoles.filter(role => role._id !== 'role005');
    }

    return [
      {
        key: "role",
        label: "Vai trò",
        options: availableRoles.map(role => ({
          value: role._id,
          label: role.name
        }))
      },
      {
        key: "status",
        label: "Trạng thái",
        options: [
          { value: "active", label: "Đang hoạt động" },
          { value: "inactive", label: "Không hoạt động" },
        ]
      }
    ];
  };

  const columns = [
    {
      header: 'Người dùng',
      field: 'fullname',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.fullname}</div>
          <div className="text-sm text-neutral-600">{row.email}</div>
          <div className="text-sm text-neutral-500">@{row.username}</div>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      field: 'role',
      render: (row) => (
        <span className="badge bg-main-50 text-main-600 fw-medium">
          {row.role?.name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Liên hệ',
      field: 'phone',
      render: (row) => (
        <div>
          <div className="text-neutral-900">{row.phone}</div>
          <div className="text-sm text-neutral-600">{row.address}</div>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      field: 'status',
      render: (row) => (
        <StatusBadge status={row.status} size="sm" />
      ),
    },
    {
      header: 'Đăng nhập cuối',
      field: 'lastLogin',
      render: (row) => (
        <span className="text-neutral-700">{formatDate(row.lastLogin)}</span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2 justify-content-center">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(row);
            }}
            title="Xem chi tiết"
          >
            <i className="ph ph-eye"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
            title="Chỉnh sửa"
          >
            <i className="ph ph-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-warning"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Reset password', row._id);
            }}
            title="Đổi mật khẩu"
          >
            <i className="ph ph-key"></i>
          </button>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteUser(row);
            }}
            title="Xóa"
          >
            <i className="ph ph-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý tài khoản</h4>
          <p className="text-neutral-600 mb-0">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <ImportExportButtons
            onImport={handleImport}
            onExport={handleExport}
          />
          <Button
            variant="primary"
            icon="ph ph-plus"
            onClick={handleCreateUser}
          >
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-24">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('students');
                setFilterValues({});
                setSearchKeyword("");
              }}
              type="button"
              role="tab"
            >
              <i className="ph ph-graduation-cap me-2"></i>
              Học viên ({mockRoleStats.student.total})
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'management' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('management');
                setFilterValues({});
                setSearchKeyword("");
              }}
              type="button"
              role="tab"
            >
              <i className="ph ph-users-three me-2"></i>
              Quản lý hệ thống ({mockUsers.filter(u => u.roleId !== 'role005').length})
            </button>
          </li>
        </ul>
      </div>

      {/* Student Statistics Chart - Only show for students tab */}
      {activeTab === 'students' && (
        <div className="mb-24">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <h5 className="mb-0 text-neutral-900 fw-semibold">Thống kê học viên</h5>
            <div className="d-flex align-items-center gap-2">
              <span className="text-sm text-neutral-600 fw-medium">Theo dõi theo:</span>
              <TimePeriodSelector
                selectedPeriod={chartPeriod}
                onPeriodChange={setChartPeriod}
              />
            </div>
          </div>

          <Card className="mb-24">
            <StudentStatsChart studentStats={mockRoleStats.student} />
          </Card>

          <Card>
            <div className="p-4">
              <StudentGrowthChart
                data={mockStudentChartData[chartPeriod]}
                periodType={chartPeriod}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Management Roles Stats - Only show for management tab */}
      {activeTab === 'management' && (
        <div className="mb-24">
          <div className="d-flex justify-content-between align-items-center mb-16">
            <div>
              <h5 className="mb-2 text-neutral-900 fw-semibold">Thống kê vai trò quản lý</h5>
              <p className="text-sm text-neutral-600 mb-0">Tổng quan về các vị trí quản lý trong hệ thống</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center gap-1">
                <div className="w-8 h-8 bg-success rounded-circle"></div>
                <span className="text-xs text-neutral-600">Active</span>
              </div>
              <div className="d-flex align-items-center gap-1">
                <div className="w-8 h-8 bg-warning rounded-circle"></div>
                <span className="text-xs text-neutral-600">Inactive</span>
              </div>
            </div>
          </div>
          <ManagementStatsChart />
        </div>
      )}

      {/* Search & Filter */}
      <Card className="mb-24">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between">
          <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
            <SearchBox
              placeholder="Tìm kiếm theo tên, email, username..."
              onSearch={handleSearch}
              value={searchKeyword}
              onChange={setSearchKeyword}
            />
          </div>
          <FilterBar
            filters={getCurrentFilters()}
            values={filterValues}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="mb-0 text-neutral-900 fw-semibold">
            {activeTab === 'students' ? 'Danh sách học viên' : 'Danh sách nhân viên quản lý'} ({filteredUsers.length})
          </h6>
          <Button
            variant="outline"
            icon="ph ph-arrows-clockwise"
            size="sm"
            onClick={fetchUsers}
          >
            Làm mới
          </Button>
        </div>
        <Table
          columns={columns}
          data={filteredUsers}
          onRowClick={handleViewUser}
        />
      </Card>
    </div>
  );
};

export default UserList;
