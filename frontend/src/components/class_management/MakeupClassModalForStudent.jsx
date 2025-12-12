import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import { classScheduleService } from '../../services/classScheduleService';
import roomService from '../../services/roomService';
import teacherService from '../../services/teacherService';
import studentScheduleService from '../../services/studentScheduleService';

const MakeupClassModalForStudent = ({ 
  show,
  originalSchedule, 
  studentId,
  onClose, 
  onSubmit,
  loading = false,
  studentSchedule = [] // Pass current student schedule to check conflicts
}) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: originalSchedule?.startTime || '',
    endTime: originalSchedule?.endTime || '',
    room: '',
    teacher: '',
    reason: ''
  });
  
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [validating, setValidating] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [error, setError] = useState(null);
  
  // New states for existing schedule selection
  const [makeupOption, setMakeupOption] = useState('existing'); // 'new' or 'existing' - default to 'existing'
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedExistingScheduleId, setSelectedExistingScheduleId] = useState('');
  const [sessionId, setSessionId] = useState(null); // Store sessionId from ClassSchedule
  const [currentClassScheduleId, setCurrentClassScheduleId] = useState(null); // Store current ClassSchedule ID to exclude

  // Load rooms and teachers on mount
  useEffect(() => {
    if (show) {
      fetchRooms();
      fetchTeachers();
      // Reset form when modal opens
      if (originalSchedule) {
        // Log session information
        console.log(' Buổi học được chọn:', {
          scheduleId: originalSchedule.id,
          studentScheduleId: originalSchedule.studentScheduleId,
          className: originalSchedule.className,
          date: originalSchedule.date,
          startTime: originalSchedule.startTime,
          endTime: originalSchedule.endTime,
          lessonNumber: originalSchedule.lessonNumber,
          sessionOrder: originalSchedule.sessionOrder,
          lessonTopic: originalSchedule.lessonTopic,
          fullSchedule: originalSchedule
        });
        
        // Fetch và log thông tin ClassSchedule đầy đủ
        if (originalSchedule.studentScheduleId) {
          fetchAndLogClassSchedule(originalSchedule.studentScheduleId);
        }
        
        setFormData({
          date: '',
          startTime: originalSchedule.startTime || '',
          endTime: originalSchedule.endTime || '',
          room: '',
          teacher: originalSchedule.teacherId || '',
          reason: ''
        });
        setConflicts(null);
        setError(null);
        setMakeupOption('existing'); // Default to 'existing'
        setSelectedExistingScheduleId('');
        setAvailableSchedules([]);
        setSessionId(null);
        setCurrentClassScheduleId(null);
      }
    }
  }, [show, originalSchedule]);

  // Fetch available schedules when option is 'existing' and sessionId is available
  useEffect(() => {
    if (show && makeupOption === 'existing' && originalSchedule) {
      // Nếu đã có sessionId, fetch ngay
      // Nếu chưa có, fetchAvailableSchedules sẽ tự fetch ClassSchedule để lấy sessionId
      fetchAvailableSchedules();
    }
  }, [show, makeupOption, originalSchedule, sessionId]);

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

  const fetchAndLogClassSchedule = async (studentScheduleId) => {
    try {
      console.log(' Đang lấy thông tin ClassSchedule từ studentScheduleId:', studentScheduleId);
      const response = await studentScheduleService.getClassScheduleByStudentScheduleId(studentScheduleId);
      
      if (response.success && response.classSchedule) {
        const classSchedule = response.classSchedule;
        const sessionId = classSchedule.session?._id;
        
        console.log(' Thông tin ClassSchedule được chọn:', {
          classScheduleId: classSchedule._id,
          date: classSchedule.date,
          startTime: classSchedule.startTime,
          endTime: classSchedule.endTime,
          status: classSchedule.status,
          topic: classSchedule.topic,
          class: classSchedule.class ? {
            _id: classSchedule.class._id,
            name: classSchedule.class.name,
            subject: classSchedule.class.subject,
            course: classSchedule.class.course,
            teacherId: classSchedule.class.teacherId
          } : null,
          room: classSchedule.room ? {
            _id: classSchedule.room._id,
            room_name: classSchedule.room.room_name,
            location: classSchedule.room.location,
            capacity: classSchedule.room.capacity
          } : null,
          session: classSchedule.session ? {
            _id: classSchedule.session._id,
            title: classSchedule.session.title,
            order: classSchedule.session.order,
            description: classSchedule.session.description
          } : null,
          teacher: classSchedule.teacher,
          createdBy: classSchedule.createdBy,
          fullClassSchedule: classSchedule
        });

        // Lưu sessionId và classScheduleId để dùng cho fetchAvailableSchedules
        if (sessionId) {
          setSessionId(sessionId);
          setCurrentClassScheduleId(classSchedule._id);
          // Lấy danh sách các ClassSchedule có cùng session id
          await fetchAndLogClassSchedulesBySessionId(sessionId, classSchedule._id);
        } else {
          console.warn(' ClassSchedule không có session id');
        }
      } else {
        console.warn(' Không tìm thấy ClassSchedule cho studentScheduleId:', studentScheduleId);
      }
    } catch (err) {
      console.error(' Lỗi khi lấy ClassSchedule:', err);
    }
  };

  const fetchAndLogClassSchedulesBySessionId = async (sessionId, excludeClassScheduleId = null) => {
    try {
      console.log(' Đang lấy danh sách ClassSchedule có cùng session id:', sessionId);
      
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
        
        // Filter để loại bỏ ClassSchedule hiện tại nếu có
        const filteredSchedules = excludeClassScheduleId
          ? classSchedules.filter(s => (s._id || s.id)?.toString() !== excludeClassScheduleId.toString())
          : classSchedules;

        console.log(' Danh sách các ClassSchedule có cùng session id:', {
          sessionId: sessionId,
          total: filteredSchedules.length,
          schedules: filteredSchedules.map(schedule => ({
            classScheduleId: schedule._id || schedule.id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            status: schedule.status,
            className: schedule.class?.name || 'N/A',
            roomName: schedule.room?.room_name || 'N/A',
            teacherName: schedule.teacher?.username || schedule.class?.teacherId?.username || 'N/A',
            sessionTitle: schedule.session?.title || 'N/A',
            sessionOrder: schedule.session?.order || null
          })),
          fullSchedules: filteredSchedules
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(' Lỗi khi lấy danh sách ClassSchedule:', response.status, errorData);
      }
    } catch (error) {
      console.error(' Lỗi khi lấy danh sách ClassSchedule có cùng session id:', error);
    }
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

  // Helper function to format date to YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to check if a schedule conflicts with student's current schedule
  const hasConflictWithStudentSchedule = (schedule) => {
    if (!studentSchedule || studentSchedule.length === 0) {
      return false; // No student schedule, no conflict
    }

    if (!schedule.date || !schedule.startTime || !schedule.endTime) {
      return false; // Invalid schedule data
    }

    const scheduleDate = formatDateToYYYYMMDD(schedule.date);
    
    // Find student schedules on the same date
    const studentSchedulesSameDate = studentSchedule.filter(sch => {
      if (!sch.date || !sch.startTime || !sch.endTime) {
        return false;
      }
      const schDate = formatDateToYYYYMMDD(sch.date);
      return schDate === scheduleDate;
    });

    // Check for time overlap
    for (const studentSch of studentSchedulesSameDate) {
      // Skip cancelled or rescheduled schedules (they don't count as conflicts)
      if (studentSch.scheduleStatus === 'cancelled' || studentSch.scheduleStatus === 'rescheduled') {
        continue;
      }
      
      if (hasTimeOverlap(
        schedule.startTime,
        schedule.endTime,
        studentSch.startTime,
        studentSch.endTime
      )) {
        return true; // Has conflict
      }
    }

    return false; // No conflict
  };

  const fetchAvailableSchedules = async () => {
    if (!originalSchedule) return;
    
    try {
      setLoadingSchedules(true);
      
      // Ưu tiên sử dụng sessionId nếu đã có (từ fetchAndLogClassSchedule)
      // Nếu chưa có, thử lấy từ originalSchedule hoặc fetch lại
      let sessionIdToUse = sessionId;
      
      if (!sessionIdToUse && originalSchedule.studentScheduleId) {
        // Nếu chưa có sessionId, fetch ClassSchedule để lấy sessionId
        try {
          const response = await studentScheduleService.getClassScheduleByStudentScheduleId(
            originalSchedule.studentScheduleId
          );
          if (response.success && response.classSchedule?.session?._id) {
            sessionIdToUse = response.classSchedule.session._id;
            setSessionId(sessionIdToUse);
            setCurrentClassScheduleId(response.classSchedule._id);
          }
        } catch (err) {
          console.error('Error fetching ClassSchedule for sessionId:', err);
        }
      }
      
      // Fallback: thử dùng sessionOrder nếu không có sessionId
      if (!sessionIdToUse) {
        const sessionOrder = originalSchedule.lessonNumber || originalSchedule.sessionOrder;
        if (!sessionOrder) {
          console.warn(' Không có sessionId hoặc sessionOrder');
          setAvailableSchedules([]);
          return;
        }
        
        // Sử dụng sessionOrder
        const apiPort = import.meta.env.VITE_API_PORT || 8080;
        const today = new Date().toISOString();
        const response = await fetch(
          `http://localhost:${apiPort}/api/class-schedules/by-session?sessionOrder=${sessionOrder}&dateAfter=${today}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const filtered = (data.classSchedules || []).filter(schedule => {
            const scheduleId = (schedule._id || schedule.id)?.toString();
            // Bỏ qua buổi học hiện tại nếu có
            if (currentClassScheduleId && scheduleId === currentClassScheduleId.toString()) {
              return false;
            }
            // Check conflict với lịch học hiện tại của học viên
            if (hasConflictWithStudentSchedule(schedule)) {
              return false;
            }
            return true;
          });
          setAvailableSchedules(filtered);
        } else {
          setAvailableSchedules([]);
        }
        return;
      }

      // Sử dụng sessionId (ưu tiên)
      const apiPort = import.meta.env.VITE_API_PORT || 8080;
      const today = new Date().toISOString();
      const response = await fetch(
        `http://localhost:${apiPort}/api/class-schedules/by-session?sessionId=${sessionIdToUse}&dateAfter=${today}`,
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
        
        // Filter để loại bỏ ClassSchedule hiện tại và các buổi học có conflict với lịch học của học viên
        const filtered = classSchedules.filter(schedule => {
          const scheduleId = (schedule._id || schedule.id)?.toString();
          // Bỏ qua buổi học hiện tại nếu có
          if (currentClassScheduleId && scheduleId === currentClassScheduleId.toString()) {
            return false;
          }
          // Check conflict với lịch học hiện tại của học viên
          if (hasConflictWithStudentSchedule(schedule)) {
            return false;
          }
          return true;
        });
        
        console.log(' Đã load danh sách buổi học có sẵn (đã filter conflict):', {
          sessionId: sessionIdToUse,
          total: filtered.length,
          totalBeforeFilter: classSchedules.length,
          schedules: filtered
        });
        
        setAvailableSchedules(filtered);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error(' Lỗi khi lấy danh sách ClassSchedule:', response.status, errorData);
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
    // Clear conflicts when form changes
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

    if (makeupOption === 'existing') {
      // Chọn buổi có sẵn
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

      // Validate conflict với học viên (optional, có thể cho phép chọn dù có conflict)
      try {
        const validateResponse = await classScheduleService.validateMakeupClassSchedule(
          selectedExistingScheduleId,
          studentId
        );

        if (validateResponse.success && validateResponse.hasConflict) {
          if (!window.confirm('Có xung đột lịch học. Bạn có chắc chắn muốn tiếp tục?')) {
            return;
          }
        }
      } catch (err) {
        console.error('Error validating:', err);
        // Vẫn cho phép submit nếu validate lỗi
      }

      // Submit với thông tin buổi học có sẵn
      onSubmit({
        existingScheduleId: selectedExistingScheduleId,
        originalSchedule: originalSchedule
      });
    } else {
      // Tạo buổi học bù mới
      // Validate required fields
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.teacher) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      // Validate conflict
      const isValid = await validateConflict();
      if (!isValid) {
        // conflicts đã được set trong validateConflict()
        // Hiển thị error message với chi tiết conflict
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

      // Submit
      onSubmit({
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        teacher: formData.teacher,
        reason: formData.reason || 'Buổi học bù',
        originalSchedule: originalSchedule
      });
    }
  };

  // Get teacher name from ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => (t._id || t.id)?.toString() === teacherId?.toString());
    return teacher ? (teacher.username || teacher.fullName || teacher.name || 'N/A') : 'N/A';
  };

  // Get room name from ID
  const getRoomName = (roomId) => {
    const room = rooms.find(r => (r._id || r.id)?.toString() === roomId?.toString());
    return room ? (room.room_name || room.name || 'N/A') : 'N/A';
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-warning text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-calendar-plus me-2"></i>
          Xếp buổi học bù
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-24" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Original schedule info */}
          {originalSchedule && (
            <Card className="mb-20 bg-warning-25 border border-warning-200 rounded-12" style={{ borderLeft: '4px solid #FF9800' }}>
              <Card.Header className="bg-warning-50 border-0 rounded-top-12 p-16">
                <h5 className="mb-0 text-neutral-900 fw-semibold">Thông tin buổi học gốc</h5>
              </Card.Header>
              <Card.Body className="p-20">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Lớp:</strong> 
                      <span className="text-neutral-700 ms-2">{originalSchedule.className || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Ngày học:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {originalSchedule.date ? new Date(originalSchedule.date).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Thời gian:</strong> 
                      <span className="text-neutral-700 ms-2">
                        {originalSchedule.startTime || 'N/A'} - {originalSchedule.endTime || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="text-14">
                      <strong className="text-neutral-900">Phòng:</strong> 
                      <span className="text-neutral-700 ms-2">{originalSchedule.roomName || 'N/A'}</span>
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
              {conflicts.room && conflicts.room.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột phòng:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.room.map((conflict, idx) => (
                      <li key={idx}>
                        {conflict.roomName} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.teacher && conflicts.teacher.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột giáo viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.teacher.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {conflicts.students && conflicts.students.length > 0 && (
                <div className="mb-2">
                  <strong>Xung đột lịch học viên:</strong>
                  <ul className="mb-0 mt-1">
                    {conflicts.students.map((conflict, idx) => (
                      <li key={idx}>
                        Lớp {conflict.className} - {conflict.date} ({conflict.time})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Alert>
          )}

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
              ) : (
                <Alert variant="info">
                  <i className="fas fa-info-circle me-2"></i>
                  Không có buổi học bù phù hợp. Vui lòng tạo buổi học bù mới.
                </Alert>
              )}
              
              {/* Hiển thị thông tin chi tiết của buổi học bù đã chọn */}
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

              <Form.Group className="mb-3">
                <Form.Label>Lý do (tùy chọn)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Nhập lý do học bù..."
                />
              </Form.Group>

              {validating && (
                <Alert variant="info" className="mb-0">
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang kiểm tra xung đột lịch học...
                </Alert>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top p-24">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            variant="warning" 
            type="submit" 
            disabled={
              loading || 
              validating || 
              (makeupOption === 'new' && conflicts && conflicts.hasConflict) ||
              (makeupOption === 'existing' && !selectedExistingScheduleId)
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
                {makeupOption === 'existing' ? 'Xác nhận chọn buổi học bù' : 'Tạo buổi học bù'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MakeupClassModalForStudent;

