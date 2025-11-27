import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import ImportExportButtons from '../compo/ImportExportButtons';
import { mockUsers, mockRoles, mockRoleStats, simulateApiDelay } from '../../../helper/mockdataExtended';
import { formatDate } from '../../../helper/helper';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, users]);

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

  const applyFilters = () => {
    let filtered = [...users];

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
  };

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

  const filters = [
    {
      key: "role",
      label: "Vai trò",
      options: mockRoles.map(role => ({
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

      {/* Stats Summary */}
      <div className="row g-4 mb-24">
        {Object.entries(mockRoleStats).map(([key, stats]) => (
          <div key={key} className="col-md-6 col-xl-3">
            <Card className="bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-neutral-600 mb-4 text-sm">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <h5 className="mb-0 text-neutral-900 fw-bold">{stats.total}</h5>
                  <div className="text-xs text-neutral-500 mt-4">
                    Active: {stats.active} | Inactive: {stats.inactive}
                  </div>
                </div>
                <div className="w-40 h-40 bg-main-50 d-flex align-items-center justify-content-center rounded-2">
                  <i className="ph ph-users text-xl text-main-600"></i>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

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
            filters={filters}
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
            Danh sách người dùng ({filteredUsers.length})
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
