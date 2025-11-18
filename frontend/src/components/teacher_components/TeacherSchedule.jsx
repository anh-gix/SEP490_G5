import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ButtonGroup, Form, Table } from 'react-bootstrap';
import teacherService from '../../services/teacherService';

/**
 * Teacher Schedule Component
 * Lịch dạy của giảng viên - tương tự student schedule
 */
const TeacherSchedule = () => {
  const getCurrentWeek = () => {
    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return firstDayOfWeek;
  };

  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', or 'list'
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range based on view mode
      let startDate, endDate;
      
      if (viewMode === 'week') {
        startDate = new Date(selectedWeek);
        endDate = new Date(selectedWeek);
        endDate.setDate(endDate.getDate() + 6);
      } else if (viewMode === 'month') {
        const year = selectedMonth.getFullYear();
        const month = selectedMonth.getMonth();
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      } else {
        // List view - get 3 months range
        startDate = new Date();
        endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);
      }

      const response = await teacherService.getCurrentTeacherSchedule({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (response.success) {
        // Transform schedules to match frontend format
        const transformedSchedules = response.schedules.map(schedule => ({
          _id: schedule._id,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          className: schedule.className || schedule.class?.name,
          courseName: schedule.courseName || schedule.class?.course?.name,
          session: schedule.session,
          sessionTitle: schedule.sessionTitle || schedule.session?.title,
          sessionOrder: schedule.sessionOrder || schedule.session?.order,
          room: schedule.room,
          roomName: schedule.roomName || schedule.room?.room_name,
          location: schedule.location || schedule.room?.location,
          homework: schedule.homework || [],
          material: schedule.material || [],
          mocktest: schedule.mocktest,
          status: schedule.status,
          // Determine schedule status for filtering
          scheduleStatus: getScheduleStatus(schedule.date, schedule.startTime)
        }));

        setSchedules(transformedSchedules);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch dạy:', error);
      setError(error.message || 'Không thể tải lịch dạy');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const getScheduleStatus = (date, startTime) => {
    const scheduleDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':');
    scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    const now = new Date();
    
    if (scheduleDateTime < now) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  useEffect(() => {
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeek, selectedMonth, viewMode]);

  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedWeek);
    
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setSelectedWeek(newWeek);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const goToToday = () => {
    setSelectedWeek(getCurrentWeek());
    setSelectedMonth(new Date());
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { bg: 'bg-main-600', text: 'Sắp dạy' },
      completed: { bg: 'bg-success-600', text: 'Đã dạy' },
      cancelled: { bg: 'bg-danger-600', text: 'Đã hủy' }
    };
    const config = statusConfig[status] || statusConfig.upcoming;
    return <Badge className={`${config.bg} text-white px-12 py-6`}>{config.text}</Badge>;
  };

  const getMonthDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const filteredSchedules = schedules.filter(schedule => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return schedule.scheduleStatus === 'upcoming';
    if (filterStatus === 'completed') return schedule.scheduleStatus === 'completed';
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
      '18:00 - 20:00',
      '20:00 - 22:00'
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
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
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
                  const daySchedules = filteredSchedules.filter(s => {
                    const scheduleDate = new Date(s.date);
                    return scheduleDate.toDateString() === day.toDateString() && 
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
                            <Link 
                              key={schedule._id}
                              to={`/teacher/lessons/${schedule._id}`}
                              className="text-decoration-none"
                            >
                              <div
                                className={`border rounded-8 p-10 cursor-pointer transition-2 ${
                                  schedule.scheduleStatus === 'upcoming'
                                    ? 'border-main-200 bg-main-50 hover-shadow-sm'
                                    : schedule.scheduleStatus === 'completed'
                                    ? 'border-success-200 bg-success-50'
                                    : 'border-neutral-200 bg-neutral-50'
                                }`}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-start justify-content-between mb-6">
                                  <div className="text-neutral-900 fw-bold text-11">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                  {/* {schedule.homework?.length > 0 && (
                                    <div className="rounded-circle bg-warning-600" style={{ width: '6px', height: '6px' }}></div>
                                  )} */}
                                </div>
                                
                                {/* Class Name */}
                                <div className="text-main-600 fw-bold text-11 mb-4" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  <i className="fas fa-chalkboard-teacher me-1" style={{ fontSize: '9px' }}></i>
                                  {schedule.className}
                                </div>

                                {/* Session Title */}
                                <div className="text-neutral-900 fw-semibold text-11 mb-4" style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: '1.3'
                                }}>
                                  {schedule.sessionTitle || 'Chưa có tiêu đề'}
                                </div>

                                {/* Course Name */}
                                <div className="text-neutral-600 text-10 mb-4">
                                  <i className="fas fa-book me-1" style={{ fontSize: '9px' }}></i>
                                  {schedule.courseName}
                                </div>

                                {/* Room */}
                                <div className="text-neutral-500 text-10 mb-6">
                                  <i className="fas fa-door-open me-1" style={{ fontSize: '9px' }}></i>
                                  {schedule.roomName || 'Chưa xác định'}
                                </div>

                                <Button
                                  className={schedule.scheduleStatus === 'upcoming' ? 'btn-main w-100 py-4 radius-6' : 'btn-outline-success w-100 py-4 radius-6'}
                                  style={{ fontSize: '10px' }}
                                >
                                  <i className={`fas ${schedule.scheduleStatus === 'upcoming' ? 'fa-chalkboard-teacher' : 'fa-check-circle'} me-1`}></i>
                                  {schedule.scheduleStatus === 'upcoming' ? 'Vào lớp' : 'Đã dạy'}
                                </Button>
                              </div>
                            </Link>
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
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          {/* Month Header */}
          <div className="d-flex border-bottom border-neutral-100">
            {weekDayNames.map((day, index) => (
              <div 
                key={index}
                className="flex-fill text-center py-12 bg-neutral-50 text-neutral-600 fw-semibold text-13"
                style={{ borderRight: index < 6 ? '1px solid #E9ECEF' : 'none' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="d-flex flex-wrap">
            {monthDays.map((dayInfo, index) => {
              const daySchedules = filteredSchedules.filter(s => {
                const scheduleDate = new Date(s.date);
                return scheduleDate.toDateString() === dayInfo.date.toDateString();
              });

              const isToday = dayInfo.date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`p-8 ${isToday ? 'bg-main-25' : 'bg-white'}`}
                  style={{
                    width: '14.28%',
                    minHeight: '100px',
                    borderRight: (index + 1) % 7 !== 0 ? '1px solid #E9ECEF' : 'none',
                    borderBottom: index < 35 ? '1px solid #E9ECEF' : 'none',
                    opacity: dayInfo.isCurrentMonth ? 1 : 0.5
                  }}
                >
                  <div className={`text-13 fw-medium mb-4 ${
                    isToday ? 'text-main-600' : 'text-neutral-700'
                  }`}>
                    {dayInfo.date.getDate()}
                  </div>
                  {daySchedules.length > 0 && (
                    <div className="d-flex flex-column gap-4">
                      {daySchedules.slice(0, 2).map(schedule => (
                        <div
                          key={schedule._id}
                          className={`rounded-6 px-6 py-4 cursor-pointer ${
                            schedule.scheduleStatus === 'upcoming'
                              ? 'bg-main-100 border-start border-main-600 border-2'
                              : 'bg-success-100 border-start border-success-600 border-2'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="text-neutral-900 fw-medium" style={{ 
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {schedule.startTime} {schedule.className}
                          </div>
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-main-600 text-11 fw-medium">
                          +{daySchedules.length - 2} khác
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
    );
  };

  const renderListView = () => {
    return (
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-main-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Ngày</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thời gian</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Khóa học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Buổi học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Phòng</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule._id} className="transition-2" style={{ cursor: 'pointer' }}>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-neutral-700">
                          {formatDate(schedule.date)}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-neutral-700">
                          {schedule.startTime} - {schedule.endTime}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-main-600 fw-semibold text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-main-600">
                          {schedule.className}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-neutral-700">
                          {schedule.courseName}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-neutral-900">
                          {schedule.sessionTitle || 'Chưa có tiêu đề'}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule._id}`} className="text-decoration-none text-neutral-700">
                          {schedule.roomName || 'Chưa xác định'}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-13">{getStatusBadge(schedule.scheduleStatus)}</td>
                      <td className="px-20 py-16 text-center">
                        <Link to={`/teacher/lessons/${schedule._id}`}>
                          <Button className="btn-outline-main text-13 fw-medium px-12 py-6 radius-6 me-2">
                            <i className="fas fa-eye me-1"></i>
                            Chi tiết
                          </Button>
                        </Link>
                        {/* {schedule.homework?.length > 0 && (
                          <Badge bg="warning" className="ms-2">
                            {schedule.homework.length} BTVN
                          </Badge>
                        )} */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-40">
                      <i className="fas fa-calendar-times fa-3x text-neutral-400 mb-16"></i>
                      <p className="text-neutral-500 mb-0">Không có lịch dạy nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="mb-24">
        <h4 className="text-neutral-900 fw-bold mb-8">Lịch giảng dạy</h4>
        <p className="text-neutral-600 mb-0">Xem và quản lý lịch giảng dạy của bạn</p>
      </div>

      {/* Controls */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="align-items-center g-3">
            <Col lg={4}>
              {/* View Mode Toggle */}
              <ButtonGroup className="w-100">
                <Button
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'btn-main' : 'btn-outline-main'}
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-calendar-week me-2"></i>
                  Tuần
                </Button>
                <Button
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'btn-main' : 'btn-outline-main'}
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-calendar me-2"></i>
                  Tháng
                </Button>
                <Button
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'btn-main' : 'btn-outline-main'}
                  style={{ fontSize: '14px' }}
                >
                  <i className="fas fa-list me-2"></i>
                  Danh sách
                </Button>
              </ButtonGroup>
            </Col>

            <Col lg={4} className="text-center">
              {/* Navigation */}
              <div className="d-flex align-items-center justify-content-center gap-12">
                <Button
                  onClick={() => viewMode === 'month' ? navigateMonth(-1) : navigateWeek(-1)}
                  className="btn-outline-neutral"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                <div className="text-neutral-900 fw-semibold" style={{ minWidth: '200px' }}>
                  {viewMode === 'month' 
                    ? `Tháng ${selectedMonth.getMonth() + 1}, ${selectedMonth.getFullYear()}`
                    : `Tuần ${Math.ceil(selectedWeek.getDate() / 7)}, Tháng ${selectedWeek.getMonth() + 1}`
                  }
                </div>
                <Button
                  onClick={() => viewMode === 'month' ? navigateMonth(1) : navigateWeek(1)}
                  className="btn-outline-neutral"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </Col>

            <Col lg={4}>
              <div className="d-flex gap-12 justify-content-end">
                <Button onClick={goToToday} className="btn-outline-main" style={{ fontSize: '14px' }}>
                  <i className="fas fa-calendar-day me-2"></i>
                  Hôm nay
                </Button>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: 'auto', fontSize: '14px' }}
                >
                  <option value="all">Tất cả</option>
                  <option value="upcoming">Sắp dạy</option>
                  <option value="completed">Đã dạy</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="text-center py-40">
            <div className="spinner-border text-main-600" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <p className="text-neutral-600 mt-12 mb-0">Đang tải lịch dạy...</p>
          </Card.Body>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="text-center py-40">
            <i className="fas fa-exclamation-circle text-danger-600 mb-12" style={{ fontSize: '48px' }}></i>
            <p className="text-danger-600 mb-12">{error}</p>
            <Button onClick={fetchSchedules} className="btn-main">
              <i className="fas fa-redo me-2"></i>
              Thử lại
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && schedules.length === 0 && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="text-center py-40">
            <i className="fas fa-calendar-times text-neutral-400 mb-12" style={{ fontSize: '48px' }}></i>
            <p className="text-neutral-600 mb-0">Chưa có lịch dạy nào</p>
          </Card.Body>
        </Card>
      )}

      {/* Schedule View */}
      {!loading && !error && schedules.length > 0 && (
        <>
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'list' && renderListView()}
        </>
      )}
    </Container>
  );
};

export default TeacherSchedule;
