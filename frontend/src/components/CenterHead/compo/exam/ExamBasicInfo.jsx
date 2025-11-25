import React from 'react';

const ExamBasicInfo = ({ examData, updateExamBasicInfo }) => {
  return (
    <div className="bg-white rounded-16 border border-neutral-200 p-24">
      {/* Exam Title */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
          Tên Đề Thi <span className="text-danger-600">*</span>
        </label>
        <input
          type="text"
          className="form-control radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
          placeholder="VD: IELTS Practice Test 1"
          value={examData.title}
          onChange={(e) => updateExamBasicInfo('title', e.target.value)}
        />
      </div>

      {/* Exam Description */}
      <div className="mb-24">
        <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
          Mô Tả
        </label>
        <textarea
          className="form-control radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
          rows="4"
          placeholder="Mô tả chi tiết về đề thi..."
          value={examData.description}
          onChange={(e) => updateExamBasicInfo('description', e.target.value)}
        />
      </div>

      {/* Exam Type and Level Row */}
      <div className="row g-3">
        <div className="col-md-6">
          <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
            Cấp Độ <span className="text-danger-600">*</span>
          </label>
          <select
            className="form-select radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
            value={examData.level}
            onChange={(e) => updateExamBasicInfo('level', e.target.value)}
          >
            <option value="Academic">Academic</option>
            <option value="General">General</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="text-neutral-900 fw-semibold mb-8 d-block text-sm">
            Loại Đề <span className="text-danger-600">*</span>
          </label>
          <select
            className="form-select radius-8 bg-neutral-50 border-neutral-200 text-sm px-16 py-12"
            value={examData.examType}
            onChange={(e) => updateExamBasicInfo('examType', e.target.value)}
          >
            <option value="practice">Luyện Tập</option>
            <option value="real">Chính Thức</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ExamBasicInfo;
