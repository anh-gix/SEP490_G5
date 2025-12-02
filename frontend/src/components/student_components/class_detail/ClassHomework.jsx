import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import studentService from '../../../services/studentService';
import HomeworkDetailModal from './HomeworkDetailModal';

/**
 * Class Homework Component for Student
 * Danh sách bài tập về nhà của lớp - Simplified version
 */
const ClassHomework = () => {
  const { classId } = useParams();
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      not_submitted: { bg: 'warning', text: 'Chưa nộp', icon: 'fa-clock' },
      submitted: { bg: 'info', text: 'Đã nộp', icon: 'fa-check' },
      late: { bg: 'danger', text: 'Nộp trễ', icon: 'fa-exclamation-triangle' },
      graded: { bg: 'success', text: 'Đã chấm', icon: 'fa-star' }
    };

    const config = statusConfig[status] || statusConfig.not_submitted;
    return (
      <Badge bg={config.bg} className="px-12 py-6">
        <i className={`fas ${config.icon} me-2`}></i>
        {config.text}
      </Badge>
    );
  };

  const handleViewDetail = (hw) => {
    setSelectedHomework(hw);
    setShowDetailModal(true);
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
      <div className="p-24">
        {homework.length > 0 ? (
          <div className="d-flex flex-column gap-3">
            {homework.map(hw => {
              const isDeadlinePassed = new Date() > new Date(hw.deadline);
              
              return (
                <Card 
                  key={hw._id} 
                  className="bg-white border-0 rounded-12 hover-shadow-lg transition-all cursor-pointer"
                  style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}
                >
                  <Card.Body className="p-20">
                    <div className="d-flex justify-content-between align-items-start mb-12">
                      <div className="flex-grow-1">
                        <h6 className="text-neutral-900 fw-bold mb-8">
                          {hw.title}
                        </h6>
                        <div className="text-neutral-500 text-13 mb-8">
                          <i className="fas fa-book-reader me-2"></i>
                          Buổi {hw.lessonNumber}: {hw.lessonTitle}
                        </div>
                        <div className="d-flex align-items-center gap-3 text-13">
                          <span className={`${isDeadlinePassed && hw.status === 'not_submitted' ? 'text-danger-600 fw-semibold' : 'text-neutral-600'}`}>
                            <i className="fas fa-calendar-alt me-2"></i>
                            Hạn: {new Date(hw.deadline).toLocaleDateString('vi-VN')} {new Date(hw.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {hw.assignmentFiles && hw.assignmentFiles.length > 0 && (
                            <span className="text-neutral-500">
                              <i className="fas fa-paperclip me-1"></i>
                              {hw.assignmentFiles.length} file
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        {getHomeworkStatusBadge(hw.status)}
                        {hw.status === 'graded' && hw.score != null && (
                          <Badge bg="warning" className="px-12 py-6">
                            <i className="fas fa-star me-1"></i>
                            {hw.score}/10
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      {hw.status === 'not_submitted' && (
                        <Button 
                          className="btn-main text-13 fw-semibold px-20 py-8 radius-8 flex-grow-1"
                          onClick={() => handleViewDetail(hw)}
                        >
                          <i className="fas fa-upload me-2"></i>
                          Nộp bài
                        </Button>
                      )}
                      {(hw.status === 'submitted' || hw.status === 'late' || hw.status === 'graded') && (
                        <Button 
                          variant="outline-primary"
                          className="text-13 fw-medium px-20 py-8 radius-8 flex-grow-1"
                          onClick={() => handleViewDetail(hw)}
                        >
                          <i className="fas fa-eye me-2"></i>
                          Xem chi tiết
                        </Button>
                      )}
                    </div>

                    {isDeadlinePassed && hw.status === 'not_submitted' && (
                      <Alert variant="danger" className="mb-0 mt-12 py-8 px-12 text-12">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Đã quá hạn nộp
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
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
    
      {/* Homework Detail Modal */}
      <HomeworkDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        homework={selectedHomework}
        classId={classId}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};

export default ClassHomework;
