import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import homeworkService from '../../../services/homeworkService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Homework Detail Modal Component
 * Modal để xem chi tiết bài tập, nộp bài, xem bài đã nộp
 */
const HomeworkDetailModal = ({ show, onHide, homework, classId, onSubmitSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (show && homework) {
      setIsEditing(false);
      setSelectedFiles([]);
      if (homework.status !== 'not_submitted') {
        fetchSubmission();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, homework]);

  const fetchSubmission = async () => {
    if (!homework || homework.status === 'not_submitted') return;

    try {
      setLoadingSubmission(true);
      const response = await homeworkService.getMySubmission(
        classId,
        homework.scheduleId,
        homework._id
      );
      setSubmissionData(response.submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setLoadingSubmission(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types (only PDF and Word)
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const invalidFiles = files.filter(f => {
      const ext = '.' + f.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(ext);
    });
    
    if (invalidFiles.length > 0) {
      setError(`Chỉ chấp nhận file PDF và Word. File không hợp lệ: ${invalidFiles.map(f => f.name).join(', ')}`);
      e.target.value = '';
      return;
    }
    
    // Validate file size (max 50MB per file)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setError('Một số file vượt quá 50MB. Vui lòng chọn file nhỏ hơn.');
      e.target.value = '';
      return;
    }

    // Validate total file count (existing + new max 5 files)
    if (selectedFiles.length + files.length > 5) {
      setError('Chỉ được chọn tối đa 5 file.');
      e.target.value = '';
      return;
    }

    // Add new files to existing list
    setSelectedFiles([...selectedFiles, ...files]);
    setError(null);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'File đã nộp';
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

      // Separate existing files and new files
      const newFiles = selectedFiles.filter(f => !f.isExisting);
      
      // If no new files selected, just keep existing files (no submission needed)
      if (newFiles.length === 0 && isEditing) {
        setError('Vui lòng thêm ít nhất một file mới hoặc giữ nguyên file cũ');
        setLoading(false);
        return;
      }

      // Submit homework using homeworkService with only new files
      const response = await homeworkService.submitHomework(
        classId,
        homework.scheduleId,
        homework._id,
        newFiles
      );

      if (response.success) {
        // Success callback
        if (onSubmitSuccess) {
          onSubmitSuccess(response);
        }
        
        // Refresh submission data
        await fetchSubmission();
        
        // Reset form and exit edit mode
        setSelectedFiles([]);
        setIsEditing(false);
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
      setError(null);
      setSubmissionData(null);
      setIsEditing(false);
      onHide();
    }
  };

  const handleEditSubmission = () => {
    setIsEditing(true);
    // Convert existing submission files to File objects for display
    if (submissionData && submissionData.files && submissionData.files.length > 0) {
      const existingFiles = submissionData.files.map((filePath) => {
        const fileName = filePath.split('/').pop();
        // Create a pseudo File object with necessary properties
        return {
          name: fileName,
          path: filePath,
          isExisting: true, // Mark as existing file
          size: 0 // Size unknown for existing files
        };
      });
      setSelectedFiles(existingFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedFiles([]);
    setError(null);
  };

  const getFileIcon = (fileName) => {
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(fileExt)) {
      return { icon: 'fa-file-pdf', color: 'text-danger-600' };
    } else if (['doc', 'docx'].includes(fileExt)) {
      return { icon: 'fa-file-word', color: 'text-primary-600' };
    } else if (['xls', 'xlsx'].includes(fileExt)) {
      return { icon: 'fa-file-excel', color: 'text-success-600' };
    } else if (['ppt', 'pptx'].includes(fileExt)) {
      return { icon: 'fa-file-powerpoint', color: 'text-warning-600' };
    } else if (['zip', 'rar'].includes(fileExt)) {
      return { icon: 'fa-file-archive', color: 'text-neutral-700' };
    }
    return { icon: 'fa-file', color: 'text-neutral-600' };
  };

  if (!homework) return null;

  const isDeadlinePassed = new Date() > new Date(homework.deadline);
  const canSubmit = homework.status === 'not_submitted' || homework.status === 'submitted' || homework.status === 'late';
  const hasSubmitted = homework.status === 'submitted' || homework.status === 'late' || homework.status === 'graded';

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-neutral-900 fw-bold d-flex align-items-center gap-3">
          <i className="fas fa-tasks text-main-600"></i>
          {homework.title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-24 py-20">
        {/* Homework Info */}
        <div className="bg-main-25 rounded-12 p-16 mb-20">
          <Row>
            <Col md={6}>
              <div className="text-neutral-600 text-13 mb-8">
                <i className="fas fa-book-reader me-2"></i>
                Buổi {homework.lessonNumber}: {homework.lessonTitle}
              </div>
            </Col>
            <Col md={6}>
              <div className="text-neutral-600 text-13">
                <i className="fas fa-calendar-alt me-2"></i>
                Hạn nộp: <strong className={isDeadlinePassed && homework.status === 'not_submitted' ? 'text-danger-600' : ''}>
                  {new Date(homework.deadline).toLocaleDateString('vi-VN')} {new Date(homework.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </strong>
              </div>
            </Col>
          </Row>

          {isDeadlinePassed && homework.status === 'not_submitted' && (
            <Alert variant="danger" className="mb-0 mt-12 py-8 px-12">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Bài tập đã quá hạn nộp. Nếu nộp bài bây giờ sẽ được đánh dấu là <strong>Nộp trễ</strong>.
            </Alert>
          )}
        </div>

        {error && (
          <Alert variant="danger" className="mb-16" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Row>
          {/* Left Column: Assignment & Answer Files */}
          <Col md={hasSubmitted ? 6 : 12}>
            {/* Assignment Files */}
            <Card className="border-0 shadow-sm mb-16">
              <Card.Header className="bg-primary-50 border-0 py-12">
                <h6 className="mb-0 text-14 fw-semibold text-neutral-900">
                  <i className="fas fa-file-alt me-2 text-primary-600"></i>
                  File đề bài ({homework.assignmentFiles?.length || 0})
                </h6>
              </Card.Header>
              <Card.Body className="p-12">
                {homework.assignmentFiles && homework.assignmentFiles.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {homework.assignmentFiles.map((file, idx) => {
                      const fileName = file.split('/').pop();
                      const fileIconData = getFileIcon(fileName);
                      return (
                        <div key={idx} className="d-flex justify-content-between align-items-center p-8 border border-neutral-200 rounded-8">
                          <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <i className={`fas ${fileIconData.icon} ${fileIconData.color}`}></i>
                            <span className="text-13 text-neutral-900">File đề bài {idx + 1}</span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary-600 p-0 text-12"
                            onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                          >
                            <i className="fas fa-download me-1"></i>
                            Tải
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <i className="fas fa-inbox fa-2x text-neutral-300 mb-8"></i>
                    <p className="text-neutral-500 mb-0 text-13">Không có file đề bài</p>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Answer Files */}
            {homework.answerFiles && homework.answerFiles.length > 0 && (
              <Card className="border-0 shadow-sm mb-16">
                <Card.Header className="bg-success-50 border-0 py-12">
                  <h6 className="mb-0 text-14 fw-semibold text-neutral-900">
                    <i className="fas fa-file-check me-2 text-success-600"></i>
                    File đáp án ({homework.answerFiles.length})
                  </h6>
                </Card.Header>
                <Card.Body className="p-12">
                  <div className="d-flex flex-column gap-2">
                    {homework.answerFiles.map((file, idx) => {
                      const fileName = file.split('/').pop();
                      const fileIconData = getFileIcon(fileName);
                      return (
                        <div key={idx} className="d-flex justify-content-between align-items-center p-8 border border-neutral-200 rounded-8">
                          <div className="d-flex align-items-center gap-2 flex-grow-1">
                            <i className={`fas ${fileIconData.icon} ${fileIconData.color}`}></i>
                            <span className="text-13 text-neutral-900">File đáp án {idx + 1}</span>
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-success-600 p-0 text-12"
                            onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                          >
                            <i className="fas fa-download me-1"></i>
                            Tải
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          {/* Right Column: Student Submission */}
          {hasSubmitted && (
            <Col md={6}>
              <Card className="border-0 shadow-sm mb-16">
                <Card.Header className="bg-info-50 border-0 py-12">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-0 text-14 fw-semibold text-neutral-900">
                      <i className="fas fa-file-upload me-2 text-info-600"></i>
                      Bài nộp của bạn
                    </h6>
                    <div className="d-flex flex-column align-items-end gap-1">
                      <div className="d-flex gap-2 align-items-center">
                        {submissionData && (
                          <Badge bg={submissionData.isLate ? 'danger' : 'success'} className="px-8 py-4 text-11">
                            <i className={`fas ${submissionData.isLate ? 'fa-exclamation-circle' : 'fa-check-circle'} me-1`}></i>
                            {submissionData.isLate ? 'Nộp muộn' : 'Nộp đúng hạn'}
                          </Badge>
                        )}
                        {submissionData && submissionData.score !== null && submissionData.score !== undefined && (
                          <Badge bg="warning" className="px-8 py-4 text-11">
                            <i className="fas fa-star me-1"></i>
                            {submissionData.score}/10
                          </Badge>
                        )}
                      </div>
                      {submissionData && submissionData.submittedAt && (
                        <div className="text-neutral-600 text-11">
                          <i className="fas fa-clock me-1"></i>
                          {new Date(submissionData.submittedAt).toLocaleDateString('vi-VN')} {new Date(submissionData.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-12">
                  {loadingSubmission ? (
                    <div className="text-center py-20">
                      <div className="spinner-border spinner-border-sm text-primary mb-8" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <p className="text-neutral-500 mb-0 text-13">Đang tải...</p>
                    </div>
                  ) : submissionData ? (
                    <>
                      {/* Edit/Add Files Section */}
                      {!isEditing && (
                        <div className="mb-12">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="w-100"
                            onClick={handleEditSubmission}
                          >
                            <i className="fas fa-edit me-2"></i>
                            Chỉnh sửa bài nộp
                          </Button>
                        </div>
                      )}

                      {/* File Upload Section (when editing) */}
                      {isEditing && (
                        <div className="mb-12">
                          {/* Selected Files List */}
                          {selectedFiles.length > 0 && (
                            <div className="mb-12">
                              <div className="text-neutral-700 fw-semibold mb-8 text-13">
                                File đã chọn ({selectedFiles.length}/5)
                              </div>
                              <div className="d-flex flex-column gap-2">
                                {selectedFiles.map((file, index) => {
                                  const fileIconData = getFileIcon(file.name);
                                  const isExistingFile = file.isExisting === true;
                                  return (
                                    <div
                                      key={index}
                                      className={`d-flex justify-content-between align-items-center p-8 rounded-8 ${
                                        isExistingFile ? 'bg-info-50 border border-info-200' : 'border border-neutral-200'
                                      }`}
                                    >
                                      <div className="d-flex align-items-center gap-2 flex-grow-1">
                                        <i className={`fas ${fileIconData.icon} ${fileIconData.color}`}></i>
                                        <div className="flex-grow-1">
                                          <div className="text-neutral-900 text-12">
                                            {file.name}
                                            {isExistingFile && (
                                              <Badge bg="info" className="ms-2 px-6 py-2 text-10">
                                                Đã nộp
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-neutral-500 text-11">{formatFileSize(file.size)}</div>
                                        </div>
                                      </div>
                                      <div className="d-flex gap-2 align-items-center">
                                        {isExistingFile && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="text-primary-600 p-0"
                                            onClick={() => window.open(`${API_URL}${file.path}`, '_blank')}
                                            title="Tải file"
                                          >
                                            <i className="fas fa-download"></i>
                                          </Button>
                                        )}
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="text-danger-600 p-0"
                                          onClick={() => removeFile(index)}
                                          disabled={loading}
                                          title="Xóa file"
                                        >
                                          <i className="fas fa-times"></i>
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* File Upload Button */}
                          <input
                            type="file"
                            id="fileInput"
                            multiple
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={loading || selectedFiles.length >= 5}
                            style={{ display: 'none' }}
                          />
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="w-100 mb-8"
                            onClick={() => document.getElementById('fileInput').click()}
                            disabled={loading || selectedFiles.length >= 5}
                          >
                            <i className="fas fa-plus me-2"></i>
                            {selectedFiles.length > 0 ? 'Thêm file bổ sung' : 'Chọn file nộp bài'}
                          </Button>
                          <Form.Text className="text-neutral-500 d-block mb-8 text-11">
                            <i className="fas fa-info-circle me-1"></i>
                            Chỉ chấp nhận file PDF và Word (Max 5 files, &lt;50MB/file)
                          </Form.Text>

                          {/* Action Buttons */}
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={loading}
                              className="flex-grow-1"
                            >
                              Hủy
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleSubmit}
                              disabled={loading || selectedFiles.filter(f => !f.isExisting).length === 0}
                              className="flex-grow-1"
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Đang nộp...
                                </>
                              ) : (
                                <>
                                  
                                  Nộp lại ({selectedFiles.filter(f => !f.isExisting).length} file mới)
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Display Content when not editing */}
                      {!isEditing && (
                        <>
                          {/* Feedback */}
                          {submissionData.feedback && (
                            <div className="p-12 bg-warning-50 rounded-8 mb-12">
                              <div className="text-neutral-700 text-13 fw-semibold mb-4">
                                <i className="fas fa-comment-dots me-1"></i>
                                Nhận xét:
                              </div>
                              <div className="text-neutral-800 text-13">
                                {submissionData.feedback}
                              </div>
                            </div>
                          )}

                          {/* Submitted Files */}
                          {submissionData.files && submissionData.files.length > 0 ? (
                            <div className="d-flex flex-column gap-2">
                              {submissionData.files.map((file, idx) => {
                                const fileName = file.split('/').pop();
                                const fileIconData = getFileIcon(fileName);
                                return (
                                  <div key={idx} className="d-flex justify-content-between align-items-center p-8 border border-neutral-200 rounded-8">
                                    <div className="d-flex align-items-center gap-2 flex-grow-1">
                                      <i className={`fas ${fileIconData.icon} ${fileIconData.color}`}></i>
                                      <span className="text-13 text-neutral-900 text-truncate">{fileName}</span>
                                    </div>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="text-primary-600 p-0 text-12"
                                      onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                                    >
                                      <i className="fas fa-download me-1"></i>
                                      Tải
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-20">
                              <i className="fas fa-inbox fa-2x text-neutral-300 mb-8"></i>
                              <p className="text-neutral-500 mb-0 text-13">Chưa có file nộp</p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <i className="fas fa-inbox fa-2x text-neutral-300 mb-8"></i>
                      <p className="text-neutral-500 mb-0 text-13">Chưa có bài nộp</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>

        {/* Submission Form - Only for not submitted */}
        {!hasSubmitted && canSubmit && (
          <Card className="border-0 shadow-sm mt-16">
            <Card.Header className="bg-main-50 border-0 py-12">
              <h6 className="mb-0 text-14 fw-semibold text-neutral-900">
                <i className="fas fa-upload me-2 text-main-600"></i>
                Nộp bài tập
              </h6>
            </Card.Header>
            <Card.Body className="p-16">
              <Form onSubmit={handleSubmit}>
                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="mb-16">
                    <div className="text-neutral-700 fw-semibold mb-8 text-13">
                      File đã chọn ({selectedFiles.length}/5)
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {selectedFiles.map((file, index) => {
                        const fileIconData = getFileIcon(file.name);
                        return (
                          <div
                            key={index}
                            className="d-flex justify-content-between align-items-center p-10 border border-neutral-200 rounded-8"
                          >
                            <div className="d-flex align-items-center gap-2 flex-grow-1">
                              <i className={`fas ${fileIconData.icon} ${fileIconData.color}`}></i>
                              <div className="flex-grow-1">
                                <div className="text-neutral-900 text-13">{file.name}</div>
                                <div className="text-neutral-500 text-11">{formatFileSize(file.size)}</div>
                              </div>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger-600 p-0"
                              onClick={() => removeFile(index)}
                              disabled={loading}
                              title="Xóa file"
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* File Upload Button */}
                <div className="mb-16">
                  <input
                    type="file"
                    id="fileInputFirst"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                    onChange={handleFileChange}
                    disabled={loading || selectedFiles.length >= 5}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="outline-primary"
                    className="w-100"
                    onClick={() => document.getElementById('fileInputFirst').click()}
                    disabled={loading || selectedFiles.length >= 5}
                  >
                    <i className="fas fa-plus me-2"></i>
                    {selectedFiles.length > 0 ? 'Thêm file bổ sung' : 'Chọn file nộp bài'}
                  </Button>
                  <Form.Text className="text-neutral-500 d-block mt-2 text-12">
                    Chấp nhận: PDF, Word, Excel, PowerPoint, TXT, ZIP, RAR (Tối đa 5 file, mỗi file &lt;50MB)
                  </Form.Text>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-grow-1"
                  >
                    Đóng
                  </Button>
                  <Button
                    className="btn-main flex-grow-1"
                    type="submit"
                    disabled={loading || selectedFiles.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang nộp...
                      </>
                    ) : (
                      <>
                        
                        Nộp bài
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HomeworkDetailModal;
