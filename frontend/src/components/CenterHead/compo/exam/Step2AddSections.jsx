import React, { useState } from 'react';
import Button from '../Button';
import PDFUploader from './PDFUploader';

const Step2AddSections = ({ examData, updateExamData }) => {
  const [expandedSections, setExpandedSections] = useState([]);

  const sectionTypes = [
    { value: 'reading', label: 'Reading', icon: 'ph-book-open' },
    { value: 'listening', label: 'Listening', icon: 'ph-headphones' },
    { value: 'writing', label: 'Writing', icon: 'ph-pencil-simple' },
    { value: 'speaking', label: 'Speaking', icon: 'ph-microphone' }
  ];

  const addSection = () => {
    // Tính part tự động dựa trên số section cùng type
    const getNextPart = (type) => {
      const sameSections = examData.sections.filter(s => s.type === type);
      if (sameSections.length === 0) return 1;
      const maxPart = Math.max(...sameSections.map(s => s.part || 1));
      return maxPart + 1;
    };

    const newSection = {
      id: Date.now(),
      type: 'reading',
      part: getNextPart('reading'),
      fileUrl: '',
      audioUrls: [],
      instructions: '',
      duration: 0,
      questionCount: 0,
      answerKey: [],
      maxScore: 0
    };

    updateExamData({
      sections: [...examData.sections, newSection]
    });

    // Auto expand the new section
    setExpandedSections([...expandedSections, newSection.id]);
  };

  const updateSection = (sectionId, field, value) => {
    const updatedSections = examData.sections.map(section => {
      if (section.id === sectionId) {
        const updated = { ...section, [field]: value };

        // Nếu thay đổi type, tự động cập nhật part
        if (field === 'type') {
          const sameSections = examData.sections.filter(s =>
            s.type === value && s.id !== sectionId
          );
          if (sameSections.length === 0) {
            updated.part = 1;
          } else {
            const maxPart = Math.max(...sameSections.map(s => s.part || 1));
            updated.part = maxPart + 1;
          }
        }

        return updated;
      }
      return section;
    });
    updateExamData({ sections: updatedSections });
  };

  const deleteSection = (sectionId) => {
    if (window.confirm('Bạn có chắc muốn xóa section này?')) {
      const updatedSections = examData.sections.filter(section => section.id !== sectionId);
      updateExamData({ sections: updatedSections });
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    }
  };

  const toggleExpand = (sectionId) => {
    if (expandedSections.includes(sectionId)) {
      setExpandedSections(expandedSections.filter(id => id !== sectionId));
    } else {
      setExpandedSections([...expandedSections, sectionId]);
    }
  };

  const getSectionIcon = (type) => {
    return sectionTypes.find(s => s.value === type)?.icon || 'fa-file';
  };

  const getSectionLabel = (type) => {
    return sectionTypes.find(s => s.value === type)?.label || type;
  };

  // Nhóm sections theo skill type và sắp xếp theo part
  const groupedSections = () => {
    const groups = {};
    examData.sections.forEach(section => {
      if (!groups[section.type]) {
        groups[section.type] = [];
      }
      groups[section.type].push(section);
    });

    // Sắp xếp sections trong mỗi group theo part
    Object.keys(groups).forEach(type => {
      groups[type].sort((a, b) => (a.part || 1) - (b.part || 1));
    });

    return groups;
  };

  const groups = groupedSections();

  return (
    <div>
      {/* Section Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="text-neutral-900 fw-semibold mb-0">Sections của đề thi (Nhóm theo kỹ năng)</h6>
        <Button
          variant="primary"
          size="sm"
          icon="ph ph-plus"
          onClick={addSection}
        >
          Thêm Section
        </Button>
      </div>

      {/* Sections List */}
      {examData.sections.length === 0 ? (
        <div className="text-center py-5">
          <i className="ph ph-clipboard-text text-neutral-300" style={{ fontSize: '48px' }}></i>
          <p className="text-neutral-600 mt-3 mb-2">Chưa có section nào</p>
          <p className="text-sm text-neutral-500 mb-3">Nhấn "Thêm Section" để bắt đầu</p>
          <Button
            variant="outline"
            icon="ph ph-plus"
            onClick={addSection}
          >
            Thêm Section đầu tiên
          </Button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {/* Hiển thị theo từng skill group */}
          {Object.keys(groups).map(skillType => (
            <div key={skillType} className="border border-neutral-300 rounded-lg p-3 bg-neutral-25">
              {/* Skill Group Header */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center justify-content-center rounded bg-main-600 text-white" style={{ width: '36px', height: '36px' }}>
                  <i className={`ph ${getSectionIcon(skillType)}`} style={{ fontSize: '18px' }}></i>
                </div>
                <div>
                  <h6 className="text-neutral-900 fw-bold mb-0 text-sm">
                    {getSectionLabel(skillType)} ({groups[skillType].length} part{groups[skillType].length > 1 ? 's' : ''})
                  </h6>
                  <p className="text-neutral-500 text-xs mb-0">
                    Tổng: {groups[skillType].reduce((sum, s) => sum + (s.questionCount || 0), 0)} câu •{' '}
                    {groups[skillType].reduce((sum, s) => sum + (s.duration || 0), 0)} phút
                  </p>
                </div>
              </div>

              {/* Parts trong skill này */}
              <div className="d-flex flex-column gap-2">
                {groups[skillType].map((section, partIndex) => {
                  const isExpanded = expandedSections.includes(section.id);

                  return (
                    <div
                      key={section.id}
                      className="border border-neutral-200 rounded overflow-hidden bg-white"
                    >
                      {/* Section Header */}
                      <div
                        className="d-flex align-items-center justify-content-between p-3 bg-neutral-50 cursor-pointer"
                        onClick={() => toggleExpand(section.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center justify-content-center rounded-circle bg-main-100 text-main-600 fw-bold" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                            {section.part || partIndex + 1}
                          </div>
                          <div>
                            <h6 className="text-neutral-900 fw-semibold mb-1 text-sm">
                              Part {section.part || partIndex + 1}
                            </h6>
                            <p className="text-neutral-500 text-xs mb-0">
                              {section.duration > 0 && `${section.duration} phút`}
                              {section.questionCount > 0 && ` • ${section.questionCount} câu hỏi`}
                            </p>
                          </div>
                        </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', padding: '0' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      title="Xóa section"
                    >
                      <i className="ph ph-trash" style={{ fontSize: '16px' }}></i>
                    </button>
                    <i className={`ph ph-caret-${isExpanded ? 'up' : 'down'} text-neutral-500`}></i>
                  </div>
                </div>

                      {/* Section Content */}
                      {isExpanded && (
                        <div className="p-3 border-top border-neutral-200">
                          <div className="row g-3">
                            {/* Section Type */}
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-neutral-900">
                                Loại kỹ năng <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-select"
                                value={section.type}
                                onChange={(e) => updateSection(section.id, 'type', e.target.value)}
                              >
                                {sectionTypes.map(type => (
                                  <option key={type.value} value={type.value}>
                                    {type.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Part Number */}
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-neutral-900">
                                Số thứ tự Part <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="1"
                                min="1"
                                value={section.part || 1}
                                onChange={(e) => updateSection(section.id, 'part', parseInt(e.target.value) || 1)}
                              />
                              <small className="text-neutral-500">Ví dụ: TOEIC Listening có Part 1,2,3,4</small>
                            </div>

                            {/* Duration and Question Count */}
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-neutral-900">
                                Thời gian (phút) <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="30"
                                min="0"
                                value={section.duration}
                                onChange={(e) => updateSection(section.id, 'duration', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-neutral-900">
                                Số câu hỏi <span className="text-danger">*</span>
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                placeholder="10"
                                min="0"
                                value={section.questionCount}
                                onChange={(e) => updateSection(section.id, 'questionCount', parseInt(e.target.value) || 0)}
                              />
                            </div>

                            {/* Section Instructions */}
                            <div className="col-12">
                              <label className="form-label fw-semibold text-neutral-900">
                                Hướng dẫn
                              </label>
                              <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Hướng dẫn cho part này..."
                                value={section.instructions}
                                onChange={(e) => updateSection(section.id, 'instructions', e.target.value)}
                              />
                            </div>

                            {/* Upload Files based on section type */}
                            <div className="col-12">
                              <label className="form-label fw-semibold text-neutral-900">
                                Tải lên file đề bài PDF <span className="text-danger">*</span>
                              </label>
                              <PDFUploader
                                currentFileUrl={section.fileUrl}
                                onUpload={(url) => updateSection(section.id, 'fileUrl', url)}
                                sectionType={section.type}
                              />
                            </div>

                            {/* Upload Audio File for Listening Section */}
                            {section.type === 'listening' && (
                              <div className="col-12">
                                <label className="form-label fw-semibold text-neutral-900">
                                  Tải lên file đề nghe (Audio) <span className="text-danger">*</span>
                                </label>
                                <div className="border border-neutral-200 rounded p-3">
                                  <input
                                    type="file"
                                    className="form-control"
                                    accept="audio/*,.mp3,.wav,.m4a"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        // TODO: Upload file to server and get URL
                                        // For now, we'll just store the file name
                                        const audioUrl = URL.createObjectURL(file);
                                        updateSection(section.id, 'audioUrls', [audioUrl]);
                                      }
                                    }}
                                  />
                                  <p className="text-xs text-neutral-500 mt-2 mb-0">
                                    <i className="ph ph-info me-1"></i>
                                    Hỗ trợ các định dạng: MP3, WAV, M4A
                                  </p>
                                  {section.audioUrls && section.audioUrls.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm text-neutral-700 mb-2 fw-semibold">File audio đã tải lên:</p>
                                      {section.audioUrls.map((audioUrl, idx) => (
                                        <div key={idx} className="d-flex align-items-center gap-2 p-2 bg-neutral-50 rounded">
                                          <i className="ph ph-file-audio text-main-600"></i>
                                          <span className="text-sm flex-grow-1">Audio file {idx + 1}</span>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => {
                                              const newAudioUrls = section.audioUrls.filter((_, i) => i !== idx);
                                              updateSection(section.id, 'audioUrls', newAudioUrls);
                                            }}
                                          >
                                            <i className="ph ph-trash"></i>
                                          </button>
                                        </div>
                                      ))}
                                      <audio controls className="w-100 mt-2">
                                        <source src={section.audioUrls[0]} />
                                        Trình duyệt không hỗ trợ phát audio.
                                      </audio>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step2AddSections;
