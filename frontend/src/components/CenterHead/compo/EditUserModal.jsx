import { useState, useEffect } from 'react';

const EditUserModal = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    address: '',
    changePassword: false,
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
        changePassword: false,
        password: ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePasswordToggle = (e) => {
    setFormData(prev => ({
      ...prev,
      changePassword: e.target.checked,
      password: e.target.checked ? prev.password : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (!formData.changePassword) {
      delete dataToSave.password;
    }
    delete dataToSave.changePassword;

    onSave && onSave(dataToSave);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="modal-header pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <h5 className="modal-title fw-semibold">Cập nhật tài khoản</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body py-3">
                <div className="d-flex flex-column gap-3">
                  {/* Email - Read Only */}
                  <div>
                    <label className="form-label small mb-1">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user.email}
                      disabled
                      style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                    />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="form-label small mb-1">
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="form-label small mb-1">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="form-label small mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <hr className="my-1" style={{ borderColor: '#e5e7eb' }} />
                  </div>

                  {/* Change Password Checkbox */}
                  <div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="changePasswordCheckbox"
                        checked={formData.changePassword}
                        onChange={handleChangePasswordToggle}
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="changePasswordCheckbox"
                      >
                        Thay đổi mật khẩu
                      </label>
                    </div>
                  </div>

                  {/* Password Field - Show only if checkbox is checked */}
                  {formData.changePassword && (
                    <div>
                      <label className="form-label small mb-1">Mật khẩu mới <span className="text-danger">*</span></label>
                      <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Tối thiểu 6 ký tự"
                        minLength={6}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserModal;
