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
  Filler
} from 'chart.js';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import UserDetailModal from '../compo/UserDetailModal';
import EditUserModal from '../compo/EditUserModal';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';
import { authService } from '../../../services/authService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Helper function to get month labels in Vietnamese
const getMonthLabels = () => {
  return ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
};

// Helper function to create chart data structure
const createChartData = (monthlyData) => ({
  labels: getMonthLabels(),
  datasets: [
    {
      label: 'Học viên mới',
      data: monthlyData,
      borderColor: 'rgba(93, 135, 255, 1)',
      backgroundColor: 'rgba(93, 135, 255, 0.1)',
      borderWidth: 2,
      tension: 0.4,
      fill: false,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgba(93, 135, 255, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }
  ]
});

// Component thống kê tóm tắt học viên - Thiết kế tối giản
const StudentSummaryStats = ({ studentStats }) => {
  const { total = 0, newThisMonth = 0 } = studentStats || {};
  const newStudentsThisMonth = newThisMonth;

  const stats = [
    {
      title: 'Tổng số học viên',
      value: total,
      subtitle: 'Tổng số học viên đã đăng ký trong hệ thống',
      icon: 'ph ph-users'
    },
    {
      title: 'Thay đổi trong tháng',
      value: newStudentsThisMonth,
      subtitle: 'Học viên mới tham gia trong tháng này',
      icon: 'ph ph-trend-up',
      showArrow: true
    }
  ];

  return (
    <div className="row g-3">
      {stats.map((stat, index) => (
        <div key={index} className="col-md-6">
          <Card className="h-100">
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="text-neutral-600 fs-6">{stat.title}</div>
                <i className={`${stat.icon} fs-4 text-neutral-400`}></i>
              </div>
              <div className="d-flex align-items-end gap-2 mb-2">
                <div className="display-5 fw-bold text-neutral-900">
                  {stat.value.toLocaleString()}
                </div>
                {stat.showArrow && (
                  <i className="ph ph-arrow-up text-success fs-5 mb-2"></i>
                )}
              </div>
              <div className="text-neutral-500 small">
                {stat.subtitle}
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
};

// Component biểu đồ xu hướng tăng trưởng học viên
const StudentGrowthChart = ({ chartData, loading }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#5D87FF'
        }
      },
      title: {
        display: true,
        text: 'Số lượng học viên mới theo tháng',
        align: 'start',
        font: {
          size: 18,
          weight: '600'
        },
        color: '#1a1a1a',
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          },
          color: '#9e9e9e',
          padding: 10
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#9e9e9e',
          padding: 10
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    }
  };

  if (loading) {
    return (
      <div style={{ height: '400px', width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%', padding: '20px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

// Component thống kê tóm tắt nhân sự - Thiết kế đơn giản
const StaffSummaryStats = ({ staffStats }) => {
  const roleConfigs = {
    'Center Head': {
      label: 'Trưởng trung tâm',
      icon: 'ph ph-crown',
    },
    'Teacher': {
      label: 'Giáo viên',
      icon: 'ph ph-chalkboard-teacher',
    },
    'Subject Leader': {
      label: 'Trưởng môn',
      icon: 'ph ph-medal',
    },
    'Academic Staff': {
      label: 'Giáo vụ',
      icon: 'ph ph-clipboard-text',
    }
  };

  const filteredRoleStats = staffStats || [];

  return (
    <div className="row g-3">
      {filteredRoleStats.map((stat) => {
        const config = roleConfigs[stat.roleName];
        if (!config) return null;

        return (
          <div key={stat.roleName} className="col-md-6 col-lg-3">
            <Card className="h-100">
              <div className="p-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'rgba(93, 135, 255, 0.1)'
                    }}
                  >
                    <i className={`${config.icon} fs-4 text-primary`}></i>
                  </div>
                  <div>
                    <div className="fs-4 fw-bold text-neutral-900">{stat.total}</div>
                    <div className="text-neutral-500 small">tài khoản</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-neutral-700 fw-semibold small">{config.label}</div>
                </div>
                <div className="d-flex gap-3 text-xs">
                  <div className="text-success">
                    <i className="ph ph-check-circle me-1"></i>
                    {stat.active} hoạt động
                  </div>
                  <div className="text-neutral-400">
                    <i className="ph ph-x-circle me-1"></i>
                    {stat.inactive} không hoạt động
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
  const [roles, setRoles] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'staff'

  // Stats states
  const [studentStats, setStudentStats] = useState({ total: 0, newThisMonth: 0 });
  const [staffStats, setStaffStats] = useState([]);
  const [chartData, setChartData] = useState(createChartData([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
  const [chartLoading, setChartLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);

      // Calculate stats from real data
      calculateStats(data);

      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    // Calculate student stats
    const students = usersData.filter(user =>
      user.roleId?.name === 'Student' || user.roleId === 'Student'
    );
    const activeStudents = students.filter(s => s.isActive === true).length;

    // Calculate new students this month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const newStudentsThisMonth = students.filter(student => {
      if (!student.createdAt) return false;
      const createdDate = new Date(student.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    setStudentStats({
      total: students.length,
      active: activeStudents,
      inactive: students.length - activeStudents,
      newThisMonth: newStudentsThisMonth
    });

    // Calculate monthly student growth for chart (last 12 months)
    calculateMonthlyChartData(students);

    // Calculate staff stats by role
    const staffRoles = ['Center Head', 'Teacher', 'Subject Leader', 'Academic Staff'];
    const staffStatsData = staffRoles.map(roleName => {
      const roleUsers = usersData.filter(user =>
        user.roleId?.name === roleName || user.roleId === roleName
      );
      const active = roleUsers.filter(u => u.isActive === true).length;
      return {
        roleName,
        total: roleUsers.length,
        active,
        inactive: roleUsers.length - active
      };
    }).filter(stat => stat.total > 0);

    setStaffStats(staffStatsData);
  };

  const calculateMonthlyChartData = (students) => {
    setChartLoading(true);

    const currentYear = new Date().getFullYear();

    // Initialize array with 12 months (0 for each month)
    const monthlyData = new Array(12).fill(0);

    // Count students created in each month of current year
    students.forEach(student => {
      if (!student.createdAt) return;

      const createdDate = new Date(student.createdAt);
      const createdYear = createdDate.getFullYear();
      const createdMonth = createdDate.getMonth(); // 0-11

      // Only count students from current year
      if (createdYear === currentYear) {
        monthlyData[createdMonth]++;
      }
    });

    setChartData(createChartData(monthlyData));
    setChartLoading(false);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...users];

    // Filter by tab - handle both populated roleId object and string roleId
    if (activeTab === 'students') {
      filtered = filtered.filter(user => {
        const roleName = user.roleId?.name || user.role?.name || '';
        return roleName === 'Student';
      });
    } else {
      const staffRoleNames = ['Center Head', 'Teacher', 'Subject Leader', 'Academic Staff'];
      filtered = filtered.filter(user => {
        const roleName = user.roleId?.name || user.role?.name || '';
        return staffRoleNames.includes(roleName);
      });
    }

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullname?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.username?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword)
      );
    }

    // Role filter
    if (filterValues.role && filterValues.role !== "all") {
      filtered = filtered.filter(user => {
        const roleId = user.roleId?._id || user.roleId;
        return roleId === filterValues.role;
      });
    }

    // Status filter (using isActive)
    if (filterValues.status && filterValues.status !== "all") {
      const isActiveFilter = filterValues.status === "active";
      filtered = filtered.filter(user => user.isActive === isActiveFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
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
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updatedData) => {
    try {
      if (!selectedUser?._id) {
        alert('Không tìm thấy thông tin người dùng');
        return;
      }

      await userService.updateUser(selectedUser._id, updatedData);
      alert('Cập nhật tài khoản thành công!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật tài khoản');
    }
  };

  const handleToggleActive = async (user) => {
    const isCurrentlyActive = user.isActive !== false; // default true if undefined

    // Chỉ kiểm tra khi vô hiệu hóa (không kiểm tra khi kích hoạt lại)
    if (isCurrentlyActive) {
      // Lấy thông tin user đang đăng nhập
      const currentUser = authService.getUserData();

      // Không cho phép vô hiệu hóa tài khoản của chính mình
      if (currentUser && currentUser._id === user._id) {
        alert('Bạn không thể vô hiệu hóa tài khoản của chính mình!');
        return;
      }

      // Không cho phép vô hiệu hóa tài khoản Center Head
      const roleName = user.roleId?.name || user.role?.name || '';
      if (roleName === 'Center Head') {
        alert('Không thể vô hiệu hóa tài khoản Trưởng trung tâm (Center Head)!');
        return;
      }
    }

    const actionText = isCurrentlyActive ? 'vô hiệu hóa' : 'kích hoạt';
    const actionTextSuccess = isCurrentlyActive ? 'Vô hiệu hóa' : 'Kích hoạt';

    if (window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.fullname || user.username}"?`)) {
      try {
        const newIsActive = !isCurrentlyActive;
        await userService.updateUser(user._id, { isActive: newIsActive });
        alert(`${actionTextSuccess} tài khoản thành công!`);
        fetchUsers();
      } catch (error) {
        console.error('Error toggling user active status:', error);
        alert(error.message || 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
      }
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
  ];

  const getCurrentFilters = () => {
    if (activeTab === 'students') {
      return [
        {
          key: "status",
          label: "Trạng thái",
          options: [
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Vô hiệu hóa" },
          ]
        }
      ];
    } else {
      const staffRoleNames = ['Center Head', 'Teacher', 'Subject Leader', 'Academic Staff'];
      const staffRoles = roles.filter(role => staffRoleNames.includes(role.name));

      return [
        {
          key: "role",
          label: "Vai trò",
          options: staffRoles.map(role => ({
            value: role._id,
            label: role.name
          }))
        },
        {
          key: "status",
          label: "Trạng thái",
          options: [
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Vô hiệu hóa" },
          ]
        }
      ];
    }
  };

  // Student columns (simplified - no actions)
  const studentColumns = [
    {
      header: 'Tên người dùng',
      field: 'fullname',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900">{row.fullname}</div>
          <div className="text-sm text-neutral-500">@{row.username}</div>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      field: 'role',
      render: (row) => (
        <span className="badge bg-primary-50 text-primary-600 fw-medium">
          {row.roleId?.name || row.role?.name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Liên hệ',
      field: 'contact',
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
        <StatusBadge status={row.isActive !== false ? 'active' : 'inactive'} size="sm" />
      ),
    },
  ];

  // Staff columns (with actions menu)
  const staffColumns = [
    {
      header: 'Người dùng',
      field: 'fullname',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900">{row.fullname}</div>
          <div className="text-sm text-neutral-500">{row.email}</div>
          <div className="text-sm text-neutral-500">@{row.username}</div>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      field: 'role',
      render: (row) => {
        const roleName = row.roleId?.name || row.role?.name || '';
        const roleColors = {
          'Center Head': 'danger',
          'Subject Leader': 'success',
          'Academic Staff': 'warning',
          'Teacher': 'info'
        };
        const color = roleColors[roleName] || 'secondary';
        return (
          <span className={`badge bg-${color}-50 text-${color}-600 fw-medium`}>
            {roleName || 'N/A'}
          </span>
        );
      },
    },
    {
      header: 'Liên hệ',
      field: 'contact',
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
        <StatusBadge status={row.isActive !== false ? 'active' : 'inactive'} size="sm" />
      ),
    },
    {
      header: '',
      field: 'actions',
      render: (row) => (
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="ph ph-dots-three-outline-vertical"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button
                className="dropdown-item"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditUser(row);
                }}
              >
                <i className="ph ph-pencil me-2"></i>
                Chỉnh sửa
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className={`dropdown-item ${row.isActive !== false ? 'text-warning' : 'text-success'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleActive(row);
                }}
              >
                <i className={`ph ${row.isActive !== false ? 'ph-prohibit' : 'ph-check-circle'} me-2`}></i>
                {row.isActive !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
              </button>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination component
  const Pagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (totalPages <= 1) return null;

    return (
      <nav className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="ph ph-caret-left"></i>
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(number)}>
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="ph ph-caret-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
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
          <Button
            variant="primary"
            icon="ph ph-plus"
            onClick={handleCreateUser}
          >
            Thêm tài khoản
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
      <Card className="mb-24">
        <div className="d-flex gap-2 p-2">
          <button
            className={`flex-fill btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline-secondary'} py-3 px-4 rounded-3`}
            onClick={() => {
              setActiveTab('students');
              setFilterValues({});
              setSearchKeyword("");
            }}
            type="button"
            style={{
              fontWeight: '600',
              fontSize: '15px',
              border: activeTab === 'students' ? 'none' : '1px solid #dee2e6',
              boxShadow: activeTab === 'students' ? '0 4px 12px rgba(93, 135, 255, 0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="ph ph-graduation-cap me-2 fs-5"></i>
            Quản lý học viên
          </button>
          <button
            className={`flex-fill btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-outline-secondary'} py-3 px-4 rounded-3`}
            onClick={() => {
              setActiveTab('staff');
              setFilterValues({});
              setSearchKeyword("");
            }}
            type="button"
            style={{
              fontWeight: '600',
              fontSize: '15px',
              border: activeTab === 'staff' ? 'none' : '1px solid #dee2e6',
              boxShadow: activeTab === 'staff' ? '0 4px 12px rgba(93, 135, 255, 0.2)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <i className="ph ph-users-three me-2 fs-5"></i>
            Quản lý nhân sự
          </button>
        </div>
      </Card>

      {/* Student Tab Content */}
      {activeTab === 'students' && (
        <>
          {/* Summary Stats */}
          <div className="mb-24">
            <h5 className="mb-3 text-neutral-900 fw-semibold">Tóm tắt học viên</h5>
            <StudentSummaryStats studentStats={studentStats} />
          </div>

          {/* Student Growth Trend Chart */}
          <Card className="mb-24">
            <StudentGrowthChart chartData={chartData} loading={chartLoading} />
          </Card>

          {/* Search & Filter */}
          <Card className="mb-24">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between">
              <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <SearchBox
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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

          {/* Student Table */}
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-16">
              <h6 className="mb-0 text-neutral-900 fw-semibold">
                Danh sách học viên ({filteredUsers.length})
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
              columns={studentColumns}
              data={currentItems}
              onRowClick={handleViewUser}
            />
            <Pagination />
          </Card>
        </>
      )}

      {/* Staff Tab Content */}
      {activeTab === 'staff' && (
        <>
          {/* Staff Summary Statistics */}
          <div className="mb-24">
            <h5 className="mb-3 text-neutral-900 fw-semibold">Tóm tắt nhân sự</h5>
            <StaffSummaryStats staffStats={staffStats} />
          </div>

          {/* Search & Filter */}
          <Card className="mb-24">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between">
              <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
                <SearchBox
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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

          {/* Staff Table */}
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-16">
              <h6 className="mb-0 text-neutral-900 fw-semibold">
                Danh sách nhân sự ({filteredUsers.length})
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
              columns={staffColumns}
              data={currentItems}
              onRowClick={handleViewUser}
            />
            <Pagination />
          </Card>
        </>
      )}

      {/* View User Detail Modal - Read Only */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserList;
