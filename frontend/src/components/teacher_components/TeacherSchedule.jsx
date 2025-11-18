import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, ButtonGroup, Form, Table, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import teacherService from '../../services/teacherService';

/**
 * Teacher Schedule Component
 * Lịch dạy của giảng viên - tương tự student schedule
 */
// Helper function to get current week start (Monday)
function getCurrentWeek() {
  const today = new Date();
  const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  return firstDayOfWeek;
}

const TeacherSchedule = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', or 'list'
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, [selectedWeek, selectedMonth, viewMode, filterStatus, user]);

  // Helper function to get day of week in Vietnamese
  const getDayOfWeek = (date) => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayIndex = new Date(date).getDay();
    return days[dayIndex] || 'Thứ 2';
  };

  // Helper function to calculate status based on date and endTime
  const calculateStatus = (date, endTime) => {
    const now = new Date();
    const scheduleDate = new Date(date);
    
    // Ensure date is valid
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

    // If date and endTime have passed, it's completed
    if (scheduleDate < now) {
      return 'completed';
    }
    return 'upcoming';
  };

  // Helper function to get date range based on view mode
  const getDateRangeForView = () => {
    let startDate, endDate;

    if (viewMode === 'week') {
      // Start from selectedWeek (Monday)
      startDate = new Date(selectedWeek);
      // End on Sunday (6 days later)
      endDate = new Date(selectedWeek);
      endDate.setDate(endDate.getDate() + 6);
    } else if (viewMode === 'month') {
      // Start from first day of selected month
      startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      // End on last day of selected month
      endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);
    } else {
      // For list view, use selectedWeek range
      startDate = new Date(selectedWeek);
      endDate = new Date(selectedWeek);
      endDate.setDate(endDate.getDate() + 6);
    }

    // Format as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };
  };

  // Transform API response data to component format
  const transformScheduleData = (apiSchedules) => {
    if (!apiSchedules || !Array.isArray(apiSchedules)) {
      return [];
    }

    return apiSchedules.map((item) => {
      const scheduleDate = new Date(item.date);
      const dateString = scheduleDate.toISOString().split('T')[0];
      const status = calculateStatus(item.date, item.endTime);

      return {
        id: item._id,
        date: dateString,
        dayOfWeek: getDayOfWeek(scheduleDate),
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        lessonNumber: item.session?.order || 0,
        topic: item.session?.title || 'Chưa có chủ đề',
        className: item.class?.name || 'N/A',
        room: item.room?.room_name ? `Room ${item.room.room_name}` : 'Chưa có phòng',
        status: status,
        totalStudents: 0, // TODO: Populate from class.students.length when available
        attendanceCompleted: false // TODO: Check attendance status via separate API call
      };
    });
  };

  const fetchSchedules = async () => {
    // Check if user exists
    if (!user || !user._id) {
      setError('Vui lòng đăng nhập để xem lịch dạy');
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get date range based on current view mode
      const { startDate, endDate } = getDateRangeForView();

      // Call API to get teacher schedule
      const response = await teacherService.getTeacherSchedule(user._id, {
        startDate,
        endDate
      });

      // Transform API response to component format
      if (response && response.success && response.schedules) {
        const transformedData = transformScheduleData(response.schedules);
        setSchedules(transformedData);
      } else {
        // Handle empty response
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError(error.message || 'Không thể tải lịch dạy. Vui lòng thử lại sau.');
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
    if (filterStatus === 'upcoming') return schedule.status === 'upcoming';
    if (filterStatus === 'completed') return schedule.status === 'completed';
    return true;
  });

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
        <Card.Body className="p-0">
          <div className="schedule-week-view d-flex flex-column">
            {/* Week Days Header */}
            <div className="d-flex border-bottom border-neutral-100">
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

            {/* Schedule Content */}
            <div className="d-flex" style={{ minHeight: '500px' }}>
              {weekDays.map((day, index) => {
                const daySchedules = schedules.filter(s => {
                  const scheduleDate = new Date(s.date);
                  return scheduleDate.toDateString() === day.toDateString();
                });

                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div 
                    key={index}
                    className={`p-12 ${
                      isToday ? 'bg-main-25' : 'bg-white'
                    }`}
                    style={{ 
                      flex: '1 1 0', 
                      minWidth: '0',
                      borderRight: index < 6 ? '1px solid #E9ECEF' : 'none'
                    }}
                  >
                    {daySchedules.length > 0 ? (
                      <div className="d-flex flex-column gap-8">
                        {daySchedules.map(schedule => (
                          <Link 
                            key={schedule.id}
                            to={`/teacher/lessons/${schedule.id}`}
                            className="text-decoration-none"
                          >
                            <div
                              className={`border rounded-8 p-12 cursor-pointer transition-2 ${
                                schedule.status === 'upcoming'
                                  ? 'border-main-200 bg-main-50 hover-shadow-sm'
                                  : schedule.status === 'completed'
                                  ? 'border-success-200 bg-success-50'
                                  : 'border-neutral-200 bg-neutral-50'
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                            <div className="d-flex align-items-start justify-content-between mb-8">
                              <div className="text-neutral-900 fw-bold text-13">
                                {schedule.startTime}
                              </div>
                              {!schedule.attendanceCompleted && schedule.status === 'completed' && (
                                <div className="rounded-circle bg-warning-600" style={{ width: '8px', height: '8px' }}></div>
                              )}
                            </div>
                            
                            {/* Class Name */}
                            <div className="text-main-600 fw-bold text-12 mb-6" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {schedule.className}
                            </div>

                            <div className="text-neutral-900 fw-semibold text-13 mb-6" style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4'
                            }}>
                              {schedule.topic}
                            </div>

                            <div className="text-neutral-600 text-11 mb-6">
                              <i className="fas fa-users me-1" style={{ fontSize: '10px' }}></i>
                              {schedule.totalStudents} học viên
                            </div>

                            <div className="text-neutral-500 text-11 mb-8">
                              <i className="fas fa-door-open me-1" style={{ fontSize: '10px' }}></i>
                              {schedule.room}
                            </div>

                            {schedule.status === 'upcoming' && (
                              <Button
                                className="btn-main w-100 py-6 radius-6"
                                style={{ fontSize: '11px' }}
                              >
                                <i className="fas fa-chalkboard-teacher me-1"></i>
                                Vào lớp
                              </Button>
                            )}
                            {schedule.status === 'completed' && !schedule.attendanceCompleted && (
                              <Button
                                className="btn-outline-warning w-100 py-6 radius-6"
                                style={{ fontSize: '11px' }}
                              >
                                <i className="fas fa-user-check me-1"></i>
                                Điểm danh
                              </Button>
                            )}
                          </div>
                        </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-40 text-neutral-300">
                        <i className="fas fa-calendar-times" style={{ fontSize: '20px' }}></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              const daySchedules = schedules.filter(s => {
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
                          key={schedule.id}
                          className={`rounded-6 px-6 py-4 cursor-pointer ${
                            schedule.status === 'upcoming'
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
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Buổi học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Chủ đề</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Phòng</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="transition-2" style={{ cursor: 'pointer' }}>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-700">
                          {formatDate(schedule.date)}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-700">
                          {schedule.startTime} - {schedule.endTime}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-main-600 fw-semibold text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-main-600">
                          {schedule.className}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-700">
                          Buổi {schedule.lessonNumber}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-900 fw-medium text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-900">
                          {schedule.topic}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-700">
                          {schedule.room}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-neutral-700 text-13">
                        <Link to={`/teacher/lessons/${schedule.id}`} className="text-decoration-none text-neutral-700">
                          {schedule.totalStudents}
                        </Link>
                      </td>
                      <td className="px-20 py-16 text-13">{getStatusBadge(schedule.status)}</td>
                      <td className="px-20 py-16 text-center">
                        <Link to={`/teacher/lessons/${schedule.id}`}>
                          <Button className="btn-outline-main text-13 fw-medium px-12 py-6 radius-6 me-2">
                            <i className="fas fa-eye me-1"></i>
                            Chi tiết
                          </Button>
                        </Link>
                        {schedule.status === 'completed' && !schedule.attendanceCompleted && (
                          <Link to={`/teacher/attendance/${schedule.id}`}>
                            <Button className="btn-outline-warning text-13 fw-medium px-12 py-6 radius-6">
                              <i className="fas fa-user-check me-1"></i>
                              Điểm danh
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-40">
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

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-24" onClose={() => setError(null)} dismissible>
          <Alert.Heading>Lỗi</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
          <Card.Body className="text-center py-40">
            <Spinner animation="border" role="status" className="mb-16">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
            <p className="text-neutral-600 mb-0">Đang tải lịch dạy...</p>
          </Card.Body>
        </Card>
      )}

      {/* Schedule View */}
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

export default TeacherSchedule;
