import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';

/**
 * Course Success Modal - Hiển thị sau khi hoàn thành tạo course
 *
 * @param {boolean} show - Hiển thị modal
 * @param {object} courseData - Dữ liệu course vừa tạo
 * @param {object} program - Program data
 * @param {function} onViewCourse - Callback khi user chọn "Xem chi tiết"
 * @param {function} onCreateAnother - Callback khi user chọn "Tạo học phần khác"
 * @param {function} onGoToProgram - Callback khi user chọn "Về chương trình"
 */
const CourseSuccessModal = ({
  show,
  courseData,
  program,
  onViewCourse,
  onCreateAnother,
  onGoToProgram
}) => {
  if (!courseData) return null;

  return (
    <Modal
      show={show}
      onClose={onGoToProgram}
      size="lg"
      closeOnBackdrop={false}
    >
      {/* Success Icon & Title */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle mb-3 animate__animated animate__bounceIn"
          style={{ width: '80px', height: '80px' }}
        >
          <i className="ph ph-check-circle text-success" style={{ fontSize: '48px' }}></i>
        </div>
        <h4 className="fw-bold text-neutral-900 mb-2">
          🎉 Tạo học phần thành công!
        </h4>
        <p className="text-neutral-600 mb-0">
          Học phần đã được tạo và lưu vào chương trình
        </p>
      </div>

      {/* Course Summary */}
      <div className="card bg-light border-0 mb-4">
        <div className="card-body">
          <h6 className="fw-semibold text-neutral-900 mb-3">
            <i className="ph ph-info me-2"></i>
            Thông tin học phần
          </h6>

          <div className="row g-3">
            {/* Code & Name */}
            <div className="col-12">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Badge variant="primary" className="fs-6">
                  {courseData.courseCode}
                </Badge>
                <span className="text-neutral-900 fw-semibold fs-5">
                  {courseData.name}
                </span>
              </div>
              {courseData.description && (
                <p className="text-neutral-600 text-sm mb-0">
                  {courseData.description}
                </p>
              )}
            </div>

            {/* Program */}
            <div className="col-12">
              <small className="text-neutral-600 d-block mb-1">Thuộc chương trình</small>
              <div className="d-flex align-items-center gap-2">
                <Badge variant="info">{program?.code}</Badge>
                <span className="text-neutral-900 fw-medium">{program?.program_name}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="col-12">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="card border-0 bg-white shadow-sm">
                    <div className="card-body text-center py-3">
                      <i className="ph ph-calendar text-primary fs-4 mb-1"></i>
                      <div className="fw-bold text-neutral-900 fs-5">
                        {courseData.numberOfSessions || 0}
                      </div>
                      <small className="text-neutral-600">Sessions</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-white shadow-sm">
                    <div className="card-body text-center py-3">
                      <i className="ph ph-target text-success fs-4 mb-1"></i>
                      <div className="fw-bold text-neutral-900 fs-5">
                        {courseData.clos?.length || 0}
                      </div>
                      <small className="text-neutral-600">CLOs</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-white shadow-sm">
                    <div className="card-body text-center py-3">
                      <i className="ph ph-books text-warning fs-4 mb-1"></i>
                      <div className="fw-bold text-neutral-900 fs-5">
                        {courseData.materials?.length || 0}
                      </div>
                      <small className="text-neutral-600">Materials</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-0 bg-white shadow-sm">
                    <div className="card-body text-center py-3">
                      <i className="ph ph-git-merge text-info fs-4 mb-1"></i>
                      <div className="fw-bold text-neutral-900 fs-5">
                        {courseData.mappedPLOs?.length || 0}
                      </div>
                      <small className="text-neutral-600">Mapped PLOs</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Type */}
            <div className="col-md-6">
              <small className="text-neutral-600 d-block mb-1">Hình thức học</small>
              <div className="fw-semibold text-neutral-900">
                {courseData.learningType === 'online' && '💻 Online'}
                {courseData.learningType === 'offline' && '🏫 Offline'}
                {courseData.learningType === 'hybrid' && '🔄 Hybrid'}
              </div>
            </div>

            {/* Status */}
            <div className="col-md-6">
              <small className="text-neutral-600 d-block mb-1">Trạng thái</small>
              <Badge
                variant={
                  courseData.status === 'completed' ? 'success' :
                  courseData.status === 'active' ? 'success' :
                  courseData.status === 'draft' ? 'secondary' :
                  courseData.status === 'archived' ? 'neutral' :
                  'secondary'
                }
              >
                {courseData.status === 'completed' && 'Hoàn thành'}
                {courseData.status === 'draft' && 'Bản nháp'}
                {courseData.status === 'active' && 'Đang hoạt động'}
                {courseData.status === 'archived' && 'Đã lưu trữ'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-4">
        <h6 className="fw-semibold text-neutral-900 mb-3">
          <i className="ph ph-arrow-right me-2"></i>
          Bước tiếp theo
        </h6>
        <ul className="list-unstyled mb-0">
          <li className="d-flex gap-2 mb-2">
            <i className="ph ph-check-circle text-success"></i>
            <span className="text-neutral-600 text-sm">
              Xem chi tiết học phần và chỉnh sửa nếu cần
            </span>
          </li>
          <li className="d-flex gap-2 mb-2">
            <i className="ph ph-check-circle text-success"></i>
            <span className="text-neutral-600 text-sm">
              Tạo thêm học phần khác cho chương trình này
            </span>
          </li>
          <li className="d-flex gap-2">
            <i className="ph ph-check-circle text-success"></i>
            <span className="text-neutral-600 text-sm">
              Quay lại quản lý chương trình
            </span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
        <Button
          variant="outline"
          icon="ph ph-arrow-left"
          onClick={onGoToProgram}
        >
          Về chương trình
        </Button>
        <Button
          variant="secondary"
          icon="ph ph-plus-circle"
          onClick={onCreateAnother}
        >
          Tạo học phần khác
        </Button>
        <Button
          variant="primary"
          icon="ph ph-eye"
          onClick={onViewCourse}
        >
          Xem chi tiết học phần
        </Button>
      </div>
    </Modal>
  );
};

export default CourseSuccessModal;
