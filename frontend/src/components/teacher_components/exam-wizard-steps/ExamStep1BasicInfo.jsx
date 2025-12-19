import { useState } from 'react';
import PropTypes from 'prop-types';

const ExamStep1BasicInfo = ({ examData, setExamData, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExamData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!examData.title.trim()) {
      newErrors.title = 'Tên đề thi là bắt buộc';
    }
    if (!examData.examType) {
      newErrors.examType = 'Loại đề thi là bắt buộc';
    }
    if (!examData.totalDuration || examData.totalDuration <= 0) {
      newErrors.totalDuration = 'Thời gian phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    // Update lastCompletedStep to 1
    setExamData(prev => ({
      ...prev,
      lastCompletedStep: 1
    }));

    onNext();
  };

  return (
    <div className="exam-step-1">
      <div className="mb-4">
        <label className="form-label fw-semibold">
          Tên đề thi <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          name="title"
          value={examData.title}
          onChange={handleInputChange}
          placeholder="VD: IELTS Academic Practice Test 1"
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">Mô tả</label>
        <textarea
          className="form-control"
          name="description"
          value={examData.description}
          onChange={handleInputChange}
          rows="4"
          placeholder="Mô tả chi tiết về đề thi..."
        />
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">
          Loại đề thi <span className="text-danger">*</span>
        </label>
        <div className="d-flex gap-3">
          {['ielts', 'toeic', 'cambridge'].map(type => (
            <div key={type} className="form-check form-check-card flex-fill">
              <input
                className="form-check-input d-none"
                type="radio"
                name="examType"
                id={`examType-${type}`}
                value={type}
                checked={examData.examType === type}
                onChange={handleInputChange}
              />
              <label
                className={`form-check-label w-100 text-center p-3 border rounded cursor-pointer ${examData.examType === type ? 'active-exam-type' : ''}`}
                htmlFor={`examType-${type}`}
                style={{ cursor: 'pointer' }}
              >
                <i className="ph ph-exam fs-4 d-block mb-2"></i>
                <strong className="text-uppercase">{type}</strong>
              </label>
            </div>
          ))}
        </div>
        {errors.examType && <div className="text-danger text-sm mt-1">{errors.examType}</div>}
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">
          Tổng thời gian làm bài (phút) <span className="text-danger">*</span>
        </label>
        <input
          type="number"
          className={`form-control ${errors.totalDuration ? 'is-invalid' : ''}`}
          name="totalDuration"
          value={examData.totalDuration}
          onChange={handleInputChange}
          placeholder="170"
          min="0"
        />
        {errors.totalDuration && <div className="invalid-feedback">{errors.totalDuration}</div>}
        <small className="text-muted">
          💡 Gợi ý: IELTS thường là 170 phút (Listening 40 + Reading 60 + Writing 60 + Speaking 10-15)
        </small>
      </div>

      <div className="alert alert-warning d-flex align-items-start gap-2">
        <i className="ph ph-warning fs-5"></i>
        <div className="text-sm">
          <strong>Lưu ý:</strong>
          <ul className="mb-0 ps-3 mt-2">
            <li>Tất cả các trường có dấu <span className="text-danger">*</span> là bắt buộc</li>
            <li>Thông tin sẽ được tự động lưu khi bạn chuyển sang bước 2</li>
          </ul>
        </div>
      </div>

      <div className="d-flex justify-content-between gap-3 mt-4 pt-4 border-top">
        <div></div>
        <button className="btn btn-primary" onClick={handleNext}>
          Tiếp theo
          <i className="ph ph-arrow-right ms-2"></i>
        </button>
      </div>

      <style jsx>{`
        .active-exam-type {
          background-color: #eff6ff;
          border-color: #3b82f6 !important;
          border-width: 2px !important;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

ExamStep1BasicInfo.propTypes = {
  examData: PropTypes.object.isRequired,
  setExamData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
};

export default ExamStep1BasicInfo;
