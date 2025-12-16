import { useEffect, useState } from 'react';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Table from '../compo/Table';
import Button from '../compo/Button';
import Tabs from '../compo/Tabs';
import { mockRoles, mockPermissionMatrix, simulateApiDelay } from '../../../helper/mockdataExtended';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      await simulateApiDelay(400);
      setRoles(mockRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý tài khoản', path: '/center-head/users' },
    { label: 'Vai trò & Phân quyền', path: '/center-head/roles' },
  ];

  const tabs = [
    { key: 'roles', label: 'Danh sách vai trò' },
    { key: 'permissions', label: 'Ma trận phân quyền' },
  ];

  const roleColumns = [
    {
      header: 'Vai trò',
      field: 'name',
      render: (row) => (
        <div>
          <div className="fw-semibold text-neutral-900 mb-4">{row.name}</div>
          <div className="text-sm text-neutral-600">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Số người dùng',
      field: 'userCount',
      render: (row) => (
        <span className="badge bg-main-50 text-main-600 fw-medium px-12 py-4">
          {row.userCount} người
        </span>
      ),
    },
    {
      header: 'Hành động',
      field: 'actions',
      render: (row) => (
        <div className="d-flex gap-2">
          <Button variant="outline" size="sm" icon="ph ph-pencil-simple">
            Chỉnh sửa
          </Button>
          <Button variant="outline" size="sm" icon="ph ph-eye">
            Xem quyền
          </Button>
        </div>
      ),
    },
  ];

  const renderPermissionMatrix = () => {
    const categories = Object.keys(mockPermissionMatrix);
    const roleNames = mockRoles.map(r => r.name);

    return (
      <div className="permission-matrix">
        {categories.map(category => (
          <Card key={category} className="mb-24">
            <h6 className="mb-16 text-neutral-900 fw-bold text-uppercase">
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </h6>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="bg-neutral-50">Chức năng</th>
                    {roleNames.map(role => (
                      <th key={role} className="bg-neutral-50 text-center">{role}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(mockPermissionMatrix[category]).map(([key, allowedRoles]) => (
                    <tr key={key}>
                      <td className="text-neutral-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </td>
                      {roleNames.map(role => (
                        <td key={role} className="text-center">
                          {allowedRoles.includes(role) ? (
                            <i className="ph ph-check-circle text-success-600 text-xl"></i>
                          ) : (
                            <i className="ph ph-x-circle text-neutral-300 text-xl"></i>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    );
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
    <div className="role-management-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">Quản lý vai trò & Phân quyền</h4>
          <p className="text-neutral-600 mb-0">
            Xem và quản lý vai trò, phân quyền trong hệ thống
          </p>
        </div>
        {activeTab === 'roles' && (
          <Button variant="primary" icon="ph ph-plus">
            Thêm vai trò
          </Button>
        )}
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-24">
        {activeTab === 'roles' && (
          <Card>
            <Table columns={roleColumns} data={roles} />
          </Card>
        )}

        {activeTab === 'permissions' && renderPermissionMatrix()}
      </div>
    </div>
  );
};

export default RoleManagement;
