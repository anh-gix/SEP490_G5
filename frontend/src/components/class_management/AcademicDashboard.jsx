import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Container, Row, Col, Card, Button, Badge, ProgressBar, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
=======
import { Container, Row, Col, Card, Button, Badge, Table, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
>>>>>>> origin/Namvv-teacher-class-management
import academicStaffService from '../../services/academicStaffService';

const AcademicDashboard = () => {
  const navigate = useNavigate();

  const [todayOverview, setTodayOverview] = useState({
    todaySchedules: 0,
    absentStudents: 0,
    lateStudents: 0,
    pendingLeaveRequests: 0,
    pendingMakeupClasses: 0,
    newClassRequests: 0,
    totalRequestsLastWeek: 0,
    pendingChangeClassRequests: 0
  });

  const [absentStudentsList, setAbsentStudentsList] = useState([]);
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); // Time slots from database
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

      // Single API call to get all dashboard data
      const response = await academicStaffService.getDashboardData();
      
      if (response.success && response.data) {
        const data = response.data;
        
        // Set all state from the aggregated response
        setTodayOverview(data.todayOverview || {
          todaySchedules: 0,
          absentStudents: 0,
          lateStudents: 0,
          pendingLeaveRequests: 0,
          pendingMakeupClasses: 0,
<<<<<<< HEAD
          newClassRequests: 0
=======
          newClassRequests: 0,
          totalRequestsLastWeek: 0,
          pendingChangeClassRequests: 0
>>>>>>> origin/Namvv-teacher-class-management
        });
        
        setTodaySchedule(data.todaySchedule || []);
        setAbsentStudentsList(data.absentStudentsList || []);
        setRoomSchedule(data.roomSchedule || []);
<<<<<<< HEAD
=======
        setTimeSlots(data.timeSlots || []); // Set time slots from API
>>>>>>> origin/Namvv-teacher-class-management
        setClassProgress(data.classProgress || []);
        setRecentActivities(data.recentActivities || []);
      } else {
        throw new Error(response.message || 'Không thể tải dữ liệu dashboard');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
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

  // Filter only absent students (not late) for the sidebar
  const absentOnlyStudents = absentStudentsList.filter(student => student.status === 'absent');

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

<<<<<<< HEAD
      {/* Today Overview - Priority Section */}
=======
>>>>>>> origin/Namvv-teacher-class-management
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

            {/* Tổng số đơn trong 1 tuần qua */}
            <Col md={4} lg>
                <Card className="bg-purple-50 border border-purple-200 rounded-8 h-100 transition-2 item-hover">
                  <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="text-purple-700 fw-bold" style={{ fontSize: '14px' }}>
                        Tổng số đơn trong 1 tuần qua
                      </div>
                    </div>
                    <div className="text-center">
                      <h1 className="text-purple-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                        {todayOverview.totalRequestsLastWeek || 0}
                      </h1>
                    </div>
                    <div className="text-end">
                    <Link to="/academic/request-management" className="text-decoration-none">
                      <span className="text-purple-700 text-11 fw-medium">
                        Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                      </span>
                    </Link>
                    </div>
                  </Card.Body>
                </Card>
            </Col>

            {/* đơn lâu nhất chưa xử lý (bao nhiêu ngày chưa giải quyết) */}
            <Col md={4} lg>
              <Card 
                className="bg-purple-50 border border-purple-200 rounded-8 h-100 transition-2 item-hover"
                style={{ cursor: recentActivities && recentActivities.length > 0 && recentActivities[recentActivities.length - 1]?.id ? 'pointer' : 'default' }}
                onClick={() => {
                  const longestPendingRequest = recentActivities && recentActivities.length > 0 ? recentActivities[recentActivities.length - 1] : null;
                  if (longestPendingRequest?.id) {
                    navigate(`/academic/request-management/${longestPendingRequest.id}`);
                  }
                }}
              >
                <Card.Body className="p-16 d-flex flex-column justify-content-between" style={{ minHeight: '120px' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="text-purple-700 fw-bold" style={{ fontSize: '14px' }}>
                      Đơn lâu nhất chưa xử lý
                    </div>
                  </div>
                  <div className="text-center">
                    <h1 className="text-purple-600 fw-bold mb-2" style={{ fontSize: '36px', lineHeight: '1' }}>
                    {recentActivities && recentActivities.length > 0 ? (
                      <>
                        <div>
                          <div className="fw-bold text-15 mb-0">
                            {recentActivities[recentActivities.length - 1].message}
                          </div>
                          <div className="text-12 text-muted">
                            {recentActivities[recentActivities.length - 1].time}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-13 text-muted">Không có đơn chờ xử lý</span>
                    )}
                    </h1>
                  </div>
                  <div className="text-end">
                    {recentActivities && recentActivities.length > 0 && recentActivities[recentActivities.length - 1]?.id ? (
                      <Link 
                        to={`/academic/request-management/${recentActivities[recentActivities.length - 1].id}`} 
                        className="text-decoration-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-purple-700 text-11 fw-medium">
                          Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                        </span>
                      </Link>
                    ) : (
                      <span className="text-purple-700 text-11 fw-medium">
                        Xem chi tiết <i className="fas fa-arrow-right ms-1"></i>
                      </span>
                    )}
                    </div>
                  </Card.Body>
                </Card>
            </Col>


          </Row>
        </Card.Body>
      </Card>


      <Row className="g-3">

        <Col lg={8}>

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
                    {timeSlots.length > 0 ? (
                      timeSlots.map((timeSlot, idx) => (
                        <th key={idx} className="text-neutral-700 fw-medium text-12 px-16 py-10">
                          {timeSlot}
                        </th>
                      ))
                    ) : (
                      // Fallback to default time slots if not loaded yet
                      <>
                        <th className="text-neutral-700 fw-medium text-12 px-16 py-10">08:00-10:00</th>
                        <th className="text-neutral-700 fw-medium text-12 px-16 py-10">10:30-12:30</th>
                        <th className="text-neutral-700 fw-medium text-12 px-16 py-10">14:00-16:00</th>
                        <th className="text-neutral-700 fw-medium text-12 px-16 py-10">18:00-20:00</th>
                      </>
                    )}
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
        </Col>

        <Col lg={4}>
          <Card className="bg-white border-0 rounded-12 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-danger-25 border-0 p-20">
              <h6 className="text-neutral-900 fw-bold mb-0">
                <i className="fas fa-user-times text-danger-600 me-2"></i>
                Học sinh vắng hôm nay
              </h6>
            </Card.Header>
            <Card.Body className="p-20" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <div className="d-flex flex-column gap-16">
                {absentOnlyStudents.length > 0 ? (
                  absentOnlyStudents.map(student => (
                    <div key={student.id} className="d-flex gap-12 pb-16 border-bottom border-neutral-100">
                      <div 
                        className="d-flex align-items-center justify-content-center rounded-circle text-danger-600"
                        style={{ 
                          width: '40px', 
                          height: '40px', 
                          backgroundColor: 'var(--danger-50)',
                          minWidth: '40px'
                        }}
                      >
                        <i className="fas fa-user-times"></i>
                      </div>
                      <div className="flex-grow-1">
                        <p className="text-neutral-900 fw-medium mb-2 text-14">{student.name}</p>
                        <div className="d-flex align-items-center gap-8 mb-2">
                          <Badge className="bg-danger-100 text-danger-700 px-8 py-2 text-11">
                            <i className="fas fa-times me-1"></i>
                            Vắng
                          </Badge>
                        </div>
                        <div className="text-neutral-500 text-12 mb-1">
                          <i className="fas fa-users me-1"></i>
                          {student.class}
                        </div>
                        <span className="text-neutral-400 text-12">
                          <i className="fas fa-clock me-1"></i>
                          {student.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-neutral-500 text-14 mb-0">Không có học sinh vắng hôm nay</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* <Row>
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
<<<<<<< HEAD
      </Row>
=======
      </Row> */}
>>>>>>> origin/Namvv-teacher-class-management
    </Container>
  );
};

export default AcademicDashboard;
