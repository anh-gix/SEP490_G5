import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';
import EditScheduleModal from './EditScheduleModal';
import MakeupClassModal from './MakeupClassModal';

/**
 * Academic Lesson Detail Component
 * Trang chi tiết buổi học cho giáo vụ
 */
const AcademicLessonDetail = () => {
  const { lessonId } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const fetchLessonData = async () => {
    // TODO: Replace with actual API call
    // Mock data based on lessonId
    const mockLesson = {
      id: lessonId,
      topic: 'TOEIC Listening Part 3-4: Conversations & Talks',
      date: '2025-11-17',
      time: '08:00 - 10:00',
      startTime: '08:00',
      endTime: '10:00',
      className: 'TOEIC 450 - A1',
      classId: 'c1',
      level: 'A1',
      room: 'P.101',
      roomId: 'r1',
      students: 25,
      attendedStudents: 22,
      teacherId: 't1',
      teacherName: 'Nguyễn Văn A',
      lessonNumber: 5,
      lessonTopic: 'Listening Practice',
      status: 'scheduled',
      type: 'regular',
      description: 'Buổi học tập trung vào kỹ năng nghe hiểu phần 3 và 4 của bài thi TOEIC. Học viên sẽ được luyện tập với các đoạn hội thoại và bài nói chuyên sâu.',
      objectives: [
        'Nắm vững cấu trúc câu hỏi trong Part 3-4',
        'Phát triển kỹ năng nghe và ghi chú nhanh',
        'Học từ vựng chuyên ngành thông dụng trong TOEIC',
        'Luyện tập với 20 câu hỏi thực tế'
      ],
      materials: [
        'TOEIC Listening Part 3-4 Practice.pdf',
        'Answer Key & Transcript.pdf',
        'Vocabulary List - Business Context.pdf'
      ],
      homework: 'Hoàn thành 15 câu hỏi Part 3-4 trong sách bài tập',
      homeworkDeadline: '20/11/2025',
      notes: 'Lưu ý: Học viên cần mang theo tai nghe cho buổi học này. Phòng 101 đã được trang bị hệ thống âm thanh chất lượng cao.'
    };
    
    setLessonData(mockLesson);

    // Mock data for modals
    setClasses([
      { id: 'c1', name: 'TOEIC 450 - A1', level: 'A1', students: 25 },
      { id: 'c2', name: 'TOEIC 650 - B1', level: 'B1', students: 20 }
    ]);

    setTeachers([
      { id: 't1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
      { id: 't2', name: 'Trần Thị B', email: 'tranthib@example.com' }
    ]);

    setRooms([
      { id: 'r1', name: 'P.101', capacity: 30 },
      { id: 'r2', name: 'P.102', capacity: 25 }
    ]);

    setSchedules([]);
  };

  useEffect(() => {
    fetchLessonData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const handleEditSchedule = async (scheduleData) => {
    try {
      // TODO: Call API to update schedule
      console.log('Update schedule:', scheduleData);
      setShowEditModal(false);
      alert('Cập nhật lịch học thành công!');
      await fetchLessonData();
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert('Có lỗi xảy ra khi cập nhật lịch học!');
    }
  };

  const handleCreateMakeup = async (makeupData) => {
    try {
      // TODO: Call API to create makeup class
      console.log('Create makeup class:', makeupData);
      setShowMakeupModal(false);
      alert('Tạo lịch học bù thành công!');
    } catch (err) {
      console.error('Error creating makeup class:', err);
      alert('Có lỗi xảy ra khi tạo lịch học bù!');
    }
  };

  if (!lessonData) {
    return (
      <Container fluid className="py-24 px-24">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24">
      {/* Breadcrumb & Header */}
      <div className="mb-24">
        <div className="d-flex align-items-center gap-2 mb-8">
          <Link to="/academic/dashboard" className="text-neutral-600 text-14 text-decoration-none">
            Dashboard
          </Link>
          <i className="fas fa-chevron-right text-neutral-400" style={{ fontSize: '10px' }}></i>
          <Link to="/academic/schedule" className="text-neutral-600 text-14 text-decoration-none">
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
              })} • {lessonData.time}
            </p>
          </div>
          <div className="d-flex gap-12">
            <Button 
              className="btn-outline-warning text-13 px-16 py-8 radius-8"
              onClick={() => setShowEditModal(true)}
            >
              <i className="fas fa-edit me-2"></i>
              Chỉnh sửa lịch
            </Button>
            <Button 
              className="btn-outline-info text-13 px-16 py-8 radius-8"
              onClick={() => setShowMakeupModal(true)}
            >
              <i className="fas fa-calendar-plus me-2"></i>
              Tạo lịch học bù
            </Button>
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

      {/* Materials Card */}
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

      {/* Homework & Notes Row */}
      <Row className="g-3">
        <Col md={6}>
          {/* Homework Card */}
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
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          {/* Notes Card */}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modals */}
      {showEditModal && lessonData && (
        <EditScheduleModal
          schedule={{
            id: lessonData.id,
            classId: lessonData.classId,
            teacherId: lessonData.teacherId,
            roomId: lessonData.roomId,
            date: lessonData.date,
            startTime: lessonData.startTime,
            endTime: lessonData.endTime,
            lessonNumber: lessonData.lessonNumber,
            lessonTopic: lessonData.lessonTopic,
            status: lessonData.status,
            type: lessonData.type
          }}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSchedule}
          existingSchedules={schedules}
        />
      )}

      {showMakeupModal && lessonData && (
        <MakeupClassModal
          originalSchedule={{
            id: lessonData.id,
            classId: lessonData.classId,
            className: lessonData.className,
            teacherId: lessonData.teacherId,
            teacherName: lessonData.teacherName,
            roomId: lessonData.roomId,
            roomName: lessonData.room,
            date: lessonData.date,
            startTime: lessonData.startTime,
            endTime: lessonData.endTime,
            lessonNumber: lessonData.lessonNumber,
            lessonTopic: lessonData.lessonTopic
          }}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => setShowMakeupModal(false)}
          onSubmit={handleCreateMakeup}
          existingSchedules={schedules}
        />
      )}
    </Container>
  );
};

export default AcademicLessonDetail;
