import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
<<<<<<< HEAD
=======
import { useNavigate } from 'react-router-dom';
>>>>>>> origin/Namvv-teacher-class-management
import { useAuth } from '../../contexts/AuthContext';
import changeRequestService from '../../services/changeRequestService';

/**
 * Request Absence Modal Component
 * Modal cho phép học viên xin nghỉ học
 */
const RequestAbsenceModal = ({ show, onHide, schedule, onSuccess }) => {
  const { user } = useAuth();
<<<<<<< HEAD
=======
  const navigate = useNavigate();
>>>>>>> origin/Namvv-teacher-class-management
  const [formData, setFormData] = useState({
    description: ''
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Log student ID and studentScheduleId when modal opens
  useEffect(() => {
    if (show && schedule) {
      const studentId = user?._id || user?.id;
      const studentScheduleId = schedule.studentScheduleId;
      
      console.log('=== Modal xin nghỉ học được mở ===');
      console.log('1. Student ID:', studentId);
      console.log('2. StudentScheduleId:', studentScheduleId);
    }
  }, [show, schedule, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate studentScheduleId exists
      if (!schedule.studentScheduleId) {
        setError('Thiếu thông tin buổi học. Vui lòng thử lại.');
        setLoading(false);
        return;
      }

      // Prepare request data
      const requestData = {
        type: 'makeup_class',
        studentScheduleId: schedule.studentScheduleId,
        content: formData.description
      };

      // Call API to create change request
      const response = await changeRequestService.createChangeRequest(requestData);

      if (response.success) {
        // Success - reset form and close modal
        setFormData({
          description: ''
        });
        setValidated(false);

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        onHide();
<<<<<<< HEAD
=======
        
        // Redirect to applications page with success state
        navigate('/student/applications', { state: { showSuccessToast: true } });
>>>>>>> origin/Namvv-teacher-class-management
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi đơn xin nghỉ. Vui lòng thử lại.');
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Có lỗi xảy ra khi gửi đơn xin nghỉ. Vui lòng thử lại.';
      setError(errorMessage);
      console.error('Error submitting absence request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        description: ''
      });
      setValidated(false);
      setError('');
      onHide();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      {/* Modal Header */}
      <Modal.Header 
        className="bg-warning-600 text-white border-0 p-24"
        closeButton
        closeVariant="white"
      >
        <div>
          <Modal.Title className="fw-bold text-18 mb-4">
            <i className="fas fa-hand-paper me-2"></i>
            Đơn xin nghỉ học
          </Modal.Title>
          <p className="mb-0 text-15" style={{ opacity: 0.95 }}>
            Gửi đơn xin nghỉ buổi học
          </p>
        </div>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body className="p-24">
        {error && (
          <Alert variant="danger" className="mb-20 rounded-8" dismissible onClose={() => setError('')}>
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Schedule Information */}
        {schedule && (
          <div className="bg-warning-50 border border-warning-200 rounded-12 p-20 mb-24">
            <h6 className="text-neutral-900 fw-semibold mb-12">
              <i className="fas fa-info-circle text-warning-600 me-2"></i>
              Thông tin buổi học
            </h6>
            <div className="d-flex flex-column gap-8">
              <div className="d-flex">
                <span className="text-neutral-500 text-13" style={{ minWidth: '120px' }}>
                  Ngày học:
                </span>
                <span className="text-neutral-900 fw-medium text-13">
                  {formatDate(schedule.date)}
                </span>
              </div>
              <div className="d-flex">
                <span className="text-neutral-500 text-13" style={{ minWidth: '120px' }}>
                  Thời gian:
                </span>
                <span className="text-neutral-900 fw-medium text-13">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </div>
              <div className="d-flex">
                <span className="text-neutral-500 text-13" style={{ minWidth: '120px' }}>
                  Chủ đề:
                </span>
                <span className="text-neutral-900 fw-medium text-13">
                  Buổi {schedule.lessonNumber} - {schedule.topic}
                </span>
              </div>
              <div className="d-flex">
                <span className="text-neutral-500 text-13" style={{ minWidth: '120px' }}>
                  Giảng viên:
                </span>
                <span className="text-neutral-900 fw-medium text-13">
                  {schedule.teacher}
                </span>
              </div>
              <div className="d-flex">
                <span className="text-neutral-500 text-13" style={{ minWidth: '120px' }}>
                  Phòng học:
                </span>
                <span className="text-neutral-900 fw-medium text-13">
                  {schedule.room}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Request Form */}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-20">
            <Form.Label className="text-neutral-900 fw-semibold text-13 mb-8">
              Chi tiết lý do <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Mô tả chi tiết lý do xin nghỉ học..."
              className="border-neutral-30 radius-8 px-16 py-10 text-13"
            />
            <Form.Control.Feedback type="invalid" className="text-13">
              Vui lòng nhập chi tiết lý do nghỉ học
            </Form.Control.Feedback>
            <Form.Text className="text-neutral-500 text-12 mt-8">
              Cung cấp thông tin chi tiết giúp giáo vụ xử lý đơn nhanh hơn
            </Form.Text>
          </Form.Group>
<<<<<<< HEAD

          {/* Important Notice */}
          <Alert variant="info" className="bg-info-50 border-info-200 rounded-8 mb-0">
            <div className="d-flex gap-12">
              <i className="fas fa-info-circle text-info-500 mt-1"></i>
              <div>
                <h6 className="text-neutral-900 fw-semibold text-13 mb-8">
                  Lưu ý quan trọng:
                </h6>
                <ul className="text-neutral-700 text-13 mb-0 ps-20">
                  <li className="mb-4">
                    Đơn xin nghỉ cần được gửi trước buổi học ít nhất 2 giờ
                  </li>
                  <li className="mb-4">
                    Giáo vụ sẽ xem xét và phản hồi trong vòng 24 giờ
                  </li>
                  <li className="mb-4">
                    Bạn có thể theo dõi trạng thái đơn trong mục "Lịch sử xin nghỉ"
                  </li>
                  <li>
                    Nghỉ quá 3 buổi không phép có thể ảnh hưởng đến kết quả học tập
                  </li>
                </ul>
              </div>
            </div>
          </Alert>
=======
>>>>>>> origin/Namvv-teacher-class-management
        </Form>
      </Modal.Body>

      {/* Modal Footer */}
      <Modal.Footer className="bg-neutral-25 border-0 p-20">
        <Button
          variant="link"
          onClick={handleClose}
          disabled={loading}
          className="text-neutral-700 text-13 fw-medium text-decoration-none"
        >
          <i className="fas fa-times me-2"></i>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-warning text-white text-13 fw-semibold px-24 py-12 radius-8"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang gửi...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Gửi đơn xin nghỉ
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequestAbsenceModal;
