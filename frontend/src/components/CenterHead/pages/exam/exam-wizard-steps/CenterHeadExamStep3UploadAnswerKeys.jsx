import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { examService } from '../../../../../services/examService';

const CenterHeadExamStep3UploadAnswerKeys = ({ examData, setExamData, onNext, onPrevious }) => {
  const [activeSkill, setActiveSkill] = useState(() => {
    // Initialize to first skill that has sections
    const existingTypes = [...new Set(examData.sections.map(s => s.type))];
    return existingTypes.length > 0 ? existingTypes[0] : null;
  });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentEditingQuestion, setCurrentEditingQuestion] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(null);

  const skillsConfig = {
    listening: {
      label: 'Listening',
      icon: 'ph ph-headphones',
      color: 'primary'
    },
    reading: {
      label: 'Reading',
      icon: 'ph ph-book-open',
      color: 'info'
    },
    writing: {
      label: 'Writing',
      icon: 'ph ph-pencil',
      color: 'success'
    },
    speaking: {
      label: 'Speaking',
      icon: 'ph ph-microphone',
      color: 'warning'
    }
  };

  const handleSkillClick = (skill) => {
    setActiveSkill(skill);
  };

  const getSectionsByType = (type) => {
    return examData.sections
      .map((section, index) => ({ ...section, originalIndex: index }))
      .filter(section => section.type === type)
      .sort((a, b) => a.part - b.part);
  };

  const handleAddQuestion = (sectionIndex) => {
    const section = examData.sections[sectionIndex];
    const currentQuestions = section.answerKey || [];
    const nextQuestionNumber = currentQuestions.length + 1;

    const newQuestion = {
      questionNumber: nextQuestionNumber,
      questionTitle: '',
      questionType: 'multiple_choice',
      questionAnswer: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ],
      correctAnswer: [],
      maxScore: 1,
      tags: []
    };

    setCurrentEditingQuestion(newQuestion);
    setCurrentSectionIndex(sectionIndex);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (sectionIndex, questionIndex) => {
    const question = examData.sections[sectionIndex].answerKey[questionIndex];
    setCurrentEditingQuestion({ ...question, questionIndex });
    setCurrentSectionIndex(sectionIndex);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = (sectionIndex, questionIndex) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;

    setExamData(prev => {
      const newSections = [...prev.sections];
      const newAnswerKey = [...newSections[sectionIndex].answerKey];
      newAnswerKey.splice(questionIndex, 1);

      // Reindex question numbers
      newAnswerKey.forEach((q, idx) => {
        q.questionNumber = idx + 1;
      });

      // Calculate new maxScore for the section after deletion
      const newMaxScore = calculateSectionMaxScore(newAnswerKey);

      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        answerKey: newAnswerKey,
        maxScore: newMaxScore
      };

      console.log(`📊 Updated maxScore for section ${sectionIndex} after deletion: ${newMaxScore} points`);

      return { ...prev, sections: newSections };
    });
  };

  const calculateSectionMaxScore = (answerKey) => {
    return (answerKey || []).reduce((sum, question) => {
      return sum + (question.maxScore || 0);
    }, 0);
  };

  const handleSaveQuestion = (question) => {
    setExamData(prev => {
      const newSections = [...prev.sections];
      const answerKey = [...(newSections[currentSectionIndex].answerKey || [])];

      if (question.questionIndex !== undefined) {
        // Edit existing question
        answerKey[question.questionIndex] = question;
      } else {
        // Add new question
        answerKey.push(question);
      }

      // Calculate new maxScore for the section
      const newMaxScore = calculateSectionMaxScore(answerKey);

      newSections[currentSectionIndex] = {
        ...newSections[currentSectionIndex],
        answerKey,
        maxScore: newMaxScore
      };

      console.log(`📊 Updated maxScore for section ${currentSectionIndex}: ${newMaxScore} points`);

      return { ...prev, sections: newSections };
    });

    setShowQuestionModal(false);
    setCurrentEditingQuestion(null);
    setCurrentSectionIndex(null);
  };


  const validateAndNext = async () => {
    const missingFields = [];

    // Validate each section has correct number of questions
    examData.sections.forEach((section, index) => {
      const partLabel = `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Part ${section.part || index + 1}`;
      const answerKeyCount = section.answerKey?.length || 0;
      const requiredCount = section.questionCount || 0;

      if (answerKeyCount !== requiredCount) {
        missingFields.push(`${partLabel}: Cần ${requiredCount} câu hỏi nhưng chỉ có ${answerKeyCount} câu`);
      }
    });

    // Show validation errors
    if (missingFields.length > 0) {
      toast.error(
        <div>
          <ul className="mb-0 ps-3 mt-1" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {missingFields.slice(0, 5).map((field, index) => (
              <li key={index} className="text-danger">{field}</li>
            ))}
            {missingFields.length > 5 && (
              <li className="text-danger">... và {missingFields.length - 5} lỗi khác</li>
            )}
          </ul>
        </div>,
        {
          position: 'top-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          style: { minWidth: '350px' }
        }
      );
      return;
    }

    const totalQuestions = examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);
    const totalAnswerKeys = examData.sections.reduce((sum, s) => sum + (s.answerKey?.length || 0), 0);

    if (totalAnswerKeys === 0) {
      toast.error(
        <div>
          <div className="d-flex align-items-center">
            <i className="ph ph-x-circle fs-4 me-2"></i>
            <span>Vui lòng tạo ít nhất 1 câu hỏi!</span>
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );
      return;
    }

    try {
      // Calculate maxScore for each section based on total question scores
      const updatedSections = examData.sections.map(section => {
        const totalSectionScore = (section.answerKey || []).reduce((sum, question) => {
          return sum + (question.maxScore || 0);
        }, 0);

        return {
          ...section,
          maxScore: totalSectionScore
        };
      });

      console.log('📊 Calculated maxScore for sections:', updatedSections.map(s => ({
        type: s.type,
        part: s.part,
        maxScore: s.maxScore,
        questions: s.answerKey?.length || 0
      })));

      // Update exam in database with calculated maxScore
      await examService.updateExamForManagement(examData._id, {
        sections: updatedSections,
        lastCompletedStep: 3
      });

      // Update local state
      setExamData(prev => ({
        ...prev,
        sections: updatedSections,
        lastCompletedStep: 3
      }));

      toast.success(
        <div className="d-flex align-items-center">
          <i className="ph ph-check-circle fs-4 me-2 text-success"></i>
          <span>Đã lưu điểm số và chuyển sang bước xem lại!</span>
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );

      onNext();
    } catch (error) {
      console.error('Error updating exam with maxScore:', error);
      toast.error(
        <div>
          <div className="d-flex align-items-center">
            <i className="ph ph-x-circle fs-4 me-2"></i>
            <span>Lỗi khi lưu điểm số: {error.message}</span>
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
    }
  };

  const existingSkillTypes = [...new Set(examData.sections.map(s => s.type))];

  if (existingSkillTypes.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="ph ph-warning fs-1 text-warning mb-3"></i>
        <h5>Chưa có section nào được tạo</h5>
        <p className="text-muted">Vui lòng quay lại Step 2 để tạo sections trước</p>
        <button className="btn btn-outline-secondary" onClick={onPrevious}>
          <i className="ph ph-arrow-left me-2"></i>
          Quay lại Step 2
        </button>
      </div>
    );
  }

  return (
    <div className="exam-step-3">
      {/* Skill Tabs */}
      <div className="mb-4">
        <label className="form-label fw-semibold mb-3">
          Chọn kỹ năng để tạo câu hỏi:
        </label>
        <div className="nav nav-pills nav-fill gap-2" role="tablist">
          {Object.entries(skillsConfig).map(([skillKey, config]) => {
            const hasContent = existingSkillTypes.includes(skillKey);
            const isActive = activeSkill === skillKey;

            if (!hasContent) return null;

            const sections = getSectionsByType(skillKey);
            const totalQuestions = sections.reduce((sum, s) => sum + (s.answerKey?.length || 0), 0);

            return (
              <button
                key={skillKey}
                className={`nav-link d-flex align-items-center justify-content-center gap-2 ${isActive ? 'active' : ''}`}
                onClick={() => handleSkillClick(skillKey)}
                type="button"
              >
                <i className={config.icon}></i>
                <strong>{config.label}</strong>
                {totalQuestions > 0 && (
                  <span className="badge bg-white text-primary ms-2">
                    {totalQuestions} câu
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-4" />

      {/* Active Skill Content */}
      {activeSkill && (() => {
        const config = skillsConfig[activeSkill];
        const sections = getSectionsByType(activeSkill);

        return (
          <div className="mb-4">
            {sections.map((section) => (
              <div key={section.originalIndex} className="card border-0 shadow-sm mb-3">
                <div className={`card-header bg-${config.color} bg-opacity-10 d-flex justify-content-between align-items-center py-3`}>
                  <div>
                    <h6 className="mb-0 fw-bold">
                      <i className={`${config.icon} me-2`}></i>
                      {section.title} (Part {section.part})
                    </h6>
                    <small className="text-muted">
                      {section.answerKey?.length || 0}/{section.questionCount} câu hỏi • {section.duration} phút
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm btn-${config.color}`}
                      onClick={() => handleAddQuestion(section.originalIndex)}
                    >
                      <i className="ph ph-plus me-1"></i>
                      Thêm câu hỏi
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  {section.answerKey && section.answerKey.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '60px' }}></th>
                            <th>Câu hỏi</th>
                            <th style={{ width: '150px' }}>Tags</th>
                            <th style={{ width: '100px' }} className="text-center">Điểm</th>
                            <th style={{ width: '100px' }} className="text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {section.answerKey.map((question, qIdx) => (
                            <tr key={qIdx}>
                              <td className="text-center">
                                <i className="ph ph-dots-six-vertical" style={{ cursor: 'grab' }}></i>
                              </td>
                              <td>
                                <div>
                                  <div className="fw-semibold mb-1">
                                    {question.questionTitle || <em className="text-muted">Chưa có tiêu đề</em>}
                                  </div>
                                  <small className="text-muted">
                                    {question.questionType === 'multiple_choice' ? 'Multiple Choice' :
                                     question.questionType === 'true_false' ? 'True or False' :
                                     question.questionType === 'input' ? 'Fill in the blanks' : 'Subjective Type'}
                                  </small>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {question.tags && question.tags.length > 0 ? (
                                    question.tags.map(tag => (
                                      <span key={tag} className="badge bg-secondary badge-sm">
                                        {tag.replace('_', ' ')}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted small">Không có tags</span>
                                  )}
                                </div>
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={question.maxScore}
                                  readOnly
                                  style={{ width: '60px', display: 'inline-block' }}
                                />
                              </td>
                              <td className="text-center">
                                <div className="d-flex gap-1 justify-content-center">
                                  <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => handleEditQuestion(section.originalIndex, qIdx)}
                                    title="Sửa"
                                  >
                                    <i className="ph ph-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-light"
                                    onClick={() => handleDeleteQuestion(section.originalIndex, qIdx)}
                                    title="Xóa"
                                  >
                                    <i className="ph ph-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-muted py-5">
                      <i className="ph ph-question fs-1 d-block mb-3 opacity-50"></i>
                      <p className="mb-3">Chưa có câu hỏi nào cho part này</p>
                      <button
                        className={`btn btn-${config.color}`}
                        onClick={() => handleAddQuestion(section.originalIndex)}
                      >
                        <i className="ph ph-plus me-2"></i>
                        Tạo câu hỏi đầu tiên
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Summary */}
      {examData.sections.length > 0 && (
        <div className="alert alert-info d-flex align-items-center gap-2">
          <i className="ph ph-info fs-5"></i>
          <span>
            <strong>Tổng:</strong>{' '}
            {examData.sections.reduce((sum, s) => sum + (s.answerKey?.length || 0), 0)}/
            {examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0)} câu hỏi đã tạo
          </span>
        </div>
      )}

      {/* Question Modal */}
      {showQuestionModal && currentEditingQuestion && (
        <QuestionModal
          question={currentEditingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => {
            setShowQuestionModal(false);
            setCurrentEditingQuestion(null);
          }}
        />
      )}

      {/* Navigation */}
      <div className="d-flex justify-content-between gap-3 mt-4 pt-4 border-top">
        <button className="btn btn-outline-secondary" onClick={onPrevious}>
          <i className="ph ph-arrow-left me-2"></i>
          Quay lại
        </button>
        <button className="btn btn-primary" onClick={validateAndNext}>
          Tiếp theo
          <i className="ph ph-arrow-right ms-2"></i>
        </button>
      </div>

      <style>{`
        .nav-pills .nav-link {
          padding: 0.75rem 1.5rem;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-pills .nav-link:not(.active):hover {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }
        .table th {
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table td {
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

// Question Modal Component
const QuestionModal = ({ question, onSave, onClose }) => {
  const [formData, setFormData] = useState(question);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChoiceChange = (index, value) => {
    const newAnswers = [...formData.questionAnswer];
    newAnswers[index] = { ...newAnswers[index], text: value };
    setFormData(prev => ({ ...prev, questionAnswer: newAnswers }));
  };

  const handleCorrectAnswerToggle = (key) => {
    const currentCorrect = formData.correctAnswer || [];
    const newCorrect = currentCorrect.includes(key)
      ? currentCorrect.filter(k => k !== key)
      : [...currentCorrect, key];
    setFormData(prev => ({ ...prev, correctAnswer: newCorrect }));
  };

  const handleTagToggle = (tag) => {
    const currentTags = formData.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleTypeChange = (type) => {
    let newFormData = { ...formData, questionType: type };

    if (type === 'multiple_choice') {
      newFormData.questionAnswer = [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' }
      ];
      newFormData.correctAnswer = [];
    } else if (type === 'true_false') {
      newFormData.questionAnswer = [];
      newFormData.correctAnswer = [];
    } else if (type === 'input') {
      newFormData.questionAnswer = [];
      newFormData.correctAnswer = [];
    }

    setFormData(newFormData);
  };

  const handleSave = () => {
    if (!formData.questionTitle.trim()) {
      alert('Vui lòng nhập tiêu đề câu hỏi!');
      return;
    }

    if (!formData.correctAnswer || formData.correctAnswer.length === 0) {
      alert('Vui lòng chọn đáp án đúng!');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {formData.questionIndex !== undefined ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'} #{formData.questionNumber}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* Question Title */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Nội dung câu hỏi <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows="3"
                value={formData.questionTitle}
                onChange={(e) => handleInputChange('questionTitle', e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            {/* Question Type */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Loại câu hỏi</label>
              <div className="d-flex gap-2">
                {[
                  { value: 'multiple_choice', label: 'Trắc nghiệm' },
                  { value: 'true_false', label: 'Đúng/Sai' },
                  { value: 'input', label: 'Điền từ' }
                ].map(type => (
                  <button
                    key={type.value}
                    className={`btn ${formData.questionType === type.value ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTypeChange(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Multiple Choice Answers */}
            {formData.questionType === 'multiple_choice' && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Các lựa chọn</label>
                {formData.questionAnswer.map((answer, idx) => (
                  <div key={idx} className="input-group mb-2">
                    <span className="input-group-text">
                      <input
                        className="form-check-input mt-0"
                        type="checkbox"
                        checked={formData.correctAnswer?.includes(answer.key)}
                        onChange={() => handleCorrectAnswerToggle(answer.key)}
                        title="Đánh dấu là đáp án đúng"
                      />
                    </span>
                    <span className="input-group-text fw-bold">{answer.key}</span>
                    <input
                      type="text"
                      className="form-control"
                      value={answer.text}
                      onChange={(e) => handleAnswerChoiceChange(idx, e.target.value)}
                      placeholder={`Nhập lựa chọn ${answer.key}...`}
                    />
                  </div>
                ))}
                <small className="text-muted">Tick vào checkbox để chọn đáp án đúng</small>
              </div>
            )}

            {/* True/False Answer */}
            {formData.questionType === 'true_false' && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Đáp án đúng</label>
                <div className="d-flex gap-2">
                  {['True', 'False'].map(option => (
                    <button
                      key={option}
                      className={`btn ${formData.correctAnswer?.includes(option) ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => handleInputChange('correctAnswer', [option])}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Answer */}
            {formData.questionType === 'input' && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Đáp án đúng</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.correctAnswer?.join(', ') || ''}
                  onChange={(e) => handleInputChange('correctAnswer', e.target.value.split(',').map(s => s.trim()))}
                  placeholder="Nhập đáp án (có thể nhiều đáp án cách nhau bởi dấu phẩy)..."
                />
                <small className="text-muted">Ví dụ: answer, Answer, ANSWER (cho phép nhiều dạng viết)</small>
              </div>
            )}

            {/* Max Score */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Điểm tối đa</label>
              <input
                type="number"
                className="form-control"
                style={{ width: '150px' }}
                value={formData.maxScore}
                onChange={(e) => handleInputChange('maxScore', parseFloat(e.target.value))}
                min="0"
                step="0.5"
              />
            </div>

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Tags (nhấn để chọn/bỏ chọn)</label>
              <div className="d-flex flex-wrap gap-2">
                {[
                  { value: 'grammar', label: 'Ngữ pháp' },
                  { value: 'vocabulary', label: 'Từ vựng' },
                  { value: 'listening', label: 'Nghe' },
                  { value: 'reading_comprehension', label: 'Đọc hiểu' },
                  { value: 'writing', label: 'Viết' },
                  { value: 'speaking', label: 'Nói' }
                ].map(tag => (
                  <button
                    key={tag.value}
                    type="button"
                    className={`btn btn-sm ${formData.tags?.includes(tag.value) ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleTagToggle(tag.value)}
                    title={`${formData.tags?.includes(tag.value) ? 'Bỏ chọn' : 'Chọn'} tag: ${tag.label}`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <small className="text-muted">
                Tags đã chọn: {formData.tags?.length || 0}
                {formData.tags?.length > 0 && ` (${formData.tags.join(', ')})`}
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <i className="ph ph-check me-2"></i>
              Lưu câu hỏi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

QuestionModal.propTypes = {
  question: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

CenterHeadExamStep3UploadAnswerKeys.propTypes = {
  examData: PropTypes.object.isRequired,
  setExamData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default CenterHeadExamStep3UploadAnswerKeys;
