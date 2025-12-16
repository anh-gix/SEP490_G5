import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import changeRequestService from '../../services/changeRequestService';
import teacherService from '../../services/teacherService';

const CreateTeacherChangeRequestModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'request_replace_teacher',
    content: '',
    classScheduleId: ''
  });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classSchedules, setClassSchedules] = useState([]);
  const [filteredClassSchedules, setFilteredClassSchedules] = useState([]);
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

  useEffect(() => {
    if (show) {
      fetchTeacherSchedules();
    }
  }, [show]);

  // Helper function to get week start (Monday) from a date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
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

  // Helper function to get week key from date
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
    
    return Array.from(weekMap.values()).sort((a, b) => b.start - a.start);
  };

  const parseDateString = (dateString) => {
    if (!dateString) return null;
    const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1;
      const day = parseInt(dateMatch[3], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  };

  // Get unique classes from schedules
  const getClassesFromSchedules = (schedules) => {
    const classMap = new Map();
    schedules.forEach(schedule => {
      const classInfo = schedule.class;
      if (classInfo && classInfo._id) {
        const classId = classInfo._id.toString();
        if (!classMap.has(classId)) {
          classMap.set(classId, {
            _id: classId,
            name: classInfo.name || 'N/A',
            courseName: classInfo.course?.name || ''
          });
        }
      }
    });
    return Array.from(classMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  useEffect(() => {
    let filtered = [...classSchedules];
    
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
    
    // Filter future schedules only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    filtered = filtered.filter(schedule => {
      if (!schedule.date) return false;
      const date = parseDateString(schedule.date);
      if (!date || isNaN(date.getTime())) return false;
      const scheduleDate = new Date(date);
      scheduleDate.setHours(0, 0, 0, 0);
      return scheduleDate >= today;
    });
    
    setFilteredClassSchedules(filtered);
  }, [selectedClassFilter, selectedWeekFilter, classSchedules]);

  const fetchTeacherSchedules = async () => {
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

      const response = await teacherService.getCurrentTeacherSchedule(params);
      
      if (response && response.success) {
        if (response.schedules && Array.isArray(response.schedules)) {
          // Filter future schedules and active status
          const activeSchedules = response.schedules.filter(schedule => {
            const isCancelled = schedule.status === 'cancelled' || schedule.status === 'canceled';
            return !isCancelled;
          });
          
          setClassSchedules(activeSchedules);
          setFilteredClassSchedules(activeSchedules);
        } else {
          setClassSchedules([]);
          setFilteredClassSchedules([]);
        }
      } else {
        setError(response?.message || 'Không thể tải danh sách buổi dạy. Vui lòng thử lại.');
        setClassSchedules([]);
        setFilteredClassSchedules([]);
      }
    } catch (err) {
      setError('Không thể tải danh sách buổi dạy. Vui lòng thử lại.');
      setClassSchedules([]);
      setFilteredClassSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const formatScheduleDisplay = (schedule) => {
    if (!schedule.date) {
      return schedule._id ? `Buổi dạy ${schedule._id}` : 'N/A';
    }
    
    const date = parseDateString(schedule.date);
    if (!date || isNaN(date.getTime())) {
      return schedule._id ? `Buổi dạy ${schedule._id}` : 'N/A';
    }
    
    const dateStr = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const className = schedule.class?.name || 'N/A';
    const topic = schedule.topic || schedule.session?.title || '';
    const timeStr = schedule.startTime && schedule.endTime 
      ? `${schedule.startTime}-${schedule.endTime}` 
      : '';
    return `${dateStr}${timeStr ? ` ${timeStr}` : ''} - ${className}${topic ? ` - ${topic}` : ''}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (!formData.classScheduleId) {
      setError('Vui lòng chọn buổi dạy');
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        type: 'request_replace_teacher',
        classScheduleId: formData.classScheduleId,
        content: formData.content
      };

      const response = await changeRequestService.createTeacherChangeRequest(requestData);

      if (response.success) {
        toast.success('Gửi đơn thành công!');
        setFormData({
          type: 'request_replace_teacher',
          content: '',
          classScheduleId: ''
        });
        setValidated(false);
        setSelectedClassFilter('');
        setSelectedWeekFilter('');

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
        type: 'request_replace_teacher',
        content: '',
        classScheduleId: ''
      });
      setValidated(false);
      setError('');
      setSelectedClassFilter('');
      setSelectedWeekFilter('');
      onHide();
    }
  };

  const classes = getClassesFromSchedules(classSchedules);

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
            Gửi đơn xin thay giáo viên
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
            <Form.Label className="text-neutral-900 fw-semibold text-13 mb-8">
              Chọn buổi dạy <span className="text-danger-600">*</span>
            </Form.Label>
            {loadingSchedules ? (
              <div className="text-center py-16">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <span className="text-neutral-600 text-13">Đang tải danh sách buổi dạy...</span>
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
                        setFormData(prev => ({ ...prev, classScheduleId: '' }));
                      }}
                      className="border-neutral-30 radius-8 px-16 py-10 text-13"
                    >
                      <option value="">Tất cả các lớp</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} {cls.courseName ? `- ${cls.courseName}` : ''}
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
                        setFormData(prev => ({ ...prev, classScheduleId: '' }));
                      }}
                      className="border-neutral-30 radius-8 px-16 py-10 text-13"
                      disabled={loadingSchedules || classSchedules.length === 0}
                    >
                      <option value="">Tất cả các tuần</option>
                      {!loadingSchedules && classSchedules.length > 0 && getWeeksFromSchedules(classSchedules).map((week) => (
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
                      Chọn buổi dạy
                    </Form.Label>
                    <Form.Select
                      name="classScheduleId"
                      value={formData.classScheduleId}
                      onChange={handleInputChange}
                      required
                      className="border-neutral-30 radius-8 px-16 py-10 text-13"
                    >
                      <option value="">-- Chọn buổi dạy --</option>
                      {filteredClassSchedules.map((schedule) => (
                        <option key={schedule._id} value={schedule._id}>
                          {formatScheduleDisplay(schedule)}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
                {!formData.classScheduleId && validated && (
                  <div className="text-danger-600 text-13 mt-8">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Vui lòng chọn buổi dạy
                  </div>
                )}
                {filteredClassSchedules.length === 0 && !loadingSchedules && (
                  <Form.Text className="text-neutral-500 text-12 mt-8 d-block">
                    <i className="fas fa-info-circle me-2"></i>
                    {selectedClassFilter || selectedWeekFilter 
                      ? 'Không có buổi dạy nào phù hợp với bộ lọc đã chọn' 
                      : 'Bạn chưa có buổi dạy nào sắp tới'}
                  </Form.Text>
                )}
              </>
            )}
          </Form.Group>

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
              placeholder="Mô tả chi tiết lý do xin thay giáo viên..."
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

export default CreateTeacherChangeRequestModal;

