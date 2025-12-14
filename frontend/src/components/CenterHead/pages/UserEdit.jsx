import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
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

  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const foundUser = await userService.getUserById(id);

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
        roleId: foundUser.roleId?._id || foundUser.roleId || '',
        changePassword: false,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setErrors({ fetch: error.message || 'Có lỗi xảy ra khi tải thông tin người dùng' });
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
      // Prepare data to send
      const { confirmPassword, ...userData } = formData;

      // Only include password if changePassword is true
      if (!formData.changePassword) {
        delete userData.newPassword;
        delete userData.changePassword;
      } else {
        // Rename newPassword to password for API
        userData.password = userData.newPassword;
        delete userData.newPassword;
        delete userData.changePassword;
      }

      await userService.updateUser(id, userData);

      // Success - redirect back to user list
      navigate('/center-head/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: error.message || 'Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
      navigate('/center-head/users');
    }
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-24 gap-3">
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
          {/* Main Form */}
          <div className="col-12">
            {/* Basic Information Section */}
            <Card className="mb-24">
              <h6 className="mb-16 text-neutral-900 fw-semibold">Thông tin cơ bản</h6>

              <div className="row g-3">
                {/* Username */}
                <div className="col-12 col-md-6">
                  <label htmlFor="username" className="form-label">
                    Tên người dùng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập tên người dùng"
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
                    {roles.map(role => (
                      <option key={role._id} value={role._id}>
                        {role.name} {role.description ? `- ${role.description}` : ''}
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

              <div className="d-flex align-items-center justify-content-between mb-16">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">
                    Cho phép thay đổi mật khẩu
                  </p>
                  <p className="text-xs text-neutral-500 mb-0">
                    Bật để cập nhật mật khẩu mới cho người dùng này
                  </p>
                </div>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="changePasswordSwitch"
                    checked={formData.changePassword}
                    onChange={(e) => setFormData({ ...formData, changePassword: e.target.checked })}
                    style={{ cursor: 'pointer', width: '48px', height: '24px' }}
                  />
                  <label className="form-check-label visually-hidden" htmlFor="changePasswordSwitch">
                    Cho phép đổi mật khẩu
                  </label>
                </div>
              </div>

              {formData.changePassword && (
                <div className="row g-3">
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

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-24">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={saving}
                style={{ minWidth: '150px' }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon="ph ph-check"
                disabled={saving}
                style={{ minWidth: '150px' }}
              >
                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;
