import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import Tabs from '../compo/Tabs';

// Mock data
const MOCK_PROGRAM = {
  _id: 'prog1',
  code: 'SE2024',
  program_name: 'Kỹ thuật phần mềm 2024',
  plos: [
    { _id: 'plo1', code: 'PLO1', name: 'Kiến thức nền tảng' },
    { _id: 'plo2', code: 'PLO2', name: 'Kỹ năng phân tích' },
    { _id: 'plo3', code: 'PLO3', name: 'Kỹ năng làm việc nhóm' },
    { _id: 'plo4', code: 'PLO4', name: 'Tư duy logic' },
  ]
};

const CourseForm = () => {
  const navigate = useNavigate();
  const { id, programId } = useParams();
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState('info');

  // Program data
  const [program, setProgram] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    program: programId || '',
    status: 'draft',
    clos: [],
    sessions: [],
  });

  // CLO Form
  const [showCLOModal, setShowCLOModal] = useState(false);
  const [editingCLOIndex, setEditingCLOIndex] = useState(null);
  const [cloForm, setCloForm] = useState({
    code: '',
    name: '',
    detail: '',
    mappedPLOs: []
  });

  // Session Form
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSessionIndex, setEditingSessionIndex] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    order: 1,
    content: '',
    learningType: 'Lý thuyết',
    clos: []
  });

  // Load program data
  useEffect(() => {
    // Mock: Load program data
    setProgram(MOCK_PROGRAM);

    if (isEdit) {
      // Mock: Load existing course data
      setFormData({
        name: 'Lập trình Web nâng cao',
        description: 'Khóa học về phát triển ứng dụng web hiện đại',
        program: programId || 'prog1',
        status: 'draft',
        clos: [
          {
            code: 'CLO1',
            name: 'Viết code html để các tạo phần',
            detail: 'Sinh viên hiểu và sử dụng thành thạo HTML5 và CSS3',
            mappedPLOs: ['plo1', 'plo2']
          },
          {
            code: 'CLO2',
            name: 'Học các từ vựng và các giọt điệu',
            detail: 'Sinh viên có kỹ năng lập trình JavaScript ES6+',
            mappedPLOs: ['plo2']
          }
        ],
        sessions: [
          {
            title: 'Giới thiệu về Web Development',
            order: 1,
            content: 'Tổng quan về phát triển web',
            learningType: 'Lý thuyết',
            clos: ['CLO1']
          },
          {
            title: 'HTML5 và CSS3',
            order: 2,
            content: 'Học các thẻ HTML5',
            learningType: 'Thực hành',
            clos: ['CLO1', 'CLO2']
          }
        ]
      });
    }
  }, [programId, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CLO Management
  const handleAddCLO = () => {
    setEditingCLOIndex(null);
    setCloForm({
      code: `CLO${formData.clos.length + 1}`,
      name: '',
      detail: '',
      mappedPLOs: []
    });
    setShowCLOModal(true);
  };

  const handleEditCLO = (index) => {
    setEditingCLOIndex(index);
    setCloForm({ ...formData.clos[index] });
    setShowCLOModal(true);
  };

  const handleSaveCLO = () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      alert('Vui lòng điền đầy đủ thông tin CLO');
      return;
    }

    if (editingCLOIndex !== null) {
      // Update existing CLO
      const updatedCLOs = [...formData.clos];
      updatedCLOs[editingCLOIndex] = cloForm;
      setFormData(prev => ({ ...prev, clos: updatedCLOs }));
    } else {
      // Add new CLO
      setFormData(prev => ({
        ...prev,
        clos: [...prev.clos, cloForm]
      }));
    }

    setShowCLOModal(false);
    setCloForm({ code: '', name: '', detail: '', mappedPLOs: [] });
  };

  const handleDeleteCLO = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa CLO này?')) {
      const cloCode = formData.clos[index].code;
      setFormData(prev => ({
        ...prev,
        clos: prev.clos.filter((_, i) => i !== index),
        sessions: prev.sessions.map(s => ({
          ...s,
          clos: s.clos.filter(c => c !== cloCode)
        }))
      }));
    }
  };

  const togglePLOMapping = (ploId) => {
    setCloForm(prev => ({
      ...prev,
      mappedPLOs: prev.mappedPLOs.includes(ploId)
        ? prev.mappedPLOs.filter(id => id !== ploId)
        : [...prev.mappedPLOs, ploId]
    }));
  };

  // Session Management
  const handleAddSession = () => {
    setEditingSessionIndex(null);
    const nextOrder = formData.sessions.length > 0
      ? Math.max(...formData.sessions.map(s => s.order)) + 1
      : 1;
    setSessionForm({
      title: '',
      order: nextOrder,
      content: '',
      learningType: 'Lý thuyết',
      clos: []
    });
    setShowSessionModal(true);
  };

  const handleEditSession = (index) => {
    setEditingSessionIndex(index);
    setSessionForm({ ...formData.sessions[index] });
    setShowSessionModal(true);
  };

  const handleSaveSession = () => {
    if (!sessionForm.title || !sessionForm.content) {
      alert('Vui lòng điền đầy đủ thông tin Session');
      return;
    }

    if (editingSessionIndex !== null) {
      // Update existing session
      const updatedSessions = [...formData.sessions];
      updatedSessions[editingSessionIndex] = sessionForm;
      setFormData(prev => ({ ...prev, sessions: updatedSessions }));
    } else {
      // Add new session
      setFormData(prev => ({
        ...prev,
        sessions: [...prev.sessions, sessionForm]
      }));
    }

    setShowSessionModal(false);
    setSessionForm({ title: '', order: 1, content: '', learningType: 'Lý thuyết', clos: [] });
  };

  const handleDeleteSession = (index) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa Session này?')) {
      setFormData(prev => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index)
      }));
    }
  };

  const toggleCLOForSession = (cloCode) => {
    setSessionForm(prev => ({
      ...prev,
      clos: prev.clos.includes(cloCode)
        ? prev.clos.filter(c => c !== cloCode)
        : [...prev.clos, cloCode]
    }));
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    alert('Đã lưu bản nháp!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting course:', formData);
    alert(isEdit ? 'Cập nhật khóa học thành công!' : 'Tạo khóa học thành công!');
    navigate(`/center-head/programs/${programId || formData.program}`);
  };

  const getPLOName = (ploId) => {
    const plo = program?.plos?.find(p => p._id === ploId);
    return plo ? plo.code : ploId;
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Chương trình đào tạo', path: '/center-head/programs' },
    { label: program?.program_name || 'Program', path: `/center-head/programs/${programId || formData.program}` },
    { label: isEdit ? 'Chỉnh sửa Course' : 'Tạo Course mới' }
  ];

  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản', icon: 'ph ph-info' },
    { id: 'clo', label: 'CLO & mapping PLO', icon: 'ph ph-target' },
    { id: 'session', label: 'Kế hoạch giảng dạy', icon: 'ph ph-calendar' },
  ];

  if (!program) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  return (
    <div className="course-form-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">
            Chi tiết học phần {formData.name || ''}
          </h4>
          <p className="text-neutral-600 mb-0">
            Chương trình: <strong>{program.code} - {program.program_name}</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
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
          >
            Lưu
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="mt-24">
        {/* Tab 1: Thông tin cơ bản */}
        {activeTab === 'info' && (
          <Card>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-neutral-900">
                  Tên học phần <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="VD: Lập trình Web nâng cao"
                  value={formData.name}
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
                  <option value="pending_approval">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
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
                  placeholder="Nhập mô tả chi tiết về học phần..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: CLO & mapping PLO */}
        {activeTab === 'clo' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-24">
              <h5 className="mb-0 fw-bold text-neutral-900">CLO & mapping PLO</h5>
              <Button
                variant="primary"
                size="sm"
                icon="ph ph-plus"
                onClick={handleAddCLO}
              >
                Thêm CLO mới
              </Button>
            </div>

            {/* CLO List Table */}
            {formData.clos.length > 0 && (
              <>
                <div className="mb-24">
                  <h6 className="fw-semibold text-neutral-900 mb-12">Danh sách CLO đã tạo:</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th width="5%">STT</th>
                          <th width="10%">Mã CLO</th>
                          <th width="25%">Tên CLO</th>
                          <th width="40%">Nội dung</th>
                          <th width="20%" className="text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.clos.map((clo, index) => (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>
                              <span className="badge bg-success-50 text-success-600 px-12 py-6">
                                {clo.code}
                              </span>
                            </td>
                            <td className="fw-semibold">{clo.name}</td>
                            <td>{clo.detail}</td>
                            <td className="text-center">
                              <div className="d-flex gap-2 justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-main"
                                  onClick={() => handleEditCLO(index)}
                                >
                                  Sửa / Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CLO - PLO Mapping Matrix */}
                <div>
                  <h6 className="fw-semibold text-neutral-900 mb-12">Liên kết CLO - PLO</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered text-center">
                      <thead className="bg-main-50">
                        <tr>
                          <th width="25%">CLO của học phần</th>
                          {program.plos.map(plo => (
                            <th key={plo._id} width={`${75 / program.plos.length}%`}>
                              {plo.code}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formData.clos.map((clo, index) => (
                          <tr key={index}>
                            <td className="text-start fw-semibold">{clo.code}</td>
                            {program.plos.map(plo => (
                              <td key={plo._id}>
                                {clo.mappedPLOs.includes(plo._id) && (
                                  <i className="ph ph-check-circle text-success-600" style={{ fontSize: '20px' }}></i>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {formData.clos.length === 0 && (
              <div className="text-center py-5">
                <i className="ph ph-clipboard-text text-neutral-300" style={{ fontSize: '48px' }}></i>
                <p className="text-neutral-600 mt-3 mb-0">Chưa có CLO nào. Nhấn "Thêm CLO mới" để bắt đầu.</p>
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: Kế hoạch giảng dạy (Sessions) */}
        {activeTab === 'session' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-24">
              <h5 className="mb-0 fw-bold text-neutral-900">Kế hoạch giảng dạy</h5>
              <Button
                variant="primary"
                size="sm"
                icon="ph ph-plus"
                onClick={handleAddSession}
              >
                Thêm buổi học
              </Button>
            </div>

            {formData.sessions.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th width="5%">Buổi</th>
                      <th width="25%">Tiêu đề</th>
                      <th width="35%">Nội dung</th>
                      <th width="15%">Loại hình</th>
                      <th width="10%">CLOs</th>
                      <th width="10%" className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sessions.sort((a, b) => a.order - b.order).map((session, index) => (
                      <tr key={index}>
                        <td className="text-center">
                          <span className="badge bg-main-600 text-white px-12 py-6">
                            {session.order}
                          </span>
                        </td>
                        <td className="fw-semibold">{session.title}</td>
                        <td className="text-neutral-700">{session.content}</td>
                        <td>
                          <span className="badge bg-warning-50 text-warning-600">
                            {session.learningType}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {session.clos.map(cloCode => (
                              <span key={cloCode} className="badge bg-success-50 text-success-600">
                                {cloCode}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-main"
                              onClick={() => handleEditSession(index)}
                            >
                              <i className="ph ph-pencil-simple"></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteSession(index)}
                            >
                              <i className="ph ph-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="ph ph-calendar text-neutral-300" style={{ fontSize: '48px' }}></i>
                <p className="text-neutral-600 mt-3 mb-0">Chưa có buổi học nào. Nhấn "Thêm buổi học" để bắt đầu.</p>
              </div>
            )}
          </Card>
        )}
      </form>

      {/* Modal: Add/Edit CLO */}
      <Modal
        show={showCLOModal}
        onClose={() => setShowCLOModal(false)}
        title={editingCLOIndex !== null ? 'Chỉnh sửa CLO' : 'Thêm CLO mới'}
        size="lg"
        footer={
          <>
            {editingCLOIndex !== null && (
              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteCLO(editingCLOIndex);
                  setShowCLOModal(false);
                }}
              >
                Xóa
              </Button>
            )}
            <div className="ms-auto d-flex gap-2">
              <Button variant="outline" onClick={() => setShowCLOModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleSaveCLO}>
                {editingCLOIndex !== null ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Mã CLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: CLO1"
              value={cloForm.code}
              onChange={(e) => setCloForm(prev => ({ ...prev, code: e.target.value }))}
            />
          </div>

          <div className="col-md-8">
            <label className="form-label fw-semibold">
              Tên CLO <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên CLO"
              value={cloForm.name}
              onChange={(e) => setCloForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Nội dung chi tiết <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Mô tả chi tiết về CLO..."
              value={cloForm.detail}
              onChange={(e) => setCloForm(prev => ({ ...prev, detail: e.target.value }))}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Mapping với PLO
            </label>
            <div className="border rounded p-3 bg-neutral-50">
              <div className="row g-2">
                {program.plos.map(plo => (
                  <div key={plo._id} className="col-md-6">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`plo-check-${plo._id}`}
                        checked={cloForm.mappedPLOs.includes(plo._id)}
                        onChange={() => togglePLOMapping(plo._id)}
                      />
                      <label className="form-check-label" htmlFor={`plo-check-${plo._id}`}>
                        <strong>{plo.code}</strong> - {plo.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal: Add/Edit Session */}
      <Modal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={editingSessionIndex !== null ? 'Chỉnh sửa buổi học' : 'Thêm buổi học mới'}
        size="lg"
        footer={
          <>
            {editingSessionIndex !== null && (
              <Button
                variant="danger"
                onClick={() => {
                  handleDeleteSession(editingSessionIndex);
                  setShowSessionModal(false);
                }}
              >
                Xóa
              </Button>
            )}
            <div className="ms-auto d-flex gap-2">
              <Button variant="outline" onClick={() => setShowSessionModal(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleSaveSession}>
                {editingSessionIndex !== null ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Buổi thứ <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="1"
              value={sessionForm.order}
              onChange={(e) => setSessionForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="col-md-8">
            <label className="form-label fw-semibold">
              Loại hình học tập
            </label>
            <select
              className="form-select"
              value={sessionForm.learningType}
              onChange={(e) => setSessionForm(prev => ({ ...prev, learningType: e.target.value }))}
            >
              <option value="Lý thuyết">Lý thuyết</option>
              <option value="Thực hành">Thực hành</option>
              <option value="Bài tập">Bài tập</option>
              <option value="Dự án">Dự án</option>
              <option value="Kiểm tra">Kiểm tra</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Tiêu đề buổi học <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="VD: Giới thiệu về Web Development"
              value={sessionForm.title}
              onChange={(e) => setSessionForm(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              Nội dung giảng dạy <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              rows="4"
              placeholder="Mô tả chi tiết nội dung buổi học..."
              value={sessionForm.content}
              onChange={(e) => setSessionForm(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>

          <div className="col-12">
            <label className="form-label fw-semibold">
              CLO liên quan
            </label>
            <div className="border rounded p-3 bg-neutral-50">
              {formData.clos.length === 0 ? (
                <p className="text-neutral-600 mb-0">Chưa có CLO nào. Vui lòng thêm CLO ở tab "CLO & mapping PLO".</p>
              ) : (
                <div className="row g-2">
                  {formData.clos.map((clo, index) => (
                    <div key={index} className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`clo-check-${index}`}
                          checked={sessionForm.clos.includes(clo.code)}
                          onChange={() => toggleCLOForSession(clo.code)}
                        />
                        <label className="form-check-label" htmlFor={`clo-check-${index}`}>
                          <strong>{clo.code}</strong> - {clo.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseForm;
