import { useState } from 'react';
import { toast } from 'react-toastify';
import Button from '../../compo/Button';
import courseService from '../../../../services/courseService';
import { getCookie } from '../../../../utils/cookieUtils.js';

const CourseStep1BasicInfo = ({ courseData, setCourseData, program, onNext, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!courseData.courseCode.trim()) {
      newErrors.courseCode = 'Mã học phần là bắt buộc';
    }
    if (!courseData.name.trim()) {
      newErrors.name = 'Tên học phần là bắt buộc';
    }
    if (!courseData.numberOfSessions || courseData.numberOfSessions <= 0) {
      newErrors.numberOfSessions = 'Số lượng buổi học phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndNext = async () => {
    if (!validateForm()) {
      return;
    }

    // Show confirmation modal only when creating new course (first time)
    if (!courseData._id) {
      setShowConfirmModal(true);
      return;
    }

    // If course already exists, proceed with update
    await saveAndProceed();
  };

  const saveAndProceed = async () => {
    try {
      setLoading(true);

      // Get user ID
      const userStr = getCookie('user');
      if (!userStr) {
        toast.error('Không tìm thấy thông tin user!');
        return;
      }
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      const dataToSave = {
        courseCode: courseData.courseCode,
        name: courseData.name,
        description: courseData.description,
        numberOfSessions: courseData.numberOfSessions,
        timeAllocation: courseData.timeAllocation,
        preRequisite: courseData.preRequisite,
        studentTasks: courseData.studentTasks,
        learningType: courseData.learningType,
        program: program._id,
        createdBy: userId,
        status: 'draft',
        lastCompletedStep: 1 // Mark step 1 as completed
      };

      let response;
      // If courseData._id exists, it means we already created the course, so UPDATE it
      // Otherwise, CREATE a new course
      if (courseData._id) {
        response = await courseService.updateCourse(courseData._id, dataToSave);
      } else {
        response = await courseService.createCourse(dataToSave);
      }

      // Update courseData with the newly created course data
      // Preserve local state fields that might not be in response.data
      setCourseData(prev => ({
        ...prev,
        _id: response.data._id,
        courseCode: response.data.courseCode,
        name: response.data.name,
        description: response.data.description || '',
        numberOfSessions: response.data.numberOfSessions || 0,
        timeAllocation: response.data.timeAllocation || '',
        preRequisite: response.data.preRequisite || 'None',
        studentTasks: response.data.studentTasks || '',
        learningType: response.data.learningType || prev.learningType || 'offline',
        program: response.data.program,
        mappedPLOs: response.data.mappedPLOs || [],
        materials: response.data.materials || [],
        clos: response.data.clos || [],
        sessions: response.data.sessions || [],
        mocktestSessionOrders: response.data.mocktestSessionOrders || [],
        status: response.data.status || 'draft'
      }));

      // Show appropriate message based on whether we created or updated
      const isUpdate = courseData._id !== null;
      toast.success(isUpdate ? 'Cập nhật thông tin học phần thành công!' : 'Tạo học phần thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving course:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu học phần!';

      // Show more detailed error for duplicate courseCode
      if (errorMsg.includes('Mã môn học đã tồn tại')) {
        toast.error(`Mã môn học "${courseData.courseCode}" đã tồn tại trong hệ thống! Vui lòng sử dụng mã môn học khác.`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning-50">
                <h5 className="modal-title">
                  <i className="ph ph-warning-circle text-warning-600 me-2"></i>
                  Xác nhận tạo khóa học
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3">
                  <i className="ph ph-info me-2"></i>
                  <strong>Lưu ý quan trọng:</strong> Các thông tin sau đây sẽ <strong>không thể thay đổi</strong> sau khi tạo khóa học.
                </div>

                <div className="border rounded p-3 bg-neutral-50">
                  <div className="mb-3">
                    <span className="text-muted">Mã khóa học:</span>
                    <div className="fw-bold text-primary-600 fs-5">{courseData.courseCode}</div>
                  </div>
                  <div>
                    <span className="text-muted">Số lượng buổi học:</span>
                    <div className="fw-bold text-primary-600 fs-5">{courseData.numberOfSessions} buổi</div>
                  </div>
                </div>

                <p className="mt-3 mb-0 text-center">
                  Bạn có chắc chắn muốn tiếp tục?
                </p>
              </div>
              <div className="modal-footer">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  Quay lại chỉnh sửa
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await saveAndProceed();
                  }}
                  disabled={loading}
                  icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-check'}
                >
                  {loading ? 'Đang tạo...' : 'Xác nhận & Tiếp tục'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="mb-32">
        <div className="row gy-3">
          {/* Mã học phần */}
          <div className="col-md-6">
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Mã học phần <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              name="courseCode"
              value={courseData.courseCode}
              onChange={handleInputChange}
              className={`form-control radius-8 ${errors.courseCode ? 'is-invalid' : ''}`}
              placeholder="Ví dụ: IELTS-B1-01"
              disabled={courseData._id !== null}
              style={{ height: '44px' }}
            />
            {errors.courseCode && <div className="invalid-feedback">{errors.courseCode}</div>}
            {courseData._id && <small className="text-muted">Mã học phần không thể thay đổi sau khi đã tạo</small>}
          </div>

          {/* Tên học phần */}
          <div className="col-md-6">
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Tên học phần <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={courseData.name}
              onChange={handleInputChange}
              className={`form-control radius-8 ${errors.name ? 'is-invalid' : ''}`}
              placeholder="Ví dụ: IELTS Reading & Writing"
              style={{ height: '44px' }}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          {/* Số lượng buổi học */}
          <div className={program?.type === 'cam' ? 'col-md-4' : 'col-md-6'}>
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Số lượng buổi học <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              name="numberOfSessions"
              value={courseData.numberOfSessions}
              onChange={handleInputChange}
              className={`form-control radius-8 ${errors.numberOfSessions ? 'is-invalid' : ''}`}
              placeholder="30"
              min="1"
              disabled={courseData._id !== null}
              style={{ height: '44px' }}
            />
            {errors.numberOfSessions && <div className="invalid-feedback">{errors.numberOfSessions}</div>}
            {courseData._id ? (
              <small className="text-muted">Số lượng buổi học không thể thay đổi sau khi đã tạo</small>
            ) : (
              <small className="text-muted">Tổng số buổi học trong học phần</small>
            )}
          </div>

          {/* Loại hình học - Chỉ hiển thị khi program.type = 'cam' */}
          {program?.type === 'cam' && (
            <div className="col-md-4">
              <label className="form-label fw-semibold text-neutral-900 mb-2">
                Loại hình học <span className="text-danger-600">*</span>
              </label>
              <select
                name="learningType"
                value={courseData.learningType}
                onChange={handleInputChange}
                className="form-select radius-8"
                style={{ height: '44px' }}
              >
                <option value="offline">Offline (Học trực tiếp)</option>
                <option value="online">Online (Học trực tuyến)</option>
              </select>
            </div>
          )}

          {/* Phân bổ thời gian */}
          <div className="col-12">
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Phân bổ thời gian
            </label>
            <input
              type="text"
              name="timeAllocation"
              value={courseData.timeAllocation}
              onChange={handleInputChange}
              className="form-control radius-8"
              placeholder="Ví dụ: 60 giờ lên lớp + 40 giờ tự học + 2 giờ thi cuối kỳ"
              style={{ height: '44px' }}
            />
            <small className="text-muted">Mô tả chi tiết về phân bổ thời gian học tập</small>
          </div>
        </div>
      </div>

      {/* Section 2: Detailed Information */}
      <div className="mb-24">
        <h6 className="text-lg fw-bold text-neutral-900 mb-16 pb-8 border-bottom">
          <i className="ph ph-file-text me-2"></i>
          Thông tin chi tiết
        </h6>
        <div className="row gy-3">
          {/* Mô tả học phần */}
          <div className="col-12">
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Mô tả học phần
            </label>
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleInputChange}
              className="form-control radius-8"
              rows="5"
              placeholder="Nhập mô tả chi tiết về học phần: mục tiêu, nội dung chính, phương pháp giảng dạy..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Nhiệm vụ sinh viên */}
          <div className="col-12">
            <label className="form-label fw-semibold text-neutral-900 mb-2">
              Nhiệm vụ sinh viên
            </label>
            <textarea
              name="studentTasks"
              value={courseData.studentTasks}
              onChange={handleInputChange}
              className="form-control radius-8"
              rows="4"
              placeholder="Nhập nhiệm vụ của sinh viên: bài tập, dự án, thuyết trình, bài kiểm tra..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3 mt-24">
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

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseStep1BasicInfo;