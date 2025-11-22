import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

/**
 * Teacher Attendance Component
 * Điểm danh học viên - dựa trên studentScheduleModel
 */
const TeacherAttendance = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [canAttendance, setCanAttendance] = useState(false);

  useEffect(() => {
    fetchTodaySchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scheduleId) {
      fetchScheduleAttendance(scheduleId);
    }
  }, [scheduleId]);

  // Countdown timer
  useEffect(() => {
    if (!scheduleInfo) return;

    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleInfo]);

  const updateCountdown = () => {
    if (!scheduleInfo) return;

    const now = new Date();
    const scheduleDate = new Date(scheduleInfo.date);
    const [hours, minutes] = scheduleInfo.startTime.split(':');
    scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0);

    const diff = scheduleDate - now;

    // TODO: Tạm thời cho phép điểm danh trước giờ để test
    setCanAttendance(true);
    
    if (diff <= 0) {
      setCountdown('');
    } else {
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${hoursLeft}h ${minutesLeft}m`);
    }
  };

  const fetchTodaySchedules = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const response = await teacherService.getCurrentTeacherSchedule({
        startDate: today,
        endDate: tomorrow.toISOString().split('T')[0]
      });

      if (response.success) {
        setTodaySchedules(response.schedules || []);
        
        // If no scheduleId in URL, auto-select first schedule
        if (!scheduleId && response.schedules.length > 0) {
          const firstSchedule = response.schedules[0];
          fetchScheduleAttendance(firstSchedule._id);
        }
      }
    } catch (error) {
      console.error('Error fetching today schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduleAttendance = async (id) => {
    try {
      const response = await teacherService.getLessonDetail(id);
      
      if (response.success && response.lesson) {
        // Map lesson data to scheduleInfo format
        const scheduleInfo = {
          _id: response.lesson._id,
          date: response.lesson.date,
          startTime: response.lesson.startTime,
          endTime: response.lesson.endTime,
          className: response.lesson.className,
          lessonNumber: response.lesson.sessionOrder,
          room: response.lesson.roomName,
          topic: response.lesson.sessionTitle
        };
        
        setScheduleInfo(scheduleInfo);
        
        // Ensure each student has an attendance object
        const studentsWithAttendance = (response.lesson.students || []).map(student => ({
          ...student,
          attendance: student.attendance || {
            status: 'absent',
            checkInTime: null,
            markedBy: null
          }
        }));
        setStudents(studentsWithAttendance);
      }
    } catch (error) {
      console.error('Error fetching schedule attendance:', error);
      alert(error.message || 'Không thể tải thông tin điểm danh');
    }
  };

  const handleSelectSchedule = (schedule) => {
    navigate(`/teacher/attendance/${schedule._id}`);
    fetchScheduleAttendance(schedule._id);
  };

  const updateAttendance = (studentId, status) => {
    setStudents(students.map(student => 
      student._id === studentId 
        ? {
            ...student,
            attendance: {
              ...student.attendance,
              status,
              checkInTime: status === 'present' || status === 'late' ? new Date().toISOString() : null
            }
          }
        : student
    ));
  };

  const markAllPresent = () => {
    setStudents(students.map(student => ({
      ...student,
      attendance: {
        ...student.attendance,
        status: 'present',
        checkInTime: new Date().toISOString()
      }
    })));
  };

  const saveAttendance = async () => {
    try {
      // Prepare attendance data
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: student.attendance.status,
        checkInTime: student.attendance.checkInTime
      }));

      // Call API to save attendance
      const response = await teacherService.saveAttendance(scheduleId, attendanceData);
      
      if (response.success) {
        setShowConfirmModal(false);
        alert('Đã lưu điểm danh thành công!');
      } else {
        throw new Error(response.message || 'Không thể lưu điểm danh');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.message || 'Lỗi khi lưu điểm danh. Vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      present: { bg: 'bg-success-600', icon: 'fa-check', text: 'Có mặt' },
      absent: { bg: 'bg-danger-600', icon: 'fa-times', text: 'Vắng' },
      late: { bg: 'bg-warning-600', icon: 'fa-clock', text: 'Trễ' },
      excused: { bg: 'bg-info-500', icon: 'fa-hand-paper', text: 'Có phép' }
    };
    const { bg, icon, text } = config[status] || config.absent;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  const getAttendanceStats = () => {
    const present = students.filter(s => s.attendance?.status === 'present').length;
    const absent = students.filter(s => s.attendance?.status === 'absent').length;
    const late = students.filter(s => s.attendance?.status === 'late').length;
    const excused = students.filter(s => s.attendance?.status === 'excused').length;
    return { present, absent, late, excused, total: students.length };
  };

  const stats = getAttendanceStats();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || s.attendance?.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (!scheduleInfo && loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-neutral-600 mt-3">Đang tải thông tin điểm danh...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Điểm danh học viên</h4>
        <p className="text-neutral-600 mb-0">Quản lý điểm danh cho buổi học</p>
      </div>

      {/* Today's Schedules */}
      {todaySchedules.length > 0 && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
          <Card.Body className="p-20">
            <h6 className="text-neutral-900 fw-semibold mb-16">
              <i className="fas fa-calendar-day me-2 text-main-600"></i>
              Các lớp hôm nay ({todaySchedules.length})
            </h6>
            <Row className="g-3">
              {todaySchedules.map((schedule) => (
                <Col md={6} lg={4} key={schedule._id}>
                  <Card 
                    className={`border rounded-8 cursor-pointer ${
                      scheduleInfo?._id === schedule._id 
                        ? 'border-main-600 bg-main-50' 
                        : 'border-neutral-200 hover-shadow'
                    }`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => handleSelectSchedule(schedule)}
                  >
                    <Card.Body className="p-16">
                      <div className="d-flex justify-content-between align-items-start mb-8">
                        <div className="text-neutral-900 fw-semibold text-14">
                          {schedule.className}
                        </div>
                        <Badge className="bg-main-600 text-white px-8 py-4 text-11">
                          Buổi {schedule.sessionOrder}
                        </Badge>
                      </div>
                      <div className="text-neutral-600 text-12 mb-4">
                        <i className="fas fa-clock me-1"></i>
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-neutral-600 text-12">
                        <i className="fas fa-door-open me-1"></i>
                        {schedule.roomName}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Schedule Info with Countdown */}
      {scheduleInfo && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24" 
              style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
          <Card.Body className="p-24">
            <Row className="align-items-center">
              <Col lg={8}>
                <div className="text-white mb-8">
                  <i className="fas fa-calendar-alt me-2"></i>
                  {new Date(scheduleInfo.date).toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <h5 className="text-white fw-bold mb-8">
                  {scheduleInfo.className} - Buổi {scheduleInfo.lessonNumber}
                </h5>
                <div className="text-white d-flex gap-20" style={{ opacity: 0.9 }}>
                  <span><i className="fas fa-clock me-2"></i>{scheduleInfo.startTime} - {scheduleInfo.endTime}</span>
                  <span><i className="fas fa-door-open me-2"></i>{scheduleInfo.room}</span>
                  <span><i className="fas fa-book me-2"></i>{scheduleInfo.topic}</span>
                </div>
                {countdown && (
                  <div className="mt-12">
                    <Badge className="bg-warning-600 text-white px-12 py-6 text-14">
                      <i className="fas fa-hourglass-half me-2"></i>
                      Bắt đầu sau: {countdown}
                    </Badge>
                  </div>
                )}
              </Col>
              <Col lg={4} className="text-lg-end">
                <Button 
                  className="btn-outline-light px-20 py-10 radius-8"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!canAttendance}
                >
                  <i className="fas fa-save me-2"></i>
                  Lưu điểm danh
                </Button>
                {!canAttendance && (
                  <div className="text-white text-12 mt-8" style={{ opacity: 0.8 }}>
                    Chưa đến giờ học
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Attendance Stats */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px', background: '#E6FFED' }}>
                  <i className="fas fa-check text-success-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Có mặt</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.present}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px', background: '#FFE6E6' }}>
                  <i className="fas fa-times text-danger-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Vắng</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.absent}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px', background: '#FFE8CC' }}>
                  <i className="fas fa-clock text-warning-600" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Trễ</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.late}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div className="rounded-12 d-flex align-items-center justify-content-center"
                     style={{ width: '56px', height: '56px', background: '#E6F2FF' }}>
                  <i className="fas fa-hand-paper text-info-500" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Có phép</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.excused}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters & Actions */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="align-items-center g-3">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm học viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="radius-8"
              />
            </Col>
            <Col md={3}>
              <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="radius-8">
                <option value="all">Tất cả trạng thái</option>
                <option value="present">Có mặt</option>
                <option value="absent">Vắng</option>
                <option value="late">Trễ</option>
                <option value="excused">Có phép</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <Button 
                className="btn-success px-16 py-8 radius-8" 
                onClick={markAllPresent}
                disabled={!canAttendance}
              >
                <i className="fas fa-check-double me-2"></i>
                Điểm tất cả có mặt
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Students Table */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <Table hover className="mb-0">
            <thead>
              <tr className="bg-neutral-25">
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">STT</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Mã SV</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Họ và tên</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Check-in</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student._id}>
                  <td className="px-20 py-16 text-neutral-700 text-13">{index + 1}</td>
                  <td className="px-20 py-16 text-neutral-900 fw-medium text-13">{student.username || '-'}</td>
                  <td className="px-20 py-16 text-neutral-900 text-14">{student.fullName || student.username}</td>
                  <td className="px-20 py-16 text-neutral-600 text-13">{student.email}</td>
                  <td className="px-20 py-16 text-neutral-700 text-13">
                    {student.attendance?.checkInTime 
                      ? new Date(student.attendance.checkInTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : '-'
                    }
                  </td>
                  <td className="px-20 py-16">{getStatusBadge(student.attendance?.status || 'absent')}</td>
                  <td className="px-20 py-16">
                    <div className="d-flex gap-4 justify-content-center">
                      <Button
                        size="sm"
                        className={student.attendance?.status === 'present' ? 'btn-success' : 'btn-outline-success'}
                        style={{ width: '36px', height: '36px', padding: 0 }}
                        onClick={() => updateAttendance(student._id, 'present')}
                        disabled={!canAttendance}
                      >
                        <i className="fas fa-check"></i>
                      </Button>
                      <Button
                        size="sm"
                        className={student.attendance?.status === 'absent' ? 'btn-danger' : 'btn-outline-danger'}
                        style={{ width: '36px', height: '36px', padding: 0 }}
                        onClick={() => updateAttendance(student._id, 'absent')}
                        disabled={!canAttendance}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                      <Button
                        size="sm"
                        className={student.attendance?.status === 'late' ? 'btn-warning' : 'btn-outline-warning'}
                        style={{ width: '36px', height: '36px', padding: 0 }}
                        onClick={() => updateAttendance(student._id, 'late')}
                        disabled={!canAttendance}
                      >
                        <i className="fas fa-clock"></i>
                      </Button>
                      <Button
                        size="sm"
                        className={student.attendance?.status === 'excused' ? 'btn-info' : 'btn-outline-info'}
                        style={{ width: '36px', height: '36px', padding: 0 }}
                        onClick={() => updateAttendance(student._id, 'excused')}
                        disabled={!canAttendance}
                      >
                        <i className="fas fa-hand-paper"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Confirm Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận lưu điểm danh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn lưu điểm danh cho buổi học này?</p>
          <div className="bg-neutral-50 rounded-8 p-16">
            <div className="mb-8"><strong>Tổng số học viên:</strong> {stats.total}</div>
            <div className="mb-8"><strong>Có mặt:</strong> <span className="text-success-600">{stats.present}</span></div>
            <div className="mb-8"><strong>Vắng:</strong> <span className="text-danger-600">{stats.absent}</span></div>
            <div className="mb-8"><strong>Trễ:</strong> <span className="text-warning-600">{stats.late}</span></div>
            <div><strong>Có phép:</strong> <span className="text-info-500">{stats.excused}</span></div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button className="btn-main" onClick={saveAttendance}>
            <i className="fas fa-save me-2"></i>
            Xác nhận lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherAttendance;
