import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Teacher Dashboard Component
 * Trang tổng quan cho giảng viên
 */
const TeacherDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      upcomingLessons: 0,
      totalStudents: 0,
      pendingGrading: 0,
      pendingAttendance: 0
    },
    upcomingSchedule: [],
    recentActivities: [],
    classesSummary: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data
    const mockData = {
      stats: {
        upcomingLessons: 8,
        totalStudents: 85,
        pendingGrading: 12,
        pendingAttendance: 3
      },
      upcomingSchedule: [
        {
          id: 1,
          date: '2025-11-13',
          time: '18:00 - 20:00',
          className: 'A2-Evening-01',
          topic: 'Present Perfect Tense',
          room: 'Room 102',
          students: 25
        },
        {
          id: 2,
          date: '2025-11-14',
          time: '18:00 - 20:00',
          className: 'A2-Evening-01',
          topic: 'Reading Comprehension',
          room: 'Room 102',
          students: 25
        },
        {
          id: 3,
          date: '2025-11-15',
          time: '14:00 - 16:00',
          className: 'B1-Afternoon-02',
          topic: 'Listening Skills',
          room: 'Room 201',
          students: 20
        }
      ],
      recentActivities: [
        {
          id: 1,
          type: 'assignment',
          message: '15 học viên đã nộp bài "Unit 5 - Grammar Exercise"',
          time: '30 phút trước',
          icon: 'fa-file-alt',
          iconBg: 'bg-info-100',
          iconColor: 'text-info-600'
        },
        {
          id: 2,
          type: 'attendance',
          message: 'Đã hoàn thành điểm danh lớp A2-Evening-01',
          time: '2 giờ trước',
          icon: 'fa-user-check',
          iconBg: 'bg-success-100',
          iconColor: 'text-success-600'
        },
        {
          id: 3,
          type: 'grading',
          message: 'Đã chấm xong 8 bài tập của lớp B1-Afternoon-02',
          time: '5 giờ trước',
          icon: 'fa-check-circle',
          iconBg: 'bg-warning-100',
          iconColor: 'text-warning-600'
        }
      ],
      classesSummary: [
        {
          id: 1,
          name: 'A2-Evening-01',
          level: 'A2',
          students: 25,
          progress: 65,
          nextLesson: '13/11/2025 18:00',
          attendanceRate: 92
        },
        {
          id: 2,
          name: 'B1-Afternoon-02',
          level: 'B1',
          students: 20,
          progress: 48,
          nextLesson: '15/11/2025 14:00',
          attendanceRate: 88
        },
        {
          id: 3,
          name: 'A1-Morning-03',
          level: 'A1',
          students: 30,
          progress: 30,
          nextLesson: '16/11/2025 08:00',
          attendanceRate: 95
        }
      ]
    };
    setDashboardData(mockData);
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Dashboard Giảng viên</h4>
        <p className="text-neutral-600 mb-0">Tổng quan hoạt động giảng dạy của bạn</p>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-chalkboard-teacher text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Buổi dạy tuần này</div>
                  <div className="text-neutral-900 fw-bold text-32">{dashboardData.stats.upcomingLessons}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <i className="fas fa-users text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Học viên đang dạy</div>
                  <div className="text-neutral-900 fw-bold text-32">{dashboardData.stats.totalStudents}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}
                >
                  <i className="fas fa-file-alt text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Bài tập chưa chấm</div>
                  <div className="text-neutral-900 fw-bold text-32">{dashboardData.stats.pendingGrading}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <i className="fas fa-user-check text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Điểm danh chưa hoàn thành</div>
                  <div className="text-neutral-900 fw-bold text-32">{dashboardData.stats.pendingAttendance}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Upcoming Schedule */}
        <Col lg={8}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-neutral-900 fw-bold mb-4">Lịch dạy sắp tới</h5>
                  <p className="text-neutral-500 text-13 mb-0">Các buổi học trong tuần này</p>
                </div>
                <Link to="/teacher/schedule" className="btn btn-outline-main text-13 px-16 py-8 radius-8">
                  Xem tất cả
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr className="bg-neutral-25">
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0">Ngày</th>
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0">Thời gian</th>
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0">Lớp học</th>
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0">Chủ đề</th>
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0">Phòng</th>
                    <th className="px-20 py-12 text-neutral-700 fw-semibold text-12 border-0 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.upcomingSchedule.map(schedule => (
                    <tr key={schedule.id}>
                      <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                        {new Date(schedule.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">{schedule.time}</td>
                      <td className="px-20 py-16">
                        <div className="text-main-600 fw-semibold text-13">{schedule.className}</div>
                        <div className="text-neutral-500 text-11">{schedule.students} học viên</div>
                      </td>
                      <td className="px-20 py-16 text-neutral-900 text-13">{schedule.topic}</td>
                      <td className="px-20 py-16 text-neutral-700 text-13">{schedule.room}</td>
                      <td className="px-20 py-16 text-center">
                        <Button className="btn-main text-12 px-12 py-6 radius-6">
                          <i className="fas fa-chalkboard-teacher me-1"></i>
                          Vào lớp
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Classes Summary */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-neutral-900 fw-bold mb-4">Lớp học của tôi</h5>
                  <p className="text-neutral-500 text-13 mb-0">Tổng quan các lớp đang giảng dạy</p>
                </div>
                <Link to="/teacher/classes" className="btn btn-outline-main text-13 px-16 py-8 radius-8">
                  Xem tất cả
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              <Row className="g-3">
                {dashboardData.classesSummary.map(classItem => (
                  <Col md={12} key={classItem.id}>
                    <div 
                      className="border border-neutral-100 rounded-12 p-16 transition-2"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-12">
                        <div>
                          <h6 className="text-neutral-900 fw-bold mb-4">{classItem.name}</h6>
                          <div className="d-flex gap-12 align-items-center">
                            <Badge className="bg-main-100 text-main-600 px-8 py-4 text-11">{classItem.level}</Badge>
                            <span className="text-neutral-600 text-12">
                              <i className="fas fa-users me-1" style={{ fontSize: '10px' }}></i>
                              {classItem.students} học viên
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-neutral-500 text-11 mb-4">Buổi tiếp theo</div>
                          <div className="text-neutral-900 fw-semibold text-12">{classItem.nextLesson}</div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <div className="d-flex justify-content-between mb-6">
                          <span className="text-neutral-600 text-12">Tiến độ</span>
                          <span className="text-neutral-900 fw-semibold text-12">{classItem.progress}%</span>
                        </div>
                        <ProgressBar 
                          now={classItem.progress} 
                          className="rounded-pill"
                          style={{ height: '6px', backgroundColor: '#E9ECEF' }}
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-neutral-600 text-12">
                          <i className="fas fa-chart-line me-1 text-success-600"></i>
                          Điểm danh: <span className="fw-semibold text-neutral-900">{classItem.attendanceRate}%</span>
                        </div>
                        <Button className="btn-outline-main text-11 px-12 py-4 radius-6">
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activities & Quick Actions */}
        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Thao tác nhanh</h5>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-12">
                <Link 
                  to="/teacher/assignments" 
                  className="text-decoration-none"
                >
                  <div 
                    className="border border-main-200 rounded-12 p-16 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="rounded-8 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', backgroundColor: '#E6F2FF' }}
                      >
                        <i className="fas fa-plus text-main-600"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="text-neutral-900 fw-semibold text-14">Tạo bài tập mới</div>
                        <div className="text-neutral-500 text-11">Giao bài cho lớp học</div>
                      </div>
                      <i className="fas fa-chevron-right text-neutral-400"></i>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/teacher/attendance" 
                  className="text-decoration-none"
                >
                  <div 
                    className="border border-success-200 rounded-12 p-16 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0FFF4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="rounded-8 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', backgroundColor: '#E6FFED' }}
                      >
                        <i className="fas fa-user-check text-success-600"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="text-neutral-900 fw-semibold text-14">Điểm danh</div>
                        <div className="text-neutral-500 text-11">Điểm danh học viên</div>
                      </div>
                      <i className="fas fa-chevron-right text-neutral-400"></i>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/teacher/grading" 
                  className="text-decoration-none"
                >
                  <div 
                    className="border border-warning-200 rounded-12 p-16 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF4E6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="rounded-8 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', backgroundColor: '#FFE8CC' }}
                      >
                        <i className="fas fa-pen text-warning-600"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="text-neutral-900 fw-semibold text-14">Chấm điểm</div>
                        <div className="text-neutral-500 text-11">{dashboardData.stats.pendingGrading} bài chờ chấm</div>
                      </div>
                      <i className="fas fa-chevron-right text-neutral-400"></i>
                    </div>
                  </div>
                </Link>

                <Link 
                  to="/teacher/schedule" 
                  className="text-decoration-none"
                >
                  <div 
                    className="border border-info-200 rounded-12 p-16 transition-2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F9FF'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div className="d-flex align-items-center gap-12">
                      <div 
                        className="rounded-8 d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE' }}
                      >
                        <i className="fas fa-calendar-alt text-info-600"></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="text-neutral-900 fw-semibold text-14">Xem lịch dạy</div>
                        <div className="text-neutral-500 text-11">Lịch giảng dạy</div>
                      </div>
                      <i className="fas fa-chevron-right text-neutral-400"></i>
                    </div>
                  </div>
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Header className="bg-white border-0 pt-20 px-20 pb-16">
              <h5 className="text-neutral-900 fw-bold mb-0">Hoạt động gần đây</h5>
            </Card.Header>
            <Card.Body className="p-20">
              <div className="d-flex flex-column gap-16">
                {dashboardData.recentActivities.map(activity => (
                  <div key={activity.id} className="d-flex gap-12">
                    <div 
                      className={`rounded-8 d-flex align-items-center justify-content-center ${activity.iconBg}`}
                      style={{ width: '40px', height: '40px', flexShrink: 0 }}
                    >
                      <i className={`fas ${activity.icon} ${activity.iconColor}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-neutral-900 text-13 mb-4">{activity.message}</div>
                      <div className="text-neutral-500 text-11">
                        <i className="fas fa-clock me-1"></i>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherDashboard;