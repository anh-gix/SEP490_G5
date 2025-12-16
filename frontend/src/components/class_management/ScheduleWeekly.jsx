import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { formatDateToYYYYMMDD } from '../../helper/helper';

const ScheduleWeekly = ({ schedules, onScheduleClick, selectedWeek, onWeekChange, onLessonClick }) => {
  // Sử dụng selectedWeek từ props, nếu không có thì dùng current date
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    if (selectedWeek) {
      return selectedWeek;
    }
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Sync currentWeekStart với selectedWeek prop
  useEffect(() => {
    if (selectedWeek) {
      setCurrentWeekStart(selectedWeek);
    }
  }, [selectedWeek]);

  // Time slots configuration - each slot is 2 hours from 8:00 to 20:00
  const timeSlots = useMemo(() => {
    const slots = [];
    
    // 6 slots of 2 hours each: 8-10, 10-12, 12-14, 14-16, 16-18, 18-20
    for (let hour = 8; hour < 20; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;
      
      slots.push({
        startTime,
        endTime,
        label: `${startTime} - ${endTime}`
      });
    }
    
    return slots;
  }, []);

  // Get week days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  // Get schedules for a specific date and time slot
  const getSchedulesForSlot = (date, timeSlot) => {
    // Use helper to format date correctly (avoid timezone issues)
    const dateStr = formatDateToYYYYMMDD(date);
    
    return schedules.filter(schedule => {
      if (schedule.date !== dateStr) return false;
      
      // Check if schedule overlaps with this time slot
      const scheduleStart = schedule.startTime;
      const scheduleEnd = schedule.endTime;
      const slotStart = timeSlot.startTime;
      const slotEnd = timeSlot.endTime;
      
      return timeOverlaps(scheduleStart, scheduleEnd, slotStart, slotEnd);
    });
  };

  const timeOverlaps = (start1, end1, start2, end2) => {
    const convertToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const s1 = convertToMinutes(start1);
    const e1 = convertToMinutes(end1);
    const s2 = convertToMinutes(start2);
    const e2 = convertToMinutes(end2);
    
    return (s1 < e2 && e1 > s2);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
    if (onWeekChange) {
      onWeekChange(newDate);
    }
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
    if (onWeekChange) {
      onWeekChange(newDate);
    }
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
    if (onWeekChange) {
      onWeekChange(monday);
    }
  };

  const formatWeekRange = () => {
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    
    return `${currentWeekStart.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get color based on program type
  const getProgramTypeColor = (programType) => {
    if (!programType) return null;
    
    const colorMap = {
      'ielts': '#2196F3', // Xanh dương
      'toeic': '#FF9800', // Cam
      'cam': '#757575'    // Xám
    };
    
    return colorMap[programType.toLowerCase()] || null;
  };

  const getStatusColor = (status, hasAttendance) => {
    // Nếu buổi đã học (có attendance), dùng màu xanh đậm
    if (hasAttendance) {
      return '#1976D2'; // Màu xanh đậm cho buổi đã học
    }
    
    // Nếu chưa học, dùng màu theo status
    const colors = {
      scheduled: '#4CAF50', // Màu xanh lá cho buổi đã lên lịch nhưng chưa học
      completed: '#2196F3',
      cancelled: '#f44336',
      makeup: '#FF9800'
    };
    return colors[status] || '#757575';
  };

  return (
    <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
      <Card.Header className="bg-main-25 border-0 p-20">
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            className="btn-outline-main text-14 fw-medium px-12 py-8 radius-8"
            onClick={goToPreviousWeek}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>
          <div className="text-center">
            <h5 className="text-neutral-900 fw-semibold mb-4">{formatWeekRange()}</h5>
            <Button 
              className="btn-link text-main-600 text-13 fw-medium p-0"
              onClick={goToCurrentWeek}
            >
              Tuần này
            </Button>
          </div>
          <Button 
            className="btn-outline-main text-14 fw-medium px-12 py-8 radius-8"
            onClick={goToNextWeek}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {/* Weekly Grid */}
        <div style={{ overflowX: 'auto' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minWidth: '900px', borderBottom: '2px solid #dee2e6' }}>
            <div style={{ padding: '12px', fontWeight: 'bold', background: '#f8f9fa', borderRight: '1px solid #dee2e6' }}>
              Giờ
            </div>
            {weekDays.map((day, dayIndex) => (
              <div 
                key={dayIndex}
                style={{ 
                  padding: '8px', 
                  textAlign: 'center', 
                  background: isToday(day) ? '#e7f3ff' : '#f8f9fa',
                  borderRight: dayIndex < 6 ? '1px solid #dee2e6' : 'none'
                }}
              >
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                </div>
                <div 
                  style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: isToday(day) ? '#0d6efd' : '#212529',
                    marginTop: '4px'
                  }}
                >
                  {day.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Rows */}
          {timeSlots.map((slot, slotIndex) => (
            <div 
              key={slotIndex}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '80px repeat(7, 1fr)', 
                minWidth: '900px',
                minHeight: '100px'
              }}
            >
              {/* Time cell */}
              <div 
                style={{ 
                  padding: '8px', 
                  borderBottom: '1px solid #dee2e6',
                  borderRight: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#6c757d',
                  fontWeight: '500',
                  background: '#fafafa'
                }}
              >
                {slot.startTime}
              </div>

              {/* Day cells */}
              {weekDays.map((day, dayIndex) => {
                const slotSchedules = getSchedulesForSlot(day, slot);
                
                return (
                  <div 
                    key={dayIndex}
                    style={{ 
                      borderBottom: '1px solid #dee2e6',
                      borderRight: dayIndex < 6 ? '1px solid #dee2e6' : 'none',
                      padding: '4px',
                      position: 'relative',
                      background: isToday(day) ? '#f8fbff' : 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {slotSchedules.length > 0 ? (
                      slotSchedules.map(schedule => {
                        const hasAttendance = schedule.hasAttendance || false;
                        const programColor = getProgramTypeColor(schedule.programType);
                        // Sử dụng màu program type, nếu không có thì dùng màu xám mặc định
                        const borderColor = programColor || '#757575';
                        
                        // Màu nền theo program type với opacity
                        let backgroundColor = 'white';
                        if (programColor) {
                          // Convert hex to rgba với opacity 0.2
                          const r = parseInt(programColor.slice(1, 3), 16);
                          const g = parseInt(programColor.slice(3, 5), 16);
                          const b = parseInt(programColor.slice(5, 7), 16);
                          backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
                        } else {
                          backgroundColor = 'rgba(0,0,0,0.02)'; // Xám nhạt mặc định
                        }
                        
                        const ScheduleCard = (
                          <Card
                            key={schedule.id}
                            className="mb-0"
                            style={{ 
                              borderLeft: `4px solid ${borderColor}`,
                              backgroundColor: backgroundColor,
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s',
                              flex: '0 0 auto',
                              minHeight: slotSchedules.length > 1 ? '60px' : '92px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            onClick={() => onScheduleClick && onScheduleClick(schedule)}
                            title={hasAttendance ? 'Buổi đã học' : 'Buổi chưa học'}
                          >
                            <Card.Body className="p-2" style={{ fontSize: '10px', position: 'relative' }}>
                              <div className="fw-bold text-primary mb-1 d-flex align-items-center justify-content-between" style={{ fontSize: '9px' }}>
                                <span>{schedule.startTime} - {schedule.endTime}</span>
                                {hasAttendance && (
                                  <i className="fas fa-check-circle" style={{ color: borderColor, fontSize: '8px' }}></i>
                                )}
                              </div>
                              <div className="fw-bold mb-1" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                {schedule.className}
                              </div>
                              <div className="text-muted mb-1" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                                <i className="fas fa-user me-1" style={{ fontSize: '8px' }}></i>
                                {schedule.teacherName}
                              </div>
                              <div className="text-muted" style={{ fontSize: '9px', lineHeight: '1.2' }}>
                                <i className="fas fa-door-open me-1" style={{ fontSize: '8px' }}></i>
                                {schedule.roomName}
                              </div>
                            </Card.Body>
                          </Card>
                        );

                        // If onLessonClick is provided, use onClick handler, otherwise use onScheduleClick or Link fallback
                        if (onLessonClick) {
                          return (
                            <div 
                              key={schedule.id} 
                              className="text-decoration-none"
                              onClick={() => onLessonClick(schedule.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              {ScheduleCard}
                            </div>
                          );
                        }

                        // If onScheduleClick is provided, use div wrapper
                        if (onScheduleClick) {
                          return (
                            <div key={schedule.id} className="text-decoration-none">
                              {ScheduleCard}
                            </div>
                          );
                        }

                        // Fallback: no handler provided, just render card
                        return (
                          <div key={schedule.id} className="text-decoration-none">
                            {ScheduleCard}
                          </div>
                        );
                      })
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card.Body>

      {/* Program Type Color Legend */}
      <Card.Footer className="bg-neutral-25 border-0 p-16">
        <div className="d-flex justify-content-center gap-4 flex-wrap">
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
                backgroundColor: '#FF9800', 
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
                backgroundColor: '#757575', 
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            ></div>
            <span className="text-13 text-neutral-700">Cambridge</span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ScheduleWeekly;
