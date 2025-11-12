import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { mockRoles, mockPermissionMatrix, mockUsers, simulateApiDelay } from '../../../helper/mockdataExtended';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    roleId: '',
    changePassword: false,
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    // Initialize selected permissions when role changes
    if (formData.roleId) {
      const allPerms = getRolePermissions();
      const initialPerms = {};
      allPerms.forEach(perm => {
        const key = `${perm.category}-${perm.permission}`;
        initialPerms[key] = true;
      });
      setSelectedPermissions(initialPerms);
    } else {
      setSelectedPermissions({});
    }
  }, [formData.roleId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(500);

      // TODO: Replace with actual API call
      const foundUser = mockUsers.find(u => u._id === id);

      if (!foundUser) {
        setErrors({ fetch: 'Không tìm thấy người dùng' });
        return;
      }

      setUser(foundUser);
      setFormData({
        username: foundUser.username || '',
        email: foundUser.email || '',
        phone: foundUser.phone || '',
        address: foundUser.address || '',
        roleId: foundUser.roleId || '',
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrors({ fetch: 'Có lỗi xảy ra khi tải thông tin người dùng' });
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
    { label: 'Chỉnh sửa người dùng', path: `/center-head/users/${id}/edit` },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.changePassword) {
      if (!formData.newPassword) {
        newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Vai trò là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      // TODO: Call API to update user
      console.log('Updating user:', { id, ...formData });

      // Simulate API call
      await simulateApiDelay(1000);

      // Success - redirect back to user list
      navigate('/center-head/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      navigate('/center-head/users');
    }
  };

  // Get selected role
  const selectedRole = mockRoles.find(role => role._id === formData.roleId);

  // Get permissions for selected role
  const getRolePermissions = () => {
    if (!selectedRole) return [];

    const permissions = [];
    Object.entries(mockPermissionMatrix).forEach(([category, perms]) => {
      Object.entries(perms).forEach(([permission, roles]) => {
        if (roles.includes(selectedRole.name)) {
          permissions.push({
            category,
            permission,
            label: getPermissionLabel(permission),
          });
        }
      });
    });

    return permissions;
  };

  const getPermissionLabel = (permission) => {
    const labels = {
      createUser: 'Tạo người dùng',
      editUser: 'Sửa người dùng',
      deleteUser: 'Xóa người dùng',
      changeRole: 'Thay đổi vai trò',
      importUsers: 'Import người dùng',
      createProgram: 'Tạo chương trình',
      approveProgram: 'Phê duyệt chương trình',
      createPLO: 'Tạo PLO',
      createCourse: 'Tạo khóa học',
      approveCourse: 'Phê duyệt khóa học',
      createCLO: 'Tạo CLO',
      createSession: 'Tạo phiên học',
      createClass: 'Tạo lớp học',
      assignTeacher: 'Phân công giảng viên',
      manageStudents: 'Quản lý học viên',
      createSchedule: 'Tạo lịch học',
      approveSchedule: 'Phê duyệt lịch học',
      approveLeaveRequest: 'Phê duyệt đơn nghỉ',
      takeAttendance: 'Điểm danh',
      createRoom: 'Tạo phòng học',
      editRoom: 'Sửa phòng học',
    };
    return labels[permission] || permission;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      accountManagement: 'Quản lý tài khoản',
      programManagement: 'Quản lý chương trình',
      classManagement: 'Quản lý lớp học',
      roomManagement: 'Quản lý phòng học',
    };
    return labels[category] || category;
  };

  // Group permissions by category
  const groupedPermissions = getRolePermissions().reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {});

  const toggleGroup = (category) => {
    setExpandedGroups(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isCategoryExpanded = (category) => {
    return expandedGroups[category] !== false; // Default to expanded
  };

  const selectAllInGroup = (category, checked) => {
    const newPermissions = { ...selectedPermissions };
    const permsInCategory = groupedPermissions[category] || [];

    permsInCategory.forEach(perm => {
      const key = `${perm.category}-${perm.permission}`;
      newPermissions[key] = checked;
    });

    setSelectedPermissions(newPermissions);
  };

  const togglePermission = (category, permission) => {
    const key = `${category}-${permission}`;
    setSelectedPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isCategoryAllChecked = (category) => {
    const permsInCategory = groupedPermissions[category] || [];
    if (permsInCategory.length === 0) return false;

    return permsInCategory.every(perm => {
      const key = `${perm.category}-${perm.permission}`;
      return selectedPermissions[key] === true;
    });
  };

  const isPermissionChecked = (category, permission) => {
    const key = `${category}-${permission}`;
    return selectedPermissions[key] === true;
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

  if (errors.fetch) {
    return (
      <div className="user-edit-container">
        <Breadcrumb items={breadcrumbItems} />
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="ph ph-warning-circle me-2 text-xl"></i>
          <div>{errors.fetch}</div>
        </div>
        <Button variant="outline-secondary" icon="ph ph-arrow-left" onClick={() => navigate('/center-head/users')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="user-edit-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Chỉnh sửa người dùng</h4>
          <p className="text-neutral-600 mb-0">
            Cập nhật thông tin cho: <span className="fw-semibold">{user?.fullname || user?.username}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Submit Error */}
        {errors.submit && (
          <div className="alert alert-danger d-flex align-items-center mb-24" role="alert">
            <i className="ph ph-warning-circle me-2 text-xl"></i>
            <div>{errors.submit}</div>
          </div>
        )}

        <div className="row">
          {/* Left Column - Main Form */}
          <div className="col-12 col-lg-8">
            {/* Basic Information Section */}
            <Card className="mb-24">
              <h6 className="mb-16 text-neutral-900 fw-semibold">Thông tin cơ bản</h6>

              <div className="row g-3">
                {/* Username */}
                <div className="col-12 col-md-6">
                  <label htmlFor="username" className="form-label">
                    Tên đăng nhập <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đăng nhập"
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                {/* Email */}
                <div className="col-12 col-md-6">
                  <label htmlFor="email" className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Phone */}
                <div className="col-12 col-md-6">
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                {/* Role */}
                <div className="col-12 col-md-6">
                  <label htmlFor="roleId" className="form-label">
                    Vai trò <span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-select ${errors.roleId ? 'is-invalid' : ''}`}
                    id="roleId"
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn vai trò</option>
                    {mockRoles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && <div className="invalid-feedback">{errors.roleId}</div>}
                </div>

                {/* Address */}
                <div className="col-12">
                  <label htmlFor="address" className="form-label">
                    Địa chỉ <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ"
                    rows="3"
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>
              </div>
            </Card>

            {/* Change Password Section */}
            <Card className="mb-24">
              <h6 className="mb-16 text-neutral-900 fw-semibold">Thay đổi mật khẩu</h6>

              <p className="text-sm text-neutral-600 mb-16">
                Bỏ chế độ đổi mật khẩu để cập nhật mật khẩu cho người dùng này
              </p>

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setFormData({ ...formData, changePassword: !formData.changePassword })}
              >
                Đổi mật khẩu
              </button>

              {formData.changePassword && (
                <div className="row g-3 mt-3">
                  {/* New Password */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="newPassword" className="form-label">
                      Mật khẩu mới <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                  </div>

                  {/* Confirm Password */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="confirmPassword" className="form-label">
                      Xác nhận mật khẩu mới <span className="text-danger">*</span>
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Permissions Sidebar */}
          <div className="col-12 col-lg-4">
            <Card className="mb-24">
              <h6 className="mb-16 text-neutral-900 fw-semibold">Quyền hạn</h6>

              {!selectedRole ? (
                <div className="text-center text-neutral-500 py-4">
                  <i className="ph ph-info text-4xl mb-2"></i>
                  <p className="mb-0 text-sm">Chọn vai trò để xem quyền hạn</p>
                </div>
              ) : (
                <>
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="text-center text-neutral-500 py-3">
                      <p className="mb-0 text-sm">Vai trò này chưa có quyền hạn nào</p>
                    </div>
                  ) : (
                    <div
                      className="permissions-accordion"
                      style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        paddingRight: '4px'
                      }}
                    >
                      {Object.entries(groupedPermissions).map(([category, perms]) => {
                        const isExpanded = isCategoryExpanded(category);
                        const allChecked = isCategoryAllChecked(category);

                        return (
                          <div
                            key={category}
                            className="mb-2"
                            style={{
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              backgroundColor: '#ffffff'
                            }}
                          >
                            {/* Group Header */}
                            <div
                              className="d-flex align-items-center justify-content-between"
                              style={{
                                padding: '10px 12px',
                                backgroundColor: isExpanded ? '#f9fafb' : '#ffffff',
                                borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={allChecked}
                                  onChange={(e) => {
                                    selectAllInGroup(category, e.target.checked);
                                  }}
                                  style={{
                                    cursor: 'pointer',
                                    marginTop: '0',
                                    width: '16px',
                                    height: '16px'
                                  }}
                                />
                                <span
                                  className="fw-semibold"
                                  onClick={() => toggleGroup(category)}
                                  style={{
                                    fontSize: '13px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    flex: 1
                                  }}
                                >
                                  {getCategoryLabel(category)}
                                </span>
                              </div>
                              <i
                                className={`ph ${isExpanded ? 'ph-caret-up' : 'ph-caret-down'}`}
                                onClick={() => toggleGroup(category)}
                                style={{
                                  fontSize: '14px',
                                  color: '#9ca3af',
                                  cursor: 'pointer'
                                }}
                              ></i>
                            </div>

                            {/* Permission Items */}
                            {isExpanded && (
                              <div
                                style={{
                                  padding: '8px 12px 8px 32px',
                                  backgroundColor: '#fafbfc'
                                }}
                              >
                                {perms.map((perm, index) => {
                                  const isChecked = isPermissionChecked(perm.category, perm.permission);

                                  return (
                                    <div
                                      key={index}
                                      className="form-check"
                                      style={{
                                        marginBottom: index < perms.length - 1 ? '6px' : '0',
                                        paddingLeft: '0'
                                      }}
                                    >
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`perm-${category}-${index}`}
                                        checked={isChecked}
                                        onChange={() => togglePermission(perm.category, perm.permission)}
                                        style={{
                                          cursor: 'pointer',
                                          marginRight: '8px',
                                          width: '14px',
                                          height: '14px',
                                          float: 'left',
                                          marginTop: '2px'
                                        }}
                                      />
                                      <label
                                        className="form-check-label"
                                        htmlFor={`perm-${category}-${index}`}
                                        style={{
                                          cursor: 'pointer',
                                          fontSize: '13px',
                                          color: '#6b7280',
                                          lineHeight: '1.4',
                                          userSelect: 'none'
                                        }}
                                      >
                                        {perm.label}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Action Buttons */}
            <Card className="position-relative" style={{ zIndex: 1 }}>
              <Button
                type="submit"
                variant="primary"
                icon="ph ph-check"
                disabled={saving}
                className="w-100 mb-2"
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
              <Button
                type="button"
                variant="outline-secondary"
                onClick={handleCancel}
                disabled={saving}
                className="w-100"
              >
                Hủy
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
