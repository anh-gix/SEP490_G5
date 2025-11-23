import React, { useState, useMemo } from 'react';
import { Card, Button, Badge, Dropdown } from 'react-bootstrap';
import { formatDateToYYYYMMDD } from '../../helper/helper';

const ScheduleCalendar = ({ schedules, onEditSchedule, onDeleteSchedule, onCreateMakeup }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;
    
    const days = [];
    
    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
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
            {/* Weekday headers */}
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
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
                              onEditSchedule(schedule);
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

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="mt-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Lịch học ngày {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h5>
            <Button variant="link" size="sm" onClick={() => setSelectedDate(null)}>
              <i className="fas fa-times"></i>
            </Button>
          </Card.Header>

          <Card.Body>
            {getSchedulesForDate(selectedDate).length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {getSchedulesForDate(selectedDate).map(schedule => (
                  <Card key={schedule.id} className="shadow-sm">
                    <Card.Body>
                      <div className="row g-2 mb-3">
                        <div className="col-md-6">
                          <small className="text-muted">Thời gian:</small>
                          <div className="fw-bold">{schedule.startTime} - {schedule.endTime}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Lớp:</small>
                          <div className="fw-bold">{schedule.className}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Giảng viên:</small>
                          <div>{schedule.teacherName}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Phòng:</small>
                          <div>{schedule.roomName}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Buổi học:</small>
                          <div>Buổi {schedule.lessonNumber} - {schedule.lessonTopic}</div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Trạng thái:</small>
                          <div className="d-flex gap-2 align-items-center">
                            {schedule.timeStatus ? (
                              // Hiển thị theo timeStatus (cho EditClassModal)
                              <Badge 
                                bg={
                                  schedule.timeStatus === 'completed' ? 'success' :
                                  schedule.timeStatus === 'upcoming' ? 'secondary' :
                                  'info'
                                }
                              >
                                <i className={`fas ${
                                  schedule.timeStatus === 'completed' ? 'fa-check-circle' :
                                  schedule.timeStatus === 'upcoming' ? 'fa-clock' :
                                  'fa-play-circle'
                                } me-1`}></i>
                                {schedule.timeStatus === 'completed' && 'Đã kết thúc'}
                                {schedule.timeStatus === 'upcoming' && 'Chưa bắt đầu'}
                                {schedule.timeStatus === 'ongoing' && 'Đang diễn ra'}
                              </Badge>
                            ) : schedule.attendanceStatus ? (
                              // Hiển thị theo attendanceStatus (cho Student/Teacher management)
                              <Badge 
                                bg={
                                  schedule.attendanceStatus === 'present' ? 'success' :
                                  schedule.attendanceStatus === 'absent' ? 'danger' :
                                  schedule.attendanceStatus === 'late' ? 'warning' :
                                  'info'
                                }
                              >
                                <i className={`fas ${
                                  schedule.attendanceStatus === 'present' ? 'fa-check-circle' :
                                  schedule.attendanceStatus === 'absent' ? 'fa-times-circle' :
                                  schedule.attendanceStatus === 'late' ? 'fa-clock' :
                                  'fa-file-text'
                                } me-1`}></i>
                                {schedule.attendanceStatus === 'present' && 'Có mặt'}
                                {schedule.attendanceStatus === 'absent' && 'Vắng mặt'}
                                {schedule.attendanceStatus === 'late' && 'Đi muộn'}
                                {schedule.attendanceStatus === 'excused' && 'Có phép'}
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                <i className="fas fa-clock me-1"></i>
                                Chưa điểm danh
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onEditSchedule(schedule)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Sửa
                        </Button>
                        <Button 
                          variant="outline-warning"
                          size="sm"
                          onClick={() => onCreateMakeup(schedule)}
                        >
                          <i className="fas fa-calendar-plus me-1"></i>
                          Học bù
                        </Button>
                        <Button 
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDeleteSchedule(schedule.id)}
                        >
                          <i className="fas fa-trash me-1"></i>
                          Xóa
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="fas fa-calendar-times fa-3x mb-3 d-block"></i>
                <p className="mb-0">Không có lịch học nào trong ngày này</p>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ScheduleCalendar;
