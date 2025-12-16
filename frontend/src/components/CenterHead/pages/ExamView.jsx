import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import examService from '../../../services/examService';
import { formatDate } from '../../../helper/helper';

const API_BASE_URL = 'http://localhost:8080';

<<<<<<< HEAD
const ExamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
=======
const ExamView = ({ viewMode = 'center-head' }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Determine base path
  const basePath = viewMode === 'teacher' ? '/teacher' : '/center-head';
  const isViewOnly = viewMode === 'center-head';
>>>>>>> origin/Namvv-teacher-class-management
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');

  useEffect(() => {
    fetchExamDetails();
  }, [id]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await examService.getExamByIdForManagement(id);

      if (response.success) {
        setExam(response.data);
      } else {
        setError(response.message || 'Không thể tải thông tin đề thi');
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError(err.message || 'Không thể tải thông tin đề thi');
    } finally {
      setLoading(false);
    }
  };

  const getSectionLabel = (type) => {
    const labels = {
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking'
    };
    return labels[type] || type;
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      'multiple_choice': 'Trắc nghiệm',
      'multiple-choice': 'Trắc nghiệm',
      'true_false': 'Đúng/Sai',
      'true-false': 'Đúng/Sai',
      'input': 'Điền từ',
      'essay': 'Tự luận'
    };
    return labels[type] || type;
  };

  const handleSubmitForApproval = async () => {
    if (!submissionNote.trim()) {
      alert('Vui lòng nhập ghi chú nộp đề');
      return;
    }

    try {
      setSubmitting(true);
      const response = await examService.submitExamForApproval(id, submissionNote);

      if (response.success) {
        alert('Nộp đề thi để duyệt thành công!');
        setShowSubmitModal(false);
        setSubmissionNote('');
        fetchExamDetails(); // Reload to get updated status
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert(err.message || 'Nộp đề thi thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawSubmission = async () => {
    if (!window.confirm('Bạn có chắc muốn rút lại đề thi này?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await examService.withdrawExamSubmission(id);

      if (response.success) {
        alert('Rút lại đề thi thành công!');
        fetchExamDetails(); // Reload to get updated status
      }
    } catch (err) {
      console.error('Error withdrawing exam:', err);
      alert(err.message || 'Rút lại đề thi thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/center-head/dashboard' },
    { label: 'Quản lý đề thi', path: '/center-head/exams' },
    { label: 'Chi tiết đề thi' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="exam-view-container">
        <Breadcrumb items={breadcrumbItems} />
        <Card>
          <div className="alert alert-danger mb-0">
            <i className="ph ph-warning-circle me-2"></i>
            {error || 'Không tìm thấy đề thi'}
          </div>
          <div className="mt-3">
            <Button variant="outline" onClick={() => navigate('/center-head/exams')}>
              <i className="ph ph-arrow-left me-2"></i>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalQuestions = exam.sections.reduce((sum, section) =>
    sum + (section.answerKey?.length || 0), 0
  );

  const totalScore = exam.sections.reduce((sum, section) =>
    sum + (section.maxScore || 0), 0
  );

  return (
    <div className="exam-view-container">
      <Breadcrumb items={breadcrumbItems} />

      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="mb-8 text-neutral-900 fw-bold">{exam.title}</h4>
          <p className="text-neutral-600 mb-0">
            {exam.description || 'Không có mô tả'}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline"
            icon="ph ph-arrow-left"
            onClick={() => navigate('/center-head/exams')}
          >
            Quay lại
          </Button>

          {/* Nút Nộp đề để duyệt - chỉ hiển thị khi status = draft hoặc needs_revision */}
          {(exam.status === 'draft' || exam.status === 'needs_revision') && (
            <Button
              variant="success"
              icon="ph ph-paper-plane-tilt"
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting}
            >
              Nộp đề để duyệt
            </Button>
          )}

          {/* Nút Rút lại - chỉ hiển thị khi status = pending_approval */}
          {exam.status === 'pending_approval' && (
            <Button
              variant="warning"
              icon="ph ph-arrow-u-up-left"
              onClick={handleWithdrawSubmission}
              disabled={submitting}
            >
              Rút lại
            </Button>
          )}

<<<<<<< HEAD
          <Button
            variant="primary"
            icon="ph ph-pencil"
            onClick={() => navigate(`/center-head/exams/${exam._id}/edit`)}
          >
            Chỉnh sửa
          </Button>
=======
          {!isViewOnly && (
            <Button
              variant="primary"
              icon="ph ph-pencil"
              onClick={() => navigate(`${basePath}/exams/${exam._id}/edit`)}
            >
              Chỉnh sửa
            </Button>
          )}
>>>>>>> origin/Namvv-teacher-class-management
        </div>
      </div>

      {/* General Information */}
      <div className="row g-4 mb-24">
        <div className="col-md-8">
          <Card title="Thông tin chung">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Loại đề thi</span>
                  <span className="text-neutral-900 fw-medium text-capitalize">
                    {exam.examType === 'practice' ? 'Luyện tập' : 'Chính thức'}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Cấp độ</span>
                  <span className="text-neutral-900 fw-medium">{exam.level}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Trạng thái xuất bản</span>
                  <StatusBadge
                    status={exam.isPublished ? 'published' : 'draft'}
                    size="sm"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Trạng thái duyệt</span>
                  <span className={`badge ${
                    exam.status === 'approved' ? 'bg-success' :
                    exam.status === 'pending_approval' ? 'bg-warning' :
                    exam.status === 'needs_revision' ? 'bg-danger' :
                    'bg-secondary'
                  }`}>
                    {exam.status === 'draft' && 'Bản nháp'}
                    {exam.status === 'pending_approval' && 'Chờ duyệt'}
                    {exam.status === 'approved' && 'Đã duyệt'}
                    {exam.status === 'needs_revision' && 'Cần chỉnh sửa'}
                    {exam.status === 'archived' && 'Đã lưu trữ'}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Người tạo</span>
                  <span className="text-neutral-900 fw-medium">
                    {exam.createdBy?.username || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Ngày tạo</span>
                  <span className="text-neutral-900 fw-medium">
                    {formatDate(exam.createdAt)}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <span className="text-neutral-500 text-sm d-block mb-1">Cập nhật lần cuối</span>
                  <span className="text-neutral-900 fw-medium">
                    {formatDate(exam.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="col-md-4">
          <Card title="Thống kê">
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-600 text-sm">Số sections</span>
                <span className="text-neutral-900 fw-bold h5 mb-0">
                  {exam.sections.length}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-600 text-sm">Tổng câu hỏi</span>
                <span className="text-neutral-900 fw-bold h5 mb-0">
                  {totalQuestions}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-600 text-sm">Thời gian</span>
                <span className="text-neutral-900 fw-bold h5 mb-0">
                  {exam.totalDuration} <small className="fw-normal text-sm">phút</small>
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-neutral-600 text-sm">Tổng điểm</span>
                <span className="text-neutral-900 fw-bold h5 mb-0">
                  {totalScore} <small className="fw-normal text-sm">điểm</small>
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sections */}
      <Card title="Các Section">
        {exam.sections.length === 0 ? (
          <div className="text-center py-4 text-neutral-500">
            <i className="ph ph-folder-open" style={{ fontSize: '48px' }}></i>
            <p className="mt-2 mb-0">Chưa có section nào</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {exam.sections.map((section, index) => (
              <div
                key={section._id || index}
                className="border border-neutral-200 rounded p-3"
              >
                {/* Section Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <h6 className="text-neutral-900 fw-semibold mb-1">
                      Section {index + 1}: {getSectionLabel(section.type)}
                    </h6>
                    {section.instructions && (
                      <p className="text-neutral-600 text-sm mb-0">
                        {section.instructions}
                      </p>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-end">
                      <div className="text-neutral-700 text-sm">
                        <i className="ph ph-clock me-1"></i>
                        {section.duration} phút
                      </div>
                      <div className="text-neutral-700 text-sm">
                        <i className="ph ph-list-bullets me-1"></i>
                        {section.answerKey?.length || 0} câu
                      </div>
                    </div>
<<<<<<< HEAD
                    <Button
                      variant="outline"
                      size="sm"
                      icon="ph ph-pencil"
                      onClick={() => navigate(`/center-head/exams/${exam._id}/edit`)}
                    >
                      Sửa
                    </Button>
=======
                    {!isViewOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon="ph ph-pencil"
                        onClick={() => navigate(`${basePath}/exams/${exam._id}/edit`)}
                      >
                        Sửa
                      </Button>
                    )}
>>>>>>> origin/Namvv-teacher-class-management
                  </div>
                </div>

                {/* File URL */}
                {section.fileUrl && (
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 p-2 bg-neutral-50 rounded">
                      <i className="ph ph-file-pdf text-danger"></i>
                      <a
                        href={`${API_BASE_URL}${section.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-main-600"
                      >
                        Xem file đề thi
                      </a>
                    </div>
                  </div>
                )}

                {/* Audio URLs */}
                {section.audioUrls && section.audioUrls.length > 0 && (
                  <div className="mb-3">
                    <span className="text-neutral-700 text-sm fw-medium d-block mb-2">
                      File audio:
                    </span>
                    <div className="d-flex flex-column gap-2">
                      {section.audioUrls.map((audioUrl, audioIndex) => (
                        <div
                          key={audioIndex}
                          className="d-flex align-items-center gap-2 p-2 bg-neutral-50 rounded"
                        >
                          <i className="ph ph-speaker-high text-primary"></i>
                          <a
                            href={`${API_BASE_URL}${audioUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-main-600"
                          >
                            Audio {audioIndex + 1}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Keys */}
                {section.answerKey && section.answerKey.length > 0 && (
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-neutral-700 text-sm fw-medium">
                        Đáp án ({section.answerKey.length} câu)
                      </span>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead className="bg-neutral-50">
                          <tr>
                            <th style={{ width: '80px' }}>Câu</th>
                            <th>Nội dung câu hỏi</th>
                            <th style={{ width: '150px' }}>Loại</th>
                            <th style={{ width: '150px' }}>Đáp án</th>
                            <th style={{ width: '100px' }}>Điểm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.answerKey.map((answer, answerIndex) => (
                            <tr key={answerIndex}>
                              <td className="text-center">{answer.questionNumber}</td>
                              <td className="text-neutral-700">
                                {answer.questionTitle || <span className="text-neutral-400 fst-italic">Không có nội dung</span>}
                              </td>
                              <td>
                                <span className="badge bg-neutral-100 text-neutral-700">
                                  {getQuestionTypeLabel(answer.questionType)}
                                </span>
                              </td>
                              <td>
                                {answer.questionType === 'multiple_choice' ? (
                                  <span className="fw-medium">{Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer}</span>
                                ) : answer.questionType === 'true_false' ? (
                                  <span className="fw-medium">
                                    {(Array.isArray(answer.correctAnswer) ? answer.correctAnswer[0] : answer.correctAnswer) === 'true' ? 'Đúng' : 'Sai'}
                                  </span>
                                ) : (
                                  <span className="text-neutral-700">{Array.isArray(answer.correctAnswer) ? answer.correctAnswer.join(', ') : answer.correctAnswer}</span>
                                )}
                              </td>
                              <td className="text-center">{answer.maxScore}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nộp đề thi để duyệt</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="ph ph-info me-2"></i>
                  Đề thi sẽ được gửi đến Center Head để duyệt. Vui lòng nhập ghi chú (nếu có).
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Ghi chú nộp đề <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Nhập ghi chú về đề thi này..."
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSubmitForApproval}
                  disabled={submitting || !submissionNote.trim()}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <i className="ph ph-paper-plane-tilt me-2"></i>
                      Nộp đề
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamView;
