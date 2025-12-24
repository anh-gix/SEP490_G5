import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { examService } from '../../../services/examService';

const ExamStep2SectionsConfig = ({ examData, setExamData, onNext, onPrevious }) => {
  const [activeSkill, setActiveSkill] = useState(() => {
    // Initialize to first skill that has sections, or default to listening
    const existingTypes = [...new Set(examData.sections.map(s => s.type))];
    return existingTypes.length > 0 ? existingTypes[0] : 'listening';
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState({}); // Track uploading state per section

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

  const handleFileUpload = async (sectionIndex, file, fileType) => {
    if (!file) return;

    // Validate file before upload
    const maxSize = fileType === 'pdf' ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB for PDF, 50MB for audio
    if (file.size > maxSize) {
      toast.error(`File quá lớn! Kích thước tối đa: ${maxSize / (1024 * 1024)}MB`, {
        position: 'top-right',
        autoClose: 4000,
      });
      return;
    }

    // Validate file type
    if (fileType === 'pdf' && !file.type.includes('pdf')) {
      toast.error('Chỉ chấp nhận file PDF!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (fileType === 'audio' && !file.type.startsWith('audio/')) {
      toast.error('Chỉ chấp nhận file audio!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Check if exam has been saved (has _id)
    if (!examData._id) {
      toast.warning('Vui lòng lưu thông tin cơ bản trước khi upload file!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const uploadKey = `${sectionIndex}-${fileType}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    console.log('🚀 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileMimeType: file.type,
      sectionIndex,
      fileType: fileType,
      examId: examData._id
    });

    try {
      // Get section data for more reliable identification
      const section = examData.sections[sectionIndex];
      if (!section) {
        toast.error('Không tìm thấy section để upload file!', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }

      console.log('🚀 Frontend Upload Debug:', {
        sectionIndex: sectionIndex,
        sectionType: section.type,
        sectionPart: section.part,
        examId: examData._id,
        fileType: fileType,
        sectionsLength: examData.sections.length
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('examId', examData._id);
      formData.append('sectionIndex', `${section.type}-${section.part}`); // Send as "type-part" format
      formData.append('fileType', fileType);

      const response = await examService.uploadExamFileForManagement(formData);

      if (response.success) {
        console.log('✅ File uploaded successfully:', {
          fileType,
          fileUrl: response.data.fileUrl,
          fileName: response.data.fileName,
          sectionIndex,
          examId: examData._id
        });

        // Verify file URL contains uploads path
        if (!response.data.fileUrl.includes('/uploads/')) {
          console.warn('⚠️ File URL does not contain /uploads/ path:', response.data.fileUrl);
        }

        // Update local state with server response
        setExamData(prev => {
          const newSections = [...prev.sections];
          if (fileType === 'pdf') {
            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              fileUrl: response.data.fileUrl,
              fileName: response.data.fileName
            };
          } else if (fileType === 'audio') {
            newSections[sectionIndex] = {
              ...newSections[sectionIndex],
              audioUrls: [...(newSections[sectionIndex].audioUrls || []), response.data.fileUrl],
              audioFileNames: [...(newSections[sectionIndex].audioFileNames || []), response.data.fileName]
            };
          }
          return { ...prev, sections: newSections };
        });

        toast.success(`Upload ${fileType === 'pdf' ? 'PDF' : 'audio'} thành công!`, {
          position: 'top-right',
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Lỗi khi upload file!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleRemoveFile = async (sectionIndex, fileType, audioIndex = null) => {
    // If exam has been saved, call API to delete file from server
    if (examData._id) {
      try {
        await examService.deleteExamFileForManagement({
          examId: examData._id,
          sectionIndex,
          fileType,
          audioIndex
        });

        toast.success(`Xóa ${fileType === 'pdf' ? 'PDF' : 'audio'} thành công!`, {
          position: 'top-right',
          autoClose: 2000,
        });

        // Show warning if section now missing required files
        const updatedSection = newSections[sectionIndex];
        setTimeout(() => showSectionFileWarning(updatedSection, 'remove'), 500);
      } catch (error) {
        console.error('Delete file error:', error);
        toast.error(error.message || 'Lỗi khi xóa file!', {
          position: 'top-right',
          autoClose: 3000,
        });
        return;
      }
    }

    // Update local state
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
      .map((section, index) => ({ ...section, arrayIndex: index })) // Use actual array index
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

  const validateSectionFiles = (section) => {
    const warnings = [];

    if (section.type === 'listening') {
      if (!section.audioUrls || section.audioUrls.length === 0) {
        warnings.push('Thiếu file audio');
      }
    } else if (section.type === 'reading' || section.type === 'writing') {
      if (!section.fileUrl) {
        warnings.push('Thiếu file PDF đề thi');
      }
    }

    return warnings;
  };

  const showSectionFileWarning = (section, action = 'change') => {
    const warnings = validateSectionFiles(section);
    if (warnings.length > 0) {
      const partLabel = `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Part ${section.part}`;

      toast.warning(
        <div>
          <div className="d-flex align-items-center mb-1">
            <i className="ph ph-info fs-4 me-2"></i>
            <strong>{partLabel}:</strong>
          </div>
          <ul className="mb-0 ps-3">
            {warnings.map((warning, index) => (
              <li key={index} className="text-warning small">{warning}</li>
            ))}
          </ul>
        </div>,
        {
          position: 'top-right',
          autoClose: 4000,
          hideProgressBar: true,
        }
      );
    }
  };

  const validateAndNext = () => {
    const missingFields = [];

    if (examData.sections.length === 0) {
      toast.error(
        <div>
          <div className="d-flex align-items-center">
            <i className="ph ph-x-circle fs-4 me-2"></i>
            <span>Vui lòng tạo ít nhất 1 section!</span>
          </div>
        </div>,
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );
      return;
    }

    // Check each section for missing data
    examData.sections.forEach((section, index) => {
      const partLabel = `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} Part ${section.part || index + 1}`;

      // Check required fields: part, duration, questionCount
      if (!section.part) {
        missingFields.push(`${partLabel}: Thiếu part number`);
      }
      if (!section.duration || section.duration <= 0) {
        missingFields.push(`${partLabel}: Thiếu thời gian`);
      }
      if (!section.questionCount || section.questionCount <= 0) {
        missingFields.push(`${partLabel}: Thiếu số câu hỏi`);
      }

      // Check required files based on section type
      if (section.type === 'listening') {
        if (!section.audioUrls || section.audioUrls.length === 0) {
          missingFields.push(`${partLabel}: Thiếu file audio`);
        }
      } else if (section.type === 'reading' || section.type === 'writing') {
        if (!section.fileUrl) {
          missingFields.push(`${partLabel}: Thiếu file PDF đề thi`);
        }
      }
      // Speaking doesn't require files
    });

    // Show toastify for missing data if any
    if (missingFields.length > 0) {
      toast.error(
        <div>
          <div className="d-flex align-items-center mb-2">
            <i className="ph ph-x-circle fs-4 me-2"></i>
            <strong>Thiếu dữ liệu:</strong>
          </div>
          <ul className="mb-0 ps-3 mt-1" style={{ maxHeight: '200px', overflow: 'auto' }}>
            {missingFields.slice(0, 5).map((field, index) => (
              <li key={index} className="text-danger">{field}</li>
            ))}
            {missingFields.length > 5 && (
              <li className="text-danger">... và {missingFields.length - 5} mục khác</li>
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
      return; // Block proceeding if there are missing fields
    }

    // Proceed to next step only if no missing data
    proceedToNext();
  };

  const proceedToNext = () => {

    // Update lastCompletedStep
    setExamData(prev => ({
      ...prev,
      lastCompletedStep: 2
    }));

    toast.success('Cấu hình sections đã được lưu!', {
      position: 'top-right',
      autoClose: 2000,
    });

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
                  src={fileUrl.startsWith('/uploads') ? `http://localhost:${import.meta.env.VITE_API_PORT}${fileUrl}` : fileUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="PDF Preview"
                />
              ) : (
                <div className="text-center p-5">
                  <i className="ph ph-file fs-1 mb-3 text-muted"></i>
                  <p>Preview không khả dụng cho file này</p>
                  <a href={fileUrl.startsWith('/uploads') ? `http://localhost:${import.meta.env.VITE_API_PORT}${fileUrl}` : fileUrl} download={fileName} className="btn btn-primary">
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
                    <div key={section.arrayIndex} className="part-card mb-3 border rounded">
                      <div className={`part-header bg-${config.color} bg-opacity-10 p-3 d-flex justify-content-between align-items-center`}>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`part-badge bg-${config.color} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '40px', height: '40px' }}>
                            <strong>{section.part}</strong>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">Part {section.part}</h6>
                            <small className="text-muted">
                              <i className="ph ph-clock me-1"></i>{section.duration} phút
                              <i className="ph ph-question ms-3 me-1"></i>{section.questionCount} câu
                            </small>
                          </div>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemovePart(section.arrayIndex)}
                          title="Xóa part này"
                        >
                          <i className="ph ph-trash"></i>
                        </button>
                      </div>
                      <div className="part-body p-3">
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-hash me-1"></i>
                              Part số
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={section.part}
                              readOnly
                              disabled
                              title="Part số tự động tăng, không thể chỉnh sửa"
                            />
                            <small className="text-muted text-xs">Tự động</small>
                          </div>

                          <div className="col-md-4">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-clock me-1"></i>
                              Thời gian <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control"
                                value={section.duration}
                                onChange={(e) => handlePartChange(section.arrayIndex, 'duration', parseInt(e.target.value))}
                                min="1"
                                max="120"
                              />
                              <span className="input-group-text">phút</span>
                            </div>
                          </div>

                          <div className="col-md-4">
                            <label className="form-label fw-semibold mb-1">
                              <i className="ph ph-question me-1"></i>
                              Số câu hỏi <span className="text-danger">*</span>
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              value={section.questionCount}
                              onChange={(e) => handlePartChange(section.arrayIndex, 'questionCount', parseInt(e.target.value))}
                              min="1"
                              max="100"
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
                              onChange={(e) => handlePartChange(section.arrayIndex, 'instructions', e.target.value)}
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
                                    className="btn btn-sm btn-outline-primary p-1"
                                    onClick={() => handlePreviewFile(section.fileUrl, section.fileName)}
                                    title="Xem trước PDF"
                                    style={{ width: '32px', height: '32px' }}
                                  >
                                    <i className="ph ph-eye"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleRemoveFile(section.arrayIndex, 'pdf')}
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
                                    id={`pdf-upload-${section.arrayIndex}`}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleFileUpload(section.arrayIndex, file, 'pdf');
                                    }}
                                    disabled={uploadingFiles[`${section.arrayIndex}-pdf`]}
                                  />
                                  <label
                                    htmlFor={`pdf-upload-${section.arrayIndex}`}
                                    className={`file-upload-label d-flex flex-column align-items-center justify-content-center p-4 border border-2 border-dashed rounded cursor-pointer ${uploadingFiles[`${section.arrayIndex}-pdf`] ? 'opacity-50' : ''}`}
                                  >
                                    {uploadingFiles[`${section.arrayIndex}-pdf`] ? (
                                      <>
                                        <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
                                        <span className="fw-semibold">Đang upload...</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="ph ph-upload fs-2 mb-2 text-primary"></i>
                                        <span className="fw-semibold">Click để upload file PDF</span>
                                        <small className="text-muted">PDF ≤ 10MB • Định dạng: .pdf</small>
                                      </>
                                    )}
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* File Upload - Audio and PDF for Listening */}
                          {section.type === 'listening' && (
                            <>
                              {/* PDF Upload for Listening */}
                              <div className="col-md-6">
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
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => handleRemoveFile(section.arrayIndex, 'pdf')}
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
                                      id={`listening-pdf-upload-${section.arrayIndex}`}
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) handleFileUpload(section.arrayIndex, file, 'pdf');
                                      }}
                                      disabled={uploadingFiles[`${section.arrayIndex}-pdf`]}
                                    />
                                    <label
                                      htmlFor={`listening-pdf-upload-${section.arrayIndex}`}
                                      className={`file-upload-label d-flex flex-column align-items-center justify-content-center p-3 border border-2 border-dashed rounded cursor-pointer ${uploadingFiles[`${section.originalIndex}-pdf`] ? 'opacity-50' : ''}`}
                                    >
                                      {uploadingFiles[`${section.arrayIndex}-pdf`] ? (
                                        <>
                                          <div className="spinner-border spinner-border-sm text-primary mb-1"></div>
                                          <span className="fw-semibold text-sm">Đang upload...</span>
                                        </>
                                      ) : (
                                        <>
                                          <i className="ph ph-upload fs-4 mb-1 text-primary"></i>
                                          <span className="fw-semibold text-sm">Click để upload PDF</span>
                                          <small className="text-muted">Đề thi dạng PDF</small>
                                        </>
                                      )}
                                    </label>
                                  </div>
                                )}
                              </div>

                              {/* Audio Upload for Listening */}
                              <div className="col-md-6">
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
                                            <source src={audioUrl.startsWith('/uploads') ? `http://localhost:${import.meta.env.VITE_API_PORT}${audioUrl}` : audioUrl} />
                                          </audio>
                                        </div>
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => handleRemoveFile(section.arrayIndex, 'audio', audioIdx)}
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
                                    id={`audio-upload-${section.arrayIndex}`}
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) handleFileUpload(section.arrayIndex, file, 'audio');
                                      e.target.value = ''; // Reset input
                                    }}
                                    disabled={uploadingFiles[`${section.arrayIndex}-audio`]}
                                  />
                                  <label
                                    htmlFor={`audio-upload-${section.arrayIndex}`}
                                    className={`file-upload-label d-flex flex-column align-items-center justify-content-center p-3 border border-2 border-dashed rounded cursor-pointer ${uploadingFiles[`${section.arrayIndex}-audio`] ? 'opacity-50' : ''}`}
                                  >
                                    {uploadingFiles[`${section.arrayIndex}-audio`] ? (
                                      <>
                                        <div className="spinner-border spinner-border-sm text-primary mb-1"></div>
                                        <span className="fw-semibold text-sm">Đang upload...</span>
                                      </>
                                    ) : (
                                      <>
                                        <i className="ph ph-upload fs-4 mb-1 text-primary"></i>
                                        <span className="fw-semibold text-sm">Click để upload audio</span>
                                        <small className="text-muted">MP3, WAV ≤ 50MB • Nhiều file được phép</small>
                                      </>
                                    )}
                                  </label>
                                </div>
                              </div>
                            </>
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

      <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
        <i className="ph ph-info fs-5"></i>
        <div className="text-sm">
          <strong>Yêu cầu file cho từng kỹ năng:</strong>
          <ul className="mb-0 ps-3 mt-2">
            <li><strong>Listening:</strong> Bắt buộc upload file audio (MP3, WAV, etc.)</li>
            <li><strong>Reading:</strong> Bắt buộc upload file PDF đề thi</li>
            <li><strong>Writing:</strong> Bắt buộc upload file PDF đề thi</li>
            <li><strong>Speaking:</strong> Không yêu cầu file (có thể bỏ trống)</li>
            <li>File sẽ được lưu vào thư mục uploads trên server</li>
          </ul>
        </div>
      </div>

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
