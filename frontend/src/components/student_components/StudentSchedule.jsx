import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ButtonGroup, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';

/**
 * Student Schedule Component
 * Trang xem lịch học dành cho học viên
 */
const StudentSchedule = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', or 'list'
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user._id) {
      fetchSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); // Chỉ fetch khi user._id thay đổi

  // Không cần fetch lại khi selectedWeek hoặc filterStatus thay đổi vì đã có dữ liệu

  // Auto-refresh để cập nhật status theo thời gian thực (mỗi phút)
  useEffect(() => {
    if (schedules.length > 0) {
      const interval = setInterval(() => {
        // Tính lại status cho tất cả schedules
        setSchedules(prevSchedules => {
          return prevSchedules.map(schedule => {
            const now = new Date();
            const scheduleDate = new Date(schedule.date);
            
            if (isNaN(scheduleDate.getTime())) {
              return schedule;
            }
            
            if (schedule.endTime && typeof schedule.endTime === 'string') {
              const timeParts = schedule.endTime.split(':').map(Number);
              if (timeParts.length === 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
                scheduleDate.setHours(timeParts[0], timeParts[1], 0, 0);
              }
            }

            const newStatus = scheduleDate < now ? 'completed' : 'upcoming';
            return { ...schedule, status: newStatus };
          });
        });
      }, 60000); // Cập nhật mỗi phút

      return () => clearInterval(interval);
    }
  }, [schedules.length]); // Chỉ phụ thuộc vào length để tránh vòng lặp vô hạn

  function getCurrentWeek() {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return firstDayOfWeek;
  }

  // Hàm tính toán status dựa trên thời gian thực
  const calculateStatus = (date, endTime) => {
    const now = new Date();
    const scheduleDate = new Date(date);
    
    // Đảm bảo date là đối tượng Date hợp lệ
    if (isNaN(scheduleDate.getTime())) {
      return 'upcoming';
    }
    
    // Parse endTime (format: "HH:MM")
    if (endTime && typeof endTime === 'string') {
      const timeParts = endTime.split(':').map(Number);
      if (timeParts.length === 2 && !isNaN(timeParts[0]) && !isNaN(timeParts[1])) {
        scheduleDate.setHours(timeParts[0], timeParts[1], 0, 0);
      }
    }

    // Nếu ngày và giờ kết thúc đã qua thì là completed
    if (scheduleDate < now) {
      return 'completed';
    }
    return 'upcoming';
  };

  // Hàm chuyển đổi dữ liệu từ API sang format component
  const transformScheduleData = (apiData) => {
    return apiData.map((item, index) => {
      const scheduleDate = new Date(item.date);
      const status = calculateStatus(item.date, item.endTime);
      const attendanceStatus = item.attendance?.status || null;

      return {
        id: item._id,
        date: scheduleDate.toISOString().split('T')[0],
        dayOfWeek: getDayOfWeek(scheduleDate),
        startTime: item.startTime,
        endTime: item.endTime,
        lessonNumber: item.sessionOrder || index + 1,
        topic: item.sessionTitle || 'Chưa có chủ đề',
        teacher: item.class?.teacher?.username || 'Chưa có thông tin',
        room: item.roomName ? `${item.roomName}${item.location ? ` - ${item.location}` : ''}` : 'Chưa có phòng',
        status: item.scheduleStatus === 'completed' ? 'completed' : status,
        attendanceStatus: attendanceStatus,
        className: item.className || 'N/A',
        subject: item.courseName || 'N/A',
        rawData: item
      };
    });
  };

  // Hàm lấy thứ trong tuần
  const getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[date.getDay()];
  };

  const fetchSchedules = async () => {
    if (!user) {
      setError('Vui lòng đăng nhập để xem lịch học');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
    
      // Get current month's date range for initial load
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const params = {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: endOfMonth.toISOString().split('T')[0]
      };

      console.log('Fetching schedules with params:', params);
      
      const response = await studentService.getMySchedule(params);
      
      console.log('API Response:', response);
      
      if (response.success && response.schedules && Array.isArray(response.schedules)) {
        const transformed = transformScheduleData(response.schedules);
        console.log('Transformed schedules:', transformed);
        setSchedules(transformed);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      const errorMessage = error.message || 'Không thể tải lịch học. Vui lòng thử lại sau.';
      setError(errorMessage);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedWeek);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { bg: 'bg-info-500', text: 'Sắp diễn ra' },
      completed: { bg: 'bg-neutral-600', text: 'Đã học' },
      cancelled: { bg: 'bg-danger-600', text: 'Đã hủy' }
    };

    const config = statusConfig[status] || statusConfig.upcoming;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        {config.text}
      </Badge>
    );
  };

  const getAttendanceBadge = (attendance) => {
    if (!attendance) return null;

    const attendanceConfig = {
      present: { bg: 'bg-success-600', text: 'Có mặt', icon: 'fa-check' },
      absent: { bg: 'bg-danger-600', text: 'Vắng', icon: 'fa-times' },
      late: { bg: 'bg-warning-600', text: 'Trễ', icon: 'fa-clock' },
      excused: { bg: 'bg-info-500', text: 'Có phép', icon: 'fa-file-alt' }
    };

    const config = attendanceConfig[attendance] || attendanceConfig.present;
    return (
      <Badge className={`${config.bg} text-white px-12 py-6 text-12`}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  const getMonthDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Điều chỉnh để bắt đầu từ Thứ 2 (1) thay vì Chủ nhật (0)
    // getDay() trả về: 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
    // Cần chuyển thành: 0 = Thứ 2, 1 = Thứ 3, ..., 6 = Chủ nhật
    const firstDayOfWeek = firstDay.getDay(); // 0-6
    const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Chủ nhật (0) -> 6, Thứ 2 (1) -> 0, ...
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add previous month days - bắt đầu từ Thứ 2
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = adjustedFirstDayOfWeek; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
        isCurrentMonth: false
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add next month days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return schedule.status === 'upcoming';
    if (filterStatus === 'completed') return schedule.status === 'completed';
    return true;
  });

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const timeSlots = [
      '08:00 - 10:00',
      '10:00 - 12:00',
      '12:00 - 14:00',
      '14:00 - 16:00',
      '16:00 - 18:00',
      '18:00 - 20:00'
    ];

    // Helper function to check if schedule fits in time slot
    const isScheduleInTimeSlot = (schedule, timeSlot) => {
      const [slotStart, slotEnd] = timeSlot.split(' - ');
      const scheduleStart = schedule.startTime;
      const scheduleEnd = schedule.endTime;
      
      // Check if schedule overlaps with time slot
      return (scheduleStart >= slotStart && scheduleStart < slotEnd) ||
             (scheduleEnd > slotStart && scheduleEnd <= slotEnd) ||
             (scheduleStart <= slotStart && scheduleEnd >= slotEnd);
    };

    return (
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-0">
          <div className="schedule-week-view">
            {/* Week Days Header */}
            <div className="d-flex border-bottom border-neutral-100">
              {/* Time column header */}
              <div className="bg-neutral-50 text-center py-16" style={{ width: '100px', minWidth: '100px', borderRight: '1px solid #E9ECEF' }}>
                <div className="text-12 fw-semibold text-neutral-700">
                  Thời gian
                </div>
              </div>
              
              {/* Day headers */}
              {weekDays.map((day, index) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div 
                    key={index}
                    className={`text-center py-16 ${
                      isToday ? 'bg-main-600' : 'bg-neutral-50'
                    }`}
                    style={{ flex: '1 1 0', minWidth: '0', borderRight: index < 6 ? '1px solid #E9ECEF' : 'none' }}
                  >
                    <div className={`text-12 fw-medium mb-4 ${isToday ? 'text-white' : 'text-neutral-500'}`}>
                      {day.toLocaleDateString('vi-VN', { weekday: 'short' })}
                    </div>
                    <div className={`text-20 fw-bold ${isToday ? 'text-white' : 'text-neutral-900'}`}>
                      {day.getDate()}
                    </div>
                    <div className={`text-11 ${isToday ? 'text-white' : 'text-neutral-400'}`}>
                      Tháng {day.getMonth() + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Schedule Content with Time Slots */}
            {timeSlots.map((timeSlot, slotIndex) => (
              <div key={slotIndex} className="d-flex border-bottom border-neutral-100">
                {/* Time column */}
                <div 
                  className="bg-neutral-25 d-flex align-items-center justify-content-center text-neutral-700 fw-medium text-12"
                  style={{ width: '100px', minWidth: '100px', borderRight: '1px solid #E9ECEF', padding: '12px 8px' }}
                >
                  {timeSlot}
                </div>
                
                {/* Day columns */}
                {weekDays.map((day, dayIndex) => {
                  const daySchedules = schedules.filter(s => {
                    if (!s.date) return false;
                    const scheduleDate = new Date(s.date);
                    const compareDate = new Date(day);
                    // So sánh ngày và kiểm tra time slot
                    return scheduleDate.getDate() === compareDate.getDate() &&
                           scheduleDate.getMonth() === compareDate.getMonth() &&
                           scheduleDate.getFullYear() === compareDate.getFullYear() &&
                           isScheduleInTimeSlot(s, timeSlot);
                  });

                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={dayIndex}
                      className={`p-8 ${
                        isToday ? 'bg-main-25' : 'bg-white'
                      }`}
                      style={{ 
                        flex: '1 1 0', 
                        minWidth: '0',
                        minHeight: '100px',
                        borderRight: dayIndex < 6 ? '1px solid #E9ECEF' : 'none'
                      }}
                    >
                      {daySchedules.length > 0 ? (
                        <div className="d-flex flex-column gap-6">
                          {daySchedules.map(schedule => (
                            <div
                              key={schedule.id}
                              className={`border rounded-8 p-10 cursor-pointer transition-2 ${
                                schedule.status === 'upcoming'
                                  ? 'border-main-200 bg-main-50 hover-shadow-sm'
                                  : schedule.attendanceStatus === 'present'
                                  ? 'border-success-200 bg-success-50'
                                  : schedule.attendanceStatus === 'absent'
                                  ? 'border-danger-200 bg-danger-50'
                                  : 'border-neutral-200 bg-neutral-50'
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex align-items-start justify-content-between mb-6">
                                <div className="text-neutral-900 fw-bold text-11">
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                {schedule.attendanceStatus && (
                                  <div className={`rounded-circle ${
                                    schedule.attendanceStatus === 'present' ? 'bg-success-600' :
                                    schedule.attendanceStatus === 'absent' ? 'bg-danger-600' :
                                    'bg-warning-600'
                                  }`} style={{ width: '6px', height: '6px' }}></div>
                                )}
                              </div>

                              {/* Class Name */}
                              <div className="text-neutral-900 fw-bold text-11 mb-4" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                <i className="fas fa-book-open me-1" style={{ fontSize: '9px', color: '#0D74FF' }}></i>
                                {schedule.className}
                              </div>
                              
                              <div className="text-neutral-900 fw-semibold text-11 mb-4" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.3'
                              }}>
                                {schedule.topic}
                              </div>

                              <div className="text-neutral-600 text-10 mb-4">
                                <i className="fas fa-chalkboard-teacher me-1" style={{ fontSize: '9px' }}></i>
                                {schedule.teacher}
                              </div>

                              <div className="text-neutral-500 text-10 mb-6">
                                <i className="fas fa-door-open me-1" style={{ fontSize: '9px' }}></i>
                                {schedule.room}
                              </div>

                              <Link to={`/student/lessons/${schedule.id}`} className="w-100">
                                <Button
                                  className="btn-outline-main w-100 py-4 radius-6"
                                  style={{ fontSize: '10px' }}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  Chi tiết
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays();
    const weekDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return (
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-0">
          {/* Month Header */}
          <div className="d-flex border-bottom border-neutral-100">
            {weekDayNames.map((day, index) => (
              <div 
                key={index}
                className="flex-fill text-center py-12 bg-neutral-50 border-end border-neutral-100"
              >
                <div className="text-13 fw-semibold text-neutral-700">{day}</div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="d-flex flex-wrap">
            {monthDays.map((dayObj, index) => {
              const day = dayObj.date;
              const daySchedules = schedules.filter(s => {
                if (!s.date) return false;
                const scheduleDate = new Date(s.date);
                const compareDate = new Date(day);
                // So sánh chỉ ngày, tháng, năm
                return scheduleDate.getDate() === compareDate.getDate() &&
                       scheduleDate.getMonth() === compareDate.getMonth() &&
                       scheduleDate.getFullYear() === compareDate.getFullYear();
              });

              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`border-end border-bottom border-neutral-100 p-8 ${
                    !dayObj.isCurrentMonth ? 'bg-neutral-25' : 'bg-white'
                  }`}
                  style={{ 
                    width: `${100 / 7}%`,
                    minHeight: '100px',
                    opacity: dayObj.isCurrentMonth ? 1 : 0.5
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-8">
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                      isToday ? 'bg-main-600 text-white' : 'text-neutral-700'
                    }`} style={{ 
                      width: isToday ? '28px' : 'auto',
                      height: isToday ? '28px' : 'auto',
                      fontSize: '13px',
                      fontWeight: isToday ? 'bold' : 'normal'
                    }}>
                      {day.getDate()}
                    </div>
                    {daySchedules.length > 0 && (
                      <Badge className="bg-main-600 text-white" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {daySchedules.length}
                      </Badge>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-4">
                    {daySchedules.slice(0, 2).map(schedule => (
                      <Link 
                        key={schedule.id}
                        to={`/student/lessons/${schedule.id}`}
                        className="text-decoration-none"
                      >
                        <div
                          className={`rounded-6 px-6 py-4 cursor-pointer transition-2 ${
                            schedule.status === 'upcoming'
                              ? 'bg-main-100 border-start border-main-600 border-2'
                              : schedule.attendanceStatus === 'present'
                              ? 'bg-success-100 border-start border-success-600 border-2'
                              : schedule.attendanceStatus === 'absent'
                              ? 'bg-danger-100 border-start border-danger-600 border-2'
                              : 'bg-neutral-100 border-start border-neutral-400 border-2'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="text-neutral-900 fw-medium" style={{ 
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-neutral-700 fw-normal" style={{ 
                            fontSize: '10px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '2px'
                          }}>
                            {schedule.className}
                          </div>
                        </div>
                      </Link>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-main-600 text-11 fw-medium">
                        +{daySchedules.length - 2} khác
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    );
  };

  const renderListView = () => {
    return (
      <Card className="bg-white border-0 rounded-12" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-main-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Ngày
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Thời gian
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Lớp học
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Buổi học
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Chủ đề
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Giảng viên
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Phòng
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Trạng thái
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">
                    Chuyên cần
                  </th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="transition-2">
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {formatDate(schedule.date)}
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {schedule.startTime} - {schedule.endTime}
                      </td>
                      <td className="px-20 py-16 text-neutral-900 fw-semibold text-13">
                        <i className="fas fa-book-open me-2" style={{ color: '#0D74FF' }}></i>
                        {schedule.className}
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        Buổi {schedule.lessonNumber}
                      </td>
                      <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                        {schedule.topic}
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {schedule.teacher}
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        {schedule.room}
                      </td>
                      <td className="px-20 py-16 text-13">
                        {getStatusBadge(schedule.status)}
                      </td>
                      <td className="px-20 py-16 text-13">
                        {getAttendanceBadge(schedule.attendanceStatus)}
                      </td>
                      <td className="px-20 py-16 text-center">
                        <Link to={`/student/lessons/${schedule.id}`}>
                          <Button
                            className="btn-outline-main text-13 fw-medium px-12 py-6 radius-6"
                          >
                            <i className="fas fa-eye me-1"></i>
                            Chi tiết
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-40">
                      <i className="fas fa-calendar-times fa-3x text-neutral-400 mb-16"></i>
                      <p className="text-neutral-500 mb-0">
                        {loading ? 'Đang tải...' : 'Không có lịch học nào'}
                      </p>
                      {!loading && (
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={fetchSchedules}
                          className="mt-16"
                        >
                          <i className="fas fa-sync-alt me-2"></i>
                          Tải lại
                        </Button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Summary Footer */}
        {filteredSchedules.length > 0 && (
          <Card.Footer className="bg-main-25 border-main-100 p-16">
            <Row>
              <Col md={6}>
                <div className="text-neutral-700 text-13">
                  Tổng số: <span className="fw-semibold text-neutral-900">{filteredSchedules.length}</span> buổi học
                </div>
              </Col>
              <Col md={6} className="text-md-end">
                <div className="text-neutral-700 text-13">
                  Đã học: <span className="fw-semibold text-success-600">
                    {filteredSchedules.filter(s => s.attendanceStatus === 'present').length}
                  </span> | 
                  Vắng: <span className="fw-semibold text-danger-600 ms-1">
                    {filteredSchedules.filter(s => s.attendanceStatus === 'absent').length}
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Footer>
        )}
      </Card>
    );
  };

  return (
    <Container fluid className="py-24 px-24">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h3 className="text-neutral-900 fw-bold mb-8">Lịch học của tôi</h3>
          <p className="text-neutral-500 mb-0">Quản lý lịch học và điểm danh</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <Card className="bg-white border-0 rounded-12 mb-24" style={{ boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)' }}>
        <Card.Body className="p-20">
          <Row className="align-items-center">
            <Col lg={4}>
              {/* Navigation */}
              <div className="d-flex align-items-center gap-12">
                <Button
                  onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                  className="btn-outline-main text-13 fw-medium px-12 py-8 radius-8"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <div className="text-center flex-grow-1">
                  <div className="text-neutral-900 fw-semibold text-15">
                    {viewMode === 'month' 
                      ? selectedMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
                      : selectedWeek.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })
                    }
                  </div>
                  {viewMode === 'week' && (
                    <div className="text-neutral-500 text-13">
                      Tuần {Math.ceil(selectedWeek.getDate() / 7)}
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
                  className="btn-outline-main text-13 fw-medium px-12 py-8 radius-8"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </Col>

            <Col lg={4}>
              {/* Filter by Status */}
              <Form.Group>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border-neutral-30 radius-8 px-16 py-10 text-13"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="upcoming">Sắp diễn ra</option>
                  <option value="completed">Đã hoàn thành</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col lg={4}>
              {/* View Toggle */}
              <div className="d-flex justify-content-end gap-12">
                <ButtonGroup>
                  <Button
                    onClick={() => setViewMode('week')}
                    className={viewMode === 'week' ? 'btn-main' : 'btn-outline-main'}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    <i className="fas fa-calendar-week me-2"></i>
                    Tuần
                  </Button>
                  <Button
                    onClick={() => setViewMode('month')}
                    className={viewMode === 'month' ? 'btn-main' : 'btn-outline-main'}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    <i className="fas fa-calendar-alt me-2"></i>
                    Tháng
                  </Button>
                  <Button
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'btn-main' : 'btn-outline-main'}
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                  >
                    <i className="fas fa-list me-2"></i>
                    Danh sách
                  </Button>
                </ButtonGroup>

                <Button
                  onClick={() => {
                    setSelectedWeek(getCurrentWeek());
                    setSelectedMonth(new Date());
                  }}
                  className="btn-outline-main text-13 fw-medium px-16 py-8 radius-8"
                >
                  <i className="fas fa-calendar-day me-2"></i>
                  Hôm nay
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-24" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" size="sm" onClick={fetchSchedules}>
            Thử lại
          </Button>
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-40">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="text-neutral-500 mt-16">Đang tải lịch học...</p>
        </div>
      )}

      {/* Schedule Content */}
      {!loading && (
        <>
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'list' && renderListView()}
        </>
      )}
    </Container>
  );
};

export default StudentSchedule;
