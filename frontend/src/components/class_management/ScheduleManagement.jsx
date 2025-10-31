import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, ButtonGroup, Form, Row, Col, Badge } from 'react-bootstrap';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleWeekly from './ScheduleWeekly';
import ScheduleList from './ScheduleList';
import CreateScheduleModal from './CreateScheduleModal';
import EditScheduleModal from './EditScheduleModal';
import MakeupClassModal from './MakeupClassModal';
import RoomManagement from './RoomManagement';

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
      // TODO: Replace with actual API call
      const response = await fetch('/api/schedules?' + new URLSearchParams(filters));
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      // Mock data for development
      setSchedules([
        {
          id: 1,
          classId: 1,
          className: 'A1-Morning-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'Room 101',
          date: '2025-10-29',
          startTime: '08:00',
          endTime: '10:00',
          lessonNumber: 1,
          lessonTopic: 'Introduction to English',
          status: 'scheduled',
          type: 'regular'
        },
        {
          id: 2,
          classId: 1,
          className: 'A1-Morning-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'Room 101',
          date: '2025-10-31',
          startTime: '08:00',
          endTime: '10:00',
          lessonNumber: 2,
          lessonTopic: 'Basic Grammar',
          status: 'scheduled',
          type: 'regular'
        }
      ]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Mock data
      setClasses([
        { id: 1, name: 'A1-Morning-01', level: 'A1', students: 20 },
        { id: 2, name: 'A2-Evening-01', level: 'A2', students: 18 },
        { id: 3, name: 'B1-Weekend-01', level: 'B1', students: 15 }
      ]);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      // Mock data
      setTeachers([
        { id: 1, name: 'Nguyễn Văn A', email: 'teachera@example.com' },
        { id: 2, name: 'Trần Thị B', email: 'teacherb@example.com' },
        { id: 3, name: 'Lê Văn C', email: 'teacherc@example.com' }
      ]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Mock data
      setRooms([
        { id: 1, name: 'Room 101', capacity: 25, equipment: ['Projector', 'Whiteboard'] },
        { id: 2, name: 'Room 102', capacity: 30, equipment: ['Projector', 'Whiteboard', 'Computer'] },
        { id: 3, name: 'Room 201', capacity: 20, equipment: ['Whiteboard'] }
      ]);
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
      // TODO: Replace with actual API call
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowCreateModal(false);
      alert('Tạo lịch học thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Có lỗi xảy ra khi tạo lịch học!');
    }
  };

  const handleEditSchedule = async (scheduleData) => {
    try {
      const response = await fetch(`/api/schedules/${scheduleData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData)
      });
      const updatedSchedule = await response.json();
      setSchedules(schedules.map(s => s.id === updatedSchedule.id ? updatedSchedule : s));
      setShowEditModal(false);
      setSelectedSchedule(null);
      alert('Cập nhật lịch học thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Có lỗi xảy ra khi cập nhật lịch học!');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch học này?')) return;
    
    try {
      await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' });
      setSchedules(schedules.filter(s => s.id !== scheduleId));
      alert('Xóa lịch học thành công!');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Có lỗi xảy ra khi xóa lịch học!');
    }
  };

  const handleCreateMakeupClass = async (makeupData) => {
    try {
      const response = await fetch('/api/schedules/makeup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(makeupData)
      });
      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowMakeupModal(false);
      alert('Tạo lịch học bù thành công!');
      fetchSchedules();
    } catch (error) {
      console.error('Error creating makeup class:', error);
      alert('Có lỗi xảy ra khi tạo lịch học bù!');
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
