import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import classService from '../../services/classService';
import scheduleService from '../../services/scheduleService';
import roomService from '../../services/roomService';
import academicStaffService from '../../services/academicStaffService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []); 

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch today's schedules
      const schedulesResponse = await scheduleService.getAllSchedules({ 
        date: todayStr
        // Không filter theo status cũ nữa, lấy tất cả schedules
      });
      const todaySchedules = schedulesResponse.schedules || schedulesResponse || [];

      // Fetch all classes for progress
      const classesResponse = await classService.getAllClasses();
      const classes = classesResponse.classes || [];

      // Fetch rooms
      const roomsResponse = await roomService.getAllRooms();
      const rooms = roomsResponse.rooms || roomsResponse || [];

      // Fetch absent/late students from today's schedules
      const absentStudents = [];
      const lateStudents = [];
      
      for (const schedule of todaySchedules) {
        try {
          const attendanceResponse = await academicStaffService.getAttendance(
            schedule._id || schedule.id
          );
          const attendances = attendanceResponse.attendances || attendanceResponse || [];
          
          for (const att of attendances) {
            if (att.attendance?.status === 'absent') {
              absentStudents.push({
                id: att.student?._id || att.student,
                name: att.student?.username || 'N/A',
                studentId: att.student?._id || att.student,
                class: schedule.class?.name || schedule.className || 'N/A',
                time: schedule.startTime || 'N/A',
                status: 'absent'
              });
            } else if (att.attendance?.status === 'late') {
              lateStudents.push({
                id: att.student?._id || att.student,
                name: att.student?.username || 'N/A',
                studentId: att.student?._id || att.student,
                class: schedule.class?.name || schedule.className || 'N/A',
                time: schedule.startTime || 'N/A',
                status: 'late'
              });
            }
          }
        } catch (err) {
          // Skip if attendance endpoint doesn't exist or fails
          console.warn(`Could not fetch attendance for schedule ${schedule._id}:`, err);
        }
      }

      // Transform today's schedules
      const transformedTodaySchedule = todaySchedules.slice(0, 10).map((schedule, index) => {
        const startTime = new Date(`${schedule.date}T${schedule.startTime}`);
        const endTime = new Date(`${schedule.date}T${schedule.endTime}`);
        const now = new Date();
        
        let status = 'upcoming';
        if (startTime <= now && now <= endTime) {
          status = 'ongoing';
        } else if (endTime < now) {
          status = 'completed';
        }

        return {
          id: schedule._id || schedule.id || index,
          time: `${schedule.startTime || 'N/A'} - ${schedule.endTime || 'N/A'}`,
          className: schedule.class?.name || schedule.className || 'N/A',
          teacher: schedule.teacher?.username || schedule.teacherName || 'N/A',
          room: schedule.room?.room_name || schedule.roomName || 'N/A',
          status
        };
      });

      // Build room schedule
      const timeSlots = ['08:00-10:00', '10:30-12:30', '14:00-16:00', '18:00-20:00'];
      const roomScheduleData = rooms.slice(0, 4).map(room => {
        const schedules = timeSlots.map(timeSlot => {
          const [startTime, endTime] = timeSlot.split('-');
          const matchingSchedule = todaySchedules.find(s => 
            s.room?._id?.toString() === room._id?.toString() &&
            s.startTime === startTime &&
            s.endTime === endTime
          );
          
          if (matchingSchedule) {
            return {
              time: timeSlot,
              class: matchingSchedule.class?.name || matchingSchedule.className || 'N/A',
              status: 'occupied'
            };
          }
          return {
            time: timeSlot,
            class: 'Free',
            status: 'available'
          };
        });

        return {
          room: room.room_name || room.name || 'N/A',
          location: room.location || 'N/A',
          schedules
        };
      });

      // Calculate class progress
      const classProgressData = classes.slice(0, 3).map(cls => {
        const totalSchedules = cls.totalSchedules || 0;
        const completedSchedules = cls.completedSchedules || 0;
        const progress = totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0;

        return {
          id: cls._id || cls.id,
          name: cls.name || 'N/A',
          level: cls.level || cls.course?.level || 'N/A',
          progress,
          students: cls.totalStudents || cls.students?.length || 0,
          completedLessons: completedSchedules,
          totalLessons: totalSchedules
        };
      });

      // Set overview stats
      setTodayOverview({
        todaySchedules: todaySchedules.length,
        absentStudents: absentStudents.length,
        lateStudents: lateStudents.length,
        pendingLeaveRequests: 0, // TODO: Implement when leave request feature is added
        pendingMakeupClasses: 0, // TODO: Implement when makeup class feature is added
        newClassRequests: 0 // TODO: Implement when class request feature is added
      });

      setAbsentStudentsList([...absentStudents, ...lateStudents].slice(0, 10));
      setRoomSchedule(roomScheduleData);
      setRecentActivities([]); // TODO: Implement activity log endpoint
      setTodaySchedule(transformedTodaySchedule);
      setClassProgress(classProgressData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

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

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-24">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

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
