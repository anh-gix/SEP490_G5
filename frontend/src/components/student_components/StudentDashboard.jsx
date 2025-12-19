import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import studentService from '../../services/studentService';

/**
 * Student Dashboard Component - Redesigned
 * Trang tổng quan dành cho học viên - Tập trung vào lịch học và bài tập
 */
const StudentDashboard = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [weekSchedule, setWeekSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState('all'); // all, pending, overdue
  const [practiceTests, setPracticeTests] = useState([]);
  const [activeClasses, setActiveClasses] = useState([]);
  const [practiceTestFilter, setPracticeTestFilter] = useState('all'); // all, toeic, ielts, cambridge
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await studentService.getDashboardData();
      
      if (response.success) {
        setStudentInfo(response.data.studentInfo);
        setWeekSchedule(response.data.weekSchedule || []);
        setAssignments(response.data.assignments || []);
        setPracticeTests(response.data.practiceTests || []);
        setActiveClasses(response.data.activeClasses || []);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError(error.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // const getFilteredAssignments = () => {
  //   return assignments
  //     .filter(assignment => {
  //       if (assignmentFilter === 'all') return true;
  //       if (assignmentFilter === 'pending') return assignment.status === 'not_submitted' && !assignment.isOverdue;
  //       if (assignmentFilter === 'overdue') return assignment.isOverdue;
  //       return true;
  //     })
  //     .sort((a, b) => {
  //       // Sort by overdue first, then priority, then by due date
  //       if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
  //       if (a.priority === 'high' && b.priority !== 'high') return -1;
  //       if (a.priority !== 'high' && b.priority === 'high') return 1;
  //       return new Date(a.dueDate) - new Date(b.dueDate);
  //     });
  // };

  const getFilteredPracticeTests = () => {
    return practiceTests.filter(result => {
      if (practiceTestFilter === 'all') return true;
      if (practiceTestFilter === 'toeic') return result.type === 'toeic';
      if (practiceTestFilter === 'ielts') return result.type === 'ielts';
      if (practiceTestFilter === 'cambridge') return result.type === 'cambridge';
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
        <Container fluid className="py-24 px-24">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="mt-3 text-neutral-600">Đang tải dữ liệu dashboard...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
        <Container fluid className="py-24 px-24">
          <Alert variant="danger">
            <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
            <p>{error}</p>
            <Button onClick={fetchStudentData} variant="outline-danger">
              <i className="fas fa-redo me-2"></i>Thử lại
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#F5F7FA' }}>
      <Container fluid className="py-24 px-24">
        {/* Welcome Banner - Compact */}
        <Card className="border-0 rounded-6 mb-16 overflow-hidden" 
            style={{ 
              background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)',
              boxShadow: '0 4px 20px rgba(13, 116, 255, 0.15)'
            }}>
        <Card.Body className="p-16">
          <div className="d-flex align-items-center gap-12">
            <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: '40px', height: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <i className="fas fa-user-graduate text-main-600" style={{ fontSize: '20px' }}></i>
            </div>
            <div>
              <h5 className="text-white fw-bold mb-1">
                Xin chào, {studentInfo?.name}!
              </h5>
              <p className="text-white mb-0" style={{ opacity: 0.9, fontSize: '12px' }}>
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Main Content - Lịch học tuần */}
        <Col lg={8}>
          {/* Weekly Calendar - Compact */}
          <Card className="bg-white border-0 rounded-6 mb-16" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-12">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0 text-16">
                  <i className="fas fa-calendar-week text-main-600 me-2"></i>
                  Lịch học tuần này
                </h6>
                <Link to="/student/schedule">
                  <Button className="btn-sm btn-outline-main text-11 px-12 py-6">
                    Chi tiết <i className="fas fa-arrow-right ms-1"></i>
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
                      <div className={`text-center py-8 border-bottom border-neutral-100 ${day.isToday ? 'bg-main-50' : 'bg-neutral-50'}`}>
                        <div className={`text-10 fw-medium mb-2 ${day.isToday ? 'text-main-600' : 'text-neutral-600'}`}>
                          {day.dayName}
                        </div>
                        <div className={`${day.isToday ? 'bg-main-600 text-white' : 'bg-white text-neutral-800'} rounded-circle d-inline-flex align-items-center justify-content-center fw-bold`}
                             style={{ width: '24px', height: '24px', fontSize: '11px' }}>
                          {day.dayNumber}
                        </div>
                      </div>
                      <div className="p-8" style={{ minHeight: '80px' }}>
                        {day.schedules.length > 0 ? (
                          day.schedules.map((schedule, idx) => (
                            <div key={idx} className="bg-main-50 border border-main-200 rounded-6 p-8 mb-6">
                              <div className="text-main-600 fw-bold text-10 mb-2">
                                <i className="fas fa-clock me-1"></i>
                                {schedule.time}
                              </div>
                              <div className="text-neutral-800 text-10 fw-medium mb-1">{schedule.className}</div>
                              <div className="text-neutral-600 text-9">
                                <i className="fas fa-door-open me-1"></i>
                                {schedule.room}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-neutral-400 py-12">
                            <i className="fas fa-calendar-times text-16"></i>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Card.Body>
          </Card>

          

          {/* Practice Tests Results */}
          <Card className="bg-white border-0 rounded-6" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-12">
              <div className="d-flex justify-content-between align-items-center mb-8">
                <h6 className="text-neutral-900 fw-bold mb-0 text-16">
                  <i className="fas fa-chart-line text-success-600 me-2"></i>
                  Lịch sử luyện đề
                </h6>
                <Link to="/student/practice-exams">
                  <Button className="btn-sm btn-outline-main text-11 px-12 py-6">
                    Chi tiết
                  </Button>
                </Link>
              </div>

              {/* Filter Buttons */}
              <div className="d-flex gap-2">
                <Button
                  size="sm"
                  className={`flex-fill text-11 px-8 py-6 rounded-6 ${practiceTestFilter === 'all' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setPracticeTestFilter('all')}
                >
                  Tất cả
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-11 px-8 py-6 rounded-6 ${practiceTestFilter === 'toeic' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setPracticeTestFilter('toeic')}
                >
                  TOEIC
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-11 px-8 py-6 rounded-6 ${practiceTestFilter === 'ielts' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setPracticeTestFilter('ielts')}
                >
                  IELTS
                </Button>
                <Button
                  size="sm"
                  className={`flex-fill text-11 px-8 py-6 rounded-6 ${practiceTestFilter === 'cambridge' ? 'btn-main' : 'btn-outline-main'}`}
                  onClick={() => setPracticeTestFilter('cambridge')}
                >
                  Cambridge YLE
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-12">
              {getFilteredPracticeTests().length > 0 ? (
                <Row className="g-2">
                  {getFilteredPracticeTests().map(result => (
                    <Col md={6} key={result.id}>
                      <Card className="border-0 h-100 overflow-hidden"
                            style={{ 
                              background: result.type === 'toeic' 
                                ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' : 
                                result.type === 'ielts'
                                ? 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)'
                                : 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}>
                        <Card.Body className="p-12">
                          <div className="d-flex justify-content-between align-items-start mb-10">
                            <div>
                              <h6 className="text-neutral-900 fw-bold text-14 mb-2">{result.testName}</h6>
                              <Badge className={
                                result.type === 'toeic' ? 'bg-main-600 text-white text-10' : 
                                result.type === 'ielts' ? 'bg-purple-600 text-white text-10' :
                                'bg-warning-600 text-white text-10'
                              }>
                                {result.type.toUpperCase()}
                              </Badge>
                            </div>
                            <Badge className="bg-neutral-900 text-white text-10">
                              {new Date(result.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            </Badge>
                          </div>
                          
                          <div className="d-flex justify-content-center mb-10">
                            <div className="position-relative">
                              <div className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                   style={{ width: '80px', height: '80px', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                                <div className="text-center">
                                  <div className={`fw-bold ${
                                    result.type === 'toeic' ? 'text-main-600' : 
                                    result.type === 'ielts' ? 'text-purple-600' : 
                                    'text-warning-600'
                                  }`} style={{ fontSize: '24px' }}>
                                    {result.type === 'toeic' ? result.total : 
                                     result.type === 'ielts' ? result.overallBand :
                                     result.total}
                                  </div>
                                  <div className="text-neutral-600 text-12">
                                    {result.type === 'toeic' ? '/ 990' : 
                                     result.type === 'ielts' ? 'Band' :
                                     '/ 100'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {result.type === 'toeic' ? (
                            <Row className="g-2">
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <i className="fas fa-headphones text-info-500 mb-2"></i>
                                  <div className="text-neutral-900 fw-bold text-12">{result.listening || 0}</div>
                                  <div className="text-neutral-600 text-12">Listening</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-8 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <i className="fas fa-book-open text-success-500 mb-2"></i>
                                  <div className="text-neutral-900 fw-bold text-12">{result.reading || 0}</div>
                                  <div className="text-neutral-600 text-12">Reading</div>
                                </div>
                              </Col>
                            </Row>
                          ) : result.type === 'ielts' ? (
                            <Row className="g-2">
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-purple-600 fw-bold text-12">{result.listening || 0}</div>
                                  <div className="text-neutral-600 text-12">Listening</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-purple-600 fw-bold text-12">{result.reading || 0}</div>
                                  <div className="text-neutral-600 text-12">Reading</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-purple-600 fw-bold text-12">{result.writing || 0}</div>
                                  <div className="text-neutral-600 text-12">Writing</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-purple-600 fw-bold text-12">{result.speaking || 0}</div>
                                  <div className="text-neutral-600 text-12">Speaking</div>
                                </div>
                              </Col>
                            </Row>
                          ) : (
                            <Row className="g-2">
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-warning-600 fw-bold text-12">{result.listening || 0}</div>
                                  <div className="text-neutral-600 text-12">Listening</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-warning-600 fw-bold text-12">{result.reading || 0}</div>
                                  <div className="text-neutral-600 text-12">Reading</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-warning-600 fw-bold text-12">{result.writing || 0}</div>
                                  <div className="text-neutral-600 text-12">Writing</div>
                                </div>
                              </Col>
                              <Col xs={6}>
                                <div className="bg-white rounded-6 p-6 text-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <div className="text-warning-600 fw-bold text-12">{result.speaking || 0}</div>
                                  <div className="text-neutral-600 text-12">Speaking</div>
                                </div>
                              </Col>
                            </Row>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-center py-32">
                  <i className="fas fa-file-alt fa-2x text-neutral-300 mb-8"></i>
                  <p className="text-neutral-600 mb-0 text-12">
                    {practiceTestFilter === 'all' ? 'Bạn chưa luyện đề thi nào' :
                     practiceTestFilter === 'toeic' ? 'Bạn chưa có kết quả TOEIC' :
                     practiceTestFilter === 'ielts' ? 'Bạn chưa có kết quả IELTS' :
                     'Bạn chưa có kết quả Cambridge'}
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar - Active Classes */}
        <Col lg={4}>
          <Card className="bg-white border-0 rounded-6 mb-16" 
                style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
            <Card.Header className="bg-white border-bottom border-neutral-100 p-12">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-neutral-900 fw-bold mb-0 text-14">
                  <i className="fas fa-graduation-cap text-main-600 me-2"></i>
                  Các lớp đang học
                </h6>
                <Link to="/student/courses">
                  <Button className="btn-sm btn-outline-main text-11 px-12 py-6">
                    Tất cả
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-12">
              {activeClasses.length > 0 ? (
                <div className="d-flex flex-column gap-10">
                  {activeClasses.map(cls => {
                    const progress = Math.round((cls.completedLessons / cls.totalLessons) * 100);
                    const absentRate = cls.absentRate || 0;
                    const upcomingHomework = cls.upcomingHomework || 0;
                    return (
                      <Card key={cls.id} className="bg-gradient border-0"
                            style={{ background: 'linear-gradient(135deg, #F8FAFE 0%, #F0F7FF 100%)' }}>
                        <Card.Body className="p-12">
                          <div className="d-flex justify-content-between align-items-start mb-10">
                            <div className="flex-grow-1">
                              <h6 className="text-neutral-900 fw-bold text-13 mb-4">{cls.className}</h6>
                              <div className="d-flex align-items-center gap-6 mb-6">
                                <Badge className="bg-main-100 text-main-600 text-10 fw-semibold">
                                  {cls.programType}
                                </Badge>
                                <Badge className="bg-success-100 text-success-600 text-10 fw-semibold">
                                  {cls.course}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-end ms-2">
                              <div className={`fw-bold text-14 ${absentRate >= 20 ? 'text-danger-600' : absentRate >= 10 ? 'text-warning-600' : 'text-success-600'}`}>
                                {absentRate}%
                              </div>
                              <div className="text-neutral-600 text-9">Nghỉ</div>
                            </div>
                          </div>

                          {/* Teacher & Schedule Info */}
                          <div className="mb-8 pb-8 border-bottom border-neutral-200">
                            <div className="text-neutral-600 text-10 mb-2">
                              <i className="fas fa-user me-1"></i>
                              {cls.teacher}
                            </div>
                            <div className="text-neutral-600 text-10">
                              <i className="fas fa-calendar-alt me-1"></i>
                              {cls.weekDays} {cls.schedule}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-8">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                              <span className="text-neutral-700 text-10 fw-medium">Tiến độ</span>
                              <span className="text-main-600 fw-bold text-10">{progress}%</span>
                            </div>
                            <div className="bg-neutral-200 rounded-pill overflow-hidden" style={{ height: '6px' }}>
                              <div 
                                className="bg-main-600 h-100 transition-2"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="text-neutral-500 text-9 mt-2">
                              {cls.completedLessons}/{cls.totalLessons} buổi học
                            </div>
                          </div>

                          {/* Upcoming Homework */}
                          {upcomingHomework > 0 && (
                            <div className="bg-warning-50 border border-warning-200 rounded-6 p-8 mt-8">
                              <div className="text-warning-700 text-10 fw-semibold">
                                <i className="fas fa-tasks me-1"></i>
                                {upcomingHomework} bài tập sắp đến hạn
                              </div>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-32">
                  <i className="fas fa-book-open fa-2x text-neutral-300 mb-8"></i>
                  <p className="text-neutral-500 mb-0 text-12">Chưa có lớp học nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard;
