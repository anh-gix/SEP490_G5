import { mockRoles } from '../../../helper/mockdataExtended';

const UserDetailModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Get role name from roleId
  const userRole = mockRoles.find(role => role._id === user.roleId);

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
            {/* Header */}
            <div className="modal-header pb-2" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <h5 className="modal-title fw-semibold">Thông tin tài khoản</h5>
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
                {/* Full Name */}
                <div>
                  <label className="form-label small mb-1">Họ và tên</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.fullname}
                    disabled
                    style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Email */}
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

                {/* Phone */}
                <div>
                  <label className="form-label small mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={user.phone}
                    disabled
                    style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="form-label small mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    className="form-control"
                    value={user.address || ''}
                    placeholder="Chưa cập nhật"
                    disabled
                    style={{ backgroundColor: '#f9fafb', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="form-label small mb-1">Vai trò</label>
                  <div>
                    <span className="badge bg-primary" style={{ fontWeight: '500' }}>
                      {userRole?.name || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetailModal;
