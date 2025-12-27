import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getDecryptedCookie } from '../../../../utils/cookieUtils.js';
import Breadcrumb from '../../compo/Breadcrumb';
import Card from '../../compo/Card';
import Button from '../../compo/Button';
import Modal from '../../compo/Modal';
import Badge from '../../compo/Badge';
import ProgramSuccessModal from '../../compo/ProgramSuccessModal';
import programService from '../../../../services/programService';

/**
 * CenterHeadProgramForm - Form tạo/sửa Program riêng cho CenterHead
 * - Không sử dụng viewMode prop
 * - Hardcode basePath = '/center-head'
 * - Thuần CRUD, không có logic approval
 */
const CenterHeadProgramForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Base path cho CenterHead
  const basePath = '/center-head';

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
  const [showCreatePLOModal, setShowCreatePLOModal] = useState(false);
  const [bandMapping, setBandMapping] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdProgram, setCreatedProgram] = useState(null);

  // New PLO form
  const [newPLO, setNewPLO] = useState({
    code: '',
    name: '',
    detail: ''
  });

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Quản lý chương trình', path: `${basePath}/programs?tab=my-programs` },
    { label: isEdit ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới' }
  ];

  // Track if type was changed by user (not initial load)
  const [typeChangedByUser, setTypeChangedByUser] = useState(false);

  // Load band mapping when component mounts or type changes
  useEffect(() => {
    const fetchBandMapping = async () => {
      if (formData.type) {
        try {
          const response = await programService.getBandOptions(formData.type);
          const mapping = response.data?.bandOptions || response.data || {};
          setBandMapping(mapping);

          // Auto-fill band based on current level
          if (formData.level && mapping[formData.level] && (!isEdit || typeChangedByUser)) {
            setFormData(prev => ({
              ...prev,
              band: mapping[formData.level]
            }));
            if (typeChangedByUser) {
              setTypeChangedByUser(false);
            }
          }
        } catch (error) {
          console.error('Error loading band mapping:', error);
        }
      }
    };
    fetchBandMapping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

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
        } catch (error) {
          console.error('Error loading program:', error);
          toast.error('Không thể tải thông tin chương trình!', { position: 'top-right' });
          navigate(`${basePath}/programs?tab=my-programs`);
        } finally {
          setLoading(false);
        }
      };

      fetchProgramData();
    }
  }, [isEdit, id, navigate, basePath]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'level' && bandMapping[value]) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        band: bandMapping[value]
      }));
    } else if (name === 'type') {
      setTypeChangedByUser(true);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        band: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ==================== PLO Management ====================
  const handleRemovePLO = (ploId) => {
    setFormData(prev => ({
      ...prev,
      plos: prev.plos.filter(plo => plo._id !== ploId)
    }));
    toast.success('Đã xóa PLO khỏi chương trình', { position: 'top-right' });
  };

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
      toast.warning('Vui lòng điền đầy đủ thông tin PLO!', { position: 'top-right' });
      return;
    }

    const isDuplicate = formData.plos.some(plo => plo.code === newPLO.code);
    if (isDuplicate) {
      toast.error(`Mã PLO "${newPLO.code}" đã tồn tại trong chương trình này!`, { position: 'top-right' });
      return;
    }

    const ploWithId = {
      ...newPLO,
      _id: `temp_${Date.now()}`
    };

    setFormData(prev => ({
      ...prev,
      plos: [...prev.plos, ploWithId]
    }));

    setShowCreatePLOModal(false);
    toast.success('Thêm PLO mới thành công!', { position: 'top-right' });
  };

  // ==================== Form Submission ====================
  // Validate form data
  const validateForm = () => {
    if (!formData.code || !formData.program_name || !formData.type || !formData.level) {
      toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc!', { position: 'top-right' });
      return false;
    }
    return true;
  };

  // Lưu nháp - chỉ lưu với status draft
  const handleSaveDraft = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const user = JSON.parse(getDecryptedCookie('user'));
      const userId = user?._id || user?.id;

      if (!userId && !isEdit) {
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!', { position: 'top-right' });
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
        status: 'draft', // Luôn là draft khi lưu nháp
        plos: formData.plos.map(plo => ({
          code: plo.code,
          name: plo.name,
          detail: plo.detail
        }))
      };

      if (!isEdit) {
        programData.createdBy = userId;
      }

      if (isEdit) {
        await programService.updateProgram(id, programData);
        toast.success('Đã lưu nháp chương trình!', { position: 'top-right' });
      } else {
        const response = await programService.createProgram(programData);
        const newProgram = response.data;
        // Navigate to edit page for the new draft
        navigate(`${basePath}/programs/${newProgram._id}/edit`);
        toast.success('Đã tạo nháp chương trình!', { position: 'top-right' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error(error.message || 'Lỗi khi lưu nháp!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // Hoàn thành - lưu và tự động approve (CenterHead có toàn quyền)
  // Nếu đang edit: dùng completeProgram API để approve cả program và courses
  // Nếu đang tạo mới: tạo program với status approved
  const handleComplete = async (e) => {
    e?.preventDefault();

    if (!validateForm()) return;

    // Khi hoàn thành, bắt buộc phải có ít nhất 1 PLO
    if (formData.plos.length === 0) {
      toast.warning('Chương trình cần có ít nhất 1 PLO để hoàn thành!', { position: 'top-right' });
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(getDecryptedCookie('user'));
      const userId = user?._id || user?.id;

      if (!userId && !isEdit) {
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!', { position: 'top-right' });
        setLoading(false);
        return;
      }

      let resultProgram;

      if (isEdit) {
        // Đang edit program draft - lưu thông tin trước, sau đó gọi completeProgram
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

        // Lưu thông tin program trước
        await programService.updateProgram(id, programData);

        // Sau đó gọi completeProgram để approve program và tất cả courses
        const completeResponse = await programService.completeProgram(id);
        resultProgram = completeResponse.data?.program || { ...programData, _id: id };

        const coursesUpdated = completeResponse.data?.coursesUpdated || 0;
        let successMessage = 'Hoàn thành chương trình thành công!';
        if (coursesUpdated > 0) {
          successMessage += ` Đã kích hoạt ${coursesUpdated} khóa học.`;
        }
        toast.success(successMessage, { position: 'top-right', autoClose: 5000 });
      } else {
        // Tạo mới program với status approved
        const programData = {
          code: formData.code,
          program_name: formData.program_name,
          description: formData.description,
          type: formData.type,
          level: formData.level,
          band: formData.band,
          status: 'approved',
          isActive: true,
          createdBy: userId,
          plos: formData.plos.map(plo => ({
            code: plo.code,
            name: plo.name,
            detail: plo.detail
          }))
        };

        const response = await programService.createProgram(programData);
        resultProgram = response.data;
      }

      setCreatedProgram(resultProgram);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error completing program:', error);
      toast.error(error.message || 'Lỗi khi hoàn thành chương trình!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  // Success Modal handlers
  const handleCreateCourse = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/programs/${createdProgram._id}/courses/create`);
  };

  const handleViewDetail = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/programs/${createdProgram._id}`);
  };

  const handleGoToList = () => {
    setShowSuccessModal(false);
    navigate(`${basePath}/programs?tab=my-programs`);
  };

  return (
    <div className="program-form-container">
      <ToastContainer />

      <ProgramSuccessModal
        show={showSuccessModal}
        programData={createdProgram}
        isEdit={isEdit}
        onCreateCourse={handleCreateCourse}
        onViewDetail={handleViewDetail}
        onGoToList={handleGoToList}
      />

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
            onClick={() => navigate(`${basePath}/programs?tab=my-programs`)}
          >
            Hủy
          </Button>
          <Button
            variant="secondary"
            icon="ph ph-floppy-disk"
            onClick={handleSaveDraft}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button
            variant="success"
            icon="ph ph-check-circle"
            onClick={handleComplete}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Hoàn thành'}
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        {/* Section 1: Thông tin cơ bản */}
        <Card className="mb-24">
          <h5 className="mb-16 fw-semibold">
            <i className="ph ph-info me-2"></i>
            Thông tin cơ bản
          </h5>
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
              <div className="position-relative">
                <input
                  type="text"
                  name="band"
                  className="form-control bg-light"
                  placeholder="Tự động điền theo level"
                  value={formData.band}
                  onChange={handleInputChange}
                  readOnly
                />
                {formData.band && (
                  <span
                    className={`position-absolute top-50 end-0 translate-middle-y me-3 badge ${
                      formData.type === 'ielts' ? 'bg-danger' :
                      formData.type === 'toeic' ? 'bg-primary' :
                      'bg-success'
                    }`}
                  >
                    {formData.type?.toUpperCase()}
                  </span>
                )}
              </div>
              <small className="text-muted">
                <i className="ph ph-info me-1"></i>
                Tự động ánh xạ theo Type và Level
              </small>
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

        {/* Section 2: PLO Management */}
        <Card className="mb-24">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="mb-2">
                <i className="ph ph-target me-2"></i>
                Program Learning Outcomes (PLO) <span className="text-danger">*</span>
              </h5>
              <p className="text-neutral-600 text-sm mb-0">
                Chuẩn đầu ra của chương trình (ít nhất 1 PLO)
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

export default CenterHeadProgramForm;
