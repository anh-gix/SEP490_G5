import { useEffect, useState } from 'react';
import Breadcrumb from '../compo/Breadcrumb';
import RoleList from '../compo/RoleList';
import PermissionList from '../compo/PermissionList';
import CreateRoleModal from '../compo/CreateRoleModal';
import EditRoleModal from '../compo/EditRoleModal';
import { mockRoles, mockPermissions, simulateApiDelay } from '../../../helper/mockdataExtended';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(400);
      setRoles(mockRoles);
      setPermissions(mockPermissions);

      // Don't auto-select any role, user must choose
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý vai trò', path: '/center-head/roles' },
  ];

  const handleSelectRole = (role) => {
    setSelectedRole(role);
  };

  const handleCreateRole = () => {
    setShowCreateModal(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowEditModal(true);
  };

  const handleSaveNewRole = async (newRole) => {
    await simulateApiDelay(300);

    // Create a new empty permission for the new role
    const newPermission = {
      _id: `perm${Date.now()}`,
      name: `${newRole.name} Permission`,
      description: `Quyền cho vai trò ${newRole.name}`,
      permissions: {}
    };

    const role = {
      _id: `role${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      permissionId: newPermission._id,
      permission: newPermission,
      userCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPermissions([...permissions, newPermission]);
    const newRoles = [...roles, role];
    setRoles(newRoles);
    setSelectedRole(role);
    setShowCreateModal(false);
  };

  const handleUpdateRole = async (updatedRole) => {
    await simulateApiDelay(300);

    const updatedRoles = roles.map(r =>
      r._id === updatedRole._id ? updatedRole : r
    );

    setRoles(updatedRoles);
    setSelectedRole(updatedRole);
  };

  const handleDeleteRole = async (roleId) => {
    await simulateApiDelay(300);

    const newRoles = roles.filter(r => r._id !== roleId);
    setRoles(newRoles);

    // Select first role if deleted role was selected
    if (selectedRole?._id === roleId) {
      setSelectedRole(newRoles.length > 0 ? newRoles[0] : null);
    }
  };

  const handleTogglePermission = async (role, newPermissions) => {
    // If newPermissions is a string (module name), it's the old single-toggle format
    // We'll handle the new bulk update format where newPermissions is the entire permissions object

    // Create updated permission object
    const updatedPermission = {
      ...role.permission,
      permissions: newPermissions
    };

    // Update role
    const updatedRole = {
      ...role,
      permission: updatedPermission
    };

    await simulateApiDelay(300);

    const updatedRoles = roles.map(r =>
      r._id === updatedRole._id ? updatedRole : r
    );

    setRoles(updatedRoles);
    setSelectedRole(updatedRole);
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
    <div className="role-management-page">
      <Breadcrumb items={breadcrumbItems} />

      <div className="page-header mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý vai trò</h4>
          <p className="text-neutral-600 mb-0">
            Quản lý vai trò và quyền hạn của người dùng trong hệ thống
          </p>
        </div>
      </div>

      <div className="role-management-layout">
        <div className="role-management-sidebar">
          <RoleList
            roles={roles}
            selectedRole={selectedRole}
            onSelectRole={handleSelectRole}
            onCreateRole={handleCreateRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
            onEditRole={handleEditRole}
          />
        </div>

        <div className="role-management-main">
          <PermissionList
            role={selectedRole}
            permissions={permissions}
            onTogglePermission={handleTogglePermission}
          />
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveNewRole}
        />
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <EditRoleModal
          role={editingRole}
          onClose={() => {
            setShowEditModal(false);
            setEditingRole(null);
          }}
          onSave={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default RoleManagement;
