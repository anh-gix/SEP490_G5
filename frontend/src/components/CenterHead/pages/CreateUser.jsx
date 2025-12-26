import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { userService } from '../../../services/userService';
import { roleService } from '../../../services/roleService';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullname: '',
    phone: '',
    address: '',
    roleIds: [] // Multiple roles
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Filter roles - exclude student role for now (can be adjusted)
  const availableRoles = roles.filter(role => role.name !== 'Student');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleChange = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId]
    }));
    // Clear role error
    if (errors.roleIds) {
      setErrors(prev => ({ ...prev, roleIds: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    }

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Họ và tên là bắt buộc';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có 10 chữ số';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Vui lòng chọn ít nhất một vai trò';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare user data for API
      const userData = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        fullname: formData.fullname,
        phone: formData.phone,
        address: formData.address,
        roleId: formData.roleIds[0], // If API accepts single role, use first selected
        // If API accepts multiple roles, use: roleIds: formData.roleIds
      };

      await userService.createUser(userData);

      // Show success message
      alert('Tạo tài khoản thành công!');

      // Navigate back to user list
      navigate('/center-head/users');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message || 'Có lỗi xảy ra khi tạo tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/center-head/users');
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
    { label: 'Thêm tài khoản mới', path: '/center-head/users/create' },
  ];

  return (
    <div className="create-user-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="mb-24">
        <h4 className="mb-8 text-neutral-900 fw-bold">Thêm tài khoản mới</h4>
        <p className="text-neutral-600 mb-0">
          Tạo tài khoản mới cho người dùng trong hệ thống
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-24">
          <div className="p-4">
            <h5 className="mb-4 text-neutral-900 fw-semibold">Thông tin cơ bản</h5>

            <div className="row g-3">
              {/* Full Name */}
              <div className="col-md-6">
                <label className="form-label">
                  Họ và tên <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
                {errors.fullname && (
                  <div className="invalid-feedback">{errors.fullname}</div>
                )}
              </div>

              {/* Username */}
              <div className="col-md-6">
                <label className="form-label">
                  Tên đăng nhập <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Nhập tên đăng nhập"
                />
                {errors.username && (
                  <div className="invalid-feedback">{errors.username}</div>
                )}
              </div>

              {/* Email */}
              <div className="col-md-6">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@gmail.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              {/* Password */}
              <div className="col-md-6">
                <label className="form-label">
                  Mật khẩu <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                />
                {errors.password && (
                  <div className="invalid-feedback">{errors.password}</div>
                )}
                <small className="text-muted">Mật khẩu sẽ được sử dụng để đăng nhập cùng với email</small>
              </div>

              {/* Phone */}
              <div className="col-md-6">
                <label className="form-label">
                  Số điện thoại <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              {/* Address */}
              <div className="col-md-6">
                <label className="form-label">
                  Địa chỉ <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                />
                {errors.address && (
                  <div className="invalid-feedback">{errors.address}</div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Roles Section */}
        <Card className="mb-24">
          <div className="p-4">
            <h5 className="mb-4 text-neutral-900 fw-semibold">
              Vai trò <span className="text-danger">*</span>
            </h5>
            <p className="text-neutral-600 mb-3 small">
              Chọn một hoặc nhiều vai trò cho tài khoản này
            </p>

            <div className="row g-3">
              {availableRoles.map((role) => (
                <div key={role._id} className="col-md-6 col-lg-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`role-${role._id}`}
                      checked={formData.roleIds.includes(role._id)}
                      onChange={() => handleRoleChange(role._id)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`role-${role._id}`}
                    >
                      <div className="fw-semibold">{role.name}</div>
                      {role.description && (
                        <small className="text-muted">{role.description}</small>
                      )}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {errors.roleIds && (
              <div className="text-danger small mt-2">{errors.roleIds}</div>
            )}

            {/* Selected Roles Summary */}
            {formData.roleIds.length > 0 && (
              <div className="mt-3">
                <div className="text-neutral-700 small mb-2">
                  Các vai trò đã chọn ({formData.roleIds.length}):
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {formData.roleIds.map(roleId => {
                    const role = availableRoles.find(r => r._id === roleId);
                    return role ? (
                      <span key={roleId} className="badge bg-primary">
                        {role.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang tạo...
              </>
            ) : (
              <>
                <i className="ph ph-plus me-2"></i>
                Tạo tài khoản
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
