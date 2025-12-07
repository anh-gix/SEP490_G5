import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import studentService from '../../services/studentService';

const SelectStudentModal = ({ show, onClose, onConfirm, initialSelectedStudents = [], generatedSessions = [] }) => {
  const [students, setStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState(initialSelectedStudents);
  const [studentSchedules, setStudentSchedules] = useState({}); // Map studentId -> schedules

  // Update selected students when initialSelectedStudents changes
  useEffect(() => {
    if (show) {
      setSelectedStudents(initialSelectedStudents);
      setStudentSearchTerm('');
    }
  }, [show, initialSelectedStudents]);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!show) return;
      
      try {
        setStudentsLoading(true);
        setStudentsError(null);
        console.log(' Fetching students in SelectStudentModal...');
        const response = await studentService.getAllStudents();
        console.log(' Students API Response:', response);
        
        if (response && (response.students || response.data)) {
          const fetchedStudents = response.students || response.data || [];
          console.log(' Fetched students count:', fetchedStudents.length);
          setStudents(fetchedStudents);
        } else {
          console.warn(' API response không có students hoặc data field:', response);
          setStudents([]);
          setStudentsError('Không tìm thấy dữ liệu học viên');
        }
      } catch (error) {
        console.error(' Lỗi khi fetch students:', error);
        setStudents([]);
        const errorMessage = error.message || 'Không thể tải danh sách học viên';
        setStudentsError(errorMessage);
        console.error(' Error details:', error);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [show]);

  // Fetch student schedules for conflict checking
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (!show || !generatedSessions.length || !selectedStudents.length) {
        setStudentSchedules({});
        return;
      }

      const schedulesMap = {};
      
      // Get date range from generated sessions
      const sessionDates = generatedSessions.map(s => s.date).sort();
      const minDate = sessionDates[0];
      const maxDate = sessionDates[sessionDates.length - 1];
      
      // Fetch schedules for each selected student
      await Promise.all(
        selectedStudents.map(async (studentId) => {
          if (!studentId) return;

          try {
            const response = await studentService.getStudentSchedule(studentId, {
              startDate: minDate,
              endDate: maxDate
            });
            
            if (response && response.schedules) {
              schedulesMap[String(studentId)] = response.schedules;
            } else if (response && response.data) {
              schedulesMap[String(studentId)] = response.data;
            } else {
              schedulesMap[String(studentId)] = [];
            }
          } catch (error) {
            console.error(`Error fetching schedule for student ${studentId}:`, error);
            schedulesMap[String(studentId)] = [];
          }
        })
      );

      setStudentSchedules(schedulesMap);
    };

    fetchStudentSchedules();
  }, [show, selectedStudents, generatedSessions]);

  // Helper functions for conflict checking
  const parseTime = (time) => {
    if (!time) return null;
    return time.length === 5 ? time : time.slice(0, 5);
  };

  const hasTimeOverlap = (startA, endA, startB, endB) => {
    if (!startA || !endA || !startB || !endB) return false;
    
    // Chuyển đổi thời gian từ string "HH:MM" sang phút để so sánh chính xác
    const timeToMinutes = (timeStr) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      if (parts.length !== 2) return 0;
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      return hours * 60 + minutes;
    };
    
    const startAMin = timeToMinutes(startA);
    const endAMin = timeToMinutes(endA);
    const startBMin = timeToMinutes(startB);
    const endBMin = timeToMinutes(endB);
    
    // Hai khoảng thời gian overlap nếu: startA < endB VÀ endA > startB
    // Lưu ý: Nếu một lớp kết thúc đúng lúc lớp kia bắt đầu (ví dụ: 08:00-10:00 và 10:00-12:00)
    // thì KHÔNG có overlap vì sử dụng > và < (không có =)
    return startAMin < endBMin && endAMin > startBMin;
  };

  // Calculate conflicting student IDs with details
  const conflictingStudentIds = useMemo(() => {
    if (!generatedSessions.length || Object.keys(studentSchedules).length === 0) {
      return new Map();
    }

    const conflicts = new Map(); // Map<studentId, Array<conflictDetails>>

    // Check each student's schedules
    Object.entries(studentSchedules).forEach(([studentId, schedules]) => {
      if (!schedules || schedules.length === 0) return;

      const studentConflicts = [];

      // Check each generated session against student's schedules
      generatedSessions.forEach((session) => {
        const sessionDate = session.date;
        const sessionStart = parseTime(session.startTime);
        const sessionEnd = parseTime(session.endTime);

        schedules.forEach((schedule) => {
          // Get schedule date - handle different response formats
          const scheduleDate = schedule.date || schedule.scheduleDate || schedule.classDate || schedule.classSchedule?.date;
          if (!scheduleDate) return;

          // Format schedule date to YYYY-MM-DD for comparison
          const scheduleDateStr = new Date(scheduleDate).toISOString().split('T')[0];

          // Check if dates match
          if (scheduleDateStr !== sessionDate) {
            return;
          }

          // Check time overlap - handle different response formats
          const scheduleStart = parseTime(
            schedule.startTime ||
            schedule.start_time ||
            schedule.time?.start ||
            schedule.classSchedule?.startTime ||
            schedule.startHour
          );
          const scheduleEnd = parseTime(
            schedule.endTime ||
            schedule.end_time ||
            schedule.time?.end ||
            schedule.classSchedule?.endTime ||
            schedule.endHour
          );

          if (!scheduleStart || !scheduleEnd) return;

          const hasTimeConflict = hasTimeOverlap(sessionStart, sessionEnd, scheduleStart, scheduleEnd);

          if (hasTimeConflict) {
            // Get class name - handle different response formats
            const className = 
              schedule.className || 
              schedule.class?.name || 
              schedule.classSchedule?.class?.name ||
              'N/A';
            
            // Format date for display
            const displayDate = new Date(scheduleDateStr).toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            const conflictDetail = {
              className,
              date: displayDate,
              dateRaw: scheduleDateStr,
              time: `${scheduleStart} - ${scheduleEnd}`,
              newClassTime: `${sessionStart} - ${sessionEnd}`
            };

            studentConflicts.push(conflictDetail);
          }
        });
      });

      if (studentConflicts.length > 0) {
        conflicts.set(studentId, studentConflicts);
      }
    });

    return conflicts;
  }, [generatedSessions, studentSchedules]);

  const filteredStudentList = useMemo(() => {
    if (!studentSearchTerm) {
      return students;
    }

    const searchLower = studentSearchTerm.toLowerCase();
    return students.filter(student => {
      const fullName = (student.fullName || '').toLowerCase();
      const email = (student.email || '').toLowerCase();
      const username = (student.username || '').toLowerCase();
      
      return fullName.includes(searchLower) || 
             email.includes(searchLower) || 
             username.includes(searchLower);
    });
  }, [students, studentSearchTerm]);

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      const isSelected = prev.includes(studentId);
      if (isSelected) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    const filteredStudents = filteredStudentList;
    const allSelected = filteredStudents.every(student => {
      const studentId = student._id || student.id;
      return selectedStudents.includes(studentId);
    });

    if (allSelected) {
      // Deselect all filtered students
      const filteredIds = filteredStudents.map(student => student._id || student.id);
      setSelectedStudents(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered students
      const filteredIds = filteredStudents.map(student => student._id || student.id);
      setSelectedStudents(prev => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedStudents);
    onClose();
  };

  const handleCancel = () => {
    setSelectedStudents(initialSelectedStudents);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-main-600 text-white border-0 p-24">
        <Modal.Title className="fw-bold">
          <i className="fas fa-user-plus me-2"></i>
          Chọn học viên
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-24" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="mb-16">
          <div className="d-flex justify-content-between align-items-center mb-12">
            <Form.Label className="text-neutral-700 fw-medium mb-0">
              Tìm kiếm và chọn học viên
            </Form.Label>
            <div className="d-flex align-items-center gap-12">
              {selectedStudents.length > 0 && (
                <span className="badge bg-main-600 text-white px-12 py-6 radius-8">
                  Đã chọn: {selectedStudents.length}
                </span>
              )}
              {filteredStudentList.length > 0 && (
                <Button
                  type="button"
                  variant="outline-primary"
                  size="sm"
                  onClick={handleSelectAllStudents}
                  className="text-13 fw-medium px-12 py-6 radius-8"
                >
                  {filteredStudentList.every(student => {
                    const studentId = student._id || student.id;
                    return selectedStudents.includes(studentId);
                  }) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </Button>
              )}
            </div>
          </div>

          <Form.Control
            type="text"
            placeholder="Tìm kiếm học viên theo tên, email hoặc username..."
            value={studentSearchTerm}
            onChange={(e) => setStudentSearchTerm(e.target.value)}
            className="border-neutral-30 radius-8 px-16 py-10 mb-12"
          />

          <div 
            className="border border-neutral-100 rounded-12 p-16"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            {studentsLoading ? (
              <div className="text-center text-neutral-500 py-20">
                <i className="fas fa-spinner fa-spin me-2"></i>
                Đang tải danh sách học viên...
              </div>
            ) : studentsError ? (
              <div className="text-center py-20">
                <Alert variant="warning" className="mb-0">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {studentsError}
                </Alert>
              </div>
            ) : filteredStudentList.length === 0 ? (
              <div className="text-center text-neutral-500 py-20">
                {studentSearchTerm ? 'Không tìm thấy học viên nào phù hợp với từ khóa tìm kiếm' : 'Không có học viên nào trong hệ thống'}
              </div>
            ) : (
              <div className="d-flex flex-column gap-8">
                {filteredStudentList.map(student => {
                  const studentId = student._id || student.id;
                  const isSelected = selectedStudents.includes(studentId);
                  const displayName = student.fullName || student.name || student.username || student.email || 'N/A';
                  const email = student.email || 'N/A';
                  const username = student.username || 'N/A';
                  const studentConflicts = isSelected ? conflictingStudentIds.get(String(studentId)) : null;
                  const hasConflict = !!studentConflicts;
                  
                  return (
                    <div
                      key={studentId}
                      className={`d-flex align-items-center p-12 rounded-8 border cursor-pointer transition-2 ${
                        hasConflict
                          ? 'bg-danger-50 border-danger-600'
                          : isSelected 
                          ? 'bg-main-50 border-main-200' 
                          : 'bg-white border-neutral-100 hover:bg-neutral-25'
                      }`}
                      onClick={() => handleStudentToggle(studentId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStudentToggle(studentId)}
                        className="me-12"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-8">
                          <div className="fw-medium text-neutral-900 text-14">
                            {displayName}
                          </div>
                          {hasConflict && (
                            <span 
                              className="badge bg-danger-600 text-white px-8 py-4 radius-4 text-11 fw-semibold"
                              title="Học viên này có lịch học trùng giờ với lớp đang tạo"
                            >
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Trùng giờ
                            </span>
                          )}
                        </div>
                        <div className={`text-12 ${hasConflict ? 'text-danger-700' : 'text-neutral-500'}`}>
                          {email} • {username}
                          {hasConflict && studentConflicts && (
                            <div className="text-danger-600 text-11 mt-4">
                              <i className="fas fa-info-circle me-1"></i>
                              <strong>Trùng giờ với:</strong>
                              <div className="mt-2 ms-12">
                                {studentConflicts.map((conflict, idx) => (
                                  <div key={idx} className="mb-2">
                                    • <strong>{conflict.className}</strong> - {conflict.date} ({conflict.time})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {conflictingStudentIds.size > 0 && (
          <Alert variant="warning" className="mt-16 mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <strong>Cảnh báo:</strong> Có {conflictingStudentIds.size} học viên đã chọn bị trùng giờ học với lớp đang tạo (xem chi tiết trong danh sách bên trên).
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-neutral-25 border-0 p-20">
        <Button 
          className="btn-outline-neutral text-15 fw-medium px-20 py-10 radius-8"
          onClick={handleCancel}
        >
          <i className="fas fa-times me-2"></i> Hủy
        </Button>
        <Button 
          className="btn-main text-15 fw-semibold px-24 py-10 radius-8"
          onClick={handleConfirm}
        >
          <i className="fas fa-check me-2"></i> Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectStudentModal;

