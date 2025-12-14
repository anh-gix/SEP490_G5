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
          <option value="cambridge">Cambridge</option>
          <option value="ielts">IELTS</option>
          <option value="toeic">TOEIC</option>
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

      {/* isPublished Toggle */}
      <div className="col-12">
        <div className="border border-neutral-200 rounded p-3 bg-neutral-25">
          <div className="d-flex align-items-start justify-content-between">
            <div className="flex-grow-1 me-3">
              <label className="form-label fw-semibold text-neutral-900 mb-2 d-block">
                Hiển thị đề thi
              </label>
              <div className="text-sm text-neutral-600 mb-2">
                <div className="mb-1">
                  <i className="ph ph-globe me-1 text-success"></i>
                  <strong>Bật (Public):</strong> Đề thi hiển thị trên trang web chính, khách (guest) có thể xem và làm bài
                </div>
                <div>
                  <i className="ph ph-users me-1 text-primary"></i>
                  <strong>Tắt (Private):</strong> Chỉ học viên (student) đã đăng ký trong hệ thống mới có thể làm bài
                </div>
              </div>
            </div>
            <div className="form-check form-switch" style={{ transform: 'scale(1.5)', marginTop: '8px' }}>
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="isPublishedSwitch"
                checked={examData.isPublished || false}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
            </div>
          </div>
          <div className="mt-2">
            <span className={`badge ${examData.isPublished ? 'bg-success' : 'bg-primary'}`}>
              {examData.isPublished ? (
                <>
                  <i className="ph ph-globe me-1"></i>
                  Đề trên trang web (Public)
                </>
              ) : (
                <>
                  <i className="ph ph-users me-1"></i>
                  Đề luyện thi cho student (Private)
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
