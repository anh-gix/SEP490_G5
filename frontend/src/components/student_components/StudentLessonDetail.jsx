import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import RequestAbsenceModal from './RequestAbsenceModal';
import studentService from '../../services/studentService';

/**
 * Student Lesson Detail Component
 * Trang chi tiết buổi học cho học viên
 */
const StudentLessonDetail = () => {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [lessonData, setLessonData] = useState(null);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessonData = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để xem chi tiết buổi học');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await studentService.getLessonDetail(lessonId);
      
      if (response.success && response.lesson) {
        setLessonData(response.lesson);
      } else {
        setError('Không thể tải thông tin buổi học');
      }
    } catch (error) {
      console.error('Error fetching lesson detail:', error);
      setError(error.message || 'Đã có lỗi xảy ra khi tải thông tin buổi học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, user]);

  const handleRequestAbsence = () => {
    setShowAbsenceModal(true);
  };

  const getAttendanceBadge = (attendance) => {
    if (!attendance) return null;

    const attendanceConfig = {
      present: { bg: 'bg-success-600', text: 'Có mặt', icon: 'fa-check' },
      absent: { bg: 'bg-danger-600', text: 'Vắng', icon: 'fa-times' },
      late: { bg: 'bg-warning-600', text: 'Trễ', icon: 'fa-clock' },
      excused: { bg: 'bg-info-500', text: 'Có phép', icon: 'fa-file-alt' }
    };

    const config = attendanceConfig[attendance.status] || attendanceConfig.present;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-13`}>
        <i className={`fas ${config.icon} me-2`}></i>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="text-neutral-500 mt-3">Đang tải thông tin buổi học...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-24 px-24">
        <Alert variant="danger">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" size="sm" onClick={fetchLessonData}>
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!lessonData) {
    return (
      <Container fluid className="py-24 px-24">
        <Alert variant="warning">
          <p className="mb-0">Không tìm thấy thông tin buổi học</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-2 mb-8">
          <Link to="/student/dashboard" className="text-neutral-600 text-14 text-decoration-none">
            Dashboard
          </Link>
          <i className="fas fa-chevron-right text-neutral-400" style={{ fontSize: '10px' }}></i>
          <Link to="/student/schedule" className="text-neutral-600 text-14 text-decoration-none">
            Lịch học
          </Link>
          <i className="fas fa-chevron-right text-neutral-400" style={{ fontSize: '10px' }}></i>
          <span className="text-neutral-900 text-14 fw-semibold">Chi tiết buổi học</span>
        </div>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h4 className="text-neutral-900 fw-bold mb-8">{lessonData.topic}</h4>
            <p className="text-neutral-600 mb-0">
              {new Date(lessonData.date).toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {lessonData.startTime} - {lessonData.endTime}
            </p>
            {lessonData.attendance && (
              <div className="mt-2">
                {getAttendanceBadge(lessonData.attendance)}
              </div>
            )}
          </div>
          <div className="d-flex gap-12">
            {lessonData.status === 'upcoming' && (
              <Button 
                onClick={handleRequestAbsence}
                className="btn-outline-warning text-13 px-16 py-8 radius-8"
              >
                <i className="fas fa-hand-paper me-2"></i>
                Xin nghỉ
              </Button>
            )}
            <Button className="btn-main text-13 px-16 py-8 radius-8">
              <i className="fas fa-chalkboard-teacher me-2"></i>
              Vào lớp
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
                  <div className="text-neutral-900 fw-semibold text-14">{lessonData.room?.fullName || 'Chưa có phòng'}</div>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className="d-flex align-items-start gap-12">
                <div 
                  className="rounded-8 d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', backgroundColor: '#FFF4E6', flexShrink: 0 }}
                >
                  <i className="fas fa-chalkboard-teacher text-warning-600"></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-4">Giảng viên</div>
                  <div className="text-neutral-900 fw-semibold text-14">{lessonData.teacher?.name || 'Chưa có giảng viên'}</div>
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
                  <div className="text-neutral-900 fw-semibold text-14">{lessonData.startTime} - {lessonData.endTime}</div>
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
          {lessonData.objectives && lessonData.objectives.length > 0 ? (
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
          ) : (
            <p className="text-neutral-500 text-14 mb-0">Chưa có mục tiêu học tập</p>
          )}
        </Card.Body>
      </Card>

      {/* Materials */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
          <h5 className="text-neutral-900 fw-bold mb-0">Tài liệu học tập</h5>
        </Card.Header>
        <Card.Body className="p-20">
          {lessonData.materials && lessonData.materials.length > 0 ? (
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
                    <div className="text-neutral-900 fw-semibold text-14">{material.title || material.file || `Tài liệu ${index + 1}`}</div>
                  </div>
                  <Button 
                    className="btn-outline-main text-12 px-12 py-6 radius-6"
                    onClick={() => material.file && window.open(material.file, '_blank')}
                  >
                    <i className="fas fa-download me-2"></i>
                    Tải xuống
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-14 mb-0">Chưa có tài liệu học tập</p>
          )}
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
              {lessonData.homework && lessonData.homework.length > 0 ? (
                <div className="d-flex flex-column gap-12">
                  {lessonData.homework.map((hw, index) => (
                    <div key={index} className="bg-warning-50 border border-warning-200 rounded-12 p-16">
                      <div className="d-flex align-items-start gap-12">
                        <i className="fas fa-tasks text-warning-600 mt-1"></i>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 fw-semibold text-14 mb-8">
                            {hw.assignment?.title || `Bài tập ${index + 1}`}
                          </div>
                          {hw.assignment?.description && (
                            <div className="text-neutral-700 text-13 mb-8">
                              {hw.assignment.description}
                            </div>
                          )}
                          {hw.assignment?.deadline && (
                            <div className="text-neutral-600 text-12">
                              <i className="fas fa-calendar-alt me-2"></i>
                              Hạn nộp: {new Date(hw.assignment.deadline).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-14 mb-0">Chưa có bài tập về nhà</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          {/* Notes */}
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Ghi chú từ giảng viên</h5>
            </Card.Header>
            <Card.Body className="p-20">
              {lessonData.notes ? (
                <div className="bg-info-50 border border-info-200 rounded-12 p-16">
                  <div className="d-flex align-items-start gap-12">
                    <i className="fas fa-sticky-note text-info-600 mt-1"></i>
                    <div className="text-neutral-700 text-13">{lessonData.notes}</div>
                  </div>
                </div>
              ) : (
                <p className="text-neutral-500 text-14 mb-0">Chưa có ghi chú</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Absence Modal */}
      <RequestAbsenceModal
        show={showAbsenceModal}
        onHide={() => setShowAbsenceModal(false)}
        schedule={{
          id: lessonData._id,
          date: lessonData.date,
          startTime: lessonData.startTime,
          endTime: lessonData.endTime,
          topic: lessonData.topic,
          className: lessonData.className,
          teacher: lessonData.teacher?.name,
          room: lessonData.room?.fullName,
          lessonNumber: lessonData.lessonNumber
        }}
        onSuccess={() => {
          setShowAbsenceModal(false);
          fetchLessonData();
        }}
      />
    </Container>
  );
};

export default StudentLessonDetail;
