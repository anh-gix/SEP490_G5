import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import Badge from '../compo/Badge';
import Tabs from '../compo/Tabs';
import programService from '../../../services/programService';

const ProgramFormNew = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    program_name: '',
    description: '',
    type: 'ielts',
    level: 'B1',
    band: '4.0-5.0',
    plos: [],
    courses: []
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [showCreatePLOModal, setShowCreatePLOModal] = useState(false);

  // New PLO form
  const [newPLO, setNewPLO] = useState({
    code: '',
    name: '',
    detail: ''
  });

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý chương trình', path: '/center-head/programs' },
    { label: isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới' }
  ];

  // Load program data if editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchProgramData = async () => {
        try {
          setLoading(true);
          const response = await programService.getProgramById(id);
          const programData = response.data;

          setFormData({
            code: programData.code,
            program_name: programData.program_name,
            description: programData.description || '',
            type: programData.type,
            level: programData.level,
            band: programData.band || '',
            plos: programData.plos || [],
            courses: programData.courses || []
          });

          // PLOs are now embedded in program, no need for separate state
        } catch (error) {
          console.error('Error loading program:', error);
          alert('Không thể tải thông tin chương trình!');
          navigate('/center-head/programs');
        } finally {
          setLoading(false);
        }
      };

      fetchProgramData();
    }
  }, [isEdit, id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================== PLO Management ====================
  const handleRemovePLO = (ploId) => {
    if (window.confirm('Bạn có chắc muốn xóa PLO này khỏi chương trình?')) {
      setFormData(prev => ({
        ...prev,
        plos: prev.plos.filter(plo => plo._id !== ploId)
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

    // Check for duplicate PLO code in current program
    const isDuplicate = formData.plos.some(plo => plo.code === newPLO.code);
    if (isDuplicate) {
      alert(`Mã PLO "${newPLO.code}" đã tồn tại trong chương trình này!`);
      return;
    }

    // Add PLO directly to formData (embedded, not saved to database yet)
    const ploWithId = {
      ...newPLO,
      _id: `temp_${Date.now()}` // Temporary ID for display
    };

    setFormData(prev => ({
      ...prev,
      plos: [...prev.plos, ploWithId]
    }));

    setShowCreatePLOModal(false);
    alert('Thêm PLO mới thành công! Nhấn "Cập nhật" để lưu.');
  };

  // ==================== Course Management ====================
  const handleAddCourse = () => {
    if (formData.plos.length === 0) {
      alert('Vui lòng thêm ít nhất 1 PLO trước khi thêm học phần!');
      return;
    }

    navigate(`/center-head/programs/${id}/courses/create`);
  };

  // ==================== Form Submission ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code || !formData.program_name || !formData.type || !formData.level) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setLoading(true);

    try {
      // Get userId from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id || user?.id;

      if (!userId && !isEdit) {
        alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!');
        setLoading(false);
        return;
      }

      const programData = {
        code: formData.code,
        program_name: formData.program_name,
        description: formData.description,
        type: formData.type,
        level: formData.level,
        band: formData.band,
        plos: formData.plos.map(plo => ({
          code: plo.code,
          name: plo.name,
          detail: plo.detail
        }))
      };

      // Add createdBy only when creating new program
      if (!isEdit) {
        programData.createdBy = userId;
      }

      if (isEdit) {
        await programService.updateProgram(id, programData);
        alert('Cập nhật chương trình thành công!');
        navigate('/center-head/programs');
      } else {
        const response = await programService.createProgram(programData);
        const newProgramId = response.data._id;

        // Ask user if they want to add courses
        const addCourse = window.confirm(
          'Tạo chương trình thành công!\n\nBạn có muốn thêm học phần vào chương trình này không?'
        );

        if (addCourse) {
          // Navigate to course wizard
          navigate(`/center-head/programs/${newProgramId}/courses/create`);
        } else {
          // Go back to program list
          navigate('/center-head/programs');
        }
        return;
      }
    } catch (error) {
      console.error('Error submitting program:', error);
      alert(error.message || 'Lỗi khi lưu chương trình!');
    } finally {
      setLoading(false);
    }
  };


  // Tabs configuration
  const tabs = [
    { id: 'info', label: 'Thông tin chung', icon: 'ph ph-info' },
    { id: 'plo', label: 'Program Learning Outcomes', icon: 'ph ph-target' },
    { id: 'courses', label: 'Các học phần', icon: 'ph ph-books' }
  ];

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
            {isEdit ? 'Quản lý thông tin chương trình và PLO' : 'Tạo chương trình mới với các PLO'}
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
        {activeTab === 'info' && (
        <Card>
          <h5 className="mb-16 fw-semibold">Thông tin cơ bản</h5>
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
              <h5 className="mb-2">Program Learning Outcomes (PLO)</h5>
              <p className="text-neutral-600 text-sm mb-0">
                Chuẩn đầu ra của chương trình
              </p>
            </div>
            <Button
              variant="primary"
              icon="ph ph-plus-circle"
              onClick={handleCreatePLO}
            >
              Tạo PLO mới
            </Button>
          </div>

          {formData.plos.length === 0 ? (
            <div className="text-center py-5 border border-neutral-200 radius-4">
              <i className="ph ph-target ph-3x text-neutral-400 mb-3"></i>
              <p className="text-neutral-600 mb-3">Chưa có PLO nào được thêm</p>
              <Button variant="primary" icon="ph ph-plus" onClick={handleCreatePLO}>
                Tạo PLO đầu tiên
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="border-bottom">
                  <tr>
                    <th className="px-16 py-12 fw-semibold text-neutral-700" style={{ width: '100px' }}>Mã PLO</th>
                    <th className="px-16 py-12 fw-semibold text-neutral-700">Tên PLO</th>
                    <th className="px-16 py-12 fw-semibold text-neutral-700">Chi tiết</th>
                    <th className="px-16 py-12 fw-semibold text-neutral-700 text-center" style={{ width: '100px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.plos.map((plo, index) => (
                    <tr key={plo._id || index}>
                      <td className="px-16 py-12">
                        <Badge variant="info">{plo.code}</Badge>
                      </td>
                      <td className="px-16 py-12 fw-semibold">{plo.name}</td>
                      <td className="px-16 py-12 text-neutral-600">{plo.detail}</td>
                      <td className="px-16 py-12 text-center">
                        <Button
                          variant="danger"
                          icon="ph ph-trash"
                          size="sm"
                          onClick={() => handleRemovePLO(plo._id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        )}

        {/* Tab 3: Courses Table */}
        {activeTab === 'courses' && (
          <>
          {!isEdit ? (
            <Card>
              <div className="text-center py-5">
                <i className="ph ph-info-circle ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600 mb-0">Vui lòng lưu chương trình trước để thêm học phần</p>
              </div>
            </Card>
          ) : (
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
              <div className="alert alert-warning mb-16">
                <i className="ph ph-warning-circle me-2"></i>
                Vui lòng thêm ít nhất 1 PLO trước khi thêm học phần!
              </div>
            )}

            {formData.courses.length === 0 ? (
              <div className="text-center py-5 border border-neutral-200 radius-4">
                <i className="ph ph-books ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600 mb-3">Chưa có học phần nào được thêm</p>
                {formData.plos.length > 0 && (
                  <Button variant="primary" icon="ph ph-plus" onClick={handleAddCourse}>
                    Thêm học phần đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="border-bottom">
                    <tr>
                      <th className="px-16 py-12 fw-semibold text-neutral-700" style={{ width: '120px' }}>Mã môn</th>
                      <th className="px-16 py-12 fw-semibold text-neutral-700">Tên học phần</th>
                      <th className="px-16 py-12 fw-semibold text-neutral-700" style={{ width: '150px' }}>Trạng thái</th>
                      <th className="px-16 py-12 fw-semibold text-neutral-700 text-center" style={{ width: '80px' }}>CLOs</th>
                      <th className="px-16 py-12 fw-semibold text-neutral-700 text-center" style={{ width: '80px' }}>Sessions</th>
                      <th className="px-16 py-12 fw-semibold text-neutral-700 text-center" style={{ width: '100px' }}>Materials</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.courses.map(course => (
                      <tr key={course._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/center-head/courses/${course._id}/details`)}>
                        <td className="px-16 py-12">
                          <Badge variant="primary">{course.courseCode}</Badge>
                        </td>
                        <td className="px-16 py-12">
                          <div className="fw-semibold">{course.name}</div>
                          <div className="text-neutral-600 text-sm">{course.description}</div>
                        </td>
                        <td className="px-16 py-12">
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
                        <td className="px-16 py-12 text-center">
                          <Badge variant="info">{course.clos?.length || 0}</Badge>
                        </td>
                        <td className="px-16 py-12 text-center">
                          <Badge variant="info">{course.sessions?.length || 0}</Badge>
                        </td>
                        <td className="px-16 py-12 text-center">
                          <Badge variant="info">{course.materials?.length || 0}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
          )}
          </>
        )}
      </form>

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
            Thêm PLO
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProgramFormNew;