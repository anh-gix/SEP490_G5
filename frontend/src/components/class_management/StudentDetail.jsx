import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Button, Badge, Alert, Tabs, Tab, Table, Row, Col, Card, Pagination, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import { courseService } from '../../services/courseService';
import { classScheduleService } from '../../services/classScheduleService';
import studentScheduleService from '../../services/studentScheduleService';
import ScheduleCalendar from './ScheduleCalendar';
import MakeupClassModalForStudent from './MakeupClassModalForStudent';

/**
 * Student Detail Component
 * Hiển thị chi tiết học viên với các tab: Thông tin, Lớp học, Lịch học
 * Sử dụng route parameter để lấy studentId
 */
const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [detailError, setDetailError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // 'table' or 'calendar'
  
  // Tab and lazy loading states
  const [activeTab, setActiveTab] = useState('info');
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  
  // Edit courses modal state
  const [showEditCoursesModal, setShowEditCoursesModal] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [savingCourses, setSavingCourses] = useState(false);

  // Makeup class modal state
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [selectedScheduleForMakeup, setSelectedScheduleForMakeup] = useState(null);
  const [creatingMakeup, setCreatingMakeup] = useState(false);

  // Fetch only student info (for Info tab)
  const fetchStudentInfo = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoading(true);
      setDetailError(null);
      
      console.log('🔍 Fetching student info for:', studentId);
      
      // Fetch Student details
      const data = await studentService.getStudentById(studentId);
      console.log('📦 Student data response:', data);
      
      if (!data || !data.student) {
        throw new Error('Không nhận được dữ liệu học viên từ server');
      }
      
      // Ensure courses array exists (needed for Info tab)
      const studentData = {
        ...data.student,
        courses: data.student.courses || []
      };
      
      // Check if classes are already included in the response
      if (data.student?.classes && data.student.classes.length > 0) {
        studentData.classes = data.student.classes;
        setClassesLoaded(true);
      } else {
        studentData.classes = [];
      }
      
      console.log('✅ Student courses:', studentData.courses?.length || 0, studentData.courses);
      setSelectedStudent(studentData);
    } catch (err) {
      console.error('❌ Error fetching Student info:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải thông tin chi tiết';
      setDetailError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // Fetch student classes (lazy load for Classes tab)
  const fetchStudentClasses = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoadingClasses(true);
      // Re-fetch student data to get classes if not included
      const data = await studentService.getStudentById(studentId);
      if (data && data.student) {
        setSelectedStudent(prev => ({
          ...prev,
          ...data.student,
          classes: data.student.classes || []
        }));
        setClassesLoaded(true);
      }
    } catch (err) {
      console.error('Error fetching student classes:', err);
    } finally {
      setLoadingClasses(false);
    }
  }, [studentId]);

  // Fetch student schedule (lazy load for Schedule tab)
  const fetchStudentSchedule = useCallback(async () => {
    if (!studentId) return;
    
    try {
      setLoadingSchedule(true);
      console.log('📅 Fetching student schedule...');
      const scheduleData = await studentService.getStudentSchedule(studentId);
      console.log('📦 Schedule data response:', scheduleData);
      
      // Check response structure
      const schedules = scheduleData?.schedules || scheduleData?.data?.schedules || [];
      console.log('✅ Student schedules:', schedules.length, schedules);
      setStudentSchedule(Array.isArray(schedules) ? schedules : []);
      setSchedulePage(1);
      setScheduleLoaded(true);
    } catch (err) {
      console.error('Error fetching student schedule:', err);
    } finally {
      setLoadingSchedule(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchStudentInfo();
    }
  }, [studentId, fetchStudentInfo]);

  // Handle tab selection with lazy loading
  const handleTabSelect = (key) => {
    setActiveTab(key);
    
    // Lazy load data when tab is selected
    if (key === 'classes' && !classesLoaded) {
      // Check if classes are already in student object
      if (selectedStudent?.classes && selectedStudent.classes.length > 0) {
        setClassesLoaded(true);
      } else {
        fetchStudentClasses();
      }
    } else if (key === 'schedule' && !scheduleLoaded) {
      fetchStudentSchedule();
    }
  };

  const handleGoBack = () => {
    navigate('/academic/student-management');
  };

  // Handler to open edit courses modal
  const handleEditCourses = async () => {
    try {
      setLoadingCourses(true);
      // Load all courses
      const coursesResponse = await courseService.getAllCourses();
      const allCoursesList = coursesResponse?.data || coursesResponse || [];
      setAllCourses(allCoursesList);
      
      // Set currently enrolled courses as selected
      const currentCourseIds = selectedStudent?.courses?.map(course => {
        const id = course._id || course.id;
        return id ? String(id) : null;
      }).filter(id => id !== null) || [];
      setSelectedCourseIds(currentCourseIds);
      
      setShowEditCoursesModal(true);
    } catch (err) {
      console.error('Error loading courses:', err);
      alert('Không thể tải danh sách khóa học: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoadingCourses(false);
    }
  };

  // Handler to save course enrollments
  const handleSaveCourseEnrollments = async () => {
    if (!selectedStudent?._id) {
      alert('Không tìm thấy thông tin học viên');
      return;
    }

    try {
      setSavingCourses(true);
      
      // Call API to update student course enrollments
      await studentService.updateStudentCourseEnrollments(selectedStudent._id, selectedCourseIds);
      
      // Refresh student data
      const data = await studentService.getStudentById(selectedStudent._id);
      if (data && data.student) {
        const studentData = {
          ...data.student,
          classes: data.student.classes || [],
          courses: data.student.courses || []
        };
        setSelectedStudent(studentData);
      }
      
      // Close modal
      setShowEditCoursesModal(false);
      alert('Cập nhật khóa học thành công!');
    } catch (err) {
      console.error('Error saving course enrollments:', err);
      alert('Không thể cập nhật khóa học: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    } finally {
      setSavingCourses(false);
    }
  };

  // Handler to open makeup class modal
  const handleCreateMakeup = (schedule) => {
    setSelectedScheduleForMakeup(schedule);
    setShowMakeupModal(true);
  };

  // Handler to close makeup class modal
  const handleCloseMakeupModal = () => {
    setShowMakeupModal(false);
    setSelectedScheduleForMakeup(null);
  };

  // Handler to submit makeup class creation
  const handleSubmitMakeup = async (makeupData) => {
    if (!selectedScheduleForMakeup || !studentId) {
      alert('Thiếu thông tin cần thiết');
      return;
    }

    try {
      setCreatingMakeup(true);

      if (makeupData.existingScheduleId) {
        // Trường hợp chọn buổi có sẵn
        // 1. Tạo StudentSchedule entry để gán học viên vào buổi học bù
        await studentScheduleService.createStudentSchedule(
          studentId,
          makeupData.existingScheduleId,
          'rescheduled',
          `Học bù cho buổi học ngày ${new Date(selectedScheduleForMakeup.date).toLocaleDateString('vi-VN')}`
        );

        // 2. Cập nhật StudentSchedule gốc thành cancelled
        if (selectedScheduleForMakeup.studentScheduleId) {
          await studentScheduleService.updateStudentSchedule(
            selectedScheduleForMakeup.studentScheduleId,
            'cancelled',
            'Đã học bù'
          );
        }
      } else {
        // Trường hợp tạo buổi học bù mới
        // 1. Tạo ClassSchedule mới cho buổi học bù
        const makeupScheduleResponse = await classScheduleService.createMakeupClassSchedule({
          date: makeupData.date,
          startTime: makeupData.startTime,
          endTime: makeupData.endTime,
          room: makeupData.room,
          teacher: makeupData.teacher,
          reason: makeupData.reason || 'Buổi học bù',
          session: null // Không có session cho buổi học bù riêng
        });

        if (!makeupScheduleResponse.success || !makeupScheduleResponse.schedule) {
          throw new Error(makeupScheduleResponse.message || 'Không thể tạo buổi học bù');
        }

        const makeupClassScheduleId = makeupScheduleResponse.schedule._id;

        // 2. Tạo StudentSchedule entry để gán học viên vào buổi học bù
        await studentScheduleService.createStudentSchedule(
          studentId,
          makeupClassScheduleId,
          'rescheduled',
          `Học bù cho buổi học ngày ${new Date(selectedScheduleForMakeup.date).toLocaleDateString('vi-VN')}`
        );

        // 3. Cập nhật StudentSchedule gốc thành cancelled
        if (selectedScheduleForMakeup.studentScheduleId) {
          await studentScheduleService.updateStudentSchedule(
            selectedScheduleForMakeup.studentScheduleId,
            'cancelled',
            'Đã học bù'
          );
        }
      }

      // 4. Refresh lịch học
      await fetchStudentSchedule();

      // 5. Đóng modal và hiển thị thông báo
      handleCloseMakeupModal();
      alert('Đã tạo buổi học bù thành công!');
    } catch (err) {
      console.error('Error creating makeup class:', err);
      alert('Không thể tạo buổi học bù: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
    } finally {
      setCreatingMakeup(false);
    }
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
    if (!Array.isArray(studentSchedule) || studentSchedule.length === 0) {
      return [];
    }
    
    return studentSchedule
      .filter(schedule => schedule && schedule.date) // Filter out invalid schedules
      .map((schedule, index) => {
        try {
          const scheduleDate = new Date(schedule.date);
          if (isNaN(scheduleDate.getTime())) {
            console.warn('Invalid date in schedule:', schedule.date);
            return null;
          }
          const dateStr = scheduleDate.toISOString().split('T')[0];
          
          // Get attendance status
          const attendanceStatus = schedule.attendance?.status || null;
          
          // Get schedule status from StudentSchedule
          const scheduleStatus = schedule.scheduleStatus || 'scheduled';
          const isMakeupSchedule = scheduleStatus === 'rescheduled';
          const isCancelled = scheduleStatus === 'cancelled';
          const reason = schedule.reason || null;
          
          return {
            id: schedule._id || `schedule-${index}`,
            studentScheduleId: schedule._id, // Store original StudentSchedule ID
            date: dateStr,
            startTime: schedule.startTime || '',
            endTime: schedule.endTime || '',
            className: schedule.className || 'N/A',
            roomName: schedule.room?.room_name || schedule.roomName || 'N/A',
            roomId: schedule.room?._id || null,
            topic: schedule.topic || schedule.sessionTitle || '',
            status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
            attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
            hasAttendance: !!attendanceStatus,
            teacherName: schedule.teacher?.username || schedule.teacherName || 'N/A',
            teacherId: schedule.teacher?._id || null,
            lessonNumber: schedule.sessionOrder || schedule.session?.order || schedule.lessonNumber || '',
            sessionOrder: schedule.sessionOrder || schedule.session?.order || schedule.lessonNumber || null,
            lessonTopic: schedule.topic || schedule.sessionTitle || '',
            scheduleStatus: scheduleStatus,
            reason: reason,
            isMakeupSchedule: isMakeupSchedule,
            isCancelled: isCancelled,
            cancellationReason: isCancelled ? reason : null
          };
        } catch (error) {
          console.error('Error transforming schedule:', error, schedule);
          return null;
        }
      })
      .filter(item => item !== null); // Remove null entries
  }, [studentSchedule]);

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header with Back Button */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">
            Chi tiết Học viên - {selectedStudent?.username || 'Đang tải...'}
          </h4>
          <p className="text-neutral-600 mb-0">Xem và quản lý thông tin chi tiết học viên</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleGoBack}
          className="px-20 py-10 radius-8"
        >
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      {/* Error Message */}
      {detailError && (
        <Alert variant="danger" className="mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>Lỗi:</strong> {detailError}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="text-muted mt-2">Đang tải thông tin chi tiết...</p>
        </div>
      )}

      {/* Content */}
      {selectedStudent && !loading && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-24">
            <Tabs activeKey={activeTab} onSelect={handleTabSelect} className="mb-3">
              {/* Info Tab */}
              <Tab eventKey="info" title={<><i className="fas fa-user me-2"></i>Thông tin</>}>
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <div className="d-flex align-items-center">
                          <span className="text-13 text-neutral-500 me-2" style={{ minWidth: '120px' }}>Email:</span>
                          <span className="text-14 text-neutral-900 fw-semibold">{selectedStudent.email}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <div className="d-flex align-items-center">
                          <span className="text-13 text-neutral-500 me-2" style={{ minWidth: '120px' }}>Số điện thoại:</span>
                          <span className="text-14 text-neutral-900 fw-semibold">{selectedStudent.phone || 'N/A'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <div className="d-flex align-items-center">
                          <span className="text-13 text-neutral-500 me-2" style={{ minWidth: '120px' }}>Địa chỉ:</span>
                          <span className="text-14 text-neutral-900 fw-semibold">{selectedStudent.address || 'N/A'}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <div className="d-flex align-items-start">
                          <span className="text-13 text-neutral-500 me-2" style={{ minWidth: '120px' }}>Khóa học đang học:</span>
                          <div className="flex-grow-1">
                            {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                              <div className="d-flex flex-wrap gap-2">
                                {selectedStudent.courses.map((course, idx) => (
                                  <Badge 
                                    key={idx} 
                                    bg="info" 
                                    className="text-13 px-12 py-6"
                                  >
                                    {course.name}
                                    {course.program && (
                                      <span className="ms-1 text-12">
                                        ({course.program.program_name || course.program.name || course.program.type || 'N/A'})
                                      </span>
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-14 text-neutral-600">Chưa đăng ký khóa học nào</span>
                            )}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 ms-2"
                            onClick={handleEditCourses}
                            title="Chỉnh sửa khóa học"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* Classes Tab */}
              <Tab eventKey="classes" title={<><i className="fas fa-door-open me-2"></i>Lớp học</>}>
                {loadingClasses ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-2">Đang tải danh sách lớp học...</p>
                  </div>
                ) : detailError ? (
                  <Alert variant="warning" className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải danh sách lớp học. Vui lòng thử lại sau.
                  </Alert>
                ) : selectedStudent.classes && Array.isArray(selectedStudent.classes) && selectedStudent.classes.length > 0 ? (
                  <Table hover>
                    <thead className="bg-neutral-25">
                      <tr>
                        <th className="px-16 py-12 text-13">Lớp</th>
                        <th className="px-16 py-12 text-13">Khóa học</th>
                        <th className="px-16 py-12 text-13">Trình độ</th>
                        <th className="px-16 py-12 text-13">Học viên</th>
                        <th className="px-16 py-12 text-13">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.classes.map((cls, index) => (
                        <tr key={cls._id || index}>
                          <td className="px-16 py-12 fw-semibold">{cls.name || 'N/A'}</td>
                          <td className="px-16 py-12">{cls.course?.name || 'N/A'}</td>
                          <td className="px-16 py-12">
                            <Badge bg="info">{cls.level || 'N/A'}</Badge>
                          </td>
                          <td className="px-16 py-12">{Array.isArray(cls.students) ? cls.students.length : (cls.students?.length || 0)}</td>
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
                  <div className="text-center py-5">
                    <i className="fas fa-door-open text-muted mb-3" style={{ fontSize: '48px' }}></i>
                    <p className="text-muted mb-0">Học viên chưa được đăng ký lớp học nào</p>
                  </div>
                )}
              </Tab>

              {/* Schedule Tab */}
              <Tab eventKey="schedule" title={<><i className="fas fa-calendar me-2"></i>Lịch học</>}>
                {loadingSchedule ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="text-muted mt-2">Đang tải lịch học...</p>
                  </div>
                ) : detailError ? (
                  <Alert variant="warning" className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải lịch học. Vui lòng thử lại sau.
                  </Alert>
                ) : studentSchedule && Array.isArray(studentSchedule) && studentSchedule.length > 0 ? (
                  <>
                    {/* View Toggle */}
                    <div className="d-flex justify-content-end mb-2">
                      <ButtonGroup size="sm">
                        <Button
                          variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('table')}
                          className="px-12 py-6"
                        >
                          <i className="fas fa-table me-1"></i>
                          Bảng
                        </Button>
                        <Button
                          variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('calendar')}
                          className="px-12 py-6"
                        >
                          <i className="fas fa-calendar-alt me-1"></i>
                          Lịch
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Table View */}
                    {scheduleViewMode === 'table' && (
                      <>
                        <Table hover size="sm">
                            <thead className="bg-neutral-25 sticky-top">
                              <tr>
                                <th className="px-12 py-8 text-12">Thời gian</th>
                                <th className="px-12 py-8 text-12">Lớp học</th>
                                <th className="px-12 py-8 text-12">Phòng</th>
                                <th className="px-12 py-8 text-12">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentSchedule
                                .slice((schedulePage - 1) * 10, schedulePage * 10)
                                .map((schedule, index) => (
                                <tr key={index}>
                                  <td className="px-12 py-8">
                                    <div className="text-13">
                                      {new Date(schedule.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-12 text-muted">
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  </td>
                                  <td className="px-12 py-8 text-13">{schedule.className || 'N/A'}</td>
                                  <td className="px-12 py-8 text-13">{schedule.room?.room_name || 'N/A'}</td>
                                  <td className="px-12 py-8">
                                    {!schedule.attendance || !schedule.attendance.status ? (
                                      <Badge bg="secondary" className="text-12">Chưa học</Badge>
                                    ) : (
                                      <Badge 
                                        bg={
                                          schedule.attendance.status === 'present' ? 'success' :
                                          schedule.attendance.status === 'absent' ? 'danger' :
                                          schedule.attendance.status === 'late' ? 'warning' :
                                          'info'
                                        }
                                        className="text-12"
                                      >
                                        {schedule.attendance.status === 'present' ? 'Có mặt' :
                                         schedule.attendance.status === 'absent' ? 'Vắng mặt' :
                                         schedule.attendance.status === 'late' ? 'Đi muộn' :
                                         'Có phép'}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        {studentSchedule.length > 10 && (
                          <div className="d-flex justify-content-center mt-2">
                            <Pagination size="sm">
                              <Pagination.First 
                                onClick={() => setSchedulePage(1)} 
                                disabled={schedulePage === 1}
                              />
                              <Pagination.Prev 
                                onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))} 
                                disabled={schedulePage === 1}
                              />
                              {[...Array(Math.ceil(studentSchedule.length / 10))].map((_, i) => {
                                const page = i + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === Math.ceil(studentSchedule.length / 10) ||
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
                                onClick={() => setSchedulePage(prev => Math.min(Math.ceil(studentSchedule.length / 10), prev + 1))} 
                                disabled={schedulePage === Math.ceil(studentSchedule.length / 10)}
                              />
                              <Pagination.Last 
                                onClick={() => setSchedulePage(Math.ceil(studentSchedule.length / 10))} 
                                disabled={schedulePage === Math.ceil(studentSchedule.length / 10)}
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
                        onCreateMakeup={handleCreateMakeup}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '48px' }}></i>
                    <p className="text-muted mb-0">Học viên chưa có lịch học nào</p>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      )}

      {/* Edit Courses Modal */}
      <Modal show={showEditCoursesModal} onHide={() => setShowEditCoursesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa khóa học của học viên
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingCourses ? (
            <div className="text-center py-5">
              <i className="fas fa-spinner fa-spin me-2"></i>
              Đang tải danh sách khóa học...
            </div>
          ) : (
            <>
              <div className="mb-3">
                <Form.Label className="fw-semibold">Chọn khóa học:</Form.Label>
                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '8px', padding: '12px' }}>
                  {allCourses.length > 0 ? (
                    allCourses.map((course) => {
                      const courseId = course._id || course.id;
                      const courseIdStr = courseId ? String(courseId) : null;
                      if (!courseIdStr) return null;
                      const isSelected = selectedCourseIds.includes(courseIdStr);
                      return (
                        <Form.Check
                          key={courseIdStr}
                          type="checkbox"
                          id={`course-${courseIdStr}`}
                          label={
                            <div>
                              <span className="fw-semibold">{course.name || course.courseCode || 'N/A'}</span>
                              {course.program && (
                                <span className="text-muted ms-2 text-13">
                                  ({course.program.program_name || course.program.name || course.program.type || 'N/A'})
                                </span>
                              )}
                            </div>
                          }
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCourseIds([...selectedCourseIds, courseIdStr]);
                            } else {
                              setSelectedCourseIds(selectedCourseIds.filter(id => id !== courseIdStr));
                            }
                          }}
                          className="mb-2"
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-3 text-muted">
                      Không có khóa học nào trong hệ thống
                    </div>
                  )}
                </div>
              </div>
              {selectedCourseIds.length > 0 && (
                <Alert variant="info" className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Đã chọn {selectedCourseIds.length} khóa học
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditCoursesModal(false)}
            disabled={savingCourses || loadingCourses}
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveCourseEnrollments}
            disabled={savingCourses || loadingCourses}
          >
            {savingCourses ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang lưu...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Lưu
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Makeup Class Modal */}
      <MakeupClassModalForStudent
        show={showMakeupModal}
        originalSchedule={selectedScheduleForMakeup}
        studentId={studentId}
        onClose={handleCloseMakeupModal}
        onSubmit={handleSubmitMakeup}
        loading={creatingMakeup}
        studentSchedule={studentSchedule}
      />
    </Container>
  );
};

export default StudentDetail;

