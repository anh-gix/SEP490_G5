import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import scheduleService from '../../services/scheduleService';
import { formatDateToYYYYMMDD } from '../../helper/helper';

/**
 * Academic Lesson Detail Component
 * Trang chi tiết buổi học cho giáo vụ
 * @param {string} lessonId - ID của buổi học (từ props thay vì route params)
 * @param {function} onBack - Callback để quay lại danh sách lịch học
 */
const AcademicLessonDetail = ({ lessonId, onBack }) => {
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLessonData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch schedule by ID
      const response = await scheduleService.getScheduleById(lessonId);
      const schedule = response.schedule;

      if (!schedule) {
        setError('Không tìm thấy lịch học');
        return;
      }

      // Format date to YYYY-MM-DD (using helper to avoid timezone issues)
      let dateStr = 'N/A';
      if (schedule.date) {
        if (typeof schedule.date === 'string') {
          dateStr = schedule.date.split('T')[0];
        } else {
          // Use helper function to format date correctly
          dateStr = formatDateToYYYYMMDD(schedule.date);
        }
      }

      // Transform API response to component format
      const transformedLesson = {
        id: schedule._id || schedule.id,
        topic: schedule.session?.title || schedule.topic || 'N/A',
        date: dateStr,
        time: `${schedule.startTime || 'N/A'} - ${schedule.endTime || 'N/A'}`,
        startTime: schedule.startTime || 'N/A',
        endTime: schedule.endTime || 'N/A',
        className: schedule.class?.name || 'N/A',
        classId: schedule.class?._id || schedule.class,
        level: schedule.class?.course?.level || schedule.class?.level || 'N/A',
        room: schedule.room?.room_name || 'N/A',
        roomId: schedule.room?._id || schedule.room,
        students: schedule.class?.students?.length || 0,
        attendedStudents: 0, // TODO: Calculate from attendance records
        teacherId: schedule.teacher?._id || schedule.class?.teacher?._id,
        teacherName: schedule.teacher?.username || schedule.class?.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || 0,
        lessonTopic: schedule.session?.title || schedule.topic || 'N/A',
        status: schedule.status || 'fixed',
        type: schedule.type || 'regular',
        description: schedule.session?.description || schedule.session?.content || schedule.topic || 'Chưa có mô tả',
        // CLOs đã được populate từ backend (từ course.clos dựa vào session.clos ObjectIds)
        clos: schedule.session?.clos || [],
        materials: schedule.class?.course?.materials || [],
        homework: schedule.session?.homework || 'Chưa có bài tập về nhà',
        homeworkDeadline: schedule.session?.homeworkDeadline || 'N/A',
        notes: schedule.notes || schedule.reason || 'Không có ghi chú'
      };

      setLessonData(transformedLesson);
    } catch (err) {
      console.error('Error fetching lesson data:', err);
      setError(err.message || 'Không thể tải thông tin buổi học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (loading) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  if (error || !lessonData) {
    return (
      <Container fluid className="py-24 px-24">
        <Alert variant="danger">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{error || 'Không tìm thấy thông tin buổi học'}</p>
          <Button variant="primary" onClick={onBack || (() => {})}>
            Quay lại lịch học
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb & Header */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-2 mb-8">
          <Button 
            variant="link" 
            onClick={onBack || (() => {})}
            className="text-neutral-600 text-14 text-decoration-none p-0"
            style={{ textDecoration: 'none' }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại lịch học
          </Button>
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
              })} • {lessonData.time}
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Info Card */}
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
                  <i className="fas fa-chalkboard-teacher text-warning-600"></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-4">Giảng viên</div>
                  <div className="text-neutral-900 fw-semibold text-14">{lessonData.teacherName}</div>
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

      {/* Learning Objectives Card */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
          <h5 className="text-neutral-900 fw-bold mb-0">Mục tiêu học tập</h5>
        </Card.Header>
        <Card.Body className="p-20">
          {lessonData.clos && lessonData.clos.length > 0 ? (
            <div className="d-flex flex-column gap-12">
              {lessonData.clos.map((clo, index) => (
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
                  <div className="flex-grow-1">
                    <div className="text-neutral-900 text-14 fw-semibold mb-2">
                      {clo.code}: {clo.name}
                    </div>
                    <div className="text-neutral-700 text-13">
                      {clo.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : lessonData.objectives && lessonData.objectives.length > 0 ? (
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
            <div className="text-center py-4 text-neutral-500">
              Chưa có mục tiêu học tập
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AcademicLessonDetail;
