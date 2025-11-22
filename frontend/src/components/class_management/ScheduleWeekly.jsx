import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from 'react-bootstrap';

const ScheduleWeekly = ({ schedules, onScheduleClick }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Start from Monday
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

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
                        const ScheduleCard = (
                          <Card
                            key={schedule.id}
                            className="mb-0"
                            style={{ 
                              borderLeft: `4px solid ${getStatusColor(schedule.status)}`,
                              cursor: 'pointer',
                              fontSize: '11px',
                              transition: 'all 0.2s',
                              flex: '0 0 auto',
                              minHeight: slotSchedules.length > 1 ? '60px' : '92px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            onClick={() => onScheduleClick && onScheduleClick(schedule)}
                          >
                            <Card.Body className="p-2" style={{ fontSize: '10px', position: 'relative' }}>
                              <div className="fw-bold text-primary mb-1" style={{ fontSize: '9px' }}>
                                {schedule.startTime} - {schedule.endTime}
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

                        // If onScheduleClick is provided, use div wrapper, otherwise use Link
                        if (onScheduleClick) {
                          return (
                            <div key={schedule.id} className="text-decoration-none">
                              {ScheduleCard}
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={schedule.id}
                            to={`/academic/lessons/${schedule.id}`}
                            className="text-decoration-none"
                          >
                            {ScheduleCard}
                          </Link>
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
