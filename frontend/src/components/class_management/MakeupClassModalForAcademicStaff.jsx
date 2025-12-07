import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { classScheduleService } from '../../services/classScheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';
import studentScheduleService from '../../services/studentScheduleService';

const MakeupClassModalForAcademicStaff = ({ 
  show,
  studentScheduleId,
  requestType = 'makeup_class', // 'makeup_class' or 'replace_teacher'
  senderSchedule = [],
  onClose, 
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    teacher: ''
  });
  
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [validating, setValidating] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [error, setError] = useState(null);
  
  // States for existing schedule selection (for makeup_class)
  const [makeupOption, setMakeupOption] = useState('existing');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedExistingScheduleId, setSelectedExistingScheduleId] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [currentClassScheduleId, setCurrentClassScheduleId] = useState(null);
  
  // State for substitute teacher (for replace_teacher)
  const [selectedSubstituteTeacherId, setSelectedSubstituteTeacherId] = useState('');
  
  // Original schedule info
  const [originalScheduleInfo, setOriginalScheduleInfo] = useState(null);
  const [loadingOriginalSchedule, setLoadingOriginalSchedule] = useState(false);

  // Load original schedule info when modal opens
  useEffect(() => {
    if (show && studentScheduleId) {
      fetchOriginalSchedule();
      fetchRooms();
      fetchTeachers();
      resetForm();
    }
  }, [show, studentScheduleId]);

  // Fetch available schedules when option is 'existing' and sessionId is available
  useEffect(() => {
    if (show && requestType === 'makeup_class' && makeupOption === 'existing' && originalScheduleInfo) {
      fetchAvailableSchedules();
    }
  }, [show, makeupOption, originalScheduleInfo, sessionId, requestType]);

  const resetForm = () => {
    setFormData({
      date: '',
      startTime: '',
      endTime: '',
      room: '',
      teacher: ''
    });
    setConflicts(null);
    setError(null);
    setMakeupOption('existing');
    setSelectedExistingScheduleId('');
    setSelectedSubstituteTeacherId('');
    setAvailableSchedules([]);
    setSessionId(null);
    setCurrentClassScheduleId(null);
  };

  const fetchOriginalSchedule = async () => {
    if (!studentScheduleId) return;
    
    try {
      setLoadingOriginalSchedule(true);
      const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
      
      if (response.success && response.classSchedule) {
        const classSchedule = response.classSchedule;
        setOriginalScheduleInfo({
          studentScheduleId: studentScheduleId,
          classScheduleId: classSchedule._id,
          classId: classSchedule.class?._id,
          className: classSchedule.class?.name || 'N/A',
          date: classSchedule.date,
          startTime: classSchedule.startTime,
          endTime: classSchedule.endTime,
          roomName: classSchedule.room?.room_name || 'N/A',
          sessionId: classSchedule.session?._id,
          sessionTitle: classSchedule.session?.title,
          sessionOrder: classSchedule.session?.order
        });
        
        // Set sessionId and currentClassScheduleId for fetching available schedules
        if (classSchedule.session?._id) {
          setSessionId(classSchedule.session._id);
          setCurrentClassScheduleId(classSchedule._id);
        }
        
        // Pre-fill form with original schedule info
        setFormData(prev => ({
          ...prev,
          startTime: classSchedule.startTime || '',
          endTime: classSchedule.endTime || ''
        }));
      }
    } catch (err) {
      console.error('Error fetching original schedule:', err);
      setError('Không thể tải thông tin buổi học');
    } finally {
      setLoadingOriginalSchedule(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms({ status: 'available' });
      setRooms(response.rooms || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Không thể tải danh sách phòng học');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers({ status: 'active' });
      setTeachers(response.teachers || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError('Không thể tải danh sách giáo viên');
    }
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to check time overlap
  const hasTimeOverlap = (start1, end1, start2, end2) => {
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    return start1Min < end2Min && end1Min > start2Min;
  };

  // Helper function to check if a schedule conflicts with sender's schedule
  const hasConflictWithSenderSchedule = (schedule) => {
    if (!senderSchedule || senderSchedule.length === 0) {
      return false;
    }

    if (!schedule.date || !schedule.startTime || !schedule.endTime) {
      return false;
    }

    const scheduleDate = formatDateToYYYYMMDD(schedule.date);
    
    const senderSchedulesSameDate = senderSchedule.filter(sch => {
      if (!sch.date || !sch.startTime || !sch.endTime) {
        return false;
      }
      const schDate = formatDateToYYYYMMDD(sch.date);
      return schDate === scheduleDate;
    });

    for (const senderSch of senderSchedulesSameDate) {
      if (senderSch.scheduleStatus === 'cancelled' || senderSch.scheduleStatus === 'rescheduled') {
        continue;
      }
      
      if (hasTimeOverlap(
        schedule.startTime,
        schedule.endTime,
        senderSch.startTime,
        senderSch.endTime
      )) {
        return true;
      }
    }

    return false;
  };

  const fetchAvailableSchedules = async () => {
    if (!originalScheduleInfo || !sessionId) return;
    
    try {
      setLoadingSchedules(true);
      
      const apiPort = import.meta.env.VITE_API_PORT || 8080;
      const today = new Date().toISOString();
      const response = await fetch(
        `http://localhost:${apiPort}/api/class-schedules/by-session?sessionId=${sessionId}&dateAfter=${today}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const classSchedules = data.classSchedules || [];
        
        // Filter to exclude current schedule and conflicts with sender's schedule
        const filtered = classSchedules.filter(schedule => {
          const scheduleId = (schedule._id || schedule.id)?.toString();
          if (currentClassScheduleId && scheduleId === currentClassScheduleId.toString()) {
            return false;
          }
          if (hasConflictWithSenderSchedule(schedule)) {
            return false;
          }
          return true;
        });
        
        setAvailableSchedules(filtered);
      } else {
        setAvailableSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      setAvailableSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (conflicts) {
      setConflicts(null);
    }
  };

  const validateConflict = async () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.teacher) {
      return false;
    }

    try {
      setValidating(true);
      // Get student ID from senderSchedule if available, or skip studentId validation
      let studentId = null;
      if (senderSchedule && senderSchedule.length > 0) {
        // Try to get student ID from first schedule
        const firstSchedule = senderSchedule[0];
        studentId = firstSchedule.student?._id || firstSchedule.student || null;
      }
      
      const response = await classScheduleService.validateScheduleConflictSimple({
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        teacher: formData.teacher,
        studentId: studentId
      });

      if (response.success) {
        setConflicts(response);
        return !response.hasConflict;
      }
      return false;
    } catch (err) {
      console.error('Error validating conflict:', err);
      setError('Không thể kiểm tra xung đột lịch học');
      return false;
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (requestType === 'replace_teacher') {
      // Handle substitute teacher
      if (!selectedSubstituteTeacherId) {
        setError('Vui lòng chọn giáo viên dạy thay');
        return;
      }

      const substituteTeacher = teachers.find(t => 
        (t._id || t.id)?.toString() === selectedSubstituteTeacherId
      );

      if (!substituteTeacher) {
        setError('Giáo viên được chọn không hợp lệ');
        return;
      }

      // Submit with substitute teacher data
      onSubmit({
        absentScheduleId: studentScheduleId,
        substituteTeacherId: selectedSubstituteTeacherId,
        isSubstituteClass: true,
        substituteTeacherInfo: {
          _id: substituteTeacher._id || substituteTeacher.id,
          username: substituteTeacher.username,
          fullName: substituteTeacher.fullName,
          name: substituteTeacher.name
        }
      });
    } else {
      // Handle makeup class
      if (makeupOption === 'existing') {
        // Choose existing schedule
        if (!selectedExistingScheduleId) {
          setError('Vui lòng chọn buổi học bù');
          return;
        }

        const selectedSchedule = availableSchedules.find(
          s => (s._id || s.id)?.toString() === selectedExistingScheduleId
        );

        if (!selectedSchedule) {
          setError('Buổi học được chọn không hợp lệ');
          return;
        }

        // Submit with existing schedule data
        const makeupScheduleId = selectedSchedule._id || selectedSchedule.id;
        const makeupClassId = selectedSchedule.class?._id || selectedSchedule.classId;

        onSubmit({
          absentScheduleId: studentScheduleId,
          makeupScheduleId: makeupScheduleId,
          makeupClassId: makeupClassId,
          isSubstituteClass: false,
          makeupSchedule: {
            _id: makeupScheduleId,
            id: makeupScheduleId,
            date: selectedSchedule.date,
            startTime: selectedSchedule.startTime,
            endTime: selectedSchedule.endTime,
            title: selectedSchedule.session?.title,
            order: selectedSchedule.session?.order,
            class: selectedSchedule.class
          },
          makeupClassInfo: {
            className: selectedSchedule.class?.name || 'N/A',
            classId: makeupClassId
          }
        });
      } else {
        // Create new makeup class
        if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.teacher) {
          setError('Vui lòng điền đầy đủ thông tin bắt buộc');
          return;
        }

        // Validate conflict
        const isValid = await validateConflict();
        if (!isValid) {
          const conflictMessages = [];
          if (conflicts?.conflicts?.room?.length > 0) {
            conflictMessages.push(`Phòng học đã được sử dụng (${conflicts.conflicts.room.length} xung đột)`);
          }
          if (conflicts?.conflicts?.teacher?.length > 0) {
            conflictMessages.push(`Giáo viên đã có lịch dạy (${conflicts.conflicts.teacher.length} xung đột)`);
          }
          if (conflicts?.conflicts?.students?.length > 0) {
            conflictMessages.push(`Học viên đã có lịch học (${conflicts.conflicts.students.length} xung đột)`);
          }
          const errorMsg = conflictMessages.length > 0 
            ? `Có xung đột lịch học: ${conflictMessages.join(', ')}. Vui lòng xem chi tiết bên dưới và chọn thời gian khác.`
            : 'Có xung đột lịch học. Vui lòng chọn thời gian khác.';
          setError(errorMsg);
          return;
        }

        // Get sessionId from original schedule for new makeup
        const newMakeupSessionId = originalScheduleInfo?.sessionId || null;

        // Submit with new makeup class data
        onSubmit({
          absentScheduleId: studentScheduleId,
          isSubstituteClass: false,
          isNewMakeup: true,
          newMakeupDate: formData.date,
          newMakeupStartTime: formData.startTime,
          newMakeupEndTime: formData.endTime,
          newMakeupRoomId: formData.room,
          newMakeupTeacherId: formData.teacher,
          newMakeupSessionId: newMakeupSessionId,
          makeupSchedule: {
            date: formData.date,
            startTime: formData.startTime,
            endTime: formData.endTime,
            title: originalScheduleInfo?.sessionTitle || 'Buổi học bù',
            order: originalScheduleInfo?.sessionOrder || null
          },
          makeupClassInfo: {
            className: originalScheduleInfo?.className || 'Lớp học bù'
          }
        });
      }
    }
  };

  if (!show) return null;

  const modalTitle = requestType === 'replace_teacher' 
    ? 'Xếp giáo viên dạy thay' 
    : 'Xếp buổi học bù';
  const modalHeaderClass = requestType === 'replace_teacher' 
    ? 'bg-info text-white' 
    : 'bg-warning text-white';

  return (
    <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className={`${modalHeaderClass} border-0 p-24`}>
        <Modal.Title className="fw-bold">
          <i className="fas fa-calendar-plus me-2"></i>
          {modalTitle}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Original schedule info */}
          {loadingOriginalSchedule ? (
            <div className="text-center py-3">
              <i className="fas fa-spinner fa-spin me-2"></i>
              Đang tải thông tin buổi học...
            </div>
          ) : originalScheduleInfo && (
            <Card className="mb-20 bg-warning-25 border border-warning-200 rounded-12" style={{ borderLeft: '4px solid #FF9800' }}>
              <Card.Header className="bg-warning-50 border-0 rounded-top-12 p-16">
                <h5 className="mb-0 text-neutral-900 fw-semibold">Thông tin buổi học gốc</h5>
              </Card.Header>
              <Card.Body className="p-20">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Lớp:</strong> 
                      <span className="text-neutral-700 ms-2">{originalScheduleInfo.className || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Ngày học:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {originalScheduleInfo.date ? new Date(originalScheduleInfo.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Thời gian:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {originalScheduleInfo.startTime || 'N/A'} - {originalScheduleInfo.endTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Phòng:</strong> 
                      <span className="text-neutral-700 ms-2">{originalScheduleInfo.roomName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* Conflict warnings */}
          {conflicts && conflicts.hasConflict && (
            <Alert variant="warning" className="mb-3">
              <Alert.Heading>
                <i className="fas fa-exclamation-triangle me-2"></i>
                Có xung đột lịch học
              </Alert.Heading>
              {conflicts.conflicts?.room?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột phòng:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.room.map((conflict, idx) => (
                      <li key={idx}>
                        {conflict.roomName} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.conflicts?.teacher?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột giáo viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.teacher.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.conflicts?.students?.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột lịch học viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.conflicts.students.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

          {/* Content based on request type */}
          {requestType === 'replace_teacher' ? (
            // Substitute teacher selection
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                Chọn giáo viên dạy thay <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedSubstituteTeacherId}
                onChange={(e) => setSelectedSubstituteTeacherId(e.target.value)}
                required
              >
                <option value="">-- Chọn giáo viên dạy thay --</option>
                {teachers.map(teacher => (
                  <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                    {teacher.username || teacher.fullName || teacher.name || 'N/A'}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          ) : (
            // Makeup class options
            <>
              {/* Option selection */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Chọn phương thức:</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    id="makeup-existing"
                    name="makeupOption"
                    label="Chọn từ buổi học có sẵn"
                    value="existing"
                    checked={makeupOption === 'existing'}
                    onChange={(e) => setMakeupOption(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="makeup-new"
                    name="makeupOption"
                    label="Tạo buổi học bù mới"
                    value="new"
                    checked={makeupOption === 'new'}
                    onChange={(e) => setMakeupOption(e.target.value)}
                  />
                </div>
              </Form.Group>

              {/* Existing schedule selection */}
              {makeupOption === 'existing' ? (
                <div className="mb-3">
                  <Form.Label>
                    Chọn buổi học bù <span className="text-danger">*</span>
                  </Form.Label>
                  {loadingSchedules ? (
                    <div className="text-center py-3">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Đang tải danh sách buổi học...
                    </div>
                  ) : availableSchedules.length > 0 ? (
                    <>
                      <Form.Select
                        value={selectedExistingScheduleId}
                        onChange={(e) => setSelectedExistingScheduleId(e.target.value)}
                        required
                      >
                        <option value="">-- Chọn buổi học bù --</option>
                        {availableSchedules.map((schedule) => {
                          const scheduleId = (schedule._id || schedule.id)?.toString();
                          const dateStr = schedule.date 
                            ? new Date(schedule.date).toLocaleDateString('vi-VN') 
                            : '';
                          const timeStr = `${schedule.startTime || ''} - ${schedule.endTime || ''}`;
                          const className = schedule.class?.name || 'N/A';
                          const sessionTitle = schedule.session?.title || 'N/A';
                          const displayText = `${sessionTitle} - ${className}${dateStr ? ` (${dateStr})` : ''} - ${timeStr}`;
                          return (
                            <option key={scheduleId} value={scheduleId}>
                              {displayText}
                            </option>
                          );
                        })}
                      </Form.Select>
                      
                      {/* Show selected schedule details */}
                      {selectedExistingScheduleId && availableSchedules.length > 0 && (() => {
                        const selectedSchedule = availableSchedules.find(
                          s => (s._id || s.id)?.toString() === selectedExistingScheduleId
                        );
                        
                        if (!selectedSchedule) return null;
                        
                        const scheduleDate = selectedSchedule.date 
                          ? new Date(selectedSchedule.date).toLocaleDateString('vi-VN')
                          : 'N/A';
                        
                        return (
                          <Card className="mt-3 bg-success-25 border border-success-200 rounded-12" style={{ borderLeft: '4px solid #4CAF50' }}>
                            <Card.Header className="bg-success-50 border-0 rounded-top-12 p-16">
                              <h5 className="mb-0 text-neutral-900 fw-semibold">
                                <i className="fas fa-check-circle text-success me-2"></i>
                                Thông tin buổi học bù đã chọn
                              </h5>
                            </Card.Header>
                            <Card.Body className="p-20">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Buổi học:</strong> 
                                    <span className="text-neutral-700 ms-2">
                                      {selectedSchedule.session?.title || 'N/A'}
                                      {selectedSchedule.session?.order !== null && selectedSchedule.session?.order !== undefined && (
                                        <span className="text-neutral-500 ms-1">(STT: {selectedSchedule.session.order})</span>
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Lớp:</strong> 
                                    <span className="text-neutral-700 ms-2">{selectedSchedule.class?.name || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Ngày học:</strong> 
                                    <span className="text-neutral-700 ms-2">{scheduleDate}</span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Thời gian:</strong> 
                                    <span className="text-neutral-700 ms-2">
                                      {selectedSchedule.startTime || 'N/A'} - {selectedSchedule.endTime || 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="text-14">
                                    <strong className="text-neutral-900">Phòng:</strong> 
                                    <span className="text-neutral-700 ms-2">{selectedSchedule.room?.room_name || 'N/A'}</span>
                                  </div>
                                </div>
                                {selectedSchedule.class?.course?.name && (
                                  <div className="col-md-6">
                                    <div className="text-14">
                                      <strong className="text-neutral-900">Khóa học:</strong> 
                                      <span className="text-neutral-700 ms-2">{selectedSchedule.class.course.name}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </Card.Body>
                          </Card>
                        );
                      })()}
                    </>
                  ) : (
                    <Alert variant="info">
                      <i className="fas fa-info-circle me-2"></i>
                      Không có buổi học bù phù hợp. Vui lòng tạo buổi học bù mới.
                    </Alert>
                  )}
                </div>
              ) : (
                <>
                  {/* Form fields for new makeup class */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Ngày học bù <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Giờ bắt đầu <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="col-md-4">
                      <Form.Group>
                        <Form.Label>
                          Giờ kết thúc <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>
                          Phòng học <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="room"
                          value={formData.room}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn phòng học</option>
                          {rooms.map(room => (
                            <option key={room._id || room.id} value={room._id || room.id}>
                              {room.room_name || room.name} {room.location ? `(${room.location})` : ''}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>

                    <div className="col-md-6">
                      <Form.Group>
                        <Form.Label>
                          Giáo viên <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                          name="teacher"
                          value={formData.teacher}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn giáo viên</option>
                          {teachers.map(teacher => (
                            <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                              {teacher.username || teacher.fullName || teacher.name || 'N/A'}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  {validating && (
                    <Alert variant="info" className="mb-0">
                      <i className="fas fa-spinner fa-spin me-2"></i>
                      Đang kiểm tra xung đột lịch học...
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top p-24">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant={requestType === 'replace_teacher' ? 'info' : 'warning'}
            type="submit" 
            disabled={
              loading || 
              validating || 
              (requestType === 'replace_teacher' && !selectedSubstituteTeacherId) ||
              (requestType === 'makeup_class' && makeupOption === 'new' && conflicts && conflicts.hasConflict) ||
              (requestType === 'makeup_class' && makeupOption === 'existing' && !selectedExistingScheduleId)
            }
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                {requestType === 'replace_teacher' 
                  ? 'Xác nhận chọn giáo viên dạy thay'
                  : makeupOption === 'existing' 
                    ? 'Xác nhận chọn buổi học bù' 
                    : 'Tạo buổi học bù'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MakeupClassModalForAcademicStaff;

