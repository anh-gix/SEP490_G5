import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '../compo/Button';
import { workRequestService } from '../../../services/workRequestService';
import { userService } from '../../../services/userService';
import { courseService } from '../../../services/courseService';
import { getDecryptedCookie } from '../../../utils/cookieUtils.js';

const CreateWorkRequestModal = ({ show, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    assignedTo: '',
    requestNote: '',
    attachmentFile: null,

    // For create_program
    programName: '',
    programCode: '',
    programDescription: '',

    // For edit_course
    courseId: '',
    courseChangeDetails: '',

    // For create_exam
    examTitle: '',
    examLevel: '',
    examDescription: '',

    // For assign_students
    inputFile: null
  });

  // Data from API
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (show) {
      fetchUsers();
      if (requestType === 'edit_course') {
        fetchCourses();
      }
    }
  }, [show, requestType]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userService.getUsersByRoles(['Subject Leader', 'Academic Staff']);
      
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể lấy danh sách nhân viên: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getCourses({ status: 'completed' });
      
      if (response.success) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Không thể lấy danh sách khóa học: ' + (error.message || 'Unknown error'));
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleRequestTypeChange = (type) => {
    setRequestType(type);
    // Reset form data when changing type
    setFormData({
      assignedTo: '',
      requestNote: '',
      attachmentFile: null,
      programName: '',
      programCode: '',
      programDescription: '',
      courseId: '',
      courseChangeDetails: '',
      examTitle: '',
      examLevel: '',
      examDescription: '',
      inputFile: null
    });
  };

  const validateForm = () => {
    if (!requestType) {
      toast.warning('Vui lòng chọn loại yêu cầu');
      return false;
    }

    if (!formData.assignedTo) {
      toast.warning('Vui lòng chọn người được giao việc');
      return false;
    }

    switch (requestType) {
      case 'create_program':
        if (!formData.programName || !formData.programCode) {
          toast.warning('Vui lòng nhập tên và mã chương trình');
          return false;
        }
        break;

      case 'edit_course':
        if (!formData.courseId || !formData.courseChangeDetails) {
          toast.warning('Vui lòng chọn khóa học và mô tả thay đổi');
          return false;
        }
        break;

      case 'create_exam':
        if (!formData.examTitle || !formData.examLevel) {
          toast.warning('Vui lòng nhập tiêu đề và cấp độ đề thi');
          return false;
        }
        break;

      case 'assign_students':
        if (!formData.inputFile) {
          toast.warning('Vui lòng upload file Excel danh sách học viên');
          return false;
        }
        break;

      default:
        return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Get current user (Center Head)
      const currentUser = JSON.parse(getDecryptedCookie('user') || '{}');
      if (!currentUser._id) {
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setLoading(false);
        return;
      }

      // Prepare form data for multipart/form-data
      const submitData = new FormData();
      submitData.append('requestType', requestType);
      submitData.append('assignedTo', formData.assignedTo);
      submitData.append('requestedBy', currentUser._id);
      submitData.append('direction', 'top_down');

      if (formData.requestNote) {
        submitData.append('requestNote', formData.requestNote);
      }

      // Add attachment file if exists
      if (formData.attachmentFile) {
        submitData.append('attachmentFile', formData.attachmentFile);
      }

      // Add type-specific fields
      switch (requestType) {
        case 'create_program':
          submitData.append('programName', formData.programName);
          submitData.append('programCode', formData.programCode);
          if (formData.programDescription) {
            submitData.append('programDescription', formData.programDescription);
          }
          break;

        case 'edit_course':
          submitData.append('entityType', 'Course');
          submitData.append('entityId', formData.courseId);
          submitData.append('changeDetails', JSON.stringify({
            description: formData.courseChangeDetails
          }));
          break;

        case 'create_exam':
          submitData.append('examTitle', formData.examTitle);
          submitData.append('examLevel', formData.examLevel);
          if (formData.examDescription) {
            submitData.append('examDescription', formData.examDescription);
          }
          break;

        case 'assign_students':
          if (formData.inputFile) {
            submitData.append('inputFile', formData.inputFile);
          }
          break;
      }

      // Debug: Log FormData contents
      console.log('📤 Sending FormData with:');
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      // Call API to create work request
      const response = await workRequestService.createRequest(submitData);

      if (response.success) {
        toast.success('Tạo yêu cầu thành công!');
        onSuccess();
        handleClose();
      } else {
        toast.error(response.message || 'Có lỗi xảy ra khi tạo yêu cầu');
      }
    } catch (error) {
      console.error('Error creating work request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRequestType('');
    setFormData({
      assignedTo: '',
      requestNote: '',
      attachmentFile: null,
      programName: '',
      programCode: '',
      programDescription: '',
      courseId: '',
      courseChangeDetails: '',
      examTitle: '',
      examLevel: '',
      examDescription: '',
      inputFile: null
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="ph ph-plus-circle me-2"></i>
              Tạo yêu cầu mới
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Select Request Type */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  1. Chọn loại yêu cầu <span className="text-danger">*</span>
                </label>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div
                      className={`card request-type-card ${requestType === 'create_program' ? 'selected' : ''}`}
                      onClick={() => handleRequestTypeChange('create_program')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <i className="ph ph-folder-plus text-primary" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Tạo chương trình mới</h6>
                        <small className="text-muted">Yêu cầu Subject Leader tạo program</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`card request-type-card ${requestType === 'edit_course' ? 'selected' : ''}`}
                      onClick={() => handleRequestTypeChange('edit_course')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <i className="ph ph-pencil-simple text-warning" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Chỉnh sửa khóa học</h6>
                        <small className="text-muted">Yêu cầu Subject Leader sửa course</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`card request-type-card ${requestType === 'create_exam' ? 'selected' : ''}`}
                      onClick={() => handleRequestTypeChange('create_exam')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <i className="ph ph-exam text-success" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Tạo đề thi mới</h6>
                        <small className="text-muted">Yêu cầu Subject Leader tạo exam</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div
                      className={`card request-type-card ${requestType === 'assign_students' ? 'selected' : ''}`}
                      onClick={() => handleRequestTypeChange('assign_students')}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="card-body text-center p-3">
                        <i className="ph ph-users-three text-info" style={{ fontSize: '2rem' }}></i>
                        <h6 className="mt-2 mb-0">Sắp xếp học viên</h6>
                        <small className="text-muted">Yêu cầu Academic Staff xếp lớp</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Request Details (Show only when type is selected) */}
              {requestType && (
                <>
                  <hr className="my-4" />

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      2. Thông tin chi tiết
                    </label>

                    {/* Create Program Form */}
                    {requestType === 'create_program' && (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">
                            Tên chương trình <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: IELTS Foundation"
                            value={formData.programName}
                            onChange={(e) => handleInputChange('programName', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Mã chương trình <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: IELTS-F1"
                            value={formData.programCode}
                            onChange={(e) => handleInputChange('programCode', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label">Mô tả (Tùy chọn)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Mô tả về chương trình..."
                            value={formData.programDescription}
                            onChange={(e) => handleInputChange('programDescription', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Edit Course Form */}
                    {requestType === 'edit_course' && (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">
                            Chọn khóa học <span className="text-danger">*</span>
                          </label>
                          {loadingCourses ? (
                            <div className="text-center py-2">
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            </div>
                          ) : (
                            <select
                              className="form-select"
                              value={formData.courseId}
                              onChange={(e) => handleInputChange('courseId', e.target.value)}
                              disabled={loading}
                            >
                              <option value="">-- Chọn khóa học --</option>
                              {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                  {course.code} - {course.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="col-12">
                          <label className="form-label">
                            Mô tả yêu cầu thay đổi <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Mô tả chi tiết những thay đổi cần thực hiện..."
                            value={formData.courseChangeDetails}
                            onChange={(e) => handleInputChange('courseChangeDetails', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Create Exam Form */}
                    {requestType === 'create_exam' && (
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label">
                            Tiêu đề đề thi <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ví dụ: IELTS Reading Practice Test 1"
                            value={formData.examTitle}
                            onChange={(e) => handleInputChange('examTitle', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">
                            Cấp độ <span className="text-danger">*</span>
                          </label>
                          <select
                            className="form-select"
                            value={formData.examLevel}
                            onChange={(e) => handleInputChange('examLevel', e.target.value)}
                            disabled={loading}
                          >
                            <option value="">-- Chọn --</option>
                            <option value="beginner">Beginner</option>
                            <option value="elementary">Elementary</option>
                            <option value="pre-intermediate">Pre-Intermediate</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="upper-intermediate">Upper-Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label">Mô tả (Tùy chọn)</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Mô tả về đề thi..."
                            value={formData.examDescription}
                            onChange={(e) => handleInputChange('examDescription', e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {/* Assign Students Form */}
                    {requestType === 'assign_students' && (
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label">
                            File Excel danh sách học viên <span className="text-danger">*</span>
                          </label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => handleFileChange('inputFile', e.target.files[0])}
                            disabled={loading}
                          />
                          <small className="form-text text-muted">
                            File Excel phải chứa: Email, Tên, Số điện thoại, Chương trình muốn học
                          </small>
                        </div>
                        {formData.inputFile && (
                          <div className="col-12">
                            <div className="alert alert-info mb-0">
                              <i className="ph ph-file-arrow-up me-2"></i>
                              <strong>File đã chọn:</strong> {formData.inputFile.name}
                              <span className="ms-2 text-muted">
                                ({(formData.inputFile.size / 1024).toFixed(2)} KB)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <hr className="my-4" />

                  {/* Step 3: Assignment & Additional Info */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      3. Giao việc và thông tin bổ sung
                    </label>

                    <div className="row g-3">
                      {/* Assign To */}
                      <div className="col-12">
                        <label className="form-label">
                          Người được giao <span className="text-danger">*</span>
                        </label>
                        {loadingUsers ? (
                          <div className="text-center py-2">
                            <div className="spinner-border spinner-border-sm" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : (
                          <select
                            className="form-select"
                            value={formData.assignedTo}
                            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                            disabled={loading}
                          >
                            <option value="">-- Chọn nhân viên --</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.username} ({user.email}) - {user.role}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Request Note */}
                      <div className="col-12">
                        <label className="form-label">Ghi chú (Tùy chọn)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Thêm ghi chú hoặc hướng dẫn cho người thực hiện..."
                          value={formData.requestNote}
                          onChange={(e) => handleInputChange('requestNote', e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      {/* Attachment File */}
                      <div className="col-12">
                        <label className="form-label">
                          Tài liệu tham khảo (Tùy chọn)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept=".pdf,.doc,.docx,.zip,.rar"
                          onChange={(e) => handleFileChange('attachmentFile', e.target.files[0])}
                          disabled={loading}
                        />
                        <small className="form-text text-muted">
                          Hỗ trợ: PDF, Word, ZIP, RAR. Tối đa 10MB
                        </small>
                      </div>
                      {formData.attachmentFile && (
                        <div className="col-12">
                          <div className="alert alert-success mb-0">
                            <i className="ph ph-paperclip me-2"></i>
                            <strong>Tài liệu:</strong> {formData.attachmentFile.name}
                            <span className="ms-2 text-muted">
                              ({(formData.attachmentFile.size / 1024).toFixed(2)} KB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading || !requestType}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="ph ph-check me-2"></i>
                  Tạo yêu cầu
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .request-type-card {
          border: 2px solid #dee2e6;
          transition: all 0.2s;
        }
        .request-type-card:hover {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
        }
        .request-type-card.selected {
          border-color: #0d6efd;
          background-color: #f0f7ff;
        }
      `}</style>
    </div>
  );
};

export default CreateWorkRequestModal;
