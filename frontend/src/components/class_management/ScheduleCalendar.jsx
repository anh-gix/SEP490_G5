import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Dropdown } from 'react-bootstrap';
import { formatDateToYYYYMMDD } from '../../helper/helper';
import { classScheduleService } from '../../services/classScheduleService';

const ScheduleCalendar = ({ schedules, onEditSchedule, onDeleteSchedule, onCreateMakeup, onAssignSubstitute, classService, studentSchedule = [], readOnly = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Get color based on program type
  const getProgramTypeColor = (programType) => {
    if (!programType) return null;
    
    const colorMap = {
      'ielts': '#2196F3', // Xanh dương
      'toeic': '#4CAF50', // Xanh lá
      'cam': '#FF9800'    // Cam
    };
    
    return colorMap[programType.toLowerCase()] || null;
  };

  const getStatusColor = (schedule) => {
    // Kiểm tra buổi của lớp cũ (khi đổi lớp)
    if (schedule.isOldClassSchedule) {
      return '#9C27B0'; // Màu tím cho buổi lớp cũ
    }
    
    // Kiểm tra buổi của lớp mới (khi đổi lớp)
    if (schedule.isNewClassSchedule) {
      return '#2196F3'; // Màu xanh dương cho buổi lớp mới
    }
    
    // Kiểm tra buổi bị hủy (cancelled)
    if (schedule.isCancelled || schedule.scheduleStatus === 'cancelled') {
      return '#f44336'; // Màu đỏ cho buổi bị hủy
    }
    
    // Kiểm tra buổi nghỉ (absent)
    if (schedule.isAbsentSchedule || schedule.status === 'absent') {
      return '#f44336'; // Màu đỏ cho buổi nghỉ
    }
    
    // Kiểm tra buổi học bù (makeup/rescheduled)
    if (schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled') {
      return '#FF9800'; // Màu cam cho buổi học bù
    }
    
    // Ưu tiên kiểm tra timeStatus (cho EditClassModal)
    const timeStatus = schedule.timeStatus;
    
    if (timeStatus === 'completed') {
      return '#4CAF50'; // Màu xanh lá cho buổi đã kết thúc
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
    
    // Ưu tiên sử dụng màu program type nếu có (cho Teacher Detail)
    const programColor = getProgramTypeColor(schedule.programType);
    if (programColor) {
      return programColor;
    }
    
    // Nếu có timeStatus === 'upcoming' nhưng không có programType
    if (timeStatus === 'upcoming') {
      return '#757575'; // Màu xám cho buổi chưa bắt đầu
    }
    
    // Màu xám mặc định
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
                        const programColor = getProgramTypeColor(schedule.programType);
                        
                        // Debug log for calendar rendering
                        if (schedule.programType) {
                          console.log('🎨 Calendar rendering schedule:', {
                            scheduleId: schedule._id,
                            className: schedule.className,
                            programType: schedule.programType,
                            programColor: programColor,
                            statusColor: statusColor
                          });
                        }
                        
                        // Màu nền khác nhau theo trạng thái
                        let backgroundColor = 'rgba(0,0,0,0.02)'; // Xám nhạt mặc định
                        
                        // Kiểm tra buổi của lớp cũ và lớp mới trước (khi đổi lớp)
                        if (schedule.isOldClassSchedule) {
                          backgroundColor = 'rgba(156, 39, 176, 0.15)'; // Tím nhạt cho buổi lớp cũ
                        } else if (schedule.isNewClassSchedule) {
                          backgroundColor = 'rgba(33, 150, 243, 0.15)'; // Xanh dương nhạt cho buổi lớp mới
                        } else if (schedule.isCancelled || schedule.scheduleStatus === 'cancelled') {
                          backgroundColor = 'rgba(244, 67, 54, 0.2)'; // Đỏ nhạt cho buổi bị hủy
                        } else if (schedule.isAbsentSchedule || schedule.status === 'absent') {
                          backgroundColor = 'rgba(244, 67, 54, 0.15)'; // Đỏ nhạt cho buổi nghỉ
                        } else if (schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled') {
                          backgroundColor = 'rgba(255, 152, 0, 0.15)'; // Cam nhạt cho buổi học bù
                        } else if (timeStatus === 'completed') {
                          backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho buổi đã kết thúc
                        } else if (timeStatus === 'upcoming') {
                          // Sử dụng màu program type nếu có, nếu không thì xám nhạt
                          if (programColor) {
                            // Convert hex to rgba với opacity 0.2 để dễ nhìn hơn
                            const r = parseInt(programColor.slice(1, 3), 16);
                            const g = parseInt(programColor.slice(3, 5), 16);
                            const b = parseInt(programColor.slice(5, 7), 16);
                            backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
                          } else {
                            backgroundColor = 'rgba(0,0,0,0.02)'; // Xám nhạt cho buổi chưa bắt đầu
                          }
                        } else if (timeStatus === 'ongoing') {
                          // Buổi đang diễn ra, kiểm tra attendance
                          if (attendanceStatus === 'present' || attendanceStatus === 'late') {
                            backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho đi học
                          } else if (attendanceStatus === 'absent') {
                            backgroundColor = 'rgba(244, 67, 54, 0.1)'; // Đỏ nhạt cho vắng mặt
                          } else if (attendanceStatus === 'excused') {
                            backgroundColor = 'rgba(255, 152, 0, 0.1)'; // Cam nhạt cho có phép
                          } else if (programColor) {
                            // Nếu không có attendance status, sử dụng màu program type
                            const r = parseInt(programColor.slice(1, 3), 16);
                            const g = parseInt(programColor.slice(3, 5), 16);
                            const b = parseInt(programColor.slice(5, 7), 16);
                            backgroundColor = `rgba(${r}, ${g}, ${b}, 0.1)`;
                          }
                        } else {
                          // Không có timeStatus, kiểm tra attendance (cho Student/Teacher management)
                          if (attendanceStatus === 'present' || attendanceStatus === 'late') {
                            backgroundColor = 'rgba(76, 175, 80, 0.1)'; // Xanh lá nhạt cho đi học
                          } else if (attendanceStatus === 'absent') {
                            backgroundColor = 'rgba(244, 67, 54, 0.1)'; // Đỏ nhạt cho vắng mặt
                          } else if (attendanceStatus === 'excused') {
                            backgroundColor = 'rgba(255, 152, 0, 0.1)'; // Cam nhạt cho có phép
                          } else if (programColor) {
                            // Nếu không có attendance status, sử dụng màu program type
                            const r = parseInt(programColor.slice(1, 3), 16);
                            const g = parseInt(programColor.slice(3, 5), 16);
                            const b = parseInt(programColor.slice(5, 7), 16);
                            backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
                          }
                        }
                        
                        // Ưu tiên màu programType nếu không có trạng thái đặc biệt nào (cho Teacher Detail)
                        // Đây là trường hợp phổ biến nhất cho Teacher Detail page
                        if (!schedule.isOldClassSchedule && 
                            !schedule.isNewClassSchedule && 
                            !schedule.isCancelled && 
                            schedule.scheduleStatus !== 'cancelled' &&
                            !schedule.isAbsentSchedule && 
                            schedule.status !== 'absent' &&
                            !schedule.isMakeupSchedule && 
                            schedule.status !== 'makeup' && 
                            schedule.scheduleStatus !== 'rescheduled' &&
                            timeStatus !== 'completed' &&
                            timeStatus !== 'ongoing' &&
                            timeStatus !== 'upcoming' &&
                            !attendanceStatus && 
                            programColor &&
                            (backgroundColor === 'rgba(0,0,0,0.02)' || !backgroundColor)) {
                          // Áp dụng màu program type với độ đậm hơn
                          const r = parseInt(programColor.slice(1, 3), 16);
                          const g = parseInt(programColor.slice(3, 5), 16);
                          const b = parseInt(programColor.slice(5, 7), 16);
                          backgroundColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
                        }
                        
                        // Tooltip text
                        let tooltipText = 'Buổi chưa học';
                        if (schedule.isOldClassSchedule) {
                          tooltipText = `Buổi lớp cũ: ${schedule.className}`;
                        } else if (schedule.isNewClassSchedule) {
                          tooltipText = `Buổi lớp mới: ${schedule.className}`;
                        } else if (schedule.isCancelled || schedule.scheduleStatus === 'cancelled') {
                          const cancellationReason = schedule.cancellationReason || schedule.reason;
                          tooltipText = cancellationReason 
                            ? `Buổi đã hủy: ${cancellationReason}` 
                            : 'Buổi đã hủy';
                        } else if (schedule.isAbsentSchedule || schedule.status === 'absent') {
                          tooltipText = 'Buổi nghỉ';
                        } else if (schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled') {
                          const makeupReason = schedule.reason;
                          tooltipText = makeupReason 
                            ? `Buổi học bù: ${makeupReason}` 
                            : 'Buổi học bù';
                        } else if (timeStatus === 'completed') {
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
                            title={tooltipText}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering parent div's onClick
                              if (onEditSchedule) {
                                onEditSchedule(schedule);
                              }
                            }}
                          >
                            <div className="fw-bold d-flex align-items-center justify-content-between">
                              <span>{schedule.startTime}</span>
                              {(schedule.isOldClassSchedule || schedule.isNewClassSchedule || schedule.isCancelled || schedule.isAbsentSchedule || schedule.isMakeupSchedule || schedule.status === 'absent' || schedule.status === 'makeup' || schedule.scheduleStatus === 'cancelled' || schedule.scheduleStatus === 'rescheduled' || timeStatus || hasAttendance) && (
                                <i 
                                  className={`fas ${
                                    schedule.isOldClassSchedule ? 'fa-arrow-left' :
                                    schedule.isNewClassSchedule ? 'fa-arrow-right' :
                                    schedule.isCancelled || schedule.scheduleStatus === 'cancelled' ? 'fa-ban' :
                                    schedule.isAbsentSchedule || schedule.status === 'absent' ? 'fa-times-circle' :
                                    schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled' ? 'fa-calendar-plus' :
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
                            <div className="text-truncate d-flex align-items-center gap-1 flex-wrap">
                              <span>{schedule.className}</span>
                              {schedule.isOldClassSchedule && (
                                <Badge bg="secondary" style={{ fontSize: '8px', padding: '2px 4px', backgroundColor: '#9C27B0' }}>Lớp cũ</Badge>
                              )}
                              {schedule.isNewClassSchedule && (
                                <Badge bg="primary" style={{ fontSize: '8px', padding: '2px 4px', backgroundColor: '#2196F3' }}>Lớp mới</Badge>
                              )}
                              {(schedule.isCancelled || schedule.scheduleStatus === 'cancelled') && (
                                <Badge bg="secondary" style={{ fontSize: '8px', padding: '2px 4px' }}>Đã hủy</Badge>
                              )}
                              {(schedule.isAbsentSchedule || schedule.status === 'absent') && !(schedule.isCancelled || schedule.scheduleStatus === 'cancelled') && (
                                <Badge bg="danger" style={{ fontSize: '8px', padding: '2px 4px' }}>Buổi nghỉ</Badge>
                              )}
                              {(schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled') && (
                                <Badge bg="warning" text="dark" style={{ fontSize: '8px', padding: '2px 4px' }}>Học bù</Badge>
                              )}
                            </div>
                            <div className="mt-1 d-flex justify-content-end gap-1">
                              {onAssignSubstitute && !readOnly && (() => {
                                // Kiểm tra xem buổi học có phải là quá khứ không
                                const scheduleDate = new Date(schedule.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                scheduleDate.setHours(0, 0, 0, 0);
                                const isPastSchedule = scheduleDate < today;
                                
                                if (isPastSchedule) {
                                  return null; // Không hiển thị nút cho buổi học quá khứ
                                }
                                
                                return (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0"
                                    style={{ fontSize: '8px', color: '#2196F3', textDecoration: 'none' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAssignSubstitute(schedule);
                                    }}
                                    title="Xếp người dạy thay"
                                  >
                                    <i className="fas fa-user-plus me-1"></i>
                                    Dạy thay
                                  </Button>
                                );
                              })()}
                              {onCreateMakeup && !readOnly && (() => {
                                // Kiểm tra xem buổi học có phải là quá khứ không
                                const scheduleDate = new Date(schedule.date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                scheduleDate.setHours(0, 0, 0, 0);
                                const isPastSchedule = scheduleDate < today;
                                
                                // Không hiển thị nút nếu:
                                // - Buổi học đã qua
                                // - Buổi học đã bị hủy
                                // - Buổi học đã là học bù
                                const isCancelled = schedule.isCancelled || schedule.scheduleStatus === 'cancelled';
                                const isMakeup = schedule.isMakeupSchedule || schedule.status === 'makeup' || schedule.scheduleStatus === 'rescheduled';
                                
                                if (isPastSchedule || isCancelled || isMakeup) {
                                  return null;
                                }
                                
                                return (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0"
                                    style={{ fontSize: '8px', color: '#FF9800', textDecoration: 'none' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateMakeup(schedule);
                                    }}
                                    title="Xếp buổi học bù"
                                  >
                                    <i className="fas fa-calendar-plus me-1"></i>
                                    Học bù
                                  </Button>
                                );
                              })()}
                            </div>
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

      {/* Program Type Color Legend */}
      <div className="d-flex justify-content-center gap-4 mt-3 mb-2">
        <div className="d-flex align-items-center gap-2">
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#2196F3', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}
          ></div>
          <span className="text-13 text-neutral-700">IELTS</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#4CAF50', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}
          ></div>
          <span className="text-13 text-neutral-700">TOEIC</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div 
            style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#FF9800', 
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}
          ></div>
          <span className="text-13 text-neutral-700">Cambridge</span>
        </div>
      </div>

    </div>
  );
};

export default ScheduleCalendar;
