import React from 'react';

const Step1BasicInfo = ({ examData, updateExamData }) => {
  const handleChange = (field, value) => {
    updateExamData({ [field]: value });
  };

  return (
    <div className="row g-3">
      {/* Exam Title */}
      <div className="col-12">
        <label className="form-label fw-semibold text-neutral-900">
          Tên đề thi <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="VD: IELTS Practice Test 1"
          value={examData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
      </div>

      {/* Exam Description */}
      <div className="col-12">
        <label className="form-label fw-semibold text-neutral-900">
          Mô tả đề thi
        </label>
        <textarea
          className="form-control"
          rows="4"
          placeholder="Mô tả chi tiết về đề thi..."
          value={examData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>

      {/* Exam Type */}
      <div className="col-md-6">
        <label className="form-label fw-semibold text-neutral-900">
          Loại đề thi <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={examData.examType}
          onChange={(e) => handleChange('examType', e.target.value)}
        >
          <option value="practice">Luyện tập</option>
          <option value="real">Chính thức</option>
        </select>
      </div>

      {/* Level */}
      <div className="col-md-6">
        <label className="form-label fw-semibold text-neutral-900">
          Cấp độ <span className="text-danger">*</span>
        </label>
        <select
          className="form-select"
          value={examData.level}
          onChange={(e) => handleChange('level', e.target.value)}
        >
          <option value="Academic">Academic</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Total Duration */}
      <div className="col-12">
        <label className="form-label fw-semibold text-neutral-900">
          Tổng thời gian làm bài (phút) <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          className="form-control"
          placeholder="180"
          min="0"
          value={examData.totalDuration}
          onChange={(e) => handleChange('totalDuration', parseInt(e.target.value) || 0)}
          required
        />
        <div className="text-sm text-neutral-600 mt-2">
          <i className="ph ph-info me-1"></i>
          Tổng thời gian làm bài cho toàn bộ đề thi
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
