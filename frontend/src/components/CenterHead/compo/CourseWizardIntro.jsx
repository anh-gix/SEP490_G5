import Card from './Card';
import Button from './Button';
import Badge from './Badge';

/**
 * Course Wizard Intro Screen
 * Hiển thị trước khi bắt đầu wizard để user hiểu rõ quy trình
 *
 * @param {object} program - Program data
 * @param {function} onStart - Callback khi user click "Bắt đầu"
 * @param {function} onCancel - Callback khi user click "Hủy"
 */
const CourseWizardIntro = ({ program, onStart, onCancel }) => {
  const steps = [
    {
      number: 1,
      title: 'Thông tin cơ bản',
      description: 'Mã môn, tên, mô tả, số buổi học, prerequisites'
    },
    {
      number: 2,
      title: 'PLO Mapping',
      description: 'Chọn các PLO mà học phần này sẽ đạt được'
    },
    {
      number: 3,
      title: 'Tài liệu khóa học',
      description: 'Thêm giáo trình, tài liệu tham khảo cho học phần'
    },
    {
      number: 4,
      title: 'CLO & Mapping',
      description: 'Tạo Course Learning Outcomes và map với PLO'
    },
    {
      number: 5,
      title: 'Sessions',
      description: 'Tạo kế hoạch giảng dạy cho từng buổi học'
    }
  ];

  return (
    <div className="course-wizard-intro">
      <div className="row justify-content-center">
        <div className="col-lg-10 col-xl-8">
          {/* Header */}
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle mb-3"
              style={{ width: '80px', height: '80px' }}
            >
              <i className="ph ph-books text-primary" style={{ fontSize: '40px' }}></i>
            </div>
            <h3 className="fw-bold text-neutral-900 mb-2">
              Tạo học phần mới
            </h3>
            <p className="text-neutral-600 mb-0">
              Cho chương trình: <Badge variant="primary">{program?.code}</Badge>{' '}
              <span className="fw-semibold">{program?.program_name}</span>
            </p>
          </div>

          {/* Program Info Card */}
          <Card className="mb-4 bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="fw-semibold text-neutral-900 mb-2">
                  <i className="ph ph-info me-2"></i>
                  Thông tin chương trình
                </h6>
                <div className="d-flex gap-3 flex-wrap">
                  <span className="text-neutral-600 text-sm">
                    <strong>Loại:</strong>{' '}
                    {program?.type === 'ielts' && 'IELTS'}
                    {program?.type === 'toeic' && 'TOEIC'}
                    {program?.type === 'cam' && 'Cambridge'}
                  </span>
                  <span className="text-neutral-600 text-sm">
                    <strong>Level:</strong> {program?.level}
                  </span>
                  <span className="text-neutral-600 text-sm">
                    <strong>Band:</strong> {program?.band}
                  </span>
                  <span className="text-neutral-600 text-sm">
                    <strong>PLOs:</strong> {program?.plos?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Process Overview */}
          <Card className="mb-4">
            <h5 className="fw-semibold text-neutral-900 mb-3">
              <i className="ph ph-path me-2"></i>
              Quy trình tạo học phần
            </h5>
            <p className="text-neutral-600 text-sm mb-4">
              Quá trình tạo học phần bao gồm 5 bước. Mỗi bước sẽ được tự động lưu khi bạn chuyển sang bước tiếp theo.
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
                    <h6 className="fw-semibold text-neutral-900 mb-1">
                      {step.title}
                    </h6>
                    <p className="text-neutral-600 text-sm mb-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Features */}
          <Card className="mb-4">
            <h6 className="fw-semibold text-neutral-900 mb-3">
              <i className="ph ph-check-circle me-2"></i>
              Tính năng hỗ trợ
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-2">
                  <i className="ph ph-floppy-disk text-success fs-5"></i>
                  <div>
                    <div className="fw-semibold text-neutral-900 text-sm">Tự động lưu</div>
                    <div className="text-neutral-600 text-xs">Mỗi bước được tự động lưu</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-2">
                  <i className="ph ph-arrow-u-up-left text-info fs-5"></i>
                  <div>
                    <div className="fw-semibold text-neutral-900 text-sm">Quay lại bất kỳ lúc nào</div>
                    <div className="text-neutral-600 text-xs">Điều hướng giữa các bước</div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-start gap-2">
                  <i className="ph ph-clock text-warning fs-5"></i>
                  <div>
                    <div className="fw-semibold text-neutral-900 text-sm">Làm tiếp sau</div>
                    <div className="text-neutral-600 text-xs">Tiếp tục từ bước đã lưu</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="outline"
              icon="ph ph-x"
              onClick={onCancel}
              size="lg"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon="ph ph-arrow-right"
              iconPosition="right"
              onClick={onStart}
              size="lg"
            >
              Bắt đầu tạo học phần
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseWizardIntro;
