import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup } from 'react-bootstrap';
import roomService from '../../services/roomService';
import scheduleService from '../../services/scheduleService';
import ScheduleCalendar from './ScheduleCalendar';
import { formatDateToYYYYMMDD } from '../../helper/helper';

/**
 * Room Management Full Component with API Integration
 * Quản lý phòng học đầy đủ chức năng
 */
const RoomManagementFull = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or list
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [allRoomSchedules, setAllRoomSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    room_name: '',
    capacity: '',
    location: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchRooms();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchAllRoomSchedules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, rooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      
      const data = await roomService.getAllRooms(params);
      setRooms(data.rooms || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message || 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await roomService.getRoomStats();
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchAllRoomSchedules = async () => {
    try {
      // Get current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = formatDateToYYYYMMDD(firstDay);
      const endDate = formatDateToYYYYMMDD(lastDay);
      
      // Fetch schedules for all rooms
      const response = await scheduleService.getAllSchedules({
        startDate,
        endDate
      });
      
      const schedules = response.schedules || response.data || [];
      
      // Format schedules for ScheduleCalendar component
      const formattedSchedules = schedules
        .filter(sch => sch.room) // Only schedules with room
        .map(sch => {
          let dateStr = 'N/A';
          if (sch.date) {
            if (sch.date instanceof Date) {
              dateStr = formatDateToYYYYMMDD(sch.date);
            } else if (typeof sch.date === 'string') {
              dateStr = sch.date.split('T')[0];
            }
          }
          
          const className = sch.class?.name || 'N/A';
          const roomName = sch.room?.room_name || 'N/A';
          
          return {
            id: sch._id || sch.id,
            date: dateStr,
            startTime: sch.startTime || '',
            endTime: sch.endTime || '',
            className: `${className} - ${roomName}`, // Hiển thị cả tên lớp và tên phòng
            roomName: roomName,
            roomId: sch.room?._id || sch.roomId,
            topic: sch.session?.title || sch.topic || 'N/A',
            status: sch.status || 'fixed'
          };
        });
      
      setAllRoomSchedules(formattedSchedules);
    } catch (err) {
      console.error('Error fetching room schedules:', err);
      setAllRoomSchedules([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, formData);
        alert('Cập nhật phòng học thành công!');
      } else {
        await roomService.createRoom(formData);
        alert('Thêm phòng học thành công!');
      }
      
      handleCloseModal();
      fetchRooms();
      fetchStats();
    } catch (err) {
      console.error('Error saving room:', err);
      alert(err.message || 'Không thể lưu phòng học');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_name: room.room_name,
      capacity: room.capacity,
      location: room.location,
      status: room.status,
      description: room.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng học này?')) return;
    
    try {
      setLoading(true);
      await roomService.deleteRoom(roomId);
      alert('Xóa phòng học thành công!');
      fetchRooms();
      fetchStats();
    } catch (err) {
      console.error('Error deleting room:', err);
      alert(err.message || 'Không thể xóa phòng học');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = async (room) => {
    setSelectedRoom(room);
    try {
      setLoading(true);
      const data = await roomService.getRoomSchedule(room._id);
      setRoomSchedule(data.schedules || []);
      setShowScheduleModal(true);
    } catch (err) {
      console.error('Error fetching room schedule:', err);
      alert('Không thể tải lịch sử dụng phòng');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
    setFormData({
      room_name: '',
      capacity: '',
      location: '',
      status: 'available',
      description: ''
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      available: { bg: 'bg-success-600', text: 'Sẵn sàng', icon: 'fa-check-circle' },
      in_use: { bg: 'bg-info-600', text: 'Đang sử dụng', icon: 'fa-door-open' },
      maintenance: { bg: 'bg-warning-600', text: 'Bảo trì', icon: 'fa-tools' }
    };
    const { bg, text, icon } = config[status] || config.available;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  const filteredRooms = rooms;

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Phòng học</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và lịch sử dụng phòng học</p>
        </div>
        <Button 
          className="btn-main px-20 py-10 radius-8"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Thêm phòng mới
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-24">
        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #0D74FF 0%, #0A5FD9 100%)'
                  }}
                >
                  <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng phòng</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.total || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  }}
                >
                  <i className="fas fa-check-circle text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Đang hoạt động</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.available || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                  }}
                >
                  <i className="fas fa-tools text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Bảo trì</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.maintenance || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="bg-white border-0 rounded-12 box-shadow-sm">
            <Card.Body className="p-20">
              <div className="d-flex align-items-center gap-16">
                <div 
                  className="rounded-12 d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  }}
                >
                  <i className="fas fa-calendar-check text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Lịch hôm nay</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.todaySchedules || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters and View Toggle */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                  <i className="fas fa-search text-neutral-600"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Tìm theo tên phòng hoặc vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-neutral-200"
                />
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border-neutral-200"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Sẵn sàng</option>
                <option value="in_use">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
              </Form.Select>
            </Col>

            <Col md={5} className="text-end">
              <div className="btn-group">
                <Button
                  variant={viewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('calendar')}
                  className="px-16"
                >
                  <i className="fas fa-calendar me-2"></i>
                  Calendar
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('list')}
                  className="px-16"
                >
                  <i className="fas fa-list me-2"></i>
                  List
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* List View */}
      {!loading && !error && viewMode === 'list' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Phòng</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Vị trí</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Sức chứa</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{room.room_name}</div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{room.location}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {room.capacity}
                    </td>
                    <td className="px-20 py-16">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewSchedule(room)}
                        >
                          <i className="fas fa-calendar me-1"></i>
                          Lịch
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEdit(room)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(room._id)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Calendar View */}
      {!loading && !error && viewMode === 'calendar' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-20">
            <ScheduleCalendar
              schedules={allRoomSchedules}
              onEditSchedule={() => {}}
              onDeleteSchedule={() => {}}
              onCreateMakeup={() => {}}
            />
          </Card.Body>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Cập nhật phòng học' : 'Thêm phòng mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tên phòng <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="room_name"
                    value={formData.room_name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Room 101"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Sức chứa <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Số người"
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label>Vị trí <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Building A - Floor 1"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="available">Sẵn sàng</option>
                    <option value="in_use">Đang sử dụng</option>
                    <option value="maintenance">Bảo trì</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Mô tả</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả về phòng học..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={loading}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : (editingRoom ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Room Schedule Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Lịch sử dụng - {selectedRoom?.room_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="mb-3">
              <div className="text-muted">Vị trí: {selectedRoom.location}</div>
              <div className="text-muted">Sức chứa: {selectedRoom.capacity} người</div>
            </div>
          )}
          
          {roomSchedule.length > 0 ? (
            <Table hover>
              <thead className="bg-neutral-25">
                <tr>
                  <th className="px-16 py-12 text-13">Thời gian</th>
                  <th className="px-16 py-12 text-13">Lớp học</th>
                  <th className="px-16 py-12 text-13">Chủ đề</th>
                  <th className="px-16 py-12 text-13">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {roomSchedule.map((schedule, index) => (
                  <tr key={index}>
                    <td className="px-16 py-12">
                      <div className="text-14">
                        {new Date(schedule.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-13 text-muted">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </td>
                    <td className="px-16 py-12">
                      {schedule.class?.name || 'N/A'}
                    </td>
                    <td className="px-16 py-12">
                      {schedule.session?.title || schedule.topic || 'N/A'}
                    </td>
                    <td className="px-16 py-12">
                      <Badge bg={schedule.status === 'fixed' ? 'success' : schedule.status === 'temporary' ? 'warning' : 'secondary'}>
                        {schedule.status === 'fixed' ? 'Buổi cố định' : schedule.status === 'temporary' ? 'Buổi tạm' : schedule.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4 text-muted">
              Chưa có lịch sử dụng
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagementFull;
