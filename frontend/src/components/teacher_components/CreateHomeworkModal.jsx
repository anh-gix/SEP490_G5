import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import homeworkService from '../../services/homeworkService';

/**
 * CreateHomeworkModal Component
 * Modal to create new homework assignment with file uploads
 * Props: classId - ID of the class to create homework for
 */
const CreateHomeworkModal = ({ show, onHide, onSuccess, classId }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    deadline: ''
  });
  const [assignmentFiles, setAssignmentFiles] = useState([]);
  const [answerFiles, setAnswerFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState(null);

  // Fetch schedules when modal opens or classId changes
  useEffect(() => {
    if (show && classId) {
      fetchSchedules();
    } else {
      setSchedules([]);
      setSelectedSchedule('');
    }
  }, [show, classId]);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await homeworkService.getClassSchedules(classId);
      
      if (response.success) {
        setSchedules(response.schedules || []);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Không thể tải danh sách buổi học');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignmentFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Chỉ được upload tối đa 5 files đề bài');
      return;
    }
    setAssignmentFiles(files);
    setError(null);
  };

  const handleAnswerFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Chỉ được upload tối đa 5 files đáp án');
      return;
    }
    setAnswerFiles(files);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSchedule) {
      setError('Vui lòng chọn buổi học');
      return;
    }

    if (!formData.title.trim()) {
      setError('Vui lòng nhập tên bài tập');
      return;
    }

    if (!formData.deadline) {
      setError('Vui lòng chọn hạn nộp');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await homeworkService.addHomework(
        selectedSchedule,
        formData,
        assignmentFiles,
        answerFiles
      );

      // Reset form
      setSelectedSchedule('');
      setFormData({ title: '', deadline: '' });
      setAssignmentFiles([]);
      setAnswerFiles([]);
      
      // Notify parent
      if (onSuccess) onSuccess();
      
      onHide();
    } catch (err) {
      console.error('Error creating homework:', err);
      setError(err.message || 'Không thể tạo bài tập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const removeAssignmentFile = (index) => {
    setAssignmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAnswerFile = (index) => {
    setAnswerFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-plus-circle text-main-600 me-2"></i>
          Giao bài tập mới
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Schedule Selection */}
          <Form.Group className="mb-20">
            <Form.Label className="fw-semibold">
              Chọn buổi học <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="rounded-8"
              disabled={loadingSchedules}
              required
            >
              <option value="">
                {loadingSchedules ? 'Đang tải...' : '-- Chọn buổi học --'}
              </option>
              {schedules.map(schedule => {
                const scheduleDate = new Date(schedule.date);
                const dateStr = scheduleDate.toLocaleDateString('vi-VN');
                const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
                return (
                  <option key={schedule._id} value={schedule._id}>
                    Buổi {schedule.order} - {dateStr} ({timeStr})
                    {schedule.session?.title && ` - ${schedule.session.title}`}
                  </option>
                );
              })}
            </Form.Select>
            {schedules.length === 0 && !loadingSchedules && (
              <Form.Text className="text-warning">
                <i className="fas fa-info-circle me-1"></i>
                Không có buổi học nào
              </Form.Text>
            )}
          </Form.Group>

          {/* Title */}
          <Form.Group className="mb-20">
            <Form.Label className="fw-semibold">
              Tên bài tập <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Bài tập nghe Part 1-2"
              className="rounded-8"
              required
            />
          </Form.Group>

          {/* Deadline */}
          <Form.Group className="mb-20">
            <Form.Label className="fw-semibold">
              Hạn nộp <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="rounded-8"
              required
            />
          </Form.Group>

          {/* Assignment Files */}
          <Form.Group className="mb-20">
            <Form.Label className="fw-semibold">
              File đề bài <span className="text-muted">(Tùy chọn, tối đa 5 files)</span>
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleAssignmentFileChange}
              className="rounded-8"
            />
            <Form.Text className="text-muted">
              Chấp nhận: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (tối đa 50MB/file)
            </Form.Text>
            
            {/* File List */}
            {assignmentFiles.length > 0 && (
              <div className="mt-12 p-12 bg-light rounded-8">
                <div className="text-sm fw-semibold mb-8">
                  <i className="fas fa-paperclip me-2"></i>
                  {assignmentFiles.length} file đề bài:
                </div>
                <ul className="list-unstyled mb-0">
                  {assignmentFiles.map((file, index) => (
                    <li key={index} className="d-flex align-items-center justify-content-between py-4">
                      <span className="text-sm">
                        <i className="fas fa-file text-main-600 me-2"></i>
                        {file.name}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => removeAssignmentFile(index)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form.Group>

          {/* Answer Files */}
          <Form.Group className="mb-0">
            <Form.Label className="fw-semibold">
              File đáp án <span className="text-muted">(Tùy chọn, tối đa 5 files)</span>
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleAnswerFileChange}
              className="rounded-8"
            />
            <Form.Text className="text-muted">
              Chấp nhận: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (tối đa 50MB/file)
            </Form.Text>
            
            {/* File List */}
            {answerFiles.length > 0 && (
              <div className="mt-12 p-12 bg-success-50 rounded-8">
                <div className="text-sm fw-semibold mb-8 text-success-600">
                  <i className="fas fa-check-circle me-2"></i>
                  {answerFiles.length} file đáp án:
                </div>
                <ul className="list-unstyled mb-0">
                  {answerFiles.map((file, index) => (
                    <li key={index} className="d-flex align-items-center justify-content-between py-4">
                      <span className="text-sm">
                        <i className="fas fa-file-check text-success-600 me-2"></i>
                        {file.name}
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => removeAnswerFile(index)}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="light" 
            onClick={onHide}
            disabled={loading}
            className="rounded-8"
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading}
            className="btn-main rounded-8"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang tạo...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Tạo bài tập
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateHomeworkModal;
