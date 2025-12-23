import PropTypes from 'prop-types';

const ExamSuccessModal = ({ show, examData, onViewExam, onCreateAnother, onGoToExamList }) => {
  if (!show) return null;

  const totalSections = examData.sections.reduce((acc, section) => {
    if (!acc.includes(section.type)) acc.push(section.type);
    return acc;
  }, []).length;

  const totalParts = examData.sections.length;
  const totalQuestions = examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
  const totalDuration = examData.totalDuration;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-body p-5 text-center">
            {/* Success Icon */}
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle mb-4"
              style={{ width: '100px', height: '100px' }}
            >
              <i className="ph-fill ph-check-circle text-success" style={{ fontSize: '60px' }}></i>
            </div>

            <h3 className="fw-bold text-neutral-900 mb-3">
              🎉 Đã nộp đề thi thành công!
            </h3>

            {/* Exam Details Card */}
            <div className="card bg-light border-0 mb-4 text-start">
              <div className="card-body">
                <h5 className="fw-bold mb-3">
                  <i className="ph ph-exam me-2"></i>
                  {examData.title}
                </h5>

                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="badge bg-warning text-dark px-3 py-2">
                    <i className="ph ph-clock me-1"></i>
                    Pending Approval
                  </span>
                </div>

                <div className="row g-3 text-sm">
                  <div className="col-6">
                    <div className="text-muted">Type:</div>
                    <div className="fw-semibold text-uppercase">{examData.examType}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">Level:</div>
                    <div className="fw-semibold">{examData.level}</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">Sections:</div>
                    <div className="fw-semibold">{totalSections} sections, {totalParts} parts</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">Questions:</div>
                    <div className="fw-semibold">{totalQuestions} câu hỏi</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">Duration:</div>
                    <div className="fw-semibold">{totalDuration} phút</div>
                  </div>
                  <div className="col-6">
                    <div className="text-muted">Created:</div>
                    <div className="fw-semibold">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4" />



            <hr className="my-4" />

            {/* Action Buttons */}
            <div className="text-center mb-3">
              <p className="fw-semibold mb-3">Bạn muốn làm gì tiếp theo?</p>
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-lg btn-primary text-start"
                onClick={onViewExam}
              >
                <i className="ph ph-eye me-2"></i>
                Xem chi tiết đề thi
                <small className="d-block text-white-50 mt-1">
                  Review exam details and preview
                </small>
              </button>

              {/* Removed "Create Another" button - teachers can only create exams from work requests */}

              <button
                className="btn btn-lg btn-outline-secondary text-start"
                onClick={onGoToExamList}
              >
                <i className="ph ph-list-bullets me-2"></i>
                Quản lý đề thi
                <small className="d-block text-muted mt-1">
                  Go to exam list
                </small>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ExamSuccessModal.propTypes = {
  show: PropTypes.bool.isRequired,
  examData: PropTypes.object.isRequired,
  onViewExam: PropTypes.func.isRequired,
  onCreateAnother: PropTypes.func.isRequired,
  onGoToExamList: PropTypes.func.isRequired,
};

export default ExamSuccessModal;
