import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import { mockRoles } from '../../../helper/mockdataExtended';

const UserCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    roleId: '',
  });
  const [errors, setErrors] = useState({});

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
    { label: 'Thêm người dùng', path: '/center-head/users/create' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
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
      setLoading(true);
      // TODO: Call API to create user
      console.log('Creating user:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success - redirect back to user list
      navigate('/center-head/users');
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy? Các thông tin đã nhập sẽ không được lưu.')) {
      navigate('/center-head/users');
    }
  };


  return (
    <div className="user-create-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-24 gap-3">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Thêm người dùng mới</h4>
          <p className="text-neutral-600 mb-0">
            Nhập thông tin để tạo tài khoản người dùng mới
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Form Fields */}
          <div className="col-12">
            <Card className="mb-24">
              <h6 className="mb-16 text-neutral-900 fw-semibold">Thông tin cơ bản</h6>

              {/* Submit Error */}
              {errors.submit && (
                <div className="alert alert-danger d-flex align-items-center mb-16" role="alert">
                  <i className="ph ph-warning-circle me-2 text-xl"></i>
                  <div>{errors.submit}</div>
                </div>
              )}

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

                {/* Password */}
                <div className="col-12 col-md-6">
                  <label htmlFor="password" className="form-label">
                    Mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className="col-12 col-md-6">
                  <label htmlFor="confirmPassword" className="form-label">
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
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

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-24">
              <Button
                type="button"
                variant="secondary"
                icon="ph ph-x"
                onClick={handleCancel}
                disabled={loading}
                style={{ minWidth: '150px' }}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon="ph ph-check"
                disabled={loading}
                style={{ minWidth: '150px' }}
              >
                {loading ? 'Đang tạo...' : 'Tạo người dùng'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
