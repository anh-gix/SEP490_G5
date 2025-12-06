import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Button, ButtonGroup, Form, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
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
      
      const response = await scheduleService.getAllSchedules(params);
      
      // Transform API response to match component's expected format
      const transformedSchedules = (response.schedules || response.data || []).map(sch => {
        // Format date to YYYY-MM-DD
        let dateStr = 'N/A';
        if (sch.date) {
          if (sch.date instanceof Date) {
            dateStr = sch.date.toISOString().split('T')[0];
          } else if (typeof sch.date === 'string') {
            dateStr = sch.date.split('T')[0];
          }
        }
        
        return {
          id: sch._id || sch.id,
          classId: sch.class?._id || sch.classId,
          className: sch.class?.name || 'N/A',
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
          type: sch.type || 'regular'
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

  const handleEditSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      await scheduleService.updateSchedule(scheduleData.id, scheduleData);
      setShowEditModal(false);
      setSelectedSchedule(null);
      toast.success('Cập nhật lịch học thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error updating schedule:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi cập nhật lịch học!');
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

  const handleCreateMakeupClass = async (makeupData) => {
    try {
      setLoading(true);
      await scheduleService.createSchedule({ ...makeupData, type: 'makeup' });
      setShowMakeupModal(false);
      toast.success('Tạo lịch học bù thành công!');
      await fetchSchedules();
    } catch (err) {
      console.error('Error creating makeup class:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi tạo lịch học bù!');
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
    toast.info('Chức năng xuất lịch học sẽ được triển khai sau!');
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
            onClick={handleExportSchedule}
          >
            <i className="fas fa-download me-2"></i> Xuất lịch học
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
