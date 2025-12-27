import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Breadcrumb from '../../compo/Breadcrumb';
import Card from '../../compo/Card';
import Button from '../../compo/Button';
import StatusBadge from '../../compo/StatusBadge';
import { examService } from '../../../../services/examService';
import { formatDate } from '../../../../helper/helper';

/**
 * CenterHeadExamDetail - Trang chi tiết đề thi cho Center Head
 * - Nếu đề đang draft: có quyền edit, delete, hoàn thành
 * - Nếu đề đã approved: có quyền toggle publish
 */
const CenterHeadExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSkill, setActiveSkill] = useState('all');
  const [selectedSection, setSelectedSection] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const basePath = '/center-head';

  const skillsConfig = {
    all: {
      label: 'Tất cả',
      icon: 'ph ph-squares-four',
    },
    listening: {
      label: 'Listening',
      icon: 'ph ph-headphones',
    },
    reading: {
      label: 'Reading',
      icon: 'ph ph-book-open',
    },
    writing: {
      label: 'Writing',
      icon: 'ph ph-pencil',
    },
    speaking: {
      label: 'Speaking',
      icon: 'ph ph-microphone',
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const response = await examService.getExamByIdForManagement(id);
        setExam(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching exam:', err);
        setError(err.message || 'Không thể tải thông tin đề thi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExam();
    }
  }, [id]);

  const getSectionsByType = (type) => {
    if (!exam || !exam.sections) return [];
    if (type === 'all') return exam.sections;
    return exam.sections.filter(section => section.type === type);
  };

  const getAvailableSkills = () => {
    if (!exam || !exam.sections) return [];
    const types = new Set(exam.sections.map(s => s.type));
    return ['all', ...Array.from(types)];
  };

  const getQuestionTypeLabel = (type) => {
    const labels = {
      'multiple_choice': 'Trắc nghiệm',
      'true_false': 'Đúng/Sai',
      'input': 'Điền đáp án'
    };
    return labels[type] || type;
  };

  // ===== ACTION HANDLERS =====

  // Hoàn thành đề thi (chuyển từ draft sang approved)
  const handleCompleteExam = async () => {
    // Kiểm tra phải có ít nhất 1 section
    if (!exam.sections || exam.sections.length === 0) {
      toast.warning('Đề thi cần có ít nhất 1 section để hoàn thành!', { position: 'top-right' });
      return;
    }

    const result = await Swal.fire({
      title: 'Hoàn thành đề thi',
      html: `Bạn có chắc chắn muốn hoàn thành đề thi này?<br><br>
        <strong>Lưu ý:</strong> Sau khi hoàn thành:
        <ul style="text-align: left; margin-top: 10px;">
          <li>Đề thi sẽ chuyển sang trạng thái "Đã duyệt"</li>
          <li>Có thể mở cho học viên luyện tập</li>
        </ul>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hoàn thành',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      await examService.completeExam(id);
      toast.success('Hoàn thành đề thi thành công!', {
        position: 'top-right',
        autoClose: 5000
      });

      // Refresh exam data
      const response = await examService.getExamByIdForManagement(id);
      setExam(response.data);
    } catch (err) {
      console.error('Error completing exam:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi hoàn thành đề thi', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // Xóa đề thi draft
  const handleDeleteExam = async () => {
    const result = await Swal.fire({
      title: 'Xóa đề thi',
      html: 'Bạn có chắc chắn muốn xóa đề thi này?<br><br><strong class="text-danger">Lưu ý:</strong> Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setActionLoading(true);
      await examService.deleteExamForManagement(id);
      toast.success('Đã xóa đề thi thành công!', { position: 'top-right' });
      navigate(`${basePath}/exams?tab=my-exams`);
    } catch (err) {
      console.error('Error deleting exam:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xóa đề thi', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async () => {
    const newIsPublished = !exam.isPublished;

    try {
      setActionLoading(true);
      if (newIsPublished) {
        await examService.publishExamForManagement(id);
        toast.success('Đã mở đề thi cho học viên!', { position: 'top-right' });
      } else {
        await examService.unpublishExamForManagement(id);
        toast.success('Đã đóng đề thi!', { position: 'top-right' });
      }

      // Refresh exam data
      const response = await examService.getExamByIdForManagement(id);
      setExam(response.data);
    } catch (err) {
      console.error('Error toggling publish:', err);
      toast.error(err.message || 'Có lỗi xảy ra', { position: 'top-right' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-main-600" role="status" />
      </div>
    );
  }

  if (error || !exam) {
    return (
      <Card>
        <div className="text-center py-5">
          <i className="ph ph-warning-circle text-warning-500" style={{ fontSize: '64px' }}></i>
          <h5 className="text-neutral-600 mt-3 mb-3">{error || 'Không tìm thấy đề thi'}</h5>
          <Button
            variant="primary"
            onClick={() => navigate(`${basePath}/exams`)}
          >
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const sections = getSectionsByType(activeSkill);
  const availableSkills = getAvailableSkills();
  const canEdit = exam.status === 'draft' || exam.status === 'needs_revision';

  const breadcrumbItems = [
    { label: 'Dashboard', path: `${basePath}/dashboard` },
    { label: 'Quản lý đề luyện thi', path: `${basePath}/exams` },
    { label: exam.title },
  ];

  return (
    <div className="exam-detail-container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-24 gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-12">
            <Button
              variant="ghost"
              icon="ph ph-arrow-left"
              onClick={() => navigate(`${basePath}/exams`)}
            >
              Quay lại
            </Button>
          </div>
          <div className="d-flex align-items-center gap-3 mb-12">
            <h4 className="mb-0 text-neutral-900 fw-bold">{exam.title}</h4>
            <span className="badge bg-info-600 text-white">{exam.examType?.toUpperCase()}</span>
            <StatusBadge status={exam.status} />
          </div>
          {exam.description && (
            <p className="text-neutral-600 mb-0">{exam.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-2">
          {/* Draft: Edit, Delete, Complete */}
          {canEdit && (
            <>
              <Button
                variant="outline"
                icon="ph ph-pencil-simple"
                onClick={() => navigate(`${basePath}/exams/${id}/edit`)}
                disabled={actionLoading}
              >
                Chỉnh sửa
              </Button>
              <Button
                variant="danger"
                icon="ph ph-trash"
                onClick={handleDeleteExam}
                disabled={actionLoading}
              >
                Xóa
              </Button>
              <Button
                variant="success"
                icon="ph ph-check-circle"
                onClick={handleCompleteExam}
                disabled={actionLoading}
              >
                Hoàn thành
              </Button>
            </>
          )}

          {/* Approved: Toggle Publish */}
          {exam.status === 'approved' && (
            <Button
              variant={exam.isPublished ? 'warning' : 'success'}
              icon={exam.isPublished ? 'ph ph-eye-slash' : 'ph ph-eye'}
              onClick={handleTogglePublish}
              disabled={actionLoading}
            >
              {exam.isPublished ? 'Đóng đề thi' : 'Mở cho học viên'}
            </Button>
          )}
        </div>
      </div>

      {/* Draft Alert */}
      {exam.status === 'draft' && (
        <div className="alert alert-info mb-24" role="alert" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="d-flex align-items-start">
            <i className="ph ph-pencil-circle" style={{ fontSize: '24px', marginRight: '12px', color: '#3b82f6' }}></i>
            <div>
              <h6 className="mb-2 fw-bold">Đề thi đang ở trạng thái Bản nháp</h6>
              <p className="mb-0">
                Bạn có thể chỉnh sửa thông tin, thêm sections và câu hỏi.
                Khi hoàn tất, nhấn <strong>"Hoàn thành"</strong> để kích hoạt đề thi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 g-md-4 mb-24">
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Loại đề</h6>
            <h5 className="text-main-600 fw-bold mb-0">{exam.examType?.toUpperCase()}</h5>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Thời gian</h6>
            <h4 className="text-success-600 fw-bold mb-0">{exam.totalDuration} phút</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Sections</h6>
            <h4 className="text-info-600 fw-bold mb-0">{exam.sections?.length || 0} phần</h4>
          </Card>
        </div>
        <div className="col-6 col-md-3">
          <Card variant="shadow">
            <h6 className="text-neutral-600 mb-8">Câu hỏi</h6>
            <h4 className="text-warning-600 fw-bold mb-0">
              {exam.sections?.reduce((sum, s) => sum + (s.answerKey?.length || s.questionCount || 0), 0)} câu
            </h4>
          </Card>
        </div>
      </div>

      {/* Exam Info */}
      <Card variant="shadow" className="mb-24">
        <div className="d-flex align-items-center gap-3 text-sm text-neutral-600">
          <div className="d-flex align-items-center gap-1">
            <i className="ph ph-user"></i>
            <span>Tạo bởi: <strong className="text-neutral-900">{exam.createdBy?.name || exam.createdBy?.username || 'N/A'}</strong></span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <i className="ph ph-calendar"></i>
            <span>Ngày tạo: {formatDate(exam.createdAt)}</span>
          </div>
          <div className="d-flex align-items-center gap-1">
            <i className="ph ph-clock"></i>
            <span>Cập nhật: {formatDate(exam.updatedAt)}</span>
          </div>
        </div>
      </Card>

      {/* Skills Filter Tabs */}
      <div className="mb-24">
        <div className="d-flex gap-2 flex-wrap">
          {availableSkills.map(skill => {
            const config = skillsConfig[skill];
            if (!config) return null;

            const isActive = activeSkill === skill;
            const skillSections = getSectionsByType(skill);

            return (
              <button
                key={skill}
                className={`btn ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => {
                  setActiveSkill(skill);
                  setSelectedSection(null);
                }}
              >
                <i className={config.icon}></i>
                <span className="ms-2">{config.label}</span>
                {skill !== 'all' && (
                  <span className="badge bg-light text-dark ms-2">
                    {skillSections.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections Display */}
      {sections.length === 0 ? (
        <Card variant="shadow">
          <div className="text-center py-5">
            <i className="ph ph-folder-open text-neutral-400" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mt-3 mb-0">Không có section nào</p>
          </div>
        </Card>
      ) : (
        sections.map((section, index) => {
          const config = skillsConfig[section.type] || skillsConfig.all;
          const hasAnswerKeys = section.answerKey && section.answerKey.length > 0;
          const isExpanded = selectedSection?._id === section._id || sections.length === 1;

          return (
            <Card key={index} variant="shadow" className="mb-16">
              {/* Section Header */}
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedSection(isExpanded ? null : section)}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className={config.icon} style={{ fontSize: '24px', color: '#3b82f6' }}></i>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      {config.label} - Part {section.part}
                    </h6>
                    <div className="d-flex gap-3 text-sm text-neutral-600 mt-1">
                      <span>{section.questionCount || section.answerKey?.length || 0} câu hỏi</span>
                      <span>{section.duration} phút</span>
                    </div>
                  </div>
                </div>
                <i className={`ph ph-caret-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: '20px' }}></i>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div className="mt-20 pt-20 border-top">
                  {/* Instructions */}
                  {section.instructions && (
                    <div className="p-16 bg-neutral-50 rounded-8 mb-16">
                      <strong>Hướng dẫn:</strong>
                      <p className="mb-0 mt-8">{section.instructions}</p>
                    </div>
                  )}

                  <div className="row g-4">
                    {/* Questions Table */}
                    <div className="col-lg-7">
                      <h6 className="fw-semibold mb-16">Câu hỏi ({section.answerKey?.length || 0}):</h6>

                      {/* Audio Files */}
                      {section.audioUrls && section.audioUrls.length > 0 && (
                        <div className="mb-16">
                          <div className="small fw-semibold mb-8">
                            <i className="ph ph-speaker-high me-1"></i>
                            {section.audioUrls.length} file audio
                          </div>
                          <div className="d-flex flex-column gap-2">
                            {section.audioUrls.map((url, idx) => (
                              <audio key={idx} controls className="w-100">
                                <source src={url} type="audio/mpeg" />
                              </audio>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasAnswerKeys ? (
                        <div className="table-responsive">
                          <table className="table table-bordered table-sm">
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: '60px' }}>Câu</th>
                                <th>Tiêu đề</th>
                                <th style={{ width: '100px' }}>Loại</th>
                                <th style={{ width: '120px' }}>Đáp án</th>
                                <th style={{ width: '60px' }}>Điểm</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.answerKey.map((question, qIdx) => (
                                <tr key={qIdx}>
                                  <td className="text-center fw-bold">
                                    {question.questionNumber}
                                  </td>
                                  <td>
                                    {question.questionTitle || <span className="text-neutral-400">-</span>}
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-secondary small">
                                      {getQuestionTypeLabel(question.questionType)}
                                    </span>
                                  </td>
                                  <td>
                                    <strong>
                                      {Array.isArray(question.correctAnswer)
                                        ? question.correctAnswer.join(', ')
                                        : question.correctAnswer || '-'}
                                    </strong>
                                  </td>
                                  <td className="text-center">
                                    {question.maxScore || 1}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-warning">
                          <i className="ph ph-warning me-2"></i>
                          Chưa có đáp án cho section này
                        </div>
                      )}
                    </div>

                    {/* PDF Preview */}
                    <div className="col-lg-5">
                      <div className="d-flex justify-content-between align-items-center mb-12">
                        <h6 className="fw-semibold mb-0">
                          <i className="ph ph-file-pdf text-danger me-2"></i>
                          Đề thi
                        </h6>
                      </div>

                      {section.fileUrl ? (
                        <div className="border rounded overflow-hidden" style={{ height: '400px', backgroundColor: '#fff' }}>
                          <iframe
                            src={section.fileUrl}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            title={`PDF Preview - Part ${section.part}`}
                          />
                        </div>
                      ) : (
                        <div
                          className="border rounded d-flex align-items-center justify-content-center"
                          style={{ height: '400px', backgroundColor: '#f8f9fa' }}
                        >
                          <div className="text-center">
                            <i className="ph ph-file-pdf text-neutral-400" style={{ fontSize: '64px' }}></i>
                            <p className="text-neutral-600 mt-3 mb-0">Chưa có file PDF</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })
      )}

      <ToastContainer />
    </div>
  );
};

export default CenterHeadExamDetail;
