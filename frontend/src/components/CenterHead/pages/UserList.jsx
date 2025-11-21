import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import SearchBox from '../compo/SearchBox';
import FilterBar from '../compo/FilterBar';
import StatusBadge from '../compo/StatusBadge';
import Modal from '../compo/Modal';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filterValues, setFilterValues] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // View user modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, filterValues, users]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, filterValues, recordsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword)
      );
    }

    // Role filter
    if (filterValues.role && filterValues.role !== "all") {
      filtered = filtered.filter(user => user.roleId?._id === filterValues.role || user.roleId === filterValues.role);
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
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    navigate(`/center-head/users/${user._id}/edit`);
  };

  const handleDeleteUser = async (e, user) => {
    e.stopPropagation(); // Prevent row click
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}"?\n\nHành động này không thể hoàn tác.`)) {
      try {
        await userService.deleteUser(user._id);
        fetchUsers(); // Refresh the list after successful delete
      } catch (err) {
        console.error('Error deleting user:', err);
        alert(err.message || 'Có lỗi xảy ra khi xóa người dùng.');
      }
    }
  };

  const handleExport = () => {
    console.log('Export users to Excel');
    // TODO: Implement export logic
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
  ];

  const filters = [
    {
      key: "role",
      label: "Vai trò",
      options: roles.map(role => ({
        value: role._id,
        label: role.name
      }))
    }
  ];

  const columns = [
    {
      header: 'Username',
      field: 'username',
      render: (row) => (
        <div className="fw-semibold text-neutral-900">@{row.username}</div>
      ),
    },
    {
      header: 'Email',
      field: 'email',
      render: (row) => (
        <span className="text-neutral-700">{row.email}</span>
      ),
    },
    {
      header: 'Số điện thoại',
      field: 'phone',
      render: (row) => (
        <span className="text-neutral-700">{row.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Role',
      field: 'role',
      render: (row) => (
        <span className="badge bg-main-50 text-main-600 fw-medium">
          {row.roleId?.name || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="btn btn-sm btn-outline-main d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', padding: '0' }}
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(row);
            }}
            title="Chỉnh sửa"
          >
            <i className="ph ph-pencil-simple" style={{ fontSize: '16px' }}></i>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', padding: '0' }}
            onClick={(e) => handleDeleteUser(e, row)}
            title="Xóa"
          >
            <i className="ph ph-trash" style={{ fontSize: '16px' }}></i>
          </button>
        </div>
      ),
    },
  ];

  // Pagination calculations
  const totalRecords = filteredUsers.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);
  const currentPageData = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleRecordsPerPageChange = (e) => {
    setRecordsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-24 gap-3">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý tài khoản</h4>
          <p className="text-neutral-600 mb-0">
            Quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Search & Filter */}
      <Card className="mb-24">
        <div className="row g-3">
          {/* Search Box */}
          <div className="col-12 col-md-4">
            <SearchBox
              placeholder="Tìm kiếm theo tên, email, username..."
              onSearch={handleSearch}
              value={searchKeyword}
              onChange={setSearchKeyword}
            />
          </div>

          {/* Filters */}
          <div className="col-12 col-md-4">
            <FilterBar
              filters={filters}
              values={filterValues}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

          {/* Action Buttons */}
          <div className="col-12 col-md-4 d-flex flex-column flex-sm-row gap-2 justify-content-md-end">
            <button
              type="button"
              className="btn btn-success d-flex align-items-center justify-content-center gap-2 w-100 w-sm-auto"
              onClick={handleExport}
            >
              <i className="ph ph-download-simple"></i>
              <span>Export</span>
            </button>
            <Button
              variant="primary"
              icon="ph ph-plus"
              onClick={handleCreateUser}
              className="w-100 w-sm-auto"
            >
              Thêm người dùng
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="mb-0 text-neutral-900 fw-semibold">
            Danh sách người dùng
          </h6>
          <Button
            variant="primary"
            icon="ph ph-arrows-clockwise"
            size="sm"
            onClick={fetchUsers}
          >
            Làm mới
          </Button>
        </div>

        <div className="table-responsive">
          <Table
            columns={columns}
            data={currentPageData}
            onRowClick={handleViewUser}
          />
        </div>

        {/* Pagination Controls */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-16 pt-16 border-top">
          {/* Records per page & info */}
          <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
            <div className="d-flex align-items-center gap-2">
              <span className="text-sm text-neutral-600">Hiển thị</span>
              <select
                className="form-select form-select-sm"
                value={recordsPerPage}
                onChange={handleRecordsPerPageChange}
                style={{ width: 'auto' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-neutral-600">bản ghi</span>
            </div>
            <span className="text-sm text-neutral-700">
              {totalRecords > 0 ? `${startIndex + 1}-${endIndex}` : '0'} trên {totalRecords} kết quả
            </span>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="ph ph-caret-left"></i>
                  </button>
                </li>

                {getPageNumbers().map((page, index) => (
                  <li
                    key={index}
                    className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                  >
                    {page === '...' ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )}
                  </li>
                ))}

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
          )}
        </div>
      </Card>

      {/* View User Modal */}
      <Modal
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Thông tin người dùng"
        size="lg"
        footer={
          <div className="d-flex gap-2">
            <Button
              variant="primary"
              icon="ph ph-pencil-simple"
              onClick={() => {
                setShowViewModal(false);
                handleEditUser(selectedUser);
              }}
            >
              Chỉnh sửa
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setShowViewModal(false)}
            >
              Đóng
            </Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="row g-3">
            {/* User Avatar */}
            <div className="col-12">
              <div className="d-flex align-items-center gap-3 p-3 bg-neutral-50 rounded">
                <div className="avatar-circle bg-main-600 text-white d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', borderRadius: '50%', fontSize: '24px', fontWeight: 'bold' }}>
                  {selectedUser.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-neutral-900 fw-bold">@{selectedUser.username}</h5>
                  <p className="mb-0 text-neutral-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="col-12 col-md-6">
              <div className="info-item mb-3">
                <label className="text-sm text-neutral-600 mb-1 d-block">Email</label>
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-envelope text-neutral-500"></i>
                  <span className="text-neutral-900">{selectedUser.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="info-item mb-3">
                <label className="text-sm text-neutral-600 mb-1 d-block">Số điện thoại</label>
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-phone text-neutral-500"></i>
                  <span className="text-neutral-900">{selectedUser.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="info-item mb-3">
                <label className="text-sm text-neutral-600 mb-1 d-block">Vai trò</label>
                <div className="d-flex align-items-center gap-2">
                  <i className="ph ph-user-circle text-neutral-500"></i>
                  <span className="badge bg-main-50 text-main-600 fw-medium">
                    {selectedUser.roleId?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-12">
              <div className="info-item mb-3">
                <label className="text-sm text-neutral-600 mb-1 d-block">Địa chỉ</label>
                <div className="d-flex align-items-start gap-2">
                  <i className="ph ph-map-pin text-neutral-500 mt-1"></i>
                  <span className="text-neutral-900">{selectedUser.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Role Description */}
            {selectedUser.roleId?.description && (
              <div className="col-12">
                <div className="alert alert-info mb-0">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ph ph-info text-info text-xl"></i>
                    <div>
                      <strong>Mô tả vai trò:</strong>
                      <p className="mb-0 mt-1">{selectedUser.roleId.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;
