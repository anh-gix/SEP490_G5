import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';

/**
 * Program Success Modal - Hiển thị sau khi tạo/cập nhật program thành công
 *
 * @param {boolean} show - Hiển thị modal
 * @param {object} programData - Dữ liệu program vừa tạo/cập nhật
 * @param {boolean} isEdit - True nếu là chỉnh sửa, false nếu là tạo mới
 * @param {function} onCreateCourse - Callback khi user chọn "Tạo học phần"
 * @param {function} onViewDetail - Callback khi user chọn "Xem chi tiết"
 * @param {function} onGoToList - Callback khi user chọn "Về danh sách"
 */
const ProgramSuccessModal = ({
  show,
  programData,
  isEdit = false,
  onCreateCourse,
  onViewDetail,
  onGoToList
}) => {
  if (!programData) return null;

  return (
    <Modal
      show={show}
      onClose={onGoToList}
      size="lg"
      closeOnBackdrop={false}
    >
      {/* Success Icon & Title */}
      <div className="text-center mb-4">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle mb-3"
          style={{ width: '80px', height: '80px' }}
        >
          <i className="ph ph-check-circle text-success" style={{ fontSize: '48px' }}></i>
        </div>
        <h4 className="fw-bold text-neutral-900 mb-2">
          {isEdit ? 'Cập nhật chương trình thành công!' : 'Tạo chương trình thành công!'}
        </h4>
        <p className="text-neutral-600 mb-0">
          Chương trình đã được lưu vào hệ thống
        </p>
      </div>

      {/* Program Summary */}
      <div className="card bg-light border-0 mb-4">
        <div className="card-body">
          <h6 className="fw-semibold text-neutral-900 mb-3">
            <i className="ph ph-info me-2"></i>
            Thông tin chương trình
          </h6>

          <div className="row g-3">
            {/* Code & Name */}
            <div className="col-12">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Badge variant="primary" className="fs-6">
                  {programData.code}
                </Badge>
                <span className="text-neutral-900 fw-semibold fs-5">
                  {programData.program_name}
                </span>
              </div>
            </div>

            {/* Type, Level, Band */}
            <div className="col-md-4">
              <small className="text-neutral-600 d-block mb-1">Loại chương trình</small>
              <div className="fw-semibold text-neutral-900">
                {programData.type === 'ielts' && '🎯 IELTS'}
                {programData.type === 'toeic' && '📊 TOEIC'}
                {programData.type === 'cam' && '🎓 Cambridge'}
              </div>
            </div>

            <div className="col-md-4">
              <small className="text-neutral-600 d-block mb-1">Cấp độ CEFR</small>
              <div className="fw-semibold text-neutral-900">
                {programData.level}
              </div>
            </div>

            <div className="col-md-4">
              <small className="text-neutral-600 d-block mb-1">Band/Score</small>
              <div className="fw-semibold text-neutral-900">
                {programData.band || 'N/A'}
              </div>
            </div>

            {/* PLO Count */}
            <div className="col-12">
              <small className="text-neutral-600 d-block mb-1">Program Learning Outcomes</small>
              <div className="d-flex align-items-center gap-2">
                <Badge variant="success">
                  {programData.plos?.length || 0} PLOs
                </Badge>
                {programData.plos?.length > 0 && (
                  <span className="text-neutral-600 text-sm">
                    ({programData.plos.map(p => p.code).join(', ')})
                  </span>
                )}
              </div>
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
        <p className="text-neutral-600 text-sm mb-0">
          Bạn có thể tạo học phần ngay bây giờ hoặc quay lại sau để tiếp tục.
          Mỗi học phần sẽ được gắn với các PLO và bao gồm các sessions giảng dạy.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-end">
        <Button
          variant="outline"
          icon="ph ph-list"
          onClick={onGoToList}
        >
          Về danh sách
        </Button>
        <Button
          variant="secondary"
          icon="ph ph-eye"
          onClick={onViewDetail}
        >
          Xem chi tiết
        </Button>
        <Button
          variant="primary"
          icon="ph ph-plus-circle"
          onClick={onCreateCourse}
        >
          Tạo học phần ngay
        </Button>
      </div>
    </Modal>
  );
};

export default ProgramSuccessModal;
