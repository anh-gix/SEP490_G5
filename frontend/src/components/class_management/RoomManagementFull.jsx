import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup } from 'react-bootstrap';
import roomService from '../../services/roomService';

/**
 * Room Management Full Component
 * Quản lý phòng học đầy đủ chức năng
 */
const RoomManagementFull = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSchedule, setRoomSchedule] = useState([]);
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
      setError(err.message || 'Không thể lưu phòng học');
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
      setError(err.message || 'Không thể xóa phòng học');
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
      setError(err.message || 'Không thể tải lịch sử dụng phòng');
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

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Phòng học</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và trang thiết bị phòng học</p>
        </div>
        <Button className="btn-main px-20 py-12 radius-8" onClick={() => setShowModal(true)}>
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

      {/* Filters & View Toggle */}
      <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm mb-24">
        <Card.Body className="p-20">
          <Row className="align-items-center g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-neutral-50 border-neutral-200">
                  <i className="fas fa-search text-neutral-400"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm phòng học..."
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
                className="radius-8"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Sẵn sàng</option>
                <option value="in_use">Đang sử dụng</option>
                <option value="maintenance">Bảo trì</option>
              </Form.Select>
            </Col>
            <Col md={5} className="text-end">
              <Button
                className={viewMode === 'grid' ? 'btn-main' : 'btn-outline-main'}
                onClick={() => setViewMode('grid')}
                style={{ marginRight: '8px' }}
              >
                <i className="fas fa-th"></i>
              </Button>
              <Button
                className={viewMode === 'list' ? 'btn-main' : 'btn-outline-main'}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Rooms Display */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && viewMode === 'grid' ? (
        <Row className="g-3">
          {filteredRooms.map(room => (
            <Col md={6} lg={4} key={room._id}>
              <Card className="bg-white border border-neutral-100 rounded-12 box-shadow-sm h-100 hover-shadow transition-2">
                <Card.Body className="p-20">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-16">
                    <div>
                      <h5 className="text-neutral-900 fw-bold mb-4">{room.room_name}</h5>
                      <div className="text-neutral-600 text-13">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {room.location}
                      </div>
                    </div>
                    {getStatusBadge(room.status)}
                  </div>

                  {/* Capacity */}
                  <div className="bg-neutral-50 rounded-8 p-12 mb-16">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-neutral-600 text-13">
                        <i className="fas fa-users me-2"></i>
                        Sức chứa
                      </span>
                      <span className="text-neutral-900 fw-bold text-16">{room.capacity} người</span>
                    </div>
                  </div>

                  {room.description && (
                    <p className="text-neutral-600 text-13 mb-16">{room.description}</p>
                  )}

                  {/* Actions */}
                  <div className="d-flex gap-8">
                    <button 
                      className="btn-outline-main flex-grow-1 text-13 px-12 py-8 radius-6"
                      onClick={() => handleViewSchedule(room)}
                    >
                      <i className="fas fa-calendar me-1"></i>
                      Lịch sử dụng
                    </button>
                    <Button 
                      className="btn-outline-info text-13 px-12 py-8 radius-6"
                      onClick={() => handleEdit(room)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      className="btn-outline-danger text-13 px-12 py-8 radius-6"
                      onClick={() => handleDelete(room._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className="bg-white border border-neutral-30 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Phòng</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Vị trí</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Sức chứa</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td className="px-20 py-16">
                      <div className="text-neutral-900 fw-semibold text-14">{room.room_name}</div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-13">{room.location}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 text-13">{room.capacity} người</td>
                    <td className="px-20 py-16">{getStatusBadge(room.status)}</td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8 justify-content-center">
                        <Button 
                          className="btn-outline-main text-12 px-12 py-6 radius-6"
                          onClick={() => handleViewSchedule(room)}
                        >
                          <i className="fas fa-calendar me-1"></i>
                          Lịch
                        </Button>
                        <Button 
                          className="btn-outline-info text-12 px-12 py-6 radius-6"
                          onClick={() => handleEdit(room)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          className="btn-outline-danger text-12 px-12 py-6 radius-6"
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingRoom ? 'Chỉnh sửa phòng học' : 'Thêm phòng mới'}</Modal.Title>
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
                    placeholder="VD: Room 101"
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
                    placeholder="VD: 30"
                    required
                    min="1"
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
                    placeholder="VD: Building A - Floor 1"
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Mô tả thêm về phòng học..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn-outline-neutral" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit" className="btn-main">
              <i className="fas fa-save me-2"></i>
              {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Room Schedule Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Lịch sử dụng phòng {selectedRoom?.room_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <>
              <div className="bg-main-25 rounded-8 p-16 mb-20">
                <Row>
                  <Col md={6}>
                    <div className="text-neutral-600 text-12 mb-4">Vị trí</div>
                    <div className="text-neutral-900 fw-semibold text-14">{selectedRoom.location}</div>
                  </Col>
                  <Col md={6}>
                    <div className="text-neutral-600 text-12 mb-4">Sức chứa</div>
                    <div className="text-neutral-900 fw-semibold text-14">{selectedRoom.capacity} người</div>
                  </Col>
                </Row>
              </div>
              
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
                        <td className="px-16 py-12 text-13">
                          <div>{new Date(schedule.date).toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted text-11">{schedule.startTime} - {schedule.endTime}</div>
                        </td>
                        <td className="px-16 py-12 text-13">{schedule.class?.name || 'N/A'}</td>
                        <td className="px-16 py-12 text-13">{schedule.session?.title || schedule.topic || 'N/A'}</td>
                        <td className="px-16 py-12">
                          <Badge className={schedule.status === 'approved' ? 'bg-success-600 text-white' : 'bg-info-500 text-white'}>
                            {schedule.status}
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
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn-outline-neutral" onClick={() => setShowScheduleModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RoomManagementFull;
