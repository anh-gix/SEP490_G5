import React, { useState } from 'react';
import { Modal, Button, Form, Alert, ListGroup } from 'react-bootstrap';
import studentService from '../../../services/studentService';

/**
 * Submit Homework Modal Component
 * Modal để học viên nộp bài tập
 */
const SubmitHomeworkModal = ({ show, onHide, homework, classId, onSubmitSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file size (max 50MB per file)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError('Một số file vượt quá 50MB. Vui lòng chọn file nhỏ hơn.');
      return;
    }

    // Validate file count (max 5 files)
    if (files.length > 5) {
      setError('Chỉ được chọn tối đa 5 file.');
      return;
    }

    setSelectedFiles(files);
    setError(null);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setError('Vui lòng chọn ít nhất một file để nộp');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create FormData
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      if (notes) {
        formData.append('notes', notes);
      }

      // Submit homework
      const response = await studentService.submitHomework(
        classId,
        homework.scheduleId,
        homework._id,
        formData
      );

      if (response.success) {
        // Success callback
        if (onSubmitSuccess) {
          onSubmitSuccess(response);
        }
        
        // Reset form
        setSelectedFiles([]);
        setNotes('');
        onHide();
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      setError(error.message || 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFiles([]);
      setNotes('');
      setError(null);
      onHide();
    }
  };

  if (!homework) return null;

  const isDeadlinePassed = new Date() > new Date(homework.deadline);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-neutral-900 fw-bold">
          <i className="fas fa-upload me-2 text-main-600"></i>
          Nộp bài tập
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-24 py-20">
        {/* Homework Info */}
        <div className="bg-main-25 rounded-12 p-16 mb-20">
          <h6 className="text-neutral-900 fw-semibold mb-8">{homework.title}</h6>
          <div className="d-flex gap-16 text-13 text-neutral-600">
            <span>
              <i className="fas fa-calendar-alt me-1"></i>
              Hạn nộp: {new Date(homework.deadline).toLocaleDateString('vi-VN')} {new Date(homework.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isDeadlinePassed && (
              <span className="text-danger-600">
                <i className="fas fa-exclamation-triangle me-1"></i>
                Đã quá hạn
              </span>
            )}
          </div>
        </div>

        {isDeadlinePassed && (
          <Alert variant="warning" className="mb-16">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Bài tập đã quá hạn nộp. Nếu nộp bài bây giờ sẽ được đánh dấu là <strong>Nộp trễ</strong>.
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-16" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {/* File Upload */}
          <Form.Group className="mb-16">
            <Form.Label className="text-neutral-900 fw-semibold mb-8">
              <i className="fas fa-paperclip me-2"></i>
              Chọn file nộp bài <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Form.Text className="text-neutral-500">
              Chấp nhận: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR (Tối đa 5 file, mỗi file &lt;50MB)
            </Form.Text>
          </Form.Group>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mb-16">
              <div className="text-neutral-700 fw-semibold mb-8 text-14">
                File đã chọn ({selectedFiles.length})
              </div>
              <ListGroup>
                {selectedFiles.map((file, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center py-12"
                  >
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-file text-main-600"></i>
                      <div>
                        <div className="text-neutral-900 text-14">{file.name}</div>
                        <div className="text-neutral-500 text-12">{formatFileSize(file.size)}</div>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger-600 p-0"
                      onClick={() => removeFile(index)}
                      disabled={loading}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* Notes */}
          <Form.Group className="mb-0">
            <Form.Label className="text-neutral-900 fw-semibold mb-8">
              <i className="fas fa-comment me-2"></i>
              Ghi chú (Tùy chọn)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Thêm ghi chú cho giảng viên..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          className="btn-main"
          onClick={handleSubmit}
          disabled={loading || selectedFiles.length === 0}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang nộp bài...
            </>
          ) : (
            <>
              <i className="fas fa-upload me-2"></i>
              Nộp bài
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubmitHomeworkModal;
