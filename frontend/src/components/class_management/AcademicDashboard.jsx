import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Academic Dashboard Component
 * Trang tổng quan cho module Giáo vụ
 */
const AcademicDashboard = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    totalTeachers: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('activities'); // 'activities' or 'requests'
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [classProgress, setClassProgress] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []); 

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for demonstration
      setStats({
        totalClasses: 45,
        activeClasses: 38,
        totalStudents: 856,
        totalTeachers: 24
      });

      setRecentActivities([
        {
          id: 1,
          type: 'class_created',
          message: 'Lớp A1-Morning-05 đã được tạo',
          time: '10 phút trước',
          icon: 'fa-plus-circle',
          color: 'success'
        },
        {
          id: 2,
          type: 'schedule_updated',
          message: 'Lịch học lớp B1-Evening-02 đã được cập nhật',
          time: '25 phút trước',
          icon: 'fa-calendar-edit',
          color: 'info'
        },
        {
          id: 3,
          type: 'teacher_assigned',
          message: 'GV Nguyễn Văn A được phân công lớp A2-Weekend-01',
          time: '1 giờ trước',
          icon: 'fa-user-check',
          color: 'primary'
        },
        {
          id: 4,
          type: 'class_completed',
          message: 'Lớp C1-Morning-01 đã hoàn thành khóa học',
          time: '2 giờ trước',
          icon: 'fa-check-circle',
          color: 'success'
        }
      ]);

      setWorkRequests([
        {
          id: 1,
          type: 'new_class',
          requester: 'Trưởng trung tâm',
          message: 'Yêu cầu xếp lớp A1-Morning-06 cho học viên mới',
          priority: 'high',
          time: '5 phút trước',
          icon: 'fa-chalkboard-teacher',
          color: 'danger',
          status: 'pending'
        },
        {
          id: 2,
          type: 'makeup_class',
          requester: 'Nguyễn Văn A (SV001)',
          message: 'Xin nghỉ học bù buổi ngày 18/11 - Lý do: Ốm',
          priority: 'medium',
          time: '15 phút trước',
          icon: 'fa-calendar-times',
          color: 'warning',
          status: 'pending'
        },
        {
          id: 3,
          type: 'new_class',
          requester: 'Trưởng trung tâm',
          message: 'Yêu cầu mở lớp B2-Evening-03 - Bắt đầu 25/11',
          priority: 'high',
          time: '30 phút trước',
          icon: 'fa-chalkboard-teacher',
          color: 'danger',
          status: 'pending'
        },
        {
          id: 4,
          type: 'makeup_class',
          requester: 'Trần Thị B (SV015)',
          message: 'Xin nghỉ học bù buổi ngày 20/11 - Lý do: Công tác',
          priority: 'medium',
          time: '1 giờ trước',
          icon: 'fa-calendar-times',
          color: 'warning',
          status: 'pending'
        },
        {
          id: 5,
          type: 'schedule_change',
          requester: 'GV Lê Văn C',
          message: 'Đề nghị đổi lịch dạy từ tối thứ 3 sang tối thứ 5',
          priority: 'low',
          time: '2 giờ trước',
          icon: 'fa-exchange-alt',
          color: 'info',
          status: 'pending'
        }
      ]);

      setTodaySchedule([
        {
          id: 1,
          time: '08:00 - 10:00',
          className: 'A1-Morning-01',
          teacher: 'Nguyễn Văn A',
          room: 'Room 101',
          status: 'ongoing'
        },
        {
          id: 2,
          time: '10:30 - 12:30',
          className: 'A2-Morning-02',
          teacher: 'Trần Thị B',
          room: 'Room 102',
          status: 'upcoming'
        },
        {
          id: 3,
          time: '14:00 - 16:00',
          className: 'B1-Afternoon-01',
          teacher: 'Lê Văn C',
          room: 'Room 201',
          status: 'upcoming'
        },
        {
          id: 4,
          time: '18:00 - 20:00',
          className: 'A2-Evening-01',
          teacher: 'Phạm Thị D',
          room: 'Room 103',
          status: 'upcoming'
        }
      ]);

      setClassProgress([
        {
          id: 1,
          name: 'A1-Morning-01',
          level: 'A1',
          progress: 75,
          students: 20,
          completedLessons: 22,
          totalLessons: 30
        },
        {
          id: 2,
          name: 'A2-Evening-01',
          level: 'A2',
          progress: 60,
          students: 18,
          completedLessons: 18,
          totalLessons: 30
        },
        {
          id: 3,
          name: 'B1-Weekend-01',
          level: 'B1',
          progress: 45,
          students: 15,
          completedLessons: 13,
          totalLessons: 30
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-success-600 text-white px-12 py-6">Đang học</Badge>;
      case 'upcoming':
        return <Badge className="bg-info-500 text-white px-12 py-6">Sắp diễn ra</Badge>;
      case 'completed':
        return <Badge className="bg-neutral-600 text-white px-12 py-6">Đã hoàn thành</Badge>;
      default:
        return <Badge className="bg-neutral-400 text-white px-12 py-6">{status}</Badge>;
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
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <div className="mb-24">
        <h2 className="text-neutral-900 fw-bold mb-8">Dashboard Giáo Vụ</h2>
        <p className="text-neutral-500 mb-0">Tổng quan hoạt động và thống kê hệ thống</p>
      </div>

      {/* Stats Cards - Compact version (4 cards only) */}
      <Row className="g-3 mb-24">
        <Col md={6} lg={3}>
          <Card className="bg-white border border-main-200 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div className="bg-main-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-chalkboard-teacher"></i>
                </div>
                <Badge className="bg-main-50 text-main-600 px-10 py-4">+5%</Badge>
              </div>
              <h3 className="text-neutral-900 fw-bold mb-4">{stats.totalClasses}</h3>
              <p className="text-neutral-500 mb-0 text-13">Tổng số lớp</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-success-200 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div className="bg-success-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-play-circle"></i>
                </div>
                <Badge className="bg-success-50 text-success-600 px-10 py-4">Active</Badge>
              </div>
              <h3 className="text-neutral-900 fw-bold mb-4">{stats.activeClasses}</h3>
              <p className="text-neutral-500 mb-0 text-13">Lớp đang học</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-info-200 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div className="bg-info-500 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-user-graduate"></i>
                </div>
                <Badge className="bg-info-50 text-info-600 px-10 py-4">+12</Badge>
              </div>
              <h3 className="text-neutral-900 fw-bold mb-4">{stats.totalStudents}</h3>
              <p className="text-neutral-500 mb-0 text-13">Học viên</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="bg-white border border-warning-200 rounded-12 box-shadow-sm transition-2 item-hover h-100">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center justify-content-between mb-12">
                <div className="bg-warning-600 text-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '48px', height: '48px' }}>
                  <i className="fas fa-user-tie"></i>
                </div>
                <Badge className="bg-warning-50 text-warning-600 px-10 py-4">24</Badge>
              </div>
              <h3 className="text-neutral-900 fw-bold mb-4">{stats.totalTeachers}</h3>
              <p className="text-neutral-500 mb-0 text-13">Giảng viên</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        {/* Today's Schedule */}
        <Col lg={8}>
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24 h-100">
            <Card.Header className="bg-main-25 border-0 d-flex justify-content-between align-items-center p-20">
              <div>
                <h5 className="text-neutral-900 fw-semibold mb-4">Lịch học hôm nay</h5>
                <p className="text-neutral-500 mb-0 text-13">
                  {new Date().toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <Link to="/schedule-management">
                <Button className="btn-outline-main text-13 fw-medium px-16 py-8 radius-8">
                  Xem tất cả <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0" hover>
                <thead style={{ backgroundColor: 'var(--neutral-50)' }}>
                  <tr>
                    <th className="text-neutral-700 fw-medium text-13 px-20 py-12">Thời gian</th>
                    <th className="text-neutral-700 fw-medium text-13 px-20 py-12">Lớp học</th>
                    <th className="text-neutral-700 fw-medium text-13 px-20 py-12">Giảng viên</th>
                    <th className="text-neutral-700 fw-medium text-13 px-20 py-12">Phòng</th>
                    <th className="text-neutral-700 fw-medium text-13 px-20 py-12">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map(schedule => (
                    <tr key={schedule.id}>
                      <td className="text-neutral-700 px-20 py-16">
                        <i className="fas fa-clock me-2 text-neutral-400"></i>
                        {schedule.time}
                      </td>
                      <td className="px-20 py-16">
                        <strong className="text-neutral-900">{schedule.className}</strong>
                      </td>
                      <td className="text-neutral-700 px-20 py-16">{schedule.teacher}</td>
                      <td className="text-neutral-700 px-20 py-16">
                        <i className="fas fa-door-open me-2 text-neutral-400"></i>
                        {schedule.room}
                      </td>
                      <td className="px-20 py-16">{getStatusBadge(schedule.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Activities & Work Requests */}
        <Col lg={4}>
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24 h-100">
            <Card.Header className="bg-main-25 border-0 p-20">
              <div className="d-flex gap-8 mb-0">
                <Button
                  size="sm"
                  className={`flex-fill text-13 fw-medium px-16 py-8 radius-8 ${
                    activeTab === 'activities' ? 'btn-main' : 'btn-outline-main'
                  }`}
                  onClick={() => setActiveTab('activities')}
                >
                  <i className="fas fa-history me-2"></i>
                  Hoạt động
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-13 fw-medium px-16 py-8 radius-8 position-relative ${
                    activeTab === 'requests' ? 'btn-main' : 'btn-outline-main'
                  }`}
                  onClick={() => setActiveTab('requests')}
                >
                  <i className="fas fa-tasks me-2"></i>
                  Yêu cầu
                  {workRequests.filter(r => r.status === 'pending').length > 0 && (
                    <Badge 
                      className="position-absolute top-0 start-100 translate-middle bg-danger-600 rounded-pill"
                      style={{ padding: '2px 6px', fontSize: '10px' }}
                    >
                      {workRequests.filter(r => r.status === 'pending').length}
                    </Badge>
                  )}
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-20" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {activeTab === 'activities' ? (
                <div className="d-flex flex-column gap-16">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="d-flex gap-12 pb-16 border-bottom border-neutral-100">
                      {getActivityIcon(activity)}
                      <div className="flex-grow-1">
                        <p className="text-neutral-700 mb-4 text-14">{activity.message}</p>
                        <span className="text-neutral-400 text-12">
                          <i className="fas fa-clock me-1"></i>
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="d-flex flex-column gap-12">
                  {workRequests.map(request => {
                    const priorityColors = {
                      high: { bg: 'bg-danger-50', border: 'border-danger-200', badge: 'bg-danger-600' },
                      medium: { bg: 'bg-warning-50', border: 'border-warning-200', badge: 'bg-warning-600' },
                      low: { bg: 'bg-info-50', border: 'border-info-200', badge: 'bg-info-600' }
                    };
                    const colors = priorityColors[request.priority];

                    return (
                      <Card 
                        key={request.id} 
                        className={`${colors.bg} border ${colors.border} rounded-12 transition-2 item-hover`}
                      >
                        <Card.Body className="p-16">
                          <div className="d-flex gap-12 mb-10">
                            {getActivityIcon(request)}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start mb-6">
                                <Badge className={`${colors.badge} text-white px-8 py-4 text-11 fw-semibold`}>
                                  {request.priority === 'high' && 'Ưu tiên cao'}
                                  {request.priority === 'medium' && 'Trung bình'}
                                  {request.priority === 'low' && 'Thấp'}
                                </Badge>
                                <span className="text-neutral-400 text-11">
                                  <i className="fas fa-clock me-1"></i>
                                  {request.time}
                                </span>
                              </div>
                              <p className="text-neutral-700 mb-6 text-13 fw-medium">{request.message}</p>
                              <p className="text-neutral-500 mb-0 text-12">
                                <i className="fas fa-user me-1"></i>
                                {request.requester}
                              </p>
                            </div>
                          </div>
                          <div className="d-flex gap-8 mt-12">
                            <Button 
                              size="sm" 
                              className="btn-success text-12 fw-medium flex-fill px-12 py-6"
                            >
                              <i className="fas fa-check me-1"></i>
                              Xử lý
                            </Button>
                            <Button 
                              size="sm" 
                              className="btn-outline-neutral text-12 fw-medium flex-fill px-12 py-6"
                            >
                              <i className="fas fa-eye me-1"></i>
                              Chi tiết
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Class Progress */}
      <Row>
        <Col>
          <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
            <Card.Header className="bg-main-25 border-0 d-flex justify-content-between align-items-center p-20">
              <div>
                <h5 className="text-neutral-900 fw-semibold mb-4">Tiến độ các lớp học</h5>
                <p className="text-neutral-500 mb-0 text-13">Theo dõi tiến độ học tập của các lớp</p>
              </div>
              <Link to="/class-management">
                <Button className="btn-outline-main text-13 fw-medium px-16 py-8 radius-8">
                  Xem chi tiết <i className="fas fa-arrow-right ms-2"></i>
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-24">
              <Row className="g-3">
                {classProgress.map(classItem => (
                  <Col key={classItem.id} md={6} lg={4}>
                    <Card className="bg-neutral-25 border border-neutral-100 rounded-12 h-100">
                      <Card.Body className="p-20">
                        <div className="d-flex justify-content-between align-items-start mb-12">
                          <div>
                            <h6 className="text-neutral-900 fw-semibold mb-4">{classItem.name}</h6>
                            <Badge className="bg-main-600 text-white px-10 py-4 text-12">{classItem.level}</Badge>
                          </div>
                          <span className="text-main-600 fw-bold text-18">{classItem.progress}%</span>
                        </div>
                        
                        <div className="mb-16">
                          <div 
                            className="bg-neutral-200 rounded-pill overflow-hidden"
                            style={{ height: '8px' }}
                          >
                            <div 
                              className="bg-main-600 h-100 transition-2"
                              style={{ width: `${classItem.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between text-13">
                          <span className="text-neutral-500">
                            <i className="fas fa-book me-1"></i>
                            {classItem.completedLessons}/{classItem.totalLessons} buổi
                          </span>
                          <span className="text-neutral-500">
                            <i className="fas fa-users me-1"></i>
                            {classItem.students} HV
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mt-24">
        <Col>
          <Card className="bg-gradient border-0 rounded-12 box-shadow-sm" 
                style={{ background: 'linear-gradient(135deg, var(--main-600) 0%, var(--main-700) 100%)' }}>
            <Card.Body className="p-24">
              <Row className="align-items-center">
                <Col lg={8}>
                  <h4 className="text-white fw-bold mb-12">Thao tác nhanh</h4>
                  <p className="text-white mb-0" style={{ opacity: 0.9 }}>
                    Truy cập nhanh các chức năng thường dùng của module Giáo vụ
                  </p>
                </Col>
                <Col lg={4}>
                  <div className="d-flex gap-12 flex-wrap justify-content-lg-end">
                    <Link to="/class-management">
                      <Button className="bg-white text-main-600 fw-medium px-20 py-10 radius-8 border-0 hover-shadow">
                        <i className="fas fa-plus me-2"></i>
                        Tạo lớp mới
                      </Button>
                    </Link>
                    <Link to="/schedule-management">
                      <Button className="bg-white text-main-600 fw-medium px-20 py-10 radius-8 border-0 hover-shadow">
                        <i className="fas fa-calendar-plus me-2"></i>
                        Tạo lịch học
                      </Button>
                    </Link>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AcademicDashboard;
