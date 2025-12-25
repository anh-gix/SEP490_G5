import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import teacherService from '../../../../services/teacherService';
import homeworkService from '../../../../services/homeworkService';

const MaterialModal = ({ show, onHide, onSuccess, classId }) => {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [files, setFiles] = useState([]); // Array of { file: File, title: string }
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [error, setError] = useState(null);

  // Fetch schedules when modal opens
  useEffect(() => {
    if (show && classId) {
      fetchSchedules();
    } else {
      setSchedules([]);
      setSelectedSchedule('');
      setFiles([]);
      setError(null);
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 10) {
      setError('Chỉ được upload tối đa 10 files');
      return;
    }
    
    // Check file size (50MB = 50 * 1024 * 1024 bytes)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => f.name).join(', ');
      setError(`File vượt quá 50MB: ${fileNames}. Vui lòng chọn file nhỏ hơn 50MB.`);
      // Clear the input
      e.target.value = '';
      return;
    }
    
    // Create objects with file and default title (filename without extension)
    const fileObjects = selectedFiles.map(file => ({
      file: file,
      title: file.name.replace(/\.[^/.]+$/, '') // Remove extension for default title
    }));
    setFiles(fileObjects);
    setError(null);
  };

  const updateFileTitle = (index, newTitle) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, title: newTitle } : item
    ));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSchedule) {
      setError('Vui lòng chọn buổi học');
      return;
    }

    if (files.length === 0) {
      setError('Vui lòng chọn ít nhất 1 file');
      return;
    }

    // Double check file size before submit (safety measure)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    const oversizedFiles = files.filter(item => item.file.size > maxSize);
    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(item => item.file.name).join(', ');
      setError(`File vượt quá 50MB: ${fileNames}. Vui lòng chọn file nhỏ hơn 50MB.`);
      return;
    }

    // Confirmation dialog
    const selectedScheduleInfo = schedules.find(s => s._id === selectedSchedule);
    const result = await Swal.fire({
      title: 'Xác nhận thêm tài liệu',
      html: `
        <p>Bạn có chắc chắn muốn thêm <strong>${files.length} file</strong> cho:</p>
        <p class="text-primary mb-0">Buổi ${selectedScheduleInfo?.order || ''} - ${selectedScheduleInfo?.session?.title || ''}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0D74FF',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Thêm tài liệu',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      setError(null);

      // Extract just the File objects for upload
      const fileList = files.map(item => item.file);
      const titles = files.map(item => item.title);

      await teacherService.addMaterialToSchedule(selectedSchedule, fileList, titles);

      toast.success('Thêm tài liệu thành công!', {
        position: 'top-right',
        autoClose: 3000
      });

      // Reset form
      setSelectedSchedule('');
      setFiles([]);
      
      // Notify parent
      if (onSuccess) onSuccess();
      
      onHide();
    } catch (err) {
      console.error('Error adding materials:', err);
      const errorMsg = err.message || 'Không thể thêm tài liệu. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg, {
        position: 'top-right',
        autoClose: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-upload text-main-600 me-2"></i>
          Thêm tài liệu cho lớp
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

          {/* File Upload */}
          <Form.Group className="mb-0">
            <Form.Label className="fw-semibold">
              Chọn file <span className="text-danger">*</span>
              <span className="text-muted fw-normal"> (Tối đa 10 files)</span>
            </Form.Label>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
              onChange={handleFileChange}
              className="rounded-8"
            />
            <Form.Text className="text-muted">
              Chấp nhận: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, RAR (tối đa 50MB/file)
            </Form.Text>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-12 p-12 bg-light rounded-8">
                <div className="text-sm fw-semibold mb-8">
                  <i className="fas fa-paperclip me-2"></i>
                  {files.length} file đã chọn:
                </div>
                <div className="d-flex flex-column gap-2">
                  {files.map((item, index) => (
                    <div key={index} className="bg-white p-12 rounded-8 border">
                      <div className="d-flex align-items-start gap-2 mb-8">
                        <div className="flex-grow-1">
                          <div className="text-sm text-muted mb-4">
                            <i className="fas fa-file text-main-600 me-2"></i>
                            {item.file.name}
                            <span className="ms-2">({(item.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <Form.Group className="mb-0">
                            <Form.Label className="text-xs fw-semibold mb-1">
                              Tiêu đề tài liệu:
                            </Form.Label>
                            <Form.Control
                              type="text"
                              size="sm"
                              value={item.title}
                              onChange={(e) => updateFileTitle(index, e.target.value)}
                              placeholder="Nhập tiêu đề cho tài liệu..."
                              className="rounded-6"
                            />
                          </Form.Group>
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeFile(index)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
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
                <Spinner animation="border" size="sm" className="me-2" />
                Đang thêm...
              </>
            ) : (
              <>
                
                Thêm tài liệu
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MaterialModal;
