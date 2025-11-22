import React from 'react';

const Step1BasicInfo = ({ examData, updateExamData }) => {
  const handleChange = (field, value) => {
    updateExamData({ [field]: value });
  };

  return (
    <div>
      {/* Exam Title */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block">
          Exam Title <span className="text-danger-600">*</span>
        </label>
        <input
          type="text"
          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-14 text-sm"
          placeholder="e.g., IELTS Practice Test 1"
          value={examData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
      </div>

      {/* Exam Description */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block">
          Exam Description
        </label>
        <textarea
          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-14 text-sm"
          rows="5"
          placeholder="Describe your exam..."
          value={examData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Exam Type */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block">
          Exam Type <span className="text-danger-600">*</span>
        </label>
        <div className="d-flex gap-16">
          <label className="d-flex align-items-center gap-8 cursor-pointer">
            <input
              type="radio"
              name="examType"
              value="practice"
              checked={examData.examType === 'practice'}
              onChange={(e) => handleChange('examType', e.target.value)}
              className="form-check-input m-0"
            />
            <span className="text-sm">Practice Exam</span>
          </label>
          <label className="d-flex align-items-center gap-8 cursor-pointer">
            <input
              type="radio"
              name="examType"
              value="real"
              checked={examData.examType === 'real'}
              onChange={(e) => handleChange('examType', e.target.value)}
              className="form-check-input m-0"
            />
            <span className="text-sm">Real Exam</span>
          </label>
        </div>
      </div>

      {/* Level */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block">
          Level <span className="text-danger-600">*</span>
        </label>
        <div className="d-flex gap-16">
          <label className="d-flex align-items-center gap-8 cursor-pointer">
            <input
              type="radio"
              name="level"
              value="Academic"
              checked={examData.level === 'Academic'}
              onChange={(e) => handleChange('level', e.target.value)}
              className="form-check-input m-0"
            />
            <span className="text-sm">Academic</span>
          </label>
          <label className="d-flex align-items-center gap-8 cursor-pointer">
            <input
              type="radio"
              name="level"
              value="General"
              checked={examData.level === 'General'}
              onChange={(e) => handleChange('level', e.target.value)}
              className="form-check-input m-0"
            />
            <span className="text-sm">General</span>
          </label>
        </div>
      </div>

      {/* Total Duration */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-12 d-block">
          Total Duration (minutes) <span className="text-danger-600">*</span>
        </label>
        <input
          type="number"
          className="form-control radius-8 bg-neutral-50 border-neutral-200 px-16 py-14 text-sm"
          placeholder="180"
          min="0"
          value={examData.totalDuration}
          onChange={(e) => handleChange('totalDuration', parseInt(e.target.value) || 0)}
        />
        <div className="text-neutral-500 text-xs mt-8">
          <i className="fas fa-info-circle me-4"></i>
          This will be the total duration for the entire exam
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
