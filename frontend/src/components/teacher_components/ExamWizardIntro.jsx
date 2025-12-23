import PropTypes from 'prop-types';

/**
 * Exam Wizard Intro Screen
 * Hiển thị trước khi bắt đầu wizard để user hiểu rõ quy trình
 */
const ExamWizardIntro = ({ onStart, onCancel }) => {
  const steps = [
    {
      number: 1,
      title: 'Thông tin cơ bản',
      icon: 'ph ph-info',
      description: 'Tên đề thi, loại đề (IELTS/TOEIC/Cambridge), level, thời gian',
      duration: '2-3 phút'
    },
    {
      number: 2,
      title: 'Cấu hình Sections & Parts',
      icon: 'ph ph-layout',
      description: 'Chọn kỹ năng (Listening, Reading, Writing, Speaking) và tạo parts',
      duration: '3-5 phút'
    },
    {
      number: 3,
      title: 'Upload tài liệu & Đáp án',
      icon: 'ph ph-upload',
      description: 'Upload audio/PDF và tạo answer key cho từng part',
      duration: '10-15 phút'
    },
    {
      number: 4,
      title: 'Review & Submit',
      icon: 'ph ph-check-circle',
      description: 'Xem lại toàn bộ thông tin và submit để Center Head duyệt',
      duration: '2-3 phút'
    }
  ];

  const totalTime = '20-30 phút';

  return (
    <div className="exam-wizard-intro">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle mb-3"
              style={{ width: '80px', height: '80px' }}
            >
              <i className="ph ph-exam text-primary" style={{ fontSize: '40px' }}></i>
            </div>
            <h3 className="fw-bold text-neutral-900 mb-2">
              Tạo đề thi mới
            </h3>
            <p className="text-neutral-600 mb-0">
              Quy trình tạo đề thi chuẩn cho Subject Leader
            </p>
          </div>

          {/* Info Card */}
          <div className="card mb-4 bg-light border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-semibold text-neutral-900 mb-2">
                    <i className="ph ph-info me-2"></i>
                    Vai trò của bạn
                  </h6>
                  <div className="d-flex gap-3 flex-wrap">
                    <span className="text-neutral-600 text-sm">
                      <strong>Role:</strong> Subject Leader
                    </span>
                    <span className="text-neutral-600 text-sm">
                      <strong>Quyền hạn:</strong> Tạo đề thi, Submit để Center Head duyệt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Overview */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-semibold text-neutral-900 mb-3">
                <i className="ph ph-path me-2"></i>
                Quy trình tạo đề thi
              </h5>
              <p className="text-neutral-600 text-sm mb-4">
                Quá trình tạo đề thi bao gồm 4 bước. Mỗi bước sẽ được tự động lưu khi bạn chuyển sang bước tiếp theo.
              </p>

              <div className="steps-list">
                {steps.map((step, index) => (
                  <div
                    key={step.number}
                    className={`d-flex gap-3 pb-3 ${index !== steps.length - 1 ? 'mb-3 border-bottom' : ''}`}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <strong>{step.number}</strong>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="fw-semibold text-neutral-900 mb-0">
                          <i className={`${step.icon} me-2`}></i>
                          {step.title}
                        </h6>
                        <span className="badge bg-secondary text-xs">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-sm mb-0">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-semibold text-neutral-900 mb-3">
                <i className="ph ph-check-circle me-2"></i>
                Tính năng hỗ trợ
              </h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ph ph-floppy-disk text-success fs-5"></i>
                    <div>
                      <div className="fw-semibold text-neutral-900 text-sm">Tự động lưu</div>
                      <div className="text-neutral-600 text-xs">Mỗi bước được tự động lưu</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ph ph-arrow-u-up-left text-info fs-5"></i>
                    <div>
                      <div className="fw-semibold text-neutral-900 text-sm">Quay lại bất kỳ lúc nào</div>
                      <div className="text-neutral-600 text-xs">Điều hướng giữa các bước</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ph ph-clock text-warning fs-5"></i>
                    <div>
                      <div className="fw-semibold text-neutral-900 text-sm">Làm tiếp sau</div>
                      <div className="text-neutral-600 text-xs">Tiếp tục từ bước đã lưu</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="d-flex align-items-start gap-2">
                    <i className="ph ph-file-xls text-primary fs-5"></i>
                    <div>
                      <div className="fw-semibold text-neutral-900 text-sm">Import Excel</div>
                      <div className="text-neutral-600 text-xs">Import đáp án từ file</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Estimate */}
          <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
            <i className="ph ph-clock fs-4"></i>
            <div>
              <strong>Thời gian dự kiến:</strong> {totalTime}
              <div className="text-sm">
                Bạn có thể tạm dừng và quay lại tiếp tục bất kỳ lúc nào
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-3 justify-content-center">
            <button
              className="btn btn-outline-secondary btn-lg"
              onClick={onCancel}
            >
              <i className="ph ph-x me-2"></i>
              Hủy
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={onStart}
            >
              Bắt đầu tạo đề thi
              <i className="ph ph-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ExamWizardIntro.propTypes = {
  onStart: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ExamWizardIntro;
