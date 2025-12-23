import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

const ExamStep1BasicInfo = ({ examData, setExamData, onNext }) => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case 'title':
        if (!value || !value.trim()) {
          errors.title = 'Tên đề thi là bắt buộc';
        } else if (value.trim().length < 3) {
          errors.title = 'Tên đề thi phải có ít nhất 3 ký tự';
        } else if (value.trim().length > 200) {
          errors.title = 'Tên đề thi không được vượt quá 200 ký tự';
        }
        break;

      case 'examType':
        if (!value) {
          errors.examType = 'Loại đề thi là bắt buộc';
        } else {
          const validExamTypes = ['ielts', 'toeic', 'cambridge'];
          if (!validExamTypes.includes(value)) {
            errors.examType = 'Loại đề thi không hợp lệ';
          }
        }
        break;

      case 'totalDuration':
        const duration = value === '' ? '' : parseInt(value) || 0;
        if (value === '' || duration === '') {
          errors.totalDuration = 'Thời gian làm bài là bắt buộc';
        } else if (duration <= 0) {
          errors.totalDuration = 'Thời gian phải lớn hơn 0 phút';
        } else if (duration < 30) {
          errors.totalDuration = 'Thời gian làm bài tối thiểu là 30 phút';
        } else if (duration > 300) {
          errors.totalDuration = 'Thời gian làm bài tối đa là 300 phút';
        }
        break;

      case 'description':
        if (value && value.length > 1000) {
          errors.description = 'Mô tả không được vượt quá 1000 ký tự';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'totalDuration' ? (value === '' ? '' : parseInt(value) || 0) : value;

    setExamData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Real-time validation
    const fieldErrors = validateField(name, processedValue);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name] || ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const missingFields = [];
    const invalidFields = [];

    // Validate title
    if (!examData.title || !examData.title.trim()) {
      newErrors.title = 'Tên đề thi là bắt buộc';
      missingFields.push('Tên đề thi');
    } else if (examData.title.trim().length < 3) {
      newErrors.title = 'Tên đề thi phải có ít nhất 3 ký tự';
      invalidFields.push('Tên đề thi phải có ít nhất 3 ký tự');
    } else if (examData.title.trim().length > 200) {
      newErrors.title = 'Tên đề thi không được vượt quá 200 ký tự';
      invalidFields.push('Tên đề thi không được vượt quá 200 ký tự');
    }

    // Validate examType
    if (!examData.examType) {
      newErrors.examType = 'Loại đề thi là bắt buộc';
      missingFields.push('Loại đề thi');
    } else {
      const validExamTypes = ['ielts', 'toeic', 'cambridge'];
      if (!validExamTypes.includes(examData.examType)) {
        newErrors.examType = 'Loại đề thi không hợp lệ';
        invalidFields.push('Loại đề thi không hợp lệ');
      }
    }

    // Validate totalDuration
    if (!examData.totalDuration || examData.totalDuration === '') {
      newErrors.totalDuration = 'Thời gian làm bài là bắt buộc';
      missingFields.push('Tổng thời gian làm bài');
    } else if (examData.totalDuration <= 0) {
      newErrors.totalDuration = 'Thời gian phải lớn hơn 0 phút';
      invalidFields.push('Thời gian làm bài phải lớn hơn 0 phút');
    } else if (examData.totalDuration < 30) {
      newErrors.totalDuration = 'Thời gian làm bài tối thiểu là 30 phút';
      invalidFields.push('Thời gian làm bài tối thiểu là 30 phút');
    } else if (examData.totalDuration > 300) {
      newErrors.totalDuration = 'Thời gian làm bài tối đa là 300 phút';
      invalidFields.push('Thời gian làm bài tối đa là 300 phút');
    }

    // Validate description if provided
    if (examData.description && examData.description.length > 1000) {
      newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
      invalidFields.push('Mô tả không được vượt quá 1000 ký tự');
    }

    setErrors(newErrors);

    // Show toastify notification for missing fields
    if (missingFields.length > 0) {
      toast.error(
        <div>
          <div className="d-flex align-items-center mb-2">
            <i className="ph ph-warning-circle fs-4 me-2"></i>
            <strong>Thiếu thông tin bắt buộc:</strong>
          </div>
          <ul className="mb-0 ps-3 mt-1">
            {missingFields.map((field, index) => (
              <li key={index} className="text-danger">{field}</li>
            ))}
          </ul>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { minWidth: '300px' }
        }
      );
      return false;
    }

    // Show toastify notification for invalid fields
    if (invalidFields.length > 0) {
      toast.error(
        <div>
          <div className="d-flex align-items-center mb-2">
            <i className="ph ph-x-circle fs-4 me-2"></i>
            <strong>Thông tin không hợp lệ:</strong>
          </div>
          <ul className="mb-0 ps-3 mt-1">
            {invalidFields.map((field, index) => (
              <li key={index} className="text-warning">{field}</li>
            ))}
          </ul>
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: { minWidth: '300px' }
        }
      );
      return false;
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleValidate = () => {
    const isValid = validateForm();
    if (isValid) {
      toast.success(
        <div className="d-flex align-items-center">
          <i className="ph ph-check-circle fs-4 me-2 text-success"></i>
          <span>Tất cả thông tin đã hợp lệ!</span>
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );
    }
    return isValid;
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

    toast.success(
      <div className="d-flex align-items-center">
        <span>Thông tin cơ bản đã được lưu thành công!</span>
      </div>,
      {
        position: 'top-right',
        autoClose: 3000,
      }
    );

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
          maxLength="200"
        />
        <div className="d-flex justify-content-between mt-1">
          <small className="text-muted">
            {examData.title?.length || 0}/200 ký tự
          </small>
          {errors.title && (
            <small className="text-danger">{errors.title}</small>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-semibold">Mô tả</label>
        <textarea
          className={`form-control ${errors.description ? 'is-invalid' : ''}`}
          name="description"
          value={examData.description}
          onChange={handleInputChange}
          rows="4"
          placeholder="Mô tả chi tiết về đề thi..."
          maxLength="1000"
        />
        <div className="d-flex justify-content-between mt-1">
          <small className="text-muted">
            {examData.description?.length || 0}/1000 ký tự
          </small>
          {errors.description && (
            <small className="text-danger">{errors.description}</small>
          )}
        </div>
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
          min="30"
          max="300"
          step="5"
        />
        <div className="d-flex justify-content-between mt-1">
          {errors.totalDuration && (
            <small className="text-danger">{errors.totalDuration}</small>
          )}
        </div>
        <small className="text-muted">
         Gợi ý: IELTS thường là 170 phút (Listening 40 + Reading 60 + Writing 60 + Speaking 10-15)
        </small>
      </div>


      <div className="d-flex justify-content-between gap-3 mt-4 pt-4 border-top">
        <div></div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleNext}>
            Tiếp theo
            <i className="ph ph-arrow-right ms-2"></i>
          </button>
        </div>
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
