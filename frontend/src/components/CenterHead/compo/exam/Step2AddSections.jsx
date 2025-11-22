import React, { useState } from 'react';
import PDFUploader from './PDFUploader';

const Step2AddSections = ({ examData, updateExamData }) => {
  const [expandedSections, setExpandedSections] = useState([]);

  const sectionTypes = [
    { value: 'reading', label: 'Reading', icon: 'fa-book-open' },
    { value: 'listening', label: 'Listening', icon: 'fa-headphones' },
    { value: 'writing', label: 'Writing', icon: 'fa-pen' },
    { value: 'speaking', label: 'Speaking', icon: 'fa-microphone' }
  ];

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      type: 'reading',
      fileUrl: '',
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
    const updatedSections = examData.sections.map(section =>
      section.id === sectionId ? { ...section, [field]: value } : section
    );
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

  return (
    <div>
      {/* Section Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <h5 className="text-neutral-900 fw-semibold mb-0">Create Exam Sections</h5>
        <button
          className="btn btn-main px-20 py-10 radius-8 text-sm fw-medium d-flex align-items-center gap-8"
          onClick={addSection}
        >
          <i className="fas fa-plus"></i>
          Add Section
        </button>
      </div>

      {/* Sections List */}
      {examData.sections.length === 0 ? (
        <div className="bg-neutral-50 border border-neutral-200 border-dashed rounded-12 p-48 text-center">
          <div className="text-neutral-400 mb-16">
            <i className="fas fa-inbox" style={{ fontSize: '48px' }}></i>
          </div>
          <h6 className="text-neutral-700 fw-semibold mb-12">No sections yet</h6>
          <p className="text-neutral-500 text-sm mb-24">
            Start by adding the first section for your exam
          </p>
          <button
            className="btn btn-outline-main px-24 py-12 radius-8 text-sm fw-medium"
            onClick={addSection}
          >
            <i className="fas fa-plus me-8"></i>
            Add First Section
          </button>
        </div>
      ) : (
        <div className="d-flex flex-column gap-16">
          {examData.sections.map((section, index) => {
            const isExpanded = expandedSections.includes(section.id);

            return (
              <div
                key={section.id}
                className="border border-neutral-200 rounded-12 overflow-hidden bg-white"
              >
                {/* Section Header */}
                <div
                  className="d-flex align-items-center justify-content-between p-20 bg-neutral-50 cursor-pointer"
                  onClick={() => toggleExpand(section.id)}
                >
                  <div className="d-flex align-items-center gap-12">
                    <div className="w-40 h-40 d-flex align-items-center justify-content-center rounded-8 bg-main-600 text-white">
                      <i className={`fas ${getSectionIcon(section.type)}`}></i>
                    </div>
                    <div>
                      <h6 className="text-neutral-900 fw-semibold mb-4 text-sm">
                        Section {index + 1}
                      </h6>
                      <p className="text-neutral-500 text-xs mb-0">
                        {getSectionLabel(section.type)}
                        {section.duration > 0 && ` • ${section.duration} minutes`}
                        {section.questionCount > 0 && ` • ${section.questionCount} questions`}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-8">
                    <button
                      className="btn btn-sm bg-transparent border-0 text-danger-600 hover-text-danger-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-neutral-500`}></i>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-24 border-top border-neutral-200">
                    {/* Section Type */}
                    <div className="mb-24">
                      <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
                        Section Type <span className="text-danger-600">*</span>
                      </label>
                      <select
                        className="form-select radius-8 bg-neutral-50 border-neutral-200 px-16 py-12 text-sm"
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

                    {/* Duration and Question Count */}
                    <div className="row g-3 mb-24">
                      <div className="col-md-6">
                        <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
                          Duration (minutes) <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-12 text-sm"
                          placeholder="30"
                          min="0"
                          value={section.duration}
                          onChange={(e) => updateSection(section.id, 'duration', parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
                          Number of Questions <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-12 text-sm"
                          placeholder="10"
                          min="0"
                          value={section.questionCount}
                          onChange={(e) => updateSection(section.id, 'questionCount', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    {/* Section Instructions */}
                    <div className="mb-24">
                      <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
                        Section Instructions
                      </label>
                      <textarea
                        className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-12 text-sm"
                        rows="3"
                        placeholder="Instructions for this section..."
                        value={section.instructions}
                        onChange={(e) => updateSection(section.id, 'instructions', e.target.value)}
                      />
                    </div>

                    {/* Upload Section PDF */}
                    <div className="mb-24">
                      <label className="text-neutral-900 fw-semibold mb-12 d-block text-sm">
                        Upload Section PDF <span className="text-danger-600">*</span>
                      </label>
                      <PDFUploader
                        currentFileUrl={section.fileUrl}
                        onUpload={(url) => updateSection(section.id, 'fileUrl', url)}
                        sectionType={section.type}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Step2AddSections;
