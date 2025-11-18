import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { 
  studentInfoMock, 
  generateWeekScheduleMock, 
  dashboardAssignmentsMock, 
  toeicResultsMock,
  activeClassesMock 
} from './student_mockdata';

/**
 * Student Dashboard Component - Redesigned
 * Trang tổng quan dành cho học viên - Tập trung vào lịch học và bài tập
 */
const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // all, pending, overdue
  const [toeicResults, setToeicResults] = useState([]);
  const [activeClasses, setActiveClasses] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // TODO: Replace with actual API calls
      // const response = await studentApi.getDashboardData();
      // setStudentInfo(response.studentInfo);
      // setWeekSchedule(response.weekSchedule);
      // setAssignments(response.assignments);
      // setToeicResults(response.toeicResults);
      
      // Using mock data
      setStudentInfo(studentInfoMock);
      setWeekSchedule(generateWeekScheduleMock());
      setAssignments(dashboardAssignmentsMock);
      setToeicResults(toeicResultsMock);
      setActiveClasses(activeClassesMock);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const getFilteredAssignments = () => {
    const now = new Date();
    return assignments
      .filter(assignment => {
        if (assignmentFilter === 'all') return true;
        if (assignmentFilter === 'pending') return assignment.status === 'pending';
        if (assignmentFilter === 'overdue') {
          return new Date(assignment.dueDate) < now || assignment.status === 'overdue';
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority (high first) then by due date
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (a.priority !== 'high' && b.priority === 'high') return 1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#F5F7FA' }}>
      {/* Welcome Banner - Compact with backdrop */}
      <Card className="border-0 rounded-16 mb-24 overflow-hidden" 
            style={{ 
              background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)',
              boxShadow: '0 4px 20px rgba(13, 116, 255, 0.15)'
            }}>
        <Card.Body className="p-24">
          <Row className="align-items-center">
            <Col lg={9}>
              <div className="d-flex align-items-center gap-16">
                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                     style={{ width: '50px', height: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <i className="fas fa-user-graduate text-main-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <h4 className="text-white fw-bold mb-2">
                    Xin chào, {studentInfo?.name}! 👋
                  </h4>
                  <p className="text-white mb-0" style={{ opacity: 0.9, fontSize: '14px' }}>
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Main Content - Lịch học tuần */}
        <Col lg={8}>
          {/* Weekly Calendar */}
          <Card className="bg-white border-0 rounded-16 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-gradient-primary border-0 p-24"
                         style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #00C9FF 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="text-white fw-bold mb-8">
                    <i className="fas fa-calendar-week me-2"></i>
                    Lịch học tuần này
                  </h5>
                  <p className="text-white mb-0 text-14" style={{ opacity: 0.9 }}>
                    Tuần {Math.ceil(new Date().getDate() / 7)} - Tháng {new Date().getMonth() + 1}
                  </p>
                </div>
                <Link to="/student/schedule">
                  <Button className="btn-white text-main-600 text-13 fw-semibold px-20 py-10 radius-8">
                    Xem chi tiết <i className="fas fa-arrow-right ms-2"></i>
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {/* Week Calendar Grid */}
              <div className="week-calendar">
                <Row className="g-0">
                  {weekSchedule.map((day, index) => (
                    <Col key={index} className="border-end border-neutral-100">
                      <div className={`text-center py-16 border-bottom border-neutral-100 ${day.isToday ? 'bg-main-50' : 'bg-neutral-50'}`}>
                        <div className={`text-12 fw-medium mb-4 ${day.isToday ? 'text-main-600' : 'text-neutral-600'}`}>
                          {day.dayName}
                        </div>
                        <div className={`${day.isToday ? 'bg-main-600 text-white' : 'bg-white text-neutral-800'} rounded-circle d-inline-flex align-items-center justify-content-center fw-bold`}
                             style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                          {day.dayNumber}
                        </div>
                      </div>
                      <div className="p-12" style={{ minHeight: '120px' }}>
                        {day.schedules.length > 0 ? (
                          day.schedules.map((schedule, idx) => (
                            <div key={idx} className="bg-main-50 border border-main-200 rounded-8 p-10 mb-8">
                              <div className="text-main-600 fw-bold text-12 mb-4">
                                <i className="fas fa-clock me-1"></i>
                                {schedule.time}
                              </div>
                              <div className="text-neutral-800 text-11 fw-medium mb-2">{schedule.subject}</div>
                              <div className="text-neutral-600 text-10">
                                <i className="fas fa-door-open me-1"></i>
                                {schedule.room}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-neutral-400 py-20">
                            <i className="fas fa-calendar-times text-20"></i>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card.Body>
          </Card>

          {/* Active Classes */}
          <Card className="bg-white border-0 rounded-16 mb-24" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-graduation-cap text-main-600 me-2"></i>
                  Các lớp đang học
                </h6>
                <Link to="/student/courses">
                  <Button className="btn-sm btn-outline-main text-12 px-16 py-8">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              {activeClasses.length > 0 ? (
                <div className="d-flex flex-column gap-12">
                  {activeClasses.map(cls => {
                    const progress = Math.round((cls.completedLessons / cls.totalLessons) * 100);
                    return (
                      <Card key={cls.id} className="bg-gradient border-0"
                            style={{ background: 'linear-gradient(135deg, #F8FAFE 0%, #F0F7FF 100%)' }}>
                        <Card.Body className="p-16">
                          <div className="d-flex justify-content-between align-items-start mb-12">
                            <div>
                              <h6 className="text-neutral-900 fw-bold text-14 mb-4">{cls.className}</h6>
                              <div className="d-flex align-items-center gap-8">
                                <Badge className="bg-main-100 text-main-600 text-11 fw-semibold">
                                  {cls.program}
                                </Badge>
                                <Badge className="bg-success-100 text-success-600 text-11 fw-semibold">
                                  {cls.course}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-end">
                              <div className="text-success-600 fw-bold text-16">{cls.attendanceRate}%</div>
                              <div className="text-neutral-600 text-11">Chuyên cần</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-12">
                            <div className="d-flex justify-content-between align-items-center mb-6">
                              <span className="text-neutral-700 text-12 fw-medium">Tiến độ học tập</span>
                              <span className="text-main-600 fw-bold text-12">{progress}%</span>
                            </div>
                            <div className="bg-neutral-200 rounded-pill overflow-hidden" style={{ height: '8px' }}>
                              <div 
                                className="bg-main-600 h-100 transition-2"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-neutral-500 text-11 mt-4">
                              {cls.completedLessons}/{cls.totalLessons} buổi học
                            </div>
                          </div>

                          {/* Quick Info */}
                          <Row className="g-2">
                            <Col xs={6}>
                              <div className="text-neutral-600 text-11">
                                <i className="fas fa-user me-1"></i>
                                {cls.teacher}
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className="text-neutral-600 text-11">
                                <i className="fas fa-calendar-alt me-1"></i>
                                {cls.schedule}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-40">
                  <i className="fas fa-book-open fa-3x text-neutral-300 mb-12"></i>
                  <p className="text-neutral-500 mb-0">Chưa có lớp học nào</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* TOEIC Practice Results */}
          <Card className="bg-white border-0 rounded-16" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-chart-line text-success-600 me-2"></i>
                  Kết quả luyện đề TOEIC
                </h6>
                <Link to="/student/toeic">
                  <Button className="btn-sm btn-outline-main text-12 px-16 py-8">
                    Xem tất cả
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-20">
              {toeicResults.length > 0 ? (
                <Row className="g-3">
                  {toeicResults.map(result => (
                    <Col md={6} key={result.id}>
                      <Card className="bg-gradient border-0 h-100"
                            style={{ background: 'linear-gradient(135deg, #F0F7FF 0%, #E6F2FF 100%)' }}>
                        <Card.Body className="p-20">
                          <div className="d-flex justify-content-between align-items-start mb-16">
                            <h6 className="text-neutral-900 fw-bold text-14 mb-0">{result.testName}</h6>
                            <Badge className="bg-main-600 text-white text-11">
                              {new Date(result.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </Badge>
                          </div>
                          
                          <div className="d-flex justify-content-center mb-16">
                            <div className="position-relative">
                              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                   style={{ width: '100px', height: '100px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <div className="text-center">
                                  <div className="text-main-600 fw-bold" style={{ fontSize: '28px' }}>{result.total}</div>
                                  <div className="text-neutral-600 text-11">/ 990</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Row className="g-2">
                            <Col xs={6}>
                              <div className="bg-white rounded-8 p-12 text-center">
                                <i className="fas fa-headphones text-info-500 mb-6"></i>
                                <div className="text-neutral-900 fw-bold text-16">{result.listening}</div>
                                <div className="text-neutral-600 text-11">Listening</div>
                              </div>
                            </Col>
                            <Col xs={6}>
                              <div className="bg-white rounded-8 p-12 text-center">
                                <i className="fas fa-book-open text-warning-600 mb-6"></i>
                                <div className="text-neutral-900 fw-bold text-16">{result.reading}</div>
                                <div className="text-neutral-600 text-11">Reading</div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-40">
                  <i className="fas fa-clipboard-list fa-3x text-neutral-300 mb-12"></i>
                  <p className="text-neutral-500 mb-0">Chưa có kết quả luyện đề</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar - Assignments */}
        <Col lg={4}>
          <Card className="bg-white border-0 rounded-16" 
                style={{ 
                  position: 'sticky', 
                  top: '24px',
                  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' 
                }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-20">
              <div className="d-flex align-items-center justify-content-between mb-16">
                <h6 className="text-neutral-900 fw-bold mb-0">
                  <i className="fas fa-tasks text-danger-600 me-2"></i>
                  Bài tập
                </h6>
                <Badge className="bg-danger-100 text-danger-600 px-12 py-6 text-13 fw-bold">
                  {assignments.filter(a => a.status === 'pending').length}
                </Badge>
              </div>

              {/* Filter Tabs */}
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  className={`flex-fill text-12 px-12 py-8 radius-8 ${assignmentFilter === 'all' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setAssignmentFilter('all')}
                >
                  Tất cả
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-12 px-12 py-8 radius-8 ${assignmentFilter === 'pending' ? 'btn-warning' : 'btn-outline-main'}`}
                  onClick={() => setAssignmentFilter('pending')}
                >
                  Chưa nộp
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-12 px-12 py-8 radius-8 ${assignmentFilter === 'overdue' ? 'btn-danger' : 'btn-outline-main'}`}
                  onClick={() => setAssignmentFilter('overdue')}
                >
                  Quá hạn
                </Button>
              </div>
            </Card.Header>

            <Card.Body className="p-20" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {getFilteredAssignments().length > 0 ? (
                <div className="d-flex flex-column gap-12">
                  {getFilteredAssignments().map(assignment => {
                    const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0 || assignment.status === 'overdue';
                    const isUrgent = daysLeft <= 2 && !isOverdue;

                    return (
                      <Card 
                        key={assignment.id} 
                        className={`border-0 rounded-12 transition-2 item-hover ${
                          isOverdue ? 'bg-danger-50 border-danger-200' : 
                          isUrgent ? 'bg-warning-50 border-warning-200' : 
                          'bg-neutral-50 border-neutral-200'
                        }`}
                        style={{ border: '2px solid' }}
                      >
                        <Card.Body className="p-16">
                          <div className="d-flex justify-content-between align-items-start mb-10">
                            <Badge className={`text-11 fw-semibold ${
                              isOverdue ? 'bg-danger-600 text-white' :
                              isUrgent ? 'bg-warning-600 text-white' :
                              'bg-main-100 text-main-600'
                            }`}>
                              {assignment.subject}
                            </Badge>
                            {assignment.priority === 'high' && (
                              <i className="fas fa-exclamation-circle text-danger-600"></i>
                            )}
                          </div>

                          <h6 className="text-neutral-900 fw-semibold mb-8 text-13">
                            {assignment.title}
                          </h6>

                          <div className="text-neutral-500 text-11 mb-10">
                            <i className="fas fa-book me-1"></i>
                            {assignment.className}
                          </div>

                          <div className="d-flex justify-content-between align-items-center mb-12">
                            <span className="text-neutral-600 text-11">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className={`text-11 fw-bold ${
                              isOverdue ? 'text-danger-600' :
                              isUrgent ? 'text-warning-600' :
                              'text-success-600'
                            }`}>
                              {isOverdue ? (
                                <>
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Quá hạn {Math.abs(daysLeft)} ngày
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-clock me-1"></i>
                                  Còn {daysLeft} ngày
                                </>
                              )}
                            </span>
                          </div>

                          <Link to={`/student/assignments/${assignment.id}`}>
                            <Button className="btn-sm btn-outline-main w-100 text-12 py-8">
                              <i className="fas fa-eye me-2"></i>
                              Chi tiết
                            </Button>
                          </Link>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-40">
                  <i className="fas fa-check-circle fa-3x text-success-600 mb-12"></i>
                  <p className="text-neutral-600 mb-0 text-13">
                    {assignmentFilter === 'all' ? 'Không có bài tập nào' : 
                     assignmentFilter === 'pending' ? 'Không có bài tập chưa nộp' :
                     'Không có bài tập quá hạn'}
                  </p>
                </div>
              )}
            </Card.Body>

            {getFilteredAssignments().length > 0 && (
              <Card.Footer className="bg-white border-top border-neutral-100 p-16">
                <Link to="/student/assignments" className="text-decoration-none">
                  <Button className="btn-outline-main w-100 text-13 fw-semibold">
                    Xem tất cả bài tập <i className="fas fa-arrow-right ms-2"></i>
                  </Button>
                </Link>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard;
