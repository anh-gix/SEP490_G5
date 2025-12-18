import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import TeacherRequestAbsenceModal from './TeacherRequestAbsenceModal';

/**
 * Lesson Detail Component
 * Trang chi tiết buổi học
 */
const LessonDetail = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherService.getLessonDetail(lessonId);
      
      if (response.success) {
        // Transform API data to component format
        const lesson = response.lesson;
        const transformedData = {
          topic: lesson.sessionTitle || 'Chưa có tiêu đề',
          date: lesson.date,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          time: `${lesson.startTime} - ${lesson.endTime}`,
          className: lesson.className,
          level: lesson.className?.split('-')[0] || 'N/A',
          room: lesson.roomName ? `${lesson.roomName}${lesson.roomLocation ? ` - ${lesson.roomLocation}` : ''}` : 'Chưa xác định',
          students: lesson.totalStudents,
          attendedStudents: 0, // TODO: Get from attendance data
          description: lesson.sessionContent || lesson.courseDescription || 'Chưa có mô tả',
          objectives: lesson.mocktest?.skills ? 
            Object.keys(lesson.mocktest.skills).map(skill => `Luyện tập ${skill}`) : 
            ['Hoàn thành các mục tiêu của buổi học'],
          materials: lesson.material?.length > 0 ? 
            lesson.material.map(m => m.title || m.url || 'Tài liệu') : 
            ['Chưa có tài liệu'],
          homework: lesson.homework?.length > 0 ? 
            lesson.homework.map(h => h.title).join(', ') : 
            'Chưa có bài tập',
          homeworkDeadline: lesson.homework?.[0]?.dueDate ? 
            new Date(lesson.homework[0].dueDate).toLocaleDateString('vi-VN') : 
            'Chưa xác định',
          notes: lesson.note || 'Chưa có ghi chú'
        };
        
        setLessonData(transformedData);
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết buổi học:', error);
      setError(error.message || 'Không thể tải chi tiết buổi học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Xác định đường dẫn quay lại
  const getBackPath = () => {
    // Kiểm tra location.state để biết trang trước đó
    if (location.state?.from === 'class' && location.state?.classId) {
      return `/teacher/classes/${location.state.classId}`;
    }
    if (location.state?.from === 'dashboard') {
      return '/teacher/dashboard';
    }
    // Mặc định quay về schedule
    return '/teacher/schedule';
  };

  const handleGoBack = () => {
    navigate(getBackPath());
  };

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="text-center py-40">
            <div className="spinner-border text-main-600" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-neutral-600 mt-12 mb-0">Đang tải chi tiết buổi học...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="text-center py-40">
            <i className="fas fa-exclamation-circle text-danger-600 mb-12" style={{ fontSize: '48px' }}></i>
            <p className="text-danger-600 mb-12">{error}</p>
            <Button onClick={fetchLessonData} className="btn-main">
              <i className="fas fa-redo me-2"></i>
              Thử lại
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!lessonData) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Body className="text-center py-40">
            <i className="fas fa-calendar-times text-neutral-400 mb-12" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mb-0">Không tìm thấy buổi học</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Back Button */}
      <div className="mb-24">
        <Button 
          variant="link" 
          onClick={handleGoBack}
          className="text-neutral-600 text-14 text-decoration-none p-0 mb-16"
          style={{ textDecoration: 'none' }}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="text-neutral-900 fw-bold mb-8">{lessonData.topic}</h4>
            <p className="text-neutral-600 mb-0">
              {new Date(lessonData.date).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {lessonData.time}
            </p>
          </div>
          <div className="d-flex gap-12">
            <Link 
              to={`/teacher/attendance/${lessonId}`}
              className="btn btn-outline-warning text-13 px-16 py-8 radius-8"
            >
              <i className="fas fa-user-check me-2"></i>
              Điểm danh
            </Link>
            <Button 
              onClick={() => setShowAbsenceModal(true)}
              className="btn-outline-warning text-13 px-16 py-8 radius-8"
            >
              <i className="fas fa-hand-paper me-2"></i>
              Xin nghỉ
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson Info */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
          <h5 className="text-neutral-900 fw-bold mb-0">Thông tin buổi học</h5>
        </Card.Header>
            <Card.Body className="p-20">
              <Row className="g-3 mb-20">
                <Col md={6}>
                  <div className="d-flex align-items-start gap-12">
                    <div 
                      className="rounded-8 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', backgroundColor: '#E6F2FF', flexShrink: 0 }}
                    >
                      <i className="fas fa-book text-main-600"></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-12 mb-4">Lớp học</div>
                      <div className="text-neutral-900 fw-semibold text-14">{lessonData.className}</div>
                      <Badge className="bg-main-100 text-main-600 px-8 py-4 text-11 mt-4">
                        {lessonData.level}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start gap-12">
                    <div 
                      className="rounded-8 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', backgroundColor: '#E6FFED', flexShrink: 0 }}
                    >
                      <i className="fas fa-door-open text-success-600"></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-12 mb-4">Phòng học</div>
                      <div className="text-neutral-900 fw-semibold text-14">{lessonData.room}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start gap-12">
                    <div 
                      className="rounded-8 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', backgroundColor: '#FFF4E6', flexShrink: 0 }}
                    >
                      <i className="fas fa-users text-warning-600"></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-12 mb-4">Học viên</div>
                      <div className="text-neutral-900 fw-semibold text-14">
                        {lessonData.attendedStudents}/{lessonData.students} học viên
                      </div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-start gap-12">
                    <div 
                      className="rounded-8 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', backgroundColor: '#F0F9FF', flexShrink: 0 }}
                    >
                      <i className="fas fa-clock text-info-600"></i>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-12 mb-4">Thời gian</div>
                      <div className="text-neutral-900 fw-semibold text-14">{lessonData.time}</div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="border-top border-neutral-100 pt-20">
                <h6 className="text-neutral-900 fw-bold mb-12">Mô tả</h6>
                <p className="text-neutral-700 text-14 mb-0">{lessonData.description}</p>
              </div>
            </Card.Body>
          </Card>

          {/* Learning Objectives */}
          <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Mục tiêu học tập</h5>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-12">
                {lessonData.objectives.map((objective, index) => (
                  <div key={index} className="d-flex align-items-start gap-12">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        backgroundColor: '#E6F2FF',
                        flexShrink: 0
                      }}
                    >
                      <i className="fas fa-check text-main-600" style={{ fontSize: '10px' }}></i>
                    </div>
                    <div className="text-neutral-900 text-14">{objective}</div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Materials */}
          <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Tài liệu học tập</h5>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-12">
                {lessonData.materials.map((material, index) => (
                  <div 
                    key={index} 
                    className="border border-neutral-100 rounded-12 p-16 d-flex align-items-center gap-12 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div 
                      className="rounded-8 d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px', backgroundColor: '#FFF4E6', flexShrink: 0 }}
                    >
                      <i className="fas fa-file-pdf text-warning-600"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-neutral-900 fw-semibold text-14">{material}</div>
                    </div>
                    <Button className="btn-outline-main text-12 px-12 py-6 radius-6">
                      <i className="fas fa-download me-2"></i>
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

      {/* Homework and Notes */}
      <Row className="g-3">
        <Col md={6}>
          {/* Homework */}
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Bài tập về nhà</h5>
            </Card.Header>
                <Card.Body className="p-20">
                  <div className="bg-warning-50 border border-warning-200 rounded-12 p-16 mb-16">
                    <div className="d-flex align-items-start gap-12 mb-12">
                      <i className="fas fa-tasks text-warning-600 mt-1"></i>
                      <div className="flex-grow-1">
                        <div className="text-neutral-900 fw-semibold text-14 mb-8">
                          {lessonData.homework}
                        </div>
                        <div className="text-neutral-600 text-12">
                          <i className="fas fa-calendar-alt me-2"></i>
                          Hạn nộp: {lessonData.homeworkDeadline}
                        </div>
                      </div>
                    </div>
                  </div>
            <Button className="btn-main text-13 px-16 py-8 radius-8 w-100">
              <i className="fas fa-plus me-2"></i>
              Thêm bài tập
            </Button>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        {/* Notes */}
        <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
          <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
            <h5 className="text-neutral-900 fw-bold mb-0">Ghi chú</h5>
          </Card.Header>
                <Card.Body className="p-20">
          <div className="bg-info-50 border border-info-200 rounded-12 p-16 mb-16">
            <div className="d-flex align-items-start gap-12">
              <i className="fas fa-sticky-note text-info-600 mt-1"></i>
              <div className="text-neutral-700 text-13">{lessonData.notes}</div>
            </div>
          </div>
          <Button className="btn-outline-main text-13 px-16 py-8 radius-8 w-100">
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa ghi chú
          </Button>
        </Card.Body>
      </Card>
    </Col>
  </Row>

      {/* Request Absence Modal */}
      {lessonData && (
        <TeacherRequestAbsenceModal
          show={showAbsenceModal}
          onHide={() => setShowAbsenceModal(false)}
          schedule={{
            classScheduleId: lessonId,
            date: lessonData.date,
            time: lessonData.time,
            startTime: lessonData.startTime,
            endTime: lessonData.endTime,
            topic: lessonData.topic,
            className: lessonData.className,
            room: lessonData.room
          }}
          onSuccess={() => {
            setShowAbsenceModal(false);
            // Optionally refresh lesson data
          }}
        />
      )}
    </Container>
  );
};

export default LessonDetail;
