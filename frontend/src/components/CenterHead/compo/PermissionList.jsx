import { useState, useMemo, useEffect } from 'react';
import './RoleManagement.css';

const PermissionList = ({ role, permissions, onTogglePermission }) => {
  const [filter, setFilter] = useState('all'); // all, assigned, unassigned
  const [expandedModules, setExpandedModules] = useState({});
  const [tempPermissions, setTempPermissions] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset temp permissions when role changes
  useEffect(() => {
    if (role?.permission?.permissions) {
      setTempPermissions(JSON.parse(JSON.stringify(role.permission.permissions)));
      setHasChanges(false);
    } else {
      setTempPermissions(null);
      setHasChanges(false);
    }
  }, [role]);

  const moduleNames = {
    "user": "Quản lý người dùng",
    "role": "Quản lý vai trò",
    "program": "Quản lý chương trình",
    "course": "Quản lý khóa học",
    "class": "Quản lý lớp học",
    "schedule": "Quản lý lịch học",
    "attendance": "Điểm danh",
    "leave": "Quản lý nghỉ phép",
    "room": "Quản lý phòng học",
    "exam": "Quản lý thi & kiểm tra",
    "report": "Báo cáo & Thống kê"
  };

  const actionNames = {
    "view": "Xem",
    "create": "Tạo mới",
    "edit": "Chỉnh sửa",
    "delete": "Xóa",
    "block": "Khóa/Mở khóa",
    "import": "Import",
    "assign": "Phân quyền",
    "approve": "Duyệt",
    "assign_teacher": "Phân giảng viên",
    "manage_student": "Quản lý học viên",
    "take": "Điểm danh",
    "publish": "Xuất bản",
    "grade": "Chấm điểm",
    "view_result": "Xem kết quả",
    "export": "Xuất file"
  };

  // Get all permissions from role's permission object (use temp permissions if editing)
  const rolePermissions = useMemo(() => {
    if (tempPermissions) return tempPermissions;
    if (!role?.permission?.permissions) return {};
    return role.permission.permissions;
  }, [role, tempPermissions]);

  // Build permission structure grouped by module
  const permissionStructure = useMemo(() => {
    const structure = {};

    // Get all unique modules from all permissions
    permissions.forEach(perm => {
      if (perm.permissions) {
        Object.keys(perm.permissions).forEach(module => {
          if (!structure[module]) {
            structure[module] = new Set();
          }
          perm.permissions[module].forEach(action => {
            structure[module].add(action);
          });
        });
      }
    });

    // Convert sets to arrays
    Object.keys(structure).forEach(module => {
      structure[module] = Array.from(structure[module]);
    });

    return structure;
  }, [permissions]);

  // Check if a permission is assigned
  const isPermissionAssigned = (module, action) => {
    return rolePermissions[module]?.includes(action) || false;
  };

  // Calculate total permissions count
  const getTotalPermissions = useMemo(() => {
    let total = 0;
    Object.values(permissionStructure).forEach(actions => {
      total += actions.length;
    });
    return total;
  }, [permissionStructure]);

  // Calculate current role permissions count
  const getCurrentPermissions = useMemo(() => {
    let count = 0;
    Object.values(rolePermissions).forEach(actions => {
      count += actions.length;
    });
    return count;
  }, [rolePermissions]);

  // Filter modules based on filter
  const filteredModules = useMemo(() => {
    const modules = Object.entries(permissionStructure);

    if (filter === 'all') return modules;

    return modules.filter(([module, actions]) => {
      const hasAssigned = actions.some(action => isPermissionAssigned(module, action));
      const hasUnassigned = actions.some(action => !isPermissionAssigned(module, action));

      if (filter === 'assigned') return hasAssigned;
      if (filter === 'unassigned') return hasUnassigned;
      return true;
    });
  }, [permissionStructure, filter, rolePermissions]);

  const toggleModule = (module) => {
    setExpandedModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const handlePermissionToggle = (module, action) => {
    if (!role || !tempPermissions) return;

    // Clone temp permissions
    const updatedPermissions = { ...tempPermissions };

    // Toggle the action
    if (updatedPermissions[module]?.includes(action)) {
      // Remove action
      updatedPermissions[module] = updatedPermissions[module].filter(a => a !== action);

      // Remove module if empty
      if (updatedPermissions[module].length === 0) {
        delete updatedPermissions[module];
      }
    } else {
      // Add action
      if (!updatedPermissions[module]) {
        updatedPermissions[module] = [];
      }
      updatedPermissions[module] = [...updatedPermissions[module], action];
    }

    setTempPermissions(updatedPermissions);
    setHasChanges(true);
  };

  const handleSelectAllModule = (module, actions) => {
    if (!role || !tempPermissions) return;

    const stats = getModuleStats(module, actions);
    const selectAll = stats.assigned < stats.total;

    // Clone temp permissions
    const updatedPermissions = { ...tempPermissions };

    if (selectAll) {
      // Select all actions in module
      updatedPermissions[module] = [...actions];
    } else {
      // Deselect all actions in module
      delete updatedPermissions[module];
    }

    setTempPermissions(updatedPermissions);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!role || !tempPermissions || !hasChanges) return;

    // Call the parent's onTogglePermission with all the changes
    // But we need to pass the entire updated permissions object
    // So we'll need to update the parent component to handle saving
    onTogglePermission(role, tempPermissions);
    setHasChanges(false);
  };

  const handleCancelChanges = () => {
    if (!role?.permission?.permissions) return;

    // Reset to original permissions
    setTempPermissions(JSON.parse(JSON.stringify(role.permission.permissions)));
    setHasChanges(false);
  };

  const getModuleStats = (module, actions) => {
    const assigned = actions.filter(action => isPermissionAssigned(module, action)).length;
    return { assigned, total: actions.length };
  };

  if (!role) {
    return (
      <div className="permission-list-container">
        <div className="permission-list-empty">
          <i className="ph ph-user-circle-gear"></i>
          <h5 style={{ color: '#6b7280', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Chọn vai trò để xem quyền
          </h5>
          <p>Vui lòng chọn một vai trò từ danh sách bên trái để xem và quản lý các quyền của vai trò đó.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="permission-list-container">
      <div className="permission-list-header">
        <div>
          <h5 className="permission-list-title">Chức năng</h5>
          <p className="permission-list-subtitle">
            Phân quyền cho vai trò: <strong>{role.name}</strong> - {getCurrentPermissions}/{getTotalPermissions} quyền
          </p>
        </div>
        <div className="permission-filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả quyền
          </button>
          <button
            className={`filter-btn ${filter === 'assigned' ? 'active' : ''}`}
            onClick={() => setFilter('assigned')}
          >
            Quyền đã có
          </button>
          <button
            className={`filter-btn ${filter === 'unassigned' ? 'active' : ''}`}
            onClick={() => setFilter('unassigned')}
          >
            Quyền chưa có
          </button>
        </div>
      </div>

      <div className="permission-modules">
        {filteredModules.map(([module, actions]) => {
          const isExpanded = expandedModules[module];
          const stats = getModuleStats(module, actions);

          return (
            <div key={module} className="permission-module">
              <div className="permission-module-header" onClick={() => toggleModule(module)}>
                <div className="module-header-left">
                  <i className={`ph ${isExpanded ? 'ph-caret-down' : 'ph-caret-right'}`}></i>
                  <span className="module-name">{moduleNames[module] || module}</span>
                </div>
                <div className="module-header-right">
                  <span className="module-stats">
                    {stats.assigned}/{stats.total}
                  </span>
                  {stats.assigned === stats.total && stats.total > 0 && (
                    <i className="ph ph-check-circle text-success"></i>
                  )}
                  <button
                    className="btn-select-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAllModule(module, actions);
                    }}
                  >
                    {stats.assigned === stats.total ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="permission-module-content">
                  {actions.map(action => {
                    const isAssigned = isPermissionAssigned(module, action);

                    // Apply filter
                    if (filter === 'assigned' && !isAssigned) return null;
                    if (filter === 'unassigned' && isAssigned) return null;

                    return (
                      <div key={action} className="permission-item">
                        <label className={`permission-checkbox ${isAssigned ? 'checked' : ''}`}>
                          <span className="permission-label">
                            {actionNames[action] || action}
                          </span>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handlePermissionToggle(module, action)}
                          />
                          <span className="checkmark"></span>
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

      {filteredModules.length === 0 && (
        <div className="permission-list-empty">
          <i className="ph ph-magnifying-glass"></i>
          <p>Không tìm thấy quyền nào</p>
        </div>
      )}

      {/* Save/Cancel buttons */}
      {hasChanges && (
        <div className="permission-actions-bar">
          <div className="permission-actions-content">
            <div className="permission-actions-message">
              <i className="ph ph-warning-circle"></i>
              <span>Bạn có thay đổi chưa được lưu</span>
            </div>
            <div className="permission-actions-buttons">
              <button
                className="btn-cancel-changes"
                onClick={handleCancelChanges}
              >
                <i className="ph ph-x"></i>
                Hủy
              </button>
              <button
                className="btn-save-changes"
                onClick={handleSaveChanges}
              >
                <i className="ph ph-check"></i>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionList;
