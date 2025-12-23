import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import changeRequestService from '../../services/changeRequestService';
import studentService from '../../services/studentService';

const CreateChangeRequestModal = ({ show, onHide, onSuccess, preselectedScheduleId }) => {
  const [formData, setFormData] = useState({
    type: 'makeup_class',
    content: '',
    studentScheduleId: ''
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [studentSchedules, setStudentSchedules] = useState([]);
  const [filteredStudentSchedules, setFilteredStudentSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      type: type,
      studentScheduleId: ''
    }));
    setSelectedClassFilter('');
    setSelectedWeekFilter('');
    setError('');
  };

  useEffect(() => {
    if (show && formData.type === 'makeup_class' && studentSchedules.length === 0) {
      fetchStudentSchedules();
      fetchClassesForFilter();
    }
  }, [show, formData.type]);

  // Helper function to get week start (Monday) from a date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Monday is day 1, Sunday is day 0
    // If Sunday (0), go back 6 days; otherwise go back (day - 1) days
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0); // Reset time to start of day
    return weekStart;
  };

  // Helper function to get week end (Sunday) from a date
  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return weekEnd;
  };

  // Helper function to format week range
  const formatWeekRange = (weekStart, weekEnd) => {
    const startDay = weekStart.getDate();
    const startMonth = weekStart.getMonth() + 1;
    const startYear = weekStart.getFullYear();
    const startStr = `${startDay}/${startMonth}/${startYear}`;
    
    const endDay = weekEnd.getDate();
    const endMonth = weekEnd.getMonth() + 1;
    const endYear = weekEnd.getFullYear();
    const endStr = `${endDay}/${endMonth}/${endYear}`;
    
    return `${startStr} - ${endStr}`;
  };

  // Helper function to get week key from date (YYYY-MM-DD format of week start)
  const getWeekKey = (date) => {
    const weekStart = getWeekStart(date);
    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get unique weeks from schedules
  const getWeeksFromSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) {
      return [];
    }
    
    const weekMap = new Map();
    
    schedules.forEach(schedule => {
      if (!schedule.date) return;
      
      const date = parseDateString(schedule.date);
      if (!date || isNaN(date.getTime())) return;
      
      const weekKey = getWeekKey(date);
      const weekStart = getWeekStart(date);
      const weekEnd = getWeekEnd(date);
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          key: weekKey,
          start: weekStart,
          end: weekEnd,
          label: formatWeekRange(weekStart, weekEnd)
        });
      }
    });
    
    // Sort by week start date (newest first)
    return Array.from(weekMap.values()).sort((a, b) => b.start - a.start);
  };

  useEffect(() => {
    if (formData.type === 'makeup_class') {
      let filtered = [...studentSchedules];
      
      // Filter by class
      if (selectedClassFilter) {
        filtered = filtered.filter(schedule => {
          const classId = schedule.class?._id || schedule.class;
          return classId && classId.toString() === selectedClassFilter;
        });
      }
      
      // Filter by week
      if (selectedWeekFilter) {
        filtered = filtered.filter(schedule => {
          if (!schedule.date) return false;
          const date = parseDateString(schedule.date);
          if (!date || isNaN(date.getTime())) return false;
          const weekKey = getWeekKey(date);
          return weekKey === selectedWeekFilter;
        });
      }
      
      setFilteredStudentSchedules(filtered);
    }
  }, [selectedClassFilter, selectedWeekFilter, studentSchedules, formData.type]);

  // Auto-select schedule when preselectedScheduleId is provided
  useEffect(() => {
    if (show && preselectedScheduleId && studentSchedules.length > 0) {
      // Kiểm tra xem studentScheduleId có trong danh sách không
      const scheduleExists = studentSchedules.some(
        schedule => {
          const scheduleId = schedule.studentScheduleId || schedule._id || schedule.id;
          return scheduleId && scheduleId.toString() === preselectedScheduleId.toString();
        }
      );
      
      if (scheduleExists) {
        setFormData(prev => ({
          ...prev,
          studentScheduleId: preselectedScheduleId
        }));
      }
    }
  }, [show, preselectedScheduleId, studentSchedules]);

  const fetchClassesForFilter = async () => {
    try {
      const response = await studentService.getMyClasses();
      if (response.success && response.classes) {
        // Only show active classes in the filter dropdown
        const activeClasses = response.classes.filter(cls => cls.status === 'active');
        setClasses(activeClasses);
      }
    } catch (err) {
      // Error fetching classes for filter
    }
  };

  const fetchStudentSchedules = async () => {
    try {
      setLoadingSchedules(true);
      setError('');
      
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
      
      const params = {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const response = await studentService.getMySchedule(params);
      
      if (response && response.success) {
        if (response.schedules && Array.isArray(response.schedules)) {
          // Filter out cancelled schedules and schedules from non-active classes
          const activeSchedules = response.schedules.filter(schedule => {
            // Check both scheduleStatus (from StudentSchedule) and status (from ClassSchedule)
            const isCancelled = 
              schedule.scheduleStatus === 'cancelled' || 
              schedule.scheduleStatus === 'canceled' ||
              schedule.status === 'cancelled' || 
              schedule.status === 'canceled';
            
            // Only allow schedules from active classes (not pending, completed, or disable)
            const classStatus = schedule.class?.status;
            const isActiveClass = classStatus === 'active';
            
            return !isCancelled && isActiveClass;
          });
          
          // Filter: Only allow makeup requests for absent or not-yet-attended sessions
          // Exclude: present, late, excused (already attended)
          const eligibleSchedules = activeSchedules.filter(schedule => {
            const attendanceStatus = schedule.attendance?.status;
        
            
            if (!attendanceStatus || attendanceStatus === null || attendanceStatus === undefined) {
              return true; // Chưa điểm danh - cho phép xin học bù
            }
            
            if (attendanceStatus === 'absent') {
              return true; // Đã điểm danh vắng - cho phép xin học bù
            }
            
            // Bỏ qua các trường hợp đã attend (present, late, excused)
            return false;
          });
          
          setStudentSchedules(eligibleSchedules);
          setFilteredStudentSchedules(eligibleSchedules);
        } else {
          setStudentSchedules([]);
          setFilteredStudentSchedules([]);
        }
      } else {
        setError(response?.message || 'Không thể tải danh sách buổi học. Vui lòng thử lại.');
        setStudentSchedules([]);
        setFilteredStudentSchedules([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách buổi học. Vui lòng thử lại.');
      setStudentSchedules([]);
      setFilteredStudentSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!formData.type) {
      setError('Vui lòng chọn loại đơn');
      setValidated(true);
      return;
    }

    if (formData.type === 'makeup_class' && !formData.studentScheduleId) {
      setError('Vui lòng chọn buổi học');
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare request data
      const requestData = {
        type: formData.type,
        content: formData.content
      };

      // Add studentScheduleId if type is makeup_class
      if (formData.type === 'makeup_class' && formData.studentScheduleId) {
        requestData.studentScheduleId = formData.studentScheduleId;
      }

      // Call API to create change request
      const response = await changeRequestService.createChangeRequest(requestData);

      if (response.success) {
        // Success - reset form and close modal
        setFormData({
          type: 'makeup_class', // Reset về mặc định "Học bù"
          content: '',
          studentScheduleId: ''
        });
        setValidated(false);
        setStudentSchedules([]);
        setFilteredStudentSchedules([]);
        setSelectedClassFilter('');
        setSelectedWeekFilter('');

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        onHide();
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại.');
      }
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        type: 'makeup_class', // Reset về mặc định "Học bù"
        content: '',
        studentScheduleId: ''
      });
      setValidated(false);
      setError('');
      setStudentSchedules([]);
      setFilteredStudentSchedules([]);
      setSelectedClassFilter('');
      setSelectedWeekFilter('');
      onHide();
    }
  };

  const parseDateString = (dateString) => {
    if (!dateString) return null;
    
    // If date string is in YYYY-MM-DD format, parse directly to avoid timezone issues
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateMatch[3], 10);
      return new Date(year, month, day);
    }
    
    // Fallback to regular Date parsing
    return new Date(dateString);
  };

  const formatScheduleDisplay = (schedule) => {
    // Response structure from getMySchedule: schedule has date, startTime, endTime, className, topic directly
    if (!schedule.date) {
      return schedule._id ? `Buổi học ${schedule._id}` : 'N/A';
    }
    
    // Parse date using local timezone to avoid timezone offset issues
    const date = parseDateString(schedule.date);
    if (!date || isNaN(date.getTime())) {
      return schedule._id ? `Buổi học ${schedule._id}` : 'N/A';
    }
    
    const dateStr = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Xác định className: nếu là buổi học bù (không có class hoặc status là temporary/rescheduled) thì hiển thị "Lớp học bù"
    let className = schedule.className || schedule.class?.name;
    if (!className || className === 'N/A' || className === null || className === undefined) {
      // Kiểm tra nếu là buổi học bù
      const isMakeupClass = 
        schedule.scheduleStatus === 'rescheduled' || 
        schedule.status === 'temporary' || 
        !schedule.class || 
        schedule.class === null;
      
      if (isMakeupClass) {
        className = 'Lớp học bù';
      } else {
        className = 'N/A';
      }
    }
    
    const topic = schedule.topic || schedule.sessionTitle || schedule.session?.title || '';
    const timeStr = schedule.startTime && schedule.endTime 
      ? `${schedule.startTime}-${schedule.endTime}` 
      : '';
    return `${dateStr}${timeStr ? ` ${timeStr}` : ''} - ${className}${topic ? ` - ${topic}` : ''}`;
  };

  const getTypeDescription = (type) => {
    const descriptions = {
      makeup_class: 'Yêu cầu học bù buổi học đã nghỉ'
    };
    return descriptions[type] || '';
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      {/* Modal Header */}
      <Modal.Header 
        className="bg-primary text-white border-0 p-24"
        closeButton
        closeVariant="white"
      >
        <div>
          <Modal.Title className="fw-bold text-18 mb-4">
            <i className="fas fa-file-alt me-2"></i>
            Tạo đơn mới
          </Modal.Title>
          <p className="mb-0 text-15" style={{ opacity: 0.95 }}>
            Gửi đơn xin học bù
          </p>
        </div>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body className="p-24">
        {error && (
          <Alert variant="danger" className="mb-20 rounded-8" dismissible onClose={() => setError('')}>
            <i className="fas fa-exclamation-circle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Request Form */}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-20">
            <Form.Label className="text-neutral-900 fw-semibold text-13 mb-12">
              Loại đơn <span className="text-danger-600">*</span>
            </Form.Label>
            <Button
              variant="warning"
              onClick={() => handleTypeSelect('makeup_class')}
              className="w-100 py-16 text-14 fw-semibold active"
              style={{
                borderWidth: '2px',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}
            >
              <i className="fas fa-calendar-check me-2"></i>
              Học bù
            </Button>
            {!formData.type && validated && (
              <div className="text-danger-600 text-13 mt-8">
                <i className="fas fa-exclamation-circle me-2"></i>
                Vui lòng chọn loại đơn
              </div>
            )}
            {formData.type && (
              <Form.Text className="text-neutral-500 text-12 mt-12 d-block">
                <i className="fas fa-info-circle me-2"></i>
                {getTypeDescription(formData.type)}
              </Form.Text>
            )}
          </Form.Group>

          {/* Student Schedule Selection for Makeup Class */}
          {formData.type === 'makeup_class' && (
            <Form.Group className="mb-20">
              <Form.Label className="text-neutral-900 fw-semibold text-13 mb-8">
                Chọn buổi học <span className="text-danger-600">*</span>
              </Form.Label>
              {loadingSchedules ? (
                <div className="text-center py-16">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <span className="text-neutral-600 text-13">Đang tải danh sách buổi học...</span>
                </div>
              ) : (
                <>
                  {/* Hàng 1: Filters */}
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Label className="text-neutral-700 text-12 mb-2">
                        Lọc theo lớp
                      </Form.Label>
                      <Form.Select
                        value={selectedClassFilter}
                        onChange={(e) => {
                          setSelectedClassFilter(e.target.value);
                          setFormData(prev => ({ ...prev, studentScheduleId: '' })); // Reset selection when filter changes
                        }}
                        className="border-neutral-30 radius-8 px-16 py-10 text-13"
                      >
                        <option value="">Tất cả các lớp</option>
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} {cls.course?.name ? `- ${cls.course.name}` : ''}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label className="text-neutral-700 text-12 mb-2">
                        Lọc theo tuần
                      </Form.Label>
                      <Form.Select
                        value={selectedWeekFilter}
                        onChange={(e) => {
                          setSelectedWeekFilter(e.target.value);
                          setFormData(prev => ({ ...prev, studentScheduleId: '' })); // Reset selection when filter changes
                        }}
                        className="border-neutral-30 radius-8 px-16 py-10 text-13"
                        disabled={loadingSchedules || studentSchedules.length === 0}
                      >
                        <option value="">Tất cả các tuần</option>
                        {!loadingSchedules && studentSchedules.length > 0 && getWeeksFromSchedules(studentSchedules).map((week) => (
                          <option key={week.key} value={week.key}>
                            {week.label}
                          </option>
                        ))}
                      </Form.Select>
                      {loadingSchedules && (
                        <Form.Text className="text-neutral-500 text-11 mt-1 d-block">
                          Đang tải...
                        </Form.Text>
                      )}
                    </Col>
                  </Row>
                  
                  {/* Hàng 2: Selection */}
                  <Row className="g-3">
                    <Col md={12}>
                      <Form.Label className="text-neutral-700 text-12 mb-2">
                        Chọn buổi học
                      </Form.Label>
                      <Form.Select
                        name="studentScheduleId"
                        value={formData.studentScheduleId}
                        onChange={handleInputChange}
                        required
                        className="border-neutral-30 radius-8 px-16 py-10 text-13"
                      >
                        <option value="">-- Chọn buổi học --</option>
                        {filteredStudentSchedules.map((schedule) => (
                          <option key={schedule.studentScheduleId || schedule._id || schedule.id} value={schedule.studentScheduleId || schedule._id || schedule.id}>
                            {formatScheduleDisplay(schedule)}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                  {!formData.studentScheduleId && validated && (
                    <div className="text-danger-600 text-13 mt-8">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Vui lòng chọn buổi học
                    </div>
                  )}
                  {filteredStudentSchedules.length === 0 && !loadingSchedules && (
                    <Form.Text className="text-neutral-500 text-12 mt-8 d-block">
                      <i className="fas fa-info-circle me-2"></i>
                      {selectedClassFilter ? 'Không có buổi học nào trong lớp đã chọn' : 'Bạn chưa có buổi học nào'}
                    </Form.Text>
                  )}
                </>
              )}
            </Form.Group>
          )}

          <Form.Group className="mb-20">
            <Form.Label className="text-neutral-900 fw-semibold text-13 mb-8">
              Nội dung yêu cầu <span className="text-danger-600">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              name="content"
              rows={5}
              value={formData.content}
              onChange={handleInputChange}
              required
              placeholder="Mô tả chi tiết yêu cầu của bạn..."
              className="border-neutral-30 radius-8 px-16 py-10 text-13"
            />
            <Form.Control.Feedback type="invalid" className="text-13">
              Vui lòng nhập nội dung yêu cầu
            </Form.Control.Feedback>
            <Form.Text className="text-neutral-500 text-12 mt-8">
              Cung cấp thông tin chi tiết giúp giáo vụ xử lý đơn nhanh hơn
            </Form.Text>
          </Form.Group>

        </Form>
      </Modal.Body>

      {/* Modal Footer */}
      <Modal.Footer className="bg-neutral-25 border-0 p-20">
        <Button
          variant="link"
          onClick={handleClose}
          disabled={loading}
          className="text-neutral-700 text-13 fw-medium text-decoration-none"
        >
          <i className="fas fa-times me-2"></i>
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary text-white text-13 fw-semibold px-24 py-12 radius-8"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang gửi...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Gửi đơn
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateChangeRequestModal;

