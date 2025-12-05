import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';

/**
 * Teacher Attendance Component - REDESIGNED
 * Layout: 2 columns (70% main, 30% sidebar)
 * Buttons: 2 only (Present, Absent) with auto-late detection
 */
const TeacherAttendance = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [scheduleInfo, setScheduleInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch today's schedules on mount
  useEffect(() => {
    fetchTodaySchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch schedule attendance when scheduleId changes
  useEffect(() => {
    if (scheduleId) {
      fetchScheduleAttendance(scheduleId);
    }
  }, [scheduleId]);

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
        
        // Auto-select first schedule if no scheduleId in URL
        if (!scheduleId && response.schedules.length > 0) {
          navigate(`/teacher/attendance/${response.schedules[0]._id}`, { replace: true });
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
      setLoading(true);
      const response = await teacherService.getLessonDetail(id);
      
      if (response.success && response.lesson) {
        setScheduleInfo({
          _id: response.lesson._id,
          date: response.lesson.date,
          startTime: response.lesson.startTime,
          endTime: response.lesson.endTime,
          className: response.lesson.className,
          lessonNumber: response.lesson.sessionOrder,
          room: response.lesson.roomName,
          topic: response.lesson.sessionTitle
        });
        
        // Keep attendance as-is (null if not marked)
        setStudents(response.lesson.students || []);
      }
    } catch (error) {
      console.error('Error fetching schedule attendance:', error);
      alert(error.message || 'Không thể tải thông tin điểm danh');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSchedule = (schedule) => {
    navigate(`/teacher/attendance/${schedule._id}`);
  };

  // Check if current time is after schedule start time
  const isAfterStartTime = () => {
    if (!scheduleInfo) return false;
    
    const now = new Date();
    const scheduleDate = new Date(scheduleInfo.date);
    const [hours, minutes] = scheduleInfo.startTime.split(':');
    scheduleDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return now > scheduleDate;
  };

  // Update attendance with auto-late detection
  const updateAttendance = (studentId, status) => {
    const now = new Date();
    let finalStatus = status;
    let checkInTime = null;
    
    if (status === 'present') {
      checkInTime = now.toISOString();
      
      // Auto-detect late
      if (isAfterStartTime()) {
        finalStatus = 'late';
      }
    }
    // Absent has no check-in time
    
    setStudents(students.map(student => 
      student._id === studentId 
        ? {
            ...student,
            attendance: {
              status: finalStatus,
              checkInTime,
              markedBy: null // Will be set by backend
            }
          }
        : student
    ));
  };

  const markAllPresent = () => {
    const now = new Date();
    const checkInTime = now.toISOString();
    const isLate = isAfterStartTime();
    
    setStudents(students.map(student => ({
      ...student,
      attendance: {
        status: isLate ? 'late' : 'present',
        checkInTime,
        markedBy: null
      }
    })));
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      // Prepare attendance data (default to absent if not marked)
      const attendanceData = students.map(student => ({
        studentId: student._id,
        status: student.attendance?.status || 'absent',
        checkInTime: student.attendance?.checkInTime || null
      }));

      const response = await teacherService.saveAttendance(scheduleId, attendanceData);
      
      if (response.success) {
        setShowConfirmModal(false);
        alert('✅ Đã lưu điểm danh thành công!');
        // Refresh data
        fetchScheduleAttendance(scheduleId);
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.message || 'Lỗi khi lưu điểm danh');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <Badge bg="secondary" className="px-3 py-2">
          <i className="fas fa-minus me-1"></i>
          Chưa điểm danh
        </Badge>
      );
    }
    
    const config = {
      present: { bg: 'success', icon: 'fa-check', text: 'Có mặt' },
      late: { bg: 'warning', icon: 'fa-clock', text: 'Có mặt (Trễ)' },
      absent: { bg: 'danger', icon: 'fa-times', text: 'Vắng' },
      excused: { bg: 'info', icon: 'fa-hand-paper', text: 'Có phép' }
    };
    
    const { bg, icon, text } = config[status] || config.absent;
    
    return (
      <Badge bg={bg} className="px-3 py-2">
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  const getAttendanceStats = () => {
    const present = students.filter(s => 
      s.attendance?.status === 'present' || s.attendance?.status === 'late'
    ).length;
    
    const absent = students.filter(s => 
      s.attendance?.status === 'absent'
    ).length;
    
    const notMarked = students.filter(s => 
      !s.attendance?.status || s.attendance?.status === null
    ).length;
    
    return { present, absent, notMarked, total: students.length };
  };

  const stats = getAttendanceStats();

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (selectedStatus === 'present') {
      matchesStatus = s.attendance?.status === 'present' || s.attendance?.status === 'late';
    } else if (selectedStatus === 'absent') {
      matchesStatus = s.attendance?.status === 'absent';
    } else if (selectedStatus === 'not-marked') {
      matchesStatus = !s.attendance?.status;
    }
    
    return matchesSearch && matchesStatus;
  });

  if (loading && !scheduleInfo) {
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

      {/* 2-Column Layout */}
      <Row className="g-3">
        {/* LEFT COLUMN - Main Attendance Area (70%) */}
        <Col lg={8}>
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

      {/* Empty state when no schedules today */}
      {!loading && todaySchedules.length === 0 && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
          <Card.Body className="text-center py-5">
            <i className="fas fa-calendar-times text-neutral-300" style={{ fontSize: '64px' }}></i>
            <h5 className="text-neutral-700 mt-3 mb-2">Không có lịch dạy hôm nay</h5>
            <p className="text-neutral-500 mb-0">Bạn không có buổi học nào được lên lịch cho hôm nay</p>
          </Card.Body>
        </Card>
      )}

      {/* Show message to select a class if no schedule selected yet */}
      {!scheduleInfo && todaySchedules.length > 0 && !loading && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
          <Card.Body className="text-center py-5">
            <i className="fas fa-hand-pointer text-main-600" style={{ fontSize: '48px' }}></i>
            <h5 className="text-neutral-700 mt-3 mb-2">Chọn lớp để điểm danh</h5>
            <p className="text-neutral-500 mb-0">Vui lòng chọn một lớp học từ danh sách bên trên để bắt đầu điểm danh</p>
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
      {scheduleInfo && (
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
      )}

      {/* Filters & Actions */}
      {scheduleInfo && (
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
      )}
      
      {/* Students Table */}
      {scheduleInfo && (
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
                  <td className="px-20 py-16">{getStatusBadge(student.attendance?.status)}</td>
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
      )}

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
