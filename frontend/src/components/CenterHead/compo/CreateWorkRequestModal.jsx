import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from './Modal';
import Button from './Button';

/**
 * CreateWorkRequestModal - Modal tạo work request từ Center Head
 *
 * @param {boolean} show - Hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {function} onSuccess - Callback khi tạo thành công
 * @param {string} requestType - Loại request: 'create_program' | 'create_exam' | 'assign_students'
 * @param {array} assigneeList - Danh sách người được giao việc (Subject Leaders hoặc Academic Staff)
 */
const CreateWorkRequestModal = ({
  show,
  onClose,
  onSuccess,
  requestType,
  assigneeList = []
}) => {
  const [formData, setFormData] = useState({
    assignedTo: '',
    requestNote: '',
    attachmentType: 'none', // 'none' | 'link' | 'file'
    attachmentUrl: '',
    attachmentFile: null,
  });

  const [loading, setLoading] = useState(false);

  // Reset form khi modal mở
  useEffect(() => {
    if (show) {
      setFormData({
        assignedTo: '',
        requestNote: '',
        attachmentType: 'none',
        attachmentUrl: '',
        attachmentFile: null,
      });
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      attachmentFile: file
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.assignedTo) {
      toast.warning('Vui lòng chọn người được giao việc!', { position: 'top-right' });
      return;
    }

    if (!formData.requestNote.trim()) {
      toast.warning('Vui lòng nhập ghi chú yêu cầu!', { position: 'top-right' });
      return;
    }

    if (formData.attachmentType === 'link' && !formData.attachmentUrl.trim()) {
      toast.warning('Vui lòng nhập link tham khảo!', { position: 'top-right' });
      return;
    }

    if (formData.attachmentType === 'file' && !formData.attachmentFile) {
      toast.warning('Vui lòng chọn file đính kèm!', { position: 'top-right' });
      return;
    }

    setLoading(true);

    try {
      // Prepare data to send
      const requestData = {
        assignedTo: formData.assignedTo,
        requestNote: formData.requestNote,
        attachmentType: formData.attachmentType,
      };

      if (formData.attachmentType === 'link') {
        requestData.attachmentUrl = formData.attachmentUrl;
      }

      if (formData.attachmentType === 'file') {
        requestData.attachmentFile = formData.attachmentFile;
      }

      // Call parent callback
      await onSuccess(requestData);

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating work request:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo yêu cầu!', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (requestType) {
      case 'create_program':
        return 'Tạo yêu cầu: Tạo chương trình mới';
      case 'create_exam':
        return 'Tạo yêu cầu: Tạo đề thi mới';
      case 'assign_students':
        return 'Tạo yêu cầu: Tạo lớp';
      default:
        return 'Tạo yêu cầu mới';
    }
  };

  const getAssigneeLabel = () => {
    switch (requestType) {
      case 'create_program':
      case 'create_exam':
        return 'Chọn Subject Leader';
      case 'assign_students':
        return 'Chọn Academic Staff';
      default:
        return 'Chọn người được giao việc';
    }
  };

  const getPlaceholderExample = () => {
    switch (requestType) {
      case 'create_program':
        return 'Ví dụ: Tạo chương trình IELTS Band 6.0-7.0, deadline 15/01/2025, cần có 15 courses...';
      case 'create_exam':
        return 'Ví dụ: Tạo đề thi IELTS Reading Part 1, deadline 20/01/2025, 40 câu hỏi...';
      case 'assign_students':
        return 'Ví dụ: Cấp tài khoản cho 50 học viên lớp IELTS 6.0 khai giảng ngày 25/01/2025, file Excel đính kèm...';
      default:
        return 'Mô tả chi tiết yêu cầu, deadline, yêu cầu đặc biệt...';
    }
  };

  const getFileAcceptTypes = () => {
    if (requestType === 'assign_students') {
      return '.xlsx,.xls'; // Chỉ nhận file Excel cho cấp tài khoản
    }
    return '.pdf,.doc,.docx,.zip,.rar';
  };

  const getFileHelpText = () => {
    if (requestType === 'assign_students') {
      return 'Chấp nhận: File Excel (.xlsx, .xls) chứa danh sách học viên (tối đa 10MB)';
    }
    return 'Chấp nhận: PDF, Word, ZIP, RAR (tối đa 10MB)';
  };

  return (
    <Modal show={show} onClose={onClose} size="lg">
      <div className="modal-header">
        <h5 className="modal-title fw-bold">{getTitle()}</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      <div className="modal-body">
        <div className="row g-3">
          {/* Chọn người được giao việc */}
          <div className="col-12">
            <label className="form-label fw-semibold">
              Giao cho <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
            >
              <option value="">-- {getAssigneeLabel()} --</option>
              {assigneeList.map(user => (
                <option key={user._id} value={user._id}>
                  {user.username} - {user.email} {user.role && `[${user.role}]`}
                </option>
              ))}
            </select>
            {assigneeList.length === 0 && (
              <div className="form-text text-warning">
                <i className="ph ph-warning me-1"></i>
                Không tìm thấy người dùng phù hợp. Vui lòng kiểm tra lại role trong hệ thống.
              </div>
            )}
          </div>

          {/* Ghi chú yêu cầu */}
          <div className="col-12">
            <label className="form-label fw-semibold">
              Ghi chú yêu cầu <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              name="requestNote"
              value={formData.requestNote}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả chi tiết yêu cầu, deadline, yêu cầu đặc biệt..."
              required
            />
            <div className="form-text">
              {getPlaceholderExample()}
            </div>
          </div>

          {/* Loại đính kèm */}
          <div className="col-12">
            <label className="form-label fw-semibold">
              Tài liệu tham khảo
            </label>
            <div className="d-flex gap-3 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="attachmentType"
                  id="attachmentNone"
                  value="none"
                  checked={formData.attachmentType === 'none'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="attachmentNone">
                  Không có
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="attachmentType"
                  id="attachmentLink"
                  value="link"
                  checked={formData.attachmentType === 'link'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="attachmentLink">
                  Link tham khảo
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="attachmentType"
                  id="attachmentFile"
                  value="file"
                  checked={formData.attachmentType === 'file'}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="attachmentFile">
                  File đính kèm
                </label>
              </div>
            </div>

            {/* Link input */}
            {formData.attachmentType === 'link' && (
              <input
                type="url"
                className="form-control"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleChange}
                placeholder="https://example.com/document.pdf"
              />
            )}

            {/* File input */}
            {formData.attachmentType === 'file' && (
              <div>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept={getFileAcceptTypes()}
                />
                {formData.attachmentFile && (
                  <div className="mt-2 text-sm text-success">
                    <i className="ph ph-check-circle me-1"></i>
                    Đã chọn: {formData.attachmentFile.name} ({(formData.attachmentFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
                <div className="form-text">
                  {getFileHelpText()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="modal-footer">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Đang tạo...
            </>
          ) : (
            <>
              <i className="ph ph-paper-plane-tilt me-2"></i>
              Gửi yêu cầu
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default CreateWorkRequestModal;
