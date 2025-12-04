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
  const [filterType, setFilterType] = useState('by-lesson'); // 'by-lesson', 'upcoming'

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

  // Filter and sort homework
  const getFilteredHomework = () => {
    let filtered = [...homework];
    
    if (filterType === 'upcoming') {
      // Lọc bài tập sắp đến hạn (trong vòng 3 ngày) và chưa nộp
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      filtered = filtered.filter(hw => {
        const deadline = new Date(hw.deadline);
        return hw.status === 'not_submitted' && deadline <= threeDaysFromNow && deadline > new Date();
      });
    }
    
    if (filterType === 'by-lesson') {
      // Sắp xếp theo buổi học (lessonNumber)
      filtered.sort((a, b) => (b.lessonNumber || 0) - (a.lessonNumber || 0));
    } else {
      // Mặc định sắp xếp theo deadline gần nhất
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    return filtered;
  };

  // Group homework by lesson
  const groupHomeworkByLesson = (homeworkList) => {
    const grouped = {};
    homeworkList.forEach(hw => {
      const key = `${hw.lessonNumber}-${hw.lessonTitle}`;
      if (!grouped[key]) {
        grouped[key] = {
          lessonNumber: hw.lessonNumber,
          lessonTitle: hw.lessonTitle,
          homework: []
        };
      }
      grouped[key].homework.push(hw);
    });
    return Object.values(grouped);
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
        {/* Filter Buttons */}
        <div className="d-flex gap-2 mb-20">
          <Button
            variant={filterType === 'by-lesson' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setFilterType('by-lesson')}
            className="px-16 py-8 text-13"
          >
            <i className="fas fa-book-reader me-2"></i>
            Theo buổi học
          </Button>
          <Button
            variant={filterType === 'upcoming' ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => setFilterType('upcoming')}
            className="px-16 py-8 text-13"
          >
            <i className="fas fa-clock me-2"></i>
            Sắp đến hạn
          </Button>
        </div>

        {/* Content Container - 70% width, centered */}
        <div className="d-flex justify-content-center">
          <div style={{ width: '70%', minWidth: '700px' }}>

        {getFilteredHomework().length > 0 ? (
          filterType === 'by-lesson' ? (
            // Grouped by lesson view
            <div className="d-flex flex-column gap-4 mt-10 mb-10">
              {groupHomeworkByLesson(getFilteredHomework()).map(group => (
                <div key={`lesson-${group.lessonNumber}`} className="mt-14 mb-14">
                  <h6 className="text-neutral-700 fw-bold mb-12 text-15">
                    <i className="fas fa-book-reader me-2 text-primary-600"></i>
                    Buổi {group.lessonNumber}: {group.lessonTitle}
                  </h6>
                  <div className="d-flex flex-column gap-3">
                    {group.homework.map(hw => renderHomeworkCard(hw, false))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Regular list view
            <div className="d-flex flex-column gap-3">
              {getFilteredHomework().map(hw => renderHomeworkCard(hw, true))}
            </div>
          )
        ) : (
          <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="text-center py-60">
              <i className="fas fa-tasks fa-3x text-neutral-400 mb-16"></i>
              <p className="text-neutral-500 mb-0">
                {filterType === 'upcoming' ? 'Không có bài tập sắp đến hạn' : 'Chưa có bài tập nào'}
              </p>
              <p className="text-neutral-400 text-13 mt-2">
                {filterType === 'upcoming' ? 'Các bài tập trong vòng 3 ngày tới sẽ hiển thị ở đây' : 'Giảng viên sẽ giao bài tập sau các buổi học'}
              </p>
            </Card.Body>
          </Card>
        )}
          </div>
        </div>
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

  // Render individual homework card
  function renderHomeworkCard(hw, showLessonInfo) {
    const isDeadlinePassed = new Date() > new Date(hw.deadline);
    
    return (
      <div key={hw._id}>
        {showLessonInfo && (
          <div className="text-neutral-600 fw-semibold mb-8 text-13">
            <i className="fas fa-book-reader me-2"></i>
            Buổi {hw.lessonNumber}: {hw.lessonTitle}
          </div>
        )}
        <div 
          className="bg-white border-0 rounded-12 p-16 transition-all"
          style={{ 
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
          onClick={() => handleViewDetail(hw)}
        >
          <div className="d-flex justify-content-between align-items-center">
            {/* Left: Title */}
            <h6 className="text-neutral-900 fw-bold mb-0 flex-shrink-0 me-4 text-15">
              {hw.title}
            </h6>
            
            {/* Right: Deadline and Status */}
            <div className="d-flex align-items-center gap-4 flex-shrink-0">
              {/* Deadline */}
              <div className={`text-15 fw-medium ${isDeadlinePassed && hw.status === 'not_submitted' ? 'text-danger-600' : 'text-neutral-700'}`}>
                <i className="fas fa-clock me-2"></i>
                {new Date(hw.deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(hw.deadline).toLocaleDateString('vi-VN')}
              </div>

              {/* Status Badge */}
              <div className="d-flex flex-column align-items-end gap-1">
                {getHomeworkStatusBadge(hw.status)}
                {hw.status === 'graded' && hw.score != null && (
                  <Badge bg="warning" className="px-8 py-4 text-10">
                    <i className="fas fa-star me-1"></i>
                    {hw.score}/10
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Warning for overdue */}
          {isDeadlinePassed && hw.status === 'not_submitted' && (
            <Alert variant="danger" className="mb-0 mt-12 py-6 px-12 text-11">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Đã quá hạn nộp
            </Alert>
          )}
        </div>
      </div>
    );
  }
};

export default ClassHomework;
