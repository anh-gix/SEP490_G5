import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';

// Mock data cho PLOs
const MOCK_PLOS = [
  { _id: 'plo1', code: 'PLO1', name: 'Kiến thức nền tảng', detail: 'Sinh viên có kiến thức nền tảng về lập trình' },
  { _id: 'plo2', code: 'PLO2', name: 'Kỹ năng phân tích', detail: 'Sinh viên có kỹ năng phân tích và thiết kế hệ thống' },
  { _id: 'plo3', code: 'PLO3', name: 'Kỹ năng làm việc nhóm', detail: 'Sinh viên có kỹ năng làm việc nhóm hiệu quả' },
  { _id: 'plo4', code: 'PLO4', name: 'Tư duy logic', detail: 'Sinh viên có tư duy logic và giải quyết vấn đề' },
  { _id: 'plo5', code: 'PLO5', name: 'Kỹ năng giao tiếp', detail: 'Sinh viên có kỹ năng giao tiếp chuyên nghiệp' },
];

const ProgramForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    program_name: '',
    description: '',
    status: 'draft',
    plos: []
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPLOModal, setShowPLOModal] = useState(false);
  const [showCreatePLOModal, setShowCreatePLOModal] = useState(false);
  const [availablePLOs, setAvailablePLOs] = useState(MOCK_PLOS);
  const [selectedPLOs, setSelectedPLOs] = useState([]);

  // New PLO form
  const [newPLO, setNewPLO] = useState({
    code: '',
    name: '',
    detail: ''
  });

  // Load program data if editing
  useEffect(() => {
    if (isEdit) {
      // Mock data for editing
      setFormData({
        code: 'SE2024',
        program_name: 'Kỹ thuật phần mềm 2024',
        description: 'Chương trình đào tạo kỹ sư phần mềm chuyên nghiệp',
        status: 'active',
        plos: ['plo1', 'plo2', 'plo3']
      });
    }
  }, [isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPLOs = () => {
    setSelectedPLOs([]);
    setShowPLOModal(true);
  };

  const togglePLOSelection = (ploId) => {
    setSelectedPLOs(prev => {
      if (prev.includes(ploId)) {
        return prev.filter(id => id !== ploId);
      }
      return [...prev, ploId];
    });
  };

  const handleConfirmAddPLOs = () => {
    setFormData(prev => ({
      ...prev,
      plos: [...new Set([...prev.plos, ...selectedPLOs])]
    }));
    setShowPLOModal(false);
    setSelectedPLOs([]);
  };

  const handleRemovePLO = (ploId) => {
    setFormData(prev => ({
      ...prev,
      plos: prev.plos.filter(id => id !== ploId)
    }));
  };

  const handleCreatePLO = () => {
    if (!newPLO.code || !newPLO.name || !newPLO.detail) {
      alert('Vui lòng điền đầy đủ thông tin PLO');
      return;
    }

    // Add to available PLOs
    const newPLOId = `plo${Date.now()}`;
    const createdPLO = {
      _id: newPLOId,
      ...newPLO
    };

    setAvailablePLOs(prev => [...prev, createdPLO]);

    // Add to program's PLOs
    setFormData(prev => ({
      ...prev,
      plos: [...prev.plos, newPLOId]
    }));

    // Reset form
    setNewPLO({ code: '', name: '', detail: '' });
    setShowCreatePLOModal(false);

    alert('Tạo PLO thành công!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.program_name) {
      alert('Vui lòng điền đầy đủ mã chương trình và tên chương trình');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Submitting program:', formData);
      alert(isEdit ? 'Cập nhật chương trình thành công!' : 'Tạo chương trình thành công!');
      setLoading(false);
      navigate('/center-head/programs');
    }, 1000);
  };

  const getSelectedPLODetails = () => {
    return formData.plos.map(ploId =>
      availablePLOs.find(plo => plo._id === ploId)
    ).filter(Boolean);
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Chương trình đào tạo', path: '/center-head/programs' },
    { label: isEdit ? 'Chỉnh sửa' : 'Tạo mới' }
  ];

  return (
    <div className="program-form-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">
            {isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}
          </h4>
          <p className="text-neutral-600 mb-0">
            {isEdit ? 'Cập nhật thông tin chương trình và PLOs' : 'Nhập thông tin chương trình và chọn PLOs'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left Column - Program Info */}
          <div className="col-lg-8">
            <Card title="Thông tin chương trình">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-neutral-900">
                    Mã chương trình <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    className="form-control"
                    placeholder="VD: SE2024"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-neutral-900">
                    Trạng thái
                  </label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-neutral-900">
                    Tên chương trình <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="program_name"
                    className="form-control"
                    placeholder="VD: Kỹ thuật phần mềm 2024"
                    value={formData.program_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold text-neutral-900">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="4"
                    placeholder="Mô tả về chương trình đào tạo..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </Card>

            {/* PLOs Section */}
            <Card
              title="Program Learning Outcomes (PLOs)"
              className="mt-24"
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    icon="ph ph-plus"
                    onClick={() => setShowCreatePLOModal(true)}
                  >
                    Tạo PLO mới
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="ph ph-plus"
                    onClick={handleAddPLOs}
                  >
                    Thêm PLO
                  </Button>
                </>
              }
            >
              {getSelectedPLODetails().length === 0 ? (
                <div className="text-center py-5">
                  <i className="ph ph-clipboard-text text-neutral-300" style={{ fontSize: '48px' }}></i>
                  <p className="text-neutral-600 mt-3 mb-0">Chưa có PLO nào được thêm</p>
                  <p className="text-sm text-neutral-500">Nhấn "Thêm PLO" để chọn các chuẩn đầu ra</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th width="15%">Mã PLO</th>
                        <th width="25%">Tên PLO</th>
                        <th width="50%">Chi tiết</th>
                        <th width="10%" className="text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getSelectedPLODetails().map((plo) => (
                        <tr key={plo._id}>
                          <td>
                            <span className="badge bg-main-50 text-main-600 px-12 py-6">
                              {plo.code}
                            </span>
                          </td>
                          <td className="fw-semibold text-neutral-900">{plo.name}</td>
                          <td className="text-neutral-700">{plo.detail}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemovePLO(plo._id)}
                              title="Xóa PLO"
                            >
                              <i className="ph ph-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Actions */}
          <div className="col-lg-4">
            <Card title="Hành động">
              <div className="d-flex flex-column gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon="ph ph-check-circle"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo chương trình')}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  icon="ph ph-x-circle"
                  className="w-100"
                  onClick={() => navigate('/center-head/programs')}
                  disabled={loading}
                >
                  Hủy
                </Button>
              </div>

              <div className="mt-4 p-3 bg-neutral-50 rounded">
                <h6 className="text-sm fw-semibold text-neutral-900 mb-2">Thông tin</h6>
                <ul className="list-unstyled text-sm text-neutral-700 mb-0">
                  <li className="mb-2">
                    <i className="ph ph-check-circle text-success-600 me-2"></i>
                    PLOs đã chọn: <strong>{formData.plos.length}</strong>
                  </li>
                  <li className="mb-2">
                    <i className="ph ph-info text-main-600 me-2"></i>
                    Trạng thái: <strong>{
                      formData.status === 'draft' ? 'Bản nháp' :
                      formData.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ'
                    }</strong>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Modal: Select PLOs */}
      <Modal
        show={showPLOModal}
        onClose={() => setShowPLOModal(false)}
        title="Chọn PLOs cho chương trình"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowPLOModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleConfirmAddPLOs}>
              Thêm ({selectedPLOs.length})
            </Button>
          </>
        }
      >
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th width="5%">
                  <input type="checkbox" className="form-check-input" disabled />
                </th>
                <th width="15%">Mã PLO</th>
                <th width="30%">Tên PLO</th>
                <th width="50%">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {availablePLOs.map((plo) => {
                const isAlreadyAdded = formData.plos.includes(plo._id);
                const isSelected = selectedPLOs.includes(plo._id);

                return (
                  <tr
                    key={plo._id}
                    className={`${isAlreadyAdded ? 'bg-neutral-50' : ''} ${isSelected ? 'bg-main-50' : ''}`}
                    style={{ cursor: isAlreadyAdded ? 'not-allowed' : 'pointer' }}
                    onClick={() => !isAlreadyAdded && togglePLOSelection(plo._id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={isAlreadyAdded || isSelected}
                        disabled={isAlreadyAdded}
                        onChange={() => {}}
                      />
                    </td>
                    <td>
                      <span className={`badge ${isAlreadyAdded ? 'bg-neutral-200 text-neutral-600' : 'bg-main-50 text-main-600'} px-12 py-6`}>
                        {plo.code}
                      </span>
                    </td>
                    <td className="fw-semibold">
                      {plo.name}
                      {isAlreadyAdded && <span className="badge bg-success-50 text-success-600 ms-2">Đã thêm</span>}
                    </td>
                    <td className="text-neutral-700">{plo.detail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* Modal: Create New PLO */}
      <Modal
        show={showCreatePLOModal}
        onClose={() => setShowCreatePLOModal(false)}
        title="Tạo PLO mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreatePLOModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreatePLO}>
              Tạo PLO
            </Button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-semibold">
              Mã PLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: PLO6"
              value={newPLO.code}
              onChange={(e) => setNewPLO(prev => ({ ...prev, code: e.target.value }))}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">
              Tên PLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Kỹ năng lập trình"
              value={newPLO.name}
              onChange={(e) => setNewPLO(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">
              Chi tiết <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Mô tả chi tiết về PLO..."
              value={newPLO.detail}
              onChange={(e) => setNewPLO(prev => ({ ...prev, detail: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramForm;
