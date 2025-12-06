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
          {/* Schedule Info Card */}
          {scheduleInfo && (
            <Card className="bg-white border-0 rounded-12 shadow-sm mb-3" 
                  style={{ background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)' }}>
              <Card.Body className="p-20">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="text-white mb-2 text-13">
                      <i className="fas fa-calendar-alt me-2"></i>
                      {new Date(scheduleInfo.date).toLocaleDateString('vi-VN', { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </div>
                    <h6 className="text-white fw-bold mb-2">
                      {scheduleInfo.className} - Buổi {scheduleInfo.lessonNumber}
                    </h6>
                    <div className="text-white text-13 d-flex gap-3" style={{ opacity: 0.9 }}>
                      <span><i className="fas fa-clock me-1"></i>{scheduleInfo.startTime} - {scheduleInfo.endTime}</span>
                      <span><i className="fas fa-door-open me-1"></i>{scheduleInfo.room}</span>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <Button 
                      variant="light"
                      size="sm"
                      onClick={() => setShowConfirmModal(true)}
                      disabled={saving}
                      className="px-3"
                    >
                      <i className="fas fa-save me-2"></i>
                      {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Stats Cards (3 cards: Present, Absent, Not Marked) */}
          {scheduleInfo && (
            <Row className="g-2 mb-3">
              <Col md={4}>
                <Card className="bg-white border-0 rounded-12 shadow-sm">
                  <Card.Body className="p-16">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-12 d-flex align-items-center justify-content-center"
                           style={{ width: '48px', height: '48px', background: '#E6FFED' }}>
                        <i className="fas fa-check text-success-600" style={{ fontSize: '20px' }}></i>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-12 mb-1">Có mặt</div>
                        <div className="text-neutral-900 fw-bold text-24">{stats.present}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="bg-white border-0 rounded-12 shadow-sm">
                  <Card.Body className="p-16">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-12 d-flex align-items-center justify-content-center"
                           style={{ width: '48px', height: '48px', background: '#FFE6E6' }}>
                        <i className="fas fa-times text-danger-600" style={{ fontSize: '20px' }}></i>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-12 mb-1">Vắng</div>
                        <div className="text-neutral-900 fw-bold text-24">{stats.absent}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="bg-white border-0 rounded-12 shadow-sm">
                  <Card.Body className="p-16">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-12 d-flex align-items-center justify-content-center"
                           style={{ width: '48px', height: '48px', background: '#F3F4F6' }}>
                        <i className="fas fa-minus text-neutral-400" style={{ fontSize: '20px' }}></i>
                      </div>
                      <div>
                        <div className="text-neutral-500 text-12 mb-1">Chưa điểm danh</div>
                        <div className="text-neutral-900 fw-bold text-24">{stats.notMarked}</div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Search & Actions */}
          {scheduleInfo && (
            <Card className="bg-white border-0 rounded-12 shadow-sm mb-3">
              <Card.Body className="p-16">
                <Row className="align-items-center g-2">
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Tìm kiếm học viên..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="rounded-8"
                    />
                  </Col>
                  <Col md={6} className="text-end">
                    <Button 
                      variant="success"
                      size="sm"
                      onClick={markAllPresent}
                      className="px-3"
                    >
                      <i className="fas fa-check-double me-2"></i>
                      Điểm tất cả có mặt
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Students Table with 2 BUTTONS ONLY */}
          {scheduleInfo && (
            <Card className="bg-white border-0 rounded-12 shadow-sm">
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr className="bg-neutral-25">
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">STT</th>
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">Mã SV</th>
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">Họ và tên</th>
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">Check-in</th>
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                      <th className="px-16 py-12 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, index) => (
                      <tr key={student._id}>
                        <td className="px-16 py-12 text-neutral-700 text-13">{index + 1}</td>
                        <td className="px-16 py-12 text-neutral-900 fw-medium text-13">{student.username || '-'}</td>
                        <td className="px-16 py-12 text-neutral-900 text-14">{student.fullName || student.username}</td>
                        <td className="px-16 py-12 text-neutral-700 text-13">
                          {student.attendance?.checkInTime 
                            ? new Date(student.attendance.checkInTime).toLocaleTimeString('vi-VN', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })
                            : '-'
                          }
                        </td>
                        <td className="px-16 py-12">{getStatusBadge(student.attendance?.status)}</td>
                        <td className="px-16 py-12">
                          <div className="d-flex gap-2 justify-content-center">
                            {/* Button 1: Có mặt (Present) - Auto becomes Late if after start time */}
                            <Button
                              size="sm"
                              variant={student.attendance?.status === 'present' || student.attendance?.status === 'late' ? 'success' : 'outline-success'}
                              className="px-3 py-1"
                              onClick={() => updateAttendance(student._id, 'present')}
                            >
                              <i className="fas fa-check me-1"></i>
                              Có mặt
                            </Button>
                            {/* Button 2: Vắng (Absent) */}
                            <Button
                              size="sm"
                              variant={student.attendance?.status === 'absent' ? 'danger' : 'outline-danger'}
                              className="px-3 py-1"
                              onClick={() => updateAttendance(student._id, 'absent')}
                            >
                              <i className="fas fa-times me-1"></i>
                              Vắng
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

          {/* Empty state if no schedule selected */}
          {!scheduleInfo && !loading && todaySchedules.length >= 0 && (
            <Card className="bg-white border-0 rounded-12 shadow-sm">
              <Card.Body className="text-center py-5">
                <i className="fas fa-hand-pointer text-main-600" style={{ fontSize: '48px' }}></i>
                <h5 className="text-neutral-700 mt-3 mb-2">Chọn lớp để điểm danh</h5>
                <p className="text-neutral-500 mb-0">Vui lòng chọn một lớp học từ danh sách bên phải</p>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* RIGHT COLUMN - Sidebar (30%) */}
        <Col lg={4}>
          {/* Today's Classes */}
          <Card className="bg-white border-0 rounded-12 shadow-sm mb-3">
            <Card.Body className="p-16">
              <h6 className="text-neutral-900 fw-semibold mb-12 d-flex align-items-center">
                <i className="fas fa-calendar-day me-2 text-main-600"></i>
                Các lớp hôm nay ({todaySchedules.length})
              </h6>

              {/* Filter by status */}
              <Form.Select 
                size="sm"
                value={selectedStatus} 
                onChange={(e) => setSelectedStatus(e.target.value)} 
                className="rounded-8 mb-3"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="present">Có mặt</option>
                <option value="absent">Vắng</option>
                <option value="not-marked">Chưa điểm danh</option>
              </Form.Select>

              {/* Classes List */}
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {todaySchedules.map((schedule) => (
                  <Card 
                    key={schedule._id}
                    className={`border rounded-8 cursor-pointer ${
                      scheduleInfo?._id === schedule._id 
                        ? 'border-main-600 bg-main-50' 
                        : 'border-neutral-200'
                    }`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => handleSelectSchedule(schedule)}
                  >
                    <Card.Body className="p-12">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="text-neutral-900 fw-semibold text-13">
                          {schedule.className}
                        </div>
                        <Badge bg="primary" className="px-2 py-1 text-10">
                          Buổi {schedule.sessionOrder}
                        </Badge>
                      </div>
                      <div className="text-neutral-600 text-11 mb-1">
                        <i className="fas fa-clock me-1"></i>
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      <div className="text-neutral-600 text-11">
                        <i className="fas fa-door-open me-1"></i>
                        {schedule.roomName}
                      </div>
                    </Card.Body>
                  </Card>
                ))}

                {todaySchedules.length === 0 && (
                  <div className="text-center py-4">
                    <i className="fas fa-calendar-times text-neutral-300" style={{ fontSize: '48px' }}></i>
                    <p className="text-neutral-500 text-13 mt-2 mb-0">Không có lịch dạy hôm nay</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirm Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận lưu điểm danh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn lưu điểm danh cho buổi học này?</p>
          <div className="bg-neutral-50 rounded-8 p-3">
            <div className="mb-2"><strong>Tổng số học viên:</strong> {stats.total}</div>
            <div className="mb-2"><strong>Có mặt:</strong> <span className="text-success-600">{stats.present}</span></div>
            <div className="mb-2"><strong>Vắng:</strong> <span className="text-danger-600">{stats.absent}</span></div>
            <div><strong>Chưa điểm danh:</strong> <span className="text-neutral-500">{stats.notMarked}</span></div>
          </div>
          <div className="alert alert-warning mt-3 mb-0 text-13">
            <i className="fas fa-info-circle me-2"></i>
            Học viên chưa điểm danh sẽ tự động được đánh dấu là <strong>Vắng</strong>.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={saveAttendance} disabled={saving}>
            <i className="fas fa-save me-2"></i>
            {saving ? 'Đang lưu...' : 'Xác nhận lưu'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherAttendance;
