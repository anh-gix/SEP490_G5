import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Nav, Tabs, Tab, Pagination, ButtonGroup } from 'react-bootstrap';
import studentService from '../../services/studentService';
import ScheduleCalendar from './ScheduleCalendar';

/**
 * Student Management Component with API Integration
 * Quản lý Học viên đầy đủ chức năng
 */
const StudentManagementAPI = () => {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // 'table' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    fetchStudents();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      
      const data = await studentService.getAllStudents(params);
      setStudents(data.students || []);
    } catch (err) {
      console.error('Error fetching students:', err);
      // Handle 404 errors more gracefully
      const errorMessage = err.message || (typeof err === 'string' ? err : 'Không thể tải danh sách Học viên');
      if (err.status === 404 || err.response?.status === 404 || errorMessage.includes('Route not found') || errorMessage.includes('404')) {
        setError('API endpoint chưa được triển khai. Vui lòng liên hệ quản trị viên.');
        setStudents([]); // Set empty array to prevent further errors
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await studentService.getStudentStats();
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Set default stats if API fails
      const errorMessage = err.message || (typeof err === 'string' ? err : '');
      if (err.status === 404 || err.response?.status === 404 || errorMessage.includes('Route not found') || errorMessage.includes('404')) {
        setStats({ total: 0, active: 0, inactive: 0, totalClasses: 0 });
      }
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
      if (editingStudent) {
        // Update: Xóa password nếu không thay đổi
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await studentService.updateStudent(editingStudent._id, updateData);
        alert('Cập nhật Học viên thành công!');
      } else {
        // Create: Yêu cầu password
        if (!formData.password) {
          alert('Vui lòng nhập mật khẩu!');
          return;
        }
        await studentService.createStudent(formData);
        alert('Thêm Học viên thành công!');
      }
      
      handleCloseModal();
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Error saving student:', err);
      alert(err.message || 'Không thể lưu thông tin Học viên');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '', // Leave empty for update
      fullName: student.fullName,
      phone: student.phone || '',
      address: student.address || '',
      status: student.status
    });
    setShowModal(true);
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa Học viên này?')) return;
    
    try {
      setLoading(true);
      await studentService.deleteStudent(studentId);
      alert('Xóa Học viên thành công!');
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Error deleting student:', err);
      alert(err.message || 'Không thể xóa Học viên');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (student) => {
    try {
      setLoading(true);
      const data = await studentService.getStudentById(student._id);
      setSelectedStudent(data.student);
      
      // Fetch Student's schedule
      const scheduleData = await studentService.getStudentSchedule(student._id);
      setStudentSchedule(scheduleData.schedules || []);
      setSchedulePage(1); // Reset to first page when opening modal
      
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching Student details:', err);
      alert('Không thể tải thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
      address: '',
      status: 'active'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-success-600', text: 'Hoạt động', icon: 'fa-check-circle' },
      inactive: { bg: 'bg-danger-600', text: 'Tạm nghỉ', icon: 'fa-times-circle' }
    };
    const { bg, text, icon } = config[status] || config.active;
    return (
      <Badge className={`${bg} text-white px-12 py-6`}>
        <i className={`fas ${icon} me-1`}></i>
        {text}
      </Badge>
    );
  };

  const filteredStudents = students;

  // Transform schedule data for calendar view
  const calendarSchedules = useMemo(() => {
    return studentSchedule.map((schedule, index) => {
      const scheduleDate = new Date(schedule.date);
      const dateStr = scheduleDate.toISOString().split('T')[0];
      
      // Get attendance status
      const attendanceStatus = schedule.attendance?.status || null;
      
      return {
        id: schedule._id || index,
        date: dateStr,
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        className: schedule.class?.name || 'N/A',
        roomName: schedule.room?.room_name || 'N/A',
        topic: schedule.topic || '',
        status: schedule.status === 'fixed' ? 'scheduled' : schedule.status === 'temporary' ? 'makeup' : 'scheduled',
        attendanceStatus: attendanceStatus, // 'present', 'absent', 'late', 'excused', or null
        hasAttendance: !!attendanceStatus,
        teacherName: schedule.teacher?.username || 'N/A',
        lessonNumber: schedule.session?.order || '',
        lessonTopic: schedule.topic || ''
      };
    });
  }, [studentSchedule]);

  return (
    <Container fluid className="py-24 px-24" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-24">
        <div>
          <h4 className="text-neutral-900 fw-bold mb-8">Quản lý Học viên</h4>
          <p className="text-neutral-600 mb-0">Quản lý thông tin và lịch học</p>
        </div>
        <Button 
          className="btn-main px-20 py-10 radius-8"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          <i className="fas fa-plus me-2"></i>
          Thêm Học viên
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
                  <i className="fas fa-chalkboard-Student text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng Học viên</div>
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
                  <i className="fas fa-user-check text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Đang hoạt động</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.active || 0}</div>
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
                  <i className="fas fa-door-open text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng lớp</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.totalClasses || 0}</div>
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
                  <i className="fas fa-user-slash text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tạm nghỉ</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.inactive || 0}</div>
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
                  placeholder="Tìm theo tên, email..."
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm nghỉ</option>
              </Form.Select>
            </Col>

            <Col md={5} className="text-end">
              <div className="btn-group">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
                  onClick={() => setViewMode('grid')}
                  className="px-16"
                >
                  <i className="fas fa-th me-2"></i>
                  Grid
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

      {/* Grid View */}
      {!loading && !error && viewMode === 'grid' && (
        <Row className="g-3">
          {filteredStudents.map(student => (
            <Col key={student._id} lg={4} md={6}>
              <Card className="bg-white border-0 rounded-12 box-shadow-sm h-100">
                <Card.Body className="p-20">
                  <div className="d-flex align-items-start gap-16 mb-16">
                    <div 
                      className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                      style={{ width: '56px', height: '56px', flexShrink: 0 }}
                    >
                      <i className="fas fa-user-graduate text-primary" style={{ fontSize: '24px' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-neutral-900 fw-semibold mb-4">{student.fullName}</h6>
                      <p className="text-neutral-600 text-13 mb-0">{student.email}</p>
                    </div>
                    {getStatusBadge(student.status)}
                  </div>

                  <div className="mb-16">
                    <div className="d-flex align-items-center gap-8 mb-8">
                      <i className="fas fa-door-open text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Lớp: {student.stats?.classCount || 0} lớp
                      </span>
                    </div>
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-users text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Học viên: {student.stats?.totalStudents || 0} người
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-8">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetail(student)}
                      className="flex-grow-1"
                    >
                      <i className="fas fa-eye me-1"></i>
                      Chi tiết
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleEdit(student)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(student._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* List View */}
      {!loading && !error && viewMode === 'list' && (
        <Card className="bg-white border-0 rounded-12 box-shadow-sm">
          <Card.Body className="p-0">
            <Table hover className="mb-0">
              <thead>
                <tr className="bg-neutral-25">
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Học viên</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Email</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Số điện thoại</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0 text-center">Lớp học</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Trạng thái</th>
                  <th className="px-20 py-16 text-neutral-900 fw-semibold text-13 border-0">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student._id}>
                    <td className="px-20 py-16">
                      <div className="d-flex align-items-center gap-12">
                        <div 
                          className="rounded-circle bg-primary-50 d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <i className="fas fa-user-graduate text-primary"></i>
                        </div>
                        <div className="text-neutral-900 fw-semibold text-14">{student.fullName}</div>
                      </div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{student.email}</td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{student.phone || 'N/A'}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {student.stats?.classCount || 0}
                    </td>
                    <td className="px-20 py-16">
                      {getStatusBadge(student.status)}
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewDetail(student)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          Chi tiết
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(student._id)}
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
          <Modal.Title>{editingStudent ? 'Cập nhật Học viên' : 'Thêm Học viên mới'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tên đăng nhập <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    required
                    disabled={!!editingStudent}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    Mật khẩu {!editingStudent && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingStudent ? "Để trống nếu không đổi" : "Nhập mật khẩu"}
                    required={!editingStudent}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Họ tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm nghỉ</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ liên hệ..."
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
              {loading ? 'Đang lưu...' : (editingStudent ? 'Cập nhật' : 'Thêm mới')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Student Detail Modal */}
      <Modal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSchedulePage(1); }} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết Học viên - {selectedStudent?.fullName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStudent && (
            <Tabs defaultActiveKey="info" className="mb-3">
              {/* Info Tab */}
              <Tab eventKey="info" title={<><i className="fas fa-user me-2"></i>Thông tin</>}>
                <Row className="g-3">
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Email</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedStudent.email}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Số điện thoại</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedStudent.phone || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={12}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Địa chỉ</h6>
                        <p className="text-14 text-neutral-900 mb-0">{selectedStudent.address || 'N/A'}</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="border-0 bg-neutral-25">
                      <Card.Body className="p-16">
                        <h6 className="text-13 text-neutral-500 mb-8">Trạng thái</h6>
                        {getStatusBadge(selectedStudent.status)}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              {/* Classes Tab */}
              <Tab eventKey="classes" title={<><i className="fas fa-door-open me-2"></i>Lớp học ({selectedStudent.classes?.length || 0})</>}>
                {selectedStudent.classes && selectedStudent.classes.length > 0 ? (
                  <Table hover>
                    <thead className="bg-neutral-25">
                      <tr>
                        <th className="px-16 py-12 text-13">Lớp</th>
                        <th className="px-16 py-12 text-13">Khóa học</th>
                        <th className="px-16 py-12 text-13">Trình độ</th>
                        <th className="px-16 py-12 text-13">Học viên</th>
                        <th className="px-16 py-12 text-13">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.classes.map((cls, index) => (
                        <tr key={index}>
                          <td className="px-16 py-12 fw-semibold">{cls.name}</td>
                          <td className="px-16 py-12">{cls.course?.name || 'N/A'}</td>
                          <td className="px-16 py-12">
                            <Badge bg="info">{cls.level}</Badge>
                          </td>
                          <td className="px-16 py-12">{cls.students?.length || 0}</td>
                          <td className="px-16 py-12">
                            <Badge bg={cls.status === 'active' ? 'success' : 'secondary'}>
                              {cls.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Chưa có lớp học nào
                  </div>
                )}
              </Tab>

              {/* Schedule Tab */}
              <Tab eventKey="schedule" title={<><i className="fas fa-calendar me-2"></i>lịch học</>}>
                {studentSchedule.length > 0 ? (
                  <>
                    {/* View Toggle */}
                    <div className="d-flex justify-content-end mb-3">
                      <ButtonGroup>
                        <Button
                          variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('table')}
                        >
                          <i className="fas fa-table me-2"></i>
                          Bảng
                        </Button>
                        <Button
                          variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('calendar')}
                        >
                          <i className="fas fa-calendar-alt me-2"></i>
                          Lịch
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Table View */}
                    {scheduleViewMode === 'table' && (
                      <>
                        <Table hover>
                          <thead className="bg-neutral-25">
                            <tr>
                              <th className="px-16 py-12 text-13">Thời gian</th>
                              <th className="px-16 py-12 text-13">Lớp học</th>
                              <th className="px-16 py-12 text-13">Phòng</th>
                              <th className="px-16 py-12 text-13">Chủ đề</th>
                              <th className="px-16 py-12 text-13">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentSchedule
                              .slice((schedulePage - 1) * 10, schedulePage * 10)
                              .map((schedule, index) => (
                              <tr key={index}>
                                <td className="px-16 py-12">
                                  <div className="text-14">
                                    {new Date(schedule.date).toLocaleDateString('vi-VN')}
                                  </div>
                                  <div className="text-13 text-muted">
                                    {schedule.startTime} - {schedule.endTime}
                                  </div>
                                </td>
                                <td className="px-16 py-12">{schedule.class?.name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.room?.room_name || 'N/A'}</td>
                                <td className="px-16 py-12">{schedule.topic}</td>
                                <td className="px-16 py-12">
                                  <Badge bg={schedule.status === 'fixed' ? 'success' : schedule.status === 'temporary' ? 'warning' : 'secondary'}>
                                    {schedule.status === 'fixed' ? 'Buổi cố định' : schedule.status === 'temporary' ? 'Buổi tạm' : schedule.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                        {studentSchedule.length > 10 && (
                          <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                              <Pagination.First 
                                onClick={() => setSchedulePage(1)} 
                                disabled={schedulePage === 1}
                              />
                              <Pagination.Prev 
                                onClick={() => setSchedulePage(prev => Math.max(1, prev - 1))} 
                                disabled={schedulePage === 1}
                              />
                              {[...Array(Math.ceil(studentSchedule.length / 10))].map((_, i) => {
                                const page = i + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === Math.ceil(studentSchedule.length / 10) ||
                                  (page >= schedulePage - 1 && page <= schedulePage + 1)
                                ) {
                                  return (
                                    <Pagination.Item
                                      key={page}
                                      active={page === schedulePage}
                                      onClick={() => setSchedulePage(page)}
                                    >
                                      {page}
                                    </Pagination.Item>
                                  );
                                } else if (
                                  page === schedulePage - 2 ||
                                  page === schedulePage + 2
                                ) {
                                  return <Pagination.Ellipsis key={page} />;
                                }
                                return null;
                              })}
                              <Pagination.Next 
                                onClick={() => setSchedulePage(prev => Math.min(Math.ceil(studentSchedule.length / 10), prev + 1))} 
                                disabled={schedulePage === Math.ceil(studentSchedule.length / 10)}
                              />
                              <Pagination.Last 
                                onClick={() => setSchedulePage(Math.ceil(studentSchedule.length / 10))} 
                                disabled={schedulePage === Math.ceil(studentSchedule.length / 10)}
                              />
                            </Pagination>
                          </div>
                        )}
                      </>
                    )}

                    {/* Calendar View */}
                    {scheduleViewMode === 'calendar' && (
                      <ScheduleCalendar
                        schedules={calendarSchedules}
                        onEditSchedule={(schedule) => {
                          // Optional: Handle edit if needed
                          console.log('Edit schedule:', schedule);
                        }}
                        onDeleteSchedule={(scheduleId) => {
                          // Optional: Handle delete if needed
                          console.log('Delete schedule:', scheduleId);
                        }}
                        onCreateMakeup={(schedule) => {
                          // Optional: Handle create makeup if needed
                          console.log('Create makeup:', schedule);
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted">
                    Chưa có lịch học
                  </div>
                )}
              </Tab>
            </Tabs>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowDetailModal(false); setSchedulePage(1); }}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentManagementAPI;
