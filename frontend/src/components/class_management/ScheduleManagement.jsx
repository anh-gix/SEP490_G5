import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, ButtonGroup, Form, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleWeekly from './ScheduleWeekly';
import ScheduleList from './ScheduleList';
import CreateScheduleModal from './CreateScheduleModal';
import AcademicLessonDetail from './AcademicLessonDetail';
import scheduleService from '../../services/scheduleService';
import classService from '../../services/classService';
import teacherService from '../../services/teacherService';
import roomService from '../../services/roomService';

const ScheduleManagement = () => {
  const [viewMode, setViewMode] = useState('weekly'); // calendar, weekly or list
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLessonDetail, setShowLessonDetail] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  
  // State cho tuần và tháng được chọn
  const [selectedWeek, setSelectedWeek] = useState(() => {
    // Tính thứ 2 của tuần hiện tại
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  // Khởi tạo filters với startDate và endDate đã được tính sẵn cho weekly view (mặc định)
  const [filters, setFilters] = useState(() => {
    // Tính date range cho weekly view (mặc định)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(monday);
    weekEnd.setDate(monday.getDate() + 6);
    weekEnd.setHours(23, 59, 59);
    
    return {
      classId: '',
      teacherId: '',
      roomId: '',
      startDate: monday.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      status: ''
    };
  });

  // Helper function: Tính startDate và endDate từ tuần
  const getWeekDateRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59);
    
    return {
      startDate: weekStart.toISOString().split('T')[0], // YYYY-MM-DD
      endDate: weekEnd.toISOString().split('T')[0]
    };
  };

  // Helper function: Tính startDate và endDate từ tháng
  const getMonthDateRange = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Format date theo local time để tránh timezone issue
    const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    
    return {
      startDate: formatDateLocal(firstDay),
      endDate: formatDateLocal(lastDay)
    };
  };

  // Helper function: Chuyển đổi Date sang format week input (YYYY-Www)
  const getWeekInputValue = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Tính tuần ISO (bắt đầu từ thứ 2)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum = Math.ceil((((d - week1) / 86400000) + week1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Helper function: Lấy ngày đầu tuần từ year và week number
  const getDateOfISOWeek = (year, week) => {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = new Date(simple);
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    return ISOweekStart;
  };

  // Helper function: Lấy tất cả các tuần trong tháng/năm
  const getWeeksInMonth = (year, month) => {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Tìm thứ 2 đầu tiên của tháng (hoặc thứ 2 của tuần chứa ngày 1)
    const firstMonday = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    firstMonday.setDate(firstDay.getDate() + diff);
    
    // Nếu thứ 2 đầu tiên nằm ngoài tháng, bắt đầu từ thứ 2 tiếp theo
    if (firstMonday.getMonth() !== month) {
      firstMonday.setDate(firstMonday.getDate() + 7);
    }
    
    // Tạo các tuần từ thứ 2 đầu tiên đến hết tháng
    let currentWeek = new Date(firstMonday);
    while (currentWeek <= lastDay || currentWeek.getMonth() === month) {
      const weekEnd = new Date(currentWeek);
      weekEnd.setDate(currentWeek.getDate() + 6);
      
      // Chỉ thêm tuần nếu có ít nhất 1 ngày trong tháng
      if (currentWeek.getMonth() === month || weekEnd.getMonth() === month) {
        const formatDate = (date) => {
          const d = String(date.getDate()).padStart(2, '0');
          const m = String(date.getMonth() + 1).padStart(2, '0');
          return `${d}/${m}`;
        };
        
        weeks.push({
          start: new Date(currentWeek),
          end: weekEnd,
          label: `Tuần ${weeks.length + 1} (${formatDate(currentWeek)} - ${formatDate(weekEnd)})`
        });
      }
      
      currentWeek.setDate(currentWeek.getDate() + 7);
      
      // Dừng nếu đã vượt quá tháng
      if (currentWeek.getMonth() > month && currentWeek.getFullYear() === year) {
        break;
      }
    }
    
    return weeks;
  };

  // Helper function: Tìm tuần chứa một ngày cụ thể
  const findWeekForDate = (date, weeks) => {
    const dateTime = date.getTime();
    for (let i = 0; i < weeks.length; i++) {
      const weekStart = weeks[i].start.getTime();
      const weekEnd = weeks[i].end.getTime();
      if (dateTime >= weekStart && dateTime <= weekEnd) {
        return i;
      }
    }
    return 0; // Default to first week
  };

  // Tự động cập nhật filters khi viewMode hoặc selectedWeek/selectedMonth thay đổi
  useEffect(() => {
    if (viewMode === 'weekly') {
      const { startDate, endDate } = getWeekDateRange(selectedWeek);
      setFilters(prev => ({ ...prev, startDate, endDate }));
    } else if (viewMode === 'calendar') {
      const { startDate, endDate } = getMonthDateRange(selectedMonth);
      setFilters(prev => ({ ...prev, startDate, endDate }));
    }
    // viewMode === 'list' giữ nguyên filters hiện tại (có thể có startDate/endDate từ user input)
  }, [viewMode, selectedWeek, selectedMonth]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.classId) params.classId = filters.classId;
      if (filters.teacherId) params.teacherId = filters.teacherId;
      if (filters.roomId) params.roomId = filters.roomId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.status) params.status = filters.status;
      
      const response = await scheduleService.getAllSchedules(params);
      
      // Transform API response to match component's expected format
      const transformedSchedules = (response.schedules || response.data || []).map((sch, index) => {
        // Format date từ backend - dùng helper function để đảm bảo format YYYY-MM-DD
        let dateStr = 'N/A';
        
        if (sch.date) {
          try {
            // Format thủ công để tránh timezone issue
            const dateObj = sch.date instanceof Date ? sch.date : new Date(sch.date);
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              dateStr = `${year}-${month}-${day}`;
            } else {
              dateStr = sch.dateFormatted || 'N/A';
            }
          } catch (error) {
            dateStr = sch.dateFormatted || 'N/A';
          }
        } else {
          dateStr = sch.dateFormatted || 'N/A';
        }
        
        let className = sch.class?.name;
        if (!className && sch.status === 'temporary') {
          className = 'Lớp học bù';
        } else if (!className) {
          className = 'N/A';
        }
        
        const programType = sch.class?.course?.program?.type || sch.programType || sch.sessionCourse?.program?.type || null;
        
        return {
          id: sch._id || sch.id,
          classId: sch.class?._id || sch.classId,
          className: className,
          teacherId: sch.teacher?._id || sch.class?.teacher?._id || sch.teacherId,
          teacherName: sch.teacher?.username || sch.class?.teacher?.username || 'N/A',
          roomId: sch.room?._id || sch.roomId,
          roomName: sch.room?.room_name || 'N/A',
          date: dateStr,
          startTime: sch.startTime || 'N/A',
          endTime: sch.endTime || 'N/A',
          lessonNumber: sch.session?.order || sch.session?.sessionNumber || 0,
          lessonTopic: sch.session?.title || sch.topic || 'N/A',
          status: sch.status || 'fixed',
          type: sch.type || 'regular',
          programType: programType
        };
      });
      
      setSchedules(transformedSchedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.message || 'Không thể tải danh sách lịch học');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await classService.getAllClasses();
      const transformedClasses = response.classes.map(cls => ({
        id: cls._id,
        name: cls.name,
        level: cls.level,
        students: cls.students?.length || 0
      }));
      setClasses(transformedClasses);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAllTeachers();
      const transformedTeachers = response.teachers.map(t => ({
        id: t._id,
        name: t.username || t.email || 'N/A',
        email: t.email
      }));
      setTeachers(transformedTeachers);
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomService.getAllRooms();
      const transformedRooms = response.rooms.map(r => ({
        id: r._id,
        name: r.room_name,
        capacity: r.capacity,
        equipment: []
      }));
      setRooms(transformedRooms);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Chỉ fetch schedules nếu có startDate và endDate (trừ list view)
      if (viewMode !== 'list' && (!filters.startDate || !filters.endDate)) {
        return; // Đợi useEffect cập nhật filters trước
      }
      
      await fetchSchedules();
      await fetchClasses();
      await fetchTeachers();
      await fetchRooms();
    };
    fetchData();
  }, [filters]);

  const handleCreateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      await scheduleService.createSchedule(scheduleData);
      setShowCreateModal(false);
      toast.success('Tạo lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      if (err.message && err.message.includes('conflict')) {
        toast.error(`Xung đột lịch học: ${err.message}`);
      } else {
        toast.error(err.message || 'Có lỗi xảy ra khi tạo lịch học!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa lịch học này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      setLoading(true);
      await scheduleService.deleteSchedule(scheduleId);
      toast.success('Xóa lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi xóa lịch học!');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    // Reset về tuần/tháng hiện tại
    const today = new Date();
    
    // Reset tuần
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    setSelectedWeek(monday);
    
    // Reset tháng
    setSelectedMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    
    // Reset filters
    setFilters({
      classId: '',
      teacherId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  const handleExportSchedule = () => {
    toast.info('Chức năng xuất lịch học sẽ được triển khai sau!');
  };

  const handleLessonClick = (lessonId) => {
    setSelectedLessonId(lessonId);
    setShowLessonDetail(true);
  };

  // Conditional rendering: nếu đang hiển thị lesson detail, render AcademicLessonDetail
  if (showLessonDetail && selectedLessonId) {
    return (
      <AcademicLessonDetail
        lessonId={selectedLessonId}
        onBack={() => {
          setShowLessonDetail(false);
          setSelectedLessonId(null);
        }}
      />
    );
  }

  return (
    <Container fluid className="p-24">

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-24">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h2 className="text-neutral-900 fw-bold mb-8">Quản lý lịch học</h2>
          <p className="text-neutral-500 mb-0">Sắp xếp và quản lý lịch học cho các lớp</p>
        </div>
      </div>

      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-24">
          <Row className="g-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Lớp học</Form.Label>
                <Form.Select 
                  size="sm" 
                  name="classId" 
                  value={filters.classId} 
                  onChange={handleFilterChange}
                  className="border-neutral-30 radius-8 py-8 px-12"
                >
                  <option value="">Tất cả lớp</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Giảng viên</Form.Label>
                <Form.Select 
                  size="sm" 
                  name="teacherId" 
                  value={filters.teacherId} 
                  onChange={handleFilterChange}
                  className="border-neutral-30 radius-8 py-8 px-12"
                >
                  <option value="">Tất cả giảng viên</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Phòng học</Form.Label>
                <Form.Select 
                  size="sm" 
                  name="roomId" 
                  value={filters.roomId} 
                  onChange={handleFilterChange}
                  className="border-neutral-30 radius-8 py-8 px-12"
                >
                  <option value="">Tất cả phòng</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* UI filter thay đổi theo viewMode */}
            {viewMode === 'weekly' ? (
              // View Tuần: Hiển thị dropdown chọn tuần, tháng, năm
              <>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Tuần</Form.Label>
                    <Form.Select
                      size="sm"
                      value={(() => {
                        const weeks = getWeeksInMonth(selectedWeek.getFullYear(), selectedWeek.getMonth());
                        const weekIndex = findWeekForDate(selectedWeek, weeks);
                        return weekIndex;
                      })()}
                      onChange={(e) => {
                        const weekIndex = parseInt(e.target.value);
                        const weeks = getWeeksInMonth(selectedWeek.getFullYear(), selectedWeek.getMonth());
                        if (weeks[weekIndex]) {
                          setSelectedWeek(new Date(weeks[weekIndex].start));
                        }
                      }}
                      className="border-neutral-30 radius-8 py-8 px-12"
                    >
                      {(() => {
                        const weeks = getWeeksInMonth(selectedWeek.getFullYear(), selectedWeek.getMonth());
                        return weeks.map((week, index) => (
                          <option key={index} value={index}>{week.label}</option>
                        ));
                      })()}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Tháng</Form.Label>
                    <Form.Select
                      size="sm"
                      value={selectedWeek.getMonth() + 1}
                      onChange={(e) => {
                        const month = parseInt(e.target.value);
                        const newWeek = new Date(selectedWeek);
                        newWeek.setMonth(month - 1);
                        // Đảm bảo vẫn là thứ 2 của tuần
                        const dayOfWeek = newWeek.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        newWeek.setDate(newWeek.getDate() + diff);
                        setSelectedWeek(newWeek);
                      }}
                      className="border-neutral-30 radius-8 py-8 px-12"
                    >
                      <option value="1">Tháng 1</option>
                      <option value="2">Tháng 2</option>
                      <option value="3">Tháng 3</option>
                      <option value="4">Tháng 4</option>
                      <option value="5">Tháng 5</option>
                      <option value="6">Tháng 6</option>
                      <option value="7">Tháng 7</option>
                      <option value="8">Tháng 8</option>
                      <option value="9">Tháng 9</option>
                      <option value="10">Tháng 10</option>
                      <option value="11">Tháng 11</option>
                      <option value="12">Tháng 12</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Năm</Form.Label>
                    <Form.Select
                      size="sm"
                      value={selectedWeek.getFullYear()}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        const newWeek = new Date(selectedWeek);
                        newWeek.setFullYear(year);
                        // Đảm bảo vẫn là thứ 2 của tuần
                        const dayOfWeek = newWeek.getDay();
                        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                        newWeek.setDate(newWeek.getDate() + diff);
                        setSelectedWeek(newWeek);
                      }}
                      className="border-neutral-30 radius-8 py-8 px-12"
                    >
                      {(() => {
                        const currentYear = new Date().getFullYear();
                        const years = [];
                        for (let i = currentYear - 2; i <= currentYear + 2; i++) {
                          years.push(i);
                        }
                        return years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ));
                      })()}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </>
            ) : viewMode === 'calendar' ? (
  // View Tháng: Hiển thị dropdown chọn tháng và năm riêng biệt
  <>
    <Col md={1}>
      <Form.Group>
        <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Tháng</Form.Label>
        <Form.Select
          size="sm"
          value={selectedMonth.getMonth() + 1}
          onChange={(e) => {
            const month = parseInt(e.target.value);
            setSelectedMonth(new Date(selectedMonth.getFullYear(), month - 1, 1));
          }}
          className="border-neutral-30 radius-8 py-8 px-12"
        >
          <option value="1">Tháng 1</option>
          <option value="2">Tháng 2</option>
          <option value="3">Tháng 3</option>
          <option value="4">Tháng 4</option>
          <option value="5">Tháng 5</option>
          <option value="6">Tháng 6</option>
          <option value="7">Tháng 7</option>
          <option value="8">Tháng 8</option>
          <option value="9">Tháng 9</option>
          <option value="10">Tháng 10</option>
          <option value="11">Tháng 11</option>
          <option value="12">Tháng 12</option>
        </Form.Select>
      </Form.Group>
    </Col>
    <Col md={1}>
      <Form.Group>
        <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Năm</Form.Label>
        <Form.Select
          size="sm"
          value={selectedMonth.getFullYear()}
          onChange={(e) => {
            const year = parseInt(e.target.value);
            setSelectedMonth(new Date(year, selectedMonth.getMonth(), 1));
          }}
          className="border-neutral-30 radius-8 py-8 px-12"
        >
          {(() => {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let i = currentYear - 2; i <= currentYear + 2; i++) {
              years.push(i);
            }
            return years.map(year => (
              <option key={year} value={year}>{year}</option>
            ));
          })()}
        </Form.Select>
      </Form.Group>
    </Col>
  </>
            ) : (
              // View Danh sách: Giữ nguyên "Từ ngày" và "Đến ngày"
              <>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Từ ngày</Form.Label>
                    <Form.Control 
                      size="sm"
                      type="date" 
                      name="startDate" 
                      value={filters.startDate} 
                      onChange={handleFilterChange}
                      className="border-neutral-30 radius-8 py-8 px-12"
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Đến ngày</Form.Label>
                    <Form.Control 
                      size="sm"
                      type="date" 
                      name="endDate" 
                      value={filters.endDate} 
                      onChange={handleFilterChange}
                      className="border-neutral-30 radius-8 py-8 px-12"
                    />
                  </Form.Group>
                </Col>
              </>
            )}

            <Col md={viewMode === 'list' ? 2 : 2}>
              <Form.Group>
                <Form.Label className="text-neutral-700 fw-medium mb-8 text-13">Trạng thái</Form.Label>
                <div className="d-flex gap-8">
                  <Form.Select 
                    size="sm" 
                    name="status" 
                    value={filters.status} 
                    onChange={handleFilterChange} 
                    className="flex-grow-1 border-neutral-30 radius-8 py-8 px-12"
                  >
                    <option value="">Tất cả</option>
                    <option value="scheduled">Đã lên lịch</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="makeup">Học bù</option>
                  </Form.Select>
                  <Button 
                    size="sm" 
                    className="btn-outline-main radius-8 px-12"
                    onClick={handleResetFilters} 
                    title="Đặt lại"
                  >
                    <i className="fas fa-redo"></i>
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center mb-24">
        <ButtonGroup>
          <Button 
            className={viewMode === 'calendar' 
              ? 'btn-main text-15 fw-medium px-20 py-10' 
              : 'btn-outline-main text-15 fw-medium px-20 py-10'}
            onClick={() => setViewMode('calendar')}
          >
            <i className="fas fa-calendar me-2"></i> Tháng
          </Button>
          <Button 
            className={viewMode === 'weekly' 
              ? 'btn-main text-15 fw-medium px-20 py-10' 
              : 'btn-outline-main text-15 fw-medium px-20 py-10'}
            onClick={() => setViewMode('weekly')}
          >
            <i className="fas fa-calendar-week me-2"></i> Tuần
          </Button>
          <Button 
            className={viewMode === 'list' 
              ? 'btn-main text-15 fw-medium px-20 py-10' 
              : 'btn-outline-main text-15 fw-medium px-20 py-10'}
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list me-2"></i> Danh sách
          </Button>
        </ButtonGroup>
      </div>

      <div>
        {viewMode === 'calendar' ? (
          <ScheduleCalendar
            schedules={schedules}
            onDeleteSchedule={handleDeleteSchedule}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onLessonClick={handleLessonClick}
            showTeacherName={false}
          />
        ) : viewMode === 'weekly' ? (
          <ScheduleWeekly 
            schedules={schedules}
            onDeleteSchedule={handleDeleteSchedule}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            onAssignSubstitute={(schedule) => {
              setSelectedSchedule(schedule);
              // Handle assign substitute logic
            }}
            classService={classService}
            onLessonClick={handleLessonClick}
          />
        ) : (
          <ScheduleList 
            schedules={schedules}
            onLessonClick={handleLessonClick}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateScheduleModal
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSchedule}
          existingSchedules={schedules}
        />
      )}
    </Container>
  );
};

export default ScheduleManagement;