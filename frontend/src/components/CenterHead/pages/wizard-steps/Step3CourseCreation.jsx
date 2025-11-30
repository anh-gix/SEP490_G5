import { useState } from 'react';
import Button from '../../compo/Button';
import Badge from '../../compo/Badge';
import courseService from '../../../../services/courseService';

const Step3CourseCreation = ({ programData, setProgramData, currentCourse, setCurrentCourse, onNext, onPrevious }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Course form state
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    name: '',
    description: '',
    numberOfSessions: 0,
    timeAllocation: '',
    preRequisite: '',
    studentTasks: '',
    learningType: 'offline',
    mocktestSessionOrders: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateCourseForm = () => {
    const newErrors = {};

    if (!courseForm.courseCode.trim()) {
      newErrors.courseCode = 'Mã học phần là bắt buộc';
    }
    if (!courseForm.name.trim()) {
      newErrors.name = 'Tên học phần là bắt buộc';
    }
    if (!courseForm.numberOfSessions || courseForm.numberOfSessions <= 0) {
      newErrors.numberOfSessions = 'Số lượng buổi học phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCourse = async () => {
    if (!validateCourseForm()) {
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

      const courseData = {
        ...courseForm,
        program: programData._id,
        createdBy: userId,
        status: 'draft',
        clos: [],
        sessions: [],
        materials: []
      };

      const response = await courseService.createCourse(courseData);
      const createdCourse = response.data;

      // Add course to program's courses list
      setProgramData(prev => ({
        ...prev,
        courses: [...(prev.courses || []), createdCourse]
      }));

      // Set this as current course for next steps
      setCurrentCourse(createdCourse);

      // Reset form
      setCourseForm({
        courseCode: '',
        name: '',
        description: '',
        numberOfSessions: 0,
        timeAllocation: '',
        preRequisite: '',
        studentTasks: '',
        learningType: 'offline',
        mocktestSessionOrders: []
      });
      setShowCourseForm(false);

      alert('Tạo học phần thành công!');
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo học phần!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setCurrentCourse(course);
    setCourseForm({
      courseCode: course.courseCode,
      name: course.name,
      description: course.description || '',
      numberOfSessions: course.numberOfSessions || 0,
      timeAllocation: course.timeAllocation || '',
      preRequisite: course.preRequisite || '',
      studentTasks: course.studentTasks || '',
      learningType: course.learningType || 'offline',
      mocktestSessionOrders: course.mocktestSessionOrders || []
    });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc muốn xóa học phần này?')) {
      return;
    }

    try {
      setLoading(true);
      await courseService.deleteCourse(courseId);

      setProgramData(prev => ({
        ...prev,
        courses: prev.courses.filter(c => c._id !== courseId)
      }));

      if (currentCourse?._id === courseId) {
        setCurrentCourse(null);
      }

      alert('Xóa học phần thành công!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Lỗi khi xóa học phần!');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourseForNext = (course) => {
    setCurrentCourse(course);
    onNext();
  };

  const handleSkipToReview = () => {
    if (!currentCourse) {
      if (window.confirm('Chưa có học phần nào được chọn. Bạn có muốn tiếp tục đến bước xem lại?')) {
        // Skip to step 6
        onNext();
        onNext();
        onNext();
      }
    } else {
      onNext();
    }
  };

  return (
    <div>
      {/* Course List */}
      <div className="mb-24">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h6 className="text-md fw-semibold mb-0">
            Danh sách học phần ({(programData.courses || []).length})
          </h6>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCourseForm({
                courseCode: '',
                name: '',
                description: '',
                numberOfSessions: 0,
                timeAllocation: '',
                preRequisite: '',
                studentTasks: '',
                learningType: 'offline',
                mocktestSessionOrders: []
              });
              setShowCourseForm(true);
            }}
            icon="ph ph-plus"
          >
            Thêm học phần
          </Button>
        </div>

        {(!programData.courses || programData.courses.length === 0) ? (
          <div className="text-center py-32 bg-neutral-50 radius-8">
            <i className="ph ph-book text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">
              Chưa có học phần nào. Vui lòng thêm học phần cho chương trình.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-16 py-12" style={{ width: '5%' }}>#</th>
                  <th className="px-16 py-12" style={{ width: '15%' }}>Mã học phần</th>
                  <th className="px-16 py-12">Tên học phần</th>
                  <th className="px-16 py-12 text-center" style={{ width: '10%' }}>Số buổi</th>
                  <th className="px-16 py-12 text-center" style={{ width: '10%' }}>Loại</th>
                  <th className="px-16 py-12 text-center" style={{ width: '15%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {programData.courses.map((course, index) => (
                  <tr key={course._id}>
                    <td className="px-16 py-12">{index + 1}</td>
                    <td className="px-16 py-12">
                      <Badge variant="primary">{course.courseCode}</Badge>
                    </td>
                    <td className="px-16 py-12 fw-semibold">{course.name}</td>
                    <td className="px-16 py-12 text-center">{course.numberOfSessions || 0}</td>
                    <td className="px-16 py-12 text-center">
                      <Badge variant={course.learningType === 'online' ? 'success' : 'secondary'}>
                        {course.learningType || 'offline'}
                      </Badge>
                    </td>
                    <td className="px-16 py-12 text-center">
                      <div className="d-flex gap-1 justify-content-center">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSelectCourseForNext(course)}
                          icon="ph ph-arrow-right"
                          title="Chọn và tiếp tục"
                        >
                        </Button>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                          icon="ph ph-pencil"
                          title="Sửa"
                        >
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCourse(course._id)}
                          icon="ph ph-trash"
                          title="Xóa"
                        >
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Form */}
      {showCourseForm && (
        <div className="border border-primary-300 radius-8 p-24 mb-24 bg-primary-50">
          <h6 className="text-md fw-semibold mb-16">Thông tin học phần</h6>
          <div className="row gy-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Mã học phần <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                name="courseCode"
                value={courseForm.courseCode}
                onChange={handleInputChange}
                className={`form-control radius-8 ${errors.courseCode ? 'is-invalid' : ''}`}
                placeholder="Ví dụ: IELTS-B1-01"
              />
              {errors.courseCode && <div className="invalid-feedback">{errors.courseCode}</div>}
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Tên học phần <span className="text-danger-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={courseForm.name}
                onChange={handleInputChange}
                className={`form-control radius-8 ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Tên học phần"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Số lượng buổi học <span className="text-danger-600">*</span>
              </label>
              <input
                type="number"
                name="numberOfSessions"
                value={courseForm.numberOfSessions}
                onChange={handleInputChange}
                className={`form-control radius-8 ${errors.numberOfSessions ? 'is-invalid' : ''}`}
                placeholder="0"
                min="0"
              />
              {errors.numberOfSessions && <div className="invalid-feedback">{errors.numberOfSessions}</div>}
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Loại hình học
              </label>
              <select
                name="learningType"
                value={courseForm.learningType}
                onChange={handleInputChange}
                className="form-select radius-8"
              >
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Điều kiện tiên quyết
              </label>
              <input
                type="text"
                name="preRequisite"
                value={courseForm.preRequisite}
                onChange={handleInputChange}
                className="form-control radius-8"
                placeholder="Ví dụ: Hoàn thành IELTS A2"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Phân bổ thời gian
              </label>
              <input
                type="text"
                name="timeAllocation"
                value={courseForm.timeAllocation}
                onChange={handleInputChange}
                className="form-control radius-8"
                placeholder="Ví dụ: 60 giờ lên lớp + 40 giờ tự học"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Nhiệm vụ sinh viên
              </label>
              <input
                type="text"
                name="studentTasks"
                value={courseForm.studentTasks}
                onChange={handleInputChange}
                className="form-control radius-8"
                placeholder="Bài tập, dự án, etc."
              />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Mô tả
              </label>
              <textarea
                name="description"
                value={courseForm.description}
                onChange={handleInputChange}
                className="form-control radius-8"
                rows="3"
                placeholder="Mô tả chi tiết về học phần"
              />
            </div>

            <div className="col-12">
              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCourseForm(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveCourse}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu học phần'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex justify-content-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          icon="ph ph-arrow-left"
        >
          Quay lại
        </Button>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkipToReview}
          >
            Bỏ qua đến xem lại
          </Button>
          {currentCourse && (
            <Button
              variant="primary"
              onClick={onNext}
              icon="ph ph-arrow-right"
              iconPosition="right"
            >
              Tiếp tục với "{currentCourse.name}"
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3CourseCreation;
