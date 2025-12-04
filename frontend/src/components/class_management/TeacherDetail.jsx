import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, Tabs, Tab, Pagination, ButtonGroup, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import { classScheduleService } from '../../services/classScheduleService';
import ScheduleCalendar from './ScheduleCalendar';

/**
 * Teacher Detail Component
 * Hiển thị chi tiết giảng viên với 3 tabs: Thông tin, Lớp học, Lịch giảng dạy
 */
const TeacherDetail = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  
  const [teacher, setTeacher] = useState(null);
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // 'table' or 'calendar'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab and lazy loading states
  const [activeTab, setActiveTab] = useState('info');
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);

  // Substitute teacher states
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [selectedScheduleForSubstitute, setSelectedScheduleForSubstitute] = useState(null);
  const [availableSubstituteTeachers, setAvailableSubstituteTeachers] = useState([]);
  const [selectedSubstituteTeacherId, setSelectedSubstituteTeacherId] = useState(null);
  const [loadingSubstituteTeachers, setLoadingSubstituteTeachers] = useState(false);
  const [assigningSubstitute, setAssigningSubstitute] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);
  const [validatingConflict, setValidatingConflict] = useState(false);
  const [substituteTeacherSchedule, setSubstituteTeacherSchedule] = useState([]);
  const [loadingSubstituteTeacherSchedule, setLoadingSubstituteTeacherSchedule] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherInfo();
    }
  }, [teacherId]);

  // Fetch only teacher info (for Info tab)
  const fetchTeacherInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await teacherService.getTeacherById(teacherId);
      setTeacher(data.teacher);
      
      // Check if classes are already included in the response
      if (data.teacher?.classes && data.teacher.classes.length > 0) {
        setClassesLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching teacher info:', err);
      setError('Không thể tải thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  // Fetch teacher classes (lazy load for Classes tab)
  const fetchTeacherClasses = async () => {
    // If classes are already in teacher object, no need to fetch
    if (teacher?.classes && teacher.classes.length > 0) {
      setClassesLoaded(true);
      return;
    }

    try {
      setLoadingClasses(true);
      // Re-fetch teacher data to get classes if not included
      const data = await teacherService.getTeacherById(teacherId);
      if (data.teacher) {
        setTeacher(prev => ({
          ...prev,
          ...data.teacher,
          classes: data.teacher.classes || []
        }));
        setClassesLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching teacher classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch teacher schedule (lazy load for Schedule tab)
  const fetchTeacherSchedule = async () => {
    try {
      setLoadingSchedule(true);
      const scheduleData = await teacherService.getTeacherSchedule(teacherId);
      setTeacherSchedule(scheduleData.schedules || []);
      setSchedulePage(1);
      setScheduleLoaded(true);
    } catch (err) {
      console.error('Error fetching teacher schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Handle tab selection with lazy loading
  const handleTabSelect = (key) => {
    setActiveTab(key);
    
    // Lazy load data when tab is selected
    if (key === 'classes' && !classesLoaded) {
      fetchTeacherClasses();
    } else if (key === 'schedule' && !scheduleLoaded) {
      fetchTeacherSchedule();
    }
  };

  // Load substitute teacher schedule when teacher is selected
  useEffect(() => {
    const loadSubstituteTeacherSchedule = async () => {
      if (!selectedSubstituteTeacherId || !selectedScheduleForSubstitute) {
        setSubstituteTeacherSchedule([]);
        return;
      }

      try {
        setLoadingSubstituteTeacherSchedule(true);
        const schedule = selectedScheduleForSubstitute;
        const scheduleDate = schedule.date; // Format: YYYY-MM-DD

        // Fetch schedule for the specific date
        const scheduleData = await teacherService.getTeacherSchedule(selectedSubstituteTeacherId, {
          startDate: scheduleDate,
          endDate: scheduleDate
        });

        console.log('📅 Lịch dạy của giáo viên được chọn vào ngày', scheduleDate, ':', scheduleData);
        setSubstituteTeacherSchedule(scheduleData.schedules || []);
      } catch (err) {
        console.error('Error loading substitute teacher schedule:', err);
        setSubstituteTeacherSchedule([]);
      } finally {
        setLoadingSubstituteTeacherSchedule(false);
      }
    };

    loadSubstituteTeacherSchedule();
  }, [selectedSubstituteTeacherId, selectedScheduleForSubstitute]);

  // Validate conflict when substitute teacher is selected
  useEffect(() => {
    const validateConflict = async () => {
      if (!selectedSubstituteTeacherId || !selectedScheduleForSubstitute) {
        setConflictInfo(null);
        return;
      }

      try {
        setValidatingConflict(true);
        setConflictInfo(null);

        const schedule = selectedScheduleForSubstitute;
        const roomId = schedule.roomId || schedule.room?._id || schedule.room?.id || schedule.room;

        if (!roomId) {
          setConflictInfo({ hasConflict: false, message: 'Không tìm thấy thông tin phòng học' });
          return;
        }

        // Get schedule ID to exclude from conflict check
        const scheduleId = schedule.id || schedule._id;
        
        const validateResponse = await classScheduleService.validateScheduleConflictSimple({
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacher: selectedSubstituteTeacherId,
          room: roomId,
          excludeScheduleId: scheduleId // Exclude current schedule from conflict check
        });

        if (validateResponse.success) {
          if (validateResponse.hasConflict) {
            setConflictInfo({
              hasConflict: true,
              conflicts: validateResponse.conflicts || {},
              message: 'Giáo viên dạy thay có xung đột lịch học'
            });
          } else {
            setConflictInfo({ hasConflict: false, message: 'Không có xung đột' });
          }
        } else {
          setConflictInfo({ hasConflict: false, message: validateResponse.message || 'Không thể kiểm tra xung đột' });
        }
      } catch (err) {
        console.error('Error validating conflict:', err);
        setConflictInfo({ hasConflict: false, message: err.message || 'Lỗi khi kiểm tra xung đột' });
      } finally {
        setValidatingConflict(false);
      }
    };

    validateConflict();
  }, [selectedSubstituteTeacherId, selectedScheduleForSubstitute]);

  // Handle assign substitute teacher
  const handleAssignSubstitute = async (schedule) => {
    // Kiểm tra xem buổi học có phải là quá khứ không
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      alert('Không thể xếp người dạy thay cho buổi học đã qua');
      return;
    }
    
    // Log thông tin buổi học được chọn
    console.log('📋 Thông tin buổi học được chọn:', {
      id: schedule.id || schedule._id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      className: schedule.className,
      roomName: schedule.roomName,
      roomId: schedule.roomId,
      teacherId: schedule.teacherId,
      teacher: schedule.teacher,
      class: schedule.class,
      classId: schedule.classId,
      fullSchedule: schedule
    });
    
    setSelectedScheduleForSubstitute(schedule);
    setSelectedSubstituteTeacherId(null);
    setConflictInfo(null);
    setShowSubstituteModal(true);
    
    // Load available teachers
    try {
      setLoadingSubstituteTeachers(true);
      const response = await teacherService.getAllTeachers();
      if (response && (response.teachers || response.data)) {
        const allTeachers = response.teachers || response.data || [];
        
        // Get current teacher ID from schedule
        let currentTeacherId = null;
        if (schedule.teacherId || schedule.teacher?._id || schedule.teacher?.id) {
          currentTeacherId = (schedule.teacherId || schedule.teacher?._id || schedule.teacher?.id)?.toString();
        } else if (teacher?._id) {
          currentTeacherId = teacher._id.toString();
        }
        
        // Filter out current teacher
        const filteredTeachers = allTeachers.filter(t => {
          const teacherId = (t._id || t.id)?.toString();
          return teacherId && teacherId !== currentTeacherId;
        });
        
        setAvailableSubstituteTeachers(filteredTeachers);
      } else {
        setAvailableSubstituteTeachers([]);
      }
    } catch (err) {
      console.error('Error loading substitute teachers:', err);
      setAvailableSubstituteTeachers([]);
    } finally {
      setLoadingSubstituteTeachers(false);
    }
  };

  // Handle submit assign substitute teacher
  const handleSubmitAssignSubstitute = async () => {
    if (!selectedSubstituteTeacherId || !selectedScheduleForSubstitute) {
      alert('Vui lòng chọn giáo viên dạy thay');
      return;
    }

    // Không cho phép xác nhận nếu có xung đột
    if (conflictInfo?.hasConflict) {
      alert('Không thể xác nhận khi giáo viên dạy thay có xung đột lịch học. Vui lòng chọn giáo viên khác.');
      return;
    }

    try {
      setAssigningSubstitute(true);
      const scheduleId = selectedScheduleForSubstitute.id || selectedScheduleForSubstitute._id;
      
      const response = await classScheduleService.assignSubstituteTeacher(scheduleId, selectedSubstituteTeacherId);
      
      if (response.success) {
        alert('Đã xếp người dạy thay thành công');
        
        // Refresh teacher schedule
        if (teacher?._id) {
          const scheduleData = await teacherService.getTeacherSchedule(teacher._id);
          setTeacherSchedule(scheduleData.schedules || []);
        }
        
        // Close modal
        setShowSubstituteModal(false);
        setSelectedScheduleForSubstitute(null);
        setSelectedSubstituteTeacherId(null);
        setConflictInfo(null);
      } else {
        alert(response.message || 'Không thể xếp người dạy thay');
      }
    } catch (err) {
      console.error('Error assigning substitute teacher:', err);
      alert(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi xếp người dạy thay');
    } finally {
      setAssigningSubstitute(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-success-600', text: 'Hoạt động', icon: 'fa-check-circle' },
      inactive: { bg: 'bg-danger-600', text: 'Tạm nghỉ', icon: 'fa-times-circle' }
    };
    const { bg, text, icon } = config[status] || config.active;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  // Helper function to get Vietnamese class status text
  const getClassStatusText = (status) => {
    const statusMap = {
      'active': 'Đang học',
      'pending': 'Chờ khai giảng',
      'inactive': 'Đã kết thúc',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy',
      'suspended': 'Tạm nghỉ'
    };
    return statusMap[status] || status || 'N/A';
  };

  // Helper function to get class status badge color
  const getClassStatusBadgeColor = (status) => {
    const colorMap = {
      'active': 'success',
      'pending': 'warning',
      'inactive': 'secondary',
      'completed': 'info',
      'cancelled': 'danger',
      'suspended': 'warning'
    };
    return colorMap[status] || 'secondary';
  };

  // Transform schedule data for calendar view
  const calendarSchedules = useMemo(() => {
    return teacherSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toISOString().split('T')[0];
      
      return {
        id: schedule._id || index,
        _id: schedule._id,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        roomId: schedule.room?._id || schedule.room?.id || schedule.room,
        room: schedule.room,
        topic: schedule.topic || '',
        status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
        attendanceStatus: null, // Teachers don't have attendance status
        hasAttendance: false,
        teacherName: teacher?.username || 'N/A',
        teacherId: schedule.teacher?._id || schedule.teacher?.id || schedule.teacher || teacher?._id,
        teacher: schedule.teacher || teacher,
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || '',
        class: schedule.class,
        classId: schedule.class?._id || schedule.class?.id || schedule.class
      };
    });
  }, [teacherSchedule, teacher]);

  if (loading) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !teacher) {
    return (
      <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error || 'Không tìm thấy thông tin giảng viên'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/academic/teacher-management')}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/academic/teacher-management')}
            className="mb-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <h4 className="text-neutral-900 fw-bold mb-8">Chi tiết giảng viên - {teacher.username}</h4>
        </div>
      </div>

      {/* Tabs */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm">
        <Card.Body className="p-24">
          <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
            {/* Info Tab */}
            <Tab eventKey="info" title={<><i className="fas fa-user me-2"></i>Thông tin</>}>
              <Row className="g-3 mt-3">
                <Col md={6}>
                  <Card className="border-0 bg-neutral-25">
                    <Card.Body className="p-16">
                      <h6 className="text-13 text-neutral-500 mb-8">Email</h6>
                      <p className="text-14 text-neutral-900 mb-0">{teacher.email}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-neutral-25">
                    <Card.Body className="p-16">
                      <h6 className="text-13 text-neutral-500 mb-8">Số điện thoại</h6>
                      <p className="text-14 text-neutral-900 mb-0">{teacher.phone || 'N/A'}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12}>
                  <Card className="border-0 bg-neutral-25">
                    <Card.Body className="p-16">
                      <h6 className="text-13 text-neutral-500 mb-8">Địa chỉ</h6>
                      <p className="text-14 text-neutral-900 mb-0">{teacher.address || 'N/A'}</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-neutral-25">
                    <Card.Body className="p-16">
                      <h6 className="text-13 text-neutral-500 mb-8">Trạng thái</h6>
                      {getStatusBadge(teacher.status)}
                    </Card.Body>
                  </Card>
                </Col>
                {teacher.stats && (
                  <>
                    <Col md={6}>
                      <Card className="border-0 bg-neutral-25">
                        <Card.Body className="p-16">
                          <h6 className="text-13 text-neutral-500 mb-8">Số lớp đang dạy</h6>
                          <p className="text-14 text-neutral-900 mb-0 fw-semibold">{teacher.stats.classCount || 0}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="border-0 bg-neutral-25">
                        <Card.Body className="p-16">
                          <h6 className="text-13 text-neutral-500 mb-8">Tổng số học viên</h6>
                          <p className="text-14 text-neutral-900 mb-0 fw-semibold">{teacher.stats.totalStudents || 0}</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="border-0 bg-neutral-25">
                        <Card.Body className="p-16">
                          <h6 className="text-13 text-neutral-500 mb-8">Số buổi dạy / Tổng số buổi</h6>
                          <p className="text-14 text-neutral-900 mb-0 fw-semibold">
                            {teacher.stats.actualTeachingSessions || 0} / {teacher.stats.totalSessions || 0}
                          </p>
                          {teacher.stats.totalSessions > 0 && (
                            <p className="text-12 text-neutral-600 mb-0 mt-1">
                              Tỷ lệ: {((teacher.stats.actualTeachingSessions / teacher.stats.totalSessions) * 100).toFixed(1)}%
                            </p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                    {teacher.stats.absentSessions > 0 && (
                      <Col md={6}>
                        <Card className="border-0 bg-warning-50">
                          <Card.Body className="p-16">
                            <h6 className="text-13 text-neutral-500 mb-8">Số buổi nghỉ (có người dạy thay)</h6>
                            <p className="text-14 text-neutral-900 mb-0 fw-semibold text-warning-700">
                              {teacher.stats.absentSessions}
                            </p>
                          </Card.Body>
                        </Card>
                      </Col>
                    )}
                  </>
                )}
              </Row>
            </Tab>

            {/* Classes Tab */}
            <Tab 
              eventKey="classes" 
              title={
                <>
                  <i className="fas fa-door-open me-2"></i>
                  Lớp học ({teacher.classes?.length || 0})
                  {loadingClasses && <i className="fas fa-spinner fa-spin ms-2"></i>}
                </>
              }
            >
              {loadingClasses ? (
                <div className="text-center py-5 mt-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="text-muted mt-2">Đang tải danh sách lớp học...</p>
                </div>
              ) : teacher.classes && teacher.classes.length > 0 ? (
                <Table hover className="mt-3">
                  <thead className="bg-neutral-25">
                    <tr>
                      <th className="px-16 py-12 text-13">Lớp</th>
                      <th className="px-16 py-12 text-13">Khóa học</th>
                      <th className="px-16 py-12 text-13">Trình độ</th>
                      <th className="px-16 py-12 text-13">Học viên</th>
                      <th className="px-16 py-12 text-13">Số buổi dạy</th>
                      <th className="px-16 py-12 text-13">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacher.classes.map((cls, index) => (
                      <tr key={index}>
                        <td className="px-16 py-12 fw-semibold">{cls.name}</td>
                        <td className="px-16 py-12">{cls.course?.name || 'N/A'}</td>
                        <td className="px-16 py-12">
                          <Badge bg="info">{cls.level}</Badge>
                        </td>
                        <td className="px-16 py-12">{cls.students?.length || 0}</td>
                        <td className="px-16 py-12">
                          {cls.stats ? (
                            <div>
                              <span className="fw-semibold">
                                {cls.stats.actualTeachingSessions || 0} / {cls.stats.totalSessions || 0}
                              </span>
                              {cls.stats.absentSessions > 0 && (
                                <div className="text-11 text-warning-600 mt-1">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  Nghỉ: {cls.stats.absentSessions}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-16 py-12">
                          <Badge bg={getClassStatusBadgeColor(cls.status)}>
                            {getClassStatusText(cls.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 text-muted mt-3">
                  Chưa có lớp học nào
                </div>
              )}
            </Tab>

            {/* Schedule Tab */}
            <Tab 
              eventKey="schedule" 
              title={
                <>
                  <i className="fas fa-calendar me-2"></i>
                  Lịch giảng dạy
                  {loadingSchedule && <i className="fas fa-spinner fa-spin ms-2"></i>}
                </>
              }
            >
              {loadingSchedule ? (
                <div className="text-center py-5 mt-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="text-muted mt-2">Đang tải lịch giảng dạy...</p>
                </div>
              ) : teacherSchedule.length > 0 ? (
                <>
                  {/* View Toggle */}
                  <div className="d-flex justify-content-end mb-3 mt-3">
                    <ButtonGroup>
                      <Button
                        variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setScheduleViewMode('table')}
                      >
                        <i className="fas fa-table me-2"></i>
                        Bảng
                      </Button>
                      <Button
                        variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                        size="sm"
                        onClick={() => setScheduleViewMode('calendar')}
                      >
                        <i className="fas fa-calendar-alt me-2"></i>
                        Lịch
                      </Button>
                    </ButtonGroup>
                  </div>

                  {/* Table View */}
                  {scheduleViewMode === 'table' && (
                    <>
                      <Table hover>
                        <thead className="bg-neutral-25">
                          <tr>
                            <th className="px-16 py-12 text-13">Thời gian</th>
                            <th className="px-16 py-12 text-13">Lớp học</th>
                            <th className="px-16 py-12 text-13">Phòng</th>
                            <th className="px-16 py-12 text-13">Chủ đề</th>
                            <th className="px-16 py-12 text-13">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teacherSchedule
                            .slice((schedulePage - 1) * 10, schedulePage * 10)
                            .map((schedule, index) => (
                              <tr key={index}>
                                <td className="px-16 py-12">
                                  <div className="text-14">
                                    {new Date(schedule.date).toLocaleDateString('vi-VN')}
                                  </div>
                                  <div className="text-13 text-muted">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </td>
                                <td className="px-16 py-12">{schedule.class?.name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.room?.room_name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.topic}</td>
                                <td className="px-16 py-12">
                                  <Badge bg={schedule.status === 'fixed' ? 'success' : schedule.status === 'temporary' ? 'warning' : 'secondary'}>
                                    {schedule.status === 'fixed' ? 'Buổi cố định' : schedule.status === 'temporary' ? 'Buổi tạm' : schedule.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                      {teacherSchedule.length > 10 && (
                        <div className="d-flex justify-content-center mt-3">
                          <Pagination>
                            <Pagination.First 
                              onClick={() => setSchedulePage(1)} 
                              disabled={schedulePage === 1}
                            />
                            <Pagination.Prev 
                              onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))} 
                              disabled={schedulePage === 1}
                            />
                            {[...Array(Math.ceil(teacherSchedule.length / 10))].map((_, i) => {
                              const page = i + 1;
                              // Show first page, last page, current page, and pages around current
                              if (
                                page === 1 ||
                                page === Math.ceil(teacherSchedule.length / 10) ||
                                (page >= schedulePage - 1 && page <= schedulePage + 1)
                              ) {
                                return (
                                  <Pagination.Item
                                    key={page}
                                    active={page === schedulePage}
                                    onClick={() => setSchedulePage(page)}
                                  >
                                    {page}
                                  </Pagination.Item>
                                );
                              } else if (
                                page === schedulePage - 2 ||
                                page === schedulePage + 2
                              ) {
                                return <Pagination.Ellipsis key={page} />;
                              }
                              return null;
                            })}
                            <Pagination.Next 
                              onClick={() => setSchedulePage(prev => Math.min(Math.ceil(teacherSchedule.length / 10), prev + 1))} 
                              disabled={schedulePage === Math.ceil(teacherSchedule.length / 10)}
                            />
                            <Pagination.Last 
                              onClick={() => setSchedulePage(Math.ceil(teacherSchedule.length / 10))} 
                              disabled={schedulePage === Math.ceil(teacherSchedule.length / 10)}
                            />
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}

                  {/* Calendar View */}
                  {scheduleViewMode === 'calendar' && (
                    <ScheduleCalendar
                      schedules={calendarSchedules}
                      onEditSchedule={(schedule) => {
                        // Optional: Handle edit if needed
                        console.log('Edit schedule:', schedule);
                      }}
                      onDeleteSchedule={(scheduleId) => {
                        // Optional: Handle delete if needed
                        console.log('Delete schedule:', scheduleId);
                      }}
                      onAssignSubstitute={handleAssignSubstitute}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-muted mt-3">
                  Chưa có lịch giảng dạy
                </div>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Substitute Teacher Modal */}
      <Modal show={showSubstituteModal} onHide={() => { 
        setShowSubstituteModal(false); 
        setSelectedScheduleForSubstitute(null);
        setSelectedSubstituteTeacherId(null);
        setConflictInfo(null);
        setSubstituteTeacherSchedule([]);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-plus me-2"></i>
            Xếp người dạy thay
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedScheduleForSubstitute && (
            <>
              {/* Schedule Info */}
              <Card className="mb-3 border border-neutral-200">
                <Card.Body>
                  <h6 className="mb-3">Thông tin buổi học</h6>
                  <Row className="g-2">
                    <Col md={6}>
                      <div className="text-13 text-neutral-600">Ngày:</div>
                      <div className="text-14 fw-semibold">
                        {new Date(selectedScheduleForSubstitute.date).toLocaleDateString('vi-VN')}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-13 text-neutral-600">Thời gian:</div>
                      <div className="text-14 fw-semibold">
                        {selectedScheduleForSubstitute.startTime} - {selectedScheduleForSubstitute.endTime}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-13 text-neutral-600">Lớp học:</div>
                      <div className="text-14 fw-semibold">
                        {selectedScheduleForSubstitute.className || 'N/A'}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-13 text-neutral-600">Phòng:</div>
                      <div className="text-14 fw-semibold">
                        {selectedScheduleForSubstitute.roomName || 'N/A'}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Select Substitute Teacher */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  Chọn giáo viên dạy thay <span className="text-danger">*</span>
                </Form.Label>
                {loadingSubstituteTeachers ? (
                  <div className="text-center py-3">
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Đang tải danh sách giáo viên...
                  </div>
                ) : (
                  <>
                    <Form.Select
                      value={selectedSubstituteTeacherId || ''}
                      onChange={(e) => setSelectedSubstituteTeacherId(e.target.value)}
                      disabled={assigningSubstitute}
                    >
                      <option value="">-- Chọn giáo viên --</option>
                      {availableSubstituteTeachers.map((t) => (
                        <option key={t._id || t.id} value={t._id || t.id}>
                          {t.username || t.name || t.fullName} 
                          {t.email && ` (${t.email})`}
                        </option>
                      ))}
                    </Form.Select>
                    {availableSubstituteTeachers.length === 0 && (
                      <Form.Text className="text-muted">
                        Không có giáo viên nào khả dụng
                      </Form.Text>
                    )}
                  </>
                )}
              </Form.Group>

              {/* Conflict Info */}
              {validatingConflict && (
                <Alert variant="info" className="mb-3">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang kiểm tra xung đột lịch học...
                </Alert>
              )}
              {conflictInfo && !validatingConflict && (
                <Alert variant={conflictInfo.hasConflict ? 'warning' : 'success'} className="mb-3">
                  {conflictInfo.hasConflict ? (
                    <>
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <strong>Cảnh báo:</strong> {conflictInfo.message}
                      {conflictInfo.conflicts && (
                        <div className="mt-2">
                          {conflictInfo.conflicts.teacher && conflictInfo.conflicts.teacher.length > 0 && (
                            <div className="text-13">
                              <strong>Xung đột với giáo viên:</strong>
                              <ul className="mb-0 mt-1">
                                {conflictInfo.conflicts.teacher.map((conflict, idx) => (
                                  <li key={idx}>
                                    {conflict.className} - {conflict.time}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {conflictInfo.conflicts.room && conflictInfo.conflicts.room.length > 0 && (
                            <div className="text-13 mt-2">
                              <strong>Xung đột với phòng:</strong>
                              <ul className="mb-0 mt-1">
                                {conflictInfo.conflicts.room.map((conflict, idx) => (
                                  <li key={idx}>
                                    {conflict.className} - {conflict.time}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle me-2"></i>
                      {conflictInfo.message}
                    </>
                  )}
                </Alert>
              )}

              {/* Substitute Teacher Schedule */}
              {selectedSubstituteTeacherId && (
                <Card className="mb-3 border border-neutral-200">
                  <Card.Body>
                    <h6 className="mb-3">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Lịch dạy của giáo viên được chọn vào ngày{' '}
                      {selectedScheduleForSubstitute && new Date(selectedScheduleForSubstitute.date).toLocaleDateString('vi-VN')}
                    </h6>
                    {loadingSubstituteTeacherSchedule ? (
                      <div className="text-center py-3">
                        <i className="fas fa-spinner fa-spin me-2"></i>
                        Đang tải lịch dạy...
                      </div>
                    ) : substituteTeacherSchedule.length > 0 ? (
                      <Table hover size="sm" className="mb-0">
                        <thead className="bg-neutral-25">
                          <tr>
                            <th className="px-12 py-8 text-12">Thời gian</th>
                            <th className="px-12 py-8 text-12">Lớp học</th>
                            <th className="px-12 py-8 text-12">Phòng</th>
                            <th className="px-12 py-8 text-12">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {substituteTeacherSchedule.map((schedule, idx) => {
                            const scheduleDate = new Date(schedule.date);
                            const isSameTime = 
                              schedule.startTime === selectedScheduleForSubstitute.startTime &&
                              schedule.endTime === selectedScheduleForSubstitute.endTime;
                            
                            return (
                              <tr 
                                key={idx}
                                className={isSameTime ? 'table-warning' : ''}
                              >
                                <td className="px-12 py-8">
                                  <div className="text-13 fw-semibold">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </td>
                                <td className="px-12 py-8 text-13">
                                  {schedule.class?.name || 'N/A'}
                                </td>
                                <td className="px-12 py-8 text-13">
                                  {schedule.room?.room_name || 'N/A'}
                                </td>
                                <td className="px-12 py-8">
                                  {isSameTime ? (
                                    <Badge bg="warning" text="dark" style={{ fontSize: '10px' }}>
                                      Trùng giờ
                                    </Badge>
                                  ) : (
                                    <Badge bg="secondary" style={{ fontSize: '10px' }}>
                                      {schedule.status === 'fixed' ? 'Cố định' : 'Tạm'}
                                    </Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-3 text-muted text-13">
                        <i className="fas fa-calendar-times me-2"></i>
                        Giáo viên này không có lịch dạy vào ngày này
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => { 
              setShowSubstituteModal(false); 
              setSelectedScheduleForSubstitute(null);
              setSelectedSubstituteTeacherId(null);
              setConflictInfo(null);
            }}
            disabled={assigningSubstitute}
          >
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitAssignSubstitute}
            disabled={
              !selectedSubstituteTeacherId || 
              assigningSubstitute || 
              loadingSubstituteTeachers || 
              (conflictInfo && conflictInfo.hasConflict) // Disable if there's a conflict
            }
            title={
              conflictInfo && conflictInfo.hasConflict 
                ? 'Không thể xác nhận khi có xung đột lịch học' 
                : ''
            }
          >
            {assigningSubstitute ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-check me-2"></i>
                Xác nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherDetail;

