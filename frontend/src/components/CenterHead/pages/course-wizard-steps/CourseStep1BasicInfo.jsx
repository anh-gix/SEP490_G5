import { useState } from 'react';
import Button from '../../compo/Button';
import courseService from '../../../../services/courseService';

const CourseStep1BasicInfo = ({ courseData, setCourseData, program, onNext, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

    try {
      setLoading(true);

      // Get user ID
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Không tìm thấy thông tin user!');
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
      alert(isUpdate ? 'Cập nhật thông tin học phần thành công!' : 'Tạo học phần thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving course:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu học phần!';

      // Show more detailed error for duplicate courseCode
      if (errorMsg.includes('Mã môn học đã tồn tại')) {
        alert(` Lỗi: Mã môn học "${courseData.courseCode}" đã tồn tại trong hệ thống!\n\nVui lòng sử dụng mã môn học khác.`);
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Section 1: Basic Information */}
      <div className="mb-32">
        <h6 className="text-lg fw-bold text-neutral-900 mb-16 pb-8 border-bottom">
          <i className="ph ph-info-circle me-2"></i>
          Thông tin cơ bản
        </h6>
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
          <div className="col-md-4">
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
              style={{ height: '44px' }}
            />
            {errors.numberOfSessions && <div className="invalid-feedback">{errors.numberOfSessions}</div>}
            <small className="text-muted">Tổng số buổi học trong học phần</small>
          </div>

          {/* Loại hình học */}
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