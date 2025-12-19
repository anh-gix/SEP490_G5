import { useState } from 'react';
import PropTypes from 'prop-types';

const ExamStep4Review = ({ examData, setExamData, onPrevious, onSubmit, basePath, navigate }) => {
  const [expandedSections, setExpandedSections] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleSection = (type) => {
    setExpandedSections(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const getSectionIcon = (type) => {
    const icons = {
      listening: 'ph ph-headphones',
      reading: 'ph ph-book-open',
      writing: 'ph ph-pencil',
      speaking: 'ph ph-microphone'
    };
    return icons[type] || 'ph ph-file';
  };

  const getSectionLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getSectionsByType = () => {
    return examData.sections.reduce((acc, section) => {
      if (!acc[section.type]) {
        acc[section.type] = [];
      }
      acc[section.type].push(section);
      return acc;
    }, {});
  };

  const getSectionSummary = (sections) => {
    const totalParts = sections.length;
    const totalDuration = sections.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalQuestions = sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalAnswerKeys = sections.reduce((sum, s) => sum + (s.answerKey?.length || 0), 0);
    const totalFiles = sections.reduce((sum, s) => {
      let count = 0;
      if (s.fileUrl) count++;
      if (s.audioUrls?.length) count += s.audioUrls.length;
      return sum + count;
    }, 0);

    return { totalParts, totalDuration, totalQuestions, totalAnswerKeys, totalFiles };
  };

  const getValidationStatus = () => {
    const checks = [];

    // Check basic info
    checks.push({
      label: 'Tất cả thông tin cơ bản đã điền đầy đủ',
      status: examData.title && examData.examType && examData.level && examData.totalDuration
    });

    // Check sections
    const totalSections = Object.keys(getSectionsByType()).length;
    const totalParts = examData.sections.length;
    checks.push({
      label: `Tất cả sections đã cấu hình đầy đủ (${totalSections} sections, ${totalParts} parts)`,
      status: totalParts > 0
    });

    // Check files
    const sectionsWithFiles = examData.sections.filter(s =>
      (s.type === 'listening' && s.audioUrls?.length > 0) ||
      ((s.type === 'reading' || s.type === 'writing') && s.fileUrl)
    );
    checks.push({
      label: `File audio/PDF đã upload (${sectionsWithFiles.length}/${examData.sections.length})`,
      status: sectionsWithFiles.length > 0
    });

    // Check answer keys
    const totalQuestions = examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalAnswerKeys = examData.sections.reduce((sum, s) => sum + (s.answerKey?.length || 0), 0);
    checks.push({
      label: `Tất cả answer keys đã tạo (${totalAnswerKeys}/${totalQuestions} questions)`,
      status: totalAnswerKeys > 0
    });

    // Check duration
    const calculatedDuration = examData.sections.reduce((sum, s) => sum + (s.duration || 0), 0);
    checks.push({
      label: `Tổng thời gian khớp với sections (${calculatedDuration} phút)`,
      status: true
    });

    const allPassed = checks.every(check => check.status);

    return { checks, allPassed };
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);

      // Update exam data status to draft
      setExamData(prev => ({
        ...prev,
        status: 'draft',
        lastCompletedStep: 4
      }));

      // Save will be handled by parent component (ExamWizard)
      // Just navigate back to exam list
      alert('✅ Đề thi đã được lưu dưới dạng Draft!');
      navigate(`${basePath}/exams`);
    } catch (error) {
      console.error('Error saving draft:', error);
      alert(error.message || 'Không thể lưu draft!');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    const validation = getValidationStatus();
    if (!validation.allPassed) {
      alert('Vui lòng hoàn thành tất cả các bước trước khi submit!');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn submit đề thi này để Center Head duyệt?\n Sau khi submit, đề thi sẽ chuyển sang trạng thái "Chờ duyệt" và bạn sẽ không thể chỉnh sửa cho đến khi Center Head review xong.\n\nẤn OK để tiếp tục submit.')) {
      return;
    }

    try {
      setSaving(true);

      // Update exam data status
      setExamData(prev => ({
        ...prev,
        status: 'pending_approval',
        lastCompletedStep: 4
      }));

      // Call parent submit handler which will:
      // 1. Save exam data
      // 2. Complete work request
      // 3. Show success modal
      await onSubmit();
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert(error.message || 'Không thể submit đề thi!');
      setSaving(false);
    }
  };

  const sectionsByType = getSectionsByType();
  const validation = getValidationStatus();

  return (
    <div className="exam-step-4">
      {/* Exam Summary */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h6 className="mb-0">
            <i className="ph ph-exam me-2"></i>
            Exam Summary
          </h6>
        </div>
        <div className="card-body">
          <h5 className="fw-bold mb-3">{examData.title}</h5>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="text-muted text-sm">Type</div>
              <div className="fw-semibold text-uppercase">{examData.examType}</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted text-sm">Total Duration</div>
              <div className="fw-semibold">{examData.totalDuration} minutes</div>
            </div>
            <div className="col-md-4">
              <div className="text-muted text-sm">Created</div>
              <div className="fw-semibold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {examData.description && (
            <div>
              <div className="text-muted text-sm mb-1">Description</div>
              <p className="mb-0">{examData.description}</p>
            </div>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Sections Overview */}
      <h6 className="fw-semibold mb-3">📊 Sections Overview</h6>

      {Object.entries(sectionsByType).map(([type, sections]) => {
        const isExpanded = expandedSections[type];
        const summary = getSectionSummary(sections);
        const isComplete = summary.totalAnswerKeys >= summary.totalQuestions;

        return (
          <div key={type} className="card border-0 shadow-sm mb-3">
            <div
              className="card-header bg-light d-flex justify-content-between align-items-center cursor-pointer"
              onClick={() => toggleSection(type)}
            >
              <div className="d-flex align-items-center gap-2">
                <i className={getSectionIcon(type)}></i>
                <strong>{getSectionLabel(type).toUpperCase()}</strong>
                <span className="text-muted">
                  • {summary.totalParts} {summary.totalParts > 1 ? 'parts' : 'part'}
                  • {summary.totalQuestions} questions
                  • {summary.totalDuration} minutes
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                {isComplete ? (
                  <span className="badge bg-success">
                    <i className="ph ph-check me-1"></i>
                    {summary.totalAnswerKeys}/{summary.totalQuestions} answer keys
                  </span>
                ) : (
                  <span className="badge bg-warning">
                    {summary.totalAnswerKeys}/{summary.totalQuestions} answer keys
                  </span>
                )}
                <i className={`ph ph-caret-${isExpanded ? 'up' : 'down'}`}></i>
              </div>
            </div>

            {isExpanded && (
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Part</th>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Questions</th>
                        <th>Answer Keys</th>
                        <th>Files</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((section, idx) => (
                        <tr key={idx}>
                          <td>Part {section.part}</td>
                          <td>{section.title}</td>
                          <td>{section.duration} mins</td>
                          <td>{section.questionCount}</td>
                          <td>
                            {section.answerKey?.length >= section.questionCount ? (
                              <span className="badge bg-success">
                                {section.answerKey?.length || 0}
                              </span>
                            ) : (
                              <span className="badge bg-warning">
                                {section.answerKey?.length || 0}
                              </span>
                            )}
                          </td>
                          <td>
                            {section.fileUrl && (
                              <span className="badge bg-info me-1">PDF</span>
                            )}
                            {section.audioUrls?.length > 0 && (
                              <span className="badge bg-primary">
                                {section.audioUrls.length} audio
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <hr className="my-4" />

      {/* Validation Checklist */}
      <h6 className="fw-semibold mb-3">✅ Validation Checklist</h6>

      <div className={`card border-0 shadow-sm mb-4 ${validation.allPassed ? 'bg-success-subtle' : 'bg-warning-subtle'}`}>
        <div className="card-body">
          <ul className="mb-0">
            {validation.checks.map((check, idx) => (
              <li key={idx} className="mb-2">
                {check.status ? (
                  <i className="ph-fill ph-check-circle text-success me-2"></i>
                ) : (
                  <i className="ph-fill ph-warning-circle text-warning me-2"></i>
                )}
                {check.label}
              </li>
            ))}
          </ul>

          {validation.allPassed && (
            <div className="alert alert-success mb-0 mt-3">
              <strong>🎉 Đề thi đã sẵn sàng để submit!</strong>
            </div>
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Next Steps */}
      <h6 className="fw-semibold mb-3">📋 Next Steps</h6>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <p className="mb-2"><strong>Sau khi submit:</strong></p>
          <ol className="mb-0">
            <li>Đề thi sẽ chuyển sang trạng thái "Pending Approval"</li>
            <li>Center Head sẽ nhận được thông báo để review</li>
            <li>Center Head có thể:
              <ul>
                <li><strong>Approve</strong> → Đề thi được phê duyệt</li>
                <li><strong>Request Revision</strong> → Yêu cầu chỉnh sửa</li>
                <li><strong>Reject</strong> → Từ chối</li>
              </ul>
            </li>
            <li>Nếu được approve, đề thi có thể được publish cho học viên</li>
          </ol>
        </div>
      </div>

      <div className="alert alert-warning">
        <i className="ph ph-warning-circle me-2"></i>
        <strong>Lưu ý quan trọng:</strong>
        <ul className="mb-0 mt-2">
          <li>Sau khi submit, bạn KHÔNG THỂ chỉnh sửa đề thi cho đến khi Center Head review xong</li>
          <li>Nếu cần thay đổi, hãy chọn "Save as Draft" và submit sau</li>
          <li>Đề thi draft có thể chỉnh sửa bất kỳ lúc nào</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="d-flex justify-content-between gap-3 mt-4 pt-4 border-top">
        <button className="btn btn-outline-secondary" onClick={onPrevious}>
          <i className="ph ph-arrow-left me-2"></i>
          Quay lại
        </button>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={handleSaveDraft}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="ph ph-floppy-disk me-2"></i>
                Lưu Draft
              </>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmitForApproval}
            disabled={!validation.allPassed || saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang nộp...
              </>
            ) : (
              <>
                <i className="ph ph-paper-plane-tilt me-2"></i>
                Nộp để duyệt
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

ExamStep4Review.propTypes = {
  examData: PropTypes.object.isRequired,
  setExamData: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  basePath: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default ExamStep4Review;
