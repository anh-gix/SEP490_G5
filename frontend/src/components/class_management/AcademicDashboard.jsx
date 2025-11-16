import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Academic Dashboard Component
 * Trang tổng quan cho module Giáo vụ
 */
const AcademicDashboard = () => {

  const [todayOverview, setTodayOverview] = useState({
    todaySchedules: 0,
    absentStudents: 0,
    lateStudents: 0,
    pendingLeaveRequests: 0,
    pendingMakeupClasses: 0,
    newClassRequests: 0
  });

  const [absentStudentsList, setAbsentStudentsList] = useState([]);
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [classProgress, setClassProgress] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []); 

  const fetchDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      // Mock data for demonstration

      setTodayOverview({
        todaySchedules: 12,
        absentStudents: 5,
        lateStudents: 2,
        pendingLeaveRequests: 8,
        pendingMakeupClasses: 3,
        newClassRequests: 2
      });

      setAbsentStudentsList([
        { id: 1, name: 'Nguyễn Văn A', studentId: 'SV001', class: 'A1-Morning-01', time: '08:00', status: 'absent' },
        { id: 2, name: 'Trần Thị B', studentId: 'SV015', class: 'A1-Morning-01', time: '08:00', status: 'absent' },
        { id: 3, name: 'Lê Văn C', studentId: 'SV023', class: 'A2-Morning-02', time: '10:30', status: 'late' },
        { id: 4, name: 'Phạm Thị D', studentId: 'SV042', class: 'B1-Afternoon-01', time: '14:00', status: 'absent' },
        { id: 5, name: 'Hoàng Văn E', studentId: 'SV058', class: 'A2-Evening-01', time: '18:00', status: 'late' }
      ]);

      setRoomSchedule([
        { 
          room: 'Room 101', 
          location: 'Tầng 1',
          schedules: [
            { time: '08:00-10:00', class: 'A1-Morning-01', status: 'occupied' },
            { time: '14:00-16:00', class: 'B1-Afternoon-01', status: 'occupied' },
            { time: '18:00-20:00', class: 'Free', status: 'available' }
          ]
        },
        { 
          room: 'Room 102', 
          location: 'Tầng 1',
          schedules: [
            { time: '08:00-10:00', class: 'Free', status: 'available' },
            { time: '10:30-12:30', class: 'A2-Morning-02', status: 'occupied' },
            { time: '18:00-20:00', class: 'A2-Evening-01', status: 'occupied' }
          ]
        },
        { 
          room: 'Room 201', 
          location: 'Tầng 2',
          schedules: [
            { time: '08:00-10:00', class: 'Free', status: 'available' },
            { time: '14:00-16:00', class: 'B1-Afternoon-01', status: 'occupied' },
            { time: '18:00-20:00', class: 'Free', status: 'available' }
          ]
        },
        { 
          room: 'Room 103', 
          location: 'Tầng 1',
          schedules: [
            { time: '08:00-10:00', class: 'Free', status: 'available' },
            { time: '10:30-12:30', class: 'Free', status: 'available' },
            { time: '18:00-20:00', class: 'C1-Evening-01', status: 'occupied' }
          ]
        }
      ]);

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
        },
        {
          id: 5,
          type: 'student_registered',
          message: '15 học viên mới đăng ký khóa học A1',
          time: '3 giờ trước',
          icon: 'fa-user-plus',
          color: 'info'
        },
        {
          id: 6,
          type: 'room_booked',
          message: 'Phòng 201 đã được đặt cho buổi học bù',
          time: '4 giờ trước',
          icon: 'fa-door-open',
          color: 'warning'
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
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <div className="mb-24">
        <h2 className="text-neutral-900 fw-bold mb-8">Dashboard Giáo Vụ</h2>
        <p className="text-neutral-500 mb-0">
          {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Today Overview - Priority Section */}
      <Card className="bg-white border-0 rounded-12 mb-20" 
            style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-20">
          <div className="mb-16">
            <h6 className="text-neutral-900 fw-bold mb-0">
              <i className="fas fa-calendar-day text-main-600 me-2"></i>
              Tổng quan hôm nay
            </h6>
          </div>

          <Row className="g-2">
            {/* Học viên vắng */}
            <Col md={6} lg>
              <Card className="bg-danger-50 border border-danger-200 rounded-8 h-100 cursor-pointer transition-2 item-hover">
                <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="text-danger-700 fw-bold" style={{ fontSize: '14px' }}>
                      Học viên vắng
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-danger-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                      {todayOverview.absentStudents}
                    </h1>
                    <div className="text-danger-600" style={{ fontSize: '12px' }}>
                      <i className="fas fa-user-times me-1"></i>
                      +{todayOverview.lateStudents} đi muộn
                    </div>
                  </div>
                  <div className="text-end">
                    <Link to="/academic/class-management" className="text-decoration-none">
                    <span className="text-danger-700 text-11 fw-medium cursor-pointer">
                      Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                    </span>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Yêu cầu xếp lớp mới */}
            <Col md={6} lg>
                <Card className="bg-purple-50 border border-purple-200 rounded-8 h-100 transition-2 item-hover">
                  <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="text-purple-700 fw-bold" style={{ fontSize: '14px' }}>
                        Yêu cầu xếp lớp
                      </div>
                    </div>
                    <div className="text-center">
                      <h1 className="text-purple-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                        {todayOverview.newClassRequests}
                      </h1>
                      <div className="text-purple-600" style={{ fontSize: '12px' }}>
                        <i className="fas fa-users-cog me-1"></i>
                        Chờ xử lý
                      </div>
                    </div>
                    <div className="text-end">
                    <Link to="/academic/class-management" className="text-decoration-none">
                      <span className="text-purple-700 text-11 fw-medium">
                        Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                      </span>
                    </Link>
                    </div>
                  </Card.Body>
                </Card>
            </Col>

            {/* Yêu cầu xin nghỉ */}
            <Col md={6} lg>
              <Card className="bg-warning-50 border border-warning-200 rounded-8 h-100 cursor-pointer transition-2 item-hover">
                <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="text-warning-700 fw-bold" style={{ fontSize: '14px' }}>
                      Yêu cầu xin nghỉ
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-warning-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                      {todayOverview.pendingLeaveRequests}
                    </h1>
                    <div className="text-warning-600" style={{ fontSize: '12px' }}>
                      <i className="fas fa-clock me-1"></i>
                      Chờ duyệt
                    </div>
                  </div>
                  <div className="text-end">
                    <Link to="/academic/class-management" className="text-decoration-none">
                    <span className="text-warning-700 text-11 fw-medium cursor-pointer">
                      Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                    </span>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Buổi học bù chờ xếp */}
            <Col md={6} lg>
              <Card className="bg-info-50 border border-info-200 rounded-8 h-100 cursor-pointer transition-2 item-hover">
                <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="text-info-700 fw-bold" style={{ fontSize: '14px' }}>
                      Học bù chờ xếp
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-info-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                      {todayOverview.pendingMakeupClasses}
                    </h1>
                    <div className="text-info-600" style={{ fontSize: '12px' }}>
                      <i className="fas fa-calendar-plus me-1"></i>
                      Cần xếp lịch
                    </div>
                  </div>
                  <div className="text-end">
                    <Link to="/academic/class-management" className="text-decoration-none">
                    <span className="text-info-700 text-11 fw-medium cursor-pointer">
                      Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                    </span>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>


      <Row className="g-3">
        {/* Left Column - Schedule & Room Usage */}
        <Col lg={8}>
          {/* Today's Schedule - Compact */}
          <Card className="bg-white border-0 rounded-12 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-main-25 border-0 p-20">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-calendar-check text-main-600 me-2"></i>
                  Lịch học hôm nay ({todaySchedule.length} buổi)
                </h6>
                <Link to="/academic/schedule-management">
                  <Button className="btn-outline-main text-12 fw-medium px-12 py-6 radius-8">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              <Row className="g-2">
                {todaySchedule.map(schedule => (
                  <Col md={6} key={schedule.id}>
                    <Card className={`border-0 rounded-8 ${
                      schedule.status === 'ongoing' ? 'bg-success-50 border-success-200' : 'bg-white border-neutral-200'
                    }`} style={{ border: '1px solid' }}>
                      <Card.Body className="p-12">
                        <div className="d-flex justify-content-between align-items-start mb-8">
                          <div>
                            <h6 className="text-neutral-900 fw-bold mb-4 text-13">
                              {schedule.className}
                            </h6>
                            <p className="text-neutral-600 mb-0 text-11">
                              <i className="fas fa-user-tie me-1"></i>
                              {schedule.teacher}
                            </p>
                          </div>
                          {getStatusBadge(schedule.status)}
                        </div>
                        <div className="d-flex justify-content-between text-11 text-neutral-500">
                          <span>
                            <i className="fas fa-clock me-1"></i>
                            {schedule.time}
                          </span>
                          <span>
                            <i className="fas fa-door-open me-1"></i>
                            {schedule.room}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>

          {/* Room Schedule */}
          <Card className="bg-white border-0 rounded-12 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-main-25 border-0 p-20">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-door-open text-warning-600 me-2"></i>
                  Lịch sử dụng phòng học
                </h6>
                <Link to="/academic/room-management">
                  <Button className="btn-outline-main text-12 fw-medium px-12 py-6 radius-8">
                    Quản lý phòng
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table className="mb-0" hover size="sm">
                <thead style={{ backgroundColor: 'var(--neutral-50)' }}>
                  <tr>
                    <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Phòng</th>
                    <th className="text-neutral-700 fw-medium text-12 px-16 py-10">08:00-10:00</th>
                    <th className="text-neutral-700 fw-medium text-12 px-16 py-10">10:30-12:30</th>
                    <th className="text-neutral-700 fw-medium text-12 px-16 py-10">14:00-16:00</th>
                    <th className="text-neutral-700 fw-medium text-12 px-16 py-10">18:00-20:00</th>
                  </tr>
                </thead>
                <tbody>
                  {roomSchedule.map((room, idx) => (
                    <tr key={idx}>
                      <td className="px-16 py-12">
                        <div className="text-neutral-900 fw-semibold text-13">{room.room}</div>
                        <div className="text-neutral-500 text-11">{room.location}</div>
                      </td>
                      {room.schedules.map((schedule, sIdx) => (
                        <td key={sIdx} className="px-16 py-12">
                          {schedule.status === 'occupied' ? (
                            <Badge className="bg-success-100 text-success-700 px-8 py-4 text-11 fw-medium">
                              <i className="fas fa-users me-1"></i>
                              {schedule.class}
                            </Badge>
                          ) : (
                            <Badge className="bg-neutral-100 text-neutral-500 px-8 py-4 text-11">
                              <i className="fas fa-check-circle me-1"></i>
                              Trống
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Absent Students List */}
          {absentStudentsList.length > 0 && (
            <Card className="bg-white border-0 rounded-12" 
                  style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
              <Card.Header className="bg-danger-25 border-0 p-20">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-exclamation-triangle text-danger-600 me-2"></i>
                  Danh sách học viên vắng/muộn hôm nay
                </h6>
              </Card.Header>
              <Card.Body className="p-0">
                <Table className="mb-0" hover size="sm">
                  <thead style={{ backgroundColor: 'var(--neutral-50)' }}>
                    <tr>
                      <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Mã SV</th>
                      <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Họ tên</th>
                      <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Lớp</th>
                      <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Thời gian</th>
                      <th className="text-neutral-700 fw-medium text-12 px-16 py-10">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absentStudentsList.map(student => (
                      <tr key={student.id}>
                        <td className="px-16 py-12 text-neutral-700 text-12">{student.studentId}</td>
                        <td className="px-16 py-12 text-neutral-900 fw-medium text-13">{student.name}</td>
                        <td className="px-16 py-12 text-neutral-700 text-12">{student.class}</td>
                        <td className="px-16 py-12 text-neutral-600 text-12">
                          <i className="fas fa-clock me-1"></i>
                          {student.time}
                        </td>
                        <td className="px-16 py-12">
                          {student.status === 'absent' ? (
                            <Badge className="bg-danger-100 text-danger-700 px-8 py-4 text-11">
                              <i className="fas fa-times me-1"></i>
                              Vắng
                            </Badge>
                          ) : (
                            <Badge className="bg-warning-100 text-warning-700 px-8 py-4 text-11">
                              <i className="fas fa-clock me-1"></i>
                              Muộn
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Right Column - Activities */}
        <Col lg={4}>
          <Card className="bg-white border-0 rounded-12 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-main-25 border-0 p-20">
              <h6 className="text-neutral-900 fw-bold mb-0">
                <i className="fas fa-history text-main-600 me-2"></i>
                Hoạt động gần đây
              </h6>
            </Card.Header>
            <Card.Body className="p-20" style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Class Progress - Compact */}
      <Row>
        <Col>
          <Card className="bg-white border-0 rounded-12" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-main-25 border-0 d-flex justify-content-between align-items-center p-20">
              <div>
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-chart-line text-main-600 me-2"></i>
                  Tiến độ các lớp học
                </h6>
              </div>
              <Link to="/academic/class-management">
                <Button className="btn-outline-main text-12 fw-medium px-12 py-6 radius-8">
                  Xem chi tiết
                </Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-20">
              <Row className="g-2">
                {classProgress.map(classItem => (
                  <Col key={classItem.id} md={6} lg={4}>
                    <Card className="bg-neutral-25 border-0 rounded-8">
                      <Card.Body className="p-16">
                        <div className="d-flex justify-content-between align-items-start mb-10">
                          <div>
                            <h6 className="text-neutral-900 fw-semibold mb-4 text-14">{classItem.name}</h6>
                            <Badge className="bg-main-600 text-white px-8 py-4 text-11">{classItem.level}</Badge>
                          </div>
                          <span className="text-main-600 fw-bold text-16">{classItem.progress}%</span>
                        </div>
                        
                        <div className="mb-12">
                          <div 
                            className="bg-neutral-200 rounded-pill overflow-hidden"
                            style={{ height: '6px' }}
                          >
                            <div 
                              className="bg-main-600 h-100 transition-2"
                              style={{ width: `${classItem.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-between text-12">
                          <span className="text-neutral-500">
                            <i className="fas fa-book me-1"></i>
                            {classItem.completedLessons}/{classItem.totalLessons}
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
      <Row className="mt-20">
        <Col>
          <Card className="bg-gradient border-0 rounded-12" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--main-600) 0%, var(--main-700) 100%)',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                }}>
            <Card.Body className="p-20">
              <Row className="align-items-center">
                <Col lg={8}>
                  <h5 className="text-white fw-bold mb-8">Thao tác nhanh</h5>
                  <p className="text-white mb-0 text-14" style={{ opacity: 0.9 }}>
                    Truy cập nhanh các chức năng thường dùng
                  </p>
                </Col>
                <Col lg={4}>
                  <div className="d-flex gap-8 flex-wrap justify-content-lg-end">
                    <Link to="/academic/class-management">
                      <Button className="bg-white text-main-600 fw-medium px-16 py-8 radius-8 border-0 text-13">
                        <i className="fas fa-plus me-2"></i>
                        Tạo lớp
                      </Button>
                    </Link>
                    <Link to="/academic/schedule-management">
                      <Button className="bg-white text-main-600 fw-medium px-16 py-8 radius-8 border-0 text-13">
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
