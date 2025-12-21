import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Alert, Spinner, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import roomService from '../../services/roomService';
import ScheduleCalendar from './ScheduleCalendar';
import { formatDateToYYYYMMDD } from '../../helper/helper';

/**
 * Room Management Component
 * Quản lý phòng học đầy đủ chức năng
 */
const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [todayRoomUsage, setTodayRoomUsage] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]); // Time slots from database
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSchedule, setRoomSchedule] = useState([]);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // table or calendar
  const [schedulePage, setSchedulePage] = useState(1); // Pagination for schedule table
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
    fetchTodayRoomUsage();
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

  const fetchTodayRoomUsage = async () => {
    try {
      const data = await roomService.getTodayRoomUsage();
      setTodayRoomUsage(data.roomSchedule || []);
      setTimeSlots(data.timeSlots || []); // Set time slots from API
    } catch (err) {
      console.error('Error fetching today room usage:', err);
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
        toast.success('Cập nhật phòng học thành công!');
      } else {
        await roomService.createRoom(formData);
        toast.success('Thêm phòng học thành công!');
      }
      
      handleCloseModal();
      fetchRooms();
      fetchStats();
    } catch (err) {
      console.error('Error saving room:', err);
      toast.error(err.message || 'Không thể lưu phòng học');
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
    const result = await Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa phòng học này?',
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
      await roomService.deleteRoom(roomId);
      toast.success('Xóa phòng học thành công!');
      handleCloseModal();
      fetchRooms();
      fetchStats();
    } catch (err) {
      console.error('Error deleting room:', err);
      toast.error(err.message || 'Không thể xóa phòng học');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchedule = async (room) => {
    setSelectedRoom(room);
    setScheduleViewMode('calendar'); // Reset to calendar view when opening modal
    setSchedulePage(1); // Reset to first page when opening modal
    try {
      setLoading(true);
      const data = await roomService.getRoomSchedule(room._id);
      setRoomSchedule(data.schedules || []);
      setShowScheduleModal(true);
    } catch (err) {
      console.error('Error fetching room schedule:', err);
      toast.error('Không thể tải lịch sử dụng phòng');
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

  // Format room schedule data for ScheduleCalendar component
  const formatRoomSchedulesForCalendar = useMemo(() => {
    return roomSchedule.map(schedule => {
      let dateStr = 'N/A';
      if (schedule.date) {
        if (schedule.date instanceof Date) {
          dateStr = formatDateToYYYYMMDD(schedule.date);
        } else if (typeof schedule.date === 'string') {
          dateStr = schedule.date.split('T')[0];
        }
      }
      
      // Determine className: if it's a make-up class (temporary) without a class, show "Lớp học bù"
      let className = schedule.class?.name;
      if (!className && schedule.status === 'temporary') {
        className = 'Lớp học bù';
      } else if (!className) {
        className = 'N/A';
      }
      
      // Extract program type: ưu tiên schedule.programType (từ backend cho buổi học bù),
      // sau đó mới fallback về schedule.class?.course?.program?.type
      const programType = schedule.programType || schedule.class?.course?.program?.type || schedule._course?.program?.type || null;
      
      return {
        id: schedule._id || schedule.id,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: className,
        topic: schedule.session?.title || schedule.topic || 'N/A',
        status: schedule.status || 'fixed',
        programType: programType
      };
    });
  }, [roomSchedule]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = !searchTerm || 
        room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchTerm, filterStatus]);

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

      {/* Search and Filter */}
      <Row className="mb-24">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Sẵn sàng</option>
            <option value="maintenance">Bảo trì</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-24">
          {error}
        </Alert>
      )}

      {/* Rooms List */}
      <Card className="bg-white border-0 rounded-12 box-shadow-sm">
        <Card.Header className="bg-white border-0 p-20">
          <h5 className="text-neutral-900 fw-bold mb-0">Danh sách phòng học</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-neutral-600 mt-3">Đang tải danh sách phòng...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-door-open fa-3x text-neutral-300 mb-3"></i>
              <p className="text-neutral-600">Không có phòng nào</p>
            </div>
          ) : (
            <Table hover className="mb-0">
              <thead style={{ backgroundColor: 'var(--neutral-50)' }}>
                <tr>
                  <th className="px-16 py-12 text-13 fw-medium">Tên phòng</th>
                  <th className="px-16 py-12 text-13 fw-medium">Vị trí</th>
                  <th className="px-16 py-12 text-13 fw-medium">Sức chứa</th>
                  <th className="px-16 py-12 text-13 fw-medium">Trạng thái</th>
                  <th className="px-16 py-12 text-13 fw-medium text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room._id}>
                    <td className="px-16 py-12">
                      <div className="text-neutral-900 fw-semibold text-14">{room.room_name}</div>
                    </td>
                    <td className="px-16 py-12">
                      <div className="text-neutral-600 text-13">{room.location}</div>
                    </td>
                    <td className="px-16 py-12">
                      <div className="text-neutral-600 text-13">{room.capacity} người</div>
                    </td>
                    <td className="px-16 py-12">
                      {getStatusBadge(room.status)}
                    </td>
                    <td className="px-16 py-12 text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleViewSchedule(room)}
                      >
                        <i className="fas fa-calendar me-1"></i>
                        Lịch
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(room)}
                      >
                        <i className="fas fa-edit me-1"></i>
                        Sửa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

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
            {editingRoom && (
              <Button
                variant="danger"
                onClick={() => handleDelete(editingRoom._id)}
                disabled={loading}
              >
                <i className="fas fa-trash me-1"></i>
                Xóa
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : (editingRoom ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Room Schedule Modal */}
      <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Lịch sử dụng - {selectedRoom?.room_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div className="mb-3 d-flex gap-5">
              <div className="text-muted">Vị trí: {selectedRoom.location}</div>
              <div className="text-muted" style={{ marginLeft: '4rem' }}>Sức chứa: {selectedRoom.capacity} người</div>
            </div>
          )}

          {/* View Toggle Buttons */}
          <div className="d-flex justify-content-end mb-3">
            <div className="btn-group">
              <Button
                variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => {
                  setScheduleViewMode('calendar');
                  setSchedulePage(1); // Reset page when switching view
                }}
              >
                <i className="fas fa-calendar me-2"></i>
                Calendar
              </Button>
              <Button
                variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => {
                  setScheduleViewMode('table');
                  setSchedulePage(1); // Reset page when switching view
                }}
              >
                <i className="fas fa-list me-2"></i>
                Bảng
              </Button>
            </div>
          </div>
          
          {/* Table View */}
          {scheduleViewMode === 'table' && (() => {
            const itemsPerPage = 8;
            const totalPages = Math.ceil(roomSchedule.length / itemsPerPage);
            const startIndex = (schedulePage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedSchedules = roomSchedule.slice(startIndex, endIndex);

            return (
              <>
                {roomSchedule.length > 0 ? (
                  <>
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
                        {paginatedSchedules.map((schedule, index) => (
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
                              {schedule.status === 'temporary' && !schedule.class?.name 
                                ? 'Lớp học bù' 
                                : (schedule.class?.name || 'N/A')}
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
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center mt-3 gap-3">
                        <Pagination className="mb-0">
                          <Pagination.First 
                            onClick={() => setSchedulePage(1)} 
                            disabled={schedulePage === 1}
                          />
                          <Pagination.Prev 
                            onClick={() => setSchedulePage(Math.max(1, schedulePage - 1))} 
                            disabled={schedulePage === 1}
                          />
                          {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= schedulePage - 1 && pageNum <= schedulePage + 1)
                            ) {
                              return (
                                <Pagination.Item
                                  key={pageNum}
                                  active={pageNum === schedulePage}
                                  onClick={() => setSchedulePage(pageNum)}
                                >
                                  {pageNum}
                                </Pagination.Item>
                              );
                            } else if (
                              pageNum === schedulePage - 2 ||
                              pageNum === schedulePage + 2
                            ) {
                              return <Pagination.Ellipsis key={pageNum} />;
                            }
                            return null;
                          })}
                          <Pagination.Next 
                            onClick={() => setSchedulePage(Math.min(totalPages, schedulePage + 1))} 
                            disabled={schedulePage === totalPages}
                          />
                          <Pagination.Last 
                            onClick={() => setSchedulePage(totalPages)} 
                            disabled={schedulePage === totalPages}
                          />
                        </Pagination>
                        <div className="text-neutral-600 text-13">
                          Trang {schedulePage} / {totalPages} ({roomSchedule.length} buổi)
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Chưa có lịch sử dụng
                  </div>
                )}
              </>
            );
          })()}

          {/* Calendar View */}
          {scheduleViewMode === 'calendar' && (
            <>
              {roomSchedule.length > 0 ? (
                <>
                  <ScheduleCalendar
                    schedules={formatRoomSchedulesForCalendar}
                    onEditSchedule={() => {}}
                    onDeleteSchedule={() => {}}
                    onCreateMakeup={() => {}}
                    readOnly={true}
                  />
                </>
              ) : (
                <div className="text-center py-4 text-muted">
                  Chưa có lịch sử dụng
                </div>
              )}
            </>
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

export default RoomManagement;
