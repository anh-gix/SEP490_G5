import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table, Modal, InputGroup, Pagination, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import studentService from '../../services/studentService';
import { courseService } from '../../services/courseService';
import StudentDetail from './StudentDetail';
import ImportStudentFromExcel from './ImportStudentFromExcel';

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
  const [editingStudent, setEditingStudent] = useState(null);
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
  const [filterNoClass, setFilterNoClass] = useState(null); // null = all, true = no class only

  // Student Detail states
  const [showStudentDetail, setShowStudentDetail] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Import Student states
  const [showImportStudent, setShowImportStudent] = useState(false);

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

  // Filter levels based on selected program type
  useEffect(() => {
    const filterLevels = async () => {
      if (!programType) {
        // If no program selected, show all levels
        try {
          const response = await courseService.getAllLevels();
          if (response?.success && response.levels) {
            setAvailableLevels(response.levels);
          }
        } catch (error) {
          console.error('Error fetching all levels:', error);
        }
        return;
      }

      // Fetch levels for this program type
      try {
        const response = await courseService.getLevelsByType(programType);
        if (response?.success && response.levels) {
          setAvailableLevels(response.levels);
          
          // If current level is not available for selected program, clear it
          if (level && !response.levels.includes(level)) {
            setLevel('');
          }
        }
      } catch (error) {
        console.error('Error fetching levels by type:', error);
      }
    };
    
    filterLevels();
  }, [programType]);

  // Reset page when filters change (but not when page itself changes)
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, programType, level, filterNoClass]);

  useEffect(() => {
    fetchStudents();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, programType, level, page, filterNoClass]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      
      // When filtering by noClass, fetch all students to filter on frontend
      if (filterNoClass === true) {
        params.limit = 10000; // Fetch all students
        params.page = 1; // Start from page 1
      } else {
        params.page = page;
        params.limit = 10;
      }
      
      if (searchTerm) params.search = searchTerm;
      if (programType) params.programType = programType;
      if (level) params.level = level;
      
      const data = await studentService.getAllStudents(params);
      setStudents(data.students || []);
      
      // Only set total/totalPages from API when not filtering by noClass
      // When filtering by noClass, we'll calculate these after filtering
      if (filterNoClass !== true) {
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
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
    
    // Clear previous errors
    setFormErrors({});
    
    try {
      setLoading(true);
      
      if (editingStudent) {
        // Update existing student
        await studentService.updateStudent(editingStudent._id, formData);
        toast.success('Cập nhật thông tin học viên thành công!');
      } else {
        // Create new student
        await studentService.createStudent(formData);
        toast.success('Thêm học viên thành công!');
      }
      
      // Success - close modal and refresh
      handleCloseModal();
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Error saving student:', err);
      const errorMessage = err?.message || err?.response?.data?.message || 'Không thể lưu thông tin Học viên';
      const parsedErrors = parseErrorToField(errorMessage);
      setFormErrors(parsedErrors);
      toast.error(errorMessage);
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
      phone: student.phone || '',
      address: student.address || ''
    });
    setShowModal(true);
  };

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

  const handleViewDetail = (student) => {
    setSelectedStudentId(student._id);
    setShowStudentDetail(true);
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

  // Handle click on stats cards to filter students
  const handleStatsCardClick = (filterType) => {
    if (filterType === 'all') {
      setFilterNoClass(null);
    } else if (filterType === 'noClass') {
      setFilterNoClass(true);
    }
    setPage(1); // Reset to first page when filter changes
  };

  // Filter students based on filterNoClass
  const allFilteredStudents = filterNoClass === true
    ? students.filter(student => !student.stats?.classNames || student.stats.classNames.length === 0)
    : students;

  // Calculate total and totalPages for filtered results
  useEffect(() => {
    if (filterNoClass === true) {
      const filteredCount = students.filter(student => !student.stats?.classNames || student.stats.classNames.length === 0).length;
      setTotal(filteredCount);
      setTotalPages(Math.ceil(filteredCount / 10));
    }
  }, [filterNoClass, students]);

  // Paginate filtered students
  const filteredStudents = filterNoClass === true
    ? allFilteredStudents.slice((page - 1) * 10, page * 10)
    : allFilteredStudents;

  // If showing import student, render ImportStudentFromExcel component
  if (showImportStudent) {
    return (
      <ImportStudentFromExcel
        onBack={() => {
          setShowImportStudent(false);
          // Refresh students list after import
          fetchStudents();
        }}
      />
    );
  }

  // If showing student detail, render StudentDetail component
  if (showStudentDetail && selectedStudentId) {
    return (
      <StudentDetail
        studentId={selectedStudentId}
        onBack={() => {
          setShowStudentDetail(false);
          setSelectedStudentId(null);
        }}
      />
    );
  }

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
            onClick={() => setShowImportStudent(true)}
            disabled={loading}
          >
            <i className="fas fa-file-excel me-2"></i>
            Import từ Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-3 mb-24">
        <Col md={6}>
          <Card 
            className="bg-white rounded-12 box-shadow-sm"
            style={{ 
              cursor: 'pointer',
              border: filterNoClass === null ? '3px solid #0D74FF' : '2px solid #E5E7EB',
              boxShadow: filterNoClass === null ? '0 4px 16px rgba(13, 116, 255, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleStatsCardClick('all')}
          >
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
                  <i className="fas fa-user-graduate text-white" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                  <div className="text-neutral-500 text-13 mb-4">Tổng Học viên</div>
                  <div className="text-neutral-900 fw-bold text-32">{stats.total || 0}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card 
            className="bg-white rounded-12 box-shadow-sm"
            style={{ 
              cursor: 'pointer',
              border: filterNoClass === true ? '3px solid #EF4444' : '2px solid #E5E7EB',
              boxShadow: filterNoClass === true ? '0 4px 16px rgba(239, 68, 68, 0.4)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleStatsCardClick('noClass')}
          >
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
                  <div className="text-neutral-500 text-13 mb-4">Chưa có lớp</div>
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
                    <div className="d-flex align-items-start gap-8">
                      <i className="fas fa-door-open text-neutral-400 mt-2"></i>
                      <div className="flex-grow-1">
                        {student.stats?.classNames && student.stats.classNames.length > 0 ? (
                          <div className="d-flex flex-column gap-4">
                            {student.stats.classNames.map((className, idx) => (
                              <span key={idx} className="text-neutral-700 text-14">{className}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-14">Chưa có lớp</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-8">
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleEdit(student)}
                      className="flex-grow-1"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Chỉnh sửa
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetail(student)}
                      className="flex-grow-1"
                    >
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
                      {student.stats?.classNames && student.stats.classNames.length > 0 ? (
                        <div className="d-flex flex-column gap-4">
                          {student.stats.classNames.map((className, idx) => (
                            <span key={idx} className="text-13">{className}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-500">Chưa có lớp</span>
                      )}
                    </td>
                    <td className="px-20 py-16">
                      <div className="d-flex gap-8">
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Chỉnh sửa
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewDetail(student)}
                        >
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

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingStudent ? 'Chỉnh sửa Học viên' : 'Thêm Học viên mới'}</Modal.Title>
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
                  <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    required
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
                    Mật khẩu
                    {!editingStudent && (
                      <span className="text-muted" style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        {' '}(Mặc định: 123456)
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={editingStudent ? "Để trống nếu không đổi" : "Để trống sẽ dùng mật khẩu mặc định: 123456"}
                    isInvalid={!!formErrors.password}
                  />
                  {formErrors.password && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.password}
                    </Form.Control.Feedback>
                  )}
                  {!editingStudent && (
                    <Form.Text className="text-muted">
                      Nếu không nhập, mật khẩu mặc định sẽ là: <strong>123456</strong>
                    </Form.Text>
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
              {loading ? 'Đang lưu...' : editingStudent ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default StudentManagementAPI;
