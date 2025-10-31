import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Student Dashboard Component
 * Trang tổng quan dành cho học viên
 */
const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [todaySchedule, setTodaySchedule] = useState([]);
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data
      setStudentInfo({
        name: 'Nguyễn Văn A',
        studentId: 'SV001',
        className: 'A2-Evening-01',
        level: 'A2',
        avatar: null,
        attendanceRate: 92,
        completedLessons: 18,
        totalLessons: 30,
        averageScore: 8.5
      });

      setTodaySchedule([
        {
          id: 1,
          time: '18:00 - 20:00',
          subject: 'English Grammar',
          teacher: 'Trần Thị B',
          room: 'Room 102',
          status: 'upcoming'
        }
      ]);

    //   setUpcomingClasses([
    //     {
    //       id: 1,
    //       date: '2025-11-01',
    //       time: '18:00 - 20:00',
    //       lessonNumber: 19,
    //       topic: 'Present Perfect Tense',
    //       teacher: 'Trần Thị B',
    //       room: 'Room 102'
    //     },
    //     {
    //       id: 2,
    //       date: '2025-11-03',
    //       time: '18:00 - 20:00',
    //       lessonNumber: 20,
    //       topic: 'Reading Comprehension',
    //       teacher: 'Trần Thị B',
    //       room: 'Room 102'
    //     }
    //   ]);

      setRecentActivities([
        {
          id: 1,
          type: 'assignment',
          message: 'Bài tập Unit 5 đã được chấm điểm: 9/10',
          time: '2 giờ trước',
          icon: 'fa-file-alt',
          color: 'success'
        },
        {
          id: 2,
          type: 'attendance',
          message: 'Đã điểm danh buổi học ngày 29/10',
          time: '1 ngày trước',
          icon: 'fa-check-circle',
          color: 'info'
        },
        {
          id: 3,
          type: 'announcement',
          message: 'Thông báo: Lịch thi giữa kỳ đã được cập nhật',
          time: '2 ngày trước',
          icon: 'fa-bell',
          color: 'warning'
        }
      ]);

      setAssignments([
        {
          id: 1,
          title: 'Unit 6 - Grammar Exercise',
          dueDate: '2025-11-05',
          status: 'pending',
          subject: 'Grammar'
        },
        {
          id: 2,
          title: 'Reading Comprehension Test',
          dueDate: '2025-11-07',
          status: 'pending',
          subject: 'Reading'
        }
      ]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const getActivityIcon = (activity) => {
    const colors = {
      success: 'text-success-600',
      info: 'text-info-500',
      primary: 'text-main-600',
      warning: 'text-warning-600',
      danger: 'text-danger-600'
    };

    return (
      <div 
        className={`d-flex align-items-center justify-content-center rounded-circle ${colors[activity.color]}`}
        style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: `var(--${activity.color}-50)`,
          minWidth: '40px'
        }}
      >
        <i className={`fas ${activity.icon}`}></i>
      </div>
    );
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Welcome Banner */}
      <Card className="border-0 rounded-12 box-shadow-sm mb-24 overflow-hidden" 
            style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
        <Card.Body className="p-32">
          <Row className="align-items-center">
            <Col lg={8}>
              <div className="d-flex align-items-center gap-16 mb-12">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '60px', height: '60px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <i className="fas fa-user-graduate text-main-600" style={{ fontSize: '28px' }}></i>
                </div>
                <div>
                  <h3 className="text-white fw-bold mb-4">
                    Xin chào, {studentInfo?.name}! 👋
                  </h3>
                  <p className="text-white mb-0" style={{ opacity: 0.95, fontSize: '15px' }}>
                    Chào mừng bạn quay lại. Hôm nay là ngày tuyệt vời để học tập!
                  </p>
                </div>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex flex-column gap-8">
                <Badge className="bg-white text-main-600 px-20 py-10 text-15 fw-semibold d-inline-block">
                  <i className="fas fa-book me-2"></i>
                  Lớp: {studentInfo?.className}
                </Badge>
                <Badge className="bg-white text-warning-600 px-20 py-10 text-15 fw-semibold d-inline-block">
                  <i className="fas fa-layer-group me-2"></i>
                  Trình độ: {studentInfo?.level}
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 mb-24">
        <Col md={6} lg={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="bg-main-100 text-main-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px' }}>
                  <i className="fas fa-calendar-check fa-lg"></i>
                </div>
              </div>
              <h2 className="text-neutral-900 fw-bold mb-4" style={{ fontSize: '32px' }}>{studentInfo?.attendanceRate}%</h2>
              <p className="text-neutral-600 mb-0 text-14">Tỷ lệ chuyên cần</p>
              <div className="mt-8 text-success-600 text-13">
                <i className="fas fa-arrow-up me-1"></i>
                +5% so với tháng trước
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="bg-success-100 text-success-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px' }}>
                  <i className="fas fa-book-reader fa-lg"></i>
                </div>
              </div>
              <h2 className="text-neutral-900 fw-bold mb-4" style={{ fontSize: '32px' }}>
                {studentInfo?.completedLessons}/{studentInfo?.totalLessons}
              </h2>
              <p className="text-neutral-600 mb-0 text-14">Bài học hoàn thành</p>
              <div className="mt-8 text-neutral-500 text-13">
                Còn {studentInfo?.totalLessons - studentInfo?.completedLessons} buổi
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="bg-warning-100 text-warning-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px' }}>
                  <i className="fas fa-star fa-lg"></i>
                </div>
              </div>
              <h2 className="text-neutral-900 fw-bold mb-4" style={{ fontSize: '32px' }}>{studentInfo?.averageScore}</h2>
              <p className="text-neutral-600 mb-0 text-14">Điểm trung bình</p>
              <div className="mt-8 text-success-600 text-13">
                <i className="fas fa-arrow-up me-1"></i>
                Tốt hơn 75% lớp
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-24">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <div className="bg-danger-100 text-danger-600 rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px' }}>
                  <i className="fas fa-tasks fa-lg"></i>
                </div>
              </div>
              <h2 className="text-neutral-900 fw-bold mb-4" style={{ fontSize: '32px' }}>{assignments.length}</h2>
              <p className="text-neutral-600 mb-0 text-14">Bài tập chưa nộp</p>
              <div className="mt-8 text-danger-600 text-13">
                <i className="fas fa-exclamation-circle me-1"></i>
                Cần hoàn thành sớm
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Today's Schedule */}
        <Col lg={8}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24 h-100">
            <Card.Header className="bg-white border-bottom border-neutral-100 d-flex justify-content-between align-items-center p-24">
              <div>
                <h5 className="text-neutral-900 fw-bold mb-8">Lịch học hôm nay</h5>
                <p className="text-neutral-600 mb-0 text-14">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <Link to="/student/schedule">
                <Button className="btn-outline-main text-13 fw-semibold px-20 py-10 radius-8">
                  Xem lịch đầy đủ <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-24">
              {todaySchedule.length > 0 ? (
                todaySchedule.map(schedule => (
                  <Card key={schedule.id} className="bg-gradient border-0 rounded-12 mb-20"
                        style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
                    <Card.Body className="p-24">
                      <Row className="align-items-center">
                        <Col md={2}>
                          <div className="bg-main-600 text-white rounded-12 d-flex flex-column align-items-center justify-content-center p-16">
                            <i className="fas fa-clock fa-lg mb-8"></i>
                            <div className="text-center">
                              <div className="fw-bold text-14">{schedule.time.split(' - ')[0]}</div>
                              <div className="text-12 mt-4" style={{ opacity: 0.9 }}>{schedule.time.split(' - ')[1]}</div>
                            </div>
                          </div>
                        </Col>
                        <Col md={7}>
                          <h6 className="text-neutral-900 fw-bold mb-12">{schedule.subject}</h6>
                          <div className="d-flex flex-wrap gap-16 text-neutral-600">
                            <div className="text-14">
                              <i className="fas fa-chalkboard-teacher text-main-600 me-2"></i>
                              {schedule.teacher}
                            </div>
                            <div className="text-14">
                              <i className="fas fa-door-open text-success-600 me-2"></i>
                              {schedule.room}
                            </div>
                          </div>
                        </Col>
                        <Col md={3} className="text-md-end">
                          <Badge className="bg-info-500 text-white px-16 py-8 text-13">
                            <i className="fas fa-circle-notch fa-spin me-2"></i>
                            Sắp diễn ra
                          </Badge>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-60">
                  <div className="bg-neutral-100 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-20"
                       style={{ width: '80px', height: '80px' }}>
                    <i className="fas fa-calendar-day fa-2x text-neutral-400"></i>
                  </div>
                  <h6 className="text-neutral-700 fw-semibold mb-8">Hôm nay bạn không có lịch học</h6>
                  <p className="text-neutral-500 mb-0">Tận dụng thời gian để ôn tập và làm bài tập nhé!</p>
                </div>
              )}

              {/* Learning Progress */}
              <div className="mt-32 pt-24 border-top border-neutral-100">
                <div className="d-flex justify-content-between align-items-center mb-16">
                  <h6 className="text-neutral-900 fw-bold mb-0">Tiến độ học tập</h6>
                  <span className="text-main-600 fw-bold text-18">
                    {Math.round((studentInfo?.completedLessons / studentInfo?.totalLessons) * 100)}%
                  </span>
                </div>
                <div 
                  className="bg-neutral-200 rounded-pill overflow-hidden"
                  style={{ height: '16px' }}
                >
                  <div 
                    className="h-100 transition-2 rounded-pill"
                    style={{ 
                      width: `${(studentInfo?.completedLessons / studentInfo?.totalLessons) * 100}%`,
                      background: 'linear-gradient(90deg, #0D74FF 0%, #00C9FF 100%)'
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between mt-12">
                  <span className="text-neutral-600 text-13 fw-medium">
                    <i className="fas fa-check-circle text-success-600 me-1"></i>
                    {studentInfo?.completedLessons} buổi đã học
                  </span>
                  <span className="text-neutral-600 text-13 fw-medium">
                    <i className="fas fa-clock text-warning-600 me-1"></i>
                    {studentInfo?.totalLessons - studentInfo?.completedLessons} buổi còn lại
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Upcoming Assignments */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <div className="d-flex align-items-center justify-content-between">
                <h6 className="text-neutral-900 fw-bold mb-0">Bài tập sắp đến hạn</h6>
                <Badge className="bg-danger-100 text-danger-600 px-10 py-4 text-12">
                  {assignments.length}
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              {assignments.length > 0 ? (
                <div className="d-flex flex-column gap-12">
                  {assignments.map(assignment => (
                    <Card key={assignment.id} className="bg-white border border-neutral-200 rounded-8 transition-2 item-hover">
                      <Card.Body className="p-16">
                        <div className="d-flex justify-content-between align-items-start mb-12">
                          <Badge className="bg-warning-100 text-warning-600 px-10 py-4 text-11 fw-semibold">
                            {assignment.subject}
                          </Badge>
                          <span className="text-neutral-500 text-11">
                            <i className="fas fa-calendar-alt me-1"></i>
                            {new Date(assignment.dueDate).toLocaleDateString('vi-VN', { 
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </span>
                        </div>
                        <h6 className="text-neutral-900 fw-semibold mb-0 text-13">
                          {assignment.title}
                        </h6>
                        <div className="mt-8 text-danger-600 text-11">
                          <i className="fas fa-clock me-1"></i>
                          Còn {Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <i className="fas fa-check-circle fa-2x text-success-600 mb-12"></i>
                  <p className="text-neutral-600 mb-0 text-13">Không có bài tập nào</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <h6 className="text-neutral-900 fw-bold mb-0">Hoạt động gần đây</h6>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-16">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="d-flex gap-12 pb-16 border-bottom border-neutral-100">
                    {getActivityIcon(activity)}
                    <div className="flex-grow-1">
                      <p className="text-neutral-800 mb-6 text-13 fw-medium">{activity.message}</p>
                      <span className="text-neutral-500 text-12">
                        <i className="fas fa-clock me-1"></i>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-24">
        <Col>
          <h5 className="text-neutral-900 fw-bold mb-20">Thao tác nhanh</h5>
          <Row className="g-3">
            <Col md={3}>
              <Link to="/student/schedule" className="text-decoration-none">
                <Card className="bg-white border-0 rounded-12 box-shadow-sm item-hover transition-2 h-100">
                  <Card.Body className="p-24 text-center">
                    <div className="bg-main-100 text-main-600 rounded-12 d-flex align-items-center justify-content-center mx-auto mb-16"
                         style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-calendar-alt fa-xl"></i>
                    </div>
                    <h6 className="text-neutral-900 fw-bold mb-4">Xem lịch học</h6>
                    <p className="text-neutral-600 text-13 mb-0">Quản lý thời khóa biểu</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/student/courses" className="text-decoration-none">
                <Card className="bg-white border-0 rounded-12 box-shadow-sm item-hover transition-2 h-100">
                  <Card.Body className="p-24 text-center">
                    <div className="bg-success-100 text-success-600 rounded-12 d-flex align-items-center justify-content-center mx-auto mb-16"
                         style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-book fa-xl"></i>
                    </div>
                    <h6 className="text-neutral-900 fw-bold mb-4">Khóa học của tôi</h6>
                    <p className="text-neutral-600 text-13 mb-0">Xem các lớp đã đăng ký</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/student/assignments" className="text-decoration-none">
                <Card className="bg-white border-0 rounded-12 box-shadow-sm item-hover transition-2 h-100">
                  <Card.Body className="p-24 text-center">
                    <div className="bg-warning-100 text-warning-600 rounded-12 d-flex align-items-center justify-content-center mx-auto mb-16"
                         style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-tasks fa-xl"></i>
                    </div>
                    <h6 className="text-neutral-900 fw-bold mb-4">Bài tập</h6>
                    <p className="text-neutral-600 text-13 mb-0">Nộp và kiểm tra bài tập</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
            <Col md={3}>
              <Link to="/student/leave-request" className="text-decoration-none">
                <Card className="bg-white border-0 rounded-12 box-shadow-sm item-hover transition-2 h-100">
                  <Card.Body className="p-24 text-center">
                    <div className="bg-danger-100 text-danger-600 rounded-12 d-flex align-items-center justify-content-center mx-auto mb-16"
                         style={{ width: '64px', height: '64px' }}>
                      <i className="fas fa-hand-paper fa-xl"></i>
                    </div>
                    <h6 className="text-neutral-900 fw-bold mb-4">Xin nghỉ học</h6>
                    <p className="text-neutral-600 text-13 mb-0">Gửi đơn xin nghỉ</p>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
