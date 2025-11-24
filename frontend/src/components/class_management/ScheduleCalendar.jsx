import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Badge, Dropdown, Modal, Form, Spinner } from 'react-bootstrap';
import { formatDateToYYYYMMDD } from '../../helper/helper';
import { classScheduleService } from '../../services/classScheduleService';

const ScheduleCalendar = ({ schedules, onEditSchedule, onDeleteSchedule, onCreateMakeup, classService, studentSchedule = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [classesWithSameCourse, setClassesWithSameCourse] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClassInfo, setSelectedClassInfo] = useState(null);
  const [loadingClassInfo, setLoadingClassInfo] = useState(false);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayIndex = firstDay.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    const lastDayIndex = lastDay.getDay();
    
    // Điều chỉnh để bắt đầu từ Thứ 2 (1) thay vì Chủ nhật (0)
    // Nếu firstDay là Chủ nhật (0), cần thêm 1 ngày để thành Thứ 2
    // Nếu firstDay là Thứ 2 (1), không cần thêm
    // Nếu firstDay là Thứ 3-7 (2-6), cần lùi về Thứ 2
    const adjustedFirstDayIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Chủ nhật (0) -> 6, Thứ 2 (1) -> 0, Thứ 3 (2) -> 1, ...
    const adjustedLastDayIndex = lastDayIndex === 0 ? 6 : lastDayIndex - 1;
    const nextDays = 7 - adjustedLastDayIndex - 1;
    
    const days = [];
    
    // Previous month days - bắt đầu từ Thứ 2
    for (let i = adjustedFirstDayIndex; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevLastDay.getDate() - i + 1),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, [currentDate]);

  // Get schedules for a specific date
  const getSchedulesForDate = (date) => {
    // Use helper to format date correctly (avoid timezone issues)
    const dateStr = formatDateToYYYYMMDD(date);
    return schedules.filter(s => s.date === dateStr);
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month/year
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Hàm kiểm tra xung đột thời gian
  const hasTimeOverlap = (start1, end1, start2, end2) => {
    // Chuyển đổi thời gian sang phút để so sánh
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);
    
    return start1Min < end2Min && end1Min > start2Min;
  };

  // Hàm kiểm tra xung đột giữa lịch học sinh và lịch lớp
  const hasScheduleConflict = async (classId) => {
    if (!studentSchedule || studentSchedule.length === 0) {
      return false; // Không có lịch học sinh thì không có xung đột
    }

    try {
      // Lấy lịch học của lớp
      const response = await classScheduleService.getSchedulesByClass(classId);
      
      // API có thể trả về array trực tiếp hoặc object với message
      let classSchedules = Array.isArray(response) ? response : (response.schedules || []);
      
      if (!classSchedules || classSchedules.length === 0) {
        return false; // Lớp không có lịch thì không có xung đột
      }

      // Kiểm tra từng lịch của lớp với lịch của học sinh
      for (const classSchedule of classSchedules) {
        if (!classSchedule.date || !classSchedule.startTime || !classSchedule.endTime) {
          continue; // Bỏ qua schedule không hợp lệ
        }

        const classDate = new Date(classSchedule.date);
        const classDateStr = formatDateToYYYYMMDD(classDate);
        
        // Tìm các lịch học sinh cùng ngày
        const studentSchedulesSameDate = studentSchedule.filter(sch => {
          if (!sch.date || !sch.startTime || !sch.endTime) {
            return false;
          }
          const schDate = new Date(sch.date);
          const schDateStr = formatDateToYYYYMMDD(schDate);
          return schDateStr === classDateStr;
        });

        // Kiểm tra xung đột thời gian
        for (const studentSch of studentSchedulesSameDate) {
          if (hasTimeOverlap(
            classSchedule.startTime,
            classSchedule.endTime,
            studentSch.startTime,
            studentSch.endTime
          )) {
            return true; // Có xung đột
          }
        }
      }

      return false; // Không có xung đột
    } catch (err) {
      console.error('Error checking schedule conflict:', err);
      // Nếu có lỗi (ví dụ: lớp không tồn tại), giữ nguyên lớp trong danh sách để tránh loại bỏ nhầm
      return false;
    }
  };

  // Hàm để lấy danh sách lớp cùng course
  const fetchClassesByCourse = async (courseId, currentClassId) => {
    if (!courseId || !classService) return;
    
    try {
      setLoadingClasses(true);
      const response = await classService.getAllClasses({ courseId });
      if (response.success) {
        const classes = response.classes || [];
        // Lọc bỏ lớp hiện tại và chỉ lấy các lớp khác
        let otherClasses = classes.filter(cls => {
          const clsId = cls._id || cls;
          return clsId.toString() !== currentClassId?.toString();
        });

        // Lọc bỏ các lớp có xung đột với lịch học sinh
        if (studentSchedule && studentSchedule.length > 0) {
          const conflictChecks = await Promise.all(
            otherClasses.map(async (cls) => {
              const clsId = cls._id || cls;
              const hasConflict = await hasScheduleConflict(clsId);
              return { cls, hasConflict };
            })
          );

          // Chỉ giữ lại các lớp không có xung đột
          otherClasses = conflictChecks
            .filter(({ hasConflict }) => !hasConflict)
            .map(({ cls }) => cls);
        }

        setClassesWithSameCourse(otherClasses);
        // Reset selected class khi mở modal mới
        setSelectedClassId(null);
      }
    } catch (err) {
      console.error('Error fetching classes by course:', err);
      setClassesWithSameCourse([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Khi chọn schedule, lấy danh sách lớp cùng course
  useEffect(() => {
    if (selectedSchedule && selectedSchedule.courseId && selectedSchedule.classId) {
      fetchClassesByCourse(selectedSchedule.courseId, selectedSchedule.classId);
    } else {
      setClassesWithSameCourse([]);
      setSelectedClassId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSchedule, studentSchedule]);

  // Khi chọn lớp từ dropdown, lấy thông tin chi tiết của lớp đó
  useEffect(() => {
    const fetchSelectedClassInfo = async () => {
      if (!selectedClassId || !classService) {
        setSelectedClassInfo(null);
        return;
      }

      try {
        setLoadingClassInfo(true);
        const response = await classService.getClassById(selectedClassId);
        
        if (response.success && response.class) {
          const classData = response.class;
          
          // Tìm session hiện tại (session gần nhất)
          const schedules = classData.schedules || [];
          const now = new Date();
          const today = formatDateToYYYYMMDD(now);
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          
          // Sắp xếp schedules theo date và startTime
          const sortedSchedules = [...schedules].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            return (a.startTime || '').localeCompare(b.startTime || '');
          });

          // Tìm session đã học gần nhất hoặc session sắp học
          let currentSession = null;
          const pastSessions = sortedSchedules.filter(s => {
            const scheduleDate = formatDateToYYYYMMDD(new Date(s.date));
            if (scheduleDate < today) return true;
            if (scheduleDate === today && s.endTime && s.endTime < currentTime) return true;
            return false;
          });
          
          if (pastSessions.length > 0) {
            currentSession = pastSessions[pastSessions.length - 1];
          } else if (sortedSchedules.length > 0) {
            currentSession = sortedSchedules[0];
          }

          // Lấy thông tin phòng từ session hiện tại hoặc từ class
          const roomInfo = currentSession?.room || classData.room;
          
          setSelectedClassInfo({
            className: classData.name || 'N/A',
            courseName: classData.courseName || 'N/A',
            currentSession: currentSession ? {
              title: currentSession.session?.title || 'N/A',
              order: currentSession.session?.order || null,
              date: currentSession.date || null,
              startTime: currentSession.startTime || 'N/A',
              endTime: currentSession.endTime || 'N/A',
              roomName: currentSession.room?.room_name || classData.roomName || 'N/A',
              roomCapacity: currentSession.room?.capacity || classData.room?.capacity || null
            } : null,
            studentCount: classData.students?.length || 0,
            roomCapacity: roomInfo?.capacity || classData.room?.capacity || null
          });
        }
      } catch (err) {
        console.error('Error fetching class info:', err);
        setSelectedClassInfo(null);
      } finally {
        setLoadingClassInfo(false);
      }
    };

    fetchSelectedClassInfo();
  }, [selectedClassId, classService]);

  const getStatusColor = (schedule) => {
    // Ưu tiên kiểm tra timeStatus (cho EditClassModal)
    const timeStatus = schedule.timeStatus;
    
    if (timeStatus === 'completed') {
      return '#4CAF50'; // Màu xanh lá cho buổi đã kết thúc
    } else if (timeStatus === 'upcoming') {
      return '#757575'; // Màu xám cho buổi chưa bắt đầu
    }
    
    // Nếu không có timeStatus, kiểm tra attendance status (cho Student/Teacher management)
    const attendanceStatus = schedule.attendanceStatus;
    
    // Nếu đã điểm danh
    if (attendanceStatus) {
      if (attendanceStatus === 'present' || attendanceStatus === 'late') {
        return '#4CAF50'; // Màu xanh lá cho đi học
      } else if (attendanceStatus === 'absent') {
        return '#f44336'; // Màu đỏ cho vắng mặt
      } else if (attendanceStatus === 'excused') {
        return '#FF9800'; // Màu cam cho có phép
      }
    }
    
    // Chưa điểm danh (chưa học) - màu xám
    return '#757575';
  };

  return (
    <div>
      <Card>
        <Card.Header className="bg-white">
          {/* Calendar Header */}
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="outline-primary" size="sm" onClick={goToPreviousMonth}>
              <i className="fas fa-chevron-left"></i>
            </Button>
            <div className="text-center">
              <h5 className="mb-1">{formatMonthYear()}</h5>
              <Button variant="link" size="sm" onClick={goToToday}>Hôm nay</Button>
            </div>
            <Button variant="outline-primary" size="sm" onClick={goToNextMonth}>
              <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0 }}>
            {/* Weekday headers - bắt đầu từ Thứ 2 */}
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
              <div 
                key={day} 
                className="text-center fw-bold py-2 border-bottom bg-light"
                style={{ fontSize: '14px', color: '#6c757d' }}
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarData.map((dayData, index) => {
              const daySchedules = getSchedulesForDate(dayData.date);
              const isSelectedDate = selectedDate?.toDateString() === dayData.date.toDateString();
              
              return (
                <div
                  key={index}
                  className={`border p-2 ${!dayData.isCurrentMonth ? 'bg-light text-muted' : ''} ${
                    isToday(dayData.date) ? 'bg-primary bg-opacity-10' : ''
                  } ${isSelectedDate ? 'border-primary border-2' : ''}`}
                  style={{ 
                    minHeight: '100px', 
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedDate(dayData.date)}
                >
                  <div 
                    className={`fw-bold ${isToday(dayData.date) ? 'text-primary' : ''}`}
                    style={{ fontSize: '14px' }}
                  >
                    {dayData.date.getDate()}
                  </div>
                  
                  {daySchedules.length > 0 && (
                    <div className="mt-1 d-flex flex-column gap-1">
                      {daySchedules.slice(0, 3).map(schedule => {
                        const attendanceStatus = schedule.attendanceStatus;
                        const timeStatus = schedule.timeStatus;
                        const statusColor = getStatusColor(schedule);
                        const hasAttendance = !!attendanceStatus;
                        
                        // Màu nền khác nhau theo trạng thái
                        let backgroundColor = 'rgba(0,0,0,0.02)'; // Xám nhạt mặc định
                        
                        // Ưu tiên timeStatus (cho EditClassModal)
                        if (timeStatus === 'completed') {
                          backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho buổi đã kết thúc
                        } else if (timeStatus === 'upcoming') {
                          backgroundColor = 'rgba(0,0,0,0.02)'; // Xám nhạt cho buổi chưa bắt đầu
                        } else if (timeStatus === 'ongoing') {
                          // Buổi đang diễn ra, kiểm tra attendance
                          if (attendanceStatus === 'present' || attendanceStatus === 'late') {
                            backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho đi học
                          } else if (attendanceStatus === 'absent') {
                            backgroundColor = 'rgba(244, 67, 54, 0.1)'; // Đỏ nhạt cho vắng mặt
                          } else if (attendanceStatus === 'excused') {
                            backgroundColor = 'rgba(255, 152, 0, 0.1)'; // Cam nhạt cho có phép
                          }
                        } else {
                          // Không có timeStatus, kiểm tra attendance (cho Student/Teacher management)
                          if (attendanceStatus === 'present' || attendanceStatus === 'late') {
                            backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho đi học
                          } else if (attendanceStatus === 'absent') {
                            backgroundColor = 'rgba(244, 67, 54, 0.1)'; // Đỏ nhạt cho vắng mặt
                          } else if (attendanceStatus === 'excused') {
                            backgroundColor = 'rgba(255, 152, 0, 0.1)'; // Cam nhạt cho có phép
                          }
                        }
                        
                        // Tooltip text
                        let tooltipText = 'Buổi chưa học';
                        if (timeStatus === 'completed') {
                          tooltipText = 'Buổi đã kết thúc';
                        } else if (timeStatus === 'upcoming') {
                          tooltipText = 'Buổi chưa bắt đầu';
                        } else if (timeStatus === 'ongoing') {
                          tooltipText = 'Buổi đang diễn ra';
                        } else if (attendanceStatus === 'present') {
                          tooltipText = 'Đã đi học';
                        } else if (attendanceStatus === 'absent') {
                          tooltipText = 'Vắng mặt';
                        } else if (attendanceStatus === 'late') {
                          tooltipText = 'Đi muộn';
                        } else if (attendanceStatus === 'excused') {
                          tooltipText = 'Có phép';
                        }
                        
                        return (
                          <div
                            key={schedule.id}
                            className="p-1 rounded"
                            style={{ 
                              borderLeft: `3px solid ${statusColor}`,
                              background: backgroundColor,
                              fontSize: '10px',
                              cursor: 'pointer',
                              position: 'relative'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // Hiển thị modal với thông tin chi tiết
                              setSelectedSchedule(schedule);
                              setShowScheduleModal(true);
                            }}
                            title={tooltipText}
                          >
                            <div className="fw-bold d-flex align-items-center justify-content-between">
                              <span>{schedule.startTime}</span>
                              {(timeStatus || hasAttendance) && (
                                <i 
                                  className={`fas ${
                                    timeStatus === 'completed' ? 'fa-check-circle' :
                                    timeStatus === 'upcoming' ? 'fa-clock' :
                                    timeStatus === 'ongoing' ? 'fa-play-circle' :
                                    attendanceStatus === 'present' ? 'fa-check-circle' :
                                    attendanceStatus === 'absent' ? 'fa-times-circle' :
                                    attendanceStatus === 'late' ? 'fa-clock' :
                                    attendanceStatus === 'excused' ? 'fa-file-text' :
                                    'fa-clock'
                                  }`} 
                                  style={{ color: statusColor, fontSize: '8px' }}
                                ></i>
                              )}
                            </div>
                            <div className="text-truncate">{schedule.className}</div>
                          </div>
                        );
                      })}
                      {daySchedules.length > 3 && (
                        <div className="text-muted small">
                          +{daySchedules.length - 3} lịch khác
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      {/* Schedule Detail Modal */}
      <Modal show={showScheduleModal} onHide={() => {
        setShowScheduleModal(false);
        setSelectedSchedule(null);
        setClassesWithSameCourse([]);
        setSelectedClassId(null);
        setSelectedClassInfo(null);
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thông tin buổi học</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSchedule && (
            <div className="row g-3">
              <div className="col-md-6">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <small className="text-muted d-block mb-1">Tên lớp:</small>
                    <div className="fw-bold">{selectedSchedule.className || 'N/A'}</div>
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1">Tên khóa học:</small>
                    <div className="fw-bold">{selectedSchedule.courseName || 'N/A'}</div>
                  </div>
                  <div>
                    <small className="text-muted d-block mb-1">Thông tin session đang học:</small>
                    <div className="ps-3">
                      <div className="mb-2">
                        <span className="text-muted">Tên session: </span>
                        <span className="fw-semibold">{selectedSchedule.sessionName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted">Số thứ tự: </span>
                        <span className="fw-semibold">{selectedSchedule.sessionOrder || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {selectedSchedule.startTime && (
                    <div>
                      <small className="text-muted d-block mb-1">Thời gian:</small>
                      <div>
                        {selectedSchedule.date ? (
                          <>
                            {new Date(selectedSchedule.date).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })} ({new Date(selectedSchedule.date).toLocaleDateString('vi-VN', { weekday: 'short' })}) | {selectedSchedule.startTime} - {selectedSchedule.endTime}
                          </>
                        ) : (
                          `${selectedSchedule.startTime} - ${selectedSchedule.endTime}`
                        )}
                      </div>
                    </div>
                  )}
                  {selectedSchedule.roomName && (
                    <div>
                      <small className="text-muted d-block mb-1">Phòng:</small>
                      <div>{selectedSchedule.roomName}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex flex-column gap-3">
                  <div>
                    <small className="text-muted d-block mb-1">Các lớp cùng khóa học:</small>
                    {loadingClasses ? (
                      <div className="text-center py-12">
                        <Spinner animation="border" size="sm" />
                        <p className="text-neutral-600 mt-8 text-12">Đang tải...</p>
                      </div>
                    ) : classesWithSameCourse.length === 0 ? (
                      <div className="text-neutral-500 text-13">Không có lớp nào khác cùng khóa học</div>
                    ) : (
                      <div>
                        <Form.Select
                          value={selectedClassId || ''}
                          onChange={(e) => setSelectedClassId(e.target.value)}
                          className="border-neutral-200"
                          size="sm"
                        >
                          <option value="">-- Chọn lớp --</option>
                          {classesWithSameCourse.map((cls) => {
                            const clsId = cls._id || cls;
                            const clsName = cls.name || 'N/A';
                            return (
                              <option key={clsId} value={clsId}>
                                {clsName}
                              </option>
                            );
                          })}
                        </Form.Select>
                      </div>
                    )}
                  </div>
                  
                  {selectedClassId && (
                    <div className="d-flex flex-column gap-3">
                      {loadingClassInfo ? (
                        <div className="text-center py-12">
                          <Spinner animation="border" size="sm" />
                          <p className="text-neutral-600 mt-8 text-12">Đang tải thông tin lớp...</p>
                        </div>
                      ) : selectedClassInfo ? (
                        <>
                          <div>
                            <small className="text-muted d-block mb-1">Tên lớp:</small>
                            <div className="fw-bold">{selectedClassInfo.className || 'N/A'}</div>
                          </div>
                          <div>
                            <small className="text-muted d-block mb-1">Tên khóa học:</small>
                            <div className="fw-bold">{selectedClassInfo.courseName || 'N/A'}</div>
                          </div>
                          {selectedClassInfo.currentSession ? (
                            <>
                              <div>
                                <small className="text-muted d-block mb-1">Thông tin session đang học:</small>
                                <div className="ps-3">
                                  <div className="mb-2">
                                    <span className="text-muted">Tên session: </span>
                                    <span className="fw-semibold">{selectedClassInfo.currentSession.title || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted">Số thứ tự: </span>
                                    <span className="fw-semibold">{selectedClassInfo.currentSession.order !== null ? selectedClassInfo.currentSession.order : 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <small className="text-muted d-block mb-1">Thời gian:</small>
                                <div>
                                  {selectedClassInfo.currentSession.date ? (
                                    <>
                                      {new Date(selectedClassInfo.currentSession.date).toLocaleDateString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })} ({new Date(selectedClassInfo.currentSession.date).toLocaleDateString('vi-VN', { weekday: 'short' })}) | {selectedClassInfo.currentSession.startTime} - {selectedClassInfo.currentSession.endTime}
                                    </>
                                  ) : (
                                    `${selectedClassInfo.currentSession.startTime} - ${selectedClassInfo.currentSession.endTime}`
                                  )}
                                </div>
                              </div>
                              <div>
                                <small className="text-muted d-block mb-1">Phòng:</small>
                                <div>{selectedClassInfo.currentSession.roomName}</div>
                              </div>
                              {(selectedClassInfo.studentCount !== null || selectedClassInfo.currentSession.roomCapacity !== null) && (
                                <div>
                                  <small className="text-muted d-block mb-1">Số lượng học sinh:</small>
                                  <div>
                                    {selectedClassInfo.studentCount !== null ? selectedClassInfo.studentCount : 'N/A'}
                                    {selectedClassInfo.currentSession.roomCapacity !== null && (
                                      <span className="text-muted"> / {selectedClassInfo.currentSession.roomCapacity}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-neutral-500 text-13">Chưa có thông tin session</div>
                          )}
                        </>
                      ) : (
                        <div className="text-neutral-500 text-13">Không tìm thấy thông tin lớp</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowScheduleModal(false);
            setSelectedSchedule(null);
            setClassesWithSameCourse([]);
            setSelectedClassId(null);
          }}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ScheduleCalendar;
