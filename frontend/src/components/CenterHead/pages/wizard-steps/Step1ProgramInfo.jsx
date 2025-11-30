import { useState } from 'react';
import Button from '../../compo/Button';
import programService from '../../../../services/programService';

const Step1ProgramInfo = ({ programData, setProgramData, onNext, isEdit }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProgramData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!programData.code.trim()) {
      newErrors.code = 'Mã chương trình là bắt buộc';
    }
    if (!programData.program_name.trim()) {
      newErrors.program_name = 'Tên chương trình là bắt buộc';
    }
    if (!programData.type) {
      newErrors.type = 'Loại chương trình là bắt buộc';
    }
    if (!programData.level) {
      newErrors.level = 'Cấp độ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        alert('Không tìm thấy thông tin user. Vui lòng đăng nhập lại!');
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      if (!userId) {
        alert('Không tìm thấy ID user. Vui lòng đăng nhập lại!');
        return;
      }

      const dataToSave = {
        code: programData.code,
        program_name: programData.program_name,
        description: programData.description,
        type: programData.type,
        level: programData.level,
        band: programData.band,
        tuitionFee: programData.tuitionFee || 0,
        plos: programData.plos,
        createdBy: userId,
        status: 'draft'
      };

      let response;
      if (isEdit && programData._id) {
        response = await programService.updateProgram(programData._id, dataToSave);
      } else {
        response = await programService.createProgram(dataToSave);
      }

      // Update programData with the saved data including _id
      setProgramData(prev => ({
        ...prev,
        _id: response.data._id,
        ...response.data
      }));

      alert(isEdit ? 'Cập nhật thông tin chương trình thành công!' : 'Tạo chương trình thành công!');
      onNext();
    } catch (error) {
      console.error('Error saving program:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu chương trình!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="row gy-3">
        {/* Mã chương trình */}
        <div className="col-md-6">
          <label className="form-label fw-semibold text-neutral-900">
            Mã chương trình <span className="text-danger-600">*</span>
          </label>
          <input
            type="text"
            name="code"
            value={programData.code}
            onChange={handleInputChange}
            className={`form-control radius-8 ${errors.code ? 'is-invalid' : ''}`}
            placeholder="Ví dụ: IELTS-B1"
            disabled={isEdit} // Không cho sửa mã khi edit
          />
          {errors.code && <div className="invalid-feedback">{errors.code}</div>}
        </div>

        {/* Tên chương trình */}
        <div className="col-md-6">
          <label className="form-label fw-semibold text-neutral-900">
            Tên chương trình <span className="text-danger-600">*</span>
          </label>
          <input
            type="text"
            name="program_name"
            value={programData.program_name}
            onChange={handleInputChange}
            className={`form-control radius-8 ${errors.program_name ? 'is-invalid' : ''}`}
            placeholder="Ví dụ: Chương trình IELTS B1"
          />
          {errors.program_name && <div className="invalid-feedback">{errors.program_name}</div>}
        </div>

        {/* Loại chương trình */}
        <div className="col-md-4">
          <label className="form-label fw-semibold text-neutral-900">
            Loại chương trình <span className="text-danger-600">*</span>
          </label>
          <select
            name="type"
            value={programData.type}
            onChange={handleInputChange}
            className={`form-select radius-8 ${errors.type ? 'is-invalid' : ''}`}
          >
            <option value="">-- Chọn loại --</option>
            <option value="ielts">IELTS</option>
            <option value="toeic">TOEIC</option>
            <option value="toefl">TOEFL</option>
            <option value="general-english">General English</option>
            <option value="business-english">Business English</option>
          </select>
          {errors.type && <div className="invalid-feedback">{errors.type}</div>}
        </div>

        {/* Cấp độ */}
        <div className="col-md-4">
          <label className="form-label fw-semibold text-neutral-900">
            Cấp độ <span className="text-danger-600">*</span>
          </label>
          <select
            name="level"
            value={programData.level}
            onChange={handleInputChange}
            className={`form-select radius-8 ${errors.level ? 'is-invalid' : ''}`}
          >
            <option value="">-- Chọn cấp độ --</option>
            <option value="Pre-A1">Pre-A1</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>
          {errors.level && <div className="invalid-feedback">{errors.level}</div>}
        </div>

        {/* Band */}
        <div className="col-md-4">
          <label className="form-label fw-semibold text-neutral-900">
            Band (IELTS/TOEIC)
          </label>
          <input
            type="text"
            name="band"
            value={programData.band}
            onChange={handleInputChange}
            className="form-control radius-8"
            placeholder="Ví dụ: 4.0-5.0 hoặc 550-650"
          />
        </div>

        {/* Học phí */}
        <div className="col-md-6">
          <label className="form-label fw-semibold text-neutral-900">
            Học phí (VNĐ)
          </label>
          <input
            type="number"
            name="tuitionFee"
            value={programData.tuitionFee}
            onChange={handleInputChange}
            className="form-control radius-8"
            placeholder="0"
            min="0"
          />
        </div>

        {/* Mô tả */}
        <div className="col-12">
          <label className="form-label fw-semibold text-neutral-900">
            Mô tả chương trình
          </label>
          <textarea
            name="description"
            value={programData.description}
            onChange={handleInputChange}
            className="form-control radius-8"
            rows="4"
            placeholder="Nhập mô tả chi tiết về chương trình..."
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-3 mt-24">
        <Button
          variant="primary"
          onClick={handleSaveAndNext}
          disabled={loading}
          icon={loading ? 'ph ph-spinner-gap spinner' : 'ph ph-arrow-right'}
          iconPosition="right"
        >
          {loading ? 'Đang lưu...' : (isEdit ? 'Lưu & Tiếp tục' : 'Lưu & Tiếp tục')}
        </Button>
      </div>

      <style jsx>{`
        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Step1ProgramInfo;
