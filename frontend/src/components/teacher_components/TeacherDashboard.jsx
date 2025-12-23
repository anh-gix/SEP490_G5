import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

/**
 * Teacher Dashboard Component
 * Trang tổng quan cho giảng viên
 */
const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      upcomingLessons: 0,
      totalStudents: 0,
      pendingGrading: 0,
      pendingAttendance: 0
    },
    upcomingSchedule: [],
    classesSummary: []
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [countdown, setCountdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Calculate countdown to next lesson
    if (dashboardData.upcomingSchedule.length > 0) {
      const calculateCountdown = () => {
        const now = new Date();
        const nextLesson = dashboardData.upcomingSchedule[0];
        const [hours, minutes] = nextLesson.time.split(' - ')[0].split(':');
        const lessonDate = new Date(nextLesson.date);
        lessonDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const diff = lessonDate - now;
        
        if (diff <= 0) {
          setCountdown('Đang diễn ra');
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            setCountdown(`${days} ngày ${hrs} giờ`);
          } else if (hrs > 0) {
            setCountdown(`${hrs} giờ ${mins} phút`);
          } else {
            setCountdown(`${mins} phút`);
          }
        }
      };
      
      calculateCountdown();
      const interval = setInterval(calculateCountdown, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [dashboardData.upcomingSchedule]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getTeacherDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-info-600', text: 'Chờ khai giảng', icon: 'fa-clock' },
      active: { bg: 'bg-success-600', text: 'Đang dạy', icon: 'fa-play-circle' },
      completed: { bg: 'bg-neutral-600', text: 'Đã hoàn thành', icon: 'fa-check-circle' },
      disable: { bg: 'bg-danger-600', text: 'Vô hiệu hóa', icon: 'fa-ban' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge className={`${config.bg} text-white px-8 py-4 text-10`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-neutral-600 mt-3">Đang tải dữ liệu dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Dashboard Giảng viên</h4>
        <p className="text-neutral-600 mb-0">Tổng quan hoạt động giảng dạy của bạn</p>
      </div>

      {/* Stats Cards */}
      {/* <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-16">
              <div className="d-flex align-items-center gap-12">
                <div 
                  className="rounded-8 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-2">Tuần này</div>
                  <div className="text-neutral-900 fw-bold text-24">{dashboardData.stats.upcomingLessons}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-16">
              <div className="d-flex align-items-center gap-12">
                <div 
                  className="rounded-8 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <i className="fas fa-users text-white" style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-2">Học viên</div>
                  <div className="text-neutral-900 fw-bold text-24">{dashboardData.stats.totalStudents}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-16">
              <div className="d-flex align-items-center gap-12">
                <div 
                  className="rounded-8 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}
                >
                  <i className="fas fa-file-alt text-white" style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-2">Chưa chấm</div>
                  <div className="text-neutral-900 fw-bold text-24">{dashboardData.stats.pendingGrading}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Body className="p-16">
              <div className="d-flex align-items-center gap-12">
                <div 
                  className="rounded-8 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <i className="fas fa-user-check text-white" style={{ fontSize: '20px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-12 mb-2">Điểm danh</div>
                  <div className="text-neutral-900 fw-bold text-24">{dashboardData.stats.pendingAttendance}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}

      <Row className="g-3">
        {/* Upcoming Schedule - Left Side */}
        <Col lg={8}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-neutral-900 fw-bold mb-4">Lịch dạy sắp tới</h5>
                  <div className="d-flex gap-16 align-items-center">
                    <p className="text-neutral-500 text-13 mb-0">
                      <i className="fas fa-clock me-2"></i>
                      Hiện tại: {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {countdown && (
                      <div className="d-flex align-items-center gap-8">
                        <div className="bg-main-100 rounded-8 px-12 py-4">
                          <i className="fas fa-hourglass-half text-main-600 me-2"></i>
                          <span className="text-main-600 fw-semibold text-13">
                            Buổi tiếp theo: {countdown}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Link to="/teacher/schedule" className="btn btn-outline-main text-13 px-16 py-8 radius-8">
                  Xem tất cả
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-12">
                {dashboardData.upcomingSchedule.map(schedule => {
                  const isToday = schedule.isToday;
                  return (
                    <div 
                      key={schedule.id}
                      className={`border rounded-12 p-16 transition-2 ${isToday ? 'border-main-300 bg-main-25' : 'border-neutral-100'}`}
                      style={{ cursor: 'pointer' }}
                    >
                      <Row className="align-items-center">
                        <Col md={2}>
                          <div className={`text-center ${isToday ? 'text-main-600' : 'text-neutral-700'}`}>
                            <div className="fw-bold text-24 mb-0">
                              {new Date(schedule.date).toLocaleDateString('vi-VN', { day: '2-digit' })}
                            </div>
                            <div className="text-12">
                              Tháng {new Date(schedule.date).toLocaleDateString('vi-VN', { month: '2-digit' })}
                            </div>
                            {isToday && (
                              <Badge className="bg-main-600 text-white mt-2 px-8 py-4 text-11">
                                Hôm nay
                              </Badge>
                            )}
                          </div>
                        </Col>
                        <Col md={2}>
                          <div className={`${isToday ? 'text-main-600' : 'text-neutral-700'}`}>
                            <i className="fas fa-clock me-2"></i>
                            <span className="fw-semibold text-14">{schedule.time}</span>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div>
                            <div className={`fw-bold text-14 mb-2 ${isToday ? 'text-main-600' : 'text-neutral-900'}`}>
                              {schedule.className}
                            </div>
                            <div className="text-neutral-600 text-12">
                              <i className="fas fa-users me-1" style={{ fontSize: '10px' }}></i>
                              {schedule.students} học viên
                            </div>
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="text-neutral-900 text-13">{schedule.topic}</div>
                          <div className="text-neutral-500 text-12">
                            <i className="fas fa-door-open me-1"></i>
                            {schedule.room}
                          </div>
                        </Col>
                        <Col md={2} className="text-end">
                          <Button 
                            className={`text-12 px-16 py-8 radius-8 ${isToday ? 'btn-main' : 'btn-outline-main'}`}
                            onClick={() => navigate(`/teacher/lessons/${schedule.id}`, { 
                              state: { from: 'dashboard' } 
                            })}
                          >
                            <i className="fas fa-chalkboard-teacher me-2"></i>
                            {isToday ? 'Vào lớp' : 'Chi tiết'}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Classes Summary - Right Side (Vertical) */}
        <Col lg={4}>
          <Card className="bg-white border-0 rounded-12 h-100" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <div>
                <h5 className="text-neutral-900 fw-bold mb-4">Lớp học của tôi</h5>
                <p className="text-neutral-500 text-13 mb-0">Danh sách lớp đang dạy</p>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-12">
                {dashboardData.classesSummary.map(classItem => (
                  <div 
                    key={classItem.id}
                    className="border border-neutral-100 rounded-12 p-16 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0D74FF';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(13, 116, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E9ECEF';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="mb-12">
                      <div className="d-flex justify-content-between align-items-start mb-8">
                        <h6 className="text-neutral-900 fw-bold mb-0">{classItem.name}</h6>
                        <Link to={`/teacher/classes/${classItem.id}`}>
                          <Button className="btn-outline-main text-11 px-12 py-6 radius-6">
                            Chi tiết
                          </Button>
                        </Link>
                      </div>
                      <div className="d-flex gap-12 align-items-center">
                        <Badge className="bg-main-100 text-main-600 px-8 py-4 text-11">{classItem.level}</Badge>
                        {classItem.status && getStatusBadge(classItem.status)}
                        <span className="text-neutral-600 text-12">
                          <i className="fas fa-users me-1" style={{ fontSize: '10px' }}></i>
                          {classItem.students} học viên
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-12">
                      <div className="d-flex justify-content-between mb-6">
                        <span className="text-neutral-600 text-12">Tiến độ</span>
                        <span className="text-neutral-900 fw-semibold text-12">
                          {classItem.completedLessons}/{classItem.totalLessons} buổi
                        </span>
                      </div>
                      <ProgressBar 
                        now={classItem.progress} 
                        className="rounded-pill"
                        style={{ height: '6px', backgroundColor: '#E9ECEF' }}
                      />
                    </div>

                    {/* <div className="d-flex flex-column gap-8">
                      <div className="d-flex align-items-start gap-8">
                        <i className="fas fa-file-alt text-warning-600 mt-1" style={{ fontSize: '11px' }}></i>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 text-12 fw-semibold">{classItem.nextTest}</div>
                          <div className="text-neutral-500 text-11">{classItem.nextTestDate}</div>
                        </div>
                      </div>
                      <div className="d-flex align-items-start gap-8">
                        <i className="fas fa-tasks text-info-600 mt-1" style={{ fontSize: '11px' }}></i>
                        <div className="flex-grow-1">
                          <div className="text-neutral-900 text-12 fw-semibold">{classItem.upcomingAssignment}</div>
                          <div className="text-neutral-500 text-11">Hạn: {classItem.assignmentDeadline}</div>
                        </div>
                      </div>
                    </div> */}
                  </div>
                ))}
              </div>
              <div className="mt-16 text-center">
                <Link to="/teacher/classes" className="btn btn-outline-main text-13 px-16 py-8 radius-8 w-100">
                  Xem tất cả lớp học
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherDashboard;