import { useState } from 'react';
import PropTypes from 'prop-types';

const ExamStep2SectionsConfig = ({ examData, setExamData, onNext, onPrevious }) => {
  const [activeSkill, setActiveSkill] = useState(() => {
    // Initialize to first skill that has sections, or default to listening
    const existingTypes = [...new Set(examData.sections.map(s => s.type))];
    return existingTypes.length > 0 ? existingTypes[0] : 'listening';
  });
  const [previewFile, setPreviewFile] = useState(null);

  const skillsConfig = {
    listening: {
      label: 'Listening',
      icon: 'ph ph-headphones',
      defaultParts: 4,
      color: 'primary'
    },
    reading: {
      label: 'Reading',
      icon: 'ph ph-book-open',
      defaultParts: 3,
      color: 'info'
    },
    writing: {
      label: 'Writing',
      icon: 'ph ph-pencil',
      defaultParts: 2,
      color: 'success'
    },
    speaking: {
      label: 'Speaking',
      icon: 'ph ph-microphone',
      defaultParts: 1,
      color: 'warning'
    }
  };

  const handleSkillClick = (skill) => {
    setActiveSkill(skill);

    // If this skill has no sections yet, add a default one
    const hasSections = examData.sections.some(s => s.type === skill);
    if (!hasSections) {
      const newSection = {
        type: skill,
        part: 1,
        title: `Part 1`,
        instructions: '',
        duration: skill === 'listening' ? 10 : skill === 'reading' ? 20 : skill === 'writing' ? 30 : 15,
        questionCount: skill === 'writing' ? 1 : 10,
        answerKey: [],
        fileUrl: '',
        audioUrls: []
      };
      setExamData(prev => ({
        ...prev,
        sections: [...prev.sections, newSection]
      }));
    }
  };

  const handlePartChange = (sectionIndex, field, value) => {
    setExamData(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [field]: value
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleFileUpload = (sectionIndex, file, fileType) => {
    if (!file) return;

    // Create mock URL for preview
    const fileUrl = URL.createObjectURL(file);

    setExamData(prev => {
      const newSections = [...prev.sections];
      if (fileType === 'pdf') {
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          fileUrl: fileUrl,
          fileName: file.name
        };
      } else if (fileType === 'audio') {
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          audioUrls: [...(newSections[sectionIndex].audioUrls || []), fileUrl],
          audioFileNames: [...(newSections[sectionIndex].audioFileNames || []), file.name]
        };
      }
      return { ...prev, sections: newSections };
    });
  };

  const handleRemoveFile = (sectionIndex, fileType, audioIndex = null) => {
    setExamData(prev => {
      const newSections = [...prev.sections];
      if (fileType === 'pdf') {
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          fileUrl: '',
          fileName: ''
        };
      } else if (fileType === 'audio' && audioIndex !== null) {
        const newAudioUrls = [...newSections[sectionIndex].audioUrls];
        const newAudioFileNames = [...(newSections[sectionIndex].audioFileNames || [])];
        newAudioUrls.splice(audioIndex, 1);
        newAudioFileNames.splice(audioIndex, 1);
        newSections[sectionIndex] = {
          ...newSections[sectionIndex],
          audioUrls: newAudioUrls,
          audioFileNames: newAudioFileNames
        };
      }
      return { ...prev, sections: newSections };
    });
  };

  const handlePreviewFile = (fileUrl, fileName) => {
    setPreviewFile({ url: fileUrl, name: fileName });
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const handleAddPart = () => {
    const existingParts = examData.sections.filter(s => s.type === activeSkill);
    const newPartNumber = existingParts.length + 1;

    setExamData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        type: activeSkill,
        part: newPartNumber,
        title: `Part ${newPartNumber}`,
        instructions: '',
        duration: activeSkill === 'listening' ? 10 : activeSkill === 'reading' ? 20 : activeSkill === 'writing' ? 30 : 15,
        questionCount: activeSkill === 'writing' ? 1 : 10,
        answerKey: [],
        fileUrl: '',
        audioUrls: []
      }]
    }));
  };

  const handleRemovePart = (sectionIndex) => {
    setExamData(prev => {
      const removedSection = prev.sections[sectionIndex];
      const removedType = removedSection.type;

      // Remove the section
      const newSections = prev.sections.filter((_, idx) => idx !== sectionIndex);

      // Reindex parts of the same type
      const reindexedSections = newSections.map(section => {
        if (section.type === removedType) {
          // Find the new part number for this section
          const sameSections = newSections.filter(s => s.type === removedType);
          const newPartNumber = sameSections.indexOf(section) + 1;
          return { ...section, part: newPartNumber };
        }
        return section;
      });

      return { ...prev, sections: reindexedSections };
    });
  };

  const getSectionsByType = (type) => {
    return examData.sections
      .map((section, index) => ({ ...section, originalIndex: index }))
      .filter(section => section.type === type)
      .sort((a, b) => a.part - b.part);
  };

  const getSectionSummary = (type) => {
    const sections = getSectionsByType(type);
    const totalParts = sections.length;
    const totalDuration = sections.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalQuestions = sections.reduce((sum, s) => sum + (s.questionCount || 0), 0);

    return { totalParts, totalDuration, totalQuestions };
  };

  const validateAndNext = () => {
    if (examData.sections.length === 0) {
      alert('Vui lòng tạo ít nhất 1 section!');
      return;
    }

    // Check if all sections have valid data
    const hasInvalidSection = examData.sections.some(section =>
      !section.title || !section.duration || !section.questionCount
    );

    if (hasInvalidSection) {
      alert('Vui lòng điền đầy đủ thông tin cho tất cả các sections!');
      return;
    }

    // Update lastCompletedStep
    setExamData(prev => ({
      ...prev,
      lastCompletedStep: 2
    }));

    onNext();
  };

  // Get all existing skill types
  const existingSkillTypes = [...new Set(examData.sections.map(s => s.type))];

  // Preview Modal Component
  const PreviewModal = ({ fileUrl, fileName, onClose }) => {
    const isPdf = fileName?.toLowerCase().endsWith('.pdf');

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="ph ph-file-pdf me-2"></i>
                Preview: {fileName}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body" style={{ height: '70vh' }}>
              {isPdf ? (
                <iframe
                  src={fileUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-5">
                  <i className="ph ph-file fs-1 mb-3 text-muted"></i>
                  <p>Preview không khả dụng cho file này</p>
                  <a href={fileUrl} download={fileName} className="btn btn-primary">
                    <i className="ph ph-download me-2"></i>
                    Download file
                  </a>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="exam-step-2">
      {/* Skill Tabs */}
      <div className="mb-4">
        <label className="form-label fw-semibold mb-3">
          Chọn kỹ năng để cấu hình:
        </label>
        <div className="nav nav-pills nav-fill gap-2" role="tablist">
          {Object.entries(skillsConfig).map(([skillKey, config]) => {
            const hasContent = existingSkillTypes.includes(skillKey);
            const isActive = activeSkill === skillKey;

            return (
              <button
                key={skillKey}
                className={`nav-link d-flex align-items-center justify-content-center gap-2 ${isActive ? 'active' : ''} ${hasContent ? 'has-content' : ''}`}
                onClick={() => handleSkillClick(skillKey)}
                type="button"
              >
                <i className={config.icon}></i>
                <strong>{config.label}</strong>
                {hasContent && (
                  <span className="badge bg-white text-primary ms-2">
                    {getSectionsByType(skillKey).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-4" />

      {/* Active Skill Content */}
      {(() => {
        const config = skillsConfig[activeSkill];
        const sections = getSectionsByType(activeSkill);
        const summary = getSectionSummary(activeSkill);

        return (
          <div className="mb-4">
            <div className="card border-0 shadow-sm">
              <div className={`card-header bg-${config.color} bg-opacity-10 d-flex justify-content-between align-items-center py-3`}>
                <div>
                  <h6 className="mb-0 fw-bold">
                    <i className={`${config.icon} me-2`}></i>
                    {config.label.toUpperCase()} SECTION
                  </h6>
                  {sections.length > 0 && (
                    <small className="text-muted">
                      {summary.totalParts} parts • {summary.totalQuestions} câu • {summary.totalDuration} phút
                    </small>
                  )}
                </div>
                <button
                  className={`btn btn-sm btn-${config.color}`}
                  onClick={handleAddPart}
                >
                  <i className="ph ph-plus me-1"></i>
                  Thêm Part
                </button>
              </div>
              <div className="card-body p-4">
                {sections.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className={`${config.icon} fs-1 d-block mb-3 opacity-50`}></i>
                    <p className="mb-3">Chưa có part nào cho kỹ năng này</p>
                    <button
                      className={`btn btn-${config.color}`}
                      onClick={handleAddPart}
                    >
                      <i className="ph ph-plus me-2"></i>
                      Tạo Part đầu tiên
                    </button>
                  </div>
                ) : (
                  <div className="parts-list">
                    {sections.map((section, idx) => (
                    <div key={section.originalIndex} className="part-card mb-3 border rounded">
                      <div className={`part-header bg-${config.color} bg-opacity-10 p-3 d-flex justify-content-between align-items-center`}>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`part-badge bg-${config.color} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                            <strong>{section.part}</strong>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">{section.title || `Part ${section.part}`}</h6>
                            <small className="text-muted">
                              <i className="ph ph-clock me-1"></i>{section.duration} phút
                              <i className="ph ph-question ms-3 me-1"></i>{section.questionCount} câu
                            </small>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemovePart(section.originalIndex)}
                          title="Xóa part này"
                        >
                          <i className="ph ph-trash"></i>
                        </button>
                      </div>
                      <div className="part-body p-3">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-text-aa me-1"></i>
                              Tên/Tiêu đề Part
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={section.title}
                              onChange={(e) => handlePartChange(section.originalIndex, 'title', e.target.value)}
                              placeholder={`VD: Social & Daily Conversation`}
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-clock me-1"></i>
                              Thời gian
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                value={section.duration}
                                onChange={(e) => handlePartChange(section.originalIndex, 'duration', parseInt(e.target.value))}
                                min="1"
                              />
                              <span className="input-group-text">phút</span>
                            </div>
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-question me-1"></i>
                              Số câu hỏi
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={section.questionCount}
                              onChange={(e) => handlePartChange(section.originalIndex, 'questionCount', parseInt(e.target.value))}
                              min="1"
                            />
                          </div>

                          <div className="col-md-2">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-hash me-1"></i>
                              Part số
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={section.part}
                              onChange={(e) => handlePartChange(section.originalIndex, 'part', parseInt(e.target.value))}
                              min="1"
                            />
                          </div>

                          <div className="col-12">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-note me-1"></i>
                              Hướng dẫn cho thí sinh
                            </label>
                            <textarea
                              className="form-control"
                              value={section.instructions}
                              onChange={(e) => handlePartChange(section.originalIndex, 'instructions', e.target.value)}
                              rows="3"
                              placeholder="VD: You will hear a conversation between two people. Listen carefully and answer questions 1-10..."
                            />
                          </div>

                          {/* File Upload - PDF for Reading/Writing */}
                          {(section.type === 'reading' || section.type === 'writing') && (
                            <div className="col-12">
                              <label className="form-label fw-semibold mb-1">
                                <i className="ph ph-file-pdf me-1"></i>
                                Upload đề thi (PDF)
                              </label>
                              {section.fileUrl ? (
                                <div className="d-flex align-items-center gap-2 p-3 border rounded bg-light">
                                  <i className="ph ph-file-pdf fs-4 text-danger"></i>
                                  <div className="flex-grow-1">
                                    <div className="fw-semibold text-sm">{section.fileName || 'exam.pdf'}</div>
                                    <small className="text-muted">PDF đã upload</small>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handlePreviewFile(section.fileUrl, section.fileName)}
                                  >
                                    <i className="ph ph-eye me-1"></i>
                                    Preview
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveFile(section.originalIndex, 'pdf')}
                                  >
                                    <i className="ph ph-trash"></i>
                                  </button>
                                </div>
                              ) : (
                                <div className="file-upload-area">
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="d-none"
                                    id={`pdf-upload-${section.originalIndex}`}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleFileUpload(section.originalIndex, file, 'pdf');
                                    }}
                                  />
                                  <label
                                    htmlFor={`pdf-upload-${section.originalIndex}`}
                                    className="file-upload-label d-flex flex-column align-items-center justify-content-center p-4 border border-2 border-dashed rounded cursor-pointer"
                                  >
                                    <i className="ph ph-upload fs-2 mb-2 text-primary"></i>
                                    <span className="fw-semibold">Click để upload file PDF</span>
                                    <small className="text-muted">Chọn file đề thi dạng PDF</small>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* File Upload - Audio for Listening */}
                          {section.type === 'listening' && (
                            <div className="col-12">
                              <label className="form-label fw-semibold mb-1">
                                <i className="ph ph-file-audio me-1"></i>
                                Upload file âm thanh
                              </label>

                              {/* Show uploaded audio files */}
                              {section.audioUrls && section.audioUrls.length > 0 && (
                                <div className="mb-2">
                                  {section.audioUrls.map((audioUrl, audioIdx) => (
                                    <div key={audioIdx} className="d-flex align-items-center gap-2 p-2 border rounded bg-light mb-2">
                                      <i className="ph ph-file-audio fs-4 text-primary"></i>
                                      <div className="flex-grow-1">
                                        <div className="fw-semibold text-sm">
                                          {section.audioFileNames?.[audioIdx] || `audio-${audioIdx + 1}.mp3`}
                                        </div>
                                        <audio controls className="w-100 mt-1" style={{ height: '30px' }}>
                                          <source src={audioUrl} />
                                        </audio>
                                      </div>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleRemoveFile(section.originalIndex, 'audio', audioIdx)}
                                      >
                                        <i className="ph ph-trash"></i>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Upload new audio */}
                              <div className="file-upload-area">
                                <input
                                  type="file"
                                  accept="audio/*,.mp3,.wav"
                                  className="d-none"
                                  id={`audio-upload-${section.originalIndex}`}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) handleFileUpload(section.originalIndex, file, 'audio');
                                    e.target.value = ''; // Reset input
                                  }}
                                />
                                <label
                                  htmlFor={`audio-upload-${section.originalIndex}`}
                                  className="file-upload-label d-flex flex-column align-items-center justify-content-center p-3 border border-2 border-dashed rounded cursor-pointer"
                                >
                                  <i className="ph ph-upload fs-4 mb-1 text-primary"></i>
                                  <span className="fw-semibold text-sm">Click để upload file audio</span>
                                  <small className="text-muted">MP3, WAV (có thể upload nhiều file)</small>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Validation Summary - Simplified */}
      {examData.sections.length > 0 && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <i className="ph ph-check-circle fs-5"></i>
          <span>
            <strong>Tổng:</strong> {existingSkillTypes.length} kỹ năng • {examData.sections.length} parts • {examData.sections.reduce((sum, s) => sum + (s.questionCount || 0), 0)} câu • {examData.sections.reduce((sum, s) => sum + (s.duration || 0), 0)} phút
          </span>
        </div>
      )}

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

      {/* Preview Modal */}
      {previewFile && (
        <PreviewModal
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          onClose={closePreview}
        />
      )}

      <style jsx>{`
        .nav-pills .nav-link {
          padding: 0.75rem 1.5rem;
          border: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .nav-pills .nav-link:not(.active):hover {
          background-color: #f8f9fa;
          border-color: #dee2e6;
        }
        .nav-pills .nav-link.has-content {
          position: relative;
        }
        .part-card {
          transition: all 0.2s ease;
        }
        .part-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .part-header {
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .part-badge {
          font-size: 1.1rem;
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .file-upload-label {
          transition: all 0.2s ease;
          background-color: #f8f9fa;
        }
        .file-upload-label:hover {
          background-color: #e9ecef;
          border-color: #0d6efd !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

ExamStep2SectionsConfig.propTypes = {
  examData: PropTypes.object.isRequired,
  setExamData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default ExamStep2SectionsConfig;
