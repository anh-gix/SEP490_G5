import React, { useState, useMemo } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const ScheduleWeekly = ({ schedules, onEditSchedule, onDeleteSchedule, onCreateMakeup }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Time slots configuration - each slot is 1.5 hours (90 minutes)
  const timeSlots = useMemo(() => {
    const slots = [];
    let hour = 8;
    let minute = 0;
    
    // From 8:00 to 20:30 (13 slots)
    while (hour < 21) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      minute += 90;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
      const endTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
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
    const dateStr = date.toISOString().split('T')[0];
    
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
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
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

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#4CAF50',
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
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minWidth: '900px' }}>
            {/* Time column */}
            <div style={{ borderRight: '1px solid #dee2e6' }}>
              <div style={{ padding: '12px', fontWeight: 'bold', borderBottom: '2px solid #dee2e6', background: '#f8f9fa' }}>
                Giờ
              </div>
              {timeSlots.map((slot, index) => (
                <div 
                  key={index} 
                  style={{ 
                    padding: '8px', 
                    borderBottom: '1px solid #dee2e6',
                    height: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    color: '#6c757d'
                  }}
                >
                  {slot.startTime}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} style={{ borderRight: dayIndex < 6 ? '1px solid #dee2e6' : 'none' }}>
                <div 
                  style={{ 
                    padding: '8px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #dee2e6',
                    background: isToday(day) ? '#e7f3ff' : '#f8f9fa'
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
                
                {timeSlots.map((slot, slotIndex) => {
                  const slotSchedules = getSchedulesForSlot(day, slot);
                  
                  return (
                    <div 
                      key={slotIndex} 
                      style={{ 
                        borderBottom: '1px solid #dee2e6',
                        height: '80px',
                        padding: '4px',
                        position: 'relative',
                        background: isToday(day) ? '#f8fbff' : 'white'
                      }}
                    >
                      {slotSchedules.length > 0 ? (
                        slotSchedules.map(schedule => (
                          <Card
                            key={schedule.id}
                            className="h-100 mb-0"
                            style={{ 
                              borderLeft: `4px solid ${getStatusColor(schedule.status)}`,
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s'
                            }}
                            onClick={() => onEditSchedule(schedule)}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                          >
                            <Card.Body className="p-1" style={{ fontSize: '10px' }}>
                              <div className="fw-bold text-primary mb-1" style={{ fontSize: '9px' }}>
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className="fw-bold mb-1" style={{ fontSize: '11px' }}>{schedule.className}</div>
                              <div className="text-muted" style={{ fontSize: '9px' }}>
                                <i className="fas fa-user" style={{ fontSize: '8px' }}></i> {schedule.teacherName}
                              </div>
                              <div className="text-muted" style={{ fontSize: '9px' }}>
                                <i className="fas fa-door-open" style={{ fontSize: '8px' }}></i> {schedule.roomName}
                              </div>
                              
                              <div 
                                className="position-absolute bottom-0 end-0 d-flex gap-1"
                                style={{ padding: '2px' }}
                              >
                                <Button
                                  className="bg-main-600 text-white border-0"
                                  size="sm"
                                  style={{ 
                                    padding: '0', 
                                    fontSize: '10px',
                                    lineHeight: 1,
                                    width: '13px',
                                    height: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '2px',
                                    opacity: 0.9
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditSchedule(schedule);
                                  }}
                                  title="Sửa"
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                                >
                                  <i className="fas fa-edit" style={{ fontSize: '9px' }}></i>
                                </Button>
                                <Button
                                  className="bg-warning-600 text-white border-0"
                                  size="sm"
                                  style={{ 
                                    padding: '0', 
                                    fontSize: '10px',
                                    lineHeight: 1,
                                    width: '13px',
                                    height: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '2px',
                                    opacity: 0.9
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateMakeup(schedule);
                                  }}
                                  title="Học bù"
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                                >
                                  <i className="fas fa-calendar-plus" style={{ fontSize: '9px' }}></i>
                                </Button>
                                <Button
                                  className="bg-danger-600 text-white border-0"
                                  size="sm"
                                  style={{ 
                                    padding: '0', 
                                    fontSize: '10px',
                                    lineHeight: 1,
                                    width: '13px',
                                    height: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '2px',
                                    opacity: 0.9
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSchedule(schedule.id);
                                  }}
                                  title="Xóa"
                                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                                >
                                  <i className="fas fa-trash" style={{ fontSize: '8px' }}></i>
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        ))
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card.Body>

      {/* Legend */}
      <Card.Footer className="bg-neutral-25 border-0 p-16">
        <div className="d-flex justify-content-center gap-16 flex-wrap">
          <div className="d-flex align-items-center gap-8">
            <Badge className="bg-success-600" style={{ width: '12px', height: '12px', padding: 0, borderRadius: '2px' }}></Badge>
            <span className="text-13 text-neutral-700">Đã lên lịch</span>
          </div>
          <div className="d-flex align-items-center gap-8">
            <Badge className="bg-main-600" style={{ width: '12px', height: '12px', padding: 0, borderRadius: '2px' }}></Badge>
            <span className="text-13 text-neutral-700">Đã hoàn thành</span>
          </div>
          <div className="d-flex align-items-center gap-8">
            <Badge className="bg-warning-600" style={{ width: '12px', height: '12px', padding: 0, borderRadius: '2px' }}></Badge>
            <span className="text-13 text-neutral-700">Học bù</span>
          </div>
          <div className="d-flex align-items-center gap-8">
            <Badge className="bg-danger-600" style={{ width: '12px', height: '12px', padding: 0, borderRadius: '2px' }}></Badge>
            <span className="text-13 text-neutral-700">Đã hủy</span>
          </div>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ScheduleWeekly;
