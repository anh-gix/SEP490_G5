import React from 'react';
import PDFUploader from './PDFUploader';
import AudioUploader from './AudioUploader';
import AnswerKeyForm from './AnswerKeyForm';

const SectionForm = ({ section, sectionIndex, updateSection, deleteSection }) => {
  const sectionTypeIcons = {
    listening: 'fa-headphones',
    reading: 'fa-book-open',
    writing: 'fa-pen',
    speaking: 'fa-microphone'
  };

  const sectionTypeLabels = {
    listening: 'Listening',
    reading: 'Reading',
    writing: 'Writing',
    speaking: 'Speaking'
  };

  const handleFieldChange = (field, value) => {
    const updatedSection = { ...section, [field]: value };

    // Auto-calculate maxScore when answerKey changes
    if (field === 'answerKey') {
      const maxScore = value.reduce((sum, answer) => sum + (parseFloat(answer.maxScore) || 0), 0);
      updatedSection.maxScore = maxScore;
      updatedSection.questionCount = value.length;
    }

    updateSection(section.id, updatedSection);
  };

  const handlePDFUpload = (fileUrl) => {
    handleFieldChange('fileUrl', fileUrl);
  };

  const handleAudioUpload = (audioUrl) => {
    handleFieldChange('audioUrl', audioUrl);
  };

  return (
    <div className="bg-white rounded-16 border border-neutral-200 overflow-hidden">
      {/* Section Header */}
      <div className="px-24 py-16 border-bottom border-neutral-200 bg-neutral-50">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="text-neutral-900 fw-semibold mb-4 text-sm d-flex align-items-center gap-8">
              <span>Section {sectionIndex + 1}:</span>
              <i className={`fas ${sectionTypeIcons[section.type]} text-main-600 text-xs`}></i>
              <span>{sectionTypeLabels[section.type]}</span>
            </h6>
            <p className="text-neutral-500 mb-0 text-xs">
              Cấu hình chi tiết cho section này
            </p>
          </div>

          <button
            className="btn btn-sm bg-transparent border-0 text-danger-600 hover-text-danger-700 w-32 h-32 d-flex align-items-center justify-content-center"
            onClick={() => deleteSection(section.id)}
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-24">
        {/* Section Type */}
        <div className="mb-24">
          <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
            Loại Section <span className="text-danger-600">*</span>
          </label>
          <select
            className="form-select radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
            value={section.type}
            onChange={(e) => handleFieldChange('type', e.target.value)}
          >
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>
        </div>

        {/* PDF Upload for Reading/Writing/Speaking */}
        {(section.type === 'reading' || section.type === 'writing' || section.type === 'speaking') && (
          <div className="mb-24">
            <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
              Tải Lên Đề Thi (PDF) <span className="text-danger-600">*</span>
            </label>
            <PDFUploader
              currentFileUrl={section.fileUrl}
              onUpload={handlePDFUpload}
              sectionType={section.type}
            />
          </div>
        )}

        {/* PDF + Audio Upload for Listening */}
        {section.type === 'listening' && (
          <>
            <div className="mb-24">
              <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
                Tải Lên Đề Thi (PDF) <span className="text-danger-600">*</span>
              </label>
              <PDFUploader
                currentFileUrl={section.fileUrl}
                onUpload={handlePDFUpload}
                sectionType={section.type}
              />
            </div>
            <div className="mb-24">
              <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
                Tải Lên File Audio <span className="text-danger-600">*</span>
              </label>
              <AudioUploader
                currentAudioUrl={section.audioUrl}
                onUpload={handleAudioUpload}
              />
            </div>
          </>
        )}

        {/* Instructions */}
        <div className="mb-24">
          <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
            Hướng Dẫn
          </label>
          <textarea
            className="form-control radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
            rows="3"
            placeholder="Nhập hướng dẫn cho section này..."
            value={section.instructions}
            onChange={(e) => handleFieldChange('instructions', e.target.value)}
          />
        </div>

        {/* Duration, Question Count, Max Score Row */}
        <div className="row g-3 mb-24">
          <div className="col-md-4">
            <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
              Thời Gian (phút) <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
              placeholder="0"
              min="0"
              value={section.duration}
              onChange={(e) => handleFieldChange('duration', e.target.value)}
            />
          </div>

          <div className="col-md-4">
            <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
              Số Câu Hỏi <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8 bg-neutral-100 border-neutral-200 text-sm px-16 py-12"
              placeholder="0"
              min="0"
              value={section.answerKey?.length || 0}
              readOnly
              disabled
            />
          </div>

          <div className="col-md-4">
            <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
              Tổng Điểm <span className="text-danger-600">*</span>
            </label>
            <input
              type="number"
              className="form-control radius-8 bg-neutral-100 border-neutral-200 text-sm px-16 py-12"
              placeholder="0"
              value={section.maxScore || 0}
              readOnly
              disabled
            />
          </div>
        </div>

        {/* Answer Key Section - Only show for Reading and Listening */}
        {(section.type === 'reading' || section.type === 'listening') && (
          <div className="border-top border-neutral-200 pt-24">
            <div className="d-flex align-items-center justify-content-between mb-16">
              <h6 className="text-neutral-900 fw-semibold mb-0 text-sm">Đáp Án</h6>
              <span className="text-neutral-500 text-xs">{section.answerKey?.length || 0} câu</span>
            </div>
            <AnswerKeyForm
              answerKey={section.answerKey || []}
              onAnswerKeyChange={(newAnswerKey) => handleFieldChange('answerKey', newAnswerKey)}
              sectionType={section.type}
            />
          </div>
        )}

        {/* Note for Writing and Speaking sections */}
        {(section.type === 'writing' || section.type === 'speaking') && (
          <div className="border-top border-neutral-200 pt-24">
            <div className="bg-info-50 border border-info-200 rounded-12 p-16">
              <div className="d-flex align-items-start gap-12">
                <i className="fas fa-info-circle text-info-600 text-sm mt-2"></i>
                <div>
                  <p className="text-info-900 fw-medium mb-4 text-sm">
                    {section.type === 'writing' ? 'Section Writing' : 'Section Speaking'}
                  </p>
                  <p className="text-info-700 mb-0 text-xs">
                    {section.type === 'writing'
                      ? 'Với section Writing, chỉ cần tải lên file PDF đề bài. Bài làm của học viên sẽ được giám khảo chấm thủ công.'
                      : 'Với section Speaking, chỉ cần tải lên file PDF đề bài. Bài thi nói của học viên sẽ được giám khảo chấm thủ công.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionForm;
