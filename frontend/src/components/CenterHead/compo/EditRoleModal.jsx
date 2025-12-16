import { useState, useEffect } from 'react';
import './RoleManagement.css';

const EditRoleModal = ({ role, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
    }
  }, [role]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên vai trò không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...role, ...formData });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog-simple" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-simple">
          <h6 className="modal-title-simple">Chỉnh sửa vai trò</h6>
          <button type="button" className="btn-close-simple" onClick={onClose}>
            <i className="ph ph-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body-simple">
            <p className="modal-subtitle">Chỉnh sửa tên vai trò đã chọn.</p>

            <div className="form-group-simple">
              <label className="form-label-simple">Tên vai trò</label>
              <input
                type="text"
                className={`form-control-simple ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                placeholder="Nhập tên vai trò"
                value={formData.name}
                onChange={handleInputChange}
                autoFocus
              />
              {errors.name && <div className="invalid-feedback-simple">{errors.name}</div>}
            </div>

            <div className="form-group-simple">
              <label className="form-label-simple">Mô tả</label>
              <textarea
                className="form-control-simple"
                name="description"
                placeholder="Nhập mô tả vai trò (tùy chọn)"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
              />
              <div className="form-hint">Mô tả chi tiết về vai trò và trách nhiệm</div>
            </div>
          </div>

          <div className="modal-footer-simple">
            <button type="button" className="btn-cancel-simple" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit-simple">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleModal;
