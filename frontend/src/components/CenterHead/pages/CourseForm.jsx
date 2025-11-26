import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import Modal from '../compo/Modal';
import Tabs from '../compo/Tabs';
import Badge from '../compo/Badge';

const CourseFormNew = () => {
  const navigate = useNavigate();
  const { programId, courseId } = useParams();
  const isEdit = Boolean(courseId);
  const [activeTab, setActiveTab] = useState('info');

  // Program data (PLOs từ Program)
  const [program, setProgram] = useState(null);
  const [loadingProgram, setLoadingProgram] = useState(true);

  // Form state - CẬP NHẬT với các trường mới từ courseModel
  const [formData, setFormData] = useState({
    subjectCode: '',          // ← MỚI
    name: '',
    description: '',
    timeAllocation: '',       // ← MỚI
    preRequisite: 'None',     // ← MỚI
    studentTasks: '',         // ← MỚI
    program: programId,
    status: 'draft',
    clos: [],
    sessions: [],
    materials: [],            // ← CẬP NHẬT: Array of objects
    mocktestSessionOrders: []
  });

  // Material Form - CẬP NHẬT structure
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingMaterialIndex, setEditingMaterialIndex] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    description: '',
    author: '',
    publisher: '',
    publishedDate: '',
    url: '',
    note: ''
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
    learningType: 'theory',
    clos: []
  });

  // Tabs configuration
  const tabs = [
    { id: 'info', label: 'Thông tin cơ bản', icon: 'ph ph-info' },
    { id: 'materials', label: 'Tài liệu học tập', icon: 'ph ph-book-open' },
    { id: 'clo', label: 'CLO & Mapping PLO', icon: 'ph ph-target' },
    { id: 'sessions', label: 'Kế hoạch giảng dạy', icon: 'ph ph-calendar' }
  ];

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý chương trình', path: '/center-head/programs' },
    { label: 'Chi tiết chương trình', path: `/center-head/programs/${programId}/edit` },
    { label: isEdit ? 'Chỉnh sửa học phần' : 'Tạo học phần mới' }
  ];

  // Load program data để lấy PLOs
  useEffect(() => {
    const fetchProgramData = async () => {
      setLoadingProgram(true);

      try {
        // TODO: Replace with actual API call (TẠM THỜI NGẮT)
        // Mock data
        const mockProgram = {
          _id: programId,
          code: 'IELTS-B2',
          program_name: 'IELTS Intermediate Program',
          type: 'ielts',
          level: 'B2',
          plos: [
            { _id: 'plo1', code: 'PLO1', name: 'Listening Skills', detail: 'Hiểu và phản ứng với các đoạn hội thoại' },
            { _id: 'plo2', code: 'PLO2', name: 'Reading Comprehension', detail: 'Đọc hiểu các văn bản học thuật' },
            { _id: 'plo3', code: 'PLO3', name: 'Writing Skills', detail: 'Viết các bài luận và báo cáo' },
            { _id: 'plo4', code: 'PLO4', name: 'Speaking Fluency', detail: 'Giao tiếp lưu loát bằng tiếng Anh' },
          ]
        };

        setProgram(mockProgram);
      } catch (error) {
        console.error('Error loading program:', error);
        alert('Không thể tải thông tin Program!');
        navigate('/center-head/programs');
      } finally {
        setLoadingProgram(false);
      }
    };

    fetchProgramData();
  }, [programId, navigate]);

  // Load course data if editing
  useEffect(() => {
    if (isEdit && !loadingProgram) {
      // TODO: Load course data (TẠM THỜI NGẮT)
      // Mock data for editing
      setFormData({
        subjectCode: 'IELTS-B2-RW',
        name: 'IELTS Reading & Writing',
        description: 'Khóa học tập trung vào kỹ năng Reading và Writing cho kỳ thi IELTS',
        timeAllocation: 'Total 120 hours: 40h class + 1h final exam + 79h self-study',
        preRequisite: 'Hoàn thành IELTS 5.0 hoặc tương đương',
        studentTasks: '- Tham gia ít nhất 80% buổi học\n- Hoàn thành 10 bài tập Writing\n- Làm 15 bài Reading practice\n- Tham gia mock test',
        program: programId,
        status: 'draft',
        clos: [
          {
            code: 'CLO1',
            name: 'Reading Strategies',
            detail: 'Áp dụng các chiến lược đọc hiệu quả cho IELTS Reading',
            mappedPLOs: ['plo2']
          },
          {
            code: 'CLO2',
            name: 'Writing Task 1',
            detail: 'Viết Writing Task 1 đạt band 6.0+',
            mappedPLOs: ['plo3']
          },
          {
            code: 'CLO3',
            name: 'Writing Task 2',
            detail: 'Viết Writing Task 2 đạt band 6.0+',
            mappedPLOs: ['plo3']
          }
        ],
        sessions: [
          {
            title: 'Introduction to IELTS Reading',
            order: 1,
            content: 'Tổng quan về IELTS Reading, các dạng câu hỏi, chiến lược làm bài',
            learningType: 'theory',
            clos: ['CLO1']
          },
          {
            title: 'Reading Practice: True/False/Not Given',
            order: 2,
            content: 'Luyện tập dạng câu hỏi True/False/Not Given với 5 bài tập',
            learningType: 'practice',
            clos: ['CLO1']
          },
          {
            title: 'Writing Task 1: Line Graph & Bar Chart',
            order: 3,
            content: 'Cách viết mô tả biểu đồ Line Graph và Bar Chart',
            learningType: 'theory',
            clos: ['CLO2']
          }
        ],
        materials: [
          {
            description: 'Cambridge IELTS 18',
            author: 'Cambridge University Press',
            publisher: 'Cambridge',
            publishedDate: '2023',
            url: '',
            note: 'Sách chính, bắt buộc'
          },
          {
            description: 'IELTS Writing Task 1 & 2 Guide',
            author: 'Simon',
            publisher: 'Online',
            publishedDate: '2022',
            url: 'https://ielts-simon.com',
            note: 'Tài liệu tham khảo online'
          },
          {
            description: 'Complete IELTS Bands 5-6.5',
            author: 'Guy Brook-Hart, Vanessa Jakeman',
            publisher: 'Cambridge University Press',
            publishedDate: '2013',
            url: '',
            note: 'Sách tham khảo'
          }
        ],
        mocktestSessionOrders: [5, 10]
      });
    }
  }, [isEdit, courseId, programId, loadingProgram]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ==================== MATERIAL MANAGEMENT ====================
  const handleAddMaterial = () => {
    setEditingMaterialIndex(null);
    setMaterialForm({
      description: '',
      author: '',
      publisher: '',
      publishedDate: '',
      url: '',
      note: ''
    });
    setShowMaterialModal(true);
  };

  const handleEditMaterial = (index) => {
    setEditingMaterialIndex(index);
    setMaterialForm({ ...formData.materials[index] });
    setShowMaterialModal(true);
  };

  const handleMaterialFormChange = (e) => {
    const { name, value } = e.target;
    setMaterialForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveMaterial = () => {
    if (!materialForm.description) {
      alert('Vui lòng nhập tên/mô tả tài liệu!');
      return;
    }

    const materials = [...formData.materials];
    if (editingMaterialIndex !== null) {
      materials[editingMaterialIndex] = materialForm;
    } else {
      materials.push(materialForm);
    }

    setFormData(prev => ({ ...prev, materials }));
    setShowMaterialModal(false);
  };

  const handleDeleteMaterial = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      setFormData(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  // ==================== CLO MANAGEMENT ====================
  const handleAddCLO = () => {
    setEditingCLOIndex(null);
    setCloForm({
      code: '',
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

  const handleCLOFormChange = (e) => {
    const { name, value } = e.target;
    setCloForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePLOCheckbox = (ploId) => {
    setCloForm(prev => {
      const mappedPLOs = prev.mappedPLOs.includes(ploId)
        ? prev.mappedPLOs.filter(id => id !== ploId)
        : [...prev.mappedPLOs, ploId];
      return { ...prev, mappedPLOs };
    });
  };

  const handleSaveCLO = () => {
    if (!cloForm.code || !cloForm.name || !cloForm.detail) {
      alert('Vui lòng điền đầy đủ thông tin CLO!');
      return;
    }

    if (cloForm.mappedPLOs.length === 0) {
      alert('CLO phải mapping với ít nhất 1 PLO!');
      return;
    }

    const clos = [...formData.clos];
    if (editingCLOIndex !== null) {
      clos[editingCLOIndex] = cloForm;
    } else {
      clos.push(cloForm);
    }

    setFormData(prev => ({ ...prev, clos }));
    setShowCLOModal(false);
  };

  const handleDeleteCLO = (index) => {
    const cloCode = formData.clos[index].code;
    const sessionsUsingCLO = formData.sessions.filter(s =>
      s.clos.includes(cloCode)
    );

    if (sessionsUsingCLO.length > 0) {
      alert(`Không thể xóa CLO này vì đang được sử dụng trong ${sessionsUsingCLO.length} session(s)!`);
      return;
    }

    if (window.confirm('Bạn có chắc muốn xóa CLO này?')) {
      setFormData(prev => ({
        ...prev,
        clos: prev.clos.filter((_, i) => i !== index)
      }));
    }
  };

  // ==================== SESSION MANAGEMENT ====================
  const handleAddSession = () => {
    if (formData.clos.length === 0) {
      alert('Vui lòng tạo ít nhất 1 CLO trước khi tạo Session!');
      setActiveTab('clo');
      return;
    }

    setEditingSessionIndex(null);
    setSessionForm({
      title: '',
      order: formData.sessions.length + 1,
      content: '',
      learningType: 'theory',
      clos: []
    });
    setShowSessionModal(true);
  };

  const handleEditSession = (index) => {
    setEditingSessionIndex(index);
    setSessionForm({ ...formData.sessions[index] });
    setShowSessionModal(true);
  };

  const handleSessionFormChange = (e) => {
    const { name, value } = e.target;
    setSessionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSessionCLOCheckbox = (cloCode) => {
    setSessionForm(prev => {
      const clos = prev.clos.includes(cloCode)
        ? prev.clos.filter(c => c !== cloCode)
        : [...prev.clos, cloCode];
      return { ...prev, clos };
    });
  };

  const handleSaveSession = () => {
    if (!sessionForm.title || !sessionForm.content) {
      alert('Vui lòng điền đầy đủ thông tin Session!');
      return;
    }

    if (sessionForm.clos.length === 0) {
      alert('Session phải gán ít nhất 1 CLO!');
      return;
    }

    const sessions = [...formData.sessions];
    if (editingSessionIndex !== null) {
      sessions[editingSessionIndex] = sessionForm;
    } else {
      sessions.push(sessionForm);
    }

    setFormData(prev => ({ ...prev, sessions }));
    setShowSessionModal(false);
  };

  const handleDeleteSession = (index) => {
    if (window.confirm('Bạn có chắc muốn xóa Session này?')) {
      setFormData(prev => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index)
      }));
    }
  };

  // ==================== FORM SUBMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subjectCode || !formData.name) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    // TODO: API Call (TẠM THỜI NGẮT)
    console.log('Submitting course:', formData);
    alert(isEdit ? 'Cập nhật học phần thành công!' : 'Tạo học phần thành công!');
    navigate(`/center-head/programs/${programId}/edit`);
  };

  // Get PLO by ID
  const getPLOById = (ploId) => {
    if (!program) return { code: 'N/A', name: 'Unknown' };
    return program.plos.find(p => p._id === ploId) || { code: 'N/A', name: 'Unknown' };
  };

  // CLO-PLO Matrix
  const renderCLOPLOMatrix = () => {
    if (!program || formData.clos.length === 0) return null;

    return (
      <div className="mt-4">
        <h6 className="mb-3">Ma trận CLO-PLO</h6>
        <div className="table-responsive">
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th>CLO / PLO</th>
                {program.plos.map(plo => (
                  <th key={plo._id} className="text-center">{plo.code}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formData.clos.map((clo, index) => (
                <tr key={index}>
                  <td><strong>{clo.code}</strong></td>
                  {program.plos.map(plo => (
                    <td key={plo._id} className="text-center">
                      {clo.mappedPLOs.includes(plo._id) && (
                        <i className="ph ph-check-circle text-success"></i>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loadingProgram) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-5">
        <i className="ph ph-warning-circle ph-3x text-warning mb-3"></i>
        <p>Không tìm thấy thông tin chương trình!</p>
        <Button onClick={() => navigate('/center-head/programs')}>
          Quay lại danh sách
        </Button>
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
            {isEdit ? 'Chỉnh sửa học phần' : 'Tạo học phần mới'}
          </h4>
          <p className="text-neutral-600 mb-0">
            Chương trình: <strong>{program.code} - {program.program_name}</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-x-circle"
            onClick={() => navigate(`/center-head/programs/${programId}/edit`)}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            icon="ph ph-check-circle"
            onClick={handleSubmit}
          >
            Lưu học phần
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
              <div className="col-md-4">
                <label className="form-label fw-semibold text-neutral-900">
                  Mã môn học <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="subjectCode"
                  className="form-control"
                  placeholder="VD: IELTS-B2-RW"
                  value={formData.subjectCode}
                  onChange={handleInputChange}
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="col-md-8">
                <label className="form-label fw-semibold text-neutral-900">
                  Tên học phần <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="VD: IELTS Reading & Writing"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-neutral-900">
                  Yêu cầu tiên quyết
                </label>
                <input
                  type="text"
                  name="preRequisite"
                  className="form-control"
                  placeholder="VD: Hoàn thành IELTS 5.0 hoặc tương đương"
                  value={formData.preRequisite}
                  onChange={handleInputChange}
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
                  Phân bổ thời gian
                </label>
                <input
                  type="text"
                  name="timeAllocation"
                  className="form-control"
                  placeholder="VD: Total 120 hours: 40h class + 1h final exam + 79h self-study"
                  value={formData.timeAllocation}
                  onChange={handleInputChange}
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
                  placeholder="Mô tả chi tiết về học phần..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold text-neutral-900">
                  Nhiệm vụ sinh viên
                </label>
                <textarea
                  name="studentTasks"
                  className="form-control"
                  rows="5"
                  placeholder={'- Tham gia ít nhất 80% buổi học\n- Hoàn thành bài tập sau mỗi buổi học\n- ...'}
                  value={formData.studentTasks}
                  onChange={handleInputChange}
                />
                <small className="text-muted">Các nhiệm vụ mà sinh viên cần hoàn thành trong khóa học</small>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 2: Materials */}
        {activeTab === 'materials' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Tài liệu học tập</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Sách giáo khoa và tài liệu tham khảo
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddMaterial}
              >
                Thêm tài liệu
              </Button>
            </div>

            {formData.materials.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-book-open ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có tài liệu nào được thêm</p>
                <Button variant="primary" icon="ph ph-plus" onClick={handleAddMaterial}>
                  Thêm tài liệu đầu tiên
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tên/Mô tả</th>
                      <th style={{ width: '200px' }}>Tác giả</th>
                      <th style={{ width: '150px' }}>Nhà xuất bản</th>
                      <th style={{ width: '100px' }}>Năm</th>
                      <th style={{ width: '200px' }}>Ghi chú</th>
                      <th style={{ width: '120px' }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.materials.map((material, index) => (
                      <tr key={index}>
                        <td>
                          <div className="fw-semibold">{material.description}</div>
                          {material.url && (
                            <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary">
                              <i className="ph ph-link me-1"></i>
                              Link
                            </a>
                          )}
                        </td>
                        <td>{material.author || '-'}</td>
                        <td>{material.publisher || '-'}</td>
                        <td>{material.publishedDate || '-'}</td>
                        <td className="text-sm">{material.note || '-'}</td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              variant="ghost"
                              icon="ph ph-pencil"
                              size="sm"
                              onClick={() => handleEditMaterial(index)}
                            />
                            <Button
                              variant="ghost"
                              icon="ph ph-trash"
                              size="sm"
                              onClick={() => handleDeleteMaterial(index)}
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

        {/* Tab 3: CLO & Mapping PLO */}
        {activeTab === 'clo' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Course Learning Outcomes (CLO)</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Chuẩn đầu ra của học phần và ánh xạ với PLO
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddCLO}
              >
                Thêm CLO
              </Button>
            </div>

            {formData.clos.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-target ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có CLO nào được thêm</p>
                <Button variant="primary" icon="ph ph-plus" onClick={handleAddCLO}>
                  Thêm CLO đầu tiên
                </Button>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Mã CLO</th>
                        <th>Tên CLO</th>
                        <th>Chi tiết</th>
                        <th style={{ width: '200px' }}>Mapped PLOs</th>
                        <th style={{ width: '120px' }} className="text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.clos.map((clo, index) => (
                        <tr key={index}>
                          <td>
                            <Badge variant="primary">{clo.code}</Badge>
                          </td>
                          <td className="fw-semibold">{clo.name}</td>
                          <td className="text-neutral-600">{clo.detail}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {clo.mappedPLOs.map(ploId => {
                                const plo = getPLOById(ploId);
                                return (
                                  <Badge key={ploId} variant="info" size="sm">
                                    {plo.code}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                variant="ghost"
                                icon="ph ph-pencil"
                                size="sm"
                                onClick={() => handleEditCLO(index)}
                              />
                              <Button
                                variant="ghost"
                                icon="ph ph-trash"
                                size="sm"
                                onClick={() => handleDeleteCLO(index)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderCLOPLOMatrix()}
              </>
            )}
          </Card>
        )}

        {/* Tab 4: Sessions */}
        {activeTab === 'sessions' && (
          <Card>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="mb-2">Kế hoạch giảng dạy (Sessions)</h5>
                <p className="text-neutral-600 text-sm mb-0">
                  Các buổi học và gán CLO cho từng buổi
                </p>
              </div>
              <Button
                variant="primary"
                icon="ph ph-plus"
                onClick={handleAddSession}
                disabled={formData.clos.length === 0}
              >
                Thêm Session
              </Button>
            </div>

            {formData.clos.length === 0 && (
              <div className="alert alert-warning">
                <i className="ph ph-warning-circle me-2"></i>
                Vui lòng tạo ít nhất 1 CLO trước khi tạo Session!
              </div>
            )}

            {formData.sessions.length === 0 ? (
              <div className="text-center py-5">
                <i className="ph ph-calendar ph-3x text-neutral-400 mb-3"></i>
                <p className="text-neutral-600">Chưa có session nào được thêm</p>
                {formData.clos.length > 0 && (
                  <Button variant="primary" icon="ph ph-plus" onClick={handleAddSession}>
                    Thêm session đầu tiên
                  </Button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Order</th>
                      <th>Tiêu đề</th>
                      <th>Nội dung</th>
                      <th style={{ width: '150px' }}>Loại hình</th>
                      <th style={{ width: '150px' }}>CLOs</th>
                      <th style={{ width: '120px' }} className="text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.sessions
                      .sort((a, b) => a.order - b.order)
                      .map((session, index) => (
                        <tr key={index}>
                          <td className="text-center">
                            <Badge variant="secondary">{session.order}</Badge>
                          </td>
                          <td className="fw-semibold">{session.title}</td>
                          <td className="text-neutral-600">{session.content}</td>
                          <td>
                            <Badge
                              variant={
                                session.learningType === 'theory' ? 'info' :
                                session.learningType === 'practice' ? 'success' :
                                'warning'
                              }
                            >
                              {session.learningType}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {session.clos.map(cloCode => (
                                <Badge key={cloCode} variant="primary" size="sm">
                                  {cloCode}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                variant="ghost"
                                icon="ph ph-pencil"
                                size="sm"
                                onClick={() => handleEditSession(index)}
                              />
                              <Button
                                variant="ghost"
                                icon="ph ph-trash"
                                size="sm"
                                onClick={() => handleDeleteSession(index)}
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

      {/* Modal: Material Form */}
      <Modal
        show={showMaterialModal}
        onClose={() => setShowMaterialModal(false)}
        title={editingMaterialIndex !== null ? 'Chỉnh sửa tài liệu' : 'Thêm tài liệu mới'}
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">
                Tên/Mô tả tài liệu <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="description"
                className="form-control"
                placeholder="VD: Cambridge IELTS 18"
                value={materialForm.description}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Tác giả</label>
              <input
                type="text"
                name="author"
                className="form-control"
                placeholder="VD: Cambridge University Press"
                value={materialForm.author}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Nhà xuất bản</label>
              <input
                type="text"
                name="publisher"
                className="form-control"
                placeholder="VD: Cambridge"
                value={materialForm.publisher}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Năm xuất bản</label>
              <input
                type="text"
                name="publishedDate"
                className="form-control"
                placeholder="VD: 2023"
                value={materialForm.publishedDate}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">URL (nếu có)</label>
              <input
                type="url"
                name="url"
                className="form-control"
                placeholder="https://..."
                value={materialForm.url}
                onChange={handleMaterialFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Ghi chú</label>
              <textarea
                name="note"
                className="form-control"
                rows="3"
                placeholder="VD: Sách chính, bắt buộc"
                value={materialForm.note}
                onChange={handleMaterialFormChange}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowMaterialModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveMaterial}>
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal: CLO Form */}
      <Modal
        show={showCLOModal}
        onClose={() => setShowCLOModal(false)}
        title={editingCLOIndex !== null ? 'Chỉnh sửa CLO' : 'Thêm CLO mới'}
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Mã CLO <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="VD: CLO1"
                value={cloForm.code}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-md-8">
              <label className="form-label fw-semibold">
                Tên CLO <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="VD: Reading Strategies"
                value={cloForm.name}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Chi tiết <span className="text-danger">*</span>
              </label>
              <textarea
                name="detail"
                className="form-control"
                rows="3"
                placeholder="Mô tả chi tiết về CLO..."
                value={cloForm.detail}
                onChange={handleCLOFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Mapping PLO <span className="text-danger">*</span>
              </label>
              <div className="border rounded p-3">
                {program.plos.map(plo => (
                  <div key={plo._id} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`plo-${plo._id}`}
                      checked={cloForm.mappedPLOs.includes(plo._id)}
                      onChange={() => handlePLOCheckbox(plo._id)}
                    />
                    <label className="form-check-label" htmlFor={`plo-${plo._id}`}>
                      <Badge variant="info" className="me-2">{plo.code}</Badge>
                      <span className="fw-semibold">{plo.name}</span>
                      <div className="text-sm text-neutral-600">{plo.detail}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowCLOModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveCLO}>
            Lưu
          </Button>
        </div>
      </Modal>

      {/* Modal: Session Form */}
      <Modal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        title={editingSessionIndex !== null ? 'Chỉnh sửa Session' : 'Thêm Session mới'}
        size="lg"
      >
        <div className="modal-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Order</label>
              <input
                type="number"
                name="order"
                className="form-control"
                min="1"
                value={sessionForm.order}
                onChange={handleSessionFormChange}
              />
            </div>

            <div className="col-md-9">
              <label className="form-label fw-semibold">
                Tiêu đề <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="VD: Introduction to IELTS Reading"
                value={sessionForm.title}
                onChange={handleSessionFormChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Loại hình học tập</label>
              <select
                name="learningType"
                className="form-select"
                value={sessionForm.learningType}
                onChange={handleSessionFormChange}
              >
                <option value="theory">Theory (Lý thuyết)</option>
                <option value="practice">Practice (Thực hành)</option>
                <option value="lab">Lab (Thí nghiệm)</option>
                <option value="project">Project (Dự án)</option>
                <option value="exam">Exam (Kiểm tra)</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Nội dung <span className="text-danger">*</span>
              </label>
              <textarea
                name="content"
                className="form-control"
                rows="4"
                placeholder="Mô tả nội dung buổi học..."
                value={sessionForm.content}
                onChange={handleSessionFormChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Gán CLO <span className="text-danger">*</span>
              </label>
              <div className="border rounded p-3">
                {formData.clos.map((clo, index) => (
                  <div key={index} className="form-check mb-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`session-clo-${clo.code}`}
                      checked={sessionForm.clos.includes(clo.code)}
                      onChange={() => handleSessionCLOCheckbox(clo.code)}
                    />
                    <label className="form-check-label" htmlFor={`session-clo-${clo.code}`}>
                      <Badge variant="primary" className="me-2">{clo.code}</Badge>
                      <span className="fw-semibold">{clo.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={() => setShowSessionModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveSession}>
            Lưu
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseFormNew;
