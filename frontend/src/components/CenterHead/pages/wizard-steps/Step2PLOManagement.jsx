import { useState, useEffect } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import Modal from '../../compo/Modal';
import programService from '../../../../services/programService';

const Step2PLOManagement = ({ programData, setProgramData, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [showCreatePLOModal, setShowCreatePLOModal] = useState(false);

  // New PLO form
  const [newPLO, setNewPLO] = useState({
    code: '',
    name: '',
    detail: ''
  });

  const handleRemovePLO = (ploId) => {
    if (window.confirm('Bạn có chắc muốn xóa PLO này khỏi chương trình?')) {
      setProgramData(prev => ({
        ...prev,
        plos: prev.plos.filter(plo => plo._id !== ploId)
      }));
    }
  };

  const handleCreateNewPLO = () => {
    setNewPLO({ code: '', name: '', detail: '' });
    setShowCreatePLOModal(true);
  };

  const handleNewPLOChange = (e) => {
    const { name, value } = e.target;
    setNewPLO(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveNewPLO = () => {
    if (!newPLO.code || !newPLO.name || !newPLO.detail) {
      alert('Vui lòng điền đầy đủ thông tin PLO!');
      return;
    }

    // Check for duplicate PLO code
    const isDuplicate = programData.plos.some(plo => plo.code === newPLO.code);
    if (isDuplicate) {
      alert(`Mã PLO "${newPLO.code}" đã tồn tại trong chương trình này!`);
      return;
    }

    // Add PLO to local state with temporary ID
    const ploWithId = {
      ...newPLO,
      _id: `temp_${Date.now()}`
    };

    setProgramData(prev => ({
      ...prev,
      plos: [...prev.plos, ploWithId]
    }));

    setShowCreatePLOModal(false);
    setNewPLO({ code: '', name: '', detail: '' });
    alert('Thêm PLO mới thành công! Nhấn "Lưu & Tiếp tục" để lưu.');
  };

  const handleSaveAndNext = async () => {
    if (programData.plos.length === 0) {
      alert('Vui lòng thêm ít nhất 1 PLO cho chương trình!');
      return;
    }

    try {
      setLoading(true);

      // Update program with embedded PLOs (send full objects, not IDs)
      const plosData = programData.plos.map(plo => ({
        code: plo.code,
        name: plo.name,
        detail: plo.detail
      }));

      await programService.updateProgram(programData._id, {
        plos: plosData
      });

      alert('Lưu PLOs thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving PLOs:', error);
      alert('Lỗi khi lưu PLOs!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* PLO List */}
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">
            Danh sách PLO ({programData.plos.length})
          </h6>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNewPLO}
            icon="ph ph-plus"
          >
            Tạo PLO mới
          </Button>
        </div>

        {programData.plos.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i className="ph ph-list-dashes text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">
              Chưa có PLO nào. Vui lòng thêm PLO cho chương trình.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12" style={{ width: '5%' }}>#</th>
                  <th className="px-16 py-12" style={{ width: '15%' }}>Mã PLO</th>
                  <th className="px-16 py-12" style={{ width: '25%' }}>Tên PLO</th>
                  <th className="px-16 py-12">Chi tiết</th>
                  <th className="px-16 py-12 text-center" style={{ width: '10%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {programData.plos.map((plo, index) => (
                  <tr key={plo._id}>
                    <td className="px-16 py-12">{index + 1}</td>
                    <td className="px-16 py-12">
                      <Badge variant="primary">{plo.code || 'N/A'}</Badge>
                    </td>
                    <td className="px-16 py-12 fw-semibold">{plo.name || 'N/A'}</td>
                    <td className="px-16 py-12 text-neutral-600">{plo.detail || 'N/A'}</td>
                    <td className="px-16 py-12 text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemovePLO(plo._id)}
                        icon="ph ph-trash"
                      >
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon="ph ph-arrow-left"
        >
          Quay lại
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveAndNext}
          disabled={loading}
          icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-arrow-right'}
          iconPosition="right"
        >
          {loading ? 'Đang lưu...' : 'Lưu & Tiếp tục'}
        </Button>
      </div>

      {/* Modal: Create New PLO */}
      {showCreatePLOModal && (
        <Modal
          title="Tạo PLO mới"
          show={showCreatePLOModal}
          onClose={() => setShowCreatePLOModal(false)}
        >
          <div className="row gy-3">
            <div className="col-12">
              <label className="form-label fw-semibold">
                Mã PLO <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={newPLO.code}
                onChange={handleNewPLOChange}
                className="form-control radius-8"
                placeholder="Ví dụ: PLO1"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">
                Tên PLO <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={newPLO.name}
                onChange={handleNewPLOChange}
                className="form-control radius-8"
                placeholder="Tên PLO"
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">
                Chi tiết <span className="text-danger-600">*</span>
              </label>
              <textarea
                name="detail"
                value={newPLO.detail}
                onChange={handleNewPLOChange}
                className="form-control radius-8"
                rows="4"
                placeholder="Mô tả chi tiết về PLO"
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-16">
            <Button
              variant="outline"
              onClick={() => setShowCreatePLOModal(false)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveNewPLO}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo PLO'}
            </Button>
          </div>
        </Modal>
      )}

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};

export default Step2PLOManagement;
