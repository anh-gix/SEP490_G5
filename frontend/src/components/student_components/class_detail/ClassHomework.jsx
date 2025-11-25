import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import studentService from '../../../services/studentService';
import SubmitHomeworkModal from './SubmitHomeworkModal';

/**
 * Class Homework Component for Student
 * Danh sách bài tập về nhà của lớp
 */
const ClassHomework = () => {
  const { classId } = useParams();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);

  useEffect(() => {
    if (classId) {
      fetchHomework();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getClassHomework(classId);
      setHomework(response.homework || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      setError('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const getHomeworkStatusBadge = (status) => {
    const statusConfig = {
      not_submitted: { bg: 'bg-warning-600', text: 'Chưa nộp', icon: 'fa-clock' },
      submitted: { bg: 'bg-info-500', text: 'Đã nộp', icon: 'fa-check' },
      late: { bg: 'bg-danger-600', text: 'Nộp trễ', icon: 'fa-exclamation' },
      graded: { bg: 'bg-success-600', text: 'Đã chấm', icon: 'fa-star' }
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const handleSubmitClick = (hw) => {
    setSelectedHomework(hw);
    setShowSubmitModal(true);
  };

  const handleSubmitSuccess = async (response) => {
    // Show success message
    alert(response.message || 'Nộp bài thành công!');
    
    // Refresh homework list
    await fetchHomework();
  };

  if (loading) {
    return (
      <div className="p-24 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="text-neutral-500 mt-3">Đang tải bài tập...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-24">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <>
    <div className="p-24 d-flex flex-column gap-3">{homework.length > 0 ? (
        homework.map(hw => (
          <Card key={hw._id} className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-20">
              <Row className="align-items-start">
                <Col md={8}>
                  <div className="d-flex justify-content-between align-items-start mb-12">
                    <div>
                      <h6 className="text-neutral-900 fw-bold mb-4">{hw.title}</h6>
                      <div className="text-neutral-500 text-13">
                        <i className="fas fa-book-reader me-1"></i>
                        Buổi {hw.lessonNumber}: {hw.lessonTitle}
                      </div>
                    </div>
                    {getHomeworkStatusBadge(hw.status)}
                  </div>
                  {hw.description && (
                    <p className="text-neutral-700 text-14 mb-12">{hw.description}</p>
                  )}
                  
                  <div className="d-flex gap-16 text-neutral-500 text-13 mb-12">
                    <span>
                      <i className="fas fa-calendar-alt me-1"></i>
                      Hạn nộp: {new Date(hw.deadline).toLocaleDateString('vi-VN')} {new Date(hw.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {hw.submittedAt && (
                      <span>
                        <i className="fas fa-check-circle me-1"></i>
                        Đã nộp: {new Date(hw.submittedAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>

                  {hw.assignmentFiles && hw.assignmentFiles.length > 0 && (
                    <div className="mb-12">
                      <div className="text-neutral-700 text-13 fw-semibold mb-2">
                        <i className="fas fa-paperclip me-1"></i>
                        File đề bài:
                      </div>
                      {hw.assignmentFiles.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="link"
                          size="sm"
                          className="text-primary text-12 p-0 me-3"
                          onClick={() => window.open(file, '_blank')}
                        >
                          <i className="fas fa-file-download me-1"></i>
                          File {idx + 1}
                        </Button>
                      ))}
                    </div>
                  )}

                  {hw.status === 'graded' && hw.score != null && (
                    <Alert variant="success" className="bg-success-50 border-success-200 rounded-8 mb-0 py-12">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-neutral-700 text-13">
                          <i className="fas fa-star text-warning-600 me-2"></i>
                          Điểm: <strong>{hw.score}/10</strong>
                        </span>
                        {hw.gradedAt && (
                          <span className="text-neutral-500 text-12">
                            {new Date(hw.gradedAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      {hw.feedback && (
                        <div className="mt-8 text-neutral-700 text-13">
                          <strong>Nhận xét:</strong> {hw.feedback}
                        </div>
                      )}
                    </Alert>
                  )}
                </Col>
                <Col md={4} className="text-md-end">
                  {hw.status === 'not_submitted' && (
                    <Button 
                      className="btn-main text-13 fw-semibold px-20 py-10 radius-8 w-100 mb-2"
                      onClick={() => handleSubmitClick(hw)}
                    >
                      <i className="fas fa-upload me-2"></i>
                      Nộp bài
                    </Button>
                  )}
                  {(hw.status === 'submitted' || hw.status === 'late') && (
                    <Button className="btn-outline-main text-13 fw-medium px-20 py-10 radius-8 w-100 mb-2">
                      <i className="fas fa-eye me-2"></i>
                      Xem bài nộp
                    </Button>
                  )}
                  {hw.status === 'graded' && (
                    <Button className="btn-outline-success text-13 fw-medium px-20 py-10 radius-8 w-100 mb-2">
                      <i className="fas fa-file-download me-2"></i>
                      Tải bài chấm
                    </Button>
                  )}
                  {hw.answerFiles && hw.answerFiles.length > 0 && (
                    <div className="mt-2">
                      <div className="text-neutral-600 text-11 mb-1">Đáp án:</div>
                      {hw.answerFiles.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="link"
                          size="sm"
                          className="text-success text-11 p-0 d-block"
                          onClick={() => window.open(file, '_blank')}
                        >
                          <i className="fas fa-file-pdf me-1"></i>
                          Xem đáp án {hw.answerFiles.length > 1 ? idx + 1 : ''}
                        </Button>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="text-center py-60">
            <i className="fas fa-tasks fa-3x text-neutral-400 mb-16"></i>
            <p className="text-neutral-500 mb-0">Chưa có bài tập nào</p>
            <p className="text-neutral-400 text-13 mt-2">Giảng viên sẽ giao bài tập sau các buổi học</p>
          </Card.Body>
        </Card>
      )}
    </div>
    
    {/* Submit Homework Modal */}
    <SubmitHomeworkModal
      show={showSubmitModal}
      onHide={() => setShowSubmitModal(false)}
      homework={selectedHomework}
      classId={classId}
      onSubmitSuccess={handleSubmitSuccess}
    />
    </>
  );
};

export default ClassHomework;
