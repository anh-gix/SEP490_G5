import { useState } from 'react';
import './RoleManagement.css';

const RoleList = ({ roles, selectedRole, onSelectRole, onCreateRole, onUpdateRole, onDeleteRole, onEditRole }) => {
  const [showDropdown, setShowDropdown] = useState(null);

  const handleSettingsClick = (e, role) => {
    e.stopPropagation();
    setShowDropdown(showDropdown === role._id ? null : role._id);
  };

  const handleEditClick = (e, role) => {
    e.stopPropagation();
    setShowDropdown(null);
    onEditRole(role);
  };

  const handleDeleteClick = (e, role) => {
    e.stopPropagation();
    setShowDropdown(null);
    if (window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      onDeleteRole(role._id);
    }
  };

  return (
    <div className="role-list-container">
      <div className="role-list-header">
        <h6 className="role-list-title">Danh sách vai trò</h6>
        <button
          className="btn btn-sm btn-primary-custom"
          onClick={onCreateRole}
        >
          <i className="ph ph-plus me-1"></i>
          Thêm vai trò
        </button>
      </div>

      <div className="role-list-items">
        {roles.map(role => (
          <div
            key={role._id}
            className={`role-list-item ${selectedRole?._id === role._id ? 'active' : ''}`}
            onClick={() => onSelectRole(role)}
          >
            <div className="role-item-content">
              <div className="role-item-info">
                <div className="role-item-name">{role.name}</div>
                <div className="role-item-meta">
                  <span className="role-item-count">
                    <i className="ph ph-users"></i>
                    {role.userCount}
                  </span>
                </div>
              </div>
              <div className="role-item-actions">
                <button
                  className="btn-icon-settings"
                  onClick={(e) => handleSettingsClick(e, role)}
                >
                  <i className="ph ph-gear"></i>
                </button>
                {showDropdown === role._id && (
                  <div className="role-dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={(e) => handleEditClick(e, role)}
                    >
                      <i className="ph ph-pencil-simple"></i>
                      Chỉnh sửa
                    </button>
                    <button
                      className="dropdown-item text-danger"
                      onClick={(e) => handleDeleteClick(e, role)}
                      disabled={role.userCount > 0}
                    >
                      <i className="ph ph-trash"></i>
                      Xóa vai trò
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleList;
