import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { examService } from '../../services/examService';

const TeacherExamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSkill, setActiveSkill] = useState('all');
  const [selectedSection, setSelectedSection] = useState(null);

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
      'multiple_choice': 'multiple choice',
      'true_false': 'Đúng/Sai',
      'input': 'input'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin đề thi...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="ph ph-warning-circle me-2"></i>
          {error || 'Không tìm thấy đề thi'}
        </div>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>
          <i className="ph ph-arrow-left me-2"></i>
          Quay lại
        </button>
      </div>
    );
  }

  const sections = getSectionsByType(activeSkill);
  const availableSkills = getAvailableSkills();

  // Check if exam can be edited (only draft or needs_revision)
  const canEditExam = exam.status === 'draft' || exam.status === 'needs_revision';

  return (
    <div className="p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Card - Exam Info */}
      <div className="card mb-4" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div className="flex-grow-1">
              <div className="d-flex align-items-center gap-2 mb-2">
                <h4 className="mb-0 fw-bold">{exam.title}</h4>
                <span className="badge bg-primary">{exam.examType?.toUpperCase()}</span>
              </div>
              {exam.description && (
                <p className="text-muted mb-0">{exam.description}</p>
              )}
            </div>
            {canEditExam && (
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate(`/teacher/exams/${id}/edit`)}
              >
                <i className="ph ph-pencil me-2"></i>
                Sửa đề thi
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="d-flex gap-4 mb-3">
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-file-text"></i>
              <span className="small">Loại đề</span>
              <strong>{exam.examType?.toUpperCase()}</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-clock"></i>
              <span className="small">Thời gian</span>
              <strong>{exam.totalDuration} phút</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-book-open"></i>
              <span className="small">Sections</span>
              <strong>{exam.sections?.length || 0} phần</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <i className="ph ph-list-checks"></i>
              <span className="small">Câu hỏi</span>
              <strong>{exam.sections?.reduce((sum, s) => sum + (s.questionCount || 0), 0)} câu</strong>
            </div>
          </div>

          {/* Created By */}
          <div className="d-flex align-items-center gap-3 small text-muted">
            <div className="d-flex align-items-center gap-1">
              <i className="ph ph-user"></i>
              <span>Tạo bởi: <strong>{exam.createdBy?.name || 'N/A'}</strong></span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <i className="ph ph-calendar"></i>
              <span>Ngày tạo: {new Date(exam.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Filter Tabs */}
      <div className="mb-3">
        <div className="d-flex gap-2">
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
        <div className="card" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="card-body text-center py-5">
            <i className="ph ph-folder-open text-muted" style={{ fontSize: '3rem' }}></i>
            <p className="text-muted mt-3 mb-0">Không có section nào</p>
          </div>
        </div>
      ) : (
        sections.map((section, index) => {
          const config = skillsConfig[section.type] || skillsConfig.all;
          const hasAnswerKeys = section.answerKey && section.answerKey.length > 0;
          const isExpanded = selectedSection?._id === section._id || sections.length === 1;

          return (
            <div key={index} className="card mb-3" style={{ border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              {/* Section Header */}
              <div
                className="card-header bg-white d-flex justify-content-between align-items-center"
                style={{ cursor: 'pointer', borderBottom: '1px solid #dee2e6' }}
                onClick={() => setSelectedSection(isExpanded ? null : section)}
              >
                <div className="d-flex align-items-center gap-3">
                  <i className={config.icon} style={{ fontSize: '24px' }}></i>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      {config.label} - Part {section.part}
                    </h6>
                    <div className="d-flex gap-3 small text-muted mt-1">
                      <span>
                        {section.questionCount} câu hỏi • {section.duration} phút • {section.answerKey?.length || 0} điểm
                      </span>
                    </div>
                  </div>
                </div>
                <i className={`ph ph-caret-${isExpanded ? 'up' : 'down'}`} style={{ fontSize: '20px' }}></i>
              </div>

              {/* Section Content */}
              {isExpanded && (
                <div className="card-body p-0">
                  {/* Instructions */}
                  {section.instructions && (
                    <div className="p-3 bg-light border-bottom">
                      <strong>Hướng dẫn:</strong>
                      <p className="mb-0 mt-1">{section.instructions}</p>
                    </div>
                  )}

                  {/* 2 Columns: Questions Table (Left) + PDF Preview (Right) */}
                  <div className="row g-0">
                    {/* Left Column - Questions Table */}
                    <div className="col-lg-7 border-end">
                      <div className="p-3">
                        <h6 className="fw-semibold mb-3">Câu hỏi ({section.answerKey?.length || 0}):</h6>

                        {/* Audio Files */}
                        {section.audioUrls && section.audioUrls.length > 0 && (
                          <div className="mb-3">
                            <div className="small fw-semibold mb-2">
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
                                  <th style={{ width: '120px' }}>Loại</th>
                                  <th style={{ width: '150px' }}>Đáp án đúng</th>
                                  <th style={{ width: '70px' }}>Điểm</th>
                                </tr>
                              </thead>
                              <tbody>
                                {section.answerKey.map((question, qIdx) => (
                                  <tr key={qIdx}>
                                    <td className="text-center fw-bold">
                                      Câu {question.questionNumber}
                                    </td>
                                    <td>
                                      {question.questionTitle || <span className="text-muted fst-italic">-</span>}
                                    </td>
                                    <td className="text-center">
                                      <span className="badge bg-secondary small">
                                        {getQuestionTypeLabel(question.questionType)}
                                      </span>
                                    </td>
                                    <td>
                                      <strong>
                                        Đáp án: {Array.isArray(question.correctAnswer)
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
                    </div>

                    {/* Right Column - PDF Preview */}
                    <div className="col-lg-5">
                      <div className="p-3" style={{ minHeight: '500px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-semibold mb-0">
                            <i className="ph ph-file-pdf text-danger me-2"></i>
                            Đề thi
                          </h6>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" title="Thu nhỏ">
                              <i className="ph ph-minus"></i>
                            </button>
                            <button className="btn btn-outline-secondary" title="Phóng to">
                              <i className="ph ph-plus"></i>
                            </button>
                            <button className="btn btn-outline-secondary" title="Toàn màn hình">
                              <i className="ph ph-arrows-out"></i>
                            </button>
                          </div>
                        </div>

                        {section.fileUrl ? (
                          <div className="border rounded overflow-hidden" style={{ height: '550px', backgroundColor: '#fff' }}>
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
                            style={{ height: '550px', backgroundColor: '#f8f9fa' }}
                          >
                            <div className="text-center">
                              <i className="ph ph-file-pdf text-muted" style={{ fontSize: '64px' }}></i>
                              <p className="text-muted mt-3 mb-0">Chưa có file PDF</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

TeacherExamDetail.propTypes = {
  basePath: PropTypes.string
};

export default TeacherExamDetail;
