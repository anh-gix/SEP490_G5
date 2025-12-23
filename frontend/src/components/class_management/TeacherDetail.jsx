import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, Tabs, Tab, Pagination, ButtonGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import teacherService from '../../services/teacherService';
import { classScheduleService } from '../../services/classScheduleService';
import ScheduleCalendar from './ScheduleCalendar';
import { toast } from 'react-toastify';

/**
 * Teacher Detail Component
 * Hiển thị chi tiết giảng viên với 3 tabs: Thông tin, Lớp học, Lịch giảng dạy
 * @param {string} teacherId - ID của giảng viên (từ props thay vì route params)
 * @param {function} onBack - Callback để quay lại danh sách
 */
const TeacherDetail = ({ teacherId, onBack }) => {
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
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

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
  const [conflictedSubstituteTeacherIds, setConflictedSubstituteTeacherIds] = useState(new Set());

  // Helper function to normalize date from various formats
  const normalizeDate = (dateInput) => {
    if (!dateInput) {
      return null;
    }
    
    // If already a Date object
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) {
        return null;
      }
      return dateInput;
    }
    
    // If it's an object (might be MongoDB date serialization)
    if (typeof dateInput === 'object' && dateInput !== null) {
      // Try common MongoDB date formats
      if (dateInput.$date) {
        return normalizeDate(dateInput.$date);
      }
      if (dateInput.toString) {
        const dateStr = dateInput.toString();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
      }
    }
    
    // If string, try parsing
    if (typeof dateInput === 'string') {
      // First, try DD/MM/YYYY format (common Vietnamese format from backend)
      const ddmmyyyyMatch = dateInput.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyyMatch) {
        const day = parseInt(ddmmyyyyMatch[1]);
        const month = parseInt(ddmmyyyyMatch[2]) - 1; // Month is 0-indexed
        const year = parseInt(ddmmyyyyMatch[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Try YYYY-MM-DD format (ISO date format, parse as local time to avoid UTC conversion)
      const yyyymmddMatch = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
      if (yyyymmddMatch) {
        const year = parseInt(yyyymmddMatch[1]);
        const month = parseInt(yyyymmddMatch[2]) - 1; // Month is 0-indexed
        const day = parseInt(yyyymmddMatch[3]);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Try full ISO format parsing (with time)
      let date = new Date(dateInput);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    return null;
  };

  // Helper to format date to YYYY-MM-DD for calendar matching (using local time, not UTC)
  const formatDateForCalendar = (date) => {
    if (!date) return null;
    const d = normalizeDate(date);
    if (!d) return null;
    
    // Use local date components to avoid UTC conversion
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format date for display (Vietnamese locale, avoids UTC issues)
  const formatDateForDisplay = (date) => {
    if (!date) return 'N/A';
    const d = normalizeDate(date);
    if (!d) return 'N/A';
    
    try {
      return d.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

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
      
      const schedules = scheduleData.schedules || [];
      setTeacherSchedule(schedules);
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
    // Validate date using normalizeDate helper
    const scheduleDate = normalizeDate(schedule.date);
    if (!scheduleDate) {
      toast.error('Buổi học không có thông tin ngày hợp lệ');
      return;
    }
    
    // Kiểm tra xem buổi học có phải là quá khứ không
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    
    if (scheduleDate < today) {
      toast.error('Không thể xếp người dạy thay cho buổi học đã qua');
      return;
    }
    
    setSelectedScheduleForSubstitute(schedule);
    setSelectedSubstituteTeacherId(null);
    setConflictInfo(null);
    setShowSubstituteModal(true);
    
    // Load available teachers and check conflicts
    try {
      setLoadingSubstituteTeachers(true);
      const response = await teacherService.getAllTeachers();
      if (response && (response.teachers || response.data)) {
        const allTeachers = response.teachers || response.data || [];
        
        // Get current teacher ID from schedule
        let currentTeacherId = null;

        // Ưu tiên 1: Kiểm tra substituteTeacher trước
        if (schedule.substituteTeacher?._id || schedule.substituteTeacher?.id || schedule.substituteTeacherId) {
          currentTeacherId = (schedule.substituteTeacher?._id || schedule.substituteTeacher?.id || schedule.substituteTeacherId)?.toString();
        } 
        // Ưu tiên 2: Nếu không có substituteTeacher, lấy teacher
        else if (schedule.teacherId || schedule.teacher?._id || schedule.teacher?.id) {
          currentTeacherId = (schedule.teacherId || schedule.teacher?._id || schedule.teacher?.id)?.toString();
        } 
        // Ưu tiên 3: Fallback về teacher state nếu schedule không có thông tin
        else if (teacher?._id) {
          currentTeacherId = teacher._id.toString();
        }
        
        // Filter out current teacher
        const candidateTeachers = allTeachers.filter(t => {
          const teacherId = (t._id || t.id)?.toString();
          return teacherId && teacherId !== currentTeacherId;
        });
        
        // Check conflicts for all candidate teachers
        const conflictedIds = new Set();
        const roomId = schedule.roomId || schedule.room?._id || schedule.room?.id || schedule.room;
        const scheduleId = schedule.id || schedule._id;
        
        if (roomId && schedule.date && schedule.startTime && schedule.endTime) {
          const conflictPromises = candidateTeachers.map(async (t) => {
            try {
              const teacherId = (t._id || t.id)?.toString();
              const validateResponse = await classScheduleService.validateScheduleConflictSimple({
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                teacher: teacherId,
                room: roomId,
                excludeScheduleId: scheduleId
              });
              
              if (validateResponse.success && validateResponse.hasConflict && validateResponse.conflicts?.teacher?.length > 0) {
                conflictedIds.add(teacherId);
              }
            } catch (error) {
              // On error, assume no conflict to be safe
            }
            return null;
          });
          
          await Promise.all(conflictPromises);
        }
        
        setConflictedSubstituteTeacherIds(conflictedIds);
        
        // Filter out conflicted teachers
        const filteredTeachers = candidateTeachers.filter(t => {
          const teacherId = (t._id || t.id)?.toString();
          return !conflictedIds.has(teacherId);
        });
        
        setAvailableSubstituteTeachers(filteredTeachers);
      } else {
        setAvailableSubstituteTeachers([]);
        setConflictedSubstituteTeacherIds(new Set());
      }
    } catch (err) {
      console.error('Error loading substitute teachers:', err);
      setAvailableSubstituteTeachers([]);
      setConflictedSubstituteTeacherIds(new Set());
    } finally {
      setLoadingSubstituteTeachers(false);
    }
  };

  // Handle submit assign substitute teacher
  const handleSubmitAssignSubstitute = async () => {
    if (!selectedSubstituteTeacherId || !selectedScheduleForSubstitute) {
      toast.error('Vui lòng chọn giáo viên dạy thay');
      return;
    }

    try {
      setAssigningSubstitute(true);
      const scheduleId = selectedScheduleForSubstitute.id || selectedScheduleForSubstitute._id;
      
      const response = await classScheduleService.assignSubstituteTeacher(scheduleId, selectedSubstituteTeacherId);
      
      if (response.success) {
        toast.success('Đã xếp người dạy thay thành công');
        
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
        setSubstituteTeacherSchedule([]);
        setConflictedSubstituteTeacherIds(new Set());
      } else {
        toast.error(response.message || 'Không thể xếp người dạy thay');
      }
    } catch (err) {
      console.error('Error assigning substitute teacher:', err);
      toast.error(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi xếp người dạy thay');
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
    const transformed = teacherSchedule
      .map((schedule, index) => {
        // Use normalizeDate helper to parse date
        const scheduleDate = normalizeDate(schedule.date);
        if (!scheduleDate) {
          return null; // Skip invalid schedules
        }
        
        // Use formatDateForCalendar to format date (using local time, not UTC)
        const dateStr = formatDateForCalendar(schedule.date);
        if (!dateStr) {
          return null;
        }
      
        // Extract programType from schedule data
        const programType = schedule.programType || schedule.class?.course?.program?.type || null;
        
        // Calculate timeStatus
        const now = new Date();
        const scheduleDateTime = new Date(schedule.date);
        const startTime = schedule.startTime || '08:00';
        const endTime = schedule.endTime || '10:00';
        
        // Parse time strings (HH:MM format)
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        const sessionStartDateTime = new Date(scheduleDateTime);
        sessionStartDateTime.setHours(startHour, startMinute, 0, 0);
        
        const sessionEndDateTime = new Date(scheduleDateTime);
        sessionEndDateTime.setHours(endHour, endMinute, 0, 0);
        
        // Determine time status
        let timeStatus = 'upcoming'; // 'upcoming', 'ongoing', 'completed'
        if (now > sessionEndDateTime) {
          timeStatus = 'completed'; // Buổi đã kết thúc
        } else if (now >= sessionStartDateTime && now <= sessionEndDateTime) {
          timeStatus = 'ongoing'; // Buổi đang diễn ra
        } else {
          timeStatus = 'upcoming'; // Buổi chưa bắt đầu
        }
        
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
          substituteTeacher: schedule.substituteTeacher || null,
          substituteTeacherId: schedule.substituteTeacher?._id || schedule.substituteTeacher?.id || schedule.substituteTeacher || null,
          lessonNumber: schedule.session?.order || '',
          lessonTopic: schedule.topic || '',
          class: schedule.class,
          classId: schedule.class?._id || schedule.class?.id || schedule.class,
          programType: programType,
          timeStatus: timeStatus
        };
      })
      .filter(Boolean); // Remove null entries from invalid dates
    
    return transformed;
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
        <Button variant="secondary" onClick={onBack || (() => navigate('/academic/teacher-management'))}>
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
            onClick={onBack || (() => navigate('/academic/teacher-management'))}
            className="mb-3"
          >
            <i className="fas fa-arrow-left me-2"></i>
            Quay lại
          </Button>
          <h4 className="text-neutral-900 fw-bold mb-8">Chi tiết giảng viên - {teacher.username}</h4>
        </div>
        <div>
          {activeTab === 'schedule' && (
            <Button
              variant={isEditMode ? 'danger' : 'primary'}
              onClick={() => setIsEditMode(!isEditMode)}
              className="mb-3"
            >
              <i className={`fas ${isEditMode ? 'fa-times' : 'fa-edit'} me-2`}></i>
              {isEditMode ? 'Tắt chỉnh sửa' : 'Chỉnh sửa'}
            </Button>
          )}
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
                                    {formatDateForDisplay(schedule.date)}
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
                      }}
                      onDeleteSchedule={(scheduleId) => {
                        // Optional: Handle delete if needed
                      }}
                      onAssignSubstitute={handleAssignSubstitute}
                      readOnly={!isEditMode}
                      showTeacherName={false}
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
        setConflictedSubstituteTeacherIds(new Set());
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
                        {formatDateForDisplay(selectedScheduleForSubstitute?.date)}
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
              setSubstituteTeacherSchedule([]);
              setConflictedSubstituteTeacherIds(new Set());
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
              loadingSubstituteTeachers
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

