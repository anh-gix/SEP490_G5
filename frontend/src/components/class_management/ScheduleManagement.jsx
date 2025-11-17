import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, ButtonGroup, Form, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleWeekly from './ScheduleWeekly';
import ScheduleList from './ScheduleList';
import CreateScheduleModal from './CreateScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import MakeupClassModal from './MakeupClassModal';
import RoomManagement from './RoomManagement';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    classId: '',
    teacherId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    status: ''
  });

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
      
      // const response = await scheduleService.getAllSchedules(params);
      
      // const transformedSchedules = response.schedules.map(sch => ({
      //   id: sch._id,
      //   classId: sch.class?._id,
      //   className: sch.class?.name || 'N/A',
      //   teacherId: sch.class?.teacher?._id,
      //   teacherName: sch.class?.teacher ? `${sch.class.teacher.firstName} ${sch.class.teacher.lastName}` : 'N/A',
      //   roomId: sch.room?._id,
      //   roomName: sch.room?.room_name || 'N/A',
      //   date: sch.date ? new Date(sch.date).toISOString().split('T')[0] : 'N/A',
      //   startTime: sch.startTime || 'N/A',
      //   endTime: sch.endTime || 'N/A',
      //   lessonNumber: sch.session?.sessionNumber || 0,
      //   lessonTopic: sch.topic || sch.session?.topic || 'N/A',
      //   status: sch.status || 'draft',
      //   type: 'regular'
      // }));
      
      // Mock data for testing - Multiple classes in same time slots
      const mockSchedules = [
        // Monday - Multiple classes at 8:00
        { id: 1, classId: 'c1', className: 'TOEIC 450 - A1', teacherId: 't1', teacherName: 'Nguyễn Văn A', roomId: 'r1', roomName: 'P.101', date: '2025-11-17', startTime: '08:00', endTime: '10:00', lessonNumber: 5, lessonTopic: 'Listening Practice', status: 'scheduled', type: 'regular' },
        { id: 2, classId: 'c2', className: 'TOEIC 650 - B1', teacherId: 't2', teacherName: 'Trần Thị B', roomId: 'r2', roomName: 'P.102', date: '2025-11-17', startTime: '08:00', endTime: '10:00', lessonNumber: 8, lessonTopic: 'Reading Comprehension', status: 'scheduled', type: 'regular' },
        { id: 3, classId: 'c3', className: 'TOEIC 850 - C1', teacherId: 't3', teacherName: 'Lê Văn C', roomId: 'r3', roomName: 'P.103', date: '2025-11-17', startTime: '08:00', endTime: '10:00', lessonNumber: 12, lessonTopic: 'Advanced Grammar', status: 'scheduled', type: 'regular' },
        
        // Monday - Multiple classes at 10:00
        { id: 4, classId: 'c4', className: 'TOEIC 550 - A2', teacherId: 't4', teacherName: 'Phạm Thị D', roomId: 'r4', roomName: 'P.104', date: '2025-11-17', startTime: '10:00', endTime: '12:00', lessonNumber: 6, lessonTopic: 'Vocabulary Building', status: 'scheduled', type: 'regular' },
        { id: 5, classId: 'c5', className: 'TOEIC 750 - B2', teacherId: 't5', teacherName: 'Hoàng Văn E', roomId: 'r5', roomName: 'P.105', date: '2025-11-17', startTime: '10:00', endTime: '12:00', lessonNumber: 10, lessonTopic: 'Business English', status: 'scheduled', type: 'regular' },
        
        // Monday afternoon
        { id: 6, classId: 'c1', className: 'TOEIC 450 - A1', teacherId: 't1', teacherName: 'Nguyễn Văn A', roomId: 'r1', roomName: 'P.101', date: '2025-11-17', startTime: '14:00', endTime: '16:00', lessonNumber: 6, lessonTopic: 'Speaking Practice', status: 'scheduled', type: 'regular' },
        { id: 7, classId: 'c6', className: 'TOEIC 900+ - Expert', teacherId: 't6', teacherName: 'Vũ Thị F', roomId: 'r6', roomName: 'P.106', date: '2025-11-17', startTime: '14:00', endTime: '16:00', lessonNumber: 15, lessonTopic: 'Mock Test', status: 'scheduled', type: 'regular' },
        
        // Monday evening - Multiple classes
        { id: 8, classId: 'c2', className: 'TOEIC 650 - B1', teacherId: 't2', teacherName: 'Trần Thị B', roomId: 'r2', roomName: 'P.102', date: '2025-11-17', startTime: '18:00', endTime: '20:00', lessonNumber: 9, lessonTopic: 'Writing Skills', status: 'scheduled', type: 'regular' },
        { id: 9, classId: 'c7', className: 'TOEIC Intensive', teacherId: 't7', teacherName: 'Đỗ Văn G', roomId: 'r7', roomName: 'P.107', date: '2025-11-17', startTime: '18:00', endTime: '20:00', lessonNumber: 4, lessonTopic: 'Part 5-6 Practice', status: 'scheduled', type: 'regular' },
        
        // Tuesday - Multiple classes throughout the day
        { id: 10, classId: 'c3', className: 'TOEIC 850 - C1', teacherId: 't3', teacherName: 'Lê Văn C', roomId: 'r3', roomName: 'P.103', date: '2025-11-18', startTime: '08:00', endTime: '10:00', lessonNumber: 13, lessonTopic: 'Advanced Listening', status: 'scheduled', type: 'regular' },
        { id: 11, classId: 'c8', className: 'TOEIC Foundation', teacherId: 't8', teacherName: 'Bùi Thị H', roomId: 'r8', roomName: 'P.108', date: '2025-11-18', startTime: '08:00', endTime: '10:00', lessonNumber: 2, lessonTopic: 'Basic Grammar', status: 'scheduled', type: 'regular' },
        { id: 12, classId: 'c4', className: 'TOEIC 550 - A2', teacherId: 't4', teacherName: 'Phạm Thị D', roomId: 'r4', roomName: 'P.104', date: '2025-11-18', startTime: '08:00', endTime: '10:00', lessonNumber: 7, lessonTopic: 'Part 1-2 Practice', status: 'scheduled', type: 'regular' },
        
        { id: 13, classId: 'c5', className: 'TOEIC 750 - B2', teacherId: 't5', teacherName: 'Hoàng Văn E', roomId: 'r5', roomName: 'P.105', date: '2025-11-18', startTime: '10:00', endTime: '12:00', lessonNumber: 11, lessonTopic: 'Professional Communication', status: 'scheduled', type: 'regular' },
        { id: 14, classId: 'c9', className: 'TOEIC 600 Weekend', teacherId: 't9', teacherName: 'Ngô Văn I', roomId: 'r9', roomName: 'P.109', date: '2025-11-18', startTime: '10:00', endTime: '12:00', lessonNumber: 5, lessonTopic: 'Reading Strategies', status: 'scheduled', type: 'regular' },
        
        // Wednesday
        { id: 15, classId: 'c1', className: 'TOEIC 450 - A1', teacherId: 't1', teacherName: 'Nguyễn Văn A', roomId: 'r1', roomName: 'P.101', date: '2025-11-19', startTime: '08:00', endTime: '10:00', lessonNumber: 7, lessonTopic: 'Pronunciation', status: 'scheduled', type: 'regular' },
        { id: 16, classId: 'c2', className: 'TOEIC 650 - B1', teacherId: 't2', teacherName: 'Trần Thị B', roomId: 'r2', roomName: 'P.102', date: '2025-11-19', startTime: '14:00', endTime: '16:00', lessonNumber: 10, lessonTopic: 'Part 7 Practice', status: 'scheduled', type: 'regular' },
        { id: 17, classId: 'c3', className: 'TOEIC 850 - C1', teacherId: 't3', teacherName: 'Lê Văn C', roomId: 'r3', roomName: 'P.103', date: '2025-11-19', startTime: '16:00', endTime: '18:00', lessonNumber: 14, lessonTopic: 'Test Strategy', status: 'scheduled', type: 'regular' },
        
        // Thursday - High density day
        { id: 18, classId: 'c4', className: 'TOEIC 550 - A2', teacherId: 't4', teacherName: 'Phạm Thị D', roomId: 'r4', roomName: 'P.104', date: '2025-11-20', startTime: '08:00', endTime: '10:00', lessonNumber: 8, lessonTopic: 'Part 3-4 Practice', status: 'scheduled', type: 'regular' },
        { id: 19, classId: 'c5', className: 'TOEIC 750 - B2', teacherId: 't5', teacherName: 'Hoàng Văn E', roomId: 'r5', roomName: 'P.105', date: '2025-11-20', startTime: '08:00', endTime: '10:00', lessonNumber: 12, lessonTopic: 'Email Writing', status: 'scheduled', type: 'regular' },
        { id: 20, classId: 'c6', className: 'TOEIC 900+ - Expert', teacherId: 't6', teacherName: 'Vũ Thị F', roomId: 'r6', roomName: 'P.106', date: '2025-11-20', startTime: '08:00', endTime: '10:00', lessonNumber: 16, lessonTopic: 'Full Practice Test', status: 'completed', type: 'regular' },
        { id: 21, classId: 'c7', className: 'TOEIC Intensive', teacherId: 't7', teacherName: 'Đỗ Văn G', roomId: 'r7', roomName: 'P.107', date: '2025-11-20', startTime: '08:00', endTime: '10:00', lessonNumber: 5, lessonTopic: 'Grammar Review', status: 'scheduled', type: 'regular' },
        
        // Friday
        { id: 22, classId: 'c8', className: 'TOEIC Foundation', teacherId: 't8', teacherName: 'Bùi Thị H', roomId: 'r8', roomName: 'P.108', date: '2025-11-21', startTime: '14:00', endTime: '16:00', lessonNumber: 3, lessonTopic: 'Sentence Structure', status: 'scheduled', type: 'regular' },
        { id: 23, classId: 'c9', className: 'TOEIC 600 Weekend', teacherId: 't9', teacherName: 'Ngô Văn I', roomId: 'r9', roomName: 'P.109', date: '2025-11-21', startTime: '16:00', endTime: '18:00', lessonNumber: 6, lessonTopic: 'Listening Part 3', status: 'scheduled', type: 'regular' },
        
        // Saturday - Weekend classes
        { id: 24, classId: 'c1', className: 'TOEIC 450 - A1', teacherId: 't1', teacherName: 'Nguyễn Văn A', roomId: 'r1', roomName: 'P.101', date: '2025-11-22', startTime: '08:00', endTime: '10:00', lessonNumber: 8, lessonTopic: 'Weekend Practice', status: 'scheduled', type: 'regular' },
        { id: 25, classId: 'c2', className: 'TOEIC 650 - B1', teacherId: 't2', teacherName: 'Trần Thị B', roomId: 'r2', roomName: 'P.102', date: '2025-11-22', startTime: '10:00', endTime: '12:00', lessonNumber: 11, lessonTopic: 'Mock Test Review', status: 'scheduled', type: 'regular' },
        { id: 26, classId: 'c10', className: 'TOEIC Makeup Class', teacherId: 't1', teacherName: 'Nguyễn Văn A', roomId: 'r10', roomName: 'P.110', date: '2025-11-22', startTime: '14:00', endTime: '16:00', lessonNumber: 5, lessonTopic: 'Makeup: Vocabulary', status: 'scheduled', type: 'makeup' },
        
        // Sunday
        { id: 27, classId: 'c3', className: 'TOEIC 850 - C1', teacherId: 't3', teacherName: 'Lê Văn C', roomId: 'r3', roomName: 'P.103', date: '2025-11-23', startTime: '10:00', endTime: '12:00', lessonNumber: 15, lessonTopic: 'Final Review', status: 'scheduled', type: 'regular' },
      ];
      
      setSchedules(mockSchedules);
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
        name: `${t.firstName} ${t.lastName}`,
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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      await fetchSchedules();
      await fetchClasses();
      await fetchTeachers();
      await fetchRooms();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      await scheduleService.createSchedule(scheduleData);
      setShowCreateModal(false);
      alert('Tạo lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error creating schedule:', err);
      if (err.message && err.message.includes('conflict')) {
        alert(`Xung đột lịch học: ${err.message}`);
      } else {
        alert(err.message || 'Có lỗi xảy ra khi tạo lịch học!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      await scheduleService.updateSchedule(scheduleData.id, scheduleData);
      setShowEditModal(false);
      setSelectedSchedule(null);
      alert('Cập nhật lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error updating schedule:', err);
      alert(err.message || 'Có lỗi xảy ra khi cập nhật lịch học!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;
    
    try {
      setLoading(true);
      await scheduleService.deleteSchedule(scheduleId);
      alert('Xóa lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert(err.message || 'Có lỗi xảy ra khi xóa lịch học!');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMakeupClass = async (makeupData) => {
    try {
      setLoading(true);
      await scheduleService.createSchedule({ ...makeupData, type: 'makeup' });
      setShowMakeupModal(false);
      alert('Tạo lịch học bù thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error creating makeup class:', err);
      alert(err.message || 'Có lỗi xảy ra khi tạo lịch học bù!');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
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
    // TODO: Implement export functionality (Excel/PDF)
    alert('Chức năng xuất lịch học sẽ được triển khai sau!');
  };

  return (
    <Container fluid className="p-24">
      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-neutral-500">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-24">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h2 className="text-neutral-900 fw-bold mb-8">Quản lý lịch học</h2>
          <p className="text-neutral-500 mb-0">Sắp xếp và quản lý lịch học cho các lớp</p>
        </div>
        <div className="d-flex gap-12">
          <Button 
            className="btn-outline-main text-15 fw-medium px-20 py-10 radius-8"
            onClick={() => setShowRoomManagement(true)}
          >
            <i className="fas fa-door-open me-2"></i> Quản lý phòng học
          </Button>
          <Button 
            className="btn-outline-main text-15 fw-medium px-20 py-10 radius-8"
            onClick={handleExportSchedule}
          >
            <i className="fas fa-download me-2"></i> Xuất lịch học
          </Button>
          <Button 
            className="btn-main text-15 fw-semibold px-24 py-12 radius-8"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i> Tạo lịch học
          </Button>
        </div>
      </div>

      {/* Filters */}
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

            <Col md={2}>
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

      {/* View Toggle */}
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

      {/* Content */}
      <div>
        {viewMode === 'calendar' ? (
          <ScheduleCalendar 
            schedules={schedules}
            onEditSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowEditModal(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onCreateMakeup={(schedule) => {
              setSelectedSchedule(schedule);
              setShowMakeupModal(true);
            }}
          />
        ) : viewMode === 'weekly' ? (
          <ScheduleWeekly 
            schedules={schedules}
            onEditSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowEditModal(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onCreateMakeup={(schedule) => {
              setSelectedSchedule(schedule);
              setShowMakeupModal(true);
            }}
          />
        ) : (
          <ScheduleList 
            schedules={schedules}
            onEditSchedule={(schedule) => {
              setSelectedSchedule(schedule);
              setShowEditModal(true);
            }}
            onDeleteSchedule={handleDeleteSchedule}
            onCreateMakeup={(schedule) => {
              setSelectedSchedule(schedule);
              setShowMakeupModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
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

      {showEditModal && selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleEditSchedule}
          existingSchedules={schedules}
        />
      )}

      {showMakeupModal && selectedSchedule && (
        <MakeupClassModal
          originalSchedule={selectedSchedule}
          classes={classes}
          teachers={teachers}
          rooms={rooms}
          onClose={() => {
            setShowMakeupModal(false);
            setSelectedSchedule(null);
          }}
          onSubmit={handleCreateMakeupClass}
          existingSchedules={schedules}
        />
      )}

      {showRoomManagement && (
        <RoomManagement
          rooms={rooms}
          onClose={() => setShowRoomManagement(false)}
          onUpdate={fetchRooms}
        />
      )}
    </Container>
  );
};

export default ScheduleManagement;
