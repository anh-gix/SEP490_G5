import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Nav, Tabs, Tab, Pagination, ButtonGroup, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import studentService from '../../services/studentService';
import { courseService } from '../../services/courseService';
import ScheduleCalendar from './ScheduleCalendar';

/**
 * Student Management Component with API Integration
 * Quản lý Học viên đầy đủ chức năng
 */
const StudentManagementAPI = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSchedule, setStudentSchedule] = useState([]);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleViewMode, setScheduleViewMode] = useState('calendar'); // 'table' or 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [programType, setProgramType] = useState('');
  const [level, setLevel] = useState('');
  const [availableTypes, setAvailableTypes] = useState([]);
  const [availableLevels, setAvailableLevels] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch program types and levels on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [typesResponse, levelsResponse] = await Promise.all([
          courseService.getAllTypes(),
          courseService.getAllLevels()
        ]);
        
        if (typesResponse?.success && typesResponse.types) {
          setAvailableTypes(typesResponse.types);
        }
        
        if (levelsResponse?.success && levelsResponse.levels) {
          setAvailableLevels(levelsResponse.levels);
        }
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, []);

  // Reset page when filters change (but not when page itself changes)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, programType, level]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, programType, level, page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (programType) params.programType = programType;
      if (level) params.level = level;
      
      const data = await studentService.getAllStudents(params);
      setStudents(data.students || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
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
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const parseErrorToField = (errorMessage) => {
    const errors = {};
    if (!errorMessage) return errors;
    
    const message = typeof errorMessage === 'string' ? errorMessage : errorMessage.message || '';
    
    // Map error messages to form fields (check most specific first)
    if (message.includes('Số điện thoại đã tồn tại')) {
      errors.phone = message;
    } else if (message.includes('Email đã tồn tại')) {
      errors.email = message;
    } else if (message.includes('Username đã tồn tại')) {
      errors.username = message;
    } else if (message.toLowerCase().includes('số điện thoại') || message.toLowerCase().includes('phone')) {
      errors.phone = message;
    } else if (message.toLowerCase().includes('email')) {
      errors.email = message;
    } else if (message.toLowerCase().includes('username')) {
      errors.username = message;
    } else {
      // General error - show on submit
      errors.submit = message;
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chỉ cho phép tạo mới, không cho phép cập nhật
    if (editingStudent) {
      setFormErrors({ submit: 'Không được phép cập nhật thông tin học viên' });
      return;
    }
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate password
    if (!formData.password) {
      setFormErrors({ password: 'Vui lòng nhập mật khẩu!' });
      return;
    }
    
    try {
      setLoading(true);
      await studentService.createStudent(formData);
      
      // Success - close modal and refresh
      handleCloseModal();
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Error saving student:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Không thể lưu thông tin Học viên';
      const parsedErrors = parseErrorToField(errorMessage);
      setFormErrors(parsedErrors);
    } finally {
      setLoading(false);
    }
  };

  // Disabled: Không cho phép chỉnh sửa thông tin học viên
  // const handleEdit = (student) => {
  //   setEditingStudent(student);
  //   setFormData({
  //     username: student.username,
  //     email: student.email,
  //     password: '', // Leave empty for update
  //     phone: student.phone || '',
  //     address: student.address || ''
  //   });
  //   setShowModal(true);
  // };

  // Disabled: Không cho phép xóa thông tin học viên
  // const handleDelete = async (studentId) => {
  //   if (!window.confirm('Bạn có chắc chắn muốn xóa Học viên này?')) return;
  //   
  //   try {
  //     setLoading(true);
  //     await studentService.deleteStudent(studentId);
  //     alert('Xóa Học viên thành công!');
  //     fetchStudents();
  //     fetchStats();
  //   } catch (err) {
  //     console.error('Error deleting student:', err);
  //     alert(err.message || 'Không thể xóa Học viên');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
      phone: '',
      address: ''
    });
    setFormErrors({});
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
        <div className="d-flex gap-2">
          <Button 
            className="btn-main px-20 py-10 radius-8"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            <i className="fas fa-plus me-2"></i>
            Thêm Học viên
          </Button>
          <Button 
            variant="success"
            className="px-20 py-10 radius-8"
            onClick={() => navigate('/academic/student-management/import')}
            disabled={loading}
          >
            <i className="fas fa-file-excel me-2"></i>
            Import từ Excel
          </Button>
        </div>
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
            <Col md={3}>
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
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="border-neutral-200"
              >
                <option value="">Tất cả chương trình</option>
                {availableTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'ielts' ? 'IELTS' : type === 'toeic' ? 'TOEIC' : type === 'cam' ? 'Cambridge' : type}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="border-neutral-200"
              >
                <option value="">Tất cả cấp độ</option>
                {availableLevels.map(lev => (
                  <option key={lev} value={lev}>{lev}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3} className="text-end">
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
                      <h6 className="text-neutral-900 fw-semibold mb-4">{student.username}</h6>
                      <p className="text-neutral-600 text-13 mb-0">{student.email}</p>
                    </div>
                  </div>

                  <div className="mb-16">
                    <div className="d-flex align-items-center gap-8">
                      <i className="fas fa-door-open text-neutral-400"></i>
                      <span className="text-neutral-700 text-14">
                        Lớp: {student.stats?.classCount || 0} lớp
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
                        <div className="text-neutral-900 fw-semibold text-14">{student.username}</div>
                      </div>
                    </td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{student.email}</td>
                    <td className="px-20 py-16 text-neutral-700 text-14">{student.phone || 'N/A'}</td>
                    <td className="px-20 py-16 text-center text-neutral-700 fw-medium text-14">
                      {student.stats?.classCount || 0}
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
          {/* Pagination */}
          {totalPages > 1 && (
            <Card.Footer className="bg-neutral-25 border-0 px-20 py-16">
              <div className="d-flex justify-content-center">
                <Pagination className="mb-0">
                  <Pagination.First 
                    onClick={() => setPage(1)} 
                    disabled={page === 1}
                  />
                  <Pagination.Prev 
                    onClick={() => setPage(prev => Math.max(1, prev - 1))} 
                    disabled={page === 1}
                  />
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      );
                    } else if (
                      pageNum === page - 2 ||
                      pageNum === page + 2
                    ) {
                      return <Pagination.Ellipsis key={pageNum} />;
                    }
                    return null;
                  })}
                  <Pagination.Next 
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={page === totalPages}
                  />
                  <Pagination.Last 
                    onClick={() => setPage(totalPages)} 
                    disabled={page === totalPages}
                  />
                </Pagination>
              </div>
            </Card.Footer>
          )}
        </Card>
      )}

      {/* Add Modal - Chỉ cho phép thêm mới */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm Học viên mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formErrors.submit && (
              <Alert variant="danger" className="mb-3">
                {formErrors.submit}
              </Alert>
            )}
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
                    isInvalid={!!formErrors.username}
                  />
                  {formErrors.username && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.username}
                    </Form.Control.Feedback>
                  )}
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
                    isInvalid={!!formErrors.email}
                  />
                  {formErrors.email && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  )}
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
                    isInvalid={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123456789"
                    required
                    isInvalid={!!formErrors.phone}
                  />
                  {formErrors.phone && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.phone}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Địa chỉ liên hệ..."
                    required
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
              {loading ? 'Đang lưu...' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Student Detail Modal */}
      <Modal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSchedulePage(1); }} size="xl">
        <Modal.Header closeButton className="py-12">
          <Modal.Title className="text-16">
            Chi tiết Học viên - {selectedStudent?.username}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '16px' }}>
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
                    <div className="d-flex justify-content-end mb-2">
                      <ButtonGroup size="sm">
                        <Button
                          variant={scheduleViewMode === 'table' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('table')}
                          className="px-12 py-6"
                        >
                          <i className="fas fa-table me-1"></i>
                          Bảng
                        </Button>
                        <Button
                          variant={scheduleViewMode === 'calendar' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setScheduleViewMode('calendar')}
                          className="px-12 py-6"
                        >
                          <i className="fas fa-calendar-alt me-1"></i>
                          Lịch
                        </Button>
                      </ButtonGroup>
                    </div>

                    {/* Table View */}
                    {scheduleViewMode === 'table' && (
                      <>
                        <Table hover size="sm">
                            <thead className="bg-neutral-25 sticky-top">
                              <tr>
                                <th className="px-12 py-8 text-12">Thời gian</th>
                                <th className="px-12 py-8 text-12">Lớp học</th>
                                <th className="px-12 py-8 text-12">Phòng</th>
                                <th className="px-12 py-8 text-12">Trạng thái</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentSchedule
                                .slice((schedulePage - 1) * 10, schedulePage * 10)
                                .map((schedule, index) => (
                                <tr key={index}>
                                  <td className="px-12 py-8">
                                    <div className="text-13">
                                      {new Date(schedule.date).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-12 text-muted">
                                      {schedule.startTime} - {schedule.endTime}
                                    </div>
                                  </td>
                                  <td className="px-12 py-8 text-13">{schedule.className || 'N/A'}</td>
                                  <td className="px-12 py-8 text-13">{schedule.room?.room_name || 'N/A'}</td>
                                  <td className="px-12 py-8">
                                    {!schedule.attendance || !schedule.attendance.status ? (
                                      <Badge bg="secondary" className="text-12">Chưa học</Badge>
                                    ) : (
                                      <Badge 
                                        bg={
                                          schedule.attendance.status === 'present' ? 'success' :
                                          schedule.attendance.status === 'absent' ? 'danger' :
                                          schedule.attendance.status === 'late' ? 'warning' :
                                          'info'
                                        }
                                        className="text-12"
                                      >
                                        {schedule.attendance.status === 'present' ? 'Có mặt' :
                                         schedule.attendance.status === 'absent' ? 'Vắng mặt' :
                                         schedule.attendance.status === 'late' ? 'Đi muộn' :
                                         'Có phép'}
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        {studentSchedule.length > 10 && (
                          <div className="d-flex justify-content-center mt-2">
                            <Pagination size="sm">
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
        <Modal.Footer className="py-10 border-top">
          <Button variant="secondary" size="sm" onClick={() => { setShowDetailModal(false); setSchedulePage(1); }}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentManagementAPI;
