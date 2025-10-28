import React, { useState, useMemo } from 'react';
import './ScheduleCalendar.css';

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
    const dateStr = date.toISOString().split('T')[0];
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
    <div className="schedule-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button className="nav-btn" onClick={goToPreviousMonth}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <div className="current-month">
          <h3>{formatMonthYear()}</h3>
          <button className="today-btn" onClick={goToToday}>Hôm nay</button>
        </div>
        <button className="nav-btn" onClick={goToNextMonth}>
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Weekday headers */}
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}

        {/* Calendar days */}
        {calendarData.map((dayData, index) => {
          const daySchedules = getSchedulesForDate(dayData.date);
          const isSelectedDate = selectedDate?.toDateString() === dayData.date.toDateString();
          
          return (
            <div
              key={index}
              className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                isToday(dayData.date) ? 'today' : ''
              } ${isSelectedDate ? 'selected' : ''}`}
              onClick={() => setSelectedDate(dayData.date)}
            >
              <div className="day-number">{dayData.date.getDate()}</div>
              
              {daySchedules.length > 0 && (
                <div className="day-schedules">
                  {daySchedules.slice(0, 3).map(schedule => (
                    <div
                      key={schedule.id}
                      className="schedule-item"
                      style={{ borderLeftColor: getStatusColor(schedule.status) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditSchedule(schedule);
                      }}
                    >
                      <span className="schedule-time">{schedule.startTime}</span>
                      <span className="schedule-class">{schedule.className}</span>
                    </div>
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="more-schedules">
                      +{daySchedules.length - 3} lịch khác
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="selected-date-details">
          <div className="details-header">
            <h4>
              Lịch học ngày {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <button className="close-btn" onClick={() => setSelectedDate(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="schedules-list">
            {getSchedulesForDate(selectedDate).length > 0 ? (
              getSchedulesForDate(selectedDate).map(schedule => (
                <div key={schedule.id} className="schedule-detail-card">
                  <div className="schedule-info">
                    <div className="info-row">
                      <span className="label">Thời gian:</span>
                      <span className="value">{schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Lớp:</span>
                      <span className="value">{schedule.className}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Giảng viên:</span>
                      <span className="value">{schedule.teacherName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Phòng:</span>
                      <span className="value">{schedule.roomName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Buổi học:</span>
                      <span className="value">Buổi {schedule.lessonNumber} - {schedule.lessonTopic}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Trạng thái:</span>
                      <span className={`status-badge status-${schedule.status}`}>
                        {schedule.status === 'scheduled' && 'Đã lên lịch'}
                        {schedule.status === 'completed' && 'Đã hoàn thành'}
                        {schedule.status === 'cancelled' && 'Đã hủy'}
                        {schedule.status === 'makeup' && 'Học bù'}
                      </span>
                    </div>
                  </div>

                  <div className="schedule-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => onEditSchedule(schedule)}
                      title="Chỉnh sửa"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn makeup"
                      onClick={() => onCreateMakeup(schedule)}
                      title="Tạo lịch học bù"
                    >
                      <i className="fas fa-calendar-plus"></i>
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => onDeleteSchedule(schedule.id)}
                      title="Xóa"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-schedules">
                <i className="fas fa-calendar-times"></i>
                <p>Không có lịch học nào trong ngày này</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;
