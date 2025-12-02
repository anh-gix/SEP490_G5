import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, ListGroup, Badge, Tabs, Tab } from 'react-bootstrap';
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
  const [activeTab, setActiveTab] = useState('assignment');
  const [submissionData, setSubmissionData] = useState(null);
  const [loadingSubmission, setLoadingSubmission] = useState(false);

  useEffect(() => {
    if (show && homework) {
      // Set initial tab based on homework status
      if (homework.status === 'not_submitted') {
        setActiveTab('assignment');
      } else {
        setActiveTab('mySubmission');
        fetchSubmission();
      }
    }
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

      // Submit homework using homeworkService
      const response = await homeworkService.submitHomework(
        classId,
        homework.scheduleId,
        homework._id,
        selectedFiles
      );

      if (response.success) {
        // Success callback
        if (onSubmitSuccess) {
          onSubmitSuccess(response);
        }
        
        // Refresh submission data
        await fetchSubmission();
        
        // Reset form and switch to submission tab
        setSelectedFiles([]);
        setActiveTab('mySubmission');
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
      onHide();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      not_submitted: { bg: 'warning', text: 'Chưa nộp', icon: 'fa-clock' },
      submitted: { bg: 'info', text: 'Đã nộp', icon: 'fa-check' },
      late: { bg: 'danger', text: 'Nộp trễ', icon: 'fa-exclamation-triangle' }
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge bg={config.bg} className="px-12 py-6">
        <i className={`fas ${config.icon} me-2`}></i>
        {config.text}
      </Badge>
    );
  };

  if (!homework) return null;

  const isDeadlinePassed = new Date() > new Date(homework.deadline);
  const canSubmit = homework.status === 'not_submitted' || homework.status === 'submitted' || homework.status === 'late';

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-neutral-900 fw-bold d-flex align-items-center gap-3">
          <i className="fas fa-tasks text-main-600"></i>
          {homework.title}
          {getStatusBadge(homework.status)}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-24 py-20">
        {/* Homework Info */}
        <div className="bg-main-25 rounded-12 p-16 mb-20">
          <div className="d-flex justify-content-between align-items-start mb-12">
            <div className="flex-grow-1">
              <div className="text-neutral-600 text-13 mb-8">
                <i className="fas fa-book-reader me-2"></i>
                Buổi {homework.lessonNumber}: {homework.lessonTitle}
              </div>
              <div className="text-neutral-600 text-13">
                <i className="fas fa-calendar-alt me-2"></i>
                Hạn nộp: <strong>{new Date(homework.deadline).toLocaleDateString('vi-VN')} {new Date(homework.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
              </div>
            </div>
          </div>

          {homework.submittedAt && (
            <div className={`mt-12 p-12 rounded-8 ${homework.status === 'late' ? 'bg-danger-50' : 'bg-success-50'}`}>
              <div className="d-flex align-items-center gap-2">
                <i className={`fas ${homework.status === 'late' ? 'fa-exclamation-triangle text-danger-600' : 'fa-check-circle text-success-600'}`}></i>
                <span className="text-13 fw-semibold">
                  {homework.status === 'late' ? 'Đã nộp muộn' : 'Đã nộp đúng hạn'}
                </span>
                <span className="text-neutral-600 text-13 ms-auto">
                  {new Date(homework.submittedAt).toLocaleDateString('vi-VN')} {new Date(homework.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {isDeadlinePassed && homework.status === 'not_submitted' && (
            <Alert variant="danger" className="mb-0 mt-12">
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

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-20">
          {/* Tab: Assignment */}
          <Tab eventKey="assignment" title={<span><i className="fas fa-file-alt me-2"></i>Đề bài</span>}>
            <div className="pt-16">
              {homework.assignmentFiles && homework.assignmentFiles.length > 0 ? (
                <div>
                  <div className="text-neutral-700 text-14 fw-semibold mb-12">
                    <i className="fas fa-paperclip me-2"></i>
                    File đề bài ({homework.assignmentFiles.length})
                  </div>
                  <ListGroup>
                    {homework.assignmentFiles.map((file, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center py-12">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-file-pdf text-danger-600"></i>
                          <span className="text-14">File đề bài {idx + 1}</span>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                        >
                          <i className="fas fa-download me-2"></i>
                          Tải xuống
                        </Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              ) : (
                <div className="text-center py-32">
                  <i className="fas fa-inbox fa-3x text-neutral-300 mb-12"></i>
                  <p className="text-neutral-500 mb-0">Không có file đề bài</p>
                </div>
              )}
            </div>
          </Tab>

          {/* Tab: Answer Key */}
          {homework.answerFiles && homework.answerFiles.length > 0 && (
            <Tab eventKey="answer" title={<span><i className="fas fa-file-check me-2"></i>Đáp án</span>}>
              <div className="pt-16">
                <div className="text-neutral-700 text-14 fw-semibold mb-12">
                  <i className="fas fa-check-circle me-2 text-success-600"></i>
                  File đáp án ({homework.answerFiles.length})
                </div>
                <ListGroup>
                  {homework.answerFiles.map((file, idx) => (
                    <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center py-12">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-file-pdf text-success-600"></i>
                        <span className="text-14">File đáp án {idx + 1}</span>
                      </div>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                      >
                        <i className="fas fa-download me-2"></i>
                        Tải xuống
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Tab>
          )}

          {/* Tab: My Submission */}
          {(homework.status === 'submitted' || homework.status === 'late' || homework.status === 'graded') && (
            <Tab eventKey="mySubmission" title={<span><i className="fas fa-file-check me-2"></i>Bài đã nộp</span>}>
              <div className="pt-16">
                {loadingSubmission ? (
                  <div className="text-center py-32">
                    <div className="spinner-border text-primary mb-12" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-neutral-500 mb-0">Đang tải thông tin bài nộp...</p>
                  </div>
                ) : submissionData ? (
                  <div>
                    {/* Submission Info */}
                    <div className={`p-16 rounded-12 mb-16 ${submissionData.isLate ? 'bg-danger-50 border border-danger-200' : 'bg-success-50 border border-success-200'}`}>
                      <div className="d-flex align-items-start justify-content-between mb-12">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-8">
                            <i className={`fas ${submissionData.isLate ? 'fa-exclamation-triangle text-danger-600' : 'fa-check-circle text-success-600'} fa-lg`}></i>
                            <span className="fw-bold text-16">
                              {submissionData.isLate ? 'Đã nộp muộn' : 'Đã nộp đúng hạn'}
                            </span>
                          </div>
                          <div className="text-neutral-700 text-14">
                            <i className="fas fa-calendar-check me-2"></i>
                            Thời gian nộp: <strong>{new Date(submissionData.submittedAt).toLocaleDateString('vi-VN')} {new Date(submissionData.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</strong>
                          </div>
                        </div>
                        {submissionData.score !== null && submissionData.score !== undefined && (
                          <Badge bg="warning" className="px-16 py-8 text-16">
                            <i className="fas fa-star me-2"></i>
                            {submissionData.score}/10
                          </Badge>
                        )}
                      </div>

                      {submissionData.feedback && (
                        <div className="mt-12 pt-12 border-top">
                          <div className="text-neutral-700 text-14">
                            <i className="fas fa-comment-dots me-2"></i>
                            <strong>Nhận xét của giảng viên:</strong>
                          </div>
                          <div className="text-neutral-800 text-14 mt-8 ms-24">
                            {submissionData.feedback}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Submitted Files */}
                    {submissionData.files && submissionData.files.length > 0 && (
                      <div>
                        <div className="text-neutral-700 text-14 fw-semibold mb-12">
                          <i className="fas fa-file-upload me-2"></i>
                          File đã nộp ({submissionData.files.length})
                        </div>
                        <ListGroup>
                          {submissionData.files.map((file, idx) => {
                            const fileName = file.split('/').pop();
                            const fileExt = fileName.split('.').pop()?.toLowerCase();
                            
                            let fileIcon = 'fa-file';
                            let iconColor = 'text-neutral-600';
                            
                            if (['pdf'].includes(fileExt)) {
                              fileIcon = 'fa-file-pdf';
                              iconColor = 'text-danger-600';
                            } else if (['doc', 'docx'].includes(fileExt)) {
                              fileIcon = 'fa-file-word';
                              iconColor = 'text-primary-600';
                            } else if (['xls', 'xlsx'].includes(fileExt)) {
                              fileIcon = 'fa-file-excel';
                              iconColor = 'text-success-600';
                            } else if (['ppt', 'pptx'].includes(fileExt)) {
                              fileIcon = 'fa-file-powerpoint';
                              iconColor = 'text-warning-600';
                            } else if (['zip', 'rar'].includes(fileExt)) {
                              fileIcon = 'fa-file-archive';
                              iconColor = 'text-neutral-700';
                            }

                            return (
                              <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center py-12">
                                <div className="d-flex align-items-center gap-2">
                                  <i className={`fas ${fileIcon} ${iconColor}`}></i>
                                  <span className="text-14">{fileName}</span>
                                </div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => window.open(`${API_URL}${file}`, '_blank')}
                                >
                                  <i className="fas fa-download me-2"></i>
                                  Tải xuống
                                </Button>
                              </ListGroup.Item>
                            );
                          })}
                        </ListGroup>
                      </div>
                    )}

                    {/* Resubmit Notice */}
                    {canSubmit && submissionData.score === null && (
                      <Alert variant="info" className="mt-16 mb-0">
                        <i className="fas fa-info-circle me-2"></i>
                        Bạn có thể nộp lại bài tập bằng cách chuyển sang tab <strong>Nộp lại</strong>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-32">
                    <i className="fas fa-inbox fa-3x text-neutral-300 mb-12"></i>
                    <p className="text-neutral-500 mb-0">Không tìm thấy thông tin bài nộp</p>
                  </div>
                )}
              </div>
            </Tab>
          )}

          {/* Tab: Submission */}
          {canSubmit && (
            <Tab eventKey="submission" title={<span><i className="fas fa-upload me-2"></i>{homework.status === 'not_submitted' ? 'Nộp bài' : 'Nộp lại'}</span>}>
              <div className="pt-16">
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

                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-secondary"
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-grow-1"
                    >
                      Hủy
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
                          <i className="fas fa-upload me-2"></i>
                          {homework.status === 'not_submitted' ? 'Nộp bài' : 'Nộp lại'}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </div>
            </Tab>
          )}
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default HomeworkDetailModal;
