import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import Tabs from '../compo/Tabs';
import Badge from '../compo/Badge';

// Mock data cho PLOs
const MOCK_PLOS = [
  { _id: 'plo1', code: 'PLO1', name: 'Listening Skills', detail: 'Hiểu và phản ứng với các đoạn hội thoại tiếng Anh' },
  { _id: 'plo2', code: 'PLO2', name: 'Reading Comprehension', detail: 'Đọc hiểu các văn bản học thuật và thông tin' },
  { _id: 'plo3', code: 'PLO3', name: 'Writing Skills', detail: 'Viết các bài luận và báo cáo tiếng Anh' },
  { _id: 'plo4', code: 'PLO4', name: 'Speaking Fluency', detail: 'Giao tiếp lưu loát và tự tin bằng tiếng Anh' },
  { _id: 'plo5', code: 'PLO5', name: 'Grammar & Vocabulary', detail: 'Sử dụng ngữ pháp và từ vựng chính xác' },
];

const ProgramFormNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState('basic');

  // Form state - CẬP NHẬT với các trường mới từ programModel
  const [formData, setFormData] = useState({
    code: '',
    program_name: '',
    description: '',
    type: 'ielts',           // ← MỚI
    level: 'B1',              // ← MỚI
    band: '4.0-5.0',          // ← MỚI
    tuitionFee: 0,            // ← MỚI
    status: 'draft',
    plos: [],
    courses: []
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

  // Tabs configuration
  const tabs = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: 'ph ph-info' },
    { id: 'plo', label: 'Program Learning Outcomes', icon: 'ph ph-target' },
    { id: 'courses', label: 'Các học phần', icon: 'ph ph-books' }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý chương trình', path: '/center-head/programs' },
    { label: isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới' }
  ];

  // Load program data if editing
  useEffect(() => {
    if (isEdit && id) {
      // TODO: Replace with actual API call (TẠM THỜI NGẮT)
      // Mock data for editing
      setFormData({
        code: 'IELTS-B2',
        program_name: 'IELTS Intermediate Program',
        description: 'Chương trình luyện thi IELTS từ band 5.5 đến 6.5',
        type: 'ielts',
        level: 'B2',
        band: '5.5-6.5',
        tuitionFee: 5000000,
        status: 'active',
        plos: ['plo1', 'plo2', 'plo3'],
        courses: [
          {
            _id: 'course1',
            subjectCode: 'IELTS-B2-01',
            name: 'IELTS Reading & Writing',
            description: 'Khóa học về Reading và Writing skills',
            status: 'approved',
            closCount: 4,
            sessionsCount: 12,
            materialsCount: 3
          }
        ]
      });
    }
  }, [isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================== PLO Management ====================
  const handleAddPLO = () => {
    setSelectedPLOs([]);
    setShowPLOModal(true);
  };

  const handlePLOCheckbox = (ploId) => {
    setSelectedPLOs(prev => {
      if (prev.includes(ploId)) {
        return prev.filter(id => id !== ploId);
      } else {
        return [...prev, ploId];
      }
    });
  };

  const handleSavePLOSelection = () => {
    setFormData(prev => ({
      ...prev,
      plos: [...new Set([...prev.plos, ...selectedPLOs])]
    }));
    setShowPLOModal(false);
    setSelectedPLOs([]);
  };

  const handleRemovePLO = (ploId) => {
    if (window.confirm('Bạn có chắc muốn xóa PLO này khỏi chương trình?')) {
      setFormData(prev => ({
        ...prev,
        plos: prev.plos.filter(id => id !== ploId)
      }));
    }
  };

  // Create new PLO
  const handleCreatePLO = () => {
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

    // TODO: API call to create PLO (TẠM THỜI NGẮT)
    // Mock: Add to available PLOs
    const mockNewPLO = {
      _id: `plo_new_${Date.now()}`,
      ...newPLO
    };

    setAvailablePLOs(prev => [...prev, mockNewPLO]);
    setFormData(prev => ({
      ...prev,
      plos: [...prev.plos, mockNewPLO._id]
    }));

    setShowCreatePLOModal(false);
    alert('Tạo PLO mới thành công!');
  };

  // ==================== Course Management ====================
  const handleAddCourse = () => {
    if (formData.plos.length === 0) {
      alert('Vui lòng thêm ít nhất 1 PLO trước khi thêm học phần!');
      setActiveTab('plo');
      return;
    }

    if (!id && !isEdit) {
      alert('Vui lòng lưu chương trình trước khi thêm học phần!');
      return;
    }

    // TODO: Navigate to course creation (TẠM THỜI NGẮT)
    const programId = id || 'temp_program_id';
    navigate(`/center-head/programs/${programId}/courses/create`);
  };

  const handleEditCourse = (courseId) => {
    const programId = id || formData._id;
    navigate(`/center-head/programs/${programId}/courses/${courseId}/edit`);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Bạn có chắc muốn xóa học phần này?')) {
      setFormData(prev => ({
        ...prev,
        courses: prev.courses.filter(c => c._id !== courseId)
      }));
      alert('Đã xóa học phần!');
    }
  };

  // ==================== Form Submission ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.program_name) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setLoading(true);

    // TODO: API Call (TẠM THỜI NGẮT)
    // Simulate API call (MOCK)
    setTimeout(() => {
      console.log('Submitting program:', formData);
      alert(isEdit ? 'Cập nhật chương trình thành công!' : 'Tạo chương trình thành công!');
      setLoading(false);
      navigate('/center-head/programs');
    }, 1000);
  };

  const handleSaveDraft = () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 0);
  };

  // Get PLO details by ID
  const getPLOById = (ploId) => {
    return availablePLOs.find(p => p._id === ploId) || { code: 'N/A', name: 'Unknown', detail: '' };
  };

  return (
    <div className="program-form-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">
            {isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}
          </h4>
          <p className="text-neutral-600 mb-0">
            Tạo chương trình hoàn chỉnh với PLO, Courses, CLO và Sessions
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-x-circle"
            onClick={() => navigate('/center-head/programs')}
          >
            Hủy
          </Button>
          <Button
            variant="outline"
            icon="ph ph-floppy-disk"
            onClick={handleSaveDraft}
          >
            Lưu nháp
          </Button>
          <Button
            variant="primary"
            icon="ph ph-check-circle"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo chương trình')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="mt-24">
        {/* Tab 1: Thông tin cơ bản */}
        {activeTab === 'basic' && (
          <Card>
            <div className="row g-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Mã chương trình <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  className="form-control"
                  placeholder="VD: IELTS-B2, TOEIC-600"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-8">
                <label className="form-label fw-semibold text-neutral-900">
                  Tên chương trình <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="program_name"
                  className="form-control"
                  placeholder="VD: IELTS Intermediate Program"
                  value={formData.program_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Loại chương trình <span className="text-danger">*</span>
                </label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="cam">Cambridge</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Cấp độ (CEFR) <span className="text-danger">*</span>
                </label>
                <select
                  name="level"
                  className="form-select"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Pre-A1">Pre-A1 (Starter)</option>
                  <option value="A1">A1 (Beginner)</option>
                  <option value="A2">A2 (Elementary)</option>
                  <option value="B1">B1 (Intermediate)</option>
                  <option value="B2">B2 (Upper Intermediate)</option>
                  <option value="C1">C1 (Advanced)</option>
                  <option value="C2">C2 (Proficient)</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Band/Score Range
                </label>
                <input
                  type="text"
                  name="band"
                  className="form-control"
                  placeholder="VD: 5.5-6.5, 600-750"
                  value={formData.band}
                  onChange={handleInputChange}
                />
                <small className="text-muted">Điểm band IELTS hoặc điểm TOEIC</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-neutral-900">
                  Học phí (VNĐ)
                </label>
                <input
                  type="number"
                  name="tuitionFee"
                  className="form-control"
                  placeholder="VD: 5000000"
                  value={formData.tuitionFee}
                  onChange={handleInputChange}
                  min="0"
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
                  <option value="disabled">Vô hiệu hóa</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="5"
                  placeholder="Nhập mô tả chi tiết về chương trình..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: PLO Management */}
        {activeTab === 'plo' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Program Learning Outcomes</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Chuẩn đầu ra của chương trình (PLO)
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline"
                  icon="ph ph-plus-circle"
                  onClick={handleCreatePLO}
                >
                  Tạo PLO mới
                </Button>
                <Button
                  variant="primary"
                  icon="ph ph-plus"
                  onClick={handleAddPLO}
                >
                  Thêm PLO có sẵn
                </Button>
              </div>
            </div>

            {formData.plos.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-target ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có PLO nào được thêm</p>
                <Button variant="primary" icon="ph ph-plus" onClick={handleAddPLO}>
                  Thêm PLO đầu tiên
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '100px' }}>Mã PLO</th>
                      <th>Tên PLO</th>
                      <th>Chi tiết</th>
                      <th style={{ width: '100px' }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.plos.map(ploId => {
                      const plo = getPLOById(ploId);
                      return (
                        <tr key={ploId}>
                          <td>
                            <Badge variant="info">{plo.code}</Badge>
                          </td>
                          <td className="fw-semibold">{plo.name}</td>
                          <td className="text-neutral-600">{plo.detail}</td>
                          <td className="text-center">
                            <Button
                              variant="ghost"
                              icon="ph ph-trash"
                              size="sm"
                              onClick={() => handleRemovePLO(ploId)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: Courses */}
        {activeTab === 'courses' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Các học phần</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Danh sách các khóa học trong chương trình
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddCourse}
                disabled={formData.plos.length === 0}
              >
                Thêm học phần
              </Button>
            </div>

            {formData.plos.length === 0 && (
              <div className="alert alert-warning">
                <i className="ph ph-warning-circle me-2"></i>
                Vui lòng thêm ít nhất 1 PLO trước khi thêm học phần!
              </div>
            )}

            {formData.courses.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-books ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có học phần nào được thêm</p>
                {formData.plos.length > 0 && (
                  <Button variant="primary" icon="ph ph-plus" onClick={handleAddCourse}>
                    Thêm học phần đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Mã môn</th>
                      <th>Tên học phần</th>
                      <th style={{ width: '150px' }}>Trạng thái</th>
                      <th style={{ width: '80px' }} className="text-center">CLOs</th>
                      <th style={{ width: '80px' }} className="text-center">Sessions</th>
                      <th style={{ width: '100px' }} className="text-center">Materials</th>
                      <th style={{ width: '150px' }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.courses.map(course => (
                      <tr key={course._id}>
                        <td>
                          <Badge variant="primary">{course.subjectCode}</Badge>
                        </td>
                        <td>
                          <div className="fw-semibold">{course.name}</div>
                          <div className="text-neutral-600 text-sm">{course.description}</div>
                        </td>
                        <td>
                          <Badge
                            variant={
                              course.status === 'approved' ? 'success' :
                              course.status === 'pending_approval' ? 'warning' :
                              'secondary'
                            }
                          >
                            {course.status === 'approved' ? 'Đã duyệt' :
                             course.status === 'pending_approval' ? 'Chờ duyệt' :
                             'Bản nháp'}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Badge variant="info">{course.closCount || 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge variant="info">{course.sessionsCount || 0}</Badge>
                        </td>
                        <td className="text-center">
                          <Badge variant="info">{course.materialsCount || 0}</Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="ghost"
                              icon="ph ph-pencil"
                              size="sm"
                              onClick={() => handleEditCourse(course._id)}
                            />
                            <Button
                              variant="ghost"
                              icon="ph ph-trash"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </form>

      {/* Modal: Select existing PLOs */}
      <Modal
        show={showPLOModal}
        onClose={() => setShowPLOModal(false)}
        title="Chọn PLO có sẵn"
        size="lg"
      >
        <div className="modal-body">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm PLO..."
            />
          </div>

          <div className="list-group">
            {availablePLOs
              .filter(plo => !formData.plos.includes(plo._id))
              .map(plo => (
                <label
                  key={plo._id}
                  className="list-group-item list-group-item-action d-flex align-items-start"
                >
                  <input
                    type="checkbox"
                    className="form-check-input me-3 mt-1"
                    checked={selectedPLOs.includes(plo._id)}
                    onChange={() => handlePLOCheckbox(plo._id)}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                      <Badge variant="info" className="me-2">{plo.code}</Badge>
                      <span className="fw-semibold">{plo.name}</span>
                    </div>
                    <p className="text-neutral-600 text-sm mb-0">{plo.detail}</p>
                  </div>
                </label>
              ))}
          </div>

          {availablePLOs.filter(plo => !formData.plos.includes(plo._id)).length === 0 && (
            <div className="text-center py-4 text-neutral-600">
              Không còn PLO nào để thêm
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowPLOModal(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSavePLOSelection}
            disabled={selectedPLOs.length === 0}
          >
            Thêm {selectedPLOs.length} PLO
          </Button>
        </div>
      </Modal>

      {/* Modal: Create new PLO */}
      <Modal
        show={showCreatePLOModal}
        onClose={() => setShowCreatePLOModal(false)}
        title="Tạo PLO mới"
      >
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label fw-semibold">
              Mã PLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="code"
              className="form-control"
              placeholder="VD: PLO6"
              value={newPLO.code}
              onChange={handleNewPLOChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Tên PLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="VD: Critical Thinking"
              value={newPLO.name}
              onChange={handleNewPLOChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">
              Chi tiết <span className="text-danger">*</span>
            </label>
            <textarea
              name="detail"
              className="form-control"
              rows="4"
              placeholder="Mô tả chi tiết về PLO..."
              value={newPLO.detail}
              onChange={handleNewPLOChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowCreatePLOModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveNewPLO}>
            Tạo PLO
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramFormNew;
