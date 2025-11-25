import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../compo/Breadcrumb';
import Card from '../compo/Card';
import Button from '../compo/Button';
import StatusBadge from '../compo/StatusBadge';
import examService from '../../../services/examService';
import { formatDate } from '../../../helper/helper';

const API_BASE_URL = 'http://localhost:8080';

const ExamView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <Button
            variant="primary"
            icon="ph ph-pencil"
            onClick={() => navigate(`/center-head/exams/${exam._id}/edit`)}
          >
            Chỉnh sửa
          </Button>
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
                  <span className="text-neutral-500 text-sm d-block mb-1">Trạng thái</span>
                  <StatusBadge
                    status={exam.isPublished ? 'published' : 'draft'}
                    size="sm"
                  />
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
                    <Button
                      variant="outline"
                      size="sm"
                      icon="ph ph-pencil"
                      onClick={() => navigate(`/center-head/exams/${exam._id}/edit`)}
                    >
                      Sửa
                    </Button>
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
    </div>
  );
};

export default ExamView;
